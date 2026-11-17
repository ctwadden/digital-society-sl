import test from 'node:test';
import assert from 'node:assert/strict';
import {createShift, dispatchShift, deriveShift, validateShiftSave, createShiftEvidence, SHIFT_CATALOG} from '../../dist/opening/engine.js';
import {createGame} from '../../dist/engine.js';

const copy = value => JSON.parse(JSON.stringify(value));
function harness(options = {}, initial = null) {
  let state = initial || createShift({campaignId:'test.opening',...options});
  return {
    get state() { return state; },
    get view() { return deriveShift(state); },
    act(type, fields = {}) {
      const result = dispatchShift(state,{type,...fields});
      assert.equal(result.accepted,true,`${type}: ${result.code}: ${result.message}`);
      state = result.state;
      return result;
    },
    reject(type, fields, code) {
      const before = state, serialized = JSON.stringify(state), result = dispatchShift(state,{type,...fields});
      assert.equal(result.accepted,false,`${type} should reject`);
      assert.equal(result.code,code);
      assert.equal(result.state,before,'rejection preserves exact original state identity');
      assert.equal(JSON.stringify(state),serialized,'rejection cannot partially mutate a nested state');
      return result;
    }
  };
}
const device = (h,itemId) => h.view.devices.find(device => device.itemId === itemId);
const item = (h,itemId) => h.view.inventory.find(item => item.id === itemId);
const result = (h,testId) => h.view.currentResults.find(result => result.testId === testId);
const ether = (h,deviceId,number = 1) => h.view.devices.find(device => device.id === deviceId).ports.filter(port => port.medium === 'ethernet')[number-1].id;
function uplink(h,port = 3,reverse = false) {
  const v = h.view;
  const from = {deviceId:v.apDeviceId,portId:ether(h,v.apDeviceId)}, to = {deviceId:v.switchDeviceId,portId:ether(h,v.switchDeviceId,port)};
  h.act('CONNECT_PORTS',{itemId:'item.uplink',fromDeviceId:reverse ? to.deviceId : from.deviceId,
    fromPortId:reverse ? to.portId : from.portId,toDeviceId:reverse ? from.deviceId : to.deviceId,toPortId:reverse ? from.portId : to.portId});
}
function installA(h) {
  h.act('BUY_ITEM',{sku:'access-point'});
  h.act('BUY_ITEM',{sku:'ethernet-cable'});
  h.act('INSTALL_ITEM',{itemId:'item.ap',locationId:'location.equipment'});
  h.act('POWER_DEVICE',{deviceId:h.view.apDeviceId,on:true});
  uplink(h);
  h.act('ASSOCIATE_WIFI',{deviceId:h.view.nurseDeviceId,apDeviceId:h.view.apDeviceId});
}
function selectNurse(h,tablet = false) {
  if (tablet) h.act('BUY_ITEM',{sku:'tablet'});
  h.act('ASSIGN_NURSE',{itemId:tablet ? 'item.tablet' : 'item.laptop'});
  if (tablet) {
    h.act('POWER_DEVICE',{deviceId:h.view.nurseDeviceId,on:true});
    if (h.view.apDeviceId) h.act('ASSOCIATE_WIFI',{deviceId:h.view.nurseDeviceId,apDeviceId:h.view.apDeviceId});
  }
}
function prepare(h, {tablet = false, inspect = true, address = '10.40.10.31', failedProbe = false, port = 3, reverse = false} = {}) {
  h.act('REVIEW_BRIEF');
  selectNurse(h,tablet);
  if (h.view.fixture === 'A') {
    if (inspect) h.act('INSPECT_DEVICE',{deviceId:h.view.nurseDeviceId});
    installA(h);
    if (failedProbe) h.act('RUN_PROBE',{testId:'nurse'});
    h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address,mask:'255.255.255.0'});
  } else {
    if (inspect) h.act('INSPECT_CABLE',{itemId:'item.uplink'});
    if (failedProbe) h.act('RUN_PROBE',{testId:'nurse'});
    uplink(h,port,reverse);
  }
}
function explanations(h, oral = false) {
  for (const key of SHIFT_CATALOG.explanationKeys)
    h.act('SAVE_EXPLANATION',{key,text:oral ? '' : `My ${key} explanation is preserved exactly.\nTeacher discussion remains open.`,oral});
}
function finalChecks(h, policy = 'policy.roles-separated', oral = false) {
  h.act('SET_PERMISSIONS',{policyId:policy});
  h.act('MOVE_NURSE',{locationId:'location.exam-a'});
  h.act('RUN_PROBE',{testId:'all'});
  h.act('MOVE_NURSE',{locationId:'location.exam-b'});
  h.act('RUN_PROBE',{testId:'nurse'});
  explanations(h,oral);
}
function openGuide(h, sectionId) {
  const quote = h.view.guideQuotes.find(quote => quote.sectionId === sectionId);
  h.act('GUIDE_CONSULT',{sectionId,quoteToken:quote.quoteToken});
}

