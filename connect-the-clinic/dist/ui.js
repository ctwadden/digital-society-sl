/** Original Connect the Clinic interface. The simulation owns every outcome. */
import * as learning from './content/learning.js';
import { CATALOG, ROLES, LOCATIONS, ATTACHMENTS, POLICIES, BUILD_VERSION } from './catalog.js';
import { deviceSvg } from './art.js';
import * as sceneArt from './scene-art.js';
const { portraitSvg, roomDecorSvg } = sceneArt;
import { EXPERIENCE_COPY } from './content/experience.js';
import { createDraftStore, draftScope, draftRescueText } from './drafts.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr = value => Array.isArray(value) ? value : Object.values(value || {});
const cleanId = value => String(value || '').replace(/[^a-z0-9_-]/gi, '-');
const LABELS = { 'service.bookings':'Bookings', 'service.workspace':'Clinical workspace', 'service.marker-intake':'Marker intake', 'role.reception':'Reception', 'role.nurse':'Nurse', 'role.monitor-transfer':'Wearable transfer', 'role.outsider':'Outside role' };
const icon = (name, cls = '') => {
  const shapes = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    cable:'<path d="M7 4v4m4-4v4M5 8h8v3a4 4 0 0 1-8 0zM9 15v2a4 4 0 0 0 8 0v-3m-2-4h4v4h-4z"/>',
    inspect:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6M7 10h6"/>',
    pulse:'<path d="M2 12h5l3-7 4 14 3-7h5"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
    watch:'<rect x="6" y="6" width="12" height="12" rx="4"/><path d="m8 6 1-4h6l1 4M8 18l1 4h6l1-4M9 12h2l1-2 1 4 2-2"/>',
    note:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    book:'<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/>',
    save:'<path d="M4 3h13l3 3v15H4zM8 3v6h8V3M8 21v-8h8v8"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
    reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    chevron:'<path d="m8 5 7 7-7 7"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    power:'<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
    wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0M12 20h.01"/>',
    alert:'<path d="m12 3 10 18H2zM12 9v5m0 3h.01"/>',
  };
  return `<svg class="icon ${esc(cls)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.grid}</svg>`;
};
const button = (action, text, extras = '', cls = 'button') => `<button type="button" class="${cls}" data-action="${action}" ${extras}>${text}</button>`;
const badge = (text, tone = '') => `<span class="badge ${tone}">${esc(text)}</span>`;
const opt = (value, label, selected) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
const roleName = id => ROLES[id]?.label || LABELS[id] || id || 'Device';
const locationName = id => LOCATIONS.find(x => x.id === id)?.label || id || 'Not placed';
const deviceName = d => d ? (d.label || CATALOG[d.kind]?.label || d.kind) : 'No device';
const titleCase = value => String(value || '').replace(/[-_]/g, ' ').replace(/^./, c => c.toUpperCase());

