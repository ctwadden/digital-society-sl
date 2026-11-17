# Opening Shift shared contract — 0.7 review

## Scope and authority

One new independent clinic job and a free rehearsal path. Existing 0.6 bootcamp and wearable mission remain accessible and retain their own saved work. Do not claim their completion from this narrower mission. Use original content/art, no runtime service or personal data.

`dist/opening/engine.js` wraps the existing `../engine.js` model. One state owns its child network, mission actions, inventory, costs, messages, observations, explanations and settlement. UI dispatches actions and renders derived facts; it must never decide success independently. Do not modify legacy engine/catalog without the lead's coordination.

Public entry `opening-shift.html`; engine exports `createShift(options)`, `dispatchShift(state,action)`, `deriveShift(state)`, `validateShiftSave(raw)`, `createShiftEvidence(state)`, `SHIFT_CATALOG`. API detail belongs to engine-owned `ENGINE_API.md` and must be published before UI fabrication.

Rejection result `{state,accepted:false,code,message}` preserves the input atomically. Accepted result has the same shape. Derived `ready` is current engine truth, never a stored/imported UI flag. Validation bounds input at 1 MiB, validates references/invariants and cannot trust imported completion/ledger fields. Replay of validated original actions is an acceptable validation approach with bounded action counts.

## Stable mission and fixtures

Mission `mission.clinic.opening-shift.001`. Fixture A `fixture.clinic.opening.address-and-install.001`: powered working reception/host/switch; clinic-owned laptop with wrong-subnet inherited profile; AP and cable must be purchased and installed. Fixture B `fixture.clinic.opening.uplink-transfer.001`: existing powered AP and cable, nurse correct/associated, AP uplink disconnected. In this bridge model an unplugged cable may be represented as inventory with remembered endpoints rather than a conducting half-edge; label that simplification.

Network: `10.40.10.0/24`, mask `255.255.255.0`. Existing host `.10`, reception `.20`. Inherited A nurse `10.40.20.30`; B nurse `10.40.10.30`. Multiple valid unique host addresses accepted. Baseline powers/services/links are mission setup, not player evidence. Coverage explicitly includes both exam rooms only within the clinic. No router/Internet/DHCP/DNS/VLAN model.

## Client brief and economy

Reception already works. Nurse needs a mobile workspace in both rooms. Preserve reception, choose suitable equipment, find the cause, test both rooms and make a justified access decision. Optional phone questions disclose typing/portability and booking workflow needs, not magic repairs.

Client allowance 180 credits, contractor fee 120. AP40, cable4, tablet70; owned equipment zero retained cost. A reuse44 / tablet114. B reuse0 / tablet70. Client unspent allowance never becomes profit. Uninstall/return before handover refunds actual paid price once and removes dependent links/roles; do not strand a player. Replacement tablet receives the inherited nurse deployment profile exactly once; old laptop is retired/disassociated/powered down before role transfer. Retained laptop can be reactivated. Document any constraints needed to adapt the older one-device-per-role model without inventing retired-device evidence.

Three optional help sections cost5 credits and3 simulated minutes each in client mode, capped15/9; all later tiers/reopens included. Free practice has no costs/earnings; ordinary inspection, diagnostic output, keyboard/accessibility and reading time always free. Delivery freezes evidence and money; settlement idempotent. Reset preserves independent help charges or explicitly starts a fresh separate practice; no wallet multiplication by replay/import.

## Required interactions and evidence

Receive/review brief, ask client questions, inspect settings, buy/reuse, place/power/connect/associate, set address/mask, run reception/nurse/outsider/booking probes, move nurse between rooms, choose/retain policy, submit equipment/repair/privacy/limitations explanations (or explicit oral-review flag), hand over and settle. Exact actions/fields in engine API.

Require an actual observation (inspection or failed test), a relevant player change, fresh explicit player tests in both exam rooms and reception, appropriate required access and outsider denial. Proactive repair is valid; never invent a prior failed probe. Freshness may use a technical revision/fingerprint that ignores nurse room movement so testing both rooms is possible; other causal edits invalidate prior results. Differentiate displayed current model evaluation from player-recorded tests. Policy change invalidates privacy reasoning context; explicitly retaining the initial suitable policy is valid.

Four explanation keys: equipment, repair, privacy, limitations. Presence/oral arrangement permits teacher review, not a judgement of understanding. Preserve exact text and recorded context. No automatic IB score, curriculum code or earned mastery.

## Interface and art contract

Content module exports original copy only, no state/success logic. Two or three current goals at a time. Phone is a readable panel with actionable client questions and consequences; no unsolicited wall of curriculum prose.

Art module `scene.js` exports a pure presentation function `renderScene(view,{selectedDeviceId})` returning trusted original SVG markup and an exported `SCENE_ANCHORS` map. It displays only view-provided state, no outcome calculation. Normalized scene canvas `viewBox="0 0 960 620"`; stable zone anchors: reception `(240,400)`, examA `(670,235)`, examB `(680,425)`, equipment `(260,180)`. UI supplies real named HTML buttons/controls as accessible alternatives; SVG is supplementary and may be aria-hidden. Path overlays use real `pathIds`/link IDs. Art may never draw a green success path from cable presence alone.

`mountOpeningUI(root,handlers)` supplies `render()` and `showStatus(message,kind)`; handlers provided by lead: `getView`, async `send`, `onExport(format)` (progress/evidence/json/draft), `onImport(rawOrFile)`, `onReset`, `onTakeControl`, `onRecover`. Engine-derived view enriched with `storage` and `buildVersion`. UI-owned selection/editor drafts are presentation state; save explanation drafts before actions that rerender or keep them in a separate rescue store, never silently lose or treat unsent drafts as submitted evidence.

No precision dragging, hover-only controls, essential animation or colour-only labels. Keyboard focus retained after actions; avoid full-page rerenders on every keystroke. 1366×768 school viewport, 200% zoom, narrow stacked fallback. Text feedback alongside visual paths. Local browser/profile/origin limitations and downloadable progress available.

## Recovery and publication

Lead owns namespaced persistence/entry and publication. Valid new saves restore actual state. Old0.6 files must never be misrepresented as new mission progress: explicitly identify them and direct to the preserved legacy build without overwriting either save. New save namespace `riverbend.clinic.opening.v1.`. Existing namespace untouched.

QA distinguishes model tests, local browser, published browser and school observations. All assets checked for existence and state mapping. Teacher walkthrough and beginner timing are still required after publication.
