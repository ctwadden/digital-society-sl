import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgramme, dispatchProgramme, deriveProgramme, validateProgrammeSave, createProgrammeEvidence, serializeProgrammeProgress} from '../../dist/opening/programme.js';
import {withTruck,onBench} from '../apprentice/helpers.js';
import {createShift, dispatchShift, deriveShift} from '../../dist/opening/engine.js';
import {createPersistence} from '../../dist/persistence.js';

// Independent acceptance routes: use the public programme and derived device/port
// inventory. No internal completion flags or builder test helpers seed a pass.
const copy = value => JSON.parse(JSON.stringify(value));
const ids = ['boot.kit','boot.cables','boot.address','boot.wireless','boot.access','boot.transfer'];
function session(state = withTruck(createProgramme({campaignId:'qa.independent.bootcamp'}))) {
  return {
    state,
    get view() { return deriveProgramme(this.state); },
    get bench() { return this.view.bootcamp; },
    send(action) {
      const result = dispatchProgramme(this.state,action);
      assert.equal(result.accepted,true,`${JSON.stringify(action)} -> ${result.code}: ${result.message}`);
      this.state = result.state; return result;
    },
    boot(action) { return this.send({type:'BOOT_ACTION',action}); },
    net(action) { return this.boot({type:'NETWORK_ACTION',action}); },
    reject(action, code) {
      const before = this.state, encoded = JSON.stringify(before);
      const result = dispatchProgramme(before,action);
      assert.equal(result.accepted,false,JSON.stringify(action));
      assert.equal(result.state,before);
      assert.equal(JSON.stringify(before),encoded);
      if (code) assert.equal(result.code,code);
      return result;
    },
    rejectBoot(action,code) { return this.reject({type:'BOOT_ACTION',action},code); }
  };
}
function start(d,id) {
  d.boot({type:'START_LESSON',lessonId:id});
  d.boot({type:'START_PRACTICE'});
}
function connect(d,deviceId,last=true) {
  const devices = d.bench.devices;
  const device = devices.find(item => item.id===deviceId);
  const sw = devices.find(item => item.id===d.bench.switchDeviceId);
  const from = device.ports.find(port => port.medium==='ethernet'&&!port.cableId);
  const options = sw.ports.filter(port => port.medium==='ethernet'&&!port.cableId);
  const to = last ? options.at(-1) : options[0];
  assert.ok(from&&to,'A genuine compatible free port must exist.');
  d.net({type:'CONNECT_PORTS',fromDeviceId:device.id,fromPortId:from.id,toDeviceId:sw.id,toPortId:to.id});
}
function run(d,testId='all') { d.boot({type:'RUN_TEST',testId}); }
function address(d,address,mask='255.255.255.0') {
  d.net({type:'SET_STATIC_ADDRESS',deviceId:d.bench.lessonId==='boot.address'?d.bench.workstationDeviceId:d.bench.nurseDeviceId,address,mask});
}
function solveCurrent(d, options={}) {
  switch(d.bench.lessonId) {
    case 'boot.kit':
      for (const [roleId,kind] of [['role.records','desktop'],['infra.switch','switch8'],['role.reception','desktop']]) {
        d.net({type:'CHOOSE_DEVICE',roleId,kind});
        d.net({type:'POWER_DEVICE',deviceId:d.bench.devices.find(item=>item.roleId===roleId).id,on:true});
      }
      break;
    case 'boot.cables':
      connect(d,d.bench.workstationDeviceId); connect(d,d.bench.serverDeviceId); run(d,'reception'); break;
    case 'boot.address':
      address(d,'192.168.80.254'); run(d,'reception'); break;
    case 'boot.wireless':
      d.net({type:'POWER_DEVICE',deviceId:d.bench.apDeviceId,on:true});
      connect(d,d.bench.apDeviceId);
      d.net({type:'ASSOCIATE_WIFI',deviceId:d.bench.nurseDeviceId,apDeviceId:d.bench.apDeviceId});
      d.net({type:'MOVE_NURSE',locationId:'location.exam-b'}); run(d,'nurse');
      d.net({type:'MOVE_NURSE',locationId:'location.exam-a'}); run(d,'nurse'); break;
    case 'boot.access':
      d.net({type:'SET_PERMISSIONS',policyId:options.policyId||'policy.nurse-also-books'}); run(d,'access'); break;
    case 'boot.transfer':
      d.boot({type:'INSPECT_DEVICE',deviceId:d.bench.apDeviceId});
      connect(d,d.bench.apDeviceId); run(d);
      d.boot({type:'SAVE_REFLECTION',text:options.text??'QA exact words.\nA cable supplies the missing route. <tag> & “quotes”',oral:!!options.oral}); break;
  }
  assert.equal(d.bench.canComplete,true,JSON.stringify(d.bench.checks));
}
let earnedCheckpoints;
function atLesson(id) {
  if (!earnedCheckpoints) {
    const d=session(); earnedCheckpoints=[];
    for (const lessonId of ids) {
      start(d,lessonId); earnedCheckpoints.push(copy(d.state));
      solveCurrent(d); d.boot({type:'COMPLETE_LESSON'});
    }
  }
  return session(copy(earnedCheckpoints[ids.indexOf(id)]));
}
function allTraining({demos=false}={}) {
  const d=session();
  for (const id of ids) {
    d.boot({type:'START_LESSON',lessonId:id});
    if (demos&&d.bench.demo.available) {
      d.boot({type:'START_DEMO'});
      while(d.bench.demo.nextStepId) d.boot({type:'NEXT_DEMO'});
    }
    d.boot({type:'START_PRACTICE'}); solveCurrent(d); d.boot({type:'COMPLETE_LESSON'});
  }
  return d;
}

