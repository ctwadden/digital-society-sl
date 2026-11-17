# Opening Shift release checks

Review version `0.7.0-review`. Lead record; independent findings are in `OPENING_SHIFT_QA.md` and published observations in [OPENING_SHIFT_BROWSER.md](OPENING_SHIFT_BROWSER.md). Date: 16 November 2026, America/Halifax.

**Published teacher review:** https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/opening-shift.html. Initial implementation `d47747856bbe598519d2b80f37c1f377175ba9b7`; verified runtime repair `989ec4be0b2199bbdcdc9c5d3aa461582da4eb26`. Both Pages workflows completed successfully. Actual school acceptance remains outstanding.

## Required evidence

| Check | Status | Evidence / limit |
| --- | --- | --- |
| Original0.6 persistence regression | PASS | 19 existing tests, `node --test tests/integration/persistence.test.js tests/qa/persistence-adversarial.test.js` |
| Old/new namespace coexistence | PASS | `tests/integration/namespaced-persistence.test.js`; independent lock, current/backup separation, clear leaves older save untouched |
| Opening Shift valid laptop/tablet routes | PASS — model | Both fixtures, both equipment plans; engineer and independent tests |
| Address failure and actual correction | PASS — model | Valid alternatives, duplicates/reserved/malformed/off-subnet; an already-valid inspection cannot invent earlier repair evidence |
| Unplugged uplink and unrelated IP edit | PASS — model | Physical error persists through IP edit; relevant repair and fresh test restore service |
| Both-room tests and stale evidence | PASS — model | Explicit player observations separate from engine checks; off-site nurse blocks handover |
| Both responsible policies | PASS — model | Actual staff workflow and required outsider denial; current privacy explanation context |
| Prices, returns, reset, practice and settlement | PASS — model | Exact ledger, no repeated refund/payment, practice no paid completion |
| New save round trip and damaged import | PASS — automated adapter/model | Current work unchanged on rejection; valid whole-state restore, nested corruption and old-save rejection |
| Full existing/new automated suite | PASS | Lead reran `npm test` after final repairs: **212 tests, 212 passed, 0 failed**, approximately 3.97 seconds in the container; includes 28 new engine tests and 26 independent tests |
| Integrated browser interaction | PASS — published desktop Chrome | Real controls used; installation, incorrect/malformed/correct address, access, both-room tests, explanations and settled handover |
| Published complete learner path | PASS — bounded path | Actual downloads inspected; damaged/valid import, reload with draft, reset cancellation/confirmation, two-tab takeover and preserved payment; changed physical-fault rehearsal also played |
| Original assets and state overlays | PASS — source/model/raster/published | 24 original SVG exports, manifest references, actual-view assertions and visible published scene/routes; no broken image elements in final DOM |
| Keyboard/focus/readability | PARTIAL — observed desktop paths pass | Export-dialog focus repair verified; Tab/Shift+Tab containment, Escape/return, tab arrow navigation and non-drag controls observed; no horizontal overflow at 1348px |
| Reduced motion, screen reader, 200% zoom, narrow layout | NOT RUN — browser | Source support exists, but actual behavior and assistive technology still require observation |
| Actual school Windows/browser/download policy | NOT RUN | Requires school device and network |
| Beginner comprehension and time to first useful result | NOT RUN | Small teacher-observed student pilot |

## Teacher walkthrough and small pilot

Begin with a teacher walkthrough of the published job and its evidence export. Check whether the task and budget are clear before accepting the job; whether the equipment and test controls are discoverable; whether a valid-address unplugged-link fault leads to a relevant diagnosis; and whether the handover distinguishes technical success from an explanation that still needs review.

Then observe three to five students on the actual school Windows/browser setup. Use anonymous observation notes only. Record where they hesitate, time to the first useful service result, help avoidance, use of the how-to guide, and whether they can explain why the other kind of fault needs a different repair. Try free practice before deciding whether the fictional help tariff improves play. Test school downloads, save/reload, shared profiles and keyboard/zoom use. These are planned checks, not claimed outcomes.

Stop the pilot for a false success, data loss, inaccessible required control or unrecoverable dead end. Keep existing0.6 work available and retain exported evidence while investigating.

## Independent findings repaired before publication

1. **Import conflict:** a valid import could replace memory before discovering a competing disk stamp, then incorrectly report success. Shared persistence now checks the stamp before mutation, preserving memory, backup and competing snapshot. The independent reproduction/regression passes; existing recovery tests remain green. The same preflight protects ordinary actions, recovery and clear.
2. **Free guide review after delivery:** UI disabled unopened consultations/hints even though the engine allowed free review. Consultation/hint guards now allow the frozen phase while preserving busy/read-only restrictions. Source, event-harness and published browser checks passed: a new section and hint opened for zero charge after settlement.

One independent test initially expected `SERVICE_STOPPED`; inspection confirmed the preserved engine's documented code is `SERVICE_UNAVAILABLE`. The assertion was corrected; production semantics were unchanged.

## Published review repairs

The lead reproduced focus escaping from the Progress evidence-download dialog to a duplicate background button. The interface specialist scoped focus restoration to the modal and the published retest passed. The simulation specialist corrected next-step guidance after delivery/payment. Draft-review wording was made accurate for a takeover with unchanged submitted text. These narrow changes preserved the save schema and existing network semantics; the full suite remained 212/212. See the published-browser record for observations and explicit limits.
