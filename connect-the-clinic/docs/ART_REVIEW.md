# Art and interface review — Connect the Clinic 0.4

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


Status: original assets and model-backed interface checks pass. Actual source and published browser review are separate lead-owned gates; this interface worker has not run a browser or school device. No classroom-readiness claim.

## Implemented sources and ownership

This revision changes `dist/ui.js`, `dist/styles.css`, `dist/art.js`, `asset-manifest.json` and this review. It preserves the draft store integration, draft rescue, focus identity/caret restoration, nested-dialog return trigger, read-only explanation handling and replacement guard already present in `ui.js` when this work began. Engine, catalog, content, entry, persistence and independent QA are owned by the other revision workers.

The illustration module supplies ten known equipment kinds and a neutral fallback: desktop, laptop, tablet, server, wearable, four-port switch, eight-port switch, access point, Ethernet adapter and sensor-transfer dock. These remain original code-native SVGs. No third-party artwork, branding, image requests, runtime dependency, 3D scene or external asset service was introduced. `ART_VERSION` is `0.4.0`; the visible build label comes from the engine-owned catalog `BUILD_VERSION`.

Every device uses a 120 × 100 viewBox. The desktop and dedicated server now each have one visibly drawn, inertly annotated Ethernet opening. The four/eight-port switches show four/eight; the access point and Ethernet adapter each show one. Laptop/tablet/wearable drawings do not invent built-in Ethernet. The sensor dock has no Ethernet opening. Decorative openings never create functional ports.

`asset-manifest.json` records generated output hashes, source hashes, source/generator names, dimensions, static/derived variants, original provenance, licence status and fallback behavior. The earlier proposed standalone assets remain individually reconciled; no old file path has been fabricated. There is no separately declared project redistribution licence.

## Room map and real connections

The original 2D clinic remains the visual foundation. A semantic room grid makes it possible to display actual device locations without overlapping fixed coordinate slots. Reception, equipment room and exam rooms sit within `.clinic-building`. The `.remote-site` home region is a separate sibling below and outside that boundary. The separation is visible and labelled in normal DOM text. List view gives the same location facts, including an explicit separate home group.

Each actual engine port is rendered with its stable port ID. Filled and hollow squares distinguish a cable-connected Ethernet port from an empty port; radio capability/association has a separate label. Inspect gives the full stable IDs, and Connect uses labelled device/port selectors. No small chip, dragging gesture or precision pointing is required for a connection.

`drawSceneConnections` measures these port anchors solely to lay out the paths. It draws neutral solid lines from `derive().cables` and dashed saved Wi-Fi associations in the engine's named clinic radio rooms. Resizing redraws geometry; it never changes an action, result or readiness. Device and role names, actual kind, power and port facts are separate text rows. A four-row card grid and a fixed SVG frame were added after the lead's first cloud-Chrome screenshot showed artwork overlapping its role label. The lead then confirmed the correction in cloud Chrome at approximately 1,348 px viewport width: art, role, kind and power occupy distinct rows, with Reception art ending at 591.8 px and its role label beginning at 595.8 px. This is the lead's observed browser result; this worker did not run that browser session.

The map does not draw a clinic radio path to a device at home. A saved association there remains visible as a configuration fact with an explicit no-radio-path note. The wearable journey continues to distinguish offline collection, return, sensor handoff and network upload.

## Latest observed path

The newest item in `derive().diagnostics` supplies the latest-test panel. Its `pass`, `expectedDenied`, `code`, `stale`, `testedTechnicalRevision`, `sourceDeviceId`, `contextLocationId` and `pathIds` remain authoritative. UI text distinguishes **current pass**, **current failure**, **stale earlier pass/failure**, and **not tested**. Tested and current technical revisions are both printed. An intended denial is described as a passing result only when the engine's `pass` is true.

Path overlays match the exact alternating device/edge/device triples in `pathIds`. A cable must still exist with those exact endpoints to receive an overlay. Radio edges use the engine's device Wi-Fi port ID. Empty `pathIds` produces no invented service path. Failure after an address check can still show its actual physical path, with a failure trace and the engine's reason.

Stale observations are explicitly historical. Only their still-existing links are overlaid; removed components remain in the textual record by exact identifier. A contextual test names its room while the map retains current device locations. Physical lines never imply service success. Solid, dashed and dotted observed traces are accompanied by text and a legend.

## Learning focus, transfer and practice controls

The engine selects `learningFocus.stageId`, `title`, `goalIds` and `nextAction`. The interface resolves those IDs against `learning.ICAN_STATEMENTS`, renders the two or three current statements, and prints the supplied next action. It does not calculate a stage or invent mastery. The full learning map and the full practical checklist are separately available as collapsed disclosures.

