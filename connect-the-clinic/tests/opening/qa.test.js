/** Independent Opening Shift acceptance/adversarial QA.
 * Authored 16 November 2026 (America/Halifax). No production modules are patched.
 * Node adapter/scene executions and explicit source audits are not browser tests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createShift, dispatchShift, deriveShift, validateShiftSave, createShiftEvidence, SHIFT_CATALOG} from '../../dist/opening/engine.js';
import {createGame} from '../../dist/engine.js';
import {createPersistence} from '../../dist/persistence.js';
import {renderScene, renderDeviceArtwork, SCENE_ANCHORS, getDeviceAnchors} from '../../dist/opening/scene.js';
import {OPENING_CONTENT} from '../../dist/opening/content.js';

const clone = value => JSON.parse(JSON.stringify(value));
const tick = () => new Promise(resolve => setImmediate(resolve));
const EXACT = 'My reason <script>alert("not executable")</script> & trade-off.\nI need a teacher discussion, not a keyword score.';
const getResult = (view, id) => view.currentResults.find(result => result.testId === id);
const getItem = (view, id) => view.inventory.find(item => item.id === id);
const objective = (view, suffix) => view.objectives.find(item => item.id === `objective.opening.${suffix}`);
function game(fixture='A', mode='client') {
  let current = createShift({campaignId:`qa.independent.${fixture}.${mode}`,fixture,mode});
  return {
    get state() { return current; },
    get view() { return deriveShift(current); },
    apply(type, details={}) {
      const result=dispatchShift(current,{type,...details});
      assert.equal(result.accepted,true,`${type}: ${result.code}: ${result.message}`);
      current=result.state; return result;
    },
    rejects(type, details={}, code) {
      const before=current, serialized=JSON.stringify(current), result=dispatchShift(current,{type,...details});
      assert.equal(result.accepted,false,`Unexpectedly accepted ${type}`);
      if(code)assert.equal(result.code,code);
      assert.equal(result.state,before);assert.equal(JSON.stringify(current),serialized);
      return result;
    },
    replace(state) { current=state; }
  };
}
function connectUplink(g, {reverse=true, port=4}={}) {
  const v=g.view, ap=v.devices.find(d=>d.id===v.apDeviceId), sw=v.devices.find(d=>d.id===v.switchDeviceId);
  const ends=[{device:ap.id,port:ap.ports.find(p=>p.medium==='ethernet').id},
    {device:sw.id,port:sw.ports.filter(p=>p.medium==='ethernet')[port-1].id}];
  if(reverse)ends.reverse();
  g.apply('CONNECT_PORTS',{itemId:'item.uplink',fromDeviceId:ends[0].device,fromPortId:ends[0].port,toDeviceId:ends[1].device,toPortId:ends[1].port});
}
function installMissing(g) {
  if(!getItem(g.view,'item.ap').owned)g.apply('BUY_ITEM',{sku:'access-point'});
  if(!getItem(g.view,'item.uplink').owned)g.apply('BUY_ITEM',{sku:'ethernet-cable'});
  if(!g.view.apDeviceId)g.apply('INSTALL_ITEM',{itemId:'item.ap'});
  g.apply('POWER_DEVICE',{deviceId:g.view.apDeviceId,on:true});
  connectUplink(g);
  g.apply('ASSOCIATE_WIFI',{deviceId:g.view.nurseDeviceId,apDeviceId:g.view.apDeviceId});
}
function choose(g,tablet) {
  if(tablet)g.apply('BUY_ITEM',{sku:'tablet'});
  g.apply('ASSIGN_NURSE',{itemId:tablet?'item.tablet':'item.laptop'});
  if(tablet) {
    g.apply('POWER_DEVICE',{deviceId:g.view.nurseDeviceId,on:true});
    if(g.view.apDeviceId)g.apply('ASSOCIATE_WIFI',{deviceId:g.view.nurseDeviceId,apDeviceId:g.view.apDeviceId});
  }
}
function working(g,{tablet=false,inspection=true,address='10.40.10.87'}={}) {
  g.apply('REVIEW_BRIEF');choose(g,tablet);
  if(g.view.fixture==='A') {
    if(inspection)g.apply('INSPECT_DEVICE',{deviceId:g.view.nurseDeviceId});
    // Repair proactively before completing the physical installation.
    g.apply('SET_STATIC_ADDRESS',{deviceId:g.view.nurseDeviceId,address,mask:'255.255.255.0'});
    installMissing(g);
  } else {
    if(inspection)g.apply('INSPECT_DEVICE',{deviceId:g.view.apDeviceId});
    connectUplink(g);
  }
}
function explanations(g) {
  for(const key of SHIFT_CATALOG.explanationKeys)g.apply('SAVE_EXPLANATION',{key,text:key==='limitations'?'':EXACT,oral:key==='limitations'});
}
function explicitChecks(g,policy='policy.roles-separated') {
  g.apply('SET_PERMISSIONS',{policyId:policy});
  // The reverse room order and individual access probes are deliberate alternatives.
  g.apply('MOVE_NURSE',{locationId:'location.exam-b'});
  g.apply('RUN_PROBE',{testId:'nurse'});
  g.apply('RUN_PROBE',{testId:'reception'});
  g.apply('RUN_PROBE',{testId:'nurse-bookings'});
  g.apply('RUN_PROBE',{testId:'access'});
  g.apply('MOVE_NURSE',{locationId:'location.exam-a'});
  g.apply('RUN_PROBE',{testId:'nurse'});
}
function ready(g,options={}) {working(g,options);explicitChecks(g,options.policy);explanations(g);assert.equal(g.view.ready,true,g.view.missing.join('; '));}
function consult(g,id=SHIFT_CATALOG.guides[0].id) {const q=g.view.guideQuotes.find(q=>q.sectionId===id);g.apply('GUIDE_CONSULT',{sectionId:id,quoteToken:q.quoteToken});}

for(const fixture of ['A','B'])for(const tablet of [false,true])test(`QA-01 ${fixture}/${tablet?'tablet':'retained laptop'} alternative complete route and frozen evidence`,()=>{
  const g=game(fixture);ready(g,{tablet,policy:tablet?'policy.nurse-also-books':'policy.roles-separated',address:tablet?'10.40.10.119':'10.40.10.87'});
  assert.equal(g.view.economy.spent,(fixture==='A'?44:0)+(tablet?70:0));
  assert.equal(g.view.requiredTests.length,7);assert.ok(g.view.requiredTests.every(t=>t.met&&t.observation.origin==='player'));
  assert.ok(g.view.currentResults.every(t=>t.origin==='engine-check'));
  assert.equal(g.view.repair.preRepairFailureObserved,false,'Proactive inspection must not invent a failure.');
  assert.equal(g.view.repair.observationKind,'inspection');
  const observationIds=g.view.observations.map(o=>o.id);
  g.apply('REQUEST_HANDOVER');
  assert.deepEqual(g.view.observations.map(o=>o.id),observationIds,'Delivery must not fabricate probes.');
  const evidence=createShiftEvidence(g.state);
  assert.equal(evidence.json.delivered.evidence.explanations.repair.text,EXACT);
  assert.equal(evidence.json.delivered.evidence.explanations.limitations.oral,true);
  assert.match(evidence.text,/Oral explanation PENDING teacher conversation/);
  assert.equal(evidence.json.delivered.evidence.followUp.bootcampCompleted,false);
  assert.equal(evidence.json.delivered.evidence.followUp.wearableCompleted,false);
  assert.match(evidence.json.delivered.evidence.teacherReview,/no grade or mastery is inferred/);
  assert.ok(!Object.hasOwn(evidence.json,'score')&&!Object.hasOwn(evidence.json,'grade'));
  const frozen=JSON.stringify(g.view.delivery);
  g.apply('SETTLE_CONTRACT');g.apply('SETTLE_CONTRACT');
  assert.equal(g.state.wallet,120);assert.equal(JSON.stringify(g.view.delivery),frozen);
  assert.equal(validateShiftSave(JSON.stringify(g.state)).valid,true);
});

test('QA-02 B missing physical uplink survives an unrelated valid address edit and records its actual repaired path',()=>{
  const g=game('B');choose(g,false);g.apply('RUN_PROBE',{testId:'nurse'});
  assert.equal(g.view.observations[0].code,'PORT_DISCONNECTED');assert.deepEqual(g.view.observations[0].pathIds,[]);
  const originalFailure=g.view.observations[0].id;
  g.apply('SET_STATIC_ADDRESS',{deviceId:g.view.nurseDeviceId,address:'10.40.10.143'});
  g.apply('RUN_PROBE',{testId:'nurse'});
  assert.equal(getResult(g.view,'nurse').code,'PORT_DISCONNECTED');assert.equal(g.view.repair.confirmed,false);
  assert.equal(g.state.client.fault.changes.length,0);
  connectUplink(g);g.apply('RUN_PROBE',{testId:'nurse'});
  assert.equal(g.view.repair.confirmed,true);assert.equal(g.view.repair.change.kind,'uplink-reconnection');
  assert.ok(g.view.repair.recordedRetest.pathIds.includes(getItem(g.view,'item.uplink').cableId));
  assert.ok(g.view.observations.some(o=>o.id===originalFailure&&o.stale));
  assert.equal(g.view.repair.preRepairFailureObserved,true);
});

test('QA-03 unobserved initial address fix cannot be converted to an observed repair by valid-to-valid edits',()=>{
  const g=game();working(g,{inspection:false});
  g.apply('INSPECT_DEVICE',{deviceId:g.view.nurseDeviceId});
  g.apply('SET_STATIC_ADDRESS',{deviceId:g.view.nurseDeviceId,address:'10.40.10.142'});
  explicitChecks(g);explanations(g);
  assert.equal(g.view.repair.confirmed,false);assert.equal(objective(g.view,'repair').met,false);
  g.rejects('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
  // An explicitly observed current fault can still be repaired; no permanent dead end.
  g.apply('SET_STATIC_ADDRESS',{deviceId:g.view.nurseDeviceId,address:'10.40.20.98'});
  g.apply('INSPECT_DEVICE',{deviceId:g.view.nurseDeviceId});
  g.apply('SET_STATIC_ADDRESS',{deviceId:g.view.nurseDeviceId,address:'10.40.10.98'});
  explicitChecks(g);assert.equal(g.view.repair.confirmed,true);
});

test('QA-04 real earlier repair retains its witness after later valid edits and requires new explicit tests',()=>{
  const g=game();ready(g);const original=clone(g.view.repair.change);
  g.apply('SET_STATIC_ADDRESS',{deviceId:g.view.nurseDeviceId,address:'10.40.10.193'});
  assert.equal(g.view.ready,false);assert.ok(g.view.requiredTests.every(t=>!t.met));
  explicitChecks(g);
  assert.equal(g.view.ready,true);assert.deepEqual(g.view.repair.change,original);
  assert.equal(g.view.repair.observation.snapshot?.address??g.view.repair.observation.address,'10.40.20.30');
});

test('QA-05 all/current engine checks cannot supply the other room; an off-site nurse blocks handover',()=>{
  const g=game('B');working(g);g.apply('SET_PERMISSIONS',{policyId:'policy.roles-separated'});g.apply('RUN_PROBE',{testId:'all'});explanations(g);
  assert.ok(getResult(g.view,'nurse-room-b').pass);
  assert.equal(g.view.requiredTests.find(t=>t.id==='nurse-room-b').met,false);
  g.rejects('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
  g.apply('MOVE_NURSE',{locationId:'location.exam-b'});g.apply('RUN_PROBE',{testId:'nurse'});
  assert.equal(g.view.ready,true);const revision=g.view.technicalRevision;
  g.apply('MOVE_NURSE',{locationId:'location.home'});
  assert.equal(g.view.technicalRevision,revision);assert.equal(objective(g.view,'services').met,false);assert.equal(g.view.ready,false);
  g.rejects('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
  assert.equal(getDeviceAnchors(g.view)[g.view.nurseDeviceId],undefined);
  g.apply('MOVE_NURSE',{locationId:'location.exam-a'});assert.equal(g.view.ready,true,'Recorded room evidence remains valid after movement alone.');
});

test('QA-06 uninstall/return of required infrastructure breaks service and a rebuild recovers without hidden free cables',()=>{
  const g=game();ready(g);const priorAp=g.view.apDeviceId;
  for(const itemId of ['item.host','item.switch','item.reception'])g.rejects('UNINSTALL_ITEM',{itemId},'FIXED_EQUIPMENT');
  g.apply('UNINSTALL_ITEM',{itemId:'item.ap'});
  assert.equal(g.view.apDeviceId,null);assert.equal(getItem(g.view,'item.uplink').installed,false);
  assert.equal(g.view.devices.find(d=>d.id===g.view.nurseDeviceId).wifiApId,null);
  assert.equal(g.view.ready,false);assert.equal(getResult(g.view,'reception').pass,true);
  assert.equal(g.view.economy.spent,44);
  g.apply('RETURN_ITEM',{itemId:'item.ap'});g.apply('RETURN_ITEM',{itemId:'item.uplink'});
  assert.equal(g.view.economy.spent,0);g.rejects('RETURN_ITEM',{itemId:'item.ap'},'ITEM_NOT_OWNED');
  installMissing(g);assert.notEqual(g.view.apDeviceId,priorAp);explicitChecks(g);
  assert.equal(g.view.ready,true);assert.equal(g.view.economy.spent,44);
  assert.equal(g.view.inventory.filter(i=>i.kind==='ethernet-cable'&&i.installed).length,3);
  assert.equal(validateShiftSave(g.state).valid,true);
});

test('QA-07 returning and rebuying the nurse tablet retains its edited profile and exact one-time refund',()=>{
  const g=game();ready(g,{tablet:true,address:'10.40.10.166'});
  const oldDevice=g.view.nurseDeviceId;
  assert.equal(getItem(g.view,'item.laptop').profile.powered,false);assert.equal(getItem(g.view,'item.laptop').profile.wifiApId,null);
  g.apply('RETURN_ITEM',{itemId:'item.tablet'});
  assert.equal(g.view.nurseDeviceId,null);assert.equal(g.view.ready,false);assert.equal(g.view.economy.spent,44);
  g.rejects('RETURN_ITEM',{itemId:'item.tablet'},'ITEM_NOT_OWNED');
  g.apply('BUY_ITEM',{sku:'tablet'});g.apply('ASSIGN_NURSE',{itemId:'item.tablet'});
  const nurse=g.view.devices.find(d=>d.id===g.view.nurseDeviceId);
  assert.notEqual(nurse.id,oldDevice);assert.equal(nurse.address,'10.40.10.166');assert.equal(nurse.powered,false);assert.equal(nurse.wifiApId,null);
  g.apply('POWER_DEVICE',{deviceId:nurse.id,on:true});g.apply('ASSOCIATE_WIFI',{deviceId:nurse.id,apDeviceId:g.view.apDeviceId});
  explicitChecks(g);assert.equal(g.view.ready,true);assert.equal(g.view.economy.spent,114);
  assert.equal(g.state.client.events.filter(e=>e.type==='INITIALIZE_DEPLOYMENT_PROFILE').length,1);
});

test('QA-08 service, power and permission failures remain causally distinct; disconnection is not privacy protection',()=>{
  const g=game('B');working(g);explicitChecks(g);explanations(g);
  g.apply('SET_SERVICE_STATE',{enabled:false});g.apply('RUN_PROBE',{testId:'all'});
  assert.equal(getResult(g.view,'nurse').code,'SERVICE_UNAVAILABLE');
  assert.match(getResult(g.view,'nurse').message,/shared services are turned off/);
  assert.equal(getResult(g.view,'access-outsider-workspace').pass,false);
  g.apply('SET_SERVICE_STATE',{enabled:true});
  g.apply('POWER_DEVICE',{deviceId:g.view.apDeviceId,on:false});g.apply('RUN_PROBE',{testId:'nurse'});
  assert.equal(getResult(g.view,'nurse').pass,false);assert.equal(g.view.repair.confirmed,false);
  assert.equal(getResult(g.view,'reception').pass,true);
  g.apply('POWER_DEVICE',{deviceId:g.view.apDeviceId,on:true});
  explicitChecks(g);assert.equal(g.view.ready,true);
  g.apply('DISCONNECT_CABLE',{cableId:getItem(g.view,'item.host-cable').cableId});g.apply('RUN_PROBE',{testId:'access'});
  assert.equal(getResult(g.view,'access-outsider-workspace').pass,false);
  assert.notEqual(getResult(g.view,'access-outsider-workspace').code,'ACCESS_DENIED');
});

test('QA-09 both responsible policies expose actual booking behavior; broad/deny-all fail and privacy resubmission uses new context',()=>{
  const g=game('B');ready(g);const earlier=g.view.explanations.privacy.context.policyDecisionEventId;
  assert.equal(getResult(g.view,'nurse-bookings').expectedDenied,true);
  g.apply('SET_PERMISSIONS',{policyId:'policy.nurse-also-books'});
  assert.equal(g.view.explanations.privacy.stale,true);
  explicitChecks(g,'policy.nurse-also-books');
  assert.equal(getResult(g.view,'nurse-bookings').pass,true);assert.equal(getResult(g.view,'nurse-bookings').expectedDenied,false);
  g.rejects('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
  g.apply('SAVE_EXPLANATION',{key:'privacy',text:'Nurses can now arrange follow-ups; this adds responsibility.',oral:false});
  assert.equal(g.view.ready,true);assert.notEqual(g.view.explanations.privacy.context.policyDecisionEventId,earlier);
  g.apply('SET_PERMISSIONS',{policyId:'policy.broad-access'});g.apply('RUN_PROBE',{testId:'all'});
  assert.equal(getResult(g.view,'access-outsider-workspace').pass,false);assert.equal(g.view.ready,false);
  g.apply('SET_PERMISSIONS',{policyId:'policy.deny-all'});g.apply('RUN_PROBE',{testId:'all'});
  assert.equal(getResult(g.view,'reception').pass,false);assert.equal(getResult(g.view,'nurse').pass,false);
  explicitChecks(g);assert.equal(g.view.explanations.privacy.stale,true);
  g.apply('SAVE_EXPLANATION',{key:'privacy',text:'',oral:true});assert.equal(g.view.ready,true);
});

test('QA-10 reset refunds only paid equipment, retains help charges, and changing practice cannot reduce an independent fee',()=>{
  const g=game();g.apply('BUY_ITEM',{sku:'tablet'});
  for(const guide of SHIFT_CATALOG.guides)consult(g,guide.id);
  const oldAttempt=g.view.attemptId;g.apply('RESET_SHIFT');
  assert.notEqual(g.view.attemptId,oldAttempt);assert.equal(g.view.economy.spent,0);assert.equal(g.view.economy.reserved,15);assert.equal(g.view.economy.minutes,9);
  assert.equal(g.view.economy.net,105);
  const independent=JSON.stringify(g.state.client);g.apply('START_PRACTICE',{fixture:'B'});
  assert.ok(g.view.shop.every(s=>s.price===0));
  for(const guide of SHIFT_CATALOG.guides)consult(g,guide.id);
  g.apply('BUY_ITEM',{sku:'tablet'});g.apply('RESET_SHIFT');
  assert.equal(g.view.economy.gross,0);assert.equal(g.view.economy.net,0);assert.equal(g.view.economy.reserved,0);assert.equal(g.state.wallet,0);
  assert.equal(JSON.stringify(g.state.client),independent);
  g.rejects('REQUEST_HANDOVER',{},'CLIENT_ONLY');g.rejects('SETTLE_CONTRACT',{},'CLIENT_ONLY');
  g.apply('START_CLIENT');ready(g);g.apply('REQUEST_HANDOVER');g.apply('SETTLE_CONTRACT');
  assert.equal(g.state.wallet,105);
  const receipt=JSON.stringify(g.state.client.settlement),delivery=JSON.stringify(g.state.client.delivery);
  g.apply('RESET_SHIFT');assert.equal(g.view.mode,'practice');g.apply('RESET_SHIFT');g.apply('RETURN_TO_CLIENT');g.apply('SETTLE_CONTRACT');
  assert.equal(g.state.wallet,105);assert.equal(JSON.stringify(g.state.client.delivery),delivery);assert.equal(JSON.stringify(g.state.client.settlement),receipt);
});

test('QA-11 evidence keeps a paid delivery separate from current free rehearsal and never rebrands guide history',()=>{
  const g=game('B');consult(g);ready(g);g.apply('REQUEST_HANDOVER');g.apply('SETTLE_CONTRACT');
  const delivered=clone(g.state.client.delivery);g.apply('START_PRACTICE',{fixture:'A'});g.apply('BUY_ITEM',{sku:'tablet'});consult(g);
  const evidence=createShiftEvidence(g.state);
  assert.equal(evidence.json.current.mode,'practice');assert.equal(evidence.json.current.economy.gross,0);assert.equal(evidence.json.current.economy.spent,0);
  assert.equal(evidence.json.current.economy.net,0);assert.equal(evidence.json.wallet,115);
  assert.deepEqual(evidence.json.delivered,delivered);assert.equal(evidence.json.delivered.netFee,115);
  assert.match(evidence.text,/FREE REHEARSAL — zero earnings/);assert.match(evidence.text,/Fee: 0; guide cost: 0/);assert.match(evidence.text,/net fee 115/);
});

test('QA-12 nested damage, unknown fields and altered ledger/evidence are rejected without changing the source object',()=>{
  const g=game('B');ready(g);const source=JSON.stringify(g.state);
  const changes=[
    s=>{s.client.inventory['item.ap']=null;},
    s=>{s.client.networkState.attempts[s.client.networkState.activeAttemptId].devices={};},
    s=>{s.client.explanations.privacy.context=null;},
    s=>{s.client.observations[0].pathIds=['invented'];},
    s=>{s.client.fault.changes[0].observationId='invented';},
    s=>{s.client.transactions={purchase:120};},
    s=>{s.client.help.grants=[{credits:-1000,minutes:0}];},
    s=>{s.client.delivery={netFee:999,evidence:{ready:true}};},
    s=>{s.wallet=999;},
    s=>{s.actions[0]={type:'REVIEW_BRIEF',ready:true};},
    s=>{s.actions[0]={type:'SAVE_EXPLANATION',key:'privacy',text:{nested:'bad'},oral:false};},
    s=>{s.actions.push({type:'SET_SERVICE_STATE',enabled:'true'});},
    s=>{s.seed.fixture='toString';},
    s=>{s.extra={completion:true};},
    s=>{s.client.inspections[0].snapshot.cables=null;}
  ];
  for(const mutate of changes){const damaged=JSON.parse(source);mutate(damaged);assert.equal(validateShiftSave(damaged).valid,false);assert.equal(JSON.stringify(g.state),source);}
  for(const action of [null,[],{type:'INSPECT_DEVICE',deviceId:'__proto__'},{type:'ASSIGN_NURSE',itemId:'constructor'},
    {type:'SAVE_EXPLANATION',key:'privacy',text:'x',oral:0},{type:'RUN_PROBE',testId:'nurse',completion:true}]) {
    const rejected=dispatchShift(g.state,action);assert.equal(rejected.accepted,false);assert.equal(rejected.state,g.state);
  }
  assert.equal(validateShiftSave(source).valid,true);
});

test('QA-13 unsupported, old, malformed and oversized saves cannot impersonate Opening Shift',()=>{
  for(const raw of [null,[],42,'{"broken":',JSON.stringify({appId:'other',schemaVersion:1}), ' '.repeat(1048577)])assert.equal(validateShiftSave(raw).valid,false);
  const legacy=validateShiftSave(JSON.stringify(createGame({campaignId:'legacy.qa'})));
  assert.equal(legacy.code,'LEGACY_SAVE');assert.equal(legacy.legacyUrl,'../index.html');
  const deep=createShift({campaignId:'deep.qa'});let cursor=deep;
  for(let i=0;i<60;i++){cursor.extra={};cursor=cursor.extra;}
  assert.equal(validateShiftSave(deep).valid,false);
});

function browserCapabilities({locks=true}={}) {
  const records=new Map(),held=new Set(),channels=new Set(),listeners=new Map(),flags={writeFailure:false};
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    getItem:key=>records.get(key)??null,
    setItem(key,value){if(flags.writeFailure)throw Error('quota denied');records.set(key,String(value));},
    removeItem(key){if(flags.writeFailure)throw Error('removal denied');records.delete(key);}
  }});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:locks?{locks:{request:async(name,options,callback)=>{
    if(held.has(name))return callback(null);held.add(name);try{return await callback({name});}finally{held.delete(name);}
  }}}:{}});
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class{
    constructor(name){this.name=name;channels.add(this);}postMessage(data){for(const channel of channels)if(channel!==this&&channel.name===this.name)channel.onmessage?.({data});}close(){channels.delete(this);}
  }});
  globalThis.addEventListener=(name,callback)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(callback);};
  globalThis.removeEventListener=(name,callback)=>listeners.get(name)?.delete(callback);
  return {records,flags,emit:(name,event)=>{for(const cb of listeners.get(name)||[])cb(event);}};
}
const namespace='riverbend.clinic.opening.v1.';
const snapshotKey=namespace+'snapshot',backupKey=namespace+'last-good';
const envelope=(state,stamp='external')=>JSON.stringify({format:'riverbend-save-envelope-v1',stamp,counter:77,state});
const adapter=()=>createPersistence({namespace,createGame:()=>createShift({campaignId:'qa.adapter'}),dispatch:dispatchShift,validateSave:validateShiftSave});

test('QA-14 actual new-validator persistence imports, reloads, refunds and preserves import provenance',async()=>{
  const env=browserCapabilities();let store=await adapter();
  try {
    const g=game();g.apply('BUY_ITEM',{sku:'tablet'});
    assert.equal((await store.importProgress(JSON.stringify(g.state))).accepted,true);
    assert.equal(store.getState().imported,true);assert.equal(store.getState().importProvenance,'manual-file');
    assert.equal(validateShiftSave(store.getState()).valid,true);
    store.dispose();await tick();store=await adapter();
    assert.equal(store.getStatus().mode,'saved');assert.equal(deriveShift(store.getState()).economy.spent,70);
    assert.equal((await store.send({type:'RETURN_ITEM',itemId:'item.tablet'})).accepted,true);
    assert.equal((await store.send({type:'RETURN_ITEM',itemId:'item.tablet'})).accepted,false);
    assert.equal(deriveShift(store.getState()).economy.spent,0);
    assert.equal(JSON.parse(env.records.get(snapshotKey)).state.importProvenance,'manual-file');
    assert.equal(createShiftEvidence(store.getState()).json.imported,true);
  } finally {store.dispose();await tick();}
});

test('QA-15 rejected import preserves actual state and both snapshots; storage denial keeps exportable state',async()=>{
  const env=browserCapabilities();const store=await adapter();
  try {
    await store.send({type:'REVIEW_BRIEF'});const before=JSON.stringify(store.getState()),disk=env.records.get(snapshotKey),backup=env.records.get(backupKey);
    const broken=JSON.parse(before);broken.client.inventory['item.laptop'].profile={address:'forged',mask:null};
    for(const raw of [JSON.stringify(broken),JSON.stringify(createGame()),'{bad']) {
      assert.equal((await store.importProgress(raw)).accepted,false);assert.equal(JSON.stringify(store.getState()),before);
      assert.equal(env.records.get(snapshotKey),disk);assert.equal(env.records.get(backupKey),backup);
    }
    env.flags.writeFailure=true;
    assert.equal((await store.send({type:'RUN_PROBE',testId:'reception'})).accepted,true);
    assert.equal(store.getStatus().mode,'memory');assert.equal(validateShiftSave(store.getState()).valid,true);
    assert.equal(env.records.get(snapshotKey),disk);
  } finally {store.dispose();await tick();}
});

test('QA-16 actual two-tab takeover loads newest state; read-only mutation/import preserve the original view',async()=>{
  browserCapabilities();const a=await adapter();let b;
  try {
    await a.send({type:'REVIEW_BRIEF'});b=await adapter();assert.equal(b.getStatus().mode,'readonly');
    const old=JSON.stringify(b.getState());
    assert.equal((await b.send({type:'BUY_ITEM',sku:'tablet'})).accepted,false);
    assert.equal((await b.importProgress(JSON.stringify(game('B').state))).accepted,false);assert.equal(JSON.stringify(b.getState()),old);
    await a.send({type:'BUY_ITEM',sku:'tablet'});
    assert.equal((await b.takeControl()).accepted,true);assert.equal(a.getStatus().mode,'readonly');
    assert.equal(deriveShift(b.getState()).economy.spent,70);
    assert.equal((await a.send({type:'RETURN_ITEM',itemId:'item.tablet'})).accepted,false);
    assert.equal(validateShiftSave(b.getState()).valid,true);
  } finally {a.dispose();b?.dispose();await tick();}
});

test('QA-17 detected disk conflicts reject a new action before changing any in-memory evidence',async()=>{
  const env=browserCapabilities();const store=await adapter();
  try {
    await store.send({type:'REVIEW_BRIEF'});const original=JSON.stringify(store.getState());
    const foreign=game('B');env.records.set(snapshotKey,envelope(foreign.state));
    const result=await store.send({type:'RUN_PROBE',testId:'all'});
    assert.equal(result.accepted,false);assert.equal(result.code,'SAVE_CONFLICT');assert.equal(JSON.stringify(store.getState()),original);
    assert.equal(store.getStatus().mode,'readonly');
    assert.equal((await store.takeControl()).accepted,true);assert.equal(deriveShift(store.getState()).fixture,'B');
  } finally {store.dispose();await tick();}
});

test('QA-18 corrupt current snapshot remains intact until explicit valid backup recovery',async()=>{
  const env=browserCapabilities();const prior=game('B');prior.apply('REVIEW_BRIEF');
  env.records.set(snapshotKey,'{broken');env.records.set(backupKey,envelope(prior.state,'valid-backup'));
  const store=await adapter();
  try {
    assert.equal(store.getStatus().mode,'error');assert.equal(env.records.get(snapshotKey),'{broken');
    assert.equal((await store.recover()).accepted,true);assert.equal(deriveShift(store.getState()).fixture,'B');
    assert.equal(deriveShift(store.getState()).briefReviewed,true);assert.equal(store.getStatus().mode,'saved');
    assert.equal(validateShiftSave(store.getState()).valid,true);
  } finally {store.dispose();await tick();}
});

test('QA-19 scene routes use actual current player edge IDs; no route is invented for setup, stale or other-room evidence',()=>{
  const g=game('B');const initial=renderScene(g.view);
  assert.doesNotMatch(initial,/data-tested-edge-id=/);assert.match(initial,/No recorded player test/);
  working(g);g.apply('RUN_PROBE',{testId:'nurse'});const observed=g.view.observations[0];
  const scene=renderScene(g.view,{selectedObservationId:observed.id});
  const highlighted=[...scene.matchAll(/data-tested-edge-id="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(highlighted.length>=3);assert.ok(highlighted.every(id=>observed.pathIds.includes(id)));
  g.apply('MOVE_NURSE',{locationId:'location.exam-b'});
  assert.doesNotMatch(renderScene(g.view,{selectedObservationId:observed.id}),/data-tested-edge-id=/);
  assert.match(renderScene(g.view,{selectedObservationId:observed.id}),/Test recorded in Exam A/);
  g.apply('MOVE_NURSE',{locationId:'location.exam-a'});g.apply('SET_SERVICE_STATE',{enabled:false});
  assert.doesNotMatch(renderScene(g.view,{selectedObservationId:observed.id}),/data-tested-edge-id=/);
  assert.match(renderScene(g.view,{selectedObservationId:observed.id}),/Earlier test/);
});

test('QA-20 SVG dynamic labels are escaped and renderers do not mutate authoritative view',()=>{
  const g=game('B'),v=g.view;
  v.devices[0].label='</title><script>bad()</script>';v.devices[0].roleLabel='</title><script>bad()</script>';
  v.inventory[5].label='" onload="bad()';const before=JSON.stringify(v);
  const scene=renderScene(v,{selectedDeviceId:v.devices[0].id});
  assert.equal(JSON.stringify(v),before);assert.doesNotMatch(scene,/<script>|onload="bad/);
  assert.match(scene,/&lt;\/title&gt;&lt;script&gt;/);
  const svg=renderDeviceArtwork('tablet',{label:'</title><svg onload="bad()">'});
  assert.doesNotMatch(svg,/<svg onload/);assert.match(svg,/aria-hidden="true"/);assert.match(svg,/focusable="false"/);
});

test('QA-21 source/asset audit: original scene manifest resolves local exports with all required device states',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../../dist/opening/assets/manifest.json',import.meta.url),'utf8'));
  const base=new URL('../../dist/opening/assets/',import.meta.url);
  assert.deepEqual(manifest.scene.anchors,SCENE_ANCHORS);assert.equal(manifest.scene.viewBox.join(' '),'0 0 960 620');
  const names=new Set();
  for(const entry of manifest.assets) {
    assert.ok(!names.has(entry.assetId),`Duplicate ${entry.assetId}`);names.add(entry.assetId);
    assert.ok(existsSync(new URL(entry.export,base)),`Missing export ${entry.export}`);
    const svg=readFileSync(new URL(entry.export,base),'utf8');assert.match(svg,/<svg\b/);
    assert.doesNotMatch(svg,/<script\b|<foreignObject\b|(?:href|src)=["']https?:/);
    assert.match(entry.provenance,/Original/);assert.deepEqual(entry.dependencies,[]);
  }
  for(const kind of ['tablet','laptop','desktop','server','access-point','switch4'])for(const state of ['on','off','selected'])
    assert.ok(existsSync(new URL(`device-${kind}-${state}.svg`,base)),`${kind}/${state}`);
});

test('QA-22 source audit only: native controls, escape/focus/keyboard hooks, attempt draft scopes and reduced-motion/narrow rules exist',()=>{
  const ui=readFileSync(new URL('../../dist/opening/ui.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../../dist/opening/styles.css',import.meta.url),'utf8');
  const main=readFileSync(new URL('../../dist/opening/main.js',import.meta.url),'utf8');
  for(const text of ['role="dialog"','aria-modal="true"','role="tablist"','aria-live="polite"','Skip to clinic workbench','data-form="connect"','data-form="address"','Record inspection'])assert.ok(ui.includes(text),text);
  for(const text of ['focusSnapshot','restoreFocus','setSelectionRange','ArrowLeft','ArrowRight',"e.key==='Escape'","e.key==='Tab'",'getClientRects'])assert.ok(ui.includes(text),text);
  assert.ok(ui.includes('esc(value.text'));assert.ok(ui.includes('esc(saved.text'));assert.ok(ui.includes('esc(lastStatus.message)'));
  assert.ok(ui.includes('view.campaignId}|${view.attemptId'));assert.ok(ui.includes('markDraftsForReview'));
  assert.ok(ui.includes('draft.needsReview||draft.base!==explanationBase(key)'));assert.ok(ui.includes('UNSUBMITTED DRAFT RESCUE'));
  assert.ok(ui.includes('sessionStorage.setItem(DRAFT_KEY'));assert.ok(ui.includes('draftStorageFailed'));
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/focus-visible/);assert.match(css,/@media\(max-width:560px\)/);
  assert.ok(main.includes("namespace:'riverbend.clinic.opening.v1.'"));assert.ok(main.includes("validateSave:validateShiftSave"));
  assert.ok(main.includes('input.size>1048576'));assert.ok(main.includes('new TextEncoder().encode(raw).length>1048576'));
  assert.equal(OPENING_CONTENT.explanationPrompts.length,4);assert.equal(Object.keys(OPENING_CONTENT.goals).length,4);
  assert.ok(Object.values(OPENING_CONTENT.goals).every(stage=>stage.items.length>=2&&stage.items.length<=3));
});

test('QA-23 valid import during an unannounced disk conflict rejects before replacing current work or backup',async()=>{
  const env=browserCapabilities();const store=await adapter();
  try {
    await store.send({type:'REVIEW_BRIEF'});
    const before=store.getState(),serialized=JSON.stringify(before),backup=env.records.get(backupKey);
    const newer=createShift({campaignId:'qa.newer-disk',fixture:'B'});
    const foreignEnvelope=envelope(newer,'newer-writer:1');env.records.set(snapshotKey,foreignEnvelope);
    const imported=createShift({campaignId:'qa.import-candidate'});
    const result=await store.importProgress(JSON.stringify(imported));
    assert.equal(result.accepted,false,'A valid file must not bypass the save-conflict guard.');
    assert.equal(result.code,'SAVE_CONFLICT');
    assert.equal(store.getState(),before);assert.equal(JSON.stringify(store.getState()),serialized);
    assert.equal(env.records.get(snapshotKey),foreignEnvelope);assert.equal(env.records.get(backupKey),backup);
    assert.equal(store.getStatus().mode,'readonly');
    assert.equal((await store.takeControl()).accepted,true);
    assert.equal(store.getState().campaignId,'qa.newer-disk');
  } finally {store.dispose();await tick();}
});
