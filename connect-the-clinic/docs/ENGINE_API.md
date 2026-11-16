# Engine API — revision 0.6

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


The build remains dependency-free ES modules with progress schema **1**. New attempts report build **0.6.0**. The engine owns technical outcomes, current learning focus, practice checks, the financial boundary and evidence. The interface dispatches actions and displays resulting facts.

## Public functions

`engine.js` exports `createGame(options={})`, `dispatch(game, action)`, `derive(game)`, `createEvidence(game)` and `validateSave(raw)`. These are synchronous and serializable. `createGame({campaignId})` supports reproducible tests; ordinary creation generates an anonymous campaign ID. `createGame()` retains the independent-bootcamp API default. The application supplies `createGame({guidedIntro:true})` only for fresh/cleared campaigns; valid saved campaigns resume their actual active attempt.

`dispatch` returns `{state,accepted,code,message}`. Rejected actions return the original state object without partial mutation. No action directly writes success, mastery, a grade or payment.

`validateSave` accepts parsed JSON or a JSON string up to 1 MiB. It returns `{valid:true,state}` or `{valid:false,error}`. Import replaces a whole campaign; it never merges wallets. Callers retain their current state after rejection. The persistence adapter distinguishes automatic restore from explicit manual import.

`catalog.js` exports `CATALOG`, `ROLES`, `ROLE_IDS`, `LOCATIONS`, `GUIDE_SECTIONS`, `STATIONS`, `EXPLANATION_KEYS`, `POLICIES`, `ATTACHMENTS`, `BUILD_VERSION` and `SCHEMA_VERSION`. Equipment, port, policy, role, service and ordinary action IDs in `CONTRACT.md` are unchanged.

## Derived presentation data

| Field | Meaning |
|---|---|
| `attempt`, `mode`, `network` | Active raw attempt, immutable attempt mode and its scenario network card. |
| `devices`, `cables`, `policy` | Actual instances, current cable endpoints and the effective policy catalog entry. |
| `diagnostics` | Recorded observations, newest first, with `stale` derived from their tested technical revision. |
| `currentResults` | Current engine evaluations, separately identified from recorded learner tests. |
| `objectives`, `ready`, `missing` | Current whole-clinic requirements, or the four guided evidence checks in the guided lesson. Independent bootcamp progression uses `training.checks` and `training.canAdvance`. |
| `training` | Explicit training kind, bootcamp/practice context and observed progression checks. |
| `guidedConnection` | Active guided lesson view below, or `null` outside that lesson. |
| `guidedConnectionCompleted` | True when a completed guided record is retained; the UI can avoid repeating the old first welcome after reload. It does not mean independent bootcamp completion. |
| `learningFocus` | `{stageId,title,goalIds,nextAction}` selected by the engine. Exactly two or three existing I-can IDs; no mastery inference. |
| `economy` | `{gross,reserved,minutes,net,wallet,phase,delivered,settled}`. Attempt earnings/costs are zero in training; an existing campaign wallet remains visible. |
| `guideQuotes` | Section quotes, grants, exact quote token, cost, simulated minutes and free-support reason. |
| `messages`, `explanations`, `history`, `hints` | Actual message templates, unchanged submitted words/oral flags, events and requested help. |
| `fault`, `wearable` | Fault provenance and distinct collection, return, handoff and receipt stages. |
| `modelUpdate` | `null`, or the explicit compatibility record for an affected older spatial observation. |

Devices include `{id,kind,roleId,label,locationId,powered,address,mask,attachments,wifiApId,ports,capabilities,assetId}`. Take port IDs from current `ports`; adapter attachment changes which ports exist. Derived ports include `cableId` when occupied.

Diagnostics include `id`, `testId`, `label`, `sourceDeviceId`, `serviceId`, `actorRoleId`, `contextLocationId`, `testedTechnicalRevision`, `code`, `message`, `pass`, `expectedDenied`, `pathIds`, `origin` and derived `stale`. A complete path alternates **device ID, edge ID, device ID**. Ethernet edges use cable IDs; a radio edge is the client device ID plus `.wifi0`. An incomplete physical path returns `pathIds:[]`; cable presence cannot establish service success. Room-context probes have `origin:'engine-check'` and do not claim a player visit.

