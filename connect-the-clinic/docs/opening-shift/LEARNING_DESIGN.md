# Opening Shift — learning and evidence design

**16 November 2026 · America/Halifax · 0.7 review copy**

This note describes the original content in `dist/opening/content.js`. It is an implementation handoff and a contract review, not an observed classroom trial. The mission engine alone determines available actions, results, prices and readiness.

## Learner, preparation and smallest complete job

The learner is an IB Digital Society student acting as a junior technology contractor. Expected preparation is a simple client/service path, power and ports, an address and supplied mask, and a permitted versus denied role request. The existing bootcamp remains the place to teach these before independent work; an explicit teacher-directed prior-learning route must not award unseen preparation.

Opening Shift begins with working reception and a partially prepared nurse workspace. The learner inspects, chooses an owned laptop or purchased tablet, makes a relevant technical change, explicitly tests both exam rooms and reception, chooses or retains a responsible booking policy, and submits four short explanations or requests oral review. The owned reception, host and switch are baseline resources, not evidence of learner equipment selection. A free, self-directed rehearsal lets learners explore both plans and guides without fees or earnings; its work is separate from the independent client and from earlier bootcamp/wearable records.

A **15–30 minute rehearsal or discussion** and **20–30 minute independent shift after preparation** are unmeasured planning estimates. A first useful service observation within about five minutes is a pilot target, not an enforced time or evidence of learning. The teacher should adjust after observing novices; no reading time is billed.

## Source basis and new authorship

This worker inspected `docs/SOURCE_ALIGNMENT.md`, the shared Opening Shift contract/run and `ENGINE_API.md`, `FIRST_CLIENT_MISSION.md`, `ORIGINAL_GAME_BLUEPRINT.md`, the legacy `docs/ENGINE_API.md`, the existing catalog and `dist/content/learning.js`. The original private Computers packs, full Networks PDF and security PowerPoint were not newly inspected. The ledger’s referenced `revisions/CONTENT_0_4.md` was not present in this checkout. The mappings below therefore preserve the supplied project’s source reconciliation and its limitations; they are not a fresh source audit.

| Supplied source recorded in the ledger | Specific use in this slice | Boundary |
| --- | --- | --- |
| S1, Computers L1 student pack, 3.3A Types of computers, “Equip the clinic”; S2 teacher notes | Device suitability, moving versus fixed work, reasoned alternatives and stakeholder trade-offs | Laptop/tablet acceptance follows the task. No measured typing speed, weight, performance or universal best device is invented. No teacher answer sheet is included in the public module. |
| S3, Computers L2, 3.3B Components of a computer | Readable input/output, keyboard/touchscreen, power and compatible-interface vocabulary | This is not complete component or performance coverage. |
| S9, Networks, printed pp.106–114; 3.4A–B pp.107–110 | A local service, switch, Wi-Fi access point, wired uplink and dependencies | Static fixtures, exact ports, named-room coverage and troubleshooting progression are authored applications. No Internet or radio propagation model is claimed. |
| S9, 3.4C, printed p.111 | IPv4 address/mask comparison | Bounded static-address practice is an extension. The /24 explanation explicitly limits the first-three-groups shortcut to this mask; it does not claim general subnetting competence or universal DHCP use. |
| S9, security pp.113–114; S10, one-slide ITGS security-layer organizer | Useful permissions, necessary restriction and role-based authorization | Simulated roles do not authenticate identities or demonstrate encryption, firewall protection, legal compliance or an OSI model. |
| S11, *Digital Society*, Bomfim et al., 2022: Power37–38, Systems41–43, Values and ethics44–49, Health245–248; network Systems connection114 | Optional lenses linked to the actual path/workflow/access decision | These page locations are inherited from the source ledger. No whole-chapter coverage or remote-clinic network activity is claimed. |

Original additions are Ari/Sam’s phone dialogue; the afternoon-shift setting; the two authored fixtures; the 180-credit allowance, 120-credit fee and shop/help prices; question IDs; the different-network worked example; graduated hints; handover wording; and the optional economics reflection. All names, organizations and data are fictional. Internal `cc.clinic.*`, `role.*`, `guide.*`, `connection.*`, `question.clinic.*` and mission/fixture IDs are software references. Official curriculum outcome IDs and canonical Evidence Map mappings remain unresolved and are not fabricated.

