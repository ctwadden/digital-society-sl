/** Hands-on bootcamp interface. All task gates and outcomes come from the model. */
import {BOOT_CONTENT as C, getBootLesson} from './content.js';
import {renderBench, deviceName, materialArtwork} from './scene.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = value => Array.isArray(value) ? value : [];
const DRAFT_KEY = 'riverbend.bootcamp.ui-drafts.v1';
const button = (action, label, attrs = '', style = '') => `<button type='button' class='bc-button ${style}' data-action='${action}' ${attrs}>${label}</button>`;
const option = (value, label, current, disabled = false) => `<option value='${esc(value)}' ${String(current ?? '') === String(value) ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${esc(label)}</option>`;
const roomName = id => id === 'location.exam-b' ? 'Room B' : id === 'location.exam-a' ? 'Room A' : 'Training bench';
const testName = id => ({reception:'Workstation service',nurse:'Mobile workspace','nurse-bookings':'Mobile booking access',access:'Staff and outsider access',all:'All relevant services','access-reception':'Workstation workspace restriction','access-outsider-bookings':'Outsider bookings restriction','access-outsider-workspace':'Outsider workspace restriction'}[id] || id);

// Display aliases for shared-model diagnostics only. Stored observations, codes,
// replay and exact learner explanations retain their original contents.
function diagnosticText(message) {
  return String(message ?? '')
    .replace(/\b(?:central records host|central host|records host)\b/gi, name => /^[A-Z]/.test(name) ? 'Service host' : 'service host')
    .replace(/\bCentral records\b/g, 'Service host')
    .replace(/\bMobile nurse\b/g, 'Mobile workstation')
    .replace(/\bnurse device\b/g, 'mobile workstation')
    .replace(/\bNurse device\b/g, 'Mobile workstation')
    .replace(/\bnurse\b/g, 'mobile workstation')
    .replace(/\bNurse\b/g, 'Mobile workstation')
    .replace(/\bReception\b/g, 'Workstation');
}