test('authored fixtures are deterministic, reception works, and setup never supplies player evidence', () => {
  for (const fixture of ['A','B']) {
    const h = harness({fixture});
    assert.deepEqual(h.state,createShift({campaignId:'test.opening',fixture}));
    assert.equal(result(h,'reception').code,'SERVICE_AVAILABLE');
    assert.equal(result(h,'reception').pass,true);
    assert.equal(result(h,'nurse').code,fixture === 'A' ? 'WIFI_NOT_ASSOCIATED' : 'PORT_DISCONNECTED');
    assert.equal(device(h,'item.laptop').address,fixture === 'A' ? '10.40.20.30' : '10.40.10.30');
    assert.equal(h.view.network.inheritedNurseAddress,device(h,'item.laptop').address);
    assert.equal(h.view.observations.length,0);
    assert.equal(h.view.inspections.length,0);
    assert.equal(h.view.ready,false);
    assert.equal(h.view.repair.confirmed,false);
    assert.ok(h.view.history.every(event => event.origin === 'mission-setup'));
    for (const attempt of Object.values(h.state.client.networkState.attempts)) {
      assert.ok(attempt.events.every(event => event.origin === 'mission-setup'));
      assert.deepEqual(attempt.training.practiceActions,[]);
      assert.deepEqual(attempt.observations,[]);
    }
    assert.deepEqual(h.view.followUp,{wearableCompleted:false,bootcampCompleted:false});
    assert.equal(h.state.client.networkState.training.priorLearning,false);
  }
});

for (const scenario of [
  {fixture:'A',tablet:false,policy:'policy.roles-separated',spend:44},
  {fixture:'A',tablet:true,policy:'policy.nurse-also-books',spend:114},
  {fixture:'B',tablet:false,policy:'policy.nurse-also-books',spend:0},
  {fixture:'B',tablet:true,policy:'policy.roles-separated',spend:70}
]) test(`${scenario.fixture} ${scenario.tablet ? 'tablet' : 'laptop'} reaches an honest frozen handover and one payment`, () => {
  const h = harness({fixture:scenario.fixture});
  prepare(h,scenario);
  finalChecks(h,scenario.policy);
  assert.equal(h.view.ready,true,JSON.stringify(h.view.objectives));
  assert.match(h.view.learningFocus.nextAction,/request handover/i,'ready active work directs the learner to handover');
  assert.equal(h.view.repair.confirmed,true);
  assert.equal(h.view.repair.observationKind,'inspection');
  assert.equal(h.view.repair.preRepairFailureObserved,false);
  assert.equal(h.view.economy.spent,scenario.spend);
  assert.equal(h.view.economy.remaining,180-scenario.spend);
  const booking = result(h,'nurse-bookings');
  assert.equal(booking.code,scenario.policy === 'policy.roles-separated' ? 'ACCESS_DENIED' : 'SERVICE_AVAILABLE');
  assert.equal(booking.pass,true);
  const playerCount = h.view.observations.length;
  h.act('REQUEST_HANDOVER');
  assert.equal(h.view.observations.length,playerCount,'handover does not invent a learner test');
  assert.ok(h.view.delivery.currentChecks.every(check => check.origin === 'engine-check'));
  assert.ok(h.view.delivery.evidence.playerObservations.every(check => check.origin === 'player'));
  assert.equal(h.view.phase,'delivered');
  assert.match(h.view.learningFocus.nextAction,/collect.*fee/i,'delivered work directs the learner to the outstanding receipt');
  assert.doesNotMatch(h.view.learningFocus.nextAction,/request handover/i,'already-delivered work does not request another handover');
  const delivery = copy(h.view.delivery);
  h.act('SETTLE_CONTRACT');
  assert.equal(h.view.economy.wallet,120);
  assert.equal(h.view.economy.net,120);
  assert.equal(h.view.phase,'settled');
  assert.match(h.view.learningFocus.nextAction,/delivery evidence.*free rehearsal/i,'settled work offers evidence and separate practice');
  assert.doesNotMatch(h.view.learningFocus.nextAction,/collect|request handover/i,'paid work does not prompt duplicate handover or collection');
  h.act('SETTLE_CONTRACT');
  h.act('REQUEST_HANDOVER');
  assert.equal(h.view.economy.wallet,120,'fee cannot duplicate');
  assert.deepEqual(h.view.delivery,delivery,'payment and repeated handover preserve the frozen evidence');
  const imported = validateShiftSave(JSON.stringify(h.state));
  assert.equal(imported.valid,true,imported.error);
  assert.deepEqual(imported.state,h.state);
  assert.equal(createShiftEvidence(h.state).json.current.followUp.wearableCompleted,false);
});

