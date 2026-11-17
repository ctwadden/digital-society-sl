# Opening Shift — published browser review

Lead integration review on 16–17 November 2026 (UTC; project date 16 November, America/Halifax). All actions below used the published game and its ordinary visible controls. Explanations and exported records are **synthetic lead QA work**, not student assessment evidence.

**URL:** https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/opening-shift.html

Initial published implementation: `d47747856bbe598519d2b80f37c1f377175ba9b7`. Focus and phase-guidance repair: `989ec4be0b2199bbdcdc9c5d3aa461582da4eb26`.

## Environment and limits

Remote cloud Chrome browser; desktop layout, approximately 1350 CSS pixels wide. This was a real published-origin interaction, not a simulated DOM harness. No login was required. The browser-extension connection was unavailable and the cloud browser could not reach the local development server, so the lead tested the established GitHub Pages origin after its successful deployment.

This is not an actual school Windows device, school network, managed profile or screen reader. No beginner timing or classroom comprehension results are claimed. Automated tests, published-browser observations and school acceptance remain separate.

## Observed outcomes

| Case | Result and concrete observation |
| --- | --- |
| First entry and client brief | Original cutaway scene, phone-style client request and explicit Review job action displayed. Read brief, asked about nurse work and booking workflow, then began the independent client job. |
| Equipment and physical installation | Deliberately retained the existing laptop; purchased AP for 40 and cable for 4; installed and powered AP, connected its Ethernet port to alternate switch port 4, then associated the nurse's Wi-Fi. Allowance showed 44 spent and 136 remaining, separate from the 120 fee. |
| Actual address failure | Nurse test failed for the inherited `10.40.20.30` address outside the clinic subnet. Invalid `10.40.10.256` was rejected and its editor draft retained. A valid unused alternative, `10.40.10.47/24`, restored service. |
| Access and workplace tests | Explicitly retained separated responsibilities. Reception bookings passed, nurse workspace passed, nurse booking access was intentionally denied, and the restricted staff/outsider probes returned the required denials. Moved the nurse and recorded a fresh workspace test in room B as well as room A. |
| Reload and unsubmitted text | Reload restored equipment, costs and results. An unsaved equipment explanation remained available separately as a draft. |
| Two browser tabs | Second tab opened read-only with mutation controls disabled. Explicit takeover made the first tab read-only. Taking control back preserved the unsaved explanation; the UI required explicit review/replacement rather than silently submitting it. |
| Handover and payment | Saved equipment, repair and access explanations. Left the final limitation explanation as a draft, then used Save drafts & submit handover. Delivery reached 7/7 requirements; the exact text was included and the job frozen. Collected the 120-credit fee once. |
| Guidance after completion | Opened a previously unopened guide section after settlement. Its quote was zero; opening the section and revealing a hint succeeded without altering the frozen fee. |
| Actual downloads | Downloaded readable evidence, evidence JSON and progress JSON through browser download controls. Read the resulting files: actual failure, relevant address repair, both room observations, policy, transactions, exact explanations and one payment receipt were present. Engine checks were labelled separately from player observations. |
| Damaged import | Submitted truncated JSON through the import confirmation. Validation rejected it with “Current progress is unchanged”; the completed job remained. |
| Valid import | Imported the actual downloaded progress JSON through the same confirmation. Whole-campaign restoration succeeded with the same delivery, spending, explanations and payment; technical readiness was recalculated. |
| Cancel reset | Cancelled the reset confirmation. The completed independent job remained visible. |
| Reset after delivery | Confirmed reset. It opened a separate free rehearsal and preserved the frozen delivery/payment. |
| Different fault and transfer | Opened the changed rehearsal. Nurse address was already `10.40.10.30`; the uplink was disconnected. A service test failed for the incomplete Ethernet path. Changing the address to another valid address, `10.40.10.48`, did not fix it. Inspected and reconnected the actual uplink, then nurse service passed in both rooms. |
| Return from practice | Returned to the independent job. Original spending, frozen explanations, 120-credit payment and delivered state were intact; practice did not count as another client completion. |

## Defects found and focused repairs

1. **Dialog focus after export.** Progress → Download readable evidence restored focus to the similarly attributed Handover download button behind the dialog. The interface worker scoped restoration to the open dialog, provided a title fallback, focused openings synchronously and preserved the logical opener through nested confirmations. The initial immediate-AX observation of background focus alone was a timing artifact; the duplicate export target was the reproduced defect.
2. **Post-payment next action.** The game still prompted the player to request handover after settlement. The simulation worker now derives guidance from active/delivered/settled phase before considering outstanding objectives. Existing full-route tests assert the phase transitions.
3. **Draft review wording.** A control transfer could require draft review without the submitted text actually changing. The wording now asks the player to compare the draft with the saved record rather than asserting a change occurred.

## Published repair retest

The Pages workflow for `989ec4be0b2199bbdcdc9c5d3aa461582da4eb26` completed successfully. Reloaded the same saved campaign on the published origin and observed:

- Settled guidance now reads “Download your delivery evidence or open a free rehearsal.” The preserved job still shows 44 spent, 136 remaining and 120 credits received.
- Progress → Download readable evidence produced another actual download and kept focus on that button **inside the dialog**, despite the matching Handover button behind it.
- Tab from the last dialog button wrapped within the dialog; Shift+Tab from its first button returned to the last. Escape closed it and returned focus to Progress.
- Guides opened with focus immediately on its dialog heading. Escape worked. Cancelling the nested reset confirmation returned to Progress without resetting the job.
- ArrowLeft on the Handover tab selected and focused Access. Ordinary named port selectors supplied the non-drag connection alternative throughout the played mission.
- The final desktop DOM measured 1348 CSS pixels wide, with no horizontal page overflow and no incomplete or broken `img` elements. The original inline scene and status route were visibly present in the screenshots.
- The sampled console contained browser-extension metadata errors, all attributed to a `chrome-extension://` content script. No application-attributed error appeared in that sample; this is not an assertion about every possible runtime path.

Screenshots: [first entry](OPENING_SHIFT_WELCOME.jpg) and [completed synthetic QA job](OPENING_SHIFT_COMPLETE.jpg). The latter shows a test run and example explanation, not student attainment. The full path used actual game controls; no hidden state or completion flags were injected through the browser.

## Remaining school and teaching gates

- Actual managed Windows browsers, school networking, storage retention and download policies.
- Screen-reader operation, 200% zoom and narrow-screen interaction; reduced-motion behavior beyond source inspection.
- Teacher walkthrough of the brief, alternative equipment/policy path, export usefulness and the source-linked learning map.
- Three to five beginner students, with anonymous observation of confusion, first useful result, help avoidance and explanation of the different fault.

The full automated suite passed **212/212** after the repairs, including 28 new engine and 26 independent QA cases. That result supports regression confidence; it does not replace these outstanding classroom checks.
