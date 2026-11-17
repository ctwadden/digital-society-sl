/* Original local persistence adapter. The engine validates state; this module only stores it.
 * An exclusive Web Lock is held for the entire writable tab lifetime, including read,
 * mutation, revision check and write. Unsupported locks => explicitly memory-only mode. */
export async function createPersistence({createGame, dispatch, validateSave, onChange=()=>{}, namespace='riverbend.clinic.v03.'}) {
  // Each separately versioned mission keeps its own snapshot, backup and tab lock.
  // The default is unchanged so older saved clinic campaigns still resume intact.
  if(typeof namespace!=='string' || !/^[a-z0-9.-]{1,80}\.$/.test(namespace))throw new Error('Invalid game-save namespace.');
  const CURRENT = namespace + 'snapshot';
  const GOOD = namespace + 'last-good';
  const LOCK = namespace + 'writer';
  const CHANNEL = namespace + 'coordination';
  let state = createGame();
  let status = {mode:'starting', label:'Checking local save…', detail:''};
  let writer = false, releaseLock = null, lastStamp = null, corrupt = false;
  let disposed = false, broadcast = null, saveCounter = 0;
  const clientId = globalThis.crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(36).slice(2);
  const notify = () => onChange();
  function setStatus(mode,label,detail='') {
    status = {mode,label,detail,canTakeControl: mode==='readonly',canRecover: !!safeRead(GOOD)};
    notify();
  }
  function safeRead(key) { try{return localStorage.getItem(key);}catch{return null;} }
  function decode(raw) {
    if(!raw) return {valid:false,error:'No local save found.'};
    if(raw.length>1200000) return {valid:false,error:'The local save is too large.'};
    try {
      const wrapper=JSON.parse(raw);
      if(wrapper.format!=='riverbend-save-envelope-v1' || typeof wrapper.stamp!=='string') return {valid:false,error:'Unrecognized local save format.'};
      const v=validateSave(wrapper.state);
      return v.valid ? {valid:true,state:v.state,stamp:wrapper.stamp,counter:wrapper.counter||0} : v;
    }catch{return {valid:false,error:'The saved file could not be read.'};}
  }
  function readLatest() {
    const raw=safeRead(CURRENT);
    if(!raw) {lastStamp=null;return;}
    const restored=decode(raw);
    if(restored.valid) { state=restored.state;lastStamp=restored.stamp;saveCounter=restored.counter;corrupt=false; }
    else {corrupt=true;setStatus('error','Saved progress needs recovery',restored.error+' Your existing save has been preserved. Use a backup or export this in-memory attempt.');}
  }
  function persist() {
    if(!writer || corrupt) return false;
    try {
      const encodedState=JSON.stringify(state);
      if(new TextEncoder().encode(encodedState).length>1048576){
        setStatus('memory','Progress too large — not saved','The current in-memory record exceeds the supported progress size. Export readable evidence before restarting. The last valid local save is preserved.');
        return false;
      }
      const existing=localStorage.getItem(CURRENT);
      const old=existing?decode(existing):null;
      if(existing && (!old?.valid || old.stamp!==lastStamp)) {
        writer=false;releaseLock?.();releaseLock=null;
        setStatus('readonly','Progress changed in another tab','Your current attempt is held in memory. Export it before taking control to load the newer save.');
        return false;
      }
      if(old?.valid) localStorage.setItem(GOOD,existing);
      const stamp=clientId+':'+(++saveCounter);
      localStorage.setItem(CURRENT,JSON.stringify({format:'riverbend-save-envelope-v1',stamp,counter:saveCounter,state}));
      lastStamp=stamp;
      setStatus('saved','Saved on this browser','Only this browser profile and site address. Download progress before changing devices or clearing site data.');
      broadcast?.postMessage({type:'saved',by:clientId,stamp});
      return true;
    }catch {
      setStatus('memory','Playing in memory — not saved','Browser storage is unavailable or full. Download progress to keep this attempt; closing the page may lose it.');
      return false;
    }
  }
  async function acquire() {
    if(disposed) return;
    if(!navigator.locks?.request) {
      readLatest();
      setStatus('memory','Manual-save mode','This browser cannot provide the required tab lock. Play in memory and download progress. Automatic local writes are disabled.');
      return;
    }
    let ready;
    const obtained=new Promise(resolve=>{ready=resolve;});
    navigator.locks.request(LOCK,{mode:'exclusive',ifAvailable:true},async lock=>{
      if(!lock) {readLatest();setStatus('readonly','Another tab has control','This tab is read-only. Export any draft before choosing Take control.');ready();return;}
      writer=true;readLatest();
      if(!corrupt) persist();
      ready();
      await new Promise(resolve=>{releaseLock=resolve;});
      writer=false;
    }).catch(()=>{setStatus('memory','Manual-save mode','The browser could not acquire a reliable write lock. Download progress to keep your work.');ready();});
    await obtained;
  }
  try {
    broadcast=new BroadcastChannel(CHANNEL);
    broadcast.onmessage=e=>{
      if(e.data?.by===clientId)return;
      if(e.data?.type==='take-control' && writer){
        writer=false;releaseLock?.();releaseLock=null;
        setStatus('readonly','Control moved to another tab','This tab keeps its current view. Download any work before closing it.');
        broadcast.postMessage({type:'released',by:clientId});
      }
    };
  }catch{/* Web Locks still protect state; close the other tab to transfer if broadcast unsupported. */}
  await acquire();
  const onStorage=e=>{
    if(e.key!==CURRENT || !writer) return;
    const incoming=decode(e.newValue);
    if(!incoming.valid || incoming.stamp!==lastStamp){
      writer=false;releaseLock?.();releaseLock=null;
      setStatus('readonly','Local progress changed','Export your in-memory work, then take control to reload the latest saved attempt.');
    }
  };
  let resumeAfterCache = false;
  const onPageHide = () => {
    resumeAfterCache = writer && status.mode==='saved';
    writer=false;
    const release=releaseLock;releaseLock=null;release?.();
    if(resumeAfterCache)setStatus('readonly','Page paused — saved copy retained','On return, this tab must reacquire control before writing.');
  };
  const onPageShow = event => {
    if(event.persisted && resumeAfterCache){
      resumeAfterCache=false;
      setStatus('starting','Reconnecting local save…','Checking which tab has control.');
      void acquire();
    }
  };
  addEventListener('storage',onStorage);
  addEventListener('pagehide',onPageHide);
  addEventListener('pageshow',onPageShow);

  // Check the held snapshot before replacing in-memory state or its backup.
  // A storage event can arrive late; the exact stamp check still prevents a
  // conflicting import/recovery/clear from reporting an unsaved replacement.
  function preflightMutation() {
    if(!writer || corrupt)return null;
    try {
      const current=localStorage.getItem(CURRENT), disk=current?decode(current):null;
      if((current && (!disk?.valid || disk.stamp!==lastStamp)) || (!current && lastStamp!==null)) {
        writer=false;releaseLock?.();releaseLock=null;
        setStatus('readonly','Save conflict — action not applied','Download your in-memory work or take control to load the latest save.');
        return {state,accepted:false,code:'SAVE_CONFLICT',message:status.detail};
      }
    }catch {
      writer=false;releaseLock?.();releaseLock=null;
      setStatus('memory','Playing in memory — not saved','Browser storage can no longer be read. Your current work remains in memory; download progress before closing this page.');
    }
    return null;
  }

  return {
    getState:()=>state,
    getStatus:()=>({...status}),
    async send(action) {
      if(status.mode==='readonly')return {state,accepted:false,code:'TAB_READ_ONLY',message:'Another tab controls this saved game. Take control before changing it.'};
      if(status.mode==='starting')return {state,accepted:false,code:'SAVE_RECONNECTING',message:'The browser is reconnecting local progress. Try the action again when the save status is ready.'};
      // Recheck within the lock before even evaluating a mutation.
      const conflict=preflightMutation();if(conflict)return conflict;
      const result=dispatch(state,action);
      if(result.accepted){state=result.state;persist();notify();}
      return result;
    },
    async importProgress(raw) {
      if(status.mode==='starting')return {accepted:false,code:'SAVE_RECONNECTING',message:'Local progress is reconnecting. Wait for the save status to be ready, then retry the import. Your current work is unchanged.'};
      if(status.mode==='readonly')return {accepted:false,message:'Take control before importing progress.'};
      const checked=validateSave(raw);
      if(!checked.valid)return {accepted:false,message:checked.error||'Invalid progress file. Your current attempt is unchanged.'};
      const conflict=preflightMutation();if(conflict)return conflict;
      if(writer){
        const current=safeRead(CURRENT);
        if(current && decode(current).valid){try{localStorage.setItem(GOOD,current);}catch{}}
        // Explicit validated import replaces a corrupt save; never merges wallets.
        if(corrupt){try{localStorage.removeItem(CURRENT);lastStamp=null;}catch{}corrupt=false;}
      }
      state=checked.state;state.imported=true;state.importProvenance='manual-file';persist();notify();
      return {accepted:true,message:'Progress imported as a whole campaign. Current technical readiness has been recalculated.'};
    },
    async recover() {
      if(status.mode==='starting')return {accepted:false,code:'SAVE_RECONNECTING',message:'Local progress is reconnecting. Wait for the save status to be ready, then retry recovery. Your current work is unchanged.'};
      if(status.mode==='readonly')return {accepted:false,message:'Take control before restoring a backup.'};
      const conflict=preflightMutation();if(conflict)return conflict;
      const backup=decode(safeRead(GOOD));
      if(!backup.valid)return {accepted:false,message:'No valid backup is available. You can still export the in-memory attempt.'};
      state=backup.state;
      if(writer){try{localStorage.removeItem(CURRENT);lastStamp=null;}catch{}}
      corrupt=false;persist();notify();return {accepted:true,message:'Last good local snapshot restored.'};
    },
    async takeControl() {
      if(status.mode==='starting')return {accepted:false,code:'SAVE_RECONNECTING',message:'Local progress is already reconnecting. Wait for the save status to be ready.'};
      if(writer)return {accepted:true,message:'This tab already has control.'};
      setStatus('starting','Reconnecting local save…','Waiting for the current writer to release control.');
      broadcast?.postMessage({type:'take-control',by:clientId});
      // Wait briefly for explicit release acknowledgement, never a forceful parallel writer.
      await new Promise(resolve=>setTimeout(resolve,150));
      await acquire();notify();
      return {accepted:writer||status.mode==='memory',message:writer?'This tab now has control. Latest saved progress loaded.':'Close the other game tab and try again if it still holds the lock.'};
    },
    async clear() {
      if(status.mode==='starting')return {accepted:false,code:'SAVE_RECONNECTING',message:'Local progress is reconnecting. Wait for the save status to be ready, then retry clearing. Your current work is unchanged.'};
      if(status.mode==='readonly')return {accepted:false,message:'Take control before clearing this game.'};
      const conflict=preflightMutation();if(conflict)return conflict;
      if(!writer)return {accepted:false,message:'Local storage is unavailable in this mode, so the saved campaign could not be cleared. Export your work; use the browser’s site-data controls to remove any old local copy.'};
      // Keep the existing in-memory campaign until both saved copies are removed and verified.
      let currentRemoved=false;
      try{
        localStorage.removeItem(CURRENT);currentRemoved=true;
        localStorage.removeItem(GOOD);
        if(localStorage.getItem(CURRENT)!==null || localStorage.getItem(GOOD)!==null)throw new Error('Saved campaign remains');
      }catch{
        if(currentRemoved)lastStamp=null;
        setStatus('memory','Could not clear saved progress','A saved copy may remain on this shared browser. Your current work is still in memory. Export it, then retry or use the browser’s site-data controls.');
        return {accepted:false,code:'CLEAR_FAILED',message:'Saved progress could not be cleared completely. Your current work remains in memory; a local saved copy may still remain.'};
      }
      lastStamp=null;corrupt=false;state=createGame();
      const saved=persist();notify();
      return {accepted:true,message:saved?'This game’s local campaign was cleared. Other site data is unchanged.':'The previous campaign and backup were removed. Fresh practice is in memory and has not been saved; other site data is unchanged.'};
    },
    dispose(){disposed=true;releaseLock?.();broadcast?.close();removeEventListener('storage',onStorage);removeEventListener('pagehide',onPageHide);removeEventListener('pageshow',onPageShow);}
  };
}