test('B1/B2 independent: entry and nested command bypasses cannot create practice credit',()=>{
  const d=session(onBench(createProgramme({campaignId:'qa.independent.bootcamp'})));
  d.reject({type:'ENTER_FIELD'},'TRUCK_REQUIRED');
  for(const id of ids.slice(1)) d.rejectBoot({type:'START_LESSON',lessonId:id},'LESSON_LOCKED');
  start(d,'boot.kit');
  for(const type of ['COMPLETE_TRAINING','SETTLE_CONTRACT','START_CLIENT','RUN_PROBE']) {
    d.rejectBoot({type:'NETWORK_ACTION',action:{type}});
  }
  d.rejectBoot({type:'COMPLETE_LESSON'},'LESSON_INCOMPLETE');
  d.rejectBoot({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'desktop',origin:'trainer'}},'ACTION_FIELDS');
  assert.equal(d.bench.progress.completed,0);
});

test('B1/B2 independent: every worked example remains trainer-only and fresh practice removes its answers',()=>{
  for (const id of ids.slice(0,5)) {
    const d=atLesson(id);
    d.boot({type:'START_DEMO'});
    while(d.bench.demo.nextStepId) d.boot({type:'NEXT_DEMO'});
    assert.equal(d.bench.canComplete,false);
    assert.ok(d.bench.observations.every(item=>item.origin==='trainer'));
    d.rejectBoot({type:'COMPLETE_LESSON'},'PRACTICE_REQUIRED');
    d.rejectBoot({type:'RUN_TEST',testId:'all'},'PRACTICE_REQUIRED');
    const oldAttempt=d.bench.attemptId;
    d.boot({type:'START_PRACTICE'});
    assert.notEqual(d.bench.attemptId,oldAttempt);
    assert.equal(d.bench.network.cidr,'192.168.80.0/24');
    assert.equal(d.bench.observations.length,0);
    assert.equal(d.bench.canComplete,false);
    if(id==='boot.kit') assert.equal(d.bench.devices.length,0);
    if(id==='boot.cables') assert.equal(d.bench.cables.length,0);
    if(id==='boot.address') assert.equal(d.bench.devices.find(x=>x.id===d.bench.workstationDeviceId).address,'192.168.81.20');
    if(id==='boot.wireless') assert.equal(d.bench.devices.find(x=>x.id===d.bench.apDeviceId).powered,false);
    if(id==='boot.access') assert.equal(d.bench.policy.id,'policy.broad-access');
  }
});

test('B3 independent: alternate equipment, ports, high usable address and reversed room order form a valid complete route',()=>{
  const d=allTraining({demos:true});
  assert.equal(d.bench.courseComplete,true);
  assert.deepEqual(d.bench.completedLessonIds,ids);
  assert.equal(d.state.field.actions.length,0);
  assert.equal(d.view.field.observations.length,0);
  assert.equal(d.view.field.economy.wallet,0);
  const first=d.bench.completionRecords[0];
  assert.ok(first.devices.some(item=>item.roleId==='role.records'&&item.kind==='desktop'));
  assert.ok(first.devices.some(item=>item.roleId==='infra.switch'&&item.kind==='switch8'));
  d.send({type:'ENTER_FIELD'});
  assert.equal(d.view.screen,'field');
  assert.equal(d.view.field.briefReviewed,false);
  assert.equal(validateProgrammeSave(d.state).valid,true);
});

