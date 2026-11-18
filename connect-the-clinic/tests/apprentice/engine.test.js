import test from 'node:test';
import assert from 'node:assert/strict';
import {createApprenticeship,dispatchApprenticeship,deriveApprenticeship,createApprenticeshipEvidence,VISITS} from '../../dist/apprentice/engine.js';

import {engineDriver,pack as packD,visit1,visit2,visit3} from './helpers.js';
function run(state,action,expectAccepted=true){
  const r=dispatchApprenticeship(state,action);
  assert.equal(r.accepted,expectAccepted,`${action.type} → ${r.code}: ${r.message}`);
  return r;
}
const v=s=>deriveApprenticeship(s);
const dev=(s,roleId)=>v(s).devices.find(d=>d.roleId===roleId);
const port=(d,i=1)=>`${d.id}.eth${i}`;
const pack=s=>packD(engineDriver(s)).state;
const playVisit1=s=>visit1(engineDriver(s)).state;
const playVisit2=s=>visit2(engineDriver(s)).state;
function plugCable(s,a,ai,b,bi){
  s=run(s,{type:'HOLD_CABLE',cableType:'ethernet'}).state;
  s=run(s,{type:'PLUG',deviceId:a.id,socketId:port(a,ai)}).state;
  return run(s,{type:'PLUG',deviceId:b.id,socketId:port(b,bi)}).state;
}
function power(s,d){s=run(s,{type:'HOLD_CABLE',cableType:'power'}).state;return run(s,{type:'PLUG',deviceId:d.id,socketId:`${d.id}.power`}).state;}

test('departure requires the essential kit; distractors are allowed but recorded',()=>{
  let s=createApprenticeship({campaignId:'t.1'});
  assert.equal(run(s,{type:'START_VISIT',visitId:'visit.1'},false).code,'BAG_INCOMPLETE');
  s=run(s,{type:'PACK_ITEM',itemId:'item.phone-cord'}).state;
  s=pack(s);assert.ok(v(s).bagReady);
  assert.ok(v(s).items.find(i=>i.id==='item.phone-cord').packed);
  assert.equal(run(s,{type:'START_VISIT',visitId:'visit.2'},false).code,'VISIT_LOCKED');
});

test('visit 1: wrong cables are explained, a laptop cannot be cabled, real path passes',()=>{
  let s=pack(createApprenticeship({campaignId:'t.2'}));
  s=run(s,{type:'START_VISIT',visitId:'visit.1'}).state;
  s=run(s,{type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'laptop'}}).state;
  assert.equal(dev(s,'role.reception').ports.filter(p=>p.medium==='ethernet').length,0);
  s=run(s,{type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'desktop'}}).state;
  s=run(s,{type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'infra.switch',kind:'switch8'}}).state;
  const desk=dev(s,'role.reception');
  s=run(s,{type:'HOLD_CABLE',cableType:'hdmi'}).state;
  s=run(s,{type:'PLUG',deviceId:desk.id,socketId:`${desk.id}.hdmi`}).state;
  assert.equal(v(s).mistakes.at(-1).kind,'DISPLAY_NOT_NETWORK');
  s=run(s,{type:'HOLD_CABLE',cableType:'phone'}).state;
  s=run(s,{type:'PLUG',deviceId:desk.id,socketId:port(desk)}).state;
  assert.equal(v(s).mistakes.at(-1).kind,'PHONE_CORD_IN_RJ45');
  assert.equal(v(s).cables.length,0);
  // Unpowered switch: test fails for the right reason.
  s=power(s,desk);
  s=run(s,{type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.records',kind:'server'}}).state;
  s=power(s,dev(s,'role.records'));
  s=plugCable(s,desk,1,dev(s,'infra.switch'),5);
  s=plugCable(s,dev(s,'role.records'),1,dev(s,'infra.switch'),1);
  s=run(s,{type:'RUN_TEST',testId:'reception'}).state;
  assert.equal(v(s).latestTest.pass,false);
  assert.equal(v(s).staff.reception,'waiting');
  assert.equal(run(s,{type:'FINISH_VISIT'},false).code,'VISIT_INCOMPLETE');
  s=power(s,dev(s,'infra.switch'));
  assert.equal(v(s).latestTest.stale,true,'a change makes the earlier test stale');
  s=run(s,{type:'RUN_TEST',testId:'reception'}).state;
  assert.equal(v(s).latestTest.code,'SERVICE_AVAILABLE');
  assert.equal(v(s).staff.reception,'working');
  assert.ok(v(s).cables.every(c=>c.state==='tested-ok'));
  s=run(s,{type:'FINISH_VISIT'}).state;
  assert.deepEqual(v(s).completedVisitIds,['visit.1']);
});

