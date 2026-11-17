/** Opening Shift: one authoritative mission around the existing local-network engine.
 * Original implementation, 16 November 2026 (America/Halifax).
 * Child physical/address/service/permission results are never inferred by the UI.
 */
import {createGame, dispatch as dispatchNetwork, derive as deriveNetwork, parseIPv4, maskPrefix} from '../engine.js';
import {CATALOG, POLICIES, LOCATIONS, GUIDE_SECTIONS, EXPLANATION_KEYS} from '../catalog.js';

const APP_ID = 'riverbend.clinic.opening-shift';
const MISSION_ID = 'mission.clinic.opening-shift.001';
const VERSION = '0.7.0';
const MAX_BYTES = 1048576;
const MAX_ACTIONS = 1200;
const clone = value => JSON.parse(JSON.stringify(value));
const bytes = value => new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value)).length;
const pad = n => String(n).padStart(4, '0');
const fail = (code, message) => { throw Object.assign(new Error(message), {code}); };
const need = (condition, code, message) => { if (!condition) fail(code, message); };
const own = (object, key) => typeof key === 'string' && Object.hasOwn(object, key);
const plain = object => object !== null && typeof object === 'object' && !Array.isArray(object);
const active = state => state.activeMode === 'practice' ? state.practice : state.client;
const attempt = session => session.networkState.attempts[session.networkState.activeAttemptId];
const role = (session, roleId) => Object.values(attempt(session).devices).find(device => device.roleId === roleId) || null;
const phase = session => session.settlement ? 'settled' : session.delivery ? 'delivered' : 'active';
const itemForDevice = (session, deviceId) => Object.values(session.inventory).find(item => item.deviceId === deviceId) || null;
const rooms = ['location.exam-a', 'location.exam-b'];
const acceptablePolicies = ['policy.roles-separated', 'policy.nurse-also-books'];
const playerTestIds = ['reception', 'nurse', 'nurse-bookings', 'access-reception', 'access-outsider-bookings', 'access-outsider-workspace'];
const currentTestIds = [...playerTestIds, 'nurse-room-a', 'nurse-room-b'];
const fixtureDefinitions = {
  A: {key:'A', id:'fixture.clinic.opening.address-and-install.001', label:'Unfinished installation', faultId:'fault.opening.inherited-address', kind:'address-profile', inheritedAddress:'10.40.20.30'},
  B: {key:'B', id:'fixture.clinic.opening.uplink-transfer.001', label:'Disconnected uplink', faultId:'fault.opening.disconnected-uplink', kind:'physical-uplink', inheritedAddress:'10.40.10.30'}
};
const shopDefinitions = [
  {sku:'access-point', itemId:'item.ap', label:'Wireless access point', price:40},
  {sku:'ethernet-cable', itemId:'item.uplink', label:'Ethernet uplink cable', price:4},
  {sku:'tablet', itemId:'item.tablet', label:'Tablet computer', price:70}
];
const questionIds = ['question.clinic.working-services', 'question.clinic.nurse-locations', 'question.clinic.nurse-bookings'];
const guideIds = GUIDE_SECTIONS.map(section => section.id);
export const SHIFT_CATALOG = Object.freeze({
  missionId: MISSION_ID,
  fixtures: clone(Object.values(fixtureDefinitions)),
  shop: clone(shopDefinitions),
  policies: clone(Object.values(POLICIES)),
  locations: clone(LOCATIONS),
  questions: questionIds.map(id => ({id})),
  guides: GUIDE_SECTIONS.map(({id, label}) => ({id, label})),
  explanationKeys: [...EXPLANATION_KEYS],
  terms: {allowance:180, gross:120, sectionCredits:5, sectionMinutes:3, creditCap:15, minuteCap:9}
});

function event(session, type, payload = {}, origin = 'player') {
  session.sequence++;
  const entry = {id:`${session.id}.event.${pad(session.sequence)}`, sequence:session.sequence,
    type, origin, technicalRevision:session.technicalRevision, payload:clone(payload)};
  session.events.push(entry);
  return entry;
}

/** Origin normalization never changes a network outcome. Adapter operations are not learner repairs. */
function networkAction(session, action, origin = 'player') {
  const old = attempt(session), oldSequence = old.sequence, oldChanges = old.fault.changes.length;
  const result = dispatchNetwork(session.networkState, action);
  need(result.accepted, result.code, result.message);
  session.networkState = result.state;
  if (origin !== 'player') {
    const current = attempt(session);
    for (const entry of current.events) if (entry.sequence > oldSequence) entry.origin = origin;
    for (const entry of current.fault.changes.slice(oldChanges)) entry.origin = origin;
    current.training.practiceActions = [];
  }
  return result;
}

function makeItem(id, kind, label, clientOwned, owned = clientOwned) {
  return {id, sku:kind === 'ethernet-cable' ? kind : kind, kind, label, clientOwned, owned,
    purchased:false, paidPrice:0, purchaseTransactionId:null, installed:false,
    deviceId:null, cableId:null, profileInitialized:false, profile:null,
    rememberedEndpoints:null, initialization:null};
}

function deviceProfile(device) {
  return {address:device.address, mask:device.mask, locationId:device.locationId,
    powered:false, wifiApId:null, attachments:clone(device.attachments)};
}

function createSession(campaignId, fixture, mode, generation) {
  const definition = fixtureDefinitions[fixture];
  let child = createGame({campaignId:`${campaignId}.${mode}.${generation}`});
  child = dispatchNetwork(child, {type:'START_CLINIC_PRACTICE'}).state;
  const session = {id:`shift.${mode}.${pad(generation)}`, mode, generation, fixture,
    fixtureId:definition.id, networkState:child, technicalRevision:0, sequence:0,
    observationSequence:0, inspectionSequence:0, transactionSequence:0,
    briefReviewed:false, questions:[], equipmentDecision:null, policyDecision:null,
    inventory:{}, transactions:[], observations:[], inspections:[], events:[],
    help:{revision:0, grants:[], hints:{}}, delivery:null, settlement:null,
    explanations:Object.fromEntries(EXPLANATION_KEYS.map(key => [key, {text:'', oral:false, submitted:false, eventId:null, context:null}])),
    fault:{faultId:definition.faultId, kind:definition.kind, initialCondition:{
      fixtureId:definition.id, origin:'mission-setup', inheritedAddress:definition.inheritedAddress,
      mask:'255.255.255.0', cableRepresentation:fixture === 'B' ? 'Inventory with remembered endpoints; no conducting half-edge.' : 'New uplink installation required.'
    }, observations:[], changes:[]}
  };
  const definitions = [
    ['item.host','server','Central service host',true], ['item.switch','switch4','Four-port switch',true],
    ['item.reception','desktop','Reception workstation',true], ['item.laptop','laptop','Clinic laptop',true],
    ['item.ap','access-point','Wireless access point',fixture === 'B'],
    ['item.uplink','ethernet-cable','AP uplink cable',fixture === 'B'],
    ['item.tablet','tablet','Optional tablet',false],
    ['item.host-cable','ethernet-cable','Host cable',true],
    ['item.reception-cable','ethernet-cable','Reception cable',true]
  ];
  for (const args of definitions) session.inventory[args[0]] = makeItem(...args);
  // This authored profile is fixture input, not a player configuration change.
  attempt(session).network.inheritedNurseAddress = definition.inheritedAddress;
  const add = (itemId, roleId, kind) => {
    networkAction(session, {type:'CHOOSE_DEVICE', roleId, kind}, 'mission-setup');
    const device = role(session, roleId);
    networkAction(session, {type:'POWER_DEVICE', deviceId:device.id, on:true}, 'mission-setup');
    const item = session.inventory[itemId];
    item.installed = true; item.deviceId = device.id; item.profileInitialized = true;
    item.profile = deviceProfile(attempt(session).devices[device.id]);
    item.initialization = {origin:'mission-setup', address:item.profile.address, mask:item.profile.mask};
    return attempt(session).devices[device.id];
  };
  const host = add('item.host', 'role.records', 'server');
  const sw = add('item.switch', 'infra.switch', 'switch4');
  const reception = add('item.reception', 'role.reception', 'desktop');
  const nurse = add('item.laptop', 'role.nurse', 'laptop');
  networkAction(session, {type:'SET_SERVICE_STATE', enabled:true}, 'mission-setup');
  const connect = (itemId, from, to, portNumber) => {
    networkAction(session, {type:'CONNECT_PORTS', fromDeviceId:from.id, fromPortId:`${from.id}.eth1`,
      toDeviceId:to.id, toPortId:`${to.id}.eth${portNumber}`}, 'mission-setup');
    const cable = attempt(session).cables.at(-1), item = session.inventory[itemId];
    item.installed = true; item.cableId = cable.id; item.rememberedEndpoints = clone(cable);
  };
  connect('item.host-cable', host, sw, 1);
  connect('item.reception-cable', reception, sw, 2);
  if (fixture === 'B') {
    networkAction(session, {type:'SET_STATIC_ADDRESS', deviceId:nurse.id, address:definition.inheritedAddress, mask:'255.255.255.0'}, 'mission-setup');
    const ap = add('item.ap', 'infra.ap', 'access-point');
    networkAction(session, {type:'ASSOCIATE_WIFI', deviceId:nurse.id, apDeviceId:ap.id}, 'mission-setup');
    session.inventory['item.uplink'].rememberedEndpoints = {id:null, fromDeviceId:ap.id, fromPortId:`${ap.id}.eth1`, toDeviceId:sw.id, toPortId:`${sw.id}.eth3`};
  }
  session.inventory['item.laptop'].profile = deviceProfile(attempt(session).devices[nurse.id]);
  session.inventory['item.laptop'].initialization.address = definition.inheritedAddress;
  // All inherited preparation, including the child's unused starting station, is baseline only.
  for (const childAttempt of Object.values(session.networkState.attempts)) {
    childAttempt.events.forEach(entry => { entry.origin = 'mission-setup'; });
    childAttempt.fault.changes.forEach(entry => { entry.origin = 'mission-setup'; });
    childAttempt.training.practiceActions = [];
    childAttempt.observations = [];
    childAttempt.fault.baselineFailures = [];
  }
  event(session, 'MISSION_SETUP', {fixtureId:definition.id, baseline:'Powered host, switch, reception and nurse laptop; reception is initially operational.',
    playerEvidence:false, inheritedAddress:definition.inheritedAddress, legacyBootcampCompleted:false, legacyWearableCompleted:false}, 'mission-setup');
  return session;
}

