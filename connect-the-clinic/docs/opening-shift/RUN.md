# Opening Shift — delegated implementation

Started 16 November 2026 (America/Halifax). Review build; school readiness is not claimed.

## Goal and inputs

Build one complete, original clinic job with meaningful equipment, diagnosis and access choices. Lead integrates and publishes; specialists own bounded files. Preserve the 0.6 game, its saves, source contracts and wearable mission.

Authoritative inputs: `../research/gameplay-review-2026-11-16/FIRST_CLIENT_MISSION.md`, `ORIGINAL_GAME_BLUEPRINT.md`, `CURRENT_GAMEPLAY_AUDIT.md`, `../SOURCE_ALIGNMENT.md`, `../../CONTRACT.md`, `../ENGINE_API.md`. Baseline GitHub main: `451b5dce4444dfd09188deaee3544787e9bd8717`. Existing static hosting and buildless JavaScript are retained; no new hosting, accounts or runtime AI.

## Roles and exclusive ownership

| Task | Role | Owned files | Dependency | Status |
| --- | --- | --- | --- | --- |
| T1 | Lead integrator | This run, shared contract, entry HTML, main adapter, persistence integration, operating guide, release | All inspected outputs | Complete for teacher review; published path played and evidence/recovery checked |
| T2 | Gameplay and simulation engineer | `dist/opening/engine.js`, `tests/opening/engine.test.js`, `docs/opening-shift/ENGINE_API.md` | Shared contract and existing causal engine | Complete; 28 model tests, integrated regression passed |
| T3 | Curriculum and mission designer | `dist/opening/content.js`, `docs/opening-shift/LEARNING_DESIGN.md` | Source alignment and mission | Complete; lead inspected and accepted for integration |
| T4 | Original graphics specialist | `dist/opening/assets/**`, `dist/opening/scene.js`, `docs/opening-shift/ART_REVIEW.md`, new manifest entries | Approved scene anchors and engine views | Complete; original assets/manifest, actual-state and raster checks passed |
| T5 | Interface and experience specialist | `dist/opening/ui.js`, `dist/opening/styles.css` | Engine API, content, scene contract | Complete; guide-review and published dialog-focus findings repaired and rechecked |
| T6 | Independent QA | `tests/opening/qa.test.js`, `qa/OPENING_SHIFT_QA.md` | Integrated build; owns no production code | Complete; 26 independent tests/report, two material findings repaired |

Use Delegate plus applicable learning-simulation skills. No further worker delegation or independent publication. Started with two builders. After the content was accepted and the exact engine API and scene interface were published, temporarily use three builders with disjoint files to remove the interface from the waiting critical path; this fits the four-agent runtime including the lead. A fresh reviewer follows material implementation and takes a freed slot. Initial attempt plus one focused repair; investigate and change approach after two failures. Inherited model configuration; actual per-worker model/effort and billing telemetry unavailable. No external model calls.

## Acceptance

- R1: Reuse the existing causal network model; one authoritative serializable state and dispatch path. Baseline reception stays operational.
- R2: Two fixture variants, two sensible equipment plans, exact reversible spending and no cash dead end.
- R3: Genuine address or uplink failure; physical failure persists through an unrelated IP edit; repair and fresh tests restore service.
- R4: Both rooms explicitly tested by the player; stale results cannot complete handover.
- R5: Two responsible access policies pass with distinct workflow consequences; broad access and deny-all fail for their actual reason.
- R6: Explanation text, decisions, purchases, tests and repair provenance exported honestly; no grades or mastery inferred from money/hints/completion.
- R7: Invalid import leaves current work untouched; valid round trip, reset, reload, one-time settlement, tab ownership and draft retention verified. Older game and saves preserved separately.
- R8: Visible devices/ports/paths, phone messages, keyboard/non-drag actions, visible focus, readable text and reduced motion.
- R9: Original assets only; no mandatory external service. Full published review played; actual school Windows and beginner pilot reported separately.

## Decisions

1. Preserve 0.6 unchanged and publish the new slice at `dist/opening-shift.html` with a separate save namespace. New and old evidence stay distinct; no automatic completion migration.
2. New mission wrapper reuses `dist/engine.js` for network actions and evaluation. It owns mission, shop, phone and evidence in one outer state. No second network truth in UI.
3. Use original lightweight layered 2D cutaway art. Small scene devices and a readable inspector; no 3D runtime.
4. Reuse the tested persistence adapter with an optional namespace while retaining its default for 0.6. Keep both recovery formats explicitly identified.
5. All prices, fees and simulated minutes are fictional teaching values. Help is free in practice, capped in the independent job; no real-time reading penalty.
6. Publish inside the existing course repository's `connect-the-clinic/` subfolder and retain its Pages workflow. The new job is the short project entry; the earlier bootcamp and saved work remain available at `dist/`. No hosting change or extra subscription.
7. Treat the published walkthrough as a bounded desktop result. Keep actual school Windows, assistive technology, zoom and beginner observations explicitly outstanding.

## Remaining checks

Implementation, automated checks and the bounded published walkthrough are complete. Teacher decisions: preparation/lesson duration, optional help tariff, quality of written/oral reasoning and exact source-aligned evidence-map IDs. Actual school/browser policies, screen reader/zoom/narrow-layout checks and the small student pilot remain untested. The live 0.6 build remains available alongside Opening Shift.

Current build: https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/opening-shift.html. Operating guide: `OPERATING_GUIDE.md`. Reusable role prompts: `WORKER_PROMPTS.md`. Detailed observed results: `../../qa/OPENING_SHIFT_BROWSER.md` and `../../qa/OPENING_SHIFT_RELEASE.md`.

## Milestone evidence

- Content syntax/import checks passed. Lead inspected exact student copy, distinct training example, source limitations and action/evidence mapping.
- Lead added optional persistence namespace without changing the old default. Nineteen existing persistence/recovery tests passed, plus a new coexistence/tab-lock test proving Opening Shift cannot overwrite or clear the older campaign.
- Browser extension connection unavailable in this session. Cloud browser is available, but cannot reach the local development server. Published-origin review remains required; this is not evidence of a school-browser problem or a reason to request a login.
- Lead integrated `npm test` passed **212/212** after independent review fixes. This includes actual new-validator persistence, recovery, both fixtures, alternatives, causal faults, evidence, returns and payment boundaries. Existing engine and interface source remain byte-identical; shared persistence gains namespace separation and a pre-mutation conflict check.
- The engineer repaired the lead-identified valid-address inspection loophole. The art specialist improved neutral-line contrast and prevents an A-room observation from being drawn as a B-room tested path. Independent QA found the import-conflict and frozen-guide UI issues; each received a focused repair and concrete recheck. No repeated ineffective fix loop occurred.
- Initial implementation published at `d47747856bbe598519d2b80f37c1f377175ba9b7`; only the clinic subfolder changed. The lead completed a paid laptop route using alternate switch port 4 and address `.47`, actual evidence/progress downloads, damaged/valid import, reload/drafts, two-tab takeover, reset and a changed cable-fault rehearsal. Practice did not overwrite the paid delivery.
- A focused published-review repair at `989ec4be0b2199bbdcdc9c5d3aa461582da4eb26` fixed duplicate-action modal focus and post-settlement guidance. The complete suite again passed **212/212**; the published focus/keyboard and next-action retests passed. Source/model/browser/school claims remain distinguished in the release record.
