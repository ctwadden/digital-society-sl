/** Independent 0.6 QA. Real engine and UI handlers; DOM/geometry/storage/download
 * substitutes are explicit. These checks do not establish browser layout,
 * assistive-technology, published-host, school-device or novice usability. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,derive,dispatch,createEvidence,validateSave} from '../../dist/engine.js';
import {mountUI} from '../../dist/ui.js';
import {act,device,connect,provision,client} from '../simulation/fixtures.js';

const copy=x=>JSON.parse(JSON.stringify(x));
const fresh=()=>createGame({guidedIntro:true,campaignId:'campaign.qa06.independent'});
const current=g=>g.attempts[g.activeAttemptId];
const lesson=g=>derive(g).guidedConnection;
const probe=g=>act(g,'RUN_PROBE',{testId:'reception'});
function valid(g){const result=validateSave(g);assert.equal(result.valid,true,result.error);return result.state;}
function rejected(g,type,rest={},code){const before=copy(g),r=dispatch(g,{type,...rest});assert.equal(r.accepted,false);if(code)assert.equal(r.code,code);assert.equal(r.state,g);assert.deepEqual(g,before);return r;}
function cableAction(g,portNumber=4){const r=device(g,'role.reception'),s=device(g,'infra.switch');return {fromDeviceId:r.id,fromPortId:r.ports.find(p=>p.medium==='ethernet').id,toDeviceId:s.id,toPortId:s.ports.filter(p=>p.medium==='ethernet')[portNumber-1].id};}
function firstPass(g=fresh()){return probe(connect(g,'role.reception',4));}
function observeUnplug(g=firstPass()) {g=act(g,'DISCONNECT_CABLE',{cableId:lesson(g).suggestedDisconnectCableId});return probe(g);}
function restored(g=observeUnplug()){return probe(connect(g,'role.reception',2));}
function explained(g=restored(),oral=false){return act(g,'SAVE_EXPLANATION',{key:'repair',text:oral?'':'The missing cable broke the physical path. I connected reception to a free switch socket and the new booking test passed. An IP change alone would not replace that link.',oral});}
function consulted(g,sectionId='guide.addressing-diagnosis'){const q=derive(g).guideQuotes.find(q=>q.sectionId===sectionId);return act(g,'GUIDE_CONSULT',{sectionId,quoteToken:q.quoteToken});}

test('QA06-E01 prepared equipment has one real missing link; presentation and premature actions cannot award completion',()=>{
  const g=fresh(),v=derive(g);
  assert.equal(v.training.kind,'guided-connection');assert.equal(v.devices.length,3);assert.equal(v.cables.length,1);
  assert.ok(v.devices.every(d=>d.powered));assert.equal(v.serverEnabled,true);assert.equal(lesson(g).phase,'connect');
  assert.match(createEvidence(g).text,/Current access policy \(initially prepared by Jo\)/);assert.doesNotMatch(createEvidence(g).text,/Chosen access policy/);
  for(const type of ['FINISH_GUIDED_CONNECTION','TRAINING_NEXT','TRAINING_DEMO','REQUEST_HANDOVER','SETTLE_CONTRACT'])rejected(g,type);
  const tested=probe(g);assert.equal(lesson(tested).currentObservation.code,'PORT_DISCONNECTED');assert.equal(lesson(tested).firstPass,null);
  const written=act(tested,'SAVE_EXPLANATION',{key:'repair',text:'Everything works.',oral:false});
  assert.equal(lesson(written).canFinish,false);assert.equal(written.wallet,0);assert.deepEqual(written.training.history,[]);valid(written);
});

test('QA06-E02 every free switch socket works; occupied, nonexistent and foreign endpoint choices fail without mutation',()=>{
  for(const portNumber of [2,3,4]){
    let g=fresh();const actual=cableAction(g,portNumber);g=act(g,'CONNECT_PORTS',actual);
    assert.equal(lesson(g).firstPass,null,'a cable alone is not a service observation');g=probe(g);
    assert.equal(lesson(g).currentObservation.pass,true);assert.equal(lesson(g).phase,'experiment');
    assert.ok(lesson(g).currentObservation.pathIds.includes(derive(g).cables.at(-1).id));valid(g);
  }
  const g=fresh();rejected(g,'CONNECT_PORTS',cableAction(g,1),'PORT_OCCUPIED');
  rejected(g,'CONNECT_PORTS',{...cableAction(g),toPortId:device(g,'infra.switch').id+'.eth99'},'PORT_UNKNOWN');
  rejected(g,'CONNECT_PORTS',{...cableAction(g),toPortId:device(g,'role.reception').ports[0].id},'PORT_UNKNOWN');
});

test('QA06-E03 addressing and missing-link diagnoses remain distinct; addresses cannot mend an unplugged path',()=>{
  let g=connect(fresh(),'role.reception',3),id=device(g,'role.reception').id;
  g=act(g,'SET_STATIC_ADDRESS',{deviceId:id,address:'192.168.60.20',mask:'255.255.255.0'});g=probe(g);
  assert.equal(lesson(g).currentObservation.code,'ADDRESS_WRONG_SUBNET');assert.equal(lesson(g).firstPass,null);
  g=act(g,'SET_STATIC_ADDRESS',{deviceId:id,address:'192.168.50.201',mask:'255.255.255.0'});g=probe(g);
  assert.equal(lesson(g).currentObservation.pass,true);g=observeUnplug(g);
  assert.equal(lesson(g).experimentOutcome,'missing-path');assert.equal(lesson(g).currentObservation.code,'PORT_DISCONNECTED');
  g=act(g,'SET_STATIC_ADDRESS',{deviceId:id,address:'192.168.50.202',mask:'255.255.255.0'});g=probe(g);
  assert.equal(lesson(g).currentObservation.code,'PORT_DISCONNECTED');rejected(g,'FINISH_GUIDED_CONNECTION');
  g=restored(g);assert.equal(lesson(g).phase,'reflect');assert.equal(lesson(g).currentObservation.pass,true);valid(g);
});

test('QA06-E04 unplug, failure, repair and fresh retest retain ordered evidence; stale passes and early reflection cannot finish',()=>{
  let g=firstPass();const original=lesson(g).firstPass;
  g=act(g,'SAVE_EXPLANATION',{key:'repair',text:'A prediction before the experiment.',oral:false});
  g=act(g,'DISCONNECT_CABLE',{cableId:lesson(g).suggestedDisconnectCableId});
  assert.equal(lesson(g).currentObservation,null);assert.equal(lesson(g).phase,'test-disconnected');rejected(g,'FINISH_GUIDED_CONNECTION');
  g=probe(g);assert.equal(lesson(g).experimentObservation.code,'PORT_DISCONNECTED');g=connect(g,'role.reception',2);
  assert.equal(lesson(g).phase,'retest');assert.equal(lesson(g).passingRetest,null);rejected(g,'FINISH_GUIDED_CONNECTION');
  g=probe(g);assert.equal(lesson(g).phase,'reflect');assert.equal(lesson(g).explanation.text,'A prediction before the experiment.');assert.equal(lesson(g).canFinish,false);
  g=explained(g);assert.equal(lesson(g).canFinish,true);assert.equal(lesson(g).firstPass.id,original.id);
  g=act(g,'POWER_DEVICE',{deviceId:device(g,'infra.switch').id,on:false});assert.equal(lesson(g).canFinish,false);
  g=probe(g);assert.equal(lesson(g).currentObservation.code,'SWITCH_OFF');g=act(g,'POWER_DEVICE',{deviceId:device(g,'infra.switch').id,on:true});g=probe(g);
  assert.equal(lesson(g).canFinish,false,'the old explanation is tied to an earlier configuration');g=explained(g);valid(g);
});

test('QA06-E05 another real route stays passing after unplug and exports no invented failed test or repair',()=>{
  let g=provision(fresh(),'role.reception','laptop');
  g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.reception').id,kind:'ethernet-adapter'});
  g=act(g,'PLACE_DEVICE',{deviceId:device(g,'role.reception').id,locationId:'location.exam-a'});
  g=provision(g,'infra.ap','access-point');g=connect(g,'infra.ap',3);
  g=act(g,'ASSOCIATE_WIFI',{deviceId:device(g,'role.reception').id,apDeviceId:device(g,'infra.ap').id});
  g=firstPass(g);const disconnected=lesson(g).suggestedDisconnectCableId;g=observeUnplug(g);
  const p=lesson(g);assert.equal(p.experimentOutcome,'alternate-path');assert.equal(p.experimentObservation.pass,true);
  assert.ok(!p.experimentObservation.pathIds.includes(disconnected));assert.ok(p.experimentObservation.pathIds.some(id=>id.endsWith('.wifi0')));
  assert.equal(p.reconnection,null);assert.equal(p.phase,'reflect');
  g=act(g,'SAVE_EXPLANATION',{key:'repair',text:'Bookings continued through the laptop’s Wi-Fi association, the access point and its switch uplink. Removing one cable did not remove every path.',oral:false});
  assert.equal(lesson(g).canFinish,true);assert.match(createEvidence(g).json.teacherOverview.repairSequence.change,/No repair was required/);valid(g);
});

test('QA06-E06 finishing records guided evidence without an independent checkpoint, client fee or adjudicated explanation',()=>{
  let g=explained(restored(),true);const guidedId=g.activeAttemptId;g=act(g,'FINISH_GUIDED_CONNECTION');
  assert.equal(derive(g).training.kind,'bootcamp');assert.equal(derive(g).training.stationIndex,0);assert.equal(derive(g).training.phase,'practice');
  assert.equal(derive(g).guidedConnection,null);assert.equal(g.wallet,0);assert.deepEqual(g.training.completed,[]);assert.deepEqual(g.training.history,[]);
  const e=createEvidence(g);assert.equal(e.json.guidedConnectionHistory[0].attemptId,guidedId);assert.equal(e.json.guidedConnectionHistory[0].independentMastery,false);
  assert.equal(e.json.guidedConnectionHistory[0].finished,true);assert.equal(e.json.teacherOverview.oralPending[0].attemptId,guidedId);
  assert.match(e.text,/Oral.*PENDING|oral.*pending/i);assert.match(e.text,/teacher review|teacher judgement/i);valid(g);
});

test('QA06-E07 client work, drafts already saved, guide costs and return targets survive repeated guided retries and campaign compaction',()=>{
  let g=consulted(client({tests:false}));g=act(g,'SAVE_EXPLANATION',{key:'repair',text:'My client explanation stays in its own attempt.',oral:false});
  const id=g.activeAttemptId,before=copy(current(g)),contract=copy(g.contract),wallet=g.wallet;
  g=act(g,'START_GUIDED_CONNECTION');
  for(let i=0;i<18;i++){g=consulted(g);g=act(g,i%2?'TRAINING_RETRY':'RESTART_ACTIVE_ATTEMPT');assert.equal(lesson(g).returnAttemptId,id);valid(g);}
  assert.equal(g.historyCompacted,true);assert.deepEqual(g.attempts[id],before);assert.deepEqual(g.contract,contract);assert.equal(g.wallet,wallet);
  g=firstPass(g);g=observeUnplug(g);g=restored(g);g=explained(g);g=act(g,'FINISH_GUIDED_CONNECTION');
  assert.equal(g.activeAttemptId,id);assert.deepEqual(current(g),before);assert.deepEqual(g.contract,contract);assert.equal(g.wallet,wallet);valid(g);
  g=act(g,'START_GUIDED_CONNECTION');g=act(g,'RETURN_FROM_GUIDED_CONNECTION');assert.equal(g.activeAttemptId,id);assert.deepEqual(current(g),before);
});

test('QA06-E08 observation and event compaction preserve explanation, experiment and completed guided evidence',()=>{
  let g=explained();const id=g.activeAttemptId,proof=copy(lesson(g));
  for(let i=0;i<430;i++)g=probe(g);
  assert.equal(current(g).historyCompacted,true);assert.equal(lesson(g).canFinish,true);valid(g);
  assert.equal(lesson(g).experimentObservation.id,proof.experimentObservation.id);assert.equal(lesson(g).firstPass.id,proof.firstPass.id);
  g=act(g,'FINISH_GUIDED_CONNECTION');
  for(let i=0;i<18;i++)g=act(g,'TRAINING_RETRY');
  const e=createEvidence(valid(g));assert.equal(e.json.guidedConnectionHistory[0].attemptId,id);assert.equal(e.json.guidedConnectionHistory[0].canFinish,true);
  assert.match(e.text,/missing cable broke the physical path/);
});

test('QA06-E09 truncated, malformed and contradictory guided provenance is rejected without touching the supplied state',()=>{
  const base=explained(),before=copy(base);
  const attacks=[
    g=>{current(g).guidedConnection.setup=null;},
    g=>{current(g).guidedConnection.setupEventIds.pop();},
    g=>{current(g).guidedConnection.firstConnection.toPortId='invented.eth1';},
    g=>{current(g).guidedConnection.firstPassWitness.devices[device(g,'role.reception').id].address='192.168.99.20';},
    g=>{current(g).guidedConnection.experimentObservationId=current(g).guidedConnection.firstPassId;},
    g=>{current(g).guidedConnection.experimentWitness.cables=copy(current(g).guidedConnection.beforeExperimentWitness.cables);},
    g=>{current(g).guidedConnection.explanationObservationId=current(g).guidedConnection.firstPassId;},
    g=>{current(g).guidedConnection.returnAttemptId='attempt.9999';},
    g=>{current(g).guidedConnection.finishedEventId=current(g).guidedConnection.startEventId;},
    g=>{const o=current(g).observations.find(o=>o.id===current(g).guidedConnection.experimentObservationId);o.pass=true;o.code='SERVICE_AVAILABLE';},
    g=>{current(g).events.find(e=>e.id===current(g).guidedConnection.firstConnection.eventId).origin='trainer-demo';},
  ];
  for(const attack of attacks){const g=copy(base);attack(g);const unchanged=copy(g);const r=validateSave(g);assert.equal(r.valid,false,attack.toString());assert.deepEqual(g,unchanged);}
  for(const raw of [JSON.stringify(base).slice(0,-8),'null','[]','{"constructor":{}}',JSON.stringify(createEvidence(base).json)])assert.equal(validateSave(raw).valid,false);
  assert.deepEqual(base,before);valid(base);
});

test('QA06-E10 the actual saved 0.5 delivery survives import, guided help, return and settlement replay unchanged',()=>{
  const raw=readFileSync(new URL('../../qa/browser-evidence/first-play-0.5/complete-progress.json',import.meta.url),'utf8');
  let g=valid(JSON.parse(raw));assert.equal(g.contract.phase,'settled');
  const id=g.activeAttemptId,delivery=copy(g.contract.delivery),settlements=copy(g.settlements),wallet=g.wallet;
  g=act(g,'START_GUIDED_CONNECTION');g=explained(restored(observeUnplug(firstPass(g))));g=act(g,'FINISH_GUIDED_CONNECTION');
  assert.equal(g.activeAttemptId,id);assert.deepEqual(g.contract.delivery,delivery);assert.deepEqual(g.settlements,settlements);assert.equal(g.wallet,wallet);
  g=act(g,'SETTLE_CONTRACT');assert.equal(g.wallet,wallet);assert.deepEqual(g.contract.delivery,delivery);valid(g);
});

test('QA06-E11 cable milestone endpoints must agree with the causal network witness, not only a matching edited event',()=>{
  const attacks=[
    ['first connection',firstPass(),g=>{const a=current(g),c=a.guidedConnection.firstConnection;c.toPortId=c.toPortId.replace(/eth4$/,'eth2');a.events.find(e=>e.id===c.eventId).payload.toPortId=c.toPortId;}],
    ['disconnection',observeUnplug(),g=>{const a=current(g),c=a.guidedConnection.disconnection;c.toPortId=c.toPortId.replace(/eth4$/,'eth2');a.events.find(e=>e.id===c.eventId).payload.toPortId=c.toPortId;}],
    ['repair connection',explained(),g=>{const p=lesson(g);current(g).events.find(e=>e.id===p.reconnection.eventId).payload.toPortId=p.reconnection.toPortId.replace(/eth2$/,'eth3');}]
  ];
  const wronglyAccepted=[];
  for(const [name,g,alter]of attacks){valid(g);alter(g);if(validateSave(g).valid)wronglyAccepted.push(name);}
  assert.deepEqual(wronglyAccepted,[],'Contradictory cable claims were accepted despite unchanged causal witnesses');
});

// A minimal substitute DOM drives the actual delegated UI renderer and handlers.
// Browser focus, layout and native FormData behaviour are tested by the lead.
globalThis.document={activeElement:null};
globalThis.window={addEventListener(){},removeEventListener(){}};
globalThis.requestAnimationFrame=fn=>fn();
globalThis.CSS={escape:x=>x};
const NativeFormData=globalThis.FormData;
globalThis.FormData=class extends NativeFormData{constructor(form){super();for(const [k,v]of Object.entries(form?.fields||{}))this.append(k,v);}};
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function element(){return {innerHTML:'',dataset:{},hidden:false,disabled:false,classList:{toggle(){}},setAttribute(){},removeAttribute(){},matches(){return false},focus(){},scrollIntoView(){},querySelector(){return null},querySelectorAll(){return [];}};}
function uiHarness(initial,{renderFromCallbacks=false}={}){
  let game=initial,storageMode='saved';const regions=new Map(),other=new Map(),handlers={},sent=[],rescues=[],focusEvents=[];const root=element(),layer=element();
  const map={getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),querySelector:s=>s==='.cable-layer'?layer:null,querySelectorAll:()=>[...(regions.get('scene')?.innerHTML||'').matchAll(/data-port-id="([^"]+)"/g)].map((m,i)=>({dataset:{portId:m[1]},getBoundingClientRect:()=>({left:30+(i%7)*90,top:80+Math.floor(i/7)*170,width:25,height:18})}))};
  root.contains=()=>true;
  root.querySelector=s=>{const name=s.match(/^\[data-region="([^"]+)"\]$/)?.[1];if(name){if(!regions.has(name)){const e=element();if(name==='scene')e.querySelector=q=>q==='.scene-map'&&/class="scene-map\b/.test(e.innerHTML)?map:null;if(name==='task')e.querySelector=q=>{if(q!=='#current-task-title'||!/id=['"]current-task-title['"]/.test(e.innerHTML))return null;const heading=element();heading.focus=options=>focusEvents.push({selector:q,attemptId:game.activeAttemptId,options});return heading;};regions.set(name,e);}return regions.get(name);}if(!other.has(s))other.set(s,element());return other.get(s);};
  root.addEventListener=(name,fn)=>handlers[name]=fn;root.removeEventListener=name=>delete handlers[name];
  const blocked=()=>storageMode==='readonly';
  const send=async action=>{sent.push(action);if(blocked())return {accepted:false,message:'Another tab owns this progress.'};const r=dispatch(game,action);if(r.accepted){game=r.state;if(renderFromCallbacks)ui.render({force:true});}return r;};
  const ui=mountUI(root,{getView:()=>derive(game),send,getEvidence:()=>createEvidence(game),getStorageStatus:()=>({mode:storageMode,label:blocked()?'Another tab has control':'Saved locally',detail:'Node substitute',canTakeControl:blocked()}),onExport:async()=>({accepted:true}),onExportDraft:async value=>{rescues.push(value);return {accepted:true};},onImport:async file=>{if(blocked())return {accepted:false};const r=validateSave(await file.text());if(r.valid)game=r.state;return {accepted:r.valid,message:r.error};},onReset:()=>send({type:'TRAINING_RETRY'}),onClear:async()=>{if(blocked())return {accepted:false};game=fresh();if(renderFromCallbacks)ui.render({force:true});return {accepted:true};},onTakeControl:async()=>{storageMode='saved';return {accepted:true};}});
  return {ui,sent,rescues,layer,focusEvents,get game(){return game;},set game(v){game=v;ui.render({force:true});},set storageMode(v){storageMode=v;ui.render({force:true});},html:name=>regions.get(name)?.innerHTML||'',node:s=>root.querySelector(s),async click(action,attrs={}){handlers.click({target:{closest:()=>({dataset:{action,...attrs},disabled:false})}});await tick();await tick();},input(data,value){handlers.input({target:{dataset:data,value}});},change(data,value,checked=false){handlers.change({target:{dataset:data,value,checked}});},async submit(form,fields){const target={dataset:{form},fields};await handlers.submit({target:{closest:()=>target},preventDefault(){}});await tick();},destroy:()=>ui.destroy()};
}
const selectedSceneDevices=h=>[...h.html('scene').matchAll(/<button\b[^>]*>/g)].map(m=>m[0]).filter(tag=>tag.includes('data-action="select-device"')&&tag.includes('aria-pressed="true"')).map(tag=>tag.match(/data-device="([^"]+)"/)[1]);

test('QA06-U01 the real non-drag handler connects the selected actual free ports, visibly traces, probes, unplugs and repairs',async()=>{
  const h=uiHarness(fresh());try{
    assert.match(h.html('task'),/Jo|field mentor/);assert.match(h.html('task'),/Find reception’s port/);assert.equal((h.html('task').match(/<li>/g)||[]).length,2);
    assert.deepEqual(selectedSceneDevices(h),[lesson(h.game).receptionDeviceId]);
    const before=copy(h.game);await h.click('guided-find-port');assert.deepEqual(h.game,before);assert.equal(h.sent.length,0);
    assert.match(h.html('task'),/id='guided-from-port'/);assert.match(h.html('task'),/id='guided-to-port'/);
    const actual=cableAction(h.game,3);await h.submit('guided-connect',actual);
    assert.deepEqual(h.sent.at(-1),{type:'CONNECT_PORTS',...actual});assert.equal(lesson(h.game).phase,'test');assert.equal(lesson(h.game).firstPass,null);
    assert.match(h.html('task'),/Test reception bookings/);assert.match(h.layer.innerHTML,/path|polyline/);
    await h.click('guided-probe');assert.equal(lesson(h.game).phase,'experiment');
    const cable=lesson(h.game).suggestedDisconnectCableId;const checked=copy(h.game);await h.click('guided-experiment');assert.deepEqual(h.game,checked);
    assert.match(h.html('task'),/Unplug this cable/);await h.click('guided-unplug',{cable});assert.equal(lesson(h.game).phase,'test-disconnected');
    await h.click('guided-probe');assert.equal(lesson(h.game).currentObservation.code,'PORT_DISCONNECTED');assert.match(h.html('task'),/Reconnect ports/);
    await h.submit('guided-connect',cableAction(h.game,4));assert.equal(lesson(h.game).phase,'retest');await h.click('guided-probe');assert.equal(lesson(h.game).phase,'reflect');
    assert.match(h.html('scene'),/Trainer-prepared equipment · connect, test and explain/);assert.doesNotMatch(h.html('scene'),/one missing reception cable/);
    h.input({explanation:'repair'},'The first service test passed; unplugging the physical path stopped bookings. Reconnecting and retesting restored service.');
    await h.click('guided-save-explanation');assert.equal(lesson(h.game).canFinish,true);assert.match(h.html('task'),/Start independent practice/);
    await h.click('guided-finish');assert.equal(derive(h.game).training.kind,'bootcamp');assert.deepEqual(h.game.training.history,[]);valid(h.game);
  }finally{h.destroy();}
});

test('QA06-U02 current guided instruction stays visible with tools; unexpected addressing errors route to actual inspection without fake success',async()=>{
  let g=connect(fresh(),'role.reception',2);g=act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.reception').id,address:'192.168.60.99',mask:'255.255.255.0'});
  const h=uiHarness(g);try{
    await h.click('guided-probe');assert.equal(lesson(h.game).currentObservation.code,'ADDRESS_WRONG_SUBNET');assert.match(h.html('task'),/Follow the actual diagnostic/);
    await h.click('guided-inspect-fault');assert.equal(h.node('[data-toolbox]').hidden,false);assert.equal(h.node('[data-region="task"]').hidden,false);
    assert.match(h.html('task'),/Follow the actual diagnostic/);assert.match(h.html('tool'),/IPv4|address/i);assert.equal(lesson(h.game).canFinish,false);
    await h.click('guided-finish');assert.equal(derive(h.game).training.kind,'guided-connection');assert.deepEqual(h.game.training.history,[]);
  }finally{h.destroy();}
});

test('QA06-U03 unsaved client explanation flushes to its source; guided reflection is isolated and readonly drafts cannot become evidence',async()=>{
  const h=uiHarness(client({tests:false}));try{
    const sourceId=h.game.activeAttemptId;h.input({explanation:'repair'},'Client text still being edited.');await h.click('start-guided');
    assert.equal(lesson(h.game).returnAttemptId,sourceId);assert.equal(h.game.attempts[sourceId].explanations.repair.text,'Client text still being edited.');assert.equal(lesson(h.game).explanation.text,'');
    h.game=restored(observeUnplug(firstPass(h.game)));h.input({explanation:'repair'},'Unsent guided reflection.');h.storageMode='readonly';
    await h.click('guided-save-explanation');assert.equal(lesson(h.game).explanation.text,'');assert.equal(lesson(h.game).canFinish,false);
    await h.click('export-draft');assert.equal(h.rescues.length,1);assert.match(h.rescues[0].text,/Unsent guided reflection/);
    h.storageMode='saved';await h.click('guided-save-explanation');assert.equal(lesson(h.game).explanation.text,'Unsent guided reflection.');await h.click('guided-return');
    assert.equal(h.game.activeAttemptId,sourceId);assert.equal(current(h.game).explanations.repair.text,'Client text still being edited.');valid(h.game);
  }finally{h.destroy();}
});

test('QA06-U04 oral review uses the real change/save handler and remains explicitly pending teacher judgement',async()=>{
  const h=uiHarness(restored());try{
    h.change({oral:'repair'},'',true);await h.click('guided-save-explanation');assert.equal(lesson(h.game).explanation.oral,true);assert.equal(lesson(h.game).canFinish,true);
    assert.match(h.html('task'),/oral explanation is pending a teacher conversation/i);await h.click('guided-finish');assert.equal(createEvidence(h.game).json.teacherOverview.oralPending.length,1);valid(h.game);
  }finally{h.destroy();}
});

test('QA06-U05 every completed-lesson return control records completion before returning to the saved client',async()=>{
  let g=client({tests:false});const sourceId=g.activeAttemptId;g=act(g,'START_GUIDED_CONNECTION');g=explained(restored(observeUnplug(firstPass(g))));
  // The real application may render inside its state callback before the UI's
  // replacement operation resumes. Preserve that ordering in this regression.
  const guidedId=g.activeAttemptId,h=uiHarness(g,{renderFromCallbacks:true});try{
    assert.equal(lesson(h.game).canFinish,true);
    assert.equal((h.html('task').match(/data-action="guided-finish"/g)||[]).length,1);
    assert.doesNotMatch(h.html('task'),/data-action="guided-return"/,'a completion-looking secondary return must not bypass the retained evidence');
    const notebookReturns=[...h.html('training').matchAll(/data-action="(guided-finish|guided-return)"/g)].map(m=>m[1]);
    assert.deepEqual(notebookReturns,['guided-finish']);
    await h.click(notebookReturns[0]);assert.equal(h.game.activeAttemptId,sourceId);assert.ok(h.game.guidedConnectionHistory.includes(guidedId));
    assert.equal(createEvidence(h.game).json.guidedConnectionHistory.find(r=>r.attemptId===guidedId).finished,true);valid(h.game);
    assert.deepEqual(h.focusEvents.at(-1),{selector:'#current-task-title',attemptId:sourceId,options:{preventScroll:true}});
    await h.click('start-guided');assert.equal(lesson(h.game).returnAttemptId,sourceId);
    assert.deepEqual(selectedSceneDevices(h),[lesson(h.game).receptionDeviceId],'starting guided help must retain reception selection after callback and final renders');
    await h.click('guided-return');assert.equal(h.game.activeAttemptId,sourceId);
    await h.click('confirm-clear');assert.equal(derive(h.game).training.kind,'guided-connection');
    assert.deepEqual(selectedSceneDevices(h),[lesson(h.game).receptionDeviceId],'clearing must retain reception selection after callback and final renders');
    assert.deepEqual(h.focusEvents.at(-1),{selector:'#current-task-title',attemptId:h.game.activeAttemptId,options:{preventScroll:true}});
  }finally{h.destroy();}
});