export function createShift(options = {}) {
  need(plain(options), 'OPTIONS_INVALID', 'Use an options object.');
  const fixture = options.fixture ?? 'A', mode = options.mode ?? 'client';
  need(own(fixtureDefinitions, fixture), 'FIXTURE_UNKNOWN', 'Choose fixture A or B.');
  need(['client','practice'].includes(mode), 'MODE_UNKNOWN', 'Choose client work or free practice.');
  const campaignId = options.campaignId ?? `opening.${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}.${Math.random().toString(36).slice(2,10)}`}`;
  need(typeof campaignId === 'string' && /^[A-Za-z0-9._:-]{1,120}$/.test(campaignId), 'CAMPAIGN_INVALID', 'Use an anonymous campaign identifier.');
  return {appId:APP_ID, schemaVersion:1, buildVersion:VERSION, missionId:MISSION_ID, campaignId,
    seed:{fixture,mode}, revision:0, actions:[], activeMode:mode, practiceSequence:mode === 'practice' ? 1 : 0,
    client:createSession(campaignId, fixture, 'client', 1),
    practice:mode === 'practice' ? createSession(campaignId, fixture, 'practice', 1) : null,
    wallet:0, imported:false, importProvenance:'none'};
}

function technicalFingerprint(session) {
  const current = attempt(session);
  return JSON.stringify({devices:Object.values(current.devices).map(device => ({...device,
    locationId:device.roleId === 'role.nurse' ? 'nurse-movement-excluded' : device.locationId})),
    cables:current.cables, serverEnabled:current.serverEnabled, policyId:current.policyId});
}

function getItem(session, itemId, requireOwned = true) {
  need(own(session.inventory, itemId), 'ITEM_UNKNOWN', 'Choose an item in this clinic inventory.');
  const item = session.inventory[itemId];
  if (requireOwned) need(item.owned, 'ITEM_NOT_OWNED', 'Buy this item before using it.');
  return item;
}

function getDevice(session, deviceId) {
  need(own(attempt(session).devices, deviceId), 'DEVICE_UNKNOWN', 'Choose an installed device.');
  return attempt(session).devices[deviceId];
}

function syncCables(session, previousCables) {
  for (const item of Object.values(session.inventory).filter(item => item.kind === 'ethernet-cable')) {
    if (item.cableId && !attempt(session).cables.some(cable => cable.id === item.cableId)) {
      item.rememberedEndpoints = clone(previousCables.find(cable => cable.id === item.cableId) || item.rememberedEndpoints);
      item.cableId = null; item.installed = false;
    }
  }
}

function uninstall(session, item) {
  const priorCables = clone(attempt(session).cables);
  if (item.cableId) networkAction(session, {type:'DISCONNECT_CABLE', cableId:item.cableId}, 'inventory-transfer');
  if (item.deviceId) {
    let device = getDevice(session, item.deviceId);
    networkAction(session, {type:'POWER_DEVICE', deviceId:device.id, on:false}, 'inventory-transfer');
    if (CATALOG[device.kind].wifi && device.kind !== 'access-point')
      networkAction(session, {type:'ASSOCIATE_WIFI', deviceId:device.id, apDeviceId:null}, 'inventory-transfer');
    device = getDevice(session, device.id);
    item.profile = deviceProfile(device);
    networkAction(session, {type:'REMOVE_DEVICE', deviceId:device.id}, 'inventory-transfer');
  }
  syncCables(session, priorCables);
  item.installed = false; item.deviceId = null; item.cableId = null;
}

function assignNurse(session, item, locationId) {
  need(['item.laptop','item.tablet'].includes(item.id), 'NURSE_OPTION_UNKNOWN', 'Choose the clinic laptop or the purchased tablet.');
  if (item.installed && item.deviceId === role(session, 'role.nurse')?.id) return false;
  const previous = role(session, 'role.nurse');
  if (previous) uninstall(session, itemForDevice(session, previous.id));
  const initialized = !item.profileInitialized;
  if (initialized) {
    item.profile = {address:fixtureDefinitions[session.fixture].inheritedAddress, mask:'255.255.255.0',
      locationId:'location.exam-a', powered:false, wifiApId:null, attachments:[]};
    item.profileInitialized = true;
    item.initialization = {origin:'mission-setup', address:item.profile.address, mask:item.profile.mask};
  }
  networkAction(session, {type:'CHOOSE_DEVICE', roleId:'role.nurse', kind:item.kind}, 'inventory-transfer');
  const device = role(session, 'role.nurse');
  item.deviceId = device.id; item.installed = true;
  networkAction(session, {type:'SET_STATIC_ADDRESS', deviceId:device.id, address:item.profile.address, mask:item.profile.mask}, initialized ? 'mission-setup' : 'inventory-transfer');
  networkAction(session, {type:'PLACE_DEVICE', deviceId:device.id, locationId:locationId || item.profile.locationId}, 'inventory-transfer');
  return initialized;
}

function purchaseTransaction(session, type, item, amount, reason) {
  session.transactionSequence++;
  const transaction = {id:`${session.id}.transaction.${pad(session.transactionSequence)}`, type,
    itemId:item.id, amount, reason, purchaseTransactionId:type === 'refund' ? item.purchaseTransactionId : null};
  session.transactions.push(transaction);
  return transaction;
}

function economy(state, session) {
  const spent = session.transactions.reduce((sum, transaction) => sum + (transaction.type === 'purchase' ? transaction.amount : -transaction.amount), 0);
  const reserved = session.delivery?.reservedCredits ?? session.help.grants.reduce((sum, grant) => sum + grant.credits, 0);
  const minutes = session.delivery?.consultationMinutes ?? session.help.grants.reduce((sum, grant) => sum + grant.minutes, 0);
  const gross = session.mode === 'client' ? 120 : 0;
  return {allowance:180, spent, remaining:180-spent, gross, reserved, minutes, net:gross-reserved,
    wallet:state.wallet, phase:phase(session), delivered:!!session.delivery, settled:!!session.settlement, practice:session.mode === 'practice'};
}

function guideQuote(state, session, sectionId) {
  const definition = GUIDE_SECTIONS.find(section => section.id === sectionId);
  if (!definition) return null;
  const fee = economy(state, session), granted = session.help.grants.some(grant => grant.sectionId === sectionId);
  const paid = session.mode === 'client' && phase(session) === 'active' && !granted;
  const credits = paid ? Math.max(0, Math.min(5, 15-fee.reserved)) : 0;
  const minutes = paid ? Math.max(0, Math.min(3, 9-fee.minutes)) : 0;
  return {sectionId, label:definition.label,
    quoteToken:`${state.campaignId}|${session.id}|${phase(session)}|${session.help.revision}|${sectionId}|${credits}|${minutes}`,
    credits, minutes, alreadyGranted:granted,
    freeReason:session.mode === 'practice' ? 'All rehearsal help is free.' : phase(session) !== 'active' ? 'Review after delivery is free.' : granted ? 'This section and all of its hint levels are already included.' : '',
    netFee:fee.net-credits};
}

const actionFields = {
  REVIEW_BRIEF:[], ASK_CLIENT:['questionId'], INSPECT_DEVICE:['deviceId'], INSPECT_CABLE:['itemId'],
  BUY_ITEM:['sku'], INSTALL_ITEM:['itemId','locationId?'], ASSIGN_NURSE:['itemId'],
  UNINSTALL_ITEM:['itemId'], RETURN_ITEM:['itemId'], POWER_DEVICE:['deviceId','on'],
  PLACE_DEVICE:['deviceId','locationId'], MOVE_NURSE:['locationId'],
  CONNECT_PORTS:['fromDeviceId','fromPortId','toDeviceId','toPortId','itemId?'],
  DISCONNECT_CABLE:['cableId'], ASSOCIATE_WIFI:['deviceId','apDeviceId'],
  SET_STATIC_ADDRESS:['deviceId','address','mask?'], SET_SERVICE_STATE:['enabled'],
  SET_PERMISSIONS:['policyId'], RUN_PROBE:['testId'], SAVE_EXPLANATION:['key','text','oral'],
  GUIDE_CONSULT:['sectionId','quoteToken'], REVEAL_HINT:['sectionId','tier'],
  REQUEST_HANDOVER:[], SETTLE_CONTRACT:[], RESET_SHIFT:[], START_PRACTICE:['fixture?'], START_CLIENT:[], RETURN_TO_CLIENT:[]
};

function validateAction(action) {
  need(plain(action) && typeof action.type === 'string', 'ACTION_INVALID', 'Choose a supported action.');
  need(own(actionFields, action.type), 'ACTION_UNKNOWN', 'That action is not part of Opening Shift.');
  const fields = actionFields[action.type], allowed = ['type', ...fields.map(field => field.replace('?', ''))];
  need(Object.keys(action).every(key => allowed.includes(key)), 'ACTION_INVALID', 'The action contains unsupported fields.');
  need(fields.filter(field => !field.endsWith('?')).every(field => Object.hasOwn(action, field)), 'ACTION_INVALID', 'The action is missing required fields.');
  for (const [key, value] of Object.entries(action)) {
    if (['on','enabled','oral'].includes(key)) need(typeof value === 'boolean', 'INPUT_INVALID', 'Choose a true or false setting.');
    else if (key === 'tier') need(Number.isInteger(value) && value >= 1 && value <= 3, 'HINT_UNKNOWN', 'Choose hint level 1, 2 or 3.');
    else if (key === 'apDeviceId' && value === null) continue;
    else if (key === 'text') need(typeof value === 'string' && value.length <= 2000, 'EXPLANATION_INVALID', 'Use at most 2,000 characters for each explanation.');
    else need(typeof value === 'string' && value.length > 0 && value.length <= (key === 'quoteToken' ? 512 : 200), 'INPUT_INVALID', 'Use a valid current identifier or setting.');
  }
  return clone(action);
}

function recordInspection(session, targetId, kind, snapshot, faultRelevant, entry) {
  session.inspectionSequence++;
  const inspection = {id:`${session.id}.inspection.${pad(session.inspectionSequence)}`, eventId:entry.id,
    sequence:entry.sequence, origin:'player', targetId, kind, technicalRevision:session.technicalRevision,
    faultRelevant, snapshot:clone(snapshot)};
  session.inspections.push(inspection);
  if (faultRelevant) session.fault.observations.push({kind:'inspection', id:inspection.id, eventId:entry.id,
    sequence:entry.sequence, itemId:snapshot.itemId || targetId, address:snapshot.address ?? null, mask:snapshot.mask ?? null, snapshot:clone(inspection)});
}

function relevantObservation(session, itemId = null, before = null) {
  return [...session.fault.observations].reverse().find(observation => session.fixture === 'B' ||
    (before && observation.address === before.address && observation.mask === before.mask)) || null;
}

// Inspection can reveal an intrinsically bad profile before a complete physical path exists.
// These checks qualify evidence only; all service outcomes still come from the child engine.
function faultyProfile(session, profile, deviceId = null) {
  const ip = parseIPv4(profile.address), mask = parseIPv4(profile.mask), prefix = maskPrefix(profile.mask);
  if (ip === null || mask === null || prefix === null || prefix < 1 || prefix > 30) return true;
  const subnet = (ip & mask) >>> 0, broadcast = (subnet | (~mask >>> 0)) >>> 0;
  if (ip === subnet || ip === broadcast) return true;
  const network = attempt(session).network, clinicMask = parseIPv4(network.mask), serverIp = parseIPv4(network.serverAddress);
  if (((ip & clinicMask) >>> 0) !== ((serverIp & clinicMask) >>> 0)) return true;
  const server = role(session,'role.records');
  if (server && (((ip & mask) >>> 0) !== ((parseIPv4(server.address) & mask) >>> 0) ||
    ((ip & parseIPv4(server.mask)) >>> 0) !== ((parseIPv4(server.address) & parseIPv4(server.mask)) >>> 0))) return true;
  return Object.values(attempt(session).devices).some(device => device.id !== deviceId && device.powered && device.address === profile.address);
}

function appendPlayerProbes(session, probes, entry) {
  const current = attempt(session), nurse = role(session, 'role.nurse');
  for (const probe of probes.filter(probe => playerTestIds.includes(probe.testId) && !probe.contextLocationId)) {
    session.observationSequence++;
    const source = current.devices[probe.sourceDeviceId], item = source && itemForDevice(session, source.id);
    const observation = {...clone(probe), childObservationId:probe.id,
      id:`${session.id}.observation.${pad(session.observationSequence)}`, eventId:entry.id, sequence:entry.sequence,
      origin:'player', locationId:source?.locationId || null, itemId:item?.id || null,
      address:source?.address || null, mask:source?.mask || null,
      childTechnicalRevision:probe.testedTechnicalRevision, testedTechnicalRevision:session.technicalRevision};
    session.observations.push(observation);
    const addressFailure = session.fixture === 'A' && ['ADDRESS_WRONG_SUBNET','ADDRESS_OFF_LINK','ADDRESS_DUPLICATE','ADDRESS_RESERVED','ADDRESS_INVALID'].includes(observation.code);
    const ap = role(session, 'infra.ap'), sw = role(session, 'infra.switch');
    const missingUplink = session.fixture === 'B' && observation.code === 'PORT_DISCONNECTED' && ap && sw &&
      !current.cables.some(cable => [cable.fromDeviceId,cable.toDeviceId].includes(ap.id) && [cable.fromDeviceId,cable.toDeviceId].includes(sw.id));
    if (observation.testId === 'nurse' && nurse && (addressFailure || missingUplink))
      session.fault.observations.push({kind:'failed-test', id:observation.id, eventId:entry.id, sequence:entry.sequence,
        itemId:observation.itemId, address:observation.address, mask:observation.mask, snapshot:clone(observation)});
  }
}

function currentResults(session, childView = deriveNetwork(session.networkState)) {
  return childView.currentResults.filter(result => currentTestIds.includes(result.testId)).map(result => ({...clone(result),
    origin:'engine-check', testedTechnicalRevision:session.technicalRevision,
    childTechnicalRevision:attempt(session).technicalRevision,
    locationId:result.contextLocationId || attempt(session).devices[result.sourceDeviceId]?.locationId || null}));
}

function freshObservation(session, testId, locationId = null) {
  return [...session.observations].reverse().find(observation => observation.testId === testId &&
    observation.testedTechnicalRevision === session.technicalRevision && (!locationId || observation.locationId === locationId)) || null;
}

function requiredTests(session) {
  return [
    ['reception','Reception bookings','reception',null],
    ['nurse-room-a','Nurse workspace tested in exam room A','nurse','location.exam-a'],
    ['nurse-room-b','Nurse workspace tested in exam room B','nurse','location.exam-b'],
    ['nurse-bookings','Nurse booking workflow checked','nurse-bookings',null],
    ['access-reception','Reception clinical-workspace restriction checked','access-reception',null],
    ['access-outsider-bookings','Outsider booking access denied','access-outsider-bookings',null],
    ['access-outsider-workspace','Outsider workspace access denied','access-outsider-workspace',null]
  ].map(([id,label,testId,locationId]) => {
    const observation = freshObservation(session, testId, locationId);
    return {id,label,testId,locationId,observation:clone(observation),met:!!observation?.pass};
  });
}

function repairEvidence(session, results) {
  const nurse = role(session, 'role.nurse'), item = nurse && itemForDevice(session, nurse.id);
  const pass = freshObservation(session, 'nurse');
  const currentPass = results.find(result => result.testId === 'nurse') || null;
  const change = [...session.fault.changes].reverse().find(candidate => {
    if (!candidate.observationId || !nurse || !pass?.pass || pass.sequence <= candidate.sequence) return false;
    if (session.fixture === 'A') return candidate.itemId === item.id;
    return pass.pathIds.includes(candidate.cableId) && attempt(session).cables.some(cable => cable.id === candidate.cableId);
  }) || null;
  const witness = change ? session.fault.observations.find(observation => observation.id === change.observationId) : session.fault.observations.at(-1);
  return {kind:session.fault.kind, faultId:session.fault.faultId,
    initialCondition:clone(session.fault.initialCondition),
    observation:witness ? clone(witness.snapshot) : null, observationKind:witness?.kind || null,
    change:clone(change), currentPass:clone(currentPass), confirmed:!!(change && currentPass?.pass && pass?.pass),
    recordedRetest:change && pass?.pass ? clone(pass) : null,
    preRepairFailureObserved:!!(change && session.fault.observations.some(observation => observation.kind === 'failed-test' && observation.sequence < change.sequence))};
}

function explanationView(session) {
  return Object.fromEntries(EXPLANATION_KEYS.map(key => {
    const explanation = session.explanations[key];
    const stale = key === 'privacy' && explanation.submitted &&
      (explanation.context?.policyRevision !== attempt(session).policyRevision ||
       explanation.context?.policyId !== attempt(session).policyId || !session.policyDecision ||
       explanation.context?.policyDecisionEventId !== session.policyDecision.eventId);
    return [key, {...clone(explanation), stale:!!stale, review:'pending-teacher'}];
  }));
}

function evaluation(session) {
  const childView = deriveNetwork(session.networkState), results = currentResults(session, childView);
  const tests = requiredTests(session), repair = repairEvidence(session, results), explanations = explanationView(session);
  const nurse = role(session, 'role.nurse'), item = nurse && itemForDevice(session, nurse.id);
  const deviceChoice = !!(item && session.equipmentDecision?.itemId === item.id);
  const serviceTruth = !!nurse && rooms.includes(nurse.locationId) && results.every(result => result.pass);
  const policyChoice = !!session.policyDecision && session.policyDecision.policyId === attempt(session).policyId && acceptablePolicies.includes(attempt(session).policyId);
  const objectives = [
    {id:'objective.opening.brief',label:'Review the client brief',met:session.briefReviewed,detail:'Record your review of the requested outcome and allowance.'},
    {id:'objective.opening.equipment',label:'Choose the nurse equipment',met:deviceChoice,detail:'Explicitly retain the owned laptop or assign the purchased tablet.'},
    {id:'objective.opening.repair',label:'Observe and repair the actual fault',met:repair.confirmed,detail:'A real inspection or failed test must precede a relevant change and a current passing nurse retest.'},
    {id:'objective.opening.services',label:'Preserve reception and provide the required clinic services',met:serviceTruth,detail:'Current physical, address, service, mobility and authorization checks must agree.'},
    {id:'objective.opening.tests',label:'Record fresh tests in both rooms and check access',met:tests.every(test => test.met),detail:'Both room tests are player actions. Engine checks do not supply them.'},
    {id:'objective.opening.policy',label:'Choose or explicitly retain a responsible access policy',met:policyChoice,detail:'Reception must book; nurses need the workspace; outsiders stay denied. Nurse bookings are a justified choice.'},
    {id:'objective.opening.reasoning',label:'Submit four explanations or arrange oral review',met:EXPLANATION_KEYS.every(key => explanations[key].submitted && (explanations[key].text.trim() || explanations[key].oral) && !explanations[key].stale),detail:'Exact words and pending oral items are preserved for teacher judgement.'}
  ];
  const ready = objectives.every(objective => objective.met);
  const stageId = !session.briefReviewed ? 'brief' : !deviceChoice || !serviceTruth || !repair.confirmed ? 'build' : !tests.every(test => test.met) || !policyChoice ? 'check' : 'handover';
  return {childView, results, tests, repair, explanations, objectives, ready, stageId};
}

function evidenceSnapshot(state, session, checked = evaluation(session)) {
  return {missionId:MISSION_ID, campaignId:state.campaignId, sessionId:session.id, mode:session.mode,
    fixtureId:session.fixtureId, technicalRevision:session.technicalRevision, ready:checked.ready,
    briefReviewed:session.briefReviewed, questions:clone(session.questions),
    equipmentDecision:clone(session.equipmentDecision), policyDecision:clone(session.policyDecision),
    policy:clone(POLICIES[attempt(session).policyId]), network:clone(attempt(session).network),
    devices:clone(checked.childView.devices), cables:clone(attempt(session).cables), inventory:clone(Object.values(session.inventory)),
    transactions:clone(session.transactions), economy:economy(state, session), guideGrants:clone(session.help.grants),
    inspections:clone(session.inspections), playerObservations:session.observations.map(observation => ({...clone(observation), stale:observation.testedTechnicalRevision !== session.technicalRevision})),
    currentEngineChecks:clone(checked.results), requiredTests:clone(checked.tests), repair:clone(checked.repair),
    faultHistory:clone(session.fault), explanations:clone(checked.explanations), objectives:clone(checked.objectives),
    history:clone(session.events), teacherReview:'Reasoning and any oral explanation remain pending teacher review; no grade or mastery is inferred.',
    followUp:{wearableCompleted:false,bootcampCompleted:false},
    limitations:['Named clinic-room coverage, not measured radio physics.','Local IPv4 only; no router, Internet, DHCP, DNS or VLAN model.','Authorization is a simulated role matrix, not real authentication.','Synthetic service results only; no clinical or personal data.']};
}

function startPractice(state, fixture) {
  need(own(fixtureDefinitions, fixture), 'FIXTURE_UNKNOWN', 'Choose fixture A or B.');
  state.practiceSequence++;
  state.practice = createSession(state.campaignId, fixture, 'practice', state.practiceSequence);
  state.activeMode = 'practice';
  event(state.practice, 'START_PRACTICE', {fixture, clientPreserved:true, earnings:0});
}

function resetActive(state) {
  const old = active(state);
  if (old.mode === 'client' && old.delivery) {
    startPractice(state, old.fixture);
    return 'Opened separate free practice. The original handover and payment remain preserved.';
  }
  if (old.mode === 'practice') {
    startPractice(state, old.fixture);
    return 'Started a fresh free rehearsal. The independent job is preserved.';
  }
  for (const item of Object.values(old.inventory).filter(item => item.purchased))
    purchaseTransaction(old, 'refund', item, item.paidPrice, 'Client reset returned purchased equipment.');
  const fresh = createSession(state.campaignId, old.fixture, 'client', old.generation+1);
  fresh.help = clone(old.help);
  fresh.transactions = clone(old.transactions);
  fresh.transactionSequence = old.transactionSequence;
  state.client = fresh;
  event(fresh, 'RESET_SHIFT', {previousSessionId:old.id, paidGuideCostsPreserved:true, equipmentRefunded:true});
  return 'Restarted the client installation. Equipment purchases were refunded; paid guide sections and their costs remain.';
}

function applyAction(state, action) {
  if (action.type === 'START_PRACTICE') {
    startPractice(state, action.fixture || active(state).fixture);
    return {code:'PRACTICE_STARTED',message:'Free rehearsal opened. Client work and money are preserved.'};
  }
  if (['START_CLIENT','RETURN_TO_CLIENT'].includes(action.type)) {
    state.activeMode = 'client';
    event(state.client, action.type, {resumed:true, legacyBootcampClaimed:false});
    return {code:'CLIENT_RESUMED',message:'Resumed the independent client job with its existing work, guide costs and payment.'};
  }
  if (action.type === 'RESET_SHIFT') return {code:'SHIFT_RESET',message:resetActive(state)};
  const session = active(state), beforeFingerprint = technicalFingerprint(session);
  const allowedFrozen = ['REQUEST_HANDOVER','SETTLE_CONTRACT','GUIDE_CONSULT','REVEAL_HINT'];
  need(!session.delivery || allowedFrozen.includes(action.type), 'DELIVERY_FROZEN', 'The delivered job is frozen. Open free practice to make further changes.');
  let code = 'ACTION_APPLIED', message = 'Action applied.', payload = clone(action), finalize = null;
  delete payload.type;
  switch (action.type) {
    case 'REVIEW_BRIEF': session.briefReviewed = true; message = 'Brief reviewed. Choose equipment, inspect the setup and preserve reception.'; break;
    case 'ASK_CLIENT':
      need(questionIds.includes(action.questionId), 'QUESTION_UNKNOWN', 'Choose one of the client questions.');
      if (!session.questions.includes(action.questionId)) session.questions.push(action.questionId);
      message = 'Client requirement recorded. The answer is available in the phone panel.'; break;
    case 'INSPECT_DEVICE': {
      const view = deriveNetwork(session.networkState), device = view.devices.find(device => device.id === action.deviceId);
      need(device, 'DEVICE_UNKNOWN', 'Choose an installed device.');
      const item = itemForDevice(session, device.id), ap = role(session,'infra.ap'), sw = role(session,'infra.switch');
      const hasUplink = ap && sw && attempt(session).cables.some(cable => [cable.fromDeviceId,cable.toDeviceId].includes(ap.id) && [cable.fromDeviceId,cable.toDeviceId].includes(sw.id));
      const relevant = session.fixture === 'A' ? device.roleId === 'role.nurse' && faultyProfile(session,device,device.id) : ['infra.ap','infra.switch'].includes(device.roleId) && !hasUplink;
      const snapshot = {...clone(device),itemId:item.id,cables:clone(attempt(session).cables.filter(cable => [cable.fromDeviceId,cable.toDeviceId].includes(device.id))),network:clone(attempt(session).network)};
      finalize = entry => recordInspection(session, device.id, 'device', snapshot, !!relevant, entry);
      message = 'Recorded the displayed settings and connections. Inspection is free.'; break;
    }
    case 'INSPECT_CABLE': {
      const item = getItem(session,action.itemId);
      need(item.kind === 'ethernet-cable', 'CABLE_ITEM_REQUIRED', 'Choose an owned cable item.');
      const snapshot = {itemId:item.id,connected:!!item.cableId,connection:clone(attempt(session).cables.find(cable => cable.id === item.cableId) || null),rememberedEndpoints:clone(item.rememberedEndpoints)};
      const relevant = session.fixture === 'B' && item.id === 'item.uplink' && !item.cableId;
      finalize = entry => recordInspection(session,item.id,'cable',snapshot,relevant,entry);
      message = item.cableId ? 'Recorded this cable’s actual endpoints.' : 'Recorded the disconnected cable and its remembered endpoints. It carries no traffic while in stock.'; break;
    }
    case 'BUY_ITEM': {
      const definition = shopDefinitions.find(item => item.sku === action.sku);
      need(definition, 'SHOP_ITEM_UNKNOWN', 'Choose an item from this mission shop.');
      const item = getItem(session,definition.itemId,false);
      need(!item.owned, 'ITEM_ALREADY_OWNED', 'This item is already in the clinic inventory.');
      const price = session.mode === 'practice' ? 0 : definition.price;
      need(economy(state,session).remaining >= price, 'ALLOWANCE_EXCEEDED', 'Return an earlier purchase before changing the equipment plan.');
      const transaction = purchaseTransaction(session,'purchase',item,price,session.mode === 'practice' ? 'Free rehearsal item.' : 'Client equipment purchase.');
      item.owned = true; item.purchased = true; item.paidPrice = price; item.purchaseTransactionId = transaction.id;
      payload = {...payload, itemId:item.id, paidPrice:price, transactionId:transaction.id};
      message = `${definition.label} added to stock for ${price} credits.`; break;
    }
    case 'INSTALL_ITEM': case 'ASSIGN_NURSE': {
      const item = getItem(session,action.itemId);
      if (action.type === 'ASSIGN_NURSE' || ['item.laptop','item.tablet'].includes(item.id)) {
        const initialized = assignNurse(session,item,action.locationId);
        finalize = entry => {
          session.equipmentDecision = {itemId:item.id,kind:item.kind,eventId:entry.id,sequence:entry.sequence,origin:'player'};
          if (initialized) {
            const setup = event(session,'INITIALIZE_DEPLOYMENT_PROFILE',{itemId:item.id,address:item.initialization.address,mask:item.initialization.mask,triggerEventId:entry.id,learnerConfiguration:false},'mission-setup');
            item.initialization.eventId = setup.id;
          }
        };
        message = initialized ? 'Tablet assigned with the inherited clinic deployment profile once. Inspect it, power it and connect its Wi-Fi.' : 'Nurse equipment choice recorded. A retained profile is restored without repeating its initial setup.';
      } else {
        need(item.id === 'item.ap', 'CONNECT_PORTS_REQUIRED', 'Install a cable by choosing its actual device ports.');
        need(!item.installed, 'ITEM_ALREADY_INSTALLED', 'The access point is already installed.');
        networkAction(session,{type:'CHOOSE_DEVICE',roleId:'infra.ap',kind:'access-point'},'inventory-transfer');
        const device = role(session,'infra.ap');
        item.deviceId = device.id; item.installed = true; item.profileInitialized = true;
        networkAction(session,{type:'PLACE_DEVICE',deviceId:device.id,locationId:action.locationId || 'location.equipment'},'inventory-transfer');
        item.profile = deviceProfile(getDevice(session,device.id));
        message = 'Access point installed. Power it, connect its Ethernet uplink and associate the nurse device.';
      }
      break;
    }
    case 'UNINSTALL_ITEM': {
      const item = getItem(session,action.itemId);
      need(['item.ap','item.laptop','item.tablet'].includes(item.id) || item.kind === 'ethernet-cable', 'FIXED_EQUIPMENT', 'The host, reception workstation and switch stay with this clinic.');
      need(item.installed, 'ITEM_NOT_INSTALLED', 'This item is already in stock.');
      uninstall(session,item); message = 'Item returned to clinic stock. Dependent links and associations were removed.'; break;
    }
    case 'RETURN_ITEM': {
      const item = getItem(session,action.itemId);
      need(item.purchased && !item.clientOwned, 'NO_PURCHASE_REFUND', 'Client-owned equipment has no purchase refund.');
      const refund = item.paidPrice;
      uninstall(session,item);
      const transaction = purchaseTransaction(session,'refund',item,refund,'Item returned before handover.');
      item.owned = false; item.purchased = false; item.paidPrice = 0; item.purchaseTransactionId = null;
      payload = {...payload,refund,transactionId:transaction.id};
      message = `Returned ${item.label}; refunded ${refund} credits once.`; break;
    }
    case 'CONNECT_PORTS': {
      const item = action.itemId ? getItem(session,action.itemId) : Object.values(session.inventory).find(item => item.kind === 'ethernet-cable' && item.owned && !item.cableId);
      need(item, 'CABLE_REQUIRED', 'Buy or free an owned Ethernet cable before connecting these ports.');
      need(item.kind === 'ethernet-cable' && !item.cableId, 'CABLE_UNAVAILABLE', 'Choose a free owned Ethernet cable.');
      const networkPayload = {...action}; delete networkPayload.itemId;
      networkAction(session,networkPayload);
      const cable = attempt(session).cables.at(-1);
      item.cableId = cable.id; item.installed = true; item.rememberedEndpoints = clone(cable);
      payload = {...payload,itemId:item.id,cableId:cable.id};
      const endpointRoles = [getDevice(session,cable.fromDeviceId).roleId,getDevice(session,cable.toDeviceId).roleId];
      if (session.fixture === 'B' && endpointRoles.includes('infra.ap') && endpointRoles.includes('infra.switch')) {
        const observation = relevantObservation(session);
        finalize = entry => session.fault.changes.push({kind:'uplink-reconnection',eventId:entry.id,sequence:entry.sequence,
          technicalRevision:session.technicalRevision,origin:'player',itemId:item.id,cableId:cable.id,
          endpoints:clone(cable),observationId:observation?.id || null});
      }
      message = 'Connected the selected Ethernet ports with an owned cable. Run a service test to observe the result.'; break;
    }
    case 'DISCONNECT_CABLE': {
      const prior = clone(attempt(session).cables);
      networkAction(session,action);
      syncCables(session,prior);
      message = 'Cable disconnected into stock; the remembered endpoints carry no traffic.'; break;
    }
    case 'SET_STATIC_ADDRESS': {
      const device = getDevice(session,action.deviceId), before = {address:device.address,mask:device.mask};
      const item = itemForDevice(session,device.id), wasNurse = device.roleId === 'role.nurse', beforeFaulty = faultyProfile(session,device,device.id);
      const observation = relevantObservation(session,item?.id,before);
      const result = networkAction(session,action);
      const afterDevice = getDevice(session,action.deviceId), after = {address:afterDevice.address,mask:afterDevice.mask};
      item.profile = deviceProfile(afterDevice);
      if (session.fixture === 'A' && wasNurse && beforeFaulty && !faultyProfile(session,afterDevice,afterDevice.id) && (before.address !== after.address || before.mask !== after.mask))
        finalize = entry => session.fault.changes.push({kind:'address-change',eventId:entry.id,sequence:entry.sequence,
          technicalRevision:session.technicalRevision,origin:'player',itemId:item.id,deviceId:device.id,before,after,observationId:observation?.id || null});
      message = result.message === 'Action applied.' ? 'Address settings applied. Run the nurse test to check the actual result.' : result.message; break;
    }
    case 'POWER_DEVICE': case 'PLACE_DEVICE': case 'MOVE_NURSE': case 'ASSOCIATE_WIFI': case 'SET_SERVICE_STATE': {
      const result = networkAction(session,action); message = result.message;
      break;
    }
    case 'SET_PERMISSIONS': {
      const previous = attempt(session).policyId;
      networkAction(session,action);
      finalize = entry => {
        // Reaffirming an unchanged policy keeps an existing matching reasoning context valid.
        if (!session.policyDecision || previous !== action.policyId)
          session.policyDecision = {policyId:action.policyId,retained:previous === action.policyId,eventId:entry.id,sequence:entry.sequence,
            policyRevision:attempt(session).policyRevision,origin:'player'};
      };
      message = action.policyId === 'policy.roles-separated' ? 'Reception retains booking responsibility; nurses use the workspace. Test the denial and explain this workflow.' :
        action.policyId === 'policy.nurse-also-books' ? 'Nurses may book follow-ups and use the workspace. Test allowed staff work and outsider denial.' : 'Exploration policy applied. Run required-work and outsider tests to observe its consequences.';
      break;
    }
    case 'RUN_PROBE': {
      need(['reception','nurse','nurse-bookings','access','all'].includes(action.testId), 'TEST_UNKNOWN', 'Choose reception, nurse, nurse bookings, access or all current-location tests.');
      const previousSequence = attempt(session).observationSequence;
      networkAction(session,action);
      const probes = attempt(session).observations.filter(probe => Number(probe.id.split('.').at(-1)) > previousSequence);
      finalize = entry => appendPlayerProbes(session,probes,entry);
      const scoped = probes.filter(probe => playerTestIds.includes(probe.testId));
      message = scoped.every(probe => probe.pass) ? 'Selected checks passed at the current revision. A nurse test records only its actual current room.' : scoped.find(probe => !probe.pass)?.message || 'Test recorded.';
      break;
    }
    case 'SAVE_EXPLANATION': {
      need(EXPLANATION_KEYS.includes(action.key), 'EXPLANATION_UNKNOWN', 'Choose equipment, repair, privacy or limitations.');
      finalize = entry => {
        session.explanations[action.key] = {text:action.text,oral:action.oral,submitted:true,eventId:entry.id,
          context:{technicalRevision:session.technicalRevision,policyId:attempt(session).policyId,policyRevision:attempt(session).policyRevision,
            policyDecisionEventId:session.policyDecision?.eventId || null,nurseItemId:itemForDevice(session,role(session,'role.nurse')?.id)?.id || null,
            equipmentDecision:clone(session.equipmentDecision),observationIds:requiredTests(session).map(test => test.observation?.id).filter(Boolean)}};
      };
      message = 'Your exact explanation and decision context are saved for teacher review.'; break;
    }
    case 'GUIDE_CONSULT': {
      const quote = guideQuote(state,session,action.sectionId);
      need(quote, 'GUIDE_UNKNOWN', 'Choose one of the three technical-guide sections.');
      need(quote.quoteToken === action.quoteToken, 'QUOTE_STALE', 'The quote changed. Review its current cost; no charge was made.');
      if (!quote.alreadyGranted) {
        session.help.revision++;
        session.help.grants.push({id:`${session.id}.guide.${session.help.grants.length+1}`,sectionId:action.sectionId,credits:quote.credits,minutes:quote.minutes,
          mode:session.mode,phase:phase(session),origin:'player'});
      }
      payload = {...payload,credits:quote.credits,minutes:quote.minutes,reopen:quote.alreadyGranted};
      message = `Guide section opened: ${quote.credits} credits and ${quote.minutes} simulated minutes. All its hint levels and later reopens are included.`; break;
    }
    case 'REVEAL_HINT': {
      need(guideIds.includes(action.sectionId), 'GUIDE_UNKNOWN', 'Choose a listed guide section.');
      need(session.mode === 'practice' || !!session.delivery || session.help.grants.some(grant => grant.sectionId === action.sectionId), 'GUIDE_LOCKED', 'Review and accept this section’s displayed consultation quote first.');
      session.help.hints[action.sectionId] = Math.max(session.help.hints[action.sectionId] || 0, action.tier);
      message = 'Hint level revealed. No additional charge or reading-time penalty applies.'; break;
    }
    case 'REQUEST_HANDOVER': {
      need(session.mode === 'client', 'CLIENT_ONLY', 'Free rehearsal earns no client fee and cannot hand over the independent job.');
      if (session.delivery) return {code:'DELIVERY_ALREADY_RECORDED',message:'The original handover is already frozen; no second fee is created.'};
      const checked = evaluation(session);
      need(checked.ready, 'HANDOVER_INCOMPLETE', `Handover needs: ${checked.objectives.filter(objective => !objective.met).map(objective => objective.label).join('; ')}.`);
      // This current evaluation never appends a player probe or supplies a missing room visit.
      const fee = economy(state,session);
      finalize = entry => {
        session.delivery = {id:`${state.campaignId}|${MISSION_ID}|delivery.001`,eventId:entry.id,
          technicalRevision:session.technicalRevision,grossFee:fee.gross,reservedCredits:fee.reserved,
          consultationMinutes:fee.minutes,netFee:fee.net,equipmentSpent:fee.spent,unusedAllowance:fee.remaining,
          guideGrants:clone(session.help.grants),currentChecks:clone(checked.results),evidence:evidenceSnapshot(state,session,checked)};
      };
      message = 'Handover frozen with actual player tests, current engine checks, exact explanations and costs. Teacher review remains pending.'; break;
    }
    case 'SETTLE_CONTRACT': {
      need(session.mode === 'client', 'CLIENT_ONLY', 'Free rehearsal cannot collect client money. Return to the independent job.');
      need(session.delivery, 'DELIVERY_REQUIRED', 'Complete the client handover before collecting its fee.');
      if (session.settlement) return {code:'ALREADY_SETTLED',message:'This job has already been paid. The existing receipt and wallet are unchanged.'};
      const delivery = session.delivery;
      const receipt = {id:`${state.campaignId}|${MISSION_ID}|payment.001`,deliveryId:delivery.id,
        grossFee:delivery.grossFee,supportExpense:delivery.reservedCredits,netFee:delivery.netFee,consultationMinutes:delivery.consultationMinutes};
      state.wallet += receipt.netFee; session.settlement = receipt;
      payload = clone(receipt);
      message = `Collected ${receipt.netFee} fictional credits: ${receipt.grossFee} fee minus ${receipt.supportExpense} guide cost. Unused equipment allowance stays with the client.`; break;
    }
    default: fail('ACTION_UNKNOWN','That action is not supported.');
  }
  if (technicalFingerprint(session) !== beforeFingerprint) session.technicalRevision++;
  const entry = event(session,action.type,payload);
  if (finalize) finalize(entry);
  return {code,message};
}

export function dispatchShift(state, action) {
  try {
    const canonicalAction = validateAction(action);
    need(state.actions.length < MAX_ACTIONS, 'ACTION_CAPACITY', 'This progress record reached its action limit. Export it before opening a separate new campaign.');
    const next = clone(state);
    const result = applyAction(next,canonicalAction);
    next.actions.push(canonicalAction);
    next.revision++;
    need(bytes(next) <= MAX_BYTES, 'SAVE_CAPACITY', 'This action would exceed the 1 MiB progress limit. Current progress is unchanged; export it before starting a separate campaign.');
    return {state:next,accepted:true,code:result.code,message:result.message};
  } catch (error) {
    if (error.code) return {state,accepted:false,code:error.code,message:error.message};
    throw error;
  }
}

export function deriveShift(state) {
  const session = active(state), checked = evaluation(session), child = checked.childView;
  const currentPhase = phase(session);
  const nextAction = currentPhase === 'settled' ? 'Download your delivery evidence or open a free rehearsal.'
    : currentPhase === 'delivered' ? 'Collect the frozen fee and download your delivery evidence.'
    : checked.objectives.find(objective => !objective.met)?.label
      || (session.mode === 'practice' ? 'Export the free rehearsal evidence for teacher review.' : 'Review your evidence and request handover.');
  const mappedDevices = child.devices.map(device => ({...clone(device),itemId:itemForDevice(session,device.id)?.id || null}));
  const mappedCables = child.cables.map(cable => ({...clone(cable),itemId:Object.values(session.inventory).find(item => item.cableId === cable.id)?.id || null}));
  const diagnostics = [...session.observations].reverse().map(observation => ({...clone(observation),stale:observation.testedTechnicalRevision !== session.technicalRevision}));
  const stageDetails = {
    brief:{title:'Understand the shift',goals:['device-fit','stakeholders']},
    build:{title:'Make a working path',goals:['connection-choice','address','diagnosis']},
    check:{title:'Prove it in the workplace',goals:['system-path','access','diagnosis']},
    handover:{title:'Explain your decision',goals:['stakeholders','handover']}
  }[checked.stageId];
  return {missionId:MISSION_ID,campaignId:state.campaignId,attemptId:session.id,revision:state.revision,buildVersion:VERSION,schemaVersion:1,
    mode:session.mode,fixture:session.fixture,fixtureId:session.fixtureId,phase:currentPhase,stageId:checked.stageId,
    technicalRevision:session.technicalRevision,briefReviewed:session.briefReviewed,
    questions:questionIds.map(id => ({id,asked:session.questions.includes(id)})),
    devices:mappedDevices,cables:mappedCables,
    inventory:Object.values(session.inventory).map(item => ({...clone(item),returnable:item.purchased && !item.clientOwned && !session.delivery})),
    shop:shopDefinitions.map(definition => ({...clone(definition),catalogPrice:definition.price,price:session.mode === 'practice' ? 0 : definition.price,
      owned:session.inventory[definition.itemId].owned,purchased:session.inventory[definition.itemId].purchased,
      canBuy:!session.inventory[definition.itemId].owned && !session.delivery && economy(state,session).remaining >= (session.mode === 'practice' ? 0 : definition.price)})),
    nurseDeviceId:role(session,'role.nurse')?.id || null,apDeviceId:role(session,'infra.ap')?.id || null,
    switchDeviceId:role(session,'infra.switch')?.id || null,serverDeviceId:role(session,'role.records')?.id || null,
    receptionDeviceId:role(session,'role.reception')?.id || null,
    network:clone(attempt(session).network),locations:clone(LOCATIONS),policy:clone(POLICIES[attempt(session).policyId]),policies:clone(Object.values(POLICIES)),serverEnabled:attempt(session).serverEnabled,
    observations:diagnostics,diagnostics,inspections:[...session.inspections].reverse().map(inspection => ({...clone(inspection),stale:inspection.technicalRevision !== session.technicalRevision})),
    currentResults:checked.results,requiredTests:checked.tests,objectives:checked.objectives,
    missing:checked.objectives.filter(objective => !objective.met).map(objective => objective.label),ready:checked.ready,
    repair:checked.repair,policyDecision:clone(session.policyDecision),explanations:checked.explanations,
    history:clone(session.events),messages:diagnostics.slice(0,12).map(observation => ({id:`message.${observation.id}`,kind:'observation',text:observation.message,
      observationId:observation.id,stale:observation.stale})),
    economy:economy(state,session),transactions:clone(session.transactions),
    guideQuotes:guideIds.map(id => guideQuote(state,session,id)),hints:clone(session.help.hints),delivery:clone(session.delivery),settlement:clone(session.settlement),
    learningFocus:{stageId:checked.stageId,title:stageDetails.title,goalIds:stageDetails.goals.map(goal => `cc.clinic.${goal}`),nextAction},
    limits:{maxActions:MAX_ACTIONS,remainingActions:MAX_ACTIONS-state.actions.length,maxSaveBytes:MAX_BYTES},
    followUp:{wearableCompleted:false,bootcampCompleted:false}};
}

function canonicalJSON(value, depth = 0) {
  need(depth <= 50, 'SAVE_DEPTH', 'The progress file is nested too deeply.');
  if (Array.isArray(value)) return `[${value.map(child => canonicalJSON(child,depth+1)).join(',')}]`;
  if (plain(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJSON(value[key],depth+1)}`).join(',')}}`;
  return JSON.stringify(value);
}

export function validateShiftSave(raw) {
  try {
    need(bytes(raw) <= MAX_BYTES, 'SAVE_TOO_LARGE', 'Opening Shift progress must be no larger than 1 MiB.');
    const saved = typeof raw === 'string' ? JSON.parse(raw) : clone(raw);
    need(plain(saved), 'SAVE_FORMAT', 'Choose an Opening Shift progress object.');
    if (!saved.appId && saved.schemaVersion === 1 && plain(saved.attempts) && typeof saved.activeAttemptId === 'string')
      return {valid:false,code:'LEGACY_SAVE',error:'This is an earlier Connect the Clinic save. Open the preserved legacy game to resume it; it cannot claim Opening Shift progress.',legacyUrl:'../index.html'};
    need(saved.appId === APP_ID && saved.schemaVersion === 1 && saved.buildVersion === VERSION && saved.missionId === MISSION_ID, 'SAVE_VERSION', 'This file is not a supported Opening Shift save.');
    need(plain(saved.seed) && Object.keys(saved.seed).sort().join(',') === 'fixture,mode', 'SAVE_SEED', 'The original fixture and mode are missing or invalid.');
    need(Array.isArray(saved.actions) && saved.actions.length <= MAX_ACTIONS, 'SAVE_ACTION_LIMIT', 'The accepted-action log is missing or exceeds the replay limit.');
    need(saved.imported === undefined || typeof saved.imported === 'boolean', 'SAVE_PROVENANCE', 'Import provenance is invalid.');
    need(saved.importProvenance === undefined || ['none','manual-file','legacy-unknown','automatic-restore'].includes(saved.importProvenance), 'SAVE_PROVENANCE', 'Import provenance is invalid.');
    let reconstructed = createShift({campaignId:saved.campaignId,fixture:saved.seed.fixture,mode:saved.seed.mode});
    for (let index = 0; index < saved.actions.length; index++) {
      const result = dispatchShift(reconstructed,saved.actions[index]);
      need(result.accepted, 'SAVE_REPLAY_REJECTED', `Saved action ${index+1} is invalid: ${result.code}. No progress was replaced.`);
      reconstructed = result.state;
    }
    const comparableSaved = clone(saved), comparableReplay = clone(reconstructed);
    for (const key of ['imported','importProvenance']) { delete comparableSaved[key]; delete comparableReplay[key]; }
    need(canonicalJSON(comparableSaved) === canonicalJSON(comparableReplay), 'SAVE_REPLAY_MISMATCH', 'Saved settings, evidence, inventory or finances do not match the deterministic action replay. No progress was replaced.');
    reconstructed.imported = saved.imported ?? false;
    reconstructed.importProvenance = saved.importProvenance ?? (saved.imported ? 'legacy-unknown' : 'none');
    return {valid:true,state:reconstructed};
  } catch (error) {
    return {valid:false,code:error.code || 'SAVE_INVALID',error:error.code ? error.message : 'This is not valid bounded Opening Shift JSON. Current progress is unchanged.'};
  }
}

export function createShiftEvidence(state) {
  const session = active(state), snapshot = evidenceSnapshot(state,session), fee = economy(state,session);
  const json = {format:'opening-shift-evidence',schemaVersion:1,buildVersion:VERSION,missionId:MISSION_ID,
    campaignId:state.campaignId,imported:state.imported ?? false,importProvenance:state.importProvenance ?? 'none',
    current:snapshot,delivered:clone(state.client.delivery),settlement:clone(state.client.settlement),wallet:state.wallet,
    acceptedActionLog:clone(state.actions),localEvidenceNotice:'Local files are editable. Deterministic replay verifies consistency, not the identity or independent authorship of a human learner.'};
  const lines = [
    'OPENING SHIFT — EVIDENCE FOR TEACHER REVIEW',
    `${MISSION_ID} | ${session.fixtureId} | ${session.mode === 'practice' ? 'FREE REHEARSAL — zero earnings' : 'INDEPENDENT CLIENT JOB'}`,
    `Campaign: ${state.campaignId} | Current technical revision: ${session.technicalRevision}`,
    'The original bootcamp and wearable follow-up are not completed by this mission.',
    '', 'CURRENT EQUIPMENT AND DECISIONS',
    `Nurse choice: ${session.equipmentDecision?.itemId || 'not explicitly recorded'}.`,
    `Policy: ${POLICIES[attempt(session).policyId].label}; explicit decision: ${session.policyDecision ? 'recorded' : 'not recorded'}.`,
    `Client equipment allowance: ${fee.allowance}; spent ${fee.spent}; unused ${fee.remaining}. Unused allowance is not contractor income.`,
    `Fee: ${fee.gross}; guide cost: ${fee.reserved}; simulated consultation minutes: ${fee.minutes}; net: ${fee.net}; wallet: ${state.wallet}.`,
    ...session.transactions.map(transaction => `${transaction.type}: ${transaction.itemId}, ${transaction.amount} credits (${transaction.id}).`),
    '', 'OBSERVATION AND REPAIR',
    snapshot.repair.observation ? `Recorded ${snapshot.repair.observationKind}: ${snapshot.repair.observation.id}.` : 'No relevant pre-change observation is recorded.',
    snapshot.repair.change ? `Relevant change: ${snapshot.repair.change.kind} (${snapshot.repair.change.eventId}).` : 'No relevant change with a current passing retest is confirmed.',
    snapshot.repair.preRepairFailureObserved ? 'A real pre-repair player failure was recorded.' : 'No pre-repair player failure is claimed; an actual inspection may support proactive repair.',
    '', 'RECORDED PLAYER TESTS (current and historical)',
    ...snapshot.playerObservations.map(observation => `${observation.id}: ${observation.testId} at ${observation.locationId}; ${observation.code}; ${observation.pass ? 'pass' : 'does not pass'}; ${observation.stale ? 'STALE' : 'current'}; origin player; path ${observation.pathIds.join(' -> ') || '[no complete physical path]'}.`),
    '', 'CURRENT ENGINE CHECKS — not learner tests',
    ...snapshot.currentEngineChecks.map(result => `${result.testId}: ${result.code}; ${result.pass ? 'pass' : 'does not pass'}; engine-check.`),
    '', 'EXACT LEARNER EXPLANATIONS'
  ];
  for (const key of EXPLANATION_KEYS) {
    const explanation = snapshot.explanations[key];
    lines.push(`\n${key.toUpperCase()}${explanation.stale ? ' — CONTEXT STALE' : ''}`,explanation.text || '[No written explanation]',
      explanation.oral ? 'Oral explanation PENDING teacher conversation.' : 'Written reasoning remains pending teacher judgement.',
      `Recorded context: ${JSON.stringify(explanation.context)}.`);
  }
  lines.push('', 'DELIVERY AND PAYMENT', state.client.delivery ? `Frozen delivery ${state.client.delivery.id}: net fee ${state.client.delivery.netFee}; ${state.client.delivery.evidence.playerObservations.length} actual player observations frozen separately from engine checks.` : 'No independent client handover is frozen.',
    state.client.settlement ? `Payment receipt ${state.client.settlement.id}: ${state.client.settlement.netFee} credits, settled once.` : 'No payment receipt recorded.',
    '', 'LIMITATIONS', ...snapshot.limitations, snapshot.teacherReview,
    `Import provenance: ${json.importProvenance}.`,json.localEvidenceNotice);
  return {json,text:lines.join('\n')};
}
