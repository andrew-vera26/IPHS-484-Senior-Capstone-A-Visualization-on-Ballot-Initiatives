# Spec versus site

Written 2026-11-15. Plan step: design track **D4** (review the prototype and log the gaps). Compares the frozen spec (`spec/v1/01-Project-Context-What-Survives.txt`, sections 7, 9 and 13) with `site-prototype/` on branch `site-prototype-v2`, read alongside `docs/workflow/plan.md`, `docs/log/spec-drift.md`, `docs/design/DESIGN.md` and `site-prototype/HANDOFF.md`.

Status values: **Met**, **Partly**, **Not built**, **Changed on purpose** (a recorded decision in DESIGN.md or an ADR).

## Requirements

| # | Spec requirement | Source | Status | What the site actually does |
|---|---|---|---|---|
| 1 | **Case view**: provision by provision | 13.1 | Met | `case.html`: one strip cell per record in reading order, grouped by section; a list table as an accessible alternative. |
| 1a | Voter-enacted text beside current statute | 13.1 | Met, with a difference | The panel shows the base witness beside the **comparison witness (the one coded amending bill)**, not the current statute. Each case has one comparison witness (friction 17). Texts are shown exactly as stored. |
| 1b | Coded by operation and direction | 13.1, 9.2, 9.4 | Met | Lens switch: Layer 1 (what happened), Layer 2 (type), Layer 3 (direction), Layer 4 (mechanism). Layer 3 holds one value in all data (friction 13), so Direction looks uniform. Layers 3 and 4 hide in Facts only. |
| 1c | Source span for every claim | 13.1 | Not built (no data) | All span fields are `[null, null]` (friction 11). The panel shows "Not coded yet" for evidence and offers a labeled mechanical word comparison instead. |
| 1d | Legislature's own description adjacent to its measured effect | 13.1, 9.6 | Partly | Description and effect sit side by side, but on the Patterns page per bill, not inside the case view per change. Layer 5 holds a coder label, not the bill's own words (friction 16). |
| 2 | **Cross-case views**: provision-type heatmap (types by cases, color by survival) | 13.1, 7.1 | Partly | No types-by-cases heatmap. The home page shows every case as a strip (small multiples), which is the heatmap-as-navigation idea from 7.1. Patterns has a **mechanism** (Layer 4) by case matrix of counts. A Layer 2 heatmap would compare two different value lists (friction 12). |
| 2a | Timeline: days from enactment to alteration | 13.1, 9.7 | Met | Patterns, "Days from enactment to alteration", from Layer 6. An erosion timeline adds a "Not coded yet" row for later bills. |
| 2b | Description-gap view | 13.1, 9.6 | Partly | Patterns, "How each bill was described, beside what was coded". The gap flag count shows with interpretation on. Limited by friction 16. |
| 3 | **Method page**: the pipeline | 13.1, 7.1 | Not built (no pipeline) | Added this pass: "Not coded yet" empty state saying no pipeline has run and what step 8 must supply. |
| 3a | Method: the codebook | 13.1, 9 | Partly | Unit, layers 1 to 9 in plain language, value lists computed from data with codebook membership, provenance, denominator rule, routes, cutoff. The codebook is the working one, drawn from one case. |
| 3b | Method: selection criteria | 13.1 | Not built (no data) | Added this pass: "Not coded yet" empty state (needs S1, S2 and step 5). |
| 3c | Method: excluded cases | 13.1 | Not built (no data) | Added this pass: "Not coded yet" empty state (needs the step 5 audit). |
| 3d | Method: per-layer reliability figures | 13.1, 12.1 | Not built (no data) | Added this pass: "Not coded yet" empty state (needs step 6 gold). About `#trust` shows the coding metadata table, which is not agreement. |
| 4 | **Data page**: the full dataset, downloadable | 13.1, 7.1 | Partly | Added this pass: `data.html`, linked in the nav. Lists each coded file, the corpus seed and the codebook as downloads, and the three views with CSV and JSON (case, corpus, mechanism matrix). Labeled model-coded, unaudited. No combined dataset file and no gold. |
| 5 | **Dated snapshot**: pages state when they were produced | 7.1, 13.2 | Partly | Added this pass: "Snapshot: November 15, 2026. Prototype." under the banner on every page. It is a fixed constant in `js/chrome.js`, not generated at build time; there is no build. Documentation on adding a case exists for agents (DESIGN.md 12) but not for readers. |
| 6 | **Opening claim**, not a search box; provisional | 13.3 | Partly | The home page opens with a question ("What survives when a legislature alters an initiative?") and a lead marked "Provisional", then the strips. There is no search box. About states a method claim, marked provisional. None of the four candidate findings leads, which is correct until roughly the eighth coded case. Not changed in this pass, as instructed. |
| 7 | **Fixed visual commitment 1**: the eye finds the hot spots | 13.1, 7.1 | Partly | Layer 1 colors make deleted provisions stand out on every strip, and strips are side by side on the home page. With two cases, almost all deleted in one, there are few contrasts to find. |
| 8 | **Fixed visual commitment 2**: magnitude and direction in separate visual channels (intensity and hue) | 13.1, 7.2 | Met | "Both" lens on the case page and landing strips: hue is Layer 3 direction, Layer 1's pattern and fill (hollow, half, striped, solid) carry what happened. No light-to-dark ramp, because there is no severity score, so "intensity" is read as pattern (ADR 0008, spec-drift row). Facts only drops the hue. Before this pass both layers shared one channel, one at a time. |

