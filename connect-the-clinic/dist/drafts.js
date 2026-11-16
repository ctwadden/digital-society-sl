/** Transient editor drafts. These never claim to be simulation state or evidence. */
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export const draftScope = view => JSON.stringify([view.campaignId,view.attempt?.id||view.attempt?.attemptId]);

export function createDraftStore() {
  const entries = new Map();
  const idFor = (view,kind,key) => JSON.stringify([draftScope(view),kind,key]);
  return {
    get size(){return entries.size;},
    get(view,kind,key){return entries.get(idFor(view,kind,key));},
    put(view,kind,key,value,saved){
      const id=idFor(view,kind,key), previous=entries.get(id);
      if(equal(value,saved)){entries.delete(id);return;}
      const entry={id,scope:draftScope(view),campaignId:view.campaignId,attemptId:view.attempt?.id||view.attempt?.attemptId,kind,key,value:{...value},base:previous?.base||{...saved}};
      entries.set(id,entry);return entry;
    },
    forView(view,kind){return [...entries.values()].filter(e=>e.scope===draftScope(view)&&(!kind||e.kind===kind));},
    canCommit(entry,saved){return entries.get(entry.id)===entry && equal(entry.base,saved);},
    acknowledge(entry,saved){
      const current=entries.get(entry.id);
      if(!current)return;
      if(current===entry){entries.delete(entry.id);return;}
      // A later keystroke belongs to the same editor lineage, not to an external save.
      // Keep its value while advancing the baseline to the acknowledged earlier value.
      if(equal(current.base,entry.base)){
        if(equal(current.value,saved))entries.delete(entry.id);
        else entries.set(entry.id,{...current,base:{...saved}});
      }
    },
    clear(){entries.clear();},
    snapshot(){return [...entries.values()].map(e=>({...e,value:{...e.value},base:{...e.base}}));}
  };
}

export function draftRescueText(entries) {
  const lines=['CONNECT THE CLINIC — UNSAVED DRAFT RESCUE','UNAPPLIED / UNSUBMITTED — NOT SIMULATION EVIDENCE',
    'These local editor drafts have not been accepted into the current simulation state.',
    'This file does not record a successful action, handover, teacher review or grade.',
    'Review the latest campaign before manually re-entering any draft. A saved-state progress/evidence export is separate.',''];
  for(const entry of entries){
    lines.push(`Campaign: ${entry.campaignId}`,`Attempt: ${entry.attemptId}`);
    if(entry.kind==='explanation')lines.push(`Explanation draft: ${entry.key}`,entry.value.text||'[No written draft]',`Oral follow-up requested in draft: ${entry.value.oral?'yes — not submitted':'no'}`);
    else lines.push(`Unapplied address form: ${entry.key}`,`IPv4 address draft: ${entry.value.address}`,`Subnet mask draft: ${entry.value.mask}`);
    lines.push('');
  }
  return lines.join('\n');
}