Training presentation uses the explicit `training.kind` values `bootcamp`, `clinic-practice` and `delivery-replay`; client mode has no training kind. Full clinic practice and delivery review do not display bootcamp station advancement or demonstration controls.

The new teacher-selected clinic practice control dispatches `START_CLINIC_PRACTICE` without a payload. It visibly states free guidance, zero earnings, a separately saved client job, and that this is a local classroom setting with no teacher authentication/access restriction. Reset uses the existing draft-safe reset handler. `RETURN_TO_CLIENT` resumes the saved client attempt. No settlement control is shown in a training attempt.

For station 2's explicit `physical-uplink` transfer, **Explain this repair** opens a focused repair field using the existing per-attempt `repair` key. Its question and hint ladder come from `learning.UPLINK_TRANSFER`. The oral option explicitly remains pending teacher review. Text presence is not described as a quality grade. Client explanations live in a different attempt and are not overwritten. `legacy-address` saves retain `learning.LEGACY_ADDRESS_TRANSFER` instructions and do not claim the new physical-link task.

Attempt changes now share the existing unsaved-draft boundary, including practice entry, return to client, bootcamp entry, demo, retry, next station and client start. A pending address-form draft offers rescue, discard-and-continue or cancel. Cancelling retains both the current attempt and the draft. Rejected transitions do not clear drafts. Only accepted replacement clears them after the user's explicit discard decision when necessary.

## Checks actually executed by this worker

Environment: container Node ES modules; a deliberate DOM/geometry stub for generated markup, event handlers and model integration; Python standard-library XML parsing. This is not a browser layout or accessibility test.

| Check | Observed result |
| --- | --- |
| `node --check dist/ui.js` and `dist/art.js` | Pass |
| Ten known device SVGs plus unknown-kind fallback | Pass: all parse as XML; all use the 120 × 100 frame |
| Script/event/remote href/src references in generated art | Pass: none |
| Decorative Ethernet openings | Pass: desktop 1, server 1, switch 4/8, AP 1, adapter 1; laptop/tablet/wearable/dock/fallback 0 |
| Favicon XML | Pass |
| Initial learning focus, optional full map, version and home boundary | Pass in model-backed markup; three supplied goals displayed |
| Current pass, stale pass and current address failure | Pass: exact observed edge IDs and distinct labels |
| Disconnected failure with no complete path | Pass: no observed overlay; remaining physical cables still visible |
| Practice transition with unapplied address draft | Pass: guard appears, cancel retains rescue/current attempt, explicit discard proceeds |
| Practice/client isolation in UI handlers | Pass: full practice has free/zero-earning text and no station/settlement controls; original client attempt remains identical and resumes |
| Nurse moved home with a saved association | Pass in model-backed geometry: no clinic radio line; saved association fact retained in text |
| New uplink transfer controls and hints | Pass: one repair field, pending oral label, targeted free hints |
| Imported 0.3 address-transfer presentation | Pass: original address task retained; no new-uplink claim |
| Corrected device-card vertical spacing | Lead confirmed in cloud Chrome at approximately 1,348 px; separate art, role, kind and power rows with no overlap |
| Actual browser keyboard, focus/caret, dialog return and resize | Not run by this worker; lead integration gate |
| Actual 320 px layout, 200% zoom, contrast and reduced motion | Not run by this worker; lead integration gate |
| File import picker/download policy and multi-tab UI | Not run by this worker; lead integration gate |
| Actual school Windows/Chromebook and assistive technology | Not tested |
| Beginner timing/student pilot | Planned, not measured |

The model-backed renderer/handler harness used for these checks is an intermediate scratch file, not a production dependency: `[original local working path omitted]`. No independent QA suite was edited by this worker.

## Accessibility and review boundaries

Controls remain semantic buttons, forms, selects, labelled textareas and disclosures. Labels are DOM text rather than embedded SVG lettering. Normal keyboard operation and the existing visible-focus/reduced-motion rules are retained. The new map has no animation. At narrow widths its detailed map scrolls inside its own labelled region, while List view provides the non-spatial alternative. Actual focus/caret and zoom behavior must be observed, not inferred from these source facts.

Unknown device artwork returns a neutral SVG and still has adjacent device/role text. Hiding the illustrations leaves the labels and controls. Complete failure to load the art JavaScript module is a different application-loading boundary and has not been claimed as covered.

The lead should record the exact source and published build under test, verify the corrected device-card spacing, inspect real physical and observed paths, exercise transfer and mode-change drafts through the UI, and keep school-device and student-pilot observations separate. A source pass or polished screenshot alone does not establish classroom readiness.
