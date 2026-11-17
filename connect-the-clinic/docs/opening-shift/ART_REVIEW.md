# Opening Shift original art review

**16 November 2026 · America/Halifax · T4 graphics specialist**

## Delivered result

The new workplace is a continuous, original, lightweight 2D cutaway clinic. Reception, the equipment room, Exam A and Exam B share one floor and a consistent shallow diagonal projection. Walls, flooring, desk surfaces, furniture sides and small shadows supply depth. Reception has a seated member of staff, a booking desk and empty seating; the mobile nurse appears beside the current exam-room workstation. Neither staff pose nor furniture represents a simulated queue, wait, clinical outcome or successful service.

The art uses warm ivory, sage, teal, ink and coral. Computers and infrastructure sit at furniture scale. Larger recognizable device artwork is available for the HTML inspector. The clinic contains no remote-home inset.

### Owned deliverables

| File | Purpose |
| --- | --- |
| `dist/opening/scene.js` | Original pure SVG scene, glyphs, state presentation and normalized anchor helpers |
| `dist/opening/assets/manifest.json` | Stable asset IDs, source/export paths, view boxes, anchors, provenance, state variants, dependencies and fallbacks |
| `dist/opening/assets/clinic-shell.svg` | Original architecture, furnishings and reception staff source export |
| `dist/opening/assets/scene-opening-a.svg` and `scene-opening-b.svg` | Representative exports from the actual new engine's initial A/B views |
| `dist/opening/assets/scene-tested-route.svg` | Export after actual B uplink installation and a recorded nurse probe |
| `dist/opening/assets/scene-powered-off.svg` | Actual power-off presentation with the prior route suppressed as stale |
| `dist/opening/assets/device-*-on.svg`, `device-*-off.svg`, `device-*-selected.svg` | Desktop, laptop, tablet, server, four-port switch and access-point states |
| `dist/opening/assets/device-atlas.svg` | Device-state review sheet |

There are 24 SVG exports. The manifest registers 12 primary assets with their variants and five compositional components. Runtime rendering is approximately 20–21 KB of SVG for the supplied five-device fixture, produced by a 25,939-byte buildless JavaScript module. It requires no fetched art, custom font, bitmap, animation library or runtime service.

## Integration contract

```js
renderScene(view, { selectedDeviceId, selectedObservationId })
// Returns the complete supplementary SVG string, viewBox 0 0 960 620.

getDeviceAnchors(view)
// Returns { [deviceId]: { x, y } } in those scene coordinates.

renderDeviceArtwork(kind, { powered = true, selected = false, label = '' })
// Returns standalone decorative SVG, viewBox -54 -76 108 100.

SCENE_ANCHORS
// Frozen zone anchors matching the shared contract.
```

| Zone | x | y |
| --- | ---: | ---: |
| reception | 240 | 400 |
| examA | 670 | 235 |
| examB | 680 | 425 |
| equipment | 260 | 180 |

Within the equipment room, the host sits at `(191,218)`, switch at `(275,207)` and AP at `(370,208)`. Those device anchors are returned by the helper, so overlay controls do not need a second position table. Scene glyphs use 0.78 of the inspector-art scale. Room movement uses the supplied location; off-site or unknown locations receive no clinic anchor. The footer counts omitted devices without inventing an off-site connection.

Active equipment groups carry escaped `data-device-id` values. This supports optional pointer selection, while the actual named HTML device buttons remain the keyboard route. The SVG is `aria-hidden` and has no required SVG-only action, focus target or hover information. All essential settings, state and test messages must remain available as selectable HTML in the interface.

## State and evidence boundaries

- Power comes directly from `view.devices[].powered`. Off devices use a dark screen/lamp and an explicit **OFF** badge. The lamp never reports service availability.
- Solid slate lines represent existing `view.cables`; dashed slate lines represent an explicit `wifiApId` association. Neither is drawn green or treated as a successful test. The final slate stroke was darkened to `#526f75` after lead review for clarity when the scene is reduced.
- Gold highlighting requires an actual player observation with `stale === false`. Each highlighted edge must exist now and match its adjacent device IDs in the observation's alternating `pathIds` witness. Wi-Fi uses the returned Wi-Fi port ID. Installation alone never creates a highlight.
- The caption says whether the recorded test passed, confirmed an expected denial, needs attention, or is stale. A failed test with a real physical path can highlight that witnessed route without implying the requested service worked. An empty physical path produces no highlight.
- Nurse movement deliberately preserves the model's technical evidence. When the observation was recorded in a different room from the current source device, the scene suppresses its route and names the original room. It does not visually turn an A visit into a B test. This is a presentation distinction, not a change to the model's evidence or readiness.
- Stored equipment is drawn only from owned, uninstalled inventory. A compact shelf displays up to four items; the HTML inventory is authoritative for the full list. Stored equipment has no live device action ID or conducting cable.
- No readiness, repair, radio propagation, permission, economy, queue or clinical rule is calculated by this module. View-derived IDs, labels and observation text are escaped before SVG insertion.

## Verification observed

| Check | Observed result |
| --- | --- |
| JavaScript syntax | `node --check dist/opening/scene.js` passed |
| Actual initial A/B views | Rendered four and five devices respectively; A has no unowned AP; B has an association and stored uplink |
| Real B failure/install/test sequence | Missing physical route had no highlight; installation alone had no highlight; the explicit passing probe highlighted only its two cable IDs and real Wi-Fi port ID |
| Stale result | AP power-off left an OFF symbol and suppressed every recorded-route highlight |
| Room evidence | Moving A to B preserved model freshness but suppressed the A route; returning to A displayed the witnessed route again |
| Anchors | Shared zone values and nurse A/B device anchors matched the contract |
| Input handling | Markup-like labels and IDs were escaped; unknown and home locations were omitted; output was deterministic |
| Manifest | All source, export and variant paths resolved |
| SVG format/dependencies | All 24 SVG exports parsed through the installed SVG rasterizer; no script, embedded raster, foreign-object or external asset URL dependencies |
| Visual inspection | First representative clinic raster inspected before completing variants; final fixture B and six-device state atlas inspected after scale, seating and connection-contrast adjustments |
| Independent lead review | Lead reported inspection of an actual fixture-A scene raster exported through Inkscape and accepted its original visual direction; requested wire-contrast change was applied |

These are source, model-view, static-render and visual checks. The art worker did not run the integrated UI in a browser, test keyboard actions, publish a build or observe school hardware. The lead and UI/QA roles own integrated browser inspection, readable HTML at 200% zoom, narrow-layout controls and actual school/beginner checks.

## Provenance and process

The legacy visual and original-game blueprint documents informed only architectural lessons: a continuous setting, compact objects, separate inspectors and independent feedback layers. No legacy artwork, code, maps, sprites, logos, proprietary descriptions or character designs were reused. Repo-native vector authoring was appropriate for exact interactive geometry and stable device IDs; no image-generation or external model calls were used.

The worker applied the learning-simulation-interface skill, owned only the assigned scene/assets/review files, and made no global manifest, model, UI or publication changes. Actual model, reasoning-effort and billing telemetry is unavailable. This review does not claim classroom readiness.
