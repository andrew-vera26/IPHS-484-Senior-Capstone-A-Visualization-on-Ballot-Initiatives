# HANDOFF: site prototype

Read this, then `docs/design/DESIGN.md` (sections 11 and 12 first), then `docs/design/prototype-brief.md`.

## Run
From the repo root:

    python3 -m http.server 8000

Then open `http://localhost:8000/site-prototype/`. It must be served from the repo root, because the pages read `data/` and `spec/` in place. Opening the HTML files directly from disk will not work.

Check the numbers: `python3 site-prototype/check_data.py` (prints what the site should show and exits non-zero on a mismatch with the brief's expected values). In the browser console, `__WS_COUNTS__` holds the site's own computed counts.

## Status (2026-11-15, end of session)
All of Steps 0 to 6 are done. Branch `site-prototype`, local commits only, nothing pushed.

| Brief item | State | Where |
|---|---|---|
| 1 Case page, strip, lenses, summary band | built | `case.html`, `js/case.js`, `js/strip.js`, `js/encode.js` |
| 2 Side-by-side panel | built | `js/panel.js` |
| 3 Facts only / with interpretation | built, global switch in the masthead | `js/chrome.js` |
| 4 Dependency overlay, hidden-change flag | built | `js/case.js` (`drawArcs`), `js/panel.js` |
| 5 Corpus page | built | `corpus.html`, `js/corpus.js` |
| 6 About | built | `js/about.js` |
| 7 Method | built, value lists computed from data | `js/method.js` |
| 8 Small multiples | built, it is the home page | `index.html`, `js/home.js` |
| 9 Description versus effect | built from Layer 5 | `js/patterns.js` |
| 10 Mechanism matrix | built, drill-down to provisions | `js/patterns.js` |
| 11 Speed view | built from Layer 6 | `js/patterns.js` |
| 12 Erosion timeline | two real rows, third is "Not coded yet" | `js/patterns.js` |
| 13 Visible controls | empty state only | `js/patterns.js` |
| 14 Citation and export | permalink, Cite, CSV, JSON | `js/panel.js`, `js/export.js` |
| 15 Length-weighted width | optional toggle, off by default | `js/case.js` |

## Verified this session
- `check_data.py` passes: Missouri 102 records, 70 provisions, 32 components, 67 in the denominator; `p003` is partially deleted, narrows, escalation removal, `dependency_affected` true.
- The case page shows the same numbers (read back from the DOM in a headless browser), 102 cells, 32 component cells, 3 inherited, 1 hidden-change mark.
- South Dakota: 70 records; provisions, components and denominator read "Not coded yet".
- Looked at in headless Chromium at 1440px and 390px, light and dark. No console errors. No horizontal scroll at 390px.
- Not tested: Safari and Firefox, a screen reader, real touch input, the CSV and JSON downloads beyond code review, the clipboard buttons.

## Known issues
- With 17 Layer 2 values, some Type colors are close to each other.
- On a phone the dependency arcs cross wrapped rows and are hard to follow.
- The 12,000-character South Dakota provision makes one very wide cell when "Width by text length" is on. That is what the toggle means, and it is why it is off by default.
- `python3 -m http.server` lets the browser cache CSS and JS. After editing, hard-reload.
- The mode switch is stored in `localStorage`, so it persists between visits; a link with `?mode=facts` overrides it.
- Schema and data mismatches are logged in `docs/log/friction-log.md`, entries 9 to 20.

## Rules that bind every session
Branch `site-prototype`. Never push. Never write to `data/`, `gold/`, `spec/`. Never touch the docs workflow. No fabricated data: anything missing says "Not coded yet" and names what is needed. Never reword stored text. Every count is computed. Route A and Route B are never pooled. Only `js/data.js` knows field names.

## Next
See `docs/design/DESIGN.md` section 12.
