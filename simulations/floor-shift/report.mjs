import {CONFIG,CLIENTS,PRODUCTS,ACCESSORIES,RESPONSE_PROMPTS}from'./content.mjs';
import{validateBackup}from'./model.mjs';
import{STUDENT_SUBMISSION}from'./submission-config.mjs';
export const CSV_HEADERS=['evidence_id','course_id','local_package_id','session_id','client_id','client','mode','attempt_type','computer','alternative','accessories','all_in_CAD','raw_fit_mark','raw_fit_max','meets_essentials','prediction','student_reasoning','tradeoff','changed_brief_reasoning','criterion_breakdown','prior_practice_exposure','support_context','independence_review_status','teacher_review_status','approved_mark','approved_max','approved_feedback','powerschool_status'];
const cell=value=>{let t=String(value??'');if(/^[\s]*[=+@-]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';};
export function buildEvidenceRows(input){
 const s=validateBackup(input);
 return s.attempts.map(a=>({evidence_id:a.id,course_id:'IBDS',local_package_id:CONFIG.packageId,session_id:s.sessionId,client_id:a.clientId,client:CLIENTS.find(c=>c.id===a.clientId).name,mode:a.mode,attempt_type:a.revisionOf?(a.kind==='transfer'?'transfer_revision':'revision'):a.kind,computer:PRODUCTS.find(p=>p.id===a.proposal.productId).name,alternative:PRODUCTS.find(p=>p.id===a.proposal.alternativeId)?.name||'',accessories:ACCESSORIES.filter(x=>a.proposal.accessoryIds.includes(x.id)).map(x=>x.name).join('; '),all_in_CAD:a.result.total,raw_fit_mark:a.result.score,raw_fit_max:12,meets_essentials:a.result.feasible?'yes':'no',prediction:a.proposal.prediction,student_reasoning:a.proposal.reason,tradeoff:a.proposal.tradeoff,changed_brief_reasoning:a.proposal.transferReason,criterion_breakdown:a.result.criteria.map(c=>`${c.title}: ${c.score}/${c.max}`).join('; '),prior_practice_exposure:a.supportContext.priorPracticeExposure?'yes':'not recorded',support_context:JSON.stringify({active:a.supportContext.active,used:a.supportContext.used,recordingState:a.supportContext.recordingState}),independence_review_status:'pending_teacher_review',teacher_review_status:'pending_teacher_review',approved_mark:'',approved_max:'',approved_feedback:'',powerschool_status:'NOT APPROVED FOR POSTING'}));
}
export function exportEvidenceCSV(s){const rows=buildEvidenceRows(s);return '\uFEFF'+CSV_HEADERS.map(cell).join(',')+'\r\n'+rows.map(r=>CSV_HEADERS.map(h=>cell(r[h])).join(',')).join('\r\n')+'\r\n';}
export function exportEvidenceJSON(input){
 const s=validateBackup(input);
 const text=JSON.stringify({schemaVersion:1,kind:'floor-shift-working-evidence',packageId:CONFIG.packageId,version:CONFIG.version,submissionStatus:'ON_DEVICE_EXPORT_NOT_SUBMITTED',achievementStatus:'PENDING_TEACHER_REVIEW',responsePrompts:RESPONSE_PROMPTS,attemptContexts:s.attempts.map(a=>({evidenceId:a.id,clientOpening:CLIENTS.find(c=>c.id===a.clientId).opening,changedBrief:a.kind==='transfer'?CLIENTS.find(c=>c.id===a.clientId).transfer.text:null,discoveryPrompts:a.discovery.map(q=>({questionId:q.questionId,prompt:CLIENTS.find(c=>c.id===a.clientId).questions.find(p=>p.id===q.questionId).label,answer:q.answer}))})),state:s,reportRows:buildEvidenceRows(s),notes:['Fictional all-in CAD catalogue; no real retail price or benchmark claim.','Raw recommendation fit is not an IB grade.','Mode describes the selected activity; independence requires teacher review of app-recorded support/exposure and other evidence.','Support use is a separate stream and has no mark penalty.','Approved marks and PowerSchool posting require teacher review.']},null,2);
 if(new TextEncoder().encode(text).length>CONFIG.maxBackupBytes)throw new Error('This backup exceeds the safe export limit; current work remains open.');
 return text;
}

// One committed quote per explicit, verified-email Form submission. This is not a school receipt.
export function exportAttemptSubmission(input,attemptId){
 const state=validateBackup(input);
 const attempt=state.attempts.find(a=>a.id===attemptId);
 if(!attempt)throw new Error('Choose a recorded quote before preparing a teacher report.');
 if(attempt.supportContext.recordingState!=='app_recorded')throw new Error('This older quote has no recorded support history. Keep it in your CSV and JSON backup for private teacher review, then make a fresh quote in this version for Google submission. Nothing was submitted.');
 const payload={schemaVersion:1,kind:'floor-shift-attempt',packageId:CONFIG.packageId,modelRevision:STUDENT_SUBMISSION.modelRevision,attempt:{id:attempt.id,clientId:attempt.clientId,mode:attempt.mode,kind:attempt.kind,revisionOf:attempt.revisionOf||null,proposal:attempt.proposal,discovery:attempt.discovery,supportContext:attempt.supportContext}};
 const text=JSON.stringify(payload,null,2);
 if(text.length>STUDENT_SUBMISSION.reportLimitCharacters)throw new Error('This quote exceeds the Google Form report limit. Your full work remains saved: download the JSON backup and arrange a private hand-in with your teacher. Nothing was submitted.');
 return text;
}
