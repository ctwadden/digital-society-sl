/**
 * Opening Shift — original isometric art for the apprentice game.
 * Every export is a pure function returning an SVG string (or a constant).
 * Shared projection/helpers live in art-props.js, people in art-people.js.
 */
import {
  esc, r1, arr, obj, setUid, uid, mix, shade, dimSvg, PAL, stateStyle, makeIso, makeSide, baseDefs, softShadow, svgRoot,
  lantern, drawVan, screenArt, itemArt, ITEM_IDS, CLOSEUP_SOCKETS, renderCloseupBody, prism, drawFaces, sparkle, makeIso as isoFactory
} from './art-props.js';
import { figMags, figPlayer, figTheo, figAna, figRuiz, renderMentorPortrait, renderStaffPortrait } from './art-people.js';

export { renderMentorPortrait, renderStaffPortrait, CLOSEUP_SOCKETS, makeIso, isoFactory as isoProjection };
export const ART_VERSION = '1.0.0';

/** Shared helpers for anyone composing extra art with the same projection. */
export function isoToScreen(x, y, z = 0, o = {}) { const p = makeIso(o.ox ?? SITE_O[0], o.oy ?? SITE_O[1], o.unit ?? SITE_U).P(x, y, z); return { x: r1(p[0]), y: r1(p[1]) }; }
export function isoPoly(points, fill, o = {}) { return makeIso(o.ox ?? SITE_O[0], o.oy ?? SITE_O[1], o.unit ?? SITE_U).poly(arr(points), esc(fill || '#ccc')); }
export function isoBox(x, y, z, w, d, h, colors = {}, o = {}) { return makeIso(o.ox ?? SITE_O[0], o.oy ?? SITE_O[1], o.unit ?? SITE_U).box(+x || 0, +y || 0, +z || 0, +w || 0, +d || 0, +h || 0, obj(colors)); }

/* =====================================================================
   SITE — Harbour Street Clinic
   ===================================================================== */
const SITE_O = [676, 172], SITE_U = 50;
const SC = SITE_U / 42;
const S = makeIso(SITE_O[0], SITE_O[1], SITE_U);
const WH = 3.0, LOW = 0.55, PART = 1.0, BX = 16, BY = 11;
const ROOMS = {
  closet: { r: [[0, 0, 4.5, 4]], floor: '#c7cdd1', pat: 'grid', wall: '#c9d4db' },
  reception: { r: [[0, 4, 7, 11]], floor: '#dcb98a', pat: 'plank', wall: '#f0dcc0' },
  corridor: { r: [[4.5, 0, 9, 4], [7, 4, 9, 11]], floor: '#e6dfcf', pat: 'grid2', wall: '#eee5d1' },
  examA: { r: [[9, 0, 16, 5.5]], floor: '#d5e6df', pat: 'grid', wall: '#dbeae4' },
  examB: { r: [[9, 5.5, 16, 11]], floor: '#d5e6df', pat: 'grid', wall: '#dbeae4' }
};
const LOC2ROOM = { 'location.reception': 'reception', 'location.equipment': 'closet', 'location.closet': 'closet', 'location.exam-a': 'examA', 'location.exam-b': 'examB', reception: 'reception', closet: 'closet', examA: 'examA', examB: 'examB', corridor: 'corridor' };
const ROOM_CENTER = { reception: [4, 7.5], closet: [2.8, 2.6], corridor: [8, 5.5], examA: [12, 3], examB: [12, 8.5] };
const SLOT3 = {
  'role.reception': { c: [0.55, 6.8, 1.22], port: [0.3, 6.4, 0.86], drop: [0.3, 6.4, 0.02], room: 'reception', mount: 'desk' },
  'role.records': { c: [2.07, 0.7, 0.66], port: [2.07, 1.17, 0.2], drop: [2.07, 1.45, 0.02], room: 'closet', mount: 'floor' },
  'infra.switch': { c: [0.5, 1.5, 1.42], port: [0.87, 1.5, 1.38], drop: [1.15, 1.5, 0.02], room: 'closet', mount: 'shelf' },
  'infra.ap': { c: [7.6, 0.03, 2.42], port: [7.6, 0.06, 2.08], drop: [7.6, 0.3, 0.02], room: 'corridor', mount: 'wall' }
};
const NURSE_FEET = { examA: [12.6, 3.4], examB: [12.6, 8.9] };
const nurseRoom = (loc) => (LOC2ROOM[loc] === 'examB' ? 'examB' : 'examA');
const FIG_K = 1.12 * SC;
const MANAGER_FEET = [3.0, 8.9], THEO_FEET = [1.8, 6.85];
const nurseDev = (room) => { const f = NURSE_FEET[room]; const p = S.P(f[0], f[1], 0); return [p[0] + 0.5 * FIG_K, p[1] - 33 * FIG_K]; };

export const SITE_SLOTS = (() => {
  const o = {};
  for (const k of Object.keys(SLOT3)) { const p = S.P(...SLOT3[k].c); o[k] = { x: r1(p[0]), y: r1(p[1]) }; }
  const n = nurseDev('examA'); o['role.nurse'] = { x: r1(n[0]), y: r1(n[1]) };
  const m = S.P(MANAGER_FEET[0], MANAGER_FEET[1], 0); o.manager = { x: r1(m[0]), y: r1(m[1] - 76 * FIG_K) };
  const t = S.P(THEO_FEET[0], THEO_FEET[1], 0); o.receptionist = { x: r1(t[0]), y: r1(t[1] - 60 * FIG_K) };
  const a = S.P(NURSE_FEET.examA[0], NURSE_FEET.examA[1], 0); o.nurse = { x: r1(a[0]), y: r1(a[1] - 76 * FIG_K) };
  return Object.freeze(o);
})();
/** Screen anchor (viewBox units, plus % of the 1600x1000 viewBox) for a role, honouring location for the nurse device. */
export function siteAnchor(roleId, locationId) {
  let p;
  if (roleId === 'role.nurse') { const n = nurseDev(nurseRoom(locationId)); p = { x: r1(n[0]), y: r1(n[1]) }; }
  else if (roleId === 'nurse') { const f = NURSE_FEET[nurseRoom(locationId)]; const q = S.P(f[0], f[1], 0); p = { x: r1(q[0]), y: r1(q[1] - 76 * FIG_K) }; }
  else if (SITE_SLOTS[roleId]) p = { ...SITE_SLOTS[roleId] };
  else { const rc = ROOM_CENTER[LOC2ROOM[locationId]] || [8, 5.5]; const q = S.P(rc[0], rc[1], 0.4); p = { x: r1(q[0]), y: r1(q[1]) }; }
  return { x: p.x, y: p.y, xPct: Math.round(p.x / 1.6) / 10, yPct: Math.round(p.y) / 10 };
}
const PEOPLE_POS = {
  mentor: { reception: [4.2, 7.6], closet: [3.6, 1.6], corridor: [8.0, 4.9], examA: [10.3, 3.9], examB: [10.3, 9.2] },
  player: { reception: [5.4, 7.9], closet: [3.9, 3.3], corridor: [8.1, 6.4], examA: [10.9, 4.9], examB: [11.0, 10.2] }
};

function roomPoly(rc, z = 0) { const [x0, y0, x1, y1] = rc; return [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]; }
function floorPattern(rc, pat, col) {
  const [x0, y0, x1, y1] = rc; let d = '';
  const ln = (a, b) => { const p = S.P(...a), q = S.P(...b); d += `M${r1(p[0])},${r1(p[1])}L${r1(q[0])},${r1(q[1])}`; };
  if (pat === 'plank') { for (let y = y0 + 0.5; y < y1; y += 0.5) ln([x0, y, 0], [x1, y, 0]); for (let y = y0, i = 0; y < y1; y += 0.5, i++) for (let x = x0 + (i % 3) * 0.9 + 0.7; x < x1; x += 2.6) ln([x, y, 0], [x, y + 0.5, 0]); }
  else { const st = pat === 'grid2' ? 1 : 0.75; for (let x = x0 + st; x < x1 - 0.01; x += st) ln([x, y0, 0], [x, y1, 0]); for (let y = y0 + st; y < y1 - 0.01; y += st) ln([x0, y, 0], [x1, y, 0]); }
  return `<path d="${d}" stroke="${shade(col, -0.14)}" stroke-width="1" opacity=".55" fill="none"/>`;
}

