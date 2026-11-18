/** Lantern Line Training Centre — pure, deterministic code-native SVG. */
import {
  PAL, STATE_STYLE, arr, obj, esc, r1, shade, dimSvg, makeIso,
  softShadow, svgRoot, baseDefs, setUid, uid, screenArt, lantern
} from './art-props.js';
import { figMags, figPlayer } from './art-people.js';

const O = [650, 100], U = 68;
const I = makeIso(O[0], O[1], U);
const STATION_IDS = ['station.cables', 'station.addressing', 'station.parts', 'station.devices', 'station.speed', 'station.security'];
const ST = {
  'station.cables': { x: 1.6, y: 2.1, px: 2.45, py: 4.05, mx: 3.25, my: .55, mz: 2.15, bx: 1.25, by: 4.65, bw: 2.45 },
  'station.addressing': { x: 5.7, y: 1.8, px: 7.05, py: 3.55, mx: 7.4, my: 2.7, mz: 2.55, bx: 5.55, by: 4.25, bw: 3.1 },
  'station.parts': { x: 10.7, y: 1.7, px: 11.85, py: 3.55, mx: 12.05, my: 2.75, mz: 2.45, bx: 10.55, by: 4.25, bw: 2.65 },
  'station.devices': { x: 1.2, y: 7.0, px: 2.55, py: 8.0, mx: 2.55, my: 7.35, mz: 2.85, bx: 1.25, by: 8.45, bw: 2.45 },
  'station.speed': { x: 6.3, y: 7.0, px: 7.3, py: 8.15, mx: 7.35, my: 7.5, mz: 2.25, bx: 6.25, by: 8.65, bw: 2.15 },
  'station.security': { x: 11.0, y: 7.0, px: 12.0, py: 8.15, mx: 12.0, my: 7.45, mz: 2.35, bx: 10.95, by: 8.55, bw: 2.25 }
};
const DEV = {
  'role.reception': [5.75, 3.42, 1.15],
  'infra.switch': [7.25, 3.5, 1.05],
  'role.records': [8.55, 3.25, 1.0]
};
const DEVICE_BENCH = {
  'role.reception': [2.05, 8.72, 1.03],
  'infra.switch': [3.75, 8.72, 1.03],
  'role.records': [5.35, 8.62, 1.03]
};
const BINS = [[1.35, 4.1], [1.9, 4.1], [2.45, 4.1], [3.0, 4.1], [3.55, 4.1]];
const WALL = { ethernet: 1.25, power: 1.85, hdmi: 2.45, usb: 3.05, phone: 3.65 };
const pslot = (x, y, z = 0) => { const p = I.P(x, y, z); return Object.freeze({ x: r1(p[0]), y: r1(p[1]) }); };

export const TRAINING_SLOTS = Object.freeze({
  ...Object.fromEntries(STATION_IDS.map((id) => [id, pslot(ST[id].px, ST[id].py, 0.05)])),
  'role.reception': pslot(...DEV['role.reception']),
  'infra.switch': pslot(...DEV['infra.switch']),
  'role.records': pslot(...DEV['role.records']),
  ...Object.fromEntries(BINS.map((v, i) => [`bin.${i}`, pslot(v[0], v[1], 0.55)])),
  ...Object.fromEntries(Object.entries(WALL).map(([k, x]) => [`wall.${k}`, pslot(x, 0.012, .58)]))
});

/** Centre of a device position for HTML controls. Unknown stations use the legacy rack. */
export function benchSlot(stationId, roleId) {
  const role = ['role.reception', 'infra.switch', 'role.records'].includes(roleId) ? roleId : 'role.reception';
  if (stationId !== 'station.devices') return TRAINING_SLOTS[role];
  return pslot(...DEVICE_BENCH[role]);
}

