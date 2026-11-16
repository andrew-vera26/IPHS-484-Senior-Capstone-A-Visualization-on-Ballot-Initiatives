# DESIGN: "What Survives" site prototype

Written 2026-11-15, before any code, by Claude (Fable 5.2). Updated at the end of the session (see "Decisions made during the build"). Companion files: `docs/design/prototype-brief.md` (the task), `docs/design/data-contract.md` (the real field names), `docs/design/references.md` (what was borrowed), `site-prototype/HANDOFF.md` (state of the build).

The site is a critical edition of a law. It shows the version voters enacted against the version the legislature left, provision by provision. Everything it shows is model-coded and unaudited, and it says so on every page.

---

## 1. Brainstorm

Three directions were considered.

**A. The critical edition.** A typographic page, like a scholarly edition with its apparatus. Serif text, hairline rules, one strip per law treated like a line of collation, and the side-by-side reading panel opening directly beneath it. Color is used only for coded values.
- For: matches the Variorum model and the author's "closer to a critical edition than a dashboard". The texts are the evidence, and this direction makes them the largest thing on the page.
- Against: risks looking like a plain document. Cross-case views need a chart language that an edition does not supply.

**B. The research atlas.** Our World in Data's discipline: every view is a framed figure with a stated title, a subtitle that says what is counted, a source line, a note, and a download. Sans-serif, chart-first.
- For: very legible, and the figure frame is the best available device for honesty, because the caveat travels with every figure.
- Against: as the whole site it reads as a dashboard, and it pushes the legal text into a secondary role.

**C. The instrument.** A dense, dark, monospace analysis console with linked panes (strip, text, dependency graph, table) all visible at once.
- For: powerful for an expert, and distinctive.
- Against: intimidating in a ten-minute presentation, poor on a narrow screen, and it signals "finished analytical product" when the data is unaudited.

**Chosen: A, with B's figure frame.** The page is an edition (A). Every strip, matrix and chart sits in a figure frame with title, one-line subtitle, and a footer that repeats the data status (B). C's one good idea, linked highlighting between strip and text, is kept in a small form: hovering a cell shows a one-line readout, and the dependency overlay links cells.

**Additions and changes proposed to the brief's concept**

1. **Mechanical word comparison in the panel.** The two stored texts are compared word by word in the browser and the differing words are highlighted. Nothing is reworded: both texts are still shown exactly as stored. It is labeled "mechanical comparison, not coded evidence", and can be turned off. Reason: for the four Missouri provisions that survive in some form, the reader's first question is "which words went", and the data has no evidence spans to answer it.
2. **Facts-only mode keeps a structural version of the dependency flag.** `dependency_affected` is a judgment, so the "hidden change" label is hidden in facts-only mode. In its place the site shows the structural fact it can compute: "depends on p002, which was rewritten".
3. **Erosion timeline shows the two rows the data does support** (as enacted, and after the one coded bill) and an explicit "Not coded yet" third row. No invented bill.
4. **Section ticks on the strip**, derived from the citation, so the strip reads as a document with parts.

**Problems flagged with the concept**

- `enacted_by` (Route A or B) is not in the coded files. It comes from the seed file. The schema needs it at measure level.
- South Dakota has no `counts_in_denominator` field, so its denominator cannot be computed by the stated rule. The site shows "Not coded yet" there and does not assume a value.
- The brief asks for "quoted evidence" in the panel. No span offsets are filled in either file. The panel shows "Not coded yet" for the evidence span.
- Layer 2 uses different value lists in the two cases. A cross-case Layer 2 comparison would be misleading, so the Layer 2 legend marks values that are not in the codebook.
- Layer 3 has one value (`narrows`) in all the data. The Layer 3 lens will look uniform. That is a property of the data and the page says so.

---

## 2. Pages

All pages are static HTML in `site-prototype/`, loaded as ES modules, no build step, no external requests.

