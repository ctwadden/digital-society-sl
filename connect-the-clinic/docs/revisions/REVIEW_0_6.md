# Revision 0.6 — teach the first connection

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


Authorized by the teacher: “ok continue and execute.” Date: 15 November 2026, America/Halifax. Baseline source: `8cd300d818ff97fe322e82c34984823a1a2cdb28` (0.5.0 plus Aspire research). This is the implementation/run contract for the approved research proposal in `docs/research/ASPIRE_RESEARCH_AND_DESIGN.md`.

## Result and teaching scope

Build a small original guided connection lesson before independent equipment choice. A complete beginner sees Jo, a clear request, prepared powered equipment, and one missing cable. They choose real ports, connect, run a real booking probe, deliberately disconnect, observe the new result, repair/retest when needed, and give a brief explanation or arrange oral review. Then they enter the existing independent bootcamp. No full city, new routing model, new mission, account, patient data or paid runtime.

Visible goals: connect available network ports and test service reachability; explain how a physical connection and a working service differ. They are proposed student-facing formulations using existing internal source-aligned goals, not official outcome codes. The source of truth remains the engine; teaching steps cannot invent a network pass or failure. Timing and novice comprehension remain to be piloted.

## Owned files and dependencies

| Task | Owner | Exclusive edit paths | Dependency / status |
| --- | --- | --- | --- |
| Lesson copy/flow handoff | guided_lesson_design | docs/revisions/GUIDED_LESSON_DESIGN_0_6.md | Complete; original copy integrated |
| Guided model, provenance, validation, evidence | guided_connection_engine | dist/engine.js; tests/simulation/guided-connection.test.js; docs/ENGINE_API.md; docs/MODEL.md | Complete; API, implementation and focused tests integrated |
| Focused interaction and teaching copy | guided_connection_interface | dist/ui.js; dist/styles.css; dist/content/experience.js; docs/revisions/INTERFACE_0_6.md | Complete; source and browser corrections integrated |
| Original continuous workplace | Art specialist after first functional slice | dist/scene-art.js; asset-manifest.json; docs/revisions/ART_0_6.md | Complete; shared hooks, 17 scene outputs and scoped browser inspection |
| Persistence entry, version, integration, release | Lead | dist/main.js; dist/catalog.js version only; package.json; CONTRACT.md; docs/TEACHER_GUIDE.md; release/task/decision/run records; integration tests if needed | Own shared decisions and browser acceptance |
| Independent review | Fresh QA worker after integrated sample | tests/qa/guided-connection-0.6.test.js; qa/REVISION_0_6.md | Complete; 16 independent tests, repaired findings, separate final browser record |

Two simultaneous implementation builders initially. Hosted agents inherit model/effort. Four runtime slots including lead, at most three active workers. No recursive delegation or external model/API billing. Each worker gets initial pass plus one focused repair; after repeat failure investigate the cause. Exact token/cost telemetry unknown.

## Shared API (lead-approved starting contract)

### Fresh start and return safety

- Extend `createGame({guidedIntro:true})` to create the guided setup. Preserve `createGame()`'s independent-bootcamp API default for old integrations/tests. Lead changes the application persistence factory to request `guidedIntro:true` for **new/cleared** campaigns only. Valid saved campaigns resume their exact active attempt; no migration silently starts the lesson.
- Add `START_GUIDED_CONNECTION` to open a separate guided attempt from current work, saving its `returnAttemptId`. Protect that source attempt from compaction while the guided attempt uses it. Do not change client reservations, ledger, original work, or explanation drafts. UI uses existing flush/replacement boundary for switching.
- Add `RETURN_FROM_GUIDED_CONNECTION` to return to that saved source without claiming completion. For a brand-new campaign with no return source, a clearly labelled route may begin independent bootcamp without granting guided evidence; record the route honestly. An introductory lesson is teaching, not an academic gate.
- Add `FINISH_GUIDED_CONNECTION`, guarded by the engine's actual guided evidence checks. This returns to preserved source work when present, otherwise creates the existing station-one independent practice. It does not award any of the six bootcamp checkpoints or a client fee.
- `TRAINING_RETRY` and active-reset behavior must recognize the guided kind and open the same prepared lesson, preserving the original return target. Ordinary old bootcamp, full-clinic practice and delivered replay remain intact.

