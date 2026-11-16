# Connect the Clinic 0.6.0 — independent gameplay and learning audit

**Status: complete for the assigned source/model audit.** 16 November 2026. No production files changed. No browser controlled by this worker. The lead owns the separate published-site walkthrough.

## Finding

The complaint identifies a real experience gap. The current project contains a credible small network model, but its default opening presents a narrow control lesson and then sends the learner through six more training checkpoints before a client contract exists. The richer equipment, addressing, mobility and access mechanics are present later. They are not joined into an early experience of investigating a client's problem, choosing a plan, using resources and seeing the workplace improve.

One cable is a reasonable way to teach the connection control. It is too small to carry the promised technology-consulting game. The next revision should connect teaching to a substantive first shift, not merely increase graphical detail or the number of mandatory clicks.

This conclusion is about the design's decisions and progression. It is not a finding that the underlying connectivity or persistence system is fake or broken.

## Scope and evidence

Inspected the existing original `dist/engine.js`, `dist/catalog.js`, `dist/ui.js`, `dist/main.js`, `dist/content/experience.js`, `dist/content/learning.js`, `CONTRACT.md`, `docs/MODEL.md`, `docs/ENGINE_API.md`, and the prior Aspire research decision. The published 0.6 runtime is reported by the lead's migration receipt as byte-identical to this source. This worker did not independently retrieve or exercise the GitHub website.

Two temporary Node processes exercised the authoritative engine without editing files: a guided-to-client sequence and both existing valid clinic equipment routes. These are **constructed model walkthroughs**, not a novice playtest, mouse-click measurement, or school-device test. No student data was used. The full 157-test suite was not rerun by this worker; its earlier result is a separate release record.

### Direct source references

All locations below are within `connect-the-clinic/` and identify the reviewed 0.6 source. Line numbers refer to this exact snapshot.

| ID | Source location | Evidence |
| --- | --- | --- |
| C1 | `dist/main.js`, line 17 | Fresh/cleared browser campaigns use `createGame({guidedIntro:true})`; valid saves resume. |
| C2 | `dist/engine.js`, `startGuidedConnection()`, line 122 | Trainer supplies powered server, switch and reception desktop; enables services; connects server to switch. |
| C3 | `dist/ui.js`, `guidedConnectionForm()`, line 260; `guidedLessonContents()`, line 281 | Main guided form selects reception and switch ports; experiment explicitly names the cable to unplug. All tools remains an escape to wider model actions. |
| C4 | `dist/engine.js`, `leaveGuidedConnection()`, line 176 | Finishing a fresh guided attempt opens independent station 1, not a client contract. |
| C5 | `dist/engine.js`, `netFor()`, line 42; `addDevice()`, line 73; `setupTraining()`, line 98 | Station 1 supplies server/switch; new role devices automatically receive addresses from the fixture's network. |
| C6 | `dist/engine.js`, `trainingStatus()`, line 306; `dispatch()` / `TRAINING_NEXT`, line 496 | Each station has practice then changed example; progression creates a different attempt/fixture. |
| C7 | `dist/engine.js`, `startClient()`, line 404 | Standard client gate requires three completed stations, each with both checkpoints; explicit teacher-directed prior learning is an alternative route. |
| C8 | `dist/engine.js`, `startClient()`, line 406; `newAttempt()`, line 88 | Paid clinic begins with empty devices/cables and one fixed contract ID. |
| C9 | `dist/catalog.js`, `CATALOG`, line 19; `dist/engine.js`, `terms()`, line 13; `economy()`, line 343 | Equipment has capabilities and prose trade-offs, but no prices, stock or budget. Money varies with guide reservations. |
| C10 | `dist/engine.js`, `capabilityProblem()`, line 181; `physicalPath()`, line 198; `addressProblem()`, line 219; `evaluate()`, line 234 | Real capability/power/path/address/service/permission evaluation. |
| C11 | `dist/engine.js`, `recordProbe()`, line 265; `mutate()` / `SET_PERMISSIONS`, line 377; `dist/ui.js`, phone modal, line 596 | Client messages are event-triggered prose. UI supports reading/marking read, not information-seeking or negotiated job choices. |
| C12 | `dist/engine.js`, `repaired()`, line 286; `objectives()`, line 293 | Current ordinary client repair requirement specifically depends on a changed inherited nurse address and a working nurse service. |
| C13 | `dist/engine.js`, `specifications()`, line 249; `recordProbe()`, line 258 | Full suite evaluates both nurse-room contexts. Context results are correctly labelled `engine-check`, not invented player visits. |
| C14 | `dist/engine.js`, `objectives()`, lines 294 and 297 | Full clinic requires seven-marker journey and four explanation/oral-review items. |
| C15 | `dist/engine.js`, `evidenceObject()`, line 440 | Explicit limits: one local subnet, no router/Internet/DHCP/DNS, named-location Wi-Fi, simulated role authorization. |
| C16 | `dist/engine.js`, `SETTLE_CONTRACT`, line 525; save validator, line 785 | One settlement identity, and a maximum of one settlement; no implemented multi-job career. |
| C17 | `docs/research/ASPIRE_RESEARCH_AND_DESIGN.md`, line 147 | Earlier design deliberately proposed one missing reception cable to resolve first-use confusion. The current opening is not an accidental truncation of that proposal. |
| C18 | `dist/engine.js`, `learningFocus()`, line 331 | Whole-clinic focus uses current evaluator results and directs the learner toward the inherited nurse setting. It can reveal the class of issue before the player records a diagnostic. |

