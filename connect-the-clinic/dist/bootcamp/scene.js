/** Original training-bench composition. Presentation only; the model owns outcomes. */
import {renderDeviceArtwork} from '../opening/scene.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {'role.reception':'Workstation','role.records':'Service host','infra.switch':'Network switch','infra.ap':'Access point','role.nurse':'Mobile workstation'};
export const deviceName = device => names[device?.roleId] || device?.roleLabel || device?.label || 'Device';
export const BENCH_ANCHORS = Object.freeze({
  'role.reception':{x:150,y:285},'infra.switch':{x:400,y:285},'role.records':{x:650,y:285},
  'infra.ap':{x:425,y:110},'role.nurse':{x:155,y:110}
});

function anchor(device) {
  const original = BENCH_ANCHORS[device.roleId] || {x:650,y:110};
  return device.roleId === 'role.nurse' && device.locationId === 'location.exam-b' ? {x:650,y:110} : original;
}
function curve(from, to) {
  const middle = (from.x + to.x) / 2;
  return `M${from.x} ${from.y + 12} C${middle} ${from.y + 68},${middle} ${to.y + 68},${to.x} ${to.y + 12}`;
}

export function renderBench(view, {selectedDeviceId = null, selectedObservationId = null} = {}) {
  const devices = view.devices || [], cables = view.cables || [];
  const mobileBench = !!view.nurseDeviceId || !!view.apDeviceId;
  const byId = new Map(devices.map(device => [device.id, device]));
  const observation = (view.observations || []).find(o => o.id === selectedObservationId) || view.observations?.[0];
  const source = byId.get(observation?.sourceDeviceId);
  const matchesPlace = !source || source.roleId !== 'role.nurse' || source.locationId === observation?.locationId;
  const showRoute = !!observation && !observation.stale && matchesPlace;
  const path = new Set(showRoute ? observation.pathIds || [] : []);
  const routeColour = observation?.pass ? '#a47125' : '#a64e39';
  const wireMarkup = cables.map(cable => {
    const from = byId.get(cable.fromDeviceId), to = byId.get(cable.toDeviceId);
    if (!from || !to) return '';
    const d = curve(anchor(from), anchor(to));
    return `<g data-bench-cable="${esc(cable.id)}"><path d="${d}" fill="none" stroke="#fffcf3" stroke-width="8"/><path d="${d}" fill="none" stroke="#546e71" stroke-width="3"/>${path.has(cable.id) ? `<path d="${d}" fill="none" stroke="${routeColour}" stroke-width="5" stroke-dasharray="9 5"/>` : ''}</g>`;
  }).join('');
  const wifiMarkup = devices.filter(d => d.wifiApId && byId.has(d.wifiApId)).map(device => {
    const ap = byId.get(device.wifiApId), from = anchor(device), to = anchor(ap);
    const recorded = path.has(device.id) && path.has(ap.id);
    return `<path d="M${from.x} ${from.y-18} Q${(from.x+to.x)/2} ${Math.min(from.y,to.y)-75} ${to.x} ${to.y-18}" fill="none" stroke="${recorded ? routeColour : '#647b7e'}" stroke-width="${recorded ? 4 : 2}" stroke-dasharray="5 6"/>`;
  }).join('');
  const deviceMarkup = devices.map(device => {
    const p = anchor(device), selected = selectedDeviceId === device.id;
    return `<g data-bench-device="${esc(device.id)}"><ellipse cx="${p.x}" cy="${p.y+18}" rx="64" ry="17" fill="#173b40" opacity=".06"/>${selected ? `<ellipse cx="${p.x}" cy="${p.y+10}" rx="72" ry="30" fill="none" stroke="#17675f" stroke-width="3"/>` : ''}<g transform="translate(${p.x-56} ${p.y-78})">${renderDeviceArtwork(device.kind,{powered:device.powered,selected,label:deviceName(device)}).replace('<svg ', '<svg width="112" height="104" ')}</g><rect x="${p.x-77}" y="${p.y+37}" width="154" height="42" rx="10" fill="#fffdf8" stroke="#cbd7cd"/><text x="${p.x}" y="${p.y+54}" text-anchor="middle" fill="#173b40" font-size="13" font-weight="700">${esc(deviceName(device))}</text><text x="${p.x}" y="${p.y+70}" text-anchor="middle" fill="#47615d" font-size="11">${device.powered ? '● Power on' : '○ Power off'}${device.address ? ' · '+esc(device.address) : ''}</text></g>`;
  }).join('');
  const empty = devices.length ? '' : `<g fill="none" stroke="#8ca9a1" stroke-width="2" stroke-dasharray="5 7"><rect x="76" y="180" width="148" height="130" rx="18"/><rect x="326" y="180" width="148" height="130" rx="18"/><rect x="576" y="180" width="148" height="130" rx="18"/></g><g fill="#42645f" font-size="15" font-weight="650" text-anchor="middle"><text x="150" y="247">Workstation</text><text x="400" y="247">Switch</text><text x="650" y="247">Service host</text></g><text x="400" y="350" text-anchor="middle" fill="#526f68" font-size="14">Your equipment will appear here.</text>`;
  return `<svg class="bc-bench-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${mobileBench ? '0 0 800 415' : '0 145 800 270'}" aria-hidden="true" focusable="false"><defs><pattern id="bc-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#dce6d7" stroke-width="1"/></pattern><linearGradient id="bc-surface" x2="0" y2="1"><stop stop-color="#e8eee0"/><stop offset="1" stop-color="#dfe8d8"/></linearGradient></defs><rect x="1" y="1" width="798" height="413" rx="22" fill="url(#bc-surface)" stroke="#cedbcb"/><rect x="20" y="20" width="760" height="375" rx="12" fill="url(#bc-grid)"/><path d="M30 392H770" stroke="#b8c7b7" stroke-width="7"/><text x="34" y="${mobileBench ? 42 : 174}" fill="#4f7167" font-size="11" letter-spacing="2" font-weight="700">ONE LOCAL TRAINING NETWORK</text>${view.nurseDeviceId ? '<text x="155" y="67" text-anchor="middle" fill="#58756c" font-size="11">ROOM A</text><text x="650" y="67" text-anchor="middle" fill="#58756c" font-size="11">ROOM B</text>' : ''}${wireMarkup}${wifiMarkup}${deviceMarkup}${empty}</svg>`;
}