### Authoritative fixture and observation sequence

- Stable lesson ID `lesson.connection.001`; fixture `fixture.guided.connection.001`; separate `training.kind`/derived kind **`guided-connection`**. Exact stored stage spelling may be chosen by the engine owner and documented.
- One prepared powered reception **desktop**, powered switch and powered server with shared services enabled, valid local addresses and responsible access. Server is already connected to the switch. Reception has one free built-in Ethernet port. Trainer setup uses `mission-setup`, never player provenance.
- The student connects through ordinary `CONNECT_PORTS`. The first learning success needs a current player `RUN_PROBE {testId:'reception'}` passing through a real student connection; a demo or supplied connection cannot earn it.
- The guided experiment uses an actual `DISCONNECT_CABLE` after a passing observation. Identify a real path cable, preferably the reception cable. A fresh player reception probe records the actual resulting outcome. Old results become stale on technical changes.
- For the ordinary single-path setup, missing link must fail; a subsequent student connection and fresh passing retest establish repair. If exploration created another working path, accept/report the actual still-working route; do not force failure or misreport repair.
- The brief reflection uses `SAVE_EXPLANATION {key:'repair',text,oral}` in the separate guided attempt. Presence/oral-review request is recorded; quality and mastery stay pending teacher judgement. Do not overwrite the saved source attempt's explanations or mislabel a guided reflection as independent clinic fault evidence.
- All relevant action/observation witnesses must survive compaction and save/reload. Validate provenance, ordering, IDs, phase consistency and evidence; reject damaged guided data before replacing active state. Retain a bounded trustworthy summary/witness record so later clinic export can include the learning trail without unbounded history.

### Derived interface

`derive()` exposes `view.training.kind === 'guided-connection'` and a top-level **`view.guidedConnection`** object (null outside the active lesson). Engine owner may add fields but must publish an exact example before UI integration.

Required fields:

```text
lessonId, phase, canFinish, checks[{label,met}],
receptionDeviceId, switchDeviceId, serverDeviceId,
suggestedDisconnectCableId,
firstPass (observation or null),
experimentObservation (observation or null),
currentObservation (current reception observation or null),
experimentOutcome ('missing-path' | 'alternate-path' | 'other-failure' | null),
explanation {text,oral,...}, returnAttemptId
```

Starting `phase` set: **connect, test, experiment, test-disconnected, repair, retest, reflect, complete**. The engine derives the actual phase; UI selection, expanded tips and focus may be local presentation state. If a phase/API adjustment is needed, notify lead before other workers depend on it. Set `training.checks`, `canAdvance` and current goals consistently; do not display all clinic handover requirements during this guided activity.

The UI dispatches real connect/disconnect/probe/explanation actions. Ordinary cable feedback should name both actual device/port endpoints. It may select or suggest a free port visibly; it must never silently connect or configure equipment.

## Interface and visual requirements

- Open directly with Jo and one primary action to locate reception's port. No competing upcoming-client/add-computer prompts during this prepared lesson. Label the equipment as trainer supplied.
- Show only the two present goals and a short present instruction; keep the necessary explanatory sentence visible with the controls. Later tools remain reachable through **All tools**, but do not dominate the first action.
- Use a focused real-port selection form, clear endpoint names and the sentence that a cable uses a socket at each end. Buttons/keyboard are primary; no precision drag requirement.
- The new cable must be visible immediately in the scene with a named text result. Distinguish a connected cable from a current passing service trace. Scene lines use actual model endpoints; examples must be labelled examples.
- At each step show one primary next action and a short Jo response tied to the actual observed outcome. Explain the purpose of a test before its first use. Never claim an appointment was created.
- For a failed probe, keep the cause readable and permit repair. No dead end after incorrect ports, changed configuration, closed tools or fresh/returning save.
- Reflection is short, with the existing pending oral conversation alternative; preserve drafts across panel and mode changes. Evidence/export controls remain available.
- Keep visible keyboard focus, semantic labels, no colour-only meaning, reduced-motion support, and responsive 320px/200% layouts. Inspect the actual browser at desktop and narrow/zoom samples.
- After the functional loop works, integrate an original continuous 2D workplace with a shared floor and coherent equipment scale. No Cisco assets, branding, proprietary code or copied dialogue.

