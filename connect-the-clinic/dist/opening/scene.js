/**
 * Opening Shift — original vector artwork, authored for this project.
 * Presentation only: every device, connection and observation comes from view.
 * No network, readiness, placement-validity or outcome rules live here.
 */
export const SCENE_ANCHORS = Object.freeze({
  reception: Object.freeze({ x: 240, y: 400 }),
  examA: Object.freeze({ x: 670, y: 235 }),
  examB: Object.freeze({ x: 680, y: 425 }),
  equipment: Object.freeze({ x: 260, y: 180 })
});

const COLORS = Object.freeze({
  ink: '#273f46', teal: '#326b6b', sage: '#a9bcaa', ivory: '#faf7ef',
  coral: '#d67c65', darkCoral: '#9e4c3c', slate: '#74888b', gold: '#b67c34'
});
const LOCATION_KEY = Object.freeze({
  'location.reception': 'reception', 'location.exam-a': 'examA',
  'location.exam-b': 'examB', 'location.equipment': 'equipment'
});
const KIND_NAME = Object.freeze({ desktop: 'Desktop computer', laptop: 'Laptop computer',
  tablet: 'Tablet computer', server: 'Service host', switch4: 'Four-port switch',
  switch8: 'Eight-port switch', 'access-point': 'Wireless access point' });
const OFFSETS = Object.freeze({
  equipment: { 'role.records': [-69, 38], 'infra.switch': [15, 27], 'infra.ap': [110, 28],
    'role.reception': [-40, 89], 'role.nurse': [70, 87] },
  reception: { 'role.reception': [0, 0], 'role.nurse': [105, -40], 'role.records': [-60, -20],
    'infra.switch': [70, 40], 'infra.ap': [140, -100] },
  examA: { 'role.nurse': [0, 0], 'role.reception': [-75, 70], 'role.records': [115, 40],
    'infra.switch': [-80, 20], 'infra.ap': [95, -50] },
  examB: { 'role.nurse': [0, 0], 'role.reception': [-75, 70], 'role.records': [115, 40],
    'infra.switch': [-80, 20], 'infra.ap': [95, -50] }
});

const list = value => Array.isArray(value) ? value : [];
const escape = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const short = (value, length = 86) => { const s = String(value ?? ''); return s.length > length ? s.slice(0, length - 1) + '…' : s; };
const deviceList = view => list(view?.devices).filter(d => d && typeof d.id === 'string');

/** Device IDs map to scene-coordinate desk/foot anchors. Off-site objects are omitted. */
export function getDeviceAnchors(view = {}) {
  const anchors = {};
  for (const d of deviceList(view)) {
    if (!Object.hasOwn(LOCATION_KEY, d.locationId)) continue;
    const zone = LOCATION_KEY[d.locationId];
    const p = SCENE_ANCHORS[zone];
    const offset = Object.hasOwn(OFFSETS[zone], d.roleId) ? OFFSETS[zone][d.roleId] : [0, 0];
    Object.defineProperty(anchors, d.id, { value: { x: p.x + offset[0], y: p.y + offset[1] }, enumerable: true });
  }
  return anchors;
}