const B = (x, y, z, w, d, h, c, o = {}) => I.box(x, y, z, w, d, h, { color: c, stroke: shade(c, -0.28), sw: 0.65, ...o });
const sh = (x, y, rx, ry, op = .55) => { const p = I.P(x, y, 0); return softShadow(p[0], p[1], rx * U, ry * U / 2, op); };
const place = (x, y, inner, k = 1.2) => { const p = I.P(x, y, 0); return `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(${k})">${inner}</g>`; };
const wallY = (x, z, w, h, inner) => `<g transform="${I.faceY(x, .012, z)}"><g transform="scale(${w} ${h})">${inner}</g></g>`;
const rope = (x, y, w = 2.4) => B(x, y, 0, .09, .09, .75, '#5d666e') + B(x + w, y, 0, .09, .09, .75, '#5d666e') + I.line([[x + .04, y, .65], [x + w * .35, y, .42], [x + w * .7, y, .42], [x + w + .04, y, .65]], PAL.rust, 5);
const rosette = (x, y, z = 2.65) => { const p = I.P(x, y, z); return `<g transform="translate(${r1(p[0])} ${r1(p[1])})"><path d="M-8,8 L-13,29 L0,21 L13,29 L8,8Z" fill="${shade(PAL.okG, -.12)}" stroke="#f4ead4" stroke-width="2"/><circle r="17" fill="${PAL.okG}" stroke="#f4ead4" stroke-width="4"/><path d="M-8,0 l5,6 12,-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`; };
const floorCue = (id, state, focus) => { const a = TRAINING_SLOTS[id]; let s = '';
  if (state === 'open') s += `<ellipse cx="${a.x}" cy="${a.y + 15}" rx="112" ry="50" fill="#ffd88a" opacity=".2"/>`;
  if (focus) s += `<g class="ap-pulse" aria-hidden="true" style="transform-origin:${a.x}px ${a.y}px"><ellipse cx="${a.x}" cy="${a.y}" rx="112" ry="53" fill="none" stroke="#ffd23f" stroke-width="5"/><ellipse cx="${a.x}" cy="${a.y}" rx="126" ry="61" fill="none" stroke="#fff6c8" stroke-width="2" stroke-dasharray="8 7"/></g>`;
  return s;
};

function cableShape(type, x, y, inBin = false) {
  const colors = { ethernet: '#397fb4', power: '#343a40', hdmi: '#6b4d89', usb: PAL.orange, phone: '#e8c34a' };
  const c = colors[type] || PAL.steel, p = I.P(x, inBin ? 4.05 : .03, inBin ? .62 : 2.18);
  let d = '', ends = '';
  if (type === 'power') { d = 'M-18,-24 C20,-40 25,8 -2,19 C-26,29 -28,-7 -8,-10'; ends = '<path d="M-20,-27 v-8 m6,8 v-8" stroke="#343a40" stroke-width="3"/><rect x="-24" y="-29" width="13" height="8" rx="2" fill="#343a40"/>';
  } else if (type === 'hdmi') { d = 'M-22,15 C-25,-22 26,-27 23,12'; ends = '<path d="M-29,12 h13 l-2,9 h-9Z M16,10 h14 l-3,10 h-9Z" fill="#43334f"/>';
  } else if (type === 'usb') { d = 'M-21,16 C-21,-28 25,-28 23,14'; ends = '<rect x="-28" y="11" width="13" height="9" rx="2" fill="#d9dce0"/><rect x="17" y="10" width="12" height="10" rx="4" fill="#d9dce0"/>';
  } else if (type === 'phone') { d = 'M-23,13 c4,-45 43,-43 47,0'; ends = '<path d="M-29,9 h12 v11 h-10Z M18,9 h12 l-2,11 H18Z" fill="#e5d27a" stroke="#594f2a" stroke-width="1.5"/>';
  } else { d = 'M-23,14 C-25,-28 25,-28 23,14'; ends = '<path d="M-30,9 h13 v12 h-11Z M17,9 h13 l-2,12 H17Z" fill="#b9d8e8" stroke="#235c78" stroke-width="1.5"/><path d="M-26,11 v5 m4,-5 v5 M21,11 v5 m4,-5 v5" stroke="#e8c34a"/>'; }
  const glyph = `<path d="${d}" fill="none" stroke="#f4ead4" stroke-width="8" opacity=".65"/><path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>${ends}`;
  if (!inBin) return `<g transform="${I.faceY(x, .012, 1.35)}"><g transform="scale(.018) translate(0 42)">${glyph}</g></g>`;
  return `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(.7)">${glyph}</g>`;
}