Current Ethernet edges conduct only while both endpoints are at clinic locations. Home is offline. A nurse or access point at home produces `OUTSIDE_COVERAGE`; a wired source, records host or switch outside the clinic produces `OUTSIDE_CLINIC`. Endpoint and association records stay in the attempt but cannot carry clinic service. Power, location and link failures precede address, service and permission checks.

## Training kinds and fixtures

`derive().training.kind` is **`guided-connection`**, **`bootcamp`**, **`clinic-practice`** or **`delivery-replay`** for training attempts, and **`null`** for a client attempt. It is derived from validated mode/fixture/stage facts, not an imported display flag.

| Fixture ID | Mode / kind | Raw stage / derived phase | Network and purpose |
|---|---|---|---|
| `fixture.guided.connection.001` | training / guided-connection | `guided-connection`; derived instructional phase below | `192.168.50.0/24`; trainer-prepared powered desktop/switch/server and server cable, with only reception disconnected. |
| `fixture.bootcamp.local.001` | training / bootcamp | `practice`, or derived `demo` | `192.168.50.0/24`; original taught practice. |
| `fixture.bootcamp.transfer.001` | training / bootcamp | `transfer`, final `complete`, or derived `demo` | `192.168.70.0/24`; station 1/3 changed examples and preserved older station 2 address transfer. |
| `fixture.bootcamp.transfer.uplink.002` | training / bootcamp | `transfer`, or derived `demo` | New station 2 transfer. Nurse starts at valid `192.168.70.30`; AP uplink disconnected. |
| `fixture.clinic.local.001` | client / null | Internal `practice` field is not a bootcamp stage | Empty paid clinic in `10.40.10.0/24`; inherited nurse fault `10.40.20.30`. |
| `fixture.clinic.full-practice.001` | training / clinic-practice | `clinic-practice` | Empty whole-clinic practice using the same clinic equipment, network and fault rules. |
| `fixture.clinic.practice.001` | training / delivery-replay | `replay` | Separate free clone of the preserved delivered clinic. |

`training` also contains `stationIndex`, `stationId`, `title`, `phase`, `goal`, `canAdvance`, `completed`, `checks`, `demoSteps`, `priorLearning`, `transferKind` and `transferEvidence`. `completed` means the three bootcamp stations have recorded their two checkpoints for bootcamp/practice views; in the guided kind it denotes a recorded guided finish only. Guided finish never adds independent station checkpoints. It does not mean clinic practice has earned money or demonstrated mastery.

Full-clinic practice uses presentation station ID `practice.clinic.full`; replay uses `practice.clinic.delivery-replay`. Their `canAdvance` is always false. Their whole-clinic checks come from the ordinary model. `TRAINING_NEXT` and `TRAINING_DEMO` reject outside bootcamp.

## Mode and progression actions

| Action | Effect |
|---|---|
| `START_CLINIC_PRACTICE` | No payload. Opens empty, zero-earning whole-clinic training. Records `route:'teacher-selected-local'` and `authenticated:false`: a local classroom choice, not authenticated access. |
| `RETURN_TO_CLIENT` | Resumes `contract.currentAttemptId` with devices, explanations, observations, grants and ledger preserved. |
| `START_TRAINING_ATTEMPT` | Opens separate fresh bootcamp at station 1. |
| `TRAINING_DEMO` | Solves the current example using ordinary actions marked `trainer-demo`; cannot complete independent practice or write a learner explanation. |
| `TRAINING_RETRY` | Starts fresh practice of the same bootcamp task, full-clinic practice, or delivery replay. Loaded legacy address transfer retains its original task. |
| `RESTART_ACTIVE_ATTEMPT` | Restarts the active kind. Active paid reset preserves grants/costs; delivered client reset opens free replay. Practice reset preserves paid work. |
| `TRAINING_NEXT` | Requires current bootcamp checks/player actions, freezes the checkpoint, then opens a changed example or next station. New station 2 practice advances to the uplink fault. |
| `START_CLIENT_ATTEMPT` | Opens paid clinic after bootcamp, or with explicit `{priorLearning:true}`. Resumes an existing contract. Full practice cannot fabricate bootcamp completion. |
| `START_DELIVERED_CONTRACT_PRACTICE` | Opens a separate free replay only after a frozen delivery exists. |
| `REQUEST_HANDOVER` | Client only; reruns the complete suite, requires four submitted explanations or pending oral items, then freezes delivery and costs. |
| `SETTLE_CONTRACT` | Client only, including repeated/idempotent requests. All training kinds reject with `CLIENT_ONLY`; return to the client before collecting an eligible fee. |

