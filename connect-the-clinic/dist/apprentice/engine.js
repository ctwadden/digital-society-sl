/**
 * Lantern Line apprenticeship — original, authoritative progression for three supervised visits.
 * Every service outcome comes from the shared causal network model (../engine.js).
 * Mentor talk, staff reactions, visit completion and truck access all read this state;
 * nothing here writes a success flag that the model has not produced.
 */
import {createGame,dispatch as dispatchNetwork,derive as deriveNetwork,maskPrefix} from '../engine.js';
import {CATALOG,POLICIES} from '../catalog.js';

const APP_ID='lanternline.apprenticeship';
const clone=x=>JSON.parse(JSON.stringify(x));
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>typeof k==='string'&&Object.hasOwn(x,k);
const pad=n=>String(n).padStart(4,'0');
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const need=(test,code,message)=>{if(!test)fail(code,message);};

export const SITE_NETWORK=Object.freeze({base:'10.12.1',cidr:'10.12.1.0/24',mask:'255.255.255.0',serverAddress:'10.12.1.10',receptionAddress:'10.12.1.20',inheritedNurseAddress:'10.12.1.30'});
export const ITEMS=Object.freeze([
  {id:'item.patch-cable',label:'Ethernet patch cables',essential:true,cable:'ethernet',use:'Carry network traffic between Ethernet (RJ45) ports.'},
  {id:'item.power-cord',label:'Power cords',essential:true,cable:'power',use:'Supply mains power to equipment.'},
  {id:'item.link-tester',label:'Service tester',essential:true,tool:'test',use:'Runs a real service check from a device and shows the route it used.'},
  {id:'item.port-light',label:'Inspection light',essential:true,tool:'inspect',use:'Inspect ports, cables and the device’s network settings.'},
  {id:'item.hdmi-cable',label:'HDMI display cable',essential:false,cable:'hdmi',use:'Sends a picture to a screen. It does not carry network service.'},
  {id:'item.usb-cable',label:'USB cable',essential:false,cable:'usb',use:'Connects peripherals such as keyboards or drives.'},
  {id:'item.phone-cord',label:'Telephone cord',essential:false,cable:'phone',use:'An RJ11 phone cord. Narrower than RJ45 Ethernet; it cannot make a network link here.'}
]);
export const CABLE_TYPES=Object.freeze(['ethernet','power','hdmi','usb','phone']);
const ESSENTIALS=ITEMS.filter(i=>i.essential).map(i=>i.id);
const ROOM_IDS=['location.exam-a','location.exam-b'];
const ACCEPTABLE_POLICIES=['policy.roles-separated','policy.nurse-also-books'];
const EXPOSED_TESTS=['reception','nurse','nurse-bookings','access-reception','access-outsider-bookings','access-outsider-workspace'];

export const VISITS=Object.freeze([
  {id:'visit.1',number:1,support:'alongside',title:'The front desk is dark',
   brief:'Harbour Street Clinic opens in an hour. Theo at the front desk cannot see today’s bookings: the desk computer, the switch and the service host have not been installed.',
   goal:'Install the desk computer, switch and service host, power them, cable them with Ethernet and test the booking service from the desk.',
   rooms:['reception','closet'],
   roles:{'role.reception':['desktop','laptop'],'infra.switch':['switch4','switch8'],'role.records':['server','desktop']},
   actions:['CHOOSE_DEVICE','POWER_DEVICE','CONNECT_PORTS','DISCONNECT_CABLE'],tests:['reception']},
  {id:'visit.2',number:2,support:'supported',title:'New computer, new rooms',
   brief:'The front desk received a replacement computer that still carries an address from another office. Ana, the clinic nurse, also needs her tablet to work in both exam rooms.',
   goal:'Read the network card, give the replacement desk computer a valid unused address with the supplied mask, then bring the wireless access point into service and test the tablet in both exam rooms.',
   rooms:['reception','closet','examA','examB'],roles:{},
   actions:['POWER_DEVICE','CONNECT_PORTS','DISCONNECT_CABLE','SET_STATIC_ADDRESS','ASSOCIATE_WIFI','MOVE_NURSE'],tests:['reception','nurse']},
  {id:'visit.3',number:3,support:'lead',title:'You lead: Ana’s tablet cannot reach the workspace',
   brief:'After weekend renovations Ana’s tablet shows its usual address but cannot open the clinical workspace. Ms. Ruiz, the clinic manager, also asks you to “just leave everything open so nobody gets locked out.”',
   goal:'Choose your own inspection or test, find the cause, repair it, retest, decide who should have access, and explain what changed and who it affects.',
   rooms:['reception','closet','examA','examB'],roles:{},
   actions:['POWER_DEVICE','CONNECT_PORTS','DISCONNECT_CABLE','SET_STATIC_ADDRESS','ASSOCIATE_WIFI','MOVE_NURSE','SET_PERMISSIONS'],tests:['reception','nurse','access']}
]);
const visit=id=>VISITS.find(v=>v.id===id);
const ACTION_FIELDS={PACK_ITEM:['itemId'],UNPACK_ITEM:['itemId'],START_VISIT:['visitId'],RESTART_VISIT:[],RETURN_TO_YARD:[],HOLD_CABLE:['cableType'],RELEASE_CABLE:[],PLUG:['deviceId','socketId'],NETWORK_ACTION:['action'],INSPECT_DEVICE:['deviceId'],RUN_TEST:['testId'],ASK_MENTOR:['topic'],SAVE_EXPLANATION:['text','oral'],FINISH_VISIT:[],CLAIM_TRUCK:[]};
const NETWORK_FIELDS={CHOOSE_DEVICE:['roleId','kind'],POWER_DEVICE:['deviceId','on'],CONNECT_PORTS:['fromDeviceId','fromPortId','toDeviceId','toPortId'],DISCONNECT_CABLE:['cableId'],SET_STATIC_ADDRESS:['deviceId','address','mask'],ASSOCIATE_WIFI:['deviceId','apDeviceId'],MOVE_NURSE:['locationId'],SET_PERMISSIONS:['policyId']};
const MENTOR_TOPICS=['next','why','show','cables','address','wireless','access'];
const SOCKET_KINDS=['ethernet','power','hdmi','usb'];

