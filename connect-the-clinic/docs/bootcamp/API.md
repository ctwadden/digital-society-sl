# Integrated bootcamp API — 0.8 review

Contract published before interface implementation. Engine implementation and test results are recorded at the end when complete.

## Programme boundary

`dist/opening/programme.js` exports `createProgramme`, `dispatchProgramme`, `deriveProgramme`, `validateProgrammeSave`, `serializeProgrammeProgress`, and `createProgrammeEvidence` as specified in `CONTRACT.md`.

`dispatchProgramme` accepts `{type:'OPEN_BOOTCAMP'}`, `{type:'ENTER_FIELD'}`, `{type:'BOOT_ACTION',action:<training action below>}`, and existing Opening Shift action objects while the active screen is `field`. The reducer returns `{state,accepted,code,message}`; rejection preserves the input object. `ENTER_FIELD` is accepted after all six lesson tasks or a valid existing-field migration. Once entered, field work remains resumable even during another training attempt.

`deriveProgramme` returns `{screen,campaignId,revision,field,bootcamp,canEnterField,fieldStarted,migrationNotice}`. `field` is the unchanged `deriveShift` view. `bootcamp` has the exact shape below. The main adapter flattens the selected view and adds storage/build metadata. For training add `canEnterField`, `fieldStarted`, `migrationNotice`; for field add its Bootcamp navigation affordance. Existing field `campaignId` and `attemptId` remain exact for draft restoration.

New save format has app ID `riverbend.clinic.programme`, schema1, build0.8.0. Validation accepts bounded 0.7 Opening Shift progress as a migration; all current field state is reconstructed and retained, training is initially uncompleted, screen is field and the existing-work exemption is explicit. Compact original field seed/actions avoid a duplicate full network snapshot. The programme's deterministic action replay verifies subsequent training, navigation and field operations. Maximum serialized size 1 MiB; maximum programme actions 1200. Progress downloads use `serializeProgrammeProgress(state)` so the downloaded compact JSON has the same byte count used by the state cap and can be imported; evidence remains formatted for reading. No imported completion or payment flag is trusted.

## Training exports and actions

`dist/bootcamp/engine.js` exports `createBootcamp({campaignId})`, `dispatchBootcamp(state,action)`, `deriveBootcamp(state)`, `createBootcampEvidence(state)` and `BOOT_CATALOG`.

| Action | Exact fields besides `type` | Use |
| --- | --- | --- |
| `START_LESSON` | `lessonId` | Open an unlocked lesson. Earlier completed lessons remain available. |
| `START_DEMO` | none | Begin a fresh worked model example for the current lesson. Transfer has no solved demonstration. |
| `NEXT_DEMO` | none | Execute the next actual trainer step. Never creates learner credit. |
| `START_PRACTICE` | none | Start a fresh learner attempt for the current lesson, using its practice network. |
| `RESTART_PRACTICE` | none | Same fresh-attempt behavior. Earlier completed lesson records stay preserved. |
| `NETWORK_ACTION` | `action` | One allowed real network action, listed below; only in practice. |
| `INSPECT_DEVICE` | `deviceId` | Record the actual inspected device/ports/settings. |
| `INSPECT_CABLE` | `cableId` | Record an actual live cable. For a missing AP uplink, inspect the AP or run a service test. |
| `RUN_TEST` | `testId` | `reception`, `nurse`, `nurse-bookings`, `access`, or `all`; records actual learner observations. `all` covers only the current nurse room. |
| `REVEAL_HINT` | `tier:1\|2\|3` | Free graduated support, recorded separately from attainment. |
| `SAVE_REFLECTION` | `text:string`, `oral:boolean` | At most2000 characters; exact transfer explanation or pending oral review. |
| `COMPLETE_LESSON` | none | Requires all current model/evidence gates; freezes a concise training record and unlocks the next lesson. |

Allowed `NETWORK_ACTION.action` shapes reuse the core:

- `CHOOSE_DEVICE {roleId,kind}`: kit only, choices from `roleOptions`.
- `POWER_DEVICE {deviceId,on:boolean}`.
- `CONNECT_PORTS {fromDeviceId,fromPortId,toDeviceId,toPortId}` and `DISCONNECT_CABLE {cableId}`.
- `SET_STATIC_ADDRESS {deviceId,address,mask}`; meaningful address lessons and mobile work only.
- `ASSOCIATE_WIFI {deviceId,apDeviceId:string|null}`.
- `MOVE_NURSE {locationId}`: practice room A or B.
- `SET_PERMISSIONS {policyId}`: access lesson only.
- `SET_SERVICE_STATE {enabled:boolean}` where diagnostics are taught.

Exact currently permitted primitive types are exposed in `allowedNetworkActions`. Unknown/extra fields, IDs and inappropriate lesson actions reject atomically. The UI must use view IDs rather than constructing device/port IDs. All training equipment is supplied free; no shop or cable inventory purchase applies on the bench.

## Exact training view

