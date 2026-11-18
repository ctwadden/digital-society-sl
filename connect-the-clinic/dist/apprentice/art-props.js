/**
 * Opening Shift — shared art core: projection helpers, colour helpers, solids,
 * vans, equipment, pickable items and the device close-up panel.
 * Pure functions only: no DOM, no randomness, no network.
 */

/* ---------------- tiny utils ---------------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const r1 = (n) => Math.round(n * 10) / 10;
export const arr = (v) => (Array.isArray(v) ? v : []);
export const obj = (v) => (v && typeof v === 'object' ? v : {});

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
let UID = 'ap';
export const setUid = (prefix, input) => { let j = ''; try { j = JSON.stringify(input) || ''; } catch (e) { j = ''; } UID = 'ap' + prefix + hashStr(j); return UID; };
export const uid = (k) => `${UID}-${k}`;

/* ---------------- colour ---------------- */
function h2r(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const r2h = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };
export const shade = (c, t) => (t >= 0 ? mix(c, '#ffffff', t) : mix(c, '#17202b', -t));
export function desat(c, amt = 0.82, wash = '#e1e5e7', w = 0.4) {
  const [r, g, b] = h2r(c); const l = 0.3 * r + 0.59 * g + 0.11 * b;
  return mix(r2h([r + (l - r) * amt, g + (l - g) * amt, b + (l - b) * amt]), wash, w);
}
export const dimSvg = (s) => s.replace(/#[0-9a-fA-F]{6}\b/g, (m) => desat(m));

export const PAL = {
  teal: '#17675f', tealL: '#2a8a7f', tealD: '#0f4a44', cream: '#f4ead4', creamD: '#e2d3b2', orange: '#e07a3a', rust: '#c4562a',
  ink: '#1f2a33', steel: '#9aa6ae', char: '#2c343b', okG: '#2f8f5b', failR: '#c0432f', staleA: '#c58a1d', instB: '#3f6f8f',
  glass: '#9fc6d6', tire: '#22262b', yellow: '#f2c230', wood: '#c99a62'
};
export const STATE_STYLE = {
  installed: { c: PAL.instB, dash: '', cap: 'round' },
  'tested-ok': { c: PAL.okG, dash: '', cap: 'round' },
  'tested-fail': { c: PAL.failR, dash: '9 6', cap: 'butt' },
  stale: { c: PAL.staleA, dash: '0.1 7', cap: 'round' }
};
export const stateStyle = (s) => STATE_STYLE[s] || STATE_STYLE.installed;

/* ---------------- projection ---------------- */
const LIGHT = (() => { const v = [0.35, 0.78, 1]; const m = Math.hypot(...v); return v.map((x) => x / m); })();

/** Make a 2:1 isometric projection. x runs screen down-right, y down-left, z up. */
export function makeIso(ox, oy, U) {
  const P = (x, y, z = 0) => [ox + (x - y) * U, oy + (x + y) * U / 2 - z * U];
  const pts = (a) => a.map((p) => { const q = P(p[0], p[1], p[2] || 0); return r1(q[0]) + ',' + r1(q[1]); }).join(' ');
  const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}"${extra}/>`;
  const line = (a, stroke, w = 1, extra = '') => `<polyline points="${pts(a)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
  /** isoBox(x,y,z,w,d,h,{color|top,left,right,stroke}) – w along x, d along y, h up */
  const box = (x, y, z, w, d, h, o = {}) => {
    const b = o.color || '#cccccc';
    const top = o.top || shade(b, 0.16), left = o.left || b, right = o.right || shade(b, -0.2);
    const s = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 0.8}" stroke-linejoin="round"` : '';
    return poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left, s) +
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right, s) +
      poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top, s);
  };
  const m = (a, b, c, d, p) => `matrix(${r1(a * 100) / 100} ${r1(b * 100) / 100} ${r1(c * 100) / 100} ${r1(d * 100) / 100} ${r1(p[0])} ${r1(p[1])})`;
  /** transforms mapping local units (1 = one world unit) onto faces; origin = top-left corner of the face as seen */
  const faceY = (x, y, z) => m(U, U / 2, 0, U, P(x, y, z)); // plane y=const, u→+x, v→down
  const faceX = (x, y, z) => m(U, -U / 2, 0, U, P(x, y, z)); // plane x=const, u→-y, v→down
  const floorM = (x, y, z) => m(U, U / 2, -U, U / 2, P(x, y, z)); // plane z=const, u→+x, v→+y
  const ring = (x, y, z, r, extra) => { const a = []; for (let i = 0; i < 28; i++) { const t = (i / 28) * Math.PI * 2; a.push([x + Math.cos(t) * r, y + Math.sin(t) * r, z]); } return `<polygon points="${pts(a)}"${extra}/>`; };
  return { P, pts, poly, line, box, faceX, faceY, floorM, ring, U, V: [1, 1, 1] };
}

/** Oblique side projection (camera on +y side, slightly above) for the drive scene. */
export function makeSide(ox, oy, U, k = 0.22, skew = 0.12) {
  const P = (x, y, z = 0) => [ox + x * U - y * U * skew, oy - z * U + y * U * k];
  const pts = (a) => a.map((p) => { const q = P(p[0], p[1], p[2] || 0); return r1(q[0]) + ',' + r1(q[1]); }).join(' ');
  const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}"${extra}/>`;
  const box = (x, y, z, w, d, h, col) => drawFaces(PR, prism([[x, z], [x + w, z], [x + w, z + h], [x, z + h]], y, y + d, (a, b, c) => [a, b, c]), () => col);
  const PR = { P, pts, poly, box, U, V: [skew, 1, k] };
  return PR;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
export const lit = (base, n) => shade(base, (dot(n, LIGHT) - 0.62) * 0.62);

/** Convex prism: profile [[s,z]...] extruded t0..t1, mapped by fn(s,t,z)->world. Returns faces. */
export function prism(profile, t0, t1, map) {
  const faces = []; const n = profile.length;
  const cS = profile.reduce((a, p) => a + p[0], 0) / n, cZ = profile.reduce((a, p) => a + p[1], 0) / n;
  const C = map(cS, (t0 + t1) / 2, cZ);
  const add = (loc, key) => {
    const w = loc.map((p) => map(p[0], p[1], p[2]));
    let nn = norm(cross(sub(w[1], w[0]), sub(w[2], w[0])));
    const fc = w.reduce((a, p) => [a[0] + p[0] / w.length, a[1] + p[1] / w.length, a[2] + p[2] / w.length], [0, 0, 0]);
    if (dot(nn, sub(fc, C)) < 0) nn = nn.map((v) => -v);
    faces.push({ w, n: nn, key });
  };
  add(profile.map((p) => [p[0], t0, p[1]]), 'side0');
  add(profile.map((p) => [p[0], t1, p[1]]), 'side1');
  for (let i = 0; i < n; i++) { const a = profile[i], b = profile[(i + 1) % n]; add([[a[0], t0, a[1]], [b[0], t0, b[1]], [b[0], t1, b[1]], [a[0], t1, a[1]]], 'e' + i); }
  return faces;
}
export function drawFaces(proj, faces, colorFn, extra = '') {
  let s = '';
  for (const f of faces) {
    if (dot(f.n, proj.V) <= 0.0001) continue;
    const c = colorFn(f); if (!c) continue;
    s += `<polygon points="${proj.pts(f.w)}" fill="${lit(c, f.n)}"${extra}/>`;
  }
  return s;
}

