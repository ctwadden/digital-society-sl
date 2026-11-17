# Opening Shift — independent QA

**Review date:** 16 November 2026, America/Halifax.  
**Reviewer:** T6, independent of the engine, curriculum, art, interface and integration authors.  
**Build:** `0.7.0-review` entry / `0.7.0` engine; mission `mission.clinic.opening-shift.001`.  
**Scope:** independent Node model and persistence-adapter execution, actual SVG-string rendering, static asset checks, and explicitly labelled interface source review. Production files were not edited by this reviewer.

## Final decision for this QA scope

**PASS for the automated model, adapter and asset gates; PARTIAL for interface acceptance pending the lead's live review.** All **26 independent tests pass** after the targeted repairs. The reproduced import conflict now rejects before changing the in-memory campaign, backup or competing disk snapshot. The post-delivery guide guards now permit the engine's free review actions while preserving busy/read-only protection; this particular UI fix was rechecked in source only.

The lead owns final release acceptance and the browser/published-site pass. This report does **not** establish browser, assistive-technology, Windows/Chromebook, school-policy or beginner-pilot readiness.

## Environment and method

| Item | Observed scope |
|---|---|
| Working directory | `/workspace/scratch/f3af352c847c/clinic-opening-shift` |
| Runtime | Node `v24.22.1`, Linux `6.18.57 x86_64`. |
| Model | Actual `dist/opening/engine.js` wrapping actual `dist/engine.js`; no mock outcome calculator. |
| Adapter | Actual `dist/persistence.js` with actual new validator and namespace `riverbend.clinic.opening.v1.`. Local storage, locks, channels and events substituted in Node. |
| Rendering | Actual `renderScene`, `renderDeviceArtwork` and `getDeviceAnchors` executed as pure SVG-string functions. |
| Interface | Actual `ui.js`, `styles.css` and `main.js` source read. No browser tab was used by T6. |
| URL / browser / viewport | Not applicable to these tests. Root's published/browser observations must be recorded separately. Target viewport and zoom remain 1366×768 and 200%. |
| Sources | `CONTRACT.md`, `ENGINE_API.md`, `LEARNING_DESIGN.md`, `RUN.md`, the learning-simulation-qa skill and its QA matrix, actual implementation and existing child diagnostic definitions. |
| Test ownership | Only `tests/opening/qa.test.js` and this report. Existing builder tests were inspected for boundaries after inspecting implementation; independent helpers do not import builder test helpers. |

## Executed tests and exact counts

Acceptance-case groups are listed separately from Node test counts. Four fixture/equipment combinations expand QA-01 into four tests.

| Command / stage | Exact observed result |
|---|---|
| `node --test tests/opening/qa.test.js` — initial independent pass | **25 tests: 24 passed, 1 failed**, 0 skipped, about 2.09 seconds. The failure was a reviewer expectation using `SERVICE_STOPPED`; actual stable child code is `SERVICE_UNAVAILABLE`, with the message that shared services are off. No production defect or code alias change was warranted. |
| Child source inspection | `dist/engine.js` explicitly returns `SERVICE_UNAVAILABLE` when the host is reachable and shared services are off. QA-08 now asserts this code and its cause-specific message. |
| `node --test --test-name-pattern='QA-08\|QA-23' tests/opening/qa.test.js` — focused reproduction | **2 tests: 1 passed, 1 failed**. Corrected QA-08 passes. New QA-23 fails at valid import accepted `true` versus required `false` during a competing disk revision. |
| `node --test tests/opening/qa.test.js` — final repair/recheck | **26 tests: 26 passed, 0 failed, 0 skipped**, about **1.79 seconds**. Includes the corrected diagnostic expectation, new conflict regression and every earlier independent boundary. |
| Final guide-source recheck | `guidesBody()` now uses `disabled(!q,true)` for consultation and `disabled(false,true)` for hints. `disabled()` still checks busy and read-only before its frozen-phase exception. PASS as source review; live button use remains root-owned. |

The lead separately reported a whole-project run before QA-23 was added: 211 total, 210 passed, the same reviewer-code mismatch failed. That is lead-observed evidence, not an additional T6 run.

## Findings

### QF-01 — valid import bypasses the pre-mutation conflict guard

**Status:** FIXED, PASS on independent recheck. **Severity before repair:** material recovery defect. **Owner:** lead integrator (`dist/persistence.js`).

**Reproduction:** create the actual adapter in saved/writable mode; review the brief so current work and backup exist; replace the namespace's snapshot with another valid Opening Shift campaign and a different envelope stamp without delivering a storage event; import a third valid Opening Shift campaign.

```js
await store.send({type:'REVIEW_BRIEF'});
const before = store.getState();
records.set(snapshotKey, envelope(
  createShift({campaignId:'qa.newer-disk', fixture:'B'}),
  'newer-writer:1'
));
const result = await store.importProgress(JSON.stringify(
  createShift({campaignId:'qa.import-candidate'})
));
```

