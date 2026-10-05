# Sprint 3: chapter teaching and weekly learning package

**Draft for review. Not published to the student site.** This branch prepares the existing `redesign-the-feed` route for the five 70-minute classes on 5–9 October 2026. Merging into `main` triggers GitHub Pages publication; leave this pull request unmerged until release is authorized.

## Review the material

- [Student workbook](sprints/redesign-the-feed/index.html) · [39-page print workbook](sprints/redesign-the-feed/Week_Workbook_v3.pdf)
- [Four chapter teaching decks](sprints/redesign-the-feed/teaching-decks/index.html)
- [Algorithms and code — 20 slides](sprints/redesign-the-feed/teaching-decks/01-algorithms-teaching.pptx)
- [Algorithmic dilemmas — 16 slides](sprints/redesign-the-feed/teaching-decks/02-dilemmas-teaching.pptx)
- [Big data and collection — 12 slides](sprints/redesign-the-feed/teaching-decks/03-big-data-teaching.pptx)
- [Business and labour — 19 slides](sprints/redesign-the-feed/teaching-decks/04-business-labour-teaching.pptx)
- [Assignments](sprints/redesign-the-feed/assignments-v2.html) · [3-page assignment kit](sprints/redesign-the-feed/Week_Assignments_v3.pdf)
- [Independent chapter checks](sprints/redesign-the-feed/chapter-checks.html) · [4-page print checks](sprints/redesign-the-feed/Chapter_Assessments_v3.pdf)
- [Google knowledge checks and Student OS reflection route](sprints/redesign-the-feed/knowledge-and-reflection.html)
- [Real-world case file](sprints/redesign-the-feed/case-file.html) · [Paper 1/2-style practice](sprints/redesign-the-feed/paper-practice.html)
- [Simulation: TraceLab](sprints/redesign-the-feed/sim/search-sort.html) · [Tune the Feed](sprints/redesign-the-feed/sim/tune-the-feed.html) · [Roundtable](sprints/redesign-the-feed/sim/feedback-loop.html)

GitHub displays source and downloads; browser interaction uses a local server. The existing local review remains at http://127.0.0.1:8763/review.html. To preview this checkout separately, run `python3 -m http.server 8764 --bind 127.0.0.1` from its root and open `/sprints/redesign-the-feed/index.html`.

## Scope and preservation

The two algorithms decks teach core 3.2A–E. The data deck teaches the assigned 3.1 excerpt, pp. 72–74; the economic deck teaches the assigned 4.2 excerpt, pp. 213–219. The latter two are assigned sections, not claims of whole-chapter coverage. The 67 slides include narrated explanations, 17 practice checkpoints, diagrams, editable tables/charts and optional video routes. Teacher MP3 recordings are absent; the browser offers student-controlled speech fallback.

All 35 original workbook response IDs, questions, step headings and original Form links remain intact. `workbook.js` and `engagement-data.js` are preserved byte-for-byte, retaining the existing saved-answer contract. The original live PDF remains at its existing path. The original asset ZIP is preserved in the frozen `original/` snapshot; the current student asset download is updated. The print workbook preserves all 34 prior pages and adds a current-route cover plus the four chapter-check/correction pages. Earlier activity decks and print references remain historical; the current teaching route is the four decks linked above.

The chapter checks retain an initial attempt separately from corrections, reading locators and support/reflection. They are formative supplements, add no marks to the existing /12 quiz and do not establish an IB 1–7 prediction. Browser sealing supports the classroom workflow and requires teacher supervision.

## Verification and remaining release work

The existing local build passed 130/130 deck/preservation checks, 23/23 chapter workflow checks and 26/26 final package checks. All 67 rendered slides and all 46 new PDF pages were visually reviewed. The branch handoff also verifies copied-file hashes, baseline preservation, local links and the student-site packaging. The packager explicitly includes the four linked student transcripts; other authoring Markdown and JSON remain excluded from the published site.

Teacher content, novice pacing and video preview remain review tasks. Audible narration quality, a native PowerPoint session, physical iPad use and school-account access have not been tested. Active Google registry entries do not prove that Forms accept responses. A dedicated chapter knowledge/reflection Form specification is prepared privately, but that new Form is uncreated and unregistered; no Google, roster, results, Evidence Map or Netlify write is included here.

Teacher answer guidance, independent quiz/retry keys and the proposed capture Form stay in the private local authoring package. They are excluded from this public repository. Only student material and this review record are uploaded. The existing GitHub Pages site remains unchanged until an authorized merge/release.

The [handoff manifest](SPRINT03_REVIEW.json) records the base revision, copied-file SHA-256 values and local build results.