| Page | File | Purpose | Brief item |
|---|---|---|---|
| Home | `index.html` | What the project is in three sentences, the two routes with separate counts, and every coded case as a strip (small multiples) | 8 |
| Case | `case.html?case=<measure_id>` | The edition of one law: header, lens, strip, summary band, side-by-side panel, dependency overlay | 1, 2, 3, 4, 14, 15 |
| Corpus | `corpus.html` | The seed table, filters, badges, links out | 5 |
| Patterns | `patterns.html` | Cross-case views: mechanism matrix, description versus effect, speed, erosion timeline, visible controls | 9 to 13 |
| Method | `method.html` | Layers, value lists, provision rule, denominator rule, cutoff, the two routes | 7 |
| About | `about.html` | The claim (provisional), the two routes, trustworthiness | 6 |

### Shared chrome (every page), `js/chrome.js`

1. **Status banner**, sticky at the very top, never dismissible: "Prototype. Model-coded, unaudited." followed by a link "What this means" to `about.html#trust`.
2. **Masthead**: wordmark "What Survives" in serif, a one-line descriptor, and navigation (Cases, Corpus, Patterns, Method, About).
3. **Reading-mode switch** in the masthead: "Facts only / With interpretation" (see section 4). Stored in `localStorage` and mirrored in the URL (`?mode=facts`).
4. **Theme switch**: auto, light, dark.
5. **Footer**: data status again, the denominator rule in one line, the cutoff date, and "Local prototype, not published".

### Home (`index.html`, `js/home.js`)
- Lead: the project sentence from the README, marked provisional.
- **Two routes**, side by side: Route A and Route B, each with one plain sentence and its own counts computed from the seed (cases listed, cases coded). Route B shows "Not coded yet" for coded cases.
- **Small multiples** figure: one strip per coded case, stacked, each labeled with title, year, route badge. Sort control: year, route, topic. Route filter. Lens switch shared with the case page. Clicking a cell opens that provision on the case page. Candidate cases appear under the strips as rows that say "Not coded yet", so the gap is visible in the same picture.
- Reads: seed rows; per record `layer_1..4`, `provenance`, `counts_in_denominator`; `layer_7_measure_context.topic`.

### Case (`case.html`, `js/case.js`, `js/strip.js`, `js/panel.js`)
Top to bottom:
1. **Header.** Title (seed `title`), state and year, route badge (seed `enacted_by`), status ("Model-coded, unaudited" from `coded_by`), altering instrument (seed), link out if the seed has one, otherwise "No external link yet". A small definition list of bill-level facts read from the first record: vote margin, passage margins, executive action, emergency clause, topic.
2. **Figure: the strip.**
   - Title: "Every provision of <title>, in reading order". Subtitle changes with the lens and states what the color means.
   - **Lens switch** (segmented control): What happened (Layer 1, default), Type (Layer 2), Direction (Layer 3), Mechanism (Layer 4). Layers 3 and 4 disappear in facts-only mode.
   - **Legend** on the same rule: each value with its swatch and its count in this case. Clicking a legend value dims all other cells. Each legend value has a small "?" link to its entry on the Method page.
   - **The strip**: one cell per record, in file order. Cells are grouped by section (derived from `base_witness.citation` up to the first parenthesis) with a small gap and a section label above the group.
   - Hover or keyboard focus shows a one-line readout under the strip: spine ID, citation, lens value.
   - **Options**: "Show dependencies" (overlay), "Width by text length" (off by default, labeled "length is not importance").
3. **Summary band.** Large figures: records, provisions, components, inherited, in the denominator. Then one line: "Denominator: records with `counts_in_denominator == true` and provenance `created` or `amended`." Then the Layer 1 breakdown of the denominator as counts (never as a headline percentage). When a file lacks `counts_in_denominator`, the denominator figure reads "Not coded yet" with one line on why.
4. **Panel** (opens under the strip when a cell is selected; the firm requirement). See section 3.
5. **Provision list** (collapsed by default): a plain table of all records with ID, citation, and the four layer values, as an accessible alternative to the strip. Rows open the panel.
6. **Export row**: download current view as CSV or JSON; copy link.

### Corpus (`corpus.html`, `js/corpus.js`)
- A table from `data/corpus-seed.json`: title, state, year, route badge, status, altering instrument, link.
- Filters: route (All, A, B), status (All, coded, not coded). Counts above the table are per route, never pooled: "Route A: 6 listed, 2 coded. Route B: 4 listed, 0 coded."
- Status column: `coded_model_unaudited` shows "Model-coded, unaudited" and the row title links to the case page. `candidate_unverified` shows **"Not coded yet"** and the row is visibly muted with a dashed left edge.
- Rows from the Ballotpedia list carry a small note "Ballotpedia list, to be verified against primary sources".
- Link column: "Ballotpedia" where the seed has a link, otherwise "none yet".
- CSV and JSON download of the filtered rows.