**Expected:** reject with `SAVE_CONFLICT` before replacing state or backup; retain the old in-memory campaign and competing saved snapshot; switch to read-only; offer explicit takeover.

**Actual before repair:** `accepted:true` and “Progress imported as a whole campaign”; current memory becomes the import candidate; disk remains the newer competing campaign; status is read-only. The adapter calls `persist()` only after replacing `state`; `persist()` notices the conflict too late. It also updates the backup before the conflict check. The current in-memory campaign no longer remains available from the store.

**Regression:** QA-23 checks rejection, exact original object identity and serialization, unchanged disk/backup, read-only status and successful explicit takeover into the competing saved campaign. This is a Node capability-substitution test, not an observed browser race.

**Observed repair:** the shared `preflightMutation()` guard executes before an import updates backup or state. It also serves ordinary send, recovery and clear. Final QA-23 passes; the complete 26-test file confirms the affected restore/import/rejection and takeover boundaries still work.

### QF-02 — post-delivery free guide controls disabled in interface

**Status:** FIXED in source; live recheck pending. **Severity before repair:** functional interface mismatch. **Owner:** interface specialist (`dist/opening/ui.js`).

**Source sequence:** deliver a valid job; open Guides; choose an unopened section or an unrevealed hint tier. In `guidesBody()`, the quote button calls `disabled(!q)` and reveal buttons call `disabled()`. The helper defaults `allowFrozen=false`, so `phase !== 'active'` disables these actions.

**Expected:** the same controls remain usable after delivery, while retaining busy/read-only protection. The engine explicitly allows `GUIDE_CONSULT` and `REVEAL_HINT` on a delivered job and quotes zero cost with “Review after delivery is free.” Frozen delivery money and evidence remain unchanged.

**Evidence limit:** this conclusion is based on the actual rendering guards, not a live click. The lead's browser check should confirm the final button behavior.

**Observed repair:** both guide action types now pass the explicit frozen-phase exception. The helper continues to block busy/read-only controls. No other guide tariff or engine behavior changed. The lead reported that the interface specialist's own delivered/settled harness assertions passed; that report is not counted as an independent T6 browser or runtime result.

## Acceptance matrix

| ID | Requirement/risk | Steps and observed evidence | Status | Owner / remaining check |
|---|---|---|---|---|
| R1 | Authoritative causal model and usable alternatives | Four complete routes: A/B × retained laptop/tablet. Nurse tests use B then A order; uplink uses reverse endpoint order and switch port 4; A uses alternate valid addresses. Expected spending 44/114/0/70. Each reaches frozen handover and a single 120-credit settlement without guide charges. | PASS — automated model | No browser result implied. |
| R2 | Physical failure, relevant observation and repair | B returns `PORT_DISCONNECTED` with an empty route before and after an unrelated valid IP edit; only actual uplink connection creates a confirmed repair and its cable ID appears on a fresh nurse route. A accepts proactive inspected repair without inventing a failed test. | PASS — automated model | Beginner diagnosis reasoning requires teacher review. |
| R3 | No repair-evidence laundering | Unobserved original A repair followed by inspection of valid settings and valid→valid edit remains incomplete. A later genuinely observed current fault can be repaired. Earlier genuine repair witness survives a harmless later valid edit, with new explicit tests required. | PASS — automated model | This independently challenges the lead's earlier reported A loophole fix. |
| R4 | Actual two-room tests and current truth | `all` in A plus successful engine room-B checks cannot supply a player B visit. B then A explicit observations satisfy the gate. Nurse at home blocks handover despite preserved room observations. AP uninstall clears its dependent uplink and association; returning/rebuying infrastructure restores service only after installation/association/retests. Fixed host/switch/reception uninstall is atomically rejected. | PASS — automated model | Actual visual control flow remains root-owned. |
| R5 | Distinct failure layers and useful permissions | Stopped service returns reachable-host/service-off failure, not a privacy success. AP power loss breaks nurse service and keeps reception working. Missing host cable cannot count as outsider denial. Both responsible policies expose distinct nurse-booking outcomes; broad access fails restrictions, deny-all fails staff service. Changed privacy context blocks handover until resubmitted/oral review. | PASS — automated model | Policy reasoning quality is not automatically judged. |
| R6 | Honest learning evidence | Exact multiline punctuation and HTML-looking learner text survive evidence unchanged; SVG presentation escapes dynamic labels. Oral review is explicitly pending. Delivery adds no learner probes, freezes actual context and makes no bootcamp/wearable claim. No score or grade is emitted. | PASS — model/SVG execution | Live HTML/DOM escape and downloaded file behavior are separately untested here. |
| R7 | Refunds, resets, paid help and practice isolation | Installed tablet return removes nurse and refunds 70 once; rebuy preserves its corrected profile and does not repeat fixture initialization. Reset refunds paid equipment and retains 15-credit/9-minute guide charges. Practice preserves the independent client and has zero costs/earnings. Post-delivery reset opens separate practice; repeat settlement retains one receipt and wallet. Evidence labels current free practice separately from prior paid delivery. | PASS — automated model | QF-02 guide-source fix rechecked; live post-delivery guide use remains root-owned. |
| R8 | Bounded valid and invalid progress | Valid save round trips; 15 damaged nested-state/log/ledger/evidence variants reject, as do invalid actions, unknown/old/oversized/deeply nested records. Old saves receive `LEGACY_SAVE` and preserved-game direction. Actual adapter reload/import retains `manual-file` provenance and one-time refund. Rejected imports preserve state, current snapshot and backup. Storage denial keeps valid exportable memory with unsaved status. | PASS — model/adapter execution | Actual file chooser, downloads and school storage policy remain untested here. |
| R9 | Control, conflict and recovery | Two tabs: second is read-only, blocked mutation/import preserves memory; explicit takeover loads newest saved purchase and blocks old writer. Ordinary action conflict rejects before mutation. Corrupt current snapshot remains intact until explicit backup recovery. QF-01 now rejects the competing-stamp valid import before any replacement and preserves state/backup/disk exactly. | PASS — adapter execution | Actual browser tab/event behavior remains root-owned. |
| R10 | Draft scope and accessible controls | Source scopes drafts by campaign+attempt, keeps sessionStorage rescue, marks replacement drafts for review, prevents automatic stale-base commit, supplies labelled native forms, modal focus capture/restore and keyboard hooks, reduced-motion and narrow CSS rules. This is source inspection only. | PARTIAL — source audit | Root: actual draft typing/import/takeover/reset/export, dialog cancellation, keyboard-only flow, focus after rerender, zoom, screen-reader labels and narrow layout. |
| R11 | Original assets and faithful scene state | Every manifest export exists and has no external resource/script; required six device kinds have on/off/selected exports. Anchors equal the contract. Actual current player path IDs alone highlight edges; no setup/stale/different-room route is fabricated. Home location is omitted and counted. Renderers leave the provided view unchanged. | PASS — asset/SVG checks | Legibility, visual overlap and actual responsive rendering need browser inspection. |
| R12 | Publication and school readiness | No published URL, native browser, school device, school policy or learner session used by T6. | NOT RUN | Lead published walkthrough; teacher walkthrough; beginner pilot and actual school environment. |

