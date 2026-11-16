import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersistence} from '../../dist/persistence.js';
import {createGame,dispatch,validateSave,createEvidence} from '../../dist/engine.js';
import {act,client} from '../simulation/fixtures.js';

// Adapter execution with browser capabilities substituted in Node. These are
// headless integration checks, not claims about Web Locks/BFCache on Windows.
function environment(){
  const records=new Map(),listeners=new Map(),channels=new Set();
  const controls={failReads:false,failWrites:false};let locked=false;
  const storage={
    getItem(key){if(controls.failReads)throw new Error('SecurityError: storage disabled');return records.get(key)??null;},
    setItem(key,value){if(controls.failWrites)throw new Error('QuotaExceededError');records.set(key,String(value));},
    removeItem(key){if(controls.failWrites)throw new Error('SecurityError');records.delete(key);}
  };
  Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
  Object.defineProperty(globalThis,'navigator',{value:{locks:{request:async(_key,_options,fn)=>{
    if(controls.beforeLock)await controls.beforeLock;
    if(locked)return fn(null);locked=true;try{return await fn({name:'qa-lock'});}finally{locked=false;}
  }}},configurable:true});
  Object.defineProperty(globalThis,'BroadcastChannel',{value:class{
    constructor(){channels.add(this);}postMessage(data){for(const c of channels)if(c!==this)c.onmessage?.({data});}close(){channels.delete(this);}
  },configurable:true});
  globalThis.addEventListener=(name,fn,options)=>{if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push({fn,once:options?.once});};
  globalThis.removeEventListener=(name,fn)=>listeners.set(name,(listeners.get(name)||[]).filter(x=>x.fn!==fn));
  const emit=(name,event={})=>{for(const entry of [...(listeners.get(name)||[])]){entry.fn(event);if(entry.once)globalThis.removeEventListener(name,entry.fn);}};
  return {records,controls,emit};
}
const opts={createGame,dispatch,validateSave};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const key='riverbend.clinic.v03.snapshot';

test('QA-P01 real campaign invalid import preserves current facts and disk snapshot',async()=>{
  const env=environment();const p=await createPersistence(opts);
  try{
    assert.equal((await p.importProgress(JSON.stringify(client()))).accepted,true);
    const before=JSON.stringify(p.getState()),disk=env.records.get(key);
    const invalid=JSON.parse(before);invalid.attempts[invalid.activeAttemptId].cables[0].fromPortId='missing.port';
    assert.equal((await p.importProgress(JSON.stringify(invalid))).accepted,false);
    assert.equal(JSON.stringify(p.getState()),before);
    assert.equal(env.records.get(key),disk);
  }finally{p.dispose();await tick();}
});

test('QA-P02 storage write denial after an earlier save retains exportable current work',async()=>{
  const env=environment();const p=await createPersistence(opts);
  try{
    env.controls.failWrites=true;
    const result=await p.send({type:'RUN_PROBE',testId:'all'});
    assert.equal(result.accepted,true);
    assert.equal(p.getStatus().mode,'memory');
    assert.match(p.getStatus().label,/not saved|manual/i);
    assert.equal(validateSave(p.getState()).valid,true);
    assert.ok(createEvidence(p.getState()).json.recordedObservations.length>0);
  }finally{p.dispose();await tick();}
});

test('QA-P03 storage read denial after an earlier save falls back to memory, not false conflict',async()=>{
  const env=environment();const p=await createPersistence(opts);
  try{
    assert.equal(p.getStatus().mode,'saved');
    const before=p.getState().revision;
    env.controls.failReads=true;
    const result=await p.send({type:'RUN_PROBE',testId:'all'});
    assert.equal(result.accepted,true,'Unavailable storage must not masquerade as a different writer.');
    assert.ok(p.getState().revision>before);
    assert.equal(p.getStatus().mode,'memory');
    assert.equal(validateSave(p.getState()).valid,true);
  }finally{p.dispose();await tick();}
});

test('QA-P04 page lifecycle lock release cannot leave later unsaved work labelled Saved',async()=>{
  const env=environment();const p=await createPersistence(opts);
  try{
    env.emit('pagehide',{persisted:true});await tick();
    env.emit('pageshow',{persisted:true});await tick();
    const result=await p.send({type:'RUN_PROBE',testId:'all'});
    if(result.accepted){
      const disk=JSON.parse(env.records.get(key)).state;
      const persisted=disk.revision===p.getState().revision;
      assert.ok(persisted||p.getStatus().mode!=='saved','Write lock was released; a new mutation was not persisted but still says Saved.');
    }else{
      assert.match(p.getStatus().mode,/readonly|memory|error|starting/);
    }
  }finally{p.dispose();await tick();}
});

test('QA-P05 reimporting a valid settled campaign replaces rather than adds its wallet',async()=>{
  environment();const p=await createPersistence(opts);
  try{
    let g=act(client(),'REQUEST_HANDOVER');g=act(g,'SETTLE_CONTRACT');
    const raw=JSON.stringify(g);
    for(let i=0;i<3;i++){
      assert.equal((await p.importProgress(raw)).accepted,true);
      assert.equal((await p.send({type:'SETTLE_CONTRACT'})).accepted,true);
      assert.equal(p.getState().wallet,120);
      assert.equal(p.getState().settlements.length,1);
    }
  }finally{p.dispose();await tick();}
});

test('QA-P06 failed removal must not claim shared-device progress was cleared',async()=>{
  const env=environment();const p=await createPersistence(opts);
  try{
    assert.equal((await p.importProgress(JSON.stringify(client()))).accepted,true);
    const disk=env.records.get(key);
    env.controls.failWrites=true;
    const result=await p.clear();
    assert.equal(env.records.get(key),disk);
    assert.equal(result.accepted,false,'The saved client campaign remains on disk; clear must not claim success.');
    assert.match(result.message,/could not|unable|unavailable|not cleared|failed/i);
  }finally{p.dispose();await tick();}
});

test('QA-P07 import during asynchronous writer reconnection cannot be silently overwritten',async()=>{
  const env=environment();const p=await createPersistence(opts);let grant;
  try{
    env.emit('pagehide',{persisted:true});await tick();
    env.controls.beforeLock=new Promise(resolve=>{grant=resolve;});
    env.emit('pageshow',{persisted:true});
    assert.equal(p.getStatus().mode,'starting');
    const imported=client();
    const pending=p.importProgress(JSON.stringify(imported));
    grant();env.controls.beforeLock=null;
    const result=await pending;await tick();
    if(result.accepted)assert.equal(p.getState().campaignId,imported.campaignId,'An acknowledged whole-state import was lost when the older disk snapshot reloaded.');
    else assert.match(result.message,/reconnect|ready|wait|retry|control/i);
    assert.equal(validateSave(p.getState()).valid,true);
  }finally{grant?.();p.dispose();await tick();}
});
