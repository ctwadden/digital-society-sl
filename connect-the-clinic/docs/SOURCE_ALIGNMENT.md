# Source alignment and instructional boundaries

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


**Content version:** 0.4
**Mission:** Connect the Clinic / Riverbend Community Clinic  
**Official curriculum outcome IDs:** intentionally blank  
**Canonical Evidence Map skill IDs:** unresolved; no IDs invented

## Sources used

| Reference | Supplied material | Use in this build |
|---|---|---|
| S1 | IBDS Computers L1 student pack (teacher-supplied source; private link omitted), 3.3A Types of computers; “Equip the clinic” | Riverbend and its four jobs; computer functions/types and trade-off reasoning. |
| S2 | L1 teacher notes (teacher-supplied source; private link omitted), same package | Expected examples and acceptance of justified alternatives; teacher judgement and unmapped evidence opportunities. Teacher answers are not bundled in the public application. |
| S3 | Computers L2 student pack (teacher-supplied source; private link omitted), 3.3B Components of a computer | Input/output and component vocabulary where it supports device inspectors. No claim to cover the whole lesson or benchmark hardware. |
| S9 | Supplied `Networks.pdf`, printed pp.106–126; specifically pp.106–114 for this implementation | Network scope, wired/wireless links, centralized service, components, address concepts and access considerations. |
| S10 | Supplied `ITGS Layers of security.pptx`, one-slide organizer | Authentication, authorization and role-based access concepts. The organizer is not represented as an OSI model or official current IB outcome list. |

The preserved project source ledger identifies when the original material was inspected. This worker inspected the authoritative plan, the Networks/security extracts and the implementation contract. The source’s separate Lakeside Clinic Data task is excluded from Riverbend. No patient-record example, source artwork or vendor dialogue/code is copied.

Useful technical references retained in the project’s source ledger:

- [Microsoft: TCP/IP addressing and subnetting](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/tcpip-addressing-and-subnetting).
- [RFC 1122, local versus remote destination](https://www.rfc-editor.org/rfc/rfc1122.html#section-3.3.1.1).
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

These references inform technical boundaries. Listing them does not assert full standards compliance or substitute for testing the implementation.

## Preserved source scenario

The clinic opens next month. Reception works at a fixed desk; nurses work while moving between rooms; a wearable supports one week at home; information is held centrally and available to authorized staff. The source’s expected desktop, mobile device, wearable and server examples are starting points. A sound alternative should be considered when it fits the job and its trade-off is explained.

The public game uses only synthetic day markers and service/task labels. It does not reproduce blood-pressure readings or patient notes. A generic central service represents the shared role without holding real records.

## Ten proposed I-can statements

These are original student-friendly paraphrases and applications. The internal IDs are stable software references, not official curriculum codes. Game actions create evidence opportunities; they do not independently establish understanding.

| Internal ID | I-can statement | Source basis | Demonstration opportunity | What still requires review |
|---|---|---|---|---|
| `cc.clinic.ipos` | Trace input, processing, storage and output in a computer system. | S1; S3 supports vocabulary | Inspect workstation, wearable and server functions; follow a marker journey. | Explanation of the functions and their relationship; opening an inspector is insufficient. |
| `cc.clinic.device-fit` | Choose a suitable computer type and explain a trade-off. | S1/S2 | Equip all four jobs and compare an alternative. | Whether the reason fits the actual task and considers a meaningful cost/benefit. |
| `cc.clinic.connection-choice` | Select compatible connections and explain what an adapter, dock or access point contributes. | S3; S9 3.4A–B, pp.108–110; explicit adapter mechanics are a design extension | Use real available ports and distinguish Ethernet from sensor handoff. | Conceptual explanation beyond following controls. |
| `cc.clinic.system-path` | Trace how a client reaches a shared service through the local network. | S9 3.4A–B, pp.107–110 | Trace wired or wireless path to the central host. | Explain dependencies and why this local task does not require Internet. |
| `cc.clinic.address` | Use the given mask to choose a valid, unused local address. | S9 3.4C, p.111; bounded static-address practice is an extension | Configure/test a local address in bootcamp and apply the clinic range; distinguish valid addressing from the new missing-uplink transfer. | Applying the concept beyond copied numbers; no claim of general subnetting competence. |
| `cc.clinic.diagnosis` | Use a diagnostic result to make a targeted change and check the result. | Application of S9 components/addressing | Link an actual observation to a relevant change and retest; preserve early repair honestly. | Why that change helped, and why another type of fault needs a different response. |
| `cc.clinic.access` | Test necessary access while restricting unnecessary access. | S9 security pp.113–114; S10 user-layer organizer | Required allow and intended-deny probes on a reachable service. | Understanding authorization and legitimate work, rather than treating denial alone as security. |
| `cc.clinic.stakeholders` | Explain benefits, barriers and a condition that changes a recommendation. | S1 lesson reasoning as preserved in the authoritative plan | Compare the two nurse-booking policies. | Quality of stakeholder reasoning and conditional judgement. |
| `cc.clinic.data-journey` | Distinguish collection, storage, handoff and arrival at a central service. | S1 clinic; S9 network scope/sharing | Complete offline collection, return, dock handoff and authorized upload. | Explain the return-and-sync limitation; do not claim live clinical monitoring. |
| `cc.clinic.handover` | Explain changes, evidence and what still needs checking. | S1/S2 reasoning and teacher-evidence approach | Export actual state/history plus original explanations or pending oral arrangement. | Observation, conversation, product quality and transfer; no automatic IB mark. |

## Deliberate design additions

The following are game rules or teaching simplifications, not claims that the original lesson prescribes them:

- One local `10.40.10.0/24` clinic; static assignment; initial nurse profile in a different range.
- Bootcamp base `192.168.50.0/24` and changed `192.168.70.0/24` fixtures.
- A switch, an access point with named-room coverage, explicit Ethernet adapters and separate sensor-transfer docks.
- A fixed diagnostic order and abstract service checks rather than complete protocol/packet emulation.
- Return-and-sync wearable delivery, seven generic markers and a submit-only application role.
- Two acceptable nurse-booking policies and intentionally unsuitable broad-access/deny-all alternatives.
- Fictional phone employees, service fees and guide costs. The provisional tariff is 5 credits and 3 simulated minutes per section, capped at 15/9; the gross fee is 120.
- Readiness based on current engine checks and explanation presence/oral arrangement. Reasoning quality remains a teacher decision.

The guide cost is an explicit user-requested game mechanic. It affects the business record, not a grade. It never charges actual reading time, hides ordinary diagnostic results or charges for accessibility.

## Accuracy guardrails

A switch/access point can bridge this local subnet; a router is not a required decoration. Routing between distinct networks is deferred until a later mission actually models it. Static addresses are valid; the app must not teach that every IP address always comes from DHCP.

Teach the subnet mask as a bit boundary. `/24` means 24 network bits and mask `255.255.255.0`; comparing the first three number groups is a useful consequence of this particular mask, not a universal rule. Reject duplicate active addresses and inappropriate host addresses through the same engine used for tests.

A laptop’s compatible Ethernet adapter supplies a host-controlled port. The sensor dock supplies a different transfer capability. Supporting an attachment does not mean it is already attached.

An access denial counts as an intended restriction only after technical prerequisites are met. The simulation uses roles without authenticating real identities. It does not claim to test encryption, firewall protection, malware defense or legal compliance.

The Networks excerpt contains wording about bandwidth/speed units and universal DHCP/MAC behaviour that requires correction or qualification before wider teaching use. This pilot does not implement a bandwidth/speed/compression model or repeat those broad claims. Do not turn a textbook simplification into an incorrect engine rule.

## Coverage not claimed

This mission does not establish complete mastery of every computer category, CPU/RAM performance, programming/compilers, computing history, the full Networks chapter, the security-layer organizer, general subnetting, routing/DHCP/DNS, bandwidth, compression, live remote healthcare, legal compliance or cybersecurity certification.

The business ledger does not establish Business chapter understanding. Troubleshooting has conditional reasoning, but that does not establish Algorithms chapter coverage. The marker lifecycle is a useful bridge toward Data, but this build does not claim full Data outcome alignment.

The short handover supplements the existing writing task. No source-derived official outcome code, automatic Evidence Map mapping, IB grade or teacher sign-off has been invented. Exact identifiers remain blank until supplied and reconciled.

## Review status

Source/content alignment and module-shape checks can be recorded separately from runtime verification. Whole-mission behaviour, accessibility in the actual interface, school Windows/browser policies and student-pilot learning evidence require their own observed test results. This document makes no claim that those gates have passed.

## Selected concepts and Health connection (implementation review correction)

S11: Supplied *Digital Society*, Bomfim et al. (Hodder, 2022), selected printed pages: Power37–38, Systems41–43, Values and ethics44–49, Health245–248 (central records/privacy247; remote-clinic activity248). The full-book PDF page number is the printed page plus14. Networks extract printed114 explicitly connects networking to Systems.

The optional **Content connections** disclosure now names three lenses and ties each to an actual decision: the technical path plus a human work procedure (Systems), who can authorize and use nurse-booking access (Power), and competing workflow/privacy needs with a conditional recommendation (Values and ethics). The clinic is a Health context. These prompts supplement the learner's own handover; they add no graded quiz and claim no whole-chapter mastery. The future remote-clinic activity remains deferred because this implementation has no WAN model.

## Revision 0.4 source boundary

The teacher requested a different cause after taught addressing: the new station-2 transfer begins with valid IPv4 settings and an unplugged access-point uplink. Its failure/reconnection/retest/explanation gate is an original teaching extension of the supplied networking concepts, not a textbook-prescribed task or new official outcome. Legacy address-transfer saves retain their original provenance. The full ten-goal map remains available while two or three current targets are selected by the engine.

`revisions/CONTENT_0_4.md` records the exact selected source excerpts read in this revision, proposed copy, action/evidence mapping and remaining teacher decisions. It does not claim a fresh audit of the original Computers L1/L2 files or full textbook chapters. Economics remains an optional reflection on help incentives, not evidence of business mastery from a fixed-fee wallet. Teacher-selected full-clinic practice provides free guidance and no earnings.
