# Bootcamp published-browser observations

Lead review of `0.8.0-review`, project date 16 November 2026, America/Halifax.

Published entry: https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/opening-shift.html

## Scope and environment

These are actual interactions with the published GitHub Pages game in cloud Chrome, using visible controls. No browser-state injection supplied completion. The observed viewport was 1363 × 936. This is separate from Node tests, the interface event/string harness and independent source/artifact review. No student participated. School Windows, managed browser policies, real assistive technology and beginner timings were not observed.

The walkthrough began on runtime `2ea87fda63a3616a272911949def19f6c18ee68b`. Subsequent narrow repairs were published and checked during the same walkthrough: focus (`4946cd9`), training diagnostic names and hidden-input overflow (`90d23bd`), and withholding the final fault's answer from the checklist (`532e197`). The final modal-feedback/evidence patch and its focused recheck are recorded in the release record.

## Migration and new-player entry

- Reloaded the existing completed synthetic 0.7 clinic campaign. Its retained laptop, 44 equipment credits spent, 120 fee received, submitted explanations and tests remained present.
- Opened Bootcamp: 0/6 training tasks, with an explicit notice that earlier field work was preserved and had not earned training credit. Returned to the completed field job unchanged.
- Downloaded the migrated programme (149,019 bytes) before clearing only this synthetic review campaign through the visible confirmation flow. A fresh programme opened training with later lessons and field entry unavailable.
- Opened the equipment guide and examined the hardware and cable categories. The guide contains 12 cards. The original device/port illustrations rendered during the lesson route.

## Six-lesson route

| Lesson | Actual actions and observed result |
| --- | --- |
| Choose and power | Watched the three real mentor steps. Fresh practice began empty. Selected a desktop, eight-port switch and service host, powered all three, and recorded the task. Trainer activity had not completed it. |
| Connect and test | Watched the three steps. In fresh practice connected the workstation to switch port 4 and tested: `PORT_DISCONNECTED`, because the service-host link was absent. Connected the host through port 3, retested and passed. The earlier failure became stale. |
| Address and mask | Mentor network used `192.168.60.0/24`; practice used `192.168.80.0/24`. Wrong-subnet testing failed. Blank mask rejected without applying the new address. `192.168.80.47` with a valid `/16` passed this local service but did not satisfy the supplied `/24` task. An unapplied `.254` plus `/24` editor draft survived reload while the model retained `.47` plus `/16`. Applied `.254` with `255.255.255.0`, retested and recorded the task. Opened the free hint and `/24` explanation. |
| Wireless | Watched the five steps. Powered and associated the AP/mobile setup without an uplink: mobile service failed `PORT_DISCONNECTED`. Connected AP to switch port 4, tested in room A: task still unavailable. Moved to room B and tested: both room observations remained current and task became available. |
| Access | Tested the initial broad policy: staff service worked but unauthorized access kept the task incomplete. Chose `policy.nurse-also-books`; fresh tests recorded the required staff/nurse booking allows and outsider/workstation-workspace denials. Recorded the task. |
| Changed fault | No solved demonstration. Cancelled one reset, then confirmed a fresh attempt; prior five records remained. Recorded a mobile fault while Wi-Fi was associated. Changed the valid mobile address from `.30` to `.45` in `192.168.90.0/24`: the same physical-path failure remained. Connected AP Ethernet 1 to switch Ethernet 3 and ran fresh workstation/mobile tests: both passed. Completion remained unavailable until the explanation was saved. |

Typed a two-paragraph explanation, reloaded to check the unsubmitted draft, then saved it and recorded the sixth task. The explanation identifies the observed incomplete AP uplink, the unsuccessful address edit, the actual port-3 repair, both retests and the model's Internet/authentication limits. Its quality was not automatically graded.

## Persistence, recovery and evidence

| Check | Observed result |
| --- | --- |
| Applied configuration versus draft | Address editor draft survived reload separately from the last applied configuration. |
| Explanation draft | Exact two paragraphs survived reload before submission. |
| Practice reset | Cancel preserved the attempt; confirm began a fresh attempt and retained earlier completed records. |
| Two tabs | Second tab was read-only. Explicit takeover made the first read-only. A test in the second appeared when the first took control back; no silent competing writer. |
| Actual downloads | Progress JSON 97,815 bytes; readable evidence 3,413 bytes; evidence JSON 143,830 bytes. These were actual browser downloads, not files synthesized in place of clicking Export. Later readable-export improvements are checked separately below. |
| Downloaded data | Production validator accepted the downloaded progress. Regenerated evidence JSON and original TXT exactly matched the downloaded files. Independent artifact review verified six learner records, five separate trainer demonstrations, exact policy results, repair sequence and exact reflection; see `BOOTCAMP_EXPORT_CHECK.md`. |
| Damaged pasted import | Truncating the actual progress JSON was rejected; all six tasks remained. This exposed a visible-feedback defect: the error was announced outside the open dialog. A narrow interface repair was assigned. |
| Valid pasted import | Accepted the actual downloaded progress. Recalculated the same 6/6 task record, addresses, tests and field eligibility, with import provenance. |
| Native file selection/import | First automation attempt stalled and lost its tab binding. The saved campaign survived; reconnecting showed 6/6. A second attempt with explicit short timeouts selected the actual downloaded file, displayed its filename and successfully restored it. Tool wall time was unusually long, so this is functional evidence only, not a performance measurement. |
| Last good local backup | After importing the earlier pre-field download, restored the prior local snapshot through Progress → Recovery. Six training tasks remained and the accepted field job became resumable again. |