/* ---- furniture ---- */
const B = (x, y, z, w, d, h, c, o = {}) => S.box(x, y, z, w, d, h, Object.assign({ color: c }, o));
const sh = (x, y, rx, ry, op = 0.8) => { const p = S.P(x, y, 0); return softShadow(p[0], p[1], rx * SITE_U, ry * SITE_U * 0.5, op); };
function chair(x, y, col = '#2f8f86') {
  return sh(x + 0.3, y + 0.3, 0.45, 0.45) + B(x + 0.05, y + 0.05, 0, 0.06, 0.06, 0.42, '#5d666e') + B(x + 0.5, y + 0.05, 0, 0.06, 0.06, 0.42, '#5d666e') + B(x + 0.05, y + 0.5, 0, 0.06, 0.06, 0.42, '#5d666e') + B(x + 0.5, y + 0.5, 0, 0.06, 0.06, 0.42, '#5d666e') +
    B(x, y, 0.42, 0.6, 0.6, 0.1, col) + B(x, y + 0.5, 0.52, 0.6, 0.1, 0.5, col);
}
function plant(x, y, k = 1) {
  const kk = k; k = k * SC;
  const p = S.P(x, y, 0.55 * k / SC);
  let leaves = '';
  const L = [[-14, -18, -40], [12, -20, 35], [0, -30, 0], [-20, -4, -70], [20, -6, 70], [-6, -24, -18], [8, -26, 18]];
  for (const [dx, dy, a] of L) leaves += `<ellipse cx="${r1(p[0] + dx * k)}" cy="${r1(p[1] + dy * k)}" rx="${r1(7 * k)}" ry="${r1(16 * k)}" transform="rotate(${a} ${r1(p[0] + dx * k)} ${r1(p[1] + dy * k)})" fill="${a % 2 ? '#3f8a5c' : '#4f9e6a'}"/>`;
  return sh(x, y, 0.4 * kk, 0.4 * kk) + B(x - 0.22 * kk, y - 0.22 * kk, 0, 0.44 * kk, 0.44 * kk, 0.55 * kk, '#c4703f') + leaves + `<ellipse cx="${r1(p[0] - 4 * k)}" cy="${r1(p[1] - 26 * k)}" rx="${r1(5 * k)}" ry="${r1(10 * k)}" fill="#67b37f" transform="rotate(-10 ${r1(p[0])} ${r1(p[1] - 26 * k)})"/>`;
}
function couch(x, y, alongWall = 'y0') {
  void alongWall;
  return sh(x + 1.2, y + 0.45, 1.4, 0.7) + B(x + 0.1, y + 0.1, 0, 2.2, 0.7, 0.45, '#b9c2c8') + B(x, y, 0.45, 2.4, 0.9, 0.18, '#3e8f8a') + B(x, y + 0.02, 0.63, 0.7, 0.86, 0.16, '#3e8f8a') +
    S.poly([[x + 0.75, y + 0.15, 0.635], [x + 2.3, y + 0.15, 0.635], [x + 2.3, y + 0.75, 0.635], [x + 0.75, y + 0.75, 0.635]], '#f7f4ec');
}
function counterSink(x, y, w, d) {
  const tp = S.P(x + w / 2, y + d / 2, 0.92);
  return sh(x + w / 2, y + d / 2, w * 0.6, d * 0.7) + B(x, y, 0, w, d, 0.88, '#e9e4d8') + B(x - 0.03, y - 0.03, 0.88, w + 0.06, d + 0.06, 0.06, '#8d9aa3') +
    `<ellipse cx="${r1(tp[0])}" cy="${r1(tp[1])}" rx="${r1(15 * SC)}" ry="${r1(7.5 * SC)}" fill="#cfd8dd"/><ellipse cx="${r1(tp[0])}" cy="${r1(tp[1] + 1)}" rx="${r1(11 * SC)}" ry="${r1(5 * SC)}" fill="#a8b6be"/>` +
    S.line([[x + w / 2, y + 0.08, 0.94], [x + w / 2, y + 0.08, 1.22], [x + w / 2, y + 0.3, 1.22]], '#9aa6ae', 3) +
    [0.25, 0.75].map((f) => S.line([[x + w * f - 0.18, y + d + 0.001, 0.75], [x + w * f + 0.18, y + d + 0.001, 0.75]], '#9aa6ae', 2)).join('') +
    S.line([[x + w / 2, y + d + 0.001, 0.08], [x + w / 2, y + d + 0.001, 0.86]], '#cfc8b8', 1);
}
function tallCabinet(x, y, w, d, h) {
  return sh(x + w / 2, y + d / 2 + 0.2, w * 0.6, 0.5) + B(x, y, 0, w, d, h, '#eef0ec') +
    S.line([[x + w / 2, y + d + 0.002, 0.05], [x + w / 2, y + d + 0.002, h - 0.05]], '#c8cdca', 1.4) + S.poly([[x + 0.1, y + d + 0.003, h * 0.62], [x + w - 0.1, y + d + 0.003, h * 0.62], [x + w - 0.1, y + d + 0.003, h - 0.12], [x + 0.1, y + d + 0.003, h - 0.12]], '#bfd9e3', ' opacity=".55"') +
    S.line([[x + w / 2 - 0.08, y + d + 0.004, h * 0.45], [x + w / 2 - 0.08, y + d + 0.004, h * 0.55]], '#7a848c', 2) + S.line([[x + w / 2 + 0.08, y + d + 0.004, h * 0.45], [x + w / 2 + 0.08, y + d + 0.004, h * 0.55]], '#7a848c', 2);
}
function stool(x, y) { const p = S.P(x, y, 0.62); return sh(x, y, 0.35, 0.35) + S.line([[x, y, 0], [x, y, 0.6]], '#7a848c', 3) + `<ellipse cx="${r1(p[0])}" cy="${r1(p[1] + 3)}" rx="${r1(15 * SC)}" ry="${r1(7.5 * SC)}" fill="#2a6f69"/><ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(15 * SC)}" ry="${r1(7.5 * SC)}" fill="#3e8f8a"/>`; }
function wallPanelY(x, z, w, h, inner) { return `<g transform="${S.faceY(x, 0.005, z)}">${inner(w, h)}</g>`; }
function wallPanelX(y1, z, inner) { return `<g transform="${S.faceX(0.005, y1, z)}">${inner}</g>`; }

/* ---- devices at slots ---- */
function screenOn(tr, w, h, mode) { return `<g transform="${tr}"><g transform="scale(${r1((w / 100) * 1000) / 1000} ${r1((h / 62) * 1000) / 1000})">${screenArt(mode)}</g><rect width="${w}" height="${h}" fill="none" stroke="#11161b" stroke-width=".05"/></g>`; }
function ledDot(p, on, col = '#4fd17f') { return on ? `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="5" fill="${col}" opacity=".3"/><circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="2.2" fill="${col}"/><circle cx="${r1(p[0])}" cy="${r1(p[1])}" r=".9" fill="#fff"/>` : `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="2" fill="#4a535b"/>`; }
function deviceArt(role, d, mode, nLinks) {
  const kind = d.kind, on = !!d.powered; const slot = SLOT3[role];
  const mount = slot ? slot.mount : 'held';
  let s = '';
  if (mount === 'desk') {
    if (kind === 'laptop') {
      s += B(0.62, 6.45, 0.9, 0.5, 0.75, 0.03, '#9aa6ae') + B(0.55, 6.45, 0.93, 0.05, 0.75, 0.5, '#3a434b');
      s += screenOn(S.faceX(0.605, 7.15, 1.4), 0.65, 0.42, on ? mode : 'off');
    } else if (kind === 'tablet') {
      s += B(0.5, 6.6, 0.9, 0.2, 0.4, 0.05, '#5d666e') + B(0.5, 6.45, 0.95, 0.06, 0.7, 0.5, '#2c343b') + screenOn(S.faceX(0.565, 7.1, 1.41), 0.6, 0.42, on ? mode : 'off');
    } else {
      s += B(0.35, 6.65, 0.9, 0.35, 0.35, 0.03, '#3a434b') + B(0.42, 6.76, 0.93, 0.08, 0.12, 0.22, '#2c343b');
      s += B(0.48, 6.28, 1.03, 0.08, 1.04, 0.62, '#2c343b');
      s += screenOn(S.faceX(0.565, 7.27, 1.6), 0.94, 0.54, on ? mode : 'off');
      s += B(0.85, 6.45, 0.9, 0.22, 0.7, 0.03, '#d9dcdc') + B(0.9, 7.35, 0.9, 0.16, 0.12, 0.03, '#d9dcdc');
      s += B(0.25, 7.55, 0.9, 0.55, 0.38, 0.72, '#d9dcdc');
      s += ledDot(S.P(0.8, 7.75, 1.45), on);
    }
    s = `<g transform="translate(0 4.2)">${s}</g>`;
  } else if (mount === 'floor') {
    s += sh(2.1, 0.9, 0.7, 0.55) + B(1.7, 0.25, 0, 0.75, 0.92, 1.32, '#2f363d');
    for (let i = 0; i < 4; i++) s += S.poly([[1.78, 1.172, 0.95 - i * 0.2], [2.37, 1.172, 0.95 - i * 0.2], [2.37, 1.172, 1.08 - i * 0.2], [1.78, 1.172, 1.08 - i * 0.2]], '#20262b');
    s += S.poly([[1.78, 1.172, 1.12], [2.37, 1.172, 1.12], [2.37, 1.172, 1.25], [1.78, 1.172, 1.25]], '#3e4850');
    s += ledDot(S.P(1.85, 1.18, 1.18), on) + ledDot(S.P(1.97, 1.18, 1.18), on, '#f0b43c') + ledDot(S.P(2.09, 1.18, 1.18), on && nLinks > 0);
    if (kind !== 'server') s += B(1.75, 0.35, 1.32, 0.6, 0.7, 0.05, '#9aa6ae');
  } else if (mount === 'shelf') {
    const n = kind === 'switch8' ? 8 : 4;
    s += B(0.15, 0.85, 1.3, 0.72, 1.3, 0.2, '#4b5660');
    for (let i = 0; i < n; i++) {
      const y = 0.95 + (i + 0.5) * (1.1 / n);
      s += S.poly([[0.875, y + 0.05, 1.34], [0.875, y - 0.05, 1.34], [0.875, y - 0.05, 1.42], [0.875, y + 0.05, 1.42]], '#14181c');
      s += ledDot(S.P(0.875, y, 1.46), on && i < nLinks);
    }
    s += ledDot(S.P(0.875, 0.92, 1.38), on, '#58c7d6');
  } else if (mount === 'wall') {
    s += S.line([[7.6, 0.02, 2.75], [7.6, 0.02, WH]], '#b9c2c8', 4);
    s += `<g transform="${S.faceY(7.25, 0.04, 2.77)}"><rect width=".7" height=".7" rx=".16" fill="#f4f5f2" stroke="#b9c2c8" stroke-width=".03"/><rect x=".1" y=".08" width=".5" height=".06" rx=".03" fill="#e3e6e4"/></g>`;
    const c = S.P(7.6, 0.05, 2.42);
    s += on ? `<circle cx="${r1(c[0])}" cy="${r1(c[1] + 2)}" r="9" fill="#58c7d6" opacity=".28"/><circle cx="${r1(c[0])}" cy="${r1(c[1] + 2)}" r="5" fill="none" stroke="#58c7d6" stroke-width="2.4"/><circle cx="${r1(c[0])}" cy="${r1(c[1] + 2)}" r="1.6" fill="#ffffff"/>` : `<circle cx="${r1(c[0])}" cy="${r1(c[1] + 2)}" r="5" fill="none" stroke="#9aa4ab" stroke-width="2.4"/>`;
  }
  return s;
}
/** Nurse's mobile device; tablet held flat (screen visible from above) or laptop on a rolling cart. */
function nurseDeviceArt(d, mode, room) {
  const on = !!d.powered; const [fx, fy] = NURSE_FEET[room];
  if (d.kind === 'laptop' || d.kind === 'desktop') {
    const x = fx - 1.1, y = fy - 0.1;
    let s = sh(x + 0.3, y + 0.3, 0.5, 0.5) + S.line([[x + 0.3, y + 0.3, 0], [x + 0.3, y + 0.3, 0.9]], '#7a848c', 3) + B(x, y, 0.9, 0.6, 0.6, 0.06, '#d9dcdc');
    s += B(x + 0.08, y + 0.08, 0.96, 0.06, 0.45, 0.36, '#3a434b') + screenOn(S.faceX(x + 0.145, y + 0.5, 1.29), 0.4, 0.28, on ? mode : 'off');
    return s;
  }
  const p = nurseDev(room);
  const m = `matrix(${r1(SITE_U * 0.3) / 1} ${r1(SITE_U * 0.15)} ${r1(-SITE_U * 0.42)} ${r1(SITE_U * 0.21)} ${r1(p[0] + 4)} ${r1(p[1] - 10)})`;
  return `<g transform="${m}"><rect x="-.05" y="-.05" width="1.1" height="1.1" rx=".12" fill="#2c343b"/><g transform="scale(.01 .016)">${screenArt(on ? mode : 'off')}</g></g>`;
}
const SLOT_FOOT = {
  'role.reception': () => S.poly([[0.35, 6.3, 0.91], [0.95, 6.3, 0.91], [0.95, 7.3, 0.91], [0.35, 7.3, 0.91]], 'none', ' stroke="#1f2a33" stroke-width="2" stroke-dasharray="5 4" opacity=".55"'),
  'role.records': () => S.poly([[1.7, 0.25, 0.01], [2.45, 0.25, 0.01], [2.45, 1.17, 0.01], [1.7, 1.17, 0.01]], 'none', ' stroke="#1f2a33" stroke-width="2" stroke-dasharray="5 4" opacity=".55"'),
  'infra.switch': () => S.poly([[0.15, 0.85, 1.31], [0.87, 0.85, 1.31], [0.87, 2.15, 1.31], [0.15, 2.15, 1.31]], 'none', ' stroke="#1f2a33" stroke-width="2" stroke-dasharray="5 4" opacity=".6"'),
  'infra.ap': () => `<g transform="${S.faceY(7.25, 0.04, 2.77)}"><rect width=".7" height=".7" rx=".16" fill="none" stroke="#1f2a33" stroke-width=".05" stroke-dasharray=".12 .1" opacity=".6"/></g>`
};

