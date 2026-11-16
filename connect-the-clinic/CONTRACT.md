# Connect the Clinic — implementation contract v0.6 teacher review

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


The teacher authorized fabrication on 14 November 2026: “ok so are we able to develop the game - the prompts can be set to the agents etc”. This implements reviewed v0.2 with return-and-sync as the bounded pilot default; the teacher can evaluate it in the playable review. No classroom-readiness claim.

## Authority and ownership
The lead owns this contract, integration/persistence/main entry and publication. Existing source plans at `[original local working path omitted]` remain historical reference. Preserve all sources. Runtime is original buildless ES modules, semantic HTML/CSS and inline/local SVG. No dependencies/CDNs/runtime AI, accounts, analytics or real data. New isolated project `[original local working path omitted]`, separate from existing Teacher OS and classroom-tools. Source lives in `dist/` (served directly) plus tests/docs/qa/contracts.

- Simulation engineer: `dist/engine.js`, `dist/catalog.js`, `tests/simulation/**`, `docs/MODEL.md`. Implement authoritative state, reducers, selectors, training, economy, domain save validation, evidence. No DOM.
- Mission designer: `dist/content/learning.js`, `docs/TEACHER_GUIDE.md`, `docs/SOURCE_ALIGNMENT.md`. Original text only; no state changes/success calculations.
- Interface designer: `dist/ui.js`, `dist/styles.css`. DOM/canvas SVG rendering; action dispatch only. No independent success.
- Art director: `dist/assets/**`, `dist/art.js`, `asset-manifest.json`. SVGs and presentation only. Lead coordinates real engine geometry.
- Content connections: `docs/CONTENT_REVIEW.md` and content review of supplied sources. No extra missions/codes.
- Independent QA: `tests/qa/**`, `qa/**`. Do not modify production or invent test results.
- Lead: `dist/index.html`, `dist/main.js`, `dist/persistence.js`, `package.json`, source/hosting setup, release records and contract reconciliation.

## Current review amendment

`docs/revisions/REVIEW_0_6.md` implements the teacher-authorized guided first connection after the Aspire research. It defines separate trainer/player provenance, a new opt-in engine fixture used by the application's fresh-campaign factory, saved-work return, focused interface and original continuous workplace. It supersedes revision-specific ownership for this slice; old missions, bootcamp and valid saved work remain authoritative.

`docs/revisions/REVIEW_0_5.md` defines the teacher-authorized first-play experience revision. It changes presentation and narrative, preserving the 0.4 simulation rules and save schema. Its bounded file ownership supersedes the general ownership list for this revision. `docs/revisions/FIRST_PLAY_DESIGN_0_5.md` records the game-design handoff.

`docs/revisions/REVIEW_0_4.md` is the bounded implementation amendment for the teacher’s six observations. It adds engine-owned current goals, a physical-link transfer task, teacher-selected free clinic practice, clearer network visuals and recovery verification. It supersedes the old station-2 changed-address description below; legacy saves retain their original provenance. Exact integrated API details live in `docs/ENGINE_API.md`.

## Runtime API (engine owns exact data, report amendments immediately)
ES module `engine.js` exports:
- `createGame()` => serializable campaign, fresh training attempt.
- `dispatch(game, action)` => `{ state, accepted, code, message }`. Immutable on rejection; rejected input never partly mutates.
- `derive(game)` => presentation model; all current readiness and diagnostics from here.
- `createEvidence(game)` => `{json:object,text:string}` from same snapshot.
- `validateSave(raw)` => `{valid, state?, error?}`; accepts parsed object or JSON string (bounded 1 MiB), recomputes derived readiness, rejects malformed/unknown/invalid domains.
- Export needed catalog/selectors, with stable IDs below.

Campaign contains `schemaVersion`, `buildVersion`, `campaignId`, `revision`, `activeAttemptId`, `attempts` (object), `training` (station achievements/provenance), `contract` (nullable), `wallet`, `settlements`. Attempt contains immutable `mode:training|client`, `fixtureId`, `technicalRevision`, `evidenceRevision`, devices, cables, permissions, observations, fault provenance, marker history, explanations and event journal. Engine derives readiness, never trusts stored flags.

`derive()` must expose `attempt`, `mode`, `network` (cidr,mask,serverAddress,receptionAddress,inheritedNurseAddress), `devices` array, `cables`, `policy`, `diagnostics`, `objectives` array with id,label,met,detail, `ready`, `missing`, `messages`, `guideQuotes`, `training` (station index/id,title, completed, canAdvance, stage instructions/status), `economy` (gross,reserved,minutes,net,wallet,phase), `explanations`, `history`. UI may also inspect catalog capabilities and attempt raw config, but never infer success.

Catalog stable kinds: `desktop`, `laptop`, `tablet`, `wearable`, `server`, `switch4`, `switch8`, `access-point`; explicit attachments `ethernet-adapter`, `sensor-dock`. Roles: `role.reception`, `role.nurse`, `role.monitor`, `role.records`; infrastructure slots `infra.switch`, `infra.ap`. Locations: `location.reception`, `location.exam-a`, `location.exam-b`, `location.equipment`, `location.home`. Device/port/cable/event IDs never reused within attempt. Services: `service.bookings`, `service.workspace`, `service.marker-intake`.

