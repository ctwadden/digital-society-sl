import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,dispatch,derive,createEvidence,validateSave} from '../../dist/engine.js';
import {ICAN_STATEMENTS} from '../../dist/content/learning.js';
import {act,client,connect,device,provision} from '../simulation/fixtures.js';

const copy=value=>JSON.parse(JSON.stringify(value));
const active=game=>game.attempts[game.activeAttemptId];
const nurseProbe=game=>act(game,'RUN_PROBE',{testId:'nurse'});
const explanation=(game,text='An address setting cannot reconnect an unplugged uplink.',oral=false)=>act(game,'SAVE_EXPLANATION',{key:'repair',text,oral});
const consultAll=game=>{
  for(const quote of derive(game).guideQuotes)game=act(game,'GUIDE_CONSULT',{sectionId:quote.sectionId,quoteToken:quote.quoteToken});
  return game;
};
// Construct the checkpoint through ordinary actions. No completion flag or
// fixture identity is injected into state to bypass the real progression gate.
function toUplinkTransfer(){
  let game=createGame({campaignId:'campaign.qa-review-04'});
  for(const kind of ['desktop','laptop']){
    game=provision(game,'role.reception',kind);
    if(kind==='laptop')game=act(game,'ATTACH_ADAPTER',{deviceId:device(game,'role.reception').id,kind:'ethernet-adapter'});
    game=connect(game,'role.records',1);game=connect(game,'role.reception',2);
    game=act(game,'RUN_PROBE',{testId:'reception'});game=act(game,'TRAINING_NEXT');
  }
  game=nurseProbe(game);
  assert.equal(derive(game).diagnostics.find(o=>o.testId==='nurse'&&!o.stale).code,'ADDRESS_WRONG_SUBNET');
  game=act(game,'SET_STATIC_ADDRESS',{deviceId:device(game,'role.nurse').id,address:derive(game).network.base+'.31',mask:'255.255.255.0'});
  game=nurseProbe(game);return act(game,'TRAINING_NEXT');
}
function repairedTransfer({text='An address setting cannot reconnect an unplugged uplink.',oral=false}={}){
  let game=nurseProbe(toUplinkTransfer());game=connect(game,'infra.ap',3);game=nurseProbe(game);
  return explanation(game,text,oral);
}
function provisionClinic(game,{route='A',policy='policy.roles-separated'}={}){
  for(const [role,kind] of [['role.reception',route==='A'?'desktop':'laptop'],['role.nurse',route==='A'?'tablet':'laptop'],['role.monitor','wearable'],['role.records',route==='A'?'server':'desktop'],['infra.switch',route==='A'?'switch4':'switch8'],['infra.ap','access-point']])game=provision(game,role,kind);
  if(route==='B')game=act(game,'ATTACH_ADAPTER',{deviceId:device(game,'role.reception').id,kind:'ethernet-adapter'});
  for(const [role,port] of [['role.records',1],['role.reception',2],['infra.ap',3]])game=connect(game,role,port);
  game=act(game,'ASSOCIATE_WIFI',{deviceId:device(game,'role.nurse').id,apDeviceId:device(game,'infra.ap').id});
  game=act(game,'SET_SERVICE_STATE',{enabled:true});game=nurseProbe(game);
  game=act(game,'SET_STATIC_ADDRESS',{deviceId:device(game,'role.nurse').id,address:'10.40.10.31',mask:'255.255.255.0'});
  game=act(game,'SET_PERMISSIONS',{policyId:policy});
  game=act(game,'RUN_COLLECTION_CHECK');game=act(game,'RETURN_WEARABLE');
  game=act(game,'ATTACH_ADAPTER',{deviceId:device(game,'role.nurse').id,kind:'sensor-dock'});
  game=act(game,'HANDOFF_MARKERS');game=act(game,'UPLOAD_MARKERS');
  for(const key of ['equipment','repair','privacy','limitations'])game=act(game,'SAVE_EXPLANATION',{key,text:`QA-authored ${key} reasoning; teacher judgement pending.`,oral:false});
  return act(game,'RUN_PROBE',{testId:'all'});
}