test('B3 independent regression: empty or non-string masks never silently retain the previous mask',()=>{
  const d=atLesson('boot.address'), deviceId=d.bench.workstationDeviceId;
  for (const mask of ['',null,false,0,[],{},'255.0.255.0','255.255.255.255','0.0.0.0']) {
    d.rejectBoot({type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId,address:'192.168.80.42',mask}},'MASK_INVALID');
  }
  run(d,'reception');
  assert.equal(d.bench.observations[0].code,'ADDRESS_WRONG_SUBNET');
  assert.equal(d.bench.canComplete,false);
});

test('B3 independent: broader mask can pass service while failing the /24 brief; narrower mask splits peers',()=>{
  const d=atLesson('boot.address');
  address(d,'192.168.80.42','255.255.0.0'); run(d,'reception');
  assert.equal(d.bench.observations[0].code,'SERVICE_AVAILABLE');
  assert.equal(d.bench.checks.find(item=>item.id==='supplied-mask').met,false);
  assert.equal(d.bench.canComplete,false);
  address(d,'192.168.80.42','255.255.255.240'); run(d,'reception');
  assert.equal(d.bench.observations[0].code,'ADDRESS_OFF_LINK');
  for(const [host,code] of [['10','ADDRESS_DUPLICATE'],['0','ADDRESS_RESERVED'],['255','ADDRESS_RESERVED']]) {
    address(d,'192.168.80.'+host); run(d,'reception');
    assert.equal(d.bench.observations[0].code,code);
    assert.equal(d.bench.canComplete,false);
  }
  address(d,'192.168.80.42');
  assert.equal(d.bench.canComplete,false,'A current engine success is not a learner test.');
  run(d,'reception'); assert.equal(d.bench.canComplete,true);
});

test('B2/B3 independent: a power cycle and service cycle invalidate passing tests even after configuration is restored',()=>{
  const d=atLesson('boot.cables'); solveCurrent(d);
  const switchId=d.bench.switchDeviceId;
  d.net({type:'POWER_DEVICE',deviceId:switchId,on:false}); run(d,'reception');
  assert.equal(d.bench.observations[0].code,'SWITCH_OFF');
  d.net({type:'POWER_DEVICE',deviceId:switchId,on:true});
  assert.equal(d.bench.canComplete,false);
  run(d,'reception'); assert.equal(d.bench.canComplete,true);
  d.net({type:'SET_SERVICE_STATE',enabled:false}); run(d,'reception');
  assert.equal(d.bench.observations[0].code,'SERVICE_UNAVAILABLE');
  d.net({type:'SET_SERVICE_STATE',enabled:true});
  assert.equal(d.bench.canComplete,false);
  run(d,'reception'); assert.equal(d.bench.canComplete,true);
});

test('B2/B3 independent: room observations survive movement but both become stale after an unrelated causal edit',()=>{
  const d=atLesson('boot.wireless'); solveCurrent(d);
  const before=d.bench.requiredTests.map(item=>item.observation.id);
  d.net({type:'MOVE_NURSE',locationId:'location.exam-b'});
  assert.equal(d.bench.canComplete,true);
  assert.deepEqual(d.bench.requiredTests.map(item=>item.observation.id),before);
  d.net({type:'POWER_DEVICE',deviceId:d.bench.workstationDeviceId,on:false});
  assert.ok(d.bench.requiredTests.every(item=>!item.met));
  d.net({type:'POWER_DEVICE',deviceId:d.bench.workstationDeviceId,on:true});
  run(d);
  assert.equal(d.bench.requiredTests.filter(item=>item.met).length,1,'All tests cover only the current mobile room.');
  d.net({type:'MOVE_NURSE',locationId:'location.exam-a'}); run(d,'nurse');
  assert.equal(d.bench.canComplete,true);
});

