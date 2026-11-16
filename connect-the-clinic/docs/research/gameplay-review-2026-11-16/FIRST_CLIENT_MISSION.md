# Proposed first client mission — Opening Shift

**Status: design specification for the next build; not implemented.**

Proposed internal ID: `mission.clinic.opening-shift.001`. This is a project ID, not a curriculum outcome code. Versioned mission fixtures and contracts must preserve earlier 0.6 saves, evidence and payments. Existing production contracts remain authoritative until the implementation is integrated and verified.

## Experience promise

The player is a junior technology contractor helping a partially working clinic prepare its mobile nursing workspace. They investigate, choose a plan within a constraint, repair a service, test it in both rooms and make an access recommendation. The workplace remains intact as it improves.

**Original phone brief, proposed:**

> Ari — clinic coordinator: Reception can use the booking service, but our nurse's setup is unfinished. We need it working in both exam rooms for the afternoon shift. Check what we already have, stay within the equipment allowance and tell us who should be able to use each service.

The brief supplies the goal and constraints. It does not announce the faulty IP or highlight the cable that should be repaired.

## Preparation and scope

Keep the teacher's requested bootcamp before independent client work. Show this upcoming brief during preparation. Teach three distinct capabilities with free help: physical path and equipment roles; a valid unused address using a network card; choosing a diagnostic and transferring to a different physical fault. Keep the existing short connection demonstration available. Remove the requirement to repeat an identical equipment recipe solely because fixture numbers changed.

Allow the existing teacher-directed prior-learning route, clearly recorded as such. Do not award unseen bootcamp completion. Independent client hints may retain the current disclosed/capped fictional consultation arrangement; controls, accessibility and diagnostics remain free. There is no wall-clock pressure while reading or thinking.

Initial planning target: 20–30 minutes for the independent shift after preparation; first useful client-visible result within five minutes. These are unmeasured targets for a pilot, not required student times.

## Starting state and stable identity

One clinic contains the existing reception, exam A, exam B and equipment locations. A service-workbench presentation at the entrance exposes the brief and inventory without creating a second city.

- The central service host and existing four-port switch are powered and connected. Reception is powered, correctly configured and currently passes its booking-service check. These are client-provided resources, never learner equipment-selection evidence.
- A clinic-owned laptop is available for the nurse. It is portable and has Wi-Fi capability. Its inherited address profile is outside the clinic subnet. That profile and its provenance are visible when inspected.
- A wireless access point is available in kit stock but not installed; its uplink must be supplied. This is a physical setup requirement, independent of the nurse's address fault.
- The network card identifies the local subnet, server and already-used addresses. Addresses must be unique and usable under the declared mask. Existing bitwise checks remain authoritative.
- The initial policy supports reception bookings and nurse workspace while denying outsider access. Nurse booking permission is the later decision. This is simulated application authorization, not a VLAN or a real authentication system.
- The fixture contains its requirements and faults from the start. Do not secretly undo successful work to force a dramatic failure.

The scenario needs a new authored fixture and a revised acceptance profile; it cannot be achieved by hiding the old full-clinic marker requirement in the UI.

### Explicit fixture variants

The bullets above define variant A. Variant B is an authored transfer version, not a fault secretly introduced after success. Both preserve the working reception baseline.

| Initial condition | A — unfinished installation | B — previously working uplink disconnected |
| --- | --- | --- |
| Stable variant ID | `fixture.clinic.opening.address-and-install.001` | `fixture.clinic.opening.uplink-transfer.001` |
| AP ownership and installation | Shop stock; must be bought, installed and powered in the equipment location | Clinic-owned; installed, powered and declared to cover both exam locations |
| AP uplink | No installed cable; the required cable costs 4 credits | Clinic-owned cable retained at the AP end; its switch endpoint is disconnected |
| Nurse laptop | Clinic-owned, powered; wrong-subnet deployment profile; no association until the AP is installed | Clinic-owned, powered, already associated with the AP; correct unused address and mask |
| Assessed fault | Wrong-subnet profile on the active nurse device; AP installation is a separate requirement | Disconnected switch endpoint on the existing AP uplink; unrelated address edits cannot repair it |
| Tablet replacement profile | Initial assignment copies the same wrong-subnet clinic deployment profile once | Initial assignment copies the same correct clinic deployment profile once |
| Reuse plan / replacement plan | 44 / 114 credits | 0 / 70 credits |
| Remaining allowance after those plans | 136 / 66 credits | 180 / 110 credits |