/* ---------------- defs ---------------- */
export function baseDefs() {
  return `<radialGradient id="${uid('sh')}"><stop offset="0" stop-color="#0d1a22" stop-opacity=".34"/><stop offset=".6" stop-color="#0d1a22" stop-opacity=".14"/><stop offset="1" stop-color="#0d1a22" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${uid('glow')}"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${uid('glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6ecf3"/><stop offset=".45" stop-color="#8fb9cb"/><stop offset=".5" stop-color="#b8d8e4"/><stop offset="1" stop-color="#6d99ad"/></linearGradient>` +
    `<linearGradient id="${uid('steel')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d8891"/><stop offset=".35" stop-color="#e3e8ec"/><stop offset=".6" stop-color="#a9b4bb"/><stop offset="1" stop-color="#6c767e"/></linearGradient>`;
}
export const softShadow = (cx, cy, rx, ry, op = 1) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="url(#${uid('sh')})"${op < 1 ? ` opacity="${op}"` : ''}/>`;
export function svgRoot(w, h, title, body, cls = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" class="ap-art ${cls}" preserveAspectRatio="xMidYMid meet"><title>${esc(title)}</title>${body}</svg>`;
}

/* ---------------- brand glyph ---------------- */
/** Lantern Line glyph centred at 0,0 within roughly ±50. */
export function lantern(body = PAL.teal, glass = PAL.cream, flame = PAL.orange) {
  return `<path d="M-22,-34 Q0,-62 22,-34" fill="none" stroke="${body}" stroke-width="7" stroke-linecap="round"/>` +
    `<rect x="-30" y="-36" width="60" height="12" rx="5" fill="${body}"/>` +
    `<rect x="-24" y="-26" width="48" height="52" rx="12" fill="${glass}" stroke="${body}" stroke-width="7"/>` +
    `<path d="M0,-14 C9,-3 9,8 0,14 C-9,8 -9,-3 0,-14Z" fill="${flame}"/>` +
    `<rect x="-30" y="26" width="60" height="11" rx="5" fill="${body}"/>`;
}

