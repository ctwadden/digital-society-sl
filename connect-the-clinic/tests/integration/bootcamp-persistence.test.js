import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersistence} from '../../dist/persistence.js';
import {createShift, dispatchShift, deriveShift, validateShiftSave} from '../../dist/opening/engine.js';
import {createProgramme, dispatchProgramme, deriveProgramme, validateProgrammeSave} from '../../dist/opening/programme.js';

const tick = () => new Promise(resolve => setImmediate(resolve));

function browserStorage() {
  const records = new Map(), held = new Set(), channels = [];
  Object.defineProperty(globalThis, 'localStorage', {configurable:true, value:{
    getItem:key => records.get(key) ?? null,
    setItem:(key,value) => records.set(key, String(value)),
    removeItem:key => records.delete(key)
  }});
  Object.defineProperty(globalThis, 'navigator', {configurable:true, value:{locks:{
    request:async (name, options, callback) => {
      if (held.has(name)) return callback(null);
      held.add(name);
      try { return await callback({name}); } finally { held.delete(name); }
    }
  }}});
  Object.defineProperty(globalThis, 'BroadcastChannel', {configurable:true, value:class {
    constructor(name) { this.name=name; channels.push(this); }
    postMessage(data) { for (const c of channels) if (c!==this && c.name===this.name) c.onmessage?.({data}); }
    close() { channels.splice(channels.indexOf(this),1); }
  }});
  globalThis.addEventListener=()=>{};
  globalThis.removeEventListener=()=>{};
  return records;
}

const namespace = 'riverbend.clinic.opening.v1.';
const programmeOptions = () => ({namespace,
  createGame:() => createProgramme({campaignId:'qa.bootcamp.persistence'}),
  dispatch:dispatchProgramme, validateSave:validateProgrammeSave});

test('B5 persisted 0.7 field work migrates without earning training, survives training and read-only tabs', async () => {
  const records = browserStorage();
  const old = await createPersistence({namespace,
    createGame:() => createShift({campaignId:'qa.bootcamp.migration'}),
    dispatch:dispatchShift, validateSave:validateShiftSave});
  assert.equal((await old.send({type:'REVIEW_BRIEF'})).accepted,true);
  const quote = deriveShift(old.getState()).guideQuotes[0];
  assert.equal((await old.send({type:'GUIDE_CONSULT',sectionId:quote.sectionId,quoteToken:quote.quoteToken})).accepted,true);
  const exact='Existing equipment reasoning is preserved.\nNo training completion is implied.';
  assert.equal((await old.send({type:'SAVE_EXPLANATION',key:'equipment',text:exact,oral:false})).accepted,true);
  const before = deriveShift(old.getState());
  const originalSnapshot=records.get(namespace+'snapshot');
  old.dispose(); await tick();

  const current = await createPersistence(programmeOptions());
  assert.equal(current.getStatus().mode,'saved');
  let view=deriveProgramme(current.getState());
  assert.equal(view.screen,'field');
  assert.equal(view.canEnterField,true);
  assert.equal(view.bootcamp.courseComplete,false);
  assert.equal(view.bootcamp.progress.completed,0);
  assert.deepEqual(view.field,before);
  assert.ok([...records.values()].includes(originalSnapshot),'The former save remains as a last-good snapshot.');

  assert.equal((await current.send({type:'OPEN_BOOTCAMP'})).accepted,true);
  assert.equal((await current.send({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit'}})).accepted,true);
  assert.equal((await current.send({type:'BOOT_ACTION',action:{type:'START_DEMO'}})).accepted,true);
  assert.equal((await current.send({type:'BOOT_ACTION',action:{type:'NEXT_DEMO'}})).accepted,true);
  assert.deepEqual(deriveProgramme(current.getState()).field,before);

  const second = await createPersistence(programmeOptions());
  assert.equal(second.getStatus().mode,'readonly');
  const readonlyState=second.getState();
  assert.equal((await second.send({type:'BOOT_ACTION',action:{type:'NEXT_DEMO'}})).accepted,false);
  assert.equal(second.getState(),readonlyState);

  const saved=JSON.stringify(current.getState());
  const intact=current.getState();
  assert.equal((await current.importProgress('{"appId":')).accepted,false);
  assert.equal(current.getState(),intact);
  assert.equal((await current.importProgress(saved)).accepted,true);
  assert.equal((await current.send({type:'ENTER_FIELD'})).accepted,true);
  view=deriveProgramme(current.getState());
  assert.deepEqual(view.field,before);
  assert.equal(view.field.explanations.equipment.text,exact);
  assert.equal(view.field.economy.reserved,5);
  assert.equal(view.bootcamp.progress.completed,0);
  current.dispose(); second.dispose(); await tick();

  const restored=await createPersistence(programmeOptions());
  assert.equal(deriveProgramme(restored.getState()).screen,'field');
  assert.deepEqual(deriveProgramme(restored.getState()).field,before);
  restored.dispose();
});

test('B5 a new programme remains training-only through save and reload until real lesson tasks are completed', async () => {
  browserStorage();
  const first=await createPersistence(programmeOptions());
  assert.equal(deriveProgramme(first.getState()).screen,'apprentice');
  assert.equal((await first.send({type:'ENTER_FIELD'})).accepted,false);
  assert.equal((await first.send({type:'OPEN_BOOTCAMP'})).accepted,true);
  assert.equal((await first.send({type:'BOOT_ACTION',action:{type:'START_LESSON',lessonId:'boot.kit'}})).accepted,true);
  assert.equal((await first.send({type:'BOOT_ACTION',action:{type:'START_PRACTICE'}})).accepted,true);
  const attempt=deriveProgramme(first.getState()).bootcamp.attemptId;
  first.dispose(); await tick();
  const reloaded=await createPersistence(programmeOptions());
  const view=deriveProgramme(reloaded.getState());
  assert.equal(view.bootcamp.attemptId,attempt);
  assert.equal(view.bootcamp.progress.completed,0);
  assert.equal(view.canEnterField,false);
  assert.equal((await reloaded.send({type:'BOOT_ACTION',action:{type:'COMPLETE_LESSON'}})).accepted,false);
  reloaded.dispose();
});
