# What the supplied Aspire application reveals

**16 November 2026 (America/Halifax) · static package inspection · original architecture recommendations**

## Finding and evidence boundary

The supplied application exposes a substantial authored game structure: client agendas, incoming and outgoing calls, offers, venue contracts, technical checks, purchase-dependent responses, maintenance choices, referrals, support offers, completion checks and consequences. These are concrete reasons the historical game can feel more like professional work than our prepared connection lesson.

This expanded inspection used the **user-uploaded ZIP**, `Cisco Aspire Networking Academy Edition.zip`. The lead separately verified its correspondence with the retrieved community archive and packaged version 1.1.6.28. This worker independently parsed **all 44 `.fsm` entries** in the uploaded archive as XML. Their root is `qfsmproject`; inspected headers identify Qfsm format 0.52. Base64 description attributes decode to XML state properties and embedded action text.

The inspection used ZIP reads in memory, XML parsing and ordinary Base64 decoding. No application or activity was executed, no protection was bypassed, and no proprietary scripts, dialogue or art were copied into our game. These are packaged authoring/state-machine documents: their presence does not prove that every graph is loaded or every branch is reachable at runtime. Gameplay timing, final reward values, persistence and actual user experience remain unplayed.

## Files that support the findings

Paths below are relative to `gamedata/scenarios/cana/`, except the two small phone examples under `gamedata/objects/fsm1/`.

| Inspected files | Concrete evidence |
| --- | --- |
| `Clients/Maria/Maria.fsm` | 28 states, 51 transitions; starts by registering a phone contact; contains offers, venue work, calls, callbacks and later-job conditions |
| `Clients/Maria/V1C1.fsm` | 29 states, 40 transitions; purchasing/placement conditions, maintenance responses, another contact, completion recheck and differentiated payoff branches |
| `Clients/DrEvans/V2C1.fsm` | Address/subnet and elapsed-time conditions; support-offer acceptance/rejection; completion recheck and timing-dependent payoff paths |
| `Clients/Common/generic_contract.fsm`, `complete_check.fsm` | Separate conversation, completion and payoff handling |
| `Clients/Common/Generic_ContractTimeoutHandler.fsm` and the three `Generic_ExpireContractHandler` variants | Reset-option, expiry-message, quit-consequence and previously-visited-contract handling |
| `Clients/System/System.fsm` | A progress-dependent level-ending message and survey request |
| `phone.fsm`, `phone_incall.fsm` in the object examples | Small idle/call/busy event graphs; runtime use of these examples is unverified |
| `Contracts/V1C1/`, `Contracts/V2C1/` | Activity files, backgrounds, styles and engine/instruction data alongside the client graphs |

## A compact first-client and contract flow

This is a reconstruction of the **authored initial Maria contract route**, not a recorded playthrough or a guarantee about the whole game's opening. Branches are simplified here; the separate client and contract graphs remain distinct.

| Stage | Observed authored behaviour | Implication for experience |
| --- | --- | --- |
| Establish contact | The client graph's initial state adds the contact, then enters an offer. Offer handling distinguishes incoming calls from outgoing calls made while idle. | The phone is part of entering work, rather than just a message archive. |
| Accept the job | Acceptance enters a venue-contract state. Its entry action checks whether that state was already entered before requesting the activity. | A commitment leads to a particular workplace; the graph includes a guard against repeating the start action. Save semantics are not established. |
| Receive the task and funding stage | The contract begins with a client-message state and reaches a funding-related payoff state. Equipment-purchase status controls subsequent responses. | The job connects discussion, resources and work. Exact grant amounts are not available from the inspected graph. |
| Choose equipment and consider maintenance | Conditions distinguish new, refurbished and mixed equipment, with maintenance-related variants. A warning can be acknowledged and the work can continue; the graph does not simply require one universal purchase recipe. | Purchasing decisions are authored to affect later responses and consequences. Exact prices and the underlying classifications remain unverified. |
| Install and develop the relationship | Placement status can produce a wrong-location response. A separate stage introduces another contact and adds them to the phone. On the ordinary purchasing path this referral stage appears **before final completion**, not exclusively after handover. | Progress includes both equipment work and access to another person. This order is more specific than the earlier documentary summaries. |
| Demonstrate completion and discuss support | A completion response leads through a support prompt, then requests fresh model evaluation. A positive response enters a state labelled for support not yet being available; its dialogue was not decoded. | A conversation is not itself sufficient proof that the technical work is still complete. Support is introduced without assuming every job offers it. |
| Settle and move on | A valid fresh completion enters one of the authored payoff paths, then finishes the contract. The client graph waits for further scenario progress before subsequent jobs. | The job has a consequence and belongs to a longer agenda. The amounts, once-only guarantees and runtime branch priorities remain unverified. |

Later Maria branches depend on progress, a prior service-provider choice and support status. The medical-office graph goes further with a support offer: it checks acceptability, records supported/unsupported status, and then rechecks technical completion. This is evidence of authored business decisions alongside network work; it does not establish the full negotiation interface or pricing formula.

