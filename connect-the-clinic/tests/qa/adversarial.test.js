import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,derive,createEvidence,validateSave} from '../../dist/engine.js';
import {act,client,device,completeTrainingStage} from '../simulation/fixtures.js';

// Independent acceptance checks. Fixture helpers only construct inputs; assertions
// below follow the reviewed contract, not the production implementation.
const copy=x=>JSON.parse(JSON.stringify(x));
const attempt=g=>g.attempts[g.activeAttemptId];
const consult=(g,sectionId)=>{
  const q=derive(g).guideQuotes.find(x=>x.sectionId===sectionId);
  return act(g,'GUIDE_CONSULT',{sectionId,quoteToken:q.quoteToken});
};
const run=(g,testId='all')=>act(g,'RUN_PROBE',{testId});

for(const route of ['A','B']) for(const policy of ['policy.roles-separated','policy.nurse-also-books']) {
  test(`QA01 complete ${route}/${policy}: real delivery, costs and one payment`,()=>{
    let g=client({route,policy});
    assert.equal(derive(g).ready,true);
    for(const q of derive(g).guideQuotes) g=consult(g,q.sectionId);
    assert.deepEqual([derive(g).economy.reserved,derive(g).economy.minutes,g.wallet],[15,9,0]);
    const text='I chose this setup because it meets the stated mobility need; I would reconsider if typing needs changed.';
    g=act(g,'SAVE_EXPLANATION',{key:'equipment',text,oral:false});
    g=act(g,'REQUEST_HANDOVER');
    assert.equal(g.contract.phase,'delivered');
    const frozen=copy(g.contract.delivery);
    assert.equal(frozen.netFee,105);
    g=act(g,'SETTLE_CONTRACT');
    g=act(g,'SETTLE_CONTRACT');
    g=act(g,'REQUEST_HANDOVER');
    assert.equal(g.wallet,105);
    assert.equal(g.settlements.length,1);
    assert.deepEqual(g.contract.delivery,frozen);
    assert.equal(createEvidence(g).json.explanations.equipment.text,text);
    assert.ok(createEvidence(g).text.includes(text));
    assert.equal(validateSave(JSON.stringify(g)).valid,true);
  });
}