test('both authored faults accept genuine failed-test evidence and actual repair', () => {
  for (const fixture of ['A','B']) {
    const h = harness({fixture});
    prepare(h,{inspect:false,failedProbe:true});
    finalChecks(h);
    assert.equal(h.view.repair.observationKind,'failed-test');
    assert.equal(h.view.repair.observation.code,fixture === 'A' ? 'ADDRESS_WRONG_SUBNET' : 'PORT_DISCONNECTED');
    assert.equal(h.view.repair.preRepairFailureObserved,true);
    assert.equal(h.view.ready,true);
  }
});

test('inspect-led address correction records no imaginary prior service failure', () => {
  const h = harness();
  h.act('REVIEW_BRIEF');
  selectNurse(h);
  h.act('INSPECT_DEVICE',{deviceId:h.view.nurseDeviceId});
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.77',mask:'255.255.255.0'});
  installA(h);
  finalChecks(h);
  assert.equal(h.view.ready,true);
  assert.equal(h.view.repair.preRepairFailureObserved,false);
  assert.equal(h.view.repair.observation.snapshot.address,'10.40.20.30');
  assert.ok(h.view.observations.every(observation => observation.pass));
  assert.match(createShiftEvidence(h.state).text,/No pre-repair player failure is claimed/);
});