const net=a=>a.networkState.attempts[a.networkState.activeAttemptId];
const role=(a,id)=>Object.values(net(a).devices).find(d=>d.roleId===id)||null;
const recordsFor=(s,id)=>s.completionRecords.filter(r=>r.visitId===id);
const completedVisitIds=s=>[...new Set(s.completionRecords.map(r=>r.visitId))];
const unlockedIndex=s=>Math.min(VISITS.length-1,VISITS.findIndex(v=>!completedVisitIds(s).includes(v.id))<0?VISITS.length-1:VISITS.findIndex(v=>!completedVisitIds(s).includes(v.id)));
export const truckEarned=s=>VISITS.every(v=>recordsFor(s,v.id).some(r=>r.origin==='learner-practice'));

export function createApprenticeship({campaignId='apprentice.local'}={}){
  need(typeof campaignId==='string'&&/^[A-Za-z0-9._:-]{1,120}$/.test(campaignId),'CAMPAIGN_INVALID','Use an anonymous campaign identifier.');
  return {appId:APP_ID,schemaVersion:1,campaignId,revision:0,at:'yard',packed:[],yardLog:[],attemptSequence:0,current:null,completionRecords:[],truck:{claimed:false,claimedRevision:null}};
}

function event(a,type,payload={},origin='learner'){
  const e={id:`${a.id}.event.${pad(++a.sequence)}`,sequence:a.sequence,type,origin,technicalRevision:a.technicalRevision,payload:clone(payload)};
  a.history.push(e);if(a.history.length>600)a.history.splice(0,a.history.length-600);return e;
}

function fingerprint(a){
  const n=net(a);
  return JSON.stringify({devices:Object.values(n.devices).map(d=>({...d,locationId:d.roleId==='role.nurse'?'mobile':d.locationId})),cables:n.cables,serverEnabled:n.serverEnabled,policyId:n.policyId});
}

function child(a,action,origin){
  const old=net(a),oldObs=old.observationSequence;
  const result=dispatchNetwork(a.networkState,action);need(result.accepted,result.code,result.message);
  a.networkState=result.state;const n=net(a);
  // Keep the embedded network log bounded; apprenticeship evidence keeps its own references.
  if(n.events.length>400)n.events.splice(0,n.events.length-400);
  if(n.observations.length>160)n.observations.splice(0,n.observations.length-160);
  n.training.practiceActions=[];
  return n.observations.filter(o=>Number(o.id.split('.').at(-1))>oldObs).map(o=>({...o,origin}));
}

function setupChoose(a,roleId,kind,powered=true){
  child(a,{type:'CHOOSE_DEVICE',roleId,kind},'setup');const d=role(a,roleId);
  if(powered)child(a,{type:'POWER_DEVICE',deviceId:d.id,on:true},'setup');return role(a,roleId);
}
function setupCable(a,fromRole,toRole,port){
  const x=role(a,fromRole),y=role(a,toRole);
  child(a,{type:'CONNECT_PORTS',fromDeviceId:x.id,fromPortId:`${x.id}.eth1`,toDeviceId:y.id,toPortId:`${y.id}.eth${port}`},'setup');
}

function createAttempt(s,visitId){
  const id=`app.attempt.${pad(++s.attemptSequence)}`;
  let g=createGame({campaignId:s.campaignId});
  const opened=dispatchNetwork(g,{type:'START_CLINIC_PRACTICE'});need(opened.accepted,opened.code,opened.message);g=opened.state;
  const n=g.attempts[g.activeAttemptId];n.id=`${id}.network`;g.activeAttemptId=n.id;g.attempts={[n.id]:n};
  n.events=[];n.messages=[];n.sequence=0;n.observations=[];n.observationSequence=0;n.training.practiceActions=[];
  n.network=clone(SITE_NETWORK);
  const a={id,visitId,networkState:g,technicalRevision:0,sequence:0,observationSequence:0,inspectionSequence:0,observations:[],inspections:[],history:[],playerActions:[],mistakes:[],support:[],held:null,pendingEnd:null,highlight:null,lastResult:null,explanation:{text:'',oral:false,submitted:false,contextRevision:null,observationId:null},faultObservation:null,repairChange:null,policyDecision:null,addressChange:null,finished:false};
  if(visitId!=='visit.1'){
    setupChoose(a,'role.records','server');child(a,{type:'SET_SERVICE_STATE',enabled:true},'setup');
    setupChoose(a,'infra.switch','switch4');setupChoose(a,'role.reception','desktop');
    setupCable(a,'role.records','infra.switch',1);setupCable(a,'role.reception','infra.switch',2);
    setupChoose(a,'role.nurse','tablet');
    setupChoose(a,'infra.ap','access-point',visitId==='visit.3');
    if(visitId==='visit.2'){
      child(a,{type:'SET_STATIC_ADDRESS',deviceId:role(a,'role.reception').id,address:'192.168.1.50',mask:'255.255.255.0'},'setup');
      child(a,{type:'SET_PERMISSIONS',policyId:'policy.roles-separated'},'setup');
    }else{
      child(a,{type:'ASSOCIATE_WIFI',deviceId:role(a,'role.nurse').id,apDeviceId:role(a,'infra.ap').id},'setup');
      child(a,{type:'SET_PERMISSIONS',policyId:'policy.broad-access'},'setup');
      // The AP uplink was disconnected during renovations: the nurse address remains valid.
    }
  }
  a.setupFingerprint=fingerprint(a);
  event(a,'VISIT_SETUP',{visitId,network:clone(net(a).network),learnerEvidence:false},'setup');
  return a;
}

