import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,dispatch,derive,createEvidence,validateSave} from '../../dist/engine.js';
import {act,client,clinicPractice,device,completeTrainingStage} from './fixtures.js';

const copy=value=>JSON.parse(JSON.stringify(value));
const active=g=>g.attempts[g.activeAttemptId];
const legacy=name=>JSON.parse(readFileSync(new URL(`./legacy/${name}.json`,import.meta.url),'utf8'));
const reload=g=>{const checked=validateSave(JSON.stringify(g));assert.equal(checked.valid,true,checked.error);return checked.state;};
function uplinkStage(){let g=createGame({campaignId:'campaign.engine-review04'});for(let i=0;i<3;i++)g=act(completeTrainingStage(g),'TRAINING_NEXT');return g;}

test('R4 an alternate free switch port and reversed cable direction repair the link without an IP edit',()=>{
 let g=act(uplinkStage(),'RUN_PROBE',{testId:'nurse'});
 const nurseAddress=device(g,'role.nurse').address,sw=device(g,'infra.switch'),ap=device(g,'infra.ap');
 g=act(g,'CONNECT_PORTS',{fromDeviceId:sw.id,fromPortId:sw.ports.find(p=>p.id.endsWith('.eth4')).id,toDeviceId:ap.id,toPortId:ap.ports.find(p=>p.medium==='ethernet').id});
 g=act(g,'RUN_PROBE',{testId:'nurse'});
 const words='  Learner words, with no automated keyword test.\n?  ';
 g=act(g,'SAVE_EXPLANATION',{key:'repair',text:words,oral:false});
 assert.equal(device(g,'role.nurse').address,nurseAddress);
 assert.equal(active(g).fault.changes.length,0);
 assert.equal(derive(g).training.canAdvance,true);
 assert.equal(derive(g).training.transferEvidence.explanation.text,words);
 assert.equal(derive(g).training.transferEvidence.explanation.review,'pending-teacher');
 assert.equal(reload(g).activeAttemptId,g.activeAttemptId);
 assert.ok(createEvidence(g).text.includes(words));
});

test('R1/R4 every partial link-transfer state reloads and reset begins fresh observed practice',()=>{
 let g=reload(uplinkStage());
 assert.equal(derive(g).training.transferEvidence.observedFailure,null);
 g=reload(act(g,'RUN_PROBE',{testId:'nurse'}));
 assert.equal(derive(g).training.transferEvidence.observedFailure.code,'PORT_DISCONNECTED');
 const ap=device(g,'infra.ap'),sw=device(g,'infra.switch');
 g=reload(act(g,'CONNECT_PORTS',{fromDeviceId:ap.id,fromPortId:ap.ports[0].id,toDeviceId:sw.id,toPortId:sw.ports[2].id}));
 assert.equal(derive(g).training.transferEvidence.passingRetest,null);
 g=reload(act(g,'RUN_PROBE',{testId:'nurse'}));
 assert.equal(derive(g).training.canAdvance,false,'The explanation remains unsubmitted.');
 g=reload(act(g,'SAVE_EXPLANATION',{key:'repair',text:'',oral:true}));
 assert.equal(derive(g).training.canAdvance,true);
 const completedAttempt=g.activeAttemptId;
 for(const type of ['TRAINING_RETRY','RESTART_ACTIVE_ATTEMPT']){
  const reset=reload(act(g,type));
  assert.notEqual(reset.activeAttemptId,completedAttempt);
  assert.equal(derive(reset).training.transferKind,'physical-uplink');
  assert.equal(derive(reset).training.transferEvidence.observedFailure,null);
  assert.equal(derive(reset).training.transferEvidence.reconnection,null);
  assert.equal(derive(reset).training.transferEvidence.explanation.submitted,false);
  assert.equal(device(reset,'role.nurse').address,'192.168.70.30');
  assert.equal(derive(reset).training.canAdvance,false);
 }
 assert.equal(g.training.history.some(h=>h.transferKind==='physical-uplink'),false,'Reset cannot create a completed checkpoint.');
});

