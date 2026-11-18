# Jobs and dispatch order

Claude Code is the department head: it owns product direction, shared contracts, integration, baseline/test registration, release and final acceptance. Codex workers perform the bounded jobs below. Paths are relative to `connect-the-clinic/` and are proposed ownership until Claude activates an exact allowlist in a task packet.

| Job / prompt | Responsibility | Proposed owned files | Must receive first |
| --- | --- | --- | --- |
| [01 Gameplay](jobs/01-gameplay.md) | Enjoyable apprenticeship, mentor/phone events and distinct visits | `docs/apprenticeship/GAMEPLAY.md`; `dist/apprenticeship/story.js` | Teacher correction, current capabilities and event contract |
| [02 Curriculum](jobs/02-curriculum.md) | I-can goals, mentor teaching, misconceptions, source connections and transfer | `docs/apprenticeship/LEARNING.md`; `dist/apprenticeship/learning.js` | Supplied sources, current model constraints and visit outline |
| [03 Simulation](jobs/03-simulation.md) | Authoritative network/progression behavior and meaningful tests | `dist/apprenticeship/engine.js`; `tests/bootcamp/apprenticeship-engine.test.js`; scoped API notes | Lead-approved action/state/event/provenance contract |
| [04 Interface](jobs/04-interface.md) | Scene interaction, device controls, phone/mentor presentation and accessibility | `dist/apprenticeship/ui.js`, `scene.js`, `styles.css` | Working model API, content IDs and art anchors |
| [05 Art](jobs/05-art.md) | Original visual direction and integrated-ready assets | `dist/apprenticeship/assets/`; its manifest; `docs/apprenticeship/ART.md` | Scene composition, meaningful objects and UI sizing contract |
| [06 Recovery/evidence](jobs/06-recovery-evidence.md) | Compatibility, safe recovery and faithful teacher summaries | Explicitly leased persistence adapter files; registered tests; `docs/apprenticeship/SAVE_COMPATIBILITY.md` | Versioned state/serialization contract and legacy fixtures |
| [07 Independent QA](jobs/07-qa.md) | First-player route, technical/learning/access/recovery checks | Read-only review by default; separate assigned `qa/apprenticeship/` or test files if writing | Integrated runnable build, raw requirements, fixtures and sources |

The default lead-owned files include the shared contract and `RUN.md`, `dist/opening/programme.js`, `dist/opening/main.js`, entry HTML, `package.json`, global manifests and release records. Claude may explicitly transfer one to a worker for a bounded task; record when the lease begins and ends. Simulation and recovery must not concurrently change programme serialization.

## Execution sequence

1. **Inspect and establish the baseline.** Claude checks current work, tests, launch route, available tooling and existing hosting. Confirm Codex preflight. Keep this focused on implementation needs.
2. **Two short design jobs.** Gameplay and curriculum produce the first encounter's choices, teaching and evidence. Claude supplies enough shared outline that they can work independently, then reconciles them. These are compact build inputs, not a new research phase.
3. **Agree the minimal contract.** Claude approves stable IDs, model actions/events/selectors, demo/learner provenance, save boundary, scene dimensions and asset anchors for one interaction.
4. **Simulation and representative art.** Build the hard causal loop with placeholders while art creates one original scene/device set under the same contract. Inspect assets before expanding them.
5. **Interface and continuity.** Interface integrates the published model/content/art. Recovery works on separate leased files after serialization is settled; if files overlap, serialize the work. Claude owns entry integration.
6. **Independent QA of the real segment.** Review arrival, choice, fault, help, repair, visible consequence and reload/evidence. Repair concrete failures. Claude personally checks game feel in the browser.
7. **Complete the apprenticeship.** Reuse the accepted conventions for different second/third visits, earned truck and the existing first solo job. Repeat only checks needed for the remaining risks, then verify the published review build when released.

At most two builders start together. Use more only for an explicit dependency/capacity reason within the actual runtime limit. The seven roles remain available for bounded later tasks; they are not seven always-running departments.