/* ---- cables ---- */
function portOf(dev, scene) {
  if (!dev) return null;
  if (SLOT3[dev.roleId]) return SLOT3[dev.roleId];
  const room = dev.roleId === 'role.nurse' ? nurseRoom(dev.locationId || obj(obj(scene.staff).nurse).locationId) : (LOC2ROOM[dev.locationId] || 'corridor');
  const f = NURSE_FEET[room] || ROOM_CENTER[room] || [8, 5];
  return { port: [f[0], f[1], 0.8], drop: [f[0] + 0.3, f[1] + 0.3, 0.02], room };
}
function routePts(a, b) {
  const apA = a.mount === 'wall', apB = b.mount === 'wall';
  if (apA || apB) {
    const [w, o] = apA ? [a, b] : [b, a]; const H = 2.82;
    const pts = [o.port, [o.port[0] + 0.08, o.port[1], o.port[2]], [o.port[0] + 0.08, o.port[1], H], [o.port[0] + 0.08, 0.1, H], [w.port[0], 0.1, H], [w.port[0], 0.1, w.port[2]], w.port];
    return apA ? pts.reverse() : pts;
  }
  return [a.port, [a.drop[0], a.drop[1], a.port[2]], a.drop, [a.drop[0], b.drop[1], 0.02], b.drop, [b.drop[0], b.drop[1], b.port[2]], b.port];
}
const toScreen = (pts) => pts.map((p) => S.P(p[0], p[1], p[2]));
const pathD = (sp) => sp.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])},${r1(p[1])}`).join('');
function badge(x, y, state) {
  const st = stateStyle(state);
  let g = '';
  if (state === 'tested-ok') g = `<path d="M-4,0 l3,3 l5,-6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  else if (state === 'tested-fail') g = `<path d="M-3.5,-3.5 l7,7 M3.5,-3.5 l-7,7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`;
  else if (state === 'stale') g = `<circle r="4.2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M0,-2.6 V0 L2,1.4" stroke="#fff" stroke-width="1.6" fill="none"/>`;
  else return '';
  return `<g transform="translate(${r1(x)} ${r1(y)})"><circle r="8.5" fill="${st.c}" stroke="#fff" stroke-width="1.6"/>${g}</g>`;
}
function polyMid(sp) {
  let L = 0; const seg = []; for (let i = 1; i < sp.length; i++) { const l = Math.hypot(sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]); seg.push(l); L += l; }
  return (f) => { let t = L * f; for (let i = 0; i < seg.length; i++) { if (t <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, t / seg[i]) : 0; return [sp[i][0] + (sp[i + 1][0] - sp[i][0]) * k, sp[i][1] + (sp[i + 1][1] - sp[i][1]) * k]; } t -= seg[i]; } return sp[0]; };
}
function cableSvg(sp, state) {
  const st = stateStyle(state); const d = pathD(sp);
  let s = '';
  if (state === 'tested-ok') s += `<path d="${d}" stroke="${st.c}" stroke-width="12" opacity=".22" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += `<path d="${d}" stroke="#17222b" stroke-width="6.5" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>`;
  s += `<path d="${d}" stroke="${st.c}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="${st.cap}"${st.dash ? ` stroke-dasharray="${st.dash}"` : ''}/>`;
  for (const p of [sp[0], sp[sp.length - 1]]) s += `<rect x="${r1(p[0] - 3.5)}" y="${r1(p[1] - 3.5)}" width="7" height="7" rx="1.5" fill="#e3f1f7" stroke="${st.c}" stroke-width="1.5"/>`;
  const m = polyMid(sp)(0.5); s += badge(m[0], m[1], state);
  return s;
}

/* ---- sorting/compose ---- */
function compose(items, active) {
  items.sort((a, b) => a.k - b.k);
  return items.map((it) => (it.room && active && !active.has(it.room) ? `<g class="ap-dim" data-room="${it.room}">${dimSvg(it.s)}</g>` : it.s)).join('');
}