test('an unobserved original fix cannot be laundered through an already-valid inspection and a valid-to-valid edit', () => {
  const h = harness();
  prepare(h,{inspect:false});
  h.act('INSPECT_DEVICE',{deviceId:h.view.nurseDeviceId});
  assert.equal(h.view.inspections[0].faultRelevant,false);
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.88'});
  finalChecks(h);
  assert.equal(h.view.repair.observation,null);
  assert.equal(h.view.repair.confirmed,false);
  assert.equal(h.view.ready,false);
  h.reject('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
});

test('a later harmless address edit preserves the genuine earlier observed repair', () => {
  const h = harness();
  prepare(h);
  h.act('RUN_PROBE',{testId:'nurse'});
  const originalChange = h.view.repair.change.eventId;
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.99'});
  finalChecks(h);
  assert.equal(h.view.ready,true);
  assert.equal(h.view.repair.change.eventId,originalChange);
  assert.equal(h.view.repair.change.after.address,'10.40.10.31');
  assert.equal(device(h,'item.laptop').address,'10.40.10.99');
  assert.ok(h.view.history.some(event => event.type === 'SET_STATIC_ADDRESS' && event.payload.address === '10.40.10.99'));
});

test('unrelated address changes cannot repair the B uplink; reverse endpoints and the fourth switch port can', () => {
  const h = harness({fixture:'B'});
  h.act('REVIEW_BRIEF'); selectNurse(h);
  h.act('RUN_PROBE',{testId:'nurse'});
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.93'});
  h.act('RUN_PROBE',{testId:'nurse'});
  assert.equal(h.view.observations[0].code,'PORT_DISCONNECTED');
  assert.deepEqual(h.view.observations[0].pathIds,[]);
  assert.equal(h.view.repair.confirmed,false);
  uplink(h,4,true);
  finalChecks(h);
  assert.equal(h.view.ready,true);
  assert.equal(h.view.repair.change.kind,'uplink-reconnection');
  assert.ok(h.view.repair.recordedRetest.pathIds.includes(h.view.repair.change.cableId));
});

test('proactive B repair requires actual prior cable or port inspection and never invents a failure', () => {
  const h = harness({fixture:'B'});
  h.act('REVIEW_BRIEF'); selectNurse(h);
  h.act('INSPECT_DEVICE',{deviceId:h.view.apDeviceId});
  assert.equal(h.view.inspections[0].faultRelevant,true);
  uplink(h);
  finalChecks(h);
  assert.equal(h.view.ready,true);
  assert.equal(h.view.repair.observationKind,'inspection');
  assert.equal(h.view.repair.preRepairFailureObserved,false);
  const without = harness({fixture:'B'});
  prepare(without,{inspect:false});
  finalChecks(without);
  assert.equal(without.view.repair.confirmed,false);
  without.reject('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
});

test('room-context engine evaluations and an all-test in A never fabricate a B player visit', () => {
  const h = harness(); prepare(h);
  h.act('SET_PERMISSIONS',{policyId:'policy.roles-separated'});
  h.act('RUN_PROBE',{testId:'all'});
  explanations(h);
  assert.equal(result(h,'nurse-room-b').pass,true);
  assert.equal(result(h,'nurse-room-b').origin,'engine-check');
  assert.equal(h.view.requiredTests.find(test => test.id === 'nurse-room-b').met,false);
  assert.equal(h.view.observations.some(observation => observation.locationId === 'location.exam-b'),false);
  const count = h.view.observations.length;
  h.reject('REQUEST_HANDOVER',{},'HANDOVER_INCOMPLETE');
  assert.equal(h.view.observations.length,count);
  const revision = h.view.technicalRevision;
  h.act('MOVE_NURSE',{locationId:'location.exam-b'});
  assert.equal(h.view.technicalRevision,revision);
  h.act('RUN_PROBE',{testId:'nurse'});
  assert.equal(h.view.ready,true);
  assert.ok(h.view.requiredTests.every(test => test.met));
  assert.ok(h.view.observations.every(observation => !observation.stale));
});

test('causal changes invalidate both room observations; movement alone preserves them but cannot provide off-site service', () => {
  const h = harness({fixture:'B'}); prepare(h); finalChecks(h);
  const revision = h.view.technicalRevision;
  h.act('MOVE_NURSE',{locationId:'location.home'});
  assert.equal(h.view.technicalRevision,revision);
  assert.equal(result(h,'nurse').code,'OUTSIDE_COVERAGE');
  assert.equal(h.view.ready,false);
  h.act('MOVE_NURSE',{locationId:'location.exam-a'});
  assert.equal(h.view.ready,true);
  h.act('POWER_DEVICE',{deviceId:h.view.apDeviceId,on:false});
  h.act('POWER_DEVICE',{deviceId:h.view.apDeviceId,on:true});
  assert.equal(h.view.ready,false,'restoring the same configuration still requires new tests');
  assert.ok(h.view.observations.every(observation => observation.stale));
  h.act('RUN_PROBE',{testId:'all'});
  assert.equal(h.view.requiredTests.find(test => test.id === 'nurse-room-b').met,false);
  h.act('MOVE_NURSE',{locationId:'location.exam-b'});
  h.act('RUN_PROBE',{testId:'nurse'});
  assert.equal(h.view.ready,true);
});

test('malformed input rejects atomically; unique host addresses, reserved values, duplicates and masks retain real child codes', () => {
  const h = harness(); prepare(h);
  h.reject('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'999.40.10.30'},'ADDRESS_INVALID');
  h.reject('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.30',mask:'255.0.255.0'},'MASK_INVALID');
  h.reject('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.30',mask:'255.255.255.255'},'MASK_INVALID');
  for (const [address,mask,code] of [
    ['10.40.20.30','255.255.255.0','ADDRESS_WRONG_SUBNET'],
    ['10.40.10.0','255.255.255.0','ADDRESS_RESERVED'],
    ['10.40.10.255','255.255.255.0','ADDRESS_RESERVED'],
    ['10.40.10.20','255.255.255.0','ADDRESS_DUPLICATE'],
    ['10.40.10.30','255.255.255.240','ADDRESS_OFF_LINK']
  ]) {
    h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address,mask});
    h.act('RUN_PROBE',{testId:'nurse'});
    assert.equal(h.view.observations[0].code,code);
    assert.equal(h.view.observations[0].pass,false);
  }
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.213',mask:'255.255.255.0'});
  h.act('RUN_PROBE',{testId:'nurse'});
  assert.equal(h.view.observations[0].code,'SERVICE_AVAILABLE');
  h.reject('POWER_DEVICE',{deviceId:h.view.nurseDeviceId,on:'yes'},'INPUT_INVALID');
  h.reject('RUN_PROBE',{testId:'upload'},'TEST_UNKNOWN');
  h.reject('CHOOSE_DEVICE',{roleId:'role.nurse',kind:'desktop'},'ACTION_UNKNOWN');
  h.reject('REVIEW_BRIEF',{ready:true},'ACTION_INVALID');
});

test('service-off, power, missing links and off-site AP fail before access; a broken path never counts as a privacy denial', () => {
  const h = harness({fixture:'B'}); prepare(h); finalChecks(h);
  h.act('SET_SERVICE_STATE',{enabled:false});
  assert.equal(result(h,'nurse').code,'SERVICE_UNAVAILABLE');
  assert.equal(result(h,'access-outsider-bookings').code,'SERVICE_UNAVAILABLE');
  assert.equal(result(h,'access-outsider-bookings').pass,false);
  h.act('SET_SERVICE_STATE',{enabled:true});
  h.act('POWER_DEVICE',{deviceId:h.view.apDeviceId,on:false});
  assert.equal(result(h,'nurse').code,'AP_OFF');
  h.act('POWER_DEVICE',{deviceId:h.view.apDeviceId,on:true});
  h.act('PLACE_DEVICE',{deviceId:h.view.apDeviceId,locationId:'location.home'});
  assert.equal(result(h,'nurse').code,'OUTSIDE_COVERAGE');
  h.act('PLACE_DEVICE',{deviceId:h.view.apDeviceId,locationId:'location.equipment'});
  h.act('DISCONNECT_CABLE',{cableId:item(h,'item.uplink').cableId});
  assert.equal(result(h,'nurse').code,'PORT_DISCONNECTED');
  assert.equal(result(h,'reception').pass,true);
  const hostCable = item(h,'item.host-cable').cableId;
  h.act('DISCONNECT_CABLE',{cableId:hostCable});
  assert.equal(result(h,'reception').code,'PORT_DISCONNECTED');
  assert.equal(result(h,'access-outsider-bookings').pass,false);
});

