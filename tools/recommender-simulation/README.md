# Who Shapes Your Feed?

A static, browser-only IB Digital Society recommender-system simulation. Fictional profiles, configurable scoring weights, safety settings, interaction feedback, goal comparisons and a printable investigation report.

## Run
Requires Node.js 22.12+ (tested with Node.js 24).
- `npm ci`
- `npm run dev`
- `npm run lint`
- `npm run build`

No Gemini API key, AI Studio account, backend or login is required. Dependencies and styles are bundled. No runtime external fonts, analytics or student-upload service are used.

## Publish
Source lives in `tools/recommender-simulation/`. Run the build there, then replace only the generated files in `who-shapes-your-feed/` with `dist/`. Relative asset paths support GitHub Pages under the existing course repository. The existing Pages workflow packages the checked-in build; it does not publish files under `tools/`.

## Student work and privacy
Answers save in this browser's local storage when available. They do not sync between devices, browsers or profiles. Private browsing, clearing site data, storage restrictions, resetting, or switching fictional profile can remove work. Use Copy Results or Print / Save as PDF before leaving. If clipboard permission is unavailable, a manual-copy text box appears. Nothing is submitted to the teacher automatically. Avoid entering identifying or sensitive personal details. GitHub Pages receives normal page requests; local saving is not a secure account or backup.

The simplified deterministic model is a teaching aid, not a description of a particular platform's production recommender. Fictional profiles and content are synthetic.