export function renderSite(scene) {
  scene = obj(scene);
  setUid('site', scene);
  const actList = Array.isArray(scene.activeRooms) ? scene.activeRooms : null;
  const active = actList ? new Set(actList) : null;
  const isDim = (room) => !!(room && room !== 'corridor' && active && !active.has(room));
  const afternoon = scene.timeOfDay === 'afternoon';
  const devices = arr(scene.devices).filter((d) => d && typeof d === 'object');
  const cables = arr(scene.cables).filter((c) => c && typeof c === 'object');
  const staff = obj(scene.staff);
  const byId = {}; devices.forEach((d) => { byId[d.id] = d; });
  const linksOf = (id) => cables.filter((c) => c.fromDeviceId === id || c.toDeviceId === id).length;
  const items = []; const add = (k, s, room) => items.push({ k, s, room });

  /* background + ground */
  let bg = `<defs>${baseDefs()}<linearGradient id="${uid('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${afternoon ? '#efe2c6' : '#d6ebe6'}"/><stop offset="1" stop-color="${afternoon ? '#e8dcc0' : '#eef2df'}"/></linearGradient>` +
    `<linearGradient id="${uid('tint')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${afternoon ? '#ffcf8a' : '#fffbe6'}" stop-opacity="${afternoon ? 0.22 : 0.18}"/><stop offset="1" stop-color="${afternoon ? '#b4572a' : '#7fb7c9'}" stop-opacity="${afternoon ? 0.16 : 0.08}"/></linearGradient></defs>`;
  bg += `<rect width="1600" height="1000" fill="url(#${uid('sky')})"/>`;
  bg += S.poly([[-14, -6, 0], [30, -6, 0], [30, 11.2, 0], [-14, 11.2, 0]], afternoon ? '#a9bf7a' : '#9cc28a');
  // side path along x=16 and lawn texture
  bg += S.poly([[16.4, -6, 0], [18.2, -6, 0], [18.2, 11.2, 0], [16.4, 11.2, 0]], '#d9d2c2');
  bg += S.poly([[-14, 11.2, 0], [30, 11.2, 0], [30, 13.4, 0], [-14, 13.4, 0]], '#ddd5c4');
  { let d = ''; for (let x = -14; x < 30; x += 1.5) { const p = S.P(x, 11.2, 0), q = S.P(x, 13.4, 0); d += `M${r1(p[0])},${r1(p[1])}L${r1(q[0])},${r1(q[1])}`; } bg += `<path d="${d}" stroke="#c4bba8" stroke-width="1"/>`; }
  bg += S.box(-14, 13.4, -0.12, 44, 0.25, 0.12, { color: '#bdb4a2' });
  bg += S.poly([[-14, 13.65, -0.12], [30, 13.65, -0.12], [30, 22, -0.12], [-14, 22, -0.12]], '#5b6670');
  { let d = ''; for (let x = -14; x < 30; x += 2.4) { const a = S.P(x, 18.6, -0.12), b = S.P(x + 1.2, 18.6, -0.12); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; } bg += `<path d="${d}" stroke="#e9e1c6" stroke-width="3"/>`; }
  { let d = ''; for (const x of [8.8, 15.8, 1.8]) { const a = S.P(x, 13.7, -0.12), b = S.P(x, 16.4, -0.12); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; } bg += `<path d="${d}" stroke="#f1ead6" stroke-width="2.4"/>`; }
  // trees & bushes (behind building)
  const tree = (x, y, k = 1) => { k *= SC; const p = S.P(x, y, 0); return softShadow(p[0] + 10, p[1] + 4, 46 * k, 20 * k) + `<rect x="${r1(p[0] - 4 * k)}" y="${r1(p[1] - 60 * k)}" width="${r1(8 * k)}" height="${r1(60 * k)}" fill="#7a5a3c"/><circle cx="${r1(p[0])}" cy="${r1(p[1] - 82 * k)}" r="${r1(38 * k)}" fill="#4f8f5e"/><circle cx="${r1(p[0] - 18 * k)}" cy="${r1(p[1] - 96 * k)}" r="${r1(26 * k)}" fill="#64a872"/><circle cx="${r1(p[0] + 14 * k)}" cy="${r1(p[1] - 70 * k)}" r="${r1(24 * k)}" fill="#3f7c50"/>`; };
  bg += tree(-2.5, 2, 1) + tree(5, -3.5, 0.9) + tree(19.5, 3.5, 1.1) + tree(13, -3.2, 0.95);
  // building slab
  bg += S.box(-0.25, -0.25, -0.22, BX + 0.5, BY + 0.5, 0.22, { color: '#b8ad98' });
  // floors
  for (const [id, R] of Object.entries(ROOMS)) {
    let f = '';
    for (const rc of R.r) f += S.poly(roomPoly(rc), R.floor) + floorPattern(rc, R.pat, R.floor);
    bg += isDim(id) ? dimSvg(f) : f;
  }
  // rug + doormat
  bg += S.poly([[2.3, 6.0, 0.005], [4.4, 6.0, 0.005], [4.4, 8.6, 0.005], [2.3, 8.6, 0.005]], isDim('reception') ? dimSvg('#c86a4a') : '#c86a4a', ' opacity=".55"');
  bg += S.poly([[3.7, 10.0, 0.006], [5.3, 10.0, 0.006], [5.3, 10.95, 0.006], [3.7, 10.95, 0.006]], '#4c5a63');
  // back-wall ambient occlusion
  bg += S.poly([[0, 0, 0.003], [BX, 0, 0.003], [BX, 0.55, 0.003], [0, 0.55, 0.003]], '#1d2b33', ' opacity=".08"') + S.poly([[0, 0, 0.003], [BX, 0, 0.003], [BX, 0.22, 0.003], [0, 0.22, 0.003]], '#1d2b33', ' opacity=".08"');
  bg += S.poly([[0, 0, 0.003], [0.55, 0, 0.003], [0.55, BY, 0.003], [0, BY, 0.003]], '#1d2b33', ' opacity=".08"') + S.poly([[0, 0, 0.003], [0.22, 0, 0.003], [0.22, BY, 0.003], [0, BY, 0.003]], '#1d2b33', ' opacity=".08"');

  /* back walls (tall) */
  let walls = '';
  const segX = [['closet', 0, 4], ['reception', 4, BY]];
  for (const [room, y0, y1] of segX) { const w = B(-0.25, y0 - (y0 ? 0 : 0.25), 0, 0.25, y1 - y0 + (y0 ? 0 : 0.25), WH, ROOMS[room].wall, { top: '#46545e' }) + B(-0.01, y0, 0, 0.02, y1 - y0, 0.16, shade(ROOMS[room].wall, -0.3)); walls += isDim(room) ? dimSvg(w) : w; }
  const segY = [['closet', 0, 4.5], ['corridor', 4.5, 9], ['examA', 9, BX]];
  for (const [room, x0, x1] of segY) { const w = B(x0, -0.25, 0, x1 - x0, 0.25, WH, ROOMS[room].wall, { top: '#46545e' }) + B(x0, -0.01, 0, x1 - x0, 0.02, 0.16, shade(ROOMS[room].wall, -0.3)); walls += isDim(room) ? dimSvg(w) : w; }
  // wall decor
  let wd = '';
  // reception: window + framed art + clock
  const win = (y1) => wallPanelX(y1, 2.45, `<rect width="1.6" height="1.35" rx=".05" fill="#f7f2e6"/><rect x=".08" y=".08" width="1.44" height="1.19" fill="#bfe0ea"/><path d="M.08,.9 L.7,.5 L1.2,.75 L1.52,.6 V1.27 H.08Z" fill="#9cc7a3"/><path d="M.8,.08 V1.27 M.08,.68 H1.52" stroke="#f7f2e6" stroke-width=".06"/><path d="M.2,.2 L.5,.2 L.25,.6Z" fill="#fff" opacity=".45"/>`);
  let rec = win(6.2) + win(10.2);
  rec += wallPanelX(8.2, 2.1, `<rect width=".9" height=".7" fill="#7a5a3c"/><rect x=".06" y=".06" width=".78" height=".58" fill="#f4ead4"/><circle cx=".3" cy=".3" r=".14" fill="#e07a3a"/><path d="M.1,.6 Q.4,.25 .8,.6Z" fill="#2a8a7f"/>`);
  { const c = S.P(0.01, 7.6, 2.55); rec += `<g transform="${S.faceX(0.01, 7.75, 2.7)}"><circle cx=".15" cy=".15" r=".16" fill="#fff" stroke="#3a434b" stroke-width=".03"/><path d="M.15,.06 V.15 H.22" stroke="#3a434b" stroke-width=".025" fill="none"/></g>`; void c; }
  wd += isDim('reception') ? dimSvg(rec) : rec;
  // closet: pegboard + conduit + patch panel plate
  let clo = wallPanelY(2.6, 2.6, 1.6, 1.0, () => `<rect width="1.6" height="1.0" fill="#c9a777"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${0.15 + (i % 8) * 0.19}" cy="${0.15 + Math.floor(i / 8) * 0.3}" r=".025" fill="#8a6e48"/>`).join('')}<path d="M.3,.35 a.12,.12 0 1 0 .01,0" stroke="#e07a3a" stroke-width=".05" fill="none"/><rect x=".8" y=".3" width=".08" height=".4" fill="#3a434b"/><rect x="1.1" y=".25" width=".3" height=".08" fill="#e0b23a"/>`);
  clo += wallPanelX(3.8, 1.2, `<rect width=".5" height=".3" rx=".03" fill="#e8e6df" stroke="#9aa4ab" stroke-width=".02"/><rect x=".08" y=".1" width=".12" height=".1" fill="#3a434b"/><rect x=".3" y=".1" width=".12" height=".1" fill="#3a434b"/>`);
  clo += S.line([[4.3, 0.04, WH], [4.3, 0.04, 0.3]], '#b9c2c8', 3);
  wd += isDim('closet') ? dimSvg(clo) : clo;
  // corridor: sanitizer + notice board
  wd += wallPanelY(5.1, 2.3, 1.4, 0.9, () => `<rect width="1.4" height=".9" rx=".04" fill="#b98b51"/><rect x=".06" y=".06" width="1.28" height=".78" fill="#d9c8a6"/><rect x=".15" y=".14" width=".35" height=".3" fill="#fff6c8"/><rect x=".6" y=".2" width=".3" height=".35" fill="#cfe6f1"/><rect x=".98" y=".12" width=".28" height=".26" fill="#f6d2c2"/><rect x=".3" y=".52" width=".4" height=".24" fill="#e4f1df"/><circle cx=".32" cy=".17" r=".03" fill="#c0432f"/><circle cx=".75" cy=".23" r=".03" fill="#17675f"/>`);
  wd += wallPanelY(8.35, 1.6, 0.3, 0.5, () => `<rect width=".3" height=".5" rx=".06" fill="#eef0ee" stroke="#9aa4ab" stroke-width=".02"/><rect x=".08" y=".3" width=".14" height=".08" fill="#2a8a7f"/>`);
  // exam A: wall cabinet + poster
  let exa = wallPanelY(10.4, 2.5, 1.0, 0.75, () => `<rect width="1" height=".75" fill="#f8f6f0" stroke="#b9c2c8" stroke-width=".02"/><path d="M.5,.62 C.1,.35 .2,.12 .5,.25 C.8,.12 .9,.35 .5,.62Z" fill="#e07a3a" opacity=".8"/><path d="M.18,.42 H.36 L.42,.32 L.5,.5 L.56,.42 H.82" stroke="#17675f" stroke-width=".035" fill="none"/>`);
  exa += B(12.85, 0.0, 2.0, 1.4, 0.4, 0.75, '#eef0ec');
  exa += S.line([[13.55, 0.401, 2.05], [13.55, 0.401, 2.7]], '#c8cdca', 1.2);
  wd += isDim('examA') ? dimSvg(exa) : exa;

  /* partitions & near walls (sorted, split into unit segments) */
  const wallSeg = (x0, y0, x1, y1, h, face, room) => {
    const along = x1 - x0 > y1 - y0; const L = along ? x1 - x0 : y1 - y0; const n = Math.max(1, Math.ceil(L));
    for (let i = 0; i < n; i++) {
      const a = (L * i) / n, b = (L * (i + 1)) / n;
      const bx = along ? x0 + a : x0 - 0.1, by = along ? y0 - 0.1 : y0 + a, bw = along ? b - a : 0.2, bd = along ? 0.2 : b - a;
      add(bx + bw / 2 + by + bd / 2 + 0.05, B(bx, by, 0, bw, bd, h, face, { top: '#3d4a54' }), room);
    }
  };
  wallSeg(0, 4, 4.5, 4, PART, '#e8e2d4', null);
  wallSeg(4.5, 0, 4.5, 1.3, PART, '#e8e2d4', null); wallSeg(4.5, 2.6, 4.5, 4, PART, '#e8e2d4', null);
  wallSeg(7, 6.6, 7, 11, PART, '#e8e2d4', null);
  wallSeg(9, 0, 9, 3.4, PART, '#e8e2d4', null); wallSeg(9, 4.7, 9, 6.3, PART, '#e8e2d4', null); wallSeg(9, 7.6, 9, 11, PART, '#e8e2d4', null);
  wallSeg(9, 5.5, 16, 5.5, PART, '#e8e2d4', null);
  // near exterior walls (outside faces visible)
  wallSeg(0, BY + 0.1, 3.6, BY + 0.1, LOW, '#d9b48c', null); wallSeg(5.4, BY + 0.1, BX, BY + 0.1, LOW, '#d9b48c', null);
  wallSeg(BX + 0.1, 0, BX + 0.1, BY + 0.2, LOW, '#d9b48c', null);
  add(3.6 + BY + 0.2, B(3.5, BY - 0.05, 0, 0.12, 0.3, LOW + 0.15, '#7a848c') + B(5.4, BY - 0.05, 0, 0.12, 0.3, LOW + 0.15, '#7a848c'), null);

  /* furniture */
  // reception
  add(0.7 + 6.75, sh(0.7, 6.9, 0.9, 1.6) + B(0.12, 5.55, 0, 0.12, 2.45, 0.78, '#a77f50') + B(0.2, 5.55, 0, 0.06, 0.06, 0.78, '#7a5a3c') + B(1.02, 5.55, 0, 0.06, 0.06, 0.78, '#7a5a3c') + B(0.3, 7.35, 0, 0.8, 0.6, 0.72, '#c49a68', { top: '#d8b689' }) + [0.18, 0.42].map((z) => S.line([[1.1, 7.45, z + 0.12], [1.1, 7.85, z + 0.12]], '#7a5a3c', 2)).join('') + B(0.1, 5.5, 0.72, 1.1, 2.55, 0.08, '#c49a68', { top: '#e8cfa8' }), 'reception');
  add(1.6 + 4.6, plant(0.6, 4.6, 0.9), 'reception');
  add(6.3 + 4.6, plant(6.4, 4.6, 1), 'reception');
  for (let i = 0; i < 3; i++) add(1.3 + i * 0.75 + 10.1, chair(1.0 + i * 0.75, 9.8), 'reception');
  add(6.0 + 9.8, sh(6.0, 9.8, 0.6, 0.5) + B(5.65, 9.45, 0, 0.7, 0.7, 0.45, '#b98b51', { top: '#d7ae70' }) + B(5.75, 9.6, 0.45, 0.4, 0.3, 0.04, '#e07a3a'), 'reception');
  add(6.3 + 7.8, chair(6.15, 7.4, '#e0a03a') + chair(6.15, 8.25, '#e0a03a'), 'reception');
  if (!byId || true) { const ch = S.P(2.05, 6.85, 0); void ch; }
  // closet: rack + boxes + ups
  let rack = sh(0.55, 1.5, 0.7, 1.4);
  for (const [x, y] of [[0.12, 0.5], [0.12, 2.42], [0.86, 0.5], [0.86, 2.42]]) rack += B(x, y, 0, 0.07, 0.07, 2.1, '#5d666e');
  for (const z of [0.35, 1.28, 2.0]) rack += B(0.1, 0.5, z, 0.85, 2.0, 0.04, '#7d878f');
  rack += B(0.2, 0.7, 0.39, 0.6, 0.6, 0.35, '#c99a62') + B(0.2, 1.5, 0.39, 0.6, 0.7, 0.3, '#3a4148') + B(0.2, 0.7, 2.04, 0.5, 0.8, 0.25, '#c99a62');
  add(0.5 + 1.0, rack, 'closet');
  add(3.4 + 0.6, sh(3.4, 0.6, 0.5, 0.4) + B(3.0, 0.25, 0, 0.8, 0.6, 0.5, '#c99a62') + B(3.1, 0.3, 0.5, 0.6, 0.5, 0.35, '#d7ae70') + S.line([[3.1, 0.85, 0.7], [3.7, 0.85, 0.7]], '#a77f50', 2), 'closet');
  add(2.9 + 1.0, sh(2.9, 0.75, 0.3, 0.3) + B(2.65, 0.4, 0, 0.45, 0.55, 0.5, '#2c343b') + ledDot(S.P(2.9, 0.951, 0.38), true, '#4fd17f'), 'closet');
  // exam A
  add(11.2 + 0.85, couch(10.0, 0.35), 'examA');
  add(13.55 + 0.4, counterSink(12.85, 0.08, 1.4, 0.65), 'examA');
  add(15.05 + 0.45, tallCabinet(14.4, 0.08, 1.3, 0.65, 1.95), 'examA');
  add(11.6 + 2.3, stool(11.6, 2.3), 'examA');
  add(15.4 + 4.6, sh(15.4, 4.6, 0.3, 0.3) + B(15.2, 4.4, 0, 0.4, 0.4, 0.5, '#e07a3a', { top: '#f0a070' }), 'examA');
  // exam B
  add(11.2 + 6.1, couch(10.0, 5.75), 'examB');
  add(15.05 + 6.1, counterSink(14.3, 5.75, 1.45, 0.7), 'examB');
  add(11.8 + 7.9, stool(11.8, 7.9), 'examB');
  add(15.4 + 10.2, plant(15.4, 10.3, 0.85), 'examB');
  // corridor
  add(8.5 + 9.6, sh(8.5, 9.9, 0.4, 0.8) + B(8.2, 9.2, 0, 0.5, 1.3, 0.42, '#7d878f') + B(8.18, 9.18, 0.42, 0.54, 1.34, 0.06, '#3e8f8a'), null);

  /* staff */
  const st = (v) => (['absent', 'waiting', 'working', 'denied'].includes(v) ? v : 'absent');
  const recState = st(staff.reception);
  const nurse = obj(staff.nurse); const nurseState = st(nurse.state); const nRoom = nurseRoom(nurse.locationId);
  const modeFor = (s) => (s === 'working' ? 'working' : s === 'waiting' ? 'waiting' : s === 'denied' ? 'denied' : 'idle');
  const place = (x, y, inner, k = FIG_K) => { const p = S.P(x, y, 0); return `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(${k})">${inner}</g>`; };
  // reception chair always present
  add(1.8 + 6.85 - 0.01, recState === 'absent' ? place(1.8, 6.85, `<ellipse cx="0" cy="0" rx="15" ry="5.5" fill="#0d1a22" opacity=".18"/><path d="M0,-2 V-14" stroke="#2c343b" stroke-width="3"/><ellipse cx="0" cy="-16" rx="12" ry="5" fill="#3a434b"/><path d="M-6,-22 L-14,-18 L-14,-36 L-6,-40Z" fill="#33404a"/>`) : '', 'reception');
  if (recState !== 'absent') add(1.8 + 6.85, `<g class="ap-person" data-person="reception" data-state="${recState}">${place(1.8, 6.85, figTheo(recState))}</g>`, 'reception');
  if (nurseState !== 'absent') { const f = NURSE_FEET[nRoom]; add(f[0] + f[1], `<g class="ap-person" data-person="nurse" data-state="${nurseState}">${place(f[0], f[1], figAna(nurseState))}</g>`, nRoom); }
  if (staff.manager === 'present') add(3.2 + 9.0, `<g class="ap-person" data-person="manager" data-state="present">${place(MANAGER_FEET[0], MANAGER_FEET[1], figRuiz())}</g>`, 'reception');

  /* devices + slots */
  const present = new Set();
  for (const d of devices) {
    const role = d.roleId; present.add(role);
    const id = esc(d.id), rid = esc(role);
    let art = '', key = 0, room = null;
    if (role === 'role.nurse' || (!SLOT3[role] && (d.kind === 'tablet'))) {
      const rm = role === 'role.nurse' ? nurseRoom(d.locationId || nurse.locationId) : nurseRoom(d.locationId);
      art = nurseDeviceArt(d, modeFor(nurseState), rm); const f = NURSE_FEET[rm]; key = f[0] + f[1] + (d.kind === 'laptop' ? -0.5 : 0.3); room = rm;
    } else if (SLOT3[role]) {
      const sl = SLOT3[role]; const mode = role === 'role.reception' ? modeFor(recState) : 'idle';
      art = deviceArt(role, d, mode, linksOf(d.id)); key = sl.c[0] + sl.c[1] + (sl.mount === 'desk' ? 0.3 : 0.06); room = sl.room;
    } else {
      const rm = LOC2ROOM[d.locationId] || 'corridor'; const c = ROOM_CENTER[rm];
      art = sh(c[0], c[1], 0.5, 0.4) + B(c[0] - 0.3, c[1] - 0.3, 0, 0.6, 0.6, 0.5, '#4b5660') + ledDot(S.P(c[0], c[1] + 0.31, 0.3), !!d.powered); key = c[0] + c[1]; room = rm;
    }
    let sel = '';
    if (d.selected) { const a = siteAnchor(role, d.locationId || nurse.locationId); sel = `<ellipse cx="${a.x}" cy="${a.y}" rx="58" ry="40" fill="none" stroke="#ffd23f" stroke-width="10" opacity=".3"/><ellipse cx="${a.x}" cy="${a.y}" rx="58" ry="40" fill="none" stroke="#fff6c8" stroke-width="3"/>`; }
    add(key, `<g class="ap-device" data-device-id="${id}" data-role-id="${rid}" data-powered="${d.powered ? 'true' : 'false'}"${d.selected ? ' data-selected="true"' : ''}>${art}${sel}</g>`, room);
  }
  for (const role of Object.keys(SLOT_FOOT)) if (!present.has(role)) add(SLOT3[role].c[0] + SLOT3[role].c[1] + 0.06, `<g class="ap-slot" data-role-slot="${role}">${SLOT_FOOT[role]()}</g>`, SLOT3[role].room);
  if (!present.has('role.nurse') && nurseState !== 'absent') { const p = nurseDev(nRoom); const f = NURSE_FEET[nRoom]; add(f[0] + f[1] + 0.3, `<g class="ap-slot" data-role-slot="role.nurse"><ellipse cx="${r1(p[0])}" cy="${r1(p[1] - 4)}" rx="14" ry="8" fill="none" stroke="#1f2a33" stroke-width="2" stroke-dasharray="4 3" opacity=".6"/></g>`, nRoom); }

  /* mentor + player */
  const mentor = obj(scene.mentor), player = obj(scene.player);
  const mLoc = PEOPLE_POS.mentor[mentor.locationId], pLoc = PEOPLE_POS.player[player.locationId];
  if (mLoc) add(mLoc[0] + mLoc[1], `<g class="ap-person" data-person="mentor">${place(mLoc[0], mLoc[1], figMags(mentor.pose))}</g>`, null);
  if (pLoc) add(pLoc[0] + pLoc[1], `<g class="ap-person" data-person="player">${place(pLoc[0], pLoc[1], figPlayer())}</g>`, null);

  /* outside: van + lamp + bushes */
  if (scene.vanParked !== false) add(40, `<g class="ap-van" aria-hidden="true">${drawVan(S, 9.6, 14.1, { orient: 'side', variant: 'mentor' })}</g>`, null);
  const lamp = (x, y) => { const p = S.P(x, y, 0), t = S.P(x, y, 3.6); return softShadow(p[0], p[1], 12, 5) + `<rect x="${r1(p[0] - 2.5)}" y="${r1(t[1])}" width="5" height="${r1(p[1] - t[1])}" fill="#3a434b"/><rect x="${r1(p[0] - 9)}" y="${r1(t[1] - 6)}" width="18" height="8" rx="3" fill="#3a434b"/><ellipse cx="${r1(p[0])}" cy="${r1(t[1] + 3)}" rx="7" ry="2.5" fill="#fff4cc"/>`; };
  add(7.8 + 12.6, lamp(7.6, 12.6), null);
  const bush = (x, y) => { const p = S.P(x, y, 0); return softShadow(p[0], p[1], 30, 10) + `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(${r1(SC * 100) / 100}) translate(${r1(-p[0])} ${r1(-p[1])})"><ellipse cx="${r1(p[0] - 10)}" cy="${r1(p[1] - 10)}" rx="18" ry="13" fill="#4f8f5e"/><ellipse cx="${r1(p[0] + 10)}" cy="${r1(p[1] - 12)}" rx="18" ry="14" fill="#5d9e6b"/><ellipse cx="${r1(p[0])}" cy="${r1(p[1] - 20)}" rx="14" ry="11" fill="#6db07a"/></g>`; };
  add(17 + 7, bush(17.0, 7.0), null); add(17 + 10.5, bush(17.2, 10.8), null); add(-0.8 + 11.8, bush(-0.8, 11.9), null);

  let body = bg + walls + wd + compose(items, active ? { has: (r) => !isDim(r) } : null);

  /* overlays: cables, wifi, test route, highlight */
  let over = '';
  for (const c of cables) {
    const a = portOf(byId[c.fromDeviceId], scene), b = portOf(byId[c.toDeviceId], scene);
    if (!a || !b) continue;
    const sp = toScreen(routePts(a, b));
    over += `<g class="ap-cable" data-cable-id="${esc(c.id)}" data-state="${esc(c.state || 'installed')}">${cableSvg(sp, c.state)}</g>`;
  }
  const wifi = obj(scene.wifi);
  if (wifi.apDeviceId && byId[wifi.apDeviceId]) {
    const apD = byId[wifi.apDeviceId], cl = byId[wifi.clientDeviceId];
    const A = siteAnchor('infra.ap'), C = cl ? siteAnchor(cl.roleId, cl.locationId || nurse.locationId) : siteAnchor('role.nurse', nurse.locationId);
    void apD;
    const ang = Math.atan2(C.y - A.y, C.x - A.x); const stl = stateStyle(wifi.state);
    let arcs = '';
    for (const r of [34, 62, 90]) {
      const a0 = ang - 0.45, a1 = ang + 0.45;
      const p0 = [A.x + Math.cos(a0) * r, A.y + Math.sin(a0) * r], p1 = [A.x + Math.cos(a1) * r, A.y + Math.sin(a1) * r];
      arcs += `<path d="M${r1(p0[0])},${r1(p0[1])} A${r},${r} 0 0 1 ${r1(p1[0])},${r1(p1[1])}" fill="none" stroke="#ffffff" stroke-width="8" opacity=".55" stroke-linecap="round"/><path d="M${r1(p0[0])},${r1(p0[1])} A${r},${r} 0 0 1 ${r1(p1[0])},${r1(p1[1])}" fill="none" stroke="${stl.c}" stroke-width="4.5" stroke-linecap="${stl.cap}"${stl.dash ? ` stroke-dasharray="${stl.dash}"` : ''}/>`;
    }
    const L = Math.hypot(C.x - A.x, C.y - A.y);
    arcs += `<path d="M${r1(A.x + Math.cos(ang) * 104)},${r1(A.y + Math.sin(ang) * 104)} L${r1(C.x - Math.cos(ang) * 28)},${r1(C.y - Math.sin(ang) * 28)}" stroke="${stl.c}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity="${L > 140 ? 0.8 : 0}"/>`;
    arcs += badge(C.x + 22, C.y - 26, wifi.state);
    over += `<g class="ap-wifi" data-state="${esc(wifi.state || 'installed')}">${arcs}</g>`;
  }
  const tp = obj(scene.testPulse);
  if (Array.isArray(tp.ids) && tp.ids.length > 1) {
    let dots = ''; let n = 0; const col = tp.pass ? PAL.okG : PAL.failR;
    for (let i = 1; i < tp.ids.length; i++) {
      const a = portOf(byId[tp.ids[i - 1]], scene), b = portOf(byId[tp.ids[i]], scene);
      let sp;
      if (a && b) sp = toScreen(routePts(a, b));
      else continue;
      const f = polyMid(sp);
      for (let j = 1; j <= 5; j++) { const p = f(j / 6); dots += `<g class="ap-packet" style="--i:${n++}" transform="translate(${r1(p[0])} ${r1(p[1])})"><circle r="7" fill="#ffffff"/><circle r="4.6" fill="${col}"/></g>`; }
    }
    over += `<g class="ap-test" data-pass="${tp.pass ? 'true' : 'false'}">${dots}</g>`;
  }
  const hl = obj(scene.highlight);
  if (hl.deviceId || hl.roleSlot) {
    const d = byId[hl.deviceId]; const a = d ? siteAnchor(d.roleId, d.locationId || nurse.locationId) : siteAnchor(hl.roleSlot, nurse.locationId);
    over += `<g class="ap-pulse" aria-hidden="true" style="transform-origin:${a.x}px ${a.y}px"><ellipse cx="${a.x}" cy="${a.y}" rx="56" ry="38" fill="none" stroke="#ffd23f" stroke-width="4"/><ellipse cx="${a.x}" cy="${a.y}" rx="66" ry="46" fill="none" stroke="#ffd23f" stroke-width="2" stroke-dasharray="7 6" opacity=".7"/><path d="M${a.x - 9},${a.y - 62} L${a.x},${a.y - 50} L${a.x + 9},${a.y - 62}" fill="none" stroke="#ffd23f" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  body += over;
  body += `<rect width="1600" height="1000" fill="url(#${uid('tint')})" pointer-events="none"/>`;
  return svgRoot(1600, 1000, 'Cut-away view of Harbour Street Clinic', body, 'ap-site');
}

/* =====================================================================
   YARD — Lantern Line depot at dawn
   ===================================================================== */
const Y_O = [614, 272], Y_U = 70;
const YS = Y_U / 60;
const Y = makeIso(Y_O[0], Y_O[1], Y_U);
const BENCH = { x0: 0.5, x1: 6.5, y0: 4.75, y1: 5.75, z: 0.95 };
const YARD_SPOTS = {
  'item.patch-cable': ['peg', 1.3, 2.2], 'item.power-cord': ['peg', 3.3, 2.2], 'item.phone-cord': ['peg', 5.3, 2.25],
  'item.link-tester': ['bench', 1.25], 'item.port-light': ['bench', 2.75], 'item.hdmi-cable': ['bench', 4.25], 'item.usb-cable': ['bench', 5.7]
};
const yardPos = (id) => { const s = YARD_SPOTS[id]; if (!s) return [800, 500]; return s[0] === 'peg' ? Y.P(s[1], 4.5, s[2]) : Y.P(s[1], (BENCH.y0 + BENCH.y1) / 2, BENCH.z + 0.25); };
const BAG = [9.0, 9.0];
export const YARD_ITEMS = Object.freeze(ITEM_IDS.map((id) => { const p = yardPos(id); return Object.freeze({ id, x: r1(p[0]), y: r1(p[1]) }); }));
export const YARD_BAG = (() => { const p = Y.P(BAG[0], BAG[1], 0.4); return Object.freeze({ x: r1(p[0]), y: r1(p[1]) }); })();

function skyDawn(w, h, id, horizon) {
  return `<linearGradient id="${uid(id)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4f7a"/><stop offset=".45" stop-color="#9b7ea3"/><stop offset=".75" stop-color="#f2a87a"/><stop offset="1" stop-color="#fbd9a0"/></linearGradient>` +
    `<radialGradient id="${uid(id + 's')}" cx="0.5" cy="1" r="0.6"><stop offset="0" stop-color="#fff1c2" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd08a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/></radialGradient>`;
}
function skyline(y, w, col, seed, hMax = 90) {
  let d = `M0,${y}`; let x = 0, i = 0;
  while (x < w) { const bw = 40 + ((seed * (i + 3) * 37) % 70); const bh = 20 + ((seed * (i + 7) * 53) % hMax); d += ` V${y - bh} H${x + bw}`; x += bw; i++; }
  return `<path d="${d} V${y + 2} H0Z" fill="${col}"/>`;
}
export function renderYard(yard) {
  yard = obj(yard); setUid('yard', yard);
  const packed = new Set(arr(yard.packed));
  let s = `<defs>${baseDefs()}${skyDawn(1600, 1000, 'sky')}</defs>`;
  s += `<rect width="1600" height="1000" fill="url(#${uid('sky')})"/><ellipse cx="1250" cy="330" rx="520" ry="260" fill="url(#${uid('skys')})"/><circle cx="1250" cy="300" r="44" fill="#fff4d0" opacity=".9"/>`;
  s += skyline(330, 1600, '#7c6f8e', 3, 110) + skyline(345, 1600, '#5e5a78', 7, 70);
  s += `<rect y="340" width="1600" height="660" fill="#6b6f78"/>`;
  // lot pad
  s += Y.poly([[-3, 0, 0], [16, 0, 0], [16, 13, 0], [-3, 13, 0]], '#8a8c90');
  { let d = ''; for (let x = -3; x <= 16; x += 2.5) { const a = Y.P(x, 0, 0), b = Y.P(x, 13, 0); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; } s += `<path d="${d}" stroke="#7d7f84" stroke-width="1.2"/>`; }
  for (const x of [13.6, 16.4]) s += Y.poly([[x, 1.5, 0.002], [x + 0.12, 1.5, 0.002], [x + 0.12, 8.5, 0.002], [x, 8.5, 0.002]], '#e9d79a');
  { const p = Y.P(3.2, 9.6, 0); s += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="70" ry="18" fill="#b9a3b4" opacity=".5"/><ellipse cx="${r1(p[0] + 10)}" cy="${r1(p[1] - 2)}" rx="30" ry="6" fill="#f6c99a" opacity=".5"/>`; }
  // fence at back
  { let f = ''; for (let x = -3; x <= 16; x += 1.5) f += Y.line([[x, 0, 0], [x, 0, 1.6]], '#4a4f57', 2); for (let y = 0; y <= 13; y += 1.5) f += Y.line([[-3, y, 0], [-3, y, 1.6]], '#4a4f57', 2); f += Y.line([[-3, 13, 1.6], [-3, 0, 1.6], [16, 0, 1.6]], '#4a4f57', 2.5); f += Y.poly([[-3, 0, 0.1], [16, 0, 0.1], [16, 0, 1.5], [-3, 0, 1.5]], '#4a4f57', ' opacity=".18"') + Y.poly([[-3, 0, 0.1], [-3, 13, 0.1], [-3, 13, 1.5], [-3, 0, 1.5]], '#4a4f57', ' opacity=".18"'); s += f; }
  // shed
  const SH = 3.4;
  s += softShadow(...Y.P(5.4, 3.6, 0), 480, 110, 0.6);
  s += Y.box(0, 2, 0, 10.4, 2.5, SH, { color: '#c9b79a', left: '#d9c8aa', right: '#a8957a', top: '#5e6b73' });
  s += Y.box(-0.15, 1.85, SH, 10.7, 2.8, 0.18, { color: '#e07a3a', top: '#56636b' });
  { let d = ''; for (let y = 2.3; y < 4.5; y += 0.36) { const a = Y.P(0, y, SH + 0.18), b = Y.P(10.4, y, SH + 0.18); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; } s += `<path d="${d}" stroke="#4d5960" stroke-width="1.4" opacity=".6"/>`; }
  s += Y.box(2.0, 2.9, SH + 0.18, 0.8, 0.8, 0.45, { color: '#9aa6ae' }) + Y.box(1.95, 2.85, SH + 0.63, 0.9, 0.9, 0.08, { color: '#7d878f' }) + Y.poly([[5.2, 2.6, SH + 0.19], [6.6, 2.6, SH + 0.19], [6.6, 3.8, SH + 0.19], [5.2, 3.8, SH + 0.19]], '#a9c6d6');
  // siding lines
  { let d = ''; for (let z = 0.4; z < SH; z += 0.4) { const a = Y.P(0, 4.5, z), b = Y.P(10.4, 4.5, z); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; const c = Y.P(10.4, 4.5, z), e = Y.P(10.4, 2, z); d += `M${r1(c[0])},${r1(c[1])}L${r1(e[0])},${r1(e[1])}`; } s += `<path d="${d}" stroke="#a89678" stroke-width="1" opacity=".55"/>`; }
  // roll-up door (mostly open)
  s += Y.poly([[7.0, 4.502, 0], [9.9, 4.502, 0], [9.9, 4.502, 2.75], [7.0, 4.502, 2.75]], '#2b2f36');
  s += Y.poly([[7.0, 4.505, 0], [9.9, 4.505, 0], [9.9, 4.505, 1.2], [7.0, 4.505, 1.2]], '#3a3f47', ' opacity=".6"');
  for (let i = 0; i < 3; i++) s += Y.box(7.3 + i * 0.85, 2.3, 0, 0.7, 0.5, 1.6 - i * 0.3, { color: ['#3d5a63', '#c99a62', '#5d666e'][i] });
  s += Y.poly([[7.0, 4.51, 2.2], [9.9, 4.51, 2.2], [9.9, 4.51, 2.75], [7.0, 4.51, 2.75]], '#b9c2c8') + Y.line([[7.0, 4.515, 2.35], [9.9, 4.515, 2.35]], '#8d979e', 1.2) + Y.line([[7.0, 4.515, 2.5], [9.9, 4.515, 2.5]], '#8d979e', 1.2);
  s += Y.box(6.85, 4.5, 0, 0.15, 0.08, 2.8, { color: '#7a848c' }) + Y.box(9.9, 4.5, 0, 0.15, 0.08, 2.8, { color: '#7a848c' });
  // warm interior light spill
  { const p = Y.P(8.45, 5.4, 0); s += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="140" ry="44" fill="url(#${uid('glow')})" opacity=".35"/>`; }
  // logo plate + lamp
  s += `<g transform="${Y.faceY(7.75, 4.505, 3.3)}"><rect width="1.4" height=".48" rx=".08" fill="${PAL.teal}"/><g transform="translate(.7 .24) scale(.0036)">${lantern(PAL.cream, PAL.teal, PAL.orange)}</g></g>`;
  { const p = Y.P(6.6, 4.5, 3.1); s += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1] + 60)}" rx="60" ry="80" fill="url(#${uid('glow')})" opacity=".55"/><rect x="${r1(p[0] - 10)}" y="${r1(p[1] - 4)}" width="20" height="9" rx="3" fill="#3a434b"/><ellipse cx="${r1(p[0])}" cy="${r1(p[1] + 6)}" rx="8" ry="3" fill="#fff4cc"/>`; }
  // pegboard
  s += `<g transform="${Y.faceY(0.6, 4.505, 3.05)}"><rect width="5.8" height="1.75" rx=".05" fill="#5f7480"/><rect x=".04" y=".04" width="5.72" height="1.67" fill="none" stroke="#4b5d67" stroke-width=".05"/>${Array.from({ length: 58 }, (_, i) => `<circle cx="${0.2 + (i % 29) * 0.2}" cy="${0.3 + Math.floor(i / 29) * 1.1}" r=".03" fill="#3e4d55"/>`).join('')}</g>`;
  for (const id of ['item.patch-cable', 'item.power-cord', 'item.phone-cord']) { const sp = YARD_SPOTS[id]; s += Y.line([[sp[1], 4.505, sp[2] + 0.55], [sp[1], 4.62, sp[2] + 0.62]], '#5d666e', 3); }
  // workbench
  const Bn = BENCH;
  s += softShadow(...Y.P(3.5, 5.6, 0), 260, 46, 0.7);
  for (const x of [Bn.x0 + 0.1, Bn.x1 - 0.2]) for (const y of [Bn.y0 + 0.1, Bn.y1 - 0.2]) s += Y.box(x, y, 0, 0.1, 0.1, Bn.z - 0.1, { color: '#5d666e' });
  s += Y.box(Bn.x0 + 0.15, Bn.y0 + 0.15, 0.3, Bn.x1 - Bn.x0 - 0.3, Bn.y1 - Bn.y0 - 0.3, 0.06, { color: '#8d979e' });
  s += Y.box(5.2, 4.85, 0.36, 0.9, 0.55, 0.3, { color: '#e07a3a' }) + Y.box(1.2, 4.9, 0.36, 1.1, 0.6, 0.25, { color: '#3d5a63' });
  s += Y.box(Bn.x0, Bn.y0, Bn.z - 0.1, Bn.x1 - Bn.x0, Bn.y1 - Bn.y0, 0.1, { color: '#b98b51', top: '#d8ad72' });
  // cable spool + cones
  { const c = Y.P(1.6, 8.6, 0); s += softShadow(c[0], c[1], 60, 20) + `<ellipse cx="${r1(c[0] - 6)}" cy="${r1(c[1] - 34)}" rx="22" ry="40" fill="#a77f50"/><rect x="${r1(c[0] - 6)}" y="${r1(c[1] - 60)}" width="24" height="52" fill="#3a7bd5"/><ellipse cx="${r1(c[0] + 18)}" cy="${r1(c[1] - 34)}" rx="22" ry="40" fill="#c99a62"/><ellipse cx="${r1(c[0] + 18)}" cy="${r1(c[1] - 34)}" rx="6" ry="11" fill="#7a5a3c"/>`; }
  const cone = (x, y) => { const p = Y.P(x, y, 0); return softShadow(p[0], p[1], 18, 7) + `<path d="M${r1(p[0] - 14)},${r1(p[1])} L${r1(p[0] - 4)},${r1(p[1] - 40)} H${r1(p[0] + 4)} L${r1(p[0] + 14)},${r1(p[1])}Z" fill="#e07a3a"/><path d="M${r1(p[0] - 9)},${r1(p[1] - 18)} H${r1(p[0] + 9)} L${r1(p[0] + 7)},${r1(p[1] - 26)} H${r1(p[0] - 7)}Z" fill="#f4ead4"/><rect x="${r1(p[0] - 17)}" y="${r1(p[1] - 3)}" width="34" height="5" rx="2" fill="#c4562a"/>`; };
  // van (rear open)
  const van = `<g class="ap-van" aria-hidden="true">${drawVan(Y, 10.9, 2.4, { orient: 'rear', variant: 'mentor', doors: 'open' })}</g>`;
  // items
  let shelfItems = '', bagItems = '';
  const hlId = yard.highlight;
  for (const id of ITEM_IDS) {
    const isP = packed.has(id);
    const ring = (x, y, r) => (hlId === id ? `<g class="ap-pulse" aria-hidden="true"><circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff6c8" opacity=".35"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="none" stroke="#ffd23f" stroke-width="4"/></g>` : '');
    if (!isP) {
      const [x, y] = yardPos(id); const peg = YARD_SPOTS[id][0] === 'peg';
      shelfItems += `<g class="ap-item" data-item-id="${esc(id)}" data-packed="false">${ring(x, y, r1(54 * YS))}${peg ? '' : softShadow(x, y + 26 * YS, 46 * YS, 10 * YS)}<g transform="translate(${r1(x)} ${r1(y)})">${itemArt(id, (peg ? 0.82 : 0.74) * YS)}</g></g>`;
    }
  }
  // bag
  const bp = Y.P(BAG[0], BAG[1], 0);
  let bag = softShadow(bp[0], bp[1] + 4, 110 * YS, 30 * YS) + `<g transform="translate(${r1(bp[0])} ${r1(bp[1])}) scale(${r1(YS * 100) / 100})"><path d="M-95,-10 L-80,-70 H80 L95,-10 Q0,12 -95,-10Z" fill="#3d5a63"/><path d="M-80,-70 Q0,-92 80,-70 L70,-60 Q0,-78 -70,-60Z" fill="#2b4249"/><path d="M-60,-74 Q0,-140 60,-74" fill="none" stroke="#e07a3a" stroke-width="8" stroke-linecap="round"/>`;
  let i = 0; const packedList = ITEM_IDS.filter((id) => packed.has(id));
  for (const id of packedList) { const px = -52 + (i % 4) * 34, py = -70 - Math.floor(i / 4) * 16; i++; bag += `<g class="ap-item" data-item-id="${esc(id)}" data-packed="true" transform="translate(${px} ${py})">${hlId === id ? `<circle class="ap-pulse" r="28" fill="none" stroke="#ffd23f" stroke-width="4"/>` : ''}${itemArt(id, 0.42)}</g>`; }
  bag += `<path d="M-95,-10 L-90,-40 Q0,-22 90,-40 L95,-10 Q0,12 -95,-10Z" fill="#4c6d77"/><rect x="-12" y="-36" width="24" height="12" rx="3" fill="#e07a3a"/><path d="M-90,-40 Q0,-22 90,-40" stroke="#2b4249" stroke-width="2" fill="none" stroke-dasharray="5 4"/></g>`;
  bag = `<g class="ap-bag" data-packed-count="${packedList.length}">${bag}</g>`;
  // people
  const place = (x, y, inner, k) => { const p = Y.P(x, y, 0); return `<g transform="translate(${r1(p[0])} ${r1(p[1])}) scale(${k})">${inner}</g>`; };
  const ment = `<g class="ap-person" data-person="mentor">${place(9.5, 6.9, figMags(yard.mentorPose), 1.5 * YS)}</g>`;
  const ply = yard.showPlayer === false ? '' : `<g class="ap-person" data-person="player">${place(7.0, 8.0, figPlayer(), 1.4 * YS)}</g>`;
  s += cone(0.6, 10.6) + cone(14.6, 1.2) + van + shelfItems + bag + ply + ment;
  s += `<rect width="1600" height="1000" fill="#ffb27a" opacity=".07"/>`;
  return svgRoot(1600, 1000, 'Lantern Line depot at dawn with the van loaded for the day', s, 'ap-yard');
}