test('policies expose distinct workflow consequences; broad access and deny-all fail for the actual reason', () => {
  const h = harness(); prepare(h);
  h.act('SET_PERMISSIONS',{policyId:'policy.broad-access'});
  assert.equal(result(h,'nurse').pass,true);
  assert.equal(result(h,'access-outsider-bookings').code,'SERVICE_AVAILABLE');
  assert.equal(result(h,'access-outsider-bookings').pass,false);
  h.act('SET_PERMISSIONS',{policyId:'policy.deny-all'});
  assert.equal(result(h,'reception').code,'ACCESS_DENIED');
  assert.equal(result(h,'reception').pass,false);
  assert.equal(result(h,'nurse').pass,false);
  finalChecks(h,'policy.roles-separated');
  assert.equal(h.view.policyDecision.retained,false);
  assert.equal(h.view.ready,true);
  h.act('SET_PERMISSIONS',{policyId:'policy.nurse-also-books'});
  assert.equal(h.view.explanations.privacy.stale,true);
  h.act('RUN_PROBE',{testId:'all'});
  h.act('MOVE_NURSE',{locationId:'location.exam-a'});
  h.act('RUN_PROBE',{testId:'nurse'});
  assert.equal(h.view.ready,false,'current tests do not rewrite the old privacy explanation');
  h.act('SAVE_EXPLANATION',{key:'privacy',text:'I now authorize the nurse to book, while keeping outside roles denied.',oral:false});
  assert.equal(h.view.ready,true);
  assert.equal(result(h,'nurse-bookings').code,'SERVICE_AVAILABLE');
});

test('explicitly retaining initial separated responsibilities counts and repeated affirmation does not stale submitted context', () => {
  const h = harness({fixture:'B'}); prepare(h); finalChecks(h);
  assert.equal(h.view.policyDecision.retained,true);
  const context = copy(h.view.explanations.privacy.context);
  h.act('SET_PERMISSIONS',{policyId:'policy.roles-separated'});
  assert.equal(h.view.explanations.privacy.stale,false);
  assert.deepEqual(h.view.explanations.privacy.context,context);
  assert.equal(h.view.ready,true);
});

test('tablet profile initializes once; retirement prevents duplicate live addresses and the retained laptop can return', () => {
  const h = harness(); prepare(h);
  const laptopId = h.view.nurseDeviceId;
  h.act('BUY_ITEM',{sku:'tablet'});
  h.act('ASSIGN_NURSE',{itemId:'item.tablet'});
  assert.equal(device(h,'item.tablet').address,'10.40.20.30','replacement does not evade the inherited profile');
  assert.equal(device(h,'item.tablet').powered,false);
  assert.equal(device(h,'item.tablet').wifiApId,null);
  assert.equal(h.view.devices.some(device => device.id === laptopId),false);
  assert.equal(item(h,'item.laptop').profile.powered,false);
  assert.equal(item(h,'item.laptop').profile.wifiApId,null);
  assert.equal(item(h,'item.laptop').profile.address,'10.40.10.31');
  h.act('INSPECT_DEVICE',{deviceId:h.view.nurseDeviceId});
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.42'});
  h.act('ASSIGN_NURSE',{itemId:'item.laptop'});
  assert.equal(device(h,'item.laptop').address,'10.40.10.31');
  h.act('ASSIGN_NURSE',{itemId:'item.tablet'});
  assert.equal(device(h,'item.tablet').address,'10.40.10.42');
  h.act('RETURN_ITEM',{itemId:'item.tablet'});
  assert.equal(h.view.nurseDeviceId,null);
  h.act('BUY_ITEM',{sku:'tablet'});
  h.act('ASSIGN_NURSE',{itemId:'item.tablet'});
  assert.equal(device(h,'item.tablet').address,'10.40.10.42','return and rebuy do not repeat profile initialization');
  assert.equal(h.view.history.filter(event => event.type === 'INITIALIZE_DEPLOYMENT_PROFILE').length,1);
  h.act('RETURN_ITEM',{itemId:'item.tablet'});
  h.act('ASSIGN_NURSE',{itemId:'item.laptop'});
  h.act('POWER_DEVICE',{deviceId:h.view.nurseDeviceId,on:true});
  h.act('ASSOCIATE_WIFI',{deviceId:h.view.nurseDeviceId,apDeviceId:h.view.apDeviceId});
  finalChecks(h);
  assert.equal(h.view.ready,true,'the genuinely repaired retained item can be reactivated');
  assert.equal(h.view.economy.spent,44);
});