## Failure, delay and recovery are authored behaviours

The inspected graphs respond to incomplete work rather than equating a dialogue acknowledgement with success. The early contract distinguishes missing suitable purchases, incorrect placement and incomplete final evaluation. A successful later evaluation can return the player to the completion conversation. The medical-office graph includes a delayed response while address/subnet status remains unsuitable.

The client's expiry-warning branch can return to the active job after acceptance, ignoring the reminder or a missed call. A common timeout handler requests a reset-options window and returns to its waiting state. Separate expiry handlers support a disappointed-client response, a quit-consequence request, or an expiry consequence followed by exit. One variant records visited contract identities before applying its consequence, suggesting an intent to avoid repeating that treatment within the tracked state. Persistence of that record was not verified.

These are **different handlers**, not proof of one universal penalty. The exact clock speed, deadline, reset choices, amounts and which handler is installed in each job remain unknown. The medical-office graph also has strict less-than/greater-than branches around a timing threshold; the exact boundary is not covered by those two visible guards. That is a static review concern, not a reproduced dead end. Our own transition tests should cover equality, overlapping guards and a result arriving during a conversation.

## What is reusable, and what belongs to the subject model?

| Reusable framework responsibility | Subject-specific responsibility |
| --- | --- |
| Offers, acceptance, pause/return and job status | The client's requirements and what constitutes an adequate solution |
| Phone contacts, questions, decisions and follow-ups | Original people, dialogue, stakeholder needs and contextual facts |
| Stable phase/event IDs and explicit transition guards | Networking probes, audio routing checks or media-production constraints |
| Inventory transactions, refunds and settlement records | Equipment capabilities, prices chosen for the teaching scenario and resource limits |
| Handover, evidence snapshots and teacher review | Explanations and source-aligned learning statements for the topic |
| Recovery, saved progress, stale-test handling and optional practice | Deliberate simplifications of the particular technology or social system |

For our architecture, narrative conditions should read named observations from the authoritative model. A mission must not carry a second, inconsistent definition of whether a network works. Conversely, the networking engine should not hard-code every character, room or future subject.

## Concrete differences from Connect the Clinic 0.6

The current comparison is grounded in the existing source/model audit, with the phone UI and settlement logic checked again. It is not a new end-to-end test of 0.6.

| Retrieved authored structure | Current clinic behaviour | Next original change |
| --- | --- | --- |
| A client-level agenda separate from individual contracts | One paid contract and one settlement | Add a versioned mission/contract registry after the first complete shift works |
| Phone offers, acceptance, callbacks and later requirements | Event messages with a Mark read action | Add explicit requirement questions and decisions that change or record mission facts |
| Purchase and maintenance conditions affect responses/payoff paths | Hardware has no prices or stock; economic variation mainly comes from guide use | Implement an equipment allowance, inventory and reversible transactions |
| The activity reports conditions that drive conversation | Real network checks already exist, but independent work is heavily directed | Preserve those checks and let the student choose a diagnostic from a symptom |
| Handover includes another technical evaluation | Current readiness/evidence already use the model | Keep and strengthen this foundation; test stale results after edits and conversations |
| Incomplete, warning, expiry and reset behaviours are explicitly represented | Free practice and bounded help costs support recovery; no general multi-job consequence system | Add recoverable setbacks deliberately, retaining teacher-controlled pacing and safe help |

The existing 0.6 economy uses a 120-credit service fee and capped consultation expenses. That is a sound small ledger, but it currently cannot make equipment decisions consequential. Its one-time settlement and evidence safeguards should be preserved when inventory and additional jobs are introduced. See [the current-game audit](CURRENT_GAMEPLAY_AUDIT.md) for source references and earlier model traces.

## Three original implementation lessons

**Separate the client's agenda from the task inside a job.** Use an original declarative mission format for offer, accepted work, verification, handover and follow-up. Keep stable IDs and an explicit phase. This lets the same framework host a clinic, theatre booth or media client without copying an Aspire graph or embedding every story in the interface.

**Make consequences depend on current model evidence.** A relevant test can unlock a client response. Fresh acceptance checks can permit handover. A recorded settlement can issue a receipt once. Persist observations, phase and transaction identities together; test repeated actions, refunds, imports and interrupted conversations. Fictional income remains separate from a teacher's judgement of understanding.

**Build one evolving workplace before a campaign.** Keep reception working as the nurse's requirement develops. Let a useful phone question reveal a need, let a purchase affect available resources, and let a successful test restore a visible work task. Add later clients once that complete experience is enjoyable. Adapt timing mechanics to accessible reading and classroom pacing instead of treating historical pressure as a requirement.

## Remaining limits

Selected neighbouring `.dat`, `.dats` and `.dath` samples are not plain XML/UTF-8. Their inspected headers did not identify a standard text format; no compression/encryption scheme was inferred or defeated. Full dialogue, prices, payoff values and the underlying activity calculations remain unavailable from this pass. No Packet Tracer activity was opened, and no claim of Windows compatibility, functioning activation or playable completion follows from this inspection.