test('R4 a completed original 0.3 bootcamp remains accepted without inventing physical-transfer work',()=>{
 const original=legacy('0.3-complete-bootcamp'),history=copy(original.training.history);
 let g=reload(original);
 assert.deepEqual(g.training.history,history);
 assert.equal(derive(g).training.completed,true);
 assert.equal(createEvidence(g).json.practice.history.some(h=>h.transferEvidence),false);
 assert.match(createEvidence(g).text,/legacy address-transfer recorded checkpoint/);
 g=act(g,'START_CLIENT_ATTEMPT');
 assert.equal(g.contract.acceptedRoute,'bootcamp-completed');
 assert.equal(g.training.priorLearning,false);
 assert.deepEqual(g.training.history,history);
 assert.equal(validateSave(g).valid,true);
});

test('R1/R6 an original 0.3 frozen delivery survives new free practice and settles its original fee once',()=>{
 const original=legacy('0.3-delivered-client'),delivery=copy(original.contract.delivery),paidAttempt=copy(original.attempts[original.contract.currentAttemptId]);
 let g=reload(original);
 assert.deepEqual(g.contract.delivery,delivery);
 g=act(g,'START_CLINIC_PRACTICE');
 for(const q of derive(g).guideQuotes)g=act(g,'GUIDE_CONSULT',{sectionId:q.sectionId,quoteToken:q.quoteToken});
 g=reload(g);
 assert.deepEqual(g.contract.delivery,delivery);
 assert.deepEqual(g.attempts[g.contract.currentAttemptId],paidAttempt);
 assert.equal(g.wallet,0);
 g=act(g,'RETURN_TO_CLIENT');g=act(g,'SETTLE_CONTRACT');
 assert.equal(g.wallet,delivery.netFee);
 g=act(reload(g),'SETTLE_CONTRACT');
 assert.equal(g.wallet,delivery.netFee);
 assert.equal(g.settlements.length,1);
 assert.deepEqual(g.contract.delivery,delivery);
});

for(const [action,kind] of [['START_TRAINING_ATTEMPT','bootcamp'],['START_CLINIC_PRACTICE','clinic-practice'],['START_DELIVERED_CONTRACT_PRACTICE','delivery-replay']])test(`R6 ${kind} cannot settle an unpaid delivered client`,()=>{
 let paid=client();const q=derive(paid).guideQuotes[0];paid=act(paid,'GUIDE_CONSULT',{sectionId:q.sectionId,quoteToken:q.quoteToken});paid=act(paid,'REQUEST_HANDOVER');
 const originalContract=copy(paid.contract),originalAttempt=copy(active(paid));
 let g=reload(act(paid,action));
 assert.equal(derive(g).training.kind,kind);
 const blocked=dispatch(g,{type:'SETTLE_CONTRACT'});
 assert.equal(blocked.accepted,false);assert.equal(blocked.code,'CLIENT_ONLY');assert.equal(blocked.state,g);
 assert.equal(g.wallet,0);assert.equal(g.settlements.length,0);
 assert.deepEqual(g.contract,originalContract);assert.deepEqual(g.attempts[paid.activeAttemptId],originalAttempt);
 g=act(g,'RETURN_TO_CLIENT');g=act(g,'SETTLE_CONTRACT');
 assert.equal(g.wallet,115);assert.equal(g.settlements.length,1);
});

