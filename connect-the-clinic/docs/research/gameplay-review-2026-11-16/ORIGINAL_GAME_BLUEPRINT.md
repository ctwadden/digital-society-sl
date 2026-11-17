# Original Digital Society client-job game — integration blueprint

**16 November 2026 · lead synthesis of the supplied Aspire package · proposed implementation, not a new release**

## Product decision

Build one original client-job game with a shared phone, consultancy history, resources, guidance and evidence workflow. Give each subject its own causal simulation. The first substantial clinic shift establishes the framework; a bounded hardware job then tests whether it is reusable.

The teacher's larger idea is viable as a design direction: students can assemble a computer for a client's work, correct a security/access configuration, prepare a media package, or support an offline health-data workflow. Each job should ask the player to investigate, act, test and justify a trade-off. Money and job completion can unlock game progression; teacher judgement of understanding remains separate.

The authoritative proposed first mission is still [Opening Shift](FIRST_CLIENT_MISSION.md). This blueprint supplements that specification with architecture and presentation findings. It does not override its fixtures, budget, privacy alternatives or recovery rules.

## Evidence that changes the design

The supplied package gives stronger structural evidence than the earlier documentary review. See [package findings](LEGACY_PACKAGE_FINDINGS.md), [visual findings](LEGACY_VISUAL_ARCHITECTURE.md) and [verification](LEGACY_RETRIEVAL_VERIFICATION.md) for inspected paths, counts and limits.

| Inspected evidence | Original implementation decision |
| --- | --- |
| Separate client-level and contract-level state-machine documents | Represent the client's offers/follow-ups separately from work within an accepted job |
| Phone acceptance, refusal, missed-call and callback branches | Give messages useful questions, choices and later consequences, with a persistent job notebook |
| Conditions referring to equipment purchasing, placement and activity completion | Connect progression to model observations and resource transactions |
| Conversation and payoff stages around completion checks | Treat handover as a model-checked transaction; do not let a dialogue button independently award success |
| Shared completion and timeout documents | Reuse progression mechanisms while authoring different job conditions; choose accessible pacing deliberately |
| Furnished cutaway artwork supplied separately from device/detail imagery | Use an original layered 2D workplace with inspectable equipment and readable selected-object panels |

These are observations of packaged authoring structures and source images. They do not prove that all historical branches execute in the installed game. Our new implementation must earn its own correctness and usability evidence.

## One authoritative state, three layers of responsibility

### 1. Topic model

Each domain defines entities, capabilities, permitted actions, faults and tests. A network model checks physical paths and addresses. A hardware model checks parts, slots, power and compatibility. A media model evaluates the actual edited/exported package against declared requirements. They share an interaction/evidence interface, but do not share pretend success rules.

### 2. Mission and client progression

Mission logic reads the model's observations and transaction history. It determines which client questions, offers, follow-ups and handover conditions are appropriate. The client can react to a demonstrated service, an unmet requirement or a chosen trade-off. Only this layer decides whether the current contract is eligible for settlement, using authoritative model evidence.

### 3. Presentation

The workplace, phone, inspector and equipment controls display the same state and send player actions. They never maintain independent correctness flags. A scene animation or congratulatory message cannot make a failing system pass.

All three layers operate on one versioned saved campaign. The split is code responsibility, not three competing stores. Events, observations and receipts retain stable IDs. A meaningful model change invalidates affected earlier observations. Guided preparation, player tests and derived checks remain distinguishable in evidence.

## The proposed mission interface

Each authored job declares:

- Identity: mission, version, topic-model version, fixture and client IDs.
- Requirements: services/workloads, locations, resource limits and access constraints.
- Starting conditions: client-owned equipment, stock, existing working services, faults and profile provenance.
- Available actions and tests: model actions with readable labels, keyboard equivalents and result reasons.
- Questions and decisions: stable requirements facts, original dialogue, alternatives and observable consequences.
- Progression conditions: offers, accepted work, support, handover and follow-up conditions expressed over authoritative evidence.
- Economy: client funds, contractor fee, purchase/return ledger and one-time settlement terms.
- Teaching: source references, two or three current I-can goals, graduated hints, explanation prompts and teacher-review status.
- Recovery: validation/migration rules, draft retention, replay semantics and protected historical receipts.