## Acceptance gates

| ID | Check |
| --- | --- |
| GC01 | Application fresh/cleared campaign opens guided prepared fixture; old saves resume unchanged, and guided help preserves return target and client costs |
| GC02 | Actual reception link and passing current service test required; no false success from phase, cable count, demo or supplied setup |
| GC03 | Unplugged route fails for missing path; incorrect address fails for address cause; repair plus retest restores service; alternate path remains valid |
| GC04 | Experiment/probe/explanation sequence and provenance agree in state, screen, save and teacher export, including after continuation/compaction |
| GC05 | Necessary instruction, endpoint feedback and cable/path remain visible at the point of action; one clear next action, two goals |
| GC06 | Complete guided loop works with non-drag/keyboard controls; error repair, reload, reset, damaged import and tab ownership remain safe |
| GC07 | Lesson ends into preserved work or independent station without granting bootcamp/client mastery, grade, or money |
| GC08 | Original visual assets load and the scene/status agree; local references/manifest stable; no new external service |
| GC09 | Existing mission, alternatives, bootcamp, ledger and recovery regression suite pass; independent QA findings resolved |
| GC10 | Teacher review build published to unchanged owner-private audience; school Windows and small unfamiliar-student pilot remain separately pending |

## Verification and publication boundaries

Managed browser preview is available for actual interaction. Published-origin gameplay previously met an institutional sign-in boundary; do not retry login, inspect SAML, use a bypass token or change audience. Use normal Sites source/deployment operations for the existing owner-private project, then report exactly which environment was tested. No claim of classroom readiness from automated checks.

## Run updates

- Planning: existing source and authorized research read; clean baseline preserved. Existing Site remains owner-only, no external viewers/groups. Deployment uses existing hosting; no new plan, subscription or service.
- Lead integrated the app-only fresh factory and version 0.6.0. Two meaningful persistence cases now target actual 0.5 campaign restoration and guided reload/damaged-import preservation; they await the engine implementation. Prior release report preserved as `RELEASE_REVIEW_0_5.md`.
- Designer handoff complete. Engine confirmed the required phase/view names and separate guided witnesses; UI implements against that shared API.
- Art hook agreed: optional `clinicFloorSvg({guided:boolean})` for a decorative continuous floor and outer walls; `roomFurnitureSvg(locationId)` for furniture only. UI owns `.continuous-clinic`/`.clinic-floor-art`, real devices/ports, room placement and separate home. Old `roomDecorSvg` remains fallback. Art begins after the first functional slice.
- Next: finish first integrated loop, then art, independent QA and actual browser verification recorded in `qa/BROWSER_0_6.md`.

- Final integrated acceptance: guided optional/fresh routes, actual failure/repair, exact source return, save/reload, reset, valid/damaged pasted import, multiple tabs, 200% form use,337px List reflow, original full-clinic/home scene and fresh independent first success observed. Full 0.6 six-checkpoint/client playthrough not claimed; actual 0.5 completed save restored and preserved. See qa/BROWSER_0_6.md.
- Final required gate: 157/157 passed; 12 real-download comparisons; 33 unique asset IDs, 28 generated output hashes, 37 source hashes and 11 relative imports verified. Native private publication is the remaining release operation; published-origin/school/pilot gates stay pending.

- Native publication succeeded at [original restricted review host omitted]: deployment `[legacy platform identifier omitted]`, saved source `14836b5594a028f10fce4b12b3edfe6628cfa0a6`. Existing owner-private audience retained. GC10 teacher-review publication is complete; published-origin gameplay and student/school rollout remain pending. Receipt: qa/DEPLOYMENT_0_6.json.
