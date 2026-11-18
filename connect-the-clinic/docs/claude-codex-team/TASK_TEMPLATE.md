# Filled task packet template

Claude completes every field before dispatch. Replace placeholders with actual values; do not send an unfilled template as a build task. Include the shared worker contract and one role prompt, or point to copies verified to exist in the worker's checkout.

```text
Task ID and role:
Worker route: local codex exec | existing authorized Codex integration | manual handoff
Objective: one coherent milestone
Requirement IDs and exact acceptance scope:
Baseline revision and relevant uncommitted changes preserved:
Actual worker root:
Read first: AGENTS.md, docs/claude-codex-team/WORKER_CONTRACT.md,
            docs/claude-codex-team/jobs/[one role].md
Relevant domain skill: name and verified local path, or project-brief fallback
Authoritative source files and relevant sections:
Exact editable files (one active owner each):
Read-only dependencies:
Do not change:
Shared contract/version; exact actions/events/view data/asset anchors:
Dependencies already available:
Deliverables and paths:
Checks: initial conditions, player actions, expected behavior, evidence required
Time/effort scope: one bounded pass plus one focused repair
Escalate if: missing source, ownership conflict, second failure, unavailable capability
Final report destination: captured by the lead with output-last-message
No further agents, commits, publication, new billing or permission bypass.
```

For a read-only scout/reviewer, use an empty editable-file list. For an implementation job, list the exact subset of proposed role-owned files. Claude retains the shared run record and does not assign two workers the same programme, persistence, manifest or entry file concurrently.
