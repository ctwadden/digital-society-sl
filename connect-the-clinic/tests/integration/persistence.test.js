import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPersistence} from '../../dist/persistence.js';
import {createGame as realCreateGame,dispatch as realDispatch,validateSave as realValidateSave,createEvidence,derive} from '../../dist/engine.js';

function environment({locks=true,failWrites=false,initial={}}={}){
 const records=new Map(Object.entries(initial));let held=false;const channels=[];const listeners=new Map();
 const local={getItem:k=>records.get(k)??null,setItem(k,v){if(failWrites)throw Error('quota');records.set(k,String(v));},removeItem:k=>records.delete(k)};
 Object.defineProperty(globalThis,'localStorage',{value:local,configurable:true});
 Object.defineProperty(globalThis,'navigator',{value:locks?{locks:{request:async(_n,_o,fn)=>{if(held)return fn(null);held=true;try{return await fn({name:'test'});}finally{held=false;}}}}:{},configurable:true});
 Object.defineProperty(globalThis,'BroadcastChannel',{value:class{constructor(){channels.push(this);}postMessage(data){for(const c of channels)if(c!==this)c.onmessage?.({data});}close(){channels.splice(channels.indexOf(this),1);}},configurable:true});
 globalThis.addEventListener=(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);};
 globalThis.removeEventListener=(name,fn)=>listeners.get(name)?.delete(fn);
 return {records,storage:local,emit:(name,event)=>{for(const f of listeners.get(name)||[])f(event);}};
}
const fake={
 createGame:()=>({revision:0,value:0}),
 dispatch:(s,a)=>a.type==='ADD'?{accepted:true,state:{revision:s.revision+1,value:s.value+1},message:'incremented'}:{accepted:false,state:s,message:'rejected'},
 validateSave:raw=>{try{const s=typeof raw==='string'?JSON.parse(raw):raw;return Number.isInteger(s?.revision)&&Number.isInteger(s?.value)&&s.value>=0?{valid:true,state:{...s}}:{valid:false,error:'Invalid test state'};}catch{return {valid:false,error:'Invalid JSON'};}}
};
const current='riverbend.clinic.v03.snapshot',backup='riverbend.clinic.v03.last-good';
const envelope=(state,stamp='existing')=>JSON.stringify({format:'riverbend-save-envelope-v1',stamp,counter:1,state});

test('accepted actions survive reload and rejected actions preserve the saved snapshot',async()=>{
 const env=environment();let p=await createPersistence(fake);
 await p.send({type:'ADD'});const saved=env.records.get(current);
 await p.send({type:'NO'});assert.equal(env.records.get(current),saved);p.dispose();await new Promise(r=>setImmediate(r));
 p=await createPersistence(fake);assert.equal(p.getState().value,1);assert.equal(p.getStatus().mode,'saved');p.dispose();
});
test('storage quota failure retains exportable in-memory work and never reports Saved',async()=>{
 environment({failWrites:true});const p=await createPersistence(fake);await p.send({type:'ADD'});
 assert.equal(p.getState().value,1);assert.equal(p.getStatus().mode,'memory');assert.match(p.getStatus().label,/not saved/i);p.dispose();
});
test('missing Web Locks uses explicit manual mode and does not write local snapshots',async()=>{
 const env=environment({locks:false});const p=await createPersistence(fake);await p.send({type:'ADD'});
 assert.equal(p.getState().value,1);assert.equal(p.getStatus().mode,'memory');assert.equal(env.records.size,0);p.dispose();
});
test('second tab is read-only and explicit takeover loads the latest persisted state',async()=>{
 environment();const a=await createPersistence(fake);await a.send({type:'ADD'});const b=await createPersistence(fake);
 assert.equal(b.getStatus().mode,'readonly');assert.equal((await b.send({type:'ADD'})).accepted,false);
 const takeover=await b.takeControl();assert.equal(takeover.accepted,true);assert.equal(a.getStatus().mode,'readonly');assert.equal(b.getState().value,1);
 await b.send({type:'ADD'});assert.equal(b.getState().value,2);assert.equal((await a.send({type:'ADD'})).accepted,false);a.dispose();b.dispose();
});
test('external revision conflict is detected before a mutation and preserves in-memory work',async()=>{
 const env=environment();const p=await createPersistence(fake);await p.send({type:'ADD'});
 env.records.set(current,envelope({revision:9,value:9},'other-writer'));
 const result=await p.send({type:'ADD'});assert.equal(result.accepted,false);assert.equal(result.code,'SAVE_CONFLICT');assert.equal(p.getState().value,1);assert.equal(p.getStatus().mode,'readonly');p.dispose();
});
test('invalid import leaves current progress and backup unchanged',async()=>{
 const env=environment();const p=await createPersistence(fake);await p.send({type:'ADD'});const old=env.records.get(current),oldGood=env.records.get(backup);
 assert.equal((await p.importProgress('{broken')).accepted,false);assert.equal(p.getState().value,1);assert.equal(env.records.get(current),old);assert.equal(env.records.get(backup),oldGood);p.dispose();
});
test('corrupt current save is preserved until explicit recovery; valid backup restores',async()=>{
 const env=environment({initial:{[current]:'{broken',[backup]:envelope({revision:2,value:2})}});const p=await createPersistence(fake);
 assert.equal(p.getStatus().mode,'error');assert.equal(env.records.get(current),'{broken');assert.equal((await p.recover()).accepted,true);assert.equal(p.getState().value,2);assert.equal(p.getStatus().mode,'saved');p.dispose();
});
test('clear removes only this game state while retaining unrelated site data',async()=>{
 const env=environment({initial:{'other-app':'keep'}});const p=await createPersistence(fake);await p.send({type:'ADD'});await p.clear();
 assert.equal(p.getState().value,0);assert.equal(env.records.get('other-app'),'keep');assert.equal(env.records.has(backup),false);p.dispose();
});
test('oversized in-memory progress cannot overwrite the last valid local save',async()=>{
 const env=environment();const model={...fake,dispatch:s=>({accepted:true,state:{...s,revision:s.revision+1,padding:'x'.repeat(1048577)}})};
 const p=await createPersistence(model);const old=env.records.get(current);await p.send({type:'GROW'});
 assert.equal(env.records.get(current),old);assert.equal(p.getStatus().mode,'memory');assert.match(p.getStatus().label,/too large/);assert.equal(p.getState().padding.length,1048577);p.dispose();
});