test('installed purchases return atomically with exact one-time refunds, retained cable stock and no stranded funds', () => {
  const h = harness(); prepare(h,{tablet:true});
  assert.equal(h.view.economy.spent,114);
  h.act('RETURN_ITEM',{itemId:'item.ap'});
  assert.equal(h.view.apDeviceId,null);
  assert.equal(device(h,'item.tablet').wifiApId,null);
  assert.equal(item(h,'item.uplink').cableId,null);
  assert.equal(item(h,'item.uplink').owned,true);
  assert.equal(h.view.economy.spent,74);
  h.reject('RETURN_ITEM',{itemId:'item.ap'},'ITEM_NOT_OWNED');
  h.act('RETURN_ITEM',{itemId:'item.uplink'});
  h.act('RETURN_ITEM',{itemId:'item.tablet'});
  assert.equal(h.view.economy.spent,0);
  assert.equal(h.view.economy.remaining,180);
  h.reject('RETURN_ITEM',{itemId:'item.laptop'},'NO_PURCHASE_REFUND');
  h.act('ASSIGN_NURSE',{itemId:'item.laptop'});
  h.act('POWER_DEVICE',{deviceId:h.view.nurseDeviceId,on:true});
  h.act('INSPECT_DEVICE',{deviceId:h.view.nurseDeviceId});
  installA(h);
  h.act('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.53'});
  finalChecks(h);
  assert.equal(h.view.ready,true);
  assert.equal(h.view.economy.spent,44);
});

test('port mistakes keep child failure codes and cannot consume a cable or apply half a connection', () => {
  const h = harness({fixture:'B'});
  const v = h.view, beforeCable = copy(item(h,'item.uplink'));
  h.reject('CONNECT_PORTS',{itemId:'item.uplink',fromDeviceId:v.apDeviceId,fromPortId:ether(h,v.apDeviceId),toDeviceId:v.switchDeviceId,toPortId:ether(h,v.switchDeviceId,1)},'PORT_OCCUPIED');
  assert.deepEqual(item(h,'item.uplink'),beforeCable);
  h.reject('CONNECT_PORTS',{itemId:'item.uplink',fromDeviceId:v.nurseDeviceId,fromPortId:`${v.nurseDeviceId}.wifi0`,toDeviceId:v.switchDeviceId,toPortId:ether(h,v.switchDeviceId,3)},'PORT_INCOMPATIBLE');
  h.reject('CONNECT_PORTS',{itemId:'item.uplink',fromDeviceId:v.apDeviceId,fromPortId:'not-a-port',toDeviceId:v.switchDeviceId,toPortId:ether(h,v.switchDeviceId,3)},'PORT_UNKNOWN');
  uplink(h);
  h.reject('CONNECT_PORTS',{itemId:'item.uplink',fromDeviceId:v.apDeviceId,fromPortId:ether(h,v.apDeviceId),toDeviceId:v.switchDeviceId,toPortId:ether(h,v.switchDeviceId,4)},'CABLE_UNAVAILABLE');
});

test('guide expenses are capped, later levels and reopening are included, stale quotes cost nothing, and reset preserves paid charges', () => {
  const h = harness();
  const stale = h.view.guideQuotes[1];
  openGuide(h,SHIFT_CATALOG.guides[0].id);
  h.reject('GUIDE_CONSULT',{sectionId:stale.sectionId,quoteToken:stale.quoteToken},'QUOTE_STALE');
  for (const section of SHIFT_CATALOG.guides) openGuide(h,section.id);
  for (const section of SHIFT_CATALOG.guides) {
    h.act('REVEAL_HINT',{sectionId:section.id,tier:3});
    openGuide(h,section.id);
  }
  assert.equal(h.view.economy.reserved,15);
  assert.equal(h.view.economy.minutes,9);
  assert.equal(h.view.economy.net,105);
  h.act('BUY_ITEM',{sku:'tablet'});
  const oldAttempt = h.view.attemptId;
  h.act('RESET_SHIFT');
  assert.notEqual(h.view.attemptId,oldAttempt);
  assert.equal(h.view.economy.spent,0);
  assert.equal(h.view.economy.remaining,180);
  assert.equal(h.view.economy.reserved,15);
  assert.equal(h.view.economy.minutes,9);
  assert.ok(h.view.guideQuotes.every(quote => quote.credits === 0 && quote.alreadyGranted));
  assert.equal(h.view.observations.length,0);
  assert.equal(h.view.ready,false);
  prepare(h); finalChecks(h); h.act('REQUEST_HANDOVER'); h.act('SETTLE_CONTRACT');
  assert.equal(h.view.economy.wallet,105);
  assert.equal(h.view.delivery.netFee,105);
  const imported = validateShiftSave(h.state);
  assert.equal(imported.valid,true,imported.error);
});

