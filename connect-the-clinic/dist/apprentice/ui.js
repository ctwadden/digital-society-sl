/**
 * Lantern Line apprenticeship interface. The scene is the workspace; panels open when needed.
 * Every state shown here comes from the derived engine view. The UI never decides success.
 */
import {mentorLine,staffLines,MENTOR} from './mentor.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const ROLE_LABEL={'role.reception':'Desk computer','role.records':'Service host','infra.switch':'Network switch','infra.ap':'Wireless access point','role.nurse':'Ana’s tablet'};
const ROLE_ROOM={'role.reception':'reception','role.records':'closet','infra.switch':'closet','infra.ap':'corridor','role.nurse':'examA'};
const ROOM_LABEL={'location.exam-a':'exam room A','location.exam-b':'exam room B','location.reception':'reception','location.equipment':'equipment closet'};
const CABLES=[
  {type:'ethernet',label:'Ethernet patch',hint:'RJ45 · network'},
  {type:'power',label:'Power cord',hint:'IEC · power'},
  {type:'hdmi',label:'HDMI',hint:'display'},
  {type:'usb',label:'USB',hint:'peripherals'},
  {type:'phone',label:'Phone cord',hint:'RJ11'}];
const TESTS={reception:'Test from the desk computer',nurse:'Test from Ana’s tablet',access:'Check who can access what'};
const CODE_TEXT={SERVICE_AVAILABLE:'Service available',ACCESS_DENIED:'Access denied',PORT_DISCONNECTED:'Cable path incomplete',DEVICE_OFF:'Device has no power',SWITCH_OFF:'Switch has no power',ADDRESS_WRONG_SUBNET:'Address on the wrong network',ADDRESS_DUPLICATE:'Address already in use',ADDRESS_RESERVED:'Reserved address',ADDRESS_INVALID:'Invalid address',ADDRESS_OFF_LINK:'Masks disagree',WIFI_NOT_ASSOCIATED:'Tablet not joined to Wi-Fi',AP_OFF:'Access point has no power',SERVICE_UNAVAILABLE:'Service not running',CAPABILITY_MISSING:'Wrong kind of device',DEVICE_MISSING:'Device missing',OUTSIDE_COVERAGE:'Outside Wi-Fi coverage'};
const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let art=null;
async function loadArt(){
  try{art=await import('./art.js');}catch(error){console.warn('Scene art unavailable; using the plain fallback.',error);art=null;}
}

function fallbackScene(view,kind){
  const rows=kind==='yard'?view.items.map(i=>`<text x="60" y="${80+view.items.indexOf(i)*40}" font-size="22" fill="#173b40">${esc(i.label)}${i.packed?' ✓':''}</text>`).join(''):
    view.devices.map((d,i)=>`<text x="60" y="${80+i*40}" font-size="22" fill="#173b40">${esc(ROLE_LABEL[d.roleId]||d.roleId)} · ${d.powered?'on':'off'}</text>`).join('');
  return `<svg viewBox="0 0 1600 1000" role="img" aria-label="Plain scene"><rect width="1600" height="1000" fill="#f4ead4"/>${rows}</svg>`;
}

