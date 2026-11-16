# Guided first connection — game and learning design

> Public export: private source locators and former hosting metadata have been removed. Historical implementation records are retained for context; see the project-root MIGRATION.md and qa/EXPORT_TEST_RESULTS.md for this export. Some historical review files referenced below are intentionally not included.


**Status:** design handoff complete; implementation and learner observation not performed by this worker.

**Date:** 15 November 2026, America/Halifax. **Scope:** one introductory guided lesson before the existing independent equipment station. Lead owns the exact new engine API, migration and final acceptance. This file supplies original copy and learning requirements only.

## Inputs and learning boundary

Read: `CONTRACT.md`, `docs/research/ASPIRE_RESEARCH_AND_DESIGN.md`, `docs/SOURCE_ALIGNMENT.md`, `dist/content/experience.js`, and `dist/content/learning.js`. Applied the Learning Simulation Design skill and its handoff matrix. The underlying supplied textbook/lesson files were not re-read in full during this assignment; the existing source alignment remains authoritative. No new official curriculum mapping is asserted.

Learner assumption: a high-school beginner who has never operated this simulation or selected network ports. No address knowledge is required for this lesson. Duration is unmeasured; observe the first meaningful success in the pilot rather than promising a time. The current client, full bootcamp, addressing transfer, privacy work and evidence exports remain in place.

The lesson teaches **physical connection → actual test → changed condition → actual retest**. It does not teach general subnetting, routing, switching internals, realistic packet timing or appointment processing. A pass means that the modelled booking service is reachable with the role's permission.

## Two visible goals

These are original contextual formulations of existing internal learning goals, not official outcome codes.

| Existing internal learning basis | Displayed I-can statement | Learner evidence | Human purpose |
| --- | --- | --- | --- |
| `cc.clinic.connection-choice`; `cc.clinic.system-path` | I can connect available network ports and test whether a service is reachable. | Player-created cable and current reception probe; identify endpoints and recorded route | Reception can reach the booking service |
| `cc.clinic.diagnosis`; `cc.clinic.system-path` | I can explain why a connected cable and a working service are different claims. | Actual disconnect/test/repair/retest observations and learner's own explanation or pending oral review | Explain the evidence before telling the receptionist that service is restored |

Keep these two goals available without expanding the full curriculum list. Full learning map remains in the notebook. Completion supplies evidence for teacher review; it does not certify understanding.

## Prepared setup and narrative

The engine supplies a powered desktop for reception, powered switch, powered server, enabled shared services, valid local addresses and suitable permissions. The server is already connected to the switch. The reception connection is absent. Mark all supplied setup as trainer origin; it cannot count as learner equipment choice or configuration.

Open with **Jo**, not competing Jo/Ari/build invitations. Ari's client work remains after the existing bootcamp. One original phone message is sufficient:

> **Jo · Field technician · Free practice**
>
> **Your first connection**
>
> Reception needs to reach the booking service on this server. I’ve prepared the equipment. You’ll make the missing connection.
>
> **Find reception’s port**

This action focuses the actual reception device and relevant port control. It is presentation/navigation, not proof of learning. The scene labels trainer-provided equipment and preserves the real model's device names. The available tools remain reachable, but the current operation takes priority.

## Stage copy and causal handoff

The keys below are stable **content keys proposed for integration**, not additional curriculum IDs. The lead/engine owner chooses the exact readiness fields and new orchestration actions. Ordinary technical actions already exist.