## Playable teaching sequence

1. **Brief:** Ari states the outcome without revealing a hidden fault. Three optional questions clarify working reception, Sam’s mobility/typing needs, and who should handle follow-up bookings. Their replies remain readable; asking is not a compulsory memory test.
2. **Preparation/rehearsal:** The existing bootcamp remains separate. Opening Shift adds free exploration and a concise `/24` explanation with a worked `192.168.60.0/24` example, distinct from the client’s `10.40.10.0/24`. Reading it is preparation, not an automatically logged demonstration or independent evidence.
3. **Independent work:** A learner can inspect before probing, reuse the laptop or justify a tablet, and repair in a sensible order. No content requires a false failed test or unnecessary change to an already suitable address or policy.
4. **Transfer:** Fixture B changes the cause to a disconnected AP uplink while the address is valid. Changing only an IP cannot restore a conducting path. Its prompt asks what to inspect and retest; a discussion prediction must remain distinct from a played observation.
5. **Handover:** Four concise prompts preserve exact learner words or explicit pending oral review. The optional concept lenses extend those same decisions instead of creating another worksheet or graded quiz.

Only two or three goals are shown for the current stage (`brief`, `build`, `check`, `handover`). The optional full map is the four groups together. Stage choice and readiness belong to the engine/integrator, never the content module.

## Action–observation–explanation map

Action names below are reconciled with `docs/opening-shift/ENGINE_API.md`. Baseline setup actions retain mission-setup provenance. This table specifies evidence needs, not substitute success logic. The UI must take live child device/port IDs from the current view; stable inventory item IDs identify purchases and nurse choices.

| Internal learning ID / source basis | Learner decision or action | Authoritative observation required | Explanation / human consequence |
| --- | --- | --- | --- |
| `cc.clinic.device-fit` / S1–S2 | `ASK_CLIENT` with the requirements question; `ASSIGN_NURSE` with `item.laptop`, or `BUY_ITEM {sku:'tablet'}` then `ASSIGN_NURSE` with `item.tablet` | Actual inventory/assignment/transaction and the chosen active nurse device | Compare portability, keyboard use and allowance. A cheaper plan is not automatically better reasoning. |
| `cc.clinic.connection-choice` / S3, S9 | `INSPECT_DEVICE`; `BUY_ITEM`/`INSTALL_ITEM` for missing AP; `POWER_DEVICE`, `CONNECT_PORTS`, `ASSOCIATE_WIFI` | Actual endpoint IDs, power, association, and path from the nurse probe | Explain why Wi-Fi association alone is insufficient and why the uplink matters. |
| `cc.clinic.address` / S9 p.111 plus static-address extension | `INSPECT_DEVICE` against the actual card; keep a valid address or use `SET_STATIC_ADDRESS` | Before/after settings, used active addresses and current probe result | Explain how the supplied mask bounds a local choice; copied worked-example digits are not evidence. Fixture B does not require changing a correct address. |
| `cc.clinic.diagnosis` / authored S9 application | `INSPECT_DEVICE`, `INSPECT_CABLE {itemId:'item.uplink'}` or `RUN_PROBE`; make a cause-relevant change; rerun the relevant probe | Real observation → relevant action → current retest, preserving proactive repair without inventing a failure | Explain the observed cause and why an unrelated IP edit would not mend an unplugged uplink. |
| `cc.clinic.system-path` / S9 pp.107–110 | `MOVE_NURSE` to exam A and B; `RUN_PROBE {testId:'nurse'}` in each; `RUN_PROBE {testId:'reception'}` | Player observations in both locations plus fresh reception booking result; distinguish derived checks from tests | Explain the local path and the effect on people if an upstream part fails. No Internet requirement is inferred. |
| `cc.clinic.access` / S9 pp.113–114, S10 | `SET_PERMISSIONS` including unchanged-policy retention; `RUN_PROBE` using `reception`, `nurse`, `nurse-bookings`, `access` or `all` | Fresh required allows and intended denial on a reachable service; real booking consequence; `all` does not fabricate a second-room visit | Explain useful authorization. Disconnection is not evidence that the permission policy blocked an outsider. |
| `cc.clinic.stakeholders` / S1–S2, optional S11 | Recommend separated responsibilities or nurse-also-books | Actual selected/retained policy, question context and nurse-booking probe | Identify a benefit, barrier/additional responsibility and condition that could change the decision. |
| `cc.clinic.handover` / S1–S2 teacher-evidence approach | `SAVE_EXPLANATION` for `equipment`, `repair`, `privacy`, `limitations`; `REQUEST_HANDOVER` in the client job | Unaltered words and context, unresolved oral flags, fresh engine readiness and actual ledger | Explain findings and a deployment limitation. Presence permits review; quality and understanding remain teacher judgements. |