/* ---------------- van ---------------- */
const VL = 5.2, VW = 2.1, VH = 2.35, CL = 0.42;
/** orient 'side': length along +x, front at +x (shows left side + front). 'rear': length along -y, rear faces +y (shows rear + side). */
export function vanMap(x0, y0, orient) {
  return orient === 'rear' ? (s, t, z) => [x0 + t, y0 + (VL - s), z] : (s, t, z) => [x0 + s, y0 + t, z];
}
export function drawVan(proj, x0, y0, o = {}) {
  const orient = o.orient === 'rear' ? 'rear' : 'side';
  const player = o.variant === 'player';
  const body = player ? PAL.cream : PAL.teal, roof = player ? '#fbf6ea' : PAL.cream;
  const stripe = player ? PAL.teal : PAL.orange;
  const map = vanMap(x0, y0, orient);
  const P3 = (s, t, z) => proj.P(...map(s, t, z));
  const ptsL = (a) => a.map((p) => { const q = P3(p[0], p[1], p[2]); return r1(q[0]) + ',' + r1(q[1]); }).join(' ');
  const polyL = (a, fill, extra = '') => `<polygon points="${ptsL(a)}" fill="${fill}"${extra}/>`;
  const vis = (n) => dot(n, proj.V) > 0.0001;
  const sideN = norm(sub(map(0, 1, 0), map(0, 0, 0)));
  const rearN = norm(sub(map(0, 0, 0), map(1, 0, 0)));
  const frontN = rearN.map((v) => -v);
  const T = VW; // visible side plane t
  let s = '';
  // shadow
  const c0 = P3(VL / 2, VW / 2, 0);
  s += softShadow(c0[0], c0[1] + 4, proj.U * 3.6, proj.U * 1.5, 0.9);
  s += polyL([[-0.15, -0.1, 0], [VL + 0.15, -0.1, 0], [VL + 0.15, VW + 0.12, 0], [-0.15, VW + 0.12, 0]], '#0d1a22', ' opacity=".16"');
  // wheels
  const wheel = (sc, t, dark) => {
    const a = [], b = [], hub = [];
    for (let i = 0; i < 20; i++) { const q = (i / 20) * Math.PI * 2; a.push([sc + Math.cos(q) * 0.43, t, 0.43 + Math.sin(q) * 0.43]); b.push([sc + Math.cos(q) * 0.43, t + (vis(sideN) ? 0.22 : -0.22), 0.43 + Math.sin(q) * 0.43]); hub.push([sc + Math.cos(q) * 0.22, t + 0.02, 0.43 + Math.sin(q) * 0.22]); }
    return polyL(b, '#15181c') + polyL(a, dark ? '#191c20' : PAL.tire) + (dark ? '' : polyL(hub, '#aab3ba') + polyL(hub.map((p) => [p[0] + (p[0] - sc) * -0.45, p[1] + 0.01, 0.43 + (p[2] - 0.43) * 0.55]), '#6f7a83'));
  };
  s += wheel(0.95, 0.1, true) + wheel(4.25, 0.1, true);
  // solids
  const A = prism([[0, CL], [4.6, CL], [4.6, 1.3], [4.08, 2.18], [3.86, VH], [0, VH]], 0, VW, map);
  const B = prism([[4.55, CL], [5.12, CL], [VL, 0.62], [VL, 1.12], [5.05, 1.24], [4.55, 1.32]], 0.04, VW - 0.04, map);
  const colA = (f) => (f.key === 'e2' ? '#7fa9bb' : f.key === 'e3' || f.key === 'e4' ? roof : f.key === 'e0' ? '#222' : body);
  const colB = (f) => (f.key === 'e0' ? '#222' : body);
  const cA = map(2.3, 1, 1), cB = map(4.9, 1, 1);
  const dA = cA[0] + cA[1], dB = cB[0] + cB[1];
  const solidA = drawFaces(proj, A, colA), solidB = drawFaces(proj, B, colB);
  s += (dB > dA || orient === 'side') ? solidA + solidB : solidB + solidA;
  // bumpers + skirt
  if (vis(sideN)) {
    s += polyL([[0.02, T + 0.01, CL], [4.55, T + 0.01, CL], [4.55, T + 0.01, CL + 0.16], [0.02, T + 0.01, CL + 0.16]], shade(body, -0.35));
    // wheel arches
    for (const sc of [0.95, 4.25]) { const a = []; for (let i = 0; i <= 12; i++) { const q = (i / 12) * Math.PI; a.push([sc + Math.cos(q) * 0.56, T + 0.012, CL + 0.04 + Math.sin(q) * 0.56]); } s += polyL(a, '#20262c'); }
    // stripe
    s += polyL([[0.02, T + 0.012, 1.02], [4.58, T + 0.012, 1.02], [4.58, T + 0.012, 1.22], [0.02, T + 0.012, 1.22]], stripe);
    if (!player) s += polyL([[0.02, T + 0.012, 0.96], [4.58, T + 0.012, 0.96], [4.58, T + 0.012, 0.99], [0.02, T + 0.012, 0.99]], PAL.cream);
    // cab window
    s += polyL([[3.92, T + 0.012, 1.42], [4.5, T + 0.012, 1.42], [4.04, T + 0.012, 2.12], [3.92, T + 0.012, 2.12]], `url(#${uid('glass')})`);
    // door seams
    const seam = (a, b) => `<polyline points="${ptsL([a, b])}" stroke="${shade(body, -0.38)}" stroke-width="1" fill="none" opacity=".7"/>`;
    s += seam([3.82, T + 0.013, CL + 0.18], [3.82, T + 0.013, 2.2]) + seam([2.35, T + 0.013, CL + 0.18], [2.35, T + 0.013, 2.2]) + seam([0.3, T + 0.013, CL + 0.18], [0.3, T + 0.013, 2.2]);
    s += polyL([[3.62, T + 0.015, 1.35], [3.74, T + 0.015, 1.35], [3.74, T + 0.015, 1.41], [3.62, T + 0.015, 1.41]], '#2a3036');
    // logo on cargo side
    const lo = P3(1.32, T + 0.015, 1.72), sideU = sub(P3(2.32, T, 1.72), lo), sideV = sub(P3(1.32, T, 0.72), lo);
    const sc = 0.0072;
    s += `<g transform="matrix(${r1(sideU[0] * sc * 1000) / 1000} ${r1(sideU[1] * sc * 1000) / 1000} ${r1(sideV[0] * sc * 1000) / 1000} ${r1(sideV[1] * sc * 1000) / 1000} ${r1(lo[0])} ${r1(lo[1])})"><circle r="52" fill="${player ? PAL.teal : PAL.cream}"/>${lantern(player ? PAL.cream : PAL.teal, player ? PAL.teal : PAL.cream, PAL.orange)}</g>`;
    if (player) {
      // big unit number seven on the sliding door
      s += polyL([[2.55, T + 0.016, 2.0], [3.45, T + 0.016, 2.0], [3.45, T + 0.016, 1.84], [3.12, T + 0.016, 1.3], [2.9, T + 0.016, 1.3], [3.22, T + 0.016, 1.84], [2.55, T + 0.016, 1.84]], PAL.teal);
    }
  }
  // front details
  if (vis(frontN)) {
    const F = VL + 0.012;
    s += polyL([[F, 0.45, 0.66], [F, VW - 0.45, 0.66], [F, VW - 0.45, 1.02], [F, 0.45, 1.02]], '#2a3036');
    for (const t of [0.12, VW - 0.42]) s += polyL([[F, t, 0.8], [F, t + 0.3, 0.8], [F, t + 0.3, 1.04], [F, t, 1.04]], '#fff4cc');
    s += polyL([[F + 0.03, -0.02, CL], [F + 0.03, VW + 0.02, CL], [F + 0.03, VW + 0.02, 0.62], [F + 0.03, -0.02, 0.62]], '#3a4148');
  }
  // rear
  if (vis(rearN)) {
    const R = -0.012;
    if (o.doors === 'open') {
      const op = [[R, 0.08, CL + 0.18], [R, VW - 0.08, CL + 0.18], [R, VW - 0.08, VH - 0.08], [R, 0.08, VH - 0.08]];
      const cid = uid('vanclip' + Math.round(x0 * 10) + Math.round(y0 * 10));
      let inner = polyL(op, '#262c33');
      inner += polyL([[3.4, 0.08, CL + 0.2], [3.4, VW - 0.08, CL + 0.2], [3.4, VW - 0.08, VH - 0.1], [3.4, 0.08, VH - 0.1]], '#3b444c');
      inner += polyL([[0, 0.08, CL + 0.2], [3.4, 0.08, CL + 0.2], [3.4, VW - 0.08, CL + 0.2], [0, VW - 0.08, CL + 0.2]], '#59636b');
      inner += polyL([[0, 0.08, CL + 0.2], [3.4, 0.08, CL + 0.2], [3.4, 0.08, VH - 0.1], [0, 0.08, VH - 0.1]], '#4a535b');
      const binC = ['#e07a3a', '#2a8a7f', '#8b98a2', '#e0b23a', '#3f6f8f', '#c4562a'];
      let k = 0;
      for (const side of [0.08, VW - 0.62]) {
        for (const z of [0.95, 1.5, 2.0]) {
          inner += polyL([[0.05, side, z], [3.3, side, z], [3.3, side + 0.54, z], [0.05, side, z]].slice(0, 3).concat([[0.05, side + 0.54, z]]), '#c9b28a');
          inner += polyL([[0.05, side, z], [0.05, side + 0.54, z], [0.05, side + 0.54, z - 0.06], [0.05, side, z - 0.06]], '#a8895c');
          // bins on the shelf
          for (let i = 0; i < 2; i++) {
            const s0 = 0.12 + i * 0.75, col = binC[k++ % binC.length];
            const bf = prism([[s0, z], [s0 + 0.6, z], [s0 + 0.6, z + 0.3], [s0, z + 0.3]], side + 0.04, side + 0.5, map);
            inner += drawFaces(proj, bf, () => col);
            if ((k + i) % 2) { const cc = P3(s0 + 0.05, side + 0.27, z + 0.36); inner += `<ellipse cx="${r1(cc[0])}" cy="${r1(cc[1])}" rx="${r1(proj.U * 0.16)}" ry="${r1(proj.U * 0.08)}" fill="none" stroke="${k % 3 ? '#3a7bd5' : '#26292d'}" stroke-width="${r1(proj.U * 0.05)}"/>`; }
          }
        }
      }
      // floor cable reel
      const rc = P3(0.6, VW / 2, CL + 0.42);
      inner += `<circle cx="${r1(rc[0])}" cy="${r1(rc[1])}" r="${r1(proj.U * 0.25)}" fill="#e07a3a"/><circle cx="${r1(rc[0])}" cy="${r1(rc[1])}" r="${r1(proj.U * 0.17)}" fill="#3a7bd5"/><circle cx="${r1(rc[0])}" cy="${r1(rc[1])}" r="${r1(proj.U * 0.06)}" fill="#2a3036"/>`;
      s += `<clipPath id="${cid}"><polygon points="${ptsL(op)}"/></clipPath><g clip-path="url(#${cid})">${inner}</g>`;
      s += `<polygon points="${ptsL(op)}" fill="none" stroke="${shade(body, -0.35)}" stroke-width="2"/>`;
      // interior light glow
      const lc = P3(0.4, VW / 2, VH - 0.25);
      s += `<ellipse cx="${r1(lc[0])}" cy="${r1(lc[1])}" rx="${r1(proj.U * 0.5)}" ry="${r1(proj.U * 0.2)}" fill="url(#${uid('glow')})" opacity=".55"/>`;
      // right leaf folded against the side, left leaf swung toward viewer
      const DW = VW / 2 - 0.04;
      s += polyL([[0.02, VW + 0.05, CL + 0.2], [DW, VW + 0.05, CL + 0.2], [DW, VW + 0.05, VH - 0.06], [0.02, VW + 0.05, VH - 0.06]], shade(body, 0.02), ` stroke="${shade(body, -0.3)}" stroke-width="1"`);
      s += polyL([[0.2, VW + 0.06, 1.55], [DW - 0.15, VW + 0.06, 1.55], [DW - 0.15, VW + 0.06, 2.1], [0.2, VW + 0.06, 2.1]], `url(#${uid('glass')})`);
      const leftDoor = [[-0.03, -0.04, CL + 0.2], [-DW, -0.04, CL + 0.2], [-DW, -0.04, VH - 0.06], [-0.03, -0.04, VH - 0.06]];
      s += polyL(leftDoor, shade(body, -0.12), ` stroke="${shade(body, -0.4)}" stroke-width="1"`);
      s += polyL([[-0.12, -0.035, 0.75], [-DW + 0.1, -0.035, 0.75], [-DW + 0.1, -0.035, 1.35], [-0.12, -0.035, 1.35]], '#d6d0c2');
      s += polyL([[-0.2, -0.03, 1.55], [-DW + 0.15, -0.03, 1.55], [-DW + 0.15, -0.03, 2.1], [-0.2, -0.03, 2.1]], `url(#${uid('glass')})`);
    } else {
      s += polyL([[R, 0.08, CL + 0.2], [R, VW - 0.08, CL + 0.2], [R, VW - 0.08, VH - 0.08], [R, 0.08, VH - 0.08]], body, ` stroke="${shade(body, -0.35)}" stroke-width="1"`);
      s += `<polyline points="${ptsL([[R, VW / 2, CL + 0.2], [R, VW / 2, VH - 0.08]])}" stroke="${shade(body, -0.4)}" stroke-width="1.2"/>`;
      for (const t of [0.22, VW / 2 + 0.1]) s += polyL([[R, t, 1.55], [R, t + 0.78, 1.55], [R, t + 0.78, 2.12], [R, t, 2.12]], `url(#${uid('glass')})`);
      s += polyL([[R, 0.08, 1.02], [R, VW - 0.08, 1.02], [R, VW - 0.08, 1.22], [R, 0.08, 1.22]], stripe);
    }
    for (const t of [-0.02, VW - 0.16]) s += polyL([[R - 0.01, t, 0.75], [R - 0.01, t + 0.18, 0.75], [R - 0.01, t + 0.18, 1.2], [R - 0.01, t, 1.2]], '#c8322b');
    s += polyL([[R - 0.06, -0.03, CL], [R - 0.06, VW + 0.03, CL], [R - 0.06, VW + 0.03, 0.62], [R - 0.06, -0.03, 0.62]], '#3a4148');
  }
  // near wheels
  s += vis(sideN) ? wheel(0.95, VW - 0.1, false) + wheel(4.25, VW - 0.1, false) : '';
  // ladder rack on roof
  if (!o.noRack) {
    const rail = (t) => drawFaces(proj, prism([[0.25, VH + 0.18], [3.6, VH + 0.18], [3.6, VH + 0.27], [0.25, VH + 0.27]], t, t + 0.08, map), () => '#b9c2c8');
    let rk = rail(0.25);
    for (const sc of [0.5, 1.6, 2.7, 3.45]) rk += drawFaces(proj, prism([[sc, VH], [sc + 0.08, VH], [sc + 0.08, VH + 0.18], [sc, VH + 0.18]], 0.25, VW - 0.25, map), () => '#8d979e');
    for (let i = 0; i < 6; i++) { const sc = 0.45 + i * 0.6; rk += drawFaces(proj, prism([[sc, VH + 0.27], [sc + 0.07, VH + 0.27], [sc + 0.07, VH + 0.33], [sc, VH + 0.33]], 0.6, VW - 0.6, map), () => '#cfd6db'); }
    rk += drawFaces(proj, prism([[0.4, VH + 0.27], [3.5, VH + 0.27], [3.5, VH + 0.35], [0.4, VH + 0.35]], 0.6, 0.68, map), () => '#e3e8ea') + drawFaces(proj, prism([[0.4, VH + 0.27], [3.5, VH + 0.27], [3.5, VH + 0.35], [0.4, VH + 0.35]], VW - 0.68, VW - 0.6, map), () => '#e3e8ea');
    rk += rail(VW - 0.33);
    s += rk;
  }
  if (o.shine) {
    const a = P3(0.6, T + 0.02, 2.15), b = P3(1.3, T + 0.02, 2.15), c = P3(0.3, T + 0.02, 0.7), d = P3(0.6, T + 0.02, 0.7);
    s += `<polygon points="${r1(a[0])},${r1(a[1])} ${r1(b[0])},${r1(b[1])} ${r1(d[0])},${r1(d[1])} ${r1(c[0])},${r1(c[1])}" fill="#ffffff" opacity=".28"/>`;
    const e = P3(2.0, T + 0.02, 2.15), f = P3(2.25, T + 0.02, 2.15), g = P3(1.65, T + 0.02, 0.7), h = P3(1.4, T + 0.02, 0.7);
    s += `<polygon points="${r1(e[0])},${r1(e[1])} ${r1(f[0])},${r1(f[1])} ${r1(g[0])},${r1(g[1])} ${r1(h[0])},${r1(h[1])}" fill="#ffffff" opacity=".2"/>`;
    for (const [ss, zz, k] of [[3.2, 2.42, 1], [0.4, 2.0, 0.7], [4.9, 1.2, 0.8]]) { const q = P3(ss, T, zz); s += sparkle(q[0], q[1], proj.U * 0.32 * k); }
  }
  return s;
}
export const sparkle = (x, y, r) => `<path d="M${r1(x)},${r1(y - r)} Q${r1(x + r * 0.15)},${r1(y - r * 0.15)} ${r1(x + r)},${r1(y)} Q${r1(x + r * 0.15)},${r1(y + r * 0.15)} ${r1(x)},${r1(y + r)} Q${r1(x - r * 0.15)},${r1(y + r * 0.15)} ${r1(x - r)},${r1(y)} Q${r1(x - r * 0.15)},${r1(y - r * 0.15)} ${r1(x)},${r1(y - r)}Z" fill="#fffbe8"/>`;

