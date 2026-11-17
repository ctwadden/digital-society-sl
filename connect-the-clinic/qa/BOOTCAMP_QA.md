# Integrated bootcamp — independent QA

**Audit date:** 16 November 2026 · America/Halifax  
**Build under review:** Opening Shift and Field-ready bootcamp, `0.8.0-review`; programme save build `0.8.0`, schema 1.  
**Repository scope:** `connect-the-clinic/` bootcamp integration  
**Scope owner:** independent QA; production fixes belong to the lead/gameplay/interface owners.  
**Overall result:** **PASS for the exercised model and mocked persistence boundaries; PARTIAL for release acceptance pending the lead's real published-browser observations.** No school-device or learner results are claimed.

## Independence and environment

This audit started from the raw `docs/bootcamp/CONTRACT.md` acceptance IDs B1–B8 and `docs/bootcamp/API.md`, then inspected the implementation. Existing builder tests were read for scope awareness; the independent routes use the public programme API and derived device/port inventory, without importing builder helpers or assigning completion flags. Valid checkpoints were earned by actual accepted actions. Deliberate imported-state mutations were used only to test rejection.

Runtime was **Node v24.22.1 on Linux 6.18.57** in the local workspace. Persistence tests used a clearly identified in-process mock of local storage, Web Locks and BroadcastChannel. No browser, browser automation, published site, viewport, assistive technology, Windows machine or school profile was operated by this worker. Browser/OS/viewport for a real playthrough are therefore **NOT RUN**, not inferred from source or Node results. Model/effort/billing telemetry was not exposed to this worker.

Only these assigned files were created or changed by independent QA:

- `tests/bootcamp/qa.test.js`
- `qa/BOOTCAMP_QA.md`

Production fixes were reported with reproductions and applied by their owners. This worker did not publish, change production files or spawn another worker.

## Checks actually performed

The independent test file now contains **18 tests**. Test count is separate from the eight contract acceptance IDs and from the several negative variants within a test.

| Command/check | Observed result | Scope and limits |
|---|---|---|
| `node --test tests/bootcamp/qa.test.js` after the mask fix and focused test corrections | **17 passed, 0 failed**, approximately 3.69 seconds | Public model routes plus mocked adapter behavior. This run preceded addition of the export-size regression. |
| `node --test --test-name-pattern='near-cap progress export' tests/bootcamp/qa.test.js` after the serialization fix | **1 passed, 0 failed**, approximately 2.38 seconds | Exercises the actual exported progress serializer and replay validator with a legitimate large programme. |
| Direct `materialArtwork({assetKind:'switch8',title:'Eight-port switch'})` recheck | **PASS** | Correct shared switch illustration and title returned after the source fix. No visual browser claim. |
| Source inspection of training UI, scene, styles, content, main adapter, programme, shared engine and persistence adapter | **PASS within the qualifications below** | Establishes implementation paths and candidate accessibility support; does not establish rendered accessibility or school usability. |

The first independent 16-test batch had 14 passes and two incorrect QA expectations. These were investigated against actual implementation behavior before correction: the actual diagnostic codes are `SWITCH_OFF` and `SERVICE_UNAVAILABLE`; a mock that denies writes but permits removals can successfully clear old copies while correctly reporting that the new attempt is only in memory. These were test corrections, not production failures. A complete paid-field route was then added and the focused 17-test rerun passed. The subsequently discovered export boundary received its own focused regression.

The lead owns the full project regression gate, including the required earlier suite. This report does not substitute this worker's 18 tests for that gate or claim the lead's full-suite result as independently observed.

### Complete-route measurements

The exercised route watched all five solved demonstrations, completed all six practical tasks, entered the independent field job, purchased its AP and uplink, observed and repaired its inherited address fault, chose nurse booking access, recorded the required room/access tests, submitted four exact explanations, delivered and settled the job, then revisited training and returned to the preserved field state.

That route used **92 programme actions** and **155,164 compact JSON bytes**. Replay measured **125.5 ms** in this particular Node run. It stayed below the 1 MiB save limit. These numbers describe one automated route in this container; they are not browser latency, beginner completion time or Chromebook/Windows performance measurements.

All three field guidance sections reserved the existing cap of **15 credits and 9 simulated minutes**. Settlement paid **105 fictional credits once**; a repeated settlement did not add another payment. Training earnings and guidance cost remained zero. Reopening and resetting training left the settled field object exactly unchanged.

## Findings, repairs and focused rechecks

### QA-B3-01 — malformed mask silently retained the old value

**Severity:** Medium. **Status:** FIXED and independently rechecked. **Owner:** gameplay engineer.

**Reproduction before the fix:** Earn kit and cable completion, start address practice, then send `SET_STATIC_ADDRESS` for the workstation with a valid new host such as `192.168.80.42` and `mask:''`. The same problem occurred with `null`, `false` and `0`.