## What the player actually encounters

| Phase | Starting condition and player work | What changes or remains missing |
| --- | --- | --- |
| Guided connection | Prepared powered desktop/switch/server, correct addresses and permissions, server already wired. Choose free reception/switch ports; test; explicitly unplug the named cable; test; reconnect; test; explain. | Honest cable/fault/test evidence. No equipment plan, budget, contract, unsignposted fault or IP assignment is needed on the main route. |
| Station 1 practice | Powered server/switch, services and addresses prepared. Choose/power reception computer, add adapter if needed, wire both hosts, test. | Some equipment/attachment choice; most infrastructure is still supplied. |
| Station 1 changed example | A new fixture changes the network to `192.168.70.0/24`; reception and the learner's two cables are absent from the new active scene. | The same desktop-and-two-cables solution still works without touching an address. Prior work/history remains stored; this is visible teardown, not data loss. |
| Station 2 practice | Whole equipment path supplied; nurse has a wrong-subnet address. Test, edit IPv4 setting, retest. | A real address repair with pre-repair observation. |
| Station 2 changed fault | Nurse address is already valid; AP uplink is disconnected. Test, reconnect, retest, explain why IP changes cannot repair a missing link. | This is a worthwhile transfer task. Preserve it. |
| Station 3 practice | Whole technical system prepared, broad access seeded. Choose a responsible policy; collect/return/dock/upload markers; test access; explain. | Meaningful privacy/service distinction, combined with a longer data-journey procedure. |
| Station 3 changed example | New prepared fixture, deny-all seeded. Restore useful access and repeat the marker and explanation work. | Different policy starting point, but substantial repeated procedure. |
| First client | Empty clinic, different subnet, predetermined inherited nurse address fault. Equip all roles, wire/associate/power, enable services, repair address, choose policy, complete marker journey, run full tests, provide four explanation/oral items. | This is where the broad task finally appears. All equipment is free; all objectives ultimately converge on one contract. |
| Settlement | Freeze actual evidence, collect 120 fictional credits less optional guide charges, then inspect/replay. | Correct one-time payment. No subsequent playable job, resource reinvestment, retention system or expanding business is implemented. |

### Constructed pacing trace

The second model trace intentionally used the **same desktop and same two cable choices** in both station 1 examples. Both advanced without `SET_STATIC_ADDRESS`.

| Part | Player dispatches in that successful trace |
| --- | ---: |
| Guided lesson, including finish | 8 |
| Station 1 practice / changed example | 5 / 5 |
| Station 2 address / different link fault | 3 / 4 |
| Station 3 practice / changed example | 8 / 8 |
| Six checkpoint advances | 6 |
| Start the first client | 1 |
| **Total to reach the empty paid clinic** | **48** |

