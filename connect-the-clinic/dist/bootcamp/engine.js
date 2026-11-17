/** Original hands-on training. All service results come from the shared network model. */
import {createGame,dispatch as dispatchNetwork,derive as deriveNetwork,maskPrefix} from '../engine.js';
import {CATALOG,POLICIES,LOCATIONS} from '../catalog.js';

const COURSE_ID='course.riverbend.field-ready.001';
const clone=x=>JSON.parse(JSON.stringify(x));
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>typeof k==='string'&&Object.hasOwn(x,k);
const pad=n=>String(n).padStart(4,'0');
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const need=(test,code,message)=>{if(!test)fail(code,message);};
const step=(id,title)=>({id,title});
const LESSONS=[
  {id:'boot.kit',title:'Meet the equipment',steps:[step('kit.client','Select and power a workstation'),step('kit.switch','Select and power the switch'),step('kit.host','Select and power the service host')]},
  {id:'boot.cables',title:'Build a physical path',steps:[step('cables.client','Connect the workstation to the switch'),step('cables.host','Connect the host to another switch port'),step('cables.test','Test the complete service path')]},
  {id:'boot.address',title:'Give the device an address',steps:[step('address.inspect','Inspect the network card and current address'),step('address.apply','Apply a unique local address and the supplied mask'),step('address.test','Run a fresh service test')]},
  {id:'boot.wireless',title:'Add a wireless device',steps:[step('wireless.power','Power the access point'),step('wireless.uplink','Connect the Ethernet uplink'),step('wireless.join','Associate the mobile device'),step('wireless.room-a','Test the workspace in room A'),step('wireless.room-b','Move and test in room B')]},
  {id:'boot.access',title:'Decide who gets access',steps:[step('access.inspect','Inspect who can use each service'),step('access.policy','Choose appropriate responsibilities'),step('access.test','Check staff access and outsider denial')]},
  {id:'boot.transfer',title:'Diagnose a different fault',steps:[]}
];
const KIT_ROLES=[
  {roleId:'role.reception',label:'Bench workstation',kinds:['desktop']},
  {roleId:'infra.switch',label:'Local network switch',kinds:['switch4','switch8']},
  {roleId:'role.records',label:'Training service host',kinds:['server','desktop']}
];
const ACCEPTABLE_POLICIES=['policy.roles-separated','policy.nurse-also-books'];
const EXPOSED_TESTS=['reception','nurse','nurse-bookings','access-reception','access-outsider-bookings','access-outsider-workspace'];
const ROOM_IDS=['location.exam-a','location.exam-b'];
const ACTION_FIELDS={START_LESSON:['lessonId'],START_DEMO:[],NEXT_DEMO:[],START_PRACTICE:[],RESTART_PRACTICE:[],NETWORK_ACTION:['action'],INSPECT_DEVICE:['deviceId'],INSPECT_CABLE:['cableId'],RUN_TEST:['testId'],REVEAL_HINT:['tier'],SAVE_REFLECTION:['text','oral'],COMPLETE_LESSON:[]};
const NETWORK_FIELDS={CHOOSE_DEVICE:['roleId','kind'],POWER_DEVICE:['deviceId','on'],CONNECT_PORTS:['fromDeviceId','fromPortId','toDeviceId','toPortId'],DISCONNECT_CABLE:['cableId'],SET_STATIC_ADDRESS:['deviceId','address','mask'],ASSOCIATE_WIFI:['deviceId','apDeviceId'],MOVE_NURSE:['locationId'],SET_PERMISSIONS:['policyId'],SET_SERVICE_STATE:['enabled']};

export const BOOT_CATALOG=Object.freeze({courseId:COURSE_ID,lessons:clone(LESSONS),roleOptions:clone(KIT_ROLES),practiceNetwork:'192.168.80.0/24',demonstrationNetwork:'192.168.60.0/24',transferNetwork:'192.168.90.0/24'});

const lesson=id=>LESSONS.find(l=>l.id===id);
const networkAttempt=a=>a.networkState.attempts[a.networkState.activeAttemptId];
const role=(a,id)=>Object.values(networkAttempt(a).devices).find(d=>d.roleId===id)||null;
const completedIds=s=>[...new Set(s.completionRecords.map(r=>r.lessonId))];
const completed=s=>completedIds(s).length===LESSONS.length;
const allowedIndex=s=>Math.min(LESSONS.length-1,completedIds(s).length);

export function createBootcamp({campaignId='training.local'}={}){
  need(typeof campaignId==='string'&&/^[A-Za-z0-9._:-]{1,120}$/.test(campaignId),'CAMPAIGN_INVALID','Use an anonymous campaign identifier.');
  return {courseId:COURSE_ID,schemaVersion:1,campaignId,revision:0,attemptSequence:0,current:null,completionRecords:[],demonstrationRecords:[]};
}

function event(a,type,payload={},origin='learner'){
  const e={id:`${a.id}.event.${pad(++a.sequence)}`,sequence:a.sequence,type,origin,technicalRevision:a.technicalRevision,payload:clone(payload)};
  a.history.push(e);return e;
}