/* ---------------- screens ---------------- */
/** Screen content in a 100x62 box. mode: off|idle|waiting|working|denied */
export function screenArt(mode) {
  if (mode === 'off') return `<rect width="100" height="62" fill="#161c22"/><path d="M8,0 L40,0 L10,62 L0,62 L0,14Z" fill="#ffffff" opacity=".05"/>`;
  if (mode === 'waiting') return `<rect width="100" height="62" fill="#c3cad0"/><rect width="100" height="9" fill="#9aa4ac"/><circle cx="50" cy="35" r="14" fill="#eef1f3" stroke="#6c7780" stroke-width="3"/><path d="M50,26 V35 L57,39" stroke="#4d5861" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#8d98a1"><circle cx="38" cy="55" r="2"/><circle cx="46" cy="55" r="2"/><circle cx="54" cy="55" r="2"/><circle cx="62" cy="55" r="2"/></g>`;
  if (mode === 'denied') return `<rect width="100" height="62" fill="#3a2a2e"/><rect width="100" height="9" fill="#c0432f"/><rect x="38" y="30" width="24" height="20" rx="3" fill="#f4ead4"/><path d="M42,30 V24 a8,8 0 0 1 16,0 V30" fill="none" stroke="#f4ead4" stroke-width="4"/><circle cx="50" cy="39" r="3" fill="#3a2a2e"/><rect x="49" y="40" width="2" height="6" fill="#3a2a2e"/>`;
  if (mode === 'working') {
    let s = `<rect width="100" height="62" fill="#f7f8fa"/><rect width="100" height="9" fill="#17675f"/><rect x="3" y="2.5" width="4" height="4" rx="1" fill="#f4ead4"/><rect width="18" height="53" y="9" fill="#e7eef0"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="3" y="${13 + i * 8}" width="12" height="4" rx="1.5" fill="${i === 1 ? '#2a8a7f' : '#b9c9cd'}"/>`;
    const blocks = [[22, 13, 16, 9, '#e07a3a'], [41, 13, 16, 15, '#4a90c8'], [60, 13, 16, 9, '#2f8f5b'], [79, 22, 17, 12, '#e0b23a'], [22, 26, 16, 12, '#4a90c8'], [60, 28, 16, 14, '#e07a3a'], [41, 33, 16, 9, '#8f6fc8'], [22, 44, 16, 9, '#2f8f5b'], [79, 40, 17, 13, '#4a90c8'], [41, 47, 16, 9, '#e0b23a']];
    for (const [x, y, w, h, c] of blocks) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${21 + i * 19}" y="10" width="0.6" height="52" fill="#dfe4e8"/>`;
    return s;
  }
  return `<defs><linearGradient id="${uid('wall')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a8a7f"/><stop offset="1" stop-color="#173f4a"/></linearGradient></defs><rect width="100" height="62" fill="url(#${uid('wall')})"/><g transform="translate(50 31) scale(.28)">${lantern('#f4ead4', '#2a8a7f', '#e07a3a')}</g>`;
}