`cc.clinic.ipos` and `cc.clinic.data-journey` remain valid existing project IDs but are not claimed as demonstrated by this narrower slice. There is no wearable task, offline collection, sensor-dock transfer or marker upload to complete here.

## Alternative plans and permissions

Both laptop and tablet are suitable catalog devices for the declared workspace and mobility needs. The tablet takes over the inherited deployment profile once; purchasing it must not silently solve the assessed address fault, create a duplicate live address or require repairing the retired laptop. Variant A adds AP/cable installation; variant B already owns that infrastructure and needs its physical connection restored. Actual quotes and refunds come from the engine, not copy arithmetic.

Both responsible policies are legitimate. **Separated responsibilities** leaves bookings with reception; a nurse-booking denial is expected, and the nurse asks reception for a follow-up. Explicitly keeping that initial policy is an authentic decision. **Nurse also books** lets the nurse arrange follow-ups in-room and adds a permission/responsibility to justify. Both preserve necessary service and outsider denial. Open access exposes staff functions to outsiders; deny-all prevents legitimate staff work. The student must test the consequence, not trust the policy label. A changed policy requires reasoning against the new context.

The guide sequence is notice → compare/narrow → suggested targeted action/retest. Each of the three sections has exactly three tiers. Client use is disclosed at 5 fictional credits and 3 simulated minutes per section, capped at 15/9, including all tiers and reopening. Rehearsal, reading, diagnostics and accessibility are free. Client allowance is separate from contractor fee; unused equipment allowance never becomes income. Returns before handover allow revision. The optional reflection asks whether help fees change help-seeking; it does not establish Business chapter learning, and no money/speed/help measure becomes an IB mark.

## Optional lenses, not additional gates

- **Systems:** connect an actual technical dependency to the human booking procedure and a consequence of failure.
- **Power:** examine who may act and who authorizes or challenges a permission.
- **Values and ethics:** explain competing work/access needs with a conditional judgement.
- **Health:** recognize the fictional clinic context and distinguish modelled service effects from unmodelled clinical, privacy or reliability outcomes.

These are optional ways to deepen one of the four explanations. They are not new mandatory prompts, official outcome mappings or claims of whole-chapter understanding.

## Contract walkthrough and review limits

**Successful route, contract-reviewed:** inspect the unfinished setup; keep the laptop; install available infrastructure; configure a suitable unused local address only if needed; associate and test; explicitly keep separated responsibilities; collect fresh nurse observations in both rooms, reception and access results; submit the four explanations/oral arrangements; hand over. Tablet and nurse-booking alternatives require the same relevant service evidence.

**Plausible mistake and targeted repair, contract-reviewed:** in the uplink-transfer fixture, changing a valid IP leaves the physical route absent. A failed path finding or inspection supports reconnecting the AP uplink. A fresh nurse test must then show the resulting route; unrelated edits do not become repair evidence.

**Transfer, contract-reviewed:** compare the address problem with the missing-uplink problem. The changed cause, rather than merely changed numbers, tests whether the learner selects a relevant repair. The module supplies a question and guidance, not a teacher model answer.

**Checked:** `node --check dist/opening/content.js` and a dynamic ES-module import passed. Import checks confirmed four stage groups with two or three goals each, three guides with ordered tiers1–3, four exact explanation keys, three unique question IDs, a worked network different from the client and serializable content. This is a content/interface-shape check, not a gameplay test.

This content worker has not played the integrated interface, tested the published origin or observed students. Remaining teacher/QA decisions are exact Evidence Map IDs, preparation route, whether to retain the optional help tariff, explanation quality, novice timing, keyboard/zoom usability and school-browser behavior. Readiness and earnings must never certify mastery or real-clinic deployment safety.