function fingerprint(a){
  const n=networkAttempt(a);
  return JSON.stringify({devices:Object.values(n.devices).map(d=>({...d,locationId:d.roleId==='role.nurse'?'mobile-position':d.locationId})),cables:n.cables,serverEnabled:n.serverEnabled,policyId:n.policyId});
}

function childAction(a,action,origin){
  const old=networkAttempt(a),oldSequence=old.sequence,oldObservation=old.observationSequence,oldChanges=old.fault.changes.length;
  const result=dispatchNetwork(a.networkState,action);
  need(result.accepted,result.code,result.message);
  a.networkState=result.state;
  const current=networkAttempt(a);
  for(const e of current.events)if(e.sequence>oldSequence)e.origin=origin;
  for(const o of current.observations)if(Number(o.id.split('.').at(-1))>oldObservation)o.origin=origin;
  for(const change of current.fault.changes.slice(oldChanges))change.origin=origin;
  current.training.practiceActions=[];
  return current.observations.filter(o=>Number(o.id.split('.').at(-1))>oldObservation);
}

function choose(a,roleId,kind,origin='setup'){
  childAction(a,{type:'CHOOSE_DEVICE',roleId,kind},origin);
  const d=role(a,roleId);childAction(a,{type:'POWER_DEVICE',deviceId:d.id,on:true},origin);return role(a,roleId);
}

function connect(a,fromRole,toRole,switchPort,origin='setup'){
  const from=role(a,fromRole),to=role(a,toRole);
  childAction(a,{type:'CONNECT_PORTS',fromDeviceId:from.id,fromPortId:`${from.id}.eth1`,toDeviceId:to.id,toPortId:`${to.id}.eth${switchPort}`},origin);
}

function createAttempt(s,lessonId,phase){
  const id=`boot.attempt.${pad(++s.attemptSequence)}`;
  let g=createGame({campaignId:s.campaignId});
  const opened=dispatchNetwork(g,{type:'START_CLINIC_PRACTICE'});need(opened.accepted,opened.code,opened.message);g=opened.state;
  const n=g.attempts[g.activeAttemptId];n.id=`${id}.network`;g.activeAttemptId=n.id;g.attempts={[n.id]:n};
  n.events=[];n.messages=[];n.sequence=0;n.observations=[];n.observationSequence=0;n.training.practiceActions=[];
  const base=lessonId==='boot.transfer'?'192.168.90':phase==='demo'?'192.168.60':'192.168.80';
  n.network={base,cidr:`${base}.0/24`,mask:'255.255.255.0',serverAddress:`${base}.10`,receptionAddress:`${base}.20`,inheritedNurseAddress:`${base}.30`};
  const a={id,lessonId,phase,networkState:g,technicalRevision:0,sequence:0,observationSequence:0,inspectionSequence:0,demoStepIndex:0,observations:[],inspections:[],history:[],playerActions:[],hints:[],reflection:{text:'',oral:false,submitted:false,contextRevision:null,observationId:null},faultObservation:null,repairChange:null,policyDecision:null};
  if(lessonId!=='boot.kit'){
    choose(a,'role.records','server');choose(a,'infra.switch','switch4');choose(a,'role.reception','desktop');
    childAction(a,{type:'SET_SERVICE_STATE',enabled:true},'setup');
    if(lessonId!=='boot.cables'){
      connect(a,'role.records','infra.switch',1);connect(a,'role.reception','infra.switch',2);
    }
    if(lessonId==='boot.address'){
      const nextSubnet=Number(base.split('.').at(-1))+1;
      childAction(a,{type:'SET_STATIC_ADDRESS',deviceId:role(a,'role.reception').id,address:`192.168.${nextSubnet}.20`,mask:'255.255.255.0'},'setup');
    }
    if(['boot.wireless','boot.access','boot.transfer'].includes(lessonId)){
      choose(a,'role.nurse','laptop');choose(a,'infra.ap','access-point');
      if(lessonId==='boot.wireless')childAction(a,{type:'POWER_DEVICE',deviceId:role(a,'infra.ap').id,on:false},'setup');
      else {
        childAction(a,{type:'ASSOCIATE_WIFI',deviceId:role(a,'role.nurse').id,apDeviceId:role(a,'infra.ap').id},'setup');
        if(lessonId==='boot.access'){
          connect(a,'infra.ap','infra.switch',3);
          childAction(a,{type:'SET_PERMISSIONS',policyId:'policy.broad-access'},'setup');
        }
      }
    }
  }
  event(a,'LESSON_SETUP',{lessonId,phase,network:clone(networkAttempt(a).network),learnerEvidence:false},'setup');
  return a;
}

