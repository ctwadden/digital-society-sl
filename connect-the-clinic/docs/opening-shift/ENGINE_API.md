# Opening Shift engine API — 0.7 review

Published for integration: **16 November 2026, America/Halifax**. The model is a buildless ES module at `dist/opening/engine.js`. This contract is available before interface fabrication; tests and observed implementation results are recorded below when complete.

## Public functions and save boundary

```js
createShift({campaignId, fixture = 'A', mode = 'client'} = {})
dispatchShift(state, action) // {state, accepted, code, message}
deriveShift(state)          // presentation view described below
validateShiftSave(raw)      // {valid:true,state} or {valid:false,error,code,legacyUrl?}
createShiftEvidence(state)  // {json,text}
SHIFT_CATALOG
```

`fixture` is exactly `A` or `B`; `mode` is `client` or `practice`. `campaignId` is optional; supplied IDs permit deterministic tests. A normal new campaign generates an anonymous ID once. No runtime service, user account, names or patient data are used. Rejected actions preserve the exact input state object. The caller replaces state only after `accepted:true` or `valid:true`.

Every save contains the original seed and a bounded accepted-action log. Validation rebuilds the complete result from that seed and log, checks the saved result against it, and replaces rather than merges. Imported readiness, inventory, evidence, fee or wallet fields are never trusted. Maximum serialized progress size: **1 MiB**; maximum accepted actions: **1,200**. Optional `imported` and `importProvenance` metadata are retained separately from learner evidence; the persistence adapter may set `imported:true, importProvenance:'manual-file'` after validation. Older 0.6 campaign objects are rejected with `code:'LEGACY_SAVE'` and `legacyUrl:'../index.html'`, without claiming new-mission progress.

## Actions

All IDs must come from the current view or catalog. Unknown types/IDs, incompatible ports and malformed inputs are rejected atomically. Extra action fields are rejected. Standard network error codes come from the child engine unchanged.

| Action | Exact payload after `type` | Effect |
| --- | --- | --- |
| `REVIEW_BRIEF` | none | Records the learner's review. |
| `ASK_CLIENT` | `questionId` | Records one of the three disclosed requirement questions; repeat asks are free. |
| `INSPECT_DEVICE` | `deviceId` | Records the actual settings, power, placement, ports and association inspected. |
| `INSPECT_CABLE` | `itemId` | Records the cable's current connection or remembered disconnected endpoints. |
| `BUY_ITEM` | `sku` | Buys one of `access-point`, `ethernet-cable`, `tablet` into stock. |
| `INSTALL_ITEM` | `itemId`, optional `locationId` | Installs `item.ap` or activates a nurse item. AP starts powered off. Use actual port controls to install a cable. |
| `ASSIGN_NURSE` | `itemId` | Activates `item.laptop` or purchased `item.tablet`; retires the other device safely. |
| `UNINSTALL_ITEM` | `itemId` | Removes an AP, nurse device or cable into stock; preserves purchase ownership and remembered profile. |
| `RETURN_ITEM` | `itemId` | Uninstalls a purchased item, refunds exactly its recorded price once, and returns it to shop stock. Client-owned goods have no refund. |
| `POWER_DEVICE` | `deviceId`, `on:boolean` | Child engine power action. |
| `PLACE_DEVICE` | `deviceId`, `locationId` | Child engine placement action. |
| `MOVE_NURSE` | `locationId` | Moves the active nurse. Both room visits need their own explicit nurse test. |
| `CONNECT_PORTS` | `fromDeviceId`, `fromPortId`, `toDeviceId`, `toPortId`, optional `itemId` | Uses an owned, free cable item. If omitted, the first free owned cable is used. A connection never creates a free cable. |
| `DISCONNECT_CABLE` | `cableId` | Disconnects an actual live cable and returns its item to stock with remembered endpoints. |
| `ASSOCIATE_WIFI` | `deviceId`, `apDeviceId:string\|null` | Joins or leaves an installed AP. |
| `SET_STATIC_ADDRESS` | `deviceId`, `address`, optional `mask` | Applies the child's actual IPv4/mask validation. Reserved, duplicate and off-subnet hosts are revealed by tests. |
| `SET_SERVICE_STATE` | `enabled:boolean` | Starts/stops the host's shared services. |
| `SET_PERMISSIONS` | `policyId` | Records an explicit choice, including retention of the initial policy. A changed policy invalidates privacy explanation context. |
| `RUN_PROBE` | `testId` | `reception`, `nurse`, `nurse-bookings`, `access` or `all`. `all` tests the nurse only in its current room; it never fabricates a second visit. |
| `SAVE_EXPLANATION` | `key`, `text:string`, `oral:boolean` | Keys: `equipment`, `repair`, `privacy`, `limitations`; at most 2,000 characters per exact learner text. Presence or oral arrangement permits teacher review, with no keyword grading. |
| `GUIDE_CONSULT` | `sectionId`, `quoteToken` | Accepts the current displayed quote. Costs are 5 credits/3 simulated minutes per paid section, capped at 15/9. |
| `REVEAL_HINT` | `sectionId`, `tier:1\|2\|3` | Requires its purchased section in client work; all later tiers are included. Free in practice. |
| `REQUEST_HANDOVER` | none | Requires recorded learner evidence and a fresh independent engine evaluation; freezes delivery evidence and finances. Does not create learner probes. |
| `SETTLE_CONTRACT` | none | Collects the frozen net service fee once. Repeat calls are idempotent. Practice cannot settle. |
| `RESET_SHIFT` | none | Resets active undelivered work. Paid guide grants/costs persist; paid equipment is refunded. After delivery, opens separate free practice. |
| `START_PRACTICE` | optional `fixture:'A'\|'B'` | Opens fresh free rehearsal while preserving the entire independent job. |
| `START_CLIENT` | none | Resumes the preserved independent job. Does not fabricate legacy bootcamp completion. |
| `RETURN_TO_CLIENT` | none | Alias of `START_CLIENT`. |

