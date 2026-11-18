# Claude Code handoff — mentor-led apprenticeship game

Updated 17 November 2026, America/Halifax. This is the teacher's corrected product direction and the handoff for the next implementation. It supersedes older presentation/sequence choices where they conflict. Preserve the working simulation, valid progress and unrelated course work.

## 1. Mission from the teacher

Continue this existing original educational technology-consulting game. The teacher wants the player to learn the trade alongside a mentor: review the cables, tools and equipment, ride to a site, perform real tasks with advice, repeat on a few meaningfully different visits with less support, then earn an independent work truck. The graphics must look like an appealing game. The current result feels too much like a training dashboard.

Use the general interaction and presentation ideas observed in Cisco Aspire as a reference. Do not copy its branding, maps, characters, dialogue, artwork or proprietary code. Build our original game.

The teacher has authorized development, delegation, integration and publication to the existing project. Do useful implementation rather than repeatedly requesting permission or producing another research report. Preserve unrelated work and obey the actual execution environment's permissions. The teacher prioritizes quality and has an authorized subscription; do not infer permission to enable paid API billing, buy services or add subscriptions.

## 2. Repository and working baseline

- Repository: https://github.com/ctwadden/digital-society-sl
- Owned project folder: `connect-the-clinic/`
- Live entry: https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/opening-shift.html
- Last verified working project revision before this handoff: `7027719fc141db4469782e2d9adb8d25d606945d`.
- Tested runtime revision: `e151fb4627f479e054d54c836f819f8ff0f6f52f`, version `0.8.0-review`. The later baseline revision adds reports/screenshots/examples only.
- Existing public GitHub Pages deployment is configured in the parent repository. Inspect it and repository status before changing anything; no hosting migration is needed.

If the repository is already checked out, inspect `git status`, current branch, remotes and applicable instructions before edits. Preserve user changes and other workers' files. Otherwise clone the existing repository. Use an isolated feature branch/worktree where useful. Do not create a replacement repository, overwrite the whole course, or change unrelated files outside `connect-the-clinic/`.

Run the current test suite from `connect-the-clinic/` with `npm test`. It is buildless JavaScript with no package installation needed for the existing tests. Serve this folder over HTTP, for example `python -m http.server 8000` (Windows: `py -m http.server 8000`), then open `http://localhost:8000/dist/opening-shift.html`. Opening module HTML with `file://` is unsupported.

## 3. What is actually built

There is a playable 0.8 bootcamp and a single independent clinic job. The bootcamp has an equipment/cable guide, five model-driven mentor demonstrations and six separate practical lessons: kit/power, Ethernet, address/mask, wireless, permissions and a changed physical fault. The field job starts with working reception, asks the player to prepare a mobile nurse workstation, supports laptop/tablet choices, equipment purchases/returns, three fixed client questions, real configuration/repair, tests in both rooms and a teacher handover. It has an original illustrated cutaway clinic and device inspectors.

The causal model already checks physical paths, power, addresses/masks, service and simulated role authorization. Results become stale after relevant changes. Equipment funds and contractor earnings are separate. Saves, imports, exports, local backups and tab ownership exist.

The final existing regression passed 258 tests. The lead completed the published bootcamp, deliberately caused failures, repaired them, exported evidence, checked recovery/import/reset/two tabs, and entered/resumed the independent job. These are bounded cloud-Chrome observations, not school acceptance.

The corrected apprenticeship has NOT been implemented: no mentor ride-along campaign, no three-visit apprenticeship, no earned truck, no developing client agenda and no visible staff workflow responding to restored service. The last preparatory turn read relevant skills; it did not write a new apprenticeship runtime. Do not claim those features are already present.

## 4. What the Aspire inspection established

The older supplied application package was obtained and inspected. Forty-four packaged state-machine files were parsed, and selected workplace, phone and equipment images were examined. The files showed authored offers, calls, purchases, maintenance, referrals, support and completion consequences.

The executable and contract activities were not run. Full gameplay timing, every branch and animation behavior were not verified. The public repository contains original analytical reports, not the proprietary application package. You do not need to repeat the search or retrieve an unauthorized copy to implement this original game.

Read these reports for design evidence, while recognizing their historical status:

- `docs/research/gameplay-review-2026-11-16/LEGACY_PACKAGE_FINDINGS.md`
- `docs/research/gameplay-review-2026-11-16/LEGACY_VISUAL_ARCHITECTURE.md`
- `docs/research/gameplay-review-2026-11-16/ORIGINAL_GAME_BLUEPRINT.md`

Some historical research pages say Opening Shift is proposed/not implemented. That was true when written; sections 2–3 of this handoff and the current runtime/release records establish today's baseline.

## 5. Corrected experience to implement

Build one coherent apprenticeship inside the game, with three supervised visits as the starting design. Keep the same player, mentor, work vehicle, notebook and progress between visits. Do not require a city or several unrelated locations before this works.

### Opening: meet the mentor and prepare the truck

The player joins an original mentor for the first workday. Make the service vehicle, tool bag and equipment tangible. Introduce relevant cable types, interfaces, a workstation, switch, access point and service host through inspection and use. A cable guide should be available at the moment of choice. Explain tools through their actual role, such as inspecting ports, testing a connection and opening device settings. Do not pretend an unmodelled crimping, electrical or routing operation has been simulated.

Show the purpose of the first site visit quickly. Keep controls and current goals obvious. Avoid starting with a dense dashboard, a glossary wall or a sequence of decorative Continue buttons.

### Visit one: the mentor works alongside the player

Arrive at the clinic together. Teach the physical setup while the student performs the actions: choose suitable equipment, distinguish network from power/display/USB connections, inspect ports, build the path and test it. The mentor explains, demonstrates when asked, notices relevant mistakes and responds to the actual model result. Clicking through the mentor's example must not earn learner practice evidence.

The workplace should visibly communicate the effect of a successful service test. Use synthetic staff tasks and no patient records. Show a staff task resume only when the authoritative model supports that result.

### Visit two: supported configuration

Use a different but related setup or requirement. Teach IP addresses and the supplied subnet mask through the device inspector and network card. The student enters and applies a valid unused address/mask, runs a test and interprets the result. Do not make copying a demonstrated address sufficient. Explain that the first-three-number-groups shortcut is specific to the taught `/24` mask.

Add wireless configuration where it serves the job: AP power, Ethernet uplink, association and tests where the mobile worker needs the service. The mentor offers graduated advice rather than automatically making the repair.

### Visit three: the apprentice leads

Provide a changed cause, such as a disconnected uplink with an already-valid IP address, and a relevant access decision. The mentor remains available but gives less unsolicited direction. The learner chooses an inspection/test, repairs the cause, retests and explains what changed and who benefits or is restricted.

These must be distinct problems or constraints, not three identical cable recipes with different labels.

### Earn the independent truck

Unlock the player's independent truck only from verified completion evidence for the supervised visits and required practical actions. Make the transition visible and satisfying. It is game progression, not an IB grade, professional credential or automatic mastery judgement. The existing independent clinic can remain the first solo job if integrated coherently. Preserve access to older valid field work without fabricating new apprenticeship completion.

## 6. Visual and interaction standard

Aim for a polished, original 2D/isometric game: coherent perspective and scale, a furnished workplace, a recognizable service vehicle, a distinctive mentor, attractive lighting/materials, readable equipment and purposeful close-ups. Use layered scene art, interactive objects and a focused mentor/phone overlay. The scene should be the main workspace; technical panels should open when relevant.

Keep real UI text in accessible HTML. Draw connections and test paths from stable model IDs. Preserve clear visual distinctions among installed, powered, tested, failed and stale. Generated art must not contain essential baked-in labels or fictional indications that contradict the model. Include a useful image-free/asset-failure fallback.

Use original image assets through available authorized tools when helpful. Do not substitute a concept image for a working scene or spend the whole task producing mockups. Integrate the final assets and inspect them at the actual browser size. Maintain the shared asset manifest and optimize loading for ordinary school PCs. Use 3D only if it materially improves the learning and performs adequately; 3D is not required for this visual improvement.

## 7. Technical and teaching constraints