test('free rehearsal has zero prices, help costs and earnings while preserving the whole paid job', () => {
  const h = harness();
  openGuide(h,SHIFT_CATALOG.guides[0].id);
  h.act('BUY_ITEM',{sku:'tablet'});
  const paid = copy(h.state.client);
  h.act('START_PRACTICE',{fixture:'B'});
  assert.deepEqual(h.state.client,paid);
  assert.equal(h.view.mode,'practice');
  assert.ok(h.view.shop.every(item => item.price === 0));
  prepare(h,{tablet:true});
  for (const section of SHIFT_CATALOG.guides) {
    openGuide(h,section.id); h.act('REVEAL_HINT',{sectionId:section.id,tier:3});
  }
  finalChecks(h);
  assert.equal(h.view.ready,true);
  assert.equal(h.view.economy.spent,0);
  assert.equal(h.view.economy.reserved,0);
  assert.equal(h.view.economy.minutes,0);
  assert.equal(h.view.economy.net,0);
  assert.match(h.view.learningFocus.nextAction,/free rehearsal evidence/i,'completed practice offers its own evidence');
  assert.doesNotMatch(h.view.learningFocus.nextAction,/collect|request handover/i,'practice never directs the learner to claim a client payment');
  h.reject('REQUEST_HANDOVER',{},'CLIENT_ONLY');
  h.reject('SETTLE_CONTRACT',{},'CLIENT_ONLY');
  assert.deepEqual(h.state.client,paid);
  const firstPractice = h.view.attemptId;
  h.act('RESET_SHIFT');
  assert.notEqual(h.view.attemptId,firstPractice);
  assert.deepEqual(h.state.client,paid);
  h.act('START_CLIENT');
  assert.equal(h.view.mode,'client');
  assert.equal(h.view.economy.spent,70);
  assert.equal(h.view.economy.reserved,5);
  assert.equal(h.view.economy.wallet,0);
  assert.equal(h.view.observations.length,0);
});

test('delivery freezes technical edits and finances; post-delivery guide review and reset cannot create another payment', () => {
  const h = harness({fixture:'B'}); prepare(h); finalChecks(h); h.act('REQUEST_HANDOVER');
  const frozen = copy(h.view.delivery), originalAttempt = h.view.attemptId;
  h.reject('RETURN_ITEM',{itemId:'item.ap'},'DELIVERY_FROZEN');
  h.reject('SET_STATIC_ADDRESS',{deviceId:h.view.nurseDeviceId,address:'10.40.10.41'},'DELIVERY_FROZEN');
  h.reject('SAVE_EXPLANATION',{key:'privacy',text:'overwrite',oral:false},'DELIVERY_FROZEN');
  for (const section of SHIFT_CATALOG.guides) openGuide(h,section.id);
  assert.deepEqual(h.view.delivery,frozen);
  assert.equal(h.view.economy.reserved,0);
  h.act('SETTLE_CONTRACT');
  h.act('RESET_SHIFT');
  assert.equal(h.view.mode,'practice');
  h.reject('SETTLE_CONTRACT',{},'CLIENT_ONLY');
  h.act('RETURN_TO_CLIENT');
  assert.equal(h.view.attemptId,originalAttempt);
  assert.deepEqual(h.view.delivery,frozen);
  h.act('SETTLE_CONTRACT');
  assert.equal(h.view.economy.wallet,120);
});

test('exact learner text and explicit oral-review flags survive evidence and saves without semantic scoring', () => {
  const h = harness({fixture:'B'}); prepare(h); finalChecks(h,'policy.roles-separated',true);
  const text = '  My words: <not an HTML claim> & “unchanged”.\nA second line, including uncertainty.  ';
  h.act('SAVE_EXPLANATION',{key:'equipment',text,oral:false});
  assert.equal(h.view.ready,true);
  assert.equal(h.view.explanations.equipment.text,text);
  assert.equal(h.view.explanations.privacy.oral,true);
  assert.equal(h.view.explanations.privacy.review,'pending-teacher');
  const evidence = createShiftEvidence(h.state);
  assert.equal(evidence.json.current.explanations.equipment.text,text);
  assert.ok(evidence.text.includes(text));
  assert.match(evidence.text,/Oral explanation PENDING/);
  assert.equal(Object.hasOwn(evidence.json.current,'score'),false);
  assert.equal(Object.hasOwn(evidence.json.current,'mastery'),false);
  h.reject('SAVE_EXPLANATION',{key:'equipment',text:'x'.repeat(2001),oral:false},'EXPLANATION_INVALID');
  h.act('SAVE_EXPLANATION',{key:'equipment',text:'  ',oral:false});
  assert.equal(h.view.ready,false);
});

