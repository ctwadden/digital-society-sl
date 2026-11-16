/**
 * Original decorative room and staff artwork for Connect the Clinic.
 * No device, connection, service, permission or achievement is drawn here.
 * The interface supplies real equipment, selectable labels and observed states.
 */
export const SCENE_ART_VERSION = '0.6.0';

const C = Object.freeze({
  ink: '#193e4b', wall: '#e6eee4', wallEdge: '#bdd0c3', floor: '#f3ecdb',
  tile: '#ded8c5', white: '#fffaf0', wood: '#d7ae70', woodSide: '#b98b51',
  teal: '#4a9b94', tealSide: '#31776f', pale: '#b6d8c9', leaf: '#75977b',
  shadow: '#193e4b', clay: '#c88660'
});

const roomIds = Object.freeze({
  'location.reception': 'asset.room.reception.decor',
  'location.equipment': 'asset.room.equipment.decor',
  'location.exam-a': 'asset.room.exam-a.decor',
  'location.exam-b': 'asset.room.exam-b.decor',
  'location.home': 'asset.room.home.decor'
});

function roomFrame(body, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" class="room-decor-svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" data-asset-id="${id}">${body}</svg>`;
}

/**
 * One decorative workplace under every clinic zone. It deliberately has no
 * internal partitions: the same perimeter works when the DOM zones stack or
 * additional equipment makes a row taller. The interface owns room labels,
 * real device positions, port anchors and every network path.
 */