/* ---------------- pickable items (screen-space sprites, ~110x80 at k=1) ---------------- */
function rj45(x, y, k, ang = 0, cable = '#2f6fd0') {
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${ang}) scale(${k})"><rect x="-7" y="-2" width="14" height="14" rx="2" fill="${cable}"/><rect x="-9" y="-20" width="18" height="19" rx="2" fill="#e8f4fa" opacity=".85" stroke="#9fb9c6" stroke-width="1.2"/><path d="M-6,-19 v6 M-3.6,-19 v6 M-1.2,-19 v6 M1.2,-19 v6 M3.6,-19 v6 M6,-19 v6" stroke="#d4a72c" stroke-width="1.1"/><path d="M-4,-1 L-3,-9 H3 L4,-1" fill="#cfe3ec" opacity=".9"/></g>`;
}
function coil(cx, cy, rx, ry, n, col, w, step = 4) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<ellipse cx="${r1(cx + (i - n / 2) * step * 0.6)}" cy="${r1(cy + (i - n / 2) * 1.2)}" rx="${rx}" ry="${ry}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  return s + `<ellipse cx="${r1(cx)}" cy="${r1(cy - ry * 0.35)}" rx="${r1(rx * 0.7)}" ry="${r1(ry * 0.35)}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".25"/>`;
}
export function itemArt(id, k = 1) {
  let s = '';
  switch (id) {
    case 'item.patch-cable':
      s = coil(0, -6, 34, 22, 5, '#2f6fd0', 5, 3) + `<path d="M24,6 C34,16 36,22 30,30" fill="none" stroke="#2f6fd0" stroke-width="5"/><path d="M-26,8 C-36,18 -40,24 -34,32" fill="none" stroke="#2f6fd0" stroke-width="5"/>` + rj45(30, 46, 1.1, 180) + rj45(-34, 48, 1.1, 170);
      break;
    case 'item.power-cord':
      s = coil(0, -8, 32, 21, 5, '#24272b', 6, 3) + `<path d="M26,4 C36,14 34,24 28,30" fill="none" stroke="#24272b" stroke-width="6"/><path d="M-24,6 C-34,16 -36,26 -30,30" fill="none" stroke="#24272b" stroke-width="6"/>` +
        `<g transform="translate(28 40)"><rect x="-12" y="-12" width="24" height="24" rx="6" fill="#1b1d20"/><rect x="-8" y="-3" width="16" height="13" rx="2" fill="#0c0d0f"/><rect x="-5" y="0" width="2" height="6" fill="#555"/><rect x="3" y="0" width="2" height="6" fill="#555"/><rect x="-1" y="5" width="2" height="4" fill="#555"/></g>` +
        `<g transform="translate(-30 40)"><rect x="-11" y="-12" width="22" height="20" rx="4" fill="#1b1d20"/><rect x="-7" y="8" width="3" height="9" fill="#cfd4d8"/><rect x="4" y="8" width="3" height="9" fill="#cfd4d8"/></g>`;
      break;
    case 'item.link-tester':
      s = `<g transform="rotate(-8)"><rect x="-38" y="-34" width="46" height="72" rx="9" fill="#e9b81f"/><rect x="-38" y="-34" width="46" height="72" rx="9" fill="none" stroke="#a87c0e" stroke-width="2"/><rect x="-32" y="-26" width="34" height="22" rx="3" fill="#23302f"/><rect x="-29" y="-23" width="12" height="4" fill="#5fd18b"/><rect x="-29" y="-16" width="20" height="3" fill="#5fd18b" opacity=".6"/><circle cx="-24" cy="6" r="5" fill="#2c343b"/><circle cx="-8" cy="6" r="5" fill="#2c343b"/><rect x="-30" y="18" width="30" height="8" rx="4" fill="#2c343b"/><rect x="-22" y="-40" width="14" height="8" rx="1" fill="#2c343b"/></g>` +
        `<g transform="translate(30 14) rotate(10)"><rect x="-14" y="-20" width="28" height="40" rx="7" fill="#e9b81f" stroke="#a87c0e" stroke-width="2"/><circle cx="0" cy="-6" r="4" fill="#5fd18b"/><rect x="-6" y="-26" width="12" height="7" fill="#2c343b"/></g>`;
      break;
    case 'item.port-light':
      s = `<path d="M18,-10 L60,-34 L60,22 L18,8Z" fill="#fff2a8" opacity=".55"/><g transform="rotate(-12)"><rect x="-44" y="-9" width="58" height="18" rx="6" fill="#3a434b"/><rect x="-26" y="-9" width="6" height="18" fill="#e07a3a"/><rect x="10" y="-13" width="14" height="26" rx="4" fill="#59646d"/><ellipse cx="24" cy="0" rx="3" ry="11" fill="#fff6c8"/><rect x="-6" y="-12" width="8" height="5" rx="2" fill="#e07a3a"/></g>`;
      break;
    case 'item.hdmi-cable':
      s = coil(0, -8, 30, 19, 4, '#141518', 8, 4) + `<path d="M24,4 C34,16 32,24 26,30" fill="none" stroke="#141518" stroke-width="8"/>` +
        `<g transform="translate(26 42)"><rect x="-13" y="-14" width="26" height="18" rx="3" fill="#2a2d31"/><path d="M-12,4 H12 L9,18 H-9Z" fill="#c9cfd4" stroke="#7c868e"/><rect x="-7" y="8" width="14" height="4" fill="#3a3f44"/></g>` +
        `<path d="M-22,6 C-32,16 -32,24 -28,32" fill="none" stroke="#141518" stroke-width="8"/><g transform="translate(-28 44) rotate(8)"><rect x="-13" y="-14" width="26" height="18" rx="3" fill="#2a2d31"/><path d="M-12,4 H12 L9,18 H-9Z" fill="#c9cfd4" stroke="#7c868e"/></g>`;
      break;
    case 'item.usb-cable':
      s = coil(0, -6, 30, 18, 4, '#8b949b', 3, 3) + `<path d="M22,4 C30,14 30,22 26,30" fill="none" stroke="#8b949b" stroke-width="3"/><g transform="translate(26 40)"><rect x="-7" y="-10" width="14" height="14" rx="2" fill="#5d666e"/><rect x="-6" y="4" width="12" height="13" fill="#d7dde1" stroke="#8a949b"/><rect x="-3" y="7" width="6" height="3" fill="#7a848c"/></g>` +
        `<path d="M-20,6 C-28,16 -28,22 -24,28" fill="none" stroke="#8b949b" stroke-width="3"/><g transform="translate(-24 36)"><rect x="-5" y="-8" width="10" height="12" rx="2" fill="#5d666e"/><rect x="-3.5" y="4" width="7" height="6" rx="1" fill="#d7dde1"/></g>`;
      break;
    case 'item.phone-cord': {
      let c = '';
      for (let i = 0; i < 15; i++) { const t = i / 14, x = -34 + t * 68, y = -6 - Math.sin(t * Math.PI) * 16; c += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="3.6" ry="8" fill="none" stroke="#a8906a" stroke-width="3.6"/><ellipse cx="${r1(x)}" cy="${r1(y)}" rx="3.6" ry="8" fill="none" stroke="#ead9b2" stroke-width="2"/>`; }
      s = c + `<path d="M34,-6 C42,4 42,12 38,18" fill="none" stroke="#d8c7a0" stroke-width="2.6"/><path d="M-34,-6 C-42,4 -42,12 -36,18" fill="none" stroke="#d8c7a0" stroke-width="2.6"/>` +
        `<g transform="translate(38 26) rotate(180) scale(.7)"><rect x="-5" y="-2" width="10" height="12" rx="2" fill="#d8c7a0"/><rect x="-7" y="-17" width="14" height="16" rx="2" fill="#eef6fa" opacity=".85" stroke="#a7bcc6" stroke-width="1.2"/><path d="M-3,-16 v5 M0,-16 v5 M3,-16 v5" stroke="#d4a72c" stroke-width="1.1"/></g>` +
        `<g transform="translate(-36 26) rotate(170) scale(.7)"><rect x="-5" y="-2" width="10" height="12" rx="2" fill="#d8c7a0"/><rect x="-7" y="-17" width="14" height="16" rx="2" fill="#eef6fa" opacity=".85" stroke="#a7bcc6" stroke-width="1.2"/></g>`;
      break;
    }
    default:
      s = `<rect x="-24" y="-18" width="48" height="36" rx="6" fill="#b9c2c8"/>`;
  }
  return `<g transform="scale(${k})">${s}</g>`;
}
export const ITEM_IDS = ['item.patch-cable', 'item.power-cord', 'item.link-tester', 'item.port-light', 'item.hdmi-cable', 'item.usb-cable', 'item.phone-cord'];