There is no raw child dispatch escape hatch, arbitrary device purchase, imported completion setter, wearable completion, trainer solve, fee increase, or real-time reading penalty.

## Stable catalog and identities

`SHIFT_CATALOG` contains `missionId`, `fixtures` (array), `shop` (array), `policies` (array), `locations` (array), `questions` (array of `{id}`), `guides` (array of `{id,label}`), `explanationKeys` (array), and `terms`.

The three question IDs are `question.clinic.working-services`, `question.clinic.nurse-locations`, and `question.clinic.nurse-bookings`. They match the content module; the engine records the choice and does not disclose a repair through these questions.

| Item ID | SKU/kind | Ownership and role |
| --- | --- | --- |
| `item.host` | `server` | Clinic-owned central service host. |
| `item.switch` | `switch4` | Clinic-owned four-port switch. |
| `item.reception` | `desktop` | Clinic-owned reception workstation. |
| `item.laptop` | `laptop` | Clinic-owned nurse option, initially active. |
| `item.ap` | `access-point` | 40 credits in A; clinic-owned in B. |
| `item.uplink` | `ethernet-cable` | 4 credits in A; disconnected clinic-owned cable in B. |
| `item.tablet` | `tablet` | Optional purchase, 70 credits. |
| `item.host-cable` | `ethernet-cable` | Clinic-owned connected host cable. |
| `item.reception-cable` | `ethernet-cable` | Clinic-owned connected reception cable. |

Item IDs persist through installation/return. Live network device/cable IDs are generated by the tested child engine; always use IDs and ports returned by the current view. Because that engine supports one device per role, retired nurse equipment exists as a powered-off, disassociated inventory profile. Reassignment creates a new child device instance and restores that item's saved profile. The tablet receives the fixture's inherited deployment address **once per physical item**, at its first assignment; later reassignments preserve its actual edited address. Returning/rebuying that same tablet also preserves its profile. The old laptop is powered off and disassociated before role transfer. Retirement is an adapter operation, not evidence that a learner configured the archived device.

## Exact derived view