function actionShape(action,fields,unknownMessage){
  need(plain(action)&&typeof action.type==='string'&&own(fields,action.type),'ACTION_UNKNOWN',unknownMessage);
  const expected=['type',...fields[action.type]];
  need(Object.keys(action).every(k=>expected.includes(k))&&fields[action.type].every(k=>own(action,k)),'ACTION_FIELDS','The action fields do not match this control.');
  return clone(action);
}

const apUplinkMissing=a=>{const ap=role(a,'infra.ap'),sw=role(a,'infra.switch');return !!(ap&&sw&&!net(a).cables.some(c=>[c.fromDeviceId,c.toDeviceId].includes(ap.id)&&[c.fromDeviceId,c.toDeviceId].includes(sw.id)));};

function mistake(a,kind,detail){
  const e=event(a,'MISTAKE',{kind,...detail});a.mistakes.push({id:`${a.id}.mistake.${pad(a.mistakes.length+1)}`,eventId:e.id,kind,...clone(detail),technicalRevision:a.technicalRevision});
  if(a.mistakes.length>120)a.mistakes.splice(0,a.mistakes.length-120);
  a.lastResult={kind:'mistake',code:kind,eventId:e.id};
}

function applyNetwork(a,action){
  a.highlight=null;
  const v=visit(a.visitId),p=actionShape(action,NETWORK_FIELDS,'Choose a supported equipment action.');
  need(v.actions.includes(p.type),'ACTION_NOT_IN_VISIT','That change is not part of this visit. Ask Mags if you are unsure what to do next.');
  const devices=net(a).devices;
  for(const key of ['deviceId','fromDeviceId','toDeviceId'])if(own(p,key))need(own(devices,p[key]),'DEVICE_UNKNOWN','Choose a device that is actually installed here.');
  if(p.type==='ASSOCIATE_WIFI'&&p.apDeviceId!==null)need(own(devices,p.apDeviceId),'DEVICE_UNKNOWN','Choose the installed access point.');
  if(p.type==='CHOOSE_DEVICE')need(v.roles[p.roleId]?.includes(p.kind),'DEVICE_NOT_OFFERED','Choose one of the items Mags brought in the van for this job.');
  if(p.type==='SET_STATIC_ADDRESS'){
    const prefix=typeof p.mask==='string'&&p.mask.length?maskPrefix(p.mask):null;
    need(prefix!==null&&prefix>=1&&prefix<=30,'MASK_INVALID','Enter the subnet mask as four numbers, for example the one on the network card.');
    need(['role.reception','role.nurse'].includes(devices[p.deviceId].roleId),'ADDRESS_TARGET','Set addresses on the desk computer or the tablet; the switch and access point do not need one here.');
  }
  if(p.type==='MOVE_NURSE')need(ROOM_IDS.includes(p.locationId),'LOCATION_NOT_IN_VISIT','Ana works in exam room A or exam room B.');
  const before=fingerprint(a),wasMissing=apUplinkMissing(a),beforeDevice=p.deviceId?clone(devices[p.deviceId]):null;
  child(a,p,'learner');
  // Mags’ service host arrives with its booking and workspace software already configured.
  if(p.type==='CHOOSE_DEVICE'&&p.roleId==='role.records'&&!net(a).serverEnabled)child(a,{type:'SET_SERVICE_STATE',enabled:true},'setup');
  const changed=fingerprint(a)!==before;if(changed)a.technicalRevision++;
  const e=event(a,p.type,p);
  a.playerActions.push({type:p.type,eventId:e.id,technicalRevision:a.technicalRevision,deviceId:p.deviceId||null,roleId:p.roleId||beforeDevice?.roleId||null,changed});
  if(a.playerActions.length>400)a.playerActions.splice(0,a.playerActions.length-400);
  if(p.type==='SET_STATIC_ADDRESS'&&changed)a.addressChange={eventId:e.id,deviceId:p.deviceId,roleId:beforeDevice.roleId,from:beforeDevice.address,to:p.address,mask:p.mask,technicalRevision:a.technicalRevision};
  if(p.type==='SET_PERMISSIONS')a.policyDecision={policyId:p.policyId,eventId:e.id,technicalRevision:a.technicalRevision};
  if(p.type==='CONNECT_PORTS'&&a.visitId==='visit.3'&&wasMissing&&a.faultObservation&&!apUplinkMissing(a))a.repairChange={eventId:e.id,cableId:net(a).cables.at(-1).id,observationId:a.faultObservation.id,technicalRevision:a.technicalRevision};
  a.lastResult={kind:'change',code:p.type,changed,eventId:e.id};
  return changed;
}

function inspect(a,deviceId){
  a.highlight=null;
  const n=net(a);need(own(n.devices,deviceId),'DEVICE_UNKNOWN','Choose an installed device to inspect.');
  const snapshot=deriveNetwork(a.networkState).devices.find(d=>d.id===deviceId);
  const e=event(a,'INSPECT_DEVICE',{deviceId});
  const item={id:`${a.id}.inspection.${pad(++a.inspectionSequence)}`,eventId:e.id,deviceId,roleId:snapshot.roleId,technicalRevision:a.technicalRevision,snapshot:clone(snapshot),uplinkMissing:snapshot.roleId==='infra.ap'?apUplinkMissing(a):null};
  a.inspections.push(item);if(a.inspections.length>80)a.inspections.splice(0,a.inspections.length-80);
  if(a.visitId==='visit.3'&&snapshot.roleId==='infra.ap'&&item.uplinkMissing&&!a.faultObservation)a.faultObservation={kind:'inspection',id:item.id,eventId:e.id,technicalRevision:a.technicalRevision,reason:'AP_UPLINK_MISSING'};
  a.lastResult={kind:'inspection',code:'INSPECTED',deviceId,eventId:e.id};
  return item;
}

