# Teacher notes — Lantern Line apprenticeship (0.11)

**Open:** `connect-the-clinic/dist/opening-shift.html` (GitHub Pages). No accounts, names or patient data.

**Flow (about 45–75 minutes, untimed):**
1. **Training Centre** (bootcamp before field work). Each open station has a Field handbook page written from your lessons 3.3A, 3.3B and 3.4, a practical task and a bench drill on the real network model:
   - **Cable wall:** sort five cables to their jobs, then repair a bench with an unpowered switch and an uncabled computer. This earns the card for visit 1.
   - **Device locker:** match five jobs to a computer type (desktop, laptop, tablet, server, wearable), then kit out an empty bench from the locker and prove the booking service works. The model enforces real ports: a laptop or tablet has no Ethernet port here. A desktop host *works* but does not meet the "built to serve everyone" check, so Mags asks the student to swap it and test again. Needed (with the Cable wall card) for visit 1.
   - **Network rack:** classify six addresses on a practice network (`172.20.8.0/24`), then re-address a computer from another office. This earns the card for visit 2.
   - **Parts bench:** sort six parts by job (input, process, working memory, long-term storage, output, power; RAM versus SSD is the key distinction), then put the five steps of one booking request in order. This is a reasoning task: the game does not simulate the inside of a computer. Needed before Mags hands over the van.
   - **Speed lab, Security desk:** handbook pages only for now.
2. Pack the tool bag at the depot.
2. Visit 1 (physical setup, mentor alongside).
3. Visit 2 (address/mask and Wi-Fi, supported).
4. Visit 3 (the learner leads: a missing uplink with a correct IP, an access decision, a written or oral explanation).
5. Van 7 ceremony, then the existing Riverbend job as the first solo client.

Help ("What next?", "Show me", topic questions), inspections, tests and "Start this visit over" are always free.

**Training cards** come only from the student's own correct answers plus a completed bench drill (Parts bench: sort plus trace). Wrong answers are recorded in the evidence but never block a retry. Saves from 0.10 keep their two-card rules (Cable wall, Network rack); the new stations are optional practice for them. Saves from 0.9 keep their visits and treat training as optional.

**What counts:** a visit completes only from the learner's own recorded actions and a current model result. Mentor answers, "show me" and clicking through dialogue never complete it. The van needs all three visits. This is game progression, not a grade.

**Evidence:** Progress → *Teacher evidence (text)* lists, per visit, the equipment and addresses, learner tests in order (with result codes), plugging mistakes, questions asked, the access decision and the exact visit-3 explanation. Debrief prompts and I-can goals are in `LEARNING.md`. Handbook I-can statements with `cc.training.*` IDs are proposed and need your review (`HANDBOOK_SOURCES.md`).

**Saves:** progress stays in this browser profile on this site. Students should use *Download progress file* before changing device or clearing data. Damaged or edited files are rejected without replacing current work. Earlier 0.8 saves keep their field work and bench route, and gain no visits.

**Modelled honestly:** power, Ethernet links, IPv4 address/mask on one /24 network, Wi-Fi association with room coverage, and role-based access. **Not modelled:** routers/gateways, DHCP, DNS, crimping, electrical work and radio physics.

**Discussion starters:**
- Why didn't changing the tablet's IP fix visit 3?
- Who benefits from, and who is restricted by, your access choice?
- Why is "match the first three numbers" only true for a /24 mask?