test('B3 independent: responsible policy alternatives differ honestly; technical failure cannot satisfy denial checks',()=>{
  for(const policyId of ['policy.roles-separated','policy.nurse-also-books']) {
    const d=atLesson('boot.access');
    run(d,'access'); assert.equal(d.bench.canComplete,false);
    d.net({type:'SET_PERMISSIONS',policyId}); run(d,'access');
    assert.equal(d.bench.canComplete,true);
    const booking=d.bench.observations.find(item=>item.testId==='nurse-bookings');
    assert.equal(booking.code,policyId==='policy.roles-separated'?'ACCESS_DENIED':'SERVICE_AVAILABLE');
    d.net({type:'SET_SERVICE_STATE',enabled:false}); run(d,'access');
    assert.equal(d.bench.canComplete,false);
    assert.ok(d.bench.requiredTests.filter(item=>item.id.startsWith('outside-')).every(item=>!item.met));
    d.net({type:'SET_SERVICE_STATE',enabled:true}); run(d,'access');
    assert.equal(d.bench.canComplete,true);
  }
});

test('B2/B3 independent: transfer starts correctly addressed; a valid address edit does not reconnect its uplink',()=>{
  const d=atLesson('boot.transfer');
  const mobile=d.bench.devices.find(item=>item.id===d.bench.nurseDeviceId);
  assert.equal(mobile.address,'192.168.90.30'); assert.equal(mobile.mask,'255.255.255.0');
  assert.equal(mobile.powered,true); assert.equal(mobile.wifiApId,d.bench.apDeviceId);
  assert.equal(d.bench.devices.find(item=>item.id===d.bench.apDeviceId).powered,true);
  d.rejectBoot({type:'START_DEMO'},'TRANSFER_NO_DEMO');
  run(d,'nurse'); assert.equal(d.bench.observations[0].code,'PORT_DISCONNECTED');
  address(d,'192.168.90.73'); run(d,'nurse');
  assert.equal(d.bench.observations[0].code,'PORT_DISCONNECTED');
  assert.equal(d.bench.repair.change,null);
  connect(d,d.bench.apDeviceId); run(d);
  assert.equal(d.bench.repair.confirmed,true);
  d.boot({type:'SAVE_REFLECTION',text:'',oral:true});
  assert.equal(d.bench.canComplete,true);
  d.boot({type:'COMPLETE_LESSON'});
  assert.equal(d.bench.completionRecords.at(-1).teacherReview,'pending');
  assert.equal(d.bench.completionRecords.at(-1).independentMastery,false);
});

test('B2/B4 independent: an early repair cannot invent a faulty observation; reflection stays exact and tied to repair context',()=>{
  const d=atLesson('boot.transfer');
  const text='  My EXACT text\n<script>literal, not executable</script> 🧪  ';
  d.boot({type:'SAVE_REFLECTION',text,oral:false});
  connect(d,d.bench.apDeviceId); run(d);
  assert.equal(d.bench.canComplete,false);
  assert.equal(d.bench.repair.observed,null);
  const cable=d.bench.cables.find(item=>[item.fromDeviceId,item.toDeviceId].includes(d.bench.apDeviceId));
  d.net({type:'DISCONNECT_CABLE',cableId:cable.id});
  d.boot({type:'INSPECT_DEVICE',deviceId:d.bench.apDeviceId});
  connect(d,d.bench.apDeviceId); run(d);
  assert.equal(d.bench.reflection.stale,true);
  assert.equal(d.bench.canComplete,false);
  d.boot({type:'SAVE_REFLECTION',text,oral:false});
  assert.equal(d.bench.canComplete,true,'The programme records explanation presence, not keyword quality.');
  d.boot({type:'COMPLETE_LESSON'});
  const evidence=createProgrammeEvidence(d.state);
  assert.equal(evidence.json.training.completionRecords.at(-1).reflection.text,text);
  assert.ok(evidence.text.includes(text));
  assert.equal(evidence.json.field.current.playerObservations.length,0);
});

