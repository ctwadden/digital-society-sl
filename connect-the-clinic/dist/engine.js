/** Connect the Clinic: original deterministic, bounded local-network teaching simulation. */
import {BUILD_VERSION,SCHEMA_VERSION,CATALOG,ROLES,ROLE_IDS,LOCATIONS,ATTACHMENTS,POLICIES,GUIDE_SECTIONS,STATIONS,EXPLANATION_KEYS,SERVICES} from './catalog.js';
export {CATALOG,ROLES,LOCATIONS,ATTACHMENTS,POLICIES,GUIDE_SECTIONS};
const clone = x => JSON.parse(JSON.stringify(x));
const known = (o,k) => typeof k==='string' && Object.hasOwn(o,k);
const fail = (code,message) => {throw Object.assign(new Error(message),{code});};
const need = (ok,code,message) => {if(!ok) fail(code,message);};
const pad = n => String(n).padStart(4,'0');
const importProvenance = g => g.importProvenance || (g.imported ? 'legacy-unknown' : 'none');
const importLabel = g => importProvenance(g)==='manual-file'?'yes — explicit progress-file import (selected file or pasted backup content)':importProvenance(g)==='none'?'no':'unknown — an older build did not distinguish automatic restore from manual import';
const active = g => g.attempts[g.activeAttemptId];
const role = (a,id) => Object.values(a.devices).find(d=>d.roleId===id);
const terms = () => ({version:'economy.consultation.pilot.001@0.3',missionVersion:BUILD_VERSION,gross:120,credits:5,minutes:3,creditCap:15,minuteCap:9});
const int = n => Number.isInteger(n)&&n>=0;
const UPLINK_FIXTURE='fixture.bootcamp.transfer.uplink.002';
const CLINIC_PRACTICE_FIXTURE='fixture.clinic.full-practice.001';
const GUIDED_FIXTURE='fixture.guided.connection.001';
const GUIDED_LESSON='lesson.connection.001';
const UPLINK_FAULT='fault.ap.unplugged-uplink';
// Only the frozen 0.3 delivery validator can enable the historical location rule.
// A parsed save cannot supply this Symbol; every current/public evaluation uses clinic-only links.
const LEGACY_SPATIAL_MODEL=Symbol('historical-clinic-spatial-model');
const inClinic=d=>!!d&&['location.reception','location.exam-a','location.exam-b','location.equipment'].includes(d.locationId);
const isUplinkTransfer=a=>a.fixtureId===UPLINK_FIXTURE;
const isGuided=a=>a.fixtureId===GUIDED_FIXTURE;
const trainingKind=a=>a.mode!=='training'?null:isGuided(a)?'guided-connection':a.training.stage==='clinic-practice'?'clinic-practice':a.training.stage==='replay'?'delivery-replay':'bootcamp';
const transferKind=a=>trainingKind(a)==='bootcamp'&&a.training.stationIndex===1&&a.training.stage==='transfer'?(isUplinkTransfer(a)?'physical-uplink':'legacy-address'):null;
export function parseIPv4(s) {
 if(typeof s!=='string'||!/^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/.test(s)) return null;
 const p=s.split('.').map(Number); if(p.some(n=>n>255)) return null;
 return p.reduce((v,n)=>(v*256+n)>>>0,0)>>>0;
}
export function maskPrefix(mask) {
 const n=parseIPv4(mask); if(n===null) return null;
 let seenZero=false,p=0;
 for(let b=31;b>=0;b--){if((n>>>b)&1){if(seenZero)return null;p++;}else seenZero=true;}
 return p;
}
const sameNetwork=(a,b,mask)=>((parseIPv4(a)&parseIPv4(mask))>>>0)===((parseIPv4(b)&parseIPv4(mask))>>>0);
function netFor(mode,transfer=false){
 const base=mode==='client'?'10.40.10':transfer?'192.168.70':'192.168.50';
 return {cidr:base+'.0/24',mask:'255.255.255.0',serverAddress:base+'.10',receptionAddress:base+'.20',inheritedNurseAddress:mode==='client'?'10.40.20.30':'192.168.60.20',base};
}
function event(g,a,type,payload={},origin='player'){
 a.sequence++; const e={id:`${a.id}.event.${pad(a.sequence)}`,sequence:a.sequence,type,origin,technicalRevision:a.technicalRevision,evidenceRevision:a.evidenceRevision,payload:clone(payload)};
 a.events.push(e); if(a.events.length>400){const pinned=evidenceEventIds(a);let remove=a.events.length-400;a.events=a.events.filter(x=>{if(remove>0&&!pinned.has(x.id)){remove--;return false;}return true;});a.historyCompacted=true;} return e;
}
function evidenceEventIds(a){
 const ids=[a.fault.seedEventId,a.spatialModelUpdate?.eventId,...a.observations.map(o=>o.eventId)];
 if(a.guidedConnection){const c=a.guidedConnection;ids.push(...c.setupEventIds,c.startEventId,c.firstConnection?.eventId,c.disconnection?.eventId,c.finishedEventId,c.exitEventId);const p=guidedEvidence(a);ids.push(p.reconnection?.eventId,p.repairEvent?.id,p.explanation.eventId);for(const d of Object.values(c.setup.devices))ids.push(a.events.find(e=>e.type==='CHOOSE_DEVICE'&&e.payload.deviceId===d.id)?.id);}
 if(a.fault.uplink){ids.push(a.fault.uplink.seed.eventId,...a.fault.uplink.reconnections.map(r=>r.eventId));const endpoints=new Set([a.fault.uplink.seed,...a.fault.uplink.reconnections].flatMap(c=>[c.fromDeviceId,c.toDeviceId]));for(const e of a.events)if(e.type==='CHOOSE_DEVICE'&&endpoints.has(e.payload?.deviceId))ids.push(e.id);const explanation=[...a.events].reverse().find(e=>e.type==='SAVE_EXPLANATION'&&e.origin==='player'&&e.payload?.key==='repair');if(explanation)ids.push(explanation.id);}
 return new Set(ids.filter(Boolean));
}
function message(a,templateId,speaker,text,observations=[],kind='request'){
 if(a.messages.some(m=>m.templateId===templateId))return;
 a.messages.push({id:`${a.id}.message.${pad(a.messages.length+1)}`,templateId,speaker,text,kind,observationIds:observations.map(o=>o.id),revision:observations.length?a.technicalRevision:null,read:false});
}
function bump(a){a.technicalRevision++;}
function getDevice(a,id){const d=a.devices[id];need(d,'DEVICE_UNKNOWN','Choose an existing device.');return d;}
function ports(d){
 const def=CATALOG[d.kind]; const r=[];
 for(let i=1;i<=def.ethernet;i++)r.push({id:`${d.id}.eth${i}`,label:def.ethernet>1?`Ethernet ${i}`:'Ethernet',medium:'ethernet'});
 if(d.attachments.includes('ethernet-adapter'))r.push({id:`${d.id}.adapter.eth1`,label:'Adapter Ethernet',medium:'ethernet'});
 if(def.wifi)r.push({id:`${d.id}.wifi0`,label:def.id==='access-point'?'Wi-Fi radio':'Wi-Fi',medium:'wifi'});
 return r;
}
function port(a,deviceId,portId){return ports(getDevice(a,deviceId)).find(p=>p.id===portId);}
function addDevice(g,a,roleId,kind,origin='player'){
 need(known(ROLES,roleId)&&known(CATALOG,kind),'DEVICE_UNKNOWN','Choose an available equipment role and device.');
 need(ROLES[roleId].choices.includes(kind),'DEVICE_NOT_OFFERED','That device is not offered for this job.');
 const previous=role(a,roleId);if(previous)removeDevice(a,previous.id);
 a.deviceSequence++; const id=`${a.id}.device.${pad(a.deviceSequence)}`;
 const defaultIp=roleId==='role.records'?a.network.serverAddress:roleId==='role.reception'?a.network.receptionAddress:roleId==='role.nurse'?(a.fault.seeded?a.fault.lastAddress:a.network.inheritedNurseAddress):'';
 const d={id,kind,roleId,locationId:ROLES[roleId].location,powered:false,address:defaultIp,mask:a.network.mask,attachments:[],wifiApId:null};a.devices[id]=d;
 if(roleId==='role.nurse'&&!a.fault.seeded){a.fault.seeded=true;a.fault.initialAddress=defaultIp;a.fault.lastAddress=defaultIp;a.fault.seedDeviceId=id;a.fault.seedEventId=`${a.id}.event.${pad(a.sequence+1)}`;}
 bump(a);event(g,a,'CHOOSE_DEVICE',{deviceId:id,roleId,kind,replacedDeviceId:previous?.id||null},origin);return d;
}
function removeDevice(a,id){
 a.cables=a.cables.filter(c=>c.fromDeviceId!==id&&c.toDeviceId!==id);
 Object.values(a.devices).forEach(d=>{if(d.wifiApId===id)d.wifiApId=null;});
 delete a.devices[id];
}
function newAttempt(g,mode,{stationIndex=0,stage='practice',fixtureNetwork=null,provenance=null,legacyAddressTransfer=false}={}){
 g.attemptSequence++;const id=`attempt.${pad(g.attemptSequence)}`;
 const uplink=mode==='training'&&stationIndex===1&&stage==='transfer'&&!legacyAddressTransfer,clinicPractice=mode==='training'&&stage==='clinic-practice';
 const network=fixtureNetwork||netFor(mode==='client'||clinicPractice?'client':'training',stage==='transfer');
 if(uplink)network.inheritedNurseAddress=network.base+'.30';
 const a={id,mode,testSuiteVersion:2,spatialModelVersion:2,fixtureId:mode==='client'?'fixture.clinic.local.001':clinicPractice?CLINIC_PRACTICE_FIXTURE:uplink?UPLINK_FIXTURE:stage==='transfer'?'fixture.bootcamp.transfer.001':'fixture.bootcamp.local.001',network,technicalRevision:0,evidenceRevision:0,sequence:0,deviceSequence:0,cableSequence:0,observationSequence:0,devices:{},cables:[],serverEnabled:false,policyId:'policy.roles-separated',policyRevision:0,observations:[],events:[],messages:[],hints:{},freeGuideGrants:[],fault:{id:uplink?UPLINK_FAULT:'fault.nurse.legacy-address',seeded:false,initialAddress:null,lastAddress:null,seedDeviceId:null,seedEventId:null,changes:[],baselineFailures:[]},wearable:{collected:[],handedOff:[],receipts:[],returned:false,companionDeviceId:null},explanations:Object.fromEntries(EXPLANATION_KEYS.map(k=>[k,{text:'',oral:false,contextRevision:0}])),training:{stationIndex,stage,isDemo:false,practiceActions:[],demoSteps:[],provenance},historyCompacted:false};
 g.attempts[id]=a;g.activeAttemptId=id;return a;
}
function cableBetween(a,from,to,switchPort=1){
 return {type:'CONNECT_PORTS',fromDeviceId:from.id,fromPortId:ports(from).find(p=>p.medium==='ethernet').id,toDeviceId:to.id,toPortId:ports(to).filter(p=>p.medium==='ethernet')[switchPort-1].id};
}
function setupTraining(g,a){
 const ap=(action)=>mutate(g,a,action,'mission-setup');
 const add=(r,k)=>{ap({type:'CHOOSE_DEVICE',roleId:r,kind:k});const d=role(a,r);ap({type:'POWER_DEVICE',deviceId:d.id,on:true});return d;};
 const server=add('role.records','server'),sw=add('infra.switch','switch4');ap({type:'SET_SERVICE_STATE',enabled:true});
 if(a.training.stationIndex===0)return;
 const reception=add('role.reception','desktop'),nurse=add('role.nurse','tablet'),wireless=add('infra.ap','access-point');
 add('role.monitor','wearable');
 ap(cableBetween(a,server,sw,1));ap(cableBetween(a,reception,sw,2));ap(cableBetween(a,wireless,sw,3));ap({type:'ASSOCIATE_WIFI',deviceId:nurse.id,apDeviceId:wireless.id});
 if(isUplinkTransfer(a)){
  const cable=a.cables.find(c=>c.fromDeviceId===wireless.id||c.toDeviceId===wireless.id);
  ap({type:'DISCONNECT_CABLE',cableId:cable.id});
  a.fault.uplink={seed:{...clone(cable),eventId:a.events.at(-1).id,technicalRevision:a.technicalRevision,origin:'mission-setup'},reconnections:[]};
 }
 if(a.training.stationIndex===2){ap({type:'SET_STATIC_ADDRESS',deviceId:nurse.id,address:a.network.base+'.30',mask:a.network.mask});ap({type:'SET_PERMISSIONS',policyId:a.training.stage==='transfer'?'policy.deny-all':'policy.broad-access'});}
 a.training.practiceActions=[];
}
export function createGame(options={}){
 const random=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
 const g={schemaVersion:SCHEMA_VERSION,buildVersion:BUILD_VERSION,campaignId:options.campaignId||`campaign.${random()}`,revision:0,attemptSequence:0,activeAttemptId:null,attempts:{},training:{completed:[],history:[],priorLearning:false},contract:null,wallet:0,settlements:[],imported:false,importProvenance:'none'};
 if(options.guidedIntro===true)startGuidedConnection(g,null,'mission-setup');else{const a=newAttempt(g,'training');setupTraining(g,a);}return g;
}
// Guided preparation uses the same mutations and probes as independent work.
// A small set of network witnesses lets save validation recompute historical lesson claims.
function networkWitness(a,o=null){return {observationId:o?.id||null,technicalRevision:a.technicalRevision,devices:clone(a.devices),cables:clone(a.cables),serverEnabled:a.serverEnabled,policyId:a.policyId};}
function startGuidedConnection(g,returnAttemptId=null,origin='player'){
 const a=newAttempt(g,'training',{stage:'guided-connection'});a.fixtureId=GUIDED_FIXTURE;
 const ap=action=>mutate(g,a,action,'mission-setup');
 const add=(roleId,kind)=>{ap({type:'CHOOSE_DEVICE',roleId,kind});const d=role(a,roleId);ap({type:'POWER_DEVICE',deviceId:d.id,on:true});return d;};
 const server=add('role.records','server'),sw=add('infra.switch','switch4');ap({type:'SET_SERVICE_STATE',enabled:true});add('role.reception','desktop');ap(cableBetween(a,server,sw,1));
 const setupEventIds=a.events.map(e=>e.id),setup=networkWitness(a);
 a.guidedConnection={lessonId:GUIDED_LESSON,returnAttemptId,setup,setupEventIds,firstConnection:null,firstPassId:null,firstPassWitness:null,beforeExperimentPassId:null,beforeExperimentWitness:null,disconnection:null,experimentObservationId:null,experimentWitness:null,explanationObservationId:null,explanationWitness:null,finishedEventId:null,exitEventId:null,startEventId:null};
 const start=event(g,a,'START_GUIDED_CONNECTION',{lessonId:GUIDED_LESSON,returnAttemptId,trainerSupplied:true},origin);a.guidedConnection.startEventId=start.id;a.training.practiceActions=[];
 return a;
}
const observationById=(a,id)=>a.observations.find(o=>o.id===id)||null;
const cableEvent=(a,id)=>a.events.find(e=>e.type==='CONNECT_PORTS'&&e.origin==='player'&&e.payload.id===id);
function recordGuidedProbe(a,o){
 const c=a.guidedConnection;if(!c||a.training.isDemo||o.origin!=='player'||o.testId!=='reception')return;
 if(!c.firstPassId&&o.pass){const connection=o.pathIds.map(id=>cableEvent(a,id)).find(Boolean);if(connection){c.firstPassId=o.id;c.firstPassWitness=networkWitness(a,o);c.firstConnection={...clone(connection.payload),eventId:connection.id,technicalRevision:connection.technicalRevision,origin:'player'};}}
 if(c.disconnection&&!c.experimentObservationId&&o.testedTechnicalRevision===c.disconnection.technicalRevision){c.experimentObservationId=o.id;c.experimentWitness=networkWitness(a,o);}
}
function recordGuidedDisconnection(a,cable,priorObservation,e){
 const c=a.guidedConnection;
 if(!c||c.experimentObservationId||!c.firstPassId||!priorObservation?.pass||priorObservation.origin!=='player'||!priorObservation.pathIds.includes(cable.id))return;
 // The witness is the exact state before this disconnection, reconstructed by restoring its cable.
 c.beforeExperimentPassId=priorObservation.id;c.beforeExperimentWitness=networkWitness({...a,technicalRevision:priorObservation.testedTechnicalRevision,cables:[...a.cables,clone(cable)]},priorObservation);
 // Preserve cable order because the simulator's deterministic path follows that order.
 c.beforeExperimentWitness.cables.sort((x,y)=>Number(x.id.split('.').at(-1))-Number(y.id.split('.').at(-1)));
 c.disconnection={...clone(cable),eventId:e.id,technicalRevision:a.technicalRevision,origin:'player'};
}
function guidedEvidence(a){
 if(!isGuided(a)||!a.guidedConnection)return null;
 const c=a.guidedConnection,firstPass=observationById(a,c.firstPassId),experimentObservation=observationById(a,c.experimentObservationId),currentObservation=lastAtCurrent(a,'reception')||null;
 const experimentOutcome=!experimentObservation?null:experimentObservation.pass?'alternate-path':experimentObservation.code==='PORT_DISCONNECTED'?'missing-path':'other-failure';
 const reconnectEvents=experimentObservation?a.events.filter(e=>e.origin==='player'&&e.type==='CONNECT_PORTS'&&e.sequence>Number(experimentObservation.eventId.split('.').at(-1))):[];
 const reconnection=currentObservation?.pass?[...reconnectEvents].reverse().find(e=>currentObservation.pathIds.includes(e.payload.id))||null:null;
 const repairEvent=experimentObservation?[...a.events].reverse().find(e=>e.origin==='player'&&e.technicalRevision>experimentObservation.testedTechnicalRevision&&['CONNECT_PORTS','DISCONNECT_CABLE','CHOOSE_DEVICE','REMOVE_DEVICE','POWER_DEVICE','PLACE_DEVICE','MOVE_NURSE','ATTACH_ADAPTER','DETACH_ADAPTER','ASSOCIATE_WIFI','SET_STATIC_ADDRESS','SET_SERVICE_STATE','SET_PERMISSIONS'].includes(e.type)&&e.technicalRevision<=a.technicalRevision):null;
 const passingRetest=currentObservation?.origin==='player'&&currentObservation.pass&&experimentObservation&&Number(currentObservation.eventId.split('.').at(-1))>=Number(experimentObservation.eventId.split('.').at(-1))&&(experimentObservation.pass||experimentOutcome==='missing-path'?experimentObservation.pass||!!reconnection:!!repairEvent)?currentObservation:null;
 const saved=[...a.events].reverse().find(e=>e.type==='SAVE_EXPLANATION'&&e.origin==='player'&&e.payload.key==='repair');
 const explanation={key:'repair',...clone(a.explanations.repair),submitted:!!saved,eventId:saved?.id||null,review:'pending-teacher'};
 const explainedObservation=observationById(a,c.explanationObservationId);
 const explained=!!(saved&&passingRetest&&explainedObservation?.pass&&explainedObservation.testedTechnicalRevision===a.technicalRevision&&saved.technicalRevision===a.technicalRevision&&saved.sequence>Number(explainedObservation.eventId.split('.').at(-1))&&(explanation.text.trim()||explanation.oral));
 const checks=[{label:'Connect available ports and observe a passing booking test',met:!!firstPass},{label:'Disconnect a tested path cable and observe the actual result',met:!!experimentObservation},{label:experimentOutcome==='alternate-path'?'Confirm the remaining route with a current passing test':'Restore service and run a current passing retest',met:!!passingRetest},{label:'Explain the observed change or arrange teacher conversation',met:explained}];
 const canFinish=!a.training.isDemo&&checks.every(x=>x.met);
 const hasPlayerCable=a.cables.some(x=>!!cableEvent(a,x.id)),afterExperimentConnection=!!(experimentObservation&&reconnectEvents.some(e=>a.cables.some(x=>x.id===e.payload.id)));
 let phase='connect';
 if(!firstPass)phase=hasPlayerCable?'test':'connect';
 else if(!c.disconnection)phase=currentObservation?.pass?'experiment':currentObservation&&!currentObservation.pass?'repair':'retest';
 else if(!experimentObservation)phase=a.technicalRevision===c.disconnection.technicalRevision?'test-disconnected':currentObservation?.pass?'experiment':currentObservation&&!currentObservation.pass?'repair':'retest';
 else if(passingRetest)phase=canFinish?'complete':'reflect';
 else phase=currentObservation&&!currentObservation.pass?'repair':afterExperimentConnection?'retest':'repair';
 const path=currentObservation?.pass?currentObservation.pathIds:[];
 const candidate=a.cables.filter(cable=>path.includes(cable.id));
 const reception=role(a,'role.reception'),suggested=candidate.find(x=>x.fromDeviceId===reception?.id||x.toDeviceId===reception?.id)||candidate[0];
 return {lessonId:GUIDED_LESSON,phase,canFinish,checks,receptionDeviceId:reception?.id||null,switchDeviceId:role(a,'infra.switch')?.id||null,serverDeviceId:role(a,'role.records')?.id||null,suggestedDisconnectCableId:suggested?.id||null,firstPass:clone(firstPass),firstConnection:clone(c.firstConnection),disconnection:clone(c.disconnection),experimentObservation:clone(experimentObservation),currentObservation:clone(currentObservation),experimentOutcome,reconnection:reconnection?{...clone(reconnection.payload),eventId:reconnection.id,technicalRevision:reconnection.technicalRevision,origin:'player'}:null,repairEvent:clone(repairEvent||null),passingRetest:clone(passingRetest||null),explanation,returnAttemptId:c.returnAttemptId,finished:!!c.finishedEventId,trainerSupplied:true,independentMastery:false};
}
function leaveGuidedConnection(g,finish){
 const a=active(g);need(isGuided(a),'GUIDED_ONLY','Open the guided connection lesson first.');
 const proof=guidedEvidence(a);if(finish)need(proof.canFinish,'GUIDED_INCOMPLETE','Connect, test, observe the cable experiment, restore or confirm a working path, and record your explanation before continuing.');
 const returnAttemptId=a.guidedConnection.returnAttemptId;
 if(returnAttemptId)need(known(g.attempts,returnAttemptId)&&!isGuided(g.attempts[returnAttemptId]),'GUIDED_RETURN_MISSING','The saved return attempt is unavailable. Your current work is unchanged.');
 let destination=returnAttemptId;
 if(!destination){const next=newAttempt(g,'training',{provenance:{route:finish?'after-guided-connection':'guided-connection-skipped',sourceGuidedAttemptId:a.id}});setupTraining(g,next);destination=next.id;}else g.activeAttemptId=destination;
 a.evidenceRevision++;const e=event(g,a,finish?'FINISH_GUIDED_CONNECTION':'RETURN_FROM_GUIDED_CONNECTION',{lessonId:GUIDED_LESSON,destinationAttemptId:destination,returnedToSavedWork:!!returnAttemptId,independentMastery:false},'player');
 a.guidedConnection.returnAttemptId=null;a.guidedConnection.exitEventId=e.id;
 if(finish){a.guidedConnection.finishedEventId=e.id;g.guidedConnectionHistory=[...(g.guidedConnectionHistory||[]).filter(id=>id!==a.id),a.id].slice(-4);}
}
function capabilityProblem(a,source,service){
 const d=source,def=d&&CATALOG[d.kind];
 if(!d)return ['DEVICE_MISSING','Choose equipment for this job.'];
 if(d.roleId==='role.nurse'&&(!def.portable||!def.capabilities.includes('sensor-companion')))return ['CAPABILITY_MISSING','The nurse needs a portable computer with Wi-Fi and sensor-companion support.'];
 if(d.roleId==='role.reception'&&(!def.capabilities.includes('text-input')||!def.capabilities.includes('booking-ui')))return ['CAPABILITY_MISSING','Reception needs screen, text input and booking software.'];
 const server=role(a,'role.records');if(!server)return ['DEVICE_MISSING','Choose a host for central records.'];
 if(!CATALOG[server.kind].capabilities.includes('server-host'))return ['CAPABILITY_MISSING','The records host must support the server role.'];
 if(!SERVICES.includes(service))return ['SERVICE_UNKNOWN','That service is not part of this mission.'];
 return null;
}
function adjacency(a){
 const graph=Object.fromEntries(Object.values(a.devices).filter(d=>d.powered).map(d=>[d.id,[]]));
 const edge=(x,y,id)=>{if(graph[x]&&graph[y]){graph[x].push({id:y,via:id});graph[y].push({id:x,via:id});}};
 for(const c of a.cables)if(port(a,c.fromDeviceId,c.fromPortId)&&port(a,c.toDeviceId,c.toPortId)&&(a[LEGACY_SPATIAL_MODEL]||(inClinic(a.devices[c.fromDeviceId])&&inClinic(a.devices[c.toDeviceId]))))edge(c.fromDeviceId,c.toDeviceId,c.id);
 for(const d of Object.values(a.devices))if(d.wifiApId&&['location.exam-a','location.exam-b'].includes(d.locationId)&&(a[LEGACY_SPATIAL_MODEL]||inClinic(a.devices[d.wifiApId])))edge(d.id,d.wifiApId,`${d.id}.wifi0`);
 return graph;
}
function physicalPath(a,src,dst,contextLocation=null){
 const source=contextLocation?{...src,locationId:contextLocation}:src;
 if(!source.powered||!dst.powered)return {code:'DEVICE_OFF',message:!source.powered?'The source device is powered off.':'The central records host is powered off.',pathIds:[]};
 const isNurse=source.roleId==='role.nurse';
 if(isNurse){
  if(!CATALOG[source.kind].wifi)return {code:'CAPABILITY_MISSING',message:'This nurse device has no Wi-Fi interface.',pathIds:[]};
  if(!['location.exam-a','location.exam-b'].includes(source.locationId))return {code:'OUTSIDE_COVERAGE',message:'The nurse is outside the modelled clinic Wi-Fi coverage.',pathIds:[]};
  const ap=a.devices[source.wifiApId];if(!ap)return {code:'WIFI_NOT_ASSOCIATED',message:'Join the nurse device to the clinic access point.',pathIds:[]};
  if(!ap.powered)return {code:'AP_OFF',message:'The associated access point is powered off.',pathIds:[]};
  if(!a[LEGACY_SPATIAL_MODEL]&&!inClinic(ap))return {code:'OUTSIDE_COVERAGE',message:'The access point is at the off-site home location. Its radio cannot cover the clinic rooms from there.',pathIds:[]};
 }
 if(!a[LEGACY_SPATIAL_MODEL]&&(!inClinic(source)||!inClinic(dst)))return {code:'OUTSIDE_CLINIC',message:!inClinic(source)?'The source device is outside the clinic. Retained cable endpoints do not provide an off-site Ethernet service.':'The records host is outside the clinic. The home site is offline; a retained cable does not connect it to the clinic.',pathIds:[]};
 // Nurse uses its associated radio; general computers do not forward other devices' traffic.
 const overlay=contextLocation?{...a,devices:{...a.devices,[source.id]:source}}:a,graph=adjacency(overlay);
 if(isNurse)graph[source.id]=(graph[source.id]||[]).filter(e=>e.id===source.wifiApId);
 const queue=[{id:source.id,path:[source.id]}],visited=new Set();
 while(queue.length){const q=queue.shift();if(q.id===dst.id)return {code:'LINK_AVAILABLE',message:'A powered local path is available.',pathIds:q.path};if(visited.has(q.id))continue;visited.add(q.id);if(q.id!==source.id&&!CATALOG[a.devices[q.id].kind].capabilities.includes('bridge'))continue;for(const e of graph[q.id]||[])queue.push({id:e.id,path:[...q.path,e.via,e.id]});}
 const sw=role(a,'infra.switch');if(sw&&!sw.powered)return {code:'SWITCH_OFF',message:'The local switch is powered off.',pathIds:[]};
 if(sw&&!a[LEGACY_SPATIAL_MODEL]&&!inClinic(sw))return {code:'OUTSIDE_CLINIC',message:'The switch is outside the clinic. Modelled Ethernet links operate only between devices at clinic locations.',pathIds:[]};
 return {code:'PORT_DISCONNECTED',message:isNurse?'Wi-Fi association exists, but the powered Ethernet path from the access point to the server is incomplete.':'The powered Ethernet path to the central host is incomplete. Check cable endpoints and adapters.',pathIds:[]};
}
function addressProblem(a,source,server){
 for(const d of [source,server]){
  const ip=parseIPv4(d.address),prefix=maskPrefix(d.mask),mask=parseIPv4(d.mask);
  if(ip===null||prefix===null||prefix<1||prefix>30)return ['ADDRESS_INVALID',`${ROLES[d.roleId].label} needs a valid IPv4 host address and contiguous mask (/1 to /30).`];
  const network=(ip&mask)>>>0,broadcast=(network|(~mask>>>0))>>>0;
  if(ip===network||ip===broadcast)return ['ADDRESS_RESERVED',`${d.address} is a network or broadcast address under ${d.mask}; choose a host address.`];
  if(!sameNetwork(d.address,a.network.serverAddress,a.network.mask))return ['ADDRESS_WRONG_SUBNET',`${ROLES[d.roleId].label} uses ${d.address}; this job uses ${a.network.cidr}.`];
 }
 if(!sameNetwork(source.address,server.address,source.mask)||!sameNetwork(server.address,source.address,server.mask))return ['ADDRESS_OFF_LINK','The two interface masks do not both place the peer on-link. No routing service is modelled.'];
 for(const d of [source,server]){
  const duplicate=Object.values(a.devices).find(other=>other.id!==d.id&&other.powered&&other.address===d.address&&physicalPath(a,d,other).code==='LINK_AVAILABLE');
  if(duplicate)return ['ADDRESS_DUPLICATE',`${d.address} is also active on ${ROLES[duplicate.roleId].label}. Every active interface on this LAN needs its own address.`];
 }
 return null;
}
function evaluate(a,{testId,label,sourceRoleId,serviceId,actorRoleId,contextLocationId=null,expect='allow'}){
 if(expect==='booking-policy')expect=a.policyId==='policy.roles-separated'?'deny':'allow';
 const source=role(a,sourceRoleId),server=role(a,'role.records');
 const o={testId,label,sourceDeviceId:source?.id||null,serviceId,actorRoleId,contextLocationId,code:null,message:'',pass:false,expectedDenied:expect==='deny',pathIds:[]};
 const cap=capabilityProblem(a,source,serviceId);if(cap)return {...o,code:cap[0],message:cap[1]};
 const path=physicalPath(a,source,server,contextLocationId);if(path.code!=='LINK_AVAILABLE')return {...o,...path};
 const address=addressProblem(a,source,server);if(address)return {...o,code:address[0],message:address[1],pathIds:path.pathIds};
 if(!a.serverEnabled)return {...o,code:'SERVICE_UNAVAILABLE',message:'The host is reachable, but its shared services are turned off.',pathIds:path.pathIds};
 const allowed=POLICIES[a.policyId].matrix[actorRoleId]?.includes(serviceId)||false;
 return {...o,code:allowed?'SERVICE_AVAILABLE':'ACCESS_DENIED',message:allowed?(expect==='deny'?'The path works, but this role has access that the client requires restricted.':'The local service is reachable and this role has permission.'):(expect==='deny'?'The path and service work; the policy denies this role as required.':'The path and service work, but this role is denied the required task.'),pass:expect==='deny'?!allowed:allowed,pathIds:path.pathIds};
}
function specifications(testId,suiteVersion=2){
 const s=(id,label,src,svc,actor,expect='allow',loc=null)=>({testId:id,label,sourceRoleId:src,serviceId:svc,actorRoleId:actor,expect,contextLocationId:loc});
 const reception=[s('reception','Reception bookings','role.reception','service.bookings','role.reception')];
 const nurse=[s('nurse','Nurse workspace','role.nurse','service.workspace','role.nurse')];
 const mobility=[s('nurse-room-a','Nurse workspace · room A','role.nurse','service.workspace','role.nurse','allow','location.exam-a'),s('nurse-room-b','Nurse workspace · room B','role.nurse','service.workspace','role.nurse','allow','location.exam-b')];
 const access=[s('access-reception','Reception cannot browse clinical workspace','role.reception','service.workspace','role.reception','deny'),s('access-outsider-bookings','Outside role cannot use bookings','role.reception','service.bookings','role.outsider','deny'),s('access-outsider-workspace','Outside role cannot browse workspace','role.reception','service.workspace','role.outsider','deny'),s('access-transfer','Transfer role cannot browse workspace','role.nurse','service.workspace','role.monitor-transfer','deny')];
 const upload=[s('upload','Submit-only marker intake','role.nurse','service.marker-intake','role.monitor-transfer')];
 const nurseBookings=[s('nurse-bookings','Nurse follow-up bookings','role.nurse','service.bookings','role.nurse','booking-policy')];
 const bookingChecks=suiteVersion>=2?nurseBookings:[];
 const all=[...reception,...nurse,...mobility,...bookingChecks,...access,...upload];
 return {reception,nurse,'nurse-bookings':nurseBookings,access:[...reception,...nurse,...bookingChecks,...access,...upload],upload,all}[testId]||null;
}
function recordProbe(g,a,spec,origin='player'){
 const o=evaluate(a,spec);a.observationSequence++;o.id=`${a.id}.observation.${pad(a.observationSequence)}`;o.testedTechnicalRevision=a.technicalRevision;o.origin=spec.contextLocationId?'engine-check':origin;o.eventId=`${a.id}.event.${pad(a.sequence+1)}`;a.observations.push(o);if(a.observations.length>180){const pinned=new Set([...a.messages.flatMap(m=>m.observationIds),...a.fault.baselineFailures.map(f=>f.id),...(a.guidedConnection?[a.guidedConnection.firstPassId,a.guidedConnection.beforeExperimentPassId,a.guidedConnection.experimentObservationId,a.guidedConnection.explanationObservationId]:[])]);const removable=a.observations.filter(x=>!pinned.has(x.id));const removeIds=new Set(removable.slice(0,a.observations.length-180).map(x=>x.id));a.observations=a.observations.filter(x=>!removeIds.has(x.id));a.historyCompacted=true;}
 event(g,a,'RUN_PROBE',{observationId:o.id,testId:o.testId,code:o.code,pass:o.pass},o.origin);
 recordGuidedProbe(a,o);
 const ap=role(a,'infra.ap'),sw=role(a,'infra.switch'),server=role(a,'role.records');
 const missingUplink=isUplinkTransfer(a)&&a.fault.uplink&&ap&&sw&&server&&!a.cables.some(c=>c.fromDeviceId===ap.id||c.toDeviceId===ap.id)&&physicalPath(a,sw,server).code==='LINK_AVAILABLE';
 const baselineCode=isUplinkTransfer(a)?o.code==='PORT_DISCONNECTED'&&missingUplink:['ADDRESS_WRONG_SUBNET','ADDRESS_OFF_LINK','ADDRESS_DUPLICATE'].includes(o.code);
 if(o.origin==='player'&&o.testId==='nurse'&&baselineCode&&a.fault.baselineFailures.length<8)a.fault.baselineFailures.push({id:o.id,code:o.code,technicalRevision:a.technicalRevision,address:role(a,'role.nurse')?.address});
 if(a.mode==='client'&&o.testId==='nurse'&&o.code==='ADDRESS_WRONG_SUBNET')message(a,'phone.clinic.nurse-symptom.001','Mina · Nurse','The Wi-Fi path is present, but my workspace test reports an address outside the clinic range. Can you investigate the saved settings?',[o],'observation');
 return o;
}
function currentSuite(a){return specifications('all',a.testSuiteVersion||1).map(s=>evaluate(a,s));}
function lastAtCurrent(a,id){return [...a.observations].reverse().find(o=>o.testId===id&&o.testedTechnicalRevision===a.technicalRevision);}
function uplinkEvidence(a){
 if(!isUplinkTransfer(a)||!a.fault.uplink)return null;
 const reconnection=[...a.fault.uplink.reconnections].reverse().find(r=>a.fault.baselineFailures.some(f=>f.id===r.baselineObservationId))||null;
 const baselineId=reconnection?.baselineObservationId||a.fault.baselineFailures.at(-1)?.id;
 const observedFailure=a.observations.find(o=>o.id===baselineId)||null;
 const latest=lastAtCurrent(a,'nurse');
 const passingRetest=reconnection&&latest?.origin==='player'&&latest.pass&&latest.testedTechnicalRevision>=reconnection.technicalRevision&&latest.pathIds.includes(reconnection.id)?latest:null;
 const saved=[...a.events].reverse().find(e=>e.type==='SAVE_EXPLANATION'&&e.origin==='player'&&e.payload?.key==='repair');
 const explanation={key:'repair',...clone(a.explanations.repair),submitted:!!saved,eventId:saved?.id||null,review:'pending-teacher'};
 const explained=explanation.submitted&&!!(explanation.text.trim()||explanation.oral);
 return {kind:'physical-uplink',faultId:UPLINK_FAULT,seededDisconnection:clone(a.fault.uplink.seed),observedFailure:clone(observedFailure),reconnection:clone(reconnection),passingRetest:clone(passingRetest),explanation,readyForTeacherReview:!a.training.isDemo&&!!(observedFailure&&reconnection&&passingRetest&&explained)};
}
function equipmentChecks(a){
 const r=role(a,'role.reception'),n=role(a,'role.nurse'),w=role(a,'role.monitor'),s=role(a,'role.records'),sw=role(a,'infra.switch'),ap=role(a,'infra.ap');
 return !!(r&&['desktop','laptop','tablet'].includes(r.kind)&&n&&CATALOG[n.kind].capabilities.includes('sensor-companion')&&w?.kind==='wearable'&&s&&CATALOG[s.kind].capabilities.includes('server-host')&&sw&&CATALOG[sw.kind].ethernet>=3&&ap?.kind==='access-point');
}
function repaired(a){if(isUplinkTransfer(a))return !!uplinkEvidence(a)?.passingRetest;const n=role(a,'role.nurse');return !!(n&&a.fault.seeded&&a.fault.changes.some(c=>c.origin==='player')&&n.address!==a.fault.initialAddress&&evaluate(a,specifications('nurse')[0]).pass);}
function objectives(a){
 if(isGuided(a))return guidedEvidence(a).checks.map((c,i)=>({id:'objective.guided.connection.'+(i+1),...c,detail:'Guided evidence for teacher review; trainer setup is not an independent equipment choice.'}));
 const suite=currentSuite(a),fresh=specifications('all',a.testSuiteVersion||1).every(s=>lastAtCurrent(a,s.testId)?.pass),privacyFresh=a.explanations.privacy.contextRevision===a.policyRevision;
 return [
 {id:'objective.equipment',label:'Equip all four jobs and the network',met:equipmentChecks(a),detail:'Reception, mobile nurse, wearable, records host, switch and access point need suitable capabilities.'},
 {id:'objective.services',label:'Restore bookings and workspace in both rooms',met:suite.filter(o=>['reception','nurse','nurse-room-a','nurse-room-b'].includes(o.testId)).every(o=>o.pass)&&['location.exam-a','location.exam-b'].includes(role(a,'role.nurse')?.locationId),detail:'Powered links, correct unique addresses, services and required access must agree.'},
 {id:'objective.repair',label:isUplinkTransfer(a)?'Repair the unplugged access-point uplink':'Repair the inherited nurse address',met:repaired(a),detail:isUplinkTransfer(a)?'Observe the missing link, reconnect the access point to the switch and run a passing nurse test.':a.fault.baselineFailures.length?'Your recorded fault and retest support the repair.':'Early repair is allowed; the report will say no pre-repair player failure was observed.'},
 {id:'objective.markers',label:'Collect, return, transfer and upload seven markers',met:a.wearable.collected.length===7&&a.wearable.handedOff.length===7&&a.wearable.receipts.length===7&&suite.find(o=>o.testId==='upload').pass,detail:`${a.wearable.collected.length}/7 collected · ${a.wearable.handedOff.length}/7 handed off · ${a.wearable.receipts.length}/7 received. These are nonclinical test markers.`},
 {id:'objective.access',label:'Allow required work and restrict other roles',met:['policy.roles-separated','policy.nurse-also-books'].includes(a.policyId)&&suite.every(o=>o.pass),detail:'An expected denial counts only when the network and service are healthy.'},
 {id:'objective.tests',label:'Run a fresh complete test suite',met:fresh,detail:'All final checks must refer to the current technical revision. Handover runs this suite again.'},
 {id:'objective.reasoning',label:'Prepare four explanations or oral follow-up',met:EXPLANATION_KEYS.every(k=>a.explanations[k].text.trim()||a.explanations[k].oral)&&privacyFresh,detail:privacyFresh?'Your own explanations are preserved; their quality remains for teacher review.':'The access policy changed. Review your privacy explanation against the current policy.'}
 ];
}
function trainingStatus(a,g){
 const t=a.training,station=STATIONS[t.stationIndex]||STATIONS[2],actions=t.practiceActions,kind=trainingKind(a),transfer=transferKind(a),proof=uplinkEvidence(a);
 if(kind==='guided-connection'){const c=guidedEvidence(a);return {kind,stationIndex:0,stationId:GUIDED_LESSON,title:'Your first connection',phase:c.phase,goal:'Connect reception, test the booking service, then observe and explain a cable experiment.',canAdvance:c.canFinish,completed:!!c.finished,checks:c.checks,demoSteps:[],priorLearning:g.training.priorLearning,transferKind:null,transferEvidence:null};}
 if(kind==='clinic-practice'||kind==='delivery-replay')return {kind,stationIndex:t.stationIndex,stationId:kind==='clinic-practice'?'practice.clinic.full':'practice.clinic.delivery-replay',title:kind==='clinic-practice'?'Full-clinic practice':'Delivered clinic replay',phase:t.stage,goal:kind==='clinic-practice'?'Build, test and explain the whole clinic with free help. This practice earns no client fee.':'Inspect or change the delivered clinic in a separate free attempt. Its original client delivery remains unchanged.',canAdvance:false,completed:g.training.completed.length===3,checks:objectives(a).map(o=>({label:o.label,met:o.met})),demoSteps:[],priorLearning:g.training.priorLearning,transferKind:null,transferEvidence:null};
 let checks=[];
 const seen=x=>actions.includes(x);
 if(t.stationIndex===0)checks=[{label:'Choose equipment yourself',met:seen('CHOOSE_DEVICE')},{label:'Connect actual Ethernet ports',met:seen('CONNECT_PORTS')},{label:'Run a passing current booking test',met:!!lastAtCurrent(a,'reception')?.pass&&seen('RUN_PROBE')}];
 if(t.stationIndex===1)checks=[{label:'Record an address diagnostic before repair',met:a.fault.baselineFailures.length>0&&seen('RUN_PROBE')},{label:'Change the address yourself',met:seen('SET_STATIC_ADDRESS')},{label:'Retest the nurse successfully',met:!!lastAtCurrent(a,'nurse')?.pass&&seen('RUN_PROBE')}];
 if(proof)checks=[{label:'Observe the unplugged uplink with a nurse test',met:!!proof.observedFailure},{label:'Reconnect the access point to the switch yourself',met:!!proof.reconnection},{label:'Run a passing nurse retest through that cable',met:!!proof.passingRetest},{label:'Explain why changing an IP cannot repair a missing link (or arrange oral review)',met:proof.explanation.submitted&&!!(proof.explanation.text.trim()||proof.explanation.oral)}];
 if(t.stationIndex===2)checks=[{label:'Choose a responsible access policy',met:seen('SET_PERMISSIONS')&&['policy.roles-separated','policy.nurse-also-books'].includes(a.policyId)},{label:'Collect, return, dock and upload the seven markers',met:['RUN_COLLECTION_CHECK','RETURN_WEARABLE','HANDOFF_MARKERS','UPLOAD_MARKERS'].every(seen)&&a.wearable.receipts.length===7},{label:'Test required access and denial',met:specifications('access',a.testSuiteVersion||1).every(s=>lastAtCurrent(a,s.testId)?.pass)},{label:'Explain who benefits and what changes',met:seen('SAVE_EXPLANATION')&&!!(a.explanations.privacy.text.trim()||a.explanations.privacy.oral)&&a.explanations.privacy.contextRevision===a.policyRevision}];
 const completed=g.training.completed.length===3;
 return {kind,stationIndex:t.stationIndex,stationId:station.id,title:station.title,phase:t.isDemo?'demo':t.stage,goal:proof?'The nurse address is already valid. Observe the missing physical link, reconnect the access-point uplink, retest and explain why an IP change cannot restore a missing cable.':transfer==='legacy-address'?'Continue this saved address-transfer example using its original network card. This older checkpoint does not establish the new physical-link transfer.':station.goal,canAdvance:kind==='bootcamp'&&!t.isDemo&&t.stage!=='complete'&&checks.every(c=>c.met),completed,checks,demoSteps:t.demoSteps,priorLearning:g.training.priorLearning,transferKind:transfer,transferEvidence:proof};
}
function learningFocus(a,g){
 const t=trainingStatus(a,g),prefix=ids=>ids.map(id=>'cc.clinic.'+id);
 const focus=(stageId,title,ids,nextAction)=>({stageId,title,goalIds:prefix(ids),nextAction});
 if(t.kind==='guided-connection')return focus('guided.connection.'+t.phase,'Your first connection',['connection-choice','system-path'],t.checks.find(x=>!x.met)?.label||'Continue to independent practice or your saved work.');
 if(t.kind==='bootcamp'){
  if(t.phase==='complete')return focus('bootcamp.complete','Review your bootcamp evidence',['handover','diagnosis'],'Review the six practice checkpoints with your teacher, then choose a clinic attempt.');
  const next=t.phase==='demo'?'Inspect the trainer’s actions, then choose Try it yourself.':t.canAdvance?'Continue to the next practice example.':t.checks.find(c=>!c.met)?.label||t.goal;
  if(t.stationIndex===0)return focus('bootcamp.equipment','Choose equipment and build its path',['device-fit','connection-choice','system-path'],next);
  if(t.transferKind==='physical-uplink')return focus('bootcamp.uplink-transfer','Diagnose a different kind of fault',['system-path','connection-choice','diagnosis'],next);
  if(t.transferKind==='legacy-address')return focus('bootcamp.legacy-address-transfer','Continue the saved address example',['address','diagnosis'],next);
  if(t.stationIndex===1)return focus('bootcamp.address','Diagnose and repair an address',['address','diagnosis'],next);
  return focus('bootcamp.access','Connect access decisions and the marker journey',['access','stakeholders','data-journey'],next);
 }
 if(a.mode==='client'&&g.contract?.phase==='settled')return focus('clinic.settled','Review the delivered evidence',['handover','stakeholders'],'Review the frozen delivery and pending teacher conversations, or open a free replay.');
 if(a.mode==='client'&&g.contract?.phase==='delivered')return focus('clinic.delivered','Review the handover',['handover','stakeholders'],'Review any pending oral explanations and collect the frozen service fee when ready.');
 if(!equipmentChecks(a))return focus('clinic.equipment','Choose equipment for the clinic jobs',['device-fit','connection-choice','ipos'],'Choose a suitable device for every clinic role, plus a switch and an access point.');
 const suite=currentSuite(a),pathCodes=['DEVICE_MISSING','CAPABILITY_MISSING','DEVICE_OFF','AP_OFF','SWITCH_OFF','WIFI_NOT_ASSOCIATED','OUTSIDE_COVERAGE','OUTSIDE_CLINIC','PORT_DISCONNECTED'];
 if(suite.some(o=>pathCodes.includes(o.code))||!a.serverEnabled)return focus('clinic.connections','Build a powered path to the shared services',['system-path','connection-choice','diagnosis'],'Inspect clinic locations, power, adapters, cable endpoints, Wi-Fi association and the shared-service host and its services; run the relevant test.');
 if(suite.some(o=>o.code.startsWith('ADDRESS_'))||(t.kind!=='delivery-replay'&&!repaired(a)))return focus('clinic.address-repair','Investigate the inherited nurse setting',['address','diagnosis','system-path'],'Run the nurse test, compare its address and mask with the clinic card, apply a relevant correction and retest.');
 if(!['policy.roles-separated','policy.nurse-also-books'].includes(a.policyId)||suite.some(o=>!o.pass))return focus('clinic.access','Decide who can use each service',['access','stakeholders'],'Choose a responsible permission policy, then test both required work and expected denials.');
 if(a.wearable.collected.length!==7||a.wearable.handedOff.length!==7||a.wearable.receipts.length!==7)return focus('clinic.markers','Trace the offline-to-clinic marker journey',['data-journey','connection-choice','system-path'],a.wearable.collected.length!==7?'Collect the seven synthetic markers at home.':!a.wearable.returned?'Return the wearable to the clinic.':a.wearable.handedOff.length!==7?'Attach the nurse’s sensor dock and hand off the returned markers.':'Upload the markers through the nurse’s authorized network path.');
 if(!specifications('all',a.testSuiteVersion||1).every(s=>lastAtCurrent(a,s.testId)?.pass))return focus('clinic.verify','Test the completed clinic at its current revision',['diagnosis','system-path'],'Run the complete test suite and inspect every result, including expected access denials.');
 if(!objectives(a).find(o=>o.id==='objective.reasoning').met)return focus('clinic.handover','Explain your choices and their limits',['handover','stakeholders'],'Save your own equipment, repair, privacy and limitation explanations, or mark the specified items for oral teacher review.');
 if(t.kind==='clinic-practice')return focus('clinic.practice-review','Review your full-clinic practice',['handover','stakeholders'],'Export this free practice for teacher review, then resume the client or begin an eligible client attempt.');
 if(t.kind==='delivery-replay')return focus('clinic.replay-review','Review the free delivery replay',['handover','stakeholders'],'Compare your current checks with the preserved client delivery, or return to that contract.');
 return focus('clinic.handover','Prepare the clinic handover',['handover','stakeholders'],'Request handover to rerun the current checks and record the client delivery.');
}
function economy(g,a){
 const c=g.contract;if(!c||a.mode!=='client')return {gross:0,reserved:0,minutes:0,net:0,wallet:g.wallet,phase:'training',delivered:!!c?.delivery,settled:!!c?.settlement};
 const res=c.grants.reduce((s,x)=>s+x.credits,0),min=c.grants.reduce((s,x)=>s+x.minutes,0);
 return {gross:c.terms.gross,reserved:res,minutes:min,net:c.terms.gross-res,wallet:g.wallet,phase:c.phase,delivered:!!c.delivery,settled:!!c.settlement};
}
function quote(g,a,sectionId){
 const def=GUIDE_SECTIONS.find(s=>s.id===sectionId);if(!def)return null;const c=g.contract,fee=economy(g,a);
 const alreadyGranted=a.mode==='training'?a.freeGuideGrants.includes(sectionId):!!c?.grants.some(x=>x.sectionId===sectionId)||a.freeGuideGrants.includes(sectionId);
 let credits=0,minutes=0,freeReason='Training support is free.';
 if(a.mode==='client'&&c){if(c.phase!=='active')freeReason='Review after delivery is free.';else if(alreadyGranted)freeReason='This section is already included.';else{credits=Math.max(0,Math.min(c.terms.credits,c.terms.creditCap-fee.reserved));minutes=Math.max(0,Math.min(c.terms.minutes,c.terms.minuteCap-fee.minutes));freeReason=credits||minutes?'':'The consultation cap has been reached.';}}
 return {sectionId,label:def.label,quoteToken:`${g.campaignId}|${c?.id||a.id}|${c?.terms.version||'training'}|${c?.phase||'training'}|${c?.ledgerRevision||0}|${sectionId}|${credits}|${minutes}`,credits,minutes,alreadyGranted,freeReason,netFee:fee.net-credits};
}
function recordPractice(a,type,origin){if(a.mode==='training'&&!a.training.isDemo&&origin==='player'&&!a.training.practiceActions.includes(type))a.training.practiceActions.push(type);}
function recordUplinkReconnection(a,c,e,origin){
 if(!a.fault.uplink||origin!=='player'||a.training.isDemo)return;
 const endpoints=[a.devices[c.fromDeviceId]?.roleId,a.devices[c.toDeviceId]?.roleId];
 const baseline=[...a.fault.baselineFailures].reverse().find(f=>f.technicalRevision<a.technicalRevision);
 if(endpoints.includes('infra.ap')&&endpoints.includes('infra.switch')&&baseline){a.fault.uplink.reconnections.push({...clone(c),eventId:e.id,technicalRevision:a.technicalRevision,origin,baselineObservationId:baseline.id});if(a.fault.uplink.reconnections.length>8)a.fault.uplink.reconnections.shift();}
}
function mutate(g,a,action,origin='player'){
 const type=action.type;const before=a.technicalRevision;
 switch(type){
  case 'CHOOSE_DEVICE':addDevice(g,a,action.roleId,action.kind,origin);break;
  case 'REMOVE_DEVICE':{const d=getDevice(a,action.deviceId);removeDevice(a,d.id);bump(a);event(g,a,type,{deviceId:d.id,roleId:d.roleId},origin);break;}
  case 'POWER_DEVICE':{const d=getDevice(a,action.deviceId);need(typeof action.on==='boolean','INPUT_INVALID','Choose power on or off.');if(d.powered!==action.on){d.powered=action.on;bump(a);}event(g,a,type,{deviceId:d.id,on:d.powered},origin);break;}
  case 'PLACE_DEVICE':case 'MOVE_NURSE':{const d=type==='MOVE_NURSE'?role(a,'role.nurse'):getDevice(a,action.deviceId);need(d,'DEVICE_MISSING','Choose the nurse device first.');need(LOCATIONS.some(l=>l.id===action.locationId),'LOCATION_UNKNOWN','Choose a named location.');need(d.roleId!=='role.monitor','USE_WEARABLE_RETURN','Use the wearable return action after home collection.');if(d.locationId!==action.locationId){d.locationId=action.locationId;bump(a);}event(g,a,type,{deviceId:d.id,locationId:d.locationId},origin);break;}
  case 'ATTACH_ADAPTER':case 'DETACH_ADAPTER':{const d=getDevice(a,action.deviceId);need(known(ATTACHMENTS,action.kind),'ADAPTER_UNKNOWN','Choose a known adapter or sensor dock.');need(CATALOG[d.kind].capabilities.includes('usb-host'),'ADAPTER_INCOMPATIBLE','This device cannot host that attachment.');if(action.kind==='sensor-dock')need(CATALOG[d.kind].capabilities.includes('sensor-companion'),'ADAPTER_INCOMPATIBLE','The sensor dock needs a compatible mobile companion.');if(action.kind==='ethernet-adapter')need(['laptop','tablet'].includes(d.kind),'ADAPTER_INCOMPATIBLE','This adapter is offered for the laptop or tablet; this device already has its own ports.');const attached=d.attachments.includes(action.kind);if(type==='ATTACH_ADAPTER'&&!attached){d.attachments.push(action.kind);bump(a);}if(type==='DETACH_ADAPTER'&&attached){d.attachments=d.attachments.filter(k=>k!==action.kind);if(action.kind==='ethernet-adapter')a.cables=a.cables.filter(c=>c.fromPortId!==`${d.id}.adapter.eth1`&&c.toPortId!==`${d.id}.adapter.eth1`);bump(a);}event(g,a,type,{deviceId:d.id,kind:action.kind},origin);break;}
  case 'CONNECT_PORTS':{const p=port(a,action.fromDeviceId,action.fromPortId),q=port(a,action.toDeviceId,action.toPortId);need(p&&q,'PORT_UNKNOWN','Choose ports currently present on the devices.');need(p.medium==='ethernet'&&q.medium==='ethernet','PORT_INCOMPATIBLE','Ethernet cables connect Ethernet ports; Wi-Fi and sensor handoff are different actions.');need(action.fromDeviceId!==action.toDeviceId,'SELF_CONNECTION','Connect two different devices.');need(!a.cables.some(c=>[c.fromPortId,c.toPortId].includes(p.id)||[c.fromPortId,c.toPortId].includes(q.id)),'PORT_OCCUPIED','One of those ports already has a cable. Disconnect it first.');a.cableSequence++;const c={id:`${a.id}.cable.${pad(a.cableSequence)}`,fromDeviceId:action.fromDeviceId,fromPortId:p.id,toDeviceId:action.toDeviceId,toPortId:q.id};a.cables.push(c);bump(a);const e=event(g,a,type,c,origin);recordUplinkReconnection(a,c,e,origin);break;}
  case 'DISCONNECT_CABLE':{const c=a.cables.find(x=>x.id===action.cableId);need(c,'CABLE_UNKNOWN','Choose an existing cable.');const prior=lastAtCurrent(a,'reception');a.cables=a.cables.filter(x=>x.id!==c.id);bump(a);const e=event(g,a,type,c,origin);if(origin==='player')recordGuidedDisconnection(a,c,prior,e);break;}
  case 'ASSOCIATE_WIFI':{const d=getDevice(a,action.deviceId);need(CATALOG[d.kind].wifi&&d.kind!=='access-point','WIFI_UNSUPPORTED','This device does not have a client Wi-Fi interface.');if(action.apDeviceId!==null){const ap=getDevice(a,action.apDeviceId);need(ap.kind==='access-point','WIFI_UNSUPPORTED','Choose a wireless access point.');}if(d.wifiApId!==action.apDeviceId){d.wifiApId=action.apDeviceId;bump(a);}event(g,a,type,{deviceId:d.id,apDeviceId:d.wifiApId},origin);break;}
  case 'SET_STATIC_ADDRESS':{const d=getDevice(a,action.deviceId);need(['role.reception','role.nurse','role.records'].includes(d.roleId),'ADDRESS_UNNEEDED','This bridge or wearable does not need a host IP for the modelled task.');need(parseIPv4(action.address)!==null,'ADDRESS_INVALID','Enter four IPv4 decimal numbers from 0 to 255, separated by dots; do not use spaces or leading zeroes.');const mask=action.mask||d.mask;need(maskPrefix(mask)!==null&&maskPrefix(mask)>=1&&maskPrefix(mask)<=30,'MASK_INVALID','Use a contiguous IPv4 subnet mask from /1 to /30. This clinic uses 255.255.255.0.');const old={address:d.address,mask:d.mask};d.address=action.address;d.mask=mask;if(old.address!==d.address||old.mask!==d.mask){bump(a);if(d.roleId==='role.nurse'){a.fault.changes.push({deviceId:d.id,before:old,after:{address:d.address,mask:d.mask},technicalRevision:a.technicalRevision,origin});a.fault.lastAddress=d.address;}}event(g,a,type,{deviceId:d.id,before:old,after:{address:d.address,mask:d.mask}},origin);break;}
  case 'SET_SERVICE_STATE':{need(role(a,'role.records'),'DEVICE_MISSING','Choose a records host first.');need(typeof action.enabled==='boolean','INPUT_INVALID','Choose services on or off.');if(a.serverEnabled!==action.enabled){a.serverEnabled=action.enabled;bump(a);}event(g,a,type,{enabled:a.serverEnabled},origin);break;}
  case 'RUN_PROBE':{const specs=specifications(action.testId,a.testSuiteVersion||1);need(specs,'TEST_UNKNOWN','Choose reception, nurse, nurse bookings, access, upload or all tests.');specs.forEach(s=>recordProbe(g,a,s,origin));break;}
  case 'RUN_COLLECTION_CHECK':{const d=role(a,'role.monitor');need(d?.kind==='wearable','CAPABILITY_MISSING','Choose the wearable to collect offline day markers.');need(d.powered,'DEVICE_OFF','Power the wearable on.');need(d.locationId==='location.home','COLLECTION_LOCATION','Collection occurs at home before return to the clinic.');if(a.wearable.collected.length<7){a.wearable.collected=Array.from({length:7},(_,i)=>`${a.id}.marker.day${i+1}`);bump(a);}event(g,a,type,{count:a.wearable.collected.length,nonclinical:true},origin);break;}
  case 'RETURN_WEARABLE':{const d=role(a,'role.monitor');need(d?.kind==='wearable','DEVICE_MISSING','Choose the wearable first.');need(a.wearable.collected.length===7,'COLLECTION_REQUIRED','Collect the seven day markers before returning.');if(!a.wearable.returned||d.locationId!=='location.exam-a'){d.locationId='location.exam-a';a.wearable.returned=true;bump(a);}event(g,a,type,{locationId:d.locationId},origin);break;}
  case 'HANDOFF_MARKERS':{const w=role(a,'role.monitor'),n=role(a,'role.nurse');need(w?.kind==='wearable'&&n&&CATALOG[n.kind].capabilities.includes('sensor-companion'),'CAPABILITY_MISSING','A wearable and compatible nurse companion are required.');need(w.powered&&n.powered,'DEVICE_OFF','Power the wearable and companion on.');need(a.wearable.returned&&w.locationId!=='location.home','RETURN_REQUIRED','Return the wearable to the clinic before handoff.');need(n.attachments.includes('sensor-dock'),'SENSOR_DOCK_REQUIRED','Attach the sensor transfer dock to the nurse companion. An Ethernet adapter cannot substitute.');need(['location.exam-a','location.exam-b'].includes(n.locationId),'OUTSIDE_COVERAGE','Bring the companion into the clinic for the handoff.');need(a.wearable.collected.length===7,'COLLECTION_REQUIRED','Collect the seven day markers first.');if(a.wearable.handedOff.length!==7||a.wearable.companionDeviceId!==n.id){a.wearable.handedOff=[...a.wearable.collected];a.wearable.companionDeviceId=n.id;bump(a);}event(g,a,type,{count:7,companionDeviceId:n.id,medium:'sensor-dock'},origin);break;}
  case 'UPLOAD_MARKERS':{const n=role(a,'role.nurse');need(a.wearable.handedOff.length===7&&a.wearable.companionDeviceId===n?.id,'HANDOFF_REQUIRED','Transfer the markers to the current nurse companion first.');const result=evaluate(a,specifications('upload')[0]);need(result.pass,result.code,result.message);if(a.wearable.receipts.length!==7){a.wearable.receipts=[...a.wearable.handedOff];bump(a);}const o=recordProbe(g,a,specifications('upload')[0],origin);event(g,a,type,{count:7,markerIds:a.wearable.receipts,observationId:o.id},origin);if(a.mode==='client')message(a,'phone.clinic.marker-receipt.001','Ari · Clinic coordinator','The intake service received all seven nonclinical day markers. This is a delayed return-and-sync transfer, not live home monitoring.',[o],'observation');break;}
  case 'SET_PERMISSIONS':{need(known(POLICIES,action.policyId),'POLICY_UNKNOWN','Choose a listed permission policy.');if(a.policyId!==action.policyId){a.policyId=action.policyId;a.policyRevision++;bump(a);}event(g,a,type,{policyId:a.policyId},origin);if(a.mode==='client')message(a,'phone.clinic.nurse-booking-request.001','Mina · Nurse','Could nurses also arrange follow-up bookings? I value the flexibility, but reception-only booking is a reasonable boundary. Please decide and explain the trade-off.',[],'request');break;}
  case 'SAVE_EXPLANATION':{need(EXPLANATION_KEYS.includes(action.key),'EXPLANATION_UNKNOWN','Choose one of the four handover explanations.');need(typeof action.text==='string'&&action.text.length<=2000&&typeof action.oral==='boolean','EXPLANATION_INVALID','Use at most 2,000 characters; identifying information is not needed.');a.explanations[action.key]={text:action.text,oral:action.oral,contextRevision:a.policyRevision};a.evidenceRevision++;event(g,a,type,{key:action.key,oral:action.oral,hasText:!!action.text.trim()},origin);if(a.guidedConnection&&action.key==='repair'&&origin==='player'){const o=guidedEvidence(a).passingRetest;a.guidedConnection.explanationObservationId=o?.id||null;a.guidedConnection.explanationWitness=o?networkWitness(a,o):null;}break;}
  case 'REVIEW_EXPLANATION_CONTEXT':a.explanations.privacy.contextRevision=a.policyRevision;a.evidenceRevision++;event(g,a,type,{},origin);break;
  case 'GUIDE_CONSULT':{const q=quote(g,a,action.sectionId);need(q,'GUIDE_UNKNOWN','That guide section is unavailable; no charge was made.');need(action.quoteToken===q.quoteToken,'QUOTE_STALE','The consultation terms or contract phase changed. Review the refreshed quote; no charge was made.');if(!q.alreadyGranted){if(a.mode==='client'&&g.contract.phase==='active'){g.contract.ledgerRevision++;const grant={id:`${g.contract.id}.guide.${g.contract.grants.length+1}`,grantKey:`${g.campaignId}|${g.contract.id}|${action.sectionId}`,sectionId:action.sectionId,credits:q.credits,minutes:q.minutes,policyVersion:g.contract.terms.version,ledgerRevision:g.contract.ledgerRevision};g.contract.grants.push(grant);}else a.freeGuideGrants.push(action.sectionId);a.evidenceRevision++;}event(g,a,type,{sectionId:action.sectionId,credits:q.alreadyGranted?0:q.credits,minutes:q.alreadyGranted?0:q.minutes,reopen:q.alreadyGranted},origin);break;}
  case 'REVEAL_HINT':{need(GUIDE_SECTIONS.some(s=>s.id===action.sectionId),'GUIDE_UNKNOWN','That guide section is unavailable.');need(Number.isInteger(action.tier)&&action.tier>=1&&action.tier<=3,'HINT_UNKNOWN','Choose hint level 1, 2 or 3.');need(a.mode==='training'||g.contract?.phase!=='active'||quote(g,a,action.sectionId).alreadyGranted,'GUIDE_LOCKED','Review and accept the section consultation quote first.');a.hints[action.sectionId]=Math.max(a.hints[action.sectionId]||0,action.tier);a.evidenceRevision++;event(g,a,type,{sectionId:action.sectionId,tier:action.tier},origin);break;}
  case 'ACKNOWLEDGE_CLIENT_MESSAGE':{const m=a.messages.find(m=>m.id===action.messageId);need(m,'MESSAGE_UNKNOWN','Choose an existing message.');m.read=true;event(g,a,type,{messageId:m.id},origin);break;}
  default:fail('ACTION_UNKNOWN','That action is not supported by the simulation.');
 }
 recordPractice(a,type,origin);return before!==a.technicalRevision;
}
function demonstrate(g,a){
 const index=a.training.stationIndex,stage=a.training.stage==='transfer'?'transfer':'practice';
 const demo=newAttempt(g,'training',{stationIndex:index,stage,legacyAddressTransfer:transferKind(a)==='legacy-address'});setupTraining(g,demo);demo.training.isDemo=true;
 const act=x=>mutate(g,demo,x,'trainer-demo');
 if(index===0){act({type:'CHOOSE_DEVICE',roleId:'role.reception',kind:stage==='transfer'?'laptop':'desktop'});const r=role(demo,'role.reception');act({type:'POWER_DEVICE',deviceId:r.id,on:true});if(r.kind==='laptop')act({type:'ATTACH_ADAPTER',deviceId:r.id,kind:'ethernet-adapter'});const sw=role(demo,'infra.switch');act(cableBetween(demo,role(demo,'role.records'),sw,1));act(cableBetween(demo,r,sw,2));act({type:'RUN_PROBE',testId:'reception'});demo.training.demoSteps=['Choose a computer that fits reception’s fixed booking task.','Power it on; attach an Ethernet adapter if its catalog needs one.','Connect the records host and reception to separate switch ports.','Run the booking test; inspect the actual path and result.'];}
 if(index===1){act({type:'RUN_PROBE',testId:'nurse'});if(isUplinkTransfer(demo)){act(cableBetween(demo,role(demo,'infra.ap'),role(demo,'infra.switch'),3));act({type:'RUN_PROBE',testId:'nurse'});demo.training.demoSteps=['Run the nurse test: PORT_DISCONNECTED identifies an incomplete physical path.','The nurse address is already valid. Its associated radio cannot replace the access point’s missing Ethernet uplink.','Connect the access point’s Ethernet port to an available switch port, then repeat the nurse test.','In your own practice, explain why changing an address cannot restore a missing cable. The demonstration does not write or judge your explanation.'];}else{const n=role(demo,'role.nurse');act({type:'SET_STATIC_ADDRESS',deviceId:n.id,address:demo.network.base+'.30',mask:demo.network.mask});act({type:'RUN_PROBE',testId:'nurse'});demo.training.demoSteps=['Run the nurse test. The radio is associated, but the saved IP is outside the allowed subnet.','Compare the address and mask with the network card.','Choose a valid, unused host address in this practice range.','Apply it and repeat the same test. The result changes because configuration changed.'];}}
 if(index===2){act({type:'SET_PERMISSIONS',policyId:'policy.roles-separated'});act({type:'RUN_COLLECTION_CHECK'});act({type:'RETURN_WEARABLE'});act({type:'ATTACH_ADAPTER',deviceId:role(demo,'role.nurse').id,kind:'sensor-dock'});act({type:'HANDOFF_MARKERS'});act({type:'UPLOAD_MARKERS'});act({type:'RUN_PROBE',testId:'access'});demo.training.demoSteps=['Select a role policy that allows necessary jobs and restricts other access.','Collect seven nonclinical day markers at home, then return the wearable.','Attach the sensor dock and hand the markers to the nurse companion.','Upload through its real network path; test both allowed work and expected denials.','Explain the stakeholder trade-off in your own words. Demonstrations never write your answer.'];}
 event(g,demo,'TRAINING_DEMO',{stationId:STATIONS[index].id},'trainer-demo');
}
function startClinicPractice(g){
 const provenance={route:'teacher-selected-local',authenticated:false,sourceClientAttemptId:g.contract?.currentAttemptId||null};
 const a=newAttempt(g,'training',{stage:'clinic-practice',provenance});
 message(a,'phone.clinic.brief.001','Ari · Clinic coordinator','Teacher-selected full-clinic practice: equip all four jobs, build the local path, investigate the inherited nurse setting, transfer the synthetic markers and explain your access decision. All guidance is free. This separate practice earns no client fee; an existing client contract can be resumed.');
 event(g,a,'START_CLINIC_PRACTICE',provenance,'player');
}
function startClient(g,priorLearning=false){
 if(g.contract){g.activeAttemptId=g.contract.currentAttemptId;return;}
 need(g.training.completed.length===3||priorLearning===true,'BOOTCAMP_REQUIRED','Complete the free bootcamp first, or use the explicitly labelled teacher-directed prior-learning route.');
 g.training.priorLearning=priorLearning===true&&g.training.completed.length<3;
 const a=newAttempt(g,'client');g.contract={id:'contract.clinic.001',phase:'active',currentAttemptId:a.id,terms:terms(),grants:[],ledgerRevision:0,delivery:null,settlement:null,acceptedRoute:g.training.priorLearning?'teacher-directed-prior-learning':'bootcamp-completed'};
 message(a,'phone.clinic.brief.001','Ari · Clinic coordinator','Riverbend opens next month. Equip reception, a mobile nurse, a week-at-home wearable and central records. Build and test the local network, repair the inherited nurse setting, choose access permissions and leave a handover. Use only synthetic markers; do not enter names or patient information.');
 message(a,'phone.clinic.quote.001','Ari · Clinic coordinator','The service fee is 120 fictional credits. Each technical-guide section reserves 5 credits and adds 3 simulated consultation minutes, capped at 15 credits and 9 minutes. Reopening and all hint levels are included. The brief, controls, glossary and diagnostics remain free.');
 event(g,a,'START_CLIENT_ATTEMPT',{route:g.contract.acceptedRoute,terms:g.contract.terms},'player');
}
function replayDelivery(g){
 need(g.contract?.delivery,'DELIVERY_REQUIRED','Deliver a clinic contract before opening its free practice replay.');
 const original=clone(g.contract.delivery.attemptSnapshot);g.attemptSequence++;const newId=`attempt.${pad(g.attemptSequence)}`,oldId=original.id;
 const remap=x=>{if(typeof x==='string')return x.startsWith(oldId+'.')?newId+x.slice(oldId.length):x;if(Array.isArray(x))return x.map(remap);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k.startsWith(oldId+'.')?newId+k.slice(oldId.length):k,remap(v)]));return x;};
 const a=remap(original);a.id=newId;a.mode='training';a.spatialModelVersion=2;delete a.spatialModelUpdate;a.fixtureId='fixture.clinic.practice.001';a.training={stationIndex:2,stage:'replay',isDemo:false,practiceActions:[],demoSteps:[],provenance:{sourceAttemptId:oldId,deliveryId:g.contract.delivery.id,sourceFaultId:original.fault.id,sourceBaselineObservationIds:original.fault.baselineFailures.map(f=>f.id),sourceRepairChangeCount:original.fault.changes.length,sourceHistoryIsIndependentPractice:false}};a.fault.baselineFailures=[];a.fault.changes=[];a.fault.seedEventId=null;a.events=[];a.observations=[];a.messages=[];a.freeGuideGrants=GUIDE_SECTIONS.map(x=>x.id);a.sequence=0;a.observationSequence=0;a.evidenceRevision++;g.attempts[newId]=a;g.activeAttemptId=newId;event(g,a,'START_DELIVERED_CONTRACT_PRACTICE',a.training.provenance,'mission-setup');
}
function faultEvidenceType(a){
 if(isGuided(a))return 'Guided cable experiment with trainer-prepared equipment; see guidedConnection evidence for actual observations. It is separate from independent clinic fault evidence.';
 if(isUplinkTransfer(a))return a.fault.baselineFailures.length?'Recorded player link failure; reconnection and current retest evidence are reported separately. The fixture began with a valid nurse address.':'No player-observed uplink failure is recorded; no failure or repair is invented. The fixture began with a valid nurse address.';
 return a.fault.baselineFailures.length?'Recorded player failure, configuration history and current retest':'Early correction or no recorded pre-repair player failure; no failure is invented';
}
function teacherOverview(g,a){
 const t=trainingStatus(a,g),checks=['bootcamp','guided-connection'].includes(t.kind)?t.checks:objectives(a),failure=a.fault.baselineFailures.at(-1),change=isUplinkTransfer(a)?a.fault.uplink.reconnections.at(-1):[...a.fault.changes].reverse().find(c=>c.origin==='player'),retest=lastAtCurrent(a,'nurse');
 const oralPending=EXPLANATION_KEYS.filter(k=>a.explanations[k].oral).map(key=>({attemptId:a.id,key,context:'current attempt'}));
 for(const h of g.training.history)if(h.attemptId!==a.id&&h.transferEvidence?.explanation.oral)oralPending.push({attemptId:h.attemptId,key:'repair',context:'recorded physical-uplink transfer checkpoint'});
 for(const id of g.guidedConnectionHistory||[])if(id!==a.id&&g.attempts[id].explanations.repair.oral)oralPending.push({attemptId:id,key:'repair',context:'guided connection lesson; prepared equipment'});
 const mode=t.kind==='guided-connection'?'Guided connection lesson — trainer-prepared equipment, free help, zero earnings':t.kind==='clinic-practice'?'Teacher-selected full-clinic practice — free help, zero earnings':t.kind==='delivery-replay'?'Delivery replay — free help, zero earnings':t.kind==='bootcamp'?'Bootcamp — free help, zero earnings':'Client contract';
 const guided=guidedEvidence(a),guidedSequence=guided?{failure:guided.experimentObservation?`${guided.experimentObservation.code}; ${guided.experimentObservation.pass?'a remaining path stayed available':'service not available'} after cable removal`:'The cable experiment has not yet been observed',change:guided.reconnection?`Player connected ${guided.reconnection.fromPortId} to ${guided.reconnection.toPortId}`:guided.experimentOutcome==='alternate-path'?'No repair was required: another path remained working':guided.repairEvent?`Player action ${guided.repairEvent.type} after the observed failure`:'No post-experiment repair recorded',retest:guided.passingRetest?`${guided.passingRetest.code}; passing current reception test at technical revision ${guided.passingRetest.testedTechnicalRevision}`:'No current confirmed reception result after the experiment'}:null;
 return {attemptId:a.id,mode,modelUpdate:a.spatialModelUpdate?.note||null,stage:learningFocus(a,g).title,currentPracticalStatus:`${checks.filter(c=>c.met).length}/${checks.length} current ${t.kind==='guided-connection'?'guided checks':t.kind==='bootcamp'?'station checks':'clinic requirements'} satisfied${a.training.isDemo?' in a trainer demonstration; independent practice is still required':''}`,chosenPolicy:{id:a.policyId,label:POLICIES[a.policyId].label},repairSequence:guidedSequence||{failure:failure?`${failure.code} observed by the player at technical revision ${failure.technicalRevision}`:'No pre-repair player failure recorded',change:change?(isUplinkTransfer(a)?`Player connected ${change.fromPortId} to ${change.toPortId} at technical revision ${change.technicalRevision}`:`Player changed ${change.before.address}/${change.before.mask} to ${change.after.address}/${change.after.mask} at technical revision ${change.technicalRevision}`):'No relevant player repair action recorded',retest:retest?`${retest.code}; ${retest.pass?'passing':'not passing'}; ${retest.origin}; current technical revision ${retest.testedTechnicalRevision}`:'No nurse retest recorded at the current technical revision'},oralPending,assessment:'Teacher review remains pending. Money, speed, assistance and explanation presence do not assign a grade.'};
}
function transferEvidenceText(g,a){
 const records=g.training.history.filter(h=>h.stationId===STATIONS[1].id&&h.stage==='transfer').map(h=>({attemptId:h.attemptId,proof:h.transferEvidence||null,context:'recorded checkpoint',archived:!!h.archived}));
 if(isUplinkTransfer(a)&&!records.some(r=>r.attemptId===a.id))records.push({attemptId:a.id,proof:uplinkEvidence(a),context:'current attempt',archived:false});
 if(transferKind(a)==='legacy-address'&&!records.some(r=>r.attemptId===a.id))records.push({attemptId:a.id,proof:null,context:'current saved example',archived:false});
 if(!records.length)return ['No station 2 changed-fault checkpoint has been recorded.'];
 return records.flatMap(({attemptId,proof:p,context,archived})=>p?[`${attemptId} | physical-uplink transfer | ${context}${archived?' (source attempt archived; frozen checkpoint retained)':''}`,'Fixture: valid nurse address; access-point Ethernet uplink unplugged.',p.observedFailure?`Observed failure: ${p.observedFailure.id} | ${p.observedFailure.code} | player | technical revision ${p.observedFailure.testedTechnicalRevision}`:'Observed failure: not yet recorded by the player.',p.reconnection?`Physical reconnection: ${p.reconnection.fromPortId} → ${p.reconnection.toPortId} | ${p.reconnection.id} | technical revision ${p.reconnection.technicalRevision}`:'Physical reconnection after the failure: not yet recorded.',p.passingRetest?`Passing retest: ${p.passingRetest.id} | ${p.passingRetest.code} | player | technical revision ${p.passingRetest.testedTechnicalRevision}`:'Passing retest through the reconnected cable: not yet recorded.',`Repair explanation (unaltered${p.explanation.submitted?'':'; not submitted'}):`,p.explanation.text||'[No written explanation]',p.explanation.oral?'Oral repair explanation PENDING teacher conversation.':'',p.readyForTeacherReview?'Required transfer evidence recorded; explanation quality remains for teacher review.':'Transfer evidence remains incomplete; explanation quality remains for teacher review.','']:[`${attemptId} | legacy address-transfer ${context}${archived?' (archived)':''}. This saved checkpoint does not establish the new physical-uplink transfer.`,'']);
}
function evidenceObject(g,a){
 const status=objectives(a),eco=economy(g,a),observations=a.observations.map(o=>({...clone(o),stale:o.testedTechnicalRevision!==a.technicalRevision}));
 return {format:'clinic-evidence',spatialModelVersion:a[LEGACY_SPATIAL_MODEL]?1:2,modelUpdate:clone(a.spatialModelUpdate||null),teacherOverview:teacherOverview(g,a),learningFocus:learningFocus(a,g),transferEvidence:uplinkEvidence(a),schemaVersion:SCHEMA_VERSION,buildVersion:BUILD_VERSION,missionId:'mission.clinic.001',campaignId:g.campaignId,attemptId:a.id,mode:a.mode,fixtureId:a.fixtureId,revision:g.revision,technicalRevision:a.technicalRevision,evidenceRevision:a.evidenceRevision,network:clone(a.network),guidedConnection:guidedEvidence(a),guidedConnectionHistory:(g.guidedConnectionHistory||[]).map(id=>({attemptId:id,...guidedEvidence(g.attempts[id])})),equipment:Object.values(a.devices).map(d=>({...clone(d),label:CATALOG[d.kind].label,role:ROLES[d.roleId].label,ports:ports(d)})),connections:clone(a.cables),servicesEnabled:a.serverEnabled,policy:{id:a.policyId,label:POLICIES[a.policyId].label,matrix:clone(POLICIES[a.policyId].matrix),revision:a.policyRevision},currentChecks:isGuided(a)?[evaluate(a,specifications('reception')[0])]:currentSuite(a),recordedObservations:observations,fault:{...clone(a.fault),currentlyRepaired:repaired(a),evidenceType:faultEvidenceType(a)},wearable:clone(a.wearable),explanations:clone(a.explanations),hints:clone(a.hints),guideGrants:clone(a.mode==='client'?g.contract?.grants||[]:a.freeGuideGrants),economy:eco,practice:{...clone(g.training),active:clone(a.training),kind:trainingKind(a)},objectives:status,readyForTeacherReview:status.every(o=>o.met),missing:status.filter(o=>!o.met).map(o=>o.label),teacherReview:'Pending teacher judgement. Completion, support use and income do not assign a grade or mastery.',officialOutcomeIds:[],identifyingDataRequested:false,imported:importProvenance(g)==='legacy-unknown'?null:importProvenance(g)==='manual-file',importProvenance:importProvenance(g),historyCompacted:!!(a.historyCompacted||g.historyCompacted),modelLimitations:['One static local subnet; no Internet, router, DHCP or DNS is required or simulated.','Wi-Fi coverage is a named-location rule, not a radio propagation model.','Role permissions are simulated application authorization, not real account authentication or a complete security system.','Seven synthetic day markers and return-and-sync do not represent clinical measurements or live remote monitoring.','Local files are editable evidence, not tamper-proof records.'],history:clone(a.events)};
}
const serializedBytes = value => new TextEncoder().encode(JSON.stringify(value)).length;
function compactAttempt(a){
 const pinnedObs=new Set([...a.messages.flatMap(m=>m.observationIds),...a.fault.baselineFailures.map(f=>f.id),...(a.guidedConnection?[a.guidedConnection.firstPassId,a.guidedConnection.beforeExperimentPassId,a.guidedConnection.experimentObservationId,a.guidedConnection.explanationObservationId]:[])]);
 // Retain the latest observation of every test, whether current or stale, plus narrative milestones.
 for(const spec of specifications('all')){const latest=[...a.observations].reverse().find(o=>o.testId===spec.testId);if(latest)pinnedObs.add(latest.id);}
 const latestObs=new Set(a.observations.slice(-24).map(o=>o.id));
 if(a.observations.length>40){a.observations=a.observations.filter(o=>pinnedObs.has(o.id)||latestObs.has(o.id));a.historyCompacted=true;}
 const pinnedEvents=evidenceEventIds(a);
 const recentEvents=new Set(a.events.slice(-80).map(e=>e.id));
 if(a.events.length>120){a.events=a.events.filter(e=>pinnedEvents.has(e.id)||recentEvents.has(e.id));a.historyCompacted=true;}
}
function compactCampaign(g){
 const required=new Set([g.activeAttemptId,g.contract?.currentAttemptId,g.contract?.delivery?.attemptId,...(g.guidedConnectionHistory||[]),active(g).guidedConnection?.returnAttemptId].filter(Boolean));
 const ids=Object.keys(g.attempts).sort((x,y)=>Number(y.split('.').at(-1))-Number(x.split('.').at(-1)));
 const keep=new Set([...required,...ids.slice(0,14)]);
 const discard=id=>{delete g.attempts[id];g.historyCompacted=true;for(const h of g.training.history)if(h.attemptId===id)h.archived=true;};
 for(const id of ids)if(!keep.has(id))discard(id);
 if(g.training.history.length>24){
  const protectedRecords=new Set();
  for(const stationId of g.training.completed)for(const stage of ['practice','transfer']){const h=g.training.history.find(h=>h.stationId===stationId&&h.stage===stage);if(h)protectedRecords.add(h);}
  const latestUplink=[...g.training.history].reverse().find(h=>h.transferEvidence?.kind==='physical-uplink');if(latestUplink)protectedRecords.add(latestUplink);
  const recent=g.training.history.slice(-(24-protectedRecords.size));const retained=new Set([...protectedRecords,...recent]);
  g.training.archivedPracticeCount=(g.training.archivedPracticeCount||0)+g.training.history.length-retained.size;
  g.training.history=g.training.history.filter(h=>retained.has(h));g.historyCompacted=true;
 }
 for(const a of Object.values(g.attempts))if(a.fault.changes.length>60){a.fault.changes=[a.fault.changes[0],...a.fault.changes.slice(-59)];a.historyCompacted=true;a.fault.changesCompacted=true;}
 // Count bounds alone cannot guarantee a usable export. Remove optional older attempts by bytes.
 for(const id of [...ids].reverse()){
  if(serializedBytes(g)<=800000)break;
  if(g.attempts[id]&&!required.has(id))discard(id);
 }
 if(serializedBytes(g)>800000){
  for(const a of Object.values(g.attempts))compactAttempt(a);
  g.historyCompacted=true;
 }
}
export function dispatch(game,action){
 if(!action||typeof action.type!=='string')return {state:game,accepted:false,code:'ACTION_INVALID',message:'Choose an available action.'};
 const g=clone(game);let a=active(g);if(!a.testSuiteVersion){a.testSuiteVersion=2;a.evidenceRevision++;}let code='ACTION_APPLIED',messageText='Action applied.';
 try{
  if(isGuided(a)&&a.guidedConnection.finishedEventId)need(['START_GUIDED_CONNECTION','RETURN_FROM_GUIDED_CONNECTION','START_TRAINING_ATTEMPT','START_CLIENT_ATTEMPT','START_CLINIC_PRACTICE','RETURN_TO_CLIENT','TRAINING_RETRY','RESTART_ACTIVE_ATTEMPT','START_DELIVERED_CONTRACT_PRACTICE'].includes(action.type),'GUIDED_FINISHED','This completed guided record is preserved. Open a new lesson or return to independent work to make changes.');
  switch(action.type){
   case 'START_GUIDED_CONNECTION':{const target=isGuided(a)?a.guidedConnection.returnAttemptId:a.id;startGuidedConnection(g,target);messageText='Free guided connection lesson opened. Your previous work is preserved.';break;}
   case 'RETURN_FROM_GUIDED_CONNECTION':leaveGuidedConnection(g,false);messageText='Returned without recording guided completion. Independent work and client costs are preserved.';break;
   case 'FINISH_GUIDED_CONNECTION':leaveGuidedConnection(g,true);messageText='Guided evidence recorded for teacher review. Continue with your own equipment choice or saved work.';break;
   case 'START_CLIENT_ATTEMPT':startClient(g,action.priorLearning===true);messageText='Clinic contract opened. The client brief is in your messages.';break;
   case 'RETURN_TO_CLIENT':need(g.contract,'CONTRACT_MISSING','Accept the clinic job first.');g.activeAttemptId=g.contract.currentAttemptId;messageText='Returned to the clinic contract.';break;
   case 'START_TRAINING_ATTEMPT':{const t=newAttempt(g,'training');setupTraining(g,t);messageText='Free bootcamp opened in a separate attempt.';break;}
   case 'START_CLINIC_PRACTICE':startClinicPractice(g);messageText='Teacher-selected full-clinic practice opened. All help is free and no fee can be earned. Any client contract is preserved.';break;
   case 'TRAINING_DEMO':need(trainingKind(a)==='bootcamp','TRAINING_ONLY','Demonstrations are available in bootcamp.');demonstrate(g,a);messageText='Demonstration complete. Inspect the result, then choose Try it yourself. Demonstrations do not complete practice.';break;
   case 'TRAINING_RETRY':{need(a.mode==='training','TRAINING_ONLY','Use this during free training.');if(isGuided(a)){startGuidedConnection(g,a.guidedConnection.returnAttemptId);messageText='The prepared connection lesson restarted. Your saved return work is preserved.';break;}if(trainingKind(a)==='delivery-replay'){replayDelivery(g);messageText='A fresh free replay opened; the original delivery remains unchanged.';break;}if(trainingKind(a)==='clinic-practice'){startClinicPractice(g);messageText='Full-clinic practice restarted with free help. The client contract remains unchanged.';break;}const t=newAttempt(g,'training',{stationIndex:a.training.stationIndex,stage:a.training.stage==='transfer'?'transfer':'practice',legacyAddressTransfer:transferKind(a)==='legacy-address'});setupTraining(g,t);messageText='Fresh practice opened. Training assistance is free.';break;}
   case 'TRAINING_NEXT':{
    need(trainingKind(a)==='bootcamp','TRAINING_ONLY','This action belongs to the bootcamp.');const status=trainingStatus(a,g);need(status.canAdvance,'PRACTICE_INCOMPLETE','Complete the practice checks yourself before moving on. A demonstration does not count.');
    g.training.history.push({attemptId:a.id,fixtureId:a.fixtureId,stationId:status.stationId,stage:a.training.stage,transferKind:status.transferKind,technicalRevision:a.technicalRevision,evidenceRevision:a.evidenceRevision,mode:'training',demonstration:false,practiceActions:[...a.training.practiceActions],checks:clone(status.checks),observations:specifications('all').map(s=>lastAtCurrent(a,s.testId)).filter(Boolean).map(o=>({id:o.id,testId:o.testId,code:o.code,pass:o.pass,origin:o.origin})),support:'free-training',independentMastery:false,...(status.transferEvidence?{transferEvidence:clone(status.transferEvidence)}:{})});
    if(a.training.stage==='practice'){const t=newAttempt(g,'training',{stationIndex:a.training.stationIndex,stage:'transfer'});setupTraining(g,t);messageText=isUplinkTransfer(t)?'Try a different fault: the nurse address is valid, but the access-point uplink is unplugged. Test before changing anything.':'Try the changed example. The practice subnet is now 192.168.70.0/24.';}
    else{if(!g.training.completed.includes(status.stationId))g.training.completed.push(status.stationId);if(a.training.stationIndex===2){a.training.stage='complete';messageText='Bootcamp practice complete. You can now accept the clinic contract. Teacher judgement of understanding is still separate.';}else{const t=newAttempt(g,'training',{stationIndex:a.training.stationIndex+1});setupTraining(g,t);messageText='Next bootcamp station opened.';}}
    break;
   }
   case 'RESTART_ACTIVE_ATTEMPT':{
    if(a.mode==='client'&&g.contract?.phase==='active'){const t=newAttempt(g,'client');g.contract.currentAttemptId=t.id;message(t,'phone.clinic.brief.001','Ari · Clinic coordinator','This is a fresh clinic attempt under the same contract. Your previously purchased guide sections and reserved costs remain. Equip, connect, test, repair and explain.');messageText='Clinic attempt restarted. Contract guide grants and reserved costs were preserved.';}
    else if(g.contract?.delivery&&a.mode==='client'){replayDelivery(g);messageText='Opened a free practice replay. The original delivery and payment are preserved.';}
    else if(isGuided(a)){startGuidedConnection(g,a.guidedConnection.returnAttemptId);messageText='The prepared connection lesson restarted.';}
    else if(trainingKind(a)==='clinic-practice'){startClinicPractice(g);messageText='Full-clinic practice restarted. Any client work and its guide costs remain unchanged.';}
    else if(trainingKind(a)==='delivery-replay'){replayDelivery(g);messageText='A fresh free replay opened; the original delivery remains unchanged.';}
    else{const t=newAttempt(g,'training',{stationIndex:a.training.stationIndex,stage:a.training.stage==='transfer'?'transfer':'practice',legacyAddressTransfer:transferKind(a)==='legacy-address'});setupTraining(g,t);messageText='Training practice restarted.';}break;
   }
   case 'START_DELIVERED_CONTRACT_PRACTICE':replayDelivery(g);messageText='Free practice replay opened; the original delivery and payment remain unchanged.';break;
   case 'REQUEST_HANDOVER':{
    need(a.mode==='client'&&g.contract,'CLIENT_ONLY','Handover is for the clinic contract.');
    specifications('all').forEach(s=>recordProbe(g,a,s,'engine-check'));
    const missing=objectives(a).filter(x=>!x.met);
    if(missing.length){code='HANDOVER_INCOMPLETE';messageText='Handover needs: '+missing.map(x=>x.label).join('; ')+'.';break;}
    if(g.contract.delivery){code='DELIVERY_ALREADY_RECORDED';messageText='The original delivery is already recorded. Current checks have been refreshed; no second fee is earned.';break;}
    compactAttempt(a);const eco=economy(g,a);const c=g.contract;c.phase='delivered';a.evidenceRevision++;event(g,a,'REQUEST_HANDOVER',{ready:true,oralPending:EXPLANATION_KEYS.filter(k=>a.explanations[k].oral)},'player');
    const oral=EXPLANATION_KEYS.some(k=>a.explanations[k].oral),written=EXPLANATION_KEYS.some(k=>a.explanations[k].text.trim());
    message(a,'phone.clinic.handover.001','Ari · Clinic coordinator',oral?(written?'Your recorded explanations are included; the specified oral explanation remains pending teacher review.':'Your practical results are included; an oral explanation is pending teacher review.'):'Your recorded explanations are included. Your handover is ready for teacher review.',specifications('all').map(s=>lastAtCurrent(a,s.testId)).filter(Boolean),'observation');
    c.delivery={id:`${c.id}.delivery.001`,attemptId:a.id,technicalRevision:a.technicalRevision,evidenceRevision:a.evidenceRevision,ledgerRevision:c.ledgerRevision,feeDefinitionVersion:c.terms.version,grossFee:c.terms.gross,reservedCredits:eco.reserved,consultationMinutes:eco.minutes,netFee:eco.net,grants:clone(c.grants),evidenceSnapshot:evidenceObject(g,a),attemptSnapshot:clone(a)};
    messageText='Delivery recorded for teacher review. Costs are frozen; guide review is now free. Collect the service fee when ready.';break;
   }
   case 'SETTLE_CONTRACT':{
    need(a.mode==='client','CLIENT_ONLY','Free practice cannot settle a client contract. Return to the client contract to collect an eligible fee.');
    const c=g.contract;need(c?.delivery,'DELIVERY_REQUIRED','Complete the clinic handover before collecting the service fee.');
    if(c.settlement){code='ALREADY_SETTLED';messageText='This contract has already been paid; the existing receipt is unchanged.';break;}
    const d=c.delivery;const receipt={id:`${g.campaignId}|${c.id}`,contractId:c.id,deliveryId:d.id,grossFee:d.grossFee,supportExpense:d.reservedCredits,netFee:d.netFee,consultationMinutes:d.consultationMinutes};
    need(!g.settlements.some(x=>x.id===receipt.id),'SETTLEMENT_CONFLICT','This settlement identity is already recorded.');g.settlements.push(receipt);g.wallet+=receipt.netFee;c.settlement=clone(receipt);c.phase='settled';c.ledgerRevision++;event(g,a,'SETTLE_CONTRACT',receipt,'player');messageText=`Service fee collected: ${receipt.grossFee} gross − ${receipt.supportExpense} guide expense = ${receipt.netFee} fictional credits.`;break;
   }
   default:{const removed=action.type==='DISCONNECT_CABLE'?clone(a.cables.find(c=>c.id===action.cableId)||null):null;mutate(g,a,action,'player');if(action.type==='CONNECT_PORTS'||removed){const c=removed||a.cables.at(-1),label=(id,pid)=>{const d=a.devices[id];return `${ROLES[d.roleId].label} — ${ports(d).find(p=>p.id===pid)?.label||pid}`;};messageText=`${removed?'Unplugged':'Connected'} ${label(c.fromDeviceId,c.fromPortId)} ${removed?'from':'to'} ${label(c.toDeviceId,c.toPortId)}. Run the booking test to check the current service.`;}else if(action.type==='RUN_PROBE'){const latest=active(g).observations.slice(-specifications(action.testId).length);messageText=latest.every(o=>o.pass)?'All selected checks passed at the current revision.':latest.find(o=>!o.pass)?.message||'Check completed.';}else if(action.type==='GUIDE_CONSULT')messageText='Guide section opened. Reopening and all its hint levels are included.';else if(action.type==='UPLOAD_MARKERS')messageText='All seven nonclinical markers are received. Repeating this upload does not duplicate them.';}
  }
  compactCampaign(g);need(serializedBytes(g)<=1048576,'SAVE_CAPACITY','This action would exceed the local progress-file limit. Export your current progress, then restart practice or clear old work. No change was applied.');g.revision++;return {state:g,accepted:true,code,message:messageText};
 }catch(e){if(e.code)return {state:game,accepted:false,code:e.code,message:e.message};throw e;}
}
export function derive(game){
 const a=active(game),obj=objectives(a),eco=economy(game,a);
 return {attempt:clone(a),mode:a.mode,network:clone(a.network),guidedConnection:guidedEvidence(a),guidedConnectionCompleted:(game.guidedConnectionHistory||[]).length>0,devices:Object.values(a.devices).map(d=>({...clone(d),label:CATALOG[d.kind].label,roleLabel:ROLES[d.roleId].label,capabilities:[...CATALOG[d.kind].capabilities],assetId:CATALOG[d.kind].assetId,ports:ports(d).map(p=>({...p,cableId:a.cables.find(c=>c.fromPortId===p.id||c.toPortId===p.id)?.id||null}))})),cables:clone(a.cables),policy:clone(POLICIES[a.policyId]),diagnostics:[...a.observations].reverse().map(o=>({...clone(o),stale:o.testedTechnicalRevision!==a.technicalRevision})),objectives:obj,ready:obj.every(o=>o.met),missing:obj.filter(o=>!o.met).map(o=>o.label),messages:a.messages.map(m=>({...clone(m),stale:m.revision!==null&&m.revision!==a.technicalRevision})),guideQuotes:GUIDE_SECTIONS.map(s=>quote(game,a,s.id)),training:trainingStatus(a,game),learningFocus:learningFocus(a,game),modelUpdate:clone(a.spatialModelUpdate||null),economy:eco,explanations:clone(a.explanations),history:clone(a.events),hints:clone(a.hints),catalog:CATALOG,roles:ROLES,locations:LOCATIONS,policies:POLICIES,attachments:ATTACHMENTS,serverEnabled:a.serverEnabled,wearable:clone(a.wearable),fault:{...clone(a.fault),repaired:repaired(a)},currentResults:currentSuite(a),hasClient:!!game.contract,contractPhase:game.contract?.phase||null,revision:game.revision,campaignId:game.campaignId,buildVersion:BUILD_VERSION};
}
function guidedEvidenceText(g,a){
 const ids=[...(g.guidedConnectionHistory||[])];if(isGuided(a)&&!ids.includes(a.id))ids.push(a.id);
 if(!ids.length)return ['No guided connection lesson evidence recorded.'];
 return ids.flatMap(id=>{const source=g.attempts[id],p=guidedEvidence(source);return [
  `${id} | ${GUIDED_LESSON} | ${p.finished?'completed guided record':'current or unfinished guided practice'} | free help, zero earnings`,
  'Trainer supplied the powered desktop, switch, server, enabled services, addresses and server cable. This does not establish independent equipment selection.',
  p.firstConnection?`Player first connection: ${p.firstConnection.fromPortId} → ${p.firstConnection.toPortId} (${p.firstConnection.eventId}).`:'Player first connection: not yet evidenced by a passing test.',
  p.firstPass?`First passing reception test: ${p.firstPass.id} | ${p.firstPass.code} | technical revision ${p.firstPass.testedTechnicalRevision}.`:'First passing reception test: not recorded.',
  p.disconnection?`Player disconnected: ${p.disconnection.fromPortId} → ${p.disconnection.toPortId} (${p.disconnection.eventId}).`:'Cable experiment: not started.',
  p.experimentObservation?`Observed after disconnection: ${p.experimentObservation.id} | ${p.experimentObservation.code} | ${p.experimentObservation.pass?'a remaining path still passed':'service did not pass'} | technical revision ${p.experimentObservation.testedTechnicalRevision}.`:'Post-disconnection observation: not recorded before another technical change.',
  p.reconnection?`Player reconnection used by the retest: ${p.reconnection.fromPortId} → ${p.reconnection.toPortId} (${p.reconnection.eventId}).`:p.experimentOutcome==='alternate-path'?'No repair claimed: another actual path remained working.':p.repairEvent?`Post-experiment technical action: ${p.repairEvent.type} (${p.repairEvent.id}).`:'Post-experiment repair: not yet confirmed.',
  p.passingRetest?`Current confirmed result: ${p.passingRetest.id} | ${p.passingRetest.code} | path ${p.passingRetest.pathIds.join(' → ')}.`:'Current confirmed result: a fresh passing reception test is still needed.',
  'Learner explanation (unaltered):',p.explanation.text||'[No written explanation]',p.explanation.oral?'Oral explanation PENDING teacher conversation.':'',
  'Guided activity is separate from the six independent bootcamp checkpoints. Reasoning quality and mastery remain for teacher review.',''
 ];});
}
export function createEvidence(game){
 const a=active(game),j=evidenceObject(game,a);j.delivery=game.contract?.delivery?{id:game.contract.delivery.id,attemptId:game.contract.delivery.attemptId,netFee:game.contract.delivery.netFee,reservedCredits:game.contract.delivery.reservedCredits,consultationMinutes:game.contract.delivery.consultationMinutes,technicalRevision:game.contract.delivery.technicalRevision,evidenceRevision:game.contract.delivery.evidenceRevision}:null;j.settlement=clone(game.contract?.settlement||null);
 const lines=['CONNECT THE CLINIC — EVIDENCE FOR TEACHER REVIEW',`Build ${BUILD_VERSION} | Mission mission.clinic.001`,`Attempt ${a.id} | ${a.mode.toUpperCase()} | ${a.fixtureId}`,`Campaign ${game.campaignId} | revision ${game.revision} | technical ${a.technicalRevision} | evidence ${a.evidenceRevision}`,'',j.readyForTeacherReview?'CURRENT STATUS: ready for teacher review':'CURRENT STATUS: partial / work remains',j.teacherReview,'','EQUIPMENT & CONFIGURATION',...j.equipment.map(d=>`${d.role}: ${d.label}; ${d.powered?'on':'off'}; ${d.locationId}; ${d.address||'no host IP required'}${d.address?' / '+d.mask:''}; attachments: ${d.attachments.join(', ')||'none'}`),'',`Local subnet: ${a.network.cidr}. Services: ${a.serverEnabled?'on':'off'}.`,'CONNECTIONS',...a.cables.map(c=>`${c.fromPortId} → ${c.toPortId}`),'','CURRENT ENGINE CHECKS',...j.currentChecks.map(o=>`${o.pass?'PASS':'NEEDS WORK'} | ${o.label} | ${o.code}: ${o.message}`),'','FAULT & REPAIR',`Inherited profile: ${a.fault.initialAddress||'not provisioned'}. Current nurse: ${role(a,'role.nurse')?.address||'not selected'}.`,j.fault.evidenceType,...a.fault.changes.map(c=>`${c.origin}: ${c.before.address}/${c.before.mask} → ${c.after.address}/${c.after.mask} at technical revision ${c.technicalRevision}`),'','ACCESS POLICY',POLICIES[a.policyId].label,...Object.entries(POLICIES[a.policyId].matrix).map(([r,s])=>`${r}: ${s.join(', ')||'no service access'}`),'','WEARABLE JOURNEY',`${a.wearable.collected.length}/7 collected; ${a.wearable.returned?'returned to clinic':'not returned'}; ${a.wearable.handedOff.length}/7 handed off; ${a.wearable.receipts.length}/7 received.`, 'Nonclinical day markers only. Return-and-sync, not live home monitoring.','','STUDENT EXPLANATIONS (unaltered; presence is not a quality judgement)',...EXPLANATION_KEYS.flatMap(k=>[k.toUpperCase(),a.explanations[k].text||'[No written explanation]',a.explanations[k].oral?'Oral explanation PENDING teacher conversation.':'',k==='privacy'&&a.explanations[k].contextRevision!==a.policyRevision?'Access policy changed: explanation needs review.':'']),'','SUPPORT & BUSINESS CONTEXT',`Mode: ${a.mode}. Guide cost affects fictional business income only.`,`Gross fee ${j.economy.gross}; reserved ${j.economy.reserved}; estimated/frozen net ${j.economy.net}; wallet ${game.wallet}.`,`Additional simulated consultation minutes: ${j.economy.minutes}. No wall-clock or total work time is claimed.`,...Object.entries(a.hints).map(([id,tier])=>`${id}: through hint level ${tier}`),`Guide grants: ${JSON.stringify(j.guideGrants)}`,`Settlement: ${j.settlement?JSON.stringify(j.settlement):'not paid'}`,'','PRACTICE & SOURCE BOUNDARIES',`Bootcamp stations practised: ${game.training.completed.length}/3. Prior-learning route: ${game.training.priorLearning?'teacher-directed route recorded':'not used'}.`,`Imported local save: ${importLabel(game)}. Event history compacted: ${a.historyCompacted?'yes':'no'}.`,'Official outcome IDs are not assigned. This file does not award an IB grade.','','OUTSTANDING REQUIREMENTS',...(j.missing.length?j.missing:['No current practical requirement missing; teacher judgement remains pending.']),'','MODEL LIMITATIONS',...j.modelLimitations,'','RECORDED OBSERVATIONS',...j.recordedObservations.map(o=>`${o.id} | ${o.origin} | revision ${o.testedTechnicalRevision}${o.stale?' (earlier result)':''} | ${o.testId} | ${o.code} | ${o.pass?'pass':'not passed'}`)];
 const overview=j.teacherOverview;
 const overviewLines=['TEACHER OVERVIEW',`${overview.mode} | ${overview.attemptId}`,...(overview.modelUpdate?[`Model update: ${overview.modelUpdate}`]:[]),`Current focus: ${overview.stage}. ${overview.currentPracticalStatus}.`,`${isGuided(a)?'Current access policy (initially prepared by Jo)':'Chosen access policy'}: ${overview.chosenPolicy.label} (${overview.chosenPolicy.id}).`,`Failure → action → retest: ${overview.repairSequence.failure}; ${overview.repairSequence.change}; ${overview.repairSequence.retest}.`,`Pending oral review: ${overview.oralPending.length?overview.oralPending.map(x=>`${x.key} (${x.attemptId}; ${x.context})`).join('; '):'none marked'}.`,overview.assessment,...(a.mode==='training'?['This attempt earns zero credits. Any existing wallet, client delivery or receipt belongs to the preserved client contract.']:[]),''];
 lines.splice(5,0,...overviewLines);
 lines.push('','GUIDED CONNECTION EVIDENCE (up to four completed records and the active lesson)',...guidedEvidenceText(game,a),'','STATION 2 TRANSFER EVIDENCE',...transferEvidenceText(game,a),'','CURRENT ATTEMPT ACTION HISTORY (recorded origins; older events may be compacted)',...a.events.map(e=>`${e.id} | ${e.origin} | technical ${e.technicalRevision} | ${e.type} | ${JSON.stringify(e.payload)}`));
 if(isGuided(a))return {json:j,text:['CONNECT THE CLINIC — GUIDED CONNECTION EVIDENCE',`Build ${BUILD_VERSION} | Campaign ${game.campaignId} | ${a.id}`,...overviewLines,...guidedEvidenceText(game,a),'CURRENT RECEPTION CHECK',...j.currentChecks.map(o=>`${o.pass?'PASS':'NEEDS WORK'} | ${o.code}: ${o.message}`),'','RECORDED OBSERVATIONS',...j.recordedObservations.map(o=>`${o.id} | ${o.origin} | revision ${o.testedTechnicalRevision}${o.stale?' (earlier setup)':''} | ${o.testId} | ${o.code} | ${o.pass?'pass':'not passed'}`),'','MODEL LIMITATIONS',...j.modelLimitations,'','CURRENT ATTEMPT ACTION HISTORY',...a.events.map(e=>`${e.id} | ${e.origin} | technical ${e.technicalRevision} | ${e.type} | ${JSON.stringify(e.payload)}`),'','No names, patient information, official outcome codes or automatic grades are requested or produced.'].join('\n')};
 return {json:j,text:lines.join('\n')};
}
function counterId(id,prefix,counter){
 if(typeof id!=='string'||!id.startsWith(prefix))return false;
 const suffix=id.slice(prefix.length);return /^\d{4,}$/.test(suffix)&&Number(suffix)>0&&Number(suffix)<=counter;
}
const sameCable=(x,y)=>!!x&&!!y&&['id','fromDeviceId','fromPortId','toDeviceId','toPortId'].every(k=>x[k]===y[k]);
function validateGuidedCableFacts(a,cables){
 for(const cable of cables){
  const e=a.events.find(e=>e.type==='CONNECT_PORTS'&&e.payload.id===cable.id);
  if(e)need(sameCable(cable,e.payload),'SAVE_INVALID','A guided connection action disagrees with the cable endpoints in its network witness.');
 }
}
function validateGuidedWitness(a,w,observation=null){
 need(w&&typeof w==='object'&&serializedBytes(w)<=16000&&int(w.technicalRevision)&&w.technicalRevision<=a.technicalRevision&&w.observationId===(observation?.id||null),'SAVE_INVALID','The guided network witness is missing or inconsistent.');
 const dummy={attemptSequence:Number(a.id.split('.').at(-1))-1,attempts:{}};
 const snapshot=newAttempt(dummy,'training');
 Object.assign(snapshot,{network:clone(a.network),devices:clone(w.devices),cables:clone(w.cables),serverEnabled:w.serverEnabled,policyId:w.policyId,technicalRevision:w.technicalRevision,deviceSequence:a.deviceSequence,cableSequence:a.cableSequence});
 validateAttempt(snapshot);
 validateGuidedCableFacts(a,snapshot.cables);
 if(observation){
  const result=evaluate(snapshot,specifications('reception')[0]);
  need(observation.origin==='player'&&observation.testId==='reception'&&observation.testedTechnicalRevision===w.technicalRevision&&['sourceDeviceId','serviceId','actorRoleId','contextLocationId','expectedDenied','pass','code','message'].every(k=>observation[k]===result[k])&&JSON.stringify(observation.pathIds)===JSON.stringify(result.pathIds),'SAVE_INVALID','A guided observation does not match its recorded network witness.');
 }
 return snapshot;
}
function validateGuidedHistory(a){
 const c=a.guidedConnection;
 validateGuidedCableFacts(a,a.cables);
 need(c&&typeof c==='object'&&c.lessonId===GUIDED_LESSON&&(c.returnAttemptId===null||(/^attempt\.\d{4,}$/.test(c.returnAttemptId)&&c.returnAttemptId!==a.id))&&Array.isArray(c.setupEventIds)&&c.setupEventIds.length===8,'SAVE_INVALID','Invalid guided lesson setup or return target.');
 const start=a.events.find(e=>e.id===c.startEventId);
 need(start&&start.type==='START_GUIDED_CONNECTION'&&['player','mission-setup'].includes(start.origin)&&start.payload.lessonId===GUIDED_LESSON&&start.payload.trainerSupplied===true&&(start.payload.returnAttemptId===null||(/^attempt\.\d{4,}$/.test(start.payload.returnAttemptId)&&start.payload.returnAttemptId!==a.id))&&(c.exitEventId===null?c.returnAttemptId===start.payload.returnAttemptId:c.returnAttemptId===null),'SAVE_INVALID','Guided entry and return provenance disagree.');
 const setup=validateGuidedWitness(a,c.setup);
 need(Object.keys(setup.devices).length===3&&role(setup,'role.reception')?.kind==='desktop'&&role(setup,'role.records')?.kind==='server'&&role(setup,'infra.switch')?.kind==='switch4'&&Object.values(setup.devices).every(d=>d.powered&&d.locationId===ROLES[d.roleId].location)&&setup.serverEnabled&&setup.policyId==='policy.roles-separated'&&role(setup,'role.reception').address===a.network.receptionAddress&&role(setup,'role.records').address===a.network.serverAddress&&setup.cables.length===1,'SAVE_INVALID','The guided fixture must record powered trainer equipment with one missing reception cable.');
 const setupRoles=setup.cables.flatMap(x=>[setup.devices[x.fromDeviceId].roleId,setup.devices[x.toDeviceId].roleId]);
 need(setupRoles.includes('role.records')&&setupRoles.includes('infra.switch')&&!setup.cables.some(x=>[x.fromDeviceId,x.toDeviceId].includes(role(setup,'role.reception').id)),'SAVE_INVALID','The supplied cable must connect the server to the switch.');
 const setupEvents=c.setupEventIds.map(id=>a.events.find(e=>e.id===id));
 need(new Set(c.setupEventIds).size===8&&setupEvents.every((e,i)=>e&&e.origin==='mission-setup'&&e.sequence===i+1)&&setupEvents.filter(e=>e.type==='CHOOSE_DEVICE').length===3&&setupEvents.filter(e=>e.type==='POWER_DEVICE'&&e.payload.on===true).length===3&&setupEvents.some(e=>e.type==='SET_SERVICE_STATE'&&e.payload.enabled===true)&&setupEvents.some(e=>e.type==='CONNECT_PORTS'&&JSON.stringify(e.payload)===JSON.stringify(setup.cables[0]))&&setupEvents.at(-1).technicalRevision===c.setup.technicalRevision,'SAVE_INVALID','Trainer setup needs its exact original setup actions.');
 for(const d of Object.values(setup.devices))need(setupEvents.some(e=>e.type==='CHOOSE_DEVICE'&&e.payload.deviceId===d.id&&e.payload.roleId===d.roleId&&e.payload.kind===d.kind)&&setupEvents.some(e=>e.type==='POWER_DEVICE'&&e.payload.deviceId===d.id&&e.payload.on===true),'SAVE_INVALID','Trainer equipment and its setup events disagree.');
 const checkObservation=(id,w)=>{
  const o=observationById(a,id),e=o&&a.events.find(e=>e.id===o.eventId);
  need(o&&e&&e.type==='RUN_PROBE'&&e.origin==='player'&&e.technicalRevision===o.testedTechnicalRevision&&e.payload.observationId===o.id&&e.payload.testId==='reception'&&e.payload.code===o.code&&e.payload.pass===o.pass,'SAVE_INVALID','Guided progress needs its actual player reception probe.');
  validateGuidedWitness(a,w,o);return o;
 };
 const checkCable=(x,type)=>{
  const e=x&&a.events.find(e=>e.id===x.eventId);
  need(x&&counterId(x.id,a.id+'.cable.',a.cableSequence)&&e&&e.type===type&&e.origin==='player'&&x.origin==='player'&&e.technicalRevision===x.technicalRevision&&['id','fromDeviceId','fromPortId','toDeviceId','toPortId'].every(k=>x[k]===e.payload[k]),'SAVE_INVALID','Guided cable evidence disagrees with its player action.');return e;
 };
 let first=null,experiment=null;
 if(c.firstPassId!==null){
  first=checkObservation(c.firstPassId,c.firstPassWitness);const e=checkCable(c.firstConnection,'CONNECT_PORTS');
  need(first.pass&&first.code==='SERVICE_AVAILABLE'&&first.pathIds.includes(c.firstConnection.id)&&sameCable(c.firstConnection,c.firstPassWitness.cables.find(x=>x.id===c.firstConnection.id))&&e.sequence>8&&e.sequence<Number(first.eventId.split('.').at(-1)),'SAVE_INVALID','The first guided pass needs an earlier player-created path connection with matching endpoints.');
 }else need(c.firstPassWitness===null&&c.firstConnection===null,'SAVE_INVALID','A guided connection witness cannot claim an absent first pass.');
 if(c.disconnection!==null){
  need(first,'SAVE_INVALID','The cable experiment requires a prior guided pass.');
  const before=checkObservation(c.beforeExperimentPassId,c.beforeExperimentWitness),e=checkCable(c.disconnection,'DISCONNECT_CABLE');
  need(before.pass&&before.pathIds.includes(c.disconnection.id)&&before.testedTechnicalRevision+1===c.disconnection.technicalRevision&&Number(first.eventId.split('.').at(-1))<=Number(before.eventId.split('.').at(-1))&&Number(before.eventId.split('.').at(-1))<e.sequence&&sameCable(c.disconnection,c.beforeExperimentWitness.cables.find(x=>x.id===c.disconnection.id)),'SAVE_INVALID','The guided disconnection must remove the matching cable endpoints from a freshly tested working path.');
 }else need(c.beforeExperimentPassId===null&&c.beforeExperimentWitness===null&&c.experimentObservationId===null&&c.experimentWitness===null,'SAVE_INVALID','An experiment needs its actual disconnection.');
 if(c.experimentObservationId!==null){
  need(c.disconnection,'SAVE_INVALID','An observed cable experiment requires its disconnection.');experiment=checkObservation(c.experimentObservationId,c.experimentWitness);
  const before=c.beforeExperimentWitness,w=c.experimentWitness;
  need(experiment.testedTechnicalRevision===c.disconnection.technicalRevision&&Number(experiment.eventId.split('.').at(-1))>Number(c.disconnection.eventId.split('.').at(-1))&&JSON.stringify(w.devices)===JSON.stringify(before.devices)&&w.serverEnabled===before.serverEnabled&&w.policyId===before.policyId&&JSON.stringify(w.cables)===JSON.stringify(before.cables.filter(x=>x.id!==c.disconnection.id)),'SAVE_INVALID','The experiment must observe the actual cable removal before another technical change.');
 }else need(c.experimentWitness===null,'SAVE_INVALID','An experiment witness needs its observation.');
 const p=guidedEvidence(a),saved=p.explanation.eventId&&a.events.find(e=>e.id===p.explanation.eventId);
 if(a.explanations.repair.text.trim()||a.explanations.repair.oral)need(saved&&saved.payload.hasText===!!a.explanations.repair.text.trim()&&saved.payload.oral===a.explanations.repair.oral,'SAVE_INVALID','The guided explanation needs its submitted player event.');
 if(c.explanationObservationId!==null){const o=checkObservation(c.explanationObservationId,c.explanationWitness);need(experiment&&saved&&o.pass&&o.testedTechnicalRevision===saved.technicalRevision&&Number(o.eventId.split('.').at(-1))>=Number(experiment.eventId.split('.').at(-1))&&Number(o.eventId.split('.').at(-1))<saved.sequence,'SAVE_INVALID','Guided reflection must follow its confirmed post-experiment result.');}else need(c.explanationWitness===null,'SAVE_INVALID','A reflection witness needs its actual reception observation.');
 for(const key of ['exitEventId','finishedEventId'])if(c[key]!==null){const e=a.events.find(e=>e.id===c[key]);need(e&&e.origin==='player'&&(key==='finishedEventId'?e.type==='FINISH_GUIDED_CONNECTION':['FINISH_GUIDED_CONNECTION','RETURN_FROM_GUIDED_CONNECTION'].includes(e.type))&&e.payload.lessonId===GUIDED_LESSON&&e.payload.independentMastery===false&&/^attempt\.\d{4,}$/.test(e.payload.destinationAttemptId)&&typeof e.payload.returnedToSavedWork==='boolean','SAVE_INVALID','Guided exit provenance is inconsistent.');}
 if(c.finishedEventId!==null){const e=a.events.find(e=>e.id===c.finishedEventId);need(p.canFinish&&c.returnAttemptId===null&&e.sequence>Number(p.explanation.eventId.split('.').at(-1)),'SAVE_INVALID','Completed guided evidence needs its actual observations and later explanation.');}
}
function cableWitness(a,c){
 return !!(c&&counterId(c.id,a.id+'.cable.',a.cableSequence)&&counterId(c.fromDeviceId,a.id+'.device.',a.deviceSequence)&&counterId(c.toDeviceId,a.id+'.device.',a.deviceSequence)&&c.fromDeviceId!==c.toDeviceId&&typeof c.fromPortId==='string'&&typeof c.toPortId==='string'&&c.fromPortId.startsWith(c.fromDeviceId+'.eth')&&c.toPortId.startsWith(c.toDeviceId+'.eth')&&/\.eth[1-8]$/.test(c.fromPortId)&&/\.eth[1-8]$/.test(c.toPortId)&&counterId(c.eventId,a.id+'.event.',a.sequence)&&int(c.technicalRevision)&&c.technicalRevision<=a.technicalRevision);
}
function validateUplinkHistory(a){
 const u=a.fault.uplink;
 need(u&&cableWitness(a,u.seed)&&u.seed.origin==='mission-setup'&&Array.isArray(u.reconnections)&&u.reconnections.length<=8,'SAVE_INVALID','The link-transfer fixture needs a bounded disconnection and reconnection history.');
 const roleOf=id=>a.devices[id]?.roleId||a.events.find(e=>e.type==='CHOOSE_DEVICE'&&e.payload?.deviceId===id)?.payload.roleId;
 const checkCableEvent=(c,type,origin)=>{
  const e=a.events.find(e=>e.id===c.eventId),roles=[roleOf(c.fromDeviceId),roleOf(c.toDeviceId)];
  need(e&&e.type===type&&e.origin===origin&&e.technicalRevision===c.technicalRevision&&['id','fromDeviceId','fromPortId','toDeviceId','toPortId'].every(k=>e.payload[k]===c[k])&&roles.includes('infra.ap')&&roles.includes('infra.switch'),'SAVE_INVALID','The link-transfer cable witness disagrees with its recorded action.');
 };
 checkCableEvent(u.seed,'DISCONNECT_CABLE','mission-setup');
 let prior=0;const ids=new Set();
 for(const c of u.reconnections){
  const baseline=a.fault.baselineFailures.find(f=>f.id===c?.baselineObservationId),o=baseline&&a.observations.find(o=>o.id===baseline.id);
  need(cableWitness(a,c)&&c.origin==='player'&&!ids.has(c.id)&&c.technicalRevision>prior&&baseline&&baseline.technicalRevision<c.technicalRevision&&o&&Number(o.eventId?.split('.').at(-1))<Number(c.eventId.split('.').at(-1)),'SAVE_INVALID','A reconnection needs an earlier observed uplink failure.');
  checkCableEvent(c,'CONNECT_PORTS','player');ids.add(c.id);prior=c.technicalRevision;
 }
 for(const f of a.fault.baselineFailures){const o=a.observations.find(o=>o.id===f.id),e=a.events.find(e=>e.id===o.eventId);need(f.technicalRevision>=u.seed.technicalRevision&&e&&e.type==='RUN_PROBE'&&e.origin==='player'&&e.technicalRevision===f.technicalRevision&&e.payload.observationId===o.id&&e.payload.testId==='nurse'&&e.payload.code==='PORT_DISCONNECTED'&&e.payload.pass===false,'SAVE_INVALID','The uplink failure needs its actual player diagnostic event.');}
 const saved=[...a.events].reverse().find(e=>e.type==='SAVE_EXPLANATION'&&e.origin==='player'&&e.payload.key==='repair');
 if(a.explanations.repair.text.trim()||a.explanations.repair.oral)need(saved&&saved.payload.hasText===!!a.explanations.repair.text.trim()&&saved.payload.oral===a.explanations.repair.oral,'SAVE_INVALID','A transfer explanation needs its submitted explanation event.');
}
function validateTransferCheckpoint(h,source){
 const t=h.transferEvidence,attemptId=h.attemptId;
 need(t&&h.fixtureId===UPLINK_FIXTURE&&h.transferKind==='physical-uplink'&&h.stationId===STATIONS[1].id&&h.stage==='transfer'&&t.kind==='physical-uplink'&&t.faultId===UPLINK_FAULT&&t.readyForTeacherReview===true,'SAVE_INVALID','The transfer checkpoint kind or fixture is inconsistent.');
 const bounds={id:attemptId,cableSequence:1000000,deviceSequence:1000000,sequence:1000000,technicalRevision:h.technicalRevision};
 const f=t.observedFailure,r=t.reconnection,p=t.passingRetest,x=t.explanation;
 need(cableWitness(bounds,t.seededDisconnection)&&t.seededDisconnection.origin==='mission-setup'&&cableWitness(bounds,r)&&r.origin==='player'&&r.baselineObservationId===f?.id&&r.technicalRevision>f?.testedTechnicalRevision,'SAVE_INVALID','The transfer checkpoint needs a genuine disconnection and a later reconnection.');
 for(const o of [f,p])need(o&&counterId(o.id,attemptId+'.observation.',1000000)&&counterId(o.eventId,attemptId+'.event.',1000000)&&o.testId==='nurse'&&o.origin==='player'&&o.actorRoleId==='role.nurse'&&o.serviceId==='service.workspace'&&o.contextLocationId===null&&o.expectedDenied===false&&int(o.testedTechnicalRevision)&&o.testedTechnicalRevision<=h.technicalRevision&&Array.isArray(o.pathIds)&&o.pathIds.length<=40&&o.pathIds.every(id=>typeof id==='string'&&id.startsWith(attemptId+'.'))&&typeof o.message==='string'&&o.message.length<=1000,'SAVE_INVALID','The transfer checkpoint needs bounded player nurse observations.');
 need(f.code==='PORT_DISCONNECTED'&&f.pass===false&&f.testedTechnicalRevision>=t.seededDisconnection.technicalRevision&&p.code==='SERVICE_AVAILABLE'&&p.pass===true&&p.testedTechnicalRevision===h.technicalRevision&&p.testedTechnicalRevision>=r.technicalRevision&&p.pathIds.includes(r.id)&&Number(f.eventId.split('.').at(-1))<Number(r.eventId.split('.').at(-1))&&Number(r.eventId.split('.').at(-1))<Number(p.eventId.split('.').at(-1)),'SAVE_INVALID','The transfer observation, repair and passing retest are out of order.');
 need(x&&x.key==='repair'&&typeof x.text==='string'&&x.text.length<=2000&&typeof x.oral==='boolean'&&(x.text.trim()||x.oral)&&x.submitted===true&&x.review==='pending-teacher'&&counterId(x.eventId,attemptId+'.event.',1000000)&&int(x.contextRevision)&&['RUN_PROBE','CONNECT_PORTS','SAVE_EXPLANATION'].every(type=>h.practiceActions.includes(type))&&h.observations.some(o=>o.id===p.id&&o.pass===true&&o.origin==='player'&&o.code==='SERVICE_AVAILABLE')&&h.checks.length===4,'SAVE_INVALID','The transfer checkpoint needs the learner’s explanation or explicit pending oral review.');
 if(source)need(JSON.stringify(t)===JSON.stringify(uplinkEvidence(source)),'SAVE_INVALID','The frozen transfer checkpoint disagrees with its source attempt.');
}
function updateLegacySpatialObservations(a){
 if(a[LEGACY_SPATIAL_MODEL]||a.spatialModelVersion!==undefined||!Object.values(a.devices).some(d=>d.roleId!=='role.monitor'&&!inClinic(d)))return;
 const historical={...a,[LEGACY_SPATIAL_MODEL]:true};
 const affected=a.observations.filter(o=>{
  if(o.testedTechnicalRevision!==a.technicalRevision)return false;
  const spec=specifications('all').find(s=>s.testId===o.testId),old=evaluate(historical,spec),now=evaluate(a,spec);
  return old.code===o.code&&old.pass===o.pass&&(old.code!==now.code||old.pass!==now.pass);
 });
 if(!affected.length)return;
 need(a.technicalRevision<1000000&&a.evidenceRevision<1000000&&a.sequence<1000000,'SAVE_INVALID','This older attempt has no counter capacity for a labelled model update.');
 const previousTechnicalRevision=a.technicalRevision,note='The model now keeps all clinic Ethernet and Wi-Fi service paths inside the clinic. Earlier observations use the previous location rule and are stale. Device locations, cables and associations have not been changed.';
 bump(a);a.evidenceRevision++;a.spatialModelVersion=2;
 a.spatialModelUpdate={from:1,to:2,previousTechnicalRevision,technicalRevision:a.technicalRevision,eventId:`${a.id}.event.${pad(a.sequence+1)}`,note};
 event(null,a,'MODEL_UPDATE',{from:1,to:2,previousTechnicalRevision,affectedObservationCount:affected.length,reason:note},'mission-setup');
}
function validateAttempt(a){
 need(a&&typeof a==='object'&&!Array.isArray(a),'SAVE_INVALID','An attempt is missing.');
 need(/^attempt\.\d{4,}$/.test(a.id)&&['training','client'].includes(a.mode),'SAVE_INVALID','Invalid attempt identity or mode.');
 need(a.testSuiteVersion===undefined||[1,2].includes(a.testSuiteVersion),'SAVE_INVALID','Unknown diagnostic suite version.');
 need(a.spatialModelVersion===undefined||a.spatialModelVersion===2,'SAVE_INVALID','Unknown current spatial model version.');
 need(['fixture.clinic.local.001','fixture.bootcamp.local.001','fixture.bootcamp.transfer.001','fixture.clinic.practice.001',UPLINK_FIXTURE,CLINIC_PRACTICE_FIXTURE,GUIDED_FIXTURE].includes(a.fixtureId),'SAVE_INVALID','Unknown fixture.');
 for(const k of ['technicalRevision','evidenceRevision','sequence','deviceSequence','cableSequence','observationSequence','policyRevision'])need(int(a[k])&&a[k]<=1000000,'SAVE_INVALID','Invalid revision or sequence counter.');
 need(a.network&&['10.40.10.0/24','192.168.50.0/24','192.168.70.0/24'].includes(a.network.cidr)&&a.network.mask==='255.255.255.0','SAVE_INVALID','Unknown local-network fixture.');
 const base=a.network.cidr.slice(0,a.network.cidr.lastIndexOf('.'));
 need(a.network.base===base&&a.network.serverAddress===base+'.10'&&a.network.receptionAddress===base+'.20'&&parseIPv4(a.network.inheritedNurseAddress)!==null,'SAVE_INVALID','Inconsistent network fixture addresses.');
 need(a.mode!=='client'||a.network.cidr==='10.40.10.0/24','SAVE_INVALID','Client attempts must use the clinic network.');
 need(a.devices&&typeof a.devices==='object'&&!Array.isArray(a.devices)&&Object.keys(a.devices).length<=6,'SAVE_INVALID','Too many devices or an invalid device collection.');
 const assigned=new Set(),ids=new Set();
 for(const [id,d] of Object.entries(a.devices)){
  need(d&&d.id===id&&id.startsWith(a.id+'.device.')&&/^\d{4,}$/.test(id.slice((a.id+'.device.').length))&&Number(id.split('.').at(-1))<=a.deviceSequence,'SAVE_INVALID','Invalid device identity.');
  need(known(CATALOG,d.kind)&&known(ROLES,d.roleId)&&ROLES[d.roleId].choices.includes(d.kind)&&!assigned.has(d.roleId),'SAVE_INVALID','Unknown, duplicate or incompatible device role.');assigned.add(d.roleId);ids.add(d.id);
  need(LOCATIONS.some(l=>l.id===d.locationId)&&typeof d.powered==='boolean','SAVE_INVALID','Invalid device location or power state.');
  need(typeof d.address==='string'&&(d.address===''||parseIPv4(d.address)!==null)&&maskPrefix(d.mask)!==null&&maskPrefix(d.mask)>=1&&maskPrefix(d.mask)<=30,'SAVE_INVALID','Invalid saved address or mask.');
  need(Array.isArray(d.attachments)&&d.attachments.length<=2&&new Set(d.attachments).size===d.attachments.length,'SAVE_INVALID','Invalid attachment list.');
  for(const k of d.attachments)need(known(ATTACHMENTS,k)&&(k==='ethernet-adapter'?['laptop','tablet'].includes(d.kind):CATALOG[d.kind].capabilities.includes('sensor-companion')),'SAVE_INVALID','Incompatible saved attachment.');
  need(d.wifiApId===null||(typeof d.wifiApId==='string'&&a.devices[d.wifiApId]?.kind==='access-point'&&CATALOG[d.kind].wifi&&d.kind!=='access-point'),'SAVE_INVALID','Invalid Wi-Fi association.');
 }
 need(Array.isArray(a.cables)&&a.cables.length<=16,'SAVE_INVALID','Invalid cable collection.');const usedPorts=new Set(),cableIds=new Set();
 for(const c of a.cables){
  need(c&&counterId(c.id,a.id+'.cable.',a.cableSequence)&&!cableIds.has(c.id)&&ids.has(c.fromDeviceId)&&ids.has(c.toDeviceId)&&c.fromDeviceId!==c.toDeviceId,'SAVE_INVALID','Invalid cable reference.');
  const p=port(a,c.fromDeviceId,c.fromPortId),q=port(a,c.toDeviceId,c.toPortId);need(p?.medium==='ethernet'&&q?.medium==='ethernet'&&!usedPorts.has(p.id)&&!usedPorts.has(q.id),'SAVE_INVALID','A saved cable uses a missing, incompatible or occupied port.');usedPorts.add(p.id);usedPorts.add(q.id);cableIds.add(c.id);
 }
 need(typeof a.serverEnabled==='boolean'&&known(POLICIES,a.policyId),'SAVE_INVALID','Invalid service or access policy.');
 need(a.wearable&&typeof a.wearable.returned==='boolean','SAVE_INVALID','Invalid wearable state.');
 for(const k of ['collected','handedOff','receipts']){const list=a.wearable[k];need(Array.isArray(list)&&list.length<=7&&new Set(list).size===list.length&&list.every(id=>typeof id==='string'&&new RegExp('^'+a.id.replaceAll('.','\\.')+'\\.marker\\.day[1-7]$').test(id)),'SAVE_INVALID','Invalid marker collection.');}
 need(a.wearable.handedOff.every(x=>a.wearable.collected.includes(x))&&a.wearable.receipts.every(x=>a.wearable.handedOff.includes(x)),'SAVE_INVALID','Marker stages are inconsistent.');
 need((a.wearable.handedOff.length===0||(a.wearable.returned&&a.wearable.collected.length===7&&a.wearable.handedOff.length===7))&&(a.wearable.receipts.length===0||a.wearable.handedOff.length===7),'SAVE_INVALID','Marker transfer requires completed collection and return.');
 need(a.wearable.companionDeviceId===null||(typeof a.wearable.companionDeviceId==='string'&&a.wearable.companionDeviceId.startsWith(a.id+'.device.')),'SAVE_INVALID','Invalid companion provenance.');
 need(a.fault&&a.fault.id===(isUplinkTransfer(a)?UPLINK_FAULT:'fault.nurse.legacy-address')&&typeof a.fault.seeded==='boolean'&&Array.isArray(a.fault.changes)&&a.fault.changes.length<=500&&Array.isArray(a.fault.baselineFailures)&&a.fault.baselineFailures.length<=8,'SAVE_INVALID','Invalid fault history.');
 need(isUplinkTransfer(a)||a.fault.uplink===undefined,'SAVE_INVALID','Link-transfer provenance belongs only to its physical-fault fixture.');
 need(!a.fault.seeded||(parseIPv4(a.fault.initialAddress)!==null&&parseIPv4(a.fault.lastAddress)!==null),'SAVE_INVALID','Invalid inherited profile.');
 for(const c of a.fault.changes)need(c&&['player','mission-setup','trainer-demo'].includes(c.origin)&&parseIPv4(c.before?.address)!==null&&parseIPv4(c.after?.address)!==null&&maskPrefix(c.before?.mask)!==null&&maskPrefix(c.after?.mask)!==null&&int(c.technicalRevision)&&c.technicalRevision<=a.technicalRevision,'SAVE_INVALID','Invalid address change history.');
 need(a.explanations&&typeof a.explanations==='object','SAVE_INVALID','Explanation data is missing.');
 for(const key of EXPLANATION_KEYS){const x=a.explanations[key];need(x&&typeof x.text==='string'&&x.text.length<=2000&&typeof x.oral==='boolean'&&int(x.contextRevision)&&x.contextRevision<=a.policyRevision,'SAVE_INVALID','Invalid explanation.');}
 need(a.hints&&typeof a.hints==='object'&&!Array.isArray(a.hints),'SAVE_INVALID','Invalid guide history.');
 for(const [id,tier] of Object.entries(a.hints))need(GUIDE_SECTIONS.some(s=>s.id===id)&&[1,2,3].includes(tier),'SAVE_INVALID','Unknown guide section or tier.');
 need(Array.isArray(a.freeGuideGrants)&&a.freeGuideGrants.length<=3&&new Set(a.freeGuideGrants).size===a.freeGuideGrants.length&&a.freeGuideGrants.every(id=>GUIDE_SECTIONS.some(s=>s.id===id)),'SAVE_INVALID','Unknown free-guide grant.');
 need(a.training&&[0,1,2].includes(a.training.stationIndex)&&['practice','transfer','complete','replay','clinic-practice','guided-connection'].includes(a.training.stage)&&typeof a.training.isDemo==='boolean'&&Array.isArray(a.training.practiceActions)&&a.training.practiceActions.length<=40&&a.training.practiceActions.every(s=>typeof s==='string'&&s.length<=80)&&Array.isArray(a.training.demoSteps)&&a.training.demoSteps.length<=12,'SAVE_INVALID','Invalid training checkpoint.');
 const t=a.training;
 if(isGuided(a))need(a.mode==='training'&&a.spatialModelVersion===2&&t.stationIndex===0&&t.stage==='guided-connection'&&!t.isDemo&&a.network.cidr==='192.168.50.0/24','SAVE_INVALID','The guided connection fixture must remain separate free practice.');
 else need(a.guidedConnection===undefined&&t.stage!=='guided-connection','SAVE_INVALID','Guided lesson data cannot be attached to another fixture.');
 if(a.mode==='client')need(a.fixtureId==='fixture.clinic.local.001'&&t.stationIndex===0&&t.stage==='practice'&&!t.isDemo,'SAVE_INVALID','Client mode cannot use a practice fixture or checkpoint.');
 if(a.fixtureId==='fixture.bootcamp.local.001')need(a.mode==='training'&&t.stage==='practice'&&a.network.cidr==='192.168.50.0/24','SAVE_INVALID','The bootcamp practice fixture and stage disagree.');
 if(a.fixtureId==='fixture.bootcamp.transfer.001')need(a.mode==='training'&&(t.stage==='transfer'||(t.stage==='complete'&&t.stationIndex===2&&!t.isDemo))&&a.network.cidr==='192.168.70.0/24','SAVE_INVALID','The legacy bootcamp transfer fixture and stage disagree.');
 if(a.fixtureId===UPLINK_FIXTURE)need(a.mode==='training'&&a.spatialModelVersion===2&&t.stationIndex===1&&t.stage==='transfer'&&a.network.cidr==='192.168.70.0/24'&&a.network.inheritedNurseAddress==='192.168.70.30'&&a.fault.initialAddress==='192.168.70.30'&&a.fault.seeded,'SAVE_INVALID','The uplink transfer must start with its correct nurse address.');
 if(a.fixtureId===CLINIC_PRACTICE_FIXTURE)need(a.mode==='training'&&a.spatialModelVersion===2&&t.stationIndex===0&&t.stage==='clinic-practice'&&!t.isDemo&&a.network.cidr==='10.40.10.0/24'&&a.network.inheritedNurseAddress==='10.40.20.30'&&t.provenance?.route==='teacher-selected-local'&&t.provenance.authenticated===false&&(t.provenance.sourceClientAttemptId===null||/^attempt\.\d{4,}$/.test(t.provenance.sourceClientAttemptId)),'SAVE_INVALID','Full-clinic practice needs its own zero-earning training fixture and local selection provenance.');
 if(a.fixtureId==='fixture.clinic.practice.001')need(a.mode==='training'&&t.stationIndex===2&&t.stage==='replay'&&!t.isDemo&&a.network.cidr==='10.40.10.0/24','SAVE_INVALID','Delivery replay must remain a separate training attempt.');
 if(a.mode==='training')need(a.fixtureId!=='fixture.clinic.local.001','SAVE_INVALID','Training cannot claim the client fixture.');
 need(Array.isArray(a.observations)&&a.observations.length<=180&&Array.isArray(a.events)&&a.events.length<=400&&Array.isArray(a.messages)&&a.messages.length<=6,'SAVE_INVALID','Observation/event history exceeds bounds.');
 const obsIds=new Set();let priorObsSequence=0;
 for(const o of a.observations){
  const spec=specifications('all').find(s=>s.testId===o?.testId);
  need(o&&counterId(o.id,a.id+'.observation.',a.observationSequence)&&!obsIds.has(o.id)&&spec&&typeof o.pass==='boolean'&&typeof o.code==='string'&&o.code.length<=60&&typeof o.message==='string'&&o.message.length<=1000&&int(o.testedTechnicalRevision)&&o.testedTechnicalRevision<=a.technicalRevision&&['player','trainer-demo','engine-check','mission-setup'].includes(o.origin)&&Array.isArray(o.pathIds)&&o.pathIds.length<=40,'SAVE_INVALID','Invalid observation.');
  const sequence=Number(o.id.split('.').at(-1));need(sequence>priorObsSequence,'SAVE_INVALID','Observation sequence is not monotonic.');priorObsSequence=sequence;
  need(o.actorRoleId===spec.actorRoleId&&o.serviceId===spec.serviceId&&o.contextLocationId===spec.contextLocationId&&(spec.expect==='booking-policy'?(typeof o.expectedDenied==='boolean'&&(o.testedTechnicalRevision!==a.technicalRevision||o.expectedDenied===(a.policyId==='policy.roles-separated'))):o.expectedDenied===(spec.expect==='deny')),'SAVE_INVALID','Observation principal, service or context does not match its test.');
  need(o.sourceDeviceId===null||counterId(o.sourceDeviceId,a.id+'.device.',a.deviceSequence),'SAVE_INVALID','Invalid observation source reference.');
  if(o.testedTechnicalRevision===a.technicalRevision)need(o.sourceDeviceId===(role(a,spec.sourceRoleId)?.id||null),'SAVE_INVALID','A current observation has the wrong source.');
  if(o.contextLocationId)need(o.origin==='engine-check','SAVE_INVALID','A room scenario check is not a player visit.');
  obsIds.add(o.id);
 }
 for(const f of a.fault.baselineFailures){const o=a.observations.find(o=>o.id===f?.id);need(o&&o.testId==='nurse'&&o.origin==='player'&&(isUplinkTransfer(a)?o.code==='PORT_DISCONNECTED'&&!o.pass:['ADDRESS_WRONG_SUBNET','ADDRESS_OFF_LINK','ADDRESS_DUPLICATE'].includes(o.code))&&f.code===o.code&&f.technicalRevision===o.testedTechnicalRevision&&parseIPv4(f.address)!==null,'SAVE_INVALID','Fault evidence has a dangling or inconsistent observation.');}
 const eventIds=new Set();let priorEventSequence=0;
 for(const e of a.events){need(e&&counterId(e.id,a.id+'.event.',a.sequence)&&!eventIds.has(e.id)&&int(e.sequence)&&e.sequence===Number(e.id.split('.').at(-1))&&e.sequence>priorEventSequence&&typeof e.type==='string'&&e.type.length<=80&&['player','trainer-demo','engine-check','mission-setup'].includes(e.origin)&&int(e.technicalRevision)&&e.technicalRevision<=a.technicalRevision&&int(e.evidenceRevision)&&e.evidenceRevision<=a.evidenceRevision&&e.payload&&typeof e.payload==='object'&&!Array.isArray(e.payload)&&serializedBytes(e.payload)<=3000,'SAVE_INVALID','Invalid or duplicate event identity/revision.');eventIds.add(e.id);priorEventSequence=e.sequence;}
 if(isUplinkTransfer(a))validateUplinkHistory(a);
 if(a.spatialModelUpdate!==undefined){const u=a.spatialModelUpdate,e=a.events.find(e=>e.id===u?.eventId);need(a.spatialModelVersion===2&&u&&u.from===1&&u.to===2&&int(u.previousTechnicalRevision)&&u.technicalRevision===u.previousTechnicalRevision+1&&u.technicalRevision<=a.technicalRevision&&typeof u.note==='string'&&u.note.length<=500&&e&&e.type==='MODEL_UPDATE'&&e.origin==='mission-setup'&&e.technicalRevision===u.technicalRevision&&e.payload.from===1&&e.payload.to===2&&e.payload.previousTechnicalRevision===u.previousTechnicalRevision&&e.payload.reason===u.note,'SAVE_INVALID','The spatial model update has inconsistent provenance.');}
 const messageIds=new Set(),templates=new Set();
 const allowedTemplates=['phone.clinic.brief.001','phone.clinic.quote.001','phone.clinic.nurse-symptom.001','phone.clinic.nurse-booking-request.001','phone.clinic.marker-receipt.001','phone.clinic.handover.001'];
 for(const m of a.messages){need(m&&counterId(m.id,a.id+'.message.',6)&&!messageIds.has(m.id)&&allowedTemplates.includes(m.templateId)&&!templates.has(m.templateId)&&typeof m.speaker==='string'&&m.speaker.length<=120&&typeof m.text==='string'&&m.text.length<=1500&&typeof m.read==='boolean'&&(m.revision===null||(int(m.revision)&&m.revision<=a.technicalRevision))&&Array.isArray(m.observationIds)&&m.observationIds.length<=20&&new Set(m.observationIds).size===m.observationIds.length&&m.observationIds.every(id=>obsIds.has(id)),'SAVE_INVALID','Invalid phone message or dangling observation reference.');
  if(m.kind==='observation')need(m.observationIds.length>0&&m.revision!==null&&m.observationIds.every(id=>a.observations.find(o=>o.id===id).testedTechnicalRevision===m.revision),'SAVE_INVALID','An observed phone claim needs matching observations.');messageIds.add(m.id);templates.add(m.templateId);
 }
 // Do not accept persisted pass flags as current success: calculate each known observation again
 // when it claims to be current. Older observations remain explicitly untrusted local history.
 updateLegacySpatialObservations(a);
 for(const o of a.observations.filter(o=>o.testedTechnicalRevision===a.technicalRevision)){
  const spec=specifications('all').find(s=>s.testId===o.testId),now=evaluate(a,spec);o.pass=now.pass;o.code=now.code;o.message=now.message;o.pathIds=now.pathIds;o.sourceDeviceId=now.sourceDeviceId;o.expectedDenied=now.expectedDenied;
 }
 if(isGuided(a))validateGuidedHistory(a);
}
export function validateSave(raw){
 try{
  let text=typeof raw==='string'?raw:JSON.stringify(raw);need(typeof text==='string'&&new TextEncoder().encode(text).length<=1048576,'SAVE_TOO_LARGE','Progress files must be at most 1 MiB.');
  const g=JSON.parse(text);need(g&&typeof g==='object'&&!Array.isArray(g),'SAVE_INVALID','Choose a game progress JSON file, not an evidence report.');
  const scan=(x,depth=0)=>{need(depth<35,'SAVE_INVALID','Save nesting is too deep.');if(x&&typeof x==='object')for(const [k,v]of Object.entries(x)){need(!['__proto__','prototype','constructor'].includes(k),'SAVE_INVALID','Unsafe object keys are not accepted.');scan(v,depth+1);}};scan(g);
  need(g.schemaVersion===SCHEMA_VERSION,'SAVE_VERSION','This save uses an unsupported schema version. Your current game has not changed.');
  need(typeof g.campaignId==='string'&&/^[A-Za-z0-9._-]{1,120}$/.test(g.campaignId)&&int(g.revision)&&int(g.attemptSequence)&&g.attemptSequence<=1000000,'SAVE_INVALID','Invalid campaign identity or counters.');
  need(g.attempts&&typeof g.attempts==='object'&&!Array.isArray(g.attempts)&&Object.keys(g.attempts).length>0&&Object.keys(g.attempts).length<=120&&known(g.attempts,g.activeAttemptId),'SAVE_INVALID','Invalid attempt collection.');
  for(const [id,a]of Object.entries(g.attempts)){need(id===a.id&&Number(id.split('.').at(-1))<=g.attemptSequence,'SAVE_INVALID','Attempt IDs do not match.');validateAttempt(a);}
  need(g.guidedConnectionHistory===undefined||(Array.isArray(g.guidedConnectionHistory)&&g.guidedConnectionHistory.length<=4&&new Set(g.guidedConnectionHistory).size===g.guidedConnectionHistory.length&&g.guidedConnectionHistory.every(id=>known(g.attempts,id)&&isGuided(g.attempts[id])&&!!g.attempts[id].guidedConnection.finishedEventId)),'SAVE_INVALID','Guided history needs retained completed lesson witnesses.');
  if(isGuided(active(g))&&active(g).guidedConnection.returnAttemptId)need(known(g.attempts,active(g).guidedConnection.returnAttemptId)&&!isGuided(g.attempts[active(g).guidedConnection.returnAttemptId]),'SAVE_INVALID','The active guided lesson needs its saved return attempt.');
  need(g.training&&Array.isArray(g.training.completed)&&g.training.completed.length<=3&&new Set(g.training.completed).size===g.training.completed.length&&g.training.completed.every(id=>STATIONS.some(s=>s.id===id))&&Array.isArray(g.training.history)&&g.training.history.length<=120&&typeof g.training.priorLearning==='boolean','SAVE_INVALID','Invalid training history.');
  for(const h of g.training.history){
   need(h&&(known(g.attempts,h.attemptId)||(h.archived===true&&typeof h.attemptId==='string'&&/^attempt\.\d{4,}$/.test(h.attemptId)))&&STATIONS.some(s=>s.id===h.stationId)&&['practice','transfer'].includes(h.stage)&&h.independentMastery===false,'SAVE_INVALID','Invalid training provenance.');
   const source=g.attempts[h.attemptId];
   // Older in-session checkpoints can be upgraded from their still-present engine attempt.
   if(!h.checks&&source&&source.mode==='training'&&!source.training.isDemo&&source.technicalRevision===h.technicalRevision){h.checks=clone(trainingStatus(source,g).checks);h.mode='training';h.demonstration=false;h.practiceActions=[...source.training.practiceActions];}
   need(h.mode==='training'&&h.demonstration===false&&Array.isArray(h.checks)&&h.checks.length>0&&h.checks.length<=5&&h.checks.every(c=>c&&c.met===true&&typeof c.label==='string')&&Array.isArray(h.practiceActions)&&h.practiceActions.length<=40&&Array.isArray(h.observations)&&h.observations.length<=10&&h.observations.some(o=>o.pass===true),'SAVE_INVALID','A practice checkpoint needs actual checks and observations.');
   if(source)need(trainingKind(source)==='bootcamp'&&!source.training.isDemo&&STATIONS[source.training.stationIndex].id===h.stationId&&h.technicalRevision<=source.technicalRevision,'SAVE_INVALID','Training checkpoint source does not match.');
   if(h.fixtureId!==undefined)need(typeof h.fixtureId==='string'&&(!source||h.fixtureId===source.fixtureId),'SAVE_INVALID','Training checkpoint fixture does not match its source.');
   if(h.transferKind!==undefined)need([null,'legacy-address','physical-uplink'].includes(h.transferKind)&&(!source||h.transferKind===transferKind(source)),'SAVE_INVALID','Training transfer kind does not match its source.');
   if(h.transferEvidence!==undefined||h.fixtureId===UPLINK_FIXTURE||h.transferKind==='physical-uplink'||(source&&isUplinkTransfer(source)))validateTransferCheckpoint(h,source);
  }
  for(const stationId of g.training.completed)need(['practice','transfer'].every(stage=>g.training.history.some(h=>h.stationId===stationId&&h.stage===stage)),'SAVE_INVALID','Completed training needs both practice and changed-example provenance.');
  need(int(g.wallet)&&g.wallet<=1000000&&Array.isArray(g.settlements)&&g.settlements.length<=1,'SAVE_INVALID','Invalid wallet or settlement ledger.');
  if(g.contract!==null){
   const c=g.contract;need(c&&c.id==='contract.clinic.001'&&['active','delivered','settled'].includes(c.phase)&&known(g.attempts,c.currentAttemptId)&&g.attempts[c.currentAttemptId].mode==='client'&&int(c.ledgerRevision),'SAVE_INVALID','Invalid client contract.');
   const t=c.terms;need(t&&typeof t.version==='string'&&t.version.length<=100&&['gross','credits','minutes','creditCap','minuteCap'].every(k=>int(t[k])&&t[k]<=1000000)&&t.gross>=t.creditCap&&t.credits<=t.creditCap&&t.minutes<=t.minuteCap,'SAVE_INVALID','Invalid accepted fee terms.');
   need(Array.isArray(c.grants)&&c.grants.length<=3,'SAVE_INVALID','Invalid consultation grants.');const sections=new Set(),grantIds=new Set();let credits=0,minutes=0,grantSequence=0;
   for(const gr of c.grants){grantSequence++;need(gr&&gr.id===`${c.id}.guide.${grantSequence}`&&!grantIds.has(gr.id)&&gr.ledgerRevision===grantSequence&&gr.ledgerRevision<=c.ledgerRevision&&GUIDE_SECTIONS.some(s=>s.id===gr.sectionId)&&!sections.has(gr.sectionId)&&gr.grantKey===`${g.campaignId}|${c.id}|${gr.sectionId}`&&gr.policyVersion===t.version&&gr.credits===Math.max(0,Math.min(t.credits,t.creditCap-credits))&&gr.minutes===Math.max(0,Math.min(t.minutes,t.minuteCap-minutes)),'SAVE_INVALID','Inconsistent consultation grant or fee.');sections.add(gr.sectionId);grantIds.add(gr.id);credits+=gr.credits;minutes+=gr.minutes;}
   if(c.delivery){const d=c.delivery;need(c.phase!=='active'&&d.id===`${c.id}.delivery.001`&&known(g.attempts,d.attemptId)&&d.grossFee===t.gross&&d.reservedCredits===credits&&d.consultationMinutes===minutes&&d.netFee===d.grossFee-d.reservedCredits&&JSON.stringify(d.grants)===JSON.stringify(c.grants),'SAVE_INVALID','Inconsistent frozen delivery costs.');const ev=d.evidenceSnapshot,legacySpatial=/^0\.3(?:\.|$)/.test(ev?.buildVersion||'')&&d.attemptSnapshot?.spatialModelVersion===undefined,da=legacySpatial?{...clone(d.attemptSnapshot),[LEGACY_SPATIAL_MODEL]:true}:d.attemptSnapshot;validateAttempt(da);need(da.id===d.attemptId&&da.mode==='client'&&objectives(da).every(o=>o.met),'SAVE_INVALID','The delivered snapshot does not satisfy the practical requirements.');
    need(d.technicalRevision===da.technicalRevision&&d.evidenceRevision===da.evidenceRevision&&int(d.ledgerRevision)&&d.ledgerRevision<=c.ledgerRevision&&d.feeDefinitionVersion===c.terms.version&&ev&&ev.format==='clinic-evidence'&&ev.attemptId===da.id&&ev.campaignId===g.campaignId&&ev.mode==='client'&&ev.technicalRevision===da.technicalRevision&&ev.evidenceRevision===da.evidenceRevision&&JSON.stringify(ev.explanations)===JSON.stringify(da.explanations)&&ev.policy?.id===da.policyId&&JSON.stringify(ev.policy?.matrix)===JSON.stringify(POLICIES[da.policyId].matrix)&&JSON.stringify(ev.connections)===JSON.stringify(da.cables)&&JSON.stringify(ev.wearable)===JSON.stringify(da.wearable)&&JSON.stringify(ev.guideGrants)===JSON.stringify(d.grants)&&ev.economy?.gross===d.grossFee&&ev.economy?.reserved===d.reservedCredits&&ev.economy?.minutes===d.consultationMinutes&&ev.economy?.net===d.netFee,'SAVE_INVALID','Frozen evidence and delivery revisions or facts disagree.');
    const regenerated=evidenceObject({...g,contract:{...c,phase:'delivered'}},da);for(const key of ['network','equipment','connections','servicesEnabled','policy','currentChecks','fault','wearable','explanations','hints','guideGrants','objectives','readyForTeacherReview','missing','teacherReview','officialOutcomeIds','identifyingDataRequested','history'])need(JSON.stringify(ev[key])===JSON.stringify(regenerated[key]),'SAVE_INVALID',`Frozen evidence ${key} does not match the delivered attempt.`);}
   else need(c.phase==='active'&&!c.settlement,'SAVE_INVALID','A closed contract needs a frozen delivery.');
   if(c.settlement){const r=c.settlement;need(c.phase==='settled'&&c.delivery&&r.id===`${g.campaignId}|${c.id}`&&r.deliveryId===c.delivery.id&&r.grossFee===c.delivery.grossFee&&r.supportExpense===c.delivery.reservedCredits&&r.netFee===c.delivery.netFee&&g.settlements.length===1&&JSON.stringify(g.settlements[0])===JSON.stringify(r),'SAVE_INVALID','Settlement does not match the frozen delivery.');}
   else need(c.phase!=='settled'&&g.settlements.length===0,'SAVE_INVALID','Settlement state is inconsistent.');
  }else need(g.settlements.length===0&&g.wallet===0,'SAVE_INVALID','A wallet receipt needs its contract.');
  need(g.wallet===g.settlements.reduce((s,x)=>s+x.netFee,0),'SAVE_INVALID','Wallet must equal recorded net settlements, without merging balances.');
  need(g.imported===undefined||typeof g.imported==='boolean','SAVE_INVALID','Invalid import provenance flag.');
  need(g.importProvenance===undefined||['none','manual-file','legacy-unknown'].includes(g.importProvenance),'SAVE_INVALID','Unknown import provenance.');
  g.importProvenance=importProvenance(g);g.imported=g.imported===true;g.buildVersion=BUILD_VERSION;delete g.ready;delete g.success;delete g.complete;derive(g);
  return {valid:true,state:g};
 }catch(e){return {valid:false,error:e.code?e.message:'This is not a valid game progress file. Your current game has not changed.'};}
}
