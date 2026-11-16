import {createGame,dispatch,derive,createEvidence,validateSave} from './engine.js';
import {createPersistence} from './persistence.js';
import {mountUI} from './ui.js';
import {BUILD_VERSION} from './catalog.js';

const root=document.querySelector('#app');
let ui;
function download(data,type,filename) {
  const blob=new Blob([data],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.hidden=true;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
try {
  // Only new/explicitly cleared campaigns use the introductory lesson.
  // The persistence adapter restores a validated save without replacing its active attempt.
  const store=await createPersistence({createGame:()=>createGame({guidedIntro:true}),dispatch,validateSave,onChange:()=>ui?.render()});
  const getView=()=>({...derive(store.getState()),storage:store.getStatus(),buildVersion:BUILD_VERSION});
  const report=(result)=>{ui?.render();ui?.showStatus(result.message||'Updated.',result.accepted?'info':'error');return result;};
  ui=mountUI(root,{
    getView,
    getStorageStatus:()=>store.getStatus(),
    send:async action=>{const result=await store.send(action);ui?.render();return result;},
    getEvidence:()=>createEvidence(store.getState()),
    onExport:async format=>{
      // The engine supplies recorded state only. Unapplied editor drafts have a separate rescue export.
      const game=store.getState();
      const id=String(game.activeAttemptId||'attempt').replace(/[^A-Za-z0-9_-]/g,'-');
      if(format==='progress')download(JSON.stringify(game,null,2),'application/json','clinic-progress-'+id+'.json');
      else {
        const evidence=createEvidence(game);
        if(format==='json')download(JSON.stringify(evidence.json,null,2),'application/json','clinic-evidence-'+id+'.json');
        else download(evidence.text,'text/plain;charset=utf-8','clinic-evidence-'+id+'.txt');
      }
      ui?.showStatus('Download prepared. Check the browser’s download list; school download policies may affect where it is saved.');
      return {accepted:true,message:'Download prepared.'};
    },
    onExportDraft:async draft=>{
      const id=String(draft.attemptId||'attempt').replace(/[^A-Za-z0-9_-]/g,'-');
      download(draft.text,'text/plain;charset=utf-8','clinic-UNSAVED-DRAFT-'+id+'.txt');
      return {accepted:true,message:'Unsaved draft download prepared.'};
    },
    onImport:async file=>{
      if(!file)return {accepted:false,message:'Choose a progress JSON file.'};
      if(file.size>1048576)return report({accepted:false,message:'Progress files must be under 1 MiB. Current work is unchanged.'});
      try{return report(await store.importProgress(await file.text()));}
      catch{return report({accepted:false,message:'The selected file could not be read. Current work is unchanged.'});}
    },
    onReset:async()=>{
      const view=getView();
      let type=view.mode==='training'?'TRAINING_RETRY':'RESTART_ACTIVE_ATTEMPT';
      if(view.mode==='client' && (view.economy.delivered||view.economy.settled)) type='START_DELIVERED_CONTRACT_PRACTICE';
      return report(await store.send({type}));
    },
    onClear:async()=>report(await store.clear()),
    onTakeControl:async()=>report(await store.takeControl()),
    onRecover:async()=>report(await store.recover())
  });
  ui.render();
}catch(error){
  root.replaceChildren();
  const main=document.createElement('main');main.className='loading';
  const h=document.createElement('h1');h.textContent='The clinic could not open';
  const p=document.createElement('p');p.textContent='Reload this page. If the problem continues, keep any downloaded progress file and report this message to your teacher.';
  const detail=document.createElement('pre');detail.textContent=String(error?.message||error);
  main.append(h,p,detail);root.append(main);
  console.error(error);
}