test('automatic restore preserves no-import provenance; only manual progress import marks it',async()=>{
 environment();const real={createGame:realCreateGame,dispatch:realDispatch,validateSave:realValidateSave};let p=await createPersistence(real);
 try{
  await p.send({type:'RUN_PROBE',testId:'all'});
  assert.equal(createEvidence(p.getState()).json.imported,false);
  const campaignId=p.getState().campaignId;
  p.dispose();await new Promise(r=>setImmediate(r));p=await createPersistence(real);
  assert.equal(p.getState().campaignId,campaignId);
  assert.equal(createEvidence(p.getState()).json.imported,false);
  assert.match(createEvidence(p.getState()).text,/Imported local save: no/);
  const progress=JSON.stringify(p.getState());
  assert.equal((await p.importProgress(progress)).accepted,true);
  assert.equal(createEvidence(p.getState()).json.imported,true);
  assert.equal(p.getState().importProvenance,'manual-file');
  p.dispose();await new Promise(r=>setImmediate(r));p=await createPersistence(real);
  assert.equal(createEvidence(p.getState()).json.imported,true);
  assert.match(createEvidence(p.getState()).text,/explicit progress-file import/);
  const old=realCreateGame();delete old.importProvenance;old.imported=true;
  const legacy=realValidateSave(old);assert.equal(legacy.valid,true);
  assert.equal(createEvidence(legacy.state).json.imported,null);
  assert.match(createEvidence(legacy.state).text,/unknown.*older build/);
 }finally{p.dispose();await new Promise(r=>setImmediate(r));}
});

test('0.6 application factory starts guided only for fresh/cleared work and restores a real 0.5 campaign intact',async()=>{
 const old=JSON.parse(readFileSync(new URL('../../qa/browser-evidence/first-play-0.5/complete-progress.json',import.meta.url),'utf8'));
 const oldAttempt=structuredClone(old.attempts[old.activeAttemptId]);
 const oldContract=structuredClone(old.contract);
 const env=environment({initial:{[current]:envelope(old,'observed-0.5'),'other-app':'keep'}});
 const model={createGame:()=>realCreateGame({guidedIntro:true}),dispatch:realDispatch,validateSave:realValidateSave};
 let p=await createPersistence(model);
 try{
  assert.equal(p.getState().campaignId,old.campaignId);
  assert.equal(p.getState().activeAttemptId,old.activeAttemptId);
  assert.deepEqual(p.getState().attempts[old.activeAttemptId],oldAttempt);
  assert.deepEqual(p.getState().contract,oldContract);
  assert.equal(p.getState().wallet,old.wallet);
  assert.notEqual(derive(p.getState()).training.kind,'guided-connection');
  assert.equal((await p.clear()).accepted,true);
  assert.equal(derive(p.getState()).training.kind,'guided-connection');
  assert.equal(env.records.get('other-app'),'keep');
  const freshId=p.getState().campaignId;
  p.dispose();await new Promise(r=>setImmediate(r));
  p=await createPersistence(model);
  assert.equal(p.getState().campaignId,freshId);
  assert.equal(derive(p.getState()).training.kind,'guided-connection');
 }finally{p.dispose();await new Promise(r=>setImmediate(r));}
});

test('guided progress reloads and damaged import preserves exact active state and stored snapshots',async()=>{
 const env=environment();
 const model={createGame:()=>realCreateGame({guidedIntro:true}),dispatch:realDispatch,validateSave:realValidateSave};
 let p=await createPersistence(model);
 try{
  assert.equal(derive(p.getState()).training.kind,'guided-connection');
  let v=derive(p.getState());
  const reception=v.devices.find(d=>d.roleId==='role.reception'),sw=v.devices.find(d=>d.roleId==='infra.switch');
  const result=await p.send({type:'CONNECT_PORTS',fromDeviceId:reception.id,fromPortId:reception.ports.find(x=>x.medium==='ethernet').id,toDeviceId:sw.id,toPortId:sw.ports.find(x=>x.medium==='ethernet'&&!x.cableId).id});
  assert.equal(result.accepted,true);
  assert.equal((await p.send({type:'RUN_PROBE',testId:'reception'})).accepted,true);
  const before=structuredClone(p.getState()),saved=env.records.get(current),lastGood=env.records.get(backup);
  const damaged=structuredClone(before);damaged.attempts[damaged.activeAttemptId].cables[0].toPortId='not-a-real-port';
  assert.equal((await p.importProgress(JSON.stringify(damaged))).accepted,false);
  assert.deepEqual(p.getState(),before);
  assert.equal(env.records.get(current),saved);assert.equal(env.records.get(backup),lastGood);
  p.dispose();await new Promise(r=>setImmediate(r));p=await createPersistence(model);
  assert.deepEqual(p.getState(),before);
  assert.equal(derive(p.getState()).guidedConnection.currentObservation.pass,true);
 }finally{p.dispose();await new Promise(r=>setImmediate(r));}
});
