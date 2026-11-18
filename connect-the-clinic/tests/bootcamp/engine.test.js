import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgramme,dispatchProgramme,deriveProgramme,validateProgrammeSave,createProgrammeEvidence} from '../../dist/opening/programme.js';
import {createShift,dispatchShift,deriveShift} from '../../dist/opening/engine.js';
import {withTruck,onBench} from '../apprentice/helpers.js';

const clone=x=>JSON.parse(JSON.stringify(x));
function driver(state=withTruck(createProgramme({campaignId:'test.bootcamp'}))){
  return {state,get view(){return deriveProgramme(this.state);},get training(){return this.view.bootcamp;},send(action){const result=dispatchProgramme(this.state,action);assert.equal(result.accepted,true,`${action.type}: ${result.code} ${result.message}`);this.state=result.state;return result;},boot(action){return this.send({type:'BOOT_ACTION',action});},net(action){return this.boot({type:'NETWORK_ACTION',action});},reject(action,code){const before=this.state,encoded=JSON.stringify(before),result=dispatchProgramme(before,action);assert.equal(result.accepted,false);assert.equal(result.state,before);assert.equal(JSON.stringify(before),encoded);if(code)assert.equal(result.code,code);return result;}};
}
function open(d,id,demo=false){d.boot({type:'START_LESSON',lessonId:id});if(demo){d.boot({type:'START_DEMO'});while(d.training.demo.nextStepId)d.boot({type:'NEXT_DEMO'});}d.boot({type:'START_PRACTICE'});}
function link(d,deviceId,switchPort){const sw=d.training.switchDeviceId;d.net({type:'CONNECT_PORTS',fromDeviceId:deviceId,fromPortId:`${deviceId}.eth1`,toDeviceId:sw,toPortId:`${sw}.eth${switchPort}`});}
function kit(d,{alternate=false,demo=false}={}){
  open(d,'boot.kit',demo);for(const [roleId,kind]of[['role.reception','desktop'],['infra.switch',alternate?'switch8':'switch4'],['role.records',alternate?'desktop':'server']]){d.net({type:'CHOOSE_DEVICE',roleId,kind});const deviceId=d.training.devices.find(x=>x.roleId===roleId).id;d.net({type:'POWER_DEVICE',deviceId,on:true});}assert.equal(d.training.canComplete,true);d.boot({type:'COMPLETE_LESSON'});
}
function cables(d,{alternate=false,demo=false}={}){open(d,'boot.cables',demo);link(d,d.training.serverDeviceId,alternate?4:1);link(d,d.training.workstationDeviceId,alternate?3:2);d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.canComplete,true);d.boot({type:'COMPLETE_LESSON'});}
function address(d,{demo=false,last=47}={}){open(d,'boot.address',demo);d.boot({type:'RUN_TEST',testId:'reception'});d.net({type:'SET_STATIC_ADDRESS',deviceId:d.training.workstationDeviceId,address:`192.168.80.${last}`,mask:'255.255.255.0'});d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.canComplete,true);d.boot({type:'COMPLETE_LESSON'});}
function wireless(d,{demo=false}={}){open(d,'boot.wireless',demo);d.net({type:'POWER_DEVICE',deviceId:d.training.apDeviceId,on:true});link(d,d.training.apDeviceId,4);d.net({type:'ASSOCIATE_WIFI',deviceId:d.training.nurseDeviceId,apDeviceId:d.training.apDeviceId});d.boot({type:'RUN_TEST',testId:'nurse'});d.net({type:'MOVE_NURSE',locationId:'location.exam-b'});d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.canComplete,true);d.boot({type:'COMPLETE_LESSON'});}
function access(d,{demo=false,policyId='policy.roles-separated'}={}){open(d,'boot.access',demo);d.net({type:'SET_PERMISSIONS',policyId});d.boot({type:'RUN_TEST',testId:'access'});assert.equal(d.training.canComplete,true);d.boot({type:'COMPLETE_LESSON'});}
function transfer(d,{inspect=false,oral=false,text='Changing an IP address cannot replace an unplugged Ethernet uplink. I reconnected the AP and retested the route.'}={}){open(d,'boot.transfer');if(inspect)d.boot({type:'INSPECT_DEVICE',deviceId:d.training.apDeviceId});else d.boot({type:'RUN_TEST',testId:'nurse'});link(d,d.training.apDeviceId,4);d.boot({type:'RUN_TEST',testId:'all'});d.boot({type:'SAVE_REFLECTION',text:oral?'':text,oral});assert.equal(d.training.canComplete,true);d.boot({type:'COMPLETE_LESSON'});}
function through(d,count=6,options={}){[kit,cables,address,wireless,access,transfer].slice(0,count).forEach(fn=>fn(d,options));return d;}
function readyForAddress(){const d=through(driver(),2);open(d,'boot.address');return d;}
function readyForWireless(){const d=through(driver(),3);open(d,'boot.wireless');return d;}
function readyForAccess(){const d=through(driver(),4);open(d,'boot.access');return d;}
function readyForTransfer(){const d=through(driver(),5);open(d,'boot.transfer');return d;}