### Patterns (`patterns.html`, `js/patterns.js`)
Each view is a figure frame. Route A and Route B are separate column groups or separate blocks everywhere. Route B blocks read "Not coded yet".
1. **Mechanism matrix.** Rows: Layer 4 values present in the data, plus "no mechanism recorded". Columns: coded cases, grouped by route. Cell: count of records. Clicking a cell lists the provisions underneath, each linking to its panel on the case page. No row totals across routes. Hidden in facts-only mode (replaced with a one-line note), because Layer 4 is interpretive.
2. **Description versus effect.** Per bill: left, how the bill was described (`layer_5_description.stated_rationale`, `rationale_source`, shown verbatim); right, what the coding records (Layer 1 counts). The gap flag count (`description_effect_gap`) shows only with interpretation on.
3. **Speed.** One horizontal track per case, in days from enactment: a tick at introduction (`days_enactment_to_introduction`) and a mark at the alteration taking effect (`days_enactment_to_alteration_effective`). Beside it: how many records have `altered_before_provision_took_effect == true`.
4. **Erosion timeline.** Per case: row 1 "As enacted" (all cells neutral), row 2 "After <bill>" (Layer 1 colors), row 3 an empty dashed slot: "Not coded yet. No later amending bill is coded; outcomes are not yet indexed by bill."
5. **Visible controls.** An empty, designed slot: "Not coded yet. Unaltered and technical-correction cases are required as counter-cases and none is in the data."

### Method (`method.html`, `js/method.js`)
- The unit (provision, component, the separate-survivability test).
- The layers in plain language (1 to 4 at provision level; 5 to 9 briefly).
- **Value lists**, computed from the data: for each of Layers 1 to 4 and provenance, every value observed, its count per case, whether the string appears in `spec/codebook.md`, and a link "show in <case>" that opens the case page with that lens and value highlighted. The codebook's own definition is quoted where it has one (only `escalation removal` does). Values with no prose definition say so.
- The denominator rule, with the computed numbers per case.
- The cutoff: December 31, 2025.
- The two routes.

### About (`about.html`)
- The claim, marked "Provisional".
- The two routes, in plain language, and why they are never pooled.
- **Trustworthiness** (`#trust`): how coding was done (computed table of `coded_by`, `human_model_agreement`, `adjudicated`, `flagged_for_review`, `confidence` per case), what the limits are, and why every figure is labeled.

---

## 3. The panel (side-by-side)

Opens in place, directly under the strip, full width. One provision at a time. Closing returns focus to the cell.

```
┌──────────────────────────────────────────────────────────────────────┐
│ MO-2024-PropA-p003   § 290.502(3)          [Cite] [Copy link] [×]   │
│ ‹ previous                                               next ›     │
├──────────────────────────────┬───────────────────────────────────────┤
│ VOTER-ENACTED TEXT           │ AFTER HB 567                          │
│ base witness                 │ comparison witness MO-2025-HB567      │
│ (text exactly as stored)     │ (text exactly as stored, or           │
│                              │  "No text stored for this witness")   │
├──────────────────────────────┴───────────────────────────────────────┤
│ FACTS       What happened: partially deleted   Type: escalation…    │
│             Provenance: amended   Counts in denominator: yes         │
│ INTERPRETATION   Direction: narrows   Mechanism: escalation removal │
│             Rationale (model-written): …                             │
│ EVIDENCE    Quoted span: Not coded yet                               │
│ DEPENDENCIES  Depends on: p001, p002   Depended on by: p004          │
│             ◆ Hidden change: …                                       │
└──────────────────────────────────────────────────────────────────────┘
```