**Expected:** Reject an empty or malformed mask atomically. The learner is explicitly applying the address and supplied mask, so an absent value must not silently become a valid configuration.

**Observed before repair:** The programme accepted `NETWORK_UPDATED`; the core fallback `action.mask || previousMask` retained `255.255.255.0`. A fresh service test could then satisfy the address task without the explicit setting that the action claimed to apply.

**Repair/recheck:** The training boundary now validates the explicit mask before calling the preserved core. The independent regression rejects empty/non-string, noncontiguous and unsupported `/0`/`/32` values as `MASK_INVALID` without changing the input state. Valid `/16` still produces the model's actual local service pass while failing the lesson's separate `/24` configuration requirement. A valid `/28` that separates the chosen host from the server produces `ADDRESS_OFF_LINK`. The fix did not make every different mask a connectivity failure.

### QA-B6-01 — valid eight-port switch used the wrong inspector illustration

**Severity:** Low. **Status:** FIXED and source-function rechecked. **Owner:** interface specialist.

**Reproduction before the fix:** Choose the allowed eight-port switch in kit practice and select it in the Devices inspector. The UI calls `materialArtwork` with `assetKind:'switch8'`.

**Expected:** Show the existing original eight-port switch artwork, consistent with the actual accepted device and the main bench.

**Observed in source:** `materialArtwork` omitted `switch8` from its known shared device kinds, so it fell through to a generic network-interface card. The main bench already used the correct switch generator.

**Repair/recheck:** `switch8` now delegates to the shared original device generator. The direct function output contains `class="opening-device-art"` and the title `Eight-port switch — power on`. Rendered inspector appearance remains part of the lead's browser review.

### QA-B5-01 — a valid large programme downloaded in an unrestorable format

**Severity:** Medium. **Status:** FIXED and independently rechecked. **Owner:** lead.

**Reproduction before the fix:** Start an earned transfer-practice checkpoint and make 217 accepted 2,000-character reflection saves. This produces 254 total accepted programme actions. The compact state is **974,875 bytes** and validates successfully. The main adapter's former formatted download, `JSON.stringify(state,null,2)`, expands it to **1,051,311 bytes**.

**Expected:** A supported progress download must remain within the same byte limit as the import path and restore its exact valid state.

**Observed before repair:** The app's download serialization exceeded 1 MiB and was rejected by its own validator as `SAVE_TOO_LARGE`, although the authoritative saved programme was still within its allowed limit.

**Repair/recheck:** The lead added `serializeProgrammeProgress` to the programme boundary and uses it for the real progress-download path in `dist/opening/main.js`. The focused test constructs the same legitimate boundary, calls that exact exported serializer, and confirms a **974,875-byte** download that validates and replays to the exact original state. Import limits remain in force. The source call site was checked; the browser's actual download/file-input interaction remains for the lead.

No open production defect remains from this worker's exercised scope after these repairs.

## Contract acceptance matrix

| ID | Requirement/risk | Independent steps and observed evidence | Status | Remaining owner/check |
|---|---|---|---|---|
| **B1** | Real instruction followed by an actual fresh learner task | Earned all six lessons through accepted device, cable, address, Wi-Fi, policy, test and explanation actions. New programme cannot enter field or jump to a later lesson. Five worked examples operate the model. | **PASS, automated/source** | Lead to observe the integrated published user route. |
| **B2** | Honest provenance and model-derived gates | Every solved demonstration retains trainer observations and cannot complete practice. New practice has a new attempt and no inherited tests/answers. Current engine success alone is insufficient. An early transfer repair cannot invent a previous faulty observation. Completion and imported flags cannot be forged without replay rejection. | **PASS, automated** | No claim that these mechanics alone demonstrate understanding. |
| **B3** | Accurate failures, targeted repairs and reasonable alternatives | Alternative desktop host/eight-port kit, alternate free switch ports, host `.254`, reversed room-test order and both responsible policies pass. Tested duplicate/reserved/off-link addressing, broad-mask nuance, power/service interruption and repair, stale tests, technical failure versus intended denial, and valid-IP edit versus missing transfer uplink. | **PASS after QA-B3-01** | Real hardware behavior outside the simplified model is not established. |
| **B4** | Exact explanation and honest training/field evidence | Preserved whitespace, newlines, literal markup, punctuation and Unicode in transfer text. Accepted pending oral review and non-keyword explanation presence without claiming quality. Frozen prior completion survives retries. Field tests and earnings stay separate; no trainer action becomes an independent field observation. | **PASS, automated/source** | Teacher judges reasoning, oral review and official evidence mapping. |
| **B5** | Migration, bounded saves and recovery | Replayed genuine old 0.7 paid-help/rehearsal state and preserved it exactly with zero invented training. Corrupted nested state, completion, wallet, action logs, extra state, evidence files, malformed JSON and oversized input reject. Mocked rejected imports preserve both memory and saved bytes; takeover is exclusive; clear returns to unearned bootcamp; denied writes remain explicit memory mode. The 1,200-action boundary rejects atomically and the last accepted state replays. Actual progress serializer passes the large-file regression. | **PASS for model/mock/source; browser PARTIAL** | Lead: actual file chooser/download, backup recovery and unsent editor drafts across real tab/screen transitions. |
| **B6** | Named controls, readable route, keyboard, focus, motion and original appearance | Source provides named HTML selects/buttons, port occupation text, result text beyond colour, roving tool tabs, modal Escape/Tab handling, focus restoration, inert background and reduced-motion CSS. Scene derives installed cables and actual observations, suppresses stale/other-room route overlays and reuses the project's original vector generator. Switch8 issue repaired. | **PARTIAL, source only** | Lead: keyboard, zoom, narrow layout, visual legibility and assistive technology on a real browser. No WCAG conformance claim. |
| **B7** | Coherent bootcamp/field launch; free training; preserved field tariff | New programme begins at training; legitimate migration resumes field with a notice. Training hints and retry have zero money/time effects. Field tariff, settlement and complete field state survive training navigation. Reviewed modules use no runtime AI, paid service, external account or identity authentication flow. | **PASS, automated/source** | Lead: published entry/dependency check. |
| **B8** | Honest evidence boundaries | Automated model, mocked storage, source review, published browser and school/pilot evidence are explicitly separated here. | **PASS for reporting** | Published browser belongs to lead. School Windows/browser policy and beginner pilot remain **NOT RUN**. |

