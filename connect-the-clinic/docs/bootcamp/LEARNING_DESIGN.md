# Field-ready bootcamp — teaching and evidence design

**16 November 2026 · America/Halifax · 0.8 review content**

This document describes `dist/bootcamp/content.js` against the shared `CONTRACT.md` and `API.md`. It records a content and contract review. It does not claim that this worker played the integrated browser build or observed students.

## Purpose and learner route

Students need preparation before they take the clinic job. The bootcamp therefore teaches the materials and the method, including where to act in this interface and why the action matters. It begins with familiar computers, connectors and network equipment, then moves from a simple wired path to address settings, wireless access, role permissions and a changed fault.

The route is **review the materials → watch a real worked example → try a fresh setup → inspect/test → explain a changed cause → enter the field job**. The training mentor is Jo, an original fictional character. Demonstrations, hints, retries, ordinary controls and reading time are free. No real-time clock or academic score is attached to them.

The student sees two or three I-can statements for the current lesson. A short first-action instruction points to a concrete control. Longer reference material is available in the free Equipment & cable guide and the lesson how-to guide. The final challenge has a troubleshooting method and graduated help, but no automatic solved demonstration.

Training completion means that the model's practical task conditions were met. It does not establish independent performance, certify readiness for a real clinic, award an IB grade or replace the teacher's judgement of reasoning. The independent field job has different addresses and circumstances and retains its own evidence.

## Foundational materials review

The user's added direction specifically calls for review of hardware, cables, networks, connections, IP addresses and masks. The content supplies twelve material cards rather than assuming that students recognize the equipment.

| Group | Materials | What students should distinguish |
| --- | --- | --- |
| Computers and servers | Desktop, laptop, tablet, server/service host | Workstation/client versus shared-service role; fixed work versus portability and input; a server is a role as well as a familiar hardware form. |
| Network hardware | Switch, AP, router concept, interface/physical port | A switch joins the modelled local wired devices; the AP bridges the wireless client into that LAN; a router forwards between IP networks; a physical socket is not an IP address. |
| Cables and connections | Copper Ethernet patch cable, power lead, USB, HDMI/DisplayPort | The job of each connection, compatible endpoints, and why a powered display or peripheral connection does not prove a network service is reachable. |

Every material card has a stable internal ID, purpose, ports, connection advice, use in this mission and a common mistake. Existing original artwork can illustrate six device types. The other cards use original interface schematics; no vendor photographs, branding or proprietary illustrations are requested. Each lesson provides `materialIds` so the interface can expose the relevant review before its task without presenting the whole reference at once.

`networkBasics` distinguishes LAN, WLAN and Internet, and gives the two modelled service routes. The wireless link is one segment of this setup. It does not imply Internet access. Power is an explicit state; the bootcamp does not model mains wiring, USB peripheral setup, display configuration or Power over Ethernet. Router recognition is included, but router/gateway, DHCP and DNS configuration remain deferred. Component assembly, CPU/RAM/storage compatibility and general computer building need their own future lesson/model.

## Six lessons and evidence opportunities

All IDs in this table are internal software references. Official curriculum outcome and canonical Evidence Map identifiers remain **unresolved**.

| Lesson / inherited source basis | Current I-can goals | Learner action and authoritative observation | Conversation/transfer opportunity and people affected |
| --- | --- | --- | --- |
| `boot.kit` / S1–S3; S9 components | Distinguish workstation, switch and service host; choose and power the equipment. | `NETWORK_ACTION` with `CHOOSE_DEVICE` and `POWER_DEVICE`; current role/capability and power checks. The learner chooses a desktop workstation, either supplied switch and a suitable host. | Ask which part requests/provides/joins the service. The choice concerns a person doing a task, not a universal best computer. A desktop with host capability is a valid host alternative. |
| `boot.cables` / S9 wired links and local service | Connect compatible Ethernet ports; run and interpret a service test. | Actual `CONNECT_PORTS` actions, two distinct free switch ports and a fresh `RUN_TEST {testId:'reception'}`. The student-facing test is the workstation service. | Trace a complete route and explain where a missing host link would interrupt it. An unusable service interrupts the work, even if the desk computer has power. |
| `boot.address` / S9 p.111; static-plan application | Compare local addresses using the supplied mask; apply an unused suitable address and test. | `INSPECT_DEVICE`, `SET_STATIC_ADDRESS`, then a fresh workstation test. Check both the requested `/24` plan and actual current service result. | Ask which address bits identify this subnet and which distinguish the device. A memorized final octet is insufficient; several usable addresses are accepted. |
| `boot.wireless` / S9 wired/wireless components | Build the mobile path through a powered AP/uplink; test in both rooms. | Power, actual AP cable, `ASSOCIATE_WIFI`, `MOVE_NURSE` and explicit nurse observations in A and B. The engine owns freshness. | Explain why association alone cannot prove the full path. Mobility is useful only where the needed work remains available. Real signal/reliability measurement is still outside the model. |
| `boot.access` / S9 pp.113–114; S10 | Separate connectivity from permission; test staff access and intended outsider denial; explain a workflow trade-off. | An explicit `SET_PERMISSIONS` decision and required staff, booking and access observations at the current revision. A technical failure cannot count as an intended policy denial. | Compare reception-only booking with nurse-also-books. The former adds a handoff; the latter adds permission/responsibility. Ask who benefits and what would change the recommendation. |
| `boot.transfer` / authored application of S9 components and diagnosis | Use observation to choose a relevant repair; retest and explain the causal change. | Record an actual failure or relevant faulty inspection, reconnect the missing AP uplink and run a fresh service test. `SAVE_REFLECTION` preserves exact words or oral-review status before `COMPLETE_LESSON`. | Explain why changing only an address cannot restore a missing physical connection. Keep valid settings and distinguish the new cause from the demonstrated address problem. |