| Content key | Heading and exact main text | Primary control | Authority required |
| --- | --- | --- | --- |
| `guided.arrival` | **Your first connection.** Reception needs to reach the booking service on this server. I’ve prepared the equipment. You’ll make the missing connection. | **Find reception’s port** | Engine identifies guided attempt; navigation changes no technical state |
| `guided.port` | **Find the network socket.** Select Reception’s Ethernet port. Ethernet is the wired connection used in this practice. | **Choose the other end** | Selected real device/port; selection is an interface action, not a completed learning outcome |
| `guided.connect` | **Join two available ports.** A cable uses one socket at each end. Choose a free Ethernet port on the switch, then connect. | **Connect ports** | Existing `CONNECT_PORTS`; only actual free compatible ports; keep both endpoints visible |
| `guided.test` | **Does the service work?** The cable is connected. Predict what will happen, then test whether reception can reach the booking service. | **Test reception bookings** | Actual successful cable action; no service-success claim before current `RUN_PROBE {testId:'reception'}` |
| `guided.pass` | **Reception can reach the service.** Follow the recorded route from reception to the server. The test checked this setup, not every possible fault. | **Try the cable experiment** | Current passing reception observation, not merely cable count or an animation |
| `guided.experiment` | **What changes without this cable?** We’ll unplug the selected reception connection, then test again. This is free practice. | **Unplug this cable** | Player explicitly chooses/accepts a real cable target; ordinary `DISCONNECT_CABLE` records the actual action |
| `guided.changed` | **The setup has changed.** The earlier test is now out of date. Predict the result, then run a fresh test. | **Test reception bookings** | Technical revision differs from the old observation; no assumed failure |
| `guided.repair` | **Restore a path.** The test found no complete wired path. Connect reception to an available switch port, then test again. | **Reconnect ports** | Fresh `PORT_DISCONNECTED` observation supports this wording; use actual diagnostics for other failures |
| `guided.repaired` | **Service is reachable again.** Compare the latest result with the test after unplugging. What changed between those tests? | **Explain what changed** | Current passing retest after the actual reconnection; actual observations remain available |
| `guided.reflect` | **Tell Jo what the tests showed.** What changed when you disconnected and reconnected the cable? What did the tests tell you that the cable picture alone could not? | **Save my explanation** | Learner-authored text through the existing explanation pattern, scoped to this guided attempt; teacher review pending |
| `guided.complete` | **Ready to choose your own setup.** You connected and tested prepared equipment. Next, choose a reception computer and build a working path yourself. | **Start independent practice** | Engine confirms actual required guided work and preserved explanation/oral arrangement; next bootcamp remains independent |

A prediction can be spoken or thought privately. It must not add a mandatory quiz, correctness score or long written stop before the action.

### Labels beside the objects

Use one short helper at a time, with the actual selected object remaining visible:

- **Reception computer:** “This is the computer that needs the booking service.”
- **Server:** “The booking service runs on this computer.”
- **Switch:** “This switch joins the wired devices in this local network.”
- **Ethernet port:** “One cable connects here. An occupied port already has a cable.”
- **Test:** “A test checks the current setup. A change means you need to test again.”

Do not begin with adapter, wearable, privacy, subnet or router explanations. Their later lessons and tools remain available without competing with the first action.

## Immediate action feedback

Resolve these templates from the accepted action and returned real device/port labels. Content must not infer acceptance independently.

| Actual result | Text |
| --- | --- |
| Accepted connection | **Connected {from device} — {from port} to {to device} — {to port}. Test the booking service to see whether it works.** |
| Occupied port rejection | **{port label} already has a cable. Choose another free port, or disconnect its existing cable first.** |
| Other invalid endpoint rejection | Use the engine's actual reason, keep both selected endpoints visible, and offer the corresponding selector for correction. Do not silently substitute an endpoint. |
| Accepted disconnection | **Unplugged {from device} — {from port} from {to device} — {to port}. Run a new test to see what changed.** |
| Fresh missing-path test | **Reception cannot reach the service: the wired path is incomplete. Inspect the cable endpoints before changing a setting.** |
| Current passing test | **Reception can reach the booking service in the current setup.** |
| Stale previous pass | **This test describes an earlier setup. Run it again after your change.** |

If the engine only returns a general `PORT_OCCUPIED` error, the UI must not falsely name a specific offending port. The lead may add precise engine-backed endpoint details, or keep the existing general error and visibly mark each actual occupied selector option.

## Alternatives, exploration and recovery

Any supported free switch port and endpoint direction can work. A direct valid route or other supported configuration must not produce a false technical failure. The suggested switch route is the teaching example, not a hidden topology password.

If the post-disconnection test still passes because another path exists, use this branch:

> **Another path still works.** The test reached the server by the route shown. Removing one cable did not remove every working route.

Ask the learner to inspect that actual path. Offer a clearly labelled **Try the prepared cable experiment** route only through the engine's agreed guided-setup/retry policy; never remove other cables silently or fabricate a failure. Preserve the explored attempt and its evidence. The engine contract must decide whether a correctly explained alternative completes this guided objective or whether the prepared experiment is a separate supported attempt; the UI must not invent that decision.

