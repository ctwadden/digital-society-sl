/* DS command practice, revision 3. No tracking, accounts or answer upload. */
(()=>{
'use strict';
const root=document.querySelector('#commands');
if(!root)return;
const style=document.createElement('style');
style.textContent=`
#commands [hidden]{display:none!important}.coach-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.coach-tabs button{background:#e9f0fc;color:#2254b8;border:2px solid transparent}.coach-tabs button[aria-pressed="true"]{background:#132a46;color:white;border-color:#132a46}.coach-tabs button:focus-visible{outline:3px solid #d58b13;outline-offset:3px}.coach-examples{display:block!important}.coach-examples .command-example{max-width:820px}.coach-choice{display:block;width:100%;height:100%;text-align:left;white-space:normal;background:#f3f6fa;color:#132a46;border:2px solid #c9d5e5;padding:18px;border-radius:12px;font-weight:450;line-height:1.6}.coach-choice strong{display:block;margin-bottom:8px}.coach-choice[aria-pressed="true"]{border-color:#2254b8;background:#e9f0fc}.coach-controls{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.coach-feedback{margin-top:16px;padding:18px;border-left:4px solid #007f85;background:#e7f4f3;border-radius:0 12px 12px 0}.coach-feedback p{margin:8px 0 0}.coach-notes{width:100%;padding:15px;border:1px solid #899bb2;border-radius:10px;min-height:100px;font:inherit;line-height:1.6}.coach-summary{margin-top:20px}.coach-summary .coach-notes[readonly]{font-size:14px;min-height:180px}#commands .coach-kicker{font-weight:700;color:#007f85;font-size:14px}#commands .command-check .grid.two{align-items:stretch}@media print{#commands [hidden]{display:block!important}.coach-tabs,.coach-controls,.coach-summary,.coach-kicker{display:none!important}.coach-choice{display:block!important;color:black;background:white;border:1px solid #aaa}.coach-examples{display:block!important}.coach-feedback{display:block!important}}
`;
document.head.append(style);
const heading=root.querySelector('h2');heading.textContent='Command terms: see it, then try it.';
root.querySelector('.eyebrow').textContent='UPDATED • Guided lesson v3 • 10 minutes • Practice only';
const intro=root.querySelector('.sectionhead>p');intro.textContent='A command term is the instruction word in a question. First see what a suitable answer looks like. Then choose which answer meets a given command. You are not guessing the command term.';
const note=root.querySelector(':scope>.note');note.innerHTML='<strong>What to do:</strong> Read the short scenario. Click the four example buttons. Complete Practice 1, 2 and 3, then copy your three choices and one takeaway into your workbook. <strong>This is not part of your /20 grade.</strong>';
const scenario=document.querySelector('#pulse-scenario');
const glossary=document.createElement('p');glossary.className='small';glossary.textContent='Stakeholders are the people or groups involved in or affected by the system. Here, musicians’ exposure means how often listeners notice their songs.';scenario.append(glossary);
const examples=[...root.querySelectorAll('.command-example')];const exampleHost=examples[0]?.parentElement;
if(exampleHost){
 const tabs=document.createElement('div');tabs.className='coach-tabs';tabs.setAttribute('aria-label','Worked command examples');
 const labels=['Identify','Explain','Analyse','Evaluate'];
 const show=i=>{examples.forEach((p,j)=>p.hidden=j!==i);[...tabs.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));};
 examples.forEach((p,i)=>{p.id='worked-'+labels[i].toLowerCase();const b=document.createElement('button');b.type='button';b.textContent=labels[i];b.setAttribute('aria-controls',p.id);b.addEventListener('click',()=>show(i));tabs.append(b);});
 exampleHost.before(tabs);exampleHost.classList.add('coach-examples');show(0);
}
const cards=[...root.querySelectorAll('.command-check')];if(cards.length!==3)return;
const directions=[...root.querySelectorAll('.sectionhead')];
for(const block of directions){const h=block.querySelector('h3');if(h?.textContent.includes('Which answer'))block.querySelector('p').textContent='Choose Answer A or Answer B, then click Check my answer. Read the feedback and move to the next question. You are choosing an answer, not guessing a command term.';if(h?.textContent.includes('Same situation'))block.querySelector('p').textContent='Click each of the four command buttons. Read its question, worked answer and why it works. You do not need to copy these examples.';}
const correct=['B','A','B'];const commands=['EXPLAIN','ANALYSE','EVALUATE'];
const picks=['','',''];const first=['','',''];const checked=[false,false,false];const explanations=[];
const nav=document.createElement('div');nav.className='coach-tabs';nav.setAttribute('aria-label','Practice questions');
const progress=document.createElement('p');progress.className='coach-kicker';progress.setAttribute('aria-live','polite');
cards[0].before(nav,progress);
let active=0;
const show=i=>{active=i;cards.forEach((p,j)=>p.hidden=j!==i);[...nav.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));progress.textContent='Practice '+(i+1)+' of 3 · '+checked.filter(Boolean).length+' checked · Choose an answer, then click Check my answer.';};
const summary=document.createElement('div');summary.className='card coach-summary';summary.id='practice-notes';summary.innerHTML='<div class="eyebrow">Finish / Keep your thinking</div><h3>Save four lines in your workbook.</h3><p>Finish the three checks. Then complete the sentence below in your own words.</p><label for="coach-takeaway"><strong>An explanation shows _____. An evaluation also needs _____.</strong></label><textarea id="coach-takeaway" class="coach-notes" placeholder="Write your own takeaway here."></textarea><p class="small">Your entries stay only on this open page. Refreshing or closing it clears them. Copy or save your notes before leaving. No answers are sent to your teacher.</p><label for="coach-export"><strong>Your practice notes</strong></label><textarea id="coach-export" class="coach-notes" readonly></textarea><div class="coach-controls"><button type="button" id="coach-copy">Copy notes for my workbook</button><button type="button" class="secondary" id="coach-save">Save notes as text</button><a class="button secondary" href="#cases">Continue to my readings →</a></div><p class="small" id="coach-status" role="status"></p><p class="small">Already have an older workbook? Put these four lines where the old A–F matching boxes are. Keep all your other work. Saving these notes is not submitting the assignment.</p>';
const oldFinish=[...root.querySelectorAll(':scope>.card')].find(el=>el.querySelector('.eyebrow')?.textContent.includes('Step 4'));
if(oldFinish)oldFinish.replaceWith(summary);else cards[2].after(summary);
const takeaway=summary.querySelector('#coach-takeaway');const output=summary.querySelector('#coach-export');const status=summary.querySelector('#coach-status');
const refresh=()=>{output.value='COMMAND-TERM PRACTICE — NOT GRADED\n'+commands.map((c,i)=>'Practice '+(i+1)+' — '+c+': '+(first[i]||'not checked yet')+(checked[i]&&first[i]!==correct[i]?' (answer key: '+correct[i]+')':'')).join('\n')+'\nMy takeaway: '+takeaway.value.trim();};
cards.forEach((card,i)=>{
 const tab=document.createElement('button');tab.type='button';tab.textContent='Practice '+(i+1);tab.setAttribute('aria-controls',card.id);tab.addEventListener('click',()=>show(i));nav.append(tab);
 const reveal=card.querySelector('.answer-reveal');explanations[i]=reveal.querySelector('p').textContent;reveal.remove();
 const options=[...card.querySelectorAll('.answer-option')];const choiceButtons=[];
 options.forEach((option,j)=>{const letter=j===0?'A':'B';const text=option.querySelector('p').textContent;const b=document.createElement('button');b.type='button';b.className='coach-choice';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Answer '+letter+': '+text);const label=document.createElement('strong');label.textContent='Answer '+letter;b.append(label,document.createTextNode(text));b.addEventListener('click',()=>{picks[i]=letter;choiceButtons.forEach((x,k)=>x.setAttribute('aria-pressed',String(k===j)));feedback.hidden=true;});choiceButtons.push(b);option.replaceWith(b);});
 const helper=card.querySelector(':scope>.small');if(helper)helper.textContent='Click Answer A or Answer B, then click Check my answer. Mistakes are part of this practice.';
 const controls=document.createElement('div');controls.className='coach-controls';const check=document.createElement('button');check.type='button';check.textContent='Check my answer';
 const next=document.createElement('button');next.type='button';next.className='secondary';next.textContent=i<2?'Next question →':'Finish & copy notes →';next.hidden=true;
 const feedback=document.createElement('div');feedback.className='coach-feedback';feedback.setAttribute('role','status');feedback.hidden=true;
 check.addEventListener('click',()=>{feedback.replaceChildren();feedback.hidden=false;if(!picks[i]){feedback.textContent='Choose Answer A or Answer B first.';return;}if(!first[i])first[i]=picks[i];checked[i]=true;const lead=document.createElement('strong');lead.textContent=picks[i]===correct[i]?'Yes — this answer meets the command.':'Not quite — compare what the two answers actually do.';const reason=document.createElement('p');reason.textContent=explanations[i];feedback.append(lead,reason);next.hidden=false;refresh();show(active);});
 next.addEventListener('click',()=>{if(i<2){show(i+1);nav.scrollIntoView({behavior:'smooth',block:'start'});}else{summary.scrollIntoView({behavior:'smooth',block:'start'});takeaway.focus({preventScroll:true});}});
 controls.append(check,next);card.append(controls,feedback);
});
takeaway.addEventListener('input',refresh);
summary.querySelector('#coach-copy').addEventListener('click',async()=>{refresh();try{if(!navigator.clipboard)throw Error('No clipboard');await navigator.clipboard.writeText(output.value);status.textContent='Copied. Paste into your workbook and save it there. This has not submitted your assignment.';}catch{output.focus();output.select();status.textContent='Notes selected. Press Ctrl+C or Command+C, then paste into your workbook.';}});
summary.querySelector('#coach-save').addEventListener('click',()=>{refresh();const url=URL.createObjectURL(new Blob([output.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='DS_Command_Practice_Notes.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);status.textContent='Text file saved. Add these notes to your workbook. This is not a submission.';});
show(0);refresh();root.dataset.revision='guided-v3';
})();
