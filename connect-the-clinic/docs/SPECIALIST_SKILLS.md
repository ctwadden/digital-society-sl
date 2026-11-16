# Reusable learning-simulation specialists

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


These four personal skills were validated and applied during the **Connect the Clinic 0.4** revision. Their evidence comes from that revision’s design review, implementation and observed checks. This establishes a reusable working method; actual classroom use, school-device conditions and learner timing still require their own observations.

The lead continues to use the existing **Delegate** skill. Delegate coordinates the work; the four specialists define the quality required within their assignments. Small corrections can stay with one worker. A substantial simulation benefits from clear ownership and an independent reviewer after a playable result exists.

## How the lead coordinates them

The lead reads the teaching request and supplied sources, defines the smallest complete learning task, and owns the shared contract, architecture, integration and final acceptance. Each assignment names its inputs, editable files, prohibited changes and observable acceptance criteria.

Design establishes the learner decisions and evidence needs. Engineering publishes the action payloads, state and derived results before interface work depends on them. Interface and content work can then proceed within separate file ownership. QA checks the integrated result against the raw requirements and sources. The lead resolves disagreements using observed behavior, retains publication responsibility, and records what remains untested.

## 1. Learning Simulation Design

Open Learning Simulation Design (authoring-environment skill; use the role instructions below)

**Use when:** creating or revising a mission brief, bootcamp, I-can goals, graduated hints, curriculum connections, transfer task or teacher debrief.

**Role and inputs:** turn supplied course material into decisions learners can make, observe and explain. Supply the intended learner, prior learning, available lesson time, source material, current mission and model contract. Unmeasured timing and unavailable official outcome mappings stay explicitly unresolved.

**Owned outputs:** assigned instructional content and documentation: briefs, goal-to-action/evidence mappings, practice and changed-example directions, hints, stakeholder prompts and source-alignment notes. Content refers to actual model actions and observations.

**Acceptance:** review a successful route, a plausible mistake, a targeted repair and a transfer task that changes the cause or context. Explanations must address observed results and affected people. Distinguish a contract review from an actual playthrough; completion, help and money do not establish understanding.

**Reuse:** a media-production brief, resource-allocation mission or programming-debugging task can use the same decision → consequence → observation → explanation structure with its own subject sources.

## 2. Learning Simulation Interface

Open Learning Simulation Interface (authoring-environment skill; use the role instructions below)

**Use when:** building or improving resource panels, placement/connections, diagnostics, current goals, client messages, save feedback, evidence controls or the simulation’s visual presentation.

**Role and inputs:** make the real system legible and usable. Supply the model API, current UI, visual requirements, asset manifest, accessibility requirements and file boundaries. Keep 2D when it serves the learning; substantial 3D uses the existing dedicated scene specialist.

**Owned outputs:** assigned interface, styles and original assets/manifest. The interface dispatches actions and displays authoritative results; it does not calculate a second definition of success.

**Acceptance:** exercise the changed interactions with keyboard and non-drag controls, readable labels and visible focus. Preserve caret, drafts and logical dialog focus. Distinguish physical connection, tested success, failure and stale observations beyond colour. Show two or three current goals; check narrow layouts, zoom, reduced motion and truthful save/read-only status.

**Reuse:** replace clinic devices with editing resources, circuit components or production stages while retaining clear controls, stable identities and truthful feedback.

## 3. Learning Simulation Engineering

Open Learning Simulation Engineering (authoring-environment skill; use the role instructions below)

**Use when:** building or changing causal rules, entities, faults, diagnostics, progression, practice modes, evidence exports or save validation.

**Role and inputs:** maintain one authoritative model of what works and why. Supply the contract, existing project, source-backed domain rules, stable IDs, action/evidence requirements and any economy or compatibility constraints.

**Owned outputs:** assigned model/catalog code, derived selectors, meaningful domain tests, and API/model documentation. Publish interface changes before other builders rely on them; preserve existing valid work and explain migrations.

**Acceptance:** demonstrate a valid configuration, consequential failure reasons, targeted repairs, alternate valid routes and stale-test invalidation. Distinguish setup/demo actions from learner practice. Reject invalid actions/imports atomically; preserve truthful reasoning and pending oral items. Verify reload/reset and, where applicable, zero-earning practice and one-time settlement.

**Reuse:** model an energy budget, queue, algorithm, circuit or media workflow using explicit state transitions and documented limits. Change the domain rules and evidence requirements to fit the topic.

## 4. Learning Simulation QA

Open Learning Simulation QA (authoring-environment skill; use the role instructions below)

**Use when:** a playable build or consequential revision needs independent checks of causal accuracy, learning evidence, accessibility and recovery.

**Role and inputs:** try to disprove the build’s claims. Supply the raw request, contract, authoritative sources, current build and available test environment. Builder summaries do not substitute for inspection.

**Owned outputs:** assigned tests, reproducible findings and acceptance reports. Production repairs remain with their designated owners unless the lead changes ownership explicitly.

**Acceptance:** check valid and alternate routes, isolated failures, repair/retest, demonstrations, transfer evidence and learner words. Exercise save/import/reset, other-tab control, damaged input, draft recovery and safe exports. Report PASS, FAIL, PARTIAL, BLOCKED or NOT RUN with scope and evidence. Separate model/adapter tests, preview-browser checks, published-site checks and actual school observations.

**Reuse:** retain the review method across topics while replacing the scientific/domain assertions and learner tasks. Re-test fixes and their affected boundary, then stop optional expansion once agreed risks are resolved.

## Starting another topic

Give the lead the topic and sources, learner group, intended decisions, constraints, target environment and evidence the teacher needs. Reuse these role boundaries and shared-contract discipline; write new domain rules, scenarios and acceptance cases. Keep official curriculum mappings source-backed and leave assessment judgement with the teacher.