export function mountBootcampUI(root, handlers) {
  const {getView, send, onExport, onImport, onReset, onClear, onTakeControl, onRecover} = handlers;
  let view = getView(), closed = false, busy = false, selectedDeviceId = null, selectedObservationId = null;
  let panel = 'devices', modal = null, returnFocus = null, feedback = null, lastScope = '', previousReadOnly = false;
  let connection = {fromDeviceId:'',fromPortId:'',toDeviceId:'',toPortId:''};
  let pendingImport = null, pasteText = '', materialCategory = 'computers', draftStorageFailed = false;
  let drafts = {};
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [scope, stored] of Object.entries(parsed).slice(-40)) {
        if (!stored || typeof stored !== 'object' || !stored.settings || typeof stored.settings !== 'object' || Array.isArray(stored.settings)) continue;
        const settings = Object.create(null);
        for (const [id, draft] of Object.entries(stored.settings)) {
          if (draft && ['address','mask','wifiApId'].every(key => typeof draft[key] === 'string') && draft.base && ['address','mask','wifiApId'].every(key => typeof draft.base[key] === 'string')) settings[id] = draft;
        }
        const r = stored.reflection;
        const reflection = r && typeof r.text === 'string' && typeof r.oral === 'boolean' && r.base && typeof r.base.text === 'string' && typeof r.base.oral === 'boolean' ? r : null;
        drafts[scope] = {campaignId:stored.campaignId,attemptId:stored.attemptId,settings,reflection};
      }
    }
  }
  catch { draftStorageFailed = true; }

  root.innerHTML = `<div class='bootcamp-app'><a class='bc-skip' href='#bc-main'>Skip to training bench</a><header data-bc-region='header'></header><div data-bc-region='storage'></div><main id='bc-main' tabindex='-1'><div data-bc-region='intro'></div><nav data-bc-region='lessons' aria-label='Bootcamp lessons'></nav><div data-bc-region='workspace'></div></main><footer data-bc-region='footer'></footer><div data-bc-region='modal'></div><input class='bc-sr-only' id='bc-import-file' type='file' accept='.json,application/json' tabindex='-1' aria-label='Choose programme progress JSON'><div id='bc-live' class='bc-sr-only' role='status' aria-live='polite' aria-atomic='true'></div></div>`;
  const region = name => root.querySelector(`[data-bc-region=${name}]`);
  const update = (name, html) => { const element = region(name); if (element && element.innerHTML !== html) element.innerHTML = html; };
  const currentScope = () => `${view.campaignId}|${view.attemptId || 'welcome'}`;
  const bucket = () => drafts[currentScope()] || (drafts[currentScope()] = {campaignId:view.campaignId,attemptId:view.attemptId,settings:{},reflection:null});
  const readOnly = () => ['readonly','starting'].includes(view.storage?.mode);
  const practice = () => view.phase === 'practice';
  const disabled = (condition = false, allowOutsidePractice = false) => condition || busy || readOnly() || (!allowOutsidePractice && !practice()) ? 'disabled' : '';
  const can = type => list(view.allowedNetworkActions).includes(type);
  const device = id => list(view.devices).find(item => item.id === id);
  const lesson = () => getBootLesson(view.lessonId);
  const shortTitle = id => getBootLesson(id)?.shortTitle || list(view.lessons).find(item => item.id === id)?.title || id;
  const selected = () => device(selectedDeviceId);

  function saveDrafts() {
    const keys = Object.keys(drafts);
    if (keys.length > 40) for (const key of keys.slice(0, keys.length - 40)) delete drafts[key];
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); }
    catch { draftStorageFailed = true; }
  }
  function settingDraft(id) { return bucket().settings?.[id]; }
  function draftSetting(id, key, value) {
    const d = device(id); if (!d) return;
    const b = bucket();
    b.settings ||= {};
    b.settings[id] ||= {address:d.address || '',mask:d.mask || '',wifiApId:d.wifiApId || '',base:{address:d.address || '',mask:d.mask || '',wifiApId:d.wifiApId || ''},needsReview:false};
    b.settings[id][key] = value; saveDrafts();
  }
  function reflectionDraft() { return bucket().reflection; }
  function draftReflection(key, value) {
    const b = bucket(), saved = view.reflection || {};
    b.reflection ||= {text:saved.text || '',oral:!!saved.oral,base:{text:saved.text || '',oral:!!saved.oral},needsReview:false};
    b.reflection[key] = value; saveDrafts();
  }
  function dirtyCount() { const b = bucket(); return Object.keys(b.settings || {}).length + (b.reflection ? 1 : 0); }
  function markDraftsForReview() {
    for (const b of Object.values(drafts)) {
      if (b.reflection) b.reflection.needsReview = true;
      for (const d of Object.values(b.settings || {})) d.needsReview = true;
    }
    saveDrafts();
  }
  function rescueText() {
    return 'UNSUBMITTED BOOTCAMP DRAFTS\nThese are editor notes and settings, not accepted model actions or submitted evidence.\n' + JSON.stringify(drafts,null,2);
  }
  function focusSnapshot() {
    const el = document.activeElement;
    if (!el || !root.contains(el)) return null;
    return {id:el.id,attrs:{...el.dataset},start:el.selectionStart,end:el.selectionEnd,scrollTop:el.scrollTop};
  }
  function restoreFocus(snapshot) {
    if (!snapshot) return false;
    const scope = modal ? root.querySelector('.bc-dialog') : root;
    if (!scope) return false;
    let el = snapshot.id ? scope.querySelector(`#${CSS.escape(snapshot.id)}`) : null;
    if (!el && Object.keys(snapshot.attrs).length) el = [...scope.querySelectorAll('[data-action],[data-draft]')].find(e => Object.entries(snapshot.attrs).every(([key,value]) => e.dataset[key] === value));
    if (!el || el.disabled || el.closest('[hidden]') || !el.getClientRects().length) return false;
    el.focus({preventScroll:true});
    if (typeof snapshot.start === 'number' && el.setSelectionRange) {
      try { el.setSelectionRange(snapshot.start,snapshot.end); el.scrollTop = snapshot.scrollTop; } catch {}
    }
    return true;
  }
  function showStatus(message, kind = 'info') {
    const original = String(message || '');
    const raw = view.phase === 'intro' && !view.demo?.available && original === 'Lesson opened. Watch the worked example, then try the task in a fresh setup.'
      ? 'Challenge opened. There is no solved demonstration. Observe the setup, make a relevant repair and test again.' : original;
    const recordedDiagnostic = list(view.observations).some(o => o.message === raw);
    feedback = {message:recordedDiagnostic ? diagnosticText(raw) : raw,kind:kind === true ? 'error' : kind === false ? 'info' : kind};
    const el = root.querySelector('#bc-live'); if (el) el.textContent = feedback.message;
    renderFeedback();
  }
  function renderFeedback() {
    const el = root.querySelector('[data-bc-feedback]');
    if (el) el.innerHTML = feedback ? `<div class='bc-feedback ${esc(feedback.kind)}'><span aria-hidden='true'>${feedback.kind === 'error' ? '!' : '↳'}</span><p>${esc(feedback.message)}</p></div>` : '';
  }
  function openModal(type, extras = {}) {
    if (!modal) returnFocus = focusSnapshot();
    modal = {type,...extras}; renderModal(); setBackgroundInert(true);
    root.querySelector('#bc-dialog-title')?.focus({preventScroll:true});
  }
  function closeModal() {
    modal = null; update('modal',''); setBackgroundInert(false);
    if (!restoreFocus(returnFocus)) root.querySelector('[data-action=progress]')?.focus({preventScroll:true});
  }
  function setBackgroundInert(value) {
    for (const el of [region('header'),region('storage'),root.querySelector('#bc-main'),region('footer')]) if (el) el.inert = value;
  }
  async function run(action, after) {
    if (busy || closed) return {accepted:false,message:'Wait for the current action.'};
    const held = focusSnapshot(), previousPhase = view.phase; busy = true; render();
    try {
      const result = await send(action); if (closed) return result;
      view = getView();
      if (result?.accepted && after) await after(result);
      if (result?.message) showStatus(result.message,result.accepted ? 'info' : 'error');
      return result;
    } catch (error) {
      if (!closed) showStatus('That action could not be completed. Your draft is still available. '+String(error?.message || ''),'error');
      return {accepted:false};
    } finally {
      const latestFocus = !closed ? focusSnapshot() : null;
      busy = false;
      if (!closed) {
        render();
        if (!restoreFocus(latestFocus || held)) {
          const destination = modal ? root.querySelector('#bc-dialog-title')
            : previousPhase !== view.phase ? root.querySelector('#bc-mentor-heading')
            : root.querySelector('#bc-panel-heading') || root.querySelector('#bc-mentor-heading');
          (destination || root.querySelector('#bc-course-heading'))?.focus({preventScroll:true});
        }
      }
    }
  }
  const boot = (action, after) => run({type:'BOOT_ACTION',action},after);
  const network = (action, after) => boot({type:'NETWORK_ACTION',action},after);
  async function replacement(handler) {
    if (busy || readOnly() && modal?.type !== 'takeover') return;
    const held = focusSnapshot(); busy = true; render();
    try {
      const result = await handler();
      if (result?.accepted) { markDraftsForReview(); if (!closed) closeModal(); }
      if (!closed && result?.message) showStatus(result.message,result.accepted ? 'info' : 'error');
    } catch { if (!closed) showStatus('The file or recovery action could not be completed. Existing progress and drafts are retained.','error'); }
    finally { busy = false; if (!closed) { render(); if (!restoreFocus(held) && modal) root.querySelector('#bc-dialog-title')?.focus(); } }
  }

  function header() {
    return `<div class='bc-topbar'><div class='bc-brand'><span class='bc-brand-mark' aria-hidden='true'>↗</span><div><strong>Opening Shift</strong><span>Training bench · with Jo</span></div></div><div class='bc-top-actions'>${button('materials','Equipment & cable guide','','bc-quiet')}${button('howto','How-to','','bc-quiet')}${button('progress','Progress','','bc-quiet')}${view.canEnterField ? button('field',view.fieldStarted ? 'Return to field job →' : 'Go to first client →',disabled(false,true),'bc-outline') : ''}</div></div>`;
  }
  function storage() {
    const s = view.storage || {mode:'memory',label:'Progress stays in this browser',detail:'Download a copy before closing this tab.'};
    return `<div class='bc-storage ${['readonly','memory','error','starting'].includes(s.mode) ? 'bc-storage-warning' : ''}'><strong>${esc(s.label)}</strong><span>${esc(s.mode === 'saved' ? 'Download progress before changing device or browser.' : s.detail)}</span>${s.canTakeControl ? button('takeover','Review & take control','','bc-text') : ''}${dirtyCount() ? button('drafts',`${dirtyCount()} unsubmitted ${dirtyCount() === 1 ? 'draft' : 'drafts'}`,'','bc-text') : ''}${draftStorageFailed ? '<span>Draft backup unavailable. Keep this tab open or download your draft.</span>' : ''}</div>`;
  }
  function intro() {
    if (view.phase === 'welcome') return '';
    const l = lesson();
    return `<div class='bc-lesson-heading'><div><p class='bc-eyebrow'>${view.phase === 'demo' ? 'JO’S DEMONSTRATION' : view.phase === 'complete' ? 'TRAINING TASK RECORDED' : 'FREE TRAINING · NO CLOCK OR FEES'}</p><h1 id='bc-course-heading' tabindex='-1'>${esc(l?.title || 'Field-ready bootcamp')}</h1></div><div class='bc-progress-number'><strong>${view.progress?.completed || 0}<span> / 6</span></strong><span>training tasks recorded</span></div></div><div class='bc-goals'><strong>In this lesson</strong><ul>${list(l?.goals).slice(0,3).map(goal => `<li>${esc(goal)}</li>`).join('')}</ul></div>`;
  }
  function lessons() {
    return `<ol class='bc-lesson-list'>${list(view.lessons).map((entry,index) => `<li><button type='button' class='bc-lesson ${entry.active ? 'active' : ''} ${entry.completed ? 'completed' : ''}' data-action='lesson' data-lesson-id='${esc(entry.id)}' ${disabled(!entry.unlocked,true)} ${entry.active ? "aria-current='step'" : ''}><span class='bc-lesson-number'>${entry.completed ? '✓' : index+1}</span><span>${esc(shortTitle(entry.id))}${!entry.unlocked ? '<small>Complete earlier task</small>' : entry.completed ? '<small>Task recorded</small>' : ''}</span></button></li>`).join('')}</ol>`;
  }
  function welcome() {
    const w = C.welcome || {}, first = list(view.lessons).find(l => l.unlocked && !l.completed) || view.lessons?.[0];
    return `<section class='bc-welcome'><div class='bc-welcome-copy'><p class='bc-eyebrow'>${esc(w.eyebrow || 'LEARN IT HERE. USE IT IN THE FIELD.')}</p><h1 id='bc-course-heading' tabindex='-1'>${esc(w.title || 'Build your confidence before the first call.')}</h1><p class='bc-lead'>${esc(w.intro || 'Review the equipment, watch Jo build a working example, then try the task yourself.')}</p><div class='bc-welcome-route'><span>1 <strong>Watch Jo</strong></span><span>2 <strong>Your turn</strong></span><span>3 <strong>Test & explain</strong></span></div><p>${esc(w.promise || 'All training, hints and retries are free. Your field job stays separate.')}</p><div class='bc-button-row'>${button('lesson',esc(w.startLabel || 'Start the bootcamp')+' →',`data-lesson-id='${esc(first?.id || 'boot.kit')}' ${disabled(false,true)}`,'bc-primary')}${button('materials',esc(w.reviewLabel || 'Meet the equipment first'),'','bc-outline')}</div><p class='bc-small'>${esc(w.estimatedTime || 'Work at your own pace. There is no real-time countdown.')}</p></div><div class='bc-welcome-visual'><div class='bc-coach-label'><span class='bc-avatar' aria-hidden='true'>J</span><div><strong>${esc(C.mentor?.name || 'Jo')}</strong><span>${esc(C.mentor?.role || 'Training mentor')}</span></div><span class='bc-badge'>ALL HELP FREE</span></div><div class='bc-kit-preview' aria-label='Equipment preview'>${['desktop','switch4','server'].map((kind,index) => `<div>${materialArtwork({assetKind:kind,title:['Workstation','Switch','Service host'][index]})}<strong>${['Use the service','Join the devices','Provide the service'][index]}</strong></div>`).join('')}</div><h2>What will you practise?</h2><ul class='bc-welcome-topics'><li>Hardware, ports and the right cable</li><li>A complete wired and wireless path</li><li>IP addresses and subnet masks</li><li>Testing, permissions and fault diagnosis</li></ul><p class='bc-small'>${esc(w.reviewIntro || 'The equipment guide explains what each item does and where it connects.')}</p></div></section>${view.migrationNotice ? `<p class='bc-migration'>${esc(view.migrationNotice)}</p>` : ''}`;
  }
  function mentor() {
    const l = lesson(), phase = view.phase;
    let title = 'First, understand the job', text = l?.mentorIntro || '', detail = '', actions = '';
    if (phase === 'intro') {
      detail = `<p class='bc-notice'><strong>First action:</strong> ${esc(l?.firstAction || '')}</p>`;
      actions = `${view.demo?.available ? button('start-demo','Watch Jo demonstrate',disabled(false,true),'bc-primary') : ''}${button('start-practice',view.demo?.available ? 'Try it myself' : 'Start the diagnosis',disabled(false,true),'bc-outline')}`;
    } else if (phase === 'demo') {
      const current = list(l?.demonstration?.steps).find(s => s.id === view.demo?.currentStepId);
      const next = list(l?.demonstration?.steps).find(s => s.id === view.demo?.nextStepId);
      title = current?.title || 'Watch this worked example';
      text = current?.text || l?.demonstration?.intro || '';
      detail = current?.notice ? `<p class='bc-notice'>${esc(current.notice)}</p>` : '';
      if (view.demo?.finished) { detail += `<p>${esc(l?.demonstration?.closing || 'Now try the same skill on a fresh bench.')}</p>`; actions = button('start-practice','Your turn — fresh practice →',disabled(false,true),'bc-primary'); }
      else actions = button('next-demo',`Show: ${esc(next?.title || 'next step')} →`,disabled(false,true),'bc-primary');
      detail += `<p class='bc-small'>Demonstration results belong to Jo. They do not complete your practice.</p>`;
    } else if (phase === 'complete') {
      title = view.courseComplete ? C.completion?.title || 'Ready for your first field job' : 'Task recorded. Take the next step.';
      text = view.courseComplete ? C.completion?.message || 'You have completed the practical training tasks. Your independent field job is next.' : 'Your actual actions and tests are saved as training evidence.';
      detail = `<p class='bc-small'>${esc(C.completion?.reminder || 'Task completion is not a grade or a claim of mastery. Your teacher reviews your reasoning.')}</p>`;
      actions = view.courseComplete ? button('field',view.fieldStarted ? 'Return to field job →' : 'Take the first client job →',disabled(!view.canEnterField,true),'bc-primary') : button('lesson',`Next: ${esc(shortTitle(view.nextLessonId))} →`,`data-lesson-id='${esc(view.nextLessonId)}' ${disabled(!view.nextLessonId,true)}`,'bc-primary');
      actions += button('retry','Practise this task again',disabled(false,true),'bc-outline');
    } else {
      title = 'Your turn'; text = l?.practice?.brief || '';
      detail = `<details class='bc-details'><summary>Step-by-step instructions</summary><ol>${list(l?.practice?.steps).map(step => `<li><strong>${esc(step.title)}.</strong> ${esc(step.text)}</li>`).join('')}</ol></details>`;
      actions = button('howto','Open the how-to guide','','bc-text') + button('retry','Reset this practice',disabled(false,true),'bc-text');
    }
    return `<section class='bc-mentor'><div class='bc-coach-label'><span class='bc-avatar' aria-hidden='true'>J</span><div><strong>Jo</strong><span>${phase === 'demo' ? 'Worked example' : phase === 'practice' ? 'Here if you need help' : 'Training mentor'}</span></div><span class='bc-badge'>FREE</span></div><h2 id='bc-mentor-heading' tabindex='-1'>${esc(title)}</h2><p>${esc(text)}</p>${detail}<div class='bc-button-row'>${actions}</div></section>`;
  }
  function introMaterials() {
    if (view.phase !== 'intro') return '';
    const ids = list(lesson()?.materialIds), materials = list(C.materials).filter(m => ids.includes(m.id)).slice(0,3);
    if (!materials.length) return '';
    return `<section class='bc-intro-materials'><h3>Know the parts before you connect them</h3><div class='bc-intro-material-list'>${materials.map(m => `<article>${materialArtwork(m)}<strong>${esc(m.title)}</strong><p>${esc(m.purpose)}</p></article>`).join('')}</div>${button('materials','See ports, cable types & common mix-ups','','bc-text')}</section>`;
  }
  function networkCard() {
    const n = view.network || {};
    return `<details class='bc-network-card' ${view.controls?.address ? 'open' : ''}><summary>Network card · <code>${esc(n.cidr || 'Read the current bench')}</code></summary><dl><div><dt>Subnet mask</dt><dd><code>${esc(n.mask || '255.255.255.0')}</code></dd></div><div><dt>Network boundary</dt><dd>/24 = 24 network bits</dd></div></dl><p class='bc-small'>For this /24 mask, the first three number groups identify the network. Every active host needs a unique usable address.</p><strong class='bc-small'>Current device addresses</strong><ul>${list(view.devices).filter(d => d.address).map(d => `<li>${esc(deviceName(d))}: <code>${esc(d.address)}</code></li>`).join('')}</ul></details>`;
  }
  function bench() {
    const observation = list(view.observations).find(o => o.id === selectedObservationId) || view.observations?.[0];
    const source = device(observation?.sourceDeviceId);
    const elsewhere = source?.roleId === 'role.nurse' && observation.locationId !== source.locationId;
    return `<section class='bc-bench-card'><div class='bc-card-top'><div><p class='bc-eyebrow'>${view.phase === 'demo' ? 'JO’S EXAMPLE BENCH' : 'YOUR TRAINING BENCH'}</p><h2>See the whole path.</h2></div><span class='bc-badge'>${view.phase === 'demo' ? 'DEMONSTRATION' : 'LOCAL NETWORK'}</span></div>${renderBench(view,{selectedDeviceId,selectedObservationId})}<div class='bc-legend'><span><i class='bc-line'></i>Installed Ethernet</span><span><i class='bc-line bc-dotted'></i>Wi-Fi association</span><span><i class='bc-line bc-tested'></i>Recorded test route</span></div><div class='bc-device-picks' aria-label='Inspect a device'>${list(view.devices).map(d => button('device',esc(deviceName(d)),`data-device-id='${esc(d.id)}' aria-pressed='${selectedDeviceId === d.id}'`,'bc-device-pick')).join('')}</div>${view.nurseDeviceId ? `<div class='bc-room-controls'><span>Mobile workstation: <strong>${esc(roomName(device(view.nurseDeviceId)?.locationId))}</strong></span><div>${['location.exam-a','location.exam-b'].map(id => button('move',esc(roomName(id)),`data-location-id='${id}' aria-pressed='${device(view.nurseDeviceId)?.locationId === id}' ${disabled(!can('MOVE_NURSE'))}`,'bc-outline')).join('')}</div></div>` : ''}${observation ? `<div class='bc-observation ${observation.pass && !observation.stale ? 'pass' : 'attention'}'><div><span class='bc-badge'>${observation.stale ? 'STALE TEST' : observation.pass ? 'TEST PASSED' : 'TEST NEEDS ATTENTION'}</span><strong>${esc(testName(observation.testId))}${source?.roleId === 'role.nurse' ? ' · '+esc(roomName(observation.locationId)) : ''}</strong></div><p>${esc(diagnosticText(observation.message))}</p><small>${observation.origin === 'trainer' ? 'Jo’s demonstration' : 'Your recorded test'}${elsewhere ? ' · recorded in the other room; route is not drawn here' : ''}${observation.stale ? ' · the setup changed; test again' : ''}</small></div>` : '<p class=\'bc-bench-note\'>The lines show connections. Run a service test to find out whether the full route works.</p>'}<div data-bc-feedback></div>${networkCard()}${introMaterials()}</section>`;
  }
  function tabs() {
    const c = view.controls || {};
    const available = [c.kit && ['kit','Kit'],['devices','Devices'],c.cables && ['cables','Cables'],c.wireless && ['wireless','Wi-Fi'],c.access && ['access','Access'],c.diagnostics && ['tests','Tests'],c.reflection && ['reflection','Explain']].filter(Boolean);
    if (!available.some(([id]) => id === panel)) panel = available[0]?.[0] || 'devices';
    return available;
  }
  function panelHeader(title, copy = '') { return `<h2 id='bc-panel-heading' tabindex='-1'>${esc(title)}</h2>${copy ? `<p class='bc-panel-copy'>${esc(copy)}</p>` : ''}`; }
  function kitPanel() {
    return panelHeader('Meet your hardware','Choose the parts for this local service. Then power each device on.') + list(view.roleOptions).map(role => `<form data-form='kit' data-role-id='${esc(role.roleId)}' class='bc-kit-role'><label for='bc-kit-${esc(role.roleId)}'>${esc(role.label)}</label><select id='bc-kit-${esc(role.roleId)}' name='kind' ${disabled(!can('CHOOSE_DEVICE'))}>${list(role.choices).map(choice => option(choice.kind,choice.label,device(role.deviceId)?.kind)).join('')}</select><p class='bc-small'>${esc(list(role.choices).find(c => c.kind === device(role.deviceId)?.kind)?.description || role.choices?.[0]?.description || '')}</p><div class='bc-button-row'><button class='bc-button bc-outline' type='submit' ${disabled(!can('CHOOSE_DEVICE'))}>${role.deviceId ? 'Change' : 'Add'} ${esc(role.label)}</button>${role.deviceId ? button('power',`${device(role.deviceId)?.powered ? 'Power off' : 'Power on'} ${esc(deviceName(device(role.deviceId)))}`,`data-device-id='${esc(role.deviceId)}' data-on='${!device(role.deviceId)?.powered}' ${disabled(!can('POWER_DEVICE'))}`,device(role.deviceId)?.powered ? 'bc-text' : 'bc-primary') : ''}</div>${role.deviceId ? `<p class='bc-small'>${device(role.deviceId)?.powered ? '● Powered on' : '○ Powered off'}</p>` : ''}</form>`).join('') + `<p class='bc-notice'>Power makes a device available. Cables and settings are separate requirements.</p>`;
  }
  function settingsConflict(draft, d) {
    return !!draft && (draft.needsReview || ['address','mask','wifiApId'].some(key => String(draft.base?.[key] ?? '') !== String(d[key] ?? '')));
  }
  function devicesPanel() {
    const d = selected();
    if (!d) return panelHeader('Inspect the equipment','Add a device from Kit, then select it to see its power, ports and settings.');
    const draft = settingDraft(d.id), conflict = settingsConflict(draft,d);
    const hasAddress = can('SET_STATIC_ADDRESS') && d.id === (view.lessonId === 'boot.address' ? view.workstationDeviceId : view.nurseDeviceId);
    return panelHeader('Look before you change','Select a device, read its settings, then make a purposeful change.') + `<label for='bc-inspect-device'>Device</label><select id='bc-inspect-device' data-select='device'>${list(view.devices).map(item => option(item.id,`${deviceName(item)} · ${item.label}`,d.id)).join('')}</select><div class='bc-device-inspector'><div class='bc-inspector-art'>${materialArtwork({assetKind:d.kind,title:deviceName(d)})}</div><div><h3>${esc(deviceName(d))}</h3><p>${esc(d.label)}<br><strong>${d.powered ? '● Power on' : '○ Power off'}</strong>${d.roleId === 'role.nurse' ? '<br>'+esc(roomName(d.locationId)) : ''}</p></div></div><div class='bc-button-row'>${button('inspect','Record inspection',`data-device-id='${esc(d.id)}' ${disabled()}`,'bc-outline')}${can('POWER_DEVICE') ? button('power',d.powered ? 'Power off' : 'Power on',`data-device-id='${esc(d.id)}' data-on='${!d.powered}' ${disabled()}`,d.powered ? 'bc-text' : 'bc-primary') : ''}</div>${hasAddress ? `<form data-form='address' data-device-id='${esc(d.id)}' class='bc-subpanel'><h3>IP settings</h3><p class='bc-small'>Current: <code>${esc(d.address)}</code> · mask <code>${esc(d.mask)}</code></p>${conflict ? `<p class='bc-warning'>Check this draft against the current saved settings before applying it.</p>` : ''}<label for='bc-address'>Static IPv4 address</label><input id='bc-address' name='address' data-draft='address' data-device-id='${esc(d.id)}' value='${esc(draft?.address ?? d.address ?? '')}' maxlength='15' inputmode='decimal' autocomplete='off' spellcheck='false' ${readOnly() || !practice() ? 'readonly' : ''}><label for='bc-mask'>Subnet mask</label><input id='bc-mask' name='mask' data-draft='mask' data-device-id='${esc(d.id)}' value='${esc(draft?.mask ?? d.mask ?? '')}' maxlength='15' inputmode='decimal' autocomplete='off' spellcheck='false' ${readOnly() || !practice() ? 'readonly' : ''}><p class='bc-small' data-draft-note>${draft ? 'Unapplied draft. A test still uses the current saved settings.' : 'Use the current network card, then apply and test.'}</p><button type='submit' class='bc-button bc-primary' ${disabled()}>${conflict ? 'Apply reviewed address & mask' : 'Apply address & mask'}</button></form>` : ''}${d.roleId === 'role.nurse' && can('ASSOCIATE_WIFI') ? wifiForm(d) : ''}<details class='bc-details' open><summary>Ports and connections</summary><ul class='bc-port-list'>${list(d.ports).map(p => `<li><span class='bc-port-symbol' aria-hidden='true'>▣</span><span><strong>${esc(p.label || p.id)}</strong><small>${esc(p.medium)} · ${p.cableId ? 'connected' : 'available'}</small></span></li>`).join('')}</ul></details>${d.roleId === 'role.records' && can('SET_SERVICE_STATE') ? `<div class='bc-subpanel'><h3>Shared service</h3><p>${view.serverEnabled ? 'Service running' : 'Service stopped'}</p>${button('services',view.serverEnabled ? 'Stop the service' : 'Start the service',`data-enabled='${!view.serverEnabled}' ${disabled()}`,'bc-outline')}</div>` : ''}`;
  }
  function connectionDefaults() {
    const candidates = list(view.devices).filter(d => list(d.ports).some(p => p.medium === 'ethernet'));
    if (!candidates.some(d => d.id === connection.fromDeviceId)) connection.fromDeviceId = (device(view.apDeviceId) || device(view.workstationDeviceId) || candidates[0])?.id || '';
    if (!candidates.some(d => d.id === connection.toDeviceId) || connection.toDeviceId === connection.fromDeviceId) connection.toDeviceId = (device(view.switchDeviceId) || candidates.find(d => d.id !== connection.fromDeviceId))?.id || '';
    for (const side of ['from','to']) {
      const ports = list(device(connection[side+'DeviceId'])?.ports).filter(p => p.medium === 'ethernet');
      if (!ports.some(p => p.id === connection[side+'PortId'] && !p.cableId)) connection[side+'PortId'] = ports.find(p => !p.cableId)?.id || '';
    }
    return candidates;
  }
  function cablesPanel() {
    const candidates = connectionDefaults();
    return panelHeader('Connect the right ports','Use an Ethernet patch cable between compatible Ethernet ports. Choose both ends; no dragging is needed.') + `<form data-form='cable' class='bc-cable-form'>${['from','to'].map((side,index) => `<fieldset><legend>${index ? 'Second end' : 'First end'}</legend><label for='bc-${side}-device'>Device</label><select id='bc-${side}-device' data-connect='${side}DeviceId' ${disabled(!can('CONNECT_PORTS'))}>${candidates.map(d => option(d.id,deviceName(d),connection[side+'DeviceId'])).join('')}</select><label for='bc-${side}-port'>Ethernet port</label><select id='bc-${side}-port' data-connect='${side}PortId' ${disabled(!can('CONNECT_PORTS'))}>${option('','Choose an available port',connection[side+'PortId'])}${list(device(connection[side+'DeviceId'])?.ports).filter(p => p.medium === 'ethernet').map(p => option(p.id,`${p.label} · ${p.cableId ? 'occupied' : 'available'}`,connection[side+'PortId'],!!p.cableId)).join('')}</select></fieldset>`).join('')}<button type='submit' class='bc-button bc-primary' ${disabled(!can('CONNECT_PORTS') || !connection.fromPortId || !connection.toPortId)}>Connect these ports</button></form><p class='bc-small'>All training cables are supplied. This bench models Ethernet; USB, display and power leads have different jobs.</p><h3>Installed cables</h3>${list(view.cables).length ? list(view.cables).map(c => `<div class='bc-cable-record'><p><strong>${esc(deviceName(device(c.fromDeviceId)))}</strong> ↔ <strong>${esc(deviceName(device(c.toDeviceId)))}</strong><br><small>${esc(device(c.fromDeviceId)?.ports?.find(p => p.id === c.fromPortId)?.label || 'Ethernet')} ↔ ${esc(device(c.toDeviceId)?.ports?.find(p => p.id === c.toPortId)?.label || 'Ethernet')}</small></p><div class='bc-button-row'>${button('inspect-cable','Inspect cable',`data-cable-id='${esc(c.id)}' ${disabled()}`,'bc-text')}${button('disconnect','Disconnect',`data-cable-id='${esc(c.id)}' ${disabled(!can('DISCONNECT_CABLE'))}`,'bc-text')}</div></div>`).join('') : `<p class='bc-notice'>No Ethernet cables are installed yet.</p>`}`;
  }
  function wifiForm(d) {
    const draft = settingDraft(d.id), aps = list(view.devices).filter(item => item.kind === 'access-point');
    return `<form data-form='wifi' data-device-id='${esc(d.id)}' class='bc-subpanel'><h3>Wi-Fi association</h3><label for='bc-wifi-ap'>Access point</label><select id='bc-wifi-ap' name='apDeviceId' data-draft='wifiApId' data-device-id='${esc(d.id)}' ${disabled(!can('ASSOCIATE_WIFI'))}>${option('','Not associated',draft?.wifiApId ?? d.wifiApId ?? '')}${aps.map(ap => option(ap.id,`${deviceName(ap)} · ${ap.powered ? 'power on' : 'power off'}`,draft?.wifiApId ?? d.wifiApId ?? '')).join('')}</select><button type='submit' class='bc-button bc-primary' ${disabled(!can('ASSOCIATE_WIFI'))}>Apply Wi-Fi choice</button><p class='bc-small'>Association is only one part of the route. The AP also needs power and an Ethernet uplink.</p></form>`;
  }
  function wirelessPanel() {
    const ap = device(view.apDeviceId), mobile = device(view.nurseDeviceId);
    return panelHeader('Build the wireless path','An access point joins this mobile device to the same local network. It does not replace the switch or server.') + `<div class='bc-subpanel'><h3>Access point</h3><p>${ap?.powered ? '● Power on' : '○ Power off'}</p>${ap ? button('power',ap.powered ? 'Power off access point' : 'Power on access point',`data-device-id='${esc(ap.id)}' data-on='${!ap.powered}' ${disabled(!can('POWER_DEVICE'))}`,ap.powered ? 'bc-outline' : 'bc-primary') : ''}${button('panel','Choose the Ethernet uplink','data-panel=\'cables\'','bc-text')}</div>${mobile ? wifiForm(mobile) : ''}<p class='bc-notice'>Move the mobile workstation to Room A and Room B using the bench controls. Run its service test in each room.</p>${button('probe','Run mobile test here',`data-test-id='nurse' ${disabled()}`,'bc-primary')}`;
  }
  function accessPanel() {
    const values = Array.isArray(view.policies) ? view.policies : Object.values(view.policies || {});
    const descriptions = {'policy.roles-separated':'Workstation staff book appointments; mobile staff use their workspace. Mobile staff ask the desk to arrange follow-up.','policy.nurse-also-books':'Mobile staff can also arrange bookings. That adds responsibility and permission.','policy.broad-access':'Every role, including outsiders, can use every service.','policy.deny-all':'Every role loses access, including staff who need it.'};
    return panelHeader('A connection is not permission','Choose who needs each service, then test an allowed request and an intended denial.') + values.map(p => `<article class='bc-policy ${view.policy?.id === p.id ? 'current' : ''}'><h3>${esc(p.label)}</h3><p>${esc(descriptions[p.id] || p.description || '')}</p>${view.policy?.id === p.id ? '<span class=\'bc-badge\'>CURRENT</span>' : ''}${button('policy',view.policy?.id === p.id ? 'Keep this policy' : 'Choose this policy',`data-policy-id='${esc(p.id)}' ${disabled(!can('SET_PERMISSIONS'))}`,'bc-outline')}</article>`).join('') + button('probe','Test staff and outsiders',`data-test-id='all' ${disabled()}`,'bc-primary');
  }
  function testsPanel() {
    return panelHeader('Test the result','A fresh test records what this setup can do. Read the reason before deciding what to change.') + `<div class='bc-test-buttons'>${view.workstationDeviceId ? button('probe','Run workstation test',`data-test-id='reception' ${disabled()}`,'bc-primary') : ''}${view.nurseDeviceId ? button('probe','Run mobile test here',`data-test-id='nurse' ${disabled()}`,'bc-primary') : ''}${view.controls?.access ? button('probe','Test staff and outsiders',`data-test-id='all' ${disabled()}`,'bc-outline') : ''}</div><ul class='bc-test-records'>${list(view.observations).slice(0,10).map(o => `<li><button type='button' class='bc-test-record ${o.stale ? 'stale' : o.pass ? 'pass' : 'attention'}' data-action='observation' data-observation-id='${esc(o.id)}' aria-pressed='${selectedObservationId === o.id}'><strong>${o.stale ? '↻ Stale' : o.pass ? '✓ Passed' : '! Needs attention'} · ${esc(testName(o.testId))}</strong><span>${esc(diagnosticText(o.message))}</span><small>${o.origin === 'trainer' ? 'Jo’s demonstration' : 'Your test'}${o.locationId === 'location.exam-a' || o.locationId === 'location.exam-b' ? ' · '+esc(roomName(o.locationId)) : ''}</small></button></li>`).join('')}</ul>${!list(view.observations).length ? '<p class=\'bc-notice\'>No test has been recorded in this attempt.</p>' : ''}`;
  }
  function reflectionPanel() {
    const saved = view.reflection || {}, draft = reflectionDraft(), value = draft || saved;
    const conflict = draft && (draft.needsReview || String(draft.base?.text || '') !== String(saved.text || '') || !!draft.base?.oral !== !!saved.oral);
    const prompt = lesson()?.reflection;
    return panelHeader(prompt?.title || 'Explain the repair','Record your reasoning in your own words. A teacher reviews it; this is not a keyword test.') + `<form data-form='reflection'><label for='bc-reflection'>${esc(prompt?.prompt || prompt?.question || 'Why would changing an IP address not repair the missing physical connection? What did your test show after your repair?')}</label><textarea id='bc-reflection' rows='6' maxlength='2000' data-draft='reflection' ${readOnly() || !practice() ? 'readonly' : ''}>${esc(value.text || '')}</textarea><label class='bc-check-label'><input type='checkbox' data-draft='oral' ${value.oral ? 'checked' : ''} ${disabled()}> Discuss this explanation with my teacher — review pending.</label>${conflict ? '<p class=\'bc-warning\'>Check this draft against the current saved explanation before replacing it.</p><details class=\'bc-details\'><summary>Current saved explanation</summary><p class=\'bc-exact\'>'+esc(saved.text || '[No written explanation]')+'</p></details>' : ''}<p class='bc-small' data-draft-note>${draft ? 'Unsubmitted draft. Save it before completing the lesson.' : saved.submitted ? 'Saved for teacher review; no quality grade awarded.' : 'A short written explanation or pending oral arrangement is needed.'}</p><button type='submit' class='bc-button bc-primary' ${disabled()}>${conflict ? 'Replace saved explanation with this draft' : 'Save my explanation'}</button></form>`;
  }
  function controls() {
    if (!['practice','complete'].includes(view.phase)) return `<section class='bc-demo-progress'><h3>${view.phase === 'intro' ? view.demo?.available ? 'A worked example, then your turn' : 'Use your troubleshooting method' : 'The demonstration so far'}</h3><ol>${list(view.demo?.steps).map((step,index) => `<li class='${step.done ? 'done' : ''}'><span>${step.done ? '✓' : index+1}</span><p>${esc(list(lesson()?.demonstration?.steps).find(s => s.id === step.id)?.title || step.title)}</p></li>`).join('')}</ol>${view.phase === 'intro' && !view.demo?.available ? '<p>This challenge has no solved demonstration. Use the method and free guides to investigate.</p>' : ''}</section>`;
    const t = tabs();
    const body = ({kit:kitPanel,devices:devicesPanel,cables:cablesPanel,wireless:wirelessPanel,access:accessPanel,tests:testsPanel,reflection:reflectionPanel}[panel] || devicesPanel)();
    return `<section class='bc-tools'><nav class='bc-tool-tabs' role='tablist' aria-label='Training tools'>${t.map(([id,label]) => button('panel',esc(label),`data-panel='${id}' id='bc-tab-${id}' role='tab' aria-selected='${panel === id}' aria-controls='bc-tool-panel' tabindex='${panel === id ? 0 : -1}'`,'bc-tool-tab')).join('')}</nav><div class='bc-tool-panel' id='bc-tool-panel' role='tabpanel' aria-labelledby='bc-tab-${panel}'>${body}</div></section>`;
  }
  function checkDetail(check) {
    if (view.lessonId === 'boot.transfer' && check.id === 'fault-observed') return 'Record a test or inspect the route before changing the setup.';
    if (view.lessonId === 'boot.transfer' && check.id === 'relevant-repair') return 'Use your observations to choose what to change, then run a new test.';
    const observation = list(view.observations).find(o => check.detail === `${o.code}: ${o.message}`);
    return observation ? `${observation.code}: ${diagnosticText(observation.message)}` : check.detail;
  }
  function checkLabel(check) {
    return view.lessonId === 'boot.transfer' && check.id === 'relevant-repair'
      ? 'Make a relevant repair and retest' : check.label;
  }
  function checks() {
    if (!['practice','complete'].includes(view.phase)) return '';
    return `<section class='bc-checks'><h3>${view.phase === 'complete' ? 'Recorded task conditions' : 'What needs to work'}</h3><ul>${list(view.checks).map(check => `<li class='${check.met ? 'met' : ''}'><span aria-hidden='true'>${check.met ? '✓' : '○'}</span><div><strong>${esc(checkLabel(check))}</strong><small>${esc(checkDetail(check))}</small></div></li>`).join('')}</ul>${view.phase === 'practice' ? button('finish','Record this lesson & continue →',disabled(!view.canComplete),'bc-primary bc-wide') : ''}<p class='bc-small'>Training task conditions are checked by the simulation. Understanding and explanation quality remain for teacher review.</p></section>`;
  }
  function workspace() {
    if (view.phase === 'welcome') return welcome();
    return `<div class='bc-workspace'><div class='bc-bench-column'>${bench()}${checks()}</div><aside class='bc-coach-column' aria-label='Mentor and training controls'>${mentor()}${controls()}</aside></div>`;
  }

  function materialsBody() {
    const categories = list(C.materialCategories);
    if (!categories.some(c => c.id === materialCategory)) materialCategory = categories[0]?.id || 'computers';
    const cards = list(C.materials).filter(m => m.category === materialCategory);
    return `<p>${esc(C.materialsIntro || 'Learn what each item does, which port it uses and when it belongs in the path.')}</p><div class='bc-material-tabs' role='group' aria-label='Equipment guide categories'>${categories.map(c => button('material-category',esc(c.title),`data-category='${esc(c.id)}' aria-pressed='${c.id === materialCategory}'`,'bc-outline')).join('')}</div><div class='bc-material-grid'>${cards.map(m => `<article class='bc-material-card'><div class='bc-material-art'>${materialArtwork(m)}</div><h3>${esc(m.title)}</h3><p>${esc(m.purpose)}</p><dl><dt>Ports and connection</dt><dd>${esc(m.ports)} ${esc(m.connection)}</dd><dt>In this training</dt><dd>${esc(m.useInThisMission)}</dd><dt>A common mix-up</dt><dd>${esc(m.commonMistake)}</dd></dl></article>`).join('')}</div>${materialCategory === 'network' ? `<h3>Network basics</h3>${list(C.networkBasics).map(n => `<details class='bc-details'><summary>${esc(n.title)}</summary><p>${esc(n.text)}</p></details>`).join('')}` : ''}`;
  }
  function howtoBody() {
    const l = lesson();
    if (!l) return `<p>Start a lesson to see its how-to steps, or explore the equipment and cable guide first.</p>${button('materials','Open equipment & cable guide','','bc-primary')}`;
    const revealed = list(view.hints?.revealed);
    return `<p><strong>${esc(l.title)}</strong></p><p>${esc(l.purpose)}</p><ol class='bc-howto-steps'>${list(l.practice?.steps).map(step => `<li><strong>${esc(step.title)}</strong><p>${esc(step.text)}</p></li>`).join('')}</ol><h3>Choose a little more guidance</h3>${list(l.hints).map(h => `<section class='bc-hint'><h4>Hint ${h.tier} · ${esc(h.title)}</h4>${revealed.includes(h.tier) ? `<p>${esc(h.text)}</p>` : button('hint',`Reveal hint ${h.tier}`,`data-tier='${h.tier}' ${disabled(false,true)}`,'bc-outline')}</section>`).join('')}<h3>Understand the idea</h3>${list(l.reference).map(ref => `<details class='bc-details'><summary>${esc(ref.title)}</summary><p>${esc(ref.text)}</p></details>`).join('')}<p class='bc-notice'>Training guidance, reading time and retry are free. Hint use does not award or reduce a grade.</p>`;
  }
  function progressBody() {
    return `<p>Progress stays in this browser profile and site. Download a copy before changing computers or clearing site data.</p><div class='bc-button-row'>${button('export','Download progress','data-format=\'progress\'','bc-primary')}${button('export','Download readable evidence','data-format=\'evidence\'','bc-outline')}${button('export','Download evidence JSON','data-format=\'json\'','bc-outline')}</div><p class='bc-small'>Progress reopens training and field work. Evidence is for teacher review. It includes accepted actions and saved explanations; unsubmitted drafts stay separate.</p>${dirtyCount() ? button('drafts','Download unsubmitted draft rescue','','bc-outline') : ''}<details class='bc-details'><summary>Open a downloaded progress file</summary><p>The whole file is validated before replacement. A rejected file leaves your current progress unchanged.</p>${button('choose-file','Choose progress JSON',disabled(false,true),'bc-outline')}<label for='bc-progress-paste'>Or paste programme progress JSON</label><textarea id='bc-progress-paste' rows='4' data-draft='import' ${readOnly() ? 'readonly' : ''}>${esc(pasteText)}</textarea>${button('review-import','Review pasted import',disabled(!pasteText.trim(),true),'bc-outline')}</details><details class='bc-details'><summary>Recovery and local save</summary><p>Download progress and any drafts before replacing or clearing work. Earlier completed training records and field work are preserved when you reset only the current practice.</p><div class='bc-button-row'>${view.attemptId ? button('retry','Review practice reset',disabled(false,true),'bc-outline') : ''}${button('recover','Review saved backup',disabled(false,true),'bc-outline')}${button('clear','Review clearing local save',disabled(false,true),'bc-outline')}</div></details>`;
  }
  function renderModal() {
    if (!modal) { update('modal',''); return; }
    let title = '', body = '', footer = '';
    const destructive = ['import','clear','recover','takeover','retry','replace-lesson','replace-demo'].includes(modal.type);
    switch (modal.type) {
      case 'materials': title = 'Equipment & cable guide'; body = materialsBody(); break;
      case 'howto': title = 'A how-to guide, whenever you need it'; body = howtoBody(); break;
      case 'progress': title = 'Keep your training and field progress'; body = progressBody(); break;
      case 'import': title = 'Replace progress with this file?'; body = `<p>${esc(modal.filename || 'Pasted programme progress JSON')}</p><p>Validation happens before replacement. Cancel or a rejected file keeps your work. Unsubmitted drafts remain separate and will need review.</p>${button('export','Download current progress','data-format=\'progress\'','bc-outline')}`; footer = button('apply-import','Validate & replace current progress',disabled(false,true),'bc-primary'); break;
      case 'recover': title = 'Restore the last good save?'; body = '<p>This replaces the current programme with the last valid local snapshot. Download progress and drafts first if you want both versions.</p>'; footer = button('apply-recover','Restore saved backup',disabled(false,true),'bc-primary'); break;
      case 'clear': title = 'Clear this local programme?'; body = '<p>This removes this browser’s programme save and backup, including its training and field work. Download progress first. The separate earlier clinic save is unaffected.</p>'+button('export','Download current progress','data-format=\'progress\'','bc-outline'); footer = button('apply-clear','Clear local programme',disabled(false,true),'bc-danger'); break;
      case 'takeover': title = 'Take control in this tab?'; body = '<p>Load the newest saved programme here. The other tab becomes read-only. Your unsubmitted drafts remain separate for review.</p>'; footer = button('apply-takeover','Take control',busy ? 'disabled' : '','bc-primary'); break;
      case 'retry': title = 'Start this practice again?'; body = '<p>A fresh practice bench replaces this attempt. Completed training records and the independent field job stay preserved. Old drafts remain available in the draft rescue and will not be applied to the new attempt.</p>'; footer = button('apply-retry','Start fresh practice',disabled(false,true),'bc-primary'); break;
      case 'replace-lesson': title = 'Open a different training task?'; body = '<p>The active practice is replaced by a fresh lesson. Earlier completed records and field work remain preserved. Save or download any explanation draft you want to keep.</p>'; footer = button('apply-lesson',`Open ${esc(shortTitle(modal.lessonId))}`,disabled(false,true),'bc-primary'); break;
      case 'replace-demo': title = 'Watch a fresh worked example?'; body = '<p>The current practice bench is replaced by Jo’s demonstration. It earns no learner credit. Your old drafts and completed training records remain separate.</p>'; footer = button('apply-demo','Watch the example',disabled(false,true),'bc-primary'); break;
    }
    update('modal',`<div class='bc-modal-backdrop'><section class='bc-dialog ${modal.type === 'materials' ? 'bc-dialog-wide' : ''}' role='dialog' aria-modal='true' aria-labelledby='bc-dialog-title'><header><h2 id='bc-dialog-title' tabindex='-1'>${esc(title)}</h2>${button('close','×',"aria-label='Close dialog'",'bc-close')}</header><div class='bc-dialog-body'>${body}</div><footer>${button('close',destructive ? 'Cancel' : 'Close','','bc-outline')}${footer}</footer></section></div>`);
  }
  function render() {
    if (closed) return;
    const focus = focusSnapshot(); view = getView();
    const scope = currentScope();
    if (scope !== lastScope) {
      selectedDeviceId = view.workstationDeviceId || view.nurseDeviceId || view.devices?.[0]?.id || null;
      selectedObservationId = null; connection = {fromDeviceId:'',fromPortId:'',toDeviceId:'',toPortId:''};
      panel = view.controls?.kit ? 'kit' : view.lessonId === 'boot.cables' ? 'cables' : view.lessonId === 'boot.wireless' ? 'wireless' : view.lessonId === 'boot.access' ? 'access' : view.lessonId === 'boot.transfer' ? 'tests' : 'devices';
      lastScope = scope;
    }
    if (previousReadOnly && !readOnly()) markDraftsForReview();
    previousReadOnly = readOnly();
    if (!device(selectedDeviceId)) selectedDeviceId = view.workstationDeviceId || view.nurseDeviceId || view.devices?.[0]?.id || null;
    update('header',header()); update('storage',storage()); update('intro',intro()); update('lessons',lessons()); update('workspace',workspace());
    update('footer',`<span>Opening Shift · ${esc(view.buildVersion || '0.8.0-review')} · Original training bench</span><span>Free training · no names or patient information</span>${button('materials','Equipment & cable guide','','bc-text')}`);
    renderFeedback(); renderModal(); setBackgroundInert(!!modal);
    if (!restoreFocus(focus) && modal) root.querySelector('#bc-dialog-title')?.focus({preventScroll:true});
  }

  async function selectDevice(id) {
    selectedDeviceId = id; panel = 'devices'; render();
    if (practice() && !readOnly()) await boot({type:'INSPECT_DEVICE',deviceId:id});
  }
  async function applyAddress(form) {
    const id = form.dataset.deviceId, snapshot = {address:form.elements.address.value,mask:form.elements.mask.value};
    await network({type:'SET_STATIC_ADDRESS',deviceId:id,...snapshot},() => {
      const draft = settingDraft(id);
      if (draft?.address === snapshot.address && draft?.mask === snapshot.mask) {
        if (draft.wifiApId === (device(id)?.wifiApId || '')) delete bucket().settings[id];
        else { draft.base.address = snapshot.address; draft.base.mask = snapshot.mask; }
      }
      saveDrafts();
    });
  }
  async function saveReflection(form) {
    const text = form.querySelector('textarea').value, oral = form.querySelector('input[type=checkbox]').checked;
    await boot({type:'SAVE_REFLECTION',text,oral},() => {
      const draft = reflectionDraft();
      if (!draft || draft.text === text && draft.oral === oral) bucket().reflection = null;
      saveDrafts();
    });
  }
  async function onClick(event) {
    const target = event.target.closest('[data-action]'); if (!target || !root.contains(target) || target.disabled) return;
    const {action:a,...d} = target.dataset;
    if (a === 'close') return closeModal();
    if (a === 'materials') return openModal('materials');
    if (a === 'howto') return openModal('howto');
    if (a === 'progress') return openModal('progress');
    if (a === 'material-category') { materialCategory = d.category; renderModal(); restoreFocus({id:'',attrs:target.dataset}); return; }
    if (a === 'panel') { panel = d.panel; render(); root.querySelector(`#bc-tab-${CSS.escape(panel)}`)?.focus({preventScroll:true}); return; }
    if (a === 'device') return selectDevice(d.deviceId);
    if (a === 'observation') { selectedObservationId = d.observationId; render(); return; }
    if (a === 'lesson') {
      if (practice()) return openModal('replace-lesson',{lessonId:d.lessonId});
      return boot({type:'START_LESSON',lessonId:d.lessonId});
    }
    if (a === 'apply-lesson') return boot({type:'START_LESSON',lessonId:modal.lessonId},closeModal);
    if (a === 'start-demo') { if (practice()) return openModal('replace-demo'); return boot({type:'START_DEMO'}); }
    if (a === 'apply-demo') return boot({type:'START_DEMO'},closeModal);
    if (a === 'next-demo') return boot({type:'NEXT_DEMO'});
    if (a === 'start-practice') return boot({type:'START_PRACTICE'});
    if (a === 'retry') return openModal('retry');
    if (a === 'apply-retry') return replacement(onReset);
    if (a === 'finish') return boot({type:'COMPLETE_LESSON'});
    if (a === 'field') { saveDrafts(); return run({type:'ENTER_FIELD'}); }
    if (a === 'hint') return boot({type:'REVEAL_HINT',tier:Number(d.tier)});
    if (a === 'inspect') return boot({type:'INSPECT_DEVICE',deviceId:d.deviceId});
    if (a === 'inspect-cable') return boot({type:'INSPECT_CABLE',cableId:d.cableId});
    if (a === 'power') return network({type:'POWER_DEVICE',deviceId:d.deviceId,on:d.on === 'true'});
    if (a === 'services') return network({type:'SET_SERVICE_STATE',enabled:d.enabled === 'true'});
    if (a === 'move') return network({type:'MOVE_NURSE',locationId:d.locationId});
    if (a === 'policy') return network({type:'SET_PERMISSIONS',policyId:d.policyId});
    if (a === 'disconnect') return network({type:'DISCONNECT_CABLE',cableId:d.cableId});
    if (a === 'probe') return boot({type:'RUN_TEST',testId:d.testId},() => { selectedObservationId = getView().observations?.[0]?.id || null; });
    if (a === 'drafts') return onExport('draft',rescueText());
    if (a === 'export') return onExport(d.format);
    if (a === 'choose-file') return root.querySelector('#bc-import-file').click();
    if (a === 'review-import') { pendingImport = null; return openModal('import',{filename:'Pasted programme progress JSON'}); }
    if (a === 'apply-import') return replacement(() => onImport(pendingImport || pasteText));
    if (['recover','clear','takeover'].includes(a)) return openModal(a);
    if (a === 'apply-recover') return replacement(onRecover);
    if (a === 'apply-clear') return replacement(onClear);
    if (a === 'apply-takeover') return replacement(onTakeControl);
  }
  async function onSubmit(event) {
    const form = event.target.closest('form[data-form]'); if (!form || !root.contains(form)) return;
    event.preventDefault(); if (busy || readOnly() || !practice()) return;
    if (form.dataset.form === 'kit') return network({type:'CHOOSE_DEVICE',roleId:form.dataset.roleId,kind:form.elements.kind.value},() => { selectedDeviceId = getView().roleOptions.find(r => r.roleId === form.dataset.roleId)?.deviceId || selectedDeviceId; });
    if (form.dataset.form === 'cable') return network({type:'CONNECT_PORTS',...connection});
    if (form.dataset.form === 'address') return applyAddress(form);
    if (form.dataset.form === 'wifi') {
      const id = form.dataset.deviceId, value = form.elements.apDeviceId.value;
      return network({type:'ASSOCIATE_WIFI',deviceId:id,apDeviceId:value || null},() => { const draft = settingDraft(id); if (draft && draft.wifiApId === value) { draft.wifiApId = value; draft.base.wifiApId = value; if (draft.address === device(id)?.address && draft.mask === device(id)?.mask) delete bucket().settings[id]; } saveDrafts(); });
    }
    if (form.dataset.form === 'reflection') return saveReflection(form);
  }
  function onInput(event) {
    const target = event.target;
    if (target.dataset.draft === 'import') { pasteText = target.value; const review = root.querySelector('[data-action=review-import]'); if (review) review.disabled = !pasteText.trim() || busy || readOnly(); return; }
    if (readOnly() || !practice()) return;
    if (target.dataset.draft === 'reflection') draftReflection('text',target.value);
    else if (target.dataset.draft === 'oral') draftReflection('oral',target.checked);
    else if (['address','mask','wifiApId'].includes(target.dataset.draft)) draftSetting(target.dataset.deviceId,target.dataset.draft,target.value);
    else return;
    const note = target.closest('form')?.querySelector('[data-draft-note]');
    if (note) note.textContent = 'Unsubmitted draft. Apply or save it before recording evidence.';
    update('storage',storage());
  }
  function onChange(event) {
    const target = event.target;
    if (target.id === 'bc-import-file') { const file = target.files?.[0]; if (file) { pendingImport = file; openModal('import',{filename:file.name}); } target.value = ''; return; }
    if (target.dataset.select === 'device') { selectDevice(target.value); return; }
    if (target.dataset.connect) { connection[target.dataset.connect] = target.value; render(); return; }
    if (target.dataset.draft) onInput(event);
  }
  function onKeydown(event) {
    if (modal) {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
      if (event.key === 'Tab') {
        const dialog = root.querySelector('.bc-dialog');
        const items = [...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]')].filter(el => !el.closest('[hidden]') && el.getClientRects().length);
        if (!items.length) { event.preventDefault(); return; }
        if (!dialog.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? items.at(-1) : items[0]).focus(); }
        else if (event.shiftKey && (document.activeElement === items[0] || document.activeElement.id === 'bc-dialog-title')) { event.preventDefault(); items.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
      }
      return;
    }
    if (event.target.getAttribute('role') === 'tab' && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault(); const t = tabs(), i = t.findIndex(([id]) => id === panel);
      panel = t[event.key === 'Home' ? 0 : event.key === 'End' ? t.length-1 : (i+(event.key === 'ArrowRight' ? 1 : -1)+t.length)%t.length][0];
      render(); root.querySelector(`#bc-tab-${CSS.escape(panel)}`)?.focus();
    }
  }
  root.addEventListener('click',onClick); root.addEventListener('submit',onSubmit); root.addEventListener('input',onInput); root.addEventListener('change',onChange); root.addEventListener('keydown',onKeydown);
  window.addEventListener('pagehide',saveDrafts);
  render();
  return {render,showStatus,destroy() { saveDrafts(); closed = true; window.removeEventListener('pagehide',saveDrafts); root.removeEventListener('click',onClick); root.removeEventListener('submit',onSubmit); root.removeEventListener('input',onInput); root.removeEventListener('change',onChange); root.removeEventListener('keydown',onKeydown); }};
}