/* ---------------- close-up panel ---------------- */
const CK = (k) => (['desktop', 'laptop', 'tablet', 'server', 'switch4', 'switch8', 'access-point'].includes(k) ? k : 'desktop');
/** Socket list for a kind: [{id, socket, x, y, w, h, portIndex?}] in the 800x420 close-up. */
export function CLOSEUP_SOCKETS(kind, portCount) {
  const k = CK(kind); const out = [];
  const add = (id, socket, x, y, w, h, extra) => out.push(Object.assign({ id, socket, x, y, w, h }, extra || {}));
  const eth = (n, x0, gap, y = 220, w = 54, h = 46) => { for (let i = 0; i < n; i++) add('eth' + (i + 1), 'ethernet', x0 + i * gap, y, w, h, { portIndex: i }); };
  const pc = Math.max(1, Math.min(8, Number(portCount) || 0));
  if (k === 'desktop') { add('power', 'power', 140, 220, 70, 56); add('hdmi', 'hdmi', 335, 220, 66, 30); add('usb1', 'usb', 440, 200, 46, 18); add('usb2', 'usb', 440, 240, 46, 18); eth(Math.max(1, Number(portCount) || 1) > 2 ? 2 : Math.max(1, Number(portCount) || 1), 560, 80); }
  else if (k === 'server') { add('power', 'power', 140, 220, 70, 56); add('usb1', 'usb', 330, 220, 46, 18); eth(Number(portCount) ? Math.min(4, pc) : 1, 440, 76); }
  else if (k === 'switch4') { add('power', 'power', 130, 220, 70, 56); eth(Number(portCount) ? Math.min(8, pc) : 4, 330, 96, 228); }
  else if (k === 'switch8') { add('power', 'power', 118, 220, 64, 52); eth(Number(portCount) ? pc : 8, 268, 60, 228, 46, 42); }
  else if (k === 'access-point') { add('power', 'power', 300, 225, 44, 44); eth(1, 470, 80); }
  else if (k === 'laptop') { add('usbc1', 'usb', 260, 220, 40, 14); add('usbc2', 'usb', 330, 220, 40, 14); add('audio', 'audio', 420, 220, 18, 18); }
  else { add('usbc1', 'usb', 330, 220, 40, 14); add('audio', 'audio', 430, 220, 18, 18); }
  return out;
}
function rj45Socket(x, y, w, h) {
  return `<rect x="${r1(x - w / 2 - 4)}" y="${r1(y - h / 2 - 4)}" width="${w + 8}" height="${h + 8}" rx="4" fill="#9aa4ab"/><path d="M${r1(x - w / 2)},${r1(y - h / 2)} h${w} v${r1(h * 0.78)} h-${r1(w * 0.3)} v${r1(h * 0.22)} h-${r1(w * 0.4)} v-${r1(h * 0.22)} h-${r1(w * 0.3)}Z" fill="#14181c"/>` +
    `<path d="${Array.from({ length: 8 }, (_, i) => `M${r1(x - w * 0.36 + i * w * 0.103)},${r1(y - h / 2 + 3)} v${r1(h * 0.18)}`).join(' ')}" stroke="#d4a72c" stroke-width="1.6"/>`;
}
function rj45Plugged(x, y, w, h, color = '#2f6fd0', bottom = 420) {
  return `<rect x="${r1(x - w / 2 - 4)}" y="${r1(y - h / 2 - 4)}" width="${w + 8}" height="${h + 8}" rx="4" fill="#9aa4ab"/><path d="M${r1(x)},${r1(y + h / 2 + 18)} C${r1(x)},${r1(y + h / 2 + 70)} ${r1(x + 18)},${r1(bottom - 40)} ${r1(x + 12)},${bottom + 10}" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round"/>` +
    `<rect x="${r1(x - w / 2 + 2)}" y="${r1(y - h / 2 + 2)}" width="${w - 4}" height="${h - 4}" rx="3" fill="#dcecf3" opacity=".92" stroke="#8fb1c1" stroke-width="1.5"/><rect x="${r1(x - w * 0.28)}" y="${r1(y + h / 2 - 4)}" width="${r1(w * 0.56)}" height="24" rx="5" fill="${color}"/><rect x="${r1(x - w * 0.36)}" y="${r1(y - h / 2 + 6)}" width="${r1(w * 0.72)}" height="5" fill="#d4a72c" opacity=".8"/>`;
}
const iecSocket = (x, y, w, h) => `<path d="M${r1(x - w / 2)},${r1(y - h / 2)} h${w} v${r1(h * 0.66)} l-${r1(w * 0.18)},${r1(h * 0.34)} h-${r1(w * 0.64)} l-${r1(w * 0.18)},-${r1(h * 0.34)}Z" fill="#14181c" stroke="#5c666e" stroke-width="3"/><rect x="${r1(x - w * 0.3)}" y="${r1(y - 8)}" width="7" height="15" rx="1.5" fill="#b9c2c8"/><rect x="${r1(x + w * 0.3 - 7)}" y="${r1(y - 8)}" width="7" height="15" rx="1.5" fill="#b9c2c8"/><rect x="${r1(x - 3.5)}" y="${r1(y - h * 0.38)}" width="7" height="13" rx="1.5" fill="#b9c2c8"/>`;
const hdmiSocket = (x, y, w, h) => `<path d="M${r1(x - w / 2 - 5)},${r1(y - h / 2 - 5)} h${w + 10} v${h * 0.55 + 5} l-9,${h * 0.45 + 5} h-${w - 8} l-9,-${h * 0.45 + 5}Z" fill="#c4ccd2"/><path d="M${r1(x - w / 2)},${r1(y - h / 2)} h${w} v${r1(h * 0.55)} l-7,${r1(h * 0.45)} h-${w - 14} l-7,-${r1(h * 0.45)}Z" fill="#14181c"/><rect x="${r1(x - w * 0.36)}" y="${r1(y - 3)}" width="${r1(w * 0.72)}" height="6" fill="#d4a72c" opacity=".7"/>`;
const usbSocket = (x, y, w, h) => `<rect x="${r1(x - w / 2 - 4)}" y="${r1(y - h / 2 - 4)}" width="${w + 8}" height="${h + 8}" rx="2" fill="#c4ccd2"/><rect x="${r1(x - w / 2)}" y="${r1(y - h / 2)}" width="${w}" height="${h}" fill="#15191d"/><rect x="${r1(x - w / 2 + 3)}" y="${r1(y - h / 2 + 2)}" width="${w - 6}" height="${r1(h * 0.42)}" fill="#3a6fb8"/>`;
const usbcSocket = (x, y, w, h) => `<rect x="${r1(x - w / 2 - 3)}" y="${r1(y - h / 2 - 3)}" width="${w + 6}" height="${h + 6}" rx="${r1(h / 2 + 3)}" fill="#c4ccd2"/><rect x="${r1(x - w / 2)}" y="${r1(y - h / 2)}" width="${w}" height="${h}" rx="${r1(h / 2)}" fill="#15191d"/><rect x="${r1(x - w * 0.3)}" y="${r1(y - 1.5)}" width="${r1(w * 0.6)}" height="3" rx="1.5" fill="#6e7a84"/>`;
const audioSocket = (x, y, w) => `<circle cx="${x}" cy="${y}" r="${w / 2 + 4}" fill="#c4ccd2"/><circle cx="${x}" cy="${y}" r="${w / 2}" fill="#15191d"/>`;
const dcSocket = (x, y, w) => `<circle cx="${x}" cy="${y}" r="${w / 2 + 5}" fill="#9aa4ab"/><circle cx="${x}" cy="${y}" r="${w / 2}" fill="#15191d"/><circle cx="${x}" cy="${y}" r="${w / 6}" fill="#c9a24a"/>`;