test('B1 new programme starts in training; later lesson and field bypasses reject atomically',()=>{
  assert.equal(deriveProgramme(createProgramme({campaignId:'test.bootcamp'})).screen,'apprentice','0.9 programmes open at the apprenticeship depot');
  const d=driver(onBench(createProgramme({campaignId:'test.bootcamp'})));assert.equal(d.view.screen,'bootcamp');assert.equal(d.training.phase,'welcome');assert.equal(d.view.canEnterField,false);
  d.reject({type:'ENTER_FIELD'},'TRUCK_REQUIRED');d.reject({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.address'}},'LESSON_LOCKED');d.reject({type:'BUY_ITEM',sku:'tablet'},'FIELD_SCREEN_REQUIRED');
  d.reject({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit',complete:true}},'ACTION_FIELDS');
});

test('B1/B2 all worked examples and six real tasks lead to the independent brief without field evidence',t=>{
  const d=through(driver(),6,{demo:true});assert.equal(d.training.courseComplete,true);assert.equal(d.training.progress.completed,6);assert.equal(d.view.canEnterField,true);
  assert.equal(d.state.field.actions.length,0);assert.equal(d.state.field.wallet,0);assert.equal(d.view.field.observations.length,0);
  assert.equal(d.state.bootcamp.demonstrationRecords.length,5);assert.ok(d.state.bootcamp.demonstrationRecords.every(r=>r.completed&&r.origin==='trainer'));
  d.send({type:'ENTER_FIELD'});assert.equal(d.view.screen,'field');assert.equal(d.view.fieldStarted,true);assert.equal(d.view.field.briefReviewed,false);assert.equal(d.view.field.followUp.bootcampCompleted,false);
  for(const action of completedField().actions)d.send(action);
  assert.equal(d.view.field.phase,'settled');assert.equal(d.view.field.economy.wallet,120);
  const encoded=JSON.stringify(d.state),started=performance.now(),checked=validateProgrammeSave(encoded),elapsed=performance.now()-started;
  assert.equal(checked.valid,true,checked.error);assert.ok(Buffer.byteLength(encoded)<1048576);
  t.diagnostic(`Complete taught course plus paid field: ${Buffer.byteLength(encoded)} bytes, ${d.state.actions.length} programme actions; replay ${elapsed.toFixed(1)} ms in this Node container (not school performance).`);
});

test('B2 demonstrations cannot complete practice and fresh practice uses a different address network',()=>{
  const d=through(driver(),2);d.boot({type:'START_LESSON',lessonId:'boot.address'});d.boot({type:'START_DEMO'});
  for(let i=0;i<3;i++)d.boot({type:'NEXT_DEMO'});
  assert.equal(d.training.network.cidr,'192.168.60.0/24');assert.ok(d.training.observations.some(o=>o.pass));assert.ok(d.training.observations.every(o=>o.origin==='trainer'));assert.equal(d.training.canComplete,false);
  d.reject({type:'BOOT_ACTION',action:{type:'COMPLETE_LESSON'}},'PRACTICE_REQUIRED');const demoId=d.training.attemptId;
  d.boot({type:'START_PRACTICE'});assert.notEqual(d.training.attemptId,demoId);assert.equal(d.training.network.cidr,'192.168.80.0/24');assert.equal(d.training.observations.length,0);assert.equal(d.training.canComplete,false);
  assert.equal(d.training.devices.find(x=>x.id===d.training.workstationDeviceId).address,'192.168.81.20');
});

test('B3 alternative suitable kit and switch ports pass; an incomplete physical path fails',()=>{
  const d=driver();kit(d,{alternate:true});open(d,'boot.cables');d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.observations[0].code,'PORT_DISCONNECTED');
  link(d,d.training.serverDeviceId,4);d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.observations[0].code,'PORT_DISCONNECTED');assert.equal(d.training.canComplete,false);
  link(d,d.training.workstationDeviceId,3);d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.canComplete,true);
});

test('B3 occupied or incompatible ports reject without adding a cable',()=>{
  const d=readyForWireless(),v=d.training;
  d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'CONNECT_PORTS',fromDeviceId:v.apDeviceId,fromPortId:`${v.apDeviceId}.eth1`,toDeviceId:v.switchDeviceId,toPortId:`${v.switchDeviceId}.eth1`}}},'PORT_OCCUPIED');
  d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'CONNECT_PORTS',fromDeviceId:v.nurseDeviceId,fromPortId:`${v.nurseDeviceId}.wifi0`,toDeviceId:v.switchDeviceId,toPortId:`${v.switchDeviceId}.eth3`}}},'PORT_INCOMPATIBLE');
});