test('B4/B5/B7 independent: free hints and completed retries preserve frozen evidence and all field state',()=>{
  const d=allTraining(), record=copy(d.bench.completionRecords.at(-1));
  d.send({type:'ENTER_FIELD'}); d.send({type:'REVIEW_BRIEF'});
  const quote=d.view.field.guideQuotes[0];
  d.send({type:'GUIDE_CONSULT',sectionId:quote.sectionId,quoteToken:quote.quoteToken});
  d.send({type:'SAVE_EXPLANATION',key:'equipment',text:'Existing independent field words.',oral:false});
  const field=copy(d.state.field);
  d.send({type:'OPEN_BOOTCAMP'});
  d.boot({type:'RESTART_PRACTICE'});
  const attempt=d.bench.attemptId;
  for(const tier of [1,2,3,3]) d.boot({type:'REVEAL_HINT',tier});
  assert.deepEqual(d.bench.economy,{credits:0,minutes:0,earnings:0});
  assert.equal(d.bench.reflection.text,'');
  assert.deepEqual(d.bench.completionRecords.at(-1),record);
  d.boot({type:'RESTART_PRACTICE'});
  assert.notEqual(d.bench.attemptId,attempt);
  d.send({type:'ENTER_FIELD'});
  assert.deepEqual(d.state.field,field);
  assert.equal(d.view.field.economy.reserved,5);
});

test('B5 independent: deterministic replay rejects altered evidence, forged completion, duplicate awards and extra state',()=>{
  const d=allTraining({demos:true});
  const checked=validateProgrammeSave(JSON.stringify(d.state));
  assert.equal(checked.valid,true,checked.error); assert.deepEqual(checked.state,d.state);
  const mutations=[
    s=>{s.fieldStarted=true;},
    s=>{s.screen='field';},
    s=>{s.bootcamp.completionRecords[0].origin='trainer';},
    s=>{s.bootcamp.completionRecords[0].checks[0].met=false;},
    s=>{s.bootcamp.completionRecords[0].devices[0].powered=false;},
    s=>{s.bootcamp.completionRecords.push(copy(s.bootcamp.completionRecords.at(-1)));},
    s=>{s.bootcamp.completionRecords.at(-1).reflection.text='Replaced learner words';},
    s=>{s.field.wallet=120;},
    s=>{s.actions.splice(0,1);},
    s=>{s.extra={ready:true};}
  ];
  for(const change of mutations) {
    const bad=copy(d.state); change(bad);
    assert.equal(validateProgrammeSave(bad).valid,false);
  }
  assert.equal(validateProgrammeSave(createProgrammeEvidence(d.state).json).valid,false);
  assert.equal(validateProgrammeSave('{broken').valid,false);
  assert.equal(validateProgrammeSave('é'.repeat(524289)).code,'SAVE_TOO_LARGE');
});

test('B5 independent: a real 0.7 field seed with paid help and rehearsal migrates exactly and cannot invent bootcamp',()=>{
  let old=createShift({campaignId:'qa.existing.07',fixture:'B'});
  const send=action=>{const r=dispatchShift(old,action);assert.equal(r.accepted,true,r.message);old=r.state;};
  send({type:'REVIEW_BRIEF'});
  const quote=deriveShift(old).guideQuotes[0];
  send({type:'GUIDE_CONSULT',sectionId:quote.sectionId,quoteToken:quote.quoteToken});
  send({type:'SAVE_EXPLANATION',key:'limitations',text:'Exact old text.\nUnchanged.',oral:true});
  send({type:'START_PRACTICE',fixture:'A'}); send({type:'REVIEW_BRIEF'});
  const migrated=validateProgrammeSave(JSON.stringify(old));
  assert.equal(migrated.valid,true,migrated.error);
  const d=session(migrated.state);
  assert.deepEqual(d.state.field,old);
  assert.equal(d.view.screen,'field'); assert.equal(d.bench.progress.completed,0);
  assert.ok(d.view.migrationNotice);
  d.send({type:'OPEN_BOOTCAMP'}); start(d,'boot.kit'); solveCurrent(d); d.boot({type:'COMPLETE_LESSON'});
  d.send({type:'ENTER_FIELD'});
  assert.deepEqual(d.state.field,old);
  assert.equal(validateProgrammeSave(d.state).valid,true);
  const forged=copy(old); forged.wallet=999;
  assert.equal(validateProgrammeSave(forged).valid,false);
  assert.equal(validateProgrammeSave({schemaVersion:1,attempts:{},activeAttemptId:'attempt.0001'}).code,'LEGACY_SAVE');
});

test('B5 independent: action-cap rejection is atomic and the last accepted bounded programme still replays',()=>{
  const d=session();
  for(let index=d.state.actions.length;index<1200;index++) d.send({type:'OPEN_BOOTCAMP'});
  d.reject({type:'OPEN_BOOTCAMP'},'ACTION_CAPACITY');
  assert.equal(validateProgrammeSave(d.state).valid,true);
  const oversized=copy(d.state); oversized.actions.push({type:'OPEN_BOOTCAMP'});
  assert.equal(validateProgrammeSave(oversized).valid,false);
});