Profile initialization is an explicit, logged setup rule shown to the player. It is not learner configuration evidence and never silently overwrites later edits or repeats on reassignment. The old laptop is powered off, disassociated and retained in stock before its role/profile moves to a replacement, so it cannot create a duplicate live address. Acceptance concerns the active nurse service and the recorded initial cause; it never requires repairing a retired device. Variant B records the already-existing cable as disconnected; installing a new link in variant A must not be mislabelled as diagnosis of a previously working link.

## What the player decides

| Beat | Player decision/action | Causal response | Evidence |
| --- | --- | --- | --- |
| Survey | Ask what still works, where the nurse must work, and whether nurses should book follow-ups; inspect equipment | Stable requirement facts enter the job notebook; existing service probes distinguish working from unfinished areas | Questions asked, inspected devices and baseline observations |
| Plan | Reuse the nurse laptop or recommend a lighter replacement; choose needed infrastructure and available ports | Actual inventory reservations and remaining equipment allowance change | Item IDs, quantities, costs, declared trade-off |
| Install | Place/power the AP; join its real uplink; associate the nurse radio | A valid physical route exists only if actual endpoint/power/location rules pass | Connections and association events |
| Configure | Compare nurse settings with the working network and select a valid unused host address/mask | Wrong subnet/duplicate/reserved address remains a specific failure; valid configuration enables the next layer | Before/after settings and probes |
| Diagnose | Choose a relevant next test and repair a remaining cause | An IP change cannot mend the missing uplink; a cable cannot repair an unsuitable address | Observed initial condition or failed probe → actual repair action → fresh successful test |
| Use the workplace | Try the nurse workspace in exam A and exam B | Current observations show whether the actual device can work in each required location; reception must remain available | Explicit player room tests, separately labelled engine validation |
| Decide access | Recommend separated duties or allow the nurse to book follow-ups | Nurse bookings remain reception's responsibility under separated duties, or become available under nurse-also-books; outsider requests remain denied | Chosen or explicitly retained policy, matching staff reply and actual allowed/denied tests |
| Handover | Check the job, explain the repair and stakeholder trade-off, submit | Current engine checks determine readiness; receipt and evidence use actual transactions and observations | Concise handover, frozen service fee and one-time settlement |

The survey and implementation need not have one mandatory click order. Requirements must also be available as readable text; dialogue is not a memory or reaction test.

## Two feasible plans and an honest economy

**Illustrative teaching values only; not commercial prices.** Keep the equipment allowance separate from the contractor's fee so existing guide accounting is not confused with purchasing.

Proposed equipment allowance: **180 credits**. Existing clinic-owned equipment costs **0** to retain. Proposed stock: AP **40**, Ethernet cable **4**, optional tablet **70**. The current laptop and tablet capability differences and staff preferences remain visible; do not invent measured typing speed, reliability or clinical productivity.

| Plan | Equipment transaction | Cost | Remaining client allowance | Reasonable trade-off |
| --- | --- | ---: | ---: | --- |
| A: reuse | Retain clinic laptop; install AP and one uplink cable | 44 | 136 | Preserves funds and a keyboard; carries the existing bulkier device |
| B: replace for mobility | Retain the old laptop in stock; install tablet, AP and one uplink cable | 114 | 66 | Spends more for a lighter touchscreen; extended typing may be less convenient |

