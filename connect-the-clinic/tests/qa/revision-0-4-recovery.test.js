import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersistence} from '../../dist/persistence.js';
import {createGame,dispatch,derive,validateSave,createEvidence} from '../../dist/engine.js';
import {createDraftStore,draftRescueText} from '../../dist/drafts.js';
import {act,client} from '../simulation/fixtures.js';

// Independent adapter execution in Node. These substitutes do not establish
// real browser Web Locks, file-input, download, focus or school-policy behavior.
const CURRENT='riverbend.clinic.v03.snapshot';
const GOOD='riverbend.clinic.v03.last-good';
const copy=value=>JSON.parse(JSON.stringify(value));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const options={createGame,dispatch,validateSave};
const envelope=(state,stamp='qa-existing')=>JSON.stringify({format:'riverbend-save-envelope-v1',stamp,counter:1,state});
function environment(initial={}){
  const records=new Map(Object.entries(initial)),channels=new Set(),listeners=new Map();
  const controls={denyRemovalOf:null};let lockHeld=false;
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    getItem:key=>records.get(key)??null,
    setItem:(key,value)=>records.set(key,String(value)),
    removeItem(key){if(key===controls.denyRemovalOf)throw Error('Storage removal denied');records.delete(key);}
  }});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(_name,_options,callback)=>{
    if(lockHeld)return callback(null);
    lockHeld=true;try{return await callback({name:'revision-0-4-qa-lock'});}finally{lockHeld=false;}
  }}}});
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class{
    constructor(){channels.add(this);}
    postMessage(data){for(const channel of channels)if(channel!==this)channel.onmessage?.({data});}
    close(){channels.delete(this);}
  }});
  globalThis.addEventListener=(type,callback)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(callback);};
  globalThis.removeEventListener=(type,callback)=>listeners.get(type)?.delete(callback);
  return {records,controls};
}

test('QA04-R01 every rejected import preserves current work, saved snapshot and recovery snapshot',async()=>{
  const env=environment();const store=await createPersistence(options);
  try{
    assert.equal((await store.importProgress(JSON.stringify(client({route:'B'})))).accepted,true);
    assert.equal((await store.send({type:'SAVE_EXPLANATION',key:'repair',text:'Keep this exact current explanation.\nThe cable and address are separate checks.',oral:false})).accepted,true);
    const before=JSON.stringify(store.getState()),saved=env.records.get(CURRENT),backup=env.records.get(GOOD);
    const badDomain=copy(store.getState());
    badDomain.attempts[badDomain.activeAttemptId].cables[0].toPortId='missing.port';
    const badVersion=copy(store.getState());badVersion.schemaVersion=999;
    const missingAttempt=copy(store.getState());delete missingAttempt.attempts[missingAttempt.activeAttemptId];
    const cases=[['malformed JSON','{damaged'],['unsupported version',JSON.stringify(badVersion)],['broken connection reference',JSON.stringify(badDomain)],['missing active attempt',JSON.stringify(missingAttempt)],['oversized file',' '.repeat(1048577)],['wrong root type','[]']];
    for(const [label,raw] of cases){
      const result=await store.importProgress(raw);
      assert.equal(result.accepted,false,label);
      assert.equal(JSON.stringify(store.getState()),before,`${label}: current work was replaced`);
      assert.equal(env.records.get(CURRENT),saved,`${label}: saved snapshot was replaced`);
      assert.equal(env.records.get(GOOD),backup,`${label}: recovery snapshot was replaced`);
    }
  }finally{store.dispose();await tick();}
});

test('QA04-R02 real campaign reload preserves exact reasoning, choices, assistance and import provenance',async()=>{
  const env=environment();let store=await createPersistence(options);
  try{
    let game=client({route:'B',policy:'policy.nurse-also-books'});
    const quote=derive(game).guideQuotes.find(q=>q.sectionId==='guide.addressing-diagnosis');
    game=act(game,'GUIDE_CONSULT',{sectionId:quote.sectionId,quoteToken:quote.quoteToken});
    assert.equal((await store.importProgress(JSON.stringify(game))).accepted,true);
    const reasoning='The nurse can book because the selected roles permit it.\nTeacher review remains pending — café ✓';
    assert.equal((await store.send({type:'SAVE_EXPLANATION',key:'privacy',text:reasoning,oral:true})).accepted,true);
    const exported=JSON.stringify(store.getState()),evidence=createEvidence(store.getState());
    assert.equal(validateSave(exported).valid,true);
    store.dispose();await tick();store=await createPersistence(options);
    assert.equal(store.getStatus().mode,'saved');
    assert.equal(JSON.stringify(store.getState()),exported);
    assert.deepEqual(createEvidence(store.getState()),evidence);
    assert.equal(createEvidence(store.getState()).json.explanations.privacy.text,reasoning);
    assert.equal(store.getState().importProvenance,'manual-file');
    assert.equal(derive(store.getState()).economy.reserved,5);
    assert.deepEqual(JSON.parse(env.records.get(CURRENT)).state,store.getState());
  }finally{store.dispose();await tick();}
});