/** Plug held in hand at lower-left. */
export function heldPlug(type) {
  const hand = `<path d="M-60,170 L-14,96 L40,118 L18,170Z" fill="${PAL.teal}"/><path d="M-40,140 L-4,104" stroke="#e8c14a" stroke-width="6"/>` +
    `<rect x="14" y="64" width="72" height="54" rx="22" fill="#b97f57"/><path d="M30,74 q8,-6 16,0 M46,74 q8,-6 16,0 M62,76 q8,-6 14,2" stroke="#93613f" stroke-width="2.4" fill="none"/>` +
    `<path d="M20,80 C6,70 8,52 26,54 L40,60" fill="#c98b5f"/><rect x="10" y="88" width="60" height="30" rx="14" fill="#c98b5f"/>`;
  let p = '', cab = '#2f6fd0', cw = 13;
  if (type === 'ethernet') p = `<rect x="30" y="0" width="34" height="32" rx="4" fill="#e3f1f7" opacity=".92" stroke="#8fb1c1" stroke-width="2"/><path d="M34,4 h26" stroke="#d4a72c" stroke-width="6" stroke-dasharray="2 1.4"/><path d="M40,32 L42,46 H52 L54,32" fill="#cfe3ec"/><rect x="36" y="44" width="22" height="24" rx="5" fill="#2f6fd0"/>`;
  else if (type === 'power') { cab = '#24272b'; p = `<rect x="22" y="0" width="50" height="40" rx="9" fill="#1b1d20"/><path d="M30,8 h34 v18 l-6,8 h-22 l-6,-8Z" fill="#0c0d0f"/><rect x="36" y="14" width="5" height="10" fill="#666"/><rect x="53" y="14" width="5" height="10" fill="#666"/><rect x="34" y="40" width="26" height="28" rx="6" fill="#1b1d20"/>`; }
  else if (type === 'hdmi') { cab = '#141518'; cw = 15; p = `<path d="M28,0 h40 v12 l-6,8 h-28 l-6,-8Z" fill="#c9cfd4" stroke="#7c868e" stroke-width="2"/><rect x="26" y="20" width="44" height="30" rx="5" fill="#2a2d31"/><rect x="36" y="48" width="24" height="20" rx="4" fill="#2a2d31"/>`; }
  else if (type === 'usb') { cab = '#8b949b'; cw = 8; p = `<rect x="36" y="0" width="24" height="22" fill="#d7dde1" stroke="#8a949b" stroke-width="2"/><rect x="40" y="5" width="16" height="6" fill="#7a848c"/><rect x="33" y="22" width="30" height="34" rx="5" fill="#5d666e"/>`; }
  else if (type === 'phone') { cab = '#d8c7a0'; cw = 5; p = `<rect x="38" y="8" width="20" height="22" rx="3" fill="#eef6fa" opacity=".92" stroke="#a7bcc6" stroke-width="2"/><path d="M42,12 h12" stroke="#d4a72c" stroke-width="4" stroke-dasharray="1.6 2.4"/><rect x="41" y="30" width="14" height="18" rx="3" fill="#d8c7a0"/>`; }
  else return '';
  return `<g class="ap-held" data-held="${esc(type)}" transform="translate(40 262)" aria-hidden="true"><path d="M48,60 C50,100 40,130 30,170" fill="none" stroke="${cab}" stroke-width="${cw}" stroke-linecap="round"/>${p}${hand}</g>`;
}