## Remaining observation gates

Root should independently observe the public build after all fixes, including a full playable route, initial UI clarity, actual phone/guide behavior, on-screen diagnostics, evidence/progress download and reimport, cancel/reset, two-tab takeover with unsent draft rescue, and both 1366×768 and narrow/zoomed layouts. Test keyboard movement, dialog dismissal and focus restoration using the live page rather than treating source hooks as proof.

The first-use timing, reading load, school browser download/storage policy and actual assistive-technology behavior require observed teacher/student checks. Lesson durations in `LEARNING_DESIGN.md` remain planning estimates. Explanation quality, stakeholder judgement, exact official curriculum mappings and any oral follow-up remain teacher decisions. Game completion, fee, help use and speed are not grades.

## Repair recheck log

The lead and interface specialist applied the two acknowledged fixes. T6 inspected the actual updated guard code and ran the complete **26-test independent file once: 26 pass, 0 fail**. This includes the failed regression as well as the affected invalid-import, valid-import, reload, recovery, storage-denial and two-tab boundaries. No production files were edited by T6. Optional test expansion stopped after these agreed gates.

Final observed source identifiers (SHA-256) distinguish this review from future edits:

| File | SHA-256 |
|---|---|
| `dist/opening/engine.js` | `d484fd5ac8a89dbf604defd71b45f8395b1559540ef001c086dac35dc809bc01` |
| `dist/opening/content.js` | `b52eb9fc3eb6d0bc33bcddf0fe56f402725472ea02668e73d69b80ac3610bbf8` |
| `dist/opening/ui.js` | `4ac34e04278bd0c42e097fa38094573722fb82a29159867085076bfd9729a8c7` |
| `dist/opening/scene.js` | `43f72cca70dc43ed1729fc8f8021a29230bc54638f88796c82c09b2f622edb95` |
| `dist/opening/styles.css` | `92a00edf067f1a665a68e274036770a0b9a67a1c8ce88302ba7508a08756ba9e` |
| `dist/opening/main.js` | `d9d4e0e5196cb6df99fd25cea380bed326ab2e8e5019201f6c5d5ef5437f4811` |
| `dist/persistence.js` | `00b3d890f330279330c2c5ff25975665fbdc8571594267612251633aff36003e` |

Root owns final acceptance and publication. T6 has released the QA slot with no remaining material failure in the executed scope. Browser and school observations remain explicitly unclaimed.