for(const oral of [false,true])test(`QA04-L01 physical transfer requires the observed chain and preserves ${oral?'pending oral review':'exact written reasoning'} after progression`,()=>{
  let game=toUplinkTransfer(),view=derive(game);
  assert.equal(view.training.transferKind,'physical-uplink');
  assert.equal(active(game).fixtureId,'fixture.bootcamp.transfer.uplink.002');
  assert.equal(device(game,'role.nurse').address,'192.168.70.30');
  assert.equal(device(game,'role.nurse').mask,'255.255.255.0');
  assert.equal(view.cables.some(c=>c.fromDeviceId===device(game,'infra.ap').id||c.toDeviceId===device(game,'infra.ap').id),false);
  game=nurseProbe(game);
  assert.equal(derive(game).diagnostics.find(o=>o.testId==='nurse'&&!o.stale).code,'PORT_DISCONNECTED');
  // A different valid address leaves the physical failure in place.
  game=act(game,'SET_STATIC_ADDRESS',{deviceId:device(game,'role.nurse').id,address:'192.168.70.31',mask:'255.255.255.0'});
  game=nurseProbe(game);
  assert.equal(derive(game).diagnostics.find(o=>o.testId==='nurse'&&!o.stale).code,'PORT_DISCONNECTED');
  assert.equal(derive(game).training.canAdvance,false);
  game=connect(game,'infra.ap',3);game=nurseProbe(game);
  assert.equal(derive(game).training.canAdvance,false,'A successful retest alone must not fabricate a learner explanation.');
  const words=oral?'':'The nurse already had a valid address.\nI reconnected the AP uplink; changing only its IP could not bridge the missing cable.';
  game=explanation(game,words,oral);view=derive(game);
  assert.equal(view.training.canAdvance,true);
  const proof=view.training.transferEvidence;
  assert.equal(proof.observedFailure.origin,'player');
  assert.equal(proof.observedFailure.code,'PORT_DISCONNECTED');
  assert.equal(proof.passingRetest.origin,'player');
  assert.equal(proof.passingRetest.pass,true);
  assert.equal(proof.passingRetest.testedTechnicalRevision,active(game).technicalRevision);
  assert.ok(proof.passingRetest.pathIds.includes(proof.reconnection.id));
  assert.ok(proof.reconnection.technicalRevision>proof.observedFailure.testedTechnicalRevision);
  assert.equal(proof.explanation.text,words);assert.equal(proof.explanation.oral,oral);
  assert.equal(proof.explanation.review,'pending-teacher');
  assert.deepEqual(createEvidence(game).json.transferEvidence,proof);
  const restored=validateSave(JSON.stringify(game));assert.equal(restored.valid,true,restored.error);
  game=act(restored.state,'TRAINING_NEXT');
  game=act(game,'START_CLIENT_ATTEMPT',{priorLearning:true});
  const evidence=createEvidence(game),completed=evidence.json.practice.history.find(h=>h.fixtureId==='fixture.bootcamp.transfer.uplink.002');
  assert.ok(completed);assert.deepEqual(completed.transferEvidence,proof);
  assert.equal(evidence.json.transferEvidence,null);
  assert.ok(evidence.text.includes(proof.observedFailure.id));
  assert.ok(evidence.text.includes(proof.passingRetest.id));
  if(oral)assert.match(evidence.text,/oral[^\n]*pending/i);else assert.ok(evidence.text.includes(words));
  assert.match(evidence.text,/does not award an IB grade/);
  assert.equal(validateSave(game).valid,true);
});

test('QA04-L02 fixing the link before observing it cannot retroactively invent transfer evidence',()=>{
  let game=toUplinkTransfer();game=connect(game,'infra.ap',3);game=nurseProbe(game);game=explanation(game);
  assert.equal(derive(game).training.canAdvance,false);
  assert.equal(derive(game).training.transferEvidence.observedFailure,null);
  assert.equal(dispatch(game,{type:'TRAINING_NEXT'}).accepted,false);
  const cable=derive(game).cables.find(c=>c.fromDeviceId===device(game,'infra.ap').id||c.toDeviceId===device(game,'infra.ap').id);
  game=act(game,'DISCONNECT_CABLE',{cableId:cable.id});game=nurseProbe(game);game=connect(game,'infra.ap',3);game=nurseProbe(game);
  assert.equal(derive(game).training.canAdvance,true,'The learner can recover by observing a real failure and completing a new repair/retest chain.');
  assert.equal(validateSave(game).valid,true);
});