test('B5 inherited property names cannot act as device or access point IDs',()=>{
  const d=readyForWireless();
  for(const deviceId of ['__proto__','constructor','toString']){
    d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'POWER_DEVICE',deviceId,on:true}}},'DEVICE_UNKNOWN');
    d.reject({type:'BOOT_ACTION',action:{type:'INSPECT_DEVICE',deviceId}},'DEVICE_UNKNOWN');
    d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'ASSOCIATE_WIFI',deviceId:d.training.nurseDeviceId,apDeviceId:deviceId}}},'DEVICE_UNKNOWN');
  }
  assert.equal(Object.hasOwn(Object.prototype,'powered'),false);
});

test('B3 malformed address/mask reject; duplicate, reserved and wrong-subnet configurations fail accurately',()=>{
  const d=readyForAddress(),deviceId=d.training.workstationDeviceId;
  const set=(address,mask='255.255.255.0')=>({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId,address,mask}}});
  d.reject(set('192.168.80.256'),'ADDRESS_INVALID');d.reject(set('192.168.080.20'),'ADDRESS_INVALID');d.reject(set('192.168.80.40','255.0.255.0'),'MASK_INVALID');
  for(const [address,code]of[['192.168.80.10','ADDRESS_DUPLICATE'],['192.168.80.0','ADDRESS_RESERVED'],['192.168.80.255','ADDRESS_RESERVED'],['192.168.81.40','ADDRESS_WRONG_SUBNET']]){d.send(set(address));d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.observations[0].code,code);assert.equal(d.training.canComplete,false);}
});

test('B3 explicit invalid mask values reject atomically instead of retaining a previous mask',()=>{
  const d=readyForAddress(),deviceId=d.training.workstationDeviceId;
  for(const mask of ['',null,0,false,[],{},'255.0.255.0','0.0.0.0','255.255.255.255']){
    d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId,address:'192.168.80.47',mask}}},'MASK_INVALID');
    assert.equal(d.training.devices.find(x=>x.id===deviceId).address,'192.168.81.20');
    assert.equal(d.training.devices.find(x=>x.id===deviceId).mask,'255.255.255.0');
  }
});

test('B3 /24 task requirement is distinct from actual local reachability under another valid mask',()=>{
  const d=readyForAddress(),deviceId=d.training.workstationDeviceId;
  d.net({type:'SET_STATIC_ADDRESS',deviceId,address:'192.168.80.47',mask:'255.255.0.0'});d.boot({type:'RUN_TEST',testId:'reception'});
  assert.equal(d.training.observations[0].code,'SERVICE_AVAILABLE');assert.equal(d.training.canComplete,false);assert.equal(d.training.checks.find(x=>x.id==='supplied-mask').met,false);
  d.net({type:'SET_STATIC_ADDRESS',deviceId,address:'192.168.80.47',mask:'255.255.255.240'});d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.observations[0].code,'ADDRESS_RESERVED');
  d.net({type:'SET_STATIC_ADDRESS',deviceId,address:'192.168.80.46',mask:'255.255.255.240'});d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.observations[0].code,'ADDRESS_OFF_LINK');
  d.net({type:'SET_STATIC_ADDRESS',deviceId,address:'192.168.80.46',mask:'255.255.255.0'});d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.canComplete,true);
});

