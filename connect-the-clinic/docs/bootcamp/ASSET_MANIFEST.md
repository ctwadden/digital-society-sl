# Bootcamp interface and asset manifest

Manifest ID: `manifest.bootcamp.training-bench.001`  
Course: `course.riverbend.field-ready.001`  
Review build: 0.8.0, 16 November 2026 · America/Halifax

## Ownership and entry points

The bootcamp interface owns `dist/bootcamp/ui.js`, `styles.css` and `scene.js`. The programme adapter owns navigation, authoritative actions, persistence and file downloads. Curriculum text comes from `dist/bootcamp/content.js`; network results and completion come from the engine.

- `mountBootcampUI(root, handlers)` returns `{render, showStatus, destroy}`.
- `renderBench(view, {selectedDeviceId, selectedObservationId})` returns supplementary SVG.
- `materialArtwork(material)` returns supplementary SVG for a material card.
- `deviceName(device)` supplies a training role label.
- `BENCH_ANCHORS` provides presentation coordinates, never network relationships.

Training actions are wrapped in `BOOT_ACTION`. Field entry sends `ENTER_FIELD`. The interface cannot independently finish a task, mark a test passed, repair a fault, charge money or set a programme completion flag.

## Visual direction

An original tabletop training bench uses the project's shallow diagonal device glyphs, an ivory/sage surface, dark teal text and warm orange focus. It is a training workspace, distinct from the client's clinic floor. The wired bench uses a compact `0 145 800 270` view box. Wireless lessons retain the upper row and use `0 0 800 415`, with named Room A and Room B positions. The 2D presentation requires no WebGL, downloadable fonts, raster textures or external image requests.

Device glyphs have a `-54 -76 108 100` source view box and display at 112 × 104 SVG units on the bench. Custom cable and interface drawings use `0 0 145 100`. All scale is illustrative. No diagram is a connector pinout or physical wiring guide.

## Asset inventory

| Stable asset ID | Generator / source | Visual states and meaning |
| --- | --- | --- |
| `asset.bootcamp.bench` | `scene.js: renderBench` | Empty supplied-equipment slots; wired bench; wireless bench with two named positions. |
| `asset.bootcamp.connections` | `scene.js: renderBench` | Neutral installed Ethernet; dotted Wi-Fi association; current recorded route; stale or other-room route omitted. |
| `asset.bootcamp.device.switch8` | Existing `opening/scene.js: renderDeviceArtwork('switch8')` | Original eight-port variant, powered on/off and selected. |
| `asset.bootcamp.material.ethernet` | `scene.js: materialArtwork` | Generic patch lead, modular plug and eight visible contact marks. |
| `asset.bootcamp.material.power` | `scene.js: materialArtwork` | Generic power lead, explicitly different from data leads; local mains plug designs vary. |
| `asset.bootcamp.material.usb` | `scene.js: materialArtwork` | Generic USB connector, differentiated from the modelled Ethernet cable. |
| `asset.bootcamp.material.display` | `scene.js: materialArtwork` | Generic display connector, differentiated from the modelled Ethernet cable. |
| `asset.bootcamp.material.router` | `scene.js: materialArtwork` | Conceptual router symbol with directed route arrows. Reference only; no router setup task is claimed. |
| `asset.bootcamp.material.interface` | `scene.js: materialArtwork` | Generic network interface card and modular socket. |
| `asset.bootcamp.mentor.jo` | `ui.js` and `.bc-avatar` | Text initial and named mentor, with demonstration/practice captions. No portrait dependency. |
| `asset.bootcamp.status` | `ui.js` and scoped CSS | Written Passed / Needs attention / Stale states with symbols; selection and power labels; no colour-only conclusion. |

Reused original project IDs are `asset.opening.device.desktop`, `asset.opening.device.laptop`, `asset.opening.device.tablet`, `asset.opening.device.server`, `asset.opening.device.switch4` and `asset.opening.device.access-point`. Their original provenance and source variants remain in `dist/opening/assets/manifest.json`. They are generated directly by `renderDeviceArtwork`; no duplicate binary files are introduced.

The twelve curriculum material cards reference these assets by `assetKind` or `cableType`, using the stable `boot.material.*` IDs in content. A future fiber schematic branch is unused by the current course and is not presented as taught content.

## Model agreement and accessible alternatives

Cables are drawn only from actual cable endpoint IDs. Device presence, power, address, association and mobile location are read from the supplied view. A route overlay is drawn only from a non-stale recorded observation whose mobile source still occupies the observation's room. Neutral lines and Wi-Fi association are not claims of service availability. Gold/coral route colour is supplemented by the written observation result, provenance and reason. Trainer observations are labelled as Jo's demonstration and never count as student evidence.

The entire bench SVG is supplementary, `aria-hidden` and non-focusable. Named HTML device selectors, native port selectors, connection lists, power controls, location buttons, IP/mask fields and test records provide the operational and reading alternatives. No learner must drag, aim at a port or wait through an animation. The model determines all task gates and the UI shows only the current lesson's two or three goals.

All new CSS is scoped under `.bootcamp-app`. Dialogs have a labelled modal role, background inert handling, scoped focus restoration, a Tab/Shift+Tab loop and Escape close. Controls use visible focus; motion is reduced under `prefers-reduced-motion`. Narrow layouts stack the mentor, bench and controls. These are implemented behaviours; actual browser and assistive-technology results belong in the lead's test report.

## Drafts, recovery and evidence controls

Unsubmitted address, mask, Wi-Fi and reflection drafts are keyed by programme campaign and training attempt and retained through ordinary rerenders. Accepted model actions remain separate. Draft backup uses session storage; failure is surfaced and a draft-rescue export remains available. Replacing progress or taking control marks surviving drafts for explicit review. Applying an address edit preserves a separate unapplied Wi-Fi choice.

The progress dialog delegates progress/evidence downloads, validated file imports, recovery, current-practice reset and clearing to the programme adapter. Replacements have a review dialog. A rejected import remains in its dialog and retains the existing model. Header navigation preserves drafts before the lead's fresh-host remount.

## Verification performed by the interface worker

- `node --check dist/bootcamp/ui.js` and `node --check dist/bootcamp/scene.js` passed.
- A temporary **non-browser string/event harness** exercised the real programme reducer through the mounted UI handlers: 69 programme actions, 50 render snapshots, all five UI phases, all six training lessons, all five trainer examples, fresh practice, both wireless room tests and independent field entry.
- The harness checked unplugged/wrong-address failures, then repair and fresh tests; completion followed only the engine's task conditions. It checked address draft retention across rerender, saved transfer explanation, all twelve material renderers, a rejected import handler retaining programme state, and listener cleanup on destruction.
- The harness's first reflection assertion required an explicit rerender because its fake nodes do not emulate a browser's live input value. After correcting that harness limitation it passed. This was not a browser result or an import-validation test; the actual validator is tested by the lead and engine worker.

## Still to verify in the integrated build

The lead owns actual published-browser checks: screen layout at 1366 × 768 and narrow/zoomed windows, keyboard and modal focus, native file import/export, damaged import recovery, draft remount, multiple tabs and field regression. Actual school Windows browsers, assistive technology and a small beginner pilot remain required before classroom readiness can be claimed. Hardware photographs, electrical assembly, cable pinouts, full router configuration, realistic radio physics and a professional network emulator are outside this bootcamp.

All new artwork is original vector code authored for this project. No Cisco branding, maps, screenshots, proprietary code or downloaded third-party assets are used.