function runTest(a,testId){
  const v=visit(a.visitId);need(v.tests.includes(testId),'TEST_NOT_IN_VISIT','That check is not part of this visit.');
  const nurse=role(a,'role.nurse');
  const e=event(a,'RUN_TEST',{testId,locationId:testId==='nurse'?nurse?.locationId||null:'location.reception'});
  const added=[];
  for(const o of child(a,{type:'RUN_PROBE',testId},'learner')){
    if(!EXPOSED_TESTS.includes(o.testId))continue;
    const source=net(a).devices[o.sourceDeviceId];
    const item={...clone(o),id:`${a.id}.observation.${pad(++a.observationSequence)}`,eventId:e.id,origin:'learner',locationId:source?.locationId||null,testedTechnicalRevision:a.technicalRevision};
    a.observations.push(item);added.push(item);
    if(a.visitId==='visit.3'&&item.testId==='nurse'&&item.code==='PORT_DISCONNECTED'&&apUplinkMissing(a)&&!a.faultObservation)a.faultObservation={kind:'failed-test',id:item.id,eventId:e.id,technicalRevision:a.technicalRevision,reason:item.code};
  }
  if(a.observations.length>200){const pinned=new Set([a.faultObservation?.id,a.explanation.observationId].filter(Boolean));a.observations=a.observations.filter((o,i,all)=>pinned.has(o.id)||i>=all.length-200);}
  const failed=added.find(o=>!o.pass);
  a.lastResult={kind:'test',code:failed?.code||'SERVICE_AVAILABLE',testId,pass:!failed,observationIds:added.map(o=>o.id),eventId:e.id};
  return added;
}

/** Plugging is the scene’s physical interaction. Only real Ethernet/power actions reach the model. */
function plug(a,deviceId,socketId){
  const n=net(a);need(own(n.devices,deviceId),'DEVICE_UNKNOWN','Choose an installed device.');
  need(a.held,'NO_CABLE_HELD','Pick a cable from the bag first.');
  const d=deriveNetwork(a.networkState).devices.find(x=>x.id===deviceId);
  const port=d.ports.find(p=>p.id===socketId);
  let socket=port?(port.medium==='ethernet'?'ethernet':'wifi'):null;
  if(!socket){
    need(typeof socketId==='string'&&socketId.startsWith(`${deviceId}.`),'SOCKET_UNKNOWN','Choose a socket on this device.');
    socket=socketId.slice(deviceId.length+1);need(SOCKET_KINDS.includes(socket)&&socket!=='ethernet','SOCKET_UNKNOWN','Choose a socket on this device.');
  }
  const held=a.held;
  if(held==='power'){
    if(socket!=='power'){mistake(a,'POWER_IN_WRONG_SOCKET',{held,socket,deviceId});return {code:'MISTAKE',message:'A power cord only fits the power inlet.'};}
    if(d.powered){event(a,'PLUG_POWER',{deviceId,alreadyOn:true});a.lastResult={kind:'change',code:'ALREADY_POWERED',changed:false};return {code:'ALREADY_POWERED',message:'That device already has power.'};}
    applyNetwork(a,{type:'POWER_DEVICE',deviceId,on:true});a.held=null;return {code:'POWERED',message:`${CATALOG[d.kind].label} powered on.`};
  }
  if(held!=='ethernet'){
    const kind=held==='phone'&&socket==='ethernet'?'PHONE_CORD_IN_RJ45':held==='hdmi'?(socket==='hdmi'?'DISPLAY_NOT_NETWORK':'HDMI_WRONG_SOCKET'):held==='usb'?(socket==='usb'?'USB_NOT_NETWORK':'USB_WRONG_SOCKET'):'PHONE_CORD_WRONG_SOCKET';
    mistake(a,kind,{held,socket,deviceId});return {code:'MISTAKE',message:'That cable cannot create the network link this job needs.'};
  }
  if(socket!=='ethernet'){mistake(a,socket==='wifi'?'CABLE_TO_RADIO':'ETHERNET_IN_WRONG_SOCKET',{held,socket,deviceId});return {code:'MISTAKE',message:'An Ethernet plug only fits an RJ45 Ethernet port.'};}
  if(port.cableId){mistake(a,'PORT_ALREADY_USED',{held,socket,deviceId,portId:port.id});return {code:'MISTAKE',message:'That port already has a cable.'};}
  if(!a.pendingEnd){
    a.pendingEnd={deviceId,portId:port.id};event(a,'CABLE_END_PLUGGED',{deviceId,portId:port.id});a.lastResult={kind:'cable-end',code:'FIRST_END',deviceId,eventId:a.history.at(-1).id};
    return {code:'FIRST_END',message:'One end plugged in. Now choose the port at the other end.'};
  }
  if(a.pendingEnd.deviceId===deviceId){mistake(a,'SAME_DEVICE_BOTH_ENDS',{held,deviceId});return {code:'MISTAKE',message:'Both ends are on the same device.'};}
  const from=a.pendingEnd;a.pendingEnd=null;
  applyNetwork(a,{type:'CONNECT_PORTS',fromDeviceId:from.deviceId,fromPortId:from.portId,toDeviceId:deviceId,toPortId:port.id});
  a.held=null;
  return {code:'CABLE_CONNECTED',message:'Ethernet cable connected at both ends. Test the service to find out what it changed.'};
}