function screen(powered, x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${powered ? '#d9e9dd' : '#3a5056'}"/>${powered ?
    `<path d="M${x + 5} ${y + 7}h${w - 10}" stroke="#88aaa0" stroke-width="3"/><path d="M${x + 5} ${y + 14}h${w * .42}M${x + 5} ${y + 19}h${w * .65}" stroke="#6f9490" stroke-width="2"/>` :
    `<path d="M${x + 5} ${y + h - 5}l${w - 10} ${-h + 10}" stroke="#577078" stroke-width="1.4" opacity=".5"/>`}`;
}

/** Original compact glyphs. A power lamp reports power only, never service. */
function deviceGlyph(kind, { powered = true, selected = false, inventory = false } = {}) {
  const on = powered === true;
  const led = on ? '#b5ccae' : '#708084';
  const selection = selected ? `<ellipse cx="1" cy="5" rx="49" ry="17" fill="#f3d5ba" fill-opacity=".72" stroke="${COLORS.darkCoral}" stroke-width="2.2"/><path d="M-6 -71h12l-6 7z" fill="${COLORS.darkCoral}"/>` : '';
  const shadow = `<ellipse cx="4" cy="5" rx="${kind === 'tablet' ? 26 : 39}" ry="9" fill="#314a47" opacity=".12"/>`;
  let drawing;
  switch (kind) {
    case 'desktop':
      drawing = `<path d="M27 -37l15 -5v40L27 3z" fill="#627476"/><path d="M27 -37h10v40H27z" fill="#354e55"/><path d="M30 -30h4m-4 4h4m-4 4h4" stroke="#91a3a0"/><circle cx="32" cy="-5" r="1.9" fill="${led}"/>
        <path d="M-5 -20v13l13 2v-15" fill="#6d8585"/><path d="M-17 -5L4 -10 20 -4 -1 1z" fill="#72898a"/>
        <rect x="-34" y="-57" width="58" height="39" rx="3" fill="#29444c"/>${screen(on, -29, -52, 48, 28)}
        <circle cx="-5" cy="-21" r="1" fill="${led}"/><path d="M-31 0h47l9 8h-49z" fill="#dce2d8" stroke="#879c9a" stroke-width="1"/>
        <path d="M-25 2h35m-31 3h34" stroke="#9baea7" stroke-width="1.3"/><ellipse cx="34" cy="7" rx="5" ry="3.5" fill="#e6e8df" stroke="#8d9f9a"/>`;
      break;
    case 'laptop':
      drawing = `<path d="M-32 -47h58l7 37h-58z" fill="#2e4850" stroke="#607a7e" stroke-width="1.4"/>
        <g transform="matrix(1 0 .19 1 9 0)">${screen(on, -34, -42, 48, 27)}</g>
        <path d="M-25 -10h58L44 4h-80z" fill="#b8c7c3"/><path d="M-36 4h80v3h-80z" fill="#71898b"/>
        <path d="M-20 -7h47m-43 4h46m-29 4h15" stroke="#6e898a" stroke-width="1.5"/>
        <path d="M-7 0h15l3 3H-8z" fill="#dde3d9"/><circle cx="37" cy="5" r="1" fill="${led}"/>`;
      break;
    case 'tablet':
      drawing = `<path d="M-22 -49l36 -5q4 0 5 4L29 -4q1 4-3 5l-36 5q-4 0-5-4l-10-46q-1-4 3-5z" fill="#304b53"/>
        <g transform="matrix(1 -.13 .22 1 3 0)">${screen(on, -17, -44, 31, 39)}</g>
        <circle cx="7" cy="0" r="1.8" fill="${led}"/><path d="M-19 -44l7 31" stroke="#718b8f" stroke-width="1.5" opacity=".5"/>`;
      break;
    case 'server':
      drawing = `<path d="M-26 -57l16 -9h39l-17 9z" fill="#819794"/><path d="M12 -57l17 -9v62L12 5z" fill="#415e64"/>
        <rect x="-26" y="-57" width="38" height="62" rx="2" fill="#2d474f"/>
        ${[-46, -32, -18].map(y => `<rect x="-21" y="${y}" width="27" height="10" rx="1.5" fill="#617d80"/><path d="M-17 ${y + 4}h15m-15 3h15" stroke="#9aacaa" stroke-width="1.2"/><circle cx="3" cy="${y + 5}" r="1.3" fill="#c4cebf"/>`).join('')}
        <circle cx="-17" cy="-2" r="2.2" fill="${led}"/><path d="M-9 -2h10M19 -48v39m4-41v39" stroke="#78908f" stroke-width="1"/>`;
      break;
    case 'switch4':
    case 'switch8': {
      const count = kind === 'switch8' ? 8 : 4, step = count === 8 ? 6 : 10;
      drawing = `<path d="M-38 -14l15 -11h63L25 -14z" fill="#b9c8be"/><path d="M25 -14l15 -11v18L25 4z" fill="#667e7d"/>
        <rect x="-38" y="-14" width="63" height="18" rx="1" fill="#34575d"/>
        ${Array.from({ length: count }, (_, i) => `<rect x="${-31 + i * step}" y="-8" width="${count === 8 ? 4 : 7}" height="6" rx=".6" fill="#142f36" stroke="#8aa2a0" stroke-width=".7"/>`).join('')}
        <circle cx="18" cy="-5" r="1.7" fill="${led}"/><path d="M-13 -19h19" stroke="#879f98" stroke-width="1.3"/>`;
      break;
    }
    case 'access-point':
      drawing = `<path d="M-31 -13v7c0 15 62 15 62 0v-7" fill="#95aaa2"/><ellipse cx="0" cy="-13" rx="31" ry="13" fill="#eef0e4" stroke="#91a79e" stroke-width="1.3"/>
        <ellipse cx="0" cy="-13" rx="21" ry="7.5" fill="none" stroke="#c5d1c4" stroke-width="1"/>
        <path d="M-5 -14q5-5 10 0m-8 2q3-3 6 0" fill="none" stroke="#537977" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="0" cy="-9" r="1" fill="#537977"/><rect x="-5" y="1" width="10" height="2" rx="1" fill="${led}"/>`;
      break;
    default:
      drawing = `<rect x="-24" y="-35" width="48" height="39" rx="4" fill="#738b89" stroke="#35565c" stroke-width="1.5"/><path d="M-15 -26h30m-30 7h23" stroke="#c1d1c6" stroke-width="2"/><circle cx="14" cy="-5" r="2" fill="${led}"/>`;
  }
  const off = !on && !inventory ? `<g transform="translate(29,-48)"><rect x="-12" y="-8" width="26" height="15" rx="4" fill="#fbf8ef" stroke="#7e8c87"/><text x="1" y="2.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="#455e60">OFF</text></g>` : '';
  return `${selection}${shadow}${drawing}${off}`;
}