- Text columns use the serif reading face, `white-space: pre-wrap`, so line breaks stored in the data are preserved. Nothing is trimmed, re-cased or re-flowed in the DOM text.
- "Highlight differences" (on by default when both witnesses have text) wraps differing words in `<mark>`-like spans. The words themselves are untouched.
- When a witness text is null the column says "No text stored for this witness." and, on the comparison side, repeats the Layer 1 value. It does not say "Not coded yet", because the absence is itself the coded outcome.
- The interpretation block (Layer 3, Layer 4, rationale, hidden-change flag) is removed in facts-only mode, and a one-line note says it is hidden.
- "Rationale" is labeled "model-written" every time.
- Evidence: `layer_3_driving_span`, `base_witness.span`, `comparison_witness.span`. When all are `[null, null]`: "Not coded yet. Character offsets for the quoted evidence are empty in this file."
- Dependencies are chips that select the other provision.
- **Cite** copies: `What Survives (prototype, model-coded, unaudited). <spine_id>, <title>, § <citation>. <permalink>. Accessed <date>.`
- **Permalink**: `case.html?case=<measure_id>&p=<spine_id>` (plus `lens` and `mode` when not default).

---

## 4. Interactions and state

| Control | Where | State | Effect |
|---|---|---|---|
| Lens | case, home | URL `lens=l1|l2|l3|l4` | Recolors cells and legend |
| Facts only / With interpretation | masthead | `localStorage` + URL `mode=facts` | Hides Layer 3, Layer 4, rationale, hidden-change flag, gap flag, mechanism matrix. If the lens was l3 or l4 it falls back to l1 |
| Legend value | case | URL `value=` | Dims other cells |
| Cell click, Enter | case | URL `p=` | Opens panel |
| Arrow keys on strip | case | | Moves focus cell by cell; Home and End jump |
| Esc | case | | Closes panel |
| Show dependencies | case | URL `deps=1` | Draws arcs above the strip |
| Width by text length | case | URL `w=len` | Cell width proportional to `base_witness.text` length |
| Route filter | home, corpus, patterns | URL `route=A|B` | Filters lists |
| Sort | home | URL `sort=` | year, route, topic |

All state lives in the URL so any view can be linked and cited.

### Dependency overlay
- With the overlay on, arcs are drawn in an SVG layer above the strip from each provision to what it depends on (`depends_on`). With a provision selected, its own arcs are drawn in full ink (solid for `depends_on`, dashed for `depended_on_by`) and the rest are faint.
- A provision with `dependency_affected == true` carries a small diamond above its cell whenever interpretation is on, overlay or not, and the legend names it "Hidden change: looks intact, but something it depends on was changed".
- In facts-only mode the diamond is hidden. The panel instead lists each dependency with that dependency's own Layer 1 value.
- Cases with no dependency links (South Dakota) show "No dependency links are recorded for this case." when the overlay is turned on.

---

## 5. Encodings

**No severity.** Layer 1 colors are categories, not a scale. Cells are equal width by default.

### Cell anatomy
- **Provision** (`counts_in_denominator == true`): full-height cell.
- **Component** (`counts_in_denominator == false`): a cell 55% of the height, bottom-aligned, so components visibly hang below the line of provisions. When the field is absent (South Dakota) cells are full height and the legend says "component flag not coded yet".
- **Inherited** (`provenance == inherited`): diagonal hatch over the cell and a dotted cap line above it.
- **Hidden change**: diamond above the cell.
- **Selected**: 2px ink outline and a notch pointing to the panel.

### Color (light / dark)

Layer 1, what happened:

| Value | Light | Dark | Second encoding |
|---|---|---|---|
| unchanged | paper fill, 1px ink border | transparent, light border | hollow |
| partially deleted | `#B9770E` | `#E3A93F` | lower half filled, upper half hollow |
| rewritten | `#2E6E8E` | `#6FB1D3` | horizontal pinstripe |
| deleted entirely | `#7B1E2B` | `#D0566A` | solid |

Layer 3, direction: narrows `#A3471F` / `#E08A5B`; expands `#1E7A6B` / `#57BDA9`; neutral grey; indeterminate grey with dots; no value: hollow, dashed border.

Layers 2 and 4 use a fixed qualitative palette (Paul Tol "muted", color-blind safe), assigned by the alphabetical order of all values present across loaded cases, so a value has the same color in every case. "No value" is hollow with a dashed border.