```js
{
  courseId, campaignId, revision, attemptId,
  phase: 'welcome'|'intro'|'demo'|'practice'|'complete',
  lessonId, lessonIndex, lessonNumber,
  lessons: [{id,index,title,unlocked,completed,active}],
  completedLessonIds, courseComplete,
  progress: {completed,total:6},
  demo: {available,started,finished,stepIndex,currentStepId,nextStepId,
         steps:[{id,title,done}]},
  network, devices, cables, locations, policy, policies, serverEnabled,
  workstationDeviceId, serverDeviceId, switchDeviceId, nurseDeviceId, apDeviceId,
  roleOptions: [{roleId,label,choices:[{kind,label,description}],deviceId}],
  allowedNetworkActions,
  controls: {kit,cables,address,wireless,access,diagnostics,reflection},
  observations, currentResults, inspections, history,
  checks: [{id,label,met,detail}], canComplete,
  requiredTests: [{id,label,testId,locationId,met,observation}],
  reflection: {text,oral,submitted,stale,review:'pending-teacher'},
  hints: {highestTier,revealed:[1,2,3]},
  repair: {observed,change,confirmed},
  completionRecords, nextLessonId,
  economy: {credits:0,minutes:0,earnings:0},
  evidenceNotice
}
```

Devices have the existing network view fields `{id,kind,roleId,label,roleLabel,locationId,powered,address,mask,wifiApId,attachments,ports,capabilities,assetId}`. Port fields include ID/label/medium and occupied `cableId`. Cables carry actual endpoint IDs. Keep workspace selection, form drafts and expanded help in UI presentation state. Scope editor drafts to campaignId plus attemptId.

`observations` are newest-first actual records with `{id,testId,code,message,pass,expectedDenied,pathIds,sourceDeviceId,serviceId,actorRoleId,locationId,origin,testedTechnicalRevision,stale}`. Origins are `learner` or `trainer`; setup never creates learner tests. `currentResults` are explicitly `engine-check` and cannot complete a task. A nurse movement preserves paired-room observations; another causal edit stales them. A selected observation's location matters when drawing its path.

`checks`/`canComplete` are authoritative. A demonstration, prior lesson or old passing test cannot satisfy the current practice. `phase:'complete'` freezes the current lesson until an explicit restart/demo/new lesson. Completion means task conditions met, never mastery or a grade.

## Demonstration step IDs

| Lesson | Ordered step IDs |
| --- | --- |
| `boot.kit` | `kit.client`, `kit.switch`, `kit.host` |
| `boot.cables` | `cables.client`, `cables.host`, `cables.test` |
| `boot.address` | `address.inspect`, `address.apply`, `address.test` |
| `boot.wireless` | `wireless.power`, `wireless.uplink`, `wireless.join`, `wireless.room-a`, `wireless.room-b` |
| `boot.access` | `access.inspect`, `access.policy`, `access.test` |
| `boot.transfer` | none |

Each step may group necessary real actions (for example select+power; move+test). Curriculum content maps these IDs to narration. Practice starts from a fresh authored baseline, never the demonstrated solved state. Demo subnet60, practice80, transfer90; host10/workstation20/nurse30. Address lesson workstation starts in the next third-octet subnet. Stable IDs are internal software references, not official outcome codes.

## Evidence

`createBootcampEvidence` and programme evidence return `{json,text}`. Readable training output is a short per-lesson task/provenance summary plus the exact learner transfer reflection. Detailed actions, observations and archived completion checks are in JSON. Programme evidence labels training and field separately, includes existing field evidence, and never promotes a trainer step, hint count or training completion into independent client attainment. Local files remain editable; replay proves consistency, not a learner's identity.

## Implementation verification

Implemented in `dist/bootcamp/engine.js` and `dist/opening/programme.js`. The focused suite `node --test tests/bootcamp/engine.test.js` passes **25 tests**, covering a complete taught course and paid field job, trainer/learner separation, alternative hardware/ports/addresses, actual failures, both-room freshness, both responsible policies, transfer and exact reflection, migration of a paid0.7 job, atomic corrupted-save rejection and prototype-name device IDs. The realistic combined save remains below the existing1MiB bound; the test prints actual size/replay timing for its container rather than claiming school performance.

Only `role.reception` may receive address edits in the address lesson; later lessons permit editing the mobile nurse device. Kit roles offer a desktop workstation, a4- or8-port switch, and a dedicated server or desktop acting as service host. Every chosen device still needs a separate learner power action. Demonstrations group select+power into narrated trainer steps. Cables are supplied on the training bench and do not consume client equipment money.

A broader valid interface mask can still allow local service. The engine preserves that causal result and independently checks the supplied `/24` task requirement. A mask that places the peer off-link fails with `ADDRESS_OFF_LINK`; a reserved host under that mask fails with `ADDRESS_RESERVED`. Do not display every mask mismatch as a physical/service failure.

The core's broader access probe internally includes unrelated legacy transfer checks. The wrapper labels those omitted helper results `engine-helper`, exposes only the six relevant staff/outsider results, and never claims they were learner tasks in this course. Underlying setup and trainer events remain separately labelled.

Browser, integration adapter, publication, actual school device and learner checks belong to the lead/independent reviewer and are not implied by this focused model suite.