function archiveDemo(s){
  const a=s.current;if(a?.phase!=='demo')return;
  const record={lessonId:a.lessonId,attemptId:a.id,completed:a.demoStepIndex===lesson(a.lessonId).steps.length,stepIds:lesson(a.lessonId).steps.slice(0,a.demoStepIndex).map(x=>x.id),observations:clone(a.observations),origin:'trainer'};
  s.demonstrationRecords.push(record);
  // Earlier demonstrations remain in the programme action log; keep the latest per lesson here.
  s.demonstrationRecords=s.demonstrationRecords.filter((r,i,all)=>all.findLastIndex(x=>x.lessonId===r.lessonId)===i);
}

function actionShape(action,fields){
  need(plain(action)&&typeof action.type==='string'&&own(fields,action.type),'ACTION_UNKNOWN','Choose a supported training action.');
  const expected=['type',...fields[action.type]];
  need(Object.keys(action).every(k=>expected.includes(k))&&fields[action.type].every(k=>own(action,k)),'ACTION_FIELDS','The action fields do not match this training control.');
  return clone(action);
}

function allowedActions(a){
  if(!a||a.phase!=='practice')return[];
  if(a.lessonId==='boot.kit')return['CHOOSE_DEVICE','POWER_DEVICE'];
  const base=['POWER_DEVICE','CONNECT_PORTS','DISCONNECT_CABLE','SET_SERVICE_STATE'];
  if(a.lessonId==='boot.address')base.push('SET_STATIC_ADDRESS');
  if(['boot.wireless','boot.access','boot.transfer'].includes(a.lessonId))base.push('ASSOCIATE_WIFI','MOVE_NURSE','SET_STATIC_ADDRESS');
  if(a.lessonId==='boot.access')base.push('SET_PERMISSIONS');
  return base;
}

function missingUplink(a){
  const ap=role(a,'infra.ap'),sw=role(a,'infra.switch');
  return !!(ap&&sw&&!networkAttempt(a).cables.some(c=>[c.fromDeviceId,c.toDeviceId].includes(ap.id)));
}

function recordInspection(a,kind,targetId,origin='learner'){
  const n=networkAttempt(a);let snapshot;
  if(kind==='device'){
    need(own(n.devices,targetId),'DEVICE_UNKNOWN','Choose an existing training device.');
    snapshot=deriveNetwork(a.networkState).devices.find(x=>x.id===targetId);
  }else{snapshot=n.cables.find(x=>x.id===targetId);need(snapshot,'CABLE_UNKNOWN','Choose an actual installed cable.');}
  const e=event(a,kind==='device'?'INSPECT_DEVICE':'INSPECT_CABLE',{targetId},origin);
  const inspection={id:`${a.id}.inspection.${pad(++a.inspectionSequence)}`,eventId:e.id,targetId,kind,origin,technicalRevision:a.technicalRevision,snapshot:clone(snapshot)};
  a.inspections.push(inspection);
  if(origin==='learner'&&a.lessonId==='boot.transfer'&&kind==='device'&&snapshot.roleId==='infra.ap'&&missingUplink(a))a.faultObservation={kind:'inspection',id:inspection.id,eventId:e.id,technicalRevision:a.technicalRevision,reason:'AP_UPLINK_MISSING'};
  return inspection;
}

function testsAllowed(a){return a.lessonId==='boot.kit'?[]:['boot.cables','boot.address'].includes(a.lessonId)?['reception','all']:['reception','nurse','all',...(a.lessonId==='boot.access'?['nurse-bookings','access']:[])];}

function runTests(a,testId,origin='learner'){
  need(testsAllowed(a).includes(testId),'TEST_NOT_IN_LESSON','Use a test offered for this lesson.');
  const groups=testId==='all'?(a.lessonId==='boot.access'?['access']:role(a,'role.nurse')?['reception','nurse']:['reception']):[testId];
  const e=event(a,'RUN_TEST',{testId,locationId:role(a,'role.nurse')?.locationId||'location.reception'},origin);
  const added=[];
  for(const group of groups){
    const observations=childAction(a,{type:'RUN_PROBE',testId:group},origin);
    for(const o of observations){
      if(!EXPOSED_TESTS.includes(o.testId)){
        o.origin='engine-helper';const ce=networkAttempt(a).events.find(x=>x.id===o.eventId);if(ce)ce.origin='engine-helper';continue;
      }
      const source=networkAttempt(a).devices[o.sourceDeviceId];
      const item={...clone(o),id:`${a.id}.observation.${pad(++a.observationSequence)}`,eventId:e.id,origin,locationId:o.contextLocationId||source?.locationId||null,testedTechnicalRevision:a.technicalRevision,childTechnicalRevision:o.testedTechnicalRevision};
      a.observations.push(item);added.push(item);
      if(origin==='learner'&&a.lessonId==='boot.transfer'&&item.testId==='nurse'&&item.code==='PORT_DISCONNECTED'&&missingUplink(a))a.faultObservation={kind:'failed-test',id:item.id,eventId:e.id,technicalRevision:a.technicalRevision,reason:item.code};
    }
  }
  return added;
}

