# Release DS course sections

Student home: https://ctwadden.github.io/digital-society-sl/

Open [DS course release](https://github.com/ctwadden/digital-society-sl/actions/workflows/course-pages.yml), sign in with the GitHub account that has write access, then choose **Run workflow**. Keep branch **main**. Select a section and choose **show** or **hide**, then run it. Wait for the green successful run and refresh the student page. This changes the published home for everyone.

- `practice-library`: the three existing practice resources.
- `assessment-guide`: Paper 1 / Paper 2 learning and feedback guidance.
- `course-route`: the four-phase year overview.
- `ia-workspace`: introductory IA workspace notice. Revised IA materials are not ready yet.
- `ibds-26-s01` through `ibds-26-s16`: individual sprint overviews. New workbooks must still be produced and reviewed; a visible overview does not mean its workbook is ready.
- `rebuild-only`: publish current settings without changing visibility.

For several changes at once, [edit course-release.json](https://github.com/ctwadden/digital-society-sl/edit/main/course-release.json). Change only the chosen `visible` fields to `true` or `false` and commit. The same workflow validates and publishes the result. The configuration is the persistent source of truth; local browser storage is not used.

Codex can also apply these changes when asked, for example “Show Sprint 2 and hide Sprint 1 on the DS home.” Each change remains in Git history. If publishing fails, the previous successful site remains live; inspect the failed workflow rather than assuming the switch reached students.

## What hiding means

Hiding removes the section and its navigation from the generated course home. It does not revoke access to a previously published resource or its public repository history. The existing site's older practice materials include a public teacher guide and calibration examples; treat those as already disclosed practice, not unseen assessments. New teacher keys, learner evidence, restricted IB originals and unseen examination materials must stay outside this public repository. Do not rely on a hidden link, collapsed panel or JavaScript password for confidentiality.

## Add a finished workbook

Use existing course/sprint/project IDs. Add the reviewed student package and its relative URL to `course-home/sprints.json`; verify the Workbook Standard release checklist, real Coach and project Form links, assets, rubric version and permitted-help conditions. Do not paste teacher-only generation prompts into the public catalogue. `tools/build_home.py` rejects missing workbook targets. Run `python3 tools/test_home.py` before publishing.

Build instructions follow [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [manual workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
