import { CONFIG, PRODUCTS, ACCESSORIES, CLIENTS, SUPPORT_NAMES, money } from './content.mjs';
export const getProduct=id=>PRODUCTS.find(p=>p.id===id)||null;
export const getClient=id=>CLIENTS.find(c=>c.id===id)||null;
export const getRequirements=(clientId,kind='first')=>{
 const c=getClient(clientId); if(!c)throw new Error('Unknown client.');
 return {...c.requirements,...(kind==='transfer'?c.transfer.changes:{})};
};
export function validateDraft(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid working draft.');
 const out=blankDraft();
 for(const field of ['productId','alternativeId','reason','tradeoff','prediction','transferReason']){
  const v=input[field]??'';if(typeof v!=='string'||v.length>6000)throw new Error('Keep each response under 6,000 characters.');out[field]=v;
 }
 for(const field of ['productId','alternativeId'])if(out[field]&&!getProduct(out[field]))throw new Error('Unknown saved computer selection.');
 const ids=input.accessoryIds??[];
 if(!Array.isArray(ids)||ids.length>ACCESSORIES.length||ids.some(id=>!ACCESSORIES.some(a=>a.id===id))||new Set(ids).size!==ids.length)throw new Error('Invalid saved accessories.');
 out.accessoryIds=[...ids];return out;
}
export function requireCommittedEvidence(d,kind){
 if(!d.alternativeId)throw new Error('Choose a different alternative to compare.');
 if(!d.prediction.trim()||!d.reason.trim()||!d.tradeoff.trim())throw new Error('Record a prediction, your reasons and one trade-off before revealing feedback.');
 if(kind==='transfer'&&!d.transferReason.trim())throw new Error('Explain what changed in the new brief.');
}
export function discoveryAnswer(clientId,kind,questionId){
 const client=getClient(clientId),q=client?.questions.find(q=>q.id===questionId);
 if(!q)throw new Error('Unknown discovery question.');
 if(kind!=='transfer')return q.answer;
 const r=getRequirements(clientId,kind);
 return {work:`Updated brief: ${profileName[r.workload]} profile at least ${r.minWorkload}/2; ${r.minRam} GB RAM minimum (${r.targetRam} GB preferred). Supported system: ${r.allowedOS.join(' or ')}.${r.minVram?` Dedicated GPU with ${r.minVram} GB graphics memory required for this workflow.`:''}`,budget:`The updated firm ceiling is ${money(r.budget)}, including selected required add-ons. These are fictional all-in classroom CAD prices.`,context:r.portable?`A laptop is essential: maximum ${r.maxMass} kg; ${r.minBattery?`at least ${r.minBattery} h estimated light-use battery`:'verify actual battery for the intended workload'}. Display minimum ${r.minScreen||'not additionally specified'} inches / ${r.minGamut||'no additional'}% sRGB.`:`Desk use; portability and battery are not required. Display minimum ${r.minScreen||'not additionally specified'} inches / ${r.minGamut||'no additional'}% sRGB.`,future:`At least ${r.minStorage} GB ${r.ssd?'SSD working space':'saved-file space'}, ${r.targetStorage} GB preferred. ${r.requiredPorts.length?`Connection required: ${r.requiredPorts.join(', ')}.`:''} ${r.verification||'Explain one limitation and a fact you would verify with the client.'}`}[questionId];
}
export function validateProposal(draft){
 if(!draft||typeof draft!=='object'||Array.isArray(draft))throw new Error('A recommendation is required.');
 if(!getProduct(draft.productId))throw new Error('Choose a computer from this catalogue.');
 if(draft.alternativeId&&!getProduct(draft.alternativeId))throw new Error('Choose a valid alternative.');
 if(draft.alternativeId===draft.productId)throw new Error('Compare a different alternative, not the same computer twice.');
 const ids=draft.accessoryIds??[];
 if(!Array.isArray(ids)||ids.length>ACCESSORIES.length||ids.some(id=>!ACCESSORIES.some(a=>a.id===id))||new Set(ids).size!==ids.length)throw new Error('The accessory selection is not valid.');
 const out={productId:draft.productId,alternativeId:draft.alternativeId||'',accessoryIds:[...ids]};
 for(const key of ['reason','tradeoff','prediction','transferReason']){
  const value=draft[key]??'';if(typeof value!=='string'||value.length>6000)throw new Error('Keep each response under 6,000 characters.');out[key]=value;
 }
 return out;
}
export function quoteProposal(draft){
 const p=getProduct(draft?.productId);const accessories=ACCESSORIES.filter(a=>(draft?.accessoryIds||[]).includes(a.id));
 return {product:p,accessories,total:(p?.price||0)+accessories.reduce((n,a)=>n+a.price,0)};
}
const has=(product,port)=>product.ports.includes(port);
const profileName={office:'Browser / office',photo:'Desktop photo',video1080:'1080p editing',video4k:'4K editing'};
export function evaluateRecommendation(clientId,proposal,{kind='first'}={}){
 if(!['first','revision','transfer'].includes(kind))throw new Error('Unknown attempt type.');
 const d=validateProposal(proposal),r=getRequirements(clientId,kind),{product:p,accessories,total}=quoteProposal(d);
 const includes=id=>d.accessoryIds.includes(id);const critical=[];const criteria=[];const notices=[];const hasUSBc=has(p,'USB-C video')||has(p,'USB-C data only');const accessoriesUsable=(!includes('usb-hub')||hasUSBc)&&(!includes('video-adapter')||has(p,'USB-C video'));
 const add=(id,title,score,explanation)=>criteria.push({id,title,score,max:2,explanation});
 if(total>r.budget)critical.push(`The complete ${money(total)} quote exceeds the firm ${money(r.budget)} budget.`);
 add('budget','Complete cost',total<=r.budget?2:total<=r.budget*1.1?1:0,`${p.name} and the selected add-ons total ${money(total)}; the firm ceiling is ${money(r.budget)}. Prices are fictional all-in CAD, not current retail quotes.`);
 const workload=p.profiles[r.workload]??0;
 const gpuOK=!r.minVram||(p.gpu.type==='discrete'&&p.gpu.vram>=r.minVram);
 const workloadOK=workload>=r.minWorkload&&gpuOK;
 if(workload<r.minWorkload)critical.push(`${profileName[r.workload]} needs rating ${r.minWorkload}; this authored classroom profile is ${workload}.`);
 if(!gpuOK)critical.push(`This particular client requires a dedicated GPU with at least ${r.minVram} GB graphics memory.`);
 add('workload','CPU / graphics for the job',workloadOK?2:(workload>0&&gpuOK?1:0),`${profileName[r.workload]} is rated ${workload}/2 in the fictional task profile. ${r.minVram?`${p.gpu.label}; this client's workflow specifically needs ${r.minVram} GB dedicated graphics memory.`:'Do not infer performance from core count, GHz, brand or GPU price alone.'}`);
 if(p.ram<r.minRam)critical.push(`${p.ram} GB RAM is below the ${r.minRam} GB working-memory minimum.`);
 add('ram','Working memory',p.ram>=r.targetRam?2:p.ram>=r.minRam?1:0,`${p.ram} GB working memory; minimum ${r.minRam} GB, preferred ${r.targetRam} GB. Extra drive space does not add RAM.`);
 const externalStorage=includes('external-ssd')?512:0;
 const fastStorage=(p.storageType.includes('SSD')?p.storage:0)+externalStorage;
 const usableStorage=r.ssd?fastStorage:p.storage+externalStorage;
 if(usableStorage<r.minStorage)critical.push(`${usableStorage} GB ${r.ssd?'SSD working space':'saved-file capacity'} is below the ${r.minStorage} GB minimum.`);
 add('storage','Saved files / working drive',usableStorage>=r.targetStorage?2:usableStorage>=r.minStorage?1:0,`${p.storage} GB ${p.storageType}${externalStorage?' + 512 GB external SSD':''}. Counted ${usableStorage} GB ${r.ssd?'SSD space':'capacity'} against minimum ${r.minStorage} / preferred ${r.targetStorage} GB. An external SSD neither turns an internal HDD into an SSD nor adds RAM.`);
 const osOK=r.allowedOS.includes(p.os);
 const portOK=(r.requiredPorts||[]).every(port=>has(p,port)||(port==='HDMI'&&includes('video-adapter')&&has(p,'USB-C video'))||(port==='USB-A'&&includes('usb-hub')&&(has(p,'USB-C video')||has(p,'USB-C data only'))));
 if(!osOK)critical.push(`${p.os} does not match this client's stated software/architecture requirement.`);
 if(!portOK)critical.push('The selected setup has not completed the required peripheral/display connection.');
 if(includes('video-adapter')&&!has(p,'USB-C video'))notices.push('The chosen USB-C video adapter is not a valid video path on this machine. USB-C data-only is not video support.');
 if(includes('video-adapter')&&has(p,'HDMI'))notices.push('This machine already has HDMI. Explain whether the extra adapter is useful; it is not needed for the stated direct HDMI path.');
 if(includes('usb-hub')&&!hasUSBc)notices.push('The USB-C hub requires a USB-C host port; this machine has no USB-C port, so the purchased hub cannot connect. Remove it or choose a compatible machine.');
 add('compatibility','Software and connection path',osOK&&portOK&&accessoriesUsable?2:osOK?1:0,`${p.os}; accepted for this brief: ${r.allowedOS.join(' or ')}. ${r.requiredPorts.length?`Required ${r.requiredPorts.join(', ')} path: ${portOK?'complete':'not complete'}.`:'No extra peripheral path is required in this brief.'} A connector shape does not establish capabilities or driver support.`);
 const externalDisplayWorks=includes('large-display')&&(has(p,'HDMI')||has(p,'USB-C video'));
 // A desk screen does not repair an on-the-bus laptop display requirement.
 const screen=(!r.portable&&externalDisplayWorks)?Math.max(p.screen,24):p.screen;
 const gamut=(!r.portable&&externalDisplayWorks)?Math.max(p.gamut,100):p.gamut;
 const portableOK=!r.portable||(p.kind==='laptop'&&p.mass<=r.maxMass&&p.battery>=r.minBattery);
 const displayOK=screen>=r.minScreen&&gamut>=r.minGamut;
 if(!portableOK)critical.push(`The setup does not meet the laptop/weight/light-use battery requirement (${r.maxMass} kg maximum; ${r.minBattery} h minimum where specified).`);
 if(!displayOK)critical.push(`The usable display does not meet this brief's ${r.minScreen||'stated'} inch / ${r.minGamut||'stated'}% sRGB requirement.`);
 add('context','Use, display and mobility',portableOK&&displayOK?2:portableOK||displayOK?1:0,`${p.kind==='laptop'?`${p.mass} kg; up to ${p.battery} h estimated light use`:'Desktop; not a travelling computer'}. Usable display for this context: ${screen}″ / ${gamut}% sRGB. ${r.portable?'A separate desk screen cannot substitute for the required portable display.':'The included/compatible external display can be considered at the desk.'} Battery estimates are not guarantees for demanding editing.`);
 if(p.id==='home-refurb')notices.push('This is a fictional renewed machine. Check actual condition, support, warranty and return terms with the client; the simulation has not verified them.');
 if(r.verification)notices.push(r.verification);
 const score=criteria.reduce((n,c)=>n+c.score,0),feasible=critical.length===0;
 return {score,max:12,feasible,total,accessoriesUsable,requirements:r,headline:feasible?'The hardware meets this client’s stated essentials.':'Revise this quote: at least one essential is unmet.',criteria,strengths:criteria.filter(c=>c.score===2).map(c=>`${c.title}: the supplied facts meet the target.`),nextSteps:[...critical,...notices],teacherReview:'Reasoning awaits teacher review',explanationState:'pending_teacher_review',modelNote:'Provisional authored-catalogue fit, not a benchmark, IB grade or teacher-confirmed achievement.'};
}
export const blankDraft=()=>({productId:'',alternativeId:'',accessoryIds:[],reason:'',tradeoff:'',prediction:'',transferReason:''});
export function newSession(id,now){
 return {schemaVersion:1,version:CONFIG.version,packageId:CONFIG.packageId,sessionId:id,screen:'welcome',mode:'practice',floorStep:'discover',activeClientId:CLIENTS[0].id,attemptKind:'first',drafts:{},asked:{},attempts:[],practiceExposure:[],supportHistory:[],supports:Object.fromEntries(SUPPORT_NAMES.map(x=>[x,false])),revision:0,createdAt:now,updatedAt:now};
}
export const draftKey=s=>`${s.activeClientId}:${s.mode}:${s.attemptKind}`;
export const currentDraft=s=>s.drafts[draftKey(s)]||blankDraft();
export function validateBackup(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('The backup is not an activity record.');
 const s=input.state||input;
 if(new TextEncoder().encode(JSON.stringify(s)).length>CONFIG.maxStateBytes)throw new Error('The activity exceeds its safe working-state size. Your current work was preserved.');
 if(s.schemaVersion!==1||s.version!==CONFIG.version||s.packageId!==CONFIG.packageId)throw new Error('This backup belongs to another activity or version. Your current work was preserved.');
 if(typeof s.sessionId!=='string'||!/^[A-Za-z0-9-]{1,100}$/.test(s.sessionId))throw new Error('Invalid session identity.');
 if(!getClient(s.activeClientId)||!['welcome','learn','floor','report'].includes(s.screen)||!['practice','independent'].includes(s.mode)||!['discover','compare','justify','feedback'].includes(s.floorStep)||!['first','revision','transfer'].includes(s.attemptKind))throw new Error('Invalid activity location.');
 if(!Array.isArray(s.attempts)||s.attempts.length>100||!Array.isArray(s.supportHistory)||s.supportHistory.length>1000)throw new Error('The backup is too large or incomplete.');
 const clean=newSession(s.sessionId,typeof s.createdAt==='string'?s.createdAt:'');
 Object.assign(clean,{screen:s.screen,mode:s.mode,floorStep:s.floorStep,activeClientId:s.activeClientId,attemptKind:s.attemptKind,revision:Number.isSafeInteger(s.revision)&&s.revision>=0?s.revision:0,updatedAt:typeof s.updatedAt==='string'?s.updatedAt:''});
 if(!s.drafts||typeof s.drafts!=='object'||Array.isArray(s.drafts)||Object.keys(s.drafts).length>40)throw new Error('Invalid draft collection.');
 for(const [key,d]of Object.entries(s.drafts)){
  const [id,mode,kind]=key.split(':');if(key!==`${id}:${mode}:${kind}`||!getClient(id)||!['practice','independent'].includes(mode)||!['first','revision','transfer'].includes(kind))throw new Error('Unknown saved draft.');
  clean.drafts[key]=validateDraft(d);
 }
 const seen=new Set(),firstKeys=new Set(),firstTransferKeys=new Set();
 for(const a of s.attempts){
  if(!a||typeof a.id!=='string'||a.id.length>160||seen.has(a.id)||!getClient(a.clientId)||!['practice','independent'].includes(a.mode)||!['first','revision','transfer'].includes(a.kind))throw new Error('Invalid or duplicate saved attempt.');
  if(a.kind==='first'){const firstKey=`${a.clientId}:${a.mode}`;if(firstKeys.has(firstKey))throw new Error('A backup cannot contain two first attempts for the same client and mode.');firstKeys.add(firstKey);}
  seen.add(a.id);const proposal=validateProposal(a.proposal);requireCommittedEvidence(proposal,a.kind);const result=evaluateRecommendation(a.clientId,proposal,{kind:a.kind});
  // Imported marks/approval fields are ignored. Recompute raw fit; approval is never client-owned.
  let revisionOf=typeof a.revisionOf==='string'&&a.revisionOf.length<160?a.revisionOf:null;
  // Early advisor-0.1 exports linked an initial transfer to its original first quote.
  // Normalize only that known legacy shape; retain IDs, student text and recomputed fit.
  if(a.kind==='transfer'&&!a.supportContext&&!clean.attempts.some(x=>x.clientId===a.clientId&&x.mode===a.mode&&x.kind==='transfer')&&clean.attempts.some(x=>x.id===revisionOf&&x.clientId===a.clientId&&x.mode===a.mode&&x.kind==='first'))revisionOf=null;
  if(a.kind==='transfer'&&!revisionOf){const key=`${a.clientId}:${a.mode}`;if(firstTransferKeys.has(key))throw new Error('A changed brief can have only one initial attempt per client and mode.');firstTransferKeys.add(key);}
  const parent=revisionOf?clean.attempts.find(previous=>previous.id===revisionOf&&previous.clientId===a.clientId&&previous.mode===a.mode):null;
  if(a.kind==='first'&&revisionOf)throw new Error('A first attempt cannot be a revision.');
  if(a.kind==='revision'&&(!parent||parent.kind==='transfer'))throw new Error('An original-brief revision needs an earlier original-brief attempt.');
  if(a.kind==='transfer'&&revisionOf&&parent?.kind!=='transfer')throw new Error('A changed-brief revision needs an earlier changed-brief attempt.');
  if(a.kind==='transfer'&&!clean.attempts.some(previous=>previous.kind==='first'&&previous.clientId===a.clientId&&previous.mode===a.mode))throw new Error('A changed brief needs its original first attempt.');
  if(!Array.isArray(a.discovery)||a.discovery.length>4)throw new Error('Invalid interview evidence.');
  const discovery=a.discovery.map(q=>{if(!q||typeof q.questionId!=='string')throw new Error('Invalid interview question.');return {questionId:q.questionId,answer:discoveryAnswer(a.clientId,a.kind,q.questionId)};});
  if(new Set(discovery.map(q=>q.questionId)).size!==discovery.length)throw new Error('Duplicate interview question.');
  const context=a.supportContext||{};
  const supportList=value=>{if(value==null)return[];if(!Array.isArray(value)||value.length>8||value.some(x=>!SUPPORT_NAMES.includes(x)))throw new Error('Invalid support context.');return [...new Set(value)];};
  if(context.recordingState!==undefined&&!['app_recorded','not_recorded'].includes(context.recordingState))throw new Error('Invalid support recording state.');
  const supportContext={active:supportList(context.active),used:supportList(context.used),priorPracticeExposure:context.priorPracticeExposure===true||clean.attempts.some(x=>x.clientId===a.clientId&&x.mode==='practice'),independence:'pending_teacher_review',recordingState:!a.supportContext||context.recordingState==='not_recorded'?'not_recorded':'app_recorded'};
  clean.attempts.push({id:a.id,clientId:a.clientId,mode:a.mode,kind:a.kind,revisionOf,createdAt:typeof a.createdAt==='string'?a.createdAt.slice(0,100):'',proposal,result,discovery,supportContext});
 }
 if(s.asked&&typeof s.asked==='object'&&!Array.isArray(s.asked))for(const [key,ids]of Object.entries(s.asked)){
  const [clientId,mode,kind]=key.split(':');if(key!==`${clientId}:${mode}:${kind}`||!getClient(clientId)||!['practice','independent'].includes(mode)||!['first','revision','transfer'].includes(kind))throw new Error('Invalid interview record.');
  if(!Array.isArray(ids)||ids.length>4||ids.some(id=>!['work','budget','context','future'].includes(id)))throw new Error('Invalid discovery question.');clean.asked[key]=[...new Set(ids)];
 }
 if(clean.attemptKind!=='first'&&!clean.attempts.some(a=>a.clientId===clean.activeClientId&&a.mode===clean.mode&&a.kind==='first'))throw new Error('A revised or changed-brief draft needs its preserved original recommendation.');
 if(s.practiceExposure!==undefined&&(!Array.isArray(s.practiceExposure)||s.practiceExposure.length>CLIENTS.length||s.practiceExposure.some(x=>!getClient(x))))throw new Error('Invalid practice-exposure record.');
 clean.practiceExposure=[...new Set(s.practiceExposure||[])];
 for(const key of SUPPORT_NAMES)clean.supports[key]=s.supports?.[key]===true;
 for(const e of s.supportHistory){
  if(!e||e.stream!=='support'||!SUPPORT_NAMES.includes(e.supportId)||typeof e.enabled!=='boolean'||typeof e.at!=='string'||e.at.length>100)throw new Error('Invalid support record.');
  const record={stream:'support',supportId:e.supportId,enabled:e.enabled,at:e.at};
  if(e.clientId!==undefined){if(!getClient(e.clientId)||!['practice','independent'].includes(e.mode)||!['first','revision','transfer'].includes(e.attemptKind))throw new Error('Invalid support scope.');Object.assign(record,{clientId:e.clientId,mode:e.mode,attemptKind:e.attemptKind});}
  clean.supportHistory.push(record);
 }
 if(new TextEncoder().encode(JSON.stringify(clean)).length>CONFIG.maxStateBytes)throw new Error('The reconstructed activity exceeds its safe working size. Your current work was preserved.');
 return clean;
}