A mission must be able to accept more than one reasonable implementation where its brief permits. An action history proves what happened; it does not require a prescribed sequence merely to resemble the author's solution. Retaining a suitable existing device or policy can be a legitimate decision.

## First implementation sequence

| Milestone | Owned work | Acceptance gate |
| --- | --- | --- |
| **1. Opening Shift rules** | Simulation engineer implements the explicit A/B fixtures, active-service repair acceptance, inventory and returns, model-driven handover and evidence | Two plans pass; a wrong repair fails for the actual reason; reception remains working; inspection-led repair and retained policy pass honestly |
| **2. Playable client interaction** | Game/interface specialist implements requirement questions, stock/budget choices, persistent work and current service feedback | Player can state the job, choose a useful next action and understand a result without a tutor prescribing each operation |
| **3. Original layered scene** | Art/interface specialists create desk-scale devices, selected-device close-ups, room/service states and phone portraits using the existing manifest | All visuals reflect model state; keyboard/list controls perform every essential action; reduced motion and clear focus work |
| **4. Recovery and pilot** | Independent QA tests complete published routes, mistaken actions, import/export/reset/multiple tabs, then teacher/student observation | Actual findings are separated from automated/model tests; no false success, cash dead end or corrupted evidence |
| **5. Hardware proof of reuse** | A second topic model adds one upgradeable workstation and one client workload | Shared phone/ledger/evidence shell works with different entities and real compatibility/boot/workload checks |

The lead owns the cross-layer contract and integration. Content work maps each explanation and I-can statement to supplied teaching materials. Workers own bounded files and acceptance outputs. Do not expand the city while milestone 1 is unfinished.

## The hardware job as a real second simulation

Example premise: a community media group needs an existing workstation upgraded within its allowance. The student inspects the case, isolates power, removes components, identifies slots and requirements, chooses a compatible upgrade or reuse plan, installs parts and tests boot plus the declared workload.

Missing or incompatible memory should cause the appropriate check to fail. Buying a larger drive must not repair that cause. A valid smaller build can be acceptable when it meets the brief; spending the most is not the goal. Evidence includes selected/reused parts, the observed fault, actions and fresh results, plus the student's resource/stakeholder reasoning.

Start with a fictional component catalogue and explicit compatibility/power/capacity rules. These are authored teaching assumptions, not universal performance benchmarks or a full electrical/thermal emulator. A fixed cutaway/exploded view and equivalent part list support disassembly without precision dragging.

Security, media and health need similarly concrete actions and results. Their proposed scenarios and boundaries are in [DS_SCENARIO_HARNESS.md](DS_SCENARIO_HARNESS.md). A new background alone does not establish a new topic simulation.

## Visual contract

Use our own cohesive cutaway setting and asset manifest. Keep the workplace readable while selecting a device exposes larger ports/configuration. Provide separate workshop/bench details when component work needs more space. Phone conversations should reveal or respond to a requirement and leave a readable record.

Scene objects reference model entity IDs. Asset variants represent known state such as selected, powered, disconnected, available or denied; they do not calculate it. Test-path overlays use actual observations and show stale results explicitly. External-home scenes remain outside the clinic boundary. Do not imply a subnet from room placement or radio physics from a drawn circle.

The legacy source suggests useful organisation, not a palette, map, character cast or sprite set for us to reuse. No Cisco assets, scripts or proprietary descriptions are included in this implementation proposal.

## Teaching and release decisions

Keep bootcamp before independent work, with a teacher-directed prior-learning route recorded honestly. Distinct practice tasks should teach equipment/path, addressing and diagnostic transfer. Help, controls and accessibility support remain available; reading time does not trigger real-time economic penalties.

Show only two or three current goals. Preserve Observation/Conversation/Product opportunities and short explanations. Three separate observed demonstrations can inform the teacher's judgement, but the software must not infer an IB grade from a count, cash balance or hint use.

The next teacher review should focus on initial IP knowledge, available lesson time and whether the wearable follow-up belongs in the same session. Those choices tune instruction; they do not change the need for a causal model and a complete job. The live review build remains 0.6.0 until the new rules, interface and recovery checks are implemented and verified.
