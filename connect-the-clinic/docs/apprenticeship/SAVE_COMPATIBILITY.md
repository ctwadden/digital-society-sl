# Apprenticeship save compatibility (0.9)

Opening Shift progress is stored locally in the browser profile and site address where it was played. It is not an account or cloud sync. Clearing site data, using a different browser/profile, or changing device can remove access to the local copy. Download progress before those changes and keep the file somewhere approved by the school.

## What 0.9 accepts

- Current `0.9.0` programme progress is checked by replaying its recorded actions. Completion records, tests, explanations, packed equipment, mentor support and truck access must match that replay.
- Real `0.8.0` programme saves migrate to 0.9. Earlier bootcamp and field work remain available. They begin the apprenticeship with no credited visits and cannot gain a truck from migration.
- A legacy learner who had completed the old six-task bootcamp keeps that earlier route into field work. An unfinished old bootcamp does not unlock field work.
- Older standalone Opening Shift field saves supported by the existing validator keep their field state and gain an empty, clearly labelled legacy apprenticeship.

Unsupported versions, evidence exports, malformed JSON, oversized files and files whose structure or replay does not agree are rejected. A rejected import does not replace the current in-memory campaign or valid local save.

## Recovery and reset

The game keeps a last-good local snapshot when it replaces a valid saved snapshot. Recovery restores that backup as a whole campaign. Restart Visit makes a fresh attempt at the current visit while preserving earlier completed-visit records. Clear removes this game's snapshot and backup, then starts a new unearned apprenticeship; it does not clear unrelated site data.

Only one tab may control a saved campaign. Other tabs are read-only until control is transferred. If browser locking or storage is unavailable, the game identifies manual-save/memory mode; download progress before closing.

## Teacher evidence limits

Evidence reports the learner's exact saved explanation, actual learner test records and codes, address/access decisions, mentor-support count and demonstration/learner provenance. Teacher review remains pending. The report is not an IB grade, professional credential, identity check or automatic mastery judgement. Local replay checks consistency, not who performed the work.

No learner name, account or patient information is required. An evidence JSON file is for review and cannot be restored as progress.