test('QA04-L03 an unrelated failure and a worked demonstration cannot count as the physical transfer',()=>{
  const start=toUplinkTransfer();
  let game=act(start,'POWER_DEVICE',{deviceId:device(start,'role.records').id,on:false});game=nurseProbe(game);
  assert.equal(derive(game).diagnostics.find(o=>o.testId==='nurse'&&!o.stale).code,'DEVICE_OFF');
  game=act(game,'POWER_DEVICE',{deviceId:device(game,'role.records').id,on:true});
  game=connect(game,'infra.ap',3);game=nurseProbe(game);game=explanation(game);
  assert.equal(derive(game).training.transferEvidence.observedFailure,null);
  assert.equal(derive(game).training.canAdvance,false);
  const demo=act(start,'TRAINING_DEMO');
  assert.equal(derive(demo).training.phase,'demo');
  assert.equal(derive(demo).training.canAdvance,false);
  assert.equal(dispatch(demo,{type:'TRAINING_NEXT'}).accepted,false);
  const retry=act(demo,'TRAINING_RETRY');
  assert.equal(derive(retry).training.phase,'transfer');
  assert.equal(derive(retry).training.transferEvidence.observedFailure,null);
  assert.equal(derive(retry).explanations.repair.text,'');
  assert.equal(derive(retry).training.canAdvance,false);
});

test('QA04-L04 a changed configuration invalidates an earlier passing transfer retest',()=>{
  let game=repairedTransfer();assert.equal(derive(game).training.canAdvance,true);
  const passingId=derive(game).training.transferEvidence.passingRetest.id;
  game=act(game,'SET_STATIC_ADDRESS',{deviceId:device(game,'role.nurse').id,address:'192.168.70.32',mask:'255.255.255.0'});
  assert.equal(derive(game).training.canAdvance,false);
  assert.equal(derive(game).training.transferEvidence.passingRetest,null);
  assert.equal(derive(game).diagnostics.find(o=>o.id===passingId).stale,true);
  assert.equal(dispatch(game,{type:'TRAINING_NEXT'}).accepted,false);
  game=nurseProbe(game);assert.equal(derive(game).training.canAdvance,true);
  assert.equal(validateSave(game).valid,true);
});

test('QA04-L05 damaged transfer evidence is rejected without mutating the valid source',()=>{
  const source=repairedTransfer(),before=JSON.stringify(source);
  const cases=[
    ['missing baseline observation',g=>{active(g).fault.uplink.reconnections.at(-1).baselineObservationId='missing.observation';}],
    ['missing reconnection event',g=>{active(g).fault.uplink.reconnections.at(-1).eventId='missing.event';}],
    ['unknown transfer fixture',g=>{active(g).fixtureId='fixture.bootcamp.transfer.invented';}]
  ];
  for(const [label,damage] of cases){const bad=copy(source);damage(bad);const checked=validateSave(JSON.stringify(bad));assert.equal(checked.valid,false,label);assert.equal(JSON.stringify(source),before);}
  let progressed=act(source,'TRAINING_NEXT');
  const checkpoint=progressed.training.history.find(h=>h.transferKind==='physical-uplink');
  assert.ok(checkpoint);
  checkpoint.transferEvidence.explanation.text='This text was not in the completed attempt.';
  assert.equal(validateSave(progressed).valid,false,'A contradictory completed reasoning snapshot cannot become accepted evidence.');
});

test('QA04-L06 teacher-selected full-clinic practice uses the same causal checks and earns no money',()=>{
  let game=act(createGame({campaignId:'campaign.qa-full-practice'}),'START_CLINIC_PRACTICE');
  assert.equal(derive(game).mode,'training');assert.equal(derive(game).training.kind,'clinic-practice');
  assert.equal(derive(game).training.phase,'clinic-practice');
  assert.equal(active(game).fixtureId,'fixture.clinic.full-practice.001');
  assert.equal(derive(game).network.cidr,'10.40.10.0/24');
  assert.equal(game.contract,null);assert.equal(derive(game).devices.length,0);
  game=provisionClinic(game,{route:'B',policy:'policy.nurse-also-books'});
  assert.equal(derive(game).ready,true);
  const paidReference=client({route:'B',policy:'policy.nurse-also-books'});
  const outcomes=g=>derive(g).currentResults.map(({testId,pass,code})=>({testId,pass,code}));
  assert.deepEqual(outcomes(game),outcomes(paidReference));
  game=consultAll(game);
  assert.deepEqual([derive(game).economy.gross,derive(game).economy.reserved,derive(game).economy.minutes,derive(game).economy.net,game.wallet],[0,0,0,0,0]);
  assert.deepEqual(game.training.completed,[]);assert.deepEqual(game.training.history,[]);
  for(const type of ['REQUEST_HANDOVER','SETTLE_CONTRACT','TRAINING_NEXT','TRAINING_DEMO']){
    const result=dispatch(game,{type});assert.equal(result.accepted,false,type);assert.equal(result.state,game,type);
  }
  const cable=derive(game).cables.find(c=>c.fromDeviceId===device(game,'infra.ap').id||c.toDeviceId===device(game,'infra.ap').id);
  game=act(game,'DISCONNECT_CABLE',{cableId:cable.id});game=nurseProbe(game);
  assert.equal(derive(game).ready,false);
  assert.equal(derive(game).diagnostics.find(o=>o.testId==='nurse'&&!o.stale).code,'PORT_DISCONNECTED');
  game=connect(game,'infra.ap',3);game=act(game,'RUN_PROBE',{testId:'all'});
  assert.equal(derive(game).ready,true);
  assert.equal(validateSave(game).valid,true);
});

