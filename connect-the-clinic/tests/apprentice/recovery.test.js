import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createPersistence} from '../../dist/persistence.js';
import {createProgramme,dispatchProgramme,deriveProgramme,validateProgrammeSave,serializeProgrammeProgress,createProgrammeEvidence} from '../../dist/opening/programme.js';
import {programmeDriver,pack,visit1,visit2,visit3} from './helpers.js';

const namespace='riverbend.clinic.opening.v1.';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const fixture=name=>fs.readFileSync(new URL(`./fixtures/${name}`,import.meta.url),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));

function browserStorage(initial={}){
  const records=new Map(Object.entries(initial)),held=new Set(),channels=[];
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,String(value)),removeItem:key=>records.delete(key)
  }});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,options,callback)=>{
    if(held.has(name))return callback(null);held.add(name);try{return await callback({name});}finally{held.delete(name);}
  }}}});
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class{
    constructor(name){this.name=name;channels.push(this);}
    postMessage(data){for(const channel of channels)if(channel!==this&&channel.name===this.name)channel.onmessage?.({data});}
    close(){channels.splice(channels.indexOf(this),1);}
  }});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  return records;
}

const options=(campaignId='recovery.test')=>({namespace,createGame:()=>createProgramme({campaignId}),dispatch:dispatchProgramme,validateSave:validateProgrammeSave});
const envelope=(state,stamp='fixture:1')=>JSON.stringify({format:'riverbend-save-envelope-v1',stamp,counter:1,state});

test('R6 reload resumes a visit with its held cable and pending first end exactly',async()=>{
  browserStorage();let store=await createPersistence(options('recovery.mid-visit'));
  for(const itemId of ['item.patch-cable','item.power-cord','item.link-tester','item.port-light'])assert.equal((await store.send({type:'APP_ACTION',action:{type:'PACK_ITEM',itemId}})).accepted,true);
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'START_VISIT',visitId:'visit.1'}})).accepted,true);
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'desktop'}}})).accepted,true);
  const desk=deriveProgramme(store.getState()).apprentice.devices.find(device=>device.roleId==='role.reception');
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'HOLD_CABLE',cableType:'ethernet'}})).accepted,true);
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'PLUG',deviceId:desk.id,socketId:`${desk.id}.eth1`}})).accepted,true);
  const before=deriveProgramme(store.getState()).apprentice;
  assert.equal(before.held,'ethernet');assert.equal(before.pendingEnd.deviceId,desk.id);
  store.dispose();await tick();store=await createPersistence(options('ignored-on-restore'));
  const after=deriveProgramme(store.getState()).apprentice;
  assert.equal(after.visit.id,'visit.1');assert.equal(after.visit.attemptId,before.visit.attemptId);
  assert.equal(after.held,'ethernet');assert.deepEqual(after.pendingEnd,before.pendingEnd);
  store.dispose();
});

test('R6 progress export/import round trip is exact apart from explicit import provenance',async()=>{
  browserStorage();const store=await createPersistence(options('recovery.roundtrip'));
  const d=programmeDriver(store.getState());visit1(pack(d));
  const raw=serializeProgrammeProgress(d.state),checked=validateProgrammeSave(raw);
  assert.equal(checked.valid,true,checked.error);
  assert.equal((await store.importProgress(raw)).accepted,true);
  const imported=store.getState(),expected=clone(d.state);expected.imported=true;expected.importProvenance='manual-file';
  assert.deepEqual(imported,expected);assert.equal(validateProgrammeSave(serializeProgrammeProgress(imported)).valid,true);
  store.dispose();
});

test('R2/R6 malformed, structurally invalid, unsupported and evidence JSON imports are atomic',async()=>{
  const records=browserStorage();const store=await createPersistence(options('recovery.atomic'));
  const before=store.getState(),disk=records.get(namespace+'snapshot'),base=clone(before);
  const invalid=[];
  invalid.push('{broken');
  const missing=clone(base);delete missing.apprentice;invalid.push(JSON.stringify(missing));
  const app=clone(base);app.appId='wrong.app';invalid.push(JSON.stringify(app));
  const schema=clone(base);schema.schemaVersion=2;invalid.push(JSON.stringify(schema));
  for(const version of ['0.7.9','1.0.0']){const save=clone(base);save.buildVersion=version;invalid.push(JSON.stringify(save));}
  invalid.push(JSON.stringify(createProgrammeEvidence(before).json));
  for(const raw of invalid){const result=await store.importProgress(raw);assert.equal(result.accepted,false,raw.slice(0,50));assert.equal(store.getState(),before);assert.equal(records.get(namespace+'snapshot'),disk);}
  store.dispose();
});