function fresh(a,testId,locationId=null){return [...a.observations].reverse().find(o=>o.origin==='learner'&&o.testId===testId&&o.testedTechnicalRevision===a.technicalRevision&&(!locationId||o.locationId===locationId))||null;}
/** A learner test still counts while the model's current evaluation of that same check passes. */
function confirmed(a,testId,locationId=null,afterEventId=null){
  const last=[...a.observations].reverse().find(o=>o.origin==='learner'&&o.testId===testId&&(!locationId||o.locationId===locationId));
  if(!last?.pass||(afterEventId&&eventSeq(last.eventId)<eventSeq(afterEventId)))return null;
  const currentId=locationId?{'location.exam-a':'nurse-room-a','location.exam-b':'nurse-room-b'}[locationId]:testId;
  const now=deriveNetwork(a.networkState).currentResults.find(o=>o.testId===currentId);
  return now?.pass?last:null;
}
const did=(a,type,pred=()=>true)=>a.playerActions.some(x=>x.type===type&&pred(x));
const linked=(a,x,y)=>{const p=role(a,x),q=role(a,y);return !!(p&&q&&net(a).cables.some(c=>[c.fromDeviceId,c.toDeviceId].includes(p.id)&&[c.fromDeviceId,c.toDeviceId].includes(q.id)));};
const eventSeq=id=>Number(String(id).split('.').at(-1));

export function visitChecks(a){
  if(!a)return[];
  const n=net(a),check=(id,label,met,detail)=>({id,label,met:!!met,detail});
  if(a.visitId==='visit.1'){
    const rows=Object.entries(visit('visit.1').roles).map(([roleId])=>{
      const d=role(a,roleId),label={'role.reception':'desk computer','infra.switch':'switch','role.records':'service host'}[roleId];
      return check(`install.${roleId}`,`Choose and power the ${label}`,d&&d.powered&&did(a,'CHOOSE_DEVICE',x=>x.roleId===roleId)&&did(a,'POWER_DEVICE',x=>x.deviceId===d.id),d?`${CATALOG[d.kind].label}, power ${d.powered?'on':'off'}.`:'Not installed yet.');
    });
    const learnerCables=n.cables.filter(c=>did(a,'CONNECT_PORTS',x=>x.changed));
    const t=confirmed(a,'reception');
    return [...rows,
      check('cable.desk','Cable the desk computer to the switch',linked(a,'role.reception','infra.switch')&&learnerCables.length>0,'Ethernet from the desk computer’s RJ45 port to a free switch port.'),
      check('cable.host','Cable the service host to the switch',linked(a,'role.records','infra.switch'),'Use a different free switch port.'),
      check('test.desk','Test bookings from the desk',t?.pass,t?`${t.code}: ${t.message}`:'No passing desk test with the current setup yet.')];
  }
  if(a.visitId==='visit.2'){
    const desk=role(a,'role.reception'),ap=role(a,'infra.ap'),tablet=role(a,'role.nurse');
    const readCard=a.inspections.some(i=>i.roleId==='role.reception');
    const addr=a.addressChange&&a.addressChange.roleId==='role.reception'?a.addressChange:null;
    const t=confirmed(a,'reception',null,addr?.eventId),ra=confirmed(a,'nurse','location.exam-a'),rb=confirmed(a,'nurse','location.exam-b');
    const last=(id,loc)=>[...a.observations].reverse().find(o=>o.origin==='learner'&&o.testId===id&&(!loc||o.locationId===loc));
    return [
      check('inspect.desk','Inspect the desk computer’s network settings',readCard,'Use the inspection light on the desk computer and compare it with the network card.'),
      check('address.apply','Apply a valid unused address yourself',!!addr&&desk?.address!=='192.168.1.50'&&t?.pass,addr?`You set ${addr.to}.`:'The address is still the one from the old office.'),
      check('address.mask','Use the mask on the network card',desk?.mask===n.network.mask,`Network card mask: ${n.network.mask}.`),
      check('test.desk','Test bookings from the desk after the change',t?.pass,t?`${t.code}: ${t.message}`:last('reception')?'Your last desk test did not pass with the current setup.':'No desk test yet.'),
      check('wifi.ap','Power the access point and connect its Ethernet uplink',ap?.powered&&linked(a,'infra.ap','infra.switch')&&did(a,'POWER_DEVICE',x=>x.deviceId===ap.id)&&did(a,'CONNECT_PORTS'),'Wi-Fi only reaches the service host through the AP’s cable to the switch.'),
      check('wifi.join','Join Ana’s tablet to the access point',tablet?.wifiApId===ap?.id&&did(a,'ASSOCIATE_WIFI'),'Association is the tablet’s choice of access point.'),
      check('test.roomA','Test the tablet in exam room A',ra?.pass,ra?`${ra.code}: ${ra.message}`:last('nurse','location.exam-a')?'Your last room A test does not pass with the current setup.':'No test in room A yet.'),
      check('test.roomB','Test the tablet in exam room B',rb?.pass,rb?`${rb.code}: ${rb.message}`:last('nurse','location.exam-b')?'Your last room B test does not pass with the current setup.':'No test in room B yet.')];
  }
  const t=fresh(a,'nurse'),repair=a.repairChange;
  const repairedOk=!!(repair&&t?.pass&&t.pathIds.includes(repair.cableId)&&eventSeq(repair.eventId)<eventSeq(t.eventId));
  const accessTests=['reception','nurse-bookings','access-reception','access-outsider-bookings','access-outsider-workspace'].map(id=>fresh(a,id));
  const policyOk=a.policyDecision&&ACCEPTABLE_POLICIES.includes(n.policyId);
  const x=a.explanation,explained=x.submitted&&(x.text.trim()||x.oral)&&x.contextRevision===a.technicalRevision;
  return [
    check('fault.observed','Observe the fault before repairing it',!!a.faultObservation,'Choose a test or an inspection that shows what is actually wrong.'),
    check('fault.repaired','Repair the cause and retest the tablet',repairedOk,'The retest must pass through your repair.'),
    check('access.decision','Decide who gets access',policyOk,'Keep staff working and keep the clinical workspace restricted.'),
    check('access.tested','Test staff access and the restrictions',accessTests.every(o=>o?.pass)&&t?.pass,'Run the access checks after your final change.'),
    check('explain','Explain what changed and who it affects',explained,'Write it, or mark it for an oral explanation, after your final change.')];
}