test('B2/B3 current engine success alone and stale learner tests cannot complete an address task',()=>{
  const d=readyForAddress();d.net({type:'SET_STATIC_ADDRESS',deviceId:d.training.workstationDeviceId,address:'192.168.80.99',mask:'255.255.255.0'});
  assert.equal(d.training.currentResults[0].pass,true);assert.equal(d.training.canComplete,false);
  d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.canComplete,true);
  d.net({type:'POWER_DEVICE',deviceId:d.training.switchDeviceId,on:false});assert.equal(d.training.observations[0].stale,true);assert.equal(d.training.canComplete,false);
  d.net({type:'POWER_DEVICE',deviceId:d.training.switchDeviceId,on:true});assert.equal(d.training.canComplete,false);d.boot({type:'RUN_TEST',testId:'reception'});assert.equal(d.training.canComplete,true);
});

test('B3 wireless power, association and uplink are independently necessary',()=>{
  const d=readyForWireless();d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.observations[0].code,'WIFI_NOT_ASSOCIATED');
  d.net({type:'ASSOCIATE_WIFI',deviceId:d.training.nurseDeviceId,apDeviceId:d.training.apDeviceId});d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.observations[0].code,'AP_OFF');
  d.net({type:'POWER_DEVICE',deviceId:d.training.apDeviceId,on:true});d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.observations[0].code,'PORT_DISCONNECTED');
  link(d,d.training.apDeviceId,3);d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.observations[0].code,'SERVICE_AVAILABLE');assert.equal(d.training.canComplete,false);
});

test('B2 paired-room evidence survives movement but another causal change invalidates both',()=>{
  const d=readyForWireless();d.net({type:'POWER_DEVICE',deviceId:d.training.apDeviceId,on:true});link(d,d.training.apDeviceId,4);d.net({type:'ASSOCIATE_WIFI',deviceId:d.training.nurseDeviceId,apDeviceId:d.training.apDeviceId});
  d.boot({type:'RUN_TEST',testId:'all'});assert.equal(d.training.requiredTests.filter(x=>x.met).length,1);
  d.net({type:'MOVE_NURSE',locationId:'location.exam-b'});assert.equal(d.training.requiredTests.filter(x=>x.met).length,1);d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.canComplete,true);
  d.net({type:'SET_STATIC_ADDRESS',deviceId:d.training.nurseDeviceId,address:'192.168.80.48',mask:'255.255.255.0'});assert.equal(d.training.requiredTests.filter(x=>x.met).length,0);
  d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'MOVE_NURSE',locationId:'location.home'}}},'LOCATION_NOT_IN_LESSON');
});

for(const policyId of ['policy.roles-separated','policy.nurse-also-books'])test(`B3 responsible policy ${policyId} passes with its actual booking consequence`,()=>{
  const d=readyForAccess();d.net({type:'SET_PERMISSIONS',policyId});d.boot({type:'RUN_TEST',testId:'access'});assert.equal(d.training.canComplete,true);
  const booking=d.training.observations.find(o=>o.testId==='nurse-bookings');assert.equal(booking.code,policyId==='policy.roles-separated'?'ACCESS_DENIED':'SERVICE_AVAILABLE');
  assert.equal(d.training.observations.filter(o=>o.origin==='learner').length,6);assert.ok(d.training.requiredTests.every(x=>x.met));
});

test('B3 broad access and deny-all fail for their actual consequences, not cable status',()=>{
  const d=readyForAccess();d.net({type:'SET_PERMISSIONS',policyId:'policy.broad-access'});d.boot({type:'RUN_TEST',testId:'access'});
  const outsider=d.training.observations.find(o=>o.testId==='access-outsider-workspace');assert.equal(outsider.code,'SERVICE_AVAILABLE');assert.equal(outsider.pass,false);assert.equal(d.training.canComplete,false);
  d.net({type:'SET_PERMISSIONS',policyId:'policy.deny-all'});d.boot({type:'RUN_TEST',testId:'access'});const staff=d.training.observations.find(o=>o.testId==='nurse');assert.equal(staff.code,'ACCESS_DENIED');assert.equal(staff.pass,false);assert.equal(d.training.canComplete,false);
});

