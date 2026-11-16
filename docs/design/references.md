# Design references

Researched November 15, 2026 from each site's own descriptive pages. The descriptions below come from page text, not from looking at the interfaces. **Open each one yourself before relying on it.** None of these is to be copied. The point is to borrow ideas.

## 1. Constitute (constituteproject.org)
Built by the Comparative Constitutions Project. Passages of the world's constitutions are tagged with 300+ topics. Users search by topic, filter by region and period, and read in a List view or a **Compare view that puts two constitutions side by side**. Excerpts can be pinned and exported to Google Docs, PDF or CSV. Every search, comparison and provision has a deep link.
- Closest match to what we are building: tagged legal text, side by side.
- Borrow: topic tags as a way in, deep links to a single provision, pinning and export.
- Avoid: a search-first design. Ours should let the eye find hot spots before any search.

## 2. V-Dem Graphing Tools (v-dem.net/graphingtools.html)
Expert-coded democracy indicators, shown through many views: map, line graph, radar, scatter, **heat map**, regional and thematic comparison between two years.
- Borrow: the idea of several views over one dataset, and a before-and-after comparison between two points in time. This maps onto comparing a law before and after an amending bill.
- Avoid: a menu of a dozen chart types. We need one primary view done very well.

## 3. Voteview (voteview.com)
UCLA's tool for every congressional roll call vote in history, shown on a US map and on an ideological map of legislators. Search and download tools are included.
- Borrow: one spatial picture that makes a whole dataset legible at a glance, with every point clickable down to the underlying record.
- Avoid: abstract scaling that readers must trust. Our encodings should be readable without a methods paper.

## 4. Comparative Agendas Project (comparativeagendas.net)
Policy activity coded into 20 major topics and 200+ subtopics, with a Trends Tool for graphing coded series over time for one country or several.
- Borrow: a coded dataset that non-specialists can explore, and an honest codebook linked from the tool.
- Avoid: a codebook that readers must leave the tool to understand.

## 5. Juxta Commons (digital humanities text collation)
A tool for comparing versions of a text. It offers three views: a **heat map** that overlays the texts and colors differences, a **side-by-side view with lines connecting points of difference**, and a **histogram** showing which portions changed most.
- Borrow: the heat map as the first view, with the histogram idea as an at-a-glance summary of where change concentrated. This is closest to the Frankenstein Variorum approach.
- Caution: the page describes a 2013 poster abstract. Check juxtasoftware.org for whether the tool is still available.

## Bonus: Legislative Influence Detector (DSSG fellowship)
Finds text reused between state bills and model legislation. Results appear side by side with matching passages highlighted.
- Borrow: highlighted overlap between two legal texts.
- Caution: the page is a project writeup from about 2015 to 2018, and I could not confirm the live tool still works.

## What these suggest for our site
- Lead with an at-a-glance picture (heat map or strip), with detail one click away.
- Make the side-by-side comparison of two legal texts the core reading view.
- Give every provision a stable link.
- Keep the codebook one click from every coded value.
- Show how change concentrates, not only whether it occurred.

## Notes added during the build
Recorded 2026-11-15 by Claude (Fable 5.2) during the prototype session.

### What was actually looked at

**Screenshots read from `docs/design/refs/`** (all nine):

| File | Shows |
|---|---|
| `Screenshot 2026-11-15 at 8.59.00 PM.png` | Frankenstein Variorum home page with the "Heatmap navigation" |
| `... 8.59.45 PM.png` | Variorum reading view, 1831 chapter 1, with the Variations column |
| `... 9.00.01 PM.png` | Variorum Viewer controls (version, section, options, legend, "Amount of Variance" ramp) |
| `... 9.00.20 PM.png` | Variorum Method page ("How did we make this edition?") |
| `... 9.00.28 PM.png` | Variorum "Hot Spots" explainer image |
| `... 9.01.11 PM.png` | Constitute, Compare view with two constitutions side by side |
| `... 9.01.37 PM.png` | V-Dem Graphing Tools index |
| `... 9.03.15 PM.png` | Comparative Agendas Project Trends Tool |
| `... 9.04.02 PM.png` | Juxta Commons walkthrough video frame (heat map view) |

**Opened live in a headless browser (gstack browse) this session:** frankensteinvariorum.org viewer (1831, chapter 1, reading view with highlighted variants), ourworldindata.org home, ourworldindata.org/democracy, one Our World in Data chart page (democracies and autocracies), acleddata.com home, electionlab.mit.edu home and Data page, voteview.com home and one roll-call page.

