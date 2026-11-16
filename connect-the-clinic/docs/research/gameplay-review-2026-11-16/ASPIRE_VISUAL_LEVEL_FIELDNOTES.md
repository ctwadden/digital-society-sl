# Aspire visual and level-design fieldnotes

Research date: 16 November 2026 (America/Halifax). Status: complete research/design contribution; no game code, assets or publication changed.

## Main finding

The current 0.6 opening is substantially clearer than the old 0.5 screen. It has a continuous floor, recognizable equipment, one clear next action and readable physical/test states. Its remaining weakness is the **size of the player's responsibility**. The player sees three prepared devices and a mentor specifying the next operation. The room functions as the background to a procedural exercise. The desired experience calls for a client workplace in which the player has to investigate, choose a plan, use tools and see people regain a service.

The next step should make one clinic an interesting level. More buildings, a walking avatar or a different rendering engine would not supply the missing decisions by themselves.

## 1. Evidence inspected and limits

| Evidence | Edition/date | What was actually inspected | Source |
| --- | --- | --- | --- |
| User screenshot: cutaway office with wireless router window | Title identifies Networking Academy Edition | Supplied image: several workstations in connected rooms; router configuration in a foreground window; a cloud and web server outside the office arrangement | First Aspire image supplied in this conversation |
| User screenshot: phone conversation in an office | Title identifies CCNA Edition | Supplied image: portrait, handset, conversation panel, interior backdrop, persistent upper/left HUD | Second Aspire image supplied in this conversation |
| Published city, phone and technical-work images | CCNA Edition gallery, 2012 | Original image inspection copies were opened; city, call and café/CLI images viewed | [TechRepublic gallery](https://www.techrepublic.com/pictures/shoebox-cisco-aspire-game-helps-cnaa-training/) |
| First-call and contract-summary images; introductory walkthrough | CCNA Edition; 27 June 2012, page updated 19 November 2024 | Images viewed and firsthand walkthrough read | [Sean Wilkins, Petri](https://petri.com/ccna-aspire-game/) |
| Café, office and binder figures; contract descriptions | Screenshots visibly identify Beta 3; paper DOI 10.1177/07356331211035188, uploaded August 2021 | Actual rendered PDF pages viewed; methods and contract descriptions read | [Nihalani & Robinson PDF](https://bpb-us-e1.wpmucdn.com/websites.uta.edu/dist/f/5265/files/2025/05/2022NR.pdf) |
| Original designers' retrospective | First published 31 August 2026 | Full article opened, particularly the section on extending Packet Tracer with the Aspire social layer | [Behrens, DiCerbo & DeMark](https://onlinelibrary.wiley.com/doi/10.1111/emip.70042) |
| Current game opening | Connect the Clinic 0.6.0 | [the published 0.6 opening screenshot](../../../qa/GITHUB_PAGES_0_6.jpg), captured from the published GitHub build, viewed directly; relevant model/API/catalog descriptions inspected | Project image and `dist/catalog.js`, `docs/MODEL.md`, `docs/ENGINE_API.md` |

This specialist did not run legacy Aspire or watch its full walkthrough video. Still images do not establish character locomotion, animation timing, free camera movement, simulation accuracy or every task in a release. Published research about Beta 3 must not be relabelled as an identical CCNA/Networking Academy campaign. The current-clinic observations here concern the opening screenshot and inspected code/contracts, not a new full playthrough.

A useful new confirmation: the original designers describe the social game layer as **2.5-dimensional**, using a 2D projection with perspective. They link its business context to contracts, equipment purchase and an integrated Packet Tracer interface. This supports an original 2D cutaway direction; it does not identify the rendering implementation of every release. [Behrens et al., 2026](https://onlinelibrary.wiley.com/doi/10.1111/emip.70042)

### Excluded evidence

Search indexed a premium-content table against [this 2024 EPF deck](https://peering-forum.eu/2025/wp-content/uploads/sites/7/2024/08/Network-Engineering-Simulation-New-way-of-learning-EPF-Final.pdf). The actual opened document has 11 pages and different extracted content: page 5 lists games and page 6 lists design goals. Screenshot requests returned text markers without viewable image data. The alleged pricing/help table is not verified and is not used here. No further retry is needed for this design decision.

Inspection-file correction: the existing local file `ccna-technical.png` contains the **city** image; `ccna-extra.png` contains the **café technical/command-prompt** crop. Findings follow observed pixels, not filenames.

## 2. What the reference communicates visually

### A workplace first; equipment in context

In the user's Networking Academy image, desks, chairs and partitions establish an office before the viewer studies individual computers. Devices occupy plausible workstation positions. The foreground device window then supplies technical detail. This gives two useful scales: the workplace explains who/what is connected; the close-up explains the selected configuration. A reader can see an office job behind the technical task. This is a direct observation of the supplied image.

The same image places the remote cloud/web-server symbols outside the office grouping. That is a useful boundary cue, although the still does not prove its exact logical subnet or routing configuration. Our external home scene must similarly remain outside the clinic boundary. Physical room position must never pretend to prove network membership.

### Conversation changes the mode of attention

The supplied CCNA phone image gives the speaker and message most of the screen while keeping the wider setting visible. The conversation is a distinct interaction mode. In the inspected CCNA gallery, a later call offers an immediate response or deferral. Its city has destination markers; its technical crop combines a café, task checklist and device command window. These visible layers communicate place, commitment and operation. They do not prove a roaming avatar or a particular travel animation. [TechRepublic gallery](https://www.techrepublic.com/pictures/shoebox-cisco-aspire-game-helps-cnaa-training/)

### Tasks acquire meaning through linked places and outcomes

The CCNA contract-summary image itemizes costs and rewards; the wider sequence is recorded in the [gameplay field notes](ASPIRE_GAMEPLAY_FIELDNOTES.md). The relevant design principle is that the job ends with a consequence the player can inspect.

The inspected Beta 3 café and office figures show coherent interiors with furniture-sized devices. Contract details are summarized once in the [gameplay field notes](ASPIRE_GAMEPLAY_FIELDNOTES.md); their edition limits also apply here.

## 3. Current 0.6 opening: preserve and change

| Element seen in the actual opening | What works | Why it still falls short of the desired game |
| --- | --- | --- |
| One shared clinic floor | Reception and equipment visibly belong together; this fixes the earlier panel-grid problem | Only two active areas and three prepared devices are visible; the site reads as a demonstration bench |
| One prominent next action | The player can identify where to begin | The action already names the solution step, leaving little investigation or planning |
| Jo and the four-stage guide | Support is friendly and readable; help is clearly free | The mentor occupies the main decision surface; no client workplace problem competes for the player's judgement |
| Large labelled device cards | Strong readability and keyboard-control affordance | Cards dominate the room and conceal furniture relationships; the scene feels like a dashboard |
| Explicit physical and test states | Connection is distinguished from tested service availability | A service result appears mainly as a diagnostic record; the visible workplace does not yet demonstrate much change |
| Phone, notebook, help and progress | Useful persistent tools and recoverability | Their presence alone does not establish a consulting career or an interesting client request |
| Two current learning goals | Manageable instructional scope | Goals cannot supply the missing strategic choices, uncertainty and consequences |

These are design judgements from the opening image. They should not be misreported as evidence that the entire application lacks independent tasks, IP diagnostics, privacy or later client work.

### The specific correction

Keep the guided connection as a short, clearly labelled skills demonstration or help rehearsal. Let a substantial client job become the main promise of the opening. A beginner should quickly understand: **someone needs a service, the situation has constraints, I can investigate it, and more than one plan may work**.

Progressive disclosure should hide irrelevant controls while leaving meaningful choices available. It should not prescribe every action until the student reaches an unscaffolded screen.

## 4. One original clinic level: “Ready for the afternoon shift”

This is a proposed design, not an implemented mission or an approved curriculum mapping. Timing must be measured in a teacher walkthrough and student pilot.

**Client premise:** the clinic is changing how reception and its mobile nurse share services. The existing equipment is uneven, funds are limited, and staff report different symptoms. The player must inspect what is present, choose what to retain or supply, get the required work running, and explain who is allowed to do what. Use synthetic service screens and fictional people only.

Use one compact cutaway with five functional areas. These are scene-planning labels; existing stable model IDs remain authoritative.

| Area | What the player can learn or decide here | Meaningful action | Visible result tied to model state |
| --- | --- | --- | --- |
| Entrance/service workbench | Client's priorities, available kit, spending limit and existing equipment | Read the brief, ask relevant questions, compare proposed equipment and select a plan | Job card records the chosen scope; inventory/cost changes only after an actual engine transaction |
| Reception | Fixed-desk booking requirement; what the receptionist currently cannot do | Inspect the workstation, test the booking application, choose an appropriate connection and configuration | Workstation screen shows booking-service available/failed/untested; receptionist response cites that observation |
| Exam room A | Nurse's workspace requirement and existing address/configuration | Inspect the portable device; compare its settings with the plan; test before making a targeted change | Current local workspace result and a concise observed symptom, not a magical green room |
| Exam room B | Whether the chosen solution still works where the nurse needs it | Move the device using a room button; test service in the second room; revise a plan that only worked at the first desk | Nurse location, physical connections/association and fresh test agree; earlier observations become stale when relevant |
| Equipment room | Shared infrastructure, occupied ports, service host and access policy | Inspect power/ports/services, connect devices, run allowed/denied role tests, and verify a repair | Selected physical links and current test path match the engine; legitimate staff access and unwanted access are distinguished |

The service workbench can be a small area at the entrance or an overlay reached from the entrance; it is not a second city. The existing off-site home activity can appear as a clearly separated later follow-up rather than another simultaneous opening task.

### The level's discoveries

1. **Different people need different services.** The receptionist's requirement and the nurse's requirement are visible in their locations. The phone can clarify requirements rather than repeatedly name the next button.
2. **The existing installation contains useful equipment.** A player should inspect before buying. Retain/replace is meaningful only when price, capabilities or reliability are actually represented; do not imply a maintenance simulation that does not exist.
3. **Working in one place is not enough.** Moving the nurse to a second exam room changes the test context. This gives spatial navigation a reason without requiring a walking character.
4. **A plausible fault has more than one candidate cause.** A reported symptom should lead to inspection/tests. A later fault should differ from the taught example. If a cable fault is introduced, it must become an explicit engine event; never secretly contradict the saved network.
5. **Making every request pass can be the wrong result.** A privacy check should demonstrate that intended staff work succeeds while a prohibited role is denied for the correct reason. A switched-off server does not demonstrate good access control.

### Proposed progression through this one level

Start with a short phone brief and a visible workplace problem. Allow an inspection pass in any order, then a plan. Teach a missing tool at the moment it is needed: physical connection, address configuration, or interpreting a test. After an early usable service, introduce the nurse's second-room requirement, then a changed fault and the access decision. End with a client handover and recorded explanation.

The first meaningful achievement should be **restoring a staff member's work under a constraint**, not finishing a sequence of tutor instructions. The level can still open with two goals, then reveal the next two once the student has context.

## 5. Original art and interface specification

**Camera and composition.** Fixed oblique 2D cutaway, shared floor and consistent furniture scale. Keep reception near the front, exam rooms along one side and the equipment room at the back. Paths between rooms should be visually comprehensible. Do not make a corridor maze or require camera dexterity.

**Device scale.** Put computer art on the actual desk/shelf. Use a compact label beside an unselected device; expand readable text and controls in its inspector. Preserve an accessible list with identical actions, so smaller scene art does not create precision-clicking barriers.

**Three operating views.** Workplace view answers “Who needs what?”; network overlay answers “What connects to what?”; device inspector answers “What can I inspect/change?” Switching views preserves selection and model state. Normal scene presentation need not show every cable and every configuration field at once.

**Phone.** Use original short message threads for job offers, information requests, changed symptoms and client responses. A message should introduce information, a decision or a consequence. If it merely restates a button label, keep it in help instead. Maintain a persistent job brief so closing the phone never loses the task.

**Visible consequences.** Change screen/status art when a relevant test confirms service, show the nurse's current room, and make a new message refer to a real observed result. Use still state changes by default; optional short transitions should respect reduced motion. Avoid decorative queues, satisfaction meters, waiting-time counts or health outcomes unless their rules are explicitly modeled.

**Technical detail.** A selected-device panel can expose ports, power, IPv4 settings, service tests and role permissions with keyboard controls. Do not paint a router front panel over nonexistent routing logic. Keep exact values in real selectable text, not embedded raster lettering.

**Economy.** Display a compact cost/reserve summary only when the player is making a purchase or closing the job. Equipment choices should have real opportunity costs. Income and client count can unlock fictional opportunities; neither should automatically certify academic understanding.

## 6. What can reuse the model, and what needs engineering

Current documented capabilities include static IPv4 addressing/masks, meaningful address/physical/power/service/permission failure distinctions, reception and nurse roles, two exam rooms, switch and access-point options, a separate off-site location and a role-based permission matrix. These are useful foundations for a richer level. [Project catalog and MODEL.md]

The documented model explicitly does **not** implement routers, gateways, DHCP, DNS, Internet, NAT or VLANs. Those should be a separately specified extension with causal tests. A guest-looking zone must not be called an isolated subnet merely because it is drawn in another colour. A public-role access test can be presented as application authorization under the existing model, with that simplification explicit.

New stock/reuse, purchasing trade-offs, evolving client requirements and operational staff feedback need clear state/event contracts before visual production. UI must render their authoritative consequences. No independent UI success calculation or fake technician animation should create readiness.

## 7. Acceptance tests for the redesigned level

These are proposed gates, not results already achieved.

- A first-time player can identify the client, the service problem and one constraint from the opening without reading the full manual.
- Before the first substantial technical change, the player has at least two reasonable options whose differences can be explained. The test does not count two buttons that produce the same plan.
- A novice can find reception, both exam rooms and the equipment room using either scene or keyboard/list controls.
- Selecting a person exposes a work need; selecting equipment exposes its state/actions. The same click should not ambiguously do both.
- At least one task requires inspecting information before choosing an action, and a different fault requires transferring that reasoning.
- Changing a device/cable/address updates both views; stale results are visibly distinct from current readiness.
- Moving the nurse to exam room B tests an actual location-dependent rule. Location changes cannot silently reconnect cables.
- Service feedback names the supported work and derives from the test result. No animation announces success while the authoritative probe fails.
- Budget/reserve changes match recorded transactions; help cannot create a cash dead end and practice guidance remains free.
- At least two legitimate complete solutions pass where the brief allows them. An invalid physical link, incorrect address or overly broad permission fails for the corresponding reason.
- The teacher receives decisions, observations and explanation; guided setup is distinguished from independent work. No proficiency score is presented as an IB grade.
- A short pilot records confusion, unsupported assumptions, choice quality and time to the first meaningful result. Actual school-device performance and assistive-technology checks remain separate gates.

## Handoff

Lead integrator should combine these notes with the gameplay worker's verified contract research and the independent audit of the live game. Preserve the successful introduction and causal engine; revise the scale of the first job, its visible human consequences and its choices. Produce one playable clinic slice before commissioning a city or extensive animation.