function cableWall(sorted) {
  const sort = obj(sorted), types = Object.keys(WALL);
  let s = wallY(.75, 1.35, 3.5, 1.7, `<rect width="1" height="1" rx=".02" fill="#c9a777" stroke="#8a6e48" stroke-width=".018"/>${Array.from({length: 60}, (_, i) => `<circle cx="${.05 + (i % 12) * .082}" cy="${.08 + Math.floor(i / 12) * .2}" r=".009" fill="#806841"/>`).join('')}`);
  for (let i = 0; i < 5; i++) s += B(BINS[i][0] - .22, BINS[i][1] - .24, .1, .44, .5, .38, ['#3f6f8f','#626a70','#765e84','#c96a35','#c9a63d'][i]);
  for (const [i, type] of types.entries()) {
    const raw = Number(sort[type]), valid = Number.isInteger(raw) && raw >= 0 && raw < 5;
    const x = valid ? BINS[raw][0] : WALL[type];
    s += `<g class="ap-wallcable" data-cable-type="${type}">${cableShape(type, x, 0, valid)}</g>`;
    if (!valid) s += `<g transform="${I.faceY(WALL[type] - .08, .014, 1.35)}"><path d="M0,.12 q.08,.11 .16,0" fill="none" stroke="#5d666e" stroke-width=".045"/></g>`;
  }
  return s;
}

