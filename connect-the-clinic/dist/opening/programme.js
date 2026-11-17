/** Original integrated training/field programme; one persisted, replay-verified authority. */
import {createShift,dispatchShift,deriveShift,validateShiftSave,createShiftEvidence} from './engine.js';
import {createBootcamp,dispatchBootcamp,deriveBootcamp,createBootcampEvidence} from '../bootcamp/engine.js';

const APP_ID='riverbend.clinic.programme';
const VERSION='0.8.0';
const MAX_BYTES=1048576;
const MAX_ACTIONS=1200;
const clone=x=>JSON.parse(JSON.stringify(x));
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>typeof k==='string'&&Object.hasOwn(x,k);
const bytes=x=>new TextEncoder().encode(typeof x==='string'?x:JSON.stringify(x)).length;
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const need=(test,code,message)=>{if(!test)fail(code,message);};
const origins=['none','manual-file','legacy-unknown','automatic-restore'];

function exactKeys(object,keys,code='SAVE_SEED'){
  need(plain(object)&&Object.keys(object).sort().join(',')===[...keys].sort().join(','),code,'The programme seed or action has unsupported fields.');
}

function rebuildField(campaignId,seed){
  if(seed.origin==='new'){
    exactKeys(seed,['origin','fixture']);return createShift({campaignId,fixture:seed.fixture});
  }
  need(seed.origin==='opening-0.7','SAVE_SEED','Unknown programme starting point.');
  exactKeys(seed,['origin','fieldSeed','fieldActions','fieldImported','fieldImportProvenance']);
  exactKeys(seed.fieldSeed,['fixture','mode']);
  need(Array.isArray(seed.fieldActions)&&seed.fieldActions.length<=1200,'SAVE_SEED','The earlier field action log is invalid.');
  need(typeof seed.fieldImported==='boolean'&&origins.includes(seed.fieldImportProvenance),'SAVE_PROVENANCE','Earlier field import provenance is invalid.');
  let field=createShift({campaignId,fixture:seed.fieldSeed.fixture,mode:seed.fieldSeed.mode});
  for(const action of seed.fieldActions){const result=dispatchShift(field,action);need(result.accepted,'SAVE_FIELD_REPLAY',`Earlier field action rejected: ${result.code}.`);field=result.state;}
  field.imported=seed.fieldImported;field.importProvenance=seed.fieldImportProvenance;return field;
}

function fromSeed(campaignId,seed){
  const field=rebuildField(campaignId,seed),existing=seed.origin==='opening-0.7';
  return {appId:APP_ID,schemaVersion:1,buildVersion:VERSION,campaignId:field.campaignId,seed:clone(seed),revision:0,actions:[],screen:existing?'field':'bootcamp',fieldStarted:existing,field,bootcamp:createBootcamp({campaignId:field.campaignId}),imported:false,importProvenance:'none'};
}

export function createProgramme(options={}){
  need(plain(options)&&Object.keys(options).every(k=>['campaignId','fixture'].includes(k)),'OPTIONS_INVALID','Use an anonymous campaign ID and optional clinic fixture.');
  const initial=createShift({campaignId:options.campaignId,fixture:options.fixture||'A'});
  return fromSeed(initial.campaignId,{origin:'new',fixture:options.fixture||'A'});
}

function actionShape(action){
  need(plain(action)&&typeof action.type==='string','ACTION_INVALID','Choose an available programme action.');
  if(['OPEN_BOOTCAMP','ENTER_FIELD'].includes(action.type))exactKeys(action,['type'],'ACTION_FIELDS');
  if(action.type==='BOOT_ACTION'){exactKeys(action,['type','action'],'ACTION_FIELDS');need(plain(action.action),'ACTION_FIELDS','Choose a training action.');}
  return clone(action);
}

function apply(state,action){
  if(action.type==='OPEN_BOOTCAMP'){
    state.screen='bootcamp';return{code:'BOOTCAMP_OPENED',message:'Free bootcamp opened. Your field job, draft scope, spending and delivered evidence remain separate.'};
  }
  if(action.type==='ENTER_FIELD'){
    need(state.fieldStarted||deriveBootcamp(state.bootcamp).courseComplete,'TRAINING_REQUIRED','Complete the six practical training tasks before taking your first independent client job.');
    state.screen='field';const resume=state.fieldStarted;state.fieldStarted=true;
    return{code:resume?'FIELD_RESUMED':'FIELD_OPENED',message:resume?'Returned to your preserved field work.':'Bootcamp task record preserved. Your independent clinic job starts with its own brief, equipment and evidence.'};
  }
  if(action.type==='BOOT_ACTION'){
    need(state.screen==='bootcamp','BOOTCAMP_SCREEN_REQUIRED','Open the bootcamp before changing its training bench.');
    const result=dispatchBootcamp(state.bootcamp,action.action);need(result.accepted,result.code,result.message);state.bootcamp=result.state;return result;
  }
  need(state.screen==='field','FIELD_SCREEN_REQUIRED','Open the field job before changing its equipment or evidence.');
  const result=dispatchShift(state.field,action);need(result.accepted,result.code,result.message);state.field=result.state;return result;
}