The source and mocked-adapter tests separately exercise malformed/forged replay, the byte limit, blocked storage and boundary cases. Those are not mislabelled as published-browser observations.

## Training-to-field handoff

Selected **Take the first client job**. A fresh client brief appeared, with 180 equipment allowance, zero spending, zero guide cost/time and no inherited training tests. The heading received focus. Opened the brief and accepted the job. Returned to Bootcamp: 6/6 records remained. Returned to the field: the accepted clinic workbench resumed, still with its own unpurchased kit and unrun tests; focus moved to its heading. Training did not complete the client job or earn income.

The full 0.7 client-delivery browser walkthrough remains historical evidence in `OPENING_SHIFT_BROWSER.md`. This increment rechecked entry, migration, return and preservation, not a second complete manual field delivery. Current automated tests do exercise the integrated course-plus-paid-field route.

## Accessibility and visual checks actually performed

- Keyboard Enter activated bootcamp start, power and connection controls.
- ArrowRight moved between tool tabs. Required operations used named buttons, inputs and selects, without precision dragging.
- Material-guide dialog supported Tab/Shift+Tab containment and Escape; focus remained usable after closing.
- Found focus loss after mentor/field remounts. After repair, actual mentor transitions focused `bc-mentor-heading`; actual entry/return focused the field H1.
- Found a visually hidden file input causing horizontal overflow. After repair its computed width was 1 pixel; document width did not exceed the 1363-pixel viewport.
- Training diagnostics now consistently say Workstation, Mobile workstation and Service host; exact model codes and exported records remain unchanged.
- Final task checks no longer identify the missing uplink before a learner inspects/tests. Diagnostic results and optional hints still explain their real cause.

## Final focused recheck

Runtime `e151fb4627f479e054d54c836f819f8ff0f6f52f` deployed successfully through Pages workflow run `44136116616` and was reloaded in the actual browser.

- Repeated the truncated-progress import. The rejection was visibly inside the confirmation dialog, not merely behind the backdrop or in the accessibility live region. Cancel/retry remained available and focus stayed on the active control. Cancel returned to the existing address demonstration with the six prior records intact.
- Opened a new import review: the previous error was cleared. Imported the complete original progress through the paste field; the same 6/6 record, repaired mobile `.45` setup and unstarted field were restored.
- Downloaded progress, readable evidence and detailed JSON again through their actual buttons. Final sizes: 97,821, 4,960 and 143,836 bytes respectively. The import provenance accounts for the small increase from the first export.
- Validated the final downloaded progress and compared both final evidence files to production regeneration: exact match. The new readable report includes actual equipment, port choices, address/mask, chosen access policy, twelve required results with room/freshness, physical repair and the unchanged reflection. Training remains financially zero and independent field work remains unstarted.
- Reopened the mentor's address example and left it ready to review. The visible diagram and wrong-subnet diagnostic agree. The final screenshot is `BOOTCAMP_ADDRESS_DEMO.jpg`; the six recorded tasks shown belong to the preceding synthetic campaign, not the replayed demonstration.

Final synthetic artifacts are retained in `bootcamp-sample/` and `BOOTCAMP_EVIDENCE_SAMPLE.txt`, with byte counts and SHA-256 hashes in `BOOTCAMP_DOWNLOAD_VERIFY.json`. `BOOTCAMP_IMPORT_ERROR.jpg` shows the repaired dialog. These files prove export fidelity for this synthetic route, not student identity, learning or classroom readiness.

## Remaining school acceptance

No claim of classroom readiness. Still required: managed Windows Chrome/Edge and school network; storage/profile cleanup and download/upload policies; keyboard-only complete route; actual screen reader; 200% zoom/narrow viewport; runtime reduced-motion preference; low-end hardware performance; teacher curriculum review; and a small beginner pilot. Proposed timings are planning estimates. The cloud file-selector interruptions must not be represented as student-task duration or a measured application slowdown.
