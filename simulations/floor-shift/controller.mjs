import{CONFIG,PRODUCTS,ACCESSORIES,CLIENTS,LEARNING,COMPONENTS,WORKED_EXAMPLE,SUPPORT_NAMES,RESPONSE_PROMPTS,money}from'./content.mjs';
import{newSession,validateBackup,validateProposal,evaluateRecommendation,getClient,getRequirements,quoteProposal,blankDraft,currentDraft,draftKey,requireCommittedEvidence,discoveryAnswer}from'./model.mjs';
import{exportEvidenceJSON,exportEvidenceCSV,exportAttemptSubmission}from'./report.mjs';
import{STUDENT_SUBMISSION}from'./submission-config.mjs';
const submissionReady=()=>STUDENT_SUBMISSION.state==='active'&&!!STUDENT_SUBMISSION.studentFormUrl;
const clone=value=>JSON.parse(JSON.stringify(value));
const id=()=>globalThis.crypto?.randomUUID?.()||`local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const profiles={office:'Browser / office',photo:'Desktop photo',video1080:'1080p editing',video4k:'4K editing'};
export function createAdvisorController(options={}){
 const now=options.now||(()=>new Date().toISOString());let storage;
 try{storage=options.storage??globalThis.localStorage;}catch{storage=null;}
 let state=newSession(id(),now());let savedText=null;let protectedRaw=null;let notice=null;let save={status:'unsaved',message:'This practice is on this device; nothing has been submitted.',readOnly:false};const listeners=new Set();let locked=false;
 try{const raw=storage?.getItem(CONFIG.storageKey);if(raw){savedText=raw;if(new TextEncoder().encode(raw).length>CONFIG.maxStateBytes)throw new Error('Saved activity is too large.');state=validateBackup(JSON.parse(raw));savedText=raw;save={status:'saved',message:'Restored on this device. No school submission has been made.',readOnly:false};}}catch(e){protectedRaw=savedText;notice={kind:'error',text:'The saved draft could not be restored. Export current work; do not clear the previous saved copy without keeping a backup.'};save={status:'unavailable',message:e.message,readOnly:false};locked=true;}
 const notify=reason=>{for(const fn of listeners)fn(getView(),reason);};
 function persist(){
  if(!storage){save={status:'unavailable',message:'Storage is unavailable. Keep this tab open and download a backup.',readOnly:false};return false;}
  try{const previous=storage.getItem(CONFIG.storageKey);if(previous!==savedText){save={status:'conflict',message:'Another tab has newer saved work. Download this tab’s rescue copy, then load the saved copy.',readOnly:true};return false;}if(locked){save={status:'unavailable',message:'The earlier saved record is protected. Download this work or restore a valid backup before replacing it.',readOnly:false};return false;}const text=JSON.stringify(state);storage.setItem(CONFIG.storageKey,text);savedText=text;save={status:'saved',message:'Saved on this device. No school submission has been made.',readOnly:false};return true;}catch(e){save={status:'unavailable',message:'Device saving failed. Your work is still in this tab: download a backup now.',readOnly:false};return false;}
 }
 function activeClient(){const c=getClient(state.activeClientId),r=getRequirements(c.id,state.attemptKind),asked=state.asked[draftKey(state)]||[];return {id:c.id,name:c.name,role:c.role,portraitIndex:c.portraitIndex,opening:c.opening,budgetLabel:money(r.budget),changedBrief:state.attemptKind==='transfer'?c.transfer.text:null,hasTransfer:true,questions:c.questions.map(q=>({id:q.id,label:q.label,asked:asked.includes(q.id),answer:asked.includes(q.id)?discoveryAnswer(c.id,state.attemptKind,q.id):null})),facts:c.questions.filter(q=>asked.includes(q.id)).map(q=>discoveryAnswer(c.id,state.attemptKind,q.id))};}
 function getView(){
  const c=activeClient(),draft=currentDraft(state),q=quoteProposal(draft),currentAttempts=state.attempts.filter(a=>a.clientId===state.activeClientId&&a.mode===state.mode&&a.kind===state.attemptKind),latest=currentAttempts.at(-1),firsts=state.attempts.filter(a=>a.mode==='independent'&&a.kind==='first');
  return {schemaVersion:1,revision:CONFIG.version,screen:state.screen,mode:state.mode,floorStep:state.floorStep,attemptKind:state.attemptKind,clients:CLIENTS.map(c=>({id:c.id,name:c.name,role:c.role,portraitIndex:c.portraitIndex,opening:c.opening,budgetLabel:money(c.budget),completed:firsts.some(a=>a.clientId===c.id)})),client:c,products:PRODUCTS.map(p=>({...p,workloadProfiles:Object.entries(profiles).map(([key,label])=>({label,fit:['Unsupported (0)','Limited (1)','Suitable (2)'][p.profiles[key]]}))})),accessories:clone(ACCESSORIES),draft:clone(draft),quote:{total:q.total,totalLabel:money(q.total),remainingLabel:(getRequirements(c.id,state.attemptKind).budget-q.total>=0?`${money(getRequirements(c.id,state.attemptKind).budget-q.total)} remaining`:`${money(q.total-getRequirements(c.id,state.attemptKind).budget)} over budget`)},feedback:latest?clone(latest.result):null,attempts:state.attempts.map(a=>({id:a.id,clientId:a.clientId,clientName:getClient(a.clientId).name,mode:a.mode,kind:a.kind,productName:PRODUCTS.find(p=>p.id===a.proposal.productId).name,alternativeId:a.proposal.alternativeId,alternativeName:PRODUCTS.find(p=>p.id===a.proposal.alternativeId)?.name||'',accessoryNames:ACCESSORIES.filter(x=>a.proposal.accessoryIds.includes(x.id)).map(x=>x.name),score:a.result.score,max:12,feasible:a.result.feasible,quoteTotal:a.result.total,reason:a.proposal.reason,tradeoff:a.proposal.tradeoff,prediction:a.proposal.prediction,transferReason:a.proposal.transferReason,criteria:clone(a.result.criteria),revisionOf:a.revisionOf||null,supportContext:clone(a.supportContext||{}),discovery:clone(a.discovery),teacherReview:'Reasoning pending teacher review',explanationState:'pending_teacher_review'})),summary:{independentClients:new Set(firsts.map(a=>a.clientId)).size,totalClients:CLIENTS.length,rawScore:firsts.reduce((n,a)=>n+a.result.score,0),rawMax:firsts.length*12,teacherReview:'Pending'},responsePrompts:clone(RESPONSE_PROMPTS),learning:clone(LEARNING),componentFacts:clone(COMPONENTS),supports:clone(state.supports),supportHistory:clone(state.supportHistory),workedExample:(state.mode==='practice'||state.supports.worked)?clone(WORKED_EXAMPLE):null,save:{...save,message:submissionReady()?save.message.replace('No school submission has been made.','Use the Google Form confirmation to check submission.'):save.message,recoveryAvailable:protectedRaw!==null},notice:notice?{...notice}:null,connection:{state:submissionReady()?'google_form_handoff':'local_review',studentFormUrl:STUDENT_SUBMISSION.studentFormUrl,projectId:STUDENT_SUBMISSION.projectId,message:submissionReady()?'Copy a recorded quote into the verified-email Google Form and press Submit there. The Form confirmation is your receipt; device saving is separate.':'On-device practice and review export only. No school submission has been made.'}};
 }
 function dispatch(action){
  const before=clone(state),beforeLocked=locked;
  const notePractice=()=>{if(state.mode==='practice'&&state.screen==='floor')state.practiceExposure=[...new Set([...state.practiceExposure,state.activeClientId])];};
  try{
   if(!action||typeof action.type!=='string')throw new Error('Unknown action.');
   if(save.readOnly&&!['SCREEN','LOAD_LATEST'].includes(action.type))throw new Error('This tab has a save conflict. Download its rescue copy, then load the saved copy.');
   notice=null;let reason='state-change';notePractice();
   if(action.type==='SCREEN'){if(!['welcome','learn','floor','report'].includes(action.screen))throw new Error('Unknown screen.');state.screen=action.screen;}
   else if(action.type==='START'){if(!['practice','independent'].includes(action.mode))throw new Error('Choose practice or independent mode.');state.mode=action.mode;state.screen='floor';state.floorStep='discover';state.attemptKind='first';if(state.mode==='practice')state.practiceExposure=[...new Set([...state.practiceExposure,state.activeClientId])];}
   else if(action.type==='SELECT_CLIENT'){if(!getClient(action.clientId))throw new Error('Unknown client.');state.activeClientId=action.clientId;if(state.mode==='practice')state.practiceExposure=[...new Set([...state.practiceExposure,action.clientId])];state.attemptKind='first';state.floorStep=state.attempts.some(a=>a.clientId===action.clientId&&a.mode===state.mode&&a.kind==='first')?'feedback':'discover';state.screen='floor';}
   else if(action.type==='ASK'){const c=getClient(state.activeClientId);if(!c.questions.some(q=>q.id===action.questionId))throw new Error('Unknown question.');const k=draftKey(state);state.asked[k]=[...new Set([...(state.asked[k]||[]),action.questionId])];}
   else if(action.type==='STEP'){if(!['discover','compare','justify','feedback'].includes(action.step))throw new Error('Unknown client step.');state.floorStep=action.step;}
   else if(action.type==='DRAFT'){
    if(!['productId','alternativeId','reason','tradeoff','prediction','transferReason'].includes(action.field)||typeof action.value!=='string')throw new Error('Invalid draft field.');
    if(action.value.length>6000)throw new Error('Keep each response to 6,000 characters or fewer. Your previous saved response is preserved.');
    if(action.field==='productId'&&action.value&&!PRODUCTS.some(p=>p.id===action.value))throw new Error('Unknown computer.');if(action.field==='alternativeId'&&action.value&&!PRODUCTS.some(p=>p.id===action.value))throw new Error('Unknown alternative.');
    const k=draftKey(state);state.drafts[k]={...currentDraft(state),[action.field]:action.value};reason='draft-change';
   }
   else if(action.type==='ACCESSORY'){if(!ACCESSORIES.some(a=>a.id===action.accessoryId)||typeof action.checked!=='boolean')throw new Error('Invalid accessory.');const d=clone(currentDraft(state));d.accessoryIds=action.checked?[...new Set([...d.accessoryIds,action.accessoryId])]:d.accessoryIds.filter(x=>x!==action.accessoryId);state.drafts[draftKey(state)]=d;}
   else if(action.type==='SUBMIT'){
    if(state.floorStep==='feedback')throw new Error('This attempt is already recorded. Choose revise or changed brief to make a new attempt.');
    if(state.attemptKind!=='first'&&!state.attempts.some(a=>a.clientId===state.activeClientId&&a.mode===state.mode&&a.kind==='first'))throw new Error('Record the original recommendation before revising or opening a changed brief.');
    const d=validateProposal(currentDraft(state));requireCommittedEvidence(d,state.attemptKind);
    if(state.attempts.length>=100)throw new Error('This session already has 100 attempts. Export it before starting a new activity.');
    const c=activeClient();let kind=state.attemptKind;if(kind==='first'&&state.attempts.some(a=>a.clientId===c.id&&a.mode===state.mode&&a.kind==='first'))kind='revision';
    const earlier=state.attempts.filter(a=>a.clientId===c.id&&a.mode===state.mode&&a.kind===kind).at(-1);
    const revisionOf=kind==='revision'?(earlier?.id||state.attempts.filter(a=>a.clientId===c.id&&a.mode===state.mode&&a.kind==='first').at(-1)?.id||null):kind==='transfer'?(earlier?.id||null):null;
    const active=SUPPORT_NAMES.filter(x=>state.supports[x]);
    const used=[...new Set([...active,...state.supportHistory.filter(e=>e.clientId===c.id&&e.mode===state.mode&&e.enabled).map(e=>e.supportId)])];
    const supportContext={active,used,priorPracticeExposure:state.practiceExposure.includes(c.id),independence:'pending_teacher_review',recordingState:'app_recorded'};
    let serial=state.attempts.length+1;while(state.attempts.some(a=>a.id===`${state.sessionId}:${serial}`))serial++;
    const a={id:`${state.sessionId}:${serial}`,clientId:c.id,mode:state.mode,kind,revisionOf,createdAt:now(),proposal:clone(d),result:evaluateRecommendation(c.id,d,{kind}),discovery:c.questions.filter(q=>q.asked).map(q=>({questionId:q.id,answer:q.answer})),supportContext};
    state.attempts.push(a);state.attemptKind=kind;state.drafts[draftKey(state)]=clone(d);state.asked[draftKey(state)]=c.questions.filter(q=>q.asked).map(q=>q.id);state.floorStep='feedback';notice={kind:'success',text:'Attempt recorded on this device. Raw fit is provisional; your explanation still needs teacher review.'};
   }
   else if(action.type==='REVISE'){
    const transfer=state.attemptKind==='transfer';
    const old=state.attempts.filter(a=>a.clientId===state.activeClientId&&a.mode===state.mode&&(transfer?a.kind==='transfer':a.kind!=='transfer')).at(-1);
    if(!old)throw new Error('Record a first recommendation before starting a revision.');
    state.attemptKind=transfer?'transfer':'revision';state.floorStep='compare';
    const key=draftKey(state);if(!state.drafts[key]){state.drafts[key]=clone(old.proposal);state.asked[key]=old.discovery.map(q=>q.questionId);}
   }
   else if(action.type==='TRANSFER'){
    if(!state.attempts.some(a=>a.clientId===state.activeClientId&&a.mode===state.mode&&a.kind==='first'))throw new Error('Record the original recommendation before opening the changed brief.');
    state.attemptKind='transfer';state.floorStep='discover';const key=draftKey(state);
    if(!state.drafts[key])state.drafts[key]=blankDraft();if(!state.asked[key])state.asked[key]=[];
   }
   else if(action.type==='SUPPORT'){if(!SUPPORT_NAMES.includes(action.supportId)||typeof action.enabled!=='boolean')throw new Error('Unknown support.');state.supports[action.supportId]=action.enabled;state.supportHistory.push({stream:'support',supportId:action.supportId,enabled:action.enabled,at:now(),clientId:state.activeClientId,mode:state.mode,attemptKind:state.attemptKind});if(state.supportHistory.length>1000)state.supportHistory=state.supportHistory.slice(-1000);}
   else if(action.type==='RESET'){if(action.confirmed!==true)throw new Error('Keep a backup, then confirm the local reset.');state=newSession(id(),now());locked=false;}
   else if(action.type==='LOAD_LATEST'){if(!storage)throw new Error('Device storage is unavailable. Export this tab’s rescue copy.');const raw=storage.getItem(CONFIG.storageKey);const next=raw?validateBackup(JSON.parse(raw)):newSession(id(),now());state=next;savedText=raw;locked=false;if(!raw&&!persist()){state=before;locked=beforeLocked;throw new Error('A new device copy could not be saved. Your rescue copy remains in this tab.');}protectedRaw=null;save={status:'saved',message:raw?'Loaded the current device-saved activity. No school submission has been made.':'The previous device copy was cleared. Started a new local activity; nothing has been submitted.',readOnly:false};notify('state-change');return {ok:true};}
   else throw new Error('Unknown action.');
   notePractice();state.revision++;state.updatedAt=now();if(new TextEncoder().encode(JSON.stringify(state)).length>CONFIG.maxStateBytes){state=before;throw new Error('This activity has reached its safe working size. Download the current report before starting a fresh session; the previous work was preserved.');}const persisted=persist();if(action.type==='RESET'){if(!persisted){state=before;locked=beforeLocked;throw new Error('The device copy could not be cleared. Keep your backup; the previous work remains recoverable.');}protectedRaw=null;notice={kind:'success',text:'This device’s activity was cleared and a fresh local activity was saved.'};}notify(reason);return {ok:true};
  }catch(e){notice={kind:'error',text:e.message};notify('validation-error');return {ok:false,message:e.message};}
 }
 function importReport(text){
  const previous=state,previousLocked=locked;
  try{
   if(typeof text!=='string'||new TextEncoder().encode(text).length>CONFIG.maxBackupBytes)throw new Error('The backup exceeds the 3 MB activity limit.');
   const next=validateBackup(JSON.parse(text));state=next;locked=false;
   if(!persist()){state=previous;locked=previousLocked;throw new Error('The validated backup could not be saved; your current tab’s work was preserved.');}
   notice={kind:'success',text:'Backup restored on this device. No school submission has been made.'};notify('state-change');return{ok:true};
  }catch(e){state=previous;locked=previousLocked;notice={kind:'error',text:e.message};notify('validation-error');return{ok:false,message:e.message};}
 }
 const storageListener=event=>{if((event.key===CONFIG.storageKey||event.key===null)&&event.newValue!==savedText){save={status:'conflict',message:'Another tab changed this activity. Export this tab’s rescue copy before loading the saved copy.',readOnly:true};notify('conflict');}};
 globalThis.addEventListener?.('storage',storageListener);
 // Initial saving is explicit and never overwrites an unreadable prior copy.
 if(!savedText&&!locked)persist();
 return{getView,prepareSubmission(attemptId){if(!submissionReady())throw new Error('The Google submission route is not ready. Keep your downloaded backup; nothing has been submitted.');return{text:exportAttemptSubmission(state,attemptId),studentFormUrl:STUDENT_SUBMISSION.studentFormUrl,title:'Send this quote to your teacher',projectId:STUDENT_SUBMISSION.projectId};},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},dispatch,exportReport(format){if(format==='recovery'){if(protectedRaw===null)throw new Error('No unreadable device record is available.');return{filename:'floor-shift-unreadable-device-record.txt',mime:'text/plain;charset=utf-8',text:protectedRaw};}if(format==='json')return{filename:`floor-shift-${state.sessionId}.json`,mime:'application/json',text:exportEvidenceJSON(state)};if(format==='csv')return{filename:`floor-shift-${state.sessionId}.csv`,mime:'text/csv;charset=utf-8',text:exportEvidenceCSV(state)};throw new Error('Choose JSON or CSV.');},importReport,destroy(){globalThis.removeEventListener?.('storage',storageListener);listeners.clear();},getStateForTest(){return clone(state);}};
}