**Not seen as an interface:** the Legislative Influence Detector (no screenshot, not opened), V-Dem's individual tools beyond the index page, Juxta beyond one video frame, Constitute beyond the one Compare screenshot. Anything said about those rests on the text descriptions above.

### What was borrowed, per reference

**Frankenstein Variorum (the model).**
- The heat map is navigation, not decoration. Its home page puts one thin column per edition beside the title, with chapter labels on leader lines, and darker marks where the editions disagree. Ours: the provision strip is the first thing on a case page, each cell is a link, and section labels run along it.
- The legend sits on the same rule as the title of the view (edition dots at left, title in the middle, "Amount of Variance" ramp at right). Ours: the lens switch and legend sit on the rule directly above the strip.
- Two-column reading: text on the left in a serif face, variants on the right labeled by witness in small colored sans labels. Ours: the panel puts the voter text and the amending text side by side, each headed by its witness label.
- The typography: large serif display headings, a thin double rule under page titles, serif body, small sans labels. We take the pairing (serif for reading, small sans for apparatus) and the double rule as a quiet "edition" signal.
- A plain "How did we make this edition?" Method page in ordinary prose.
- **Not taken:** the peach color scheme, the logo block, the numbered-circle controls, and intensity as "amount of variance". We have no severity score, so our Layer 1 colors are categorical, not a ramp.

**Constitute.** Two texts under two plain headings with a hairline under each and independent scrolling. Ours: the same calm two-column head in the panel, deep links to a single provision, and export. Not taken: the search-first toolbar.

**Juxta Commons.** In-text highlighting of the exact places two witnesses differ. Ours: the panel can highlight differing words between the two stored texts, computed mechanically in the browser and labeled as such. Also the idea of a per-witness "amount changed" mini bar, which became the small-multiples strip per case.

**V-Dem Graphing Tools.** Several views over one dataset, each introduced by a small card with a one-sentence statement of what it compares. Ours: the Patterns page lists each cross-case view with one sentence on what it shows and what it needs. Not taken: the menu of chart types.

**Voteview.** Every aggregate is clickable down to the record, and the roll-call page pairs the picture with a small bar count beside it. It also uses hatching as a second encoding. Ours: every count in the mechanism matrix opens the provisions behind it; hatching marks inherited text.

**Comparative Agendas Project.** "View chart data" directly under the chart, and "click on data points to see underlying data". Ours: a "data behind this view" download under each view. Avoided: its left rail of checklists.

**Legislative Influence Detector.** Not seen. Only the idea from its description (matched passages highlighted between two legal texts) overlaps with what we took from Juxta.

**Our World in Data (both pages, author's style example).**
- The chart frame: a serif title that states what is counted, a one-line sans subtitle on how it was classified, the chart, then a footer with "Data source", a "Note", and download and share buttons. Ours: every figure uses this frame, and the footer always carries "Model-coded, unaudited".
- Direct labels at the end of the series instead of a detached legend where space allows.
- "Cite this work" beside the title. Ours: "Cite" on every provision.
- A view switch as a small segmented control (Table, Area, Bar). Ours: the lens switch.
- Not taken: the navy and red masthead, the Playfair and Lato pairing as such.

**ACLED (author's style example).** Segmented controls for the measure being shown (Events, Fatalities, Exposure), and a compact summary card with three large figures and small labels, the active one in the accent color. Ours: the summary band's figures, and the lens control. Not taken: the dashboard density and the dark navy header.

**MIT Election Data and Science Lab (author's style example).** Confident typographic contrast: tracked uppercase labels in a mono-flavored face against heavy display type, and generous white space. Ours: tracked small-cap labels for apparatus (route badges, layer names, spine IDs in mono). Not taken: the photography and the condensed display face.

### Summary of the borrowings
1. Strip first, as navigation (Variorum, Juxta).
2. Side-by-side witnesses as the reading view (Variorum, Constitute).
3. A consistent figure frame with title, subtitle, source line, note, and download (Our World in Data, CAP).
4. Segmented lens control and a three-figure summary band (ACLED, Our World in Data).
5. Serif for text, small tracked sans and mono for apparatus (Variorum, MIT Election Lab).
6. Everything aggregate clicks through to records (Voteview).
