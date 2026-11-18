import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createProgramme,dispatchProgramme,deriveProgramme,validateProgrammeSave,serializeProgrammeProgress,createProgrammeEvidence} from '../../dist/opening/programme.js';
import {programmeDriver,pack,visit1,visit2,visit3} from './helpers.js';

const fixture=name=>fs.readFileSync(new URL(`./fixtures/${name}`,import.meta.url),'utf8');
const clone=x=>JSON.parse(JSON.stringify(x));
const send=(s,a,ok=true)=>{const r=dispatchProgramme(s,a);assert.equal(r.accepted,ok,`${a.type}: ${r.code} ${r.message}`);return r.state;};

test('a new 0.9 programme opens at the depot and cannot reach independent work early',()=>{
  const s=createProgramme({campaignId:'p.new'}),v=deriveProgramme(s);
  assert.equal(v.screen,'apprentice');assert.equal(v.apprenticeOrigin,'new');assert.equal(v.canEnterField,false);
  assert.equal(dispatchProgramme(s,{type:'ENTER_FIELD'}).code,'TRUCK_REQUIRED');
  assert.equal(dispatchProgramme(s,{type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit'}}).code,'BOOTCAMP_SCREEN_REQUIRED');
});

test('the full apprenticeship earns the van, opens the field job, and survives save → reload replay',()=>{
  const d=programmeDriver(createProgramme({campaignId:'p.full'}));
  visit3(visit2(visit1(pack(d))));
  assert.equal(deriveProgramme(d.state).canEnterField,true);
  d.act({type:'CLAIM_TRUCK'});
  let s=send(d.state,{type:'ENTER_FIELD'});
  assert.equal(deriveProgramme(s).screen,'field');
  const saved=serializeProgrammeProgress(s),checked=validateProgrammeSave(saved);
  assert.equal(checked.valid,true,checked.error);
  assert.equal(deriveProgramme(checked.state).apprentice.truckClaimed,true);
  // Return to the depot after solo work begins: the field job stays available.
  s=send(checked.state,{type:'OPEN_APPRENTICE'});assert.equal(deriveProgramme(s).canEnterField,true);
  const evidence=createProgrammeEvidence(s);
  assert.match(evidence.text,/LANTERN LINE APPRENTICESHIP/);assert.match(evidence.text,/3\/3 visits/);
  assert.equal(evidence.json.apprenticeship.truckEarned,true);
});

test('forged, truncated or damaged apprenticeship saves are rejected and leave nothing awarded',()=>{
  const d=programmeDriver(createProgramme({campaignId:'p.forge'}));visit1(pack(d));
  const good=JSON.parse(serializeProgrammeProgress(d.state));
  const forged=clone(good);forged.apprentice.completionRecords.push({...forged.apprentice.completionRecords[0],visitId:'visit.2'},{...forged.apprentice.completionRecords[0],visitId:'visit.3'});
  assert.equal(validateProgrammeSave(JSON.stringify(forged)).valid,false);
  const claimed=clone(good);claimed.apprentice.truck.claimed=true;
  assert.equal(validateProgrammeSave(JSON.stringify(claimed)).valid,false);
  const injected=clone(good);injected.actions.push({type:'APP_ACTION',action:{type:'CLAIM_TRUCK'}});
  const r=validateProgrammeSave(JSON.stringify(injected));assert.equal(r.valid,false);assert.equal(r.code,'SAVE_REPLAY_REJECTED');
  assert.equal(validateProgrammeSave(serializeProgrammeProgress(d.state).slice(0,-40)).valid,false);
  const noApprentice=clone(good);delete noApprentice.apprentice;
  assert.equal(validateProgrammeSave(JSON.stringify(noApprentice)).valid,false);
});

test('reset of a visit keeps earlier completion records; restart is free',()=>{
  const d=programmeDriver(createProgramme({campaignId:'p.reset'}));visit1(pack(d));
  d.act({type:'START_VISIT',visitId:'visit.2'});d.act({type:'ASK_MENTOR',topic:'address'});d.act({type:'RESTART_VISIT'});
  const v=deriveProgramme(d.state).apprentice;
  assert.deepEqual(v.completedVisitIds,['visit.1']);assert.equal(v.support.length,0);assert.equal(v.visit.id,'visit.2');
});

test('a real 0.8 save with an unfinished bench migrates without inventing apprenticeship progress',()=>{
  const r=validateProgrammeSave(fixture('v08-partial-bootcamp.json'));
  assert.equal(r.valid,true,r.error);assert.equal(r.migrated,true);
  const v=deriveProgramme(r.state);
  assert.equal(v.screen,'bootcamp');assert.equal(v.apprenticeOrigin,'legacy');
  assert.equal(v.apprentice.completedVisitIds.length,0);assert.equal(v.apprentice.truckEarned,false);
  assert.equal(r.state.buildVersion,'0.10.0');
  // The migrated programme keeps replaying under 0.9 rules after further play.
  let s=send(r.state,{type:'OPEN_APPRENTICE'});
  const again=validateProgrammeSave(serializeProgrammeProgress(s));assert.equal(again.valid,true,again.error);
});

test('a real 0.8 save with the bench complete keeps its route into the independent job',()=>{
  const r=validateProgrammeSave(fixture('v08-bootcamp-complete.json'));
  assert.equal(r.valid,true,r.error);
  const v=deriveProgramme(r.state);assert.equal(v.canEnterField,true);assert.equal(v.legacyBootcampRoute,true);assert.equal(v.apprentice.truckEarned,false);
  const s=send(r.state,{type:'ENTER_FIELD'});assert.equal(deriveProgramme(s).screen,'field');
});

test('a real 0.8 save with field work in progress resumes it exactly',()=>{
  const raw=fixture('v08-field-started.json'),before=JSON.parse(raw);
  const r=validateProgrammeSave(raw);assert.equal(r.valid,true,r.error);
  assert.deepEqual(r.state.field,before.field);assert.equal(deriveProgramme(r.state).screen,'field');
  const tampered=clone(before);tampered.bootcamp.completionRecords=[];
  assert.equal(validateProgrammeSave(JSON.stringify(tampered)).valid,false);
});

test('a real published 0.9 save keeps ungated visits and gains the Training Centre without credit',()=>{
  const r=validateProgrammeSave(fixture('v09-visit1-done.json'));
  assert.equal(r.valid,true,r.error);assert.equal(r.migrated,true);
  assert.equal(r.state.buildVersion,'0.10.0');assert.equal(r.state.apprenticeRules,'ungated');
  const v=deriveProgramme(r.state).apprentice;
  assert.deepEqual(v.completedVisitIds,['visit.1']);assert.equal(v.training.gate,false);
  assert.ok(v.training.stations.every(s=>!s.earned),'no training card is invented by migration');
  let s=send(r.state,{type:'APP_ACTION',action:{type:'START_VISIT',visitId:'visit.2'}});
  assert.equal(deriveProgramme(s).apprentice.visit.id,'visit.2','0.9 learners are not locked out of their next visit');
  const again=validateProgrammeSave(serializeProgrammeProgress(s));assert.equal(again.valid,true,again.error);
  assert.equal(again.state.apprenticeRules,'ungated');
  const flipped=JSON.parse(serializeProgrammeProgress(s));flipped.apprenticeRules='gated';
  assert.equal(validateProgrammeSave(JSON.stringify(flipped)).valid,false,'a gated replay rejects the ungated visit start');
});

test('new 0.10 programmes gate visits on training cards earned by real drills',()=>{
  const d=programmeDriver(createProgramme({campaignId:'p.gate'}));
  assert.equal(d.state.apprenticeRules,'gated');
  for(const itemId of ['item.patch-cable','item.power-cord','item.link-tester','item.port-light'])d.act({type:'PACK_ITEM',itemId});
  d.act({type:'START_VISIT',visitId:'visit.1'},false);
  d.act({type:'OPEN_TRAINING'});
  d.act({type:'SORT_CABLE',cableType:'phone',job:'network'});
  assert.equal(d.view.training.sorted.phone,undefined,'a wrong sort is recorded but not placed');
  d.act({type:'ASK_MENTOR',topic:'cables'});
  assert.equal(d.view.training.stations.find(s=>s.id==='station.cables').earned,false,'asking does not earn a card');
  const forged=JSON.parse(serializeProgrammeProgress(d.state));Object.assign(forged.apprentice.training.sorted,{ethernet:'network',power:'power',hdmi:'display',usb:'peripheral',phone:'phone-line'});
  assert.equal(validateProgrammeSave(JSON.stringify(forged)).valid,false,'edited training progress is rejected by replay');
});