- Keep one authoritative state. UI actions go through the model. Mentor dialogue, visible service consequences, rewards and truck access read model evidence; they do not set independent success flags.
- Preserve existing working simulation behavior and historical evidence. Inspect versioned save/migration boundaries before changing progression. Never silently erase or relabel old work.
- Use stable IDs for visits, phases, actions, devices, ports, messages and assets. Retain exact learner explanations, actual tests, support used and trainer/learner provenance.
- All apprenticeship teaching, hints and retries are free. Keep reading untimed and avoid making students afraid to request help. Existing field practice remains available.
- No accounts, student names, patient information, mandatory external AI or new subscriptions. Keep progress local and exportable; explain browser/profile/device limitations.
- Proposed I-can statements must use supplied source material. Do not invent official curriculum codes or claim whole chapters have been covered.
- Support keyboard operation, visible focus, readable text, reduced motion and a complete alternative to precision dragging.
- No false-success button, decorative-only repair, cash dead end or automatic academic grade from game performance.

## 8. Key code and records

Inspect these before choosing a replacement architecture:

| Path | Responsibility |
| --- | --- |
| `dist/engine.js` | Existing causal network model |
| `dist/persistence.js` | Local persistence, import/recovery and tab ownership |
| `dist/opening/programme.js` | Current shared training/field programme, validation and evidence |
| `dist/opening/engine.js` | Client-job rules, inventory, tests, handover and settlement |
| `dist/opening/main.js` | Current entry integration and persistence/UI adapter |
| `dist/opening/ui.js`, `styles.css`, `scene.js` | Current field interface and cutaway scene |
| `dist/bootcamp/engine.js`, `content.js`, `ui.js`, `scene.js`, `styles.css` | Current training mechanics/content/interface |
| `docs/SOURCE_ALIGNMENT.md` | Supplied instructional sources and unresolved official mappings |
| `docs/bootcamp/API.md`, `CONTRACT.md` | Current training and programme contracts |
| `docs/opening-shift/ENGINE_API.md`, `CONTRACT.md` | Current field contract |
| `docs/WORKER_PROMPTS.md`, `docs/SPECIALIST_SKILLS.md`, `docs/opening-shift/WORKER_PROMPTS.md` | Reusable specialist assignments |
| `qa/BOOTCAMP_RELEASE.md`, `qa/BOOTCAMP_BROWSER.md` | Exact existing verification and remaining school gates |

Current contracts protect causal truth and saved work; they do not forbid the teacher's newly requested experience change. Document deliberate revisions rather than treating the old dashboard layout or lesson order as permanent requirements.

## 9. Delegate and build

For the teacher's requested **Claude Code department head with Codex specialists**, use [the team launch package](claude-codex-team/README.md). It contains the master prompt, seven bounded job briefs, file ownership, the Delegate workflow and the actual Codex CLI dispatch route. Its setup checks are distinct from game-runtime verification.

Keep one capable lead integrator responsible for product direction, shared state and final acceptance. Assign bounded files to gameplay/simulation, mentor/curriculum, interface/experience and art specialists. Add independent QA after a material playable segment exists. Use a small concurrent team compatible with the runtime; coordinate shared files explicitly. Use available project skills or translate these contracts into worker prompts when those skills are unavailable.

Prove the opening plus one complete mentor-supported site interaction first: arriving, choosing a real item, operating equipment, observing a test and receiving a relevant mentor response. Inspect it in the browser before scaling all three visits. Then integrate reduced-support practice and the earned-truck transition. Do not build another disconnected demo or stop after a plan.

Keep documentation short. Spend the effort on gameplay, visual assets, integration and actual walkthroughs. After two failed attempts at the same issue, investigate the cause and change approach.

## 10. Acceptance and delivery

Demonstrate the whole route and at least one plausible wrong action. Valid networks pass; a missing connection or incorrect address fails for the right reason; a relevant repair restores service. Mentor feedback, scene state and evidence must agree. Skipping dialogue, watching a demo or editing a flag must not falsely award the truck. Test save/reload, reset, damaged import and preservation of earlier work across the new progression.

Run the meaningful existing regression suite and tests for the new causal/progression risks. Test the actual published revision after deployment. Report what was actually observed separately from automated/source checks. Actual managed school Windows, browser policies, accessibility and a small beginner pilot remain necessary; do not declare classroom readiness from compilation or passing tests.

Deliver a working URL, a short explanation of the visible improvements, screenshots of the actual playable opening, the teacher operating notes and material remaining limits. The first thing the teacher should see is the improved game, not another long report about what could eventually be built.