export function dispatchProgramme(state,action){
  try{
    need(state.actions.length<MAX_ACTIONS,'ACTION_CAPACITY','This programme reached its action limit. Export progress and evidence before starting a separate new campaign.');
    const accepted=actionShape(action),next=clone(state),result=apply(next,accepted);
    next.actions.push(accepted);next.revision++;
    need(bytes(next)<=MAX_BYTES,'SAVE_CAPACITY','This action would exceed the 1 MiB progress limit. Current work is unchanged; export it before a new campaign.');
    return{state:next,accepted:true,code:result.code,message:result.message};
  }catch(error){if(error.code)return{state,accepted:false,code:error.code,message:error.message};throw error;}
}

export function deriveProgramme(state){
  const bootcamp=deriveBootcamp(state.bootcamp);
  return{screen:state.screen,campaignId:state.campaignId,revision:state.revision,field:deriveShift(state.field),bootcamp,canEnterField:state.fieldStarted||bootcamp.courseComplete,fieldStarted:state.fieldStarted,migrationNotice:state.seed.origin==='opening-0.7'?'Your earlier Opening Shift field work is preserved. This new bootcamp has its own training record; earlier field work is not labelled as completed training.':null};
}

// The download must use the same compact representation as the 1 MiB model cap.
// Indentation can otherwise make a valid saved programme too large to import.
export function serializeProgrammeProgress(state){return JSON.stringify(state);}

function canonical(value,depth=0){
  need(depth<80,'SAVE_DEPTH','The save is nested too deeply.');
  if(Array.isArray(value))return '['+value.map(v=>canonical(v,depth+1)).join(',')+']';
  if(plain(value))return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k],depth+1)).join(',')+'}';
  return JSON.stringify(value);
}

function migrated(field){
  const seed={origin:'opening-0.7',fieldSeed:clone(field.seed),fieldActions:clone(field.actions),fieldImported:field.imported??false,fieldImportProvenance:field.importProvenance??'none'};
  const result=fromSeed(field.campaignId,seed);
  need(canonical(result.field)===canonical(field),'SAVE_MIGRATION_MISMATCH','Earlier field reconstruction did not preserve the saved job. Nothing was replaced.');
  need(bytes(result)<=MAX_BYTES,'SAVE_MIGRATION_CAPACITY','This earlier field save is too large to add training within the 1 MiB limit. Your saved file is unchanged; keep its progress and evidence copies.');
  result.imported=field.imported??false;result.importProvenance=field.importProvenance??'none';return result;
}

export function validateProgrammeSave(raw){
  try{
    need(bytes(raw)<=MAX_BYTES,'SAVE_TOO_LARGE','Programme progress must be no larger than 1 MiB.');
    const saved=typeof raw==='string'?JSON.parse(raw):clone(raw);
    need(plain(saved),'SAVE_FORMAT','Choose a programme progress object.');
    if(saved.appId==='riverbend.clinic.opening-shift'||(!saved.appId&&saved.schemaVersion===1&&plain(saved.attempts))){
      const checked=validateShiftSave(saved);if(!checked.valid)return checked;
      return{valid:true,state:migrated(checked.state),migrated:true};
    }
    need(saved.appId===APP_ID&&saved.schemaVersion===1&&saved.buildVersion===VERSION,'SAVE_VERSION','This is not supported Opening Shift and bootcamp progress. Evidence files are not restorable progress.');
    need(plain(saved.seed)&&Array.isArray(saved.actions)&&saved.actions.length<=MAX_ACTIONS,'SAVE_ACTION_LIMIT','The programme seed/action log is missing or exceeds its replay limit.');
    need(saved.imported===undefined||typeof saved.imported==='boolean','SAVE_PROVENANCE','Import provenance is invalid.');
    need(saved.importProvenance===undefined||origins.includes(saved.importProvenance),'SAVE_PROVENANCE','Import provenance is invalid.');
    let reconstructed=fromSeed(saved.campaignId,saved.seed);
    for(let i=0;i<saved.actions.length;i++){
      const result=dispatchProgramme(reconstructed,saved.actions[i]);need(result.accepted,'SAVE_REPLAY_REJECTED',`Saved programme action ${i+1} was rejected: ${result.code}. Current work is unchanged.`);reconstructed=result.state;
    }
    const comparison=clone(saved),expected=clone(reconstructed);
    for(const key of ['imported','importProvenance']){delete comparison[key];delete expected[key];}
    need(canonical(comparison)===canonical(expected),'SAVE_REPLAY_MISMATCH','Saved training, network, evidence or payment does not match the actual action replay. Current work is unchanged.');
    reconstructed.imported=saved.imported??false;reconstructed.importProvenance=saved.importProvenance??'none';
    return{valid:true,state:reconstructed};
  }catch(error){return{valid:false,code:error.code||'SAVE_INVALID',error:error.code?error.message:'This is not valid bounded programme JSON. Current progress is unchanged.'};}
}