function led(p, on, c = '#4fd17f') { return `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="4" fill="${on ? c : '#394047'}" stroke="#f4ead4" stroke-width="1"/>`; }
function device(d, role, index, positions = DEV, wrap = true) {
  const pos = positions[role] || [6 + index, 3.4, 1], powered = !!d.powered, selected = !!d.selected;
  const [x,y,z] = pos, kind = ['desktop','laptop','tablet','server','switch4','switch8'].includes(d.kind) ? d.kind : (role==='infra.switch'?'switch4':role==='role.records'?'server':'desktop'); let a = '';
  if (kind === 'desktop') {
    a += B(x-.47,y-.3,z-.08,.32,.42,.62,'#4b5660') + B(x-.04,y-.24,z+.12,.12,.12,.28,'#59646c') + B(x-.3,y-.13,z+.02,.72,.48,.04,'#d9dcdc') + B(x-.12,y-.27,z+.35,.7,.12,.52,'#303941');
    const p=I.P(x+.24,y-.14,z+.62); a += `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(.33)">${screenArt(powered ? 'ok' : 'off')}</g>` + led(I.P(x-.2,y+.13,z+.34),powered);
  } else if (kind === 'laptop') {
    a += B(x-.48,y-.3,z-.05,.92,.62,.055,'#9aa6ae') + I.poly([[x-.45,y-.27,z+.01],[x+.4,y-.27,z+.01],[x+.4,y-.25,z+.62],[x-.45,y-.25,z+.62]],'#303941',' stroke="#17202b" stroke-width="1"');
    const p=I.P(x,y-.24,z+.34); a += `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(.27)">${screenArt(powered?'ok':'off')}</g>`;
  } else if (kind === 'tablet') {
    a += B(x-.1,y-.03,z-.05,.2,.18,.38,'#68747c') + I.poly([[x-.43,y-.18,z+.23],[x+.38,y-.18,z+.23],[x+.38,y-.15,z+.76],[x-.43,y-.15,z+.76]],'#252d33',' stroke="#9aa6ae" stroke-width="2"');
    const p=I.P(x,y-.14,z+.49); a += `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(.25)">${screenArt(powered?'ok':'off')}</g>`;
  } else if (kind === 'server') {
    a += B(x-.46,y-.29,z-.05,.92,.55,.4,'#59646c'); for(let j=0;j<2;j++) a += B(x-.39,y+.25,z+.01+j*.16,.7,.025,.11,'#242c32') + led(I.P(x+.35,y+.28,z+.07+j*.16),powered);
  } else {
    const ports = kind === 'switch8' ? 8 : 4; a += B(x-.52,y-.28,z-.05,1.05,.48,.28,'#3e5961');
    for(let j=0;j<ports;j++){ const p=I.P(x-.38+j*(.76/Math.max(ports-1,1)),y+.22,z+.05); a += `<rect x="${r1(p[0]-3)}" y="${r1(p[1]-2)}" width="6" height="4" fill="#17252b"/>`; }
    a += led(I.P(x+.4,y+.24,z+.17), powered);
  }
  if (selected) { const p=I.P(x,y,z); a += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="48" ry="27" fill="none" stroke="#ffd23f" stroke-width="5"/>`; }
  return wrap ? `<g class="ap-device" data-device-id="${esc(d.id)}" data-role-id="${esc(role)}" data-powered="${powered ? 'true':'false'}"${selected?' data-selected="true"':''}>${a}</g>` : a;
}
function slotFoot(role, positions) { const [x,y,z]=positions[role]; const w=role==='infra.switch'?1.1:.9, d=.58; return I.poly([[x-w/2,y-d/2,z-.04],[x+w/2,y-d/2,z-.04],[x+w/2,y+d/2,z-.04],[x-w/2,y+d/2,z-.04]],'none',' stroke="#1f2a33" stroke-width="2" stroke-dasharray="7 5" opacity=".7"'); }
function benchContents(bench, positions) {
  const devices=arr(obj(bench).devices), roles=new Set(); let s='';
  devices.forEach((raw,i)=>{const d=obj(raw), role=['role.reception','infra.switch','role.records'].includes(d.roleId)?d.roleId:''; if(role&&!roles.has(role)){roles.add(role);s+=device(d,role,i,positions);}});
  for(const rawRole of arr(obj(bench).emptySlots)){const role=String(rawRole);if((role==='role.reception'||role==='role.records')&&!roles.has(role))s+=`<g class="ap-slot" data-role-id="${role}">${slotFoot(role,positions)}</g>`;}
  const byId=Object.fromEntries(devices.map(d=>[String(obj(d).id),obj(d)]));
  for(const raw of arr(obj(bench).cables)){const c=obj(raw),a=byId[String(c.fromDeviceId)],b=byId[String(c.toDeviceId)];if(!a||!b)continue;const pa=positions[a.roleId],pb=positions[b.roleId];if(!pa||!pb)continue;const A=I.P(pa[0],pa[1],pa[2]+.1),D=I.P(pb[0],pb[1],pb[2]+.1),st=STATE_STYLE[c.state]||STATE_STYLE.installed,mx=r1((A[0]+D[0])/2),my=r1(Math.max(A[1],D[1])+28);s+=`<g class="ap-cable" data-cable-id="${esc(c.id)}" data-state="${esc(c.state||'installed')}"><path d="M${r1(A[0])},${r1(A[1])} Q${mx},${my} ${r1(D[0])},${r1(D[1])}" fill="none" stroke="#fff" stroke-width="9" opacity=".6"/><path d="M${r1(A[0])},${r1(A[1])} Q${mx},${my} ${r1(D[0])},${r1(D[1])}" fill="none" stroke="${st.c}" stroke-width="5" stroke-linecap="${st.cap}"${st.dash?` stroke-dasharray="${st.dash}"`:''}/>${badge(mx,my-5,c.state)}</g>`;}
  return s;
}
function networkRack(bench) {
  let s = sh(7.15,3.45,1.45,.65) + B(5.45,3.05,0,.1,.1,1,'#5d666e') + B(8.75,3.05,0,.1,.1,1,'#5d666e') + B(5.4,3,1,3.5,1.05,.09,PAL.wood,{top:'#d8ad72'});
  s += wallY(5.5,1.55,3.2,1.25,'<rect width="1" height="1" rx=".02" fill="#f6f2e8" stroke="#8d979e" stroke-width=".02"/><path d="M.12,.25 Q.3,.1 .48,.28 T.84,.22 M.14,.48 H.42 M.55,.5 H.86 M.22,.72 Q.48,.58 .76,.75" fill="none" stroke="#77a3aa" stroke-width=".025"/>');
  if (bench) s+=benchContents(bench,DEV); else {
    s += device({id:'default.pc',powered:false},'role.reception',0)+device({id:'default.switch',kind:'switch4',powered:false},'infra.switch',1)+device({id:'default.server',powered:false},'role.records',2);
  }
  return s;
}
function badge(x,y,state){ const ok=state==='tested-ok', fail=state==='tested-fail', stale=state==='stale'; if(!ok&&!fail&&!stale)return ''; const c=ok?PAL.okG:fail?PAL.failR:PAL.staleA; const mark=ok?'M-6,0 l4,5 9,-11':fail?'M-5,-5 l10,10 M5,-5 l-10,10':'M0,-7 V1 M0,6 v1'; return `<g transform="translate(${r1(x)} ${r1(y)})"><circle r="12" fill="#fff" stroke="${c}" stroke-width="3"/><path d="${mark}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`; }

const PARTS=['part.keyboard','part.cpu','part.ram','part.ssd','part.screen','part.psu'];
function partGlyph(id,x,y,z){let s='';if(id==='part.keyboard'){s+=B(x-.3,y-.18,z,.6,.36,.06,'#d9dcdc');for(let i=0;i<5;i++)s+=I.line([[x-.23+i*.11,y+.17,z+.065],[x-.23+i*.11,y-.12,z+.065]],'#68747c',.55);}else if(id==='part.cpu'){s+=B(x-.19,y-.19,z,.38,.38,.06,'#3c8b55')+B(x-.1,y-.1,z+.06,.2,.2,.035,'#c8b777');}else if(id==='part.ram'){s+=B(x-.34,y-.1,z,.68,.2,.07,'#3c8b55');for(let i=0;i<5;i++)s+=B(x-.27+i*.12,y-.07,z+.07,.07,.14,.035,'#243239');}else if(id==='part.ssd'){s+=B(x-.28,y-.17,z,.56,.34,.09,'#68747c')+B(x-.12,y-.14,z+.09,.24,.2,.025,'#f4ead4');}else if(id==='part.screen'){s+=B(x-.28,y-.08,z,.56,.08,.4,'#303941')+B(x-.05,y-.02,z,.1,.13,.15,'#68747c');}else{s+=B(x-.29,y-.2,z,.58,.4,.36,'#4b5660');const p=I.P(x+.29,y+.18,z+.18);s+=`<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="10" fill="none" stroke="#9aa6ae" stroke-width="2"/><path d="M${r1(p[0]-7)},${r1(p[1]-7)} l14,14 M${r1(p[0]+7)},${r1(p[1]-7)} l-14,14" stroke="#9aa6ae"/>`; }return s;}
function compartmentCue(i,x,y,z){const marks=[`M-13,4 h26 M-10,-3 h20`,`M-10,-10 h20 v20 h-20Z`,`M-14,0 h28 M-10,-7 v14 M0,-7 v14 M10,-7 v14`,`M-13,-8 h26 v16 h-26Z`,`M-12,-9 h24 v15 h-24Z M-4,9 h8`,`M0,-11 a11,11 0 1,0 .1,0 M-8,-8 l16,16 M8,-8 l-16,16`][i];const p=I.P(x,y,z);return `<path d="${marks}" transform="translate(${r1(p[0])} ${r1(p[1])}) scale(.62)" fill="none" stroke="#66553f" stroke-width="2.2" opacity=".78"/>`;}
function parts(scene){const sorted=obj(obj(scene).sorted);let s=sh(11.75,3.6,1.85,.7)+B(9.55,3.03,0,.1,.1,.92,'#5d666e')+B(13.75,3.03,0,.1,.1,.92,'#5d666e')+B(9.4,2.98,.92,4.55,1.18,.1,PAL.wood,{top:'#d8ad72'});
  // Three deliberately separate work zones: open case, loose-parts tray, sorting board.
  s+=B(9.65,3.12,1.02,1.05,.78,.6,'#626d73')+I.poly([[9.7,3.16,1.63],[10.63,3.16,1.63],[10.63,3.82,1.63],[9.7,3.82,1.63]],'#243239')+I.line([[9.75,3.21,1.65],[10.55,3.21,1.65]],'#9aa6ae',2);
  s+=B(10.85,3.1,1.03,1.12,.82,.07,'#d5b780');
  s+=B(12.05,3.05,1.03,1.82,1.02,.07,'#ead8ad');
  for(let i=0;i<PARTS.length;i++){const col=i%2,row=Math.floor(i/2),x0=12.08+col*.88,y0=3.07+row*.32,cx=x0+.41,cy=y0+.14;s+=I.poly([[x0,y0,1.105],[x0+.82,y0,1.105],[x0+.82,y0+.28,1.105],[x0,y0+.28,1.105]],'none',' stroke="#8f7654" stroke-width="1.25" opacity=".82"')+compartmentCue(i,cx,cy,1.11);}
  PARTS.forEach((id,i)=>{const isSorted=sorted[id]===true,col=i%2,row=Math.floor(i/2),x=isSorted?12.49+col*.88:11.05+(i%2)*.55,y=isSorted?3.21+row*.32:3.28+Math.floor(i/2)*.25,z=1.13+(isSorted?0:i*.008);s+=`<g class="ap-part" data-part-id="${id}" data-state="${isSorted?'sorted':'loose'}">${partGlyph(id,x,y,z)}</g>`;});return s;}
const LOCKER_KINDS=['desktop','laptop','tablet','server','wearable'];
function matchTag(x,y,z){const p=I.P(x,y,z);return `<g transform="translate(${r1(p[0])} ${r1(p[1])})"><path d="M-8,-8 h16 l5,8 -5,8 h-16Z" fill="#f4ead4" stroke="#2f8f5b" stroke-width="2"/><path d="M-4,0 l3,3 6,-7" fill="none" stroke="#2f8f5b" stroke-width="2.5"/></g>`;}
function devicesShelf(locker, showBench=false, bench=null){const matched=obj(obj(locker).matched);let s=sh(2.5,8.1,1.25,.55);for(const x of [1.1,3.9])s+=B(x,7.05,0,.09,.09,2.65,'#5d666e');for(const z of [.45,1.25,2.15])s+=B(1.05,7,z,3,.8,.07,'#7d878f');const positions=[[1.35,7.32,.52],[2.02,7.28,.52],[2.68,7.27,.52],[3.35,7.25,.52],[1.65,7.3,1.34]];
  LOCKER_KINDS.forEach((kind,i)=>{const [x,y,z]=positions[i];let a='';if(kind==='wearable'){a+=B(x-.06,y-.05,z,.12,.1,.45,'#343a40')+B(x-.15,y-.08,z+.14,.3,.14,.18,'#2c343b');const p=I.P(x,y+.02,z+.23);a+=`<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="5" fill="#9fc6d6"/>`;}else a+=device({id:'',kind,powered:false},'role.reception',i,{'role.reception':[x,y,z]},false);a+=matched[kind]===true?matchTag(x+.3,y+.2,z+.45):'';s+=`<g class="ap-lockeritem" data-kind="${kind}" data-state="${matched[kind]===true?'matched':'unmatched'}">${a}</g>`;});
  if(showBench){s+=sh(3.7,8.92,1.9,.5)+B(1.25,8.38,0,.1,.1,.92,'#5d666e')+B(5.95,8.38,0,.1,.1,.92,'#5d666e')+B(1.1,8.32,.92,5.05,1.02,.11,PAL.wood,{top:'#d8ad72'})+benchContents(obj(bench),DEVICE_BENCH);}return s;}
function speed(){ let s=sh(7.35,8.3,1,.48)+B(6.35,7.8,0,.09,.09,.82,'#5d666e')+B(8.3,7.8,0,.09,.09,.82,'#5d666e')+B(6.2,7.65,.82,2.35,.9,.09,PAL.wood,{top:'#d8ad72'})+B(6.75,7.9,.93,1.1,.52,.22,'#e9ecec'); for(let i=0;i<3;i++)s+=`<path d="${curve(I.P(7.2,8.1,1.15),I.P(6.5+i*.4,8.35,.93),18+i*4)}" fill="none" stroke="${['#397fb4',PAL.orange,'#343a40'][i]}" stroke-width="4"/>`; s+=wallY(6.8,1.65,1.4,1.1,'<rect width="1" height="1" rx=".5" fill="#f4ead4" stroke="#5d666e" stroke-width=".04"/><path d="M.18,.72 A.34,.34 0 0 1 .82,.72" fill="none" stroke="#9aa6ae" stroke-width=".06"/><path d="M.5,.72 L.72,.32" stroke="#e07a3a" stroke-width=".06"/><circle cx=".5" cy=".72" r=".06" fill="#2c343b"/>'); return s; }
const curve=(a,b,d)=>`M${r1(a[0])},${r1(a[1])} Q${r1((a[0]+b[0])/2)},${r1(Math.max(a[1],b[1])+d)} ${r1(b[0])},${r1(b[1])}`;
function security(){ let s=sh(12,8.2,1,.5)+B(11,7.7,0,.09,.09,.82,'#5d666e')+B(13,7.7,0,.09,.09,.82,'#5d666e')+B(10.85,7.55,.82,2.4,.9,.09,PAL.wood,{top:'#d8ad72'})+B(11.65,7.75,.93,.8,.14,.62,'#3b454d'); const p=I.P(12.05,7.9,1.3); s+=`<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(.38)">${screenArt('login')}</g>`; s+=wallY(11.4,1.55,1.4,1.25,'<rect width="1" height="1" rx=".03" fill="#17675f" stroke="#f4ead4" stroke-width=".035"/><path d="M.5,.18 C.76,.28 .82,.3 .78,.58 C.75,.78 .61,.88 .5,.93 C.39,.88 .25,.78 .22,.58 C.18,.3 .24,.28 .5,.18Z" fill="#f4ead4"/><rect x=".4" y=".52" width=".2" height=".2" rx=".03" fill="#e07a3a"/><path d="M.43,.52 v-.09 a.07,.07 0 0 1 .14,0 v.09" fill="none" stroke="#e07a3a" stroke-width=".035"/>'); return s; }

function benchStation(scene){return obj(scene.bench).stationId==='station.devices'?'station.devices':'station.addressing';}
function stationArt(id, scene) {const target=scene.bench==null?'':benchStation(scene);if(id==='station.cables')return cableWall(obj(obj(scene.cableWall).sorted));if(id==='station.addressing')return networkRack(target==='station.addressing'?obj(scene.bench):null);if(id==='station.parts')return parts(scene.partsBench);if(id==='station.devices')return devicesShelf(scene.locker,target==='station.devices',scene.bench);if(id==='station.speed')return speed();return security();}

export function renderTraining(input) {
  const scene=obj(input); setUid('training', scene);
  const supplied=new Map(); for(const raw of arr(scene.stations)){const x=obj(raw); if(STATION_IDS.includes(x.id)&&!supplied.has(x.id)) supplied.set(x.id,['open','done','locked'].includes(x.state)?x.state:'locked');}
  let body=`<defs>${baseDefs()}<linearGradient id="${uid('day')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dff3fb"/><stop offset="1" stop-color="#f7dfaf"/></linearGradient><linearGradient id="${uid('floor')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eadfc8"/><stop offset="1" stop-color="#cdbb99"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#${uid('day')})"/>`;
  body+=I.box(-.3,-.3,-.22,14.6,9.9,.22,{color:'#b8ad98'})+I.poly([[0,0,0],[14,0,0],[14,9.3,0],[0,9.3,0]],`url(#${uid('floor')})`);
  for(let x=0;x<=14;x+=1)body+=I.line([[x,0,.003],[x,9.3,.003]],'#b9a98c',.55,' opacity=".42"');
  for(let y=0;y<=9;y+=1)body+=I.line([[0,y,.003],[14,y,.003]],'#b9a98c',.55,' opacity=".42"');
  body+=B(-.25,-.25,0,.25,9.8,3.8,'#e7ddc8',{top:'#51616a'})+B(0,-.25,0,14.25,.25,3.8,'#efe5d2',{top:'#51616a'});
  for(const x of [4.2,9.8]) body+=wallY(x,2.35,3,1.05,'<rect width="1" height="1" fill="#f7f2e6" stroke="#9aa6ae" stroke-width=".025"/><rect x=".04" y=".04" width=".92" height=".92" fill="#bfe0ea"/><path d="M.5,.04 V.96 M.04,.52 H.96" stroke="#f7f2e6" stroke-width=".035"/><path d="M.08,.1 L.38,.1 L.12,.46Z" fill="#fff" opacity=".55"/>');
  body+=wallY(13.75,2.75,1.05,.62,`<rect width="1" height="1" rx=".05" fill="${PAL.teal}"/><g transform="translate(.5 .5) scale(.0026)">${lantern(PAL.cream,PAL.teal,PAL.orange)}</g>`);
  for(const id of STATION_IDS) body+=floorCue(id,supplied.get(id)||'locked',scene.focus===id);
  for(const id of STATION_IDS){const state=supplied.get(id)||'locked', q=ST[id]; let art=stationArt(id,scene); if(state==='locked')art=dimSvg(art)+rope(q.bx,q.by,q.bw); if(state==='done')art+=rosette(q.mx,q.my,q.mz); body+=`<g class="ap-station" data-station-id="${id}" data-state="${state}">${art}</g>`;}
  const mentor=obj(scene.mentor), player=obj(scene.player), target=scene.bench==null?'':benchStation(scene); if(ST[mentor.stationId]){const q=ST[mentor.stationId], rack=mentor.stationId==='station.addressing'&&target==='station.addressing', locker=mentor.stationId==='station.devices'&&target==='station.devices'; const pose=['idle','pointing','thumbs','thinking'].includes(mentor.pose)?mentor.pose:'idle'; body+=`<g class="ap-person" data-person="mentor">${place(rack?4.85:locker?6.45:q.px-.8,rack?4.75:locker?8.0:q.py+1.2,figMags(pose),1.38)}</g>`;} if(ST[player.stationId]){const q=ST[player.stationId],locker=player.stationId==='station.devices'&&target==='station.devices'; body+=`<g class="ap-person" data-person="player">${place(locker ? .75 : q.px+.8,locker?8.05:q.py+1.1,figPlayer(),1.32)}</g>`;}
  body+=B(0,9.35,0,14,.2,.58,'#d9b48c',{top:'#655d51'})+B(13.85,0,0,.2,9.5,.58,'#d9b48c',{top:'#655d51'})+`<rect width="1600" height="1000" fill="#ffcf8a" opacity=".035" pointer-events="none"/>`;
  return svgRoot(1600,1000,'Lantern Line Training Centre',body,'ap-training');
}
