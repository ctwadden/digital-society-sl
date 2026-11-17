# Field-ready bootcamp — shared integration contract

Review increment after Opening Shift 0.7.0. Authoritative baseline: GitHub `0d6f52351fd72ad06c65634d0bc322cb9f311f50`. User request: teach students how to use and configure the equipment before independent field work. This is interactive instruction, not a reading-only checklist.

## Product and teaching contract

New players begin at an integrated training bench. A mentor explains the purpose, demonstrates real model actions, then asks the learner to do the task in a fresh practice setup. Next is enabled only by model-derived task evidence. All training, hints, retry and reading time are free. No countdown, payment, grade or mastery certificate. A final changed fault checks transfer; the learner's explanation remains for teacher review.

Use the supplied project source ledger `../SOURCE_ALIGNMENT.md` and the existing network model. Official curriculum/Evidence Map IDs remain unresolved. Keep the existing original art/style; create a distinct, uncluttered training bench with the approved device artwork. It must show the actual devices, links and recorded tests and provide named HTML controls without dragging.

Six stable lesson IDs, in this order:

| ID | Demonstration | Fresh learner task and completion evidence |
| --- | --- | --- |
| `boot.kit` | Introduce workstation, switch and server; select and power each. | Select suitable workstation, switch and service host and power them. Opening an inspector alone does not prove task completion. Explain that power is separate from a connected route. |
| `boot.cables` | Connect the workstation and host to two different switch ports; test the service. | Two actual compatible Ethernet links plus a fresh explicit service test. More than one free switch port is valid. |
| `boot.address` | Inspect a network card, explain address and `/24` mask, change an incorrect address, retest. | Apply a valid unused host address and supplied mask in a different subnet from the example, then run a fresh passing service test. Duplicate, invalid, wrong-subnet and wrong-mask settings must fail for their real reason. |
| `boot.wireless` | Power the AP, connect its uplink, associate the mobile device; test in both rooms. | Actual AP power/uplink/association and explicit current nurse tests in rooms A and B. Moving between rooms does not erase a still-valid observation from the other room; other causal changes stale both. |
| `boot.access` | Show that connectivity and permission are different; choose a responsible role policy and test allowed/denied requests. | Explicitly choose either responsible policy, then record necessary staff passes and intended outsider denials after technical prerequisites. Open access and deny-all do not pass. |
| `boot.transfer` | A short troubleshooting method only; no solved demonstration. | Correct initial address, powered/associated devices, unplugged AP uplink. A real faulty observation/inspection, relevant reconnection and fresh service test; unrelated valid IP edit cannot repair the link. Save exact short explanation of why an address edit cannot restore a missing physical route, or mark oral review pending. Do not keyword-grade it. |

Demo network: `192.168.60.0/24`; practice: `192.168.80.0/24`; changed transfer: `192.168.90.0/24`. Host `.10`, workstation `.20`, nurse `.30` as applicable. Address lesson inherited workstation is in the next third-octet subnet. Accept other unique usable host addresses. Field remains `10.40.10.0/24`. Show `255.255.255.0` and `/24`, and explain the 24-bit boundary: the first-three-groups shortcut applies to this mask, not all masks. Router connects distinct networks and is deferred; no pretend routing, DHCP or Internet success.

Two or three I-can goals at a time. Concise mentor text, one clear next action, optional fuller how-to help and explicit progress. Learner steps should have more guidance early and fewer instructions at transfer. Estimate duration only; student timings remain unmeasured.

User clarification: explicitly review materials, cables, hardware, networks and how to connect/configure them. Provide a free visual Equipment & cable guide covering computer/server/switch/AP/router roles, interfaces and ports, Ethernet versus power/USB/display cables, LAN/WLAN versus Internet, and address/mask meaning. Tie each relevant item to an action at the bench. Router and unmodelled cable types are clearly conceptual comparisons, not falsely simulated tasks.

A different valid mask does not universally break local service. The supplied `/24` is an address-lesson task requirement. Preserve the core's actual result when another valid mask still leaves peers on-link; explain the task mismatch separately. A mask that truly splits peers fails for that causal reason; malformed/noncontiguous masks reject.

## One authoritative programme state

Preserve `dist/opening/engine.js`, legacy `dist/engine.js`, catalog and current field save semantics. New `dist/opening/programme.js` wraps the existing Opening Shift field state and new training state. One persistence adapter owns this programme; both interfaces dispatch to it. The UI may hold selection/editor drafts, but cannot declare completion or alter model results.

Public programme API:

