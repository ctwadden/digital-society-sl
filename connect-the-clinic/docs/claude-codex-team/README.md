# Claude department head + Codex specialist team

This is the launch package for continuing **Connect the Clinic**. Claude Code leads the work and integrates the game. Codex performs the specialist jobs. It implements the teacher's requested Delegate workflow as portable project instructions; it does not install either client, change billing or claim that cross-client execution has already been tested on the teacher's computer.

## Start here

1. Open the existing `ctwadden/digital-society-sl` checkout in Claude Code, working in `connect-the-clinic/`.
2. Paste the contents of [CLAUDE_MASTER_PROMPT.md](CLAUDE_MASTER_PROMPT.md), or tell Claude to read it and execute it.
3. Claude checks the local Codex route using [CODEX_BRIDGE.md](CODEX_BRIDGE.md), prepares bounded packets and runs the jobs. The user should not have to manually coordinate seven conversations when a working local route exists.

Use this short launcher:

```text
You are the department head for Connect the Clinic. Read and execute
docs/claude-codex-team/CLAUDE_MASTER_PROMPT.md in connect-the-clinic/.
Use the Delegate workflow, with you as the Claude Code lead and real Codex
sessions as the specialist workers. Read CODEX_BRIDGE.md before dispatch.
Preserve existing work. Deliver the playable mentor-led apprenticeship,
original integrated graphics, supervised practice and earned truck described
in the handoff. Begin with one complete site interaction and continue through
integration and verification. Do not stop after a plan or a collection of mockups.
```

## Package

| File | Purpose |
| --- | --- |
| [CLAUDE_MASTER_PROMPT.md](CLAUDE_MASTER_PROMPT.md) | The complete department-head assignment |
| [TEAM.md](TEAM.md) | Seven jobs, ownership, dependencies and dispatch order |
| [DELEGATE_WORKFLOW.md](DELEGATE_WORKFLOW.md) | Portable application of the existing Delegate skill |
| [CODEX_BRIDGE.md](CODEX_BRIDGE.md) | Real Codex CLI invocation, checks and fallback |
| [WORKER_CONTRACT.md](WORKER_CONTRACT.md) | Shared requirements and reporting contract |
| [TASK_TEMPLATE.md](TASK_TEMPLATE.md) | Exact packet Claude fills before each launch |
| [jobs/](jobs/) | Seven role-specific Codex prompts |
| [PACKAGE_CHECKS.md](PACKAGE_CHECKS.md) | What was verified when this handoff package was prepared |

The game-root `CLAUDE.md` and `AGENTS.md` point the clients at these instructions. They are project instructions, not model-routing plugins.

## Current build and baseline

- [Published review game](https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/opening-shift.html)
- [Repository](https://github.com/ctwadden/digital-society-sl/tree/main/connect-the-clinic)
- [Full existing-game handoff](../CLAUDE_CODE_HANDOFF.md)

The existing bootcamp and independent clinic job work at the scope documented in their release records. The integrated three-visit apprenticeship and earned truck are the next implementation. This package changes instructions, not the game runtime.

## Reuse for another subject

Keep the team method, action-to-consequence model, ownership, recovery, accessibility and evidence requirements. Replace the scenario brief, supplied source set, domain model and observable criteria. For example, a media job could trade output quality, compression, audience access and consent; a hardware job could select compatible parts for a client's constraints. Have the subject specialist verify the new rules and evidence. Do not transfer network success rules or claim curriculum coverage merely by changing labels.