export function renderCloseupBody(c) {
  c = obj(c); const d = obj(c.device); const kind = CK(d.kind); const id = esc(d.id || 'device'); const powered = !!d.powered;
  const ports = arr(d.ports).filter((p) => p && typeof p === 'object');
  const eths = ports.filter((p) => p.medium !== 'wifi');
  const wifis = ports.filter((p) => p.medium === 'wifi');
  const socks = CLOSEUP_SOCKETS(kind, eths.length || undefined);
  const hl = c.highlightPortId;
  let s = `<rect width="800" height="420" fill="#e9e1cf"/><rect y="300" width="800" height="120" fill="#cdb48c"/><rect y="300" width="800" height="6" fill="#b89c70"/>` +
    `<path d="M0,330 H800 M0,370 H800" stroke="#bfa47a" stroke-width="1" opacity=".6"/>`;
  // chassis
  const mobile = kind === 'laptop' || kind === 'tablet';
  const bx = mobile ? 150 : kind === 'access-point' ? 200 : 60, bw = mobile ? 500 : kind === 'access-point' ? 400 : 680;
  const by = mobile ? 170 : 120, bh = mobile ? 100 : 200;
  const chassis = kind === 'switch4' || kind === 'switch8' ? '#4b5660' : kind === 'server' ? '#2f363d' : kind === 'access-point' ? '#eef0ee' : mobile ? '#b7c0c7' : '#d9dcdc';
  s += softShadow(400, by + bh + 14, bw * 0.55, 22);
  s += `<rect x="${bx}" y="${by - 26}" width="${bw}" height="30" rx="10" fill="${shade(chassis, 0.18)}"/>`;
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${chassis}"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="none" stroke="${shade(chassis, -0.3)}" stroke-width="3"/>`;
  s += `<rect x="${bx + 10}" y="${by + 8}" width="${bw - 20}" height="5" rx="2.5" fill="#ffffff" opacity=".25"/>`;
  // vents
  if (kind === 'desktop' || kind === 'server') { let v = ''; for (let i = 0; i < 6; i++) v += `<rect x="${660}" y="${by + 30 + i * 24}" width="56" height="9" rx="4.5" fill="${shade(chassis, -0.32)}"/>`; s += v; }
  if (kind === 'server') { let v = ''; const leds = [['#5fd18b', powered], ['#5fd18b', powered], ['#f0b43c', powered]]; leds.forEach(([col, on], i) => { v += `<circle cx="${700}" cy="${by + 40 + i * 0}" r="0"/>`; v += `<circle cx="${110 + i * 34}" cy="${by + 30}" r="7" fill="${on ? col : '#4a535b'}"/>${on ? `<circle cx="${110 + i * 34}" cy="${by + 30}" r="13" fill="${col}" opacity=".25"/><circle cx="${110 + i * 34}" cy="${by + 30}" r="2.5" fill="#ffffff"/>` : ''}`; }); s += v; }
  if (kind === 'access-point') s += `<circle cx="400" cy="${by - 10}" r="9" fill="${powered ? '#58c7d6' : '#9aa4ab'}"/>${powered ? `<circle cx="400" cy="${by - 10}" r="16" fill="#58c7d6" opacity=".3"/>` : ''}<circle cx="560" cy="225" r="4" fill="#9aa4ab"/>`;
  if (mobile) s += `<rect x="${bx + 30}" y="${by + bh - 22}" width="${bw - 60}" height="6" rx="3" fill="${shade(chassis, -0.2)}"/>`;
  let e = 0; const total = eths.length;
  for (const k of socks) {
    if (k.socket === 'ethernet') {
      const p = eths[e]; const idx = e++;
      const occupied = p && p.cableId;
      const sw = k.w, sh = k.h;
      let g = occupied ? rj45Plugged(k.x, k.y, sw, sh) : rj45Socket(k.x, k.y, sw, sh);
      if (kind === 'switch4' || kind === 'switch8' || kind === 'server' || kind === 'desktop' || kind === 'access-point') {
        const on = occupied && powered;
        g += `<rect x="${k.x - sw / 2}" y="${k.y - sh / 2 - 22}" width="12" height="8" rx="2" fill="${on ? '#4fd17f' : '#3b444b'}"/>${on ? `<rect x="${k.x - sw / 2 - 4}" y="${k.y - sh / 2 - 26}" width="20" height="16" rx="5" fill="#4fd17f" opacity=".3"/><rect x="${k.x - sw / 2 + 3}" y="${k.y - sh / 2 - 20}" width="5" height="3" fill="#eaffef"/>` : ''}`;
        g += `<rect x="${k.x + sw / 2 - 12}" y="${k.y - sh / 2 - 22}" width="12" height="8" rx="2" fill="${on ? '#f0b43c' : '#3b444b'}"/>`;
      }
      if (hl && p && hl === p.id) g += `<g class="ap-pulse" aria-hidden="true"><rect x="${k.x - sw / 2 - 14}" y="${k.y - sh / 2 - 32}" width="${sw + 28}" height="${sh + 46}" rx="12" fill="none" stroke="#ffd23f" stroke-width="5"/><rect x="${k.x - sw / 2 - 20}" y="${k.y - sh / 2 - 38}" width="${sw + 40}" height="${sh + 58}" rx="16" fill="none" stroke="#ffd23f" stroke-width="2" opacity=".5" stroke-dasharray="6 5"/></g>`;
      if (p) s += `<g class="ap-port" data-port-id="${esc(p.id)}" data-socket="ethernet" data-occupied="${occupied ? 'true' : 'false'}">${g}</g>`;
      else s += `<g aria-hidden="true" opacity=".85">${g}</g>`;
      void idx; void total;
    } else {
      let g = '';
      if (k.socket === 'power') g = kind === 'access-point' ? dcSocket(k.x, k.y, k.w * 0.6) : iecSocket(k.x, k.y, k.w, k.h);
      else if (k.socket === 'hdmi') g = hdmiSocket(k.x, k.y, k.w, k.h);
      else if (k.socket === 'usb') g = mobile ? usbcSocket(k.x, k.y, k.w, k.h) : usbSocket(k.x, k.y, k.w, k.h);
      else if (k.socket === 'audio') g = audioSocket(k.x, k.y, k.w);
      if (k.socket === 'power' && powered) g += kind === 'access-point' ? `<path d="M${k.x},${k.y + 27} C${k.x},${k.y + 60} ${k.x - 30},${k.y + 90} ${k.x - 40},430" stroke="#24272b" stroke-width="10" fill="none" stroke-linecap="round"/>` : `<rect x="${k.x - k.w / 2 + 4}" y="${k.y - k.h / 2 + 4}" width="${k.w - 8}" height="${k.h - 8}" rx="6" fill="#1b1d20"/><path d="M${k.x},${k.y + k.h / 2} C${k.x},${k.y + 70} ${k.x - 30},${k.y + 110} ${k.x - 40},430" stroke="#24272b" stroke-width="14" fill="none" stroke-linecap="round"/>`;
      if (hl && hl === `${d.id}.${k.id}`) g += `<rect class="ap-pulse" x="${k.x - k.w / 2 - 14}" y="${k.y - k.h / 2 - 14}" width="${k.w + 28}" height="${k.h + 28}" rx="12" fill="none" stroke="#ffd23f" stroke-width="5"/>`;
      s += `<g class="ap-socket" data-socket="${k.socket}" data-socket-id="${id}.${k.id}">${g}</g>`;
    }
  }
  // wifi ports (radio) — drawn as an antenna badge
  wifis.forEach((p, i) => {
    const x = mobile ? bx + bw - 70 : bx + bw - 120, y = mobile ? by + 50 : by + bh - 40 - i * 46;
    const on = powered;
    s += `<g class="ap-port" data-port-id="${esc(p.id)}" data-socket="wifi"><circle cx="${x}" cy="${y}" r="20" fill="${on ? '#e3f6f3' : '#c3c9cd'}" stroke="${shade(chassis, -0.3)}" stroke-width="2"/><path d="M${x - 11},${y - 2} a15,15 0 0 1 22,0 M${x - 6},${y + 3} a8,8 0 0 1 12,0" fill="none" stroke="${on ? '#17675f' : '#7a848c'}" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y + 8}" r="2.6" fill="${on ? '#17675f' : '#7a848c'}"/></g>`;
  });
  // power switch
  if (mobile) {
    const x = bx + 70, y = by + 50;
    s += `<g class="ap-power" data-device-id="${id}" data-on="${powered}"><circle cx="${x}" cy="${y}" r="20" fill="${shade(chassis, -0.1)}" stroke="${shade(chassis, -0.35)}" stroke-width="3"/><path d="M${x - 7},${y - 6} a10,10 0 1 0 14,0" fill="none" stroke="${powered ? '#4fd17f' : '#59636b'}" stroke-width="3.4" stroke-linecap="round"/><path d="M${x},${y - 12} v10" stroke="${powered ? '#4fd17f' : '#59636b'}" stroke-width="3.4" stroke-linecap="round"/>${powered ? `<circle cx="${x}" cy="${y}" r="27" fill="none" stroke="#4fd17f" stroke-width="3" opacity=".45"/>` : ''}</g>`;
  } else {
    const x = kind === 'access-point' ? 380 : kind === 'switch8' ? 190 : 225, y = 220;
    s += `<g class="ap-power" data-device-id="${id}" data-on="${powered}"><rect x="${x - 18}" y="${y - 30}" width="36" height="60" rx="5" fill="#15191d"/>` +
      (powered ? `<path d="M${x - 13},${y - 25} h26 v22 l-26,6Z" fill="#3a434b"/><path d="M${x - 13},${y + 3} l26,-6 v28 h-26Z" fill="#20262b"/><rect x="${x - 2}" y="${y - 21}" width="4" height="12" rx="1" fill="#e7ecef"/>` :
        `<path d="M${x - 13},${y - 25} h26 v28 l-26,-6Z" fill="#20262b"/><path d="M${x - 13},${y - 3} l26,6 v22 h-26Z" fill="#3a434b"/><circle cx="${x}" cy="${y + 14}" r="5" fill="none" stroke="#e7ecef" stroke-width="2.4"/>`) +
      `<circle cx="${x}" cy="${y - 46}" r="6" fill="${powered ? '#4fd17f' : '#3b444b'}"/>${powered ? `<circle cx="${x}" cy="${y - 46}" r="12" fill="#4fd17f" opacity=".3"/><circle cx="${x}" cy="${y - 46}" r="2" fill="#fff"/>` : ''}</g>`;
  }
  if (c.heldCable) s += heldPlug(c.heldCable);
  return s;
}