This counts model action calls, including test requests and submitted synthetic explanations. One test call can create several observation events. It excludes UI navigation, selecting dropdown values, reading, thinking and typing. It is neither a minimum nor a claim that a beginner takes a particular time. Its purpose is to expose the amount of preparation and repetition before the promised client work.

## Severity-ranked findings

### P1 — The opening teaches a control, but does not deliver the job fantasy

**Observed/code-confirmed:** The main guided route predetermines the devices, address plan, service, policy, fault and repair class. Choosing switch port 2 versus 3 is a valid alternative, but it has no substantive consequence in this fixture. The player is following a lesson about using the interface. [C1–C4]

**Design implication:** Keep that as an identifiable short warm-up or returnable help lesson. The first substantial module should let the learner assess a need, choose at least one plan that matters, implement it and see a client operation become possible. Do not advertise the warm-up as the substance of the simulation.

### P1 — Repeated fresh scenes weaken progression and ownership

**Confirmed:** The first guided work does not advance independent stations. The first independent success then leads to another bare reception scene. The changed subnet automatically supplies compatible new role addresses, so repeating the old equipment/cabling algorithm passes. Six station checkpoints precede paid work. [C4–C7]

**Design implication:** Preserve a continuous workplace through a teaching sequence, or label genuinely separate bench challenges and make the next challenge change the reasoning. A different adapter/port constraint, a conflicting address or a newly mobile workstation can create transfer. A different network label alone does not, when the relevant addresses are supplied automatically.

This finding does **not** justify silently bypassing the user's requested bootcamp. Redesign the bootcamp so it prepares the independent job with distinct challenges and clear purpose, while retaining a teacher-controlled prior-learning route.

### P1 — Equipment trade-offs are mostly written, not experienced

**Confirmed:** Both existing complete routes passed the model: desktop/tablet/server/4-port switch and laptop-plus-adapter/laptop/desktop-host/8-port switch. With no guides, both retained a net 120 credits. Hardware has no purchase price, stock, budget, ongoing cost or capacity demand beyond basic capability/port checks. [C9]

**Design implication:** This is a useful technical choice catalog, but it does not yet deliver a consulting economy. A first expansion should give a small, transparent client equipment allowance or stock constraint, preview consequences, and support more than one affordable valid plan. Keep equipment purchasing separate from the consultant's service fee. No real pricing accuracy should be implied by fictional teaching credits.

### P1 — There is no implemented career loop after the contract

**Confirmed:** The campaign has one contract and at most one settlement. Free replay is honest practice, not another customer. [C8, C16]

**Design implication:** The first mission needs satisfying internal progress and a clear ending before a city or many clients are built. A later reusable mission registry/contract list is necessary for multiple customers; merely adding new phone cards would misrepresent the current engine.

### P2 — Diagnosis is too strongly signposted for the independent job

**Confirmed:** The normal client brief names an inherited nurse setting; the ordinary repair objective always requires that address to change. Current learning focus directs the player toward that setting based on internal evaluation. [C8, C12, C18]

**Design implication:** In independent work, start with a reported symptom and let selected diagnostics reveal the fault. Reuse clear layered diagnostic feedback after a test; do not manufacture obscurity by withholding an actual result. Introduce a small authored set of stable fault fixtures whose repairs match their causes. This requires a model/contract change because the existing client repair gate is address-specific.

### P2 — Phone messages seldom give the player something to decide

**Confirmed:** The phone is a persistent log with Mark read. The nurse's request about booking permissions arrives when a policy action occurs; there is no conversation action to ask about priorities before deciding. [C11]

**Design implication:** Keep the liked phone introduction, then use the phone to request information, commit to a scope or respond to a change. A reply must reveal or alter authoritative mission facts. Dialogue that changes only decorative text would not improve agency.

### P2 — The clinic is a useful spatial view, but not yet an operational workplace

**Confirmed:** Locations affect clinic/home coverage and nurse capability; they are not meaningless. However, rooms A and B use the same named coverage rule, and a whole test suite checks both automatically without a player visit. The game honestly labels these as engine checks. [C10, C13]