/** Schematic port/cable illustrations, not pinout or wiring diagrams. */
export function materialArtwork(material) {
  const known = ['desktop','laptop','tablet','server','switch4','switch8','access-point'];
  const kind = material.assetKind || material.kind;
  if (known.includes(kind)) return renderDeviceArtwork(kind,{powered:true,label:material.title});
  const type = material.cableType || material.kind || material.id || '';
  let drawing;
  if (/ethernet/i.test(type)) drawing = '<path d="M15 76H69Q94 76 94 52V35" fill="none" stroke="#286d66" stroke-width="10"/><path d="M76 13h36v32H76zM84 9h20v7H84z" fill="#dbe8e2" stroke="#385e61" stroke-width="2"/><path d="M81 18v12m4-12v12m4-12v12m4-12v12m4-12v12m4-12v12m4-12v12m4-12v12" stroke="#ab7b38" stroke-width="2"/><path d="M84 43v9h20v-9" fill="#b4ccc5" stroke="#385e61" stroke-width="2"/>';
  else if (/power/i.test(type)) drawing = '<path d="M16 80H72Q93 80 93 60V46" fill="none" stroke="#586974" stroke-width="10"/><rect x="72" y="25" width="42" height="28" rx="10" fill="#586974"/><path d="M83 25V9m20 16V9" stroke="#c4c9c3" stroke-width="6"/><path d="M82 38h22" stroke="#e2e8de" stroke-width="3"/>';
  else if (/usb/i.test(type)) drawing = '<path d="M13 76H69Q93 76 93 48" fill="none" stroke="#7f738e" stroke-width="9"/><rect x="73" y="22" width="40" height="30" rx="7" fill="#7f738e"/><rect x="77" y="8" width="32" height="18" rx="3" fill="#dbe0d8" stroke="#4e5962" stroke-width="2"/><path d="M83 14h6m6 0h6" stroke="#53626a" stroke-width="4"/>';
  else if (/display|hdmi/i.test(type)) drawing = '<path d="M12 76H68Q92 76 92 49" fill="none" stroke="#ba805e" stroke-width="9"/><path d="M71 25h44v23H71z" fill="#a76f50"/><path d="M69 10h48v15l-7 7H76l-7-7z" fill="#d9dfd8" stroke="#51676a" stroke-width="2"/><path d="M76 19h34" stroke="#9d7736" stroke-width="5"/>';
  else if (/fiber|fibre/i.test(type)) drawing = '<path d="M14 77H63Q84 77 84 48M21 88H73Q103 88 103 47" fill="none" stroke="#c39436" stroke-width="5"/><rect x="76" y="22" width="15" height="30" rx="3" fill="#4d92a0"/><rect x="96" y="22" width="15" height="30" rx="3" fill="#4d92a0"/><path d="M80 9h7v16h-7zM100 9h7v16h-7z" fill="#dce5df" stroke="#506764"/>';
  else if (/router/i.test(type)) drawing = '<rect x="20" y="33" width="104" height="42" rx="9" fill="#365e67"/><path d="M42 54h57m-10-8l10 8-10 8M55 47l-10 7 10 7" fill="none" stroke="#e7ede2" stroke-width="3"/><path d="M9 54h10m105 0h11" stroke="#a97835" stroke-width="5"/>';
  else drawing = '<rect x="24" y="20" width="92" height="63" rx="7" fill="#659380"/><rect x="43" y="34" width="53" height="33" fill="#dce4da" stroke="#284d55" stroke-width="3"/><path d="M49 39h41v17H49z" fill="#21414b"/><path d="M49 41v7m6-7v7m6-7v7m6-7v7m6-7v7m6-7v7m6-7v7" stroke="#c8a255" stroke-width="2"/><path d="M36 83v8m10-8v8m10-8v8m10-8v8m10-8v8m10-8v8m10-8v8" stroke="#b89c55" stroke-width="4"/>';
  return `<svg class="bc-material-svg" viewBox="0 0 145 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${drawing}</svg>`;
}