test('QA04-L07 full practice, retry and reload preserve the paid client and its entire ledger for resumption',()=>{
  let game=client({route:'A',markers:false,explanations:false});
  const quote=derive(game).guideQuotes.find(q=>q.sectionId==='guide.addressing-diagnosis');
  game=act(game,'GUIDE_CONSULT',{sectionId:quote.sectionId,quoteToken:quote.quoteToken});
  const clientId=game.activeAttemptId,paidAttempt=copy(active(game)),contract=copy(game.contract),training=copy(game.training),settlements=copy(game.settlements),wallet=game.wallet;
  game=act(game,'START_CLINIC_PRACTICE');game=provisionClinic(game);game=consultAll(game);
  const firstPractice=game.activeAttemptId;
  for(const type of ['TRAINING_RETRY','RESTART_ACTIVE_ATTEMPT']){
    game=act(game,type);assert.equal(derive(game).training.kind,'clinic-practice');assert.equal(derive(game).devices.length,0);
    assert.notEqual(game.activeAttemptId,firstPractice);
  }
  const restored=validateSave(JSON.stringify(game));assert.equal(restored.valid,true,restored.error);game=restored.state;
  assert.deepEqual(game.attempts[clientId],paidAttempt);assert.deepEqual(game.contract,contract);
  assert.deepEqual(game.training,training);assert.deepEqual(game.settlements,settlements);assert.equal(game.wallet,wallet);
  game=act(game,'RETURN_TO_CLIENT');
  assert.equal(game.activeAttemptId,clientId);assert.deepEqual(active(game),paidAttempt);assert.deepEqual(game.contract,contract);
  assert.equal(derive(game).economy.reserved,5);
  assert.equal(derive(game).guideQuotes.find(q=>q.sectionId==='guide.addressing-diagnosis').credits,0);
});

test('QA04-L08 every observed learning stage uses only two or three existing goals',()=>{
  const known=new Set(ICAN_STATEMENTS.map(statement=>statement.id));
  const snapshots=[createGame(),toUplinkTransfer(),repairedTransfer(),act(createGame(),'START_CLINIC_PRACTICE'),client({repair:false,markers:false,explanations:false}),client({markers:false,explanations:false}),client({explanations:false}),client()];
  let delivered=act(client(),'REQUEST_HANDOVER');snapshots.push(delivered,act(delivered,'SETTLE_CONTRACT'),act(delivered,'START_DELIVERED_CONTRACT_PRACTICE'));
  for(const game of snapshots){
    const focus=derive(game).learningFocus;
    assert.ok(focus&&focus.stageId&&focus.title&&focus.nextAction);
    assert.ok(focus.goalIds.length===2||focus.goalIds.length===3,focus.stageId);
    assert.equal(new Set(focus.goalIds).size,focus.goalIds.length,focus.stageId);
    for(const id of focus.goalIds)assert.ok(known.has(id),`${focus.stageId}: invented goal ${id}`);
  }
  assert.notEqual(derive(snapshots[0]).learningFocus.stageId,derive(snapshots[1]).learningFocus.stageId);
  assert.notEqual(derive(snapshots[4]).learningFocus.stageId,derive(snapshots[7]).learningFocus.stageId);
});

test('QA04-L09 legacy address-transfer saves keep their original learning provenance',()=>{
  const old=JSON.parse(readFileSync(new URL('../simulation/legacy/0.3-address-transfer.json',import.meta.url),'utf8'));
  const restored=validateSave(old);assert.equal(restored.valid,true,restored.error);
  const view=derive(restored.state);
  assert.equal(view.training.transferKind,'legacy-address');
  assert.equal(view.attempt.fixtureId,'fixture.bootcamp.transfer.001');
  assert.equal(view.training.transferEvidence,null);
  assert.equal(createEvidence(restored.state).json.transferEvidence,null);
  assert.match(view.training.goal,/older|original|legacy/i);
  const retry=act(restored.state,'TRAINING_RETRY');assert.equal(derive(retry).training.transferKind,'legacy-address');
  assert.equal(validateSave(retry).valid,true);
});

