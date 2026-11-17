# Legacy visual architecture: inspected assets and original design specification

**Status: static archive inspection, 16 November 2026 (America/Halifax).** Source: the user-supplied `Cisco Aspire Networking Academy Edition.zip`, identified by the integrator as Academy 1.1.6.28. Paths below are relative to its `Cisco Aspire Networking Academy Edition/` root; `__MACOSX` entries were excluded. Selected images were viewed privately. No legacy executable was run, no proprietary artwork or dialogue is included here, and no source asset was added to our application. This report distinguishes inspected appearance, filename evidence and unverified runtime behaviour.

## What the files actually establish

| Evidence | Inspection and significance |
|---|---|
| `gamedata/scenarios/cana/Contracts/V2C1/VenueMedical-AllWhite.png` | **Viewed:** a 2000×2000 RGBA cutaway workplace background. Examination beds, reception, chairs, counters, plants, walls and consistent shadows are baked into the image. Network devices are absent. The diagonal perspective creates depth without proving live 3D rendering. |
| `gamedata/help/default/images/aspire_medicalOffice_1.jpg` | **Viewed:** a 1040×738 historical help screenshot showing that medical setting with small labelled network devices over furniture. Scrollbars indicate a scene larger than its visible region. This supports background/device separation; it is not a runtime camera test. |
| `gamedata/help/default/images/aspire_phone_1.jpg` | **Viewed:** a handset/contact interface overlays a city scene, while character metrics and a day timeline remain visible. Tabs distinguish missed calls, recent calls and contacts. Their appearance does not establish every button’s runtime behaviour. |
| `gamedata/art/phone/Phone_BG.png` | **Viewed:** a 301×483 handset shell with an empty screen. Separate call, answer, ignore and button-state images occur in the same directory. Content and interaction states were evidently separate assets; their complete composition rules remain unverified. |
| `art/PhysicalView/Devices/iRealServer.png` | **Viewed:** a 1010×443 detailed server front illustration. Other filenames include workstation, laptop, switch front/back and separate power indicators. Detailed inspection artwork exists alongside workplace views. This does not establish an interactive computer-disassembly system. |
| `gamedata/art/CityView/GB_BadgeContractIconRotate/MedalGenericRotate_00000.png` through `_00029.png` | **Inventory:** 30 numbered images. Other contract/home icon sequences also contain 30 frames. Names suggest rotation or activity animation; playback speed, triggers and continuous animation were not observed. |
| `gamedata/art/contractView/` | **Inventory:** technical-workspace toggle, edit-workspace, pause, timer, client-holder and dialogue-manager assets. These suggest context switching between client/contract and technical work; exact transitions require a playthrough or independently verified flow definitions. |

## Architecture lessons, with limits

**Depth comes from composition.** The inspected clinic background supplies a coherent place: furniture shares a scale, walls reveal internal rooms, and shadows establish depth. Devices can then occupy believable desk positions. Our browser pilot can obtain this spatial clarity with original layered 2D artwork. Matching the legacy camera angle precisely is unnecessary.

**Different tasks deserve different scales.** A small router belongs on the desk in the workplace view. Its ports, cable sockets and configuration require a larger inspector. The server illustration demonstrates that detailed equipment artwork was packaged, while the phone screenshot demonstrates a separate communication surface. This is evidence for multiple presentation contexts, not proof of their complete navigation rules.

**Feedback deserves its own layer.** Separate power artwork and named button states suggest deliberate visual state variants. Our implementation should derive power, physical link, service availability, access policy and stale observations independently from the authoritative model. A decorative LED must never establish connectivity. Use DOM controls and text instead of encoding essential labels or focus into bitmap buttons.

**A busy archive is not a proven game loop.** City roads, trees and building assets suggest layered map composition, but their layout descriptors were not decoded. Three sampled `.dat`/`.dath` files did not decode using a straightforward zlib attempt; this does not establish encryption or a particular format. A venue file can occur in a contract folder without being loaded by that contract. No animation timing, walking-avatar behaviour, accessibility, performance or modern Windows compatibility was established here.

## What to preserve and change in our clinic

The [current evidence screenshot](evidence/repeated-setup.jpg) already shows a continuous clinic floor, recognisable furniture, labelled equipment ports, a next-task panel and a legend separating cable, Wi-Fi, pass/fail and stale observations. These are useful foundations. The [asset manifest](../../../asset-manifest.json) identifies original vector art and DOM labels; the [engine API](../../ENGINE_API.md) keeps outcomes in the engine.

The visible weakness is scale and emphasis: large rounded equipment cards dominate the furniture, so the workplace can feel like a background behind controls. Place compact recognisable equipment directly on desks; expand details on selection. Make the client request, location and affected person immediately apparent. A reception task can visibly remain pending until the model confirms service, followed by a staff acknowledgement triggered by that event. Keep the accessible list and diagnostics. Show any home/remote activity outside the clinic boundary as a labelled separate context; draw a connection only when the model implements it.

## Original reusable scene and asset contract

Use one fixed diagonal cutaway projection per scene and a consistent furniture grid. Define normalised placement anchors independently of viewport pixels. Render background, furniture, equipment, connections, people/status markers and interface in a documented order; allow a topology overlay when it clarifies paths. Navigation, phone messages and technical inspectors should preserve the same selected device and mission state.

Every asset manifest entry should identify `assetId`, original source/provenance, dimensions, anchor, hit bounds, view variant, decorative/state role, fallback and associated stable entity IDs. Every scene should identify `sceneId`, room boundaries, equipment anchors and permitted placements. Render small scene equipment and enlarged inspector artwork from those IDs. Network paths must reference engine port/link IDs. Never infer success from position, animation or asset filename.

| Reusable mission setting | Original visual and interaction requirement |
|---|---|
| Hardware | Workbench and enlarged parts view; select, inspect, fit/remove compatible components through a parts list or equivalent spatial controls. Compatibility must come from a new hardware model. |
| Security | Workplace plus access-request messages; show identities/roles, permitted services and denied actions. A lock icon reports a specific policy state. |
| Media | Studio/editor workspace with preview, source and publication-state views. Audience effects require explicit scenario rules and evidence, rather than decorative reaction counters. |
| Health | Clinic equipment, reception work and service-status cues using fictional non-identifying information. Display service consequences without inventing patient records, waiting-time calculations or clinical outcomes. |

## Acceptance gates for implementation

- Keyboard users can select a device, inspect it, choose source and destination ports, connect/disconnect, configure and test without dragging. Focus remains visible; closing an inspector restores it to the initiating control.
- Every consequential scene interaction has a labelled list/control equivalent. Physical, service, access and stale-test states use text or symbols as well as colour.
- Compact objects remain distinguishable; enlarged ports and readable text remain available at 200% zoom. Viewport and school-device checks are still required.
- Reduced motion removes decorative animation without hiding events. Scene overlays never contradict the engine or change completion independently.
- Only two or three current goals are prominent. Phone advice leaves the current task recoverable and distinguishes requested advice from an unsolicited interruption.
- A published-build walkthrough must confirm contextual transitions, save/reload and responsive behaviour. This static inspection supplies design evidence, not classroom-readiness certification.