function applyNetworkAction(a,action,origin='learner'){
  const primitive=actionShape(action,NETWORK_FIELDS);
  if(origin==='learner')need(allowedActions(a).includes(primitive.type),'ACTION_NOT_IN_LESSON','That change is not offered in this lesson.');
  const existing=networkAttempt(a).devices;
  for(const key of ['deviceId','fromDeviceId','toDeviceId'])if(own(primitive,key))need(own(existing,primitive[key]),'DEVICE_UNKNOWN','Choose an actual device on this training bench.');
  if(primitive.type==='ASSOCIATE_WIFI'&&primitive.apDeviceId!==null)need(own(existing,primitive.apDeviceId),'DEVICE_UNKNOWN','Choose an actual access point on this training bench.');
  if(primitive.type==='CHOOSE_DEVICE'){
    const option=KIT_ROLES.find(r=>r.roleId===primitive.roleId);
    need(option?.kinds.includes(primitive.kind),'DEVICE_NOT_OFFERED','Choose one of the equipment options offered on this training bench.');
  }
  if(primitive.type==='SET_STATIC_ADDRESS'){
    const prefix=typeof primitive.mask==='string'&&primitive.mask.length?maskPrefix(primitive.mask):null;
    need(prefix!==null&&prefix>=1&&prefix<=30,'MASK_INVALID','Enter an explicit contiguous IPv4 subnet mask from /1 to /30. This training task supplies 255.255.255.0.');
    const target=networkAttempt(a).devices[primitive.deviceId];
    const requiredRole=a.lessonId==='boot.address'?'role.reception':'role.nurse';
    need(target.roleId===requiredRole,'ADDRESS_TARGET','Edit the learner workstation or mobile device addressed by this lesson.');
  }
  if(primitive.type==='MOVE_NURSE')need(ROOM_IDS.includes(primitive.locationId),'LOCATION_NOT_IN_LESSON','Choose practice room A or B.');
  const before=fingerprint(a),wasMissing=missingUplink(a),beforeDevice=primitive.deviceId?clone(networkAttempt(a).devices[primitive.deviceId]||null):null;
  childAction(a,primitive,origin);
  if(fingerprint(a)!==before)a.technicalRevision++;
  const e=event(a,primitive.type,primitive,origin);
  if(origin==='learner'){
    a.playerActions.push({type:primitive.type,eventId:e.id,technicalRevision:a.technicalRevision,deviceId:primitive.deviceId||null,roleId:primitive.roleId||beforeDevice?.roleId||null,changed:fingerprint(a)!==before});
    if(primitive.type==='SET_PERMISSIONS')a.policyDecision={policyId:primitive.policyId,eventId:e.id,technicalRevision:a.technicalRevision};
    if(a.lessonId==='boot.transfer'&&primitive.type==='CONNECT_PORTS'&&wasMissing&&a.faultObservation){
      const ap=role(a,'infra.ap'),sw=role(a,'infra.switch'),ends=[primitive.fromDeviceId,primitive.toDeviceId];
      if(ends.includes(ap?.id)&&ends.includes(sw?.id))a.repairChange={eventId:e.id,cableId:networkAttempt(a).cables.at(-1).id,observation:clone(a.faultObservation),technicalRevision:a.technicalRevision};
    }
  }
}

function demoStep(a){
  const definition=lesson(a.lessonId),current=definition.steps[a.demoStepIndex];need(current,'DEMO_FINISHED','The worked example is finished. Start a fresh practice task.');
  const primitive=x=>applyNetworkAction(a,x,'trainer');
  const doChoose=(roleId,kind)=>{primitive({type:'CHOOSE_DEVICE',roleId,kind});primitive({type:'POWER_DEVICE',deviceId:role(a,roleId).id,on:true});};
  const doConnect=(fromRole,port)=>{const d=role(a,fromRole),sw=role(a,'infra.switch');primitive({type:'CONNECT_PORTS',fromDeviceId:d.id,fromPortId:`${d.id}.eth1`,toDeviceId:sw.id,toPortId:`${sw.id}.eth${port}`});};
  switch(current.id){
    case 'kit.client':doChoose('role.reception','desktop');break;
    case 'kit.switch':doChoose('infra.switch','switch4');break;
    case 'kit.host':doChoose('role.records','server');break;
    case 'cables.client':doConnect('role.reception',2);break;
    case 'cables.host':doConnect('role.records',1);break;
    case 'cables.test':runTests(a,'reception','trainer');break;
    case 'address.inspect':recordInspection(a,'device',role(a,'role.reception').id,'trainer');runTests(a,'reception','trainer');break;
    case 'address.apply':primitive({type:'SET_STATIC_ADDRESS',deviceId:role(a,'role.reception').id,address:`${networkAttempt(a).network.base}.20`,mask:'255.255.255.0'});break;
    case 'address.test':runTests(a,'reception','trainer');break;
    case 'wireless.power':primitive({type:'POWER_DEVICE',deviceId:role(a,'infra.ap').id,on:true});break;
    case 'wireless.uplink':doConnect('infra.ap',3);break;
    case 'wireless.join':primitive({type:'ASSOCIATE_WIFI',deviceId:role(a,'role.nurse').id,apDeviceId:role(a,'infra.ap').id});break;
    case 'wireless.room-a':runTests(a,'nurse','trainer');break;
    case 'wireless.room-b':primitive({type:'MOVE_NURSE',locationId:'location.exam-b'});runTests(a,'nurse','trainer');break;
    case 'access.inspect':runTests(a,'access','trainer');break;
    case 'access.policy':primitive({type:'SET_PERMISSIONS',policyId:'policy.roles-separated'});break;
    case 'access.test':runTests(a,'access','trainer');break;
    default:fail('DEMO_STEP_UNKNOWN','The demonstration step is unavailable.');
  }
  a.demoStepIndex++;event(a,'DEMO_STEP',{stepId:current.id},'trainer');return current;
}