Both plans must pass the same declared service/mobility/access requirements. The table describes variant A; variant B already owns the installed AP and uplink, so its reuse/replacement costs are 0/70 credits as specified above. The nurse's preferences support a human judgement; they are not a hidden numeric score. Replacement uses the explicit profile rule in the fixture table. Variant A still requires a valid configuration for the active nurse device; variant B assesses physical repair without demanding an unnecessary address change.

Retain the current 120-credit service fee and capped guide costs for this first prototype unless the lead deliberately versions new terms. The student's fee is not increased merely by withholding needed equipment. Record the client's unused allowance separately. A later fixed-quote/profit economy could be added deliberately; it is not already present and must not be conflated with this budget.

Before settlement, any mission purchase can be uninstalled and returned for its recorded purchase price. Returning an installed item disconnects its links, clears any association/role assignment and makes affected tests stale before restoring stock and credit exactly once. Client-owned starting equipment has no purchase refund. Returning a tablet leaves the retained clinic laptop available for reassignment. No spending path may create an irreversible cash dead end; offer return/revise controls. Purchases, refunds, imported saves and settlement must not duplicate stock or credits. Test a save/import between purchase and return as well as a repeated return request. Practice can explore freely without changing the paid job's ledger.

## Diagnosis and transfer

Training should teach address comparison before expecting it independently. The independent fixture combines an unfinished physical route with an inherited wrong-subnet profile. Tests reveal each layer in a consistent order. The student may identify the settings during inspection before recording a failed service probe; evidence must record that proactive repair honestly rather than require them to break the setup to earn a repair check.

Authored variant B provides the physical-cause transfer defined in the fixture table: the nurse's address starts correct while the existing AP uplink has a disconnected switch endpoint. Only the actual relevant repair is required. Variant selection is deterministic and recorded in the save; reload does not reroll a fault. A later stopped-service variant can reuse the same diagnostic approach once the general fault contract works.

The existing ordinary client's address-specific `repaired()` gate must be generalized before these variants can be accepted. Each fault records its initial condition, observable evidence, permitted repairs and current state. Alternative valid repairs pass; memorizing one repair action does not.

## Phone and visible human consequences

The phone supports three useful requirement questions and one later access recommendation. All text is original. Proposed question/reply IDs are stable mission content IDs, for example `question.clinic.working-services`, `question.clinic.nurse-locations` and `decision.clinic.nurse-bookings`.

The policy request appears before the decision: the nurse asks whether they may book follow-ups from their workspace. A separated-duty response remains reasonable if the player explains that reception retains that responsibility. Allowing nurse bookings is also reasonable if authorized staff can use it while outsider requests stay denied. The game records which workflow the player selected; it does not manufacture legal compliance or a grade.

Show a small synthetic application result after a fresh test: booking lookup available, workspace available here, request denied by policy, or service unavailable with the observed reason. The staff message must refer to that result. A visual flourish cannot declare success independently. Current and stale observations remain distinct.

## Level and visual specification

- **Entrance/workbench:** client portrait, outcome-based job card and small inventory/allowance panel.
- **Reception:** a visible working desk and service screen; a baseline the player should preserve.
- **Exam A:** nurse and portable device; useful place to inspect symptoms and configuration.
- **Exam B:** a meaningful second location for the mobility check, not a repeated empty build screen.
- **Equipment room:** host, switch, AP uplink and power/port inspection.

Use a coherent fixed cutaway with continuous floor and consistent furniture scale. Unselected devices sit on desks/shelves with compact labels. Selecting one opens a readable HTML inspector. Workplace, network overlay and list view expose the same state and actions. Keep keyboard focus, reduced motion, non-colour status cues and non-drag controls.

The spatial art does not establish a subnet or radio propagation result. Named-location coverage remains an explicit simplification. The later at-home activity stays visibly outside the clinic boundary.

## Proposed I-can statements and evidence

These are teacher-facing proposals, not verified official outcome wording. Reconcile them with the supplied Computers/Networks materials and existing map before making curriculum-coverage claims. Show two or three current goals at a time.