/* =====================================================================
   VAN hero, TITLE, DRIVE
   ===================================================================== */
export function renderVan(o) {
  o = obj(o); setUid('van', o);
  const variant = o.variant === 'player' ? 'player' : 'mentor', doors = o.doors === 'open' ? 'open' : 'closed';
  const rear = doors === 'open';
  const U = 50;
  const ox = rear ? 300 + 2.05 * U : 300 - 1.55 * U, oy = rear ? 190 - 0.72 * U : 190 - 0.475 * U;
  const P = makeIso(ox, oy, U);
  let s = `<defs>${baseDefs()}<radialGradient id="${uid('spot')}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${variant === 'player' ? '#fff3d6' : '#e3f1ee'}"/><stop offset="1" stop-color="${variant === 'player' ? '#f0d9a8' : '#bcd8d2'}"/></radialGradient></defs>`;
  s += `<rect width="600" height="380" fill="url(#${uid('spot')})"/>`;
  if (o.shine) for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; s += `<path d="M300,190 L${r1(300 + Math.cos(a) * 520)},${r1(190 + Math.sin(a) * 520)} L${r1(300 + Math.cos(a + 0.16) * 520)},${r1(190 + Math.sin(a + 0.16) * 520)}Z" fill="#ffffff" opacity=".18"/>`; }
  s += `<ellipse cx="300" cy="${rear ? 318 : 312}" rx="270" ry="44" fill="#000" opacity=".06"/>`;
  s += drawVan(P, 0, 0, { orient: rear ? 'rear' : 'side', variant, doors, shine: !!o.shine });
  return svgRoot(600, 380, `${variant === 'player' ? 'Your new Lantern Line van, unit seven' : 'Mags’s Lantern Line van'}${rear ? ' with rear doors open' : ''}`, s, 'ap-van-hero');
}