/** Optional larger inspector art. Ports/configuration remain normal HTML controls. */
export function renderDeviceArtwork(kind, { powered = true, selected = false, label = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-54 -76 108 100" aria-hidden="true" focusable="false" class="opening-device-art"><title>${escape(label || KIND_NAME[kind] || 'Device')} — power ${powered === true ? 'on' : 'off'}</title><g font-family="system-ui,sans-serif">${deviceGlyph(kind, { powered, selected })}</g></svg>`;
}

function plant(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><ellipse cy="4" rx="20" ry="7" fill="#284848" opacity=".1"/><path d="M-12 -21h24L8 3H-8z" fill="#d39a78"/><ellipse cy="-21" rx="12" ry="4" fill="#e7b899"/><path d="M0-23v-39m-1 29l-9-17m10 12l12-19" stroke="#527c68" stroke-width="2"/><path d="M0-42q-18-4-18-20 17 2 18 20M1-32q18-3 20-18-16-2-20 18M0-53q-7-13 3-24 11 13-3 24M-8-43q-17 2-19-12 14-6 19 12" fill="#73987a"/></g>`;
}

function stool(x, y, color = '#709c94') {
  return `<g transform="translate(${x},${y})"><ellipse cy="16" rx="20" ry="6" fill="#284848" opacity=".1"/><path d="M-12 1l-4 16m28-16l4 16M0 2v16" stroke="#81918a" stroke-width="3"/><ellipse cy="-2" rx="20" ry="10" fill="#426e6d"/><ellipse cy="-5" rx="20" ry="10" fill="${color}"/></g>`;
}

function desk(x, y, width, { color = '#d8c9ad', front = '#b4a88e' } = {}) {
  return `<g transform="translate(${x},${y})"><path d="M6 0v29m${width - 18}-29v29M22-12v27" stroke="#8d9586" stroke-width="5"/><path d="M0-3h${width}l21-14H21z" fill="${color}" stroke="#a9a48d" stroke-width="1.1"/><path d="M0-3h${width}v7H0z" fill="${front}"/><path d="M${width}-3l21-14v7L${width} 4z" fill="#a39e88"/></g>`;
}

function examBed(x, y) {
  return `<g transform="translate(${x},${y})"><ellipse cx="36" cy="14" rx="68" ry="14" fill="#284848" opacity=".09"/>
    <path d="M-13-8v24m83-43v27m-59-41v25M92-46v25" stroke="#9aa9a0" stroke-width="6"/>
    <path d="M-24-24L67-47 98-28 7-4z" fill="#74928a"/><path d="M7-4l91-24v10L7 6z" fill="#6d8e86"/><path d="M-24-24L7-4V6l-31-20z" fill="#8da79a"/>
    <path d="M-24-32L67-55 98-36 7-12z" fill="#edf1e4" stroke="#c4d0bf" stroke-width="1.3"/><path d="M-24-32L7-12v8l-31-20z" fill="#d3ddcd"/><path d="M7-12l91-24v8L7-4z" fill="#c5d5c7"/>
    <path d="M48-49l19-5 25 15-20 5z" fill="#b8cdbd"/><path d="M-17-30L9-14" stroke="#e8ece1" stroke-width="2"/>
    <path d="M-13 14h17m62-12h15" stroke="#7a928e" stroke-width="4" stroke-linecap="round"/></g>`;
}

function person(x, y, { shirt = '#417f7b', seated = false } = {}) {
  return `<g transform="translate(${x},${y})" data-art-role="staff"><ellipse cy="2" rx="16" ry="5" fill="#254848" opacity=".14"/>
    <path d="M-8-26l-2 24m16-24l4 24" stroke="#3f5961" stroke-width="7" stroke-linecap="round"/>
    <path d="M-13-44q13-8 25 0l2 22q-14 6-27 0z" fill="${shirt}"/><path d="M-6-46l5 8 7-8" fill="#e6e8da"/>
    <path d="M-11-40l-7 16m28-16l8 14" stroke="${shirt}" stroke-width="7" stroke-linecap="round"/>
    <path d="M-18-24l8 6m28-8l-7 6" stroke="#bc886d" stroke-width="5" stroke-linecap="round"/>
    <rect x="-5" y="-54" width="9" height="10" rx="3" fill="#bc886d"/><ellipse cx="-1" cy="-59" rx="9" ry="11" fill="#d4a082"/>
    <path d="M-10-59q-4-16 12-15 13 5 6 17l-2-10-10 2-3 9z" fill="#3e4a48"/><circle cx="3" cy="-59" r="1" fill="#3e4a48"/>
    <path d="M-11 0h-6M10 0h6" stroke="#263f46" stroke-width="5" stroke-linecap="round"/>
    ${seated ? '' : '<path d="M-8-27l16-3 3 14-16 3z" fill="#e6d7af" stroke="#ab9c7e" stroke-width="1"/><path d="M-4-25l8-1" stroke="#a89977" stroke-width="1.5"/>'}
    <rect x="5" y="-39" width="5" height="7" rx="1" fill="#e6eade"/></g>`;
}

/** Layered original architecture. All room dimensions are presentation geometry. */
function shell() {
  return `<defs>
    <linearGradient id="os-wall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d4dec9"/><stop offset="1" stop-color="#b4c6b1"/></linearGradient>
    <linearGradient id="os-floor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eeeade"/><stop offset="1" stop-color="#d9ded0"/></linearGradient>
    <pattern id="os-floor-grid" width="76" height="50" patternUnits="userSpaceOnUse" patternTransform="skewX(10)"><path d="M76 0H0V50" fill="none" stroke="#9daa96" stroke-width=".7" opacity=".24"/></pattern>
  </defs>
  <rect width="960" height="620" rx="18" fill="#f6f3ea"/>
  <g font-family="system-ui,sans-serif">
    <path d="M65 49c0-14 13-22 25-16-2 13-12 20-25 16z" fill="#729780"/><path d="M64 51l19-13" stroke="#f6f3ea" stroke-width="2"/>
    <text x="101" y="42" font-size="20" font-weight="700" letter-spacing=".3" fill="#29494e">Riverbend</text>
    <text x="102" y="60" font-size="11" letter-spacing="2.1" fill="#6a817a">COMMUNITY CLINIC</text>
    <text x="897" y="43" text-anchor="end" font-size="10" letter-spacing="1.6" font-weight="600" fill="#6a817a">WORKPLACE VIEW</text>
    <text x="897" y="61" text-anchor="end" font-size="11" fill="#6a817a">Opening shift</text>
  </g>
  <path d="M65 169H840l77 390H135L60 521z" fill="#365953" opacity=".09"/>
  <path d="M58 157H832l72 391H130z" fill="url(#os-floor)"/>
  <path d="M58 157H425l27 145H84z" fill="#d3dbcc"/>
  <path d="M486 157H832l36 196H522z" fill="#e6e7d8"/>
  <path d="M522 353H868l36 195H558z" fill="#dfE5d7"/>
  <path d="M58 157H832l72 391H130z" fill="url(#os-floor-grid)"/>
  <path d="M58 157V99H832v58z" fill="url(#os-wall)"/>
  <path d="M58 99l10-7h774l-10 7z" fill="#e0e8d5"/>
  <path d="M832 99l72 391v58l-72-391z" fill="#b7c9b4"/>
  <path d="M832 99l10-7 72 391-10 7z" fill="#e2e8d6"/>
  <path d="M58 99v58l26 145v-58z" fill="#b4c6b1"/>
  <path d="M58 99l9-5 26 145-9 5z" fill="#dee7d1"/>
  <path d="M58 157H832" stroke="#94ae98" stroke-width="5"/>
  <path d="M832 157l72 391" stroke="#90aa96" stroke-width="4"/>
  <path d="M130 548H904v10H130l-46-251v-10z" fill="#b9c1ae"/>
  <path d="M130 548H904" stroke="#f9f7ee" stroke-width="3"/>
  <g data-art-layer="back-furniture">
    <rect x="550" y="106" width="160" height="43" rx="2" fill="#8cac9f"/>
    <rect x="556" y="111" width="148" height="32" fill="#e4efe4"/>
    <path d="M606 111v32m49-32v32M556 127h148" stroke="#aac5b6" stroke-width="3"/>
    <path d="M565 112l32 30m6-30l31 30m22-30l31 30" stroke="#f7f8ec" stroke-width="8" opacity=".6"/>
    <rect x="123" y="112" width="155" height="25" rx="3" fill="#edf0df"/>
    <text x="200" y="129" text-anchor="middle" font-size="11" letter-spacing="1.3" font-weight="700" fill="#52736b">EQUIPMENT</text>
    <path d="M726 188h89v-30h-89z" fill="#b8c8b4"/><path d="M726 158h89l11-7h-89z" fill="#ebeee1"/>
    <path d="M771 161v25" stroke="#91aa97"/><path d="M759 166h6m13 0h6" stroke="#6d8c80" stroke-width="2"/>
    <ellipse cx="753" cy="157" rx="15" ry="4" fill="#c3d5c5"/><path d="M750 154v-10q0-5 5-5h4" fill="none" stroke="#829c95" stroke-width="3"/>
    <rect x="791" y="137" width="12" height="14" rx="3" fill="#e9e7cf"/><path d="M795 135h7" stroke="#5c8680" stroke-width="3"/>
  </g>
  <g data-art-layer="room-dividers">
    <path d="M84 267h275v35H84z" fill="#bbccb4"/><path d="M84 267l9-6h275l-9 6z" fill="#e0e7d5"/>
    <path d="M359 267l9-6v35l-9 6z" fill="#94b09c"/>
    <path d="M425 123l13 70v34l-13-70z" fill="#aac0aa"/><path d="M425 123l9-6 13 70-9 6z" fill="#dce5d0"/>
    <path d="M451 267l51 281h11l-51-281z" fill="#c5d3bc"/><path d="M451 267l8-5 51 281-8 5z" fill="#eceddf"/>
    <path d="M522 319h81v34h-81zM693 319h175v34H693z" fill="#bfceb8"/>
    <path d="M522 319l8-6h81l-8 6zM693 319l8-6h175l-8 6z" fill="#e4ead8"/>
    <path d="M603 319l8-6v34l-8 6zM693 319l8-6v34l-8 6z" fill="#9bb5a0"/>
    <path d="M611 351q36-29 72 0" fill="none" stroke="#b8c7b1" stroke-width="1.4" stroke-dasharray="3 4"/>
  </g>
  <g data-art-layer="room-signage" font-family="system-ui,sans-serif" fill="#54776b">
    <text x="542" y="187" font-size="12" letter-spacing="1.3" font-weight="700">EXAM A</text>
    <text x="555" y="389" font-size="12" letter-spacing="1.3" font-weight="700">EXAM B</text>
    <text x="146" y="334" font-size="12" letter-spacing="1.3" font-weight="700">RECEPTION</text>
    <text x="452" y="462" transform="rotate(-10 452 462)" font-size="9" letter-spacing="1.4" fill="#7a9181">CLINIC</text>
  </g>
  <g data-art-layer="furniture">
    ${desk(151, 221, 228, { color: '#c4ccba', front: '#9cac98' })}
    <path d="M134 247h199l16-10H150z" fill="#c5c5ad"/><path d="M134 247h199v16H134z" fill="#aaa990"/>
    <text x="136" y="277" font-size="8.5" letter-spacing="1.3" fill="#6c8275">STOCK</text>
    ${stool(216, 437, '#8faaa0')}
    ${person(312, 414, { shirt: '#c7826c', seated: true })}
    ${desk(169, 409, 160)}
    <path d="M169 416h160v34H169z" fill="#b6c9b2"/><path d="M180 424h138" stroke="#d4ddc6" stroke-width="3"/>
    <path d="M289 393l18-2 6 9-19 2z" fill="#efe8cd"/><path d="M295 394h9" stroke="#b2a995"/>
    ${desk(628, 247, 81, { color: '#d9d3ba', front: '#aaa995' })}
    ${desk(638, 437, 81, { color: '#d9d3ba', front: '#aaa995' })}
    ${stool(711, 270, '#92b4a6')}${stool(722, 460, '#92b4a6')}
    ${examBed(764, 271)}${examBed(778, 466)}
    <path d="M830 390v73m39-76v73" stroke="#93aaa0" stroke-width="3"/>
    <path d="M828 387l42-5v57l-42 6z" fill="#c0d0ba" stroke="#a6bea7"/>
    <path d="M840 387v56m13-57v55" stroke="#d3dfc8" stroke-width="2"/>
    <path d="M824 463h11m30-3h11" stroke="#90a59e" stroke-width="3" stroke-linecap="round"/>
    <g transform="translate(180,498)"><path d="M-30-14h103v20H-30z" fill="#76968a"/><path d="M-30-14l12-10H85L73-14z" fill="#adc2ab"/><path d="M-30-35h103v21H-30z" fill="#8eae9a"/><path d="M-32-36h106" stroke="#c1d3b9" stroke-width="4"/><path d="M-24 6v11M65 6v11" stroke="#7e9284" stroke-width="4"/><path d="M6-33v37m33-37v37" stroke="#759786" stroke-width="1.5"/></g>
    <path d="M317 496h53l12-9h-53z" fill="#d8cbb0"/><path d="M317 496h53v6h-53z" fill="#b7ad93"/><path d="M323 502v15m43-15v15" stroke="#98a18d" stroke-width="3"/>
    <path d="M333 490l17-3 10 4-18 3z" fill="#d5a28b"/><path d="M339 487l18-2 8 4-18 3z" fill="#dce2cc"/>
    ${plant(117, 369, .8)}${plant(386, 515, 1)}${plant(791, 191, .55)}
    <g transform="translate(390,334)"><rect x="-9" y="-27" width="18" height="27" rx="4" fill="#7d9c90"/><ellipse cy="-28" rx="10" ry="4" fill="#b7c9b9"/><path d="M-6-21H6" stroke="#b6cabc" stroke-width="2"/></g>
  </g>`;
}

function cableGeometry(from, to) {
  if (Math.abs(from.y - to.y) < 70) {
    const middleY = Math.max(from.y, to.y) + 26;
    return `M${from.x} ${from.y + 3} Q${from.x} ${middleY} ${(from.x + to.x) / 2} ${middleY} T${to.x} ${to.y + 3}`;
  }
  const corridor = 439;
  return `M${from.x} ${from.y + 4} V${from.y + 22} H${corridor} V${to.y + 22} H${to.x} V${to.y + 4}`;
}

function sceneObservation(view, selectedObservationId) {
  const observations = list(view.observations || view.diagnostics).filter(o => o && o.origin === 'player');
  const observation = selectedObservationId ? observations.find(o => o.id === selectedObservationId) : observations[0];
  // Unknown freshness is deliberately not treated as a current test.
  const current = !!observation && observation.stale === false;
  const source = observation && deviceList(view).find(d => d.id === observation.sourceDeviceId);
  // A room move preserves technical evidence, but does not turn an A visit into a B visit.
  const differentRoom = !!observation?.locationId && source?.locationId !== observation.locationId;
  return { observation, current, differentRoom,
    path: current && !differentRoom && Array.isArray(observation.pathIds) ? observation.pathIds : [] };
}

function connections(view, anchors, selectedObservationId) {
  const { observation, current, differentRoom, path } = sceneObservation(view, selectedObservationId);
  const edges = [], deviceMap = new Map(deviceList(view).map(d => [d.id, d]));
  for (const c of list(view.cables)) {
    if (!c || !Object.hasOwn(anchors, c.fromDeviceId) || !Object.hasOwn(anchors, c.toDeviceId)) continue;
    edges.push({ id: c.id, from: c.fromDeviceId, to: c.toDeviceId, d: cableGeometry(anchors[c.fromDeviceId], anchors[c.toDeviceId]), wireless: false });
  }
  for (const d of deviceMap.values()) {
    if (!d.wifiApId || !deviceMap.has(d.wifiApId) || !Object.hasOwn(anchors, d.id) || !Object.hasOwn(anchors, d.wifiApId)) continue;
    const a = anchors[d.id], b = anchors[d.wifiApId];
    const port = list(d.ports).find(p => p?.medium === 'wifi');
    // The path edge is a real returned port ID, not an invented radio link ID.
    edges.push({ id: port?.id || null, from: d.id, to: d.wifiApId,
      d: `M${a.x} ${a.y - 28} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 70} ${b.x} ${b.y - 13}`, wireless: true });
  }
  const isWitnessEdge = e => e.id && path.some((id, i) => id === e.id && i > 0 && i < path.length - 1 &&
    ((path[i - 1] === e.from && path[i + 1] === e.to) || (path[i - 1] === e.to && path[i + 1] === e.from)));
  const neutral = edges.map(e => `<path d="${e.d}" fill="none" stroke="#faf7ef" stroke-width="4.8" opacity=".85"/><path ${e.wireless ? 'data-association-device-id' : 'data-cable-id'}="${escape(e.wireless ? e.from : e.id)}" d="${e.d}" fill="none" stroke="#526f75" stroke-width="2.2" ${e.wireless ? 'stroke-dasharray="5 6"' : ''} opacity=".95"/>`).join('');
  const highlighted = edges.filter(isWitnessEdge);
  const highlight = highlighted.map(e => `<path data-observation-id="${escape(observation.id)}" data-tested-edge-id="${escape(e.id)}" d="${e.d}" fill="none" stroke="#b67c34" stroke-width="3.2" ${e.wireless ? 'stroke-dasharray="7 5"' : ''}/>`).join('');
  let caption = 'No recorded player test. Connections show installation and association only.';
  if (observation && !current) caption = 'Earlier test — run a fresh test to show a current route.';
  else if (observation && differentRoom) {
    const room = { 'location.exam-a': 'Exam A', 'location.exam-b': 'Exam B',
      'location.reception': 'reception', 'location.equipment': 'the equipment room' }[observation.locationId] || 'another location';
    caption = `Test recorded in ${room} — run a test here to display this room’s route.`;
  }
  else if (observation) {
    const outcome = observation.pass === true ? (observation.expectedDenied ? 'Expected denial confirmed' : 'Passed') : 'Needs attention';
    caption = `${short(observation.label || observation.testId, 36)} · ${outcome} · ${highlighted.length ? 'Recorded route highlighted' : 'No route to highlight'}`;
  }
  return { markup: `<g data-art-layer="connections" stroke-linejoin="round" stroke-linecap="round">${neutral}${highlight}</g>`, caption };
}

function stock(view) {
  const items = list(view.inventory).filter(i => i?.owned && !i.installed && !i.cableId).slice(0, 4);
  return `<g data-art-layer="stock">${items.map((item, index) => {
    const x = 165 + index * 48, y = 245;
    const glyph = item.kind === 'ethernet-cable' || item.sku === 'ethernet-cable'
      ? '<ellipse cx="0" cy="-7" rx="21" ry="12" fill="none" stroke="#708789" stroke-width="4"/><path d="M-21-7q-12 0-12 14h9m43-14h8v8" fill="none" stroke="#708789" stroke-width="3"/><rect x="-26" y="3" width="10" height="7" rx="1" fill="#c3cbbd" stroke="#6a8585"/>'
      : deviceGlyph(item.kind || item.sku, { powered: false, inventory: true });
    return `<g data-item-id="${escape(item.id)}" transform="translate(${x},${y}) scale(.43)"><title>${escape(item.label || item.kind || 'Equipment')} — stored, not installed</title>${glyph}</g>`;
  }).join('')}</g>`;
}

/** Supplementary scene. All required actions have named native HTML equivalents. */
export function renderScene(view = {}, { selectedDeviceId = null, selectedObservationId = null } = {}) {
  const devices = deviceList(view), anchors = getDeviceAnchors(view);
  const routes = connections(view, anchors, selectedObservationId);
  const nurse = devices.find(d => d.id === view.nurseDeviceId || d.roleId === 'role.nurse');
  const nurseAnchor = nurse && Object.hasOwn(anchors, nurse.id) ? anchors[nurse.id] : null;
  const staff = nurseAnchor && ['location.exam-a', 'location.exam-b'].includes(nurse.locationId)
    ? person(nurseAnchor.x - 58, nurseAnchor.y + 25) : '';
  const objects = devices.filter(d => Object.hasOwn(anchors, d.id)).sort((a, b) => anchors[a.id].y - anchors[b.id].y).map(d => {
    const a = anchors[d.id], selected = d.id === selectedDeviceId;
    return `<g class="opening-scene-device${selected ? ' is-selected' : ''}" data-device-id="${escape(d.id)}" data-kind="${escape(d.kind)}" data-power="${d.powered === true ? 'on' : 'off'}" transform="translate(${a.x},${a.y})"><title>${escape(short(d.roleLabel || d.label || KIND_NAME[d.kind] || 'Device'))} — ${escape(KIND_NAME[d.kind] || d.kind)} — power ${d.powered === true ? 'on' : 'off'}${selected ? ' — selected' : ''}</title><g transform="scale(.78)">${deviceGlyph(d.kind, { powered: d.powered, selected })}</g></g>`;
  }).join('');
  const outside = devices.filter(d => !Object.hasOwn(anchors, d.id)).length;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="opening-clinic-scene" viewBox="0 0 960 620" aria-hidden="true" focusable="false" style="display:block;width:100%;height:auto"><title>Original Riverbend clinic cutaway</title><desc>Supplementary workplace illustration. Device buttons, settings, connections and test results are available in the surrounding interface.</desc><g font-family="system-ui,sans-serif">${shell()}${stock(view)}${routes.markup}<g data-art-layer="people">${staff}</g><g data-art-layer="devices">${objects}</g>
    <g data-art-layer="legend" font-size="11" fill="#557375"><path d="M64 575h24" stroke="#526f75" stroke-width="2.2"/><text x="96" y="579">Installed cable</text><path d="M242 575h24" stroke="#526f75" stroke-width="2.2" stroke-dasharray="4 4"/><text x="274" y="579">Wi-Fi association</text><path d="M447 575h24" stroke="#b67c34" stroke-width="3"/><text x="479" y="579">Recorded test route</text><text x="898" y="579" text-anchor="end">${outside ? `${outside} device${outside === 1 ? '' : 's'} outside clinic view` : 'Select equipment to inspect'}</text></g>
    <text x="64" y="604" font-size="12" font-weight="550" fill="#3c6264">${escape(short(routes.caption, 118))}</text>
  </g></svg>`;
}
