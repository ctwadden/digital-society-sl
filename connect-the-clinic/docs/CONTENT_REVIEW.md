# Curriculum implementation review — Connect the Clinic

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


**Review date:** 14 November 2026  
**Build examined:** 0.3.0 teacher review source  
**Reviewer role:** content connections specialist; did not author production content or engine  
**Owned output:** this document only

## Verdict

**PASS — instructional content and implementation alignment. CC-01 is resolved after source recheck.** The original Computers clinic task remains recognizable, the networking extensions are labelled honestly, and learning statements connect to real actions and evidence opportunities. The engine does not convert completion, guide use or income into a grade or mastery decision.

**CC-01 — explicit concept lenses: RESOLVED.** At initial review, `dist/content/learning.js`, `docs/TEACHER_GUIDE.md` and `docs/SOURCE_ALIGNMENT.md` did not identify the agreed **Systems**, **Power**, and **Values and ethics** lenses. The mechanics support them, but the promised connection was only present in earlier planning/crosswalk material. The initial source-alignment list also omitted the supplied textbook Concepts/Health passages. The lead added the three agreed questions in the exported `CONTENT_CONNECTIONS` data, an optional **Content connections** disclosure in the student interface, the teacher debrief, and an S11 source section with the exact selected pages. This reviewer re-read those four changes and imported the three unique concept entries successfully. The questions remain optional, refer to actual decisions, and add no marks or completion gates. The lead separately reported the disclosure visible in the browser accessibility tree; this reviewer did not control the browser.

This verdict is limited to source/content alignment and the focused executable checks described here. Browser accessibility, complete UI traversal, the actual school Windows environment and student learning/engagement are separate QA gates.

## Materials and scope examined

- Current `CONTRACT.md`, `docs/ENGINE_API.md`, `docs/MODEL.md`.
- Current `dist/content/learning.js`, relevant `dist/catalog.js`/`dist/engine.js` rules and `dist/ui.js` rendering.
- Current `docs/SOURCE_ALIGNMENT.md`, `docs/TEACHER_GUIDE.md`, and the retained I-can evidence map.
- Earlier complete chapter review in `clinic-plan/workers/content-connections-v02.md`, which records full Concepts, Networks, Economic, Health and Media coverage.
- Targeted fresh reads of the supplied Concepts and Health extracts, plus the complete one-slide security organizer. This audit does **not** claim a new full-book read.

Primary source references remain the supplied Computers L1 student pack (3.3A) and teacher notes, with L2 component vocabulary, the 21-page Networks extract (printed pp.106–126), the one-slide **Layers of cyber security** organizer, and Bomfim et al., *Digital Society* (Hodder, 2022), selected Concepts/Health passages. Source-specific pages are stated below. Internal `cc.clinic.*` identifiers are project IDs; they are not official IB outcome codes.

## Learning statements against actual implementation

All ten unique core statements appear in the student I-can content. Their IDs are all covered by the three bootcamp lesson `learningIds` arrays. This is a map of teaching and evidence opportunities, **not ten automatically demonstrated outcomes**.

| Internal ID | Implemented learning opportunity | Actual evidence available | Teacher follow-up needed |
|---|---|---|---|
| `cc.clinic.ipos` | Bootcamp explanation and the input/process/store/output inspector; wearable collection and shared-service roles. | Selected device capabilities and the marker journey. Inspector opening is not treated as mastery. | Ask the student to trace the four functions in one selected device and compare another. The four generic handover boxes do not guarantee this explanation appears. |
| `cc.clinic.device-fit` | Choose equipment for reception, mobile nurse, home collection and central services; valid alternatives remain possible. | Actual kinds, role assignments, attachments and equipment explanation. | Assess whether the reason and trade-off fit the chosen task. A suitable selection can still be a guess. |
| `cc.clinic.connection-choice` | Real Ethernet ports, explicit laptop/tablet adapter, Wi-Fi association and separate sensor dock. | Actual cable endpoints, attachments, associations and related failed/passing probes. | Ask why the adapter and sensor dock cannot replace each other and what the AP contributes. |
| `cc.clinic.system-path` | Trace a source through the switch/AP to a shared service; removing a needed link changes service availability. | Connection graph and observation paths. General computers do not forward other devices' traffic. | Ask about one technical dependency and its human consequence; also why local service does not require Internet. |
| `cc.clinic.address` | Configure the nurse in `192.168.50.0/24`, changed practice in `192.168.70.0/24`, then the clinic in `10.40.10.0/24`. | Address/mask configuration, genuine changes and current probes. | Check the reasoning about mask and unused host address. This does not establish general subnetting or binary calculation competence. |
| `cc.clinic.diagnosis` | Run a diagnostic, change a relevant setting and retest using the same engine. | Real failure/change/retest history, or an honestly labelled early repair. | Ask why the chosen change addresses that finding and why an unrelated change would not. |
| `cc.clinic.access` | Two responsible policies plus broad-access and deny-all exploration; expected denial needs a healthy technical path. | Effective policy matrix/revision and required allow/deny observations. | Distinguish authorization, network reachability and real authentication. The game uses simulated roles. |
| `cc.clinic.stakeholders` | Nurse booking flexibility versus narrower responsibility; benefit, barrier and conditional judgement prompt. | Actual chosen policy plus unchanged student privacy text or an oral arrangement. | Judge the quality of stakeholder reasoning; there is no automatically “most ethical” policy or text-quality score. |
| `cc.clinic.data-journey` | Collect locally, return, dock/handoff and upload are separate actions. Historical receipts persist through later outages. | Separate collection, handoff, receipt and current intake states. | Ask what the receipt proves and what it does not; explain delayed synchronization versus live monitoring. |
| `cc.clinic.handover` | Export configuration/observations and four original explanations; incomplete work and pending oral explanations remain visible. | Current and historical facts plus student-authored text, support context and business ledger. | Review accuracy, quality and transfer using observation/conversation/product; local files are editable evidence. |