Route: **Route A** is a filled badge (ink blue `#1F4E79`), **Route B** is an outlined badge (bronze `#7A4E12`). Filled versus outlined carries the difference without color, and the letter is always printed.

Status: "Model-coded, unaudited" is a plain tracked label with a small open circle. "Not coded yet" is a dashed outline pill in muted ink.

### Typography
- Reading and display: `"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif`. System fonts only, so the site runs offline with nothing to download. (No font files are vendored; see decisions.)
- Apparatus (labels, controls, tables): `"Avenir Next", "Segoe UI", system-ui, sans-serif`, small, tracked uppercase for labels.
- Identifiers and field names: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
- Scale: 17px body, 1.6 line height, measure capped at 68 characters for prose. Page titles 40px serif with a thin double rule beneath. Figure titles 21px serif. Labels 11.5px.

### Space and surface
- Paper `#FAF8F3`, surface `#FFFFFF`, ink `#1D1B18`, secondary ink `#57524B`, rules `#D8D2C6`. Dark: paper `#16151A`, surface `#1E1D23`, ink `#ECE8DF`.
- Page column 1120px max. Prose column 680px. Figures run the full column.
- No shadows, no rounded cards. Hairlines and space separate things. Radius 2px at most.
- A figure frame is: top rule in ink, title, subtitle, controls, body, bottom hairline, footer (source, status, note, downloads).

### Why this look
The page should read as a publication: a reader should trust it as far as its labels say and no further. Serif text and rules put it in the tradition of printed editions; the figure frame carries the caveat with every figure; color is reserved for coded values so the eye goes to them; and the absence of dashboard furniture keeps unaudited numbers from looking more settled than they are.

---

## 6. Route A and Route B, everywhere

- `enacted_by` is read from the seed file (`voters` or `legislature`).
- Badge: on the case header, on every row of the corpus table, on every strip label in small multiples, on every column header of the matrix, on every track of the speed view.
- Filter: on the corpus table, the small multiples, and the Patterns page.
- Counts: always per route, in two separate blocks. No sum across routes is ever computed or printed. `data.js` exposes `byRoute()` and no pooled helper.
- Route B has no coded case. Every Route B block reads "Not coded yet", lists the four candidates from the seed, and says what is needed (the adopted text, the amending bill, and coding).
- Explained in plain language on About and Method, with the reason: in Route B voters never voted, so "what voters voted for" does not apply.

---

## 7. Honesty rules in the interface

1. The banner is on every page and cannot be closed.
2. The words "findings" and "results" are not used for the data. The site says "coded values", "counts", "records".
3. Every count is computed in the browser from the files. Nothing is typed in.
4. Missing data says **"Not coded yet"**, then one line on what is needed.
5. Stored text is rendered through `textContent`, never edited. Highlighting only wraps existing characters.
6. Percentages are avoided for unaudited counts. Counts are shown as "n of N".
7. Model-written rationale is labeled as model-written.

---

## 8. Accessibility

- Text contrast at least 4.5:1 in both themes; cell colors at least 3:1 against the paper, and every Layer 1 value has a second, non-color encoding (hollow, half, stripe, solid).
- The strip is a `role="listbox"`-like roving-tabindex group: one tab stop, arrow keys move, Enter or Space opens, Esc closes. Each cell has an `aria-label` with ID, citation and the current lens value.
- The panel is a labelled region; focus moves to its heading on open and back to the cell on close.
- The provision table is a complete non-visual alternative to the strip.
- Controls are real `button`, `input`, `select` elements with visible focus rings.
- `prefers-reduced-motion` removes transitions. `prefers-color-scheme` sets the default theme.

## 9. Responsive behavior

- Above 900px: strip on one row; panel in two columns.
- 600 to 900px: strip wraps by section; panel in two columns.
- Below 600px: cells take a fixed 9px width and wrap by section; the panel's two texts stack (voter text first) with a sticky two-tab switch "Voter text / Amending text"; tables scroll horizontally inside their frame; masthead navigation wraps under the wordmark.
- The banner stays one line where it can and wraps to two lines otherwise.

## 10. Code layout