```js
{
  missionId, campaignId, attemptId, revision, buildVersion, schemaVersion,
  mode: 'client' | 'practice', fixture: 'A' | 'B', fixtureId,
  phase: 'active' | 'delivered' | 'settled',
  stageId: 'brief' | 'build' | 'check' | 'handover',
  briefReviewed, questions: [{id, asked}],
  devices: [{id,itemId,kind,roleId,label,roleLabel,locationId,powered,
             address,mask,wifiApId,attachments,ports,capabilities,assetId}],
  cables: [{id,itemId,fromDeviceId,fromPortId,toDeviceId,toPortId}],
  inventory: [{id,sku,kind,label,owned,clientOwned,purchased,paidPrice,
               installed,deviceId,cableId,returnable,profileInitialized,
               rememberedEndpoints,profile}],
  shop: [{sku,itemId,label,price,owned,purchased,canBuy}],
  nurseDeviceId, apDeviceId, switchDeviceId, serverDeviceId, receptionDeviceId,
  network, locations, policy, policies, serverEnabled,
  observations, diagnostics, inspections, currentResults, requiredTests,
  objectives: [{id,label,met,detail}], missing: ['...'], ready,
  repair, policyDecision, explanations, history, messages,
  economy: {allowance,spent,remaining,gross,reserved,minutes,net,wallet,
            phase,delivered,settled,practice},
  transactions, guideQuotes, hints, delivery, settlement,
  learningFocus: {stageId,title,goalIds,nextAction},
  limits: {maxActions,remainingActions,maxSaveBytes},
  followUp: {wearableCompleted:false,bootcampCompleted:false}
}
```

`attemptId` changes on every client reset and every fresh practice session, including repeated practice of the same fixture. Scope UI drafts by `campaignId` plus `attemptId`; never restore an older attempt's draft as submitted work. Live child IDs are scoped to that outer attempt and may recur in another session; item IDs retain their physical meaning within an attempt.

`diagnostics` and `observations` are the same newest-first outer player observation list. Each result carries the child's actual `testId`, `code`, `message`, `pass`, `expectedDenied`, `sourceDeviceId`, `serviceId`, `actorRoleId` and `pathIds`; the wrapper adds an `id`, `eventId`, `origin:'player'`, `locationId`, `testedTechnicalRevision`, `childTechnicalRevision`, and derived `stale`. A path alternates device, edge, device IDs. A missing physical route produces an empty path. The UI must not infer a service result from cable appearance.

`currentResults` are current child-model evaluations explicitly labelled `origin:'engine-check'`; they do not establish learner actions. `requiredTests` is an array of `{id,label,testId,locationId,observation,met}` for reception, nurse in each room, nurse bookings, reception workspace denial, and outsider booking/workspace denial. It contains current explicit player observations only. Engine room-context checks remain separate from actual visited-room observations.

`inspections` are newest-first records with `id`, `eventId`, `origin:'player'`, `targetId`, `kind`, `technicalRevision`, `faultRelevant`, `snapshot` and `stale`. `repair` carries `kind`, `faultId`, `observation`, `change`, `confirmed`, `currentPass`, and `initialCondition`; any pre-repair failure is a real recorded observation, never invented for an inspection-led repair.

`explanations` is an object keyed by the four required keys; each entry contains `{text,oral,submitted,eventId,context,stale,review:'pending-teacher'}`. Context records the actual equipment, technical revision and policy decision. Privacy must match the current policy revision and explicit decision. Other prose remains a learner statement for teacher review rather than semantic grading.

`guideQuotes` is an array of `{sectionId,label,quoteToken,credits,minutes,alreadyGranted,freeReason,netFee}`. Use the displayed token when dispatching `GUIDE_CONSULT`; stale quotes reject without cost. The three section IDs match the existing guide IDs and content module. Ordinary inspection, diagnostic output, controls, accessibility and reading time are free.

`messages` contain factual model notifications `{id,kind,text,observationId?,stale}`. Original brief/question/reply prose comes from `content.js`; no message independently decides success. `history` holds actual outer events with their provenance, and includes explicitly tagged fixture preparation. Purchases/refunds and player role decisions are retained independently of child setup.

## Causal and evidence boundaries

The child is the existing local physical/address/service/authorization engine in free clinic-practice mode. It is never handed a client wallet, grader or new rules for physical outcomes. Fixture creation normalizes all inherited child setup actions to `mission-setup`, clears child practice action credit, and never creates a prior-learning claim. The wrapper owns only this narrower mission, its inventory, records, finance and acceptance profile.