test('asking the mentor and “show me” never complete the visit',()=>{
  let s=pack(createApprenticeship({campaignId:'t.3'}));
  s=run(s,{type:'START_VISIT',visitId:'visit.1'}).state;
  for(const topic of ['next','why','show','cables'])s=run(s,{type:'ASK_MENTOR',topic}).state;
  assert.ok(v(s).highlight);
  assert.equal(v(s).checks.filter(c=>c.met).length,0);
  assert.equal(run(s,{type:'FINISH_VISIT'},false).code,'VISIT_INCOMPLETE');
});

test('visit 2: wrong-subnet address fails, valid address and wireless pass in both rooms',()=>{
  let s=playVisit1(pack(createApprenticeship({campaignId:'t.4'})));
  s=run(s,{type:'START_VISIT',visitId:'visit.2'}).state;
  s=run(s,{type:'RUN_TEST',testId:'reception'}).state;
  assert.equal(v(s).latestTest.code,'ADDRESS_WRONG_SUBNET');
  const desk=dev(s,'role.reception');
  s=run(s,{type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:desk.id,address:'10.12.1.10',mask:'255.255.255.0'}}).state;
  s=run(s,{type:'RUN_TEST',testId:'reception'}).state;
  assert.equal(v(s).latestTest.code,'ADDRESS_DUPLICATE');
  s=run(s,{type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:desk.id,address:'10.12.1.255',mask:'255.255.255.0'}}).state;
  s=run(s,{type:'RUN_TEST',testId:'reception'}).state;
  assert.equal(v(s).latestTest.code,'ADDRESS_RESERVED');
  s=run(s,{type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:desk.id,address:'10.12.1.20',mask:'255.255.255.0'}}).state;
  s=run(s,{type:'RUN_TEST',testId:'reception'}).state;
  assert.equal(v(s).latestTest.pass,true);
  assert.equal(v(s).checks.find(c=>c.id==='inspect.desk').met,false,'reading the card is required');
  s=run(s,{type:'INSPECT_DEVICE',deviceId:desk.id}).state;
  s=run(s,{type:'NETWORK_ACTION',action:{type:'ASSOCIATE_WIFI',deviceId:dev(s,'role.nurse').id,apDeviceId:dev(s,'infra.ap').id}}).state;
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  assert.equal(v(s).latestTest.code,'AP_OFF');
  s=power(s,dev(s,'infra.ap'));
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  assert.equal(v(s).latestTest.code,'PORT_DISCONNECTED');
  s=plugCable(s,dev(s,'infra.ap'),1,dev(s,'infra.switch'),4);
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  assert.equal(v(s).staff.nurse.state,'working');
  assert.equal(run(s,{type:'FINISH_VISIT'},false).code,'VISIT_INCOMPLETE','room B still untested');
  s=run(s,{type:'NETWORK_ACTION',action:{type:'MOVE_NURSE',locationId:'location.exam-b'}}).state;
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  s=run(s,{type:'FINISH_VISIT'}).state;
  assert.deepEqual(v(s).completedVisitIds,['visit.1','visit.2']);
});