function fresh(a,testId,locationId=null){return [...a.observations].reverse().find(o=>o.origin==='learner'&&o.testId===testId&&o.testedTechnicalRevision===a.technicalRevision&&(!locationId||o.locationId===locationId))||null;}

function expectedTests(a){
  if(!a)return[];
  let specs=[];
  if(['boot.cables','boot.address'].includes(a.lessonId))specs=[['workstation','Workstation service','reception',null]];
  if(a.lessonId==='boot.wireless')specs=[['mobile-a','Mobile workspace in room A','nurse',ROOM_IDS[0]],['mobile-b','Mobile workspace in room B','nurse',ROOM_IDS[1]]];
  if(a.lessonId==='boot.access')specs=[['staff-workstation','Workstation service','reception',null],['staff-mobile','Mobile workspace','nurse',null],['staff-bookings','Mobile booking responsibility','nurse-bookings',null],['workstation-restriction','Workstation workspace restriction','access-reception',null],['outside-bookings','Outsider booking denial','access-outsider-bookings',null],['outside-workspace','Outsider workspace denial','access-outsider-workspace',null]];
  if(a.lessonId==='boot.transfer')specs=[['repaired-mobile','Repaired mobile workspace','nurse',null],['preserved-workstation','Working bench workstation','reception',null]];
  return specs.map(([id,label,testId,locationId])=>{const observation=fresh(a,testId,locationId);return{id,label,testId,locationId,met:!!observation?.pass,observation:clone(observation)};});
}

function currentChecks(a){return deriveNetwork(a.networkState).currentResults.filter(o=>EXPOSED_TESTS.includes(o.testId)&&(['boot.kit','boot.cables','boot.address'].includes(a.lessonId)?o.testId==='reception':true)).map(o=>({...clone(o),origin:'engine-check'}));}

function linked(a,left,right){const x=role(a,left),y=role(a,right);return !!(x&&y&&networkAttempt(a).cables.some(c=>[c.fromDeviceId,c.toDeviceId].includes(x.id)&&[c.fromDeviceId,c.toDeviceId].includes(y.id)));}

function gateChecks(a){
  if(!a)return[];
  const n=networkAttempt(a),tests=expectedTests(a),current=currentChecks(a),check=(id,label,met,detail)=>({id,label,met:!!met,detail});
  let result=[];
  if(a.lessonId==='boot.kit')result=KIT_ROLES.map(r=>{const d=role(a,r.roleId);return check(r.roleId,`Choose and power the ${r.label.toLowerCase()}`,d?.powered&&r.kinds.includes(d.kind)&&a.playerActions.some(x=>x.type==='CHOOSE_DEVICE'&&x.roleId===r.roleId)&&a.playerActions.some(x=>x.type==='POWER_DEVICE'&&x.deviceId===d.id),d?`${CATALOG[d.kind].label}: power ${d.powered?'on':'off'}.`:'Choose a device for this role.');});
  if(a.lessonId==='boot.cables')result=[check('physical-path','Connect workstation and host to the switch',linked(a,'role.reception','infra.switch')&&linked(a,'role.records','infra.switch'),'Use two compatible Ethernet cables and separate free switch ports.')];
  if(a.lessonId==='boot.address'){
    const workstation=role(a,'role.reception');result=[check('address-applied','Apply your own usable local address',a.playerActions.some(x=>x.type==='SET_STATIC_ADDRESS'&&x.deviceId===workstation?.id&&x.changed)&&current.find(x=>x.testId==='reception')?.pass,'Use a unique host address in the network on the card, then read the service test.'),check('supplied-mask','Use the supplied /24 mask',workstation?.mask===n.network.mask,'The task specifies 255.255.255.0. A broader mask can still pass this local test, but does not meet that configuration brief.')];
  }
  if(a.lessonId==='boot.wireless'){
    const ap=role(a,'infra.ap'),mobile=role(a,'role.nurse');result=[check('wireless-path','Power, uplink and associate the wireless path',ap?.powered&&linked(a,'infra.ap','infra.switch')&&mobile?.wifiApId===ap?.id,'Wi-Fi association, AP power and its Ethernet uplink are separate requirements.')];
  }
  if(a.lessonId==='boot.access')result=[check('policy-decision','Choose responsible access for this task',a.policyDecision&&ACCEPTABLE_POLICIES.includes(n.policyId),'Either separate responsibilities or nurse booking access can work; the tests must match the chosen workflow.')];
  if(a.lessonId==='boot.transfer'){
    const repair=a.repairChange,passing=fresh(a,'nurse');
    const confirmed=!!(repair&&passing?.pass&&passing.pathIds.includes(repair.cableId)&&a.history.find(e=>e.id===repair.eventId)?.sequence<Number(passing.eventId.split('.').at(-1)));
    const reflection=a.reflection,reviewed=reflection.submitted&&(reflection.text.trim()||reflection.oral)&&reflection.contextRevision===a.technicalRevision&&reflection.observationId===passing?.id;
    result=[check('fault-observed','Observe the fault before repairing it',!!a.faultObservation,'Run the mobile service test or inspect the AP and its missing uplink.'),check('relevant-repair','Repair the observed physical path and retest',confirmed,'A valid address edit cannot supply the missing Ethernet uplink.'),check('reflection','Explain the repair or arrange oral review',reviewed,'Save your explanation after the repaired mobile test. Its quality remains for teacher review.')];
  }
  result.push(...tests.map(t=>check(t.id,`Record a fresh test: ${t.label}`,t.met,t.observation?`${t.observation.code}: ${t.observation.message}`:'No current learner test recorded.')));
  return result;
}