Technical freshness excludes nurse **movement only** so explicit A and B observations can coexist. The current nurse location still must be inside the clinic and current room-context checks must pass. Every other causal change invalidates recorded tests, even if a later change restores a previous configuration. Buying unused stock and ordinary inspection do not invalidate service tests. Child technical revision remains visible separately.

Fixture A accepts a relevant inspection or real address failure followed by a player correction to the active nurse profile. An inspection of an already-valid profile cannot supply fault evidence: the recorded faulty address/mask must match the setting before the relevant correction, and the corrected profile must be valid. A later harmless edit to another valid address preserves the genuine earlier repair witness while remaining visible in history. Fixture B accepts an actual observed disconnected uplink followed by a player AP-to-switch connection used by a current successful nurse path. Unrelated address edits cannot satisfy B. Proactive inspection-led repair is supported. Replacing A's laptop does not evade its inherited profile; the retired laptop never needs a fabricated repair.

Handover requires the reviewed brief, an explicit nurse equipment choice, real observed/repaired fault, current service truth, fresh player tests in both rooms and reception plus access checks, a responsible explicit policy choice, and four exact statements or explicit pending oral items. Both `policy.roles-separated` and `policy.nurse-also-books` pass with distinct nurse-booking outcomes. `policy.broad-access` fails access restrictions; `policy.deny-all` fails required services. The fee is 120 minus actual capped guide costs; unused equipment allowance is not income. Practice purchases and guide help cost zero and practice cannot hand over or collect a client fee.

The model does not simulate radio physics, Internet, router/gateway forwarding, DHCP, DNS, VLANs, authentication or clinical records. The disconnected B cable is inventory with remembered endpoint IDs, not a conducting half-edge. Earlier bootcamp and wearable work stays independently incomplete here.

## Integration and verification ownership

The lead owns namespaced persistence, tab ownership, storage failure notices, download/import controls and unsent draft rescue. UI drafts are not submitted evidence. Use `RESET_SHIFT` rather than constructing a replacement paid campaign for reset, so charged guide sections and settled receipts cannot be erased by an ordinary reset.

Model tests: `node --test tests/opening/engine.test.js`. Browser, keyboard, published-site and school observations belong to separate QA. Actual model/effort/billing telemetry is unavailable to this worker; inherited configuration is used.

## Observed verification — 16 November 2026, America/Halifax

The implementation is complete in the three engine-owned files. Exact commands and observed results:

| Command | Observed result |
| --- | --- |
| `node --check dist/opening/engine.js` | Passed; no syntax errors. |
| `node --test tests/opening/engine.test.js` | **28/28 passed**, 0 failures, approximately 1.27 seconds in the container. |
| `node --test tests/simulation/*.test.js tests/integration/*.test.js tests/qa/*.test.js tests/opening/engine.test.js` | **186/186 passed**, 0 failures, approximately 3.81 seconds in the container. |

The Opening Shift tests exercise all four fixture/equipment combinations, both responsible booking policies, real failed-test and inspection-led repairs, preservation of an earlier genuine repair, rejection of an already-valid inspection as fault evidence, alternate uplink direction/port, actual visits to both rooms, stale results, all consequential child failure layers, invalid input atomicity, tablet retirement/profile initialization, returns, purchase/import/refund, capped consultation/reopening, reset, practice isolation, exact prose/oral flags, frozen delivery and one-time settlement, malformed/inconsistent/oversized saves, metadata provenance, and safe identification of older game saves.

Baseline reception in both fixtures was also directly inspected through the derived view as `SERVICE_AVAILABLE`; A initially reports `WIFI_NOT_ASSOCIATED`, B initially reports `PORT_DISCONNECTED`. The B network card and active nurse both report its correct authored address `10.40.10.30`.

These are model and container regression observations. This worker has not claimed browser, keyboard, storage/tab behavior, published-site or actual school-device verification. The lead and fresh QA own those checks. Locally edited action logs can be replay-consistent; replay is an integrity check, not proof of independent human authorship. Actual worker model, reasoning-effort and billing telemetry were not exposed.