test('save replay round-trips a purchase before refund and returns it exactly once after import', () => {
  const h = harness();
  h.act('BUY_ITEM',{sku:'tablet'});
  h.act('ASSIGN_NURSE',{itemId:'item.tablet'});
  const checked = validateShiftSave(JSON.stringify(h.state));
  assert.equal(checked.valid,true,checked.error);
  const restored = harness({},checked.state);
  restored.act('RETURN_ITEM',{itemId:'item.tablet'});
  assert.equal(restored.view.economy.spent,0);
  restored.reject('RETURN_ITEM',{itemId:'item.tablet'},'ITEM_NOT_OWNED');
  assert.equal(restored.view.transactions.filter(transaction => transaction.type === 'refund').length,1);
  const roundTrip = validateShiftSave(restored.state);
  assert.equal(roundTrip.valid,true,roundTrip.error);
});

test('untrusted injected money, inventory, network, evidence, delivery and action payloads are rejected by replay', () => {
  const h = harness({fixture:'B'}); prepare(h); finalChecks(h);
  const original = JSON.stringify(h.state);
  const corruptions = [
    saved => { saved.wallet = 999; },
    saved => { saved.ready = true; },
    saved => { saved.client.inventory['item.tablet'].owned = true; },
    saved => { saved.client.transactions.push({id:'free-cash',type:'refund',amount:500}); },
    saved => { saved.client.observations[0].code = 'FABRICATED_PASS'; },
    saved => { saved.client.observations[0].origin = 'mission-setup'; },
    saved => { saved.client.inspections[0].snapshot.connected = true; },
    saved => { saved.client.delivery = {netFee:1000}; },
    saved => { saved.client.settlement = {netFee:1000}; },
    saved => { saved.client.networkState.attempts[saved.client.networkState.activeAttemptId].devices[h.view.nurseDeviceId].address = '10.40.10.111'; },
    saved => { saved.actions[0] = {type:'SET_WALLET',amount:1000}; },
    saved => { saved.actions.push({type:'SETTLE_CONTRACT'}); },
    saved => { saved.actions[0].ready = true; },
    saved => { saved.seed.fixture = 'Z'; }
  ];
  for (const corrupt of corruptions) {
    const saved = copy(h.state); corrupt(saved);
    const checked = validateShiftSave(saved);
    assert.equal(checked.valid,false,`corruption unexpectedly validated: ${corrupt}`);
    assert.equal(Object.hasOwn(checked,'state'),false,'rejection supplies no replacement state');
    assert.equal(JSON.stringify(h.state),original,'read-only validation leaves existing work untouched');
  }
  assert.equal(validateShiftSave('{broken json').valid,false);
  assert.equal(validateShiftSave('x'.repeat(1048577)).code,'SAVE_TOO_LARGE');
  const tooMany = copy(h.state); tooMany.actions = Array.from({length:1201},() => ({type:'REVIEW_BRIEF'}));
  assert.equal(validateShiftSave(tooMany).code,'SAVE_ACTION_LIMIT');
});

test('import provenance is retained without being treated as learner evidence; older game saves are identified safely', () => {
  const h = harness();
  const saved = copy(h.state);
  saved.imported = true; saved.importProvenance = 'manual-file';
  const checked = validateShiftSave(saved);
  assert.equal(checked.valid,true,checked.error);
  assert.equal(checked.state.imported,true);
  assert.equal(createShiftEvidence(checked.state).json.importProvenance,'manual-file');
  assert.equal(deriveShift(checked.state).observations.length,0);
  const old = createGame({campaignId:'legacy.test'}), oldBefore = JSON.stringify(old);
  const legacy = validateShiftSave(old);
  assert.equal(legacy.valid,false);
  assert.equal(legacy.code,'LEGACY_SAVE');
  assert.equal(legacy.legacyUrl,'../index.html');
  assert.equal(JSON.stringify(old),oldBefore);
});

test('questions provide requirement provenance without setup changes, costs, repairs or tests', () => {
  const h = harness();
  const before = copy(h.state.client.networkState);
  for (const question of SHIFT_CATALOG.questions) { h.act('ASK_CLIENT',{questionId:question.id}); h.act('ASK_CLIENT',{questionId:question.id}); }
  assert.equal(h.view.questions.filter(question => question.asked).length,3);
  assert.equal(h.state.client.questions.length,3);
  assert.deepEqual(h.state.client.networkState,before);
  assert.equal(h.view.economy.reserved,0);
  assert.equal(h.view.observations.length,0);
  assert.equal(h.view.repair.confirmed,false);
  h.reject('ASK_CLIENT',{questionId:'reveal-secret-fault'},'QUESTION_UNKNOWN');
});