test('B5 independent regression: near-cap progress export remains restorable when formatted JSON would exceed the import limit',t=>{
  const d=atLesson('boot.transfer');
  let expandedBytes=0;
  for(let index=0;index<300;index++) {
    d.boot({type:'SAVE_REFLECTION',text:'x'.repeat(2000),oral:false});
    expandedBytes=Buffer.byteLength(JSON.stringify(d.state,null,2));
    if(expandedBytes>1048576) break;
  }
  assert.ok(expandedBytes>1048576,'The regression must reach the original export/import mismatch boundary.');
  const download=serializeProgrammeProgress(d.state);
  assert.ok(Buffer.byteLength(download)<=1048576);
  const imported=validateProgrammeSave(download);
  assert.equal(imported.valid,true,imported.error);
  assert.deepEqual(imported.state,d.state);
  t.diagnostic(`Export boundary: ${d.state.actions.length} accepted actions; formatted JSON ${expandedBytes} bytes; actual progress download ${Buffer.byteLength(download)} bytes, valid on replay.`);
});

test('B1/B4/B5/B7 independent: complete demonstrations, course and paid field remain bounded with separate earnings and evidence',t=>{
  const d=allTraining({demos:true});
  d.send({type:'ENTER_FIELD'}); d.send({type:'REVIEW_BRIEF'});
  for(const section of d.view.field.guideQuotes.map(item=>item.sectionId)) {
    const quote=d.view.field.guideQuotes.find(item=>item.sectionId===section);
    d.send({type:'GUIDE_CONSULT',sectionId:section,quoteToken:quote.quoteToken});
  }
  d.send({type:'ASSIGN_NURSE',itemId:'item.laptop'});
  d.send({type:'BUY_ITEM',sku:'access-point'}); d.send({type:'BUY_ITEM',sku:'ethernet-cable'});
  d.send({type:'INSTALL_ITEM',itemId:'item.ap'});
  d.send({type:'POWER_DEVICE',deviceId:d.view.field.apDeviceId,on:true});
  const ap=d.view.field.devices.find(item=>item.id===d.view.field.apDeviceId);
  const sw=d.view.field.devices.find(item=>item.id===d.view.field.switchDeviceId);
  d.send({type:'CONNECT_PORTS',fromDeviceId:ap.id,fromPortId:ap.ports.find(port=>port.medium==='ethernet').id,toDeviceId:sw.id,toPortId:sw.ports.filter(port=>port.medium==='ethernet'&&!port.cableId).at(-1).id,itemId:'item.uplink'});
  d.send({type:'ASSOCIATE_WIFI',deviceId:d.view.field.nurseDeviceId,apDeviceId:ap.id});
  d.send({type:'RUN_PROBE',testId:'nurse'});
  assert.equal(d.view.field.observations[0].code,'ADDRESS_WRONG_SUBNET');
  d.send({type:'SET_STATIC_ADDRESS',deviceId:d.view.field.nurseDeviceId,address:'10.40.10.77',mask:'255.255.255.0'});
  d.send({type:'SET_PERMISSIONS',policyId:'policy.nurse-also-books'});
  d.send({type:'RUN_PROBE',testId:'all'});
  d.send({type:'MOVE_NURSE',locationId:'location.exam-b'}); d.send({type:'RUN_PROBE',testId:'nurse'});
  for(const key of ['equipment','repair','privacy','limitations']) d.send({type:'SAVE_EXPLANATION',key,text:`Independent QA field ${key}; exact text for review.`,oral:false});
  assert.equal(d.view.field.ready,true,JSON.stringify(d.view.field.missing));
  d.send({type:'REQUEST_HANDOVER'}); d.send({type:'SETTLE_CONTRACT'});
  assert.equal(d.view.field.economy.reserved,15); assert.equal(d.view.field.economy.minutes,9);
  assert.equal(d.view.field.economy.wallet,105);
  d.send({type:'SETTLE_CONTRACT'}); assert.equal(d.view.field.economy.wallet,105);
  const field=copy(d.state.field);
  d.send({type:'OPEN_BOOTCAMP'}); d.boot({type:'RESTART_PRACTICE'}); d.send({type:'ENTER_FIELD'});
  assert.deepEqual(d.state.field,field);
  const evidence=createProgrammeEvidence(d.state);
  assert.equal(evidence.json.training.financialEffect.earnings,0);
  assert.equal(evidence.json.training.independentMastery,false);
  assert.equal(evidence.json.training.demonstrations.length,5);
  assert.ok(evidence.json.field.current.playerObservations.every(item=>item.origin==='player'));
  const encoded=JSON.stringify(d.state),started=performance.now(),checked=validateProgrammeSave(encoded);
  assert.equal(checked.valid,true,checked.error); assert.deepEqual(checked.state,d.state);
  assert.ok(Buffer.byteLength(encoded)<1048576);
  t.diagnostic(`Node-only complete route: ${d.state.actions.length} programme actions; ${Buffer.byteLength(encoded)} bytes; replay ${(performance.now()-started).toFixed(1)} ms. Not a browser or school-device timing.`);
});