export function renderTitle() {
  setUid('title', 1);
  const T = makeSide(700, 560, 62, 0.34, 0.42);
  let s = `<defs>${baseDefs()}${skyDawn(1600, 900, 'sky')}</defs><rect width="1600" height="900" fill="url(#${uid('sky')})"/><ellipse cx="1120" cy="420" rx="760" ry="330" fill="url(#${uid('skys')})"/><circle cx="1120" cy="330" r="64" fill="#fff4d0" opacity=".9"/>`;
  s += `<g opacity=".9">${[[160, 70, 30], [560, 120, 22], [1380, 90, 26]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 3}" ry="${r}" fill="#c9a6b8" opacity=".45"/>`).join('')}</g>`;
  s += skyline(470, 1600, '#8a7898', 5, 120) + skyline(484, 1600, '#675e80', 11, 80);
  s += `<rect y="480" width="1600" height="420" fill="#7d7a80"/>`;
  // lot, sidewalk, street (far to near)
  s += T.poly([[-30, -6, 0], [30, -6, 0], [30, 3.6, 0], [-30, 3.6, 0]], '#8a8890');
  { let d = ''; for (let x = -30; x < 30; x += 2.5) { const a = T.P(x, -6, 0), b = T.P(x, 3.6, 0); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; } s += `<path d="${d}" stroke="#7f7d85" stroke-width="1.2"/>`; }
  s += T.poly([[-30, 3.6, 0], [30, 3.6, 0], [30, 5.4, 0], [-30, 5.4, 0]], '#d4cab6') + T.box(-30, 5.4, -0.15, 60, 0.2, 0.15, '#b8ae99');
  s += T.poly([[-30, 5.6, -0.15], [30, 5.6, -0.15], [30, 18, -0.15], [-30, 18, -0.15]], '#4d5762');
  { let d = ''; for (let x = -30; x < 30; x += 3) { const a = T.P(x, 10.4, -0.15), b = T.P(x + 1.5, 10.4, -0.15); d += `M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`; } s += `<path d="${d}" stroke="#e9e1c6" stroke-width="4"/>`; }
  // fence behind lot
  { let f = ''; for (let x = -30; x < 30; x += 1.6) f += `<polyline points="${T.pts([[x, -5.8, 0], [x, -5.8, 1.5]])}" stroke="#4a4f57" stroke-width="2"/>`; f += `<polyline points="${T.pts([[-30, -5.8, 1.5], [30, -5.8, 1.5]])}" stroke="#4a4f57" stroke-width="2.5" fill="none"/>`; s += f; }
  // depot shed
  s += softShadow(...T.P(-6, 0.6, 0), 380, 40, 0.6);
  s += T.box(-12, -3.5, 0, 9.5, 3.5, 3.3, '#d3c1a2') + T.box(-12.15, -3.65, 3.3, 9.8, 3.8, 0.2, '#6a767e') + T.poly([[-12.15, 0.16, 3.3], [-2.35, 0.16, 3.3], [-2.35, 0.16, 3.5], [-12.15, 0.16, 3.5]], '#e07a3a');
  s += T.poly([[-7.6, 0.01, 0], [-4.4, 0.01, 0], [-4.4, 0.01, 2.6], [-7.6, 0.01, 2.6]], '#2b2f36') + T.poly([[-7.6, 0.02, 1.9], [-4.4, 0.02, 1.9], [-4.4, 0.02, 2.6], [-7.6, 0.02, 2.6]], '#b9c2c8');
  { const p = T.P(-6, 1.6, 0); s += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="150" ry="34" fill="url(#${uid('glow')})" opacity=".5"/>`; }
  { const p = T.P(-10.6, 0.02, 2.9); s += `<g transform="translate(${r1(p[0])} ${r1(p[1])})"><rect width="${r1(1.8 * 62)}" height="${r1(0.8 * 62)}" rx="8" fill="${PAL.teal}"/><g transform="translate(${r1(0.9 * 62)} ${r1(0.4 * 62)}) scale(.38)">${lantern(PAL.cream, PAL.teal, PAL.orange)}</g></g>`; }
  { const p = T.P(-3.2, 0.02, 2.95); s += `<rect x="${r1(p[0] - 14)}" y="${r1(p[1])}" width="28" height="9" rx="3" fill="#3a434b"/><ellipse cx="${r1(p[0])}" cy="${r1(p[1] + 70)}" rx="50" ry="80" fill="url(#${uid('glow')})" opacity=".5"/>`; }
  const treeT = (x, y, k) => { const p = T.P(x, y, 0); return softShadow(p[0] + 10, p[1] + 4, 60 * k, 14 * k) + `<rect x="${r1(p[0] - 5 * k)}" y="${r1(p[1] - 90 * k)}" width="${r1(10 * k)}" height="${r1(90 * k)}" fill="#5a4a3c"/><circle cx="${r1(p[0])}" cy="${r1(p[1] - 120 * k)}" r="${r1(54 * k)}" fill="#3f6f58"/><circle cx="${r1(p[0] - 24 * k)}" cy="${r1(p[1] - 140 * k)}" r="${r1(36 * k)}" fill="#548a68"/><circle cx="${r1(p[0] + 22 * k)}" cy="${r1(p[1] - 104 * k)}" r="${r1(30 * k)}" fill="#35604c"/>`; };
  const lampT = (x, y) => { const p = T.P(x, y, 0), t = T.P(x, y, 4.2); return `<rect x="${r1(p[0] - 3)}" y="${r1(t[1])}" width="6" height="${r1(p[1] - t[1])}" fill="#3a434b"/><rect x="${r1(p[0] - 14)}" y="${r1(t[1] - 7)}" width="28" height="10" rx="4" fill="#3a434b"/><ellipse cx="${r1(p[0])}" cy="${r1(t[1] + 90)}" rx="56" ry="100" fill="url(#${uid('glow')})" opacity=".45"/>`; };
  s += treeT(1.2, -2.8, 1.1) + treeT(10.5, -3.2, 1) + treeT(14.5, -1.5, 1.2);
  s += lampT(-1.5, 4.6) + lampT(12.5, 4.6);
  s += drawVan(T, -4.2, 6.2, { orient: 'side', variant: 'mentor' }) + drawVan(T, 2.6, 6.9, { orient: 'side', variant: 'player', shine: true });
  s += `<rect width="1600" height="900" fill="#ffb27a" opacity=".06"/>`;
  return svgRoot(1600, 900, 'Dawn outside the Lantern Line depot with two vans ready to go', s, 'ap-title');
}