test('B3 transfer valid IP edit does not replace a missing physical link; relevant repair restores service',()=>{
  const d=readyForTransfer(),v=d.training;assert.equal(v.network.cidr,'192.168.90.0/24');assert.equal(v.devices.find(x=>x.id===v.nurseDeviceId).address,'192.168.90.30');
  d.reject({type:'BOOT_ACTION',action:{type:'START_DEMO'}},'TRANSFER_NO_DEMO');
  d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.observations[0].code,'PORT_DISCONNECTED');
  d.net({type:'SET_STATIC_ADDRESS',deviceId:v.nurseDeviceId,address:'192.168.90.49',mask:'255.255.255.0'});d.boot({type:'RUN_TEST',testId:'nurse'});assert.equal(d.training.observations[0].code,'PORT_DISCONNECTED');assert.equal(d.training.repair.change,null);
  link(d,d.training.apDeviceId,4);d.boot({type:'RUN_TEST',testId:'all'});assert.equal(d.training.repair.confirmed,true);assert.equal(d.training.canComplete,false);
  d.boot({type:'SAVE_REFLECTION',text:'The cable supplies the missing physical route; a different valid IP cannot do that.',oral:false});assert.equal(d.training.canComplete,true);
});

test('B2/B4 inspection-led transfer repair is accepted without fabricating a failed probe, and oral review remains pending',()=>{
  const d=through(driver(),5);transfer(d,{inspect:true,oral:true});const record=d.training.completionRecords.at(-1);
  assert.equal(record.repair.observed.kind,'inspection');assert.ok(record.observations.every(o=>o.pass));assert.equal(record.reflection.text,'');assert.equal(record.reflection.oral,true);assert.equal(record.teacherReview,'pending');assert.equal(record.independentMastery,false);
});

test('B2 transfer needs actual faulty observation and a reflection reviewed after the passing test',()=>{
  const d=readyForTransfer();link(d,d.training.apDeviceId,3);d.boot({type:'RUN_TEST',testId:'all'});d.boot({type:'SAVE_REFLECTION',text:'A route is necessary.',oral:false});assert.equal(d.training.canComplete,false);assert.equal(d.training.repair.observed,null);
  const uplink=d.training.cables.find(c=>[c.fromDeviceId,c.toDeviceId].includes(d.training.apDeviceId));d.net({type:'DISCONNECT_CABLE',cableId:uplink.id});d.boot({type:'RUN_TEST',testId:'nurse'});link(d,d.training.apDeviceId,4);d.boot({type:'RUN_TEST',testId:'all'});assert.equal(d.training.reflection.stale,true);assert.equal(d.training.canComplete,false);d.boot({type:'SAVE_REFLECTION',text:'The actual missing uplink was reconnected and the service retested.',oral:false});assert.equal(d.training.canComplete,true);
});

test('B4 free hints, exact reflections and trainer/player separation are present in evidence',()=>{
  const d=through(driver(),5,{demo:true});open(d,'boot.transfer');d.boot({type:'REVEAL_HINT',tier:1});d.boot({type:'REVEAL_HINT',tier:3});d.boot({type:'RUN_TEST',testId:'nurse'});link(d,d.training.apDeviceId,3);d.boot({type:'RUN_TEST',testId:'all'});
  const text='My words: cables carry the path.\nThe mask did not replace the absent uplink. <script>not executed</script>';
  d.boot({type:'SAVE_REFLECTION',text,oral:false});d.boot({type:'COMPLETE_LESSON'});
  const evidence=createProgrammeEvidence(d.state);assert.equal(evidence.json.training.completionRecords.at(-1).reflection.text,text);assert.ok(evidence.text.includes(text));assert.equal(evidence.json.training.financialEffect.credits,0);assert.equal(evidence.json.field.wallet,0);assert.ok(evidence.json.training.demonstrations.every(r=>r.origin==='trainer'));assert.equal(evidence.json.field.current.playerObservations.length,0);
});