`REMOVE_DEVICE {deviceId}` remains available. `SET_SERVICE_STATE` takes `{enabled}`. Probe IDs remain `reception`, `nurse`, `nurse-bookings`, `access`, `upload`, `all`. Nurse bookings expose the real difference between the two responsible policies. Existing equipment, placement, power, ports, attachments, Wi-Fi, address, permission, marker, explanation and guide actions remain as specified in `CONTRACT.md`.


## Guided first connection (0.6)

The stable lesson ID is `lesson.connection.001`. The trainer supplies three powered devices, appropriate addresses and permissions, enabled service, and the server-to-switch cable. The setup's ordinary actions have `origin:'mission-setup'`; they never populate player practice actions. The student uses the same `CONNECT_PORTS`, `DISCONNECT_CABLE`, `RUN_PROBE {testId:'reception'}` and `SAVE_EXPLANATION {key:'repair',text,oral}` as independent work. A cable action returns endpoint-specific feedback.

| Orchestration action | Effect and boundary |
| --- | --- |
| `START_GUIDED_CONNECTION` | Opens a separate free lesson and records the current non-guided attempt as its return target. Calling it inside guided practice starts another prepared lesson while preserving the original target. |
| `RETURN_FROM_GUIDED_CONNECTION` | Returns to the saved source without claiming completion. If no source exists, opens independent first-station practice with provenance `guided-connection-skipped`. |
| `FINISH_GUIDED_CONNECTION` | Requires actual guided evidence. Returns to the preserved source or opens first-station independent practice with provenance `after-guided-connection`. Awards no bootcamp checkpoint, fee or grade. |
| `TRAINING_RETRY` / `RESTART_ACTIVE_ATTEMPT` | In the guided kind, opens a fresh prepared lesson and retains the return target. Original source work, reservations and explanations remain untouched. |

For a normal first lesson, the derived phases are:

`connect`, `test`, `experiment`, `test-disconnected`, `repair`, `retest`, `reflect`, `complete`.

These phases are derived from actual observations/actions, not stored success flags. If the student changes something before testing the disconnection, the engine does not pretend it observed the missing link: it allows a fresh current test and another explicit cable experiment. An actual surviving alternate path leads to reflection without inventing a failure or a repair. Changes to real configuration make earlier confirmation and explanation context stale. Repeating an unchanged test preserves a valid submitted explanation.

### Exact active view

```js
{
  lessonId: 'lesson.connection.001',
  phase: 'connect', // one of the phases above
  canFinish: false,
  checks: [{label: '...', met: false}],
  receptionDeviceId: 'attempt.0001.device.0003',
  switchDeviceId: 'attempt.0001.device.0002',
  serverDeviceId: 'attempt.0001.device.0001',
  suggestedDisconnectCableId: null,
  firstPass: null, firstConnection: null, disconnection: null,
  experimentObservation: null, currentObservation: null,
  experimentOutcome: null, // missing-path | alternate-path | other-failure | null
  reconnection: null, repairEvent: null, passingRetest: null,
  explanation: {key: 'repair', text: '', oral: false, contextRevision: 0,
                submitted: false, eventId: null, review: 'pending-teacher'},
  returnAttemptId: null, finished: false, trainerSupplied: true,
  independentMastery: false
}
```

The IDs above are an example from the initial campaign; always use returned IDs and current device ports. Observation fields are complete ordinary probe records (`id`, `testId`, `origin`, `code`, `message`, `pass`, `pathIds`, `testedTechnicalRevision`, `eventId`, etc.). `currentObservation` is null when no reception test exists at the current revision. The historical `firstPass` and `experimentObservation` remain available for comparison.

The four completion checks require (1) a player-created cable used by a passing reception probe; (2) removal of a cable from a freshly tested path followed by a player probe before another technical change; (3) a current passing result after repair, or the actual alternate path still working; (4) the learner's unchanged explanation/oral request saved against a confirmed result. For a missing-path failure, a player reconnection used by the retest is required. Teacher judgement remains pending.

