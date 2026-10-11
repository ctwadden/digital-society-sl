/* Teaching practice is saved locally. Google Form submission remains separate. */
(() => {
 const deck=window.DECK, stage=document.getElementById('stage'), jump=document.getElementById('jump');
 const questions=[];
 deck.slides.forEach(s=>{if(s.prompt)questions.push({id:s.response_id+'-prompt',prompt:s.prompt});if(s.quiz)questions.push({id:s.response_id+'-check',prompt:s.quiz.q,options:s.quiz.options});});
 let index=0, utterance=null;
 const oldSlideKey='ibds-s03-teaching-'+deck.slug+'-v3:slide';
 try {index=Math.max(0,Math.min(deck.slides.length-1,Number(localStorage.getItem(oldSlideKey))||0));}catch(_){ }
 const store=LearningStudioDrafts.create({key:'ibds-s03-teaching-'+deck.slug+':responses',context:'IBDS · IBDS-REDESIGN-FEED · ibds-26-s03 · '+deck.title+' · '+deck.scope,questions,controls:document.getElementById('draft-tools'),onRestore:restore});
 function restore(){questions.forEach(q=>{const v=store.get(q.id),field=document.getElementById(q.id);if(field)field.value=v.answer;const box=document.querySelector('[data-check="'+q.id+'"]');if(box){box.querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-pressed',String(v.choice===n)));box.querySelector('.feedback').textContent='';}});}
 function stop(){if(window.speechSynthesis)speechSynthesis.cancel();utterance=null;document.getElementById('voice-status').textContent='Playback stopped. The transcript remains available.';}
 function show(n){stop();index=Math.max(0,Math.min(deck.slides.length-1,n));stage.querySelectorAll('.slide-group').forEach((s,i)=>s.hidden=i!==index);jump.value=String(index);document.getElementById('count').textContent=(index+1)+' / '+deck.slides.length;document.getElementById('prev').disabled=index===0;document.getElementById('next').disabled=index===deck.slides.length-1;try{localStorage.setItem(oldSlideKey,String(index));}catch(_){} }
 deck.slides.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+'. '+s.title;jump.append(o);});
 stage.querySelectorAll('textarea').forEach(t=>t.addEventListener('input',()=>store.answer(t.id,t.value)));
 stage.querySelectorAll('[data-check]').forEach(box=>{const s=deck.slides.find(s=>s.response_id+'-check'===box.dataset.check);box.querySelectorAll('button').forEach((b,n)=>b.addEventListener('click',()=>{store.choice(box.dataset.check,n);box.querySelectorAll('button').forEach((x,j)=>x.setAttribute('aria-pressed',String(j===n)));box.querySelector('.feedback').textContent=(n===s.quiz.answer?'Practice feedback: correct. ':'Practice feedback: reconsider. ')+s.quiz.why+' Explain the correction in your own words; then try a fresh example.';}));});
 document.getElementById('prev').onclick=()=>show(index-1);document.getElementById('next').onclick=()=>show(index+1);jump.onchange=()=>show(Number(jump.value));
 document.getElementById('project').onclick=()=>document.body.classList.toggle('projected');document.getElementById('text-view').onclick=()=>{stop();document.body.classList.toggle('textview');};
 document.getElementById('export').onclick=()=>store.exportText();
 document.getElementById('listen').onclick=()=>{stop();if(!window.speechSynthesis){document.getElementById('voice-status').textContent='Browser voice is unavailable. Read the equivalent transcript below.';return;}utterance=new SpeechSynthesisUtterance(deck.slides[index].notes);utterance.lang='en-CA';utterance.rate=.94;utterance.onend=()=>{document.getElementById('voice-status').textContent='Explanation finished. Respond before advancing.';};speechSynthesis.speak(utterance);document.getElementById('voice-status').textContent='Browser voice: playing this slide only. No teacher recording is claimed.';};
 document.getElementById('pause').onclick=()=>{if(window.speechSynthesis)speechSynthesis.pause();};document.getElementById('resume').onclick=()=>{if(window.speechSynthesis)speechSynthesis.resume();};document.getElementById('stop').onclick=stop;
 window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}});
 restore();show(index);
})();