export function mountUI(root, { getView, send, getEvidence, onExport, onExportDraft, onImport, onReset, onClear, getStorageStatus, onTakeControl, onRecover }) {
  let view;
  let panel = 'equipment';
  let selectedId = null;
  let equipmentRole = 'role.reception';
  let mapMode = 'map';
  // These are presentation choices only. They never enter the campaign or evidence.
  let introStage;
  let guidedAttemptId = null;
  let guidedPresentation = 'intro';
  const guidedWire = {fromPortId:'',toPortId:''};
  let showTools = false;
  let notebookOpen = false;
  let modal = null;
  let guideSection = 'guide.devices-paths';
  let lastStatus = null;
  let busy = false;
  let busyRetryRequested = false;
  let pendingRender = false;
  let modalFocusKey = null;
  let pendingFile = null;
  let pendingImportSource = null;
  let progressPasteText = '';
  let progressPasteMessage = '';
  let closed = false;
  let draftTimer = null;
  let flushChain = Promise.resolve(true);
  const drafts = createDraftStore();
  let pendingReplacement = null;
  let replacementBusy = false;
  const connection = { fromDeviceId:'',fromPortId:'',toDeviceId:'',toPortId:'' };
  const disclosureState = new Set();
  const uid = (prefix, value) => `${prefix}-${cleanId(value)}`;

  root.innerHTML = `<div class="app-shell">
    <a class="skip-link" href="#clinic-workbench">Skip to workbench</a>
    <header class="topbar" data-region="topbar"></header>
    <div class="save-strip" data-region="storage"></div>
    <main id="main-content">
      <section class="mission-heading" data-region="heading"></section>
      <div class="workspace-grid">
        <section class="clinic-area" id="clinic-workbench" tabindex="-1" aria-label="Clinic workbench"><div data-region="scene"></div><div data-region="status"></div></section>
        <aside class="experience-column" aria-label="Your next task and tools"><section data-region="task" aria-label="Current task"></section><div class="workbench-tools" data-toolbox hidden><div class="toolbox-heading"><strong>Your toolkit</strong>${button('hide-tools',icon('close'),'aria-label="Close toolkit"','icon-button')}</div><nav class="tool-tabs" aria-label="Workbench tools" data-region="tabs"></nav><section class="tool-content" data-region="tool"></section></div><section class="phone-preview" data-region="phone-preview"></section></aside>
      </div>
      <section class="field-notebook" id="field-notebook" data-notebook hidden aria-labelledby="notebook-title"><header class="notebook-heading"><div><div class="eyebrow">YOUR FIELD NOTES</div><h2 id="notebook-title" tabindex="-1">Goals, practice & network plan</h2></div>${button('toggle-notebook','Close notebook '+icon('close'),'aria-controls="field-notebook"','button button-secondary')}</header><aside class="mission-rail" aria-label="Learning focus, mission and practice"><div data-region="brief"></div><div data-region="training"></div><div data-region="objectives"></div><div data-region="network"></div></aside></section>
      <footer class="app-footer" data-region="footer"></footer>
    </main>
    <div data-region="modal"></div>
    <input class="visually-hidden" type="file" id="progress-file" accept=".json,application/json" tabindex="-1" aria-label="Choose a saved progress file">
    <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true" id="live-announcement"></div>
  </div>`;

  const region = name => root.querySelector(`[data-region="${name}"]`);
  const sceneResizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>drawSceneConnections()):null;
  sceneResizeObserver?.observe(region('scene'));
  window.addEventListener('resize',drawSceneConnections);
  function announce(text) { root.querySelector('#live-announcement').textContent = text || ''; }
  function showStatus(text, type = 'info') {
    if (typeof type === 'boolean') type = type ? 'error' : 'info';
    lastStatus = {text: text || '',type};
    renderStatus();
    announce(text);
  }
  function renderStatus() {
    if(!lastStatus)return;
    region('status').innerHTML = `<div class="feedback ${esc(lastStatus.type)}" role="${lastStatus.type === 'error' ? 'alert' : 'status'}">${icon(lastStatus.type === 'error' ? 'alert' : lastStatus.type === 'success' ? 'check' : 'inspect')}<span>${esc(lastStatus.text)}</span></div>`;
  }
  function storageView() {
    const s = getStorageStatus?.() || {label:'Progress stays in this browser',detail:'Download progress to keep your own copy.'};
    region('storage').innerHTML = `<div class="save-message">${icon(s.mode === 'error' || s.mode === 'memory' ? 'alert' : 'save')}<strong>${esc(s.label || 'Local progress')}</strong><span>${esc(s.detail || '')}</span></div><div class="save-actions">${s.canTakeControl ? button('take-control','Take control','','text-button') : ''}${s.canRecover ? button('recover','Recover saved copy','','text-button') : ''}${button('export-progress','Download progress','','text-button')}${drafts.size?button('export-draft','Download unsaved draft','','text-button'):''}</div>`;
  }
  function saveFocus() {
    const el = document.activeElement;
    if (!el || !root.contains(el)) return null;
    const identity={};
    for(const key of ['action','key','device','role','panel','section','tier','test','cable','location','kind','end'])if(el.dataset[key]!==undefined)identity[key]=el.dataset[key];
    return {id:el.id,action:el.dataset.action,identity,selectionStart:el.selectionStart,selectionEnd:el.selectionEnd};
  }
  function restoreFocus(f) {
    if (!f) return false;
    let el = f.id ? root.querySelector(`#${CSS.escape(f.id)}`) : null;
    if (!el && f.action) el = [...root.querySelectorAll('[data-action]')].find(e => Object.entries(f.identity||{action:f.action}).every(([key,value])=>e.dataset[key]===value));
    if (el && !el.disabled && !el.closest('[hidden]')) { el.focus({preventScroll:true}); if (typeof f.selectionStart === 'number' && el.setSelectionRange) { try {el.setSelectionRange(f.selectionStart,f.selectionEnd);} catch {} } return true; }
    return false;
  }
  function isTyping() {
    const el = document.activeElement;
    return el && root.contains(el) && el.matches('textarea,input[type="text"],input:not([type])');
  }
  function render({force = false} = {}) {
    if (closed) return;
    const focus = saveFocus();
    view = getView();
    if (!view) return;
    if(isGuided()&&guidedAttemptId!==view.attempt.id){guidedAttemptId=view.attempt.id;guidedPresentation='intro';guidedWire.fromPortId='';guidedWire.toPortId='';mapMode='network';selectedId=view.guidedConnection.receptionDeviceId;showTools=false;}
    if(!isGuided())guidedAttemptId=null;
    if(introStage===undefined)introStage=isFreshOpening()?'arrival':'';
    if(introStage&&!isFreshOpening())introStage='';
    if(!lastStatus)lastStatus={text:isGuided()?(view.guidedConnection?.phase==='connect'?'Jo has prepared the equipment. Start with the missing reception cable; all guidance here is free.':'Your guided lesson is saved. Continue from the current task; all guidance here is free.'):view.mode==='client'?(view.economy?.delivered?'Your recorded clinic handover is available. Run fresh checks after any technical change.':'Continue the clinic job from its current configuration. Read the brief and test your work.'):view.training?.kind==='delivery-replay'?'A free review copy is open. The original handover and payment are preserved.':view.training?.kind==='clinic-practice'?'Teacher-selected clinic practice is open. All guides are free, earnings are zero, and any client job is saved separately.':view.training?.completed?'Bootcamp practice is complete. You can continue to the clinic job.':'Continue the free practice shown here. Demonstrations and your own attempts remain separate.',type:'info'};
    storageView();
    const blocked=editingBlocked();
    root.querySelectorAll('[data-explanation],[data-config-device]').forEach(el=>{el.readOnly=blocked;el.setAttribute('aria-readonly',String(blocked));});
    root.querySelectorAll('[data-oral]').forEach(el=>{el.disabled=blocked;});
    if (isTyping() && !force && !blocked) { pendingRender = true; return; }
    pendingRender = false;
    if (selectedId && !view.devices.some(d => d.id === selectedId)) selectedId = null;
    if (!selectedId && view.devices.length) selectedId = view.devices[0].id;
    root.querySelector('.app-shell').classList.toggle('has-introduction',!!introStage);
    root.querySelector('.app-shell').classList.toggle('is-guided',isGuided());
    root.querySelector('.app-shell').classList.toggle('tools-open',showTools&&!introStage);
    root.querySelector('[data-toolbox]').hidden=!showTools||!!introStage;
    root.querySelector('[data-notebook]').hidden=!notebookOpen;
    renderTopbar(); renderHeading(); renderTask(); renderTraining(); renderObjectives(); renderBrief(); renderScene(); renderStatus(); renderNetwork(); renderTabs(); renderTool(); renderPhonePreview(); renderFooter(); renderModal();
    root.querySelectorAll('details[data-disclosure]').forEach(d => { d.open = disclosureState.has(d.dataset.disclosure); });
    if(!restoreFocus(focus)&&focus){
      const fallback=modal?region('modal').querySelector('[data-modal]'):root.querySelector('#current-task-title')||(showTools?root.querySelector('.panel-heading h2'):null)||root.querySelector('h1');
      if(fallback){fallback.setAttribute('tabindex','-1');fallback.focus({preventScroll:true});}
    }
  }
  function renderTopbar() {
    const unread = (view.messages || []).filter(m => !m.read).length;
    region('topbar').innerHTML = `<a class="brand" href="#main-content" aria-label="Fieldwork — Connect the Clinic"><span class="brand-mark" aria-hidden="true">${icon('cable')}</span><span>FIELDWORK<small>YOUR FIRST CALL-OUT</small></span></a><div class="topbar-actions">${button('phone',`${icon('phone')}<span>Phone</span>${unread ? `<span class="notification-count" aria-label="${unread} unread">${unread}</span>` : ''}`,'aria-label="Jobs & messages"','button button-quiet')}${button('toggle-notebook',`${icon('book')}<span>Field notebook</span>`,`aria-label="Field notebook" aria-controls="field-notebook" aria-expanded="${notebookOpen}"`,'button button-quiet')}${button('help',`${icon('help')}<span>Help</span>`,'aria-label="Free help"','button button-quiet')}${button('open-menu',`${icon('save')}<span>Progress</span>`,'aria-label="Progress"','button button-quiet')}</div>`;
  }
  function renderHeading() {
    const t=view.training||{},e=view.economy||{},training=view.mode==='training';
    const label=isGuided()?'GUIDED PRACTICE / START HERE':training?(t.kind==='bootcamp'?'BOOTCAMP / FREE PRACTICE':t.kind==='clinic-practice'?'TEACHER-SELECTED FREE PRACTICE':'FREE REVIEW COPY'):'CLIENT JOB 01 / RIVERBEND';
    const title=isGuided()?'Your first connection':training&&t.kind==='bootcamp'?(t.completed?'Ready for your first call-out':t.stationIndex===0?'Get reception connected':t.stationIndex===1?'Find what is stopping the connection':'Give people the access they need'):'Connect the Clinic';
    region('heading').innerHTML=`<div class="mission-title"><div class="eyebrow">${label}</div><h1>${esc(title)}</h1><p>${isGuided()?'Help reception reach the booking service. Jo will guide one real connection.':training?'You are the field technician. Build it, test it and see what changes.':'Help the clinic team work together. Protect access to their shared services.'}</p></div><div class="mission-badge">${training?`${icon('book')}<div><strong>Help is free</strong><span>No timer · ${esc(e.net??0)} earnings</span></div>`:`${icon('coin')}<div><strong>${esc(e.net??120)} credits after guides</strong><span>${esc(e.reserved??0)} reserved · ${esc(e.minutes??0)} simulated min</span></div>`}</div>`;
  }
  function isFreshOpening() {
    const t=view?.training;
    return t?.kind==='bootcamp'&&t.stationIndex===0&&t.phase==='practice'&&!t.completed&&!view.hasClient&&!view.guidedConnectionCompleted&&!['after-guided-connection','guided-connection-skipped'].includes(view.attempt?.training?.provenance?.route)&&!(view.history||[]).some(event=>event.origin==='player')&&!view.attempt?.historyCompacted;
  }
  function isGuided(){return view?.training?.kind==='guided-connection'&&!!view.guidedConnection;}
  function sceneObservation(){return isGuided()?(view.diagnostics||[]).find(result=>result.testId==='reception'):(view.diagnostics||[])[0];}
  function currentTask() {
    const t=view.training||{},focus=view.learningFocus||{};
    const task=(title,body,action,label,extras='',tone='')=>({title,body,action,label,extras,tone});
    if(t.kind==='bootcamp') {
      if(t.phase==='demo')return task('Now make it yours','This setup is Jo’s demonstration. Start your own attempt to practise the decisions.','training-retry','Try it yourself');
      if(t.completed)return task('Your first clinic job is waiting','Your practice checkpoints are recorded. Ari’s clinic has a different network and an inherited fault. Your teacher still reviews understanding.','start-client','Open the clinic job','','success');
      if(t.canAdvance)return task(t.stationIndex===0?'Reception is connected':t.stationIndex===1?'Your repair has been tested':'Your access checks are recorded',t.stationIndex===0?EXPERIENCE_COPY.feedback.currentReceptionPass:'The model has recorded this practice checkpoint. Continue to apply the idea in another situation.','training-next',t.phase==='practice'?'Try a changed example':t.stationIndex===2?'Finish bootcamp practice':'Continue to next station','','success');
      if(t.stationIndex===0){
        const d=view.devices.find(d=>d.roleId==='role.reception');
        const result=(view.diagnostics||[]).find(r=>r.testId==='reception'&&r.origin==='player');
        if(!d)return task('Choose a reception computer','Reception needs a computer for booking appointments. Compare the equipment and make your choice.','choose-role','Choose a computer','data-role="role.reception"');
        if(!d.powered)return task('Bring your computer to life','Your computer is at reception. Inspect it and switch on its power.','select-device','Inspect reception',`data-device="${esc(d.id)}"`);
        if(!(d.ports||[]).some(p=>p.medium==='ethernet'))return task('Decide how it will connect','Check your computer’s ports. For the wired practice route, add its compatible Ethernet adapter in Inspect.','select-device','Inspect ports & adapter',`data-device="${esc(d.id)}"`);
        const host=view.devices.find(d=>d.roleId==='role.records');
        if(result&&!result.stale&&!result.pass){
          const offDevice=['DEVICE_OFF','SWITCH_OFF','AP_OFF'].includes(result.code)?view.devices.find(device=>!device.powered&&(device.id===result.sourceDeviceId||device.roleId==='role.records'||device.roleId==='infra.switch'||device.roleId==='infra.ap')):null;
          const target=offDevice||(result.code==='SERVICE_UNAVAILABLE'?host:null)||d;
          return task('Follow the test result',result.message,result.code==='PORT_DISCONNECTED'?'open-connect':'select-device',result.code==='PORT_DISCONNECTED'?'Inspect the connections':`Inspect ${roleName(target.roleId)}`,result.code==='PORT_DISCONNECTED'?'':`data-device="${esc(target.id)}"`,'investigate');
        }
        if(!(d.ports||[]).some(p=>p.cableId)||!(host?.ports||[]).some(p=>p.cableId))return task('Build a path to the service','Try connecting reception to the switch, and the switch to the server. Pick actual ports in the Connect tool. Other valid paths can work too.','open-connect','Connect equipment');
        return task(result?.stale?'Check your changed setup':'Will bookings get through?',result?.stale?EXPERIENCE_COPY.feedback.staleProbe:'The cables are in place. Run a reception booking test to find out whether the service can be reached.','probe','Test reception bookings','data-test="reception"');
      }
      if(t.stationIndex===1){
        const result=(view.diagnostics||[]).find(r=>r.testId==='nurse'&&r.origin==='player');
        if(isUplinkTransfer()&&view.training.transferEvidence?.passingRetest&&!t.checks?.[3]?.met)return task('Explain what your repair changed','Use the failure and retest you observed. Why would changing only the IP address leave this fault?','open-transfer-reason','Explain this repair');
        if(result&&!result.stale&&!result.pass){
          if(result.code==='PORT_DISCONNECTED')return task('Investigate the failed test',result.message,'open-connect','Inspect connections','','investigate');
          const source=view.devices.find(device=>device.id===result.sourceDeviceId)||view.devices.find(device=>device.roleId==='role.nurse');
          const host=view.devices.find(device=>device.roleId==='role.records');
          const target=result.code==='SERVICE_UNAVAILABLE'?host:result.code==='SWITCH_OFF'?view.devices.find(device=>device.roleId==='infra.switch'):result.code==='AP_OFF'?view.devices.find(device=>device.id===source?.wifiApId):result.code==='DEVICE_OFF'?(source&&!source.powered?source:host):source;
          return target?task('Investigate the failed test',result.message,'select-device',`Inspect ${roleName(target.roleId)}`,`data-device="${esc(target.id)}"`,'investigate'):task('Investigate the failed test',result.message,'open-tests','Inspect the diagnostic','','investigate');
        }
        if(result&&!result.stale&&result.pass)return task('The service works; the practice record is incomplete',`This practice still needs: ${t.checks?.find(c=>!c.met)?.label||'a recorded diagnosis and repair'}. Restart this example to observe its original fault before making a repair.`,'training-retry','Start this practice again');
        return task(isUplinkTransfer()?'A different fault awaits':'Test before changing a setting',result?.stale?EXPERIENCE_COPY.feedback.staleProbe:'Run the nurse’s workspace test. Read what actually stops the request before choosing a change.','probe','Test nurse workspace','data-test="nurse"');
      }
      const nextIndex=t.checks?.findIndex(c=>!c.met)??0;
      const next=t.checks?.[nextIndex]?.label||focus.nextAction||t.goal;
      if(nextIndex===1)return task('Bring the markers back safely',next,'set-panel','Open wearable tasks','data-panel="wearable"');
      if(nextIndex===2)return task('Test allowed work and denied access',next,'probe','Run access checks','data-test="access"');
      if(nextIndex===3)return task('Explain the effect on people',next,'open-privacy-reason','Explain this decision');
      return task('Who needs which service?',next,'set-panel','Open access decisions','data-panel="access"');
    }
    const routes={
      'clinic.equipment':['Choose equipment for the team','open-equipment','Open equipment'],
      'clinic.connections':['Make the clinic’s connections','open-connect','Open connections'],
      'clinic.address-repair':['Investigate the nurse’s connection','open-tests','Open diagnostics'],
      'clinic.access':['Decide who can do what','set-panel','Open access decisions','data-panel="access"'],
      'clinic.markers':['Follow the wearable’s journey','set-panel','Open wearable tasks','data-panel="wearable"'],
      'clinic.verify':['Check the whole clinic','open-tests','Open diagnostics'],
      'clinic.handover':['Leave a useful handover','set-panel','Open handover','data-panel="handover"'],
      'clinic.delivered':['The clinic handover is recorded','set-panel','Review handover & fee','data-panel="handover"'],
      'clinic.settled':['Your call-out is recorded','set-panel','Review the evidence','data-panel="handover"'],
      'clinic.practice-review':['Review your clinic practice','set-panel','Open evidence','data-panel="handover"'],
      'clinic.replay-review':['Review your changes','set-panel','Open evidence','data-panel="handover"']
    };
    const r=routes[focus.stageId]||['Continue your clinic work','open-tests','Open diagnostics'];
    // The model supplies the client-stage guidance. No paid solution is revealed here.
    return task(r[0],focus.nextAction||'Use a test to see what the current setup does.',r[1],r[2],r[3]||'');
  }
  function endpointLabel(deviceId,portId){
    const device=view.devices.find(item=>item.id===deviceId);
    return `${roleName(device?.roleId)} · ${device?.ports?.find(port=>port.id===portId)?.label||portId}`;
  }
  function guidedResultMarkup(result,label='Observed test'){
    if(!result)return '';
    result=(view.diagnostics||[]).find(observation=>observation.id===result.id)||result;
    const state=observationState(result);
    return `<section class='guided-observation ${state.className}' data-guided-observation='${esc(result.id)}'><div class='observation-heading'><strong>${esc(label)}</strong>${badge(state.label,state.tone)}</div><p>${esc(result.message)}</p>${observedPathMarkup(result)}<details data-disclosure='guided-result-${esc(result.id)}'><summary>Diagnostic detail</summary><p>${esc(result.code)} · tested configuration ${esc(result.testedTechnicalRevision)}</p></details></section>`;
  }
  function guidedConnectionForm(){
    const g=view.guidedConnection,from=view.devices.find(d=>d.id===g.receptionDeviceId),to=view.devices.find(d=>d.id===g.switchDeviceId);
    const ethernet=d=>(d?.ports||[]).filter(port=>port.medium==='ethernet');
    if(!from||!to||!ethernet(from).length||!ethernet(to).length)return `<div class='context-note'><p>The equipment has changed. Use All tools to inspect it, or restart this guided setup.</p>${button('open-equipment','Inspect equipment choices','','button button-secondary button-full')}</div>`;
    if(!ethernet(from).some(p=>p.id===guidedWire.fromPortId&&!p.cableId))guidedWire.fromPortId='';
    if(!ethernet(to).some(p=>p.id===guidedWire.toPortId&&!p.cableId))guidedWire.toPortId='';
    const options=(d,value)=>opt('','Choose a socket…',value)+ethernet(d).map(p=>`<option value='${esc(p.id)}' ${value===p.id?'selected':''} ${p.cableId?'disabled':''}>${esc(p.label)} — ${p.cableId?'occupied':'free'}</option>`).join('');
    return `<form data-form='guided-connect' class='guided-wire-form'><fieldset><legend>1 · Reception end</legend><p>${esc(deviceName(from))} · the computer making the request</p><label for='guided-from-port'>Reception Ethernet socket</label><select id='guided-from-port' name='fromPortId' data-change='guided-port' data-end='from' required>${options(from,guidedWire.fromPortId)}</select><input type='hidden' name='fromDeviceId' value='${esc(from.id)}'></fieldset><div class='guided-cable-label'>${icon('cable')} One Ethernet cable · two ends</div><fieldset><legend>2 · Switch end</legend><p>${esc(deviceName(to))} · joins the wired devices</p><label for='guided-to-port'>Available switch socket</label><select id='guided-to-port' name='toPortId' data-change='guided-port' data-end='to' required>${options(to,guidedWire.toPortId)}</select><input type='hidden' name='toDeviceId' value='${esc(to.id)}'></fieldset><button type='submit' class='button button-primary button-full' data-guided-primary ${editingBlocked()?'disabled':''}>${icon('cable')} ${g.phase==='repair'?'Reconnect ports':'Connect ports'}</button><p class='small muted'>Occupied sockets already have a cable. Any compatible free switch socket can work.</p></form>`;
  }
  function guidedReflectionMarkup(){
    const g=view.guidedConnection,copy=EXPERIENCE_COPY.guided;
    return `<div class='guided-reflection'>${g.experimentOutcome==='alternate-path'?`<p class='context-note'>${esc(copy.alternatePath)}</p>`:''}${explanationField({key:'repair',title:'Your explanation',prompt:copy.reflectionPrompt,placeholder:'Use the cable change and tests you actually observed.',oralLabel:'I will explain this to my teacher — conversation pending.'})}${button('guided-save-explanation','Save my explanation',`${editingBlocked()?'disabled':''} data-guided-primary`,'button button-primary button-full')}<p class='small muted'>This belongs to guided practice. Your independent work and client explanations remain separate.</p></div>`;
  }
  function guidedLessonContents(){
    const g=view.guidedConnection,copy=EXPERIENCE_COPY.guided,disabled=editingBlocked()?'disabled':'';
    const primary=(action,label,extras='')=>button(action,label,`${extras} ${disabled} data-guided-primary`,'button button-primary button-full');
    const result=g.currentObservation;
    if(g.phase==='connect'){
      if(guidedPresentation==='intro')return {title:copy.title,body:copy.opening,controls:primary('guided-find-port','Find reception’s port '+icon('arrow'))};
      return {title:copy.connect.title,body:copy.connect.body,controls:guidedConnectionForm()};
    }
    if(g.phase==='test'||g.phase==='retest'){
      if(result&&!result.pass)return {title:'Follow the actual diagnostic',body:result.message,controls:guidedResultMarkup(result,'What the test found')+(result.code==='PORT_DISCONNECTED'?guidedConnectionForm():primary('guided-inspect-fault','Inspect this problem'))+button('guided-probe','Retest reception bookings',disabled,'text-button')};
      const item=g.phase==='retest'?copy.retest:copy.test;
      return {title:item.title,body:item.body,controls:primary('guided-probe','Test reception bookings '+icon('pulse'))};
    }
    if(g.phase==='experiment'){
      const cable=(view.cables||[]).find(item=>item.id===g.suggestedDisconnectCableId);
      if(guidedPresentation==='unplug'&&cable)return {title:copy.unplug.title,body:copy.unplug.body,controls:`<div class='guided-cable-choice'><strong>Cable to unplug</strong><p>${esc(endpointLabel(cable.fromDeviceId,cable.fromPortId))}<br>↔ ${esc(endpointLabel(cable.toDeviceId,cable.toPortId))}</p></div>${primary('guided-unplug','Unplug this cable',`data-cable='${esc(cable.id)}'`)}`};
      return {title:copy.experiment.title,body:copy.experiment.body,controls:guidedResultMarkup(result||g.firstPass,'Your first service test')+(cable?primary('guided-experiment','Try the cable experiment '+icon('arrow')):primary('guided-probe','Run a fresh reception test'))};
    }
    if(g.phase==='test-disconnected')return {title:copy.disconnected.title,body:copy.disconnected.body,controls:primary('guided-probe','Test reception bookings '+icon('pulse'))};
    if(g.phase==='repair'){
      const observed=result||g.experimentObservation;
      if(observed&&observed.code!=='PORT_DISCONNECTED')return {title:'Follow the actual diagnostic',body:observed.message,controls:guidedResultMarkup(observed,'What the test found')+primary('guided-inspect-fault','Inspect this problem')+button('guided-probe','Retest reception bookings',disabled,'text-button')};
      return {title:copy.repair.title,body:copy.repair.body,controls:guidedResultMarkup(observed,'What changed')+guidedConnectionForm()};
    }
    if(g.phase==='reflect')return {title:copy.reflect.title,body:copy.reflect.body,controls:guidedResultMarkup(result,'Latest reception test')+guidedReflectionMarkup()};
    if(g.phase==='complete'){
      if(guidedPresentation==='edit')return {title:'Review your explanation',body:copy.reflect.body,controls:guidedReflectionMarkup()};
      return {title:copy.complete.title,body:g.returnAttemptId?'Your guided observations and explanation are recorded for teacher review. Return to your saved work when you are ready.':copy.complete.body,controls:guidedResultMarkup(result,'Current reception result')+`<p class='context-note'>${g.explanation?.oral?'An oral explanation is pending a teacher conversation.':'Your own explanation is saved for teacher review.'}</p>`+primary('guided-finish',g.returnAttemptId?'Return to saved work':'Start independent practice',g.canFinish?'':'disabled')+button('guided-edit-explanation','Review my explanation','','text-button')};
    }
    return {title:'Continue your guided connection',body:'Use the actual reception test and your current equipment to decide what to check next.',controls:primary('guided-probe','Test reception bookings')};
  }
  function renderGuidedTask(){
    const g=view.guidedConnection,copy=EXPERIENCE_COPY.guided,content=guidedLessonContents();
    const steps=[['connect','Connect'],['test','Test'],['experiment','Change & repair'],['reflect','Explain']];
    const current=['connect'].includes(g.phase)?0:['test'].includes(g.phase)?1:['experiment','test-disconnected','repair','retest'].includes(g.phase)?2:3;
    region('task').innerHTML=`<article class='task-card guided-card' data-guided-phase='${esc(g.phase)}'><div class='task-person'><span class='portrait'>${portraitSvg('jo')}</span><div><div class='eyebrow'>GUIDED CONNECTION · HELP IS FREE</div><strong>Jo · your field mentor</strong></div></div><ol class='guided-progress' aria-label='Guided lesson sequence'>${steps.map(([,label],index)=>`<li ${index===current?`aria-current='step'`:''}><span aria-hidden='true'>${index+1}</span>${label}</li>`).join('')}</ol><div class='task-copy'><h2 id='current-task-title' tabindex='-1'>${esc(content.title)}</h2><p>${esc(content.body)}</p></div><div class='guided-controls'>${content.controls}</div><details class='guided-hints' data-disclosure='guided-hints'><summary>Help with this step — free</summary>${copy.hints.map((hint,index)=>`<details data-disclosure='guided-hint-${index}'><summary>${esc(hint.title)}</summary><p>${esc(hint.text)}</p></details>`).join('')}</details><div class='guided-goals'><h3>Today, I can…</h3><ul>${copy.goals.map(goal=>`<li>${esc(goal.replace(/^I can /,''))}</li>`).join('')}</ul></div><div class='task-support'>${button('show-tools',icon('inspect')+'All tools','','text-button')}${g.canFinish?'':button('guided-return',g.returnAttemptId?'Return to saved work':'Go to independent practice',editingBlocked()?'disabled':'','text-button')}</div><p class='guided-provenance'>Prepared equipment from Jo · your connections, tests and explanation are recorded separately.</p></article>`;
  }
  function renderTask() {
    if(isGuided()){renderGuidedTask();return;}
    if(introStage){
      const copy=EXPERIENCE_COPY[introStage==='arrival'?'arrival':'mentor'];
      region('task').innerHTML=`<article class="incoming-call" data-introduction="${introStage}"><div class="phone-status"><span>${icon('phone')} ${introStage==='arrival'?'UPCOMING JOB':'PRACTICE CALL'}</span><span aria-hidden="true">•••</span></div><div class="phone-person"><span class="portrait">${portraitSvg(introStage==='arrival'?'ari':'jo')}</span><div><strong>${esc(copy.speaker)}</strong><span>${esc(copy.role)}</span></div></div><div class="phone-conversation"><h2 tabindex="-1">${esc(copy.title)}</h2><p>${esc(copy.body)}</p><span class="message-label">${introStage==='arrival'?'Job preview · no contract accepted':'Training clinic · help is free'}</span></div>${button(introStage==='arrival'?'meet-mentor':'begin-first-task',copy.actionLabel+' '+icon('arrow'),'','button button-primary button-full')}<p class="phone-footnote">Explore at your pace. No response timer.</p></article>`;
      return;
    }
    const next=currentTask(),training=view.mode==='training',bootcamp=view.training?.kind==='bootcamp';
    const stage=view.learningFocus?.stageId||'';
    const taskGuide=bootcamp
      ? (view.training.stationIndex===1?'guide.addressing-diagnosis':view.training.stationIndex===2?'guide.access-handover':'guide.devices-paths')
      : /address|verify/.test(stage)?'guide.addressing-diagnosis':/access|markers|handover|delivered|settled|practice-review|replay-review/.test(stage)?'guide.access-handover':'guide.devices-paths';
    const stageLabel=bootcamp?`PRACTICE ${Number(view.training.stationIndex||0)+1} OF 3${view.training.phase==='transfer'?' · CHANGED EXAMPLE':''}`:training?'FREE CLINIC PRACTICE':'CURRENT CLIENT JOB';
    region('task').innerHTML=`<article class="task-card ${esc(next.tone)}"><div class="task-person"><span class="portrait">${portraitSvg(training?'jo':'ari')}</span><div><div class="eyebrow">${stageLabel}</div><strong>${training?'Jo · your field mentor':'Ari · clinic coordinator'}</strong></div>${next.tone==='success'?`<span class="task-check" aria-label="Current model checkpoint recorded">${icon('check')}</span>`:''}</div><div class="task-copy"><span class="phase-label">${next.tone==='success'?'RESULT RECORDED':'YOUR NEXT TASK'}</span><h2 id="current-task-title" tabindex="-1">${esc(next.title)}</h2><p>${esc(next.body)}</p></div>${button(next.action,next.label+' '+icon('arrow'),`${next.extras} data-task-primary`,'button button-primary button-full')}<div class="task-support">${button('guide',icon('book')+(training||view.economy?.delivered?'Free field guide':'Field guide · see cost'),`data-section="${taskGuide}"`,'text-button')}${button('show-tools',icon('inspect')+'All tools','','text-button')}</div></article>`;
  }
  function clinicPracticeChoice() {
    return `<details data-disclosure="teacher-clinic-practice" class="practice-choice"><summary>Teacher-selected clinic practice</summary><p class="small">Use the full clinic with free guides and zero earnings. Any client job stays saved separately.</p><p class="small muted">This is a local classroom setting. It does not authenticate a teacher or restrict access.</p>${button('clinic-practice','Open free clinic practice','','button button-secondary button-full')}</details>`;
  }
  function isUplinkTransfer() {
    const t=view.training;
    return t?.kind==='bootcamp' && t.stationIndex===1 && t.phase==='transfer' && t.transferKind==='physical-uplink';
  }
  function renderTraining() {
    if(isGuided()){
      const g=view.guidedConnection;
      region('training').innerHTML=`<section class='rail-card training-card'><div class='eyebrow'>GUIDED CONNECTION LESSON</div><h2>Connect, test, change and explain</h2><p>Jo supplied the powered equipment and prepared settings. These observations belong to guided practice.</p><ul class='practice-checks'>${(g.checks||[]).map(check=>`<li><span class='check-dot ${check.met?'met':''}' aria-hidden='true'>${check.met?icon('check'):'○'}</span><span>${check.met?'Recorded: ':'Still to do: '}${esc(check.label)}</span></li>`).join('')}</ul>${button('training-retry','Restart this guided lesson','','button button-secondary button-full')}${button(g.canFinish?'guided-finish':'guided-return',g.returnAttemptId?'Return to saved work':g.canFinish?'Start independent practice':'Go to independent practice','','text-button')}${button('export-text','Export guided evidence','','text-button')}<p class='small muted'>This lesson does not complete the independent bootcamp or award a grade.</p></section>`;
      return;
    }
    if (view.mode !== 'training') {
      region('training').innerHTML = `<section class="rail-card client-card"><div class="eyebrow">YOUR CLIENT</div><h2>Riverbend</h2><p>A community clinic getting ready to open.</p>${button('brief',`${icon('note')} Read client brief`,'','button button-full button-secondary')}${button('training','Free bootcamp refresher','','text-button')}${clinicPracticeChoice()}</section>`;
      return;
    }
    const t = view.training || {};
    if(t.kind==='clinic-practice'){
      region('training').innerHTML=`<section class="rail-card training-card clinic-practice-card"><div class="eyebrow">TEACHER-SELECTED CLINIC PRACTICE</div><h2>Practise the full clinic</h2><p>Same clinic. Free guides. No earnings. Your client job is saved separately.</p><p class="local-setting-note">Local classroom setting — no teacher authentication or access restriction.</p><div class="stack-actions">${button('brief',`${icon('note')} Read the clinic brief`,'','button button-secondary button-full')}${button('reset',`${icon('reset')} Restart clinic practice`,'','button button-secondary button-full')}${view.hasClient?button('return-client','Resume saved client job','','button button-primary button-full'):button('training','Return to free bootcamp','','button button-secondary button-full')}</div><p class="small muted">This attempt records practice evidence. It cannot pay a contract or complete bootcamp stations.</p></section>`;
      return;
    }
    if(t.kind==='delivery-replay'){
      region('training').innerHTML=`<section class="rail-card training-card"><div class="eyebrow">FREE CLINIC REVIEW</div><h2>Explore the delivered clinic</h2><p>This separate practice copy starts from the recorded handover. Change something, test what happens, and explain your findings.</p><p>All review guidance is free. The original delivery, guide costs and payment receipt stay unchanged.</p><div class="stack-actions">${button('reset',`${icon('reset')} Restart free review`,'','button button-secondary button-full')}${view.hasClient?button('return-client','Return to recorded client job','','button button-primary button-full'):''}</div><p class="small muted">Review actions are practice evidence. They do not count as another paid contract or teacher sign-off.</p>${clinicPracticeChoice()}</section>`;
      return;
    }
    if(t.kind!=='bootcamp'){
      region('training').innerHTML=`<section class="rail-card training-card"><h2>Practice information</h2><p>The model has not supplied a practice kind. No station progress is inferred.</p></section>`;
      return;
    }
    const lessons = learning.BOOTCAMP_LESSONS || learning.TRAINING_STATIONS || [];
    const l = arr(lessons).find(x => x.id === t.stationId) || arr(lessons)[t.stationIndex || 0] || {};
    const phase = t.phase;
    const phaseLabel = ({practice:'YOUR TURN',transfer:'CHANGED EXAMPLE',demo:'TRAINER DEMONSTRATION',complete:'PRACTICE COMPLETE'})[phase] || 'PRACTICE';
    const method = phase==='demo'?(t.demoSteps?.length?{steps:t.demoSteps}:l.demo):phase==='transfer'?(t.transferKind==='legacy-address'?learning.LEGACY_ADDRESS_TRANSFER:l.changed):l.guided;
    const legacyTransfer = t.stationIndex===1 && phase==='transfer' && t.transferKind==='legacy-address';
    region('training').innerHTML = `<section class="rail-card training-card"><div class="eyebrow">FREE BOOTCAMP</div><div class="station-track" aria-label="Station ${Number(t.stationIndex || 0) + 1} of 3">${[0,1,2].map(i=>`<span class="${i === t.stationIndex ? 'current' : i < t.stationIndex ? 'past' : ''}">${i+1}</span>`).join('')}</div><span class="phase-label">${esc(phaseLabel)}</span><h2>${esc(t.title || l.title || 'Equipment and connections')}</h2><p>${esc(t.goal || l.summary || l.intro || 'Use the workbench and test what changes.')}</p>${legacyTransfer?'<p class="local-setting-note">Earlier saved address example. This preserves its original checkpoint; it does not record the new unplugged-uplink transfer.</p>':''}${l.explain?.length ? `<details data-disclosure="station-explain"><summary>How this works</summary>${l.explain.map(x=>`<p>${esc(x)}</p>`).join('')}</details>` : ''}${method?.steps?.length?`<details data-disclosure="station-method"><summary>${phase==='demo'?'What the example shows':'Practice steps'}</summary><ol class="small">${method.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></details>`:''}<ul class="practice-checks">${(t.checks || []).map(c=>`<li><span class="check-dot ${c.met?'met':''}" aria-hidden="true">${c.met?icon('check'):'○'}</span><span><span class="visually-hidden">${c.met?'Recorded: ':'Still to do: '}</span>${esc(c.label)}</span></li>`).join('')}</ul>${isUplinkTransfer()?`<div class="transfer-reason-prompt"><p class="small">Record why an IP change alone cannot reconnect an unplugged physical path. Your teacher reviews the explanation.</p>${button('open-transfer-reason','Explain this repair','','button button-secondary button-full')}</div>`:''}<div class="stack-actions">${phase === 'demo' ? button('training-retry',`${icon('arrow')} Try it yourself`,'','button button-primary button-full') : button('training-demo',`${icon('book')} Show a worked example`,'','button button-secondary button-full')}${phase !== 'demo' ? button('training-next',`${icon('arrow')} ${t.completed || phase === 'complete' ? 'Continue to client' : phase === 'practice' ? 'Try a changed example' : 'Next station'}`,t.canAdvance || t.completed ? '' : 'disabled','button button-primary button-full') : ''}${button('training-retry','Start this practice again','','text-button')}</div><p class="small muted">Practice checks describe what happened. Your teacher reviews understanding.</p>${t.completed ? button('start-client','Open the clinic job','','button button-primary button-full') : `<details data-disclosure="prior-learning"><summary>Teacher-directed prior learning</summary><p class="small">Use only when your teacher has directed you to begin with prior learning. This route is recorded honestly.</p>${button('prior-learning','Use teacher-directed route','','button button-secondary button-full')}</details>`}${view.hasClient ? button('return-client','Resume saved client job','','text-button') : ''}${clinicPracticeChoice()}</section>`;
  }
  function renderObjectives() {
    const bootcamp=view.training?.kind==='bootcamp'||isGuided();
    root.querySelector('.mission-rail').classList.toggle('is-bootcamp',bootcamp);
    if(bootcamp){region('objectives').innerHTML='';return;}
    const objectives = view.objectives || [];
    region('objectives').innerHTML = `<section class="rail-card objective-card"><details data-disclosure="practical-map"><summary><span>Practical checklist</span> <span class="tiny-count">${objectives.filter(o=>o.met).length}/${objectives.length}</span></summary><ol class="objective-list">${objectives.map((o,i)=>`<li class="${o.met?'complete':''}"><span class="objective-number" aria-hidden="true">${o.met?icon('check'):String(i+1).padStart(2,'0')}</span><div><strong>${esc(o.label)}</strong><p>${esc(o.detail || (o.met?'Model check satisfied.':'Still to do.'))}</p></div></li>`).join('')}</ol><p class="small muted">These checks come from the simulation. They are evidence for teacher review, not a grade.</p></details></section>`;
  }
  function renderBrief() {
    const items = arr(learning.ICAN_STATEMENTS || []);
    const focus = view.learningFocus;
    const goals=isGuided()?EXPERIENCE_COPY.guided.goals.map((text,index)=>({id:index===0?'cc.clinic.connection-choice':'cc.clinic.diagnosis',text})):(focus?.goalIds||[]).map(id=>items.find(item=>item.id===id)).filter(Boolean);
    const connections = arr(learning.CONTENT_CONNECTIONS || []);
    region('brief').innerHTML = `<section class="rail-card learning-card"><div class="eyebrow">YOUR FOCUS NOW</div><h2 data-learning-stage="${esc(focus?.stageId||'')}">${esc(focus?.title||'Current learning focus')}</h2>${goals.length?`<ul class="current-goals">${goals.map(goal=>`<li data-goal-id="${esc(goal.id)}">${esc(goal.text)}</li>`).join('')}</ul>`:'<p class="small">The current learning focus is awaiting model information.</p>'}${focus?.nextAction?`<div class="next-action"><strong>Next action</strong><p>${esc(focus.nextAction)}</p></div>`:''}<details data-disclosure="ican"><summary>See all learning goals <span class="tiny-count">${items.length}</span></summary><ol class="ican-list">${items.map(i=>`<li>${esc(i.text || i.title || i)}${i.source ? `<small>${esc(i.source)}</small>`:''}</li>`).join('')}</ol><p class="small muted">Evidence supports a teacher conversation. Completion is not a grade.</p></details>${connections.length?`<details data-disclosure="connections"><summary>Content connections</summary><p class="small">Use these Digital Society lenses to discuss the decisions you actually made. Health is the context for this client.</p>${connections.map(c=>`<h3>${esc(c.concept)}</h3><p class="small">${esc(c.question)}</p>`).join('')}<p class="small muted">Optional discussion prompts; no extra quiz or automatic marks.</p></details>`:''}</section>`;
  }
  function observationState(result) {
    if(!result)return {tone:'neutral',label:'Not tested',className:'untested'};
    const denied=result.pass===true && result.expectedDenied && result.code==='ACCESS_DENIED';
    if(result.stale)return {tone:'neutral',label:`Stale · earlier ${denied?'intended denial':result.pass?'pass':'failure'}`,className:'stale'};
    return {tone:result.pass?'teal':'amber',label:denied?'Current pass · denied as intended':result.pass?'Current pass':'Current failure',className:result.pass?'passed':'failed'};
  }
  function pathToken(id) {
    const device=view.devices.find(d=>d.id===id);
    if(device)return roleName(device.roleId);
    const port=view.devices.flatMap(d=>d.ports||[]).find(p=>p.id===id);
    if(port?.medium==='wifi')return 'Wi-Fi association';
    const cable=(view.cables||[]).find(c=>c.id===id);
    if(cable)return `Ethernet cable ${String(id).split('.').at(-1)}`;
    // Retain an exact historic identifier when its component is no longer present.
    return `Earlier component (${id})`;
  }
  function observedPathMarkup(result) {
    if(!result?.pathIds?.length)return '<p class="path-empty">No complete path was recorded for this test. Inspect its failure reason and the physical connections.</p>';
    return `<p class="observed-path"><strong>Recorded path:</strong> ${result.pathIds.map(id=>`<span title="${esc(id)}">${esc(pathToken(id))}</span>`).join(' <span aria-hidden="true">→</span><span class="visually-hidden"> then </span> ')}</p>`;
  }
  function latestObservationMarkup() {
    const result=sceneObservation();
    const state=observationState(result);
    if(!result)return `<section class="latest-observation untested" aria-label="Latest observed test"><div class="observation-heading"><strong>Latest observed test</strong>${badge(state.label,state.tone)}</div><p>No test has been recorded in this attempt. The room shows equipment and connections only.</p>${button('open-tests','Choose a test','','text-button')}</section>`;
    return `<section class="latest-observation ${state.className}" aria-label="Latest observed test" data-observation-id="${esc(result.id)}" data-observation-stale="${String(result.stale)}" data-observation-pass="${String(result.pass)}"><div class="observation-heading"><strong>Latest observed test</strong>${badge(state.label,state.tone)}</div><h3>${esc(result.label||result.testId)}</h3><p>${esc(result.message)}</p><p class="observation-revision">Tested technical revision ${esc(result.testedTechnicalRevision)} · Current configuration ${esc(view.attempt?.technicalRevision)} · ${esc(result.code)}</p>${result.contextLocationId?`<p class="observation-context">Test context: ${esc(locationName(result.contextLocationId))}. The room map keeps current device locations.</p>`:''}${observedPathMarkup(result)}${result.stale?'<p class="stale-note">The configuration changed after this observation. Any highlighted links are a historical trace over links that still exist; run a fresh test for current evidence.</p>':''}${button('open-tests','Inspect all observations','','text-button')}</section>`;
  }
  function sceneDeviceMarkup(device,latest) {
    const seen=latest?.pathIds?.includes(device.id);
    const state=observationState(latest);
    const ports=device.ports||[];
    const radio=ports.find(p=>p.medium==='wifi');
    const associations=!!device.wifiApId;
    const inClinicRadioRoom=['location.exam-a','location.exam-b'].includes(device.locationId);
    const portMarkup=ports.map((port,index)=>{
      const wireless=port.medium==='wifi';
      const label=wireless?'Wi-Fi':port.id.includes('.adapter.')?'Adapter':`E${index+1}`;
      const status=wireless?(device.kind==='access-point'?'Radio capability':associations?'Association saved':'Not associated'):port.cableId?'Cable connected':'No cable';
      return `<span class="scene-port ${wireless?'radio-port':port.cableId?'occupied-port':'free-port'}" data-port-id="${esc(port.id)}" title="${esc(port.label)} — ${status}"><span aria-hidden="true">${wireless?'◌':port.cableId?'■':'□'}</span> ${esc(label)}<span class="visually-hidden">: ${esc(port.label)}; ${status}</span></span>`;
    }).join('');
    return `<div class="scene-device-node ${device.roleId==='role.monitor'?'monitor-node':''} ${seen?`observed-node ${state.className}`:''}" data-scene-device="${esc(device.id)}"><button type="button" class="scene-device ${device.id===selectedId?'selected':''} ${device.powered?'is-on':'is-off'}" data-action="select-device" data-device="${esc(device.id)}" aria-label="Inspect ${esc(roleName(device.roleId))}: ${esc(deviceName(device))}. ${esc(locationName(device.locationId))}. Power ${device.powered?'on':'off'}." aria-pressed="${device.id===selectedId}"><span class="device-art">${deviceSvg(device.kind)}</span><span class="device-label">${esc(roleName(device.roleId))}</span><span class="device-kind">${esc(deviceName(device))}</span><span class="device-state"><span class="power-dot" aria-hidden="true"></span>${device.powered?'Power on':'Power off'}</span></button><div class="scene-ports" aria-label="${esc(roleName(device.roleId))} ports">${portMarkup||'<span class="no-network-port">No network port</span>'}</div>${radio&&device.kind!=='access-point'&&associations&&!inClinicRadioRoom?'<span class="association-note">Saved association; no clinic radio path in this location</span>':''}</div>`;
  }
  function renderScene() {
    const devices=view.devices||[],latest=sceneObservation(),bootcamp=view.training?.kind==='bootcamp',guided=isGuided();
    const continuous=typeof sceneArt.clinicFloorSvg==='function'&&typeof sceneArt.roomFurnitureSvg==='function';
    const firstStation=guided||(bootcamp&&view.training.stationIndex===0);
    const room=(id,title,subtitle,cls='')=>{
      const placed=devices.filter(device=>device.locationId===id);
      const missing=Object.entries(ROLES).filter(([roleId,role])=>role.location===id&&!devices.some(device=>device.roleId===roleId)&&(guided?['role.reception','role.records','infra.switch'].includes(roleId):(!firstStation||roleId==='role.reception')));
      return `<section class="scene-room ${cls} ${!placed.length&&!missing.length?'quiet-room':''}" data-scene-location="${id}" aria-label="${esc(title)}"><div class="room-decoration">${continuous?sceneArt.roomFurnitureSvg(id):roomDecorSvg(id)}</div><header class="room-caption"><h3>${esc(title)}</h3><p class="room-subtitle">${esc(subtitle)}</p></header><div class="room-devices">${placed.map(device=>sceneDeviceMarkup(device,latest)).join('')}${missing.map(([roleId,role])=>`<button class="empty-slot" type="button" data-action="choose-role" data-role="${roleId}" aria-label="Choose equipment for ${esc(role.label)}"><span aria-hidden="true">+</span><small>${roleId==='role.reception'?'Add reception computer':esc(role.label)}</small></button>`).join('')}${!placed.length&&!missing.length?`<span class="empty-room">${firstStation?'A later job starts here':'No device here'}</span>`:''}</div></section>`;
    };
    const showHome=(!bootcamp&&!guided)||devices.some(device=>device.locationId==='location.home');
    const map=`<div class="scene-scroller" tabindex="0" role="region" aria-label="Scrollable clinic map"><div class="scene-map ${mapMode==='network'||guided?'network-view':'clinic-view'} ${guided?'guided-scene':''}"><svg class="cable-layer" aria-hidden="true" focusable="false"></svg><section class="clinic-building ${continuous?'continuous-clinic':''}" aria-label="Clinic boundary">${continuous?`<div class="clinic-floor-art" aria-hidden="true">${sceneArt.clinicFloorSvg({guided})}</div>`:''}<div class="clinic-boundary-label">${bootcamp||guided?'TRAINING CLINIC':'RIVERBEND COMMUNITY CLINIC'} <span>${guided?'Trainer-prepared equipment · connect, test and explain':mapMode==='network'?'Local network · radio coverage in rooms A and B':'Your work starts with the people here'}</span></div><div class="clinic-rooms">${room('location.reception','Reception','Booking desk','room-reception')}${room('location.equipment','Equipment room','Shared services','room-equipment')}${!guided||devices.some(d=>d.locationId==='location.exam-a')?room('location.exam-a','Room A',firstStation?'Nurse workspace':'Clinic Wi-Fi area','room-exam-a'):''}${!guided||devices.some(d=>d.locationId==='location.exam-b')?room('location.exam-b','Room B',firstStation?'Nurse workspace':'Clinic Wi-Fi area','room-exam-b'):''}</div></section>${showHome?`<div class="site-separation" aria-hidden="true"><span>Separate location · outside the clinic</span></div><section class="remote-site" aria-label="At-home site outside the clinic boundary">${room('location.home','At home','Offline marker collection','room-home')}<p class="home-boundary-note">No clinic Wi-Fi path. Return the wearable before transferring its stored markers.</p></section>`:''}</div></div>`;
    const deviceList=location=>devices.filter(device=>device.locationId===location).map(device=>`<button class="list-device ${device.id===selectedId?'selected':''}" type="button" data-action="select-device" data-device="${esc(device.id)}"><span class="list-device-art">${deviceSvg(device.kind)}</span><span><strong>${esc(roleName(device.roleId))}</strong><small>${esc(deviceName(device))} · ${esc(locationName(device.locationId))}</small><small>Power ${device.powered?'on':'off'}${device.address ? ` · ${esc(device.address)}`:''}</small><small>${(device.ports||[]).map(port=>`${esc(port.label)}: ${port.medium==='wifi'?(device.wifiApId?'association saved':device.kind==='access-point'?'radio capability':'not associated'):port.cableId?'cable connected':'no cable'}`).join(' · ')||'No network ports'}</small></span>${icon('chevron')}</button>`).join('');
    const list=`<div class="device-list">${devices.length?LOCATIONS.map(location=>{const content=deviceList(location.id);return content?`<section class="list-location ${location.id==='location.home'?'list-home':''}"><h3>${esc(location.label)}</h3>${location.id==='location.home'?'<p class="small muted">Separate home site, outside the clinic boundary. No clinic Wi-Fi path.</p>':''}${content}</section>`:'';}).join(''):`<div class="empty-state">${icon('grid')}<h3>Your clinic starts here</h3><p>Choose equipment for a job from the equipment panel.</p></div>`}${button('open-equipment','Choose equipment','','button button-secondary')}</div>`;
    const legend=`<div class="scene-legend"><span><i class="legend-cable" aria-hidden="true"></i>Physical cable</span>${guided?'':'<span><i class="legend-wifi" aria-hidden="true"></i>Saved Wi-Fi association</span>'}<span>■ connected port · □ no cable</span><span><i class="legend-pass" aria-hidden="true"></i>Current passing trace</span><span><i class="legend-failure" aria-hidden="true"></i>Current failing trace</span><span><i class="legend-stale" aria-hidden="true"></i>Stale trace</span><span>A cable alone does not prove service success.</span></div>`;
    region('scene').innerHTML=`<div class="scene-card"><header class="scene-header"><div><div class="eyebrow">${bootcamp||guided?'YOUR PRACTICE CLINIC':'YOUR CLIENT’S WORKPLACE'}</div><h2>${bootcamp||guided?'Riverbend practice clinic':'Riverbend Clinic'}</h2></div><div class="view-toggle" aria-label="Workbench presentation">${button('map-view',`${icon('grid')}<span>Clinic</span>`,`aria-label="Clinic view" aria-pressed="${mapMode==='map'}"`,'segment-button')}${button('network-view',`${icon('cable')}<span>Network</span>`,`aria-label="Network view" aria-pressed="${mapMode==='network'}"`,'segment-button')}${button('list-view',`${icon('note')}<span>List</span>`,`aria-label="List view" aria-pressed="${mapMode==='list'}"`,'segment-button')}</div></header>${mapMode==='list'?list:map}${mapMode==='network'||guided?legend:`<p class="scene-control-note">${icon('inspect')}${esc(EXPERIENCE_COPY.orientation.controls)} Network view reveals the ports and cables.</p>`}${latest||mapMode==='network'||guided?latestObservationMarkup():''}</div>`;
    drawSceneConnections();
  }
  function drawSceneConnections() {
    if(!view||(mapMode!=='network'&&!isGuided()))return;
    const map=region('scene').querySelector('.scene-map');
    const layer=map?.querySelector('.cable-layer');
    if(!map||!layer)return;
    const bounds=map.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    const anchor=portId=>{
      const element=[...map.querySelectorAll('[data-port-id]')].find(node=>node.dataset.portId===portId);
      if(!element)return null;
      const rect=element.getBoundingClientRect();
      return {x:rect.left-bounds.left+rect.width/2,y:rect.top-bounds.top+rect.height/2};
    };
    const curve=(from,to,radio)=>radio?`M${from.x} ${from.y} Q${(from.x+to.x)/2} ${Math.min(from.y,to.y)-42} ${to.x} ${to.y}`:`M${from.x} ${from.y} C${from.x} ${from.y+32},${to.x} ${to.y+32},${to.x} ${to.y}`;
    const edges=[];
    for(const cable of view.cables||[]){
      const from=anchor(cable.fromPortId),to=anchor(cable.toPortId);
      if(from&&to)edges.push({id:cable.id,fromDeviceId:cable.fromDeviceId,toDeviceId:cable.toDeviceId,path:curve(from,to,false),radio:false});
    }
    for(const device of view.devices){
      // This shows a saved association only in the engine's named radio rooms.
      // Power, addressing and service outcomes remain exclusively diagnostic facts.
      if(!device.wifiApId||!['location.exam-a','location.exam-b'].includes(device.locationId))continue;
      const accessPoint=view.devices.find(candidate=>candidate.id===device.wifiApId);
      if(!accessPoint||accessPoint.locationId==='location.home')continue;
      const fromPort=(device.ports||[]).find(port=>port.medium==='wifi');
      const toPort=(accessPoint.ports||[]).find(port=>port.medium==='wifi');
      const from=fromPort&&anchor(fromPort.id),to=toPort&&anchor(toPort.id);
      if(from&&to)edges.push({id:fromPort.id,fromDeviceId:device.id,toDeviceId:accessPoint.id,path:curve(from,to,true),radio:true});
    }
    const result=sceneObservation(),state=observationState(result);
    const traced=[];
    for(let index=1;index<(result?.pathIds?.length||0)-1;index+=2){
      const fromId=result.pathIds[index-1],edgeId=result.pathIds[index],toId=result.pathIds[index+1];
      const edge=edges.find(candidate=>candidate.id===edgeId&&((candidate.fromDeviceId===fromId&&candidate.toDeviceId===toId)||(candidate.fromDeviceId===toId&&candidate.toDeviceId===fromId)));
      if(edge)traced.push(edge);
    }
    layer.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    layer.innerHTML=edges.map(edge=>`<path data-physical-edge="${esc(edge.id)}" d="${edge.path}" class="${edge.radio?'wifi-line':'ethernet-line'}"/>`).join('')+traced.map(edge=>`<path data-observed-path-edge="${esc(edge.id)}" d="${edge.path}" class="observed-line ${state.className}"/>`).join('');
  }
  function renderNetwork() {
    const n = view.network || {};
    if(isGuided()){
      region('network').innerHTML=`<section class='network-card'><h2>Prepared network</h2><p>Jo supplied powered equipment, suitable addresses and service permissions. The booking service runs on Central records.</p><p class='small'>Address plan: ${esc(n.cidr)} · mask ${esc(n.mask)}</p>${button('guided-probe','Test reception bookings',editingBlocked()?'disabled':'','button button-secondary button-full')}<p class='small muted'>Only the reception task is required here. The independent clinic introduces other devices and services.</p></section>`;
      return;
    }
    region('network').innerHTML = `<section class="network-card"><div class="network-card-title">${icon('cable')}<h2>Network card</h2>${badge('Local network','teal')}</div><dl><div><dt>Address plan</dt><dd>${esc(n.cidr || '—')}</dd></div><div><dt>Subnet mask</dt><dd>${esc(n.mask || '—')}</dd></div><div><dt>Shared service host</dt><dd>${esc(n.serverAddress || '—')}</dd></div></dl><p>These tasks stay on the local network. A router or Internet connection is not required.</p><div class="quick-test-row">${button('probe-all',`${icon('pulse')} Run all checks`,'','button button-primary')}${button('open-tests','View test results','','button button-secondary')}</div></section>`;
  }
  const tabItems=[['equipment','grid','Equipment'],['inspect','inspect','Inspect'],['connect','cable','Connect'],['tests','pulse','Tests'],['access','shield','Access'],['wearable','watch','Wearable'],['handover','note','Handover']];
  function renderTabs() {
    region('tabs').innerHTML=tabItems.map(([id,ic,label])=>button('set-panel',`${icon(ic)}<span>${id==='handover'&&(view.training?.kind==='bootcamp'||isGuided())?'Explain':label}</span>`,`data-panel="${id}" aria-current="${id===panel?'page':'false'}"`,'tool-tab')).join('');
  }
  function sectionTitle(kicker,title,description='') { return `<header class="panel-heading"><span class="eyebrow">${esc(kicker)}</span><h2>${esc(title)}</h2>${description?`<p>${esc(description)}</p>`:''}</header>`; }
  function renderTool() {
    const templates={equipment:equipmentPanel,inspect:inspectorPanel,connect:connectionPanel,tests:testsPanel,access:accessPanel,wearable:wearablePanel,handover:handoverPanel};
    region('tool').innerHTML=(templates[panel]||equipmentPanel)();
  }
  function equipmentPanel() {
    const role=ROLES[equipmentRole]||ROLES['role.reception'];
    const chosen=view.devices.find(d=>d.roleId===equipmentRole);
    const copy=(learning.ROLE_BRIEFS||{})[equipmentRole]||{};
    const firstReception=view.training?.kind==='bootcamp'&&view.training.stationIndex===0&&equipmentRole==='role.reception';
    const roleControl=`<label class="field-label" for="equipment-role">Job to equip</label><select id="equipment-role" data-change="equipment-role">${Object.entries(ROLES).map(([id,r])=>opt(id,r.label,equipmentRole)).join('')}</select>`;
    return `${firstReception?sectionTitle('RECEPTION EQUIPMENT','Choose your computer','Compare the options for the reception desk.'):sectionTitle('CHOOSE & COMPARE','Right tool. Right job.','Select a job, compare the equipment, then put your choice to work.')}${firstReception?'':`${roleControl}<div class="context-note"><strong>${esc(copy.title||role.label)}</strong><p>${esc(copy.task||copy.description||role.description)}</p></div>`}<div class="equipment-cards">${role.choices.map(kind=>{const c=CATALOG[kind];return `<article class="equipment-card ${chosen?.kind===kind?'chosen':''}"><div class="equipment-card-top"><div class="catalog-art">${deviceSvg(kind)}</div><div><h3>${esc(c.label)}</h3>${chosen?.kind===kind?badge('Selected','teal'):''}</div></div><p>${esc(c.description)}</p><p class="tradeoff"><strong>Trade-off</strong> ${esc(c.tradeoff)}</p>${button('choose-equipment',`${chosen?.kind===kind?'Inspect choice':'Choose '+c.label} ${icon('arrow')}`,`data-kind="${kind}" data-role="${equipmentRole}"`,'button button-secondary button-full')}</article>`;}).join('')}</div><p class="small muted">Choices change the real model. A suitable alternative can also work.</p>${firstReception?`<details data-disclosure="equipment-other-jobs"><summary>Explore equipment for another job</summary>${roleControl}</details>`:''}${guideLink('guide.devices-paths')}`;
  }
  function devicePicker() {return `<label class="field-label" for="inspect-device">Inspect device</label><select id="inspect-device" data-change="select-device">${view.devices.map(d=>opt(d.id,`${roleName(d.roleId)} — ${deviceName(d)}`,selectedId)).join('')}</select>`;}
  function inspectorPanel() {
    const d=view.devices.find(d=>d.id===selectedId);
    if(!d)return `${sectionTitle('DEVICE INSPECTOR','Choose a device')}<div class="empty-state">${icon('inspect')}<p>Choose equipment or select a device in the room to inspect it.</p>${button('open-equipment','Choose equipment','','button button-primary')}</div>`;
    const c=CATALOG[d.kind]||{};
    const cfg=(!replacementBusy&&drafts.get(view,'configuration',d.id)?.value)||savedConfiguration(view,d.id);
    const cables=(view.cables||[]).filter(x=>x.fromDeviceId===d.id||x.toDeviceId===d.id);
    const aps=view.devices.filter(x=>x.kind==='access-point');
    return `${sectionTitle('DEVICE INSPECTOR',roleName(d.roleId))}${devicePicker()}<div class="inspector-device"><div class="inspector-art">${deviceSvg(d.kind,{powered:d.powered})}</div><div><h3>${esc(deviceName(d))}</h3><p>${esc(locationName(d.locationId))}</p>${badge(d.powered?'Power on':'Power off',d.powered?'teal':'neutral')}</div></div>${button('power-device',`${icon('power')} Turn ${d.powered?'off':'on'}`,`data-device="${d.id}" data-on="${!d.powered}"`,'button button-secondary button-full')}<div class="facts-grid"><div><span>Physical cables</span><strong>${cables.length}</strong></div><div><span>Wi-Fi association</span><strong>${d.wifiApId?'Associated':'Not associated'}</strong></div></div><form data-form="place" class="compact-form"><label class="field-label" for="device-location">Location</label><div class="input-action"><select id="device-location" name="locationId">${LOCATIONS.map(x=>opt(x.id,x.label,d.locationId)).join('')}</select><button class="button button-secondary" type="submit">Move</button></div><input type="hidden" name="deviceId" value="${esc(d.id)}"></form>${d.roleId==='role.nurse'?`<div class="room-moves">${button('move-nurse','Room A','data-location="location.exam-a"','button button-small button-secondary')}${button('move-nurse','Room B','data-location="location.exam-b"','button button-small button-secondary')}</div>`:''}
      <details data-disclosure="ipos-${d.id}" class="ipos"><summary>Input · process · store · output</summary>${c.ipos?`<dl>${Object.entries(c.ipos).map(([k,v])=>`<div><dt>${esc(titleCase(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:`<p>${esc(c.description)}</p>`}<p class="small">${esc(c.tradeoff)}</p></details>
      <section class="inspector-section"><h3>Ports & attachments</h3><ul class="port-list">${(d.ports||[]).map(p=>`<li><span>${esc(p.label||p.id)}<small class="port-identifier">${esc(p.id)}</small></span><span>${p.medium==='wifi'?(d.kind==='access-point'?'Radio capability':d.wifiApId?'Association saved':'Not associated'):p.cableId?'Cable connected':'No cable'}</span></li>`).join('')||'<li>No network ports on this device.</li>'}</ul>${Object.entries(ATTACHMENTS).map(([kind,a])=>{const attached=(d.attachments||[]).includes(kind);return `<div class="attachment-row"><span><strong>${esc(a.label)}</strong><small>${esc(a.description)}</small></span>${button(attached?'detach':'attach',attached?'Remove':'Attach',`data-device="${d.id}" data-kind="${kind}"`,'button button-small button-secondary')}</div>`;}).join('')}</section>
      ${c.wifi && d.kind!=='access-point'?`<form data-form="wifi" class="inspector-section"><h3>Wireless connection</h3><label class="field-label" for="wifi-ap">Access point</label><div class="input-action"><select id="wifi-ap" name="apDeviceId">${opt('','Not associated',d.wifiApId||'')}${aps.map(a=>opt(a.id,deviceName(a),d.wifiApId)).join('')}</select><button type="submit" class="button button-secondary">Apply</button></div><input type="hidden" name="deviceId" value="${d.id}"><p class="small muted">Association alone does not prove the service is reachable.</p></form>`:''}
      ${['role.reception','role.nurse','role.records'].includes(d.roleId)?`<form data-form="address" class="inspector-section"><h3>Static address</h3><label class="field-label" for="device-address">IPv4 address</label><input id="device-address" name="address" type="text" inputmode="decimal" data-config-device="${d.id}" data-config-field="address" ${editingBlocked()?'readonly aria-readonly="true"':''} value="${esc(cfg.address)}" autocomplete="off" spellcheck="false" aria-describedby="address-help"><label class="field-label" for="device-mask">Subnet mask</label><input id="device-mask" name="mask" type="text" inputmode="decimal" data-config-device="${d.id}" data-config-field="mask" ${editingBlocked()?'readonly aria-readonly="true"':''} value="${esc(cfg.mask)}" autocomplete="off" spellcheck="false"><p id="address-help" class="small muted">Compare with the network card. Use an unused host address. This model uses manual assignment.</p><input type="hidden" name="deviceId" value="${d.id}"><button type="submit" class="button button-primary button-full">Apply address</button></form>`:''}
      ${d.roleId==='role.records'?`<section class="inspector-section"><h3>Shared applications</h3><p>${view.serverEnabled?'Service software is enabled. Test to check reachability and permission.':'The shared applications are stopped.'}</p>${button('service-state',view.serverEnabled?'Stop services':'Start services',`data-enabled="${!view.serverEnabled}"`,'button button-secondary button-full')}</section>`:''}
      <div class="inspector-section">${button('open-connect',`${icon('cable')} Connect equipment`,'','button button-secondary button-full')}${button('remove-device','Remove this device',`data-device="${d.id}"`,'text-button danger-text')}</div>${guideLink('guide.addressing-diagnosis')}`;
  }
  function connectionPanel() {
    const wired=view.devices.filter(d=>(d.ports||[]).some(p=>p.medium==='ethernet'));
    if(!wired.some(d=>d.id===connection.fromDeviceId))connection.fromDeviceId=wired[0]?.id||'';
    if(!wired.some(d=>d.id===connection.toDeviceId))connection.toDeviceId=wired.find(d=>d.id!==connection.fromDeviceId)?.id||'';
    const from=wired.find(d=>d.id===connection.fromDeviceId),to=wired.find(d=>d.id===connection.toDeviceId);
    const ports=d=>(d?.ports||[]).filter(p=>p.medium==='ethernet');
    if(!ports(from).some(p=>p.id===connection.fromPortId))connection.fromPortId=ports(from).find(p=>!p.cableId)?.id||ports(from)[0]?.id||'';
    if(!ports(to).some(p=>p.id===connection.toPortId))connection.toPortId=ports(to).find(p=>!p.cableId)?.id||ports(to)[0]?.id||'';
    const endpoint=(dev,port)=>{const d=view.devices.find(d=>d.id===dev);return `${roleName(d?.roleId)} · ${d?.ports?.find(p=>p.id===port)?.label||port}`;};
    return `${sectionTitle('CABLES & CONNECTIONS','Make the link','Pick the two actual ports. The simulation checks compatibility and availability.')}<form data-form="connect" class="wire-form"><fieldset><legend>From</legend><label for="cable-from-device">Device</label><select id="cable-from-device" name="fromDeviceId" data-change="wire-device" data-end="from">${wired.map(d=>opt(d.id,`${roleName(d.roleId)} — ${deviceName(d)}`,connection.fromDeviceId)).join('')}</select><label for="cable-from-port">Ethernet port</label><select id="cable-from-port" name="fromPortId" data-change="wire-port" data-end="from">${ports(from).map(p=>opt(p.id,`${p.label}${p.cableId?' — occupied':''}`,connection.fromPortId)).join('')}</select></fieldset><div class="wire-divider">${icon('cable')} Ethernet cable</div><fieldset><legend>To</legend><label for="cable-to-device">Device</label><select id="cable-to-device" name="toDeviceId" data-change="wire-device" data-end="to">${wired.map(d=>opt(d.id,`${roleName(d.roleId)} — ${deviceName(d)}`,connection.toDeviceId)).join('')}</select><label for="cable-to-port">Ethernet port</label><select id="cable-to-port" name="toPortId" data-change="wire-port" data-end="to">${ports(to).map(p=>opt(p.id,`${p.label}${p.cableId?' — occupied':''}`,connection.toPortId)).join('')}</select></fieldset><button type="submit" class="button button-primary button-full" ${wired.length<2?'disabled':''}>${icon('cable')} Connect ports</button></form><p class="small muted">Laptops need an explicit Ethernet adapter for a wired port. Use Inspect to add it or join Wi-Fi.</p><section class="inspector-section"><h3>Existing cables <span class="tiny-count">${(view.cables||[]).length}</span></h3>${(view.cables||[]).length?(view.cables||[]).map(c=>`<div class="cable-item"><p>${esc(endpoint(c.fromDeviceId,c.fromPortId))}<span>↔</span>${esc(endpoint(c.toDeviceId,c.toPortId))}</p>${button('disconnect','Disconnect',`data-cable="${c.id}"`,'button button-small button-secondary')}</div>`).join(''):'<p class="muted">No cables yet.</p>'}</section>${button('open-inspector',`${icon('wifi')} Inspect Wi-Fi & adapters`,'','button button-secondary button-full')}${guideLink('guide.devices-paths')}`;
  }
  function testsPanel() {
    const tests=[['reception','Reception bookings'],['nurse','Nurse workspace'],['nurse-bookings','Nurse bookings'],['access','Role access checks'],['upload','Marker intake path']];
    return `${sectionTitle('DIAGNOSTICS','Test. Inspect. Retest.','A physical connection, a usable address and permission are different checks.')}<div class="test-actions">${tests.map(([id,label])=>button('probe',`${icon('pulse')}${label}`,`data-test="${id}"`,'button button-secondary button-full')).join('')}${button('probe-all',`${icon('check')} Run all checks`,'','button button-primary button-full')}</div><div class="results-heading"><h3>Observed results</h3><span class="small muted">Newest first</span></div><div class="diagnostic-results">${(view.diagnostics||[]).slice(0,24).map(result=>{const state=observationState(result);return `<article class="diagnostic ${state.className}"><div class="diagnostic-top">${badge(state.label,state.tone)}<span>rev ${esc(result.testedTechnicalRevision)}</span></div><h4>${esc(result.label||result.testId)}</h4><p>${esc(result.message)}</p><details data-disclosure="test-${result.id}"><summary>Test details and recorded path</summary><dl class="test-meta"><div><dt>Reason</dt><dd>${esc(result.code)}</dd></div><div><dt>Service</dt><dd>${esc(LABELS[result.serviceId]||result.serviceId||'—')}</dd></div><div><dt>Role</dt><dd>${esc(LABELS[result.actorRoleId]||result.actorRoleId||'—')}</dd></div>${result.contextLocationId?`<div><dt>Room context</dt><dd>${esc(locationName(result.contextLocationId))}</dd></div>`:''}<div><dt>Observed by</dt><dd>${esc(result.origin||'player test')}</dd></div><div><dt>Current revision</dt><dd>${esc(view.attempt?.technicalRevision)}</dd></div></dl>${observedPathMarkup(result)}</details>${result.stale?'<p class="stale-note">Configuration changed. This earlier result does not establish current success. Run a fresh test.</p>':''}</article>`;}).join('')||`<div class="empty-state">${icon('pulse')}<h3>No observations yet</h3><p>Run a test to see what the model actually does.</p></div>`}</div>${guideLink('guide.addressing-diagnosis')}`;
  }
  function accessPanel() {
    const current=view.policy?.id||view.attempt?.policyId||'';
    const matrix=view.policy?.matrix||{};
    return `${sectionTitle('PERMISSIONS & PEOPLE','Who can do what?','Keep useful work possible while limiting unnecessary access. Test both allowed and denied requests.')}<div class="policy-cards">${Object.entries(POLICIES).map(([id,p])=>{const copy=(learning.POLICY_COPY||{})[id]||{};return `<article class="policy-card ${id===current?'chosen':''}"><h3>${esc(copy.title||p.label)}</h3><p>${esc(copy.description||p.description)}</p>${copy.benefit?`<p class="small"><strong>Benefit:</strong> ${esc(copy.benefit)}</p>`:''}${copy.tradeoff?`<p class="small"><strong>Trade-off:</strong> ${esc(copy.tradeoff)}</p>`:''}${button('set-policy',id===current?'Selected policy':'Apply this policy',`data-policy="${id}" aria-pressed="${id===current}"`,'button button-secondary button-full')}</article>`;}).join('')}</div><details data-disclosure="access-matrix"><summary>Current permission matrix</summary><div class="matrix-scroll"><table class="permission-matrix"><caption>Allowed service operations by simulated role</caption><thead><tr><th scope="col">Role</th><th scope="col">Bookings</th><th scope="col">Workspace</th><th scope="col">Submit markers</th></tr></thead><tbody>${Object.entries(matrix).map(([role,services])=>`<tr><th scope="row">${esc(LABELS[role]||role)}</th>${['service.bookings','service.workspace','service.marker-intake'].map(s=>`<td>${services.includes(s)?'Allow':'Deny'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>${button('probe',`${icon('shield')} Test access rules`,'data-test="access"','button button-primary button-full')}<p class="small muted">A disconnected service cannot prove that permissions protect it.</p>${guideLink('guide.access-handover')}`;
  }
  function wearablePanel() {
    const w=view.wearable||{};
    const d=view.devices.find(x=>x.roleId==='role.monitor');
    return `${sectionTitle('THE WEARABLE JOURNEY','Collect. Return. Transfer.','This pilot collects generic test markers at home, then syncs after return. It does not model live health monitoring.')}<div class="wearable-feature">${deviceSvg('wearable')}<div><strong>${d?esc(locationName(d.locationId)):'No wearable selected'}</strong><span>No patient names or medical readings</span></div></div><ol class="journey"><li><span class="journey-num">1</span><div><h3>Collect at home</h3><p>Seven synthetic day markers, in one compressed practice check.</p><strong>${(w.collected||[]).length} marker(s) collected</strong>${button('collect','Run collection check','','button button-secondary button-full')}</div></li><li><span class="journey-num">2</span><div><h3>Return to the clinic</h3><p>The home location is outside clinic Wi-Fi.</p>${badge(w.returned?'Returned':'Not returned',w.returned?'teal':'neutral')}${button('return-wearable','Return wearable','','button button-secondary button-full')}</div></li><li><span class="journey-num">3</span><div><h3>Use a sensor dock</h3><p>Attach the compatible sensor dock to the nurse’s device, then transfer the stored markers.</p><strong>${(w.handedOff||[]).length} marker(s) handed off</strong>${button('inspect-nurse','Inspect nurse & dock','','text-button')}${button('handoff','Transfer through dock','','button button-secondary button-full')}</div></li><li><span class="journey-num">4</span><div><h3>Upload to the service</h3><p>The companion needs a working path and submit-only permission.</p><strong>${(w.receipts||[]).length} marker receipt(s)</strong>${button('upload','Upload test markers','','button button-primary button-full')}</div></li></ol>${guideLink('guide.access-handover')}`;
  }
  function explanationValues(key) {return (!replacementBusy&&drafts.get(view,'explanation',key)?.value)||savedExplanation(view,key);}
  function explanationField(prompt) {
    const value=explanationValues(prompt.key);
    return `<fieldset class="explanation-field"><legend>${esc(prompt.title)}</legend><label for="explanation-${prompt.key}">${esc(prompt.prompt)}</label><textarea id="explanation-${prompt.key}" data-explanation="${prompt.key}" ${editingBlocked()?'readonly aria-readonly="true"':''} rows="4" maxlength="2000" placeholder="${esc(prompt.placeholder||'Explain in your own words…')}">${esc(value.text)}</textarea><label class="checkbox-label"><input type="checkbox" data-oral="${prompt.key}" ${editingBlocked()?'disabled':''} ${value.oral?'checked':''}>${esc(prompt.oralLabel||'I will explain this to my teacher — review pending.')}</label><small>Up to 2,000 characters. Saves after a short pause. Recorded text or an oral-review arrangement is evidence for teacher review; its quality is not automatically graded.</small></fieldset>`;
  }
  function handoverPanel() {
    if(isGuided())return `${sectionTitle('GUIDED PRACTICE EVIDENCE','Your connection explanation','Use the tests and change you actually observed. This explanation belongs only to this guided attempt.')}<p class='small'>The explanation editor is in Jo’s current lesson card, so there is one saved draft.</p>${button('guided-edit-explanation','Open my explanation','','button button-primary button-full')}${button('export-text','Export guided evidence','','button button-secondary button-full')}${button('preview-evidence','Preview evidence','','text-button')}`;
    const prompts=arr(learning.EXPLANATION_PROMPTS||[]);
    const defaults=[{key:'equipment',title:'Equipment choices',prompt:'Why do your choices fit the four jobs? Compare an alternative and name a trade-off.'},{key:'repair',title:'Diagnosis and repair',prompt:'What caused the problem, what supported your change, and what did the retest show?'},{key:'privacy',title:'People and permissions',prompt:'Who can do what? Explain a benefit, a barrier and what would change your recommendation.'},{key:'limitations',title:'Limits of the model',prompt:'What would a real deployment still need checked?'}];
    const e=view.economy||{};
    if(isUplinkTransfer()){
      const copy=learning.UPLINK_TRANSFER||{};
      const prompt={key:'repair',title:copy.title||'Explain the unplugged-uplink repair',prompt:copy.prompt||'What stopped the nurse’s workspace test? What did you change, and what did the retest show? Why would changing only the IP address leave this fault?',placeholder:copy.placeholder||'Use the failure, connection change and retest you actually observed.',oralLabel:copy.oralLabel||'I will explain this to my teacher — review pending.'};
      return `${sectionTitle('CHANGED EXAMPLE / REPAIR EVIDENCE','Why did this repair work?','Use your own observation and retest. A written response or an arranged oral explanation is required; your teacher reviews its quality.')}<div class="handover-state">${badge(view.training.canAdvance?'Transfer checks recorded':'Transfer evidence in progress',view.training.canAdvance?'teal':'neutral')}<p>${esc(view.training.goal||'Test the fault, make the physical repair, retest and explain why the change mattered.')}</p></div>${editingBlocked()?'<p class="context-note">This tab cannot edit while another tab has control or progress is reconnecting. Recorded-state exports and unsaved-draft rescue remain available.</p>':''}${explanationField(prompt)}${button('save-explanations',`${icon('save')} Save repair explanation`,'','button button-primary button-full')}${button('open-tests','Review the observed tests','','button button-secondary button-full')}${button('export-text','Export readable evidence','','text-button')}${drafts.size?button('export-draft','Download unsaved draft','','text-button'):''}<p class="small muted">This explanation belongs to this practice attempt. It does not write or replace the separate client handover.</p>`;
    }
    if(view.training?.kind==='bootcamp'&&view.training.stationIndex===2){
      const prompt=prompts.find(item=>item.key==='privacy')||defaults.find(item=>item.key==='privacy');
      const saved=view.explanations?.privacy||{};
      const contextChanged=saved.contextRevision!==view.attempt?.policyRevision&&!!(saved.text?.trim()||saved.oral);
      const unfinished=(view.training.checks||[]).filter(check=>!check.met);
      const recorded=view.training.canAdvance||view.training.completed;
      return `${sectionTitle('BOOTCAMP / PEOPLE & ACCESS','Explain your access decision','Use your current policy and the access tests you observed. Explain the effect on people in your own words.')}<div class="handover-state">${badge(recorded?'Practice checks recorded':'Access practice in progress',recorded?'teal':'neutral')}<p>${view.training.phase==='demo'?'This is a trainer demonstration. Your own practice is still required.':unfinished.length?esc(unfinished.map(check=>check.label).join(' · ')):'The current practice checks are recorded. Your teacher still reviews the reasoning.'}</p></div><div class="context-note"><strong>Current policy: ${esc(view.policy?.label||'Not supplied')}</strong><p>${esc(view.policy?.description||'Review the current permissions in the Access tool.')}</p></div>${editingBlocked()?'<p class="context-note">This tab cannot edit while another tab has control or progress is reconnecting. Recorded-state exports and unsaved-draft rescue remain available.</p>':''}${explanationField(prompt)}${button('save-explanations',`${icon('save')} Save access explanation`,'','button button-primary button-full')}${contextChanged?`<p class="context-note">The policy changed after this explanation was recorded. Read it against the current permissions, then edit it or confirm that it still matches.</p>${button('review-context','I reviewed my explanation against this policy','','button button-secondary button-full')}`:''}${button('probe','Retest access rules','data-test="access"','button button-secondary button-full')}${button('open-tests','Review observed access tests','','text-button')}<div class="handover-actions">${button('export-text','Export readable practice evidence','','button button-secondary button-full')}${button('export-json','Export evidence JSON','','text-button')}${button('preview-evidence','Preview evidence','','text-button')}${drafts.size?button('export-draft','Download unsaved draft','','text-button'):''}</div><p class="small muted">This station asks for your access reasoning, in writing or by an arranged teacher discussion. It does not require the client job’s four-part handover. No grade is calculated.</p>`;
    }
    return `${sectionTitle('EVIDENCE HANDOVER','Leave a useful handover','Your actions and results are captured. Add your own reasoning for the teacher. Do not include names or personal information.')}<div class="handover-state">${badge(view.ready?'Ready for handover':'Work in progress',view.ready?'teal':'neutral')}<p>${view.ready?'The engine’s current requirements are met. Your teacher still reviews understanding.':esc((view.missing||[]).slice(0,3).join(' · ')||'Complete and explain the work, then request a final check.')}</p></div>${editingBlocked()?'<p class="context-note">This tab cannot edit explanations while another tab has control or progress is reconnecting. Recorded-state exports remain available.</p>':''}${drafts.size?`<p class="context-note">Unsaved editor drafts are separate from recorded simulation evidence. ${button('export-draft','Download unsaved draft','','text-button')}</p>`:''}<div class="explanation-forms">${(prompts.length?prompts:defaults).map(explanationField).join('')}</div>${button('save-explanations',`${icon('save')} Save explanations`,'','button button-secondary button-full')}${button('review-context','I reviewed my access explanation against this policy','','button button-secondary button-full')}<p class="small muted">Use the review button only after checking your explanation still matches the current permissions.</p><div class="handover-actions">${view.mode==='client'?button('handover',`${icon('check')} Run final checks & hand over`,'','button button-primary button-full'):''}${view.mode==='client'&&e.delivered&&!e.settled?button('settle',`${icon('coin')} Settle this contract`,'','button button-primary button-full'):''}${view.mode==='client'&&e.settled?`<div class="receipt"><strong>Contract settled</strong><p>Gross fee: ${esc(e.gross)} · Guide costs: ${esc(e.reserved)} · Net payment: ${esc(e.net)} fictional credits</p><p>${esc(e.minutes)} extra simulated consultation minutes</p></div>`:''}${button('export-text',`${icon('download')} Export readable evidence`,'','button button-secondary button-full')}${button('export-json','Export evidence JSON','','text-button')}${button('preview-evidence','Preview evidence','','text-button')}</div><p class="small muted">Incomplete attempts can be exported. Local files are editable evidence, not tamper-proof records or an IB grade.</p>`;
  }
  function guideLink(sectionId) {return `<div class="guide-prompt">${icon('book')}<div><strong>Need a method?</strong><p>${view.mode==='training'?'All practice guidance is free.':'Optional technical guidance has a disclosed fictional cost.'}</p>${button('guide',view.mode==='training'?'Open free guide':'Technical guide — see cost',`data-section="${sectionId}"`,'text-button')}</div></div>`;}
  function renderPhonePreview() {
    const m=(view.messages||[]).at(-1);
    region('phone-preview').hidden=!!introStage||isGuided();
    region('phone-preview').innerHTML=`<div class="phone-mini-icon">${icon('phone')}</div><div><span class="eyebrow">YOUR WORK PHONE</span><h3>${m?esc(m.speaker||'Clinic team'):'Ari · upcoming clinic job'}</h3><p>${m?esc(m.text?.slice(0,115)+(m.text?.length>115?'…':'')):'“When you’re ready, our team needs you at Riverbend.”'}</p>${button('phone','Read messages '+icon('arrow'),'','text-button')}</div>`;
  }
  function renderFooter() {
    region('footer').innerHTML=`<span>Connect the Clinic ${esc(BUILD_VERSION)} · Original educational simulation · No accounts · No real patient data</span><span>Local saves belong to this browser and site. ${button('help','Save limitations','','text-button')}</span>`;
  }
  function openModal(type) {
    // A nested panel replaces its parent; retain the persistent outer trigger.
    if(!modal)modalFocusKey=saveFocus(); modal=type; renderModal();
    requestAnimationFrame(()=>{const el=region('modal').querySelector('[data-modal]');(el?.querySelector('[data-initial-focus]')||el?.querySelector('button,select,input,textarea,[tabindex="0"]')||el)?.focus();});
  }
  function clearPastedBackup() {
    progressPasteText='';progressPasteMessage='';
    if(pendingImportSource==='paste'){pendingFile=null;pendingImportSource=null;}
  }
  function closeModal({preservePaste=false}={}) {
    if(!preservePaste&&(modal==='paste-progress'||pendingImportSource==='paste'))clearPastedBackup();
    modal=null;pendingReplacement=null;region('modal').innerHTML='';
    if(!restoreFocus(modalFocusKey)){
      const fallback=root.querySelector('[data-action="open-menu"]')||root.querySelector('h1');
      if(fallback){if(!fallback.matches('button,a'))fallback.setAttribute('tabindex','-1');fallback.focus({preventScroll:true});}
    }
    modalFocusKey=null;
  }
  function modalShell(title,body,wide=false) {return `<div class="modal-backdrop"><section class="modal ${wide?'modal-wide':''}" data-modal role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><header class="modal-header"><div><span class="eyebrow">FIELDWORK / CONNECT THE CLINIC</span><h2 id="modal-title">${esc(title)}</h2></div>${button('close-modal',icon('close'),'aria-label="Close panel" data-initial-focus','icon-button')}</header><div class="modal-body">${body}</div></section></div>`;}
  function renderModal() {
    if(!modal){region('modal').innerHTML='';return;}
    let title='',body='',wide=false;
    if(modal==='phone'&&isGuided()){
      title='Jo · guided connection';
      const current=guidedLessonContents();
      body=`<div class='phone-person'><span class='portrait'>${portraitSvg('jo')}</span><div><strong>Jo</strong><span>Field mentor · help is free</span></div></div><h3>${esc(current.title)}</h3><p>${esc(current.body)}</p><p class='small muted'>This is the guided practice conversation. The independent Riverbend client job comes after bootcamp.</p>${button('close-modal','Return to the lesson','','button button-primary')}`;
    }else if(modal==='phone'){
      title='Jobs & messages';wide=true;
      body=`<div class="inbox-layout"><aside class="inbox-sidebar"><div class="inbox-thread current">${icon('phone')}<span><strong>Riverbend Clinic</strong><small>First client contract</small></span></div>${button('brief','View the complete brief','','button button-secondary button-full')}${button('guide','Technical guide','data-section="guide.devices-paths"','button button-secondary button-full')}</aside><div class="message-thread"><div class="message-thread-heading"><h3>The clinic team</h3><span class="small muted">Messages stay here. No response timer.</span></div>${(view.messages||[]).map(m=>`<article class="message ${m.read?'read':''}"><div class="avatar" aria-hidden="true">${esc((m.speaker||'Team').charAt(0))}</div><div class="message-body"><div class="message-heading"><strong>${esc(m.speaker||'Clinic team')}</strong>${m.stale?badge('Earlier observation','neutral'):''}${!m.read?badge('Unread','teal'):''}</div><p>${esc(m.text)}</p>${m.revision!==undefined&&m.revision!==null?`<span class="small muted">Observation revision ${esc(m.revision)}</span>`:''}${!m.read?button('read-message','Mark read',`data-message="${esc(m.id)}"`,'text-button'):''}</div></article>`).join('')||`<div class="empty-state">${icon('phone')}<h3>Your first job is waiting</h3><p>Complete free bootcamp, then open Riverbend’s client brief.</p>${button('brief','Read the clinic brief','','button button-primary')}</div>`}</div></div>`;
    }else if(modal==='brief'){
      title='The Riverbend brief';const b=learning.CLIENT_BRIEF||learning.CLINIC_BRIEF||{};
      body=`<div class="brief-intro"><span class="badge teal">CLIENT JOB 01</span><h3>${esc(b.title||'Connect the Clinic')}</h3><p>${esc(b.summary||b.text||b.description||'Choose equipment for four jobs, connect it, solve a fault and explain who can access the services.')}</p></div><div class="brief-jobs">${arr(b.jobs).map((j,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><h4>${esc(typeof j==='string'?['Reception','Mobile nurse','Home monitor','Central services'][i]:(j.label||j.title))}</h4><p>${esc(typeof j==='string'?j:(j.task||j.text))}</p></div>`).join('')}</div>${b.requirements?.length?`<h3>What the client needs</h3><ul>${b.requirements.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`:''}<div class="context-note">${view.mode==='training'?'<strong>This is free practice</strong><p>All guide sections cost 0 credits in this attempt, and it earns no fee. Any saved client job and its contract terms stay separate.</p>':'<strong>Fictional contract terms</strong>'}<p>${view.mode==='training'?'For a paid client job: service fee':'Service fee'}: 120 credits. Optional technical guides reserve 5 credits and add 3 simulated minutes per section, once per contract; maximum 15 credits and 9 minutes. All tiers and reopens are included. Actual reading time is free.</p><p>Guide reservations are deducted at settlement after delivery. Controls help, glossary, diagnostics, accessibility, bootcamp and export remain free.</p></div>${b.boundaries?.length?`<details><summary>What this pilot deliberately leaves out</summary><ul>${b.boundaries.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></details>`:''}${view.mode==='training'?`<div class="modal-actions">${view.training?.kind==='bootcamp'&&view.training.completed?button('start-client','Accept the clinic job '+icon('arrow'),'','button button-primary'):button('close-modal','Return to practice','','button button-primary')}</div>`:''}`;
    }else if(modal==='guide'){
      title=view.mode==='training'?'Free practice guide':'Technical guide';wide=true;
      const sections=arr(learning.GUIDE_SECTIONS||[]);
      const q=(view.guideQuotes||[]).find(x=>x.sectionId===guideSection);
      const baseSection=sections.find(x=>x.id===guideSection)||{id:guideSection,title:q?.label||'Technical guidance',hints:[]};
      const s=guideSection==='guide.addressing-diagnosis'&&view.training?.transferKind==='physical-uplink'&&learning.UPLINK_TRANSFER?{...baseSection,hints:learning.UPLINK_TRANSFER.hints}:baseSection;
      const granted=q?.alreadyGranted;
      const tier=view.hints?.[guideSection]??view.attempt?.hints?.[guideSection]??0;
      body=`<div class="guide-layout"><nav class="guide-nav" aria-label="Guide sections">${(view.guideQuotes||[]).map(g=>button('select-guide',`<strong>${esc(g.label)}</strong><small>${g.alreadyGranted?'Available · no further charge':g.credits===0?'Free':`${g.credits} credits + ${g.minutes} simulated min`}</small>`,`data-section="${g.sectionId}" aria-current="${g.sectionId===guideSection?'page':'false'}"`,'guide-nav-button')).join('')}</nav><div class="guide-article"><span class="eyebrow">OPTIONAL HOW-TO GUIDANCE</span><h3>${esc(s.title||s.label)}</h3><p>${esc(s.summary||'Use a structured method, then make the decision yourself.')}</p>${!granted?`<div class="guide-quote"><h4>${q?.credits===0?'Free guidance':`Reserve ${esc(q?.credits??5)} fictional credits + ${esc(q?.minutes??3)} simulated minutes`}</h4><p>${q?.credits===0?esc(q.freeReason||'Available free in practice or delivered-contract review.'):'Includes every hint in this section. Reopening is free. Credits are deducted from the 120-credit fee at settlement after successful delivery. Reading time is not timed.'}</p>${q?.credits>0?`<p><strong>Projected net fee: ${esc(q.netFee)} credits</strong></p>`:''}${button('consult-guide',q?.credits===0?'Open free guidance':`Consult guide — reserve ${q?.credits??5} credits + add ${q?.minutes??3} simulated min`,`data-section="${guideSection}"`,'button button-primary button-full')}</div>`:`<div class="guide-included">${icon('check')} This section is available. All hints and reopens are included.</div><div class="hint-ladder">${arr(s.hints).map((h,i)=>{const ht=h.tier||i+1;return `<section class="hint-tier"><div><span class="tier-number">${ht}</span><h4>${esc(h.title||['Orient','Inspect','Compare evidence'][i]||'Next hint')}</h4></div>${ht<=tier?`<p>${esc(h.text||h)}</p>`:button('reveal-hint',`Show ${ht===1?'first':'next'} hint — included`,`data-section="${guideSection}" data-tier="${ht}" ${ht>tier+1?'disabled':''}`,'button button-secondary')}</section>`;}).join('')}</div>`}<p class="small muted">Guidance does not change the client’s settings. Keep working with the evidence.</p>${button('help','Open free controls help & glossary','','text-button')}</div></div>`;
    }else if(modal==='help'){
      title='Free help & glossary';wide=true;
      body=`<section class="guided-help-entry"><h3>Learn your first connection</h3><p>Practise one cable, a real service test and a repair with Jo. Your current work stays saved separately.</p>${button(isGuided()?'close-modal':'start-guided',isGuided()?'Return to guided lesson':'Guided connection lesson',!isGuided()&&editingBlocked()?'disabled':'','button button-primary')}</section><div class="help-grid"><section><h3>Workbench controls</h3><ol><li><strong>Equipment:</strong> choose a computing job, compare devices and select one.</li><li><strong>Inspect:</strong> select a device, turn it on, check its ports, attach an adapter or configure its address.</li><li><strong>Connect:</strong> choose two devices and their actual Ethernet ports. Use Inspect for Wi-Fi.</li><li><strong>Tests:</strong> run a task test. Read its reason, make a targeted change, then retest.</li><li><strong>Access and Wearable:</strong> test role permissions and the collection-to-upload journey.</li><li><strong>Handover:</strong> explain your choices and export the evidence.</li></ol><p>Every action works with keyboard and forms. Dragging and audio are unnecessary. Use Tab to move, Enter or Space to activate, and Escape to close a panel.</p><h3>Saving on school devices</h3><p>Progress belongs to this browser profile, this device and this exact site. Private browsing, clearing site data or school profile cleanup can remove it. Download progress to keep a copy and import it here later.</p><p>A shared browser profile can show the next user your attempt. Export your work, then clear this game’s local data when finished.</p><h3>Practice and support</h3><p>Bootcamp, teacher-selected clinic practice, delivered-clinic review, controls, definitions, diagnostics, accessibility and evidence export are free. Teacher-selected clinic practice earns no credits and preserves a separate client job. It is a local classroom setting, not authenticated teacher access. Optional contextual technical guides in active client work have clearly displayed fictional costs. No real money or AI service is involved.</p></section><section><h3>Words to know</h3><dl class="glossary">${arr(learning.GLOSSARY||[]).map(g=>`<div><dt>${esc(g.term||g.title)}</dt><dd>${esc(g.definition||g.text)}</dd></div>`).join('')}</dl></section></div>`;
    }else if(modal==='menu'){
      title='Progress & recovery';body=`<p>Save an editable progress file for this browser game. Evidence is a separate summary for your teacher.</p><div class="stack-actions">${button('export-progress',`${icon('download')} Download progress JSON`,'','button button-primary button-full')}${button('import-file','Import saved progress','','button button-secondary button-full')}${button('paste-backup','Paste backup JSON','','button button-secondary button-full')}${button('export-text','Export readable evidence','','button button-secondary button-full')}${button('reset','Restart this attempt','','button button-secondary button-full')}${button('clear','Clear this game’s local data','','text-button danger-text')}</div><p class="small muted">Imported progress replaces the current campaign; it does not add balances together. Do not edit files to create a grade or teacher approval.</p>`;
    }else if(modal==='paste-progress'){
      title='Paste a progress backup';
      body=`<p>Use this option when the file picker is unavailable. Paste the complete contents of a <strong>progress backup JSON</strong> file downloaded by this game.</p><p class="small">Evidence JSON is a teacher report, not an editable progress backup. The pasted text stays in this browser tab. This route uses no file picker and does not upload the text. It is cleared when you cancel or successfully import.</p><label class="field-label" for="progress-paste-json">Progress backup JSON</label><textarea id="progress-paste-json" class="backup-json-field" data-progress-paste rows="10" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="progress-paste-help${progressPasteMessage?' progress-paste-error':''}" ${progressPasteMessage?'aria-invalid="true"':''}>${esc(progressPasteText)}</textarea><p id="progress-paste-help" class="small muted">Maximum 1 MiB, measured as UTF-8 bytes. Review the backup, then confirm its import. The existing file-size and saved-progress validator will check it before anything is replaced. Pasting or reviewing alone does not save changes.</p>${progressPasteMessage?`<p id="progress-paste-error" class="feedback error" role="alert">${esc(progressPasteMessage)}</p>`:''}${editingBlocked()?'<p class="context-note">This tab cannot import while another tab has control or progress is reconnecting. Take control before importing. Current work remains unchanged.</p>':''}<div class="modal-actions">${button('review-paste-import','Review pasted backup',editingBlocked()?'disabled':'','button button-primary')}${button('close-modal','Cancel — clear pasted backup','','button button-secondary')}</div>`;
    }else if(modal==='reset'||modal==='clear'){
      const clear=modal==='clear';title=clear?'Clear local game data?':'Restart this attempt?';body=`<p>${clear?'This clears this game’s local campaign and starts fresh. Export first if you want to keep the work. Other websites’ data is untouched.':'The current technical work will restart. Existing logical-contract guide reservations and payment history are preserved; a delivered contract becomes free practice.'}</p><div class="stack-actions">${button('export-progress','Export progress first','','button button-secondary button-full')}${button(clear?'confirm-clear':'confirm-reset',clear?'Clear this game':'Restart attempt','','button button-danger button-full')}${button('close-modal','Cancel','','button button-secondary button-full')}</div>`;
    }else if(modal==='import-confirm'){
      title='Replace current progress?';body=`<p>Import <strong>${esc(pendingFile?.name||'the selected file')}</strong> as one complete saved campaign. Validation must succeed before current work is replaced.</p>${pendingImportSource==='paste'?`<p class="small">Pasted backup: ${esc(pendingFile?.size??0)} UTF-8 bytes. Evidence JSON cannot be used as an editable progress backup.</p>`:''}<div class="stack-actions">${button('export-progress','Export current progress first','','button button-secondary button-full')}${button('confirm-import',pendingImportSource==='paste'?'Import this pasted backup':'Import this progress file',pendingImportSource==='paste'&&editingBlocked()?'disabled':'','button button-primary button-full')}${pendingImportSource==='paste'?button('edit-pasted-backup','Edit pasted JSON','','button button-secondary button-full'):''}${button('close-modal',pendingImportSource==='paste'?'Cancel — clear pasted backup':'Cancel','','button button-secondary button-full')}</div>`;
    }else if(modal==='draft-guard'){
      title='Keep your unsaved draft?';
      body=`<p>You have explanation text or address-form changes that are not recorded in the simulation. ${esc(pendingReplacement?.label||'Continuing')} will load or create another state.</p><p>Download the draft first if you need it. It is labelled unapplied and is separate from progress and teacher evidence; it will never be merged into the loaded state automatically.</p><div class="stack-actions">${button('export-draft','Download unsaved draft','','button button-primary button-full')}${button('confirm-draft-discard','Discard my unsaved draft and continue','','button button-danger button-full')}${button('close-modal','Cancel — keep my draft','','button button-secondary button-full')}</div>`;
    }else if(modal==='prior-learning'){
      title='Teacher-directed prior learning';body=`<p>This starts the client job using your teacher’s prior-learning direction. It records that route; it does not claim you completed bootcamp or demonstrated mastery.</p><p>Use the free bootcamp if you have not been directed to begin this way.</p><div class="modal-actions">${button('confirm-prior-learning','Begin with teacher-directed prior learning','','button button-primary')}${button('close-modal','Return to bootcamp','','button button-secondary')}</div>`;
    }else if(modal==='clinic-practice'){
      title='Teacher-selected clinic practice';body=`<p>Open the full clinic with free guidance and zero earnings. Any paid client attempt, guide reservations and payment history stay saved separately, ready to resume.</p><p>This is a local classroom setting. It does not verify who is a teacher or restrict access. Practice cannot settle a contract or complete bootcamp stations.</p><div class="modal-actions">${button('confirm-clinic-practice','Start free clinic practice','','button button-primary')}${button('close-modal','Keep current attempt','','button button-secondary')}</div>`;
    }else if(modal==='evidence'){
      title='Evidence preview';wide=true;const evidence=getEvidence();body=`<p>Automatically recorded facts and recorded explanations are kept separate. No grade is calculated.</p>${drafts.size?`<p>Unapplied editor drafts are not included. ${button('export-draft','Download unsaved draft','','text-button')}</p>`:''}<pre class="evidence-preview">${esc(evidence.text||'')}</pre><div class="modal-actions">${button('export-text','Download readable evidence','','button button-primary')}${button('export-json','Download evidence JSON','','button button-secondary')}</div>`;
    }
    region('modal').innerHTML=modalShell(title,body,wide);
  }

  async function act(action, {quiet=false,after}={}) {
    if(busy){busyRetryRequested=true;const message='The previous action is still saving. This later action was not applied; try it again when saving finishes.';showStatus(message,'info');return {accepted:false,code:'UI_BUSY',message};}
    busy=true;root.setAttribute('aria-busy','true');
    try {
      const result=await send(action);
      if(!quiet)showStatus(result?.message|| (result?.accepted?'Action recorded.':'That action was not accepted.'),result?.accepted?'info':'error');
      if(result?.accepted&&after)await after(result);
      render();
      return result;
    } catch(error) {showStatus(error?.message||'The action could not be completed. Your current work is retained.','error');return {accepted:false,error};}
    finally {busy=false;root.removeAttribute('aria-busy');if(busyRetryRequested){busyRetryRequested=false;showStatus('The previous action has finished. Your later action was not applied; please try that action again.','info');}}
  }
  function editingBlocked() {
    return replacementBusy||['readonly','starting'].includes(getStorageStatus?.()?.mode);
  }
  function savedExplanation(current,key) {const value=current.explanations?.[key]||{};return {text:value.text||'',oral:!!value.oral};}
  function savedConfiguration(current,deviceId) {const device=current.devices.find(d=>d.id===deviceId);return {address:device?.address||'',mask:device?.mask||current.network?.mask||''};}
  function flushDrafts() {
    clearTimeout(draftTimer);
    const scope=draftScope(getView());
    flushChain=flushChain.then(async()=>{
      if(pendingReplacement||replacementBusy)return false;
      const current=getView();
      if(draftScope(current)!==scope){showStatus('The active attempt changed. Your earlier editor draft is still available to download and was not applied.','error');return false;}
      const pending=drafts.forView(current,'explanation');
      if(pending.length&&editingBlocked()){showStatus('This tab cannot save the explanation draft. Download the unsaved draft to keep it; recorded-state exports remain available.','error');return false;}
      for(const entry of pending){
        const latest=getView();
        if(draftScope(latest)!==scope)return false;
        const saved=savedExplanation(latest,entry.key);
        if(entry.value.text===saved.text&&entry.value.oral===saved.oral){drafts.acknowledge(entry,saved);continue;}
        if(!drafts.canCommit(entry,saved)){showStatus('The recorded explanation changed while this draft was open. Download the unsaved draft before loading the latest progress; it has not been merged.','error');return false;}
        const result=await send({type:'SAVE_EXPLANATION',key:entry.key,...entry.value});
        if(!result?.accepted){showStatus(result?.message||'The explanation could not be saved. Download the unsaved draft to preserve it.','error');return false;}
        drafts.acknowledge(entry,savedExplanation(getView(),entry.key));
      }
      storageView();return true;
    }).catch(error=>{showStatus(error?.message||'The explanation could not be saved. Your draft remains available to download.','error');return false;});
    return flushChain;
  }
  async function exportDraft() {
    clearTimeout(draftTimer);
    const entries=drafts.snapshot();
    if(!entries.length){showStatus('There is no unsaved editor draft to download. Use the normal progress or evidence export.','info');return;}
    const result=await onExportDraft?.({text:draftRescueText(entries),campaignId:entries[0].campaignId,attemptId:entries[0].attemptId});
    if(result?.accepted)showStatus('Unsaved draft download requested. It is unapplied text, not simulation evidence. Your draft is still retained here.','info');
    else showStatus(result?.message||'The draft download could not be prepared. Keep this tab open and copy the visible draft.','error');
  }
  async function exportFile(format) {
    if(!pendingReplacement)await flushDrafts();
    await onExport?.(format);
    showStatus(drafts.size?'Recorded-state download requested. Unapplied drafts are excluded; use Download unsaved draft to preserve them.':format==='progress'?'Progress download requested. Keep the file somewhere you can find it.':'Evidence download requested. Check your browser’s downloads.','info');
  }
  function reviewPastedBackup() {
    if(editingBlocked())progressPasteMessage='This tab cannot import while another tab has control or progress is reconnecting. Current work is unchanged.';
    else if(!progressPasteText.trim())progressPasteMessage='Paste the complete progress backup JSON before reviewing it. Nothing has been imported.';
    else {
      const text=progressPasteText;
      pendingFile=Object.freeze({name:'pasted-clinic-progress.json',type:'application/json',size:new TextEncoder().encode(text).byteLength,text:async()=>text});
      pendingImportSource='paste';progressPasteMessage='';openModal('import-confirm');return;
    }
    const focus=saveFocus();renderModal();restoreFocus(focus);
  }
  async function requestReplacement(kind,file=null,action=null,label=null) {
    clearTimeout(draftTimer);
    await flushChain;
    if(busy||replacementBusy){showStatus('Wait for the current action to finish before replacing progress.','info');return;}
    const labels={'take-control':'Taking control',recover:'Recovering a saved copy',import:'Importing progress',reset:'Restarting this attempt',clear:'Clearing this game'};
    const operation={kind,file,action,label:label||labels[kind]||'Continuing',importSource:kind==='import'?pendingImportSource:null};
    if(drafts.size){pendingReplacement=operation;openModal('draft-guard');return;}
    await replaceState(operation);
  }
  async function replaceState(operation) {
    if(!operation||replacementBusy)return;
    clearTimeout(draftTimer);replacementBusy=true;let reopenPastedBackup=false;let focusNextTask=false;closeModal({preservePaste:true});render({force:true});
    try{
      const result=operation.kind==='mode'?await send(operation.action):operation.kind==='take-control'?await onTakeControl?.():operation.kind==='recover'?await onRecover?.():operation.kind==='import'?await onImport?.(operation.file):operation.kind==='clear'?await onClear?.():await onReset?.();
      if(result?.accepted){focusNextTask=operation.kind==='mode'||operation.kind==='clear';drafts.clear();Object.assign(connection,{fromDeviceId:'',fromPortId:'',toDeviceId:'',toPortId:''});if(operation.kind==='mode'){selectedId=getView().guidedConnection?.receptionDeviceId||null;panel='equipment';showTools=false;introStage='';}if(operation.kind==='clear'){introStage=undefined;showTools=false;notebookOpen=false;selectedId=getView().guidedConnection?.receptionDeviceId||null;panel='equipment';}}
      if(operation.kind==='mode')showStatus(result?.message||'The attempt could not be changed.',result?.accepted?'info':'error');
      if(operation.kind==='import'&&operation.importSource==='paste'){
        if(result?.accepted)clearPastedBackup();
        else {progressPasteMessage=result?.message||'The pasted backup was not imported. Current work and pasted text are retained.';pendingFile=null;pendingImportSource='paste';reopenPastedBackup=true;}
      }
      // Failure preserves the same drafts; they are never applied to a replacement automatically.
    }catch(error){
      showStatus(error?.message||'Progress was not replaced. Your draft remains available.','error');
      if(operation.kind==='import'&&operation.importSource==='paste'){progressPasteMessage=error?.message||'The pasted backup could not be read. Current work and pasted text are retained.';pendingFile=null;pendingImportSource='paste';reopenPastedBackup=true;}
    }
    finally{replacementBusy=false;render({force:true});}
    if(reopenPastedBackup)openModal('paste-progress');
    else if(focusNextTask)focusGuided();
  }
  function switchPanel(next){
    introStage='';showTools=true;
    panel=next;
    render();
    // Finish panel geometry inside this tab activation. A delayed scrollIntoView
    // could move the next pointer target after a browser click had been aimed.
    region('tool').scrollTop=0;
    focusToolPanel();
  }
  function focusToolPanel(){
    const heading=region('tool').querySelector('.panel-heading h2');
    if(!heading)return;
    heading.setAttribute('tabindex','-1');
    heading.focus({preventScroll:true});
    // Only an explicit tool-opening action moves the page, synchronously. Keep
    // the first actionable control visible rather than hiding it below the fold.
    const target=region('tool').querySelector(panel==='equipment'?'.equipment-card button':panel==='inspect'?'[data-action="power-device"]':'select,input,textarea,button');
    const rect=target?.getBoundingClientRect?.();
    if(rect&&(rect.bottom>window.innerHeight-16||rect.top<16))target.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function focusGuided(selector='#current-task-title'){
    const target=region('task').querySelector(selector)||region('task').querySelector('#current-task-title');
    if(!target)return;
    target.focus({preventScroll:true});
    const rect=target.getBoundingClientRect?.();
    if(rect&&(rect.bottom>window.innerHeight-20||rect.top<12))target.scrollIntoView({block:'nearest',behavior:'instant'});
  }

  async function handleAction(el) {
    const action=el.dataset.action;
    if(action==='start-guided'){
      if(isGuided()){closeModal();focusGuided();return;}
      if(await flushDrafts())await requestReplacement('mode',null,{type:'START_GUIDED_CONNECTION'},'Opening the guided connection lesson');
      return;
    }
    if(action==='guided-find-port'){
      guidedPresentation='ports';selectedId=view.guidedConnection.receptionDeviceId;mapMode='network';showTools=false;render();focusGuided('#guided-from-port');return;
    }
    if(action==='guided-experiment'){guidedPresentation='unplug';render();focusGuided();return;}
    if(action==='guided-unplug'){
      const result=await act({type:'DISCONNECT_CABLE',cableId:el.dataset.cable},{after:()=>{guidedPresentation='ports';showTools=false;mapMode='network';}});
      if(result.accepted)focusGuided();return;
    }
    if(action==='guided-probe'){
      const result=await act({type:'RUN_PROBE',testId:'reception'},{after:()=>{showTools=false;mapMode='network';}});
      if(result.accepted)focusGuided();return;
    }
    if(action==='guided-inspect-fault'){
      const g=view.guidedConnection,result=g.currentObservation||g.experimentObservation;
      if(result?.code==='PORT_DISCONNECTED'){guidedPresentation='ports';showTools=false;render();focusGuided('#guided-from-port');return;}
      if(result?.code==='ACCESS_DENIED'){switchPanel('access');return;}
      const target=result?.code==='SERVICE_UNAVAILABLE'?g.serverDeviceId:result?.code==='SWITCH_OFF'?g.switchDeviceId:result?.code==='DEVICE_OFF'?view.devices.find(d=>!d.powered)?.id:g.receptionDeviceId;
      selectedId=target||g.receptionDeviceId;switchPanel('inspect');return;
    }
    if(action==='guided-edit-explanation'){
      guidedPresentation='edit';showTools=false;render();focusGuided('#explanation-repair');return;
    }
    if(action==='guided-save-explanation'){
      if(!await flushDrafts())return;
      const current=getView(),value=savedExplanation(current,'repair');
      const result=await act({type:'SAVE_EXPLANATION',key:'repair',...value},{after:()=>{guidedPresentation='ports';}});
      if(result.accepted){showStatus('Your explanation is saved for teacher review.','success');focusGuided();}return;
    }
    if(action==='guided-finish'||action==='guided-return'){
      if(await flushDrafts())await requestReplacement('mode',null,{type:action==='guided-finish'?'FINISH_GUIDED_CONNECTION':'RETURN_FROM_GUIDED_CONNECTION'},action==='guided-finish'?'Completing guided practice':'Returning from guided practice');
      return;
    }
    if(action==='meet-mentor'){introStage='mentor';render();region('task').querySelector('h2')?.focus({preventScroll:true});return;}
    if(action==='begin-first-task'){introStage='';equipmentRole='role.reception';switchPanel('equipment');return;}
    if(action==='show-tools'){switchPanel(panel);return;}
    if(action==='hide-tools'){showTools=false;render();root.querySelector('[data-action="show-tools"]')?.focus({preventScroll:true});return;}
    if(action==='toggle-notebook'){notebookOpen=!notebookOpen;render();if(notebookOpen){root.querySelector('#notebook-title')?.focus();}else{root.querySelector('.topbar [data-action="toggle-notebook"]')?.focus();}return;}
    if(action==='set-panel'){if(el.dataset.panel==='connect')mapMode='network';switchPanel(el.dataset.panel);return;}
    if(action==='select-device'){selectedId=el.dataset.device;if(isGuided()&&!showTools&&['connect','repair'].includes(view.guidedConnection.phase)&&[view.guidedConnection.receptionDeviceId,view.guidedConnection.switchDeviceId].includes(selectedId)){guidedPresentation='ports';mapMode='network';render();focusGuided(selectedId===view.guidedConnection.switchDeviceId?'#guided-to-port':'#guided-from-port');}else switchPanel('inspect');return;}
    if(action==='choose-role'){equipmentRole=el.dataset.role;switchPanel('equipment');return;}
    if(['map-view','network-view','list-view'].includes(action)){mapMode=action==='map-view'?'map':action==='network-view'?'network':'list';render();return;}
    if(action==='close-modal'){closeModal();return;}
    if(action==='export-draft'){await exportDraft();return;}
    if(action==='confirm-draft-discard'){const operation=pendingReplacement;await replaceState(operation);return;}
    if(['phone','brief','help'].includes(action)){openModal(action);return;}
    if(action==='guide'){guideSection=el.dataset.section||guideSection;openModal('guide');return;}
    if(action==='select-guide'){const focus=saveFocus();guideSection=el.dataset.section;renderModal();if(!restoreFocus(focus))region('modal').querySelector('[data-modal]')?.focus({preventScroll:true});return;}
    if(action==='open-menu'){openModal('menu');return;}
    if(action==='paste-backup'){pendingFile=null;pendingImportSource='paste';openModal('paste-progress');return;}
    if(action==='review-paste-import'){reviewPastedBackup();return;}
    if(action==='edit-pasted-backup'){pendingFile=null;pendingImportSource='paste';openModal('paste-progress');return;}
    if(action==='open-equipment'){switchPanel('equipment');return;}
    if(action==='open-inspector'){switchPanel('inspect');return;}
    if(action==='open-connect'){mapMode='network';switchPanel('connect');return;}
    if(action==='open-tests'){switchPanel('tests');return;}
    if(action==='open-transfer-reason'){switchPanel('handover');const field=root.querySelector('#explanation-repair');field?.focus({preventScroll:true});return;}
    if(action==='open-privacy-reason'){switchPanel('handover');root.querySelector('#explanation-privacy')?.focus({preventScroll:true});return;}
    if(action==='clinic-practice'){openModal('clinic-practice');return;}
    if(action==='inspect-nurse'){selectedId=view.devices.find(d=>d.roleId==='role.nurse')?.id||null;switchPanel('inspect');return;}
    if(action==='choose-equipment'){
      const existing=view.devices.find(d=>d.roleId===el.dataset.role);
      if(existing?.kind===el.dataset.kind){selectedId=existing.id;switchPanel('inspect');return;}
      const result=await act({type:'CHOOSE_DEVICE',roleId:el.dataset.role,kind:el.dataset.kind},{after:()=>{selectedId=getView().devices.find(d=>d.roleId===el.dataset.role)?.id;panel='inspect';}});if(result?.accepted)focusToolPanel();return;
    }
    if(action==='power-device'){await act({type:'POWER_DEVICE',deviceId:el.dataset.device,on:el.dataset.on==='true'});return;}
    if(action==='attach'||action==='detach'){await act({type:action==='attach'?'ATTACH_ADAPTER':'DETACH_ADAPTER',deviceId:el.dataset.device,kind:el.dataset.kind});return;}
    if(action==='remove-device'){await act({type:'REMOVE_DEVICE',deviceId:el.dataset.device});return;}
    if(action==='move-nurse'){await act({type:'MOVE_NURSE',locationId:el.dataset.location});return;}
    if(action==='service-state'){await act({type:'SET_SERVICE_STATE',enabled:el.dataset.enabled==='true'});return;}
    if(action==='disconnect'){await act({type:'DISCONNECT_CABLE',cableId:el.dataset.cable});return;}
    if(action==='probe'||action==='probe-all'){introStage='';showTools=true;panel='tests';await act({type:'RUN_PROBE',testId:action==='probe-all'?'all':el.dataset.test});return;}
    if(action==='set-policy'){await act({type:'SET_PERMISSIONS',policyId:el.dataset.policy});return;}
    const wearableActions={collect:'RUN_COLLECTION_CHECK','return-wearable':'RETURN_WEARABLE',handoff:'HANDOFF_MARKERS',upload:'UPLOAD_MARKERS'};
    if(wearableActions[action]){await act({type:wearableActions[action]});return;}
    if(action==='read-message'){await act({type:'ACKNOWLEDGE_CLIENT_MESSAGE',messageId:el.dataset.message},{quiet:true});return;}
    if(action==='consult-guide'){
      const q=view.guideQuotes.find(q=>q.sectionId===el.dataset.section);
      const r=await act({type:'GUIDE_CONSULT',sectionId:el.dataset.section,quoteToken:q?.quoteToken});
      if(r?.accepted)await act({type:'REVEAL_HINT',sectionId:el.dataset.section,tier:1},{quiet:true});
      return;
    }
    if(action==='reveal-hint'){await act({type:'REVEAL_HINT',sectionId:el.dataset.section,tier:Number(el.dataset.tier)},{quiet:true});return;}
    if(action==='save-explanations'){if(await flushDrafts()){showStatus('Explanations saved to the current attempt. Teacher review is still pending.','success');render();}return;}
    if(action==='review-context'){if(await flushDrafts())await act({type:'REVIEW_EXPLANATION_CONTEXT'});return;}
    if(action==='handover'){if(await flushDrafts())await act({type:'REQUEST_HANDOVER'});return;}
    if(action==='settle'){await act({type:'SETTLE_CONTRACT'});return;}
    if(action==='export-progress'||action==='export-text'||action==='export-json'){await exportFile(action==='export-progress'?'progress':action==='export-text'?'text':'json');return;}
    if(action==='preview-evidence'){await flushDrafts();openModal('evidence');return;}
    if(action==='import-file'){root.querySelector('#progress-file').click();return;}
    if(action==='confirm-import'){if(pendingFile)await requestReplacement('import',pendingFile);return;}
    if(action==='reset'||action==='clear'){openModal(action);return;}
    if(action==='confirm-reset'||action==='confirm-clear'){await requestReplacement(action==='confirm-clear'?'clear':'reset');return;}
    if(action==='take-control'){await requestReplacement('take-control');return;}
    if(action==='recover'){await requestReplacement('recover');return;}
    if(action==='training-demo'||action==='training-retry'||action==='training-next'){
      if(!await flushDrafts())return;
      const type=action==='training-next'&&view.training?.completed?'START_CLIENT_ATTEMPT':({'training-demo':'TRAINING_DEMO','training-retry':'TRAINING_RETRY','training-next':'TRAINING_NEXT'})[action];
      await requestReplacement('mode',null,{type},'Changing this practice attempt');return;
    }
    if(action==='training'){if(await flushDrafts())await requestReplacement('mode',null,{type:'START_TRAINING_ATTEMPT'},'Opening bootcamp');return;}
    if(action==='return-client'){if(await flushDrafts())await requestReplacement('mode',null,{type:'RETURN_TO_CLIENT'},'Resuming the saved client job');return;}
    if(action==='prior-learning'){openModal('prior-learning');return;}
    if(action==='confirm-clinic-practice'){if(await flushDrafts())await requestReplacement('mode',null,{type:'START_CLINIC_PRACTICE'},'Opening teacher-selected clinic practice');return;}
    if(action==='start-client'||action==='confirm-prior-learning'){if(await flushDrafts())await requestReplacement('mode',null,{type:'START_CLIENT_ATTEMPT',...(action==='confirm-prior-learning'?{priorLearning:true}:{})},'Opening the client job');return;}

  }

  const clickHandler=event=>{const el=event.target.closest('[data-action]');if(el&&root.contains(el)&&!el.disabled){handleAction(el).catch(e=>showStatus(e.message||'That action could not be completed.','error'));}};
  const inputHandler=event=>{
    const el=event.target;
    if('progressPaste' in el.dataset){progressPasteText=el.value;progressPasteMessage='';return;}
    if(editingBlocked()&&(el.dataset.explanation||el.dataset.configDevice))return;
    if(el.dataset.explanation){const key=el.dataset.explanation,old=explanationValues(key),current=getView();drafts.put(current,'explanation',key,{...old,text:el.value},savedExplanation(current,key));clearTimeout(draftTimer);draftTimer=setTimeout(()=>flushDrafts(),750);storageView();}
    if(el.dataset.configDevice){const current=getView(),deviceId=el.dataset.configDevice,old=drafts.get(current,'configuration',deviceId)?.value||savedConfiguration(current,deviceId);drafts.put(current,'configuration',deviceId,{...old,[el.dataset.configField]:el.value},savedConfiguration(current,deviceId));storageView();}
  };
  const changeHandler=event=>{
    const el=event.target;
    if(el.id==='progress-file'){pendingFile=el.files?.[0]||null;pendingImportSource='file';if(pendingFile)openModal('import-confirm');el.value='';return;}
    if(el.dataset.oral){if(editingBlocked())return;const key=el.dataset.oral,current=getView();drafts.put(current,'explanation',key,{...explanationValues(key),oral:el.checked},savedExplanation(current,key));clearTimeout(draftTimer);draftTimer=setTimeout(()=>flushDrafts(),250);storageView();return;}
    if(el.dataset.change==='equipment-role'){equipmentRole=el.value;render();}
    if(el.dataset.change==='select-device'){selectedId=el.value;render();}
    if(el.dataset.change==='wire-device'){connection[`${el.dataset.end}DeviceId`]=el.value;connection[`${el.dataset.end}PortId`]='';render();}
    if(el.dataset.change==='wire-port')connection[`${el.dataset.end}PortId`]=el.value;
    if(el.dataset.change==='guided-port')guidedWire[`${el.dataset.end}PortId`]=el.value;
  };
  const submitHandler=async event=>{
    const form=event.target.closest('form[data-form]');if(!form)return;event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    if(form.dataset.form==='connect'||form.dataset.form==='guided-connect'){
      const guided=form.dataset.form==='guided-connect';
      if(!guided)Object.assign(connection,data);
      const from=endpointLabel(data.fromDeviceId,data.fromPortId),to=endpointLabel(data.toDeviceId,data.toPortId);
      const result=await act({type:'CONNECT_PORTS',...data},{after:()=>{mapMode='network';connection.fromPortId='';connection.toPortId='';guidedWire.fromPortId='';guidedWire.toPortId='';if(guided)showTools=false;showStatus(`Connected ${from} to ${to}. Run a service test to check the result.`,'info');}});
      if(guided&&result.accepted)focusGuided();
    }
    if(form.dataset.form==='address'){const entry=drafts.get(getView(),'configuration',data.deviceId);const r=await act({type:'SET_STATIC_ADDRESS',...data});if(r?.accepted){if(entry)drafts.acknowledge(entry,savedConfiguration(getView(),data.deviceId));render();}}
    if(form.dataset.form==='wifi')await act({type:'ASSOCIATE_WIFI',deviceId:data.deviceId,apDeviceId:data.apDeviceId||null});
    if(form.dataset.form==='place')await act({type:'PLACE_DEVICE',...data});
  };
  const keyHandler=event=>{
    if(!modal)return;
    if(event.key==='Escape'){event.preventDefault();closeModal();return;}
    if(event.key==='Tab'){
      const dialog=region('modal').querySelector('[data-modal]');
      const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]')].filter(e=>e.getClientRects().length);
      const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  };
  const blurHandler=()=>{if(pendingRender)setTimeout(()=>{if(!isTyping())render();},0);};
  const toggleHandler=event=>{const d=event.target;if(d.dataset?.disclosure){if(d.open)disclosureState.add(d.dataset.disclosure);else disclosureState.delete(d.dataset.disclosure);}};
  root.addEventListener('click',clickHandler);
  root.addEventListener('input',inputHandler);
  root.addEventListener('change',changeHandler);
  root.addEventListener('submit',submitHandler);
  root.addEventListener('keydown',keyHandler);
  root.addEventListener('focusout',blurHandler);
  root.addEventListener('toggle',toggleHandler,true);
  render();
  return {render,showStatus,flushDrafts,destroy(){closed=true;clearTimeout(draftTimer);sceneResizeObserver?.disconnect();window.removeEventListener('resize',drawSceneConnections);root.removeEventListener('click',clickHandler);root.removeEventListener('input',inputHandler);root.removeEventListener('change',changeHandler);root.removeEventListener('submit',submitHandler);root.removeEventListener('keydown',keyHandler);root.removeEventListener('focusout',blurHandler);root.removeEventListener('toggle',toggleHandler,true);}};
}
