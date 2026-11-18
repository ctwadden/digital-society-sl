/** Shared scripted play: the same learner actions drive the engine directly or through the programme. */
import assert from 'node:assert/strict';
import {dispatchApprenticeship,deriveApprenticeship} from '../../dist/apprentice/engine.js';
import {dispatchProgramme,deriveProgramme} from '../../dist/opening/programme.js';

export function engineDriver(state){
  return {state,act(action,ok=true){const r=dispatchApprenticeship(this.state,action);assert.equal(r.accepted,ok,`${action.type} → ${r.code}: ${r.message}`);this.state=r.state;return r;},get view(){return deriveApprenticeship(this.state);}};
}
export function programmeDriver(state){
  return {state,act(action,ok=true){const r=dispatchProgramme(this.state,{type:'APP_ACTION',action});assert.equal(r.accepted,ok,`${action.type} → ${r.code}: ${r.message}`);this.state=r.state;return r;},get view(){return deriveProgramme(this.state).apprentice;}};
}
const dev=(d,roleId)=>d.view.devices.find(x=>x.roleId===roleId);
const eth=(x,i=1)=>`${x.id}.eth${i}`;
/** Earns both training cards through real drills (sorting, classifying, bench repairs). */
export function train(d){
  d.act({type:'OPEN_TRAINING'});
  for(const [cableType,job] of [['ethernet','network'],['power','power'],['hdmi','display'],['usb','peripheral'],['phone','phone-line']])d.act({type:'SORT_CABLE',cableType,job});
  d.act({type:'START_DRILL',drillId:'drill.cables.bench'});d.act({type:'RUN_TEST',testId:'reception'});
  power(d,dev(d,'infra.switch'));cable(d,dev(d,'role.reception'),1,dev(d,'infra.switch'),2);d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});
  for(const [address,verdict] of [['172.20.8.0','network'],['172.20.8.77','usable'],['172.20.8.10','taken'],['172.20.9.5','other-network'],['172.20.8.255','broadcast'],['10.12.1.40','other-network']])d.act({type:'CLASSIFY_ADDRESS',address,verdict});
  d.act({type:'START_DRILL',drillId:'drill.addressing.bench'});const pc=dev(d,'role.reception');d.act({type:'INSPECT_DEVICE',deviceId:pc.id});
  d.act({type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:pc.id,address:'172.20.8.77',mask:'255.255.255.0'}});d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});
  d.act({type:'RETURN_TO_YARD'});return d;
}
export function pack(d){const t=d.view.training;if(t?.gate&&!t.stations.every(s=>!s.card||s.earned))train(d);for(const itemId of ['item.patch-cable','item.power-cord','item.link-tester','item.port-light'])d.act({type:'PACK_ITEM',itemId});return d;}
export function cable(d,a,ai,b,bi){d.act({type:'HOLD_CABLE',cableType:'ethernet'});d.act({type:'PLUG',deviceId:a.id,socketId:eth(a,ai)});d.act({type:'PLUG',deviceId:b.id,socketId:eth(b,bi)});return d;}
export function power(d,x){d.act({type:'HOLD_CABLE',cableType:'power'});d.act({type:'PLUG',deviceId:x.id,socketId:`${x.id}.power`});return d;}
export function visit1(d){
  d.act({type:'START_VISIT',visitId:'visit.1'});
  for(const [roleId,kind] of [['role.reception','desktop'],['infra.switch','switch4'],['role.records','server']]){d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId,kind}});power(d,dev(d,roleId));}
  cable(d,dev(d,'role.reception'),1,dev(d,'infra.switch'),2);cable(d,dev(d,'role.records'),1,dev(d,'infra.switch'),1);
  d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});return d;
}
export function visit2(d){
  d.act({type:'START_VISIT',visitId:'visit.2'});const desk=dev(d,'role.reception');
  d.act({type:'INSPECT_DEVICE',deviceId:desk.id});
  d.act({type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:desk.id,address:'10.12.1.44',mask:'255.255.255.0'}});
  d.act({type:'RUN_TEST',testId:'reception'});power(d,dev(d,'infra.ap'));cable(d,dev(d,'infra.ap'),1,dev(d,'infra.switch'),3);
  d.act({type:'NETWORK_ACTION',action:{type:'ASSOCIATE_WIFI',deviceId:dev(d,'role.nurse').id,apDeviceId:dev(d,'infra.ap').id}});
  d.act({type:'RUN_TEST',testId:'nurse'});d.act({type:'NETWORK_ACTION',action:{type:'MOVE_NURSE',locationId:'location.exam-b'}});
  d.act({type:'RUN_TEST',testId:'nurse'});d.act({type:'FINISH_VISIT'});return d;
}
export function visit3(d,text='The access point uplink cable was missing, so the tablet had no path to the host. I reconnected it and retested. Reception can book but cannot open the clinical workspace.'){
  d.act({type:'START_VISIT',visitId:'visit.3'});d.act({type:'RUN_TEST',testId:'nurse'});
  cable(d,dev(d,'infra.ap'),1,dev(d,'infra.switch'),3);
  d.act({type:'NETWORK_ACTION',action:{type:'SET_PERMISSIONS',policyId:'policy.roles-separated'}});
  d.act({type:'RUN_TEST',testId:'nurse'});d.act({type:'RUN_TEST',testId:'access'});
  d.act({type:'SAVE_EXPLANATION',text,oral:false});d.act({type:'FINISH_VISIT'});return d;
}
/** Programme state with an earned, claimed van, placed on the optional practice bench. */
export function withTruck(state,{screen='bootcamp'}={}){
  const d=programmeDriver(state);visit3(visit2(visit1(pack(d))));d.act({type:'CLAIM_TRUCK'});
  let s=d.state;if(screen==='bootcamp'){const r=dispatchProgramme(s,{type:'OPEN_BOOTCAMP'});assert.equal(r.accepted,true);s=r.state;}
  return s;
}
export function onBench(state){const r=dispatchProgramme(state,{type:'OPEN_BOOTCAMP'});assert.equal(r.accepted,true);return r.state;}