If exploration causes a different fault, show the actual diagnostic and point to the relevant control. Do not repeatedly tell a learner to reconnect a cable when the current problem is power, address, service or access. Free help and a clearly labelled guided retry prevent dead ends. Retry must follow established confirmation and preservation boundaries; opening Help never resets progress.

Old saves resume their actual work. They do not retroactively earn guided completion or lose independent work because the new lesson exists. Reopening guided practice should be an explicit separate path, not an automatic replacement of a saved client attempt. Quotes and reservations in any client job remain intact.

## Graduated help and demonstration

All guidance in this lesson is free. Keep the hint adjacent to the current operation and reveal one level at a time:

| Stage | Notice | Narrow | Concrete help |
| --- | --- | --- | --- |
| Connection | Which device needs the service? | Find its Ethernet port and an available switch port. | Highlight those real selectors and explain their labels; the student still chooses and connects. |
| Test | What has changed so far? | A cable is visible, but service availability needs a test. | Point to **Test reception bookings** and keep the result beside it. |
| Repair | What does the latest test say? | Inspect the missing section of the actual path. | Point to the disconnected device and available compatible endpoints; student performs the repair. |
| Reflection | Compare the results before and after your change. | Describe the change and the evidence it produced. | Offer a sentence frame: “I changed ___. The next test showed ___.” Never fill the blanks for the learner. |

An optional **Show me the controls** walkthrough may spotlight fields at the learner's pace. If it does not perform technical work, describe it as control guidance. If a demonstration creates cables or tests, it must run in a labelled demonstration state whose events never count as the learner's practice. Do not call a completed snapshot an animation or a visible action demonstration.

## Evidence and teacher debrief

Save the guided attempt's actual setup origin, player connections/disconnections, ordered test observations, configuration revisions, and the student's exact explanation. Reuse the existing per-attempt explanation/oral-review pattern where appropriate; do not overwrite the later independent or client repair explanation. The lead owns schema details.

Reflection alternative: **I’ll explain this to my teacher**. Status: **Oral explanation pending teacher review**. This is an arrangement, not evidence that the conversation already occurred. Saving any text is evidence presence only; the game must not evaluate reasoning quality or award an IB grade.

Teacher questions:

1. “Which parts did your request travel through, and how do you know?”
2. “Why did you run another test after changing the cable?”
3. In the later physical-fault transfer, after addresses have been taught: “Why would changing an IP address leave this missing link unresolved?”

The teacher can observe operation, discuss reasoning and inspect the exported record. These are evidence opportunities, not automatic confirmations of mastery. The human consequence is reliable advice to reception about reaching its service; no patient information or fabricated appointment is introduced.

## Acceptance and handoff risks

Contract-reviewed success route: select real endpoints → connect → current passing test → explicit unplug → fresh actual failure in prepared fixture → reconnect → current pass → own explanation/oral arrangement → independent equipment station.

Contract-reviewed mistake route: select occupied switch port → rejected action and unchanged model → specific available-port guidance → correct choice → real connection. Alternative route must remain a real pass when supported. Existing later address-to-physical-fault transfer remains intact.

Implementation gates:

- One clear opening action; selecting equipment does not hide the needed sentence.
- Immediate endpoint feedback and visible actual cable; focus remains usable with keyboard and at supported zoom/narrow layouts.
- All technical outcomes and progression come from the engine; navigation and seeing a highlighted port do not claim mastery.
- Trainer equipment, demonstrations, independent actions and pending oral evidence remain distinguishable in save/export.
- A current test, not script timing, controls successful service language. Alternative routes remain accurate.
- Ordinary help costs nothing and cannot erase work. No new login, runtime AI or external account is needed.
- Guided lesson transitions to the existing independent station, not directly to the client or completed bootcamp.
- Full integrated/browser/recovery checks and an unfamiliar learner walkthrough remain required; this document has not tested those.

**Contract risks for lead resolution:** new guided state/provenance; migration/default entry behavior; preservation when returning from optional guided retry; model-backed completion for an alternative still-working path; the exact field used for guided explanation. None may be decided only by UI flags.

**Ownership:** only this file was written. No production, tests, deployment, account or access changes. No worker subdelegation. One bounded design pass completed.