export function clinicFloorSvg({ guided = false } = {}) {
  const height = guided ? 340 : 560;
  const front = height - 20;
  const id = `asset.scene.clinic.floor.${guided ? 'guided' : 'full'}`;
  const rows = [];
  for (let y = 92; y < front; y += 78) rows.push(`M20 ${y}H784`);
  const columns = [];
  for (let x = 104; x < 784; x += 86) columns.push(`M${x} 43V${front}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${height}" class="clinic-floor-svg" aria-hidden="true" focusable="false" preserveAspectRatio="none" data-asset-id="${id}">
    <path d="M13 40H789V${front + 11}L777 ${height}H25L13 ${front + 11}Z" fill="${C.shadow}" fill-opacity=".1"/>
    <path d="M13 33H788V${front}L775 ${front + 11}H25L13 ${front}Z" fill="${C.floor}"/>
    <path d="M20 43H784V${front}H20Z" fill="#f7f0df"/>
    <path d="${rows.join(' ')} ${columns.join(' ')}" fill="none" stroke="#ded7c3" stroke-width="1" opacity=".58" vector-effect="non-scaling-stroke"/>
    <path d="M14 16H788V43H14Z" fill="#d9e4d7"/>
    <path d="M14 16 24 8H779L788 16Z" fill="#f2f5e9"/>
    <path d="M14 16V${front}L24 ${front + 8}V42Z" fill="#becfc0"/>
    <path d="M14 16 24 8V33L14 42Z" fill="#dce6d7"/>
    <path d="M24 42H788" fill="none" stroke="#a7bda9" stroke-width="3" vector-effect="non-scaling-stroke"/>
    <path d="M25 ${front}H775L788 ${front - 10}V${front}L775 ${front + 11}H25L14 ${front}V${front - 10}Z" fill="#c5c5ad"/>
    <path d="M25 ${front}H775L788 ${front - 10}" fill="none" stroke="#ebe6d2" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <path d="M113 18H250V35H113ZM550 18H704V35H550Z" fill="#edf5ed" stroke="#a5bdb1" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <path d="M181 19V34M627 19V34" stroke="#b0c9ba" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <path d="M112 36H251M549 36H705" stroke="#f6f7ee" stroke-width="3" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

function roomShell(home = false) {
  const back = home ? '#eee4d3' : C.wall;
  const side = home ? '#e3d4bb' : '#d4e2d6';
  return `<path d="M18 145 234 65 388 133 172 235Z" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M18 132 234 54 386 121 172 220Z" fill="${home ? '#eadbc0' : C.floor}"/>
    <path d="M18 132V70L234 1V54Z" fill="${back}"/>
    <path d="M234 1 386 67V121L234 54Z" fill="${side}"/>
    <path d="M18 70 234 1 386 67" fill="none" stroke="${home ? '#cbb89b' : C.wallEdge}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M18 132 234 54 386 121M172 220 386 121" fill="none" stroke="${home ? '#cbb89b' : '#cad0bb'}" stroke-width="3"/>
    <path d="M60 150 276 72M105 173 323 93M150 196 367 112M69 114 223 196M121 95 273 174M175 75 325 149" fill="none" stroke="${home ? '#d7c7aa' : C.tile}" stroke-width="1.2" opacity=".65"/>
    <path d="M18 132V141L172 230V220Z" fill="${home ? '#c4a67b' : '#c9c8b3'}"/>
    <path d="M172 220V230L386 130V121Z" fill="${home ? '#b89a72' : '#b4c3b3'}"/>`;
}

function plant(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="0" cy="25" rx="21" ry="8" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M-14 4H14L10 24Q0 31-10 24Z" fill="${C.clay}"/>
    <ellipse cy="4" rx="14" ry="6" fill="#d99d75"/>
    <path d="M0 5V-30" stroke="${C.tealSide}" stroke-width="3"/>
    <path d="M0-13Q-25-12-23-32Q-3-31 0-13M0-21Q18-41 28-27Q22-10 0-12M0-29Q-13-48 2-51Q15-43 0-29" fill="${C.leaf}"/>
    <path d="M0-8Q-15-24-25-15Q-19 1 0-5M0-3Q14-21 24-10Q19 5 0 1" fill="${C.tealSide}" opacity=".8"/>
  </g>`;
}

function stool(x, y) {
  return `<g transform="translate(${x} ${y})">
    <ellipse cy="29" rx="23" ry="8" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M-12 6-15 27M12 6 15 27M0 8V32" stroke="#81998c" stroke-width="4" stroke-linecap="round"/>
    <ellipse cy="4" rx="20" ry="10" fill="${C.tealSide}"/>
    <ellipse rx="20" ry="9" fill="${C.pale}"/>
  </g>`;
}

function emptyCounter() {
  return `<path d="M59 166 123 142 245 188 176 220Z" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M61 142 123 119 237 163 175 191Z" fill="${C.white}"/>
    <path d="M61 142V165L175 213V191Z" fill="${C.wood}"/>
    <path d="M175 191V213L237 183V163Z" fill="${C.woodSide}"/>
    <path d="M61 142 175 191 237 163" fill="none" stroke="#e7ceaa" stroke-width="4" stroke-linejoin="round"/>
    <path d="M80 158 152 188" stroke="#bd965e" stroke-width="3" opacity=".6"/>
    <path d="M95 138 120 129 148 140 124 149Z" fill="#e1e8db"/>`;
}

function emptyWorkbench() {
  return `<path d="M66 184 278 106 337 134 125 222Z" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M72 158V185L91 194V166M303 98V132L321 140V108" fill="${C.wallEdge}"/>
    <path d="M123 180V212L142 221V188M321 108V140L334 134V102" fill="#8eaa9b"/>
    <path d="M67 149 276 73 338 101 125 185Z" fill="${C.wood}"/>
    <path d="M67 149V158L125 194V185Z" fill="${C.woodSide}"/>
    <path d="M125 185V194L338 109V101Z" fill="#ba925b"/>
    <path d="M67 149 125 185 338 101" fill="none" stroke="#e6c58c" stroke-width="3"/>`;
}

function examBed(variant) {
  const sheet = variant === 'b' ? '#d9e4c5' : '#c9e2dc';
  return `<path d="M193 197 286 146 345 172 251 223Z" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M203 161V194M258 185V219M330 145V177" stroke="#8aa497" stroke-width="7" stroke-linecap="round"/>
    <path d="M196 152 279 105 339 132 257 181Z" fill="${C.white}"/>
    <path d="M196 152V163L257 192V181Z" fill="#aabfb4"/>
    <path d="M257 181V192L339 144V132Z" fill="#91aca1"/>
    <path d="M205 151 273 113 326 136 258 176Z" fill="${sheet}"/>
    <path d="M268 119 284 111 324 129 307 139Z" fill="${C.white}"/>
    <path d="M207 155 257 178 277 166 227 143Z" fill="${C.teal}" opacity=".65"/>
    <path d="M196 152 257 181 339 132" fill="none" stroke="#e7efe3" stroke-width="3"/>`;
}

function armchair() {
  return `<path d="M200 181 267 148 332 179 263 220Z" fill="${C.shadow}" fill-opacity=".08"/>
    <path d="M218 137V183L265 207V160Z" fill="#b48450"/>
    <path d="M265 160V207L313 180V134Z" fill="#936b43"/>
    <path d="M218 113 265 137 313 110V151L265 179 218 154Z" fill="${C.wood}"/>
    <path d="M226 112 266 132 303 112V143L266 164 226 144Z" fill="#e2bd82"/>
    <path d="M218 154 265 179 305 156 261 134Z" fill="#ebca93"/>
    <path d="M211 143 226 150V184L211 177ZM300 151 316 141V176L300 186Z" fill="#c5965e"/>
    <path d="M226 185V201M302 184V195" stroke="#765d42" stroke-width="6" stroke-linecap="round"/>`;
}

function furnitureFor(locationId) {
  let furniture = '';
  if (locationId === 'location.reception') {
    furniture = `${stool(107, 129)}${emptyCounter()}${plant(317, 142, .85)}`;
  } else if (locationId === 'location.equipment') {
    furniture = `${emptyWorkbench()}<path d="M286 167 314 154 335 164 307 179Z" fill="${C.pale}"/><path d="M286 167V188L307 199V179Z" fill="#92b19f"/><path d="M307 179V199L335 185V164Z" fill="#719786"/>`;
  } else if (locationId === 'location.exam-a' || locationId === 'location.exam-b') {
    furniture = `${stool(127, 161)}${examBed(locationId === 'location.exam-b' ? 'b' : 'a')}<path d="M72 70V104L104 94V60Z" fill="${C.white}" stroke="#b9ccc0" stroke-width="3"/><path d="M81 80 95 76M81 87 95 83" stroke="#c5d6ca" stroke-width="3"/>`;
  } else if (locationId === 'location.home') {
    furniture = `${plant(94, 139, .9)}${armchair()}<path d="M120 172 156 158 184 171 148 187Z" fill="${C.white}"/><path d="M124 176V198M178 175V192M149 187V208" stroke="#a68d68" stroke-width="5" stroke-linecap="round"/>`;
  }
  return furniture;
}

/** Furniture only; the continuous clinic floor is drawn once by the parent. */
export function roomFurnitureSvg(locationId) {
  const id = Object.hasOwn(roomIds, locationId)
    ? roomIds[locationId].replace('.decor', '.furniture')
    : 'asset.room.unknown.furniture';
  return roomFrame(furnitureFor(locationId), id);
}

/** Legacy decorative backdrop retained for old UI integrations and previews. */
export function roomDecorSvg(locationId) {
  if (!Object.hasOwn(roomIds, locationId)) return roomFrame('', 'asset.room.unknown.decor');
  return roomFrame(`${roomShell(locationId === 'location.home')}${furnitureFor(locationId)}`, roomIds[locationId]);
}

/** Decorative portraits; the adjacent DOM supplies the person's name and role. */
export function portraitSvg(personId) {
  const known = personId === 'ari' || personId === 'jo';
  const id = known ? personId : 'unknown';
  const start = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="staff-portrait" aria-hidden="true" focusable="false" data-asset-id="asset.person.${id}.portrait">`;
  if (!known) return `${start}<rect width="120" height="120" rx="26" fill="#e6eee4"/><circle cx="60" cy="46" r="20" fill="#a8bdb1"/><path d="M24 120V105c0-24 16-36 36-36s36 12 36 36v15" fill="#91aa9e"/></svg>`;
  const ari = personId === 'ari';
  const skin = ari ? '#a66e4d' : '#dfad86';
  const shade = ari ? '#895638' : '#ca9270';
  const hair = ari ? '#2e3632' : '#6a4937';
  const shirt = ari ? '#c99a56' : '#3f8b83';
  const collar = ari ? '#fff6e5' : '#dcece0';
  return `${start}<rect width="120" height="120" rx="26" fill="${ari ? '#e9dfc5' : '#d7e8dd'}"/>
    <circle cx="94" cy="23" r="23" fill="${ari ? '#f8efd8' : '#edf4e7'}"/>
    <path d="M14 120V108c0-25 20-40 46-40s46 15 46 40v12" fill="${shirt}"/>
    <path d="M48 68v16l12 11 12-11V68" fill="${shade}"/>
    <path d="M43 78 59 92 50 107 34 85M77 78 61 92 70 107 86 85" fill="${collar}"/>
    <ellipse cx="34" cy="49" rx="7" ry="10" fill="${shade}"/><ellipse cx="86" cy="49" rx="7" ry="10" fill="${shade}"/>
    <path d="M34 34c0-22 52-23 52 0v22c0 19-12 29-26 29S34 75 34 56Z" fill="${skin}"/>
    ${ari ? `<path d="M32 44c-6-13-2-27 10-31 6-10 23-11 31-3 15 0 23 13 17 29l-5 9-3-20c-14 7-28 1-36 7l-8 14Z" fill="${hair}"/><circle cx="42" cy="19" r="11" fill="${hair}"/><circle cx="59" cy="14" r="12" fill="${hair}"/><circle cx="76" cy="19" r="11" fill="${hair}"/>` : `<path d="M30 47V31c0-22 20-25 32-25 21 0 32 11 28 34l-5 10-4-21c-14 2-20-7-24-9-3 11-14 16-21 15v14Z" fill="${hair}"/><path d="M39 23c6-13 22-13 32-9" fill="none" stroke="#987350" stroke-width="5" stroke-linecap="round"/>`}
    <path d="M42 43q6-4 12-1M67 42q6-3 12 1" fill="none" stroke="${hair}" stroke-width="2.7" stroke-linecap="round"/>
    <ellipse cx="48" cy="51" rx="2.7" ry="3.2" fill="${C.ink}"/><ellipse cx="73" cy="51" rx="2.7" ry="3.2" fill="${C.ink}"/>
    <path d="m60 51-3 10h6" fill="none" stroke="${shade}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M49 68q11 10 22 0" fill="none" stroke="${ari ? '#583f32' : '#8c5742'}" stroke-width="2.7" stroke-linecap="round"/>
    <path d="M22 120v-15M98 120v-15M60 98v22" stroke="${ari ? '#a77b43' : '#2b6f68'}" stroke-width="2.5" opacity=".65"/>
  </svg>`;
}