test('QA02 privacy denial requires path, address and service, then repair restores it',()=>{
  const original=client();
  const cases=[
    ['server off',g=>act(g,'POWER_DEVICE',{deviceId:device(g,'role.records').id,on:false}),'DEVICE_OFF'],
    ['service off',g=>act(g,'SET_SERVICE_STATE',{enabled:false}),'SERVICE_UNAVAILABLE'],
    ['reception wrong subnet',g=>act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.reception').id,address:'10.40.20.20',mask:'255.255.255.0'}),'ADDRESS_WRONG_SUBNET'],
    ['reception unplugged',g=>act(g,'DISCONNECT_CABLE',{cableId:derive(g).cables.find(c=>c.fromDeviceId===device(g,'role.reception').id).id}),'PORT_DISCONNECTED']
  ];
  for(const [label,breakIt,reason] of cases){
    const broken=run(breakIt(original),'access');
    const denial=derive(broken).diagnostics.find(o=>o.testId==='access-outsider-workspace'&&!o.stale);
    assert.equal(denial.pass,false,label);
    assert.equal(denial.code,reason,label);
    assert.equal(derive(broken).ready,false,label);
    assert.equal(dispatch(broken,{type:'REQUEST_HANDOVER'}).state.contract.delivery,null,label);
  }
  assert.equal(derive(run(original,'access')).diagnostics.find(o=>o.testId==='access-outsider-workspace').code,'ACCESS_DENIED');
});

test('QA03 historical delivery stays frozen while later current service can fail',()=>{
  let g=act(client(),'REQUEST_HANDOVER');
  const frozen=copy(g.contract.delivery);
  g=act(g,'POWER_DEVICE',{deviceId:device(g,'role.records').id,on:false});
  assert.equal(derive(g).ready,false);
  assert.deepEqual(g.contract.delivery,frozen);
  assert.equal(createEvidence(g).json.readyForTeacherReview,false);
  assert.equal(createEvidence(g).json.delivery.id,frozen.id);
  g=act(g,'SETTLE_CONTRACT');
  g=act(g,'REQUEST_HANDOVER');
  assert.equal(g.wallet,120);
  assert.equal(g.settlements.length,1);
  assert.deepEqual(g.contract.delivery,frozen);
});

test('QA04 paid quote cannot charge after delivery; new quote is free',()=>{
  let g=client();
  const oldQuote=derive(g).guideQuotes[0];
  g=act(g,'REQUEST_HANDOVER');
  const frozen=copy(g.contract.delivery);
  const stale=dispatch(g,{type:'GUIDE_CONSULT',sectionId:oldQuote.sectionId,quoteToken:oldQuote.quoteToken});
  assert.equal(stale.accepted,false);
  assert.equal(stale.state,g);
  for(const q of derive(g).guideQuotes)g=consult(g,q.sectionId);
  assert.equal(derive(g).economy.reserved,0);
  assert.equal(derive(g).economy.minutes,0);
  assert.deepEqual(g.contract.delivery,frozen);
  g=act(g,'SETTLE_CONTRACT');
  assert.equal(g.wallet,120);
});

test('QA05 active retry, free bootcamp visit and return retain paid guide grants',()=>{
  let g=consult(client(),'guide.addressing-diagnosis');
  const first=g.activeAttemptId,grants=copy(g.contract.grants);
  g=act(g,'RESTART_ACTIVE_ATTEMPT');
  assert.notEqual(g.activeAttemptId,first);
  assert.equal(derive(g).mode,'client');
  assert.deepEqual(g.contract.grants,grants);
  const retry=g.activeAttemptId,clientState=copy(attempt(g));
  g=act(g,'START_TRAINING_ATTEMPT');
  g=act(g,'TRAINING_DEMO');
  for(const q of derive(g).guideQuotes)g=consult(g,q.sectionId);
  assert.deepEqual(g.attempts[retry],clientState);
  g=act(g,'RETURN_TO_CLIENT');
  assert.equal(g.activeAttemptId,retry);
  assert.equal(derive(g).economy.reserved,5);
  assert.equal(derive(g).guideQuotes.find(q=>q.sectionId==='guide.addressing-diagnosis').credits,0);
  assert.equal(validateSave(g).valid,true);
});

test('QA06 returned practice clone does not alter the client evidence or earn a fee',()=>{
  let g=act(client(),'REQUEST_HANDOVER');
  const frozen=copy(g.contract.delivery),originalId=g.activeAttemptId;
  g=act(g,'START_DELIVERED_CONTRACT_PRACTICE');
  assert.equal(derive(g).mode,'training');
  assert.notEqual(g.activeAttemptId,originalId);
  g=act(g,'POWER_DEVICE',{deviceId:device(g,'role.records').id,on:false});
  assert.deepEqual(g.contract.delivery,frozen);
  assert.equal(g.attempts[originalId].devices[device({ ...g,activeAttemptId:originalId },'role.records').id].powered,true);
  assert.equal(dispatch(g,{type:'REQUEST_HANDOVER'}).accepted,false);
  // Review 0.4 explicitly makes all free practice unable to settle the client.
  // Preserve the one-payment assertion after explicitly resuming that client.
  assert.equal(dispatch(g,{type:'SETTLE_CONTRACT'}).accepted,false);
  assert.equal(g.wallet,0);
  g=act(g,'RETURN_TO_CLIENT');
  g=act(g,'SETTLE_CONTRACT');
  g=act(g,'SETTLE_CONTRACT');
  assert.equal(g.wallet,120);
  assert.equal(validateSave(g).valid,true);
});

test('QA07 ordinary repeated diagnostic/retry sessions remain importable below 1 MiB',()=>{
  let g=createGame({campaignId:'campaign.qa-long-session'});
  for(let round=0;round<12;round++){
    for(let probe=0;probe<23;probe++)g=run(g);
    const bytes=Buffer.byteLength(JSON.stringify(g));
    const restored=validateSave(g);
    assert.equal(restored.valid,true,`round ${round+1}, ${bytes} bytes: ${restored.error}`);
    assert.ok(bytes<=1048576,`round ${round+1} produced its own unimportable progress file`);
    assert.equal(derive(restored.state).ready,false);
    g=act(g,'TRAINING_RETRY');
  }
});

const malformedSaveCases=[
  ['observation counter below IDs',g=>attempt(g).observationSequence=0],
  ['cable counter below IDs',g=>attempt(g).cableSequence=0],
  ['duplicate event IDs',g=>attempt(g).events[1].id=attempt(g).events[0].id],
  ['invalid cable suffix',g=>attempt(g).cables[0].id=attempt(g).id+'.cable.invalid'],
  ['dangling phone observation',g=>attempt(g).messages.find(m=>m.observationIds.length).observationIds=['missing.observation']],
  ['dangling baseline-failure observation',g=>attempt(g).fault.baselineFailures[0].id=attempt(g).id+'.observation.9999']
];
for(const [label,corrupt] of malformedSaveCases)test(`QA08 import rejects ${label}`,()=>{
  const original=client({repair:false,markers:false}),bad=copy(original);corrupt(bad);
  const before=JSON.stringify(original),v=validateSave(bad);
  assert.equal(v.valid,false,`Malformed reference accepted: ${label}`);
  assert.equal(JSON.stringify(original),before);
});

test('QA09 current observation identity fields are canonicalized or rejected',()=>{
  const g=client(),bad=copy(g),expected=copy(attempt(g).observations[0]);
  const o=attempt(bad).observations[0];o.actorRoleId='role.outsider';o.serviceId='service.not-real';o.contextLocationId='location.home';
  const restored=validateSave(bad);
  if(restored.valid){
    const actual=attempt(restored.state).observations.find(x=>x.id===o.id);
    for(const key of ['testId','actorRoleId','serviceId','contextLocationId','sourceDeviceId','expectedDenied'])assert.equal(actual[key],expected[key],key);
  }
});

for(const [label,corrupt] of [
  ['technical revision differs from frozen attempt',g=>g.contract.delivery.technicalRevision=999999],
  ['evidence text differs from frozen attempt',g=>g.contract.delivery.evidenceSnapshot.explanations.privacy.text='Text never entered in the delivered attempt.'],
  ['evidence equipment differs from frozen attempt',g=>g.contract.delivery.evidenceSnapshot.equipment[0].address='10.40.10.77']
])test(`QA10 frozen historical consistency: ${label}`,()=>{
  const g=act(client(),'REQUEST_HANDOVER'),bad=copy(g);corrupt(bad);
  assert.equal(validateSave(bad).valid,false,'Internally inconsistent frozen delivery accepted.');
});

test('QA11 completed bootcamp cannot be inferred from unsupported imported flags',()=>{
  const bad=createGame();
  bad.training.completed=['bootcamp.station.equipment-connections','bootcamp.station.address-diagnosis','bootcamp.station.access-handover'];
  assert.equal(bad.training.history.length,0);
  const restored=validateSave(bad);
  assert.equal(restored.valid,false,'Fresh attempt falsely imported as completed bootcamp without practice provenance.');
});

test('QA12 genuine completed bootcamp and its source history survive import',()=>{
  let g=createGame({campaignId:'campaign.qa-bootcamp'});
  for(let i=0;i<6;i++){g=completeTrainingStage(g);g=act(g,'TRAINING_NEXT');}
  const v=validateSave(g);assert.equal(v.valid,true,v.error);
  const result=dispatch(v.state,{type:'START_CLIENT_ATTEMPT'});
  assert.equal(result.accepted,true);
  assert.equal(result.state.contract.acceptedRoute,'bootcamp-completed');
  assert.equal(result.state.training.priorLearning,false);
});

for(const [label,corrupt] of [
  ['ledger revision behind grants',g=>g.contract.ledgerRevision=0],
  ['duplicate grant IDs',g=>g.contract.grants[1].id=g.contract.grants[0].id]
])test(`QA13 consultation import rejects ${label}`,()=>{
  let g=consult(client(),'guide.devices-paths');g=consult(g,'guide.addressing-diagnosis');
  const bad=copy(g);corrupt(bad);assert.equal(validateSave(bad).valid,false);
});

test('QA14 unprovided explanations remain unprovided; guide and demo never invent text',()=>{
  let g=client({explanations:false});
  for(const q of derive(g).guideQuotes){g=consult(g,q.sectionId);g=act(g,'REVEAL_HINT',{sectionId:q.sectionId,tier:3});}
  const evidence=createEvidence(g);
  for(const x of Object.values(evidence.json.explanations)){assert.equal(x.text,'');assert.equal(x.oral,false);}
  assert.equal(evidence.json.readyForTeacherReview,false);
  assert.equal(dispatch(g,{type:'REQUEST_HANDOVER'}).state.contract.delivery,null);
  for(const key of ['equipment','repair','privacy','limitations'])g=act(g,'SAVE_EXPLANATION',{key,text:'',oral:true});
  g=act(g,'REQUEST_HANDOVER');
  assert.match(derive(g).messages.at(-1).text,/oral explanation is pending/i);
  assert.doesNotMatch(derive(g).messages.at(-1).text,/recorded explanations are included/i);
  for(const x of Object.values(createEvidence(g).json.explanations))assert.equal(x.text,'');
});

test('QA15 importing the same valid settled campaign repeatedly cannot add money',()=>{
  let g=consult(client(),'guide.devices-paths');g=act(g,'REQUEST_HANDOVER');g=act(g,'SETTLE_CONTRACT');
  const raw=JSON.stringify(g);
  for(let i=0;i<5;i++){
    const v=validateSave(raw);assert.equal(v.valid,true,v.error);
    g=act(v.state,'SETTLE_CONTRACT');
    assert.equal(g.wallet,115);assert.equal(g.settlements.length,1);
  }
});

test('QA16 nurse booking policy changes an observable service probe, with healthy prerequisites',()=>{
  for(const [policy,expectedCode,expectedDenied] of [
    ['policy.roles-separated','ACCESS_DENIED',true],
    ['policy.nurse-also-books','SERVICE_AVAILABLE',false]
  ]){
    let g=run(client({policy}),'access');
    const match=o=>o.actorRoleId==='role.nurse'&&o.serviceId==='service.bookings';
    const observation=derive(g).diagnostics.find(o=>!o.stale&&match(o));
    assert.ok(observation,'The student needs a real nurse-booking test, not only a permission table.');
    assert.equal(observation.code,expectedCode);
    assert.equal(observation.expectedDenied,expectedDenied);
    assert.equal(observation.pass,true);
    g=act(g,'POWER_DEVICE',{deviceId:device(g,'role.records').id,on:false});
    g=run(g,'access');
    const broken=derive(g).diagnostics.find(o=>!o.stale&&match(o));
    assert.equal(broken.code,'DEVICE_OFF');
    assert.equal(broken.pass,false);
  }
  for(const policy of ['policy.broad-access','policy.deny-all']){
    const g=run(client({policy,markers:false}),'access');
    assert.equal(derive(g).ready,false);
    assert.equal(dispatch(g,{type:'REQUEST_HANDOVER'}).state.contract.delivery,null);
  }
});

test('QA17 observed failure, repair and delivery remain importable through free replay',()=>{
  let g=client({repair:false,tests:false});
  g=run(g,'nurse');
  assert.equal(derive(g).fault.baselineFailures.length,1);
  g=act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.nurse').id,address:'10.40.10.31',mask:'255.255.255.0'});
  g=act(g,'UPLOAD_MARKERS');
  g=act(g,'REQUEST_HANDOVER');
  const frozen=copy(g.contract.delivery);
  assert.equal(validateSave(g).valid,true);
  g=act(g,'START_DELIVERED_CONTRACT_PRACTICE');
  const restored=validateSave(g);
  assert.equal(restored.valid,true,restored.error);
  assert.deepEqual(g.contract.delivery,frozen);
  assert.equal(frozen.attemptSnapshot.fault.baselineFailures.length,1);
  g=run(restored.state);
  assert.equal(validateSave(g).valid,true,'Further replay probes must preserve valid IDs and provenance.');
  // The revised contract requires client resumption before payment collection.
  assert.equal(dispatch(g,{type:'SETTLE_CONTRACT'}).accepted,false);
  assert.equal(g.wallet,0);
  g=act(g,'RETURN_TO_CLIENT');
  g=act(g,'SETTLE_CONTRACT');
  assert.equal(g.wallet,120);
});
