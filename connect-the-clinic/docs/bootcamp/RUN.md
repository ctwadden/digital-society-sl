# Integrated bootcamp — delegated run

Started 16 November 2026, America/Halifax. Goal: teach the practical skills before independent clinic work. Existing baseline `0d6f52351fd72ad06c65634d0bc322cb9f311f50`; development copy preserves the published Opening Shift and all earlier work.

## Roles and work

| Task | Owner | Outputs | Status |
| --- | --- | --- | --- |
| B-LEAD | Lead integrator, Delegate | Shared contract, entry, programme adapter, field navigation, regression/published review and release | Active |
| B-CONTENT | Curriculum / mission designer | Student content and source-linked learning sequence | Complete: 6 lessons, 12 materials, 17 demo captions, 18 hints, source/teaching notes |
| B-MODEL | Gameplay / simulation engineer | Training engine, programme state, API and causal tests | Complete; empty-mask validation repair verified independently |
| B-UI | Interface / visual specialist | Training bench, mentor controls, accessibility and asset manifest | Complete; 69-action / 50-render non-browser UI harness passed; ownership released |
| B-QA | Fresh independent reviewer | Adversarial tests and findings only | Complete; 18 independent tests and source review; all 3 reported defects repaired |

## Decisions

1. Retain buildless JavaScript and existing GitHub Pages deployment; no new service, hosting account or paid AI.
2. Reuse existing causal network engine and original device assets. Training is a distinct bench; field clinic remains unchanged in its own nested state.
3. Six progressive lessons use real demonstrations followed by fresh practice. The final lesson changes the cause of failure. Training costs/earnings are zero.
4. New learners begin with training; existing validated field work remains resumable. Training completion is a task record, not mastery or an IB grade.
5. Practice addresses differ from demonstrations and the clinic; `/24` is taught with an explicit boundary on the shortcut.
6. One programme state and bounded replay validation preserve training/field provenance, recovery and old save migration.

## Source and acceptance

See `CONTRACT.md` B1–B8, existing `../SOURCE_ALIGNMENT.md`, and prior Opening Shift contract/API. Official outcome IDs remain unresolved. Model/effort/billing telemetry unknown; inherited authorized workers only. Start with two builders, then an interface specialist when the API is concrete; reserve a fresh QA slot. Initial attempt plus one targeted repair, then investigate rather than repeat.

## Verification and remaining gates

Model/content, interface and main integration are complete. Full regression: **257 passed, 0 failed** (see `../../qa/BOOTCAMP_AUTOMATED.txt`). Lead inspected an actual address demonstration render: trainer failure, correction and pass remain separate from learner completion. Two focused persistence tests passed (old field preservation, paid guide cost, read-only tab, damaged/valid import and reload). The interface event harness passed all six lessons and field entry. The actual prior published 0.7 progress download also migrated with the field object unchanged and no training award. Remaining release gate: published demo/practice/transfer/field transition, migration/save/reload/reset/import/export, keyboard, and clear limitations. Actual managed school Windows, screen reader/zoom and beginner timing remain separate unperformed gates.

## Coordination note

Started two builders. After the exact API was published and the representative address content was accepted, added the interface builder with disjoint files to remove the critical dependency. The completed curriculum worker then released a slot for fresh QA. No nested teams or paid provider calls. The first concrete independent defect was an empty/non-string mask silently inheriting the old mask through a legacy default; the training wrapper received a narrow validation repair, preserving core and field semantics. Independent source review also caught the eight-port switch inspector glyph and a near-cap progress export inflated by whitespace; both were repaired. The old source-only entry test now checks the new programme validator and retained nested field validator, preserving its validation gate.