### Save, export and bounded history

The progress schema stays **1**. Old saves require no guided migration. Active guided state is `attempt.guidedConnection`, with trainer setup, event/observation references and bounded technical snapshots used to recompute milestone claims. The importer validates snapshot device/port rules, probe results, action provenance, ordering, actual removed cable, unchanged post-removal configuration and explanation context. This catches inconsistent/damaged guided records; local evidence is still editable rather than tamper-proof.

The active return target is protected from attempt compaction. Up to four completed lesson attempt IDs are retained in `game.guidedConnectionHistory`; their actual attempts/witnesses are protected too. Setup/milestone/explanation events and observations are pinned during per-attempt compaction. Completed records cannot be edited through ordinary technical actions. Retention is bounded; the export labels the retained records and does not imply a complete lifetime log.

`createEvidence().json` adds active `guidedConnection` and a `guidedConnectionHistory` array of `{attemptId,...guidedEvidence}`. These are separate from `practice.history` independent checkpoints. A guided text export focuses on the lesson's actual connection, experiment, outcome, repair/remaining route and unaltered explanation. Later evidence includes retained guided records, and any oral explanation remains pending teacher conversation. Frozen earlier client deliveries retain their original evidence and validation rules.

### Verification for this engine change

`node --test tests/simulation/guided-connection.test.js` passed **12/12**: prepared/legacy entry, atomic port errors, missing-link versus address failures, actual completion/evidence, valid wireless and direct alternatives, premature repair recovery, paid source preservation and retry, explicit bypass, damaged saves, repeated test/context behavior, and bounded event/observation/later-attempt retention. `node --test tests/integration/persistence.test.js` passed **12/12**, including the lead's real 0.5 campaign restore and guided damaged-import/reload cases. Browser and school-device tests are separate lead/QA work.

## Station 2 changed-fault evidence

The new fixture keeps `stationIndex:1`, raw `stage:'transfer'`, `transferKind:'physical-uplink'`, and fault ID `fault.ap.unplugged-uplink`. Its engine-owned goal/checks require:

1. A **player** nurse test observes `PORT_DISCONNECTED` while the AP uplink is absent and the switch-to-records path exists. An unrelated fault, room-context check or demonstration cannot supply this observation.
2. A later player `CONNECT_PORTS` connects AP and switch through actual free Ethernet ports. Either endpoint direction and any free switch port can work.
3. A player nurse retest passes at the **current technical revision**, after reconnection, with that cable ID in its actual `pathIds`.
4. `SAVE_EXPLANATION {key:'repair',text,oral}` supplies nonblank learner text or explicitly pending oral review. Presence is checked; words are preserved; no keyword or semantic grading occurs.

Changing an IP cannot satisfy the missing-link requirement. An early repair cannot invent an earlier observation; retrying or observing and repairing a repeated real failure remains possible. A later technical mutation makes the retest stale.

`derive().training.transferEvidence` and `createEvidence().json.transferEvidence` are `null` outside the new transfer. Otherwise they contain:

```text
{
  kind:'physical-uplink', faultId:'fault.ap.unplugged-uplink',
  seededDisconnection:{id,fromDeviceId,fromPortId,toDeviceId,toPortId,
                       eventId,technicalRevision,origin:'mission-setup'},
  observedFailure:<full recorded player nurse observation> | null,
  reconnection:{id,fromDeviceId,fromPortId,toDeviceId,toPortId,
                eventId,technicalRevision,origin:'player',baselineObservationId} | null,
  passingRetest:<full current recorded player nurse observation> | null,
  explanation:{key:'repair',text,oral,contextRevision,submitted,eventId,
               review:'pending-teacher'},
  readyForTeacherReview:<observed actions and explanation presence only>
}
```

On `TRAINING_NEXT`, the complete snapshot is retained at `campaign.training.history[n].transferEvidence`, with `fixtureId` and `transferKind:'physical-uplink'`. Evidence JSON exposes it at `practice.history[n].transferEvidence`; readable text retains it after later stations, starting a client and archiving the source attempt. The newest physical-uplink checkpoint is protected during checkpoint compaction. Exact reasoning and pending oral review survive the attempt change.