test('QA04-L10 ordinary long practice and later retries retain completed transfer reasoning through compaction',()=>{
  const words='The valid IP did not restore the missing physical path. The reconnected uplink carried my passing retest.';
  let game=repairedTransfer({text:words});
  const failureId=derive(game).training.transferEvidence.observedFailure.id;
  for(let index=0;index<45;index++)game=act(game,'RUN_PROBE',{testId:'all'});
  assert.equal(derive(game).training.canAdvance,true);
  assert.equal(derive(game).training.transferEvidence.observedFailure.id,failureId);
  let saved=validateSave(JSON.stringify(game));assert.equal(saved.valid,true,saved.error);
  game=act(saved.state,'TRAINING_NEXT');
  const proof=copy(game.training.history.find(h=>h.transferKind==='physical-uplink').transferEvidence);
  for(let index=0;index<18;index++)game=act(game,'START_TRAINING_ATTEMPT');
  const checkpoint=game.training.history.find(h=>h.transferKind==='physical-uplink');
  assert.equal(checkpoint.archived,true);
  assert.deepEqual(checkpoint.transferEvidence,proof);
  saved=validateSave(JSON.stringify(game));assert.equal(saved.valid,true,saved.error);
  assert.ok(createEvidence(saved.state).text.includes(words));
  assert.ok(Buffer.byteLength(JSON.stringify(game))<=1048576);
});

test('QA04-L11 off-site retained edges fail now while genuine 0.3 frozen delivery remains historical',()=>{
  const healthy=client();
  for(const [roleId,testId,code] of [['infra.ap','nurse','OUTSIDE_COVERAGE'],['role.records','nurse','OUTSIDE_CLINIC'],['infra.switch','reception','OUTSIDE_CLINIC'],['role.reception','reception','OUTSIDE_CLINIC']]){
    let game=act(healthy,'PLACE_DEVICE',{deviceId:device(healthy,roleId).id,locationId:'location.home'});
    game=act(game,'RUN_PROBE',{testId});
    const observation=derive(game).diagnostics.find(o=>o.testId===testId&&!o.stale);
    assert.equal(observation.pass,false,roleId);assert.equal(observation.code,code,roleId);
    assert.deepEqual(observation.pathIds,[],roleId);assert.equal(derive(game).ready,false,roleId);
    assert.equal(validateSave(game).valid,true,roleId);
  }
  // This fixture was generated and accepted by the actual 0.3 engine/catalog
  // from historical commit ea4a770. Its off-site pass is an old model fact,
  // not an assertion manufactured by rewriting a 0.4 campaign.
  const legacy=JSON.parse(readFileSync(new URL('./fixtures/original-0.3-home-delivery.json',import.meta.url),'utf8'));
  const frozen=JSON.stringify(legacy.contract.delivery),originalTechnicalRevision=active(legacy).technicalRevision;
  assert.equal(legacy.contract.delivery.evidenceSnapshot.readyForTeacherReview,true);
  const priorNurse=active(legacy).observations.findLast(o=>o.testId==='nurse'&&o.testedTechnicalRevision===originalTechnicalRevision);
  assert.ok(priorNurse?.pass);
  const checked=validateSave(JSON.stringify(legacy));assert.equal(checked.valid,true,checked.error);
  let game=checked.state,view=derive(game);
  assert.equal(device(game,'infra.ap').locationId,'location.home','Migration must not silently move equipment.');
  assert.equal(view.ready,false);
  assert.equal(view.currentResults.find(o=>o.testId==='nurse').code,'OUTSIDE_COVERAGE');
  assert.equal(view.diagnostics.find(o=>o.id===priorNurse.id).pass,true,'The old recorded pass must remain honestly historical.');
  assert.equal(view.diagnostics.find(o=>o.id===priorNurse.id).stale,true);
  assert.equal(view.attempt.technicalRevision,originalTechnicalRevision+1);
  assert.equal(view.modelUpdate.from,1);assert.equal(view.modelUpdate.to,2);
  assert.ok(view.history.some(e=>e.type==='MODEL_UPDATE'&&e.origin==='mission-setup'));
  assert.ok(createEvidence(game).text.includes(view.modelUpdate.note));
  assert.equal(JSON.stringify(game.contract.delivery),frozen);
  const second=validateSave(JSON.stringify(game));assert.equal(second.valid,true,second.error);
  assert.deepEqual(second.state,game,'Reload must not repeat the spatial migration.');
  game=act(game,'PLACE_DEVICE',{deviceId:device(game,'infra.ap').id,locationId:'location.equipment'});
  game=act(game,'RUN_PROBE',{testId:'all'});
  assert.equal(derive(game).ready,true);
  assert.equal(JSON.stringify(game.contract.delivery),frozen);
  assert.equal(validateSave(game).valid,true);
});