The table is supported by `learning.js`, `catalog.js`, `engine.js` and the documented API/model, not merely the proposed plan. The original four clinic jobs come from the supplied Computers L1 clinic scenario; explicit network-fault, access-matrix and delayed-sync mechanics are declared design additions in `SOURCE_ALIGNMENT.md`.

## CC-01: integrated optional connections

The implemented disclosure is titled **Content connections**, beside the I-can panel, with matching teacher-debrief prompts. None of these questions requires a new game mechanic, extra reward or mandatory essay box.

| Lens | Short question tied to the played mission | Exact supplied-source basis |
|---|---|---|
| **Systems** | Which technical part and human procedure must both work for your clinic service? Explain how one failure affects a person. | *Digital Society*, pp.41–43 (book PDF pp.55–57); Networks printed p.114 explicitly connects networks and human involvement to 2.6 Systems. |
| **Power** | Who gains the ability to act when nurses can make bookings? Who should authorize or question that access? | *Digital Society*, pp.37–38 (book PDF pp.51–52): capacity to influence/control, including legitimate, expert and information power. |
| **Values and ethics** | Which people's needs compete in your access decision? Give a benefit, a barrier and a condition that would change your recommendation. | *Digital Society*, pp.44–49 (book PDF pp.58–63): consequences, needs, judgement and competing ethical perspectives. |

**Health is the context:** central records, monitoring, privacy and access are relevant in the supplied Health chapter, printed pp.245–248 (book PDF pp.259–262), especially p.247. These passages justify why reliable services and appropriate access matter to people. They do not justify a medical-accuracy claim or show coverage of the whole Health chapter.

The S11 source section now identifies the supplied Bomfim et al. textbook and these selected pages. Full-book PDF page equals printed page +14. For the separate Networks extract, printed page equals extract PDF page +105. Do not mix these offsets.

The supplied Concepts overview lists **Change, Expression, Identity, Power, Space, Systems, and Values and ethics** (printed pp.28–30). Privacy, trust, access, responsibility and inclusion can be issues examined through those lenses; they are not extra prescribed concepts. The optional disclosure only needs the three relevant lenses, not a seven-concept checklist.

**Amendment status after recheck: RESOLVED.** The data export, student disclosure, teacher prompts and source section all agree. No production file was edited by this reviewer.

## Networking and security accuracy

No blocking science error was found in the current instructional copy and examined rules. The following important qualifications are preserved:

- The subnet mask identifies network/host bits. The “first three number groups” shortcut is explicitly tied to `/24`, not taught as universal. The engine compares masks bitwise and can distinguish reserved host addresses, duplicates, wrong scenario subnet and asymmetric on-link decisions. Compatible nonidentical masks are not universally rejected (`engine.js`; `MODEL.md`; Networks address concepts at printed p.111, with subnet mechanics labelled practical enrichment).
- A local switch/AP path can supply this same-subnet service without a router, gateway or Internet. Routing, DHCP, DNS, NAT and other later topics are explicitly absent. A router is not a decorative device required to pass (`MODEL.md`; Networks printed pp.109–111).
- The AP's bridge/uplink, explicit Ethernet adapter and sensor dock have different functions. The model limits forwarding to bridge-capable devices and does not make a normal laptop an accidental router (`catalog.js`, `engine.js`).
- A network path is separate from an enabled service and role authorization. Intended denial only counts when technical prerequisites work. Authentication is explained but real accounts are not simulated. The security slide places authentication/authorization and role-based access in its user layer; it is not presented as OSI or as proof of comprehensive security.
- Day markers, compressed collection and return-and-sync are identified as simplifications. There is no implied home-to-clinic Wi-Fi, medical reading, diagnosis, live monitoring or clinical efficacy (`learning.js`, `MODEL.md`; Computers clinic scenario and Health context).
- The implementation does not repeat the supplied Networks extract's overbroad universal-DHCP/immutable-MAC statements or its bandwidth/unit confusion. Wider lessons should retain the corrections recorded in the earlier chapter audit.

