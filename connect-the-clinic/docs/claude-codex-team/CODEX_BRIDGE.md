# Claude-to-Codex execution route

## The route

Claude Code stays in charge. Through its existing authorized terminal tool, it runs a **separate local Codex process** for each filled task packet, then reviews the resulting changes and report. No extra orchestration service or runtime game AI is required. This package does not configure Claude's tool permissions or sign either client in.

The documented route is `codex exec`. It accepts a prompt on standard input, supports an explicit working directory and sandbox, and can write the final response to a file. See the [official command reference](https://learn.chatgpt.com/docs/cli/reference) and [non-interactive guide](https://learn.chatgpt.com/docs/non-interactive-mode). Check the installed command's help before use.

## Preflight on the actual machine

Check the following without running a model job or initiating login:

```bash
claude --version
codex --version
codex exec --help
codex login status
```

Use an existing authorized subscription session. [Codex authentication documentation](https://learn.chatgpt.com/docs/auth) distinguishes ChatGPT subscription access from API-key billing. Inspect method/status only; never print stored credentials. If the method is API-billed, missing or unclear, do not launch a potentially billable worker under this project's no-new-API-use constraint. Report the exact limitation and retain the job packet. Do not open a login window unexpectedly.

Check that Claude has its normal authorized terminal capability and that this route is allowed by the active permissions. Do not wrap a blocked command in another service or use bypass flags. Existing organization and user controls still apply.

## Assemble a real packet

Claude creates `docs/apprenticeship/tasks/` and `docs/apprenticeship/results/` in the active job checkout. Fill `TASK_TEMPLATE.md`, include `WORKER_CONTRACT.md`, the one selected job prompt and the minimum task-specific context. The final packet must be readable from that worker checkout; naming a file present only in Claude's other worktree is insufficient.

Set paths to actual values. For a sequential task launched from the game directory, the following shell commands use that directory and a packet Claude has already created:

```bash
CLINIC_JOB_ROOT="$PWD"
CLINIC_TASK_FILE="$CLINIC_JOB_ROOT/docs/apprenticeship/tasks/T03.md"
CLINIC_REPORT_FILE="$CLINIC_JOB_ROOT/docs/apprenticeship/results/T03.md"
codex exec --cd "$CLINIC_JOB_ROOT" --sandbox workspace-write \
  --output-last-message "$CLINIC_REPORT_FILE" - < "$CLINIC_TASK_FILE"
```

For an independent review, use `--sandbox read-only` and its own packet/report names. The CLI writes its final report; the review worker does not edit production files. If QA needs to author executable tests, give that separate bounded task explicit writable ownership.

In PowerShell, after preparing the same paths:

```powershell
$ClinicJobRoot = (Get-Location).Path
$ClinicTaskFile = Join-Path $ClinicJobRoot 'docs/apprenticeship/tasks/T03.md'
$ClinicReportFile = Join-Path $ClinicJobRoot 'docs/apprenticeship/results/T03.md'
Get-Content -Raw -Encoding UTF8 $ClinicTaskFile | codex exec --cd $ClinicJobRoot --sandbox workspace-write --output-last-message $ClinicReportFile -
```

Preserve the actual process exit status. A report file alone is not proof of success; inspect status, changed files and checks. Missing/failed output is a failed or blocked dispatch, not a successful delegation. Do not embed untrusted task text in shell command substitution.

## Parallel work and integration

Use at most two independent worker processes initially. For concurrent writers, prepare separate Git worktrees from a known current baseline, copy or explicitly commit required current task material, and give each a distinct report path. If safe isolation is unavailable, run sequentially. Do not reset/stash/delete the user's edits to make isolation convenient.

Claude reviews each diff, rejects out-of-scope changes and integrates deliberately. Only Claude updates the shared run record, reassigns files, merges or publishes. The worker prompt forbids recursive delegation. No permanent collection of Claude-native proxy agents is necessary.

Do not pin an assumed model. Keep the authorized configured Codex model, or select an actually available authorized model for that job. Record requested versus observed model/effort; if unavailable, mark unknown. Do not imply that Claude's own model choice changes the Codex worker.

## Missing capabilities

If the local CLI or allowed launch is unavailable, provide the same filled packet for an existing Codex terminal/IDE session. Claude can still inspect sources, settle contracts and integrate returned work. State that handoff is manual until an actual route is verified. A Codex-sounding Claude role name is not an equivalent invocation.

Do not assume old `codex mcp-server` instructions are supported. The inspected local CLI in this authoring environment did not list that command. If the user already has a working authorized Codex integration, inspect its actual tool schema before using it; do not install an unverified bridge or change authentication to make the instructions fit.

## Validation status

See `PACKAGE_CHECKS.md`. Command help and official documentation were inspected. Claude Code was not installed in the authoring environment, so **Claude launching an authenticated Codex worker has not been end-to-end tested here or on the teacher's computer**. The master prompt explicitly requires that preflight before claiming it works.