function mockedStorage({failWrites=false}={}) {
  const records=new Map(),held=new Set(),channels=[];
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    getItem:key=>records.get(key)??null,
    setItem:(key,value)=>{if(failWrites)throw Error('QA quota');records.set(key,String(value));},
    removeItem:key=>records.delete(key)
  }});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,options,callback)=>{
    if(held.has(name))return callback(null);held.add(name);
    try{return await callback({name});}finally{held.delete(name);}
  }}}});
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class {
    constructor(name){this.name=name;channels.push(this);}
    postMessage(data){for(const channel of channels)if(channel!==this&&channel.name===this.name)channel.onmessage?.({data});}
    close(){channels.splice(channels.indexOf(this),1);}
  }});
  globalThis.addEventListener=()=>{}; globalThis.removeEventListener=()=>{};
  return records;
}
const namespace='riverbend.clinic.opening.v1.';
const persistence=()=>createPersistence({namespace,createGame:()=>createProgramme({campaignId:'qa.persistence.independent'}),dispatch:dispatchProgramme,validateSave:validateProgrammeSave});
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('B5 independent adapter: corrupted imports preserve memory/disk; takeover retains earned state; clear returns to unearned bootcamp',async()=>{
  const records=mockedStorage(), first=await persistence();
  await first.send({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit'}});
  await first.send({type:'BOOT_ACTION',action:{type:'START_PRACTICE'}});
  const before=first.getState(),disk=records.get(namespace+'snapshot');
  const corrupt=copy(before);corrupt.fieldStarted=true;
  for(const raw of ['{broken',JSON.stringify(corrupt),'x'.repeat(1048577)]) {
    assert.equal((await first.importProgress(raw)).accepted,false);
    assert.equal(first.getState(),before);assert.equal(records.get(namespace+'snapshot'),disk);
  }
  const second=await persistence();
  assert.equal(second.getStatus().mode,'readonly');
  assert.equal((await second.send({type:'OPEN_BOOTCAMP'})).code,'TAB_READ_ONLY');
  assert.equal((await second.takeControl()).accepted,true);
  assert.equal(first.getStatus().mode,'readonly');
  assert.deepEqual(second.getState(),before);
  assert.equal((await second.clear()).accepted,true);
  assert.equal(deriveProgramme(second.getState()).bootcamp.phase,'welcome');
  assert.equal(deriveProgramme(second.getState()).canEnterField,false);
  first.dispose();second.dispose();await tick();
});

test('B5 independent adapter: denied storage remains explicit memory mode with usable progress export',async()=>{
  mockedStorage({failWrites:true}); const store=await persistence();
  assert.equal(store.getStatus().mode,'memory');
  assert.equal((await store.send({type:'OPEN_BOOTCAMP'})).accepted,true);
  const result=await store.send({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit'}});
  assert.equal(result.accepted,true);
  assert.equal(store.getStatus().mode,'memory');
  assert.equal(validateProgrammeSave(JSON.stringify(store.getState())).valid,true);
  const cleared=await store.clear();
  assert.equal(cleared.accepted,true,'The mock permits removing saved copies even though writes fail.');
  assert.match(cleared.message,/memory|not been saved/);
  assert.equal(store.getStatus().mode,'memory');
  assert.equal(deriveProgramme(store.getState()).canEnterField,false);
  store.dispose();await tick();
});