export function createProgrammeEvidence(state){
  const training=createBootcampEvidence(state.bootcamp),field=createShiftEvidence(state.field),view=deriveShift(state.field);
  const json={format:'riverbend-programme-evidence',schemaVersion:1,buildVersion:VERSION,campaignId:state.campaignId,imported:state.imported??false,importProvenance:state.importProvenance??'none',fieldStarted:state.fieldStarted,migrationSource:state.seed.origin,training:training.json,field:field.json,programmeActionLog:clone(state.actions),evidenceNotice:'Training, demonstrations and independent field evidence are distinct. Local action replay checks consistency, not identity or mastery.'};
  const roles={'role.reception':'workstation','role.records':'service host','infra.switch':'switch','role.nurse':'mobile device','infra.ap':'access point'};
  const kinds={desktop:'desktop',server:'server',switch4:'4-port switch',switch8:'8-port switch',laptop:'laptop','access-point':'wireless access point'};
  const requiredTests={'boot.kit':[],'boot.cables':['reception'],'boot.address':['reception'],'boot.wireless':['nurse'],'boot.access':['reception','nurse','nurse-bookings','access-reception','access-outsider-bookings','access-outsider-workspace'],'boot.transfer':['nurse','reception']};
  const trainingLines=[training.text.split('\n\n')[0],'Latest completed attempt per lesson; details are frozen at completion. Tests below are actual learner tests. Pass includes a required denial.',''];
  for(const l of deriveBootcamp(state.bootcamp).lessons){
    const record=training.json.completionRecords.filter(r=>r.lessonId===l.id).at(-1),demo=training.json.demonstrations.find(r=>r.lessonId===l.id);
    trainingLines.push(`${l.title}: ${record?'practical task recorded':'not completed'}${demo?`; worked example ${demo.completed?'finished':'partly viewed'}`:''}.`);
    if(!record)continue;
    const device=roleId=>record.devices.find(d=>d.roleId===roleId);
    const name=deviceId=>roles[record.devices.find(d=>d.id===deviceId)?.roleId]||deviceId;
    const endpoint=(deviceId,portId)=>`${name(deviceId)} ${portId.startsWith(`${deviceId}.`)?portId.slice(deviceId.length+1):portId}`;
    const cableText=c=>`${endpoint(c.fromDeviceId,c.fromPortId)} ↔ ${endpoint(c.toDeviceId,c.toPortId)}`;
    if(l.id==='boot.kit')trainingLines.push(`  Selected equipment: ${record.devices.map(d=>`${roles[d.roleId]||d.roleId} = ${kinds[d.kind]||d.kind}, power ${d.powered?'on':'off'}`).join('; ')}.`);
    if(l.id==='boot.cables')trainingLines.push(`  Connected: ${record.cables.map(cableText).join('; ')||'no cables recorded'}.`);
    if(l.id==='boot.address'){
      const workstation=device('role.reception'),server=device('role.records');
      trainingLines.push(`  Applied workstation address ${workstation?.address||'not recorded'}, mask ${workstation?.mask||'not recorded'}; service host ${server?.address||'not recorded'}; supplied network ${record.network.cidr}.`);
    }
    if(l.id==='boot.wireless'){
      const ap=device('infra.ap'),mobile=device('role.nurse'),uplink=record.cables.find(c=>c.fromDeviceId===ap?.id||c.toDeviceId===ap?.id);
      trainingLines.push(`  At completion: ${kinds[mobile?.kind]||mobile?.kind||'mobile device'}, power ${mobile?.powered?'on':'off'}, associated with ${mobile?.wifiApId?name(mobile.wifiApId):'no access point'}; access point power ${ap?.powered?'on':'off'}. Uplink: ${uplink?cableText(uplink):'not recorded'}.`);
    }
    if(l.id==='boot.access')trainingLines.push(`  Access decision: ${view.policies.find(p=>p.id===record.policyId)?.label||record.policyId} (${record.policyId}); explicit choice ${record.policyDecision?'recorded':'not recorded'}.`);
    if(l.id==='boot.transfer'){
      const observed=record.repair.observed,change=record.repair.change,cable=record.cables.find(c=>c.id===change?.cableId);
      trainingLines.push(`  Observed fault: ${observed?`${observed.reason} by ${observed.kind==='inspection'?'device inspection':'failed learner test'}; ${observed.technicalRevision===record.technicalRevision?'current':'stale'} at completion (before repair)`:'not recorded'}.`);
      trainingLines.push(`  Recorded repair: ${cable?cableText(cable):'not recorded'}. Latest required retests follow.`);
    }
    const tests=new Map();
    for(const o of record.observations){if(o.origin!=='learner'||!requiredTests[l.id].includes(o.testId))continue;const key=l.id==='boot.wireless'?`${o.testId}|${o.locationId}`:o.testId;tests.set(key,o);}
    for(const o of tests.values()){
      const room=view.locations.find(location=>location.id===o.locationId)?.label||o.locationId||'location not recorded';
      const access=o.code==='SERVICE_AVAILABLE'?'allowed; ':o.code==='ACCESS_DENIED'?'denied; ':'';
      trainingLines.push(`  ${o.testId} @ ${room}: ${o.code}; ${access}${o.pass?'pass':'needs attention'}; ${o.testedTechnicalRevision===record.technicalRevision?'current':'stale'} at completion.`);
    }
    trainingLines.push(`  Help: ${record.hints.length} hint levels opened; teacher review pending.`);
  }
  // Keep the learner's exact reflection and the existing evidence notices verbatim.
  const readableTraining=trainingLines.join('\n')+training.text.slice(training.text.indexOf('\n\nEXACT TRANSFER EXPLANATION\n'));
  const latest=new Map();for(const o of view.observations){const key=`${o.testId}|${o.locationId}`;if(!latest.has(key))latest.set(key,o);}
  const failures=[...new Set(view.observations.filter(o=>!o.pass).map(o=>`${o.code}: ${o.message}`))];
  const lines=['OPENING SHIFT — TRAINING AND FIELD REVIEW',`Campaign ${state.campaignId}. Import provenance: ${state.importProvenance??'none'}.`,state.seed.origin==='opening-0.7'?'Earlier field work was migrated without claiming new bootcamp completion.':'New programme: training and field have separate evidence.','',readableTraining,'','INDEPENDENT FIELD RECORD',state.fieldStarted?`${view.mode==='practice'?'Free field rehearsal':'Client job'} — ${view.phase}.`:'Independent field work has not started.',`Equipment choice: ${field.json.current.equipmentDecision?.itemId||'not recorded'}. Access policy: ${view.policy.label}; explicit decision ${view.policyDecision?'recorded':'not recorded'}.`,`Equipment allowance ${view.economy.allowance}; spent ${view.economy.spent}; unused ${view.economy.remaining}. Contractor fee ${view.economy.gross}; guidance ${view.economy.reserved}; simulated minutes ${view.economy.minutes}; campaign wallet ${view.economy.wallet}. Unused client funds are not earnings.`,`Field delivery: ${field.json.delivered?'frozen':'not recorded'}; settlement: ${field.json.settlement?'recorded once':'not recorded'}.`,'','LATEST ACTUAL FIELD TESTS BY CHECK AND ROOM'];
  if(!latest.size)lines.push('No field player tests recorded.');
  for(const o of latest.values())lines.push(`${o.testId} at ${o.locationId}: ${o.code}; ${o.pass?'required result passed':'needs attention'}; ${o.stale?'stale':'current'}.`);
  if(failures.length)lines.push('','EARLIER OR CURRENT FIELD FAILURES',...failures);
  lines.push('','EXACT FIELD EXPLANATIONS');
  for(const [key,item] of Object.entries(view.explanations))lines.push(key.toUpperCase(),item.text||'[No written explanation]',item.oral?'Oral explanation pending teacher review.':item.submitted?'Written explanation pending teacher judgement.':'Not submitted.');
  lines.push('','Model limits: one local IPv4 network; named-room Wi-Fi coverage; simulated role permissions, not real authentication. No router, Internet, DHCP, DNS or radio-physics model. No real student or patient data is required.','Task completion, income, speed and help use do not award an IB grade or establish mastery. Full test paths, current engine checks and action provenance are in the evidence JSON.');
  return{json,text:lines.join('\n')};
}