## Source and interface review

The source review included `docs/SOURCE_ALIGNMENT.md`, `docs/bootcamp/LEARNING_DESIGN.md`, the shared contract/API and the authored `dist/bootcamp/content.js`. The current content supplies twelve material cards covering workstation/laptop/tablet, server role, switch, AP, router concept, interface/port, Ethernet, power, USB and display cables. LAN/WLAN/Internet and the `/24` bit boundary are distinguished. Power, association, the AP's Ethernet uplink, host service availability and role permission are separate dependencies in both teaching copy and model outcomes.

The current examples use demonstration `192.168.60.0/24`, practice `192.168.80.0/24`, changed-fault transfer `192.168.90.0/24` and separate field `10.40.10.0/24`. The source ledger's older `.50`/`.70` examples belong to preserved historical content; the current bootcamp contract and learning design identify the new fixtures. Router, USB/display wiring, DHCP, DNS, Internet access, real authentication and radio physics are explicitly deferred or conceptual. The supplied-mask task requirement is separated from actual broader-mask reachability.

The original private Computers lesson files, full Networks PDF and Digital Society textbook were **not newly supplied to this worker**. Their curricular provenance is inherited from the project ledger and bounded by its statements. No official curriculum/Evidence Map code, automatic IB grade, whole-chapter coverage or mastery claim was invented by this audit. Source documentation lists primary technical references; this worker did not claim a fresh external fact-check of every cited reference.

The inspected UI obtains completion and disabled conditions from the derived view and dispatches actual programme actions. Exact learner text is escaped for HTML rendering. Settings and explanation drafts are scoped by campaign plus attempt in session storage, and the main adapter destroys the old interface before mounting the other screen. Draft rescue is explicitly labelled unsubmitted. Source behavior supports those safeguards, but this worker did not exercise actual browser draft persistence or focus behavior.

The SVG bench is supplementary, hidden from assistive technology, with the device list, ports, cable records and observations available as HTML. Its installed-link drawing is separate from a recorded test route. The diagram shows no recorded success merely because a link exists. A nurse observation from the other room is retained as evidence but is not drawn over the device's current room. Source inspection found no external artwork/media dependency in the reviewed training modules; original device generation is shared with the preserved project.

## Remaining observed-use gates

The lead should append its own published URL, build identity, browser/OS, viewport and directly observed results to the release record. Relevant checks include:

- A beginner's route from equipment review through demonstration, fresh practice, final changed fault and independent field launch.
- Keyboard-only selection, cable connection, address application, room changes, modal focus/Escape, and completing transfer with exact written or oral-pending evidence.
- Narrow layout, browser zoom and reduced motion, with text and outcomes still understandable without the diagram or colour alone.
- Actual progress/evidence downloads and file-input import, rejected-file preservation, reset cancel/confirm, backup recovery and read-only takeover with unsent drafts.
- The final hosted build's dependencies and preserved earlier-game boundary.

School Windows machines, browser policy, blocked/private storage, managed downloads, shared profiles, actual assistive technology and a small beginner pilot require observation in those environments. The nominal teaching duration remains an estimate. Neither the automated results nor the lead's eventual hosted-browser result establishes those school conditions or learner understanding.