function completionRecord(a){
  const view=deriveNetwork(a.networkState),n=networkAttempt(a);
  return {id:`${a.id}.completion`,lessonId:a.lessonId,attemptId:a.id,origin:'learner-practice',technicalRevision:a.technicalRevision,checks:clone(gateChecks(a)),network:clone(n.network),devices:view.devices.map(({id,kind,roleId,powered,address,mask,wifiApId,locationId})=>({id,kind,roleId,powered,address,mask,wifiApId,locationId})),cables:clone(n.cables),observations:clone(a.observations),inspections:clone(a.inspections),hints:clone(a.hints),reflection:clone(a.reflection),policyId:n.policyId,policyDecision:clone(a.policyDecision),repair:{observed:clone(a.faultObservation),change:clone(a.repairChange)},teacherReview:'pending',independentMastery:false,earnings:0};
}

function apply(s,action){
  if(action.type==='START_LESSON'){
    const index=LESSONS.findIndex(l=>l.id===action.lessonId);need(index>=0,'LESSON_UNKNOWN','Choose a listed training lesson.');need(index<=allowedIndex(s),'LESSON_LOCKED','Complete the current practical task before opening the next lesson.');
    archiveDemo(s);s.current=createAttempt(s,action.lessonId,'intro');return {code:'LESSON_OPENED',message:'Lesson opened. Watch the worked example, then try the task in a fresh setup.'};
  }
  const a=s.current;need(a,'LESSON_REQUIRED','Start the first bootcamp lesson.');
  if(action.type==='START_DEMO'){
    need(lesson(a.lessonId).steps.length,'TRANSFER_NO_DEMO','This final challenge has no solved demonstration. Use the troubleshooting guide and your own tests.');
    archiveDemo(s);s.current=createAttempt(s,a.lessonId,'demo');return{code:'DEMO_STARTED',message:'Worked example opened. Trainer actions are labelled and never count as your practice.'};
  }
  if(['START_PRACTICE','RESTART_PRACTICE'].includes(action.type)){
    archiveDemo(s);s.current=createAttempt(s,a.lessonId,'practice');return{code:'PRACTICE_STARTED',message:'Fresh practice opened. Equipment, settings and tests are your own attempt; all help is free.'};
  }
  if(action.type==='NEXT_DEMO'){
    need(a.phase==='demo','DEMO_REQUIRED','Open the worked example first.');const current=demoStep(a);return{code:'DEMO_STEP',message:current.title+'. This was a trainer action.'};
  }
  if(action.type==='REVEAL_HINT'){
    need(Number.isInteger(action.tier)&&action.tier>=1&&action.tier<=3,'HINT_UNKNOWN','Choose hint level 1, 2 or 3.');
    if(!a.hints.includes(action.tier))a.hints.push(action.tier);event(a,'REVEAL_HINT',{tier:action.tier,cost:0});return{code:'HINT_REVEALED',message:'Training hint opened. No charge, time penalty or grade change.'};
  }
  need(a.phase==='practice','PRACTICE_REQUIRED',a.phase==='complete'?'This completed lesson is preserved. Start a fresh practice to make changes.':'Start your own practice before changing equipment or recording learner evidence.');
  switch(action.type){
    case 'NETWORK_ACTION':applyNetworkAction(a,action.action);return{code:'NETWORK_UPDATED',message:'Training setup updated. Run a new test to check its effect.'};
    case 'INSPECT_DEVICE':recordInspection(a,'device',action.deviceId);return{code:'INSPECTION_RECORDED',message:'Current device settings and ports recorded. Inspection is free.'};
    case 'INSPECT_CABLE':recordInspection(a,'cable',action.cableId);return{code:'INSPECTION_RECORDED',message:'Current cable endpoints recorded. Inspection is free.'};
    case 'RUN_TEST':{
      const observations=runTests(a,action.testId);const failed=observations.find(o=>!o.pass);return{code:failed?.code||'TESTS_PASSED',message:failed?.message||'The selected service checks passed. Only the actual room tested is recorded.'};
    }
    case 'SAVE_REFLECTION':{
      need(a.lessonId==='boot.transfer','REFLECTION_NOT_IN_LESSON','The final troubleshooting challenge contains the explanation task.');
      need(typeof action.text==='string'&&action.text.length<=2000&&typeof action.oral==='boolean','REFLECTION_INVALID','Use at most 2,000 characters or choose pending oral review.');
      const passing=fresh(a,'nurse');const e=event(a,'SAVE_REFLECTION',{text:action.text,oral:action.oral,observationId:passing?.pass?passing.id:null});
      a.reflection={text:action.text,oral:action.oral,submitted:true,eventId:e.id,contextRevision:a.technicalRevision,observationId:passing?.pass?passing.id:null};
      return{code:'REFLECTION_SAVED',message:'Your exact explanation is saved for teacher review. The game does not grade its quality.'};
    }
    case 'COMPLETE_LESSON':{
      const checks=gateChecks(a);need(checks.length&&checks.every(c=>c.met),'LESSON_INCOMPLETE',checks.find(c=>!c.met)?.detail||'Complete the practical task first.');
      const record=completionRecord(a);s.completionRecords.push(record);a.phase='complete';event(a,'COMPLETE_LESSON',{lessonId:a.lessonId,recordId:record.id,masteryClaim:false});
      return{code:completed(s)?'BOOTCAMP_TASKS_COMPLETE':'LESSON_COMPLETE',message:completed(s)?'All six training tasks are recorded. You can take the independent clinic job; understanding remains for teacher review.':'Practical task recorded. The next lesson is available.'};
    }
    default:fail('ACTION_UNKNOWN','Choose a supported training action.');
  }
}