function completionRecord(a){
  const view=deriveNetwork(a.networkState),n=net(a);
  return {id:`${a.id}.completion`,visitId:a.visitId,attemptId:a.id,origin:'learner-practice',technicalRevision:a.technicalRevision,checks:clone(visitChecks(a)),network:clone(n.network),
    devices:view.devices.map(({id,kind,roleId,powered,address,mask,wifiApId,locationId})=>({id,kind,roleId,powered,address,mask,wifiApId,locationId})),cables:clone(n.cables),policyId:n.policyId,
    observations:clone(a.observations.filter(o=>o.origin==='learner').slice(-40)),inspections:clone(a.inspections.slice(-20)),mistakes:clone(a.mistakes.slice(-30)),support:clone(a.support),
    addressChange:clone(a.addressChange),policyDecision:clone(a.policyDecision),fault:{observed:clone(a.faultObservation),repair:clone(a.repairChange)},explanation:clone(a.explanation),
    teacherReview:'pending',independentMastery:false,earnings:0};
}

function apply(s,action){
  switch(action.type){
    case 'PACK_ITEM':case 'UNPACK_ITEM':{
      need(s.at==='yard','YARD_REQUIRED','Pack the bag at the van in the depot yard.');
      need(ITEMS.some(i=>i.id===action.itemId),'ITEM_UNKNOWN','Choose an item from the van shelves.');
      const has=s.packed.includes(action.itemId);
      if(action.type==='PACK_ITEM'&&!has)s.packed.push(action.itemId);
      if(action.type==='UNPACK_ITEM'&&has)s.packed=s.packed.filter(x=>x!==action.itemId);
      s.yardLog.push({type:action.type,itemId:action.itemId,revision:s.revision+1});if(s.yardLog.length>120)s.yardLog.splice(0,s.yardLog.length-120);
      return{code:action.type==='PACK_ITEM'?'ITEM_PACKED':'ITEM_UNPACKED',message:action.type==='PACK_ITEM'?'Packed.':'Put back on the shelf.',itemId:action.itemId};
    }
    case 'START_VISIT':{
      const index=VISITS.findIndex(v=>v.id===action.visitId);need(index>=0,'VISIT_UNKNOWN','Choose a listed visit.');
      need(index<=unlockedIndex(s)||completedVisitIds(s).includes(action.visitId),'VISIT_LOCKED','Finish the earlier visit with Mags first.');
      need(ESSENTIALS.every(id=>s.packed.includes(id)),'BAG_INCOMPLETE','Pack the essentials first: Ethernet patch cables, power cords, the service tester and the inspection light.');
      const resume=s.current&&s.current.visitId===action.visitId&&!s.current.finished;
      if(!resume)s.current=createAttempt(s,action.visitId);
      s.at='site';
      return{code:resume?'VISIT_RESUMED':'VISIT_STARTED',message:resume?'Back on site. Everything is as you left it.':'You arrive at Harbour Street Clinic with Mags.'};
    }
    case 'RETURN_TO_YARD':s.at='yard';return{code:'AT_YARD',message:'Back at the depot. Your visit is saved where you left it.'};
    case 'CLAIM_TRUCK':
      need(truckEarned(s),'TRUCK_NOT_EARNED','Complete all three supervised visits yourself to earn your own van.');
      if(!s.truck.claimed){s.truck.claimed=true;s.truck.claimedRevision=s.revision+1;}
      s.at='yard';return{code:'TRUCK_CLAIMED',message:'Van 7 is yours. Independent jobs are open.'};
  }
  const a=s.current;need(a&&s.at==='site','VISIT_REQUIRED','Start a visit with Mags first.');
  if(action.type==='RESTART_VISIT'){s.current=createAttempt(s,a.visitId);return{code:'VISIT_RESTARTED',message:'Fresh start on the same visit. Earlier records stay in your history.'};}
  if(action.type==='ASK_MENTOR'){
    need(MENTOR_TOPICS.includes(action.topic),'TOPIC_UNKNOWN','Choose a question for Mags.');
    const e=event(a,'ASK_MENTOR',{topic:action.topic,cost:0});a.support.push({topic:action.topic,eventId:e.id,technicalRevision:a.technicalRevision});
    if(a.support.length>200)a.support.splice(0,a.support.length-200);
    if(action.topic==='show')a.highlight=showTarget(a);
    a.lastResult={kind:'ask',code:action.topic,eventId:e.id};
    return{code:'MENTOR_ASKED',message:'Mags answers. Help is always free.'};
  }
  need(!a.finished,'VISIT_FINISHED','This visit is complete and preserved. Restart it to practise again.');
  switch(action.type){
    case 'HOLD_CABLE':
      need(CABLE_TYPES.includes(action.cableType),'CABLE_UNKNOWN','Choose a cable from the bag.');
      a.held=action.cableType;a.pendingEnd=null;event(a,'HOLD_CABLE',{cableType:action.cableType});a.lastResult={kind:'hold',code:action.cableType};
      return{code:'CABLE_HELD',message:'Cable in hand. Choose a socket.'};
    case 'RELEASE_CABLE':a.held=null;a.pendingEnd=null;event(a,'RELEASE_CABLE');return{code:'CABLE_RELEASED',message:'Cable put back in the bag.'};
    case 'PLUG':{const r=plug(a,action.deviceId,action.socketId);return r;}
    case 'NETWORK_ACTION':{
      const changed=applyNetwork(a,action.action);
      return{code:'NETWORK_UPDATED',message:changed?'Changed. Earlier tests are now out of date until you test again.':'No change to the network.'};
    }
    case 'INSPECT_DEVICE':inspect(a,action.deviceId);return{code:'INSPECTED',message:'Inspected. Inspection is free.'};
    case 'RUN_TEST':{const added=runTest(a,action.testId),failed=added.find(o=>!o.pass);return{code:failed?.code||'TESTS_PASSED',message:failed?failed.message:'The service check passed.'};}
    case 'SAVE_EXPLANATION':{
      need(a.visitId==='visit.3','EXPLANATION_NOT_IN_VISIT','The written explanation belongs to the third visit.');
      need(typeof action.text==='string'&&action.text.length<=2000&&typeof action.oral==='boolean','EXPLANATION_INVALID','Use at most 2,000 characters, or choose an oral explanation.');
      need(action.text.trim()||action.oral,'EXPLANATION_EMPTY','Write your explanation or choose to explain it aloud to your teacher.');
      const t=fresh(a,'nurse'),e=event(a,'SAVE_EXPLANATION',{text:action.text,oral:action.oral});
      a.explanation={text:action.text,oral:action.oral,submitted:true,eventId:e.id,contextRevision:a.technicalRevision,observationId:t?.pass?t.id:null};
      a.lastResult={kind:'explain',code:'EXPLANATION_SAVED',eventId:e.id};
      return{code:'EXPLANATION_SAVED',message:'Saved exactly as written for your teacher. The game does not grade it.'};
    }
    case 'FINISH_VISIT':{
      const missing=visitChecks(a).find(c=>!c.met);need(!missing,'VISIT_INCOMPLETE',missing?`${missing.label}. ${missing.detail}`:'');
      const record=completionRecord(a);s.completionRecords.push(record);a.finished=true;event(a,'FINISH_VISIT',{recordId:record.id,masteryClaim:false});
      a.lastResult={kind:'finish',code:'VISIT_COMPLETE'};
      return{code:truckEarned(s)?'APPRENTICESHIP_COMPLETE':'VISIT_COMPLETE',message:truckEarned(s)?'All three supervised visits are recorded. Mags has something for you at the depot.':'Visit recorded. Mags will meet you at the depot for the next one.'};
    }
    default:fail('ACTION_UNKNOWN','Choose a supported apprenticeship action.');
  }
}

