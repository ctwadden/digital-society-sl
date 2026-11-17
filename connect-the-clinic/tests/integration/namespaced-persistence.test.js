import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersistence} from '../../dist/persistence.js';

test('separate mission namespaces preserve older saves and acquire separate tab locks',async()=>{
  const records=new Map(),held=new Set(),channels=[];
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>records.get(k)??null,setItem:(k,v)=>records.set(k,String(v)),removeItem:k=>records.delete(k)}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,options,callback)=>{if(held.has(name))return callback(null);held.add(name);try{return await callback({name});}finally{held.delete(name);}}}}});
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class{constructor(name){this.name=name;channels.push(this);}postMessage(data){for(const c of channels)if(c!==this&&c.name===this.name)c.onmessage?.({data});}close(){channels.splice(channels.indexOf(this),1);}}});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  const model={createGame:()=>({revision:0,value:0}),dispatch:s=>({state:{revision:s.revision+1,value:s.value+1},accepted:true}),validateSave:raw=>{try{const s=typeof raw==='string'?JSON.parse(raw):raw;return Number.isInteger(s?.value)?{valid:true,state:{...s}}:{valid:false};}catch{return {valid:false};}}};
  const old=await createPersistence(model);
  await old.send({type:'ADD'});
  const oldSnapshot=records.get('riverbend.clinic.v03.snapshot');
  const opening=await createPersistence({...model,namespace:'riverbend.clinic.opening.v1.'});
  assert.equal(old.getStatus().mode,'saved');assert.equal(opening.getStatus().mode,'saved');
  await opening.send({type:'ADD'});await opening.send({type:'ADD'});
  assert.equal(records.get('riverbend.clinic.v03.snapshot'),oldSnapshot);
  assert.equal(opening.getState().value,2);assert.equal(old.getState().value,1);
  const second=await createPersistence({...model,namespace:'riverbend.clinic.opening.v1.'});
  assert.equal(second.getStatus().mode,'readonly');assert.equal((await second.send({type:'ADD'})).accepted,false);
  await opening.clear();
  assert.equal(records.get('riverbend.clinic.v03.snapshot'),oldSnapshot);
  assert.equal(opening.getState().value,0);
  old.dispose();opening.dispose();second.dispose();
});