test('B4 readable evidence reports frozen choices, access consequences, room tests and the actual repaired fault',()=>{
  const d=through(driver(),6,{alternate:true,policyId:'policy.nurse-also-books'}),completed=createProgrammeEvidence(d.state);
  assert.match(completed.text,/service host = desktop, power on/);
  assert.match(completed.text,/switch = 8-port switch, power on/);
  assert.match(completed.text,/Applied workstation address 192\.168\.80\.47, mask 255\.255\.255\.0/);
  assert.match(completed.text,/Nurse also books \(policy\.nurse-also-books\); explicit choice recorded/);
  assert.match(completed.text,/nurse-bookings @ Exam room A: SERVICE_AVAILABLE; allowed; pass; current at completion/);
  assert.match(completed.text,/access-outsider-workspace @ [^\n]+: ACCESS_DENIED; denied; pass; current at completion/);
  for(const room of ['A','B'])assert.ok(completed.text.includes(`nurse @ Exam room ${room}: SERVICE_AVAILABLE; allowed; pass; current at completion`));
  assert.match(completed.text,/Observed fault: PORT_DISCONNECTED by failed learner test; stale at completion \(before repair\)/);
  assert.match(completed.text,/Recorded repair: access point eth1 ↔ switch eth4\. Latest required retests follow/);
  // A new, still-broken attempt must not replace the frozen completed evidence.
  open(d,'boot.transfer');const before=JSON.stringify(d.state),reopened=createProgrammeEvidence(d.state);
  assert.equal(JSON.stringify(d.state),before);
  assert.equal(reopened.text,completed.text);
  assert.equal(reopened.json.training.current.reflection.text,'');
  assert.equal(reopened.json.training.current.cables.some(c=>[c.fromDeviceId,c.toDeviceId].includes(d.training.apDeviceId)),false);
  assert.deepEqual(reopened.json.training.completionRecords,completed.json.training.completionRecords);
});

test('B5 retries create new attempt IDs and retain completed training without altering field work',()=>{
  const d=through(driver(),2),field=JSON.stringify(d.state.field),completed=d.training.completedLessonIds.slice();d.boot({type:'START_LESSON',lessonId:'boot.cables'});d.boot({type:'START_PRACTICE'});const before=d.training.attemptId;link(d,d.training.serverDeviceId,1);d.boot({type:'RESTART_PRACTICE'});
  assert.notEqual(d.training.attemptId,before);assert.equal(d.training.cables.length,0);assert.deepEqual(d.training.completedLessonIds,completed);assert.equal(JSON.stringify(d.state.field),field);
});

test('B5 programme round trip preserves complete training and replay rejects forged flags or corrupted nested state',()=>{
  const d=through(driver(),6,{demo:true});d.send({type:'ENTER_FIELD'});d.send({type:'REVIEW_BRIEF'});const valid=validateProgrammeSave(JSON.stringify(d.state));assert.equal(valid.valid,true,valid.error);assert.deepEqual(valid.state,d.state);
  for(const alter of [s=>{s.fieldStarted=false;},s=>{s.bootcamp.completionRecords=[];},s=>{Object.values(s.bootcamp.current.networkState.attempts[s.bootcamp.current.networkState.activeAttemptId].devices)[0].powered=false;},s=>{s.field.wallet=999;},s=>{s.actions[0].action.lessonId='boot.transfer';}]){
    const corrupted=clone(d.state);alter(corrupted);assert.equal(validateProgrammeSave(corrupted).valid,false);
  }
  assert.equal(validateProgrammeSave('{"appId":').valid,false);assert.equal(validateProgrammeSave('x'.repeat(1048577)).code,'SAVE_TOO_LARGE');
});

function completedField(){
  let state=createShift({campaignId:'test.existing-paid'});
  const send=action=>{const r=dispatchShift(state,action);assert.equal(r.accepted,true,`${action.type}: ${r.code} ${r.message}`);state=r.state;};
  send({type:'REVIEW_BRIEF'});send({type:'ASSIGN_NURSE',itemId:'item.laptop'});send({type:'BUY_ITEM',sku:'access-point'});send({type:'BUY_ITEM',sku:'ethernet-cable'});send({type:'INSTALL_ITEM',itemId:'item.ap'});
  let v=deriveShift(state);send({type:'POWER_DEVICE',deviceId:v.apDeviceId,on:true});send({type:'CONNECT_PORTS',fromDeviceId:v.apDeviceId,fromPortId:`${v.apDeviceId}.eth1`,toDeviceId:v.switchDeviceId,toPortId:`${v.switchDeviceId}.eth4`,itemId:'item.uplink'});send({type:'ASSOCIATE_WIFI',deviceId:v.nurseDeviceId,apDeviceId:v.apDeviceId});send({type:'RUN_PROBE',testId:'nurse'});send({type:'SET_STATIC_ADDRESS',deviceId:v.nurseDeviceId,address:'10.40.10.47',mask:'255.255.255.0'});send({type:'SET_PERMISSIONS',policyId:'policy.roles-separated'});send({type:'RUN_PROBE',testId:'all'});send({type:'MOVE_NURSE',locationId:'location.exam-b'});send({type:'RUN_PROBE',testId:'nurse'});
  for(const key of ['equipment','repair','privacy','limitations'])send({type:'SAVE_EXPLANATION',key,text:`Synthetic QA ${key} explanation for migration preservation.`,oral:false});send({type:'REQUEST_HANDOVER'});send({type:'SETTLE_CONTRACT'});return state;
}