```
site-prototype/
  index.html  case.html  corpus.html  patterns.html  method.html  about.html
  css/site.css
  js/data.js        the only file that knows field names or file paths
  js/chrome.js      banner, masthead, footer, mode and theme switches
  js/encode.js      lens definitions, colors, legend building
  js/strip.js       strip rendering (used by home, case, patterns)
  js/panel.js       side-by-side panel
  js/diff.js        word-level comparison
  js/export.js      CSV, JSON, clipboard
  js/home.js  js/case.js  js/corpus.js  js/patterns.js  js/method.js  js/about.js
  data/corpus-seed.json
  check_data.py
  HANDOFF.md
```

### The `data.js` boundary
`data.js` exports normalized objects. No other file reads a raw record.

```
loadCorpus()  -> { seed: Row[], cases: Case[] }
Case      { id, title, state, year, route: "A"|"B", enactedBy, status, instrument, link,
            bill: { id, description:{…}, timing:{…} }, context:{…}, fate:{…},
            provisions: Provision[], hasDenominatorFlag: boolean, counts:{…} }
Provision { id, short, caseId, citation, section, index,
            baseText, compText, compCitation,
            l1, l2, l3, l4, l4Applies, rationale,
            provenance, provenanceBasis,
            isComponent: boolean|null, parentId, inDenominator: boolean|null,
            dependsOn[], dependedOnBy[], dependencyAffected, dependencySources[],
            evidence: { drivingSpan, baseSpan, compSpan, any: boolean },
            gapFlag, alteredBeforeEffect, meta:{codedBy, confidence, flagged, …} }
```

When the schema moves to four linked tables (initiative, bill, provision, outcome), `loadCorpus()` should join them back into these shapes. `Provision.l1..l4` then come from the outcome row for the selected bill.

No library is vendored. The site needs none.

---

## 11. Decisions made during the build

Recorded 2026-11-15. Where this section and the sections above disagree, this section is what was built.

1. **No library and no font files are vendored.** The site uses system fonts and hand-written SVG and CSS. It makes no network request other than reading the repo's own files.
2. **Route comes from the seed.** `data.js` joins `corpus-seed.json` to the coded files on `measure_id`. The seed rows carry two extra keys, `measure_id` and `coded_file`, for coded cases only. These are join keys to files already in the repo, not new facts.
3. **South Dakota's denominator is "Not coded yet".** The file has no `counts_in_denominator`. The site does not assume `true`. Its cells are drawn full height and the marks legend says the component flag is not coded yet.
4. **Percentages are withheld.** Counts are shown as "n of N". This goes slightly beyond the brief and is deliberate while the coding is unaudited.
5. **The home page is the small-multiples view** (brief item 8). There is no separate landing page.
6. **Items 9 to 13 live on one Patterns page**, one figure each, each split into a Route A block and a Route B block.
7. **Mechanical word comparison** is on by default in the panel, labeled, and can be switched off. It highlights words outside the longest common subsequence and never alters text. Texts over about 12 million comparison cells are not compared.
8. **Facts-only mode** hides: the Direction and Mechanism lenses, those two rows and the rationale in the panel, the hidden-change diamond and note, the mechanism matrix, the gap-flag count, and the Layer 3 and 4 value lists on the Method page. It keeps dependency links, and each dependency chip shows that provision's own Layer 1 value. CSV and JSON exports drop the Layer 3 and 4 columns in this mode.
9. **Legend on the home page shows no counts**, because a count there would sum across cases.
10. **The mechanism matrix has no totals**, across cases or routes.
11. **Section grouping** on the strip is derived in `data.js` from the citation (text before the first parenthesis; South Dakota citations are grouped by chapter). It is a display aid, not coded data.
12. **Qualitative palette has 18 colors** for Layers 2 and 4. With 17 Layer 2 values across two cases some are close; the legend, the readout line and the table carry the names. Paring Layer 2 down is a schema matter (friction entry 12).
13. **Narrow screens:** the strip wraps by section and long sections wrap again; the two texts stack. The sticky two-tab switch described in section 9 was not built.
14. **The strip is a group of links with a roving tab stop**, not a listbox. Each cell is a real link to its permalink, so it can be opened in a new tab.
15. **Empty witness text** reads "No text stored for this witness", not "Not coded yet", because for a deleted provision the absence is the coded outcome.
16. **Not built:** pinning (Constitute), a search box, print styles beyond the basics, the form-style coding screen from `docs/planning.md`.