test('R3 focus follows current causal prerequisites through repair, access, markers, verification and handover',()=>{
 let g=client({repair:false,markers:false,explanations:false,tests:false});
 assert.equal(derive(g).learningFocus.stageId,'clinic.address-repair');
 const server=device(g,'role.records');
 g=act(g,'POWER_DEVICE',{deviceId:server.id,on:false});
 assert.equal(derive(g).learningFocus.stageId,'clinic.connections','A broken physical prerequisite precedes the wrong IP.');
 g=act(g,'POWER_DEVICE',{deviceId:server.id,on:true});
 g=act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.nurse').id,address:'10.40.10.32',mask:'255.255.255.0'});
 g=act(g,'SET_PERMISSIONS',{policyId:'policy.broad-access'});
 assert.equal(derive(g).learningFocus.stageId,'clinic.access');
 g=act(g,'SET_PERMISSIONS',{policyId:'policy.roles-separated'});
 assert.equal(derive(g).learningFocus.stageId,'clinic.markers');
 g=act(g,'RUN_COLLECTION_CHECK');g=act(g,'RETURN_WEARABLE');g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.nurse').id,kind:'sensor-dock'});g=act(g,'HANDOFF_MARKERS');g=act(g,'UPLOAD_MARKERS');
 assert.equal(derive(g).learningFocus.stageId,'clinic.verify');
 g=act(g,'RUN_PROBE',{testId:'all'});
 assert.equal(derive(g).learningFocus.stageId,'clinic.handover');
 const before=JSON.stringify(g);createEvidence(g);derive(g);
 assert.equal(JSON.stringify(g),before,'Focus and evidence exports are read-only.');
 const practice=clinicPractice();
 assert.equal(derive(practice).learningFocus.stageId,'clinic.practice-review');
 assert.equal(derive(practice).training.canAdvance,false);
 assert.equal(dispatch(practice,{type:'START_CLIENT_ATTEMPT'}).code,'BOOTCAMP_REQUIRED','Full-clinic practice does not manufacture bootcamp completion.');
});

test('R1 new fixtures reject cross-mode and damaged seed/checkpoint claims without changing valid work',()=>{
 const practice=clinicPractice(),link=completeTrainingStage(uplinkStage()),completed=act(link,'TRAINING_NEXT');
 const cases=[
  [practice,g=>{active(g).mode='client';}],
  [practice,g=>{active(g).fixtureId='fixture.bootcamp.local.001';}],
  [practice,g=>{active(g).training.provenance.authenticated=true;}],
  [link,g=>{active(g).fault.initialAddress='192.168.60.20';}],
  [link,g=>{active(g).fault.uplink.seed.eventId=active(g).events.at(-1).id;}],
  [link,g=>{active(g).fault.uplink.reconnections[0].technicalRevision=active(g).fault.baselineFailures[0].technicalRevision;}],
  [completed,g=>{delete g.training.history.find(h=>h.transferKind==='physical-uplink').transferEvidence;}],
  [completed,g=>{g.training.history.find(h=>h.transferKind==='physical-uplink').transferEvidence.passingRetest.origin='engine-check';}]
 ];
 for(const [source,damage] of cases){const before=JSON.stringify(source),bad=copy(source);damage(bad);const checked=validateSave(bad);assert.equal(checked.valid,false,JSON.stringify(bad).slice(-200));assert.equal(JSON.stringify(source),before);}
 assert.equal(validateSave(practice).valid,true);assert.equal(validateSave(link).valid,true);assert.equal(validateSave(completed).valid,true);
});

test('R2 retained cables and associations cannot carry clinic services through the off-site home location',()=>{
 const original=client();
 for(const [roleId,testId,code] of [['role.nurse','nurse','OUTSIDE_COVERAGE'],['infra.ap','nurse','OUTSIDE_COVERAGE'],['role.records','nurse','OUTSIDE_CLINIC'],['infra.switch','nurse','OUTSIDE_CLINIC'],['role.reception','reception','OUTSIDE_CLINIC']]){
  const d=device(original,roleId);
  let g=act(original,'PLACE_DEVICE',{deviceId:d.id,locationId:'location.home'});
  assert.deepEqual(derive(g).cables,derive(original).cables,'Location changes do not silently remove or reconnect physical endpoints.');
  g=act(g,'RUN_PROBE',{testId});
  const observed=derive(g).diagnostics.find(o=>o.testId===testId&&!o.stale);
  assert.equal(observed.code,code,roleId);assert.equal(observed.pass,false,roleId);assert.deepEqual(observed.pathIds,[],roleId);
  assert.equal(derive(g).ready,false,roleId);assert.equal(derive(g).learningFocus.stageId,'clinic.connections',roleId);
  assert.equal(device(reload(g),roleId).locationId,'location.home');
  g=act(g,'PLACE_DEVICE',{deviceId:d.id,locationId:d.locationId});g=act(g,'RUN_PROBE',{testId:'all'});
  assert.equal(derive(g).ready,true,`${roleId}: return to a clinic location restores the bounded local path after retest.`);
 }
});
