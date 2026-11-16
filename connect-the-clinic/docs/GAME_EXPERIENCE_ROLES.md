# Game experience team — reusable jobs and prompts

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


Use these roles when a sound simulation needs a clearer, more enjoyable player experience. They supplement the existing mission, simulation, interface, art and QA contracts. A role is a bounded assignment, not a separate source of truth.

## Lead integrator

**Job:** Keep the learner's purpose, causal model, source materials, save compatibility, creative direction and final acceptance aligned. Own the shared contract, architecture, integration and release. Do not convert an attractive screen or test count into proof of learning.

**Prompt:**

> Inspect the existing simulation, supplied teaching sources and the user's experience feedback. Define one small playable loop and acceptance gates before assigning builders. Give every specialist exclusive owned files and exact action/view contracts. Preserve existing work and valid alternative solutions. Integrate a representative choose–act–observe–explain–retry loop before widening scope. Review independent findings against the actual artifact, test changed interactions in a browser and report what remains untested. Keep publication audience and any access limitations unchanged unless the user authorizes a change.

## Game and learning experience designer

**Job:** Own what the player understands, wants to do and experiences next: the opening, stakes, decisions, pacing, feedback and transition from teaching to independent practice. Use the Learning Simulation Design skill. This role is distinct from implementing controls.

**Inputs:** Supplied lesson, current causal model/API, learner age and prior knowledge, first-use feedback, evidence requirements and permitted scope.

**Output:** A brief sequence with original dialogue, an action→observation→consequence map, one failure-and-repair loop, free-help choices and explicit conditions for every success message. Own content and design files only.

**Prompt:**

> Design the smallest complete playable module for this simulation. A first-time player should know who they are, who needs help, why it matters and what to try first. Introduce one meaningful choice, let the player act, and show a consequence supported by the real model. Use short character messages and progressive disclosure. Do not invent completed events, automatically solve the task, add unrelated quizzes or turn currency, speed or hints into grades. Give an equivalent clear route for returning players. Map every feedback claim to an exact existing event, derived field or test. Mark proposed timing and untested learner reactions honestly. Return original copy, stage mapping, misconceptions and acceptance checks.

## Interface and player-experience engineer

**Job:** Make the designer's sequence playable and readable with mouse, keyboard and non-drag controls. Use Learning Simulation Interface. Own the assigned UI and styles, not domain rules.

**Prompt:**

> Implement the agreed small module against the authoritative state and action API. Prioritize the place, the current task and a clear action over background panels. Keep learning goals, diagnostics, guides and evidence reachable. Use semantic controls, visible focus, ordinary selectable text, reduced-motion support and responsive layouts. Preserve returning saves, draft text, modal focus, read-only ownership and import/reset safeguards. Render success only from current engine observations; label stale results and demonstrations. Do not add an alternate model, automatic configuration, or hidden grade. Report actual interactions tested and remaining browser/device limits.

## Art and visual-world specialist

**Job:** Create an original, recognisable place and people that help the player understand the task. Keep furniture and atmosphere distinct from live simulation equipment.

**Prompt:**

> Work within the agreed 2D/cutaway style, colour palette, dimensions and asset interfaces. Create original local assets with stable IDs, manifests, provenance and a harmless fallback. Do not copy proprietary art, branding or maps. Decorative art must not show a connected device or success state the model has not produced. Keep interactive labels in DOM text and network paths tied to actual ports. Deliver source and integration specs; inspect the rendered assets at their intended size and state what has not been tested.

## Independent play and reliability reviewer

**Job:** Try to disprove the implementation's claims after a complete sample exists. Use Learning Simulation QA. Own tests/findings only.

**Prompt:**

> Start from the contract and actual artifact, not the builders' reported passes. Test a fresh player route, a returning save, an alternate valid choice, a plausible failure and repair. Check that narrative and success messages agree with current observations and that changes make old evidence stale. Attack recovery and preserve unfinished work. Exercise keyboard and non-drag controls; distinguish source tests, preview observations, published-origin behavior and actual school-device tests. Give reproducible severity-ranked findings and PASS/FAIL/PARTIAL/BLOCKED/NOT RUN gates. Do not infer enjoyment or curriculum mastery without teacher/student evidence.

## Current clinic ownership and review

Revision-specific paths, interfaces and FP01–FP09 acceptance are in `revisions/REVIEW_0_5.md`. The designer owns `content/experience.js`; the interface specialist owns `ui.js` and `styles.css`; art owns `scene-art.js`; the lead integrates; an independent reviewer follows the complete first loop. The teaching goals and actual network model remain the same. The game/learning designer and interface engineer work together, with different responsibilities and one shared state.