The short check prompts in lessons 1–5 are conversation opportunities, not extra compulsory worksheets or automatic understanding scores. The transfer lesson records one short written explanation or an explicit oral-review request. Explanation presence allows teacher review; the game must not keyword-grade or fabricate the learner's reasoning.

## Worked examples and learner variation

The demonstration subnet is `192.168.60.0/24`, ordinary learner practice is `192.168.80.0/24`, and the changed-fault bench is `192.168.90.0/24`. The field clinic remains `10.40.10.0/24`. These are authored training fixtures, not textbook-prescribed values. The service host uses `.10`; the normal workstation and mobile profiles use `.20` and `.30` where applicable. The address lesson begins with the workstation in the next third-octet subnet.

The address example explicitly teaches a 24-bit network boundary and the equivalent `255.255.255.0` mask. The first-three-groups shortcut is limited to that mask. Learners use another unused usable host value in the given subnet; they do not need to reproduce one mandatory answer. The guide avoids treating an address as just a computer's permanent name or implying that all addresses are automatically assigned by DHCP.

An address-plan check is distinct from reachability. A different broad mask can still let a particular source reach a particular local destination. This does not fulfill an instruction to apply the supplied `/24` plan. Conversely, a split-subnet mask can produce a genuine local-addressing failure. The content therefore asks students to inspect both the settings and the observed service result; it does not assert that every mask mismatch always prevents communication.

The transfer challenge changes the cause, not only the numbers. Its initial mobile address is suitable; the missing physical uplink is the issue. A valid-to-valid address edit cannot supply that link. The first prompt asks for observation before changes; the third hint gives a targeted connection check. The learner can use help safely, and its use stays visible as support history rather than becoming a deduction from a grade.

## Demonstration and field boundaries

The model and API distinguish `trainer`, `learner`, setup and `engine-check` provenance. Narration maps to these exact demonstration step IDs:

| Lesson | Ordered narration IDs |
| --- | --- |
| Kit | `kit.client`, `kit.switch`, `kit.host` |
| Cables | `cables.client`, `cables.host`, `cables.test` |
| Address | `address.inspect`, `address.apply`, `address.test` |
| Wireless | `wireless.power`, `wireless.uplink`, `wireless.join`, `wireless.room-a`, `wireless.room-b` |
| Access | `access.inspect`, `access.policy`, `access.test` |
| Transfer | No solved demonstration |

Some demonstration steps group real actions, such as select plus power or move plus test. The interface should show the current step's purpose and the actual model result. Starting practice creates a fresh setup, so clicking through the mentor example cannot complete the learner task. A saved completion record represents a past training attempt; a retry has a fresh attempt ID and cannot silently inherit an earlier unsent explanation.

New players enter field work after the training task gates. A validated existing 0.7 field save can resume under an explicitly recorded existing-work exemption; it must not acquire fictional bootcamp completion. Entering or leaving training preserves independent field costs, payment, technical state and draft scope. Training guidance is always free. Independent client guidance retains its disclosed fictional tariff; ordinary tests, controls, inspection, accessibility and reading time remain free.

## Source review and limits

This worker read the current bootcamp contract/API, `docs/SOURCE_ALIGNMENT.md`, the prior Opening Shift content and learning design, and the available implementation context. The original private Computers lesson packs, full Networks PDF, security organizer and full Digital Society chapters were **not newly available or re-audited** here. Their source reconciliation is inherited from the project ledger:

- **S1/S2:** Computers L1, 3.3A Types of computers and Equip the clinic; device purposes, reasonable alternatives and teacher judgement.
- **S3:** Computers L2, 3.3B Components of a computer; input/output and interface vocabulary where relevant.
- **S9:** Networks, printed pp.106–114 for local scope, components, wired/wireless connection, addresses and access. The exact fixtures, demonstration sequence and changed-fault challenge are original teaching extensions.
- **S10:** ITGS security-layer organizer; useful distinction between authentication and authorization. It is not used as an OSI model or current official outcome list.
- **S11, inherited optional lenses:** Systems, Power, Values and ethics, and Health page references remain in the project source ledger. In this bootcamp they support a short workflow/access discussion, not a whole-chapter claim.

Primary technical references were checked during content production:

| Reference | Narrow verification used |
| --- | --- |
| [Microsoft, TCP/IP addressing and subnetting](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/tcpip-addressing-and-subnetting) | IPv4 representation, mask/network/host distinction, the `/24` bit boundary and local versus remote destination. Historical class-based material is not adopted as this lesson's addressing method. |
| [RFC 1122 §3.3.1.1](https://www.rfc-editor.org/rfc/rfc1122.html#section-3.3.1.1) | The source uses the mask in the local/remote destination decision; a gateway belongs to a different-network route, not every local service. |
| [Cisco, What is Network Switching?](https://www.cisco.com/site/us/en/learn/topics/networking/what-is-network-switching.html) | Switch versus router roles and the existence of PoE as a real-world function. No branding, artwork, dialogue, maps or proprietary code is used. No blanket vendor security/performance claim is copied. |
| [Dell, Ethernet port hardware guide](https://www.dell.com/support/kbdoc/en-us/000178859/frequently-asked-questions-faqs-about-the-nic-ethernet-port-on-a-dell-pc) | Physical Ethernet socket/clip recognition and supported USB-to-Ethernet adapters. Marketing comparisons, generic cable-speed tables and universal LED meanings are not used. |
| [Intel, HDMI technology FAQ](https://www.intel.com/content/www/us/en/support/articles/000005485/graphics.html) | HDMI's display/audio role. The content describes the mission's Ethernet path rather than claiming that HDMI or USB can never support networking through any specialized implementation. |

The content uses original examples and wording. It does not include an answer paragraph for the independent clinic handover. The foundational review identifies common materials, but does not claim that every real device has the simplified interfaces shown in the game.

## Planning time and teacher debrief

The following is an **unmeasured planning allocation**, not a timer or a promise about beginners:

| Segment | Minutes |
| --- | ---: |
| Welcome and equipment/cable review | 4 |
| Kit | 4 |
| Cables | 5 |
| Address and mask | 8 |
| Wireless | 7 |
| Access | 5 |
| Changed-fault diagnosis and explanation | 7 |
| Review record and enter field | 2 |
| **Nominal total** | **42** |

The student-facing estimate is roughly 35–45 minutes, with pauses or a second session where helpful. Retries and teacher conversation may take longer. Adjust after observing beginners. The separate field mission should be scheduled after preparation rather than squeezed into the same assumed time block.

For the debrief, use the actual training record and ask the student to trace a route, explain one failed result, justify the particular repair, and distinguish a technical failure from an intentional access denial. Ask what remains untested on real equipment. Observation, conversation and product evidence can support a teacher judgement; exact Evidence Map IDs still need reconciliation. Completing six tasks is not automatically six observations of understanding.

## Content acceptance and handoff

`BOOT_CONTENT` contains course/welcome labels, mentor identity, ordered lessons, twelve materials, material categories, four network basics, shared reference text, completion copy, evidence notice and deliberate boundaries. `BOOT_LESSONS` and `BOOT_MATERIALS` are exported arrays; `getBootLesson(id)` returns a lesson or `null`. Each lesson has `id`, `title`, `shortTitle`, `icon`, two/three `goals`, `purpose`, `mentorIntro`, `firstAction`, a demonstration or `null`, a practice task, three hint tiers, optional reference cards, `materialIds`, and transfer-only `reflection` fields. It is serializable copy, not state, pricing or completion logic.

The root accepted the representative address lesson and the final six-lesson/material shape. Module syntax and content-shape checks passed. Exact checks are reported in the worker handoff; these checks do not replace engine, integrated UI, browser or classroom validation.

Remaining acceptance belongs to the integrated implementation: visual legibility of the guide, correct association of narration with the model step, all learner gates, save/reload/recovery, screen-reader/keyboard/zoom behavior, actual school Windows/browser policy and a small beginner pilot. Teacher decisions remain pacing, how much verbal support to provide, the quality of the transfer explanation and official curriculum/Evidence Map alignment.