**Design implication:** Make places useful through tasks: reception performs a booking-service test, the equipment room exposes the uplink, and room B provides a follow-up mobility check. This does not require a walking avatar or 3D. Do not suggest an RF simulation, a real patient queue, or staff productivity calculations unless those systems are actually implemented.

### P2 — Marker procedures and explanations compete with the early game promise

**Confirmed:** The wearable sequence is performed in both access checkpoints and again in the full client, while the client requires four explanation/oral items before handover. The source lesson gives the wearable a legitimate instructional purpose. [C14; `learning.js`, line 152]

**Design implication:** Keep that purpose, but introduce it as a distinct follow-up request after the basic clinic starts working. Let evidence accumulate from real decisions, with a compact final handover. Moving an explanation or marker requirement to a later phase must be a deliberate mission-contract revision, not a presentation-only bypass.

## What already works and should survive

- One authoritative model, real device/port occupancy and capability checks, adapters that add actual ports, and correct stale-result behaviour.
- Layered failures: power, physical path, address/mask/duplicate/reserved-address, service, then authorization. A failed connection cannot falsely prove privacy protection.
- Static IPv4 and masks calculated with bits, rather than a universal first-three-octets shortcut.
- Two technically valid equipment routes and two responsible privacy policies. Nurse-also-books has an actual permission/test difference.
- An explicitly different link-fault transfer after address repair.
- Honest distinctions among trainer setup, demonstrations, learner actions, current service tests and teacher-reviewed explanations.
- Free practice, bounded guide costs without a real-time countdown, local recovery, evidence exports, one-time settlement, and accessible non-drag controls.

These are reusable foundations for a game. Rewriting the engine merely to obtain a different visual style would discard valuable work.

## A bounded first-shift redesign

**Proposed design, not implemented.** Keep one clinic, the original art direction and existing network model as the starting point. Timing below is an unmeasured planning target: a short optional controls warm-up, then a substantive first shift suitable for one lesson, with the first client-visible improvement early in that shift.

1. **See the job before the training.** Ari sends a concrete request: reception and a mobile nurse must use shared services; the clinic has an equipment allowance and some available equipment. Show the intended operational result. A compact bootcamp teaches the controls, an address decision and a genuinely different fault before independent work; avoid repeating identical teardown/rebuild tasks.
2. **Survey and choose a plan.** Inspect reception's fixed-desk need, the nurse's mobility, available equipment and network card. Choose between at least two viable plans. Ask one useful question by phone, such as whether nurses need to arrange follow-ups. The answer affects the brief or a recorded recommendation.
3. **Bring one service into use.** Choose/place equipment, attach the correct adapter if required, connect and configure the endpoint, then try the booking service. A current passing model result changes the reception's service state. The room shows why the network matters, while exposing the real path when requested.
4. **Investigate the second problem.** Reception works but the nurse cannot complete a task. The learner chooses tests and repair. Use one authored fault variant per attempt, with a stable seed and genuine clues: wrong-subnet setting, missing AP uplink, or stopped service. Do not silently damage completed player work to force a story beat.
5. **Resolve a real access request.** Decide whether nurses may also book appointments. Both existing responsible policies remain viable. Demonstrate allowed work and denied access on a healthy service; record who gains convenience and who faces a workflow constraint.
6. **Complete the return-and-sync follow-up.** After network work is understood, receive the wearable request as a new task within the same clinic. Preserve the supplied source's offline collection, dock handoff and authorized upload distinction. The teacher can schedule this phase separately, without pretending the full original mission is already complete.
7. **Hand over and see a result.** Generate the actual actions/tests summary, add the learner's short reasoning or pending oral arrangement, settle once, and show the clinic's changed service states and receipt. A future-job preview may be a preview only until another mission is built.

The key independent choices are plan, equipment allocation, address assignment, diagnostic order, repair and authorization. More clicking is not the target.

### Implementation classification against the current model