export function dispatchBootcamp(state,action){
  try{
    const accepted=actionShape(action,ACTION_FIELDS),next=clone(state),result=apply(next,accepted);next.revision++;
    return{state:next,accepted:true,code:result.code,message:result.message};
  }catch(error){if(error.code)return{state,accepted:false,code:error.code,message:error.message};throw error;}
}

export function deriveBootcamp(state){
  const a=state.current,done=completedIds(state),index=a?LESSONS.findIndex(l=>l.id===a.lessonId):-1,definition=a?lesson(a.lessonId):null;
  const child=a?deriveNetwork(a.networkState):null,n=a?networkAttempt(a):null,checks=a?gateChecks(a):[];
  const labels={'role.reception':'Bench workstation','role.records':'Training service host','infra.switch':'Network switch','infra.ap':'Wireless access point','role.nurse':'Mobile practice device'};
  const devices=(child?.devices||[]).map(d=>({...d,roleLabel:labels[d.roleId]||d.roleLabel}));
  const ids=Object.fromEntries(devices.map(d=>[d.roleId,d.id]));
  const frozen=a?.phase==='complete';
  const observations=(a?.observations||[]).slice().reverse().map(o=>({...clone(o),stale:o.testedTechnicalRevision!==a.technicalRevision}));
  const mobile=['boot.wireless','boot.access','boot.transfer'].includes(a?.lessonId);
  const reflection=a?{...clone(a.reflection),stale:a.reflection.submitted&&a.reflection.contextRevision!==a.technicalRevision,review:'pending-teacher'}:{text:'',oral:false,submitted:false,stale:false,review:'pending-teacher'};
  const lastPass=a?fresh(a,'nurse'):null,repairConfirmed=!!(a?.repairChange&&lastPass?.pass&&lastPass.pathIds.includes(a.repairChange.cableId));
  return {courseId:COURSE_ID,campaignId:state.campaignId,revision:state.revision,attemptId:a?.id||'boot.welcome',phase:a?.phase||'welcome',lessonId:a?.lessonId||null,lessonIndex:index,lessonNumber:index+1,
    lessons:LESSONS.map((l,i)=>({id:l.id,index:i,title:l.title,unlocked:i<=allowedIndex(state),completed:done.includes(l.id),active:l.id===a?.lessonId})),completedLessonIds:done,courseComplete:completed(state),progress:{completed:done.length,total:6},
    demo:{available:!!definition?.steps.length,started:a?.phase==='demo',finished:a?.phase==='demo'&&a.demoStepIndex===definition.steps.length,stepIndex:a?.phase==='demo'?a.demoStepIndex:0,currentStepId:a?.phase==='demo'&&a.demoStepIndex?definition.steps[a.demoStepIndex-1]?.id:null,nextStepId:a?.phase==='demo'?definition.steps[a.demoStepIndex]?.id||null:null,steps:(definition?.steps||[]).map((st,i)=>({...st,done:a?.phase==='demo'&&i<a.demoStepIndex}))},
    network:clone(n?.network||{base:'192.168.80',cidr:'192.168.80.0/24',mask:'255.255.255.0',serverAddress:'192.168.80.10',receptionAddress:'192.168.80.20',inheritedNurseAddress:'192.168.80.30'}),devices,cables:clone(child?.cables||[]),locations:clone(LOCATIONS.filter(l=>l.id!=='location.home')),policy:clone(child?.policy||POLICIES['policy.roles-separated']),policies:clone(Object.values(POLICIES)),serverEnabled:child?.serverEnabled||false,
    workstationDeviceId:ids['role.reception']||null,serverDeviceId:ids['role.records']||null,switchDeviceId:ids['infra.switch']||null,nurseDeviceId:ids['role.nurse']||null,apDeviceId:ids['infra.ap']||null,
    roleOptions:KIT_ROLES.map(r=>({roleId:r.roleId,label:r.label,choices:r.kinds.map(kind=>({kind,label:CATALOG[kind].label,description:CATALOG[kind].description})),deviceId:ids[r.roleId]||null})),
    allowedNetworkActions:allowedActions(a),controls:{kit:a?.lessonId==='boot.kit',cables:!!a&&a.lessonId!=='boot.kit',address:a?.lessonId==='boot.address'||mobile,wireless:mobile,access:a?.lessonId==='boot.access',diagnostics:!!a&&a.lessonId!=='boot.kit',reflection:a?.lessonId==='boot.transfer'},observations,currentResults:a?currentChecks(a):[],inspections:(a?.inspections||[]).slice().reverse().map(i=>({...clone(i),stale:i.technicalRevision!==a.technicalRevision})),history:clone(a?.history||[]),
    checks,canComplete:a?.phase==='practice'&&checks.length>0&&checks.every(c=>c.met),requiredTests:a?expectedTests(a):[],reflection,hints:{highestTier:Math.max(0,...(a?.hints||[])),revealed:clone(a?.hints||[])},repair:{observed:clone(a?.faultObservation||null),change:clone(a?.repairChange||null),confirmed:repairConfirmed},completionRecords:clone(state.completionRecords),nextLessonId:index>=0&&index<LESSONS.length-1?LESSONS[index+1].id:null,economy:{credits:0,minutes:0,earnings:0},
    evidenceNotice:'Training tasks and trainer demonstrations are separate from independent field evidence. Task completion and help use never award an IB grade or prove mastery.'};
}