## 13. Second pass (branch `site-prototype-v2`, 2026-11-15)

Six changes asked for by the author. Where this section and the sections above disagree, this section is what is built. The banner, every data label and the "Not coded yet" rules are unchanged.

1. **Landing page: strips above the fold.** The headline is now one line ("What survives when a legislature alters an initiative?") and the lead is one sentence that still carries the "Provisional" mark and the link to the trust section. The route explainer (one sentence per route, with its own counts) moved under the figure; the per-route head inside the figure still gives the counts. At 1440 by 900 both coded strips are visible without scrolling. On a phone the masthead and controls still come first.
2. **Readout on the landing page sits above the strips**, not under the candidate list, so it stays near the cells it describes.
3. **Landing sort is newest first by default**, so Missouri Proposition A (2024) leads. It is a rule, not a hard-coded case. Options are Newest first, Oldest first, Topic. The old "Route" option was removed because cases already sort inside their route. `sort=year` in an old link resolves to oldest first.
4. **Candidates are a compact list.** Each route shows one "Not coded yet" line saying what is needed, then the candidates as a plain list (title, state, year) with a link to the corpus. When a route has no coded case, the "No Route B case is coded" statement and the candidate count are one line with one "Not coded yet" label. The label still appears wherever data is missing; it is no longer repeated per candidate.
5. **Light is the default theme.** The switch has two states, light and dark; the choice is kept in `localStorage`. `prefers-color-scheme` is no longer read (this replaces the line in section 8). A one-line inline script in each page applies a stored dark choice before first paint.
6. **Section labels are never clipped.** Labels that do not fit beside their neighbours stack in up to five rows, each joined to the start of its section by a tick; a label that would pass the right edge is shifted left to end at it. Placement is a small bounded search (`layoutLabels` in `js/strip.js`) that prefers, in order: no label left out, the fewest ticks passing behind another label, the fewest rows. A label that cannot be placed is left out whole, never cut. Both coded cases show every label at 1440px and 390px.
7. **Pinned strip.** On the case page, while a panel is open and the full strip has scrolled out of view, a thin one-row copy of the strip is fixed under the banner with the provision ID, citation, position, and previous and next buttons. Its cells select provisions. It never wraps; on a phone it shows the short ID only. It closes with the panel.
8. **The banner now really stays at the top.** It was `position: sticky` inside a short wrapper, so it scrolled away with the masthead, against section 2. The wrapper is now `display: contents`.
9. **Panel text reads as paragraphs, for display only.** This replaces the `white-space: pre-wrap` line in section 3. Every stored character is still written to the DOM unchanged and in order: the text between blank lines is wrapped in a block, and CSS (`white-space: normal`) draws a line break inside a paragraph, or any run of whitespace, as one space. No word or character is changed, added or removed; only how whitespace is drawn differs. The panel checks that `textContent` equals the stored text and falls back to the stored layout if it ever does not. Checked for all 172 records with highlighting on and off: 796 renders, 0 mismatches. Only the South Dakota comparison texts are affected (330 line breaks inside paragraphs); Missouri texts have none. A checkbox, "Show line breaks as stored" (`br=1`), appears on panels where this applies and restores the stored layout. Copying from the page copies the paragraph layout.

## 12. What a later model should do next

1. When the schema moves to four tables, rewrite `loadCorpus()` and `normalizeProvision()` in `js/data.js` only. Add `enacted_by` to the initiative table and delete the seed join.
2. When evidence spans are filled, render them in `panel.js` (`evidence` block) by wrapping the stored characters at the offsets, the same way `diff` spans are wrapped. Verify each span against the source before showing it.
3. When a second bill is coded for a case, add a bill switch to the case header and a real third row to the erosion timeline.
4. When a Route B case is coded, add its row to the seed with `coded_file`. Every Route B block fills in by itself. Check the panel's left heading, which reads "Text as adopted" for Route B.
5. When gold exists, add a per-record "hand-verified" state to the status label and to About. Do not add a trust badge to the strip (the brief rules it out).
6. Consider replacing the 17-value Layer 2 palette with grouped families once the codebook settles.
