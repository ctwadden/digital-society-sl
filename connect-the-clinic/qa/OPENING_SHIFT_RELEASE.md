# Opening Shift release checks

Review version `0.7.0-review`. Lead record; independent findings live in `OPENING_SHIFT_QA.md` when produced. Date: 16 November 2026, America/Halifax.

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
| Full existing/new automated suite | PASS | Lead ran `npm test`: **212 tests, 212 passed, 0 failed**, approximately3.89 seconds in the container; includes28 new engine tests and26 independent tests |
| Integrated browser interaction | PENDING | Cloud browser cannot reach local server; published review required |
| Published complete learner path | PENDING | Actual service, error, repair, evidence download and recovery controls |
| Original assets and state overlays | PASS — source/model/raster; live pending | 24 original SVG exports, manifest references and actual-view state assertions; lead inspected clinic raster |
| Keyboard/focus/reduced-motion/readability | PENDING | Distinguish observed browser checks from source audit |
| Actual school Windows/browser/download policy | NOT RUN | Requires school device and network |
| Beginner comprehension and time to first useful result | NOT RUN | Small teacher-observed student pilot |

## Teacher walkthrough and small pilot

Begin with a teacher walkthrough of the published job and its evidence export. Check whether the task and budget are clear before accepting the job; whether the equipment and test controls are discoverable; whether a valid-address unplugged-link fault leads to a relevant diagnosis; and whether the handover distinguishes technical success from an explanation that still needs review.

Then observe three to five students on the actual school Windows/browser setup. Use anonymous observation notes only. Record where they hesitate, time to the first useful service result, help avoidance, use of the how-to guide, and whether they can explain why the other kind of fault needs a different repair. Try free practice before deciding whether the fictional help tariff improves play. Test school downloads, save/reload, shared profiles and keyboard/zoom use. These are planned checks, not claimed outcomes.

Stop the pilot for a false success, data loss, inaccessible required control or unrecoverable dead end. Keep existing0.6 work available and retain exported evidence while investigating.

## Independent findings repaired before publication

1. **Import conflict:** a valid import could replace memory before discovering a competing disk stamp, then incorrectly report success. Shared persistence now checks the stamp before mutation, preserving memory, backup and competing snapshot. The independent reproduction/regression passes; existing recovery tests remain green. The same preflight protects ordinary actions, recovery and clear.
2. **Free guide review after delivery:** UI disabled unopened consultations/hints even though the engine allowed free review. Consultation/hint guards now allow the frozen phase while preserving busy/read-only restrictions. Source and event-harness checks pass; live browser confirmation remains pending below.

One independent test initially expected `SERVICE_STOPPED`; inspection confirmed the preserved engine's documented code is `SERVICE_UNAVAILABLE`. The assertion was corrected; production semantics were unchanged.