test('R2/R3 replay rejects forged awards, packing, mentor provenance and edited learner words',()=>{
  const exact='The missing uplink\nblocked the tablet. Reception stays restricted.';
  const d=programmeDriver(createProgramme({campaignId:'recovery.forgery'}));visit3(visit2(visit1(pack(d))),exact);d.act({type:'CLAIM_TRUCK'});
  const good=JSON.parse(serializeProgrammeProgress(d.state));
  const cases=[];
  const completion=clone(good);completion.apprentice.completionRecords[0].visitId='visit.3';cases.push(completion);
  const claimed=clone(good);claimed.apprentice.truck.claimedRevision=1;cases.push(claimed);
  const packed=clone(good);packed.apprentice.packed.push('item.forged');cases.push(packed);
  const support=clone(good);support.apprentice.completionRecords[2].support.push({topic:'show',eventId:'forged',technicalRevision:0});cases.push(support);
  const explanation=clone(good);explanation.apprentice.completionRecords[2].explanation.text='edited after completion';cases.push(explanation);
  for(const forged of cases){const result=validateProgrammeSave(JSON.stringify(forged));assert.equal(result.valid,false);assert.equal(result.code,'SAVE_REPLAY_MISMATCH');}
});

test('R2 injected APP_ACTION rejected by the engine also rejects save replay',()=>{
  const saved=JSON.parse(serializeProgrammeProgress(createProgramme({campaignId:'recovery.injected'})));
  saved.actions.push({type:'APP_ACTION',action:{type:'START_VISIT',visitId:'visit.3'}});
  const result=validateProgrammeSave(JSON.stringify(saved));
  assert.equal(result.valid,false);assert.equal(result.code,'SAVE_REPLAY_REJECTED');assert.match(result.error,/VISIT_LOCKED|BAG_INCOMPLETE/);
});

test('R6 real 0.8 save migrates on automatic persistence restore and manual import without visits',async()=>{
  const legacy=fixture('v08-partial-bootcamp.json'),legacyState=JSON.parse(legacy);
  browserStorage({[namespace+'snapshot']:envelope(legacyState)});
  let store=await createPersistence(options('recovery.legacy.auto'));
  let view=deriveProgramme(store.getState());
  assert.equal(view.apprenticeOrigin,'legacy');assert.deepEqual(view.apprentice.completedVisitIds,[]);assert.equal(view.apprentice.truckEarned,false);
  assert.equal(store.getState().buildVersion,'0.9.0');store.dispose();await tick();
  browserStorage();store=await createPersistence(options('recovery.legacy.manual'));
  assert.equal((await store.importProgress(legacy)).accepted,true);view=deriveProgramme(store.getState());
  assert.equal(view.apprenticeOrigin,'legacy');assert.deepEqual(view.apprentice.completedVisitIds,[]);assert.equal(store.getState().importProvenance,'manual-file');
  store.dispose();
});

test('R6 restart preserves prior completion, and clear removes snapshots and returns to unearned depot',async()=>{
  const records=browserStorage();const store=await createPersistence(options('recovery.reset-clear'));
  const d=programmeDriver(store.getState());visit1(pack(d));
  assert.equal((await store.importProgress(serializeProgrammeProgress(d.state))).accepted,true);
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'START_VISIT',visitId:'visit.2'}})).accepted,true);
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'ASK_MENTOR',topic:'address'}})).accepted,true);
  assert.equal((await store.send({type:'APP_ACTION',action:{type:'RESTART_VISIT'}})).accepted,true);
  let view=deriveProgramme(store.getState()).apprentice;
  assert.deepEqual(view.completedVisitIds,['visit.1']);assert.equal(view.support.length,0);assert.equal(view.visit.id,'visit.2');
  assert.equal((await store.clear()).accepted,true);view=deriveProgramme(store.getState()).apprentice;
  assert.deepEqual(view.completedVisitIds,[]);assert.equal(view.truckEarned,false);assert.equal(deriveProgramme(store.getState()).screen,'apprentice');
  assert.ok(records.has(namespace+'snapshot'));assert.equal(records.has(namespace+'last-good'),false);
  store.dispose();
});

