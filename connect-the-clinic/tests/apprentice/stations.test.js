/** Parts bench and Device locker (0.11): cards from learner work, model-backed device drill, four-card rules. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createApprenticeship,deriveApprenticeship,createApprenticeshipEvidence} from '../../dist/apprentice/engine.js';
import {createProgramme,deriveProgramme,dispatchProgramme,validateProgrammeSave,serializeProgrammeProgress} from '../../dist/opening/programme.js';
import {mentorLine} from '../../dist/apprentice/mentor.js';
import {engineDriver,programmeDriver,parts,power,cable,visit1,visit2,visit3,PART_ANSWERS,TRACE_ORDER,DEVICE_ANSWERS} from './helpers.js';

const fixture=name=>fs.readFileSync(new URL(`./fixtures/${name}`,import.meta.url),'utf8');
const dev=(d,roleId)=>d.view.devices.find(x=>x.roleId===roleId);
const station=(d,id)=>d.view.training.stations.find(s=>s.id===id);
const fresh=()=>{const d=engineDriver(createApprenticeship({campaignId:'t.stations'}));d.act({type:'OPEN_TRAINING'});return d;};

test('Parts bench: wrong sorts and out-of-order trace steps are recorded but never placed; the card needs both tasks',()=>{
  const d=fresh();
  d.act({type:'SORT_PART',partId:'part.ram',job:'storage'});
  assert.equal(d.view.training.parts.find(p=>p.id==='part.ram').done,false);
  assert.match(mentorLine(d.view).text,/RAM/);
  for(const [partId,job] of PART_ANSWERS)d.act({type:'SORT_PART',partId,job});
  assert.equal(station(d,'station.parts').parts.sort,true);
  assert.equal(station(d,'station.parts').earned,false,'sorting alone does not earn the card');
  d.act({type:'TRACE_STEP',stepId:'trace.show'});
  assert.equal(d.view.training.trace.placed.length,0,'a step placed too early is not kept');
  assert.equal(d.view.training.last.expected,'trace.type');
  for(const stepId of TRACE_ORDER)d.act({type:'TRACE_STEP',stepId});
  d.act({type:'TRACE_STEP',stepId:'trace.type'},false);
  assert.equal(station(d,'station.parts').earned,true);
  const text=createApprenticeshipEvidence(d.state).text;
  assert.match(text,/Parts sorting errors: ram→storage/);assert.match(text,/show at step 1/);
});

test('Device locker: matching alone does not earn the card; the drill model rejects a laptop or tablet at the cable stage',()=>{
  const d=fresh();
  d.act({type:'MATCH_DEVICE',jobId:'job.shared',kind:'desktop'});
  for(const [jobId,kind] of DEVICE_ANSWERS)d.act({type:'MATCH_DEVICE',jobId,kind});
  assert.equal(station(d,'station.devices').earned,false);
  d.act({type:'START_DRILL',drillId:'drill.devices.bench'});
  assert.deepEqual(d.view.devices.map(x=>x.roleId),['infra.switch'],'only the switch is set up');
  d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'tablet'}});
  assert.equal(dev(d,'role.reception').ports.some(p=>p.medium==='ethernet'),false,'the tablet has no Ethernet port in the model');
  assert.match(mentorLine(d.view).text,/no Ethernet/i);
  d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.records',kind:'desktop'}});
  d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.records',kind:'tablet'}},false);
  d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'desktop'}});
  for(const r of ['role.reception','role.records'])power(d,dev(d,r));
  cable(d,dev(d,'role.reception'),1,dev(d,'infra.switch'),2);cable(d,dev(d,'role.records'),1,dev(d,'infra.switch'),1);
  d.act({type:'RUN_TEST',testId:'reception'});
  assert.equal(d.view.latestTest.code,'SERVICE_AVAILABLE','a desktop host really works in the model');
  const host=d.view.checks.find(c=>c.id==='kit.host');
  assert.equal(host.met,false,'a working desktop host is not the computer built to serve others');
  assert.match(host.detail,/server/);
  d.act({type:'FINISH_VISIT'},false);
  d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.records',kind:'server'}});
  power(d,dev(d,'role.records'));cable(d,dev(d,'role.records'),1,dev(d,'infra.switch'),1);
  assert.equal(d.view.checks.find(c=>c.id==='kit.pass').met,false,'the earlier pass does not count for the swapped host');
  d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});
  assert.equal(station(d,'station.devices').earned,true);
  assert.match(createApprenticeshipEvidence(d.state).text,/final choice desktop and server/);
});

test('asking Mags and "show me" in the device drill never choose equipment',()=>{
  const d=fresh();d.act({type:'START_DRILL',drillId:'drill.devices.bench'});
  for(const topic of ['next','show','why'])d.act({type:'ASK_MENTOR',topic});
  assert.equal(d.view.devices.length,1);assert.deepEqual(d.view.highlight,{roleSlot:'role.reception'});
});

test('full rules: visit 1 needs the Device locker card too, and the van needs the Parts bench card',()=>{
  const d=programmeDriver(createProgramme({campaignId:'p.full'}));
  assert.equal(d.state.apprenticeRules,'gated-full');
  assert.deepEqual(d.view.training.stations.find(s=>s.id==='station.devices').unlocks,['visit.1']);
  assert.deepEqual(d.view.training.stations.find(s=>s.id==='station.parts').unlocks,['van']);
  // Earn everything except the Parts bench card.
  d.act({type:'OPEN_TRAINING'});
  const t=d.view.training;assert.equal(t.gate,'full');
  for(const itemId of ['item.patch-cable','item.power-cord','item.link-tester','item.port-light']){d.act({type:'RETURN_TO_YARD'});d.act({type:'PACK_ITEM',itemId});}
  const r=dispatchProgramme(d.state,{type:'APP_ACTION',action:{type:'START_VISIT',visitId:'visit.1'}});
  assert.equal(r.code,'TRAINING_CARD_REQUIRED');assert.match(r.message,/Cable wall and Device locker training cards/);
});

test('full rules: three visits without the Parts bench card do not open independent work',()=>{
  const d=programmeDriver(createProgramme({campaignId:'p.van'}));
  // Train every station except Parts by hand.
  d.act({type:'OPEN_TRAINING'});
  for(const [cableType,job] of [['ethernet','network'],['power','power'],['hdmi','display'],['usb','peripheral'],['phone','phone-line']])d.act({type:'SORT_CABLE',cableType,job});
  d.act({type:'START_DRILL',drillId:'drill.cables.bench'});d.act({type:'RUN_TEST',testId:'reception'});power(d,dev(d,'infra.switch'));cable(d,dev(d,'role.reception'),1,dev(d,'infra.switch'),2);d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});
  for(const [address,verdict] of [['172.20.8.0','network'],['172.20.8.77','usable'],['172.20.8.10','taken'],['172.20.9.5','other-network'],['172.20.8.255','broadcast'],['10.12.1.40','other-network']])d.act({type:'CLASSIFY_ADDRESS',address,verdict});
  d.act({type:'START_DRILL',drillId:'drill.addressing.bench'});const pc=dev(d,'role.reception');
  d.act({type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:pc.id,address:'172.20.8.77',mask:'255.255.255.0'}});d.act({type:'INSPECT_DEVICE',deviceId:pc.id});d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});
  for(const [jobId,kind] of DEVICE_ANSWERS)d.act({type:'MATCH_DEVICE',jobId,kind});
  d.act({type:'START_DRILL',drillId:'drill.devices.bench'});
  for(const [roleId,kind] of [['role.reception','desktop'],['role.records','server']]){d.act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId,kind}});power(d,dev(d,roleId));}
  cable(d,dev(d,'role.reception'),1,dev(d,'infra.switch'),2);cable(d,dev(d,'role.records'),1,dev(d,'infra.switch'),1);d.act({type:'RUN_TEST',testId:'reception'});d.act({type:'FINISH_VISIT'});
  d.act({type:'RETURN_TO_YARD'});for(const itemId of ['item.patch-cable','item.power-cord','item.link-tester','item.port-light'])d.act({type:'PACK_ITEM',itemId});
  visit3(visit2(visit1(d)));
  const v=deriveProgramme(d.state);
  assert.equal(v.apprentice.visitsDone,true);assert.equal(v.apprentice.truckEarned,false);assert.equal(v.canEnterField,false);
  assert.deepEqual(v.apprentice.vanCardsNeeded,['card.parts']);
  const claim=dispatchProgramme(d.state,{type:'APP_ACTION',action:{type:'CLAIM_TRUCK'}});assert.equal(claim.code,'TRAINING_CARD_REQUIRED');
  d.act({type:'OPEN_TRAINING'});parts(d);d.act({type:'RETURN_TO_YARD'});d.act({type:'CLAIM_TRUCK'});
  assert.equal(deriveProgramme(d.state).canEnterField,true);
  const again=validateProgrammeSave(serializeProgrammeProgress(d.state));assert.equal(again.valid,true,again.error);
});

test('a real 0.10 save keeps its two-card rules: visit 1 stays done and visit 2 needs only the Network rack card',()=>{
  const r=validateProgrammeSave(fixture('v010-cables-visit1.json'));
  assert.equal(r.valid,true,r.error);assert.equal(r.migrated,true);
  assert.equal(r.state.buildVersion,'0.11.0');assert.equal(r.state.apprenticeRules,'gated');
  const v=deriveProgramme(r.state).apprentice;
  assert.deepEqual(v.completedVisitIds,['visit.1']);assert.equal(v.training.gate,true);
  assert.equal(v.training.stations.find(s=>s.id==='station.devices').earned,false,'no new card is invented');
  assert.deepEqual(v.visits[1].cardsNeeded,['card.addressing']);
  assert.deepEqual(v.training.stations.find(s=>s.id==='station.parts').unlocks,[],'the Parts bench does not gate a 0.10 van');
  // The new stations are optional practice for this learner, and the save keeps replaying.
  let s=r.state;for(const action of [{type:'OPEN_TRAINING'},{type:'SORT_PART',partId:'part.cpu',job:'process'}]){const x=dispatchProgramme(s,{type:'APP_ACTION',action});assert.equal(x.accepted,true);s=x.state;}
  const again=validateProgrammeSave(serializeProgrammeProgress(s));assert.equal(again.valid,true,again.error);assert.equal(again.state.apprenticeRules,'gated');
  const promoted=JSON.parse(fixture('v010-cables-visit1.json'));promoted.apprenticeRules='gated-full';
  assert.equal(validateProgrammeSave(JSON.stringify(promoted)).valid,false,'a 0.10 save cannot claim rules it never had');
  const forged=JSON.parse(serializeProgrammeProgress(s));forged.apprentice.training.kit.parts['part.ram']='memory';
  assert.equal(validateProgrammeSave(JSON.stringify(forged)).valid,false,'edited station progress is rejected by replay');
});
