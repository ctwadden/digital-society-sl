/**
 * Independent 0.5 presentation integration checks.
 * Real UI renderer/handlers and engine; DOM, geometry, storage and download
 * callbacks are deliberately substituted. These are NOT browser/accessibility
 * or actual-storage observations. The browser walkthrough is recorded separately.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mountUI} from '../../dist/ui.js';
import {createGame,derive,dispatch,createEvidence,validateSave} from '../../dist/engine.js';
import {act,client,connect,device,provision,completeTrainingStage} from '../simulation/fixtures.js';

globalThis.document={activeElement:null};
globalThis.window={addEventListener(){},removeEventListener(){}};
globalThis.requestAnimationFrame=fn=>fn();
globalThis.CSS={escape:value=>value};
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const clone=value=>JSON.parse(JSON.stringify(value));

function element(){
  return {innerHTML:'',dataset:{},hidden:false,disabled:false,classList:{toggle(){}},setAttribute(){},removeAttribute(){},matches(){return false},focus(){},scrollIntoView(){},querySelector(){return null},querySelectorAll(){return []}};
}
function harness(initial){
  let game=initial,storageMode='saved';
  const handlers={},regions=new Map(),other=new Map(),sent=[],imports=[],rescues=[];
  const layer=element();
  const map={getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),querySelector:s=>s==='.cable-layer'?layer:null,querySelectorAll(){
    return [...(regions.get('scene')?.innerHTML||'').matchAll(/data-port-id="([^"]+)"/g)].map((match,i)=>({dataset:{portId:match[1]},getBoundingClientRect:()=>({left:30+(i%7)*90,top:80+Math.floor(i/7)*170,width:25,height:18})}));
  }};
  const root=element();
  root.contains=()=>true;
  root.querySelector=selector=>{
    const name=selector.match(/^\[data-region="([^"]+)"\]$/)?.[1];
    if(name){
      if(!regions.has(name)){const e=element();if(name==='scene')e.querySelector=s=>s==='.scene-map'&&/class="scene-map\b/.test(e.innerHTML)?map:null;regions.set(name,e);}
      return regions.get(name);
    }
    if(!other.has(selector))other.set(selector,element());
    return other.get(selector);
  };
  root.addEventListener=(name,fn)=>handlers[name]=fn;
  root.removeEventListener=name=>delete handlers[name];
  const blocked=()=>storageMode==='readonly'||storageMode==='starting';
  const ui=mountUI(root,{
    getView:()=>derive(game),
    send:async action=>{
      sent.push(action);
      if(blocked())return {accepted:false,message:'Another tab has control. Current work is unchanged.'};
      const r=dispatch(game,action);if(r.accepted)game=r.state;return r;
    },
    getEvidence:()=>createEvidence(game),
    getStorageStatus:()=>({mode:storageMode,label:blocked()?'Another tab has control':'Saved locally',detail:'Deliberate Node test substitute',canTakeControl:blocked()}),
    onExport:async()=>({accepted:true}),
    onExportDraft:async value=>{rescues.push(value);return {accepted:true};},
    onImport:async file=>{
      const raw=await file.text();imports.push(raw);
      if(blocked())return {accepted:false,message:'Another tab has control. Current work is unchanged.'};
      if(file.size>1048576)return {accepted:false,message:'Progress files must be under 1 MiB. Current work is unchanged.'};
      const checked=validateSave(raw);
      if(!checked.valid)return {accepted:false,message:checked.error||'Invalid progress. Current work is unchanged.'};
      game=checked.state;return {accepted:true,message:'Progress imported.'};
    },
    onClear:async()=>{if(blocked())return {accepted:false};game=createGame({campaignId:'campaign.qa05.cleared'});return {accepted:true};},
    onReset:async()=>{if(blocked())return {accepted:false};const r=dispatch(game,{type:derive(game).mode==='training'?'TRAINING_RETRY':'RESTART_ACTIVE_ATTEMPT'});if(r.accepted)game=r.state;return r;},
    onTakeControl:async()=>{storageMode='saved';return {accepted:true};}
  });
  return {
    ui,layer,sent,imports,rescues,
    get game(){return game;},
    set game(value){game=value;ui.render({force:true});},
    set storageMode(value){storageMode=value;ui.render({force:true});},
    html:name=>regions.get(name)?.innerHTML||'',
    node:selector=>root.querySelector(selector),
    async click(action,attrs={}){const control={dataset:{action,...attrs},disabled:false};handlers.click({target:{closest:()=>control}});await tick();await tick();},
    input(attrs,value){handlers.input({target:{dataset:attrs,value}});},
    destroy:()=>ui.destroy()
  };
}
const taskAction=(h,action)=>assert.match(h.html('task'),new RegExp(`data-action="${action}"[^>]*data-task-primary`));
const noSuccess=h=>assert.doesNotMatch(h.html('task'),/Current model checkpoint recorded|RESULT RECORDED/);
const paste=async(h,text)=>{await h.click('paste-backup');h.input({progressPaste:''},text);await h.click('review-paste-import');};
function toStation(index,phase='practice'){
  let g=createGame({campaignId:'campaign.qa05.stations'});
  while(derive(g).training.stationIndex!==index||derive(g).training.phase!==phase){g=completeTrainingStage(g);g=act(g,'TRAINING_NEXT');}
  return g;
}
function receptionReady({kind='desktop',direct=false}={}){
  let g=provision(createGame({campaignId:'campaign.qa05.reception'}),'role.reception',kind);
  if(kind!=='desktop')g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.reception').id,kind:'ethernet-adapter'});
  if(direct){
    const a=device(g,'role.reception'),b=device(g,'role.records');
    g=act(g,'CONNECT_PORTS',{fromDeviceId:a.id,fromPortId:a.ports.find(p=>p.medium==='ethernet').id,toDeviceId:b.id,toPortId:b.ports.find(p=>p.medium==='ethernet').id});
  }else{g=connect(g,'role.records',1);g=connect(g,'role.reception',2);}
  return g;
}

test('QA05-P01 introduction and notebook actions do not create technical or financial progress',async()=>{
  const g=createGame({campaignId:'campaign.qa05.intro'}),before=clone(g),h=harness(g);
  try{
    assert.match(h.html('task'),/data-introduction="arrival"/);
    assert.match(h.html('task'),/Ari|Riverbend/);
    assert.match(h.html('heading'),/field technician/);
    assert.equal(h.node('[data-toolbox]').hidden,true);
    await h.click('meet-mentor');assert.match(h.html('task'),/data-introduction="mentor"/);
    await h.click('begin-first-task');assert.doesNotMatch(h.html('task'),/data-introduction=/);
    assert.equal(h.node('[data-toolbox]').hidden,false);
    assert.match(h.html('tool'),/Job to equip/);
    assert.deepEqual(h.game,before);assert.deepEqual(h.sent,[]);
    await h.click('toggle-notebook');
    assert.equal(h.node('[data-notebook]').hidden,false);
    assert.equal((h.html('brief').match(/data-goal-id=/g)||[]).length,3);
    await h.click('toggle-notebook');assert.equal(h.node('[data-notebook]').hidden,true);
    assert.deepEqual(h.game,before);assert.deepEqual(h.sent,[]);
  }finally{h.destroy();}
});

test('QA05-P02 actual first-station tests control success, stale feedback, broken-link failure and repair',async()=>{
  const h=harness(receptionReady());
  try{
    noSuccess(h);taskAction(h,'probe');
    await h.click('probe',{test:'reception'});
    assert.equal(derive(h.game).training.canAdvance,true);
    taskAction(h,'training-next');assert.match(h.html('task'),/Reception is connected/);
    const c=derive(h.game).cables.find(c=>c.fromDeviceId===device(h.game,'role.reception').id||c.toDeviceId===device(h.game,'role.reception').id);
    h.game=act(h.game,'DISCONNECT_CABLE',{cableId:c.id});
    assert.equal(derive(h.game).diagnostics[0].stale,true);noSuccess(h);
    await h.click('probe',{test:'reception'});
    assert.equal(derive(h.game).diagnostics[0].code,'PORT_DISCONNECTED');
    assert.equal(derive(h.game).training.canAdvance,false);noSuccess(h);taskAction(h,'open-connect');
    h.game=connect(h.game,'role.reception',4);
    noSuccess(h);await h.click('probe',{test:'reception'});
    assert.equal(derive(h.game).training.canAdvance,true);taskAction(h,'training-next');
    await h.click('training-next');
    assert.equal(derive(h.game).training.phase,'transfer');
    assert.doesNotMatch(h.html('task'),/data-introduction=/);noSuccess(h);
  }finally{h.destroy();}
});

test('QA05-P03 permitted adapter and direct topology retain current engine-backed success; wrong IP and power do not',async()=>{
  for(const options of [{kind:'laptop'},{kind:'tablet',direct:true}]){
    const h=harness(receptionReady(options));
    try{
      await h.click('probe',{test:'reception'});
      assert.equal(derive(h.game).training.canAdvance,true);taskAction(h,'training-next');
      const d=device(h.game,'role.reception');
      h.game=act(h.game,'SET_STATIC_ADDRESS',{deviceId:d.id,address:'192.168.60.20',mask:'255.255.255.0'});
      noSuccess(h);await h.click('probe',{test:'reception'});
      assert.equal(derive(h.game).diagnostics[0].code,'ADDRESS_WRONG_SUBNET');noSuccess(h);
      h.game=act(h.game,'SET_STATIC_ADDRESS',{deviceId:d.id,address:'192.168.50.44',mask:'255.255.255.0'});
      await h.click('probe',{test:'reception'});taskAction(h,'training-next');
      h.game=act(h.game,'POWER_DEVICE',{deviceId:device(h.game,'role.records').id,on:false});
      await h.click('probe',{test:'reception'});
      assert.equal(derive(h.game).diagnostics[0].code,'DEVICE_OFF');noSuccess(h);
      assert.match(h.html('task'),new RegExp(`data-device="${device(h.game,'role.records').id.replaceAll('.','\\.')}"`));
      h.game=act(h.game,'POWER_DEVICE',{deviceId:device(h.game,'role.records').id,on:true});
      h.game=act(h.game,'SET_SERVICE_STATE',{enabled:false});
      await h.click('probe',{test:'reception'});
      assert.equal(derive(h.game).diagnostics[0].code,'SERVICE_UNAVAILABLE');noSuccess(h);
      assert.match(h.html('task'),new RegExp(`data-device="${device(h.game,'role.records').id.replaceAll('.','\\.')}"`));
    }finally{h.destroy();}
  }
});

test('QA05-P04 a changed physical fault prompts actual repair evidence and preserves the learner explanation',async()=>{
  const h=harness(toStation(1,'transfer'));
  try{
    taskAction(h,'probe');await h.click('probe',{test:'nurse'});
    assert.equal(derive(h.game).diagnostics[0].code,'PORT_DISCONNECTED');noSuccess(h);
    h.game=act(h.game,'SET_STATIC_ADDRESS',{deviceId:device(h.game,'role.nurse').id,address:'192.168.70.31',mask:'255.255.255.0'});
    await h.click('probe',{test:'nurse'});assert.equal(derive(h.game).diagnostics[0].code,'PORT_DISCONNECTED');
    h.game=connect(h.game,'infra.ap',4);await h.click('probe',{test:'nurse'});
    assert.equal(derive(h.game).training.canAdvance,false);taskAction(h,'open-transfer-reason');
    await h.click('open-transfer-reason');assert.equal(h.node('[data-toolbox]').hidden,false);
    assert.match(h.html('tool'),/data-explanation="repair"/);
    const text='My address was already local. I connected the missing AP uplink; an IP edit cannot replace a physical cable.';
    h.input({explanation:'repair'},text);await h.click('save-explanations');
    assert.equal(derive(h.game).training.canAdvance,true);taskAction(h,'training-next');
    assert.equal(createEvidence(h.game).json.transferEvidence.explanation.text,text);
    assert.match(createEvidence(h.game).text,/does not award an IB grade/);
  }finally{h.destroy();}
});

test('QA05-P05 station-three task controls follow policy, marker journey, access testing and explanation',async()=>{
  const h=harness(toStation(2));
  try{
    taskAction(h,'set-panel');assert.match(h.html('task'),/data-panel="access"/);
    await h.click('set-policy',{policy:'policy.roles-separated'});
    taskAction(h,'set-panel');assert.match(h.html('task'),/data-panel="wearable"/);
    h.game=act(h.game,'RUN_COLLECTION_CHECK');h.game=act(h.game,'RETURN_WEARABLE');
    h.game=act(h.game,'ATTACH_ADAPTER',{deviceId:device(h.game,'role.nurse').id,kind:'sensor-dock'});
    h.game=act(h.game,'HANDOFF_MARKERS');h.game=act(h.game,'UPLOAD_MARKERS');
    assert.match(h.html('task'),/data-action="(?:probe|open-tests)"[^>]*data-task-primary/);
    await h.click('probe',{test:'access'});
    taskAction(h,'open-privacy-reason');
    await h.click('open-privacy-reason');
    assert.match(h.html('tool'),/data-explanation="privacy"/);
    assert.equal((h.html('tool').match(/data-explanation=/g)||[]).length,1,'Station-three practice needs its privacy explanation, not four client-handover forms.');
    assert.doesNotMatch(h.html('tool'),/data-explanation="(?:equipment|repair|limitations)"/);
    assert.doesNotMatch(h.html('tool'),/inherited address fault|Request handover|Settle contract/i);
    h.input({explanation:'privacy'},'The nurse can use the workspace while reception can book. I would reconsider booking rights if follow-up duties changed.');
    await h.click('save-explanations');
    assert.equal(derive(h.game).training.canAdvance,true);taskAction(h,'training-next');
    const ownWords=derive(h.game).explanations.privacy.text;
    await h.click('set-policy',{policy:'policy.nurse-also-books'});
    await h.click('open-privacy-reason');
    assert.equal((h.html('tool').match(/data-explanation=/g)||[]).length,1);
    assert.ok(h.html('tool').includes(ownWords));
    assert.match(h.html('tool'),/data-action="review-context"/);
    assert.equal(derive(h.game).training.checks[3].met,false);
    await h.click('review-context');
    assert.equal(derive(h.game).explanations.privacy.text,ownWords);
    assert.equal(derive(h.game).training.checks[3].met,true);
    await h.click('probe',{test:'access'});
    assert.equal(derive(h.game).training.canAdvance,true);
    await h.click('training-next');
    assert.equal(derive(h.game).training.phase,'transfer');
    h.game=completeTrainingStage(h.game);
    assert.equal(derive(h.game).training.canAdvance,true);
    taskAction(h,'training-next');assert.match(h.html('task'),/Finish bootcamp practice/);
    await h.click('training-next');
    assert.equal(derive(h.game).training.completed,true);taskAction(h,'start-client');
  }finally{h.destroy();}
  const paid=harness(client());
  try{await paid.click('set-panel',{panel:'handover'});assert.equal((paid.html('tool').match(/data-explanation=/g)||[]).length,4,'Client handover still retains all four explanations.');}
  finally{paid.destroy();}
});

test('QA05-P06 genuine 0.4 progress and client/practice/replay modes retain their state without fresh narration',()=>{
  const saved=JSON.parse(readFileSync(new URL('../../qa/browser-evidence/transfer-after-next.json',import.meta.url),'utf8'));
  assert.equal(saved.buildVersion,'0.4.0');
  const checked=validateSave(saved);assert.equal(checked.valid,true,checked.error);
  let paid=client();paid=act(paid,'REQUEST_HANDOVER');paid=act(paid,'SETTLE_CONTRACT');
  const modes=[checked.state,paid,act(paid,'START_CLINIC_PRACTICE'),act(paid,'START_DELIVERED_CONTRACT_PRACTICE'),client({repair:false,markers:false})];
  for(const g of modes){
    const before=clone(g),h=harness(g),v=derive(g);
    try{
      assert.doesNotMatch(h.html('task'),/data-introduction=/);assert.deepEqual(h.game,before);assert.deepEqual(h.sent,[]);
      if(v.training?.kind==='clinic-practice'){
        assert.equal(v.learningFocus.stageId,'clinic.equipment');
        assert.match(h.html('task'),/data-action="guide"[^>]*data-section="guide.devices-paths"/);
      }
      if(v.learningFocus.stageId==='clinic.address-repair')assert.match(h.html('task'),/data-action="guide"[^>]*data-section="guide.addressing-diagnosis"/);
      if(v.mode==='client'&&v.economy.delivered)assert.match(h.html('task'),/Free field guide/);
    }finally{h.destroy();}
  }
});

test('QA05-P07 hidden-tool drafts survive reopen, cancelled or damaged imports and read-only rejection',async()=>{
  const h=harness(client({markers:false,tests:false,explanations:false}));
  try{
    const d=device(h.game,'role.nurse'),before=clone(h.game);
    await h.click('select-device',{device:d.id});assert.equal(h.node('[data-toolbox]').hidden,false);
    h.input({configDevice:d.id,configField:'address'},'unapplied address');
    await h.click('hide-tools');assert.equal(h.node('[data-toolbox]').hidden,true);
    await h.click('select-device',{device:d.id});
    assert.match(h.html('tool'),/value="unapplied address"/);
    await paste(h,'{');await h.click('confirm-import');
    assert.match(h.html('modal'),/Keep your unsaved draft/);assert.equal(h.imports.length,0);
    await h.click('close-modal');assert.deepEqual(h.game,before);
    await paste(h,'{');await h.click('confirm-import');await h.click('confirm-draft-discard');
    assert.deepEqual(h.game,before);assert.match(h.html('storage'),/Download unsaved draft/);
    await h.click('close-modal');h.storageMode='readonly';
    await h.click('power-device',{device:d.id,on:'false'});assert.deepEqual(h.game,before);
    await h.click('export-draft');assert.match(h.rescues.at(-1).text,/unapplied address/);
    assert.match(h.rescues.at(-1).text,/UNAPPLIED \/ UNSUBMITTED — NOT SIMULATION EVIDENCE/);
  }finally{h.destroy();}
});

test('QA05-P08 clinic, network and list presentation preserve device IDs and real current/stale path provenance',async()=>{
  const h=harness(client());
  try{
    const before=clone(h.game),ids=derive(h.game).devices.map(d=>d.id);
    assert.match(h.html('scene'),/At-home site outside the clinic boundary/);
    for(const id of ids)assert.ok(h.html('scene').includes(`data-device="${id}"`));
    await h.click('network-view');
    const result=derive(h.game).diagnostics[0];
    const observed=[...h.layer.innerHTML.matchAll(/data-observed-path-edge="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(observed,result.pathIds.filter((id,index)=>index%2===1));
    await h.click('list-view');for(const id of ids)assert.ok(h.html('scene').includes(`data-device="${id}"`));
    assert.deepEqual(h.game,before);
    await h.click('network-view');
    h.game=act(h.game,'PLACE_DEVICE',{deviceId:device(h.game,'infra.ap').id,locationId:'location.home'});
    await h.click('probe',{test:'nurse'});
    assert.equal(derive(h.game).diagnostics[0].code,'OUTSIDE_COVERAGE');
    assert.equal((h.layer.innerHTML.match(/data-observed-path-edge=/g)||[]).length,0);
  }finally{h.destroy();}
});

test('QA05-P09 incomplete practice evidence offers explicit recovery or explanation instead of a retest loop',async()=>{
  for(const phase of ['practice','transfer']){
    let g=toStation(1,phase);
    if(phase==='practice')g=act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.nurse').id,address:derive(g).network.base+'.31',mask:'255.255.255.0'});
    else g=connect(g,'infra.ap',4);
    const h=harness(g);
    try{
      await h.click('probe',{test:'nurse'});
      assert.equal(derive(h.game).diagnostics[0].pass,true);
      assert.equal(derive(h.game).training.canAdvance,false);
      noSuccess(h);taskAction(h,'training-retry');
      const before=h.game.activeAttemptId;await h.click('training-retry');
      assert.notEqual(h.game.activeAttemptId,before);
      assert.equal(derive(h.game).training.phase,phase);
      taskAction(h,'probe');
      if(phase==='transfer'){
        await h.click('probe',{test:'nurse'});h.game=connect(h.game,'infra.ap',4);
        await h.click('probe',{test:'nurse'});
        h.game=act(h.game,'SAVE_EXPLANATION',{key:'repair',text:'',oral:false});
        assert.equal(derive(h.game).training.transferEvidence.explanation.submitted,true);
        assert.equal(derive(h.game).training.checks[3].met,false);
        assert.equal(derive(h.game).training.canAdvance,false);taskAction(h,'open-transfer-reason');
      }
    }finally{h.destroy();}
  }
});
