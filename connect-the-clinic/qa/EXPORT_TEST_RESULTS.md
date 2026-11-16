# Export verification — Connect the Clinic 0.6.0

Verified at 2026-11-16T11:11:09.958519+00:00.

## Automated result

- Command from this exported project root: `npm test`.
- Environment: Linux, Node.js v24.22.1; built-in Node test runner, no installed packages.
- **157 tests passed; 0 failed; 0 skipped; 0 cancelled.** Reported duration: 3,651.98539 ms.
- Scope: existing simulation, integration and independent QA tests, including network causes, source-state truth, faults/repair, evidence, imports, persistence, tab ownership and guided lesson behavior. Some browser behavior is simulated by harnesses; this run is not a real-browser or school-device observation.

## Export checks

- All 13 runtime files under `dist/` are byte-identical to the accepted original 0.6.0 project.
- All 20 files under `tests/` are byte-identical; imports and fixture paths remain intact.
- Two additional legacy developer playthrough JSON fixtures required by current tests are retained under their original `qa/browser-evidence/` paths. They contain synthetic QA explanations and no student submissions.
- Every included JSON file parses successfully.
- A scoped scan found no private Google Doc/Drive URLs, former hosting domain/project/deployment identifiers, authoring-machine paths, personal skill links, private-key markers or common GitHub/AWS token formats in the export.
- Source-document review retained original design explanations and bibliographic references; raw teaching packs, textbook files, source answer keys, screenshots and original Git history are not included.
- Runtime has no external API/asset fetches and uses relative modules/assets; its project-root entry redirects relatively to `./dist/` with a fallback link.

## Not yet verified in this export task

GitHub upload, Pages deployment, anonymous live opening, published-origin storage/recovery and actual managed school Windows behavior. The lead integrator owns publication receipts and the live browser checks. See `MIGRATION.md` and `qa/SCHOOL_PILOT.md` for the remaining walkthrough; this report is not a classroom-readiness claim.
