# Team prompt package: verification record

Prepared 17 November 2026 (teacher's Halifax date). This record verifies the handoff package. It does not claim implementation or testing of a new apprenticeship.

## Baseline and changes

The repository head inspected before preparing this package was `7c6b91a1562038a3da987d27ed5d59af52d4aa3b`. The existing runtime was version `0.8.0-review`. See `docs/CLAUDE_CODE_HANDOFF.md` and the bootcamp release records for its actual scope.

Added a department-head prompt, seven specialist prompts, shared contracts, execution guidance, a reusable packet and scoped project instructions. Linked this package from the existing handoff. No runtime, art, curriculum sources, dependency files or test implementations were changed. Existing game test results are historical evidence, not rerun results for this package.

## Checks performed

| Check | Result and scope |
| --- | --- |
| Existing Delegate skill and runtime adapters | Read the shared workflow, Claude/Codex guidance, contracts, course profiles and simulation production lane. Applied the teacher's explicit cross-client role choice. |
| Existing project/role review | Independent reader checked the handoff and earlier role documents. Carried forward old-source-ledger and explicit-test-glob hazards. |
| Current Codex syntax | Inspected installed `codex-cli 0.167.0-alpha.4`, `codex exec --help` and command listing. The documented stdin, working-directory, sandbox and final-response options were present. |
| Official documentation | Opened command, non-interactive, authentication and Claude skill documentation. Sources are linked below. |
| Shell syntax | Both Bash blocks in `CODEX_BRIDGE.md` parsed successfully with `bash -n`. This checks syntax, not an authenticated invocation. |
| Package integrity | Seven distinct job files; bounded ownership and skill fallback in each. Relative Markdown links checked against local files, including this completed receipt. |
| Independent package review | A fresh reviewer inspected root instructions and all team files. Found no substantive execution/ownership blocker. Its minor QA-status inconsistency was corrected to match the shared contract and permit partial first-slice evidence. |

## Not tested / not installed

- Claude Code was not present in this authoring environment. No end-to-end Claude-to-Codex worker launch was performed.
- No login, authentication change, paid API call, local model job, plugin installation or model selection was performed to prepare the package.
- PowerShell commands were provided as an equivalent example but were not executed on Windows. The actual local client/terminal must verify them.
- No native skill or cross-provider bridge was installed on the teacher's machine. These are committed project instructions and role briefs. Existing local skills may be used when present.
- No new apprenticeship runtime or art was built by this documentation task. Published-game and actual school-device checks remain implementation/release work.

## Required first checks when Claude takes over

Verify the real checkout and preserve current changes. Check local client/help/authentication status without exposing credentials or initiating an unexpected login. Prepare one small bounded task packet and verify a real Codex result before claiming cross-client delegation works. If unavailable, retain the manual packet fallback and continue useful lead work.

## Primary references

- [Codex command reference](https://learn.chatgpt.com/docs/cli/reference)
- [Codex non-interactive execution](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Codex authentication methods](https://learn.chatgpt.com/docs/auth)
- [Claude Code skills and local discovery](https://code.claude.com/docs/en/skills)

These documents establish product behavior, not this user's local installation, entitlements or permission settings.
