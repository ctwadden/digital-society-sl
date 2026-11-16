import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraftStore,draftRescueText} from '../../dist/drafts.js';

const view=(campaignId='campaign.a')=>({campaignId,attempt:{id:'attempt.0001'}});
const words=text=>({text,oral:false});

test('draft identity separates campaigns with the same attempt and field',()=>{
  const d=createDraftStore();d.put(view(),'explanation','equipment',words('A draft'),words(''));
  assert.equal(d.get(view('campaign.b'),'explanation','equipment'),undefined);
  assert.equal(d.forView(view('campaign.b')).length,0);
  assert.equal(d.snapshot()[0].campaignId,'campaign.a');
});

test('acknowledged saved text is removed and cannot mask later authoritative text',()=>{
  const d=createDraftStore(),entry=d.put(view(),'explanation','repair',words('A'),words(''));
  d.acknowledge(entry,words('A'));
  assert.equal(d.size,0);
  assert.equal(d.get(view(),'explanation','repair'),undefined);
});

test('a newer keystroke survives an older asynchronous acknowledgement',()=>{
  const d=createDraftStore(),first=d.put(view(),'explanation','privacy',words('First'),words(''));
  d.put(view(),'explanation','privacy',words('Second'),words(''));
  d.acknowledge(first,words('First'));
  const pending=d.get(view(),'explanation','privacy');
  assert.deepEqual(pending.value,words('Second'));
  assert.deepEqual(pending.base,words('First'));
  assert.equal(d.canCommit(pending,words('First')),true);
});

test('a different saved explanation blocks automatic stale-draft overwrite',()=>{
  const d=createDraftStore(),entry=d.put(view(),'explanation','repair',words('local'),words('original'));
  assert.equal(d.canCommit(entry,words('other tab')),false);
  assert.equal(d.canCommit(entry,words('original')),true);
});

test('returning the editor to current saved values removes the unsaved draft',()=>{
  const d=createDraftStore();d.put(view(),'explanation','limitations',words('draft'),words('saved'));
  d.put(view(),'explanation','limitations',words('saved'),words('saved'));
  assert.equal(d.size,0);
});

test('rescue export labels explanation and configuration as unapplied with origin',()=>{
  const d=createDraftStore();d.put(view(),'explanation','privacy',words('Keep my own sentence.'),words(''));
  d.put(view(),'configuration','device.1',{address:'10.0.0.42',mask:'255.255.255.0'},{address:'10.0.0.2',mask:'255.255.255.0'});
  const text=draftRescueText(d.snapshot());
  assert.match(text,/UNAPPLIED \/ UNSUBMITTED — NOT SIMULATION EVIDENCE/);
  assert.match(text,/Campaign: campaign.a/);assert.match(text,/Attempt: attempt.0001/);
  assert.match(text,/Keep my own sentence\./);assert.match(text,/IPv4 address draft: 10.0.0.42/);
  assert.equal(d.size,2);
});