test('B5 existing0.7 paid field work migrates unchanged without granting training completion',()=>{
  const field=completedField(),migrated=validateProgrammeSave(JSON.stringify(field));assert.equal(migrated.valid,true,migrated.error);const d=driver(migrated.state);assert.deepEqual(d.state.field,field);assert.equal(d.view.screen,'field');assert.equal(d.view.fieldStarted,true);assert.equal(d.training.progress.completed,0);assert.equal(d.view.field.economy.wallet,120);assert.ok(d.view.migrationNotice);
  const before=JSON.stringify(d.state.field);d.send({type:'OPEN_BOOTCAMP'});through(d,6);d.send({type:'ENTER_FIELD'});assert.equal(JSON.stringify(d.state.field),before);assert.equal(d.view.field.phase,'settled');assert.equal(d.view.field.economy.wallet,120);assert.equal(validateProgrammeSave(d.state).valid,true);
  assert.ok(Buffer.byteLength(JSON.stringify(d.state))<1048576);
});

test('B5 invalid0.7 field import and unsupported old0.6 are rejected without claiming training',()=>{
  const field=completedField();field.wallet=240;assert.equal(validateProgrammeSave(field).valid,false);
  const legacy={schemaVersion:1,attempts:{},activeAttemptId:'attempt.0001'};assert.equal(validateProgrammeSave(legacy).code,'LEGACY_SAVE');
});

test('B5/B7 field and training actions cannot cross screens; field can resume after revisiting a lesson',()=>{
  const d=through(driver());d.send({type:'ENTER_FIELD'});d.send({type:'REVIEW_BRIEF'});d.reject({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit'}},'BOOTCAMP_SCREEN_REQUIRED');const field=JSON.stringify(d.state.field);d.send({type:'OPEN_BOOTCAMP'});d.boot({type:'START_LESSON',lessonId:'boot.kit'});d.boot({type:'START_PRACTICE'});d.reject({type:'SETTLE_CONTRACT'},'FIELD_SCREEN_REQUIRED');d.send({type:'ENTER_FIELD'});assert.equal(JSON.stringify(d.state.field),field);
});

test('B2 completion freezes the active lesson and another practice is explicit',()=>{
  const d=driver();kit(d);const id=d.training.workstationDeviceId;d.reject({type:'BOOT_ACTION',action:{type:'NETWORK_ACTION',action:{type:'POWER_DEVICE',deviceId:id,on:false}}},'PRACTICE_REQUIRED');assert.equal(d.training.phase,'complete');d.boot({type:'RESTART_PRACTICE'});assert.equal(d.training.phase,'practice');assert.equal(d.training.devices.length,0);assert.equal(d.training.completedLessonIds.length,1);
});

test('0.9 bench completion alone does not open independent work; only the earned van does',()=>{
  const d=through(driver(onBench(createProgramme({campaignId:'test.bench.only'}))),6);
  assert.equal(d.training.courseComplete,true);assert.equal(d.view.canEnterField,false);d.reject({type:'ENTER_FIELD'},'TRUCK_REQUIRED');
  const forged=clone(d.state);forged.apprentice.completionRecords.push({visitId:'visit.1',origin:'learner-practice'});
  assert.equal(validateProgrammeSave(JSON.stringify(forged)).valid,false,'an edited completion record is rejected by replay');
  const flagged=clone(d.state);flagged.apprenticeOrigin='legacy';const checked=validateProgrammeSave(JSON.stringify(flagged));
  // Local files are editable; an origin edit must still never award the van or visit completion.
  if(checked.valid){const view=deriveProgramme(checked.state).apprentice;assert.equal(view.truckEarned,false);assert.equal(view.completedVisitIds.length,0);}
});