test('visit 3: changing a correct IP cannot fix a missing cable; repair, access decision and explanation earn the van',()=>{
  let s=playVisit2(playVisit1(pack(createApprenticeship({campaignId:'t.5'}))));
  s=run(s,{type:'START_VISIT',visitId:'visit.3'}).state;
  assert.equal(v(s).staff.manager,'present');
  const tablet=dev(s,'role.nurse');
  assert.equal(tablet.address,'10.12.1.30');
  s=run(s,{type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:tablet.id,address:'10.12.1.31',mask:'255.255.255.0'}}).state;
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  assert.equal(v(s).latestTest.code,'PORT_DISCONNECTED');
  s=plugCable(s,dev(s,'infra.ap'),1,dev(s,'infra.switch'),3);
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  assert.equal(v(s).latestTest.pass,true);
  s=run(s,{type:'RUN_TEST',testId:'access'}).state;
  assert.equal(v(s).checks.find(c=>c.id==='access.tested').met,false,'open access fails the restriction checks');
  s=run(s,{type:'NETWORK_ACTION',action:{type:'SET_PERMISSIONS',policyId:'policy.roles-separated'}}).state;
  s=run(s,{type:'SAVE_EXPLANATION',text:'too early',oral:false}).state;
  s=run(s,{type:'RUN_TEST',testId:'access'}).state;
  s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  assert.equal(v(s).checks.find(c=>c.id==='explain').met,true,'tests do not change the network; the explanation stays current');
  s=run(s,{type:'SAVE_EXPLANATION',text:'Uplink cable missing; reconnected. Front desk keeps bookings only.',oral:false}).state;
  assert.equal(v(s).truckEarned,false);
  assert.equal(run(s,{type:'CLAIM_TRUCK'},false).code,'TRUCK_NOT_EARNED');
  s=run(s,{type:'FINISH_VISIT'}).state;
  assert.equal(v(s).truckEarned,true);
  s=run(s,{type:'CLAIM_TRUCK'}).state;
  assert.equal(v(s).truckClaimed,true);
  const evidence=createApprenticeshipEvidence(s);
  assert.match(evidence.text,/3\/3 visits/);
  assert.match(evidence.text,/Front desk keeps bookings only/);
});

test('visit 3 completion requires the fault to be observed before repair and a fresh explanation',()=>{
  let s=playVisit2(playVisit1(pack(createApprenticeship({campaignId:'t.6'}))));
  s=run(s,{type:'START_VISIT',visitId:'visit.3'}).state;
  s=plugCable(s,dev(s,'infra.ap'),1,dev(s,'infra.switch'),3);
  s=run(s,{type:'NETWORK_ACTION',action:{type:'SET_PERMISSIONS',policyId:'policy.nurse-also-books'}}).state;
  s=run(s,{type:'RUN_TEST',testId:'access'}).state;s=run(s,{type:'RUN_TEST',testId:'nurse'}).state;
  s=run(s,{type:'SAVE_EXPLANATION',text:'',oral:true}).state;
  const c=v(s).checks;
  assert.equal(c.find(x=>x.id==='fault.observed').met,false);
  assert.equal(c.find(x=>x.id==='access.tested').met,true);
  assert.equal(run(s,{type:'FINISH_VISIT'},false).code,'VISIT_INCOMPLETE');
  // Restart and inspect the AP first: an inspection is an acceptable diagnosis.
  s=run(s,{type:'RESTART_VISIT'}).state;
  s=run(s,{type:'INSPECT_DEVICE',deviceId:dev(s,'infra.ap').id}).state;
  assert.equal(v(s).fault.observed.kind,'inspection');
});

test('visits cannot be skipped and completed visits are frozen',()=>{
  let s=playVisit1(pack(createApprenticeship({campaignId:'t.7'})));
  assert.equal(run(s,{type:'START_VISIT',visitId:'visit.3'},false).code,'VISIT_LOCKED');
  assert.equal(run(s,{type:'RUN_TEST',testId:'reception'},false).code,'VISIT_FINISHED');
  assert.equal(VISITS.length,3);
});