| Component | Classification | Concrete integration boundary |
| --- | --- | --- |
| Device choice, power, adapters, placement, cable ports, Wi-Fi association | REUSE | Existing `CHOOSE_DEVICE`, `POWER_DEVICE`, `ATTACH_ADAPTER`, `PLACE_DEVICE`, `CONNECT_PORTS`, `ASSOCIATE_WIFI`. |
| Static addressing, real probes, fresh/stale results, paths | REUSE | `SET_STATIC_ADDRESS`, `RUN_PROBE`; preserve truthful layer ordering and tests. |
| Privacy alternatives, marker stages, explanations, export | REUSE | Existing policies and actions; keep real consequences and teacher review. |
| Continuous teaching sequence and earlier independent shift | REVISE | `TRAINING_NEXT`, fixtures, completion contract and UI transitions; preserve legacy attempt provenance. |
| Symptom-first independent diagnosis | REVISE | Separate internal completion knowledge from information exposed in the task/phone before an observation. |
| Visible booking/workspace task result | REVISE / small NEW presentation | Must be driven by current model results; no independent success button. Persist an additional business operation only if it has defined causal rules. |
| Equipment allowance, stock and purchase/refund | NEW | Add explicit authoritative economic state/actions, separate from guide-fee ledger; cover cancellation/recovery and at least two feasible plans. |
| Branching requirements conversation | NEW | Stable question/reply/event IDs; answers affect mission facts or a recorded decision, not text alone. |
| Alternate independent client faults | NEW model generalization | Replace address-only `repaired()` gate with fault-specific evidence; stable fixtures and save validation are required. |
| Multi-job progression/retention | DEFERRED after first complete shift | Current single-contract state and validator cannot support it without deliberate schema/ledger design. |
| Routers, gateway, DHCP, DNS, different routed subnets | DEFERRED technical expansion | None is implemented now. Add a genuine second-network service need before teaching routing; a local LAN should not require a decorative router. |
| Full 3D, walking avatars, city navigation | DEFERRED unless a tested learner action needs them | Current places and technical inspectors can support the first shift in accessible 2D. |

## Acceptance criteria for the next playable slice

1. A fresh learner can describe the client, needed service and first action without reading the full guide. Observe this in a walkthrough; do not infer it from a passing test.
2. The warm-up clearly ends and leads into an independent problem. Returning/teacher-directed learners can resume without fabricated training completion.
3. Two feasible equipment plans pass; they differ in a modelled resource or capability consequence. Merely changing the illustration does not count.
4. A changed example changes reasoning or constraints; repeating the old exact device/address/connection recipe cannot be the only transfer demand.
5. First service success visibly changes something about the workplace and creates the next justified task. It must come from the authoritative model.
6. A student can select an irrelevant plausible repair, observe the original fault remain and recover. An unplugged path is not fixed by a new IP address; a routing problem is not labelled as implemented until routing exists.
7. The independent brief reports a symptom, while chosen tests reveal the relevant cause. The model may know the answer, but task copy must not pre-solve the diagnostic decision.
8. Both responsible access policies remain viable; the evidence records the actual permission difference, tests and unchanged learner explanation.
9. The same evolving clinic and resources persist across job phases. Any separate practice fixture is explicitly labelled; no restored work is silently replaced or misrepresented.
10. Guidance remains safe to use: free practice and controls; disclosed/capped fictional client costs; no cash dead end; no automatic academic mark from money, speed or help.
11. Model/adapter regressions and a full published-site playthrough cover valid/invalid networks, repair, reset, old/new saves, damaged import, second tabs and evidence. School hardware remains a separately observed gate.
12. A teacher walkthrough and small beginner pilot measure time to first meaningful success, requests for help, wrong turns, and whether learners can explain the fault. Engagement and mastery are not established by completing the code.

## Decisions for the lead/teacher

The bounded revision can proceed with existing authority to improve the game. Teacher input would tune, rather than block, three choices: the assumed entry knowledge, whether the full bootcamp runs in a preceding lesson or within the first session, and whether the wearable follow-up remains in that session. No new curriculum codes or coverage claims are proposed by this audit; existing supplied course sources remain authoritative.

**Handoff:** Read this as source-verified design findings plus limited model experiments. Combine it with the lead's live walkthrough and the Aspire gameplay/visual specialists' directly sourced observations before deciding the implementation contract.