```js
createProgramme({campaignId?, fixture?:'A'|'B'} = {})
dispatchProgramme(state, action) // atomic {state,accepted,code,message}
deriveProgramme(state) // {screen:'bootcamp'|'field',campaignId,revision,field,bootcamp,canEnterField,migrationNotice}
validateProgrammeSave(raw) // {valid:true,state} or {valid:false,code,error}
createProgrammeEvidence(state) // {json,text}, distinct training and field provenance
```

Actions `OPEN_BOOTCAMP`, `ENTER_FIELD`, `BOOT_ACTION` with nested `action`. Existing field action payloads are forwarded only while screen is field. No arbitrary child-network escape hatch. New campaigns enter training; field entry requires completed training. Valid existing 0.7 saves migrate to field with an explicit existing-work exemption and training uncompleted. Reopening bootcamp must preserve every field action, draft scope, cost, delivery and payment. Field may be resumed once legitimately entered; restarting training does not revoke saved field work.

Use a bounded deterministic programme action log and seed to validate completion, navigation and nested states. For migration, store compact original field seed/action instructions rather than a second full field snapshot. Reconstruct and validate the original field save before migration. Preserve current namespace `riverbend.clinic.opening.v1.` and the adapter's old last-good snapshot. Reject a conversion exceeding the existing 1 MiB limit without replacing saved data. Earlier 0.6 files remain explicitly unsupported by this new entry and point to the preserved old game.

New training module `dist/bootcamp/engine.js` reuses `../engine.js` for physical/address/service/authorization rules. It owns lesson selection, demo/practice provenance, task gates, hints, observations, reflection and completion. Use fresh stable attempt IDs on retry. A completed lesson has a frozen training evidence summary; rewatching a demo is not a learner test. Field evidence must never inherit trainer actions or training completion as independent success.

Training API (engine owner publishes exact view and payloads in `API.md` before UI construction):

```js
createBootcamp({campaignId})
dispatchBootcamp(state, action)
deriveBootcamp(state)
createBootcampEvidence(state)
BOOT_CATALOG
```

Required training controls: start/revisit an unlocked lesson; next demonstration step; start/retry fresh practice; allowed real network actions; inspect current state; run tests; free graduated hint; save transfer reflection/oral flag; complete lesson. Demo steps must call the same model and carry trainer provenance. Demonstration result can never fulfill a practice gate. Use explicit current player tests distinct from derived current checks.

## Files and integration ownership

- Lead: this contract/run, `dist/opening/main.js`, small integration changes to `dist/opening/ui.js`, entry HTML, package/test wiring, persistence integration tests, release/teacher docs and publishing.
- Gameplay engineer: `dist/bootcamp/engine.js`, `dist/opening/programme.js`, `tests/bootcamp/engine.test.js`, `docs/bootcamp/API.md`.
- Curriculum designer: `dist/bootcamp/content.js`, `docs/bootcamp/LEARNING_DESIGN.md`.
- Interface/visual specialist: `dist/bootcamp/ui.js`, `dist/bootcamp/styles.css`, `dist/bootcamp/scene.js`, `docs/bootcamp/ASSET_MANIFEST.md`; reuse original device art. No field UI edits without lead coordination.
- Independent QA: `tests/bootcamp/qa.test.js`, `qa/BOOTCAMP_QA.md`; no production edits.

The root main adapter mounts a fresh child container when screen changes, calls the prior UI's destroy method, and preserves separately stored drafts. It supplies `getView`, `send` and existing progress/evidence/import/recovery/takeover handlers. Training screen has equivalent save status, downloads and recovery controls. Add a Bootcamp button to the field header; no external app or login.

## Acceptance IDs

- B1: New player can learn through mentor demonstration and do each real task; no worksheet-only or false-success Continue buttons.
- B2: Trainer/setup results cannot complete learner practice; six lesson gates and transfer reflect actual actions and fresh state.
- B3: Physical, address, mask, power, association and access failures produce correct reasons; repair and retest restore service; alternative valid ports/addresses/policies work.
- B4: Exact learner reflection, actual observations, hints and demo provenance export honestly; no money/grade/mastery inference.
- B5: Old valid 0.7 field work migrates unchanged; malformed/forged saves reject atomically; training reset/reload/return and two tabs preserve field work and editor drafts.
- B6: Keyboard, readable text, visible focus, non-drag controls, reduced-motion support, original assets and distinct training/field appearance; real published-browser path checked.
- B7: One coherent bootcamp-to-client launch; all training help free, independent client help terms unchanged; no paid runtime services, accounts or personal data.
- B8: Automated, source, published-browser and school observations reported separately; Windows/school and beginner pilot remain unclaimed until performed.

Existing 212-test suite remains a required regression gate. Give each worker one initial attempt plus one focused repair; investigate/change approach after a second failure. No worker publishes or spawns additional agents. Actual inherited model/effort and billing telemetry unknown.
