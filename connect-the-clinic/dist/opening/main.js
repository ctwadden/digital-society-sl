import {createProgramme, dispatchProgramme, deriveProgramme, validateProgrammeSave, serializeProgrammeProgress, createProgrammeEvidence} from './programme.js';
import {createPersistence} from '../persistence.js';
import {mountOpeningUI} from './ui.js';
import {mountBootcampUI} from '../bootcamp/ui.js';

const BUILD_VERSION = '0.8.0-review';
const root = document.querySelector('#app');
let store = null, ui = null, mountedScreen = null;

function download(data, type, filename) {
  const url = URL.createObjectURL(new Blob([data], {type}));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.hidden = true;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function getView(screen) {
  const programme = deriveProgramme(store.getState());
  const common = {storage:store.getStatus(), buildVersion:BUILD_VERSION};
  if (screen === 'bootcamp') return {...programme.bootcamp, ...common,
    canEnterField:programme.canEnterField, fieldStarted:programme.fieldStarted,
    migrationNotice:programme.migrationNotice};
  return {...programme.field, ...common, bootcampAvailable:true,
    trainingOverview:{completed:programme.bootcamp.progress.completed,
      total:programme.bootcamp.progress.total, complete:programme.bootcamp.courseComplete}};
}

function report(result) {
  renderApp();
  ui?.showStatus(result.message || 'Updated.', result.accepted ? 'info' : 'error');
  return result;
}

function handlers(screen) {
  return {
    getView:() => getView(screen),
    send:async action => report(await store.send(action)),
    onExport:async (format, draft) => {
      const state = store.getState();
      const id = String(state.campaignId || 'programme').replace(/[^a-zA-Z0-9_-]/g, '-');
      if (format === 'progress') {
        download(serializeProgrammeProgress(state), 'application/json', `opening-shift-progress-${id}.json`);
      } else if (format === 'draft') {
        download(typeof draft === 'string' ? draft : JSON.stringify(draft ?? {}, null, 2),
          'text/plain;charset=utf-8', `opening-shift-UNSUBMITTED-drafts-${id}.txt`);
      } else {
        const evidence = createProgrammeEvidence(state);
        if (format === 'json') download(JSON.stringify(evidence.json, null, 2), 'application/json', `opening-shift-evidence-${id}.json`);
        else download(evidence.text, 'text/plain;charset=utf-8', `opening-shift-evidence-${id}.txt`);
      }
      const result = {accepted:true, message:'Download prepared. Training and field records remain distinct. Check your browser downloads; school policies determine where the file is saved.'};
      ui?.showStatus(result.message, 'info'); return result;
    },
    onImport:async input => {
      try {
        if (!input) return report({accepted:false, message:'Choose an Opening Shift progress file or paste its JSON. Current work is unchanged.'});
        if (typeof input !== 'string' && input.size > 1048576) return report({accepted:false, message:'Progress files must be under 1 MiB. Current work is unchanged.'});
        const raw = typeof input === 'string' ? input : await input.text();
        if (new TextEncoder().encode(raw).length > 1048576) return report({accepted:false, message:'Progress files must be under 1 MiB. Current work is unchanged.'});
        return report(await store.importProgress(raw));
      } catch {
        return report({accepted:false, message:'That progress file could not be read. Current work is unchanged.'});
      }
    },
    onReset:async () => report(await store.send(screen === 'bootcamp'
      ? {type:'BOOT_ACTION', action:{type:'RESTART_PRACTICE'}} : {type:'RESET_SHIFT'})),
    onClear:async () => report(await store.clear()),
    onTakeControl:async () => report(await store.takeControl()),
    onRecover:async () => report(await store.recover())
  };
}

function renderApp() {
  if (!store) return;
  const screen = deriveProgramme(store.getState()).screen;
  if (screen !== mountedScreen || !ui) {
    ui?.destroy(); ui = null;
    // Fresh hosts remove old delegated listeners; saved drafts keep their scope.
    const host = document.createElement('div');
    host.dataset.programmeScreen = screen;
    root.replaceChildren(host);
    mountedScreen = screen;
    ui = screen === 'bootcamp'
      ? mountBootcampUI(host, handlers(screen)) : mountOpeningUI(host, handlers(screen));
    focusScreenHeading();
  } else {
    // A persistence notification and report() can render the new screen twice.
    // Preserve an already-focused heading if a UI redraw replaced that node.
    const active = document.activeElement;
    const headingWasFocused = active?.tagName === 'H1' && root.contains(active);
    ui.render();
    if (headingWasFocused && (!document.activeElement || document.activeElement === document.body)) focusScreenHeading();
  }
}

function focusScreenHeading() {
  const heading = root.querySelector('h1');
  if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
}

try {
  const params = new URL(location.href).searchParams;
  const initialFixture = params.get('fixture') === 'B' ? 'B' : 'A';
  store = await createPersistence({
    namespace:'riverbend.clinic.opening.v1.',
    createGame:() => createProgramme({fixture:initialFixture}),
    dispatch:dispatchProgramme, validateSave:validateProgrammeSave,
    onChange:renderApp
  });
  renderApp();
} catch (error) {
  root.replaceChildren();
  const main = document.createElement('main'); main.className = 'loading';
  const heading = document.createElement('h1'); heading.textContent = 'Opening Shift could not open';
  const info = document.createElement('p'); info.textContent = 'Reload this page. Keep any downloaded progress file if the problem continues.';
  const detail = document.createElement('pre'); detail.textContent = String(error?.message || error);
  const legacy = document.createElement('a'); legacy.href = './index.html'; legacy.textContent = 'Open the preserved earlier clinic';
  main.append(heading, info, detail, legacy); root.append(main); console.error(error);
}
