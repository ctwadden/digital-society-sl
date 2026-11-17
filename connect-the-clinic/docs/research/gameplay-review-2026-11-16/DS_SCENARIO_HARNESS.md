# One client-job framework, several Digital Society simulations

**16 November 2026 · proposed architecture · no new scenarios implemented**

## Design decision

The format can support hardware, security, media and health through a recurring role: investigate a client's need, make a plan, change a system, test it, respond to consequences and hand over an explanation. Each topic needs its own causal rules. Changing the room and dialogue around the same cable exercise would provide little additional learning.

The [current contract](../../../CONTRACT.md) and [model](../../MODEL.md) provide useful foundations, but currently specify one clinic contract and settlement. The [Opening Shift proposal](FIRST_CLIENT_MISSION.md) remains the next playable milestone. The reusable framework should emerge from that working mission and one carefully bounded extension.

## Shared framework and topic-specific models

| Shared across jobs | Defined by each simulation |
| --- | --- |
| Phone, client brief, questions and readable job notebook | Client requirements and which answers affect the plan |
| Inventory, purchases, returns and disclosed simulated costs | Item capabilities, compatibility and resource constraints |
| Bootcamp, graduated guidance and free teacher-selected practice | Demonstrations, distinct transfer problems and domain explanations |
| Scene selection, inspectors, keyboard/list controls and test feedback | Components, connections, operations, faults and observable tests |
| Local recovery, progress import/export and frozen handovers | Versioned state schema, validation and evidence interpretation |
| Contract history and future job offers | Conditions for offering subsequent work; alternative successful routes |

The career system records fictional business consequences. It does not infer academic mastery from income, customers served, speed or hint use. Client equipment allowances remain separate from contractor fees unless a later contract explicitly models a different arrangement.

## Concrete mission contract

Each mission definition should declare stable `missionId`, `missionVersion`, `domainId`, `modelVersion`, `fixtureId`, asset IDs, requirements, allowed actions, probe definitions, initial faults, explanation prompts and source references. Attempts retain their original versions and deterministic fixture selection. These are proposed software identifiers, not curriculum codes.

Preserve the existing `dispatch`, `derive`, `createEvidence` and `validateSave` boundaries. The domain model handles an action and returns the next state plus events. Mission progression reads model evidence; it cannot invent a pass. The interface displays selectors and sends actions. Purchases and physical changes update one authoritative campaign atomically, including stock and affected observations.

Every probe records its context, model revision and result reason. A relevant change makes earlier results stale. Evidence distinguishes player actions, prepared equipment, demonstrations and derived checks. A valid alternative may satisfy a requirement without reproducing the author's preferred sequence. Retaining an appropriate setting can be an explicit decision.

Settlement remains idempotent per contract; replay is a separate practice attempt. Migration must preserve old clinic deliveries, explanations and payments. The present single-contract validator needs deliberate revision before additional paid clients exist. Keep modules local and original; no backend, accounts, paid AI service or new hosting dependency is required by this design.

## Proposed scenario matrix

These are design proposals, not claims of implemented features or complete chapter coverage.

| Context and client need | Player operations and causal outcomes | Stakeholder decision |
| --- | --- | --- |
| **Hardware — equip a community media workstation** | Inspect and disassemble an existing computer; choose compatible parts; reassemble; run boot and stated workload checks. Missing or incompatible memory prevents the relevant check; adding storage cannot repair that condition. A compatible build with sufficient declared capacity can pass. | Reuse and affordability versus workload needs, repairability and replacement waste. |
| **Security — restore safe access for a student organisation** | Inspect a synthetic sharing configuration, grant required roles, revoke unnecessary access and test both legitimate and outsider requests. Public access exposes the protected resource; denying everyone also fails the work requirement. | Convenience and delegated responsibility versus restricted access. This is an authorization model, not proof of complete cybersecurity. |
| **Media — prepare an accessible local-news package** | Select source assets, edit a sequence/crop, add captions and choose an export profile. Tests check actual caption presence, package size and declared delivery constraints; the preview reflects the edited content. Excessive size fails delivery. | Audience access, context, consent and editorial priorities. Evidence shows source/edits; the teacher judges accuracy and framing rather than a hidden opinion score. |
| **Health — support an offline collection and return service** | Collect synthetic markers, preserve them locally, return, transfer and upload through an authorized working path. Offline collection cannot claim central arrival; a successful receipt is created once per marker. | Continuity, access, workload and privacy. No patient identities, medical readings or claims about clinical outcomes. |

Media file-size and workload models need explicit authored assumptions and tests. Neither social reach nor clinical benefit should be fabricated as a consequence meter. The current wearable journey supplies a narrower health foundation; the other proposed models require engineering.

## Bounded next extension: one computer that can be taken apart

After Opening Shift passes review, add one upgradeable workstation and one client workload. Use a fixed cutaway or exploded view with a fully equivalent parts list. Start with case, motherboard, CPU, memory, storage and power supply; a short fictional catalogue makes the choices inspectable.

Track installed part instances, slots, seating, power connections, power isolation and inventory. The compatibility table declares CPU/socket, memory generation/capacity, storage interface, case/board fit and a simplified power allowance. Explain these assumptions; do not imply full electrical, thermal or mechanical emulation.

Students isolate power, remove a part to inspect it, choose a replacement or reuse route, install it and run diagnostics. Reject a removal action while the model says power is connected, without partially changing stock. Support reversible reassembly and returns. A missing-memory fixture provides a useful mistaken-repair case: changing the drive does not restore the memory check.

Acceptance requires two feasible equipment plans, truthful failure reasons, successful repair and retest, preserved inventory through reload/import, and evidence linking the chosen parts to the client's needs. Synthetic workload thresholds describe the exercise; they are not real benchmark results. CPU internals, circuit repair, thermal damage and operating-system installation are deferred.

## Learning evidence and delivery gates

Show only two or three current goals. Proposed hardware wording:

- I can choose compatible components that meet a stated need and explain a trade-off.
- I can use an observation to choose a relevant repair and check its effect.
- I can explain how my recommendation affects the client and another stakeholder.

The [existing source alignment](../../SOURCE_ALIGNMENT.md) records Computers L1/L2, Networks, a security organizer and selected Systems, Power, Values and ethics, and Health pages. L2 currently supports component vocabulary; this is not a fresh audit of its full teaching scope. Hardware compatibility/workload content and media connections need source review before coverage claims. No official outcome or Evidence Map identifiers are invented.

Export actual decisions, before/after observations, costs, explanations and pending oral review. Preserve Observation/Conversation/Product opportunities and let the teacher judge understanding. Require the valid routes, plausible mistakes, recovery and keyboard interactions to work in the published build, then test on managed school Windows browsers and with beginners. Bootcamp remains distinct from independent work; reading and accessibility actions incur no real-time penalty.
