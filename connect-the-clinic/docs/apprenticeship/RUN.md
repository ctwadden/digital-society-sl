# Apprenticeship run record (lead: Claude Code)

**Contract:** programme 0.9.0 · `lanternline.apprenticeship` schema 1 · branch `apprenticeship-0.9` (checkpoint `898abfb`).
**Baseline:** `1bf1cde` (origin/main), 258/258 tests before changes.

## Decisions
- Programme screen `apprentice` is the new start. `APP_ACTION`/`OPEN_APPRENTICE` added; bootcamp is now the optional practice bench.
- Independent work opens from `fieldStarted` or a replayed truck (three `learner-practice` visit records). 0.8 saves migrate as `apprenticeOrigin:'legacy'`: earlier field work and a completed bench route are kept; no visits are credited.
- One clinic (Harbour Street, `10.12.1.0/24`) across three visits: physical setup → replacement computer address + Wi-Fi in two rooms → missing AP uplink with valid IP + access decision + explanation.
- Plugging HDMI/USB/phone cords is recorded as a mistake with mentor advice; only Ethernet and power reach the model. No crimping, routing, DHCP or radio physics is simulated.
- The mentor's "show me" highlights an object; it never performs learner actions.

## Workers
| Task | Route | Owned paths | Status |
|---|---|---|---|
| Art module (scene/yard/close-ups/portraits/vans) | **Claude subagent** (started before the Codex instruction; not a Codex worker) | `dist/apprentice/art*.js`, `art-preview.html` | running |
| T02 Curriculum | `codex exec -m gpt-5.6-sol`, worktree `codex/T02-curriculum` | `docs/apprenticeship/LEARNING.md`, `results/T02-mentor-review.md` | running |
| T06 Recovery/evidence | `codex exec -m gpt-5.6-sol`, worktree `codex/T06-recovery` | `tests/apprentice/recovery.test.js`, `docs/apprenticeship/SAVE_COMPATIBILITY.md` | running |

The first launch failed: the configured default model `gpt-6.1-sol` was rejected for ChatGPT sign-in (`model_not_found`). Relaunched with `-m gpt-5.6-sol` from `codex debug models`; config left unchanged.

## Observed checks
- Automated: 273/273 plus the apprentice suite (engine and programme, including real 0.8 save fixtures).
- Local browser (1366×768, fallback art): the depot pack route, then visit 1: a laptop choice gets advice; HDMI and phone-cord mistakes get advice; an unpowered switch gives `SWITCH_OFF`; the mentor gives the next step; powering the switch marks the old result stale; the retest gives `SERVICE_AVAILABLE` with its route; sign-off; reload preserves it; evidence lists the visit.

## Next
Integrate art; apply the accepted T02 text fixes; merge T06 tests; play visits 2–3 and the van; then independent QA (job 07, Codex, read-only); publish and verify the live page.