## The three fixes in this pass

| Fix | Already present? | Done |
|---|---|---|
| (a) Snapshot line on every page near the banner | No. The banner and footer had no date; only the cutoff date appears | Added `SNAPSHOT` and a `p.snapshot` line directly under the banner in `js/chrome.js`, styled in `css/site.css`. Not sticky, so the pinned strip on the case page is unaffected |
| (b) Method sections: pipeline, selection criteria, excluded cases, per-layer reliability | No. None of the four existed (Method had unit, layers, values, provenance, denominator, routes, cutoff, limits) | Added all four to `js/method.js` as "Not coded yet" empty states, each with one line on what is needed |
| (c) Data page in the nav | No. Downloads existed only inside the case, corpus and patterns views | Added `data.html`, `js/data-page.js` and a "Data" nav item. It lists files and views; it does not copy or recount data |

No data, counts or labels were changed. `python3 site-prototype/check_data.py` still passes. All three edited or new scripts parse (`node --check`).

**Not verified in a browser.** Starting a local server was not permitted in this session, so the new line, sections and page have not been looked at rendered, at phone width, or in dark mode. Do that before relying on them (see HANDOFF "Run").

## Larger gaps, flagged and not fixed

1. **Two-channel encoding (row 8).** Resolved in a later pass the same day: "Both" lens, ADR 0008. Remaining: Layer 3 holds `narrows` on almost every record, so the hue channel shows one color until more cases are coded.
2. **Comparison is against one bill, not the current statute (row 1a).** Depends on outcomes indexed by bill (schema v0.3, known gap 1).
3. **No evidence spans (row 1c).** The spec's "source span for every claim" cannot be met until spans are coded. Blocks rule 2 checks too.
4. **Provision-type heatmap (row 2).** Not built, and should not be until Layer 2 uses one value list across cases (friction 12).
5. **Description in the bill's own words (rows 1d, 2b).** Needs Layer 5 to store or link the actual title and summary (friction 16).
6. **Snapshot is hand-set (row 5).** When the real site gets a build step (plan step 11), the date should come from the build, with the commit it was built from.
7. **Data page lists, it does not package.** A single combined, versioned download and a reader-facing "how to add a case" note are missing.
8. **Plan status is stale.** The design track table in `docs/workflow/plan.md` shows D1 to D5 as `todo`, although D1 to D3 have outputs. Updating it is the human's call.

## Later pass: the "Both" lens (2026-11-15)

A combined lens did not exist before this pass (the lenses were What happened, Type, Direction, Mechanism). Added as a fifth lens, `lens=both`. Row 8 is now Met. See DESIGN.md section 14 and ADR 0008.

Colour check: the direction hues were tested with a protanopia, deuteranopia and tritanopia simulation (Machado 2009, full severity; CIELAB distance). Narrows and expands stay apart in all three (ΔE 31 or more). "No direction" was first drawn in the secondary ink, which nearly matched teal "expands" for protanopes in dark mode (ΔE 1). It now uses the full ink, which stays apart from every direction hue (ΔE 19 or more). Not fixed, because it belongs to the existing Layer 3 palette and neither value occurs in the data: `expands` and `neutral` are close for protanopes (ΔE 7 in light mode).