/** The mentor’s “show me” points at the next relevant object; it never performs the action. */
function showTarget(a){
  const firstUnmet=visitChecks(a).find(c=>!c.met);if(!firstUnmet)return null;
  const id=firstUnmet.id,dev=r=>role(a,r)?{deviceId:role(a,r).id}:{roleSlot:r};
  if(id.startsWith('install.'))return dev(id.slice(8));
  if(id==='cable.desk'||id==='inspect.desk'||id.startsWith('address')||id==='test.desk')return dev('role.reception');
  if(id==='cable.host')return dev('role.records');
  if(id==='wifi.ap')return dev('infra.ap');
  if(id==='wifi.join'||id.startsWith('test.room'))return dev('role.nurse');
  if(id==='fault.observed'||id==='fault.repaired')return dev('infra.ap');
  return dev('role.reception');
}

export function dispatchApprenticeship(state,action){
  try{
    const accepted=actionShape(action,ACTION_FIELDS,'Choose a supported apprenticeship action.'),next=clone(state);
    const result=apply(next,accepted);next.revision++;
    return{state:next,accepted:true,code:result.code,message:result.message};
  }catch(error){if(error.code)return{state,accepted:false,code:error.code,message:error.message};throw error;}
}

function staffState(current,learner){
  if(!current)return 'absent';
  if(current.code==='ACCESS_DENIED'&&!current.expectedDenied)return 'denied';
  if(current.pass&&learner?.pass)return 'working';
  return 'waiting';
}

