# GitHub trial migration — 2026-11-16

## Decisions

- Publish an isolated `connect-the-clinic/` folder in the existing `ctwadden/digital-society-sl` repository, using its existing Pages publication. Preserve all other course files and configuration.
- Keep the original 0.6.0 `dist/` runtime byte-for-byte. Add only a relative project-root redirect/fallback link; no model, UI, storage or instructional behavior changes.
- Keep tests and their synthetic compatibility fixtures at the original relative paths. Two legacy QA progress snapshots are required by current tests; they contain developer-written synthetic demonstrations, not student submissions. All other browser screenshots/exports and original Git history are excluded.
- Include essential teacher, contract, engine, original-asset and reusable worker documentation. Remove private teaching-material URLs, personal skill locators, former local working paths and platform deployment identifiers. Retain titles/bibliographic attribution and scoped historical findings. Historical archived references do not claim those files are included.
- Use the existing hosting allocation. No new subscription, backend, tracking or runtime AI service is added. The parent repository is approximately 387 MB before this addition; this small static trial remains below GitHub Pages' 1 GB site cap. Hosted size depends on the parent's publication workflow.

## Publication target

Intended URL: https://ctwadden.github.io/digital-society-sl/connect-the-clinic/

Source: https://github.com/ctwadden/digital-society-sl/tree/main/connect-the-clinic

At export preparation, GitHub upload/deployment and live browser checks are **pending**. The lead integrator must record the resulting commit, workflow/deployment result and actually observed URL; do not infer success from this target.

## Save migration and browser limitations

The new origin cannot read the old site's localStorage. Download a **progress** JSON from the old site before moving, and import it on the new site. The readable teacher evidence is a separate product and is not a progress backup. New devices/profiles require their own import. Shared profiles, cleared site data, private browsing, profile resets and blocked downloads can interrupt recovery.

The unchanged save/lock/channel prefix is `riverbend.clinic.v03.`. Every path under `ctwadden.github.io` shares that origin: do not publish another independent copy with the same namespace without deciding how its saves should be separated. No existing saves are modified by preparing this export.

## Verification checklist

- [ ] GitHub commit contains only this isolated project folder; existing files are preserved.
- [ ] Existing Pages workflow succeeds for the actual commit and produces an accessible HTTPS game URL.
- [ ] Anonymous opening follows the relative entry to `dist/`; modules, CSS, icons and device artwork load at the project subpath.
- [ ] On the published origin: guided connection, test, unplug/fail, repair/retest and reload agree with the authoritative model.
- [ ] On the published origin: progress/evidence export; valid import; damaged-import rejection preserves the current attempt; reset cancel/confirm; two-tab writer/read-only behavior.
- [ ] On the actual school Windows browser: keyboard/focus/zoom, saving policy, downloads/imports, school filtering and acceptable responsiveness.
- [ ] Teacher walkthrough and small student pilot recorded separately from automated tests and development-browser observations.

Automated export test results are in `qa/EXPORT_TEST_RESULTS.md`. They do not substitute for the unchecked published-site or school-device items. Fictional money, speed and hint use are not grades.

## Hosting references

- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub Free supports public-repository Pages; private-source availability depends on plan. Published pages are normally public even with private source. GitHub records visitor IP addresses for security; the application itself requests no names, patient data or accounts.