export function createBootcampEvidence(state){
  const view=deriveBootcamp(state);
  const json={format:'riverbend-bootcamp-evidence',schemaVersion:1,courseId:COURSE_ID,campaignId:state.campaignId,completedLessonIds:view.completedLessonIds,courseTasksComplete:view.courseComplete,teacherReview:'pending',independentMastery:false,demonstrations:clone(state.demonstrationRecords),completionRecords:clone(state.completionRecords),current:{attemptId:view.attemptId,lessonId:view.lessonId,phase:view.phase,network:view.network,devices:view.devices,cables:view.cables,observations:view.observations,currentEngineChecks:view.currentResults,inspections:view.inspections,checks:view.checks,reflection:view.reflection,hints:view.hints,history:view.history},financialEffect:{credits:0,minutes:0,earnings:0}};
  const lines=['FIELD-READY BOOTCAMP — TRAINING RECORD',`${view.progress.completed}/6 practical tasks recorded. This is not a grade or mastery certificate.`,'Demonstrations are trainer actions. Practice observations are learner actions. All training help is free.',''];
  for(const l of LESSONS){const records=state.completionRecords.filter(r=>r.lessonId===l.id),last=records.at(-1),demo=state.demonstrationRecords.find(r=>r.lessonId===l.id);lines.push(`${l.title}: ${last?'practical task recorded':'not completed'}${demo?`; worked example ${demo.completed?'finished':'partly viewed'}`:''}.`);if(last){const tests=last.observations.filter(o=>o.origin==='learner');lines.push(`  ${tests.length} actual learner test results; ${last.hints.length} hint levels opened; ${last.network.cidr}; evidence ${last.id}.`);}}
  const transfer=state.completionRecords.filter(r=>r.lessonId==='boot.transfer').at(-1),reflection=transfer?.reflection||(view.lessonId==='boot.transfer'?view.reflection:null);
  lines.push('','EXACT TRANSFER EXPLANATION',reflection?.text||'[No written explanation]',reflection?.oral?'Oral explanation pending teacher conversation.':'Explanation quality remains pending teacher judgement.','',view.evidenceNotice,'No names, patient information or accounts are required. Local files are editable; action replay checks consistency, not learner identity.');
  return{json,text:lines.join('\n')};
}