export function renderDrive(o) {
  o = obj(o); setUid('drive', o);
  const t = Math.max(0, Math.min(1, Number(o.progress) || 0));
  let s = `<defs>${baseDefs()}<linearGradient id="${uid('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb8cf"/><stop offset=".7" stop-color="#f6d6a8"/><stop offset="1" stop-color="#fbe5bf"/></linearGradient></defs>`;
  s += `<rect width="1600" height="500" fill="url(#${uid('sky')})"/><circle cx="${r1(1300 - t * 80)}" cy="120" r="46" fill="#fff4d0" opacity=".9"/>`;
  // far hills (slow parallax)
  const off1 = -t * 200, off2 = -t * 600, off3 = -t * 1400;
  s += `<g transform="translate(${r1(off1)} 0)"><path d="M-100,300 Q100,200 300,280 T700,260 T1100,270 T1500,250 T1900,280 V340 H-100Z" fill="#a9c2b3"/></g>`;
  s += `<g transform="translate(${r1(off2 % 800)} 0)">${skyline(330, 2600, '#8fa7b0', 4, 110)}</g>`;
  // mid row of buildings
  let mid = '';
  const cols = ['#e3c79a', '#d98b5f', '#cfd8d2', '#b9a2c8', '#e8d9b5', '#9fc3b8'];
  for (let i = 0; i < 16; i++) { const x = i * 220, h = 110 + ((i * 47) % 70), c = cols[i % cols.length]; mid += `<rect x="${x}" y="${350 - h}" width="200" height="${h}" fill="${c}"/><rect x="${x}" y="${350 - h}" width="200" height="10" fill="${shade(c, -0.2)}"/>`; for (let r = 0; r < Math.floor(h / 40); r++) for (let k = 0; k < 4; k++) mid += `<rect x="${x + 20 + k * 45}" y="${350 - h + 24 + r * 40}" width="24" height="20" fill="#f6efe0" opacity=".8"/>`; }
  s += `<g transform="translate(${r1(off3 % 1320)} 0)">${mid}</g>`;
  // clinic arriving at the right
  const cx = r1(1700 - t * 640);
  s += `<g transform="translate(${cx} 0)"><rect x="0" y="200" width="420" height="150" fill="#f0dcc0"/><rect x="0" y="190" width="420" height="16" fill="#17675f"/><rect x="160" y="270" width="80" height="80" fill="#9fc6d6"/><path d="M200,270 V350" stroke="#f4ead4" stroke-width="4"/>${[30, 300].map((x) => `<rect x="${x}" y="240" width="90" height="60" fill="#bfe0ea" stroke="#f7f2e6" stroke-width="5"/>`).join('')}<rect x="186" y="214" width="28" height="40" rx="4" fill="#f4ead4"/><path d="M192,234 h16 M200,226 v16" stroke="#c0432f" stroke-width="5"/></g>`;
  // sidewalk + road
  s += `<rect y="350" width="1600" height="22" fill="#d9d1bf"/><rect y="372" width="1600" height="6" fill="#b8ae99"/><rect y="378" width="1600" height="122" fill="#4d5762"/>`;
  { let d = ''; const o4 = (off3 * 1.2) % 160; for (let x = -160; x < 1760; x += 160) d += `M${r1(x + o4)},445 h80`; s += `<path d="${d}" stroke="#e9e1c6" stroke-width="6"/>`; }
  // near lamps/trees (fast)
  let near = '';
  for (let i = 0; i < 6; i++) { const x = i * 420 + 60; near += `<rect x="${x}" y="200" width="7" height="160" fill="#3a434b"/><rect x="${x - 10}" y="194" width="27" height="9" rx="4" fill="#3a434b"/><circle cx="${x + 210}" cy="290" r="40" fill="#4f8f5e"/><circle cx="${x + 190}" cy="276" r="28" fill="#64a872"/><rect x="${x + 206}" y="300" width="8" height="58" fill="#6a4e36"/>`; }
  s += `<g transform="translate(${r1((off3 * 1.4) % 420)} 0)">${near}</g>`;
  // van
  const SP = makeSide(470, 430, 58, 0.18);
  s += `<g class="ap-van ap-van-drive">${drawVan(SP, 0, 0, { orient: 'side', variant: 'mentor' })}</g>`;
  s += `<g stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".6"><path d="M400,360 h-70 M410,330 h-110 M405,395 h-60"/></g>`;
  return svgRoot(1600, 500, 'Driving the Lantern Line van to Harbour Street Clinic', s, 'ap-drive');
}

/* =====================================================================
   CLOSE-UP
   ===================================================================== */
export function renderCloseup(c) {
  c = obj(c); setUid('close', c);
  const d = obj(c.device);
  const body = `<defs>${baseDefs()}</defs>` + renderCloseupBody(c);
  return svgRoot(800, 420, `Close-up of the ${esc(d.kind || 'device')} connection panel`, body, 'ap-closeup');
}

export { itemArt, ITEM_IDS, mix, prism, drawFaces, sparkle };