test('QA04-R03 read-only exports retain recorded state while a stale draft survives takeover separately',async()=>{
  const env=environment();const writer=await createPersistence(options);let observer;
  try{
    assert.equal((await writer.importProgress(JSON.stringify(client()))).accepted,true);
    observer=await createPersistence(options);
    assert.equal(observer.getStatus().mode,'readonly');
    const draftStore=createDraftStore(),oldView=derive(observer.getState());
    const saved=oldView.explanations.repair,base={text:saved.text,oral:saved.oral};
    const typed='Unsubmitted sentence retained exactly.\nA cable repair still needs a current retest.';
    const entry=draftStore.put(oldView,'explanation','repair',{text:typed,oral:true},base);
    const observerBefore=JSON.stringify(observer.getState()),diskBefore=env.records.get(CURRENT),backupBefore=env.records.get(GOOD);
    for(const operation of [()=>observer.send({type:'SAVE_EXPLANATION',key:'repair',text:typed,oral:true}),()=>observer.send({type:'RESTART_ACTIVE_ATTEMPT'}),()=>observer.importProgress(JSON.stringify(createGame())),()=>observer.clear(),()=>observer.recover()]){
      assert.equal((await operation()).accepted,false);
      assert.equal(JSON.stringify(observer.getState()),observerBefore);
      assert.equal(env.records.get(CURRENT),diskBefore);
      assert.equal(env.records.get(GOOD),backupBefore);
    }
    const evidence=createEvidence(observer.getState()),rescue=draftRescueText(draftStore.snapshot());
    assert.equal(evidence.json.explanations.repair.text,base.text);
    assert.equal(evidence.text.includes(typed),false);
    assert.ok(rescue.includes(typed));
    assert.match(rescue,/UNAPPLIED \/ UNSUBMITTED — NOT SIMULATION EVIDENCE/);
    assert.match(rescue,/Oral follow-up requested in draft: yes — not submitted/);
    assert.equal(validateSave(JSON.stringify(observer.getState())).valid,true);
    const otherText='New recorded reasoning from the controlling tab.';
    assert.equal((await writer.send({type:'SAVE_EXPLANATION',key:'repair',text:otherText,oral:false})).accepted,true);
    assert.equal((await observer.takeControl()).accepted,true);
    assert.equal(writer.getStatus().mode,'readonly');
    const latest=derive(observer.getState());
    assert.equal(latest.explanations.repair.text,otherText);
    assert.equal(draftStore.canCommit(entry,{text:latest.explanations.repair.text,oral:latest.explanations.repair.oral}),false);
    assert.equal(draftStore.snapshot()[0].value.text,typed);
    assert.equal(createEvidence(observer.getState()).json.explanations.repair.text,otherText);
    const current=env.records.get(CURRENT);
    assert.equal((await writer.send({type:'SET_PERMISSIONS',policyId:'policy.broad-access'})).accepted,false);
    assert.equal(env.records.get(CURRENT),current);
  }finally{observer?.dispose();writer.dispose();await tick();}
});

test('QA04-R04 interrupted shared-device clear preserves exportable work and reports the remaining backup',async()=>{
  const env=environment({'unrelated.site.key':'keep'});const store=await createPersistence(options);
  try{
    assert.equal((await store.importProgress(JSON.stringify(client()))).accepted,true);
    const before=JSON.stringify(store.getState()),backup=env.records.get(GOOD);
    assert.ok(backup);
    env.controls.denyRemovalOf=GOOD;
    const failed=await store.clear();
    assert.equal(failed.accepted,false);
    assert.equal(env.records.has(CURRENT),false);
    assert.equal(env.records.get(GOOD),backup);
    assert.equal(JSON.stringify(store.getState()),before);
    assert.equal(store.getStatus().mode,'memory');
    assert.match(failed.message,/could not be cleared|may still remain/i);
    assert.equal(validateSave(JSON.stringify(store.getState())).valid,true);
    env.controls.denyRemovalOf=null;
    assert.equal((await store.clear()).accepted,true);
    assert.notEqual(store.getState().campaignId,JSON.parse(before).campaignId);
    assert.equal(env.records.has(GOOD),false);
    assert.equal(env.records.get('unrelated.site.key'),'keep');
    assert.equal(validateSave(store.getState()).valid,true);
  }finally{store.dispose();await tick();}
});

test('QA04-R05 damaged startup snapshot remains untouched until explicit recovery of the real backup',async()=>{
  const backupGame=client({route:'B'}),rawBackup=envelope(backupGame);
  const env=environment({[CURRENT]:'{damaged local snapshot',[GOOD]:rawBackup});
  const store=await createPersistence(options);
  try{
    assert.equal(store.getStatus().mode,'error');
    assert.equal(env.records.get(CURRENT),'{damaged local snapshot');
    assert.equal(env.records.get(GOOD),rawBackup);
    assert.equal((await store.send({type:'RUN_PROBE',testId:'reception'})).accepted,true);
    assert.equal(env.records.get(CURRENT),'{damaged local snapshot');
    assert.equal(env.records.get(GOOD),rawBackup);
    assert.equal((await store.recover()).accepted,true);
    assert.equal(store.getStatus().mode,'saved');
    assert.deepEqual(store.getState(),backupGame);
    assert.deepEqual(JSON.parse(env.records.get(CURRENT)).state,backupGame);
    assert.equal(createEvidence(store.getState()).json.imported,false);
  }finally{store.dispose();await tick();}
});