Raw provenance is held in `attempt.fault.uplink.{seed,reconnections}`; `fault.baselineFailures` references player failures. IP edits stay separately visible in `fault.changes`. New witnesses are validated against events, endpoint IDs, observation references and causal order. Only the new fixture can carry them.

Older station 2 saves report `transferKind:'legacy-address'`, retain their original checkpoints, and can be resumed/retried. They do not acquire physical-link evidence. A newly entered transfer after taught address practice uses the new fixture.

## Learning-focus stages

Goal suffixes below all use prefix `cc.clinic.`. These are existing internal teaching IDs, not official outcome codes. A stage prompts the next task; it is not an assessment judgement. Demonstrations retain the relevant goals and direct learners back to actual practice.

| `stageId` | Goal suffixes |
|---|---|
| `bootcamp.equipment` | `device-fit`, `connection-choice`, `system-path` |
| `bootcamp.address` | `address`, `diagnosis` |
| `bootcamp.uplink-transfer` | `system-path`, `connection-choice`, `diagnosis` |
| `bootcamp.legacy-address-transfer` | `address`, `diagnosis` |
| `bootcamp.access` | `access`, `stakeholders`, `data-journey` |
| `bootcamp.complete` | `handover`, `diagnosis` |
| `clinic.equipment` | `device-fit`, `connection-choice`, `ipos` |
| `clinic.connections` | `system-path`, `connection-choice`, `diagnosis` |
| `clinic.address-repair` | `address`, `diagnosis`, `system-path` |
| `clinic.access` | `access`, `stakeholders` |
| `clinic.markers` | `data-journey`, `connection-choice`, `system-path` |
| `clinic.verify` | `diagnosis`, `system-path` |
| `clinic.handover` | `handover`, `stakeholders` |
| `clinic.practice-review` | `handover`, `stakeholders` |
| `clinic.replay-review` | `handover`, `stakeholders` |
| `clinic.delivered` | `handover`, `stakeholders` |
| `clinic.settled` | `handover`, `stakeholders` |

Whole-clinic focus follows unmet equipment, power/location/link/services, address repair, permissions, marker journey, fresh verification and reasoning prerequisites. Paid and free work share these stages; `training.kind` supplies the mode distinction. Physical failure takes precedence over addressing. Engine `title` and `nextAction` are display-ready strings.

## Evidence and compatibility

`createEvidence` returns `{json,text}` from one snapshot. Readable evidence begins with a concise teacher overview: actual mode/attempt, practical stage, chosen policy, recorded failure/action/current retest and unresolved oral items. Detailed equipment/configuration/policy facts, actions/tests, unchanged words, retained transfer checkpoints, support and business context follow. A visible wallet or receipt in practice belongs to the preserved client; practice itself earns zero.

Raw unsaved draft rescue remains separate from submitted engine evidence and belongs to the lead-owned draft adapter. Export never settles or completes a task.

Schema 1 remains supported. Original 0.3 address-transfer, completed-bootcamp and delivered snapshots are retained regression fixtures. Old completed bootcamp stays accepted without claiming the new transfer. Frozen diagnostic-suite versions remain historical; mutable older attempts upgrade their suite on the next action as before.

New attempts carry `spatialModelVersion:2`. The narrow home-boundary compatibility rule never relocates, reconnects or repairs equipment. If an older unversioned **current** observation matches the original location rule but changes under the corrected rule, import increases that attempt's technical/evidence revision, retains its old facts as stale, and records a `mission-setup` event of type `MODEL_UPDATE`. It exposes:

```text
modelUpdate = {from:1,to:2,previousTechnicalRevision,technicalRevision,eventId,note}
```

The same record is stored as `attempt.spatialModelUpdate` and labelled in the evidence overview. A second reload does not repeat it. Unaffected old attempts remain unchanged. Frozen original `0.3.x` delivery snapshots without a spatial-version marker are checked against their original location rule in a private historical validation path; the frozen delivery remains byte-identical. All public current evaluations use the corrected clinic-only rule. Local files remain editable: validation establishes consistency and recoverability, not authenticity.

The 1 MiB bound, prototype-key rejection, IDs/counters, port occupancy, marker lifecycle, checkpoint provenance, grant order, frozen costs and one-payment ledger checks remain. New fixture/mode contradictions and damaged link witnesses are rejected. Rejected import leaves current work unchanged.