## Assessment and economy boundaries

The fee and consultation system is explicitly fictional. Guide use changes business resources, not an automated grade, mastery level or teacher sign-off. The teacher's requested cost mechanic remains intact: free bootcamp and essential support; active-client section quotes; all tiers/reopens included; simulated minutes rather than real reading-time billing.

The code stores unchanged explanations and explicit oral-pending flags. Presence enables handover; it does not establish explanation quality. Official outcome IDs are empty. No Evidence Map write is fabricated. These are appropriate boundaries for teacher review (`learning.js`, `engine.js`, `TEACHER_GUIDE.md`).

The game still needs teacher conversations for some targets, especially IPOS and explaining the system path. A customer or income target could structure later career progression, but the present build should not claim it signs off these statements.

## Connections deliberately deferred

| Candidate | Why it is not first-clinic coverage | Suitable later use |
|---|---|---|
| **Economic**, printed p.213 | A wallet and fictional fee alone do not show customer-value or business understanding. | A client chooses between support/maintenance options that affect cost, reliability and repeat work; explain the trade-off. |
| **Economic**, pp.217–219, especially p.218 | Remote work/server access needs a real routed/remote-path model. | A remote-worker contract with an actual route and bounded access/security problem. |
| **Economic**, pp.220–221 | The game reward system can be discussed, but it does not prove chapter mastery. | Teacher debrief: what does charging for help encourage, and when could that conflict with responsible work? No punitive real timer is needed. |
| **Health**, p.248 | A rural clinic accessing a central hospital is not equivalent to this single local subnet. | A later mission with two distinct networks, forwarding and return paths, followed by an honest WAN/security boundary. |
| **Media**, p.133 and Networks p.112 | This build has no bandwidth, file-size, quality or compression model. | A media-sharing/streaming job with explicit capacity/quality/scheduling consequences and corrected technical units. |
| **Media**, pp.138–140 | A phone interface alone does not teach verification or authenticity. | A future request whose claim/source must be checked before changing access, with real consequences for the decision. |
| **Media**, pp.141–142 and p.144 | No current licensing or preservation decision is implemented. | Original/licensed media choices or a tested file-migration/restore job after appropriate source checks. |

These page references are from the supplied textbook and the earlier complete content-connections review. They are candidate designs, not implemented outcomes or newly verified current statistics/legal claims.

## Focused checks actually executed

Environment: Linux, Node.js v24.22.1. No browser was controlled by this reviewer.

1. Imported current learning/catalog modules; confirmed **10 unique core learning IDs**.
2. Confirmed the union of lesson learning IDs covers all ten, and all **three station IDs** match the engine catalog.
3. Confirmed **three guide IDs**, each with **three tiers**, match the engine catalog.
4. Confirmed public `officialOutcomeIds` is empty.
5. Built the two responsible-policy client fixtures and confirmed current readiness.
6. Compared each export's policy ID, effective matrix and revision to current derived state; all matched. Confirmed all four fixture explanations remain unchanged and official outcome IDs remain empty.
7. Rechecked CC-01 in the learning module, UI renderer, teacher guide and source notes; imported exactly three unique concept entries with the agreed labels and questions.

An initial overly broad comparison of entire policy presentation objects failed because the export correctly includes a policy revision while the catalog view includes descriptive copy. The comparison was corrected to the semantically required ID/matrix/revision fields after inspecting that shape; no production code or expected permission result was changed.

The existing simulation test suite and the lead's browser walkthrough are independent records. This review does not duplicate their pass counts or claim completion of the 66-case acceptance matrix.

## Remaining teacher decisions

- Review whether the delayed wearable return-and-sync boundary fits this lesson's intended scenario.
- Check explanation depth and tariff effects with the class; a student who responsibly consults a guide may still understand the material well.
- Use the short exported handover alongside the existing fuller writing task, with a changed-situation conversation where needed.
- Review the optional concept questions after an actual playthrough so they refer to decisions students recognize.
- Complete the school-device walkthrough and small student pilot before wider readiness claims.