export function deriveApprenticeship(state){
  const a=state.current,v=a?visit(a.visitId):null,done=completedVisitIds(state);
  const child=a?deriveNetwork(a.networkState):null,n=a?net(a):null;
  const current=a?child.currentResults.filter(o=>EXPOSED_TESTS.includes(o.testId)):[];
  const checks=a?visitChecks(a):[];
  const latest=a?[...a.observations].reverse().find(o=>o.origin==='learner')||null:null;
  const cur=id=>current.find(o=>o.testId===id)||null;
  const nurse=a?role(a,'role.nurse'):null;
  const observations=(a?.observations||[]).slice().reverse().map(o=>({...clone(o),stale:o.testedTechnicalRevision!==a.technicalRevision}));
  const cableState=c=>{
    const tests=(a?.observations||[]).filter(o=>o.origin==='learner'&&(o.pathIds.includes(c.id)||(!o.pass&&o.testedTechnicalRevision===a.technicalRevision)));
    const last=[...tests].reverse().find(o=>o.pathIds.includes(c.id));
    if(!last)return 'installed';return last.testedTechnicalRevision!==a.technicalRevision?'stale':last.pass?'tested-ok':'tested-fail';
  };
  return {
    appId:APP_ID,campaignId:state.campaignId,revision:state.revision,at:state.at,
    items:ITEMS.map(i=>({...i,packed:state.packed.includes(i.id)})),packed:clone(state.packed),bagReady:ESSENTIALS.every(id=>state.packed.includes(id)),yardLog:clone(state.yardLog.slice(-20)),
    visits:VISITS.map((x,i)=>({id:x.id,number:x.number,title:x.title,support:x.support,unlocked:i<=unlockedIndex(state)||done.includes(x.id),completed:done.includes(x.id),active:a?.visitId===x.id&&!a.finished,records:recordsFor(state,x.id).length})),
    completedVisitIds:done,truckEarned:truckEarned(state),truckClaimed:state.truck.claimed,
    visit:v?{...clone(v),attemptId:a.id,finished:a.finished}:null,
    network:clone(n?.network||SITE_NETWORK),devices:clone(child?.devices||[]),cables:(child?.cables||[]).map(c=>({...clone(c),state:cableState(c)})),
    policy:clone(child?.policy||POLICIES['policy.roles-separated']),policies:Object.values(POLICIES).map(p=>({id:p.id,label:p.label,description:p.description,acceptable:ACCEPTABLE_POLICIES.includes(p.id)})),
    held:a?.held||null,pendingEnd:clone(a?.pendingEnd||null),highlight:clone(a?.highlight||null),lastResult:clone(a?.lastResult||null),
    observations,latestTest:latest?{...clone(latest),stale:latest.testedTechnicalRevision!==a.technicalRevision}:null,currentResults:clone(current),
    inspections:(a?.inspections||[]).slice().reverse().map(i=>({...clone(i),stale:i.technicalRevision!==a.technicalRevision})),
    checks,canFinish:!!a&&!a.finished&&checks.length>0&&checks.every(c=>c.met),
    staff:{reception:a?staffState(cur('reception'),fresh(a,'reception')):'absent',
      nurse:{state:a&&nurse?staffState(cur('nurse'),fresh(a,'nurse')):'absent',locationId:nurse?.locationId||null},
      manager:a?.visitId==='visit.3'?'present':'absent'},
    mistakes:clone(a?.mistakes||[]),support:clone(a?.support||[]),history:clone((a?.history||[]).slice(-60)),
    addressChange:clone(a?.addressChange||null),policyDecision:clone(a?.policyDecision||null),fault:{observed:clone(a?.faultObservation||null),repair:clone(a?.repairChange||null),uplinkMissing:a?apUplinkMissing(a):false},
    explanation:a?{...clone(a.explanation),stale:a.explanation.submitted&&a.explanation.contextRevision!==a.technicalRevision}:null,
    technicalRevision:a?.technicalRevision??0,
    completionRecords:clone(state.completionRecords),
    allowedActions:clone(v?.actions||[]),allowedTests:clone(v?.tests||[]),roleOptions:v?Object.entries(v.roles).map(([roleId,kinds])=>({roleId,choices:kinds.map(kind=>({kind,label:CATALOG[kind].label,description:CATALOG[kind].description,ethernet:CATALOG[kind].ethernet}))})):[],
    notice:'Supervised visits are game progression with a fictional mentor. They are not an IB grade, a professional credential or a mastery judgement.'
  };
}

export function createApprenticeshipEvidence(state){
  const view=deriveApprenticeship(state);
  const json={format:'lanternline-apprenticeship-evidence',schemaVersion:1,campaignId:state.campaignId,completedVisitIds:view.completedVisitIds,truckEarned:view.truckEarned,truckClaimed:view.truckClaimed,packedItems:clone(state.packed),completionRecords:clone(state.completionRecords),teacherReview:'pending',independentMastery:false};
  const names={'role.reception':'desk computer','role.records':'service host','infra.switch':'switch','infra.ap':'access point','role.nurse':'tablet'};
  const lines=['LANTERN LINE APPRENTICESHIP — SUPERVISED VISITS',`${view.completedVisitIds.length}/3 visits recorded from the learner’s own actions. Own van: ${view.truckEarned?'earned':'not yet earned'}.`,'Mentor answers and “show me” pointers are support, not learner evidence. All help is free.',''];
  for(const v of VISITS){
    const r=recordsFor(state,v.id).at(-1);lines.push(`Visit ${v.number} — ${v.title}: ${r?'completed':'not completed'}.`);
    if(!r)continue;
    const learnerTests=r.observations;
    lines.push(`  Equipment: ${r.devices.map(d=>`${names[d.roleId]||d.roleId} ${CATALOG[d.kind]?.label||d.kind}${d.address?` ${d.address}/${maskPrefix(d.mask)}`:''}`).join('; ')}.`);
    if(r.addressChange)lines.push(`  Address change: ${r.addressChange.from} → ${r.addressChange.to} mask ${r.addressChange.mask} on the ${names[r.addressChange.roleId]}.`);
    if(r.fault.observed)lines.push(`  Fault observed by ${r.fault.observed.kind==='inspection'?'inspecting the access point':'a failed tablet test'} (${r.fault.observed.reason}); repaired with a new uplink cable.`);
    if(r.policyDecision)lines.push(`  Access decision: ${POLICIES[r.policyDecision.policyId]?.label||r.policyDecision.policyId}.`);
    lines.push(`  ${learnerTests.length} learner tests recorded; ${learnerTests.filter(o=>o.pass).length} passed. Mistakes noticed: ${r.mistakes.length}. Questions asked: ${r.support.length}.`);
    if(v.id==='visit.3')lines.push('  EXACT EXPLANATION:',r.explanation.text||'[No written explanation]',r.explanation.oral?'  Oral explanation pending teacher conversation.':'  Quality pending teacher judgement.');
  }
  lines.push('','Game progression only: not an IB grade or professional credential. No names, patient information or accounts are used.');
  return{json,text:lines.join('\n')};
}
