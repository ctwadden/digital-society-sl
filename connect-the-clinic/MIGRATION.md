# GitHub trial migration — 2026-11-16

## Decisions

- Publish an isolated `connect-the-clinic/` folder in the existing `ctwadden/digital-society-sl` repository, using its existing Pages publication. Preserve all other course files and configuration.
- Keep the original 0.6.0 `dist/` runtime byte-for-byte. Add only a relative project-root redirect/fallback link; no model, UI, storage or instructional behavior changes.
- Keep tests and their synthetic compatibility fixtures at the original relative paths. Two legacy QA progress snapshots are required by current tests; they contain developer-written synthetic demonstrations, not student submissions. All other browser screenshots/exports and original Git history are excluded.
- Include essential teacher, contract, engine, original-asset and reusable worker documentation. Remove private teaching-material URLs, personal skill locators, former local working paths and platform deployment identifiers. Retain titles/bibliographic attribution and scoped historical findings. Historical archived references do not claim those files are included.
- Use the existing hosting allocation. No new subscription, backend, tracking or runtime AI service is added. The parent repository is approximately 387 MB before this addition; this small static trial remains below GitHub Pages' 1 GB site cap. Hosted size depends on the parent's publication workflow.

## Publication target

Verified game URL: https://ctwadden.github.io/digital-society-sl/connect-the-clinic/dist/

The project entry https://ctwadden.github.io/digital-society-sl/connect-the-clinic/ was opened and redirected successfully to the game above.

Source: https://github.com/ctwadden/digital-society-sl/tree/main/connect-the-clinic

Published runtime commit: `54778219b26ac56868027df49b1ce7f2aa468f1d`.

The existing [DS course release workflow](https://github.com/ctwadden/digital-society-sl/actions/runs/43855584127) completed successfully. All 59 added files were inside `connect-the-clinic/`; every pre-existing repository tree entry retained its original Git object. The 13 uploaded runtime blob hashes match the original tested 0.6.0 files. The later documentation receipt changes no game code.

Live browser checks completed on 16 November 2026 in managed Linux Chromium, without a sign-in. Detailed results and limits: [qa/PUBLISHED_GITHUB_0_6.md](qa/PUBLISHED_GITHUB_0_6.md).

## Save migration and browser limitations

The new origin cannot read the old site's localStorage. Download a **progress** JSON from the old site before moving, and import it on the new site. The readable teacher evidence is a separate product and is not a progress backup. New devices/profiles require their own import. Shared profiles, cleared site data, private browsing, profile resets and blocked downloads can interrupt recovery.

The unchanged save/lock/channel prefix is `riverbend.clinic.v03.`. Every path under `ctwadden.github.io` shares that origin: do not publish another independent copy with the same namespace without deciding how its saves should be separated. No existing saves are modified by preparing this export.

## Verification checklist

- [x] GitHub commit contains only this isolated project folder; existing files are preserved.
- [x] Existing Pages workflow succeeds for the actual commit and produces an accessible HTTPS game URL.
- [x] Anonymous opening follows the relative entry to `dist/`; modules, CSS, icons and device artwork visibly load at the project subpath.
- [x] On the published origin: guided connection, test, unplug/fail, repair/retest and reload agree with the authoritative model.
- [x] On the published origin: progress/evidence downloads; valid backup import through Paste backup JSON; damaged pasted JSON is rejected without replacing the attempt; restart cancel/confirm; second tab opens read-only with its mutation control disabled.
- [ ] Repeat file-picker imports, cross-device transfer, takeover between writers, full independent/client mission, and accessibility/performance checks on the new published origin. This migration check did not repeat the complete prior development-browser audit.
- [ ] On the actual school Windows browser: keyboard/focus/zoom, saving policy, downloads/imports, school filtering and acceptable responsiveness.
- [ ] Teacher walkthrough and small student pilot recorded separately from automated tests and development-browser observations.

Automated export test results are in `qa/EXPORT_TEST_RESULTS.md`. They do not substitute for the unchecked published-site or school-device items. Fictional money, speed and hint use are not grades.

## Hosting references

- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub Free supports public-repository Pages; private-source availability depends on plan. Published pages are normally public even with private source. GitHub records visitor IP addresses for security; the application itself requests no names, patient data or accounts.