1. I can explain how a device and connection choice fits a person's work and a resource constraint.
2. I can use the network information to choose a valid unused IPv4 address and explain what the mask helps determine.
3. I can use observations to distinguish a physical-path problem from an address or service problem.
4. I can demonstrate the required service in its intended locations without breaking an existing service.
5. I can justify an access choice by explaining whose work becomes easier and whose access remains restricted.
6. I can hand over an account of what I changed, tested and still simplified.

Observation/conversation/product evidence remains for teacher review. A job count, income threshold, speed or hint count can support fictional progression but cannot independently certify understanding or create an IB grade. No names or patient information are requested.

## Engineering ownership and boundaries

| Owner | Owned work for implementation | Inputs | Acceptance output |
| --- | --- | --- | --- |
| Lead integrator | Versioned mission contract, schema/migration decisions, integration and release | Existing authoritative engine/API, this proposal, accepted teacher source map | One agreed contract; no competing success logic; legacy saves/receipts preserved |
| Mission/content specialist | Brief, questions, graduated hints, I-can mapping, debrief | Mission facts/actions and supplied lesson text | Every teaching claim names an actual action/probe; source uncertainty explicit |
| Simulation engineer | New fixture, requirements/fault evidence, inventory/transactions, acceptance profile | Stable role/device/port IDs and legacy persistence constraints | Two valid routes; wrong repair fails; budget/refund/import/settlement invariants |
| Interface/game-experience specialist | Survey, inventory, phone replies, service demonstration and scene interactions | Engine selectors/actions and accepted phase structure | Useful choices visible; current task clear; no precision-drag requirement |
| Art specialist | Original five-area scene and device/service-state variants in the existing asset manifest | Camera/scale specs and actual state keys | Every visual state maps to model state; legible at school viewport sizes |
| Independent QA | Tests and observations only; no production ownership | Contract, raw build, supplied source map | Causal, evidence, accessibility, recovery and published-browser findings; school checks separate |

The current static stack and original assets can remain. Do not add a backend, login, AI runtime service or paid hosting. Do not rebuild the networking engine solely to change the camera. Networking extension work is separate: a real second-network requirement, router/gateway forwarding, then DHCP or further subnet tasks with their own causal tests.

## Acceptance gates

- Both plans meet the brief; costs and remaining allowance reconcile exactly with transactions.
- Both fixture variants accept inspection-led repair without a recorded pre-repair service failure; evidence never invents that failure or requires repair of a retired device.
- An unused valid address passes; malformed, duplicate, reserved or unsuitable addresses fail for their actual reasons.
- A missing uplink fails after an unrelated address edit and passes after a valid physical repair and fresh test.
- Reception's baseline service still works at handover; an apparent nurse repair that breaks reception cannot complete the job.
- The nurse can perform the required service in both rooms; player tests and derived engine checks remain distinguishable.
- Both responsible access policies can pass with their respective workflow consequence; broad access and deny-all fail the corresponding requirement on a functioning service.
- A justified decision to retain the initial separated policy counts without a token policy-change action. Replies and exports report that choice accurately.
- Independent task wording reports symptoms; diagnostic feedback reveals the relevant observation. It does not announce an unobserved hidden cause.
- Evidence contains actual choices, purchases/reuse, tests, repair and unaltered explanation or explicitly pending oral review.
- Legacy/current import, damaged input, save/reload, restart, multiple tabs, draft retention, refunds and one-time settlement remain safe.
- The new sequence is played end to end on the published origin, then on the actual school browser. A beginner pilot records comprehension, hesitation, help use and time to a meaningful result.

## Deferred without losing the larger vision

Keep the wearable offline collection/return/authorized-upload work as a distinct clinic follow-up with its own source-aligned evidence. Mark that follow-up incomplete until actually played; do not label this narrower shift as completion of every old four-role objective.

After this shift works, build a versioned mission/contract collection for follow-up work and other customers. The current one-contract validator cannot support a career by adding phone cards alone. A city, walking animation, live patient queues, radio-physics modeling and a complete professional networking emulator remain outside this slice.