export function mountApprenticeUI(root,handlers){
  const {getView,send,onExport,onImport,onReset,onClear,onTakeControl,onRecover}=handlers;
  let view=getView(),panel=null,selected=null,closed=false,busy=false,modal=null,status=null,driving=false,ceremony=false,lastLineKey='',draft=null,addrDraft={};
  root.innerHTML=`<div class="ll-game"><a class="ll-skip" href="#ll-panel-region">Skip to controls</a><header class="ll-hud" data-r="hud"></header><div class="ll-storage" data-r="storage"></div><main class="ll-stage" id="ll-main"><section class="ll-scene-wrap" aria-label="Scene"><div class="ll-scene" data-r="scene"></div><div class="ll-hotspots" data-r="hotspots"></div><div class="ll-bubbles" data-r="bubbles" aria-hidden="true"></div><div class="ll-bag" data-r="bag"></div></section><aside class="ll-side"><section class="ll-mentor" data-r="mentor" aria-label="Mags, your mentor"></section><section class="ll-panel" id="ll-panel-region" data-r="panel" tabindex="-1"></section></aside></main><div class="ll-live" aria-live="polite" data-r="live"></div><div data-r="overlay"></div></div>`;
  const R=n=>root.querySelector(`[data-r=${n}]`);
  const set=(n,html)=>{const el=R(n);if(el&&el.innerHTML!==html)el.innerHTML=html;};
  const readOnly=()=>['readonly','starting'].includes(view.storage?.mode);
  const dis=()=>readOnly()||busy?'disabled':'';
  const btn=(act,label,attrs='',cls='ll-btn')=>`<button type="button" class="${cls}" data-act="${act}" ${attrs}>${label}</button>`;
  const dev=roleId=>view.devices.find(d=>d.roleId===roleId)||null;
  const byId=id=>view.devices.find(d=>d.id===id)||null;

  async function act(action){
    if(busy||readOnly())return;
    busy=true;
    try{
      const result=await send({type:'APP_ACTION',action});
      if(!result.accepted)status={tone:'error',text:result.message};else status=null;
      return result;
    }finally{busy=false;render();}
  }
  async function programme(action){busy=true;try{const r=await send(action);if(!r.accepted)status={tone:'error',text:r.message};return r;}finally{busy=false;render();}}

  // ---------- HUD ----------
  function hud(){
    const v=view.visit,site=view.at==='site'&&v;
    const pips=view.visits.map(x=>`<li class="${x.completed?'done':x.active?'now':''}" title="Visit ${x.number}: ${esc(x.title)}"><span class="ll-sr">Visit ${x.number} ${x.completed?'completed':x.unlocked?'open':'locked'}</span></li>`).join('')+`<li class="van ${view.truckEarned?'done':''}" title="Your own van"><span class="ll-sr">Own van ${view.truckEarned?'earned':'not yet earned'}</span></li>`;
    return `<div class="ll-brand"><span class="ll-lantern" aria-hidden="true"></span><div><strong>Lantern Line</strong><span>${site?`Harbour Street Clinic · Visit ${v.number} of 3`:'Depot yard'}</span></div></div>
      <ol class="ll-pips" aria-label="Apprenticeship progress">${pips}</ol>
      <nav class="ll-hud-actions" aria-label="Game menu">${site?btn('panel','Job sheet','data-panel="job"','ll-btn ll-quiet')+btn('panel','Network card','data-panel="card"','ll-btn ll-quiet'):''}${btn('panel','Cable guide','data-panel="guide"','ll-btn ll-quiet')}${site?btn('yard','Depot',dis(),'ll-btn ll-quiet'):''}${btn('modal','Progress','data-modal="progress"','ll-btn ll-quiet')}</nav>`;
  }
  function storage(){
    const s=view.storage||{};if(!s.mode||s.mode==='saved')return '';
    return `<p><strong>${esc(s.label)}</strong> ${esc(s.detail||'')} ${s.canTakeControl?btn('take-control','Take control here'):''}${s.canRecover?btn('recover','Recover saved copy'):''}</p>`;
  }

  // ---------- SCENE ----------
  function sceneModel(){
    const latest=view.latestTest&&!view.latestTest.stale?view.latestTest:null;
    const ap=dev('infra.ap'),tablet=dev('role.nurse');
    const wifi=ap&&tablet&&tablet.wifiApId===ap.id?{apDeviceId:ap.id,clientDeviceId:tablet.id,state:latest&&latest.testId==='nurse'?(latest.pass?'tested-ok':'tested-fail'):'installed'}:null;
    const mentorRoom=view.highlight?ROLE_ROOM[byId(view.highlight.deviceId)?.roleId||view.highlight.roleSlot]||'reception':selected?ROLE_ROOM[byId(selected)?.roleId]||'reception':'reception';
    const line=mentorLine(view);
    return {activeRooms:view.visit?.rooms||['reception','closet'],
      devices:view.devices.map(d=>({id:d.id,roleId:d.roleId,kind:d.kind,powered:d.powered,locationId:d.locationId,selected:d.id===selected})),
      cables:view.cables.map(c=>({id:c.id,fromDeviceId:c.fromDeviceId,toDeviceId:c.toDeviceId,state:c.state})),
      wifi,staff:{reception:view.staff.reception,nurse:view.staff.nurse,manager:view.staff.manager},
      mentor:{locationId:mentorRoom==='corridor'?'corridor':mentorRoom,pose:view.highlight?'pointing':line.mood==='pleased'?'thumbs':line.mood==='thinking'?'thinking':'idle'},
      player:{locationId:selected?ROLE_ROOM[byId(selected)?.roleId]||'reception':'reception'},
      highlight:view.highlight,testPulse:latest&&latest.pathIds?.length?{ids:latest.pathIds.filter((_,i)=>i%2===0),pass:latest.pass}:null,
      timeOfDay:view.visit?.number===3?'afternoon':'morning',vanParked:true,reducedMotion:reduceMotion()};
  }
  function scene(){
    if(view.at==='yard'){
      const line=mentorLine(view);
      return art?art.renderYard({packed:view.packed,highlight:null,mentorPose:line.mood==='pleased'?'thumbs':'idle',showPlayer:true}):fallbackScene(view,'yard');
    }
    return art?art.renderSite(sceneModel()):fallbackScene(view,'site');
  }
  function anchorPct(x,y,w=1600,h=1000){return `left:${(x/w*100).toFixed(2)}%;top:${(y/h*100).toFixed(2)}%`;}
  function hotspots(){
    if(view.at==='yard'){
      const items=art?.YARD_ITEMS||[];
      return view.items.map((i,n)=>{const a=items.find(x=>x.id===i.id)||{x:300+n*150,y:820};
        return `<button type="button" class="ll-hot ${i.packed?'is-packed':''}" style="${anchorPct(a.x,a.y)}" data-act="${i.packed?'unpack':'pack'}" data-item="${esc(i.id)}" aria-pressed="${i.packed}" ${dis()}><span>${esc(i.label)}${i.packed?' · in bag':''}</span></button>`;}).join('');
    }
    const v=view.visit;if(!v)return '';
    const roles=['role.reception','infra.switch','role.records','infra.ap','role.nurse'];
    const offered=new Set(view.roleOptions.map(o=>o.roleId));
    return roles.map(roleId=>{
      const d=dev(roleId);if(!d&&!offered.has(roleId))return '';
      const p=art?.siteAnchor?art.siteAnchor(roleId,d?.locationId):(art?.SITE_SLOTS?.[roleId]||{x:200+roles.indexOf(roleId)*250,y:500});
      const hl=view.highlight&&(view.highlight.deviceId===d?.id||view.highlight.roleSlot===roleId);
      const label=d?`${ROLE_LABEL[roleId]}${d.powered?'':' (no power)'}`:`Empty spot: ${ROLE_LABEL[roleId].toLowerCase()}`;
      return `<button type="button" class="ll-hot ${d?'':'is-empty'} ${hl?'is-highlight':''} ${selected&&selected===d?.id?'is-selected':''}" style="${anchorPct(p.x,p.y)}" data-act="${d?'select':'slot'}" data-device="${esc(d?.id||'')}" data-role="${roleId}"><span>${esc(label)}</span></button>`;
    }).join('');
  }
  function bubbles(){
    if(view.at!=='site'||!art?.SITE_SLOTS)return '';
    const pos={reception:art.siteAnchor?.('role.reception')||art.SITE_SLOTS['role.reception'],nurse:art.siteAnchor?.('role.nurse',view.staff.nurse.locationId)||art.SITE_SLOTS['role.nurse'],manager:art.SITE_SLOTS.manager||art.SITE_SLOTS['role.reception']};
    return staffLines(view).map(s=>{const p=pos[s.person];if(!p)return '';return `<div class="ll-bubble mood-${s.mood} who-${s.person}" style="${anchorPct(p.x,p.y-(s.person==='manager'?40:110))}"><b>${esc(s.name)}</b> ${esc(s.text)}</div>`;}).join('');
  }
  function bag(){
    if(view.at!=='site'||!view.visit||view.visit.finished)return '';
    const held=view.held;
    const cables=CABLES.map(c=>`<button type="button" class="ll-cable ${held===c.type?'is-held':''} c-${c.type}" data-act="hold" data-cable="${c.type}" aria-pressed="${held===c.type}" ${dis()}><i aria-hidden="true"></i><span>${c.label}<small>${c.hint}</small></span></button>`).join('');
    const pending=view.pendingEnd?`One end in ${esc(ROLE_LABEL[byId(view.pendingEnd.deviceId)?.roleId]||'a device')}. Choose the other device’s port.`:held?`Holding: ${esc(CABLES.find(c=>c.type===held)?.label)}. Choose a device, then a socket.`:'Pick a cable, or use a tool.';
    return `<div class="ll-bag-inner" role="toolbar" aria-label="Tool bag"><span class="ll-bag-title">Tool bag</span>${cables}<span class="ll-bag-sep" aria-hidden="true"></span>${btn('panel','<i class="t-test" aria-hidden="true"></i><span>Service tester</span>',`data-panel="tester" ${dis()}`,'ll-tool')}${held?btn('release','Put cable back',dis(),'ll-btn ll-quiet'):''}<p class="ll-bag-status">${pending}</p></div>`;
  }

  // ---------- MENTOR ----------
  function mentor(){
    const line=mentorLine(view);
    const portrait=art?.renderMentorPortrait?art.renderMentorPortrait(line.mood):'<div class="ll-portrait-fallback">M</div>';
    let asks='';
    if(view.at==='site'&&view.visit){
      const topics=[['next','What should I do next?'],['why','Why does this work?'],['show','Show me where']];
      const extra={'visit.1':[['cables','Which cable is which?']],'visit.2':[['address','How do I pick an address?'],['wireless','How does Wi-Fi connect?']],'visit.3':[['access','Who should get access?'],['cables','Cable guide']]}[view.visit.id]||[];
      asks=`<div class="ll-asks" role="group" aria-label="Ask Mags">${[...topics,...extra].map(([t,l])=>btn('ask',esc(l),`data-topic="${t}" ${dis()}`,'ll-chip')).join('')}</div><p class="ll-support">${{alongside:'Mags works alongside you today.',supported:'Mags steps in when you ask or get stuck.',lead:'You lead. Mags answers if you ask.'}[view.visit.support]} Asking is always free.</p>`;
    }
    return `<div class="ll-mentor-head"><div class="ll-portrait" aria-hidden="true">${portrait}</div><div><strong>${MENTOR.name}</strong><span>${esc(MENTOR.role)}</span></div></div><blockquote class="ll-say mood-${line.mood}"><p>${esc(line.text)}</p></blockquote>${asks}${status?`<p class="ll-status ${status.tone}" role="alert">${esc(status.text)}</p>`:''}`;
  }

  // ---------- PANELS ----------
  function yardPanel(){
    const ready=view.bagReady;
    const cards=view.visits.map(x=>`<li class="ll-visit ${x.completed?'done':''} ${x.unlocked?'':'locked'}"><span class="ll-visit-no">Visit ${x.number}</span><strong>${esc(x.title)}</strong><span class="ll-visit-support">${{alongside:'Mags works alongside you',supported:'Supported: you configure',lead:'You lead the job'}[x.support]}</span>${x.completed?`<span class="ll-tag ok">Completed</span>${btn('start','Practise again',`data-visit="${x.id}" ${dis()}`,'ll-btn ll-quiet')}`:x.unlocked?btn('start',x.active?'Continue visit':'Ride to the clinic',`data-visit="${x.id}" ${ready?'':'disabled'} ${dis()}`,'ll-btn ll-primary'):'<span class="ll-tag">Locked</span>'}</li>`).join('');
    const bagList=view.items.map(i=>`<li class="${i.packed?'in':''}"><button type="button" class="ll-bagitem" data-act="${i.packed?'unpack':'pack'}" data-item="${esc(i.id)}" aria-pressed="${i.packed}" ${dis()}><b>${esc(i.label)}</b><small>${esc(i.use)}</small></button></li>`).join('');
    const truck=view.truckEarned?`<div class="ll-truckcall"><strong>${view.truckClaimed?'Van 7 is yours':'Something is waiting by the shed'}</strong>${view.truckClaimed?`<p>Independent jobs are open.</p>${btn('field','Take your first solo job →',dis(),'ll-btn ll-primary')}`:btn('ceremony','Go and see →',dis(),'ll-btn ll-primary')}</div>`:'';
    return `<h2>Today’s work</h2>${truck}<ol class="ll-visits">${cards}</ol>${ready?'':'<p class="ll-note">Pack the essentials before you leave. Click items on the van shelves or choose them here.</p>'}<details class="ll-details" ${ready?'':'open'}><summary>Tool bag (${view.packed.length} items)</summary><ul class="ll-baglist">${bagList}</ul></details><div class="ll-links">${btn('bench','Optional practice bench',dis(),'ll-btn ll-quiet')}${view.canEnterField&&!view.truckEarned?btn('field','Return to field job',dis(),'ll-btn ll-quiet'):''}</div><p class="ll-fine">${esc(view.notice)}</p>`;
  }

  function devicePanel(){
    const d=byId(selected);if(!d)return slotPanel();
    const sockets=deviceSockets(d);
    const close=art?.renderCloseup?art.renderCloseup({device:{id:d.id,kind:d.kind,powered:d.powered,ports:d.ports.map(p=>({id:p.id,medium:p.medium,cableId:p.cableId}))},heldCable:view.held,highlightPortId:view.pendingEnd?.portId||null}):'';
    const allowed=view.allowedActions||[],finished=view.visit.finished;
    const insp=view.inspections.find(i=>i.deviceId===d.id);
    const settings=['role.reception','role.nurse'].includes(d.roleId)&&allowed.includes('SET_STATIC_ADDRESS')?addressForm(d):'';
    const wifi=d.roleId==='role.nurse'&&allowed.includes('ASSOCIATE_WIFI')?wifiForm(d):'';
    const move=d.roleId==='role.nurse'&&allowed.includes('MOVE_NURSE')?`<div class="ll-row"><span>Ana is in ${esc(ROOM_LABEL[d.locationId]||d.locationId)}.</span>${btn('move',d.locationId==='location.exam-a'?'Ask Ana to go to room B':'Ask Ana to go to room A',`data-loc="${d.locationId==='location.exam-a'?'location.exam-b':'location.exam-a'}" ${dis()}`,'ll-btn ll-quiet')}</div>`:'';
    const cables=view.cables.filter(c=>c.fromDeviceId===d.id||c.toDeviceId===d.id).map(c=>{const other=byId(c.fromDeviceId===d.id?c.toDeviceId:c.fromDeviceId);return `<li>Ethernet to ${esc(ROLE_LABEL[other?.roleId]||'device')} <span class="ll-tag ${c.state}">${{installed:'not tested','tested-ok':'tested OK','tested-fail':'test failed',stale:'test out of date'}[c.state]}</span>${allowed.includes('DISCONNECT_CABLE')&&!finished?btn('unplug','Unplug',`data-cable="${esc(c.id)}" ${dis()}`,'ll-btn ll-text'):''}</li>`;}).join('');
    const swap=view.roleOptions.find(o=>o.roleId===d.roleId);
    return `<header class="ll-panel-head"><h2>${esc(ROLE_LABEL[d.roleId])}</h2><p>${esc(d.label)} · ${d.powered?'<span class="ll-on">power on</span>':'<span class="ll-off">no power</span>'}</p>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header>
      <figure class="ll-closeup"><div class="ll-closeup-art" aria-hidden="true">${close}</div><figcaption>Back panel. ${view.held?`Holding ${esc(CABLES.find(c=>c.type===view.held)?.label)} — choose a socket:`:'Pick a cable from the tool bag, then choose a socket:'}</figcaption></figure>
      <ul class="ll-sockets" aria-label="Sockets on this device">${sockets.map(s=>`<li>${btn('plug',`<i class="s-${s.kind}" aria-hidden="true"></i>${esc(s.label)}${s.busy?' · in use':''}`,`data-device="${esc(d.id)}" data-socket="${esc(s.id)}" ${finished?'disabled':''} ${dis()}`,`ll-socket ${view.pendingEnd?.portId===s.id?'is-pending':''}`)}</li>`).join('')}</ul>
      <div class="ll-tools">${btn('inspect','Inspect with the light',`data-device="${esc(d.id)}" ${finished?'disabled':''} ${dis()}`,'ll-btn')}${d.powered&&allowed.includes('POWER_DEVICE')&&!finished?btn('power-off','Switch off',`data-device="${esc(d.id)}" ${dis()}`,'ll-btn ll-quiet'):''}</div>
      ${insp?inspectionCard(insp):''}${settings}${wifi}${move}${cables?`<h3>Cables</h3><ul class="ll-list">${cables}</ul>`:''}
      ${swap&&!finished?`<details class="ll-details"><summary>Swap for different equipment</summary>${swap.choices.map(c=>btn('choose',`${esc(c.label)} <small>${c.ethernet?`${c.ethernet} Ethernet port${c.ethernet>1?'s':''}`:'no Ethernet port'}</small>`,`data-role="${d.roleId}" data-kind="${c.kind}" ${d.kind===c.kind?'disabled':''} ${dis()}`,'ll-btn ll-quiet')).join('')}</details>`:''}`;
  }
  function slotPanel(){
    const roleId=selected?.startsWith?.('slot:')?selected.slice(5):null;const option=view.roleOptions.find(o=>o.roleId===roleId);
    if(!option)return '';
    return `<header class="ll-panel-head"><h2>${esc(ROLE_LABEL[roleId])}</h2><p>Empty spot. Fetch something from the van.</p>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header><ul class="ll-choices">${option.choices.map(c=>`<li>${btn('choose',`<b>${esc(c.label)}</b><small>${esc(c.description)}</small><small>${c.ethernet?`${c.ethernet} Ethernet port${c.ethernet>1?'s':''}`:'No Ethernet port'}</small>`,`data-role="${roleId}" data-kind="${c.kind}" ${dis()}`,'ll-choice')}</li>`).join('')}</ul>`;
  }
  function deviceSockets(d){
    const list=d.ports.filter(p=>p.medium==='ethernet').map(p=>({id:p.id,kind:'ethernet',label:`${p.label} (RJ45)`,busy:!!p.cableId}));
    const extras={desktop:['power','hdmi','usb'],server:['power','usb'],switch4:['power'],switch8:['power'],'access-point':['power'],laptop:['power','usb','hdmi'],tablet:['power','usb']}[d.kind]||['power'];
    const names={power:'Power inlet',hdmi:'HDMI display port',usb:'USB port'};
    return [...extras.map(k=>({id:`${d.id}.${k}`,kind:k,label:names[k],busy:k==='power'&&d.powered})),...list];
  }
  function inspectionCard(i){
    const s=i.snapshot,eth=s.ports.filter(p=>p.medium==='ethernet');
    return `<div class="ll-reading ${i.stale?'is-stale':''}"><h3>Inspection reading${i.stale?' · out of date':''}</h3><dl>${s.address?`<dt>Address</dt><dd>${esc(s.address)}</dd><dt>Mask</dt><dd>${esc(s.mask)}</dd>`:''}<dt>Power</dt><dd>${s.powered?'On':'Off'}</dd><dt>Ethernet</dt><dd>${eth.length?eth.map(p=>`${esc(p.label)}: ${p.cableId?'cable connected':'empty'}`).join('; '):'No Ethernet ports'}</dd>${s.roleId==='role.nurse'?`<dt>Wi-Fi</dt><dd>${s.wifiApId?'Joined to the access point':'Not joined'}</dd>`:''}</dl></div>`;
  }
  function addressForm(d){
    const key=d.id,val=addrDraft[key]||{address:d.address,mask:d.mask};
    return `<form class="ll-form" data-form="address" data-device="${esc(d.id)}"><h3>Network settings</h3><p class="ll-help">Compare with the <button type="button" class="ll-link" data-act="panel" data-panel="card">network card</button>.</p><label>IP address<input name="address" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(val.address)}" ${dis()}></label><label>Subnet mask<input name="mask" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(val.mask)}" ${dis()}></label><button class="ll-btn ll-primary" ${dis()}>Apply settings</button></form>`;
  }
  function wifiForm(d){
    const ap=dev('infra.ap');
    return `<div class="ll-row"><span>Wi-Fi: ${d.wifiApId?'joined to the clinic access point':'not joined'}</span>${ap&&d.wifiApId!==ap.id?btn('join','Join the clinic access point',`data-device="${esc(d.id)}" data-ap="${esc(ap.id)}" ${dis()}`,'ll-btn'):''}</div>`;
  }
  function testerPanel(){
    const t=view.latestTest,routeNames=(t?.pathIds||[]).filter((_,i)=>i%2===0).map(id=>ROLE_LABEL[byId(id)?.roleId]||'device');
    const history=view.observations.slice(0,8).map(o=>`<li class="${o.pass?'ok':'bad'} ${o.stale?'stale':''}"><b>${esc(o.label)}</b> ${esc(CODE_TEXT[o.code]||o.code)}${o.locationId&&o.testId==='nurse'?` · ${esc(ROOM_LABEL[o.locationId])}`:''}${o.stale?' · out of date':''}</li>`).join('');
    return `<header class="ll-panel-head"><h2>Service tester</h2><p>Runs a real check through the current network and shows the route it used.</p>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header>
      <div class="ll-testbtns">${view.allowedTests.map(id=>btn('test',esc(TESTS[id]),`data-test="${id}" ${view.visit.finished?'disabled':''} ${dis()}`,'ll-btn ll-primary')).join('')}</div>
      ${t?`<div class="ll-result ${t.pass?'ok':'bad'} ${t.stale?'stale':''}" role="status"><strong>${t.pass?'✓':'✕'} ${esc(CODE_TEXT[t.code]||t.code)}</strong><p>${esc(t.message)}</p>${routeNames.length?`<p class="ll-route">Route: ${routeNames.map(esc).join(' → ')}</p>`:'<p class="ll-route">No complete route was found.</p>'}${t.stale?'<p class="ll-warn">Something changed since this test. Test again.</p>':''}</div>`:'<p class="ll-note">No tests yet. A test is proof; a link light is not.</p>'}
      ${history?`<h3>Recent tests</h3><ul class="ll-history">${history}</ul>`:''}`;
  }
  function cardPanel(){
    const n=view.network;
    return `<header class="ll-panel-head"><h2>Network card</h2><p>Taped inside the equipment closet door.</p>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header><div class="ll-netcard"><dl><dt>Network</dt><dd>${esc(n.cidr)}</dd><dt>Subnet mask</dt><dd>${esc(n.mask)}</dd><dt>Service host</dt><dd>${esc(n.serverAddress)}</dd><dt>Ana’s tablet</dt><dd>${esc(n.inheritedNurseAddress)}</dd><dt>Usable</dt><dd>${esc(n.base)}.1 – ${esc(n.base)}.254</dd></dl><p>Each device needs its own address. With this /24 mask the first three numbers stay ${esc(n.base)}. That shortcut is only true for a /24 mask.</p></div>`;
  }
  function accessPanel(){
    return `<header class="ll-panel-head"><h2>Access rules</h2><p>Who may use bookings and the clinical workspace.</p>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header><fieldset class="ll-policies"><legend>Choose one rule set</legend>${view.policies.map(p=>`<label class="${p.id===view.policy.id?'is-current':''}"><input type="radio" name="policy" value="${esc(p.id)}" ${p.id===view.policy.id?'checked':''} ${view.visit.finished?'disabled':''} ${dis()}><b>${esc(p.label)}</b><small>${esc(p.description)}</small></label>`).join('')}</fieldset>${btn('policy','Apply this rule set',`${view.visit.finished?'disabled':''} ${dis()}`,'ll-btn ll-primary')}<p class="ll-fine">Simulated roles only. No real accounts or clinic records.</p>`;
  }
  function jobPanel(){
    const v=view.visit,checks=view.checks.map(c=>`<li class="${c.met?'met':''}"><span aria-hidden="true">${c.met?'✓':'○'}</span><div><b>${esc(c.label)}</b>${v.support!=='lead'||c.met?`<small>${esc(c.detail)}</small>`:''}</div><span class="ll-sr">${c.met?'done':'not yet'}</span></li>`).join('');
    const x=view.explanation;
    const explain=v.id==='visit.3'?`<form class="ll-form" data-form="explain"><h3>Explain the job</h3><label>What was wrong, what you changed, and who it helps or restricts<textarea name="text" rows="5" maxlength="2000" ${v.finished?'disabled':''} ${dis()}>${esc(draft??x?.text??'')}</textarea></label><label class="ll-check"><input type="checkbox" name="oral" ${x?.oral?'checked':''} ${v.finished?'disabled':''} ${dis()}> I will explain this aloud to my teacher</label>${x?.submitted?`<p class="ll-note">${x.stale?'Saved before your last change — save again.':'Saved exactly as written.'}</p>`:''}<button class="ll-btn" ${v.finished?'disabled':''} ${dis()}>Save explanation</button></form>`:'';
    const access=v.id==='visit.3'?btn('panel','Open access rules','data-panel="access"','ll-btn ll-quiet'):'';
    return `<header class="ll-panel-head"><h2>Job sheet · Visit ${v.number}</h2><p>${esc(v.brief)}</p>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header><p class="ll-goal"><b>Goal:</b> ${esc(v.goal)}</p><ul class="ll-checks">${checks}</ul>${access}${explain}
      ${v.finished?`<p class="ll-done">Visit recorded.</p>${btn('yard','Back to the depot →',dis(),'ll-btn ll-primary')}`:btn('finish','Sign off the job',`${view.canFinish?'':'aria-describedby="ll-finish-note"'} ${dis()}`,'ll-btn ll-primary')+(view.canFinish?'':'<p id="ll-finish-note" class="ll-fine">Mags signs only when the checks above are met by your own work.</p>')}
      ${btn('restart','Start this visit over',dis(),'ll-btn ll-text')}`;
  }
  function guidePanel(){
    return `<header class="ll-panel-head"><h2>Cable &amp; connector guide</h2>${btn('close-panel','Close','aria-label="Close panel"','ll-btn ll-text')}</header><ul class="ll-guide">
      <li><i class="s-ethernet"></i><div><b>Ethernet patch cable (RJ45)</b><small>Square plug with a clip. Carries network traffic between devices and the switch.</small></div></li>
      <li><i class="s-power"></i><div><b>Power cord (IEC)</b><small>Supplies power only. A power light does not mean the network works.</small></div></li>
      <li><i class="s-hdmi"></i><div><b>HDMI</b><small>Picture to a screen. Not a network link.</small></div></li>
      <li><i class="s-usb"></i><div><b>USB</b><small>Keyboards, drives and other peripherals.</small></div></li>
      <li><i class="s-phone"></i><div><b>Phone cord (RJ11)</b><small>Narrower than RJ45. It cannot make a network link here.</small></div></li>
      <li><i class="t-test"></i><div><b>Service tester</b><small>Asks the service host for real and shows the route used. Tests go out of date after a change.</small></div></li>
      <li><i class="t-light"></i><div><b>Inspection light</b><small>Reads a device’s ports, power, address and mask.</small></div></li></ul>
      <p class="ll-fine">The game simulates power, Ethernet links, addresses, Wi-Fi association and access rules. It does not simulate crimping cables, electrical work or routing between networks.</p>`;
  }
  function panelHtml(){
    if(view.at==='yard')return panel==='guide'?guidePanel():yardPanel();
    if(!view.visit)return '';
    if(panel==='device')return devicePanel();
    if(panel==='tester')return testerPanel();
    if(panel==='card')return cardPanel();
    if(panel==='access')return accessPanel();
    if(panel==='guide')return guidePanel();
    return jobPanel();
  }

  // ---------- OVERLAYS ----------
  function overlay(){
    if(driving)return `<div class="ll-drive" role="status"><div class="ll-drive-art">${art?.renderDrive?art.renderDrive({progress:.5}):''}</div><p>Riding to Harbour Street Clinic with Mags…</p></div>`;
    if(ceremony)return `<div class="ll-modal-back"><div class="ll-modal ll-ceremony" role="dialog" aria-modal="true" aria-labelledby="ll-cer-title"><div class="ll-cer-art" aria-hidden="true">${art?.renderVan?art.renderVan({variant:'player',doors:'closed',shine:true}):''}</div><h2 id="ll-cer-title">Van 7 is yours</h2><p>Three supervised visits, completed with your own hands: a dark front desk brought online, a renumbered computer and a working tablet in both rooms, and a fault you diagnosed and explained yourself.</p><blockquote>“Keys. Don’t lose them. And call me if you’re stuck — that’s not weakness, that’s the job.” — Mags</blockquote><p class="ll-fine">Game progression only: not an IB grade, licence or mastery certificate.</p>${view.truckClaimed?btn('field','Take your first solo job →',dis(),'ll-btn ll-primary'):btn('claim','Take the keys',dis(),'ll-btn ll-primary')}${btn('close-ceremony','Not yet','','ll-btn ll-text')}</div></div>`;
    if(modal==='progress'){
      const s=view.storage||{};
      return `<div class="ll-modal-back"><div class="ll-modal" role="dialog" aria-modal="true" aria-labelledby="ll-prog-title"><h2 id="ll-prog-title">Progress &amp; evidence</h2><p><b>${esc(s.label||'')}</b> ${esc(s.detail||'')}</p><p>Your progress is kept in this browser only. Download a copy to move devices or hand work to your teacher.</p><div class="ll-modal-row">${btn('export','Download progress file','data-format="progress"')}${btn('export','Teacher evidence (text)','data-format="text"')}${btn('export','Teacher evidence (JSON)','data-format="json"')}</div><form class="ll-form" data-form="import"><h3>Load a progress file</h3><input type="file" name="file" accept="application/json,.json" ${dis()}><button class="ll-btn" ${dis()}>Load file</button><p class="ll-fine">A damaged or edited file is rejected and your current work stays unchanged.</p></form><details class="ll-details"><summary>Reset options</summary>${view.at==='site'?btn('restart','Start this visit over',dis(),'ll-btn ll-quiet'):''}${btn('clear','Erase all progress in this browser…',dis(),'ll-btn ll-danger')}</details>${btn('close-modal','Close','','ll-btn ll-text')}</div></div>`;
    }
    if(modal==='confirm-clear')return `<div class="ll-modal-back"><div class="ll-modal" role="alertdialog" aria-modal="true" aria-labelledby="ll-clr-title"><h2 id="ll-clr-title">Erase all progress?</h2><p>This removes the apprenticeship, practice bench and field job saved in this browser. Download a progress file first if you may need it. This cannot be undone.</p>${btn('clear-yes','Erase everything',dis(),'ll-btn ll-danger')}${btn('close-modal','Cancel','','ll-btn')}</div></div>`;
    return '';
  }

  // ---------- RENDER ----------
  function render(){
    if(closed)return;
    view=getView();
    if(view.at==='yard'&&!['guide'].includes(panel))panel=null;
    if(selected&&!selected.startsWith('slot:')&&!byId(selected)){selected=null;if(panel==='device')panel=null;}
    const keyEl=document.activeElement?.closest?.('[data-act],[name]');
    const focusKey=keyEl&&root.contains(keyEl)?focusSignature(keyEl):null;
    set('hud',hud());set('storage',storage());
    const sceneHtml=scene();const sceneEl=R('scene');if(sceneEl.dataset.sig!==String(sceneHtml.length)+view.revision){sceneEl.innerHTML=sceneHtml;sceneEl.dataset.sig=String(sceneHtml.length)+view.revision;}
    set('hotspots',hotspots());set('bubbles',bubbles());set('bag',bag());set('mentor',mentor());set('panel',panelHtml());set('overlay',overlay());
    root.querySelector('.ll-game').classList.toggle('is-yard',view.at==='yard');
    const line=mentorLine(view).text;if(line&&line!==lastLineKey){lastLineKey=line;R('live').textContent=`Mags: ${line}`;}
    if(focusKey){const again=[...root.querySelectorAll('[data-act],[name]')].find(el=>focusSignature(el)===focusKey);if(again&&document.activeElement!==again)again.focus({preventScroll:true});}
    const dialog=root.querySelector('[role=dialog],[role=alertdialog]');if(dialog&&!dialog.contains(document.activeElement))dialog.querySelector('button,input')?.focus();
  }
  function focusSignature(el){return [el.dataset.act,el.dataset.panel,el.dataset.item,el.dataset.device,el.dataset.socket,el.dataset.cable,el.dataset.topic,el.dataset.test,el.dataset.visit,el.getAttribute('name')].join('|');}
  function openPanel(name){panel=name;render();R('panel').focus({preventScroll:true});}

  // ---------- EVENTS ----------
  root.addEventListener('click',async e=>{
    const t=e.target.closest('[data-act]');if(!t||t.disabled||!root.contains(t))return;
    const d=t.dataset,a=d.act;
    if(a==='panel')return openPanel(d.panel);
    if(a==='close-panel'){panel=null;selected=null;return render();}
    if(a==='modal'){modal=d.modal;return render();}
    if(a==='close-modal'){modal=null;return render();}
    if(a==='select'){selected=d.device;return openPanel('device');}
    if(a==='slot'){selected=`slot:${d.role}`;return openPanel('device');}
    if(a==='pack')return act({type:'PACK_ITEM',itemId:d.item});
    if(a==='unpack')return act({type:'UNPACK_ITEM',itemId:d.item});
    if(a==='start'){
      const r=await act({type:'START_VISIT',visitId:d.visit});
      if(r?.accepted&&r.code==='VISIT_STARTED'&&!reduceMotion()){driving=true;render();setTimeout(()=>{driving=false;panel='job';render();},1700);}else if(r?.accepted){panel='job';render();}
      return;
    }
    if(a==='yard'){selected=null;panel=null;return act({type:'RETURN_TO_YARD'});}
    if(a==='hold')return act(view.held===d.cable?{type:'RELEASE_CABLE'}:{type:'HOLD_CABLE',cableType:d.cable});
    if(a==='release')return act({type:'RELEASE_CABLE'});
    if(a==='plug'){if(!view.held){status={tone:'error',text:'Pick a cable from the tool bag first.'};return render();}return act({type:'PLUG',deviceId:d.device,socketId:d.socket});}
    if(a==='inspect')return act({type:'INSPECT_DEVICE',deviceId:d.device});
    if(a==='power-off')return act({type:'NETWORK_ACTION',action:{type:'POWER_DEVICE',deviceId:d.device,on:false}});
    if(a==='unplug')return act({type:'NETWORK_ACTION',action:{type:'DISCONNECT_CABLE',cableId:d.cable}});
    if(a==='choose'){const r=await act({type:'NETWORK_ACTION',action:{type:'CHOOSE_DEVICE',roleId:d.role,kind:d.kind}});if(r?.accepted){selected=dev(d.role)?.id||null;panel='device';render();}return;}
    if(a==='join')return act({type:'NETWORK_ACTION',action:{type:'ASSOCIATE_WIFI',deviceId:d.device,apDeviceId:d.ap}});
    if(a==='move')return act({type:'NETWORK_ACTION',action:{type:'MOVE_NURSE',locationId:d.loc}});
    if(a==='test'){await act({type:'RUN_TEST',testId:d.test});return;}
    if(a==='ask')return act({type:'ASK_MENTOR',topic:d.topic});
    if(a==='policy'){const v=root.querySelector('input[name=policy]:checked')?.value;if(v)return act({type:'NETWORK_ACTION',action:{type:'SET_PERMISSIONS',policyId:v}});return;}
    if(a==='finish'){const r=await act({type:'FINISH_VISIT'});if(r?.accepted&&r.code==='APPRENTICESHIP_COMPLETE'){/* the depot shows the ceremony call */}return;}
    if(a==='restart'){modal=null;selected=null;draft=null;addrDraft={};return act({type:'RESTART_VISIT'});}
    if(a==='ceremony'){ceremony=true;return render();}
    if(a==='close-ceremony'){ceremony=false;return render();}
    if(a==='claim')return act({type:'CLAIM_TRUCK'});
    if(a==='field'){ceremony=false;return programme({type:'ENTER_FIELD'});}
    if(a==='bench')return programme({type:'OPEN_BOOTCAMP'});
    if(a==='export'){await onExport(d.format);return;}
    if(a==='clear'){modal='confirm-clear';return render();}
    if(a==='clear-yes'){modal=null;await onClear();return;}
    if(a==='take-control'){await onTakeControl();return;}
    if(a==='recover'){await onRecover();return;}
  });
  root.addEventListener('submit',async e=>{
    const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
    if(f.dataset.form==='address'){const id=f.dataset.device;addrDraft[id]={address:f.address.value.trim(),mask:f.mask.value.trim()};await act({type:'NETWORK_ACTION',action:{type:'SET_STATIC_ADDRESS',deviceId:id,address:addrDraft[id].address,mask:addrDraft[id].mask}});return;}
    if(f.dataset.form==='explain'){const text=f.text.value,oral=f.oral.checked;draft=text;await act({type:'SAVE_EXPLANATION',text,oral});return;}
    if(f.dataset.form==='import'){const file=f.file.files?.[0];modal=null;await onImport(file||null);return;}
  });
  root.addEventListener('input',e=>{
    const f=e.target.closest('form[data-form]');if(!f)return;
    if(f.dataset.form==='address'){addrDraft[f.dataset.device]={address:f.address.value,mask:f.mask.value};}
    if(f.dataset.form==='explain'&&e.target.name==='text')draft=e.target.value;
  });
  root.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(modal||ceremony){modal=null;ceremony=false;render();return;}
    if(panel&&view.at==='site'){panel=null;selected=null;render();}
    else if(view.held&&view.at==='site')act({type:'RELEASE_CABLE'});
  });
  // Clicking a device drawn in the SVG works like its hotspot button.
  root.addEventListener('click',e=>{
    const g=e.target.closest('.ll-scene [data-device-id],.ll-scene [data-item-id],.ll-scene [data-role-slot]');if(!g)return;
    if(g.dataset.itemId){const it=view.items.find(i=>i.id===g.dataset.itemId);if(it)act({type:it.packed?'UNPACK_ITEM':'PACK_ITEM',itemId:it.id});return;}
    if(g.dataset.deviceId&&byId(g.dataset.deviceId)){selected=g.dataset.deviceId;openPanel('device');return;}
    if(g.dataset.roleSlot&&view.roleOptions.some(o=>o.roleId===g.dataset.roleSlot)){selected=`slot:${g.dataset.roleSlot}`;openPanel('device');}
  });

  const ready=loadArt().then(()=>{if(!closed)render();});
  render();
  return {render,ready,destroy(){closed=true;root.replaceChildren();},showStatus(message,tone){if(tone==='error'){status={tone,text:message};render();}else R('live').textContent=message;}};
}