## Actions
Use the established names and consistent payloads. Publish an API example table before UI integration; root resolves amendments.
- `CHOOSE_DEVICE {roleId,kind}` replaces prior role device safely, seeds inherited nurse fault only once. Infrastructure uses infra slot IDs.
- `POWER_DEVICE {deviceId,on}`; `PLACE_DEVICE {deviceId,locationId}`; `MOVE_NURSE {locationId}`.
- `ATTACH_ADAPTER {deviceId,kind}` / `DETACH_ADAPTER {deviceId,kind}` for explicit compatible Ethernet adapter or sensor dock.
- `CONNECT_PORTS {fromDeviceId,fromPortId,toDeviceId,toPortId}` / `DISCONNECT_CABLE {cableId}`.
- `ASSOCIATE_WIFI {deviceId,apDeviceId}` (null means disconnect).
- `SET_STATIC_ADDRESS {deviceId,address,mask}` rejects malformed text, accepts valid but faulty addresses so probes explain.
- `SET_SERVICE_STATE {enabled}` server role toggle.
- `RUN_PROBE {testId}` IDs reception,nurse,nurse-bookings,access,upload,all. Whole suite same immutable revision, context checks both rooms. The nurse-bookings probe exposes the functional difference between the two responsible policies.
- `RUN_COLLECTION_CHECK`, `RETURN_WEARABLE`, `HANDOFF_MARKERS`, `UPLOAD_MARKERS` (7 synthetic markers only).
- `SET_PERMISSIONS {policyId}` supports roles-separated,nurse-also-books,broad-access,deny-all; exact policy IDs `policy.*`.
- `SAVE_EXPLANATION {key,text,oral}` keys equipment,repair,privacy,limitations; presence only, context revision reviewed honestly.
- `REVIEW_EXPLANATION_CONTEXT` acknowledges existing privacy explanation against current policy without auto-written reasons.
- `GUIDE_CONSULT {sectionId,quoteToken}`; `REVEAL_HINT {sectionId,tier}`; `ACKNOWLEDGE_CLIENT_MESSAGE {messageId}`.
- `REQUEST_HANDOVER`; `SETTLE_CONTRACT` (separate, idempotent).
- `TRAINING_DEMO`, `TRAINING_RETRY`, `TRAINING_NEXT` orchestrate same ordinary technical actions with trainer-demo origin; never count demonstration as independent practice.
- `START_CLIENT_ATTEMPT {priorLearning?:true}` requires actual station checks or explicit labelled teacher-directed prior-learning start.
- `START_TRAINING_ATTEMPT`, `RESTART_ACTIVE_ATTEMPT`, `START_DELIVERED_CONTRACT_PRACTICE` preserve ledger/history as reviewed.

## Bootcamp implementation
Three stations, each explain > demonstration > student practice > changed example. Require engine-observed relevant student actions; showing demonstration cannot pass required practice. Teach basic IP/subnet meaning accurately using masks, not “first three digits” rule. Base192.168.50.0/24; changed192.168.70.0/24; clinic10.40.10.0/24. A station may use supported fixture presets through the same reducer/evaluator, but no alternate fake engine. Free retries/guides; preparation is practice, not mastery. Content worker explains checkpoints after engineer publishes exact mechanics. No future router/DHCP/DNS requirement in first mission.

## Clinic/economy invariants
Read both JSON contracts in `contracts/`. Same-subnet local tasks do not need router/Internet. Link faults precede address/access. Duplicate or subnet/network/broadcast issues fail explicitly. Masks validated mathematically. No pretend port on laptop without adapter. Wearable at home has no clinic Wi-Fi. Collection > return > physical sensor handoff > authorized network upload distinct. Fault seeded once, early repair valid, replacement cannot invent evidence. Two equipment routes and two responsible permission policies valid. Expected denial requires healthy technical path.
Three guide sections: `guide.devices-paths`, `guide.addressing-diagnosis`, `guide.access-handover`. Fee120, cost5+3simulatedmin/section, cap15/9, all tiers/reopen included. Pin accepted tariff. Key campaign+logicalcontract+section. No cash needed. No real timer or grade penalty. Deliver freezes evidence and costs; guide review free immediately thereafter. Settle frozen net once; exports/reloads/replay never duplicate money. Active reset preserves cost/grants; delivered replay is separate free training clone. Raw save imports replace whole campaign only, never merge wallets.

## Integration/persistence/accessibility
`ui.js` exports `mountUI(root,{getView,send,getEvidence,onExport,onImport,onReset,onClear,getStorageStatus})` or coordinate a small equivalent with lead. Engine is pure, UI only dispatches; lead supplies persistence. Keep labels/error/status text in HTML, non-drag forms primary, full keyboard, visible focus, reduced motion, 320px stack and 200% zoom. No browser console shortcuts as required gameplay. Input focus/caret preserved through rerenders, no keystroke-by-keystroke full DOM replacement. Flush all explanation drafts before handover/export. Downloads JSON/text and progress import, no name fields. Public student bundle has no teacher answer sheet.

Use meaningful unit tests for domain risks and independent QA. Browser tests follow available authorized browser tools only. Report exact environment; school Windows, assistive technology, downloads policy and student pilot remain untested until actually checked. No success from compile alone.
