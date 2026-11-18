/**
 * Opening Shift — people: in-scene figures (screen space, feet at 0,0, ~80 units tall)
 * and 160x160 bust portraits. Original characters for Lantern Line.
 */
import { PAL, uid, setUid, svgRoot, esc, lantern, shade } from './art-props.js';

const SK = { mags: '#8a5a3c', player: '#c99470', theo: '#e3b48f', ana: '#b97f57', ruiz: '#d39f78' };
const arm = (pts, col, w = 6.5) => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand = (x, y, skin, r = 3.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${skin}"/>`;
const shadowE = (rx = 15) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${rx * 0.38}" fill="#0d1a22" opacity=".2"/>`;

function legs(trousers, shoes, spread = 0) {
  return `<path d="M-8,-36 L${-8 - spread},-3 h7 L0,-36Z" fill="${trousers}"/><path d="M0,-36 L${1 + spread},-2 h7 L8,-36Z" fill="${shade(trousers, -0.15)}"/>` +
    `<ellipse cx="${-5 - spread}" cy="-1.5" rx="5.5" ry="2.8" fill="${shoes}"/><ellipse cx="${5 + spread}" cy="-1" rx="5.5" ry="2.8" fill="${shoes}"/>`;
}
const torsoD = 'M-12,-58 Q-12,-63 -7,-63 H7 Q12,-63 12,-58 L10,-33 Q0,-31 -10,-33Z';

/* ---- Mags (front three-quarter) ---- */
export function figMags(pose = 'idle') {
  const j = '#d0612e', jd = '#a9481f', st = '#1fa39a', sk = SK.mags, hair = '#d7dbde';
  let armsBack = '', armsFront = '', extra = '';
  const sleeve = (pts) => arm(pts, j, 6.8) + arm([pts[pts.length - 2], pts[pts.length - 1]].map((p, i) => (i ? p : p)), j, 6.8);
  if (pose === 'pointing') {
    armsBack = sleeve([[-11, -58], [-14, -44], [-13, -35]]) + hand(-13, -34, sk);
    armsFront = sleeve([[11, -58], [22, -60], [31, -64]]) + hand(33, -65, sk) + `<path d="M34,-66 L40,-69" stroke="${sk}" stroke-width="2.6" stroke-linecap="round"/>`;
  } else if (pose === 'thumbs') {
    armsBack = sleeve([[-11, -58], [-14, -44], [-13, -35]]) + hand(-13, -34, sk);
    armsFront = sleeve([[11, -58], [18, -45], [17, -56]]) + hand(17, -58, sk, 3.6) + `<path d="M17,-61 V-67" stroke="${sk}" stroke-width="3" stroke-linecap="round"/>`;
  } else if (pose === 'thinking') {
    armsBack = sleeve([[11, -58], [13, -45], [2, -42]]) + hand(1, -42, sk);
    armsFront = sleeve([[-11, -58], [-12, -44], [-4, -62]]) + hand(-3, -63, sk);
  } else {
    armsBack = sleeve([[-11, -58], [-14, -45], [-14, -36]]) + hand(-14, -35, sk);
    armsFront = sleeve([[11, -58], [14, -45], [14, -38]]) + `<rect x="10.5" y="-46" width="7" height="15" rx="2" fill="url(#${uid('steel')})" stroke="#5f6a72" stroke-width=".6"/><rect x="10.5" y="-48" width="7" height="3" rx="1" fill="#2c343b"/>` + hand(14, -37, sk);
  }
  // body
  let b = shadowE(16) + legs('#33393f', '#2a2420', 1.5);
  b += armsBack;
  b += `<path d="${torsoD}" fill="${j}"/><path d="M10,-60 L12,-58 L10,-33 Q4,-32 2,-32Z" fill="${jd}" opacity=".6"/>`;
  b += `<path d="M-11.5,-50 H11.5 V-46.5 H-11.5Z" fill="${st}"/><path d="M-11,-48.8 H11" stroke="#e6eef0" stroke-width=".8"/>`;
  b += `<path d="M-11,-41 H11 V-37.5 H-11Z" fill="${st}"/><path d="M-10.8,-39.3 H10.8" stroke="#e6eef0" stroke-width=".8"/>`;
  b += `<path d="M-3,-63 L0,-56 L3,-63Z" fill="#3b3f44"/><path d="M-10,-35 H10 V-31 H-10Z" fill="#6b4a2b"/><rect x="-11" y="-34" width="6" height="7" rx="1" fill="#8a6239"/><rect x="5" y="-34" width="5" height="8" rx="1" fill="#8a6239"/><rect x="6.5" y="-38" width="1.6" height="5" fill="#c8323a"/><rect x="-1.5" y="-35" width="3" height="4" fill="#c9a24a"/>`;
  b += armsFront.includes('steel') ? '' : '';
  // head
  b += `<rect x="-3" y="-67" width="6" height="6" fill="${shade(sk, -0.15)}"/><ellipse cx="0" cy="-74" rx="8.4" ry="9.4" fill="${sk}"/><ellipse cx="7.8" cy="-73" rx="1.8" ry="2.6" fill="${shade(sk, -0.1)}"/>`;
  b += `<g fill="${hair}">` + [[-7, -80, 4.2], [-3, -84, 4.4], [2, -84.5, 4.3], [6.5, -81, 4], [8.6, -77, 2.8], [-8.6, -76, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + `</g><path d="M-6,-83 q3,-2 6,0 M1,-85 q3,-2 5,1" stroke="#aab1b6" stroke-width=".9" fill="none"/>`;
  b += `<circle cx="-3.5" cy="-84.5" r="2.6" fill="#fff5c0" fill-opacity=".5" stroke="${PAL.yellow}" stroke-width="1.3"/><circle cx="2.5" cy="-85" r="2.6" fill="#fff5c0" fill-opacity=".5" stroke="${PAL.yellow}" stroke-width="1.3"/>`;
  b += pose === 'thinking' ? `<path d="M-5.6,-76.6 l2.4,-.6 M0.4,-77.2 l2.6,.4" stroke="#2a1d16" stroke-width=".9"/>` : '';
  b += `<circle cx="-4.4" cy="-73.5" r="1.05" fill="#24170f"/><circle cx="1.6" cy="-73.5" r="1.05" fill="#24170f"/>`;
  b += pose === 'thinking' ? `<path d="M-3,-68.8 q2,-.6 3.6,.3" stroke="#5a2e22" stroke-width="1" fill="none"/>` : `<path d="M-3.6,-69.2 q2.2,1.8 4.6,0" stroke="#5a2e22" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  b += armsFront + extra;
  return `<g transform="scale(1.08)">${b}</g>`;
}

/* ---- Player apprentice (back three-quarter) ---- */
export function figPlayer() {
  const sh = '#efe3c6', sk = SK.player;
  let b = shadowE(14) + legs('#3a4651', '#2b2622', 1);
  b += arm([[-11, -57], [-14, -45], [-14, -37]], sh, 6.4) + hand(-14, -36, sk) + arm([[11, -57], [14, -45], [14, -37]], shade(sh, -0.08), 6.4) + hand(14, -36, sk);
  b += `<path d="${torsoD}" fill="${sh}"/>`;
  // backpack tool bag
  b += `<rect x="-9.5" y="-60" width="19" height="24" rx="4" fill="#3d5a63"/><rect x="-9.5" y="-60" width="19" height="6" rx="3" fill="#4c6d77"/><rect x="-7" y="-50" width="14" height="9" rx="2" fill="#35505a"/><rect x="-2" y="-50" width="4" height="3" fill="${PAL.orange}"/>` +
    `<rect x="4" y="-65" width="2.2" height="7" fill="${PAL.orange}"/><rect x="3.5" y="-66.5" width="3.2" height="2.5" rx="1" fill="#2c343b"/><path d="M-7,-60 v-3 M7,-60 v-3" stroke="#2f454c" stroke-width="2"/>`;
  b += `<rect x="-3" y="-67" width="6" height="6" fill="${shade(sk, -0.12)}"/><ellipse cx="0" cy="-74" rx="8.2" ry="9.2" fill="${sk}"/><ellipse cx="-7.8" cy="-73" rx="1.8" ry="2.6" fill="${shade(sk, -0.08)}"/>`;
  b += `<path d="M-8.3,-75 Q-8.6,-68 -4,-66.5 Q0,-65.5 4,-66.5 Q8.6,-68 8.3,-75Z" fill="#3a2a20"/><ellipse cx="-7.9" cy="-73" rx="1.8" ry="2.6" fill="${shade(sk, -0.08)}"/>`;
  b += `<path d="M-8.8,-74 Q-9,-85 0,-85.5 Q9,-85 8.8,-74 Q0,-77 -8.8,-74Z" fill="${PAL.teal}"/><path d="M-8.8,-74 Q-9,-85 0,-85.5 L-1,-75.5Z" fill="${PAL.tealL}" opacity=".7"/><path d="M-2,-75.3 q2,-1.5 4,0 v1.6 h-4Z" fill="#0d3f3a"/><path d="M-8.5,-80 Q-14,-84 -12,-87 Q-6,-87 -2,-85Z" fill="#0f4a44"/>`;
  return b;
}

/* ---- Theo, seated receptionist (back three-quarter, facing up-left) ---- */
export function figTheo(state = 'working') {
  const vest = '#c9a03a', shirt = '#d7e4ef', sk = SK.theo, hair = '#2b211c';
  let b = `<ellipse cx="0" cy="0" rx="15" ry="5.5" fill="#0d1a22" opacity=".18"/>`;
  // chair base
  b += `<path d="M0,-2 V-14" stroke="#2c343b" stroke-width="3"/><path d="M-10,0 L0,-3 L10,0 M-6,3 L0,-3 L7,3" stroke="#2c343b" stroke-width="2" fill="none"/><ellipse cx="0" cy="-16" rx="12" ry="5" fill="#3a434b"/>`;
  b += `<path d="M-6,-22 L-14,-18 L-16,-6 L-11,-6 L-10,-15 L-2,-17Z" fill="#33404a"/><path d="M3,-22 L-6,-17 L-7,-5 L-2,-5 L-1,-14 L6,-16Z" fill="#3d4b56"/>`;
  let tilt = 0, armA = '', armB = '';
  if (state === 'waiting') {
    tilt = -10;
    armA = arm([[-10, -42], [-15, -33], [-12, -46]], shirt, 5.8) + hand(-12, -47.5, sk);
    armB = arm([[10, -42], [6, -30], [-2, -28]], shade(shirt, -0.08), 5.8);
  } else if (state === 'denied') {
    armA = arm([[-10, -42], [-15, -32], [-9, -30]], shirt, 5.8);
    armB = arm([[10, -42], [15, -50], [6, -62]], shade(shirt, -0.08), 5.8) + hand(5, -62, sk);
  } else {
    armA = arm([[-10, -42], [-16, -36], [-20, -40]], shirt, 5.8) + hand(-21, -41, sk);
    armB = arm([[10, -42], [4, -34], [-6, -36]], shade(shirt, -0.08), 5.8) + hand(-7, -37, sk);
  }
  b += armA;
  b += `<path d="M-11,-44 Q-11,-49 -6,-49 H6 Q11,-49 11,-44 L9,-20 Q0,-18 -9,-20Z" fill="${vest}"/><path d="M-11,-44 Q-11,-49 -6,-49 H-2 L-3,-21 Q-6,-20 -9,-20Z" fill="${shade(vest, 0.1)}"/><path d="M-6,-49 L0,-45 L6,-49" stroke="${shirt}" stroke-width="2" fill="none"/>`;
  b += `<rect x="-11" y="-28" width="22" height="12" rx="4" fill="#2c343b" opacity=".85"/>`;
  b += `<g transform="rotate(${tilt} 0 -50)"><rect x="-2.6" y="-53" width="5.2" height="5" fill="${shade(sk, -0.12)}"/><ellipse cx="0" cy="-59" rx="7.6" ry="8.4" fill="${sk}"/><ellipse cx="7" cy="-58" rx="1.6" ry="2.4" fill="${shade(sk, -0.1)}"/>` +
    `<path d="M-7.8,-58 Q-9,-68.5 0,-68.5 Q8.5,-68.5 7.8,-60 Q4,-62 2,-61 Q-2,-56 -7.8,-58Z" fill="${hair}"/><path d="M-7.6,-60 q-1,6 2,8 l2,-1 q-2,-3 -1,-8Z" fill="${hair}"/></g>`;
  b += armB;
  return b;
}

/* ---- Ana, nurse (front three-quarter) ---- */
export function figAna(state = 'working') {
  const sc = '#6f9fd8', sk = SK.ana, hair = '#2a1c15';
  let b = shadowE(14) + legs(shade(sc, -0.08), '#e9eef1', 0.5);
  let back = '', front = '';
  if (state === 'waiting') {
    back = arm([[-11, -58], [-15, -46], [-9, -38]], sc, 6) + hand(-9, -38, sk);
    front = arm([[11, -58], [16, -48], [9, -36]], shade(sc, -0.05), 6) + hand(8, -36, sk);
  } else if (state === 'denied') {
    back = arm([[-11, -58], [-13, -46], [-6, -37]], sc, 6) + hand(-6, -37, sk);
    front = arm([[11, -58], [19, -52], [22, -62]], shade(sc, -0.05), 6) + hand(22.5, -63.5, sk, 3.4);
  } else {
    back = arm([[-11, -58], [-13, -46], [-6, -38]], sc, 6) + hand(-6, -38, sk);
    front = arm([[11, -58], [12, -46], [6, -37]], shade(sc, -0.05), 6) + hand(6, -37, sk);
  }
  b += back;
  b += `<path d="${torsoD}" fill="${sc}"/><path d="M-5,-63 L0,-55 L5,-63" fill="${shade(sc, -0.2)}"/><rect x="3" y="-55" width="6" height="5" rx="1" fill="${shade(sc, -0.12)}"/><rect x="4.5" y="-58" width="1" height="4" fill="#e6e9ec"/>`;
  b += `<path d="M-5,-62 Q0,-50 5,-62" stroke="#3d4b56" stroke-width="1" fill="none"/><circle cx="2" cy="-52" r="1.6" fill="#9aa6ae"/>`;
  b += `<rect x="-3" y="-67" width="6" height="6" fill="${shade(sk, -0.12)}"/><ellipse cx="0" cy="-74" rx="8" ry="9" fill="${sk}"/>`;
  b += `<path d="M-8.6,-72 Q-10,-84 0,-84 Q9.5,-84 8.4,-73 Q4,-79 -2,-79 Q-6,-77 -8.6,-72Z" fill="${hair}"/><circle cx="3" cy="-85" r="4.2" fill="${hair}"/>`;
  const look = state === 'working' ? 1.2 : 0;
  b += `<circle cx="-4" cy="${-73 + look}" r="1" fill="#1f140e"/><circle cx="2" cy="${-73 + look}" r="1" fill="#1f140e"/>`;
  b += state === 'pleased' || state === 'working' ? `<path d="M-3,-68.8 q1.8,1.4 3.6,0" stroke="#5a2e22" stroke-width="1" fill="none"/>` : `<path d="M-3,-68.2 q1.8,-1 3.6,0" stroke="#5a2e22" stroke-width="1" fill="none"/>`;
  b += front;
  return b;
}

/* ---- Ms. Ruiz, clinic manager (front three-quarter) ---- */
export function figRuiz() {
  const bz = '#7a3b52', sk = SK.ruiz, hair = '#3a2620';
  let b = shadowE(14) + legs('#2f2a33', '#1f1a1c', 0.6);
  b += arm([[-11, -58], [-14, -46], [-7, -40]], bz, 6.4) + hand(-6, -40, sk);
  b += `<path d="${torsoD}" fill="${bz}"/><path d="M-4,-63 L0,-48 L4,-63Z" fill="#efe9e1"/><path d="M-4,-63 L-1,-50 L-6,-56Z M4,-63 L1,-50 L6,-56Z" fill="${shade(bz, -0.25)}"/>`;
  b += `<g transform="rotate(-12 2 -42)"><rect x="-6" y="-54" width="14" height="18" rx="1.5" fill="#b98b51"/><rect x="-4.5" y="-51" width="11" height="14" fill="#fbf8f1"/><rect x="-1" y="-56" width="4" height="3" rx="1" fill="#9aa6ae"/><path d="M-3,-47 h8 M-3,-44 h6 M-3,-41 h7" stroke="#b4bcc2" stroke-width="1"/></g>`;
  b += arm([[11, -58], [13, -46], [6, -41]], shade(bz, -0.06), 6.4) + hand(5, -41, sk);
  b += `<rect x="-3" y="-67" width="6" height="6" fill="${shade(sk, -0.12)}"/><path d="M-9.5,-72 Q-11,-85 0,-85 Q11,-85 9.5,-72 L10,-63 L5,-65 L5.5,-72 L-5.5,-72 L-5,-65 L-10,-63Z" fill="${hair}"/><ellipse cx="0" cy="-74" rx="7.8" ry="8.8" fill="${sk}"/>`;
  b += `<path d="M-8,-74 Q-7,-84 1,-83 Q8,-82 8,-74 Q4,-80 -2,-79 Q-5,-78 -8,-74Z" fill="${hair}"/><path d="M3,-83 q4,2 5,8" stroke="#9c948e" stroke-width="1.6" fill="none"/>`;
  b += `<circle cx="-3.8" cy="-73.5" r="1" fill="#1f140e"/><circle cx="2.2" cy="-73.5" r="1" fill="#1f140e"/><path d="M-2.8,-69 q1.8,1 3.6,0" stroke="#7a2e2e" stroke-width="1" fill="none"/>`;
  return b;
}

/* ================= portraits ================= */
const eyes = (lx, rx, y, mood, iris = '#2a1a12') => {
  if (mood === 'pleased') return `<path d="M${lx - 5},${y + 1} q5,-6 10,0 M${rx - 5},${y + 1} q5,-6 10,0" stroke="${iris}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const dx = mood === 'thinking' ? 2 : 0, dy = mood === 'thinking' ? -1.5 : 0;
  return [lx, rx].map((x) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.8" fill="#fbf7f0"/><circle cx="${x + dx}" cy="${y + dy}" r="2.9" fill="${iris}"/><circle cx="${x + dx + 1}" cy="${y + dy - 1}" r="0.9" fill="#ffffff"/>`).join('');
};
const brows = (lx, rx, y, mood, col) => {
  const b = (x, a, side) => `<path d="M${x - 6},${y + a[0]} Q${x},${y + a[1]} ${x + 6},${y + a[2]}" stroke="${col}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  if (mood === 'concerned' || mood === 'worried') return b(lx, [1, -2, -4]) + b(rx, [-4, -2, 1]);
  if (mood === 'thinking') return b(lx, [-1, -4, -1]) + b(rx, [-6, -9, -5]);
  if (mood === 'pleased' || mood === 'explaining') return b(lx, [-2, -6, -3]) + b(rx, [-3, -6, -2]);
  return b(lx, [0, -3, -1]) + b(rx, [-1, -3, 0]);
};
const mouth = (x, y, mood, lip = '#6a3328') => {
  if (mood === 'pleased') return `<path d="M${x - 10},${y - 2} Q${x},${y + 10} ${x + 10},${y - 2} Q${x},${y + 2} ${x - 10},${y - 2}Z" fill="#5a2320"/><path d="M${x - 8},${y - 1} Q${x},${y + 2} ${x + 8},${y - 1} L${x + 7},${y + 1} Q${x},${y + 3.5} ${x - 7},${y + 1}Z" fill="#fbf7f0"/>`;
  if (mood === 'concerned' || mood === 'worried') return `<path d="M${x - 7},${y + 2} Q${x},${y - 3} ${x + 7},${y + 2}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (mood === 'thinking') return `<path d="M${x - 6},${y + 1} Q${x + 2},${y - 1} ${x + 8},${y - 2}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (mood === 'explaining') return `<ellipse cx="${x}" cy="${y + 1}" rx="6" ry="4.4" fill="#5a2320"/><path d="M${x - 4},${y + 3.4} q4,2 8,0" stroke="#d27a6a" stroke-width="2" fill="none"/>`;
  return `<path d="M${x - 8},${y} Q${x},${y + 5} ${x + 8},${y}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
};
const MOODS = ['neutral', 'pleased', 'concerned', 'thinking', 'explaining'];
function frame(title, bg, inner, key) {
  const clip = uid('clip');
  return svgRoot(160, 160, title, `<defs><clipPath id="${clip}"><circle cx="80" cy="80" r="78"/></clipPath><linearGradient id="${uid('steel')}" x1="0" x2="1"><stop offset="0" stop-color="#7d8891"/><stop offset=".4" stop-color="#e3e8ec"/><stop offset="1" stop-color="#6c767e"/></linearGradient></defs><circle cx="80" cy="80" r="78" fill="${bg}"/><g clip-path="url(#${clip})" aria-hidden="true">${inner}</g><circle cx="80" cy="80" r="77" fill="none" stroke="#1f2a33" stroke-opacity=".18" stroke-width="2"/>`, 'ap-portrait');
}
const handShape = (x, y, sk, kind, cuff) => {
  if (kind === 'thumb') return `<g transform="translate(${x} ${y})"><path d="M-14,40 L-12,8 L12,8 L14,40Z" fill="${cuff}"/><rect x="-13" y="-10" width="26" height="22" rx="8" fill="${sk}"/><rect x="-5" y="-30" width="9" height="24" rx="4.5" fill="${sk}"/><path d="M-12,-2 h20 M-12,4 h20" stroke="${shade(sk, -0.2)}" stroke-width="1.4"/></g>`;
  if (kind === 'palm') return `<g transform="translate(${x} ${y}) rotate(-8)"><path d="M-14,40 L-12,10 L12,10 L14,40Z" fill="${cuff}"/><rect x="-13" y="-12" width="26" height="26" rx="9" fill="${sk}"/>${[-9, -3, 3, 9].map((fx, i) => `<rect x="${fx - 3}" y="${-30 + Math.abs(i - 1.5) * 3}" width="6" height="22" rx="3" fill="${sk}"/>`).join('')}<rect x="10" y="-6" width="6" height="16" rx="3" transform="rotate(30 13 2)" fill="${sk}"/></g>`;
  if (kind === 'chin') return `<g transform="translate(${x} ${y})"><path d="M-6,60 L-12,20 L10,16 L16,56Z" fill="${cuff}"/><rect x="-12" y="-8" width="24" height="24" rx="9" fill="${sk}"/><rect x="-4" y="-22" width="7" height="18" rx="3.5" fill="${sk}" transform="rotate(-20 0 -12)"/></g>`;
  return '';
};

export function renderMentorPortrait(mood) {
  const m = MOODS.includes(mood) ? mood : 'neutral';
  const sk = SK.mags, j = '#cf5f2c', st = '#1c9c91';
  setUid('pm', m);
  let s = `<circle cx="80" cy="80" r="78" fill="#efe2c6"/><circle cx="116" cy="40" r="46" fill="#f8efd9" opacity=".7"/><g transform="translate(130 34) scale(.18)" opacity=".35">${lantern(PAL.teal, '#f8efd9', PAL.orange)}</g>`;
  s += `<path d="M6,166 C8,132 36,118 80,116 C124,118 152,132 154,166Z" fill="${j}"/><path d="M80,116 C124,118 152,132 154,166 H110Z" fill="#b24f22" opacity=".45"/>`;
  s += `<path d="M14,146 C40,134 120,134 146,146 L148,156 C120,144 40,144 12,156Z" fill="${st}"/><path d="M13,151 C40,139 120,139 147,151" stroke="#e3ecef" stroke-width="2" fill="none"/>`;
  s += `<path d="M62,116 L80,142 L98,116 L92,112 L80,128 L68,112Z" fill="#3b3f44"/><path d="M58,114 L70,112 L80,130 L72,138Z M102,114 L90,112 L80,130 L88,138Z" fill="#b24f22"/>`;
  s += `<path d="M68,96 L68,116 Q80,124 92,116 L92,96Z" fill="${shade(sk, -0.18)}"/>`;
  s += `<ellipse cx="52" cy="76" rx="6" ry="9" fill="${shade(sk, -0.08)}"/><ellipse cx="108" cy="76" rx="6" ry="9" fill="${shade(sk, -0.08)}"/><circle cx="52" cy="86" r="2.4" fill="#e0b23a"/><circle cx="108" cy="86" r="2.4" fill="#e0b23a"/>`;
  s += `<path d="M53,70 Q53,40 80,40 Q107,40 107,70 Q107,100 80,106 Q53,100 53,70Z" fill="${sk}"/>`;
  // silver natural hair
  const curls = [[56, 56, 9], [60, 46, 10], [69, 39, 10], [80, 36, 11], [91, 39, 10], [100, 46, 10], [104, 56, 9], [57, 64, 6], [103, 64, 6], [64, 40, 8], [96, 40, 8], [75, 33, 8], [86, 33, 8]];
  s += `<g fill="#b9c0c5">${curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y + 1.5}" r="${r}"/>`).join('')}</g><g fill="#dde1e4">${curls.map(([x, y, r]) => `<circle cx="${x - 0.8}" cy="${y}" r="${r - 1.6}"/>`).join('')}</g>`;
  s += `<g stroke="#a7afb5" stroke-width="1.2" fill="none">${curls.map(([x, y]) => `<path d="M${x - 3},${y + 1} q3,-3 6,0"/>`).join('')}</g>`;
  // glasses pushed up
  s += `<path d="M58,47 Q70,43 74,44 M86,44 Q92,43 102,47" stroke="#c99a1a" stroke-width="2.4" fill="none"/><circle cx="71" cy="44" r="9.5" fill="#fff6c4" fill-opacity=".55" stroke="${PAL.yellow}" stroke-width="3.6"/><circle cx="89" cy="44" r="9.5" fill="#fff6c4" fill-opacity=".55" stroke="${PAL.yellow}" stroke-width="3.6"/><path d="M78,44 h4" stroke="${PAL.yellow}" stroke-width="3"/><path d="M66,40 l4,-3" stroke="#ffffff" stroke-width="2" opacity=".8"/>`;
  s += brows(69, 91, 63, m, '#d5d9dc');
  s += eyes(69, 91, 72, m);
  s += `<path d="M61,75 q-3,2 -4,5 M99,75 q3,2 4,5" stroke="${shade(sk, -0.25)}" stroke-width="1.2" fill="none"/>`;
  s += `<path d="M80,74 Q78,84 75,86 Q80,89 85,86" stroke="${shade(sk, -0.3)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M68,86 q-3,5 -1,9 M92,86 q3,5 1,9" stroke="${shade(sk, -0.2)}" stroke-width="1.2" fill="none"/>`;
  s += `<ellipse cx="63" cy="85" rx="5" ry="3" fill="#c46a55" opacity=".25"/><ellipse cx="97" cy="85" rx="5" ry="3" fill="#c46a55" opacity=".25"/>`;
  s += mouth(80, 94, m);
  if (m === 'pleased') s += handShape(128, 122, sk, 'thumb', j);
  else if (m === 'explaining') s += handShape(130, 118, sk, 'palm', j);
  else if (m === 'thinking') s += handShape(88, 112, sk, 'chin', j);
  else if (m === 'neutral') s += `<g transform="translate(124 112) rotate(8)"><rect x="-11" y="-6" width="22" height="50" rx="5" fill="url(#${uid('steel')})" stroke="#5f6a72" stroke-width="1"/><rect x="-12" y="-14" width="24" height="10" rx="3" fill="#2c343b"/><rect x="-11" y="12" width="22" height="5" fill="${PAL.teal}"/><rect x="-14" y="18" width="28" height="18" rx="8" fill="${sk}"/><path d="M-12,30 L-16,50 H16 L14,30Z" fill="${j}"/></g>`;
  return frame(`Mags, Lantern Line field technician (${m})`, '#efe2c6', s, 'mags' + m);
}

const STAFF = {
  reception: { name: 'Theo, receptionist', sk: SK.theo, bg: '#dfe9ee' },
  nurse: { name: 'Ana, nurse', sk: SK.ana, bg: '#e2ecf7' },
  manager: { name: 'Ms. Ruiz, clinic manager', sk: SK.ruiz, bg: '#efe1e6' }
};
export function renderStaffPortrait(personId, mood) {
  const id = STAFF[personId] ? personId : 'reception';
  const m = ['neutral', 'pleased', 'worried'].includes(mood) ? mood : 'neutral';
  const P = STAFF[id], sk = P.sk;
  setUid('ps', id + m);
  let s = `<circle cx="80" cy="80" r="78" fill="${P.bg}"/><circle cx="40" cy="40" r="40" fill="#ffffff" opacity=".35"/>`;
  let hairBack = '', hairFront = '', body = '', browC = '#2b211c';
  if (id === 'reception') {
    body = `<path d="M8,166 C10,132 38,120 80,118 C122,120 150,132 152,166Z" fill="#d7e4ef"/><path d="M30,166 C34,138 52,126 66,122 L80,148 L94,122 C108,126 126,138 130,166Z" fill="#c9a03a"/><path d="M66,118 L80,134 L94,118" stroke="#b8cad9" stroke-width="5" fill="none"/><path d="M76,134 h8 l2,6 l-6,20 l-6,-20Z" fill="#3e6a8a"/>`;
    hairFront = `<path d="M52,66 Q50,36 80,34 Q110,36 108,66 Q104,52 90,50 Q74,56 58,52 Q54,58 52,66Z" fill="#2b211c"/>`;
  } else if (id === 'nurse') {
    body = `<path d="M8,166 C10,132 38,120 80,118 C122,120 150,132 152,166Z" fill="#6f9fd8"/><path d="M66,118 L80,140 L94,118Z" fill="#4f7fb8"/><path d="M60,120 Q60,150 92,152 Q104,150 104,138" stroke="#3d4b56" stroke-width="3" fill="none"/><circle cx="104" cy="140" r="6" fill="#9aa6ae"/><rect x="108" y="128" width="12" height="16" rx="2" fill="#4f7fb8"/>`;
    hairBack = `<circle cx="80" cy="34" r="14" fill="#2a1c15"/>`;
    hairFront = `<path d="M52,72 Q48,38 80,38 Q112,38 108,72 Q104,54 86,52 Q70,52 60,58 Q54,62 52,72Z" fill="#2a1c15"/>`;
  } else {
    browC = '#3a2620';
    body = `<path d="M8,166 C10,132 38,120 80,118 C122,120 150,132 152,166Z" fill="#7a3b52"/><path d="M66,118 L80,150 L94,118Z" fill="#efe9e1"/><path d="M62,118 L78,154 L56,138 L62,128Z M98,118 L82,154 L104,138 L98,128Z" fill="#5f2c40"/><circle cx="108" cy="140" r="4" fill="#e0b23a"/>`;
    hairBack = `<path d="M46,72 Q44,30 80,30 Q116,30 114,72 L116,108 L100,104 L100,80 L60,80 L60,104 L44,108Z" fill="#3a2620"/>`;
    hairFront = `<path d="M52,70 Q52,38 82,38 Q108,40 108,70 Q100,52 82,50 Q64,54 52,70Z" fill="#3a2620"/><path d="M90,40 q14,8 16,30" stroke="#a69c96" stroke-width="4" fill="none"/>`;
  }
  s += hairBack + body;
  s += `<path d="M68,98 L68,120 Q80,128 92,120 L92,98Z" fill="${shade(sk, -0.15)}"/>`;
  s += `<ellipse cx="53" cy="78" rx="6" ry="9" fill="${shade(sk, -0.08)}"/><ellipse cx="107" cy="78" rx="6" ry="9" fill="${shade(sk, -0.08)}"/>`;
  s += `<path d="M54,72 Q54,42 80,42 Q106,42 106,72 Q106,102 80,108 Q54,102 54,72Z" fill="${sk}"/>`;
  s += hairFront;
  if (id === 'reception') s += `<g fill="none" stroke="#2c343b" stroke-width="2.4"><rect x="59" y="68" width="17" height="12" rx="4"/><rect x="84" y="68" width="17" height="12" rx="4"/><path d="M76,73 h8"/></g>`;
  s += brows(68, 92, 64, m === 'worried' ? 'worried' : m, browC);
  s += eyes(68, 92, 74, m, '#2a1a12');
  s += `<path d="M80,76 Q78,85 76,87 Q80,90 84,87" stroke="${shade(sk, -0.28)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="63" cy="87" rx="5" ry="3" fill="#d0705a" opacity=".22"/><ellipse cx="97" cy="87" rx="5" ry="3" fill="#d0705a" opacity=".22"/>`;
  s += mouth(80, 96, m, id === 'manager' ? '#8a3036' : '#7a3a30');
  if (id === 'nurse') s += `<g transform="translate(30 132) rotate(-10)"><rect x="-18" y="-14" width="40" height="30" rx="4" fill="#2c343b"/><rect x="-15" y="-11" width="34" height="24" rx="2" fill="#e8f1f6"/><rect x="-12" y="-8" width="12" height="5" fill="#17675f"/></g>`;
  return frame(`${P.name} (${m})`, P.bg, s, id + m);
}
export { esc };