test('R6 a damaged current snapshot recovers the last good programme without awarding progress',async()=>{
  const records=browserStorage();let store=await createPersistence(options('recovery.backup'));
  assert.equal((await store.send({type:'OPEN_BOOTCAMP'})).accepted,true);
  assert.equal((await store.send({type:'OPEN_APPRENTICE'})).accepted,true);
  const backup=JSON.parse(records.get(namespace+'last-good')).state;
  records.set(namespace+'snapshot','{damaged');store.dispose();await tick();
  store=await createPersistence(options('recovery.backup.fresh'));
  assert.equal(store.getStatus().mode,'error');
  assert.equal((await store.recover()).accepted,true);
  assert.deepEqual(store.getState(),backup);
  const view=deriveProgramme(store.getState());assert.equal(view.canEnterField,false);assert.deepEqual(view.apprentice.completedVisitIds,[]);
  store.dispose();
});

test('R6 a competing tab is read-only and cannot mutate or import',async()=>{
  browserStorage();const first=await createPersistence(options('recovery.tabs')),second=await createPersistence(options('recovery.tabs'));
  assert.equal(second.getStatus().mode,'readonly');const before=second.getState();
  assert.equal((await second.send({type:'OPEN_BOOTCAMP'})).code,'TAB_READ_ONLY');
  assert.equal((await second.importProgress(serializeProgrammeProgress(createProgramme({campaignId:'forged-tab'})))).accepted,false);
  assert.equal(second.getState(),before);first.dispose();second.dispose();await tick();
});

test('R3 evidence preserves exact words, actual test codes, decisions, support and not-a-grade notice',()=>{
  const exact='The AP uplink was missing.\nI restored it; nurses can work, while reception cannot open the clinical workspace.';
  const d=programmeDriver(createProgramme({campaignId:'recovery.evidence'}));pack(d);visit1(d);visit2(d);
  d.act({type:'START_VISIT',visitId:'visit.3'});d.act({type:'ASK_MENTOR',topic:'why'});d.act({type:'RUN_TEST',testId:'nurse'});
  const desk=d.view.devices.find(device=>device.roleId==='infra.ap'),sw=d.view.devices.find(device=>device.roleId==='infra.switch');
  d.act({type:'HOLD_CABLE',cableType:'ethernet'});d.act({type:'PLUG',deviceId:desk.id,socketId:`${desk.id}.eth1`});d.act({type:'PLUG',deviceId:sw.id,socketId:`${sw.id}.eth3`});
  d.act({type:'NETWORK_ACTION',action:{type:'SET_PERMISSIONS',policyId:'policy.roles-separated'}});d.act({type:'RUN_TEST',testId:'nurse'});d.act({type:'RUN_TEST',testId:'access'});
  d.act({type:'SAVE_EXPLANATION',text:exact,oral:false});d.act({type:'FINISH_VISIT'});
  const evidence=createProgrammeEvidence(d.state),records=evidence.json.apprenticeship.completionRecords;
  assert.equal(records[2].explanation.text,exact);assert.equal(records[2].support.length,1);assert.equal(records[2].support[0].topic,'why');
  assert.equal(records[1].addressChange.to,'10.12.1.44');assert.equal(records[2].policyDecision.policyId,'policy.roles-separated');
  const codes=records.flatMap(record=>record.observations.map(observation=>observation.code));
  assert.ok(codes.includes('SERVICE_AVAILABLE'));assert.ok(codes.includes('ACCESS_DENIED'));
  assert.ok(evidence.text.includes(exact));assert.match(evidence.text,/Questions asked: 1/);assert.match(evidence.text,/not an IB grade/i);
  assert.equal(evidence.json.apprenticeship.independentMastery,false);assert.equal(evidence.json.apprenticeship.teacherReview,'pending');
});
