# Brief: "What Survives" website prototype (one session, tonight)

You are building a local-only prototype of the project's website. The point of this session is to get the **design and aesthetics** right while a stronger model is available. Another model will continue the work afterwards, so everything you decide must be written down. The author presents this to a professor tomorrow, so it must work and look finished, and it must be honest about what the data is.

## Context
The project measures what survives when a legislature alters an initiated statute, provision by provision. The final output is this website, modeled on the Frankenstein Variorum (frankensteinvariorum.org): a browsable, scholarly tool where the eye finds the hot spots, usable by scholars for real analysis. Think of it as a critical edition of a law, showing the version voters enacted against the version the legislature left.

**Route A and Route B are a core part of the project.** Every initiative has an `enacted_by` value:
- **Route A, enacted by voters:** voters passed it, then the legislature altered it. The claim "what voters voted for" applies.
- **Route B, enacted by the legislature:** the legislature adopted the initiative itself to keep it off the ballot (Michigan 2018 is the example), then altered it. Voters never voted, so the claim does not apply, and **the two routes are never pooled in a statistic**.

The route must be visible and meaningful everywhere: a badge on every case, a filter on every list, separate counts, and a plain-language explanation on the About and Method pages.

## Hard constraints
1. **Local only.** Never deploy or publish. Do not touch the docs workflow. Everything goes in `site-prototype/`.
2. **Read-only data.** Do not modify or write anything in `data/`, `gold/` or `spec/`. Read from them in place by serving the repo root. The one new data file you may create is `site-prototype/data/corpus-seed.json` (see the seed table below).
3. **Label everything.** A persistent banner on every page: "Prototype. Model-coded, unaudited." Never call the data findings or results.
4. **Never reword source text.** Quoted spans from voter text and bills are displayed exactly as stored.
5. **Compute, don't hardcode.** Every count is computed from data. Denominator rule: `counts_in_denominator == true` AND `provenance` in (`created`, `amended`).
6. **No fabricated data, ever.** If a view needs data we do not have (for example, a multi-bill timeline, or a Route B case), show an honest empty state. The empty state must say **"Not coded yet"** in those words, followed by a short line on what is needed. Never invent a record to fill a view. Every case, view or section without coded data says "Not coded yet", including every Route B case.
7. **No build step.** Plain HTML, CSS and JavaScript (ES modules). Vendor any library into the repo so it runs offline.
8. **Isolate data loading** in `site-prototype/js/data.js`. The schema is about to change from one flat record per provision to four linked tables (initiative, bill, provision, outcome). Only `data.js` should need to change when it does.
9. Run `git switch -c site-prototype` first. Commit often. Do not push to `main`. Do not push at all unless told.

## Step 0: Read before doing anything
Read `CLAUDE.md`, `GLOSSARY.md`, `docs/method/schema.md`, `docs/workflow/plan.md` (if present), `docs/planning.md` (if present), and `docs/design/references.md`. In `spec/v1/01-Project-Context-What-Survives.txt`, read section 9 (schema) and section 13 (site structure). Then inspect the data:
- `data/missouri-prop-a/coding/prop-a-provisions-EXAMPLE-coded.json`
- `data/south-dakota-im22/coding/im22-provisions-EXAMPLE-coded.json`

Check each file's `coded_by` values and report them. Write the actual field names you find to `docs/design/data-contract.md`. Do not rely on any field name from this brief; the files are the truth.

Create `site-prototype/HANDOFF.md` immediately and update it after every milestone: what is built, what is next, known issues, how to run it. If you are cut off, the next model resumes from it.

## Step 1: Study the references (visually, not just as text)
Study the Frankenstein Variorum first and properly, because it is the model for this site. Then study the other sites in `docs/design/references.md` (Constitute, V-Dem Graphing Tools, Voteview, Comparative Agendas Project, Juxta, and the Legislative Influence Detector). Look at each for inspiration, not only the Variorum. Also study the author's four named style examples (listed in Step 3: Our World in Data, ACLED, MIT Election Lab). You may also look for other sites you think are relevant, within the usage limit.
- Screenshots may be in `docs/design/refs/` (images). Read them. Name which screenshots you used.
- If a browser tool is available in this session (Claude in Chrome or similar), use it to open the Variorum and look at its visualization and reading views.
- If neither is available, say so, and work from the descriptions and any text you can fetch. Do not pretend you saw an interface you did not.
- Add a short note to `references.md` on what you actually borrowed. Do not copy any site's layout or branding.

## Step 2: Brainstorm (bounded, brief)
Before writing the design spec, spend a short, bounded effort on your own concept thinking. Generate three genuinely different directions for the look and interaction of the site, critique each, choose one, and say why. You may propose additions or changes to the concept below and flag problems with it. You may not drop a required feature. Record this in a "Brainstorm" section of `docs/design/DESIGN.md`. Keep it to the point: this is not the main event.

## Step 3: Write `docs/design/DESIGN.md` before any code
Pages and views, interactions, which data field each view reads, the aesthetic direction and why (typography, color, spacing, light and dark), accessibility (contrast, color-blind-safe encodings, keyboard use), responsive behavior, and how Route A and B appear everywhere. Make it complete enough that another model can continue without asking you.

Aesthetic goal: the best, most distinctive result you can make. **The author wants the visualizations to look very modern and very academic**: clean and current, with the seriousness of a research publication. Calm, scholarly, typographic, closer to a critical edition than a dashboard. Avoid a templated look.

The author named these sites as visual examples. Study them (screenshots may be in `docs/design/refs/`, or open them if a browser tool is available) and say in `DESIGN.md` what you take from each. Borrow qualities, never layouts or branding:
- https://ourworldindata.org/democracy
- https://acleddata.com/
- https://electionlab.mit.edu/
- https://ourworldindata.org/

## Step 4: Build
Commit after each item. If time or usage runs short, stop at the highest-priority item completed, and make sure the site at that point works end to end.

**Priority 1: the core**
1. **Case page.** Header with title, route badge, status, and a link out when one exists. One strip of cells per case, one cell per provision in reading order. A lens switch colors the strip by Layer 1 (what happened, default), Layer 3 (direction), Layer 2 (type), or Layer 4 (mechanism). Components (`counts_in_denominator == false`) are visibly distinct. Inherited text (`provenance == inherited`) is visibly marked. A summary band shows computed counts and states the denominator rule in one line. Equal-width cells by default.
2. **Side-by-side dropdown panel.** Clicking a cell expands a panel showing the voter-enacted text and the amending text side by side, with the layer values, the rationale and the quoted evidence. This is a firm requirement.
3. **Facts only / with interpretation toggle.** One switch hides Layers 3 and 4 and shows only structural facts (Layers 1 and 2). It lets a reader who disputes our judgments still use the tool.
4. **Dependency overlay.** Show the link from a provision to what it depends on (`depends_on`, `depended_on_by`). Flag "hidden change" where `dependency_affected` is true (Missouri `p003` is the example).

**Priority 2: the corpus and the framing**
5. **Corpus page.** A scrollable table seeded from `corpus-seed.json`, with route filter, status filter, and badges. Candidate rows are clearly marked as not yet coded. Rows link out to Ballotpedia where a link exists.
6. **About page.** The claim in plain language (marked provisional), the two routes explained, and a section on trustworthiness: how coding was done (model-coded versus hand-verified), what the limits are, and why every figure is labeled.
7. **Method page.** The layers in plain language, the closed value lists (with each value one click from where it is used), the provision rule, the denominator rule, and the cutoff (December 31, 2025).

**Priority 3: cross-case and extras (build those the data supports; empty states for the rest)**
8. **Corpus small multiples.** Every coded case as one strip, stacked, sortable by year, route, or topic, so the eye finds patterns across cases.
9. **Description versus effect.** For each bill, show how the bill described itself next to what it did, if the data has it. Otherwise an empty state.
10. **Mechanism matrix.** Mechanisms against cases, clickable down to the provisions.
11. **Speed view.** Days from enactment to alteration per case, with a mark for whether the provision had taken effect, if the data supports it.
12. **Erosion timeline.** Stacked strips for the law at enactment, after bill 1, after bill 2. Needs multi-bill data. Build the empty state and the design, show no fake data.
13. **Visible controls.** A designed slot for unaltered and technical-correction cases, which do not exist in the data yet. Empty state only.
14. **Citation and export.** A permalink for every provision, a "cite this" button, and CSV and JSON download of the current view.
15. **Length-weighted cell width.** An optional, clearly labeled toggle. Equal width stays the default, because width could imply severity and the project deliberately has no severity score.

Do not build a trust-badge display on the visualization. Trustworthiness is explained on the About page. The persistent "model-coded, unaudited" banner stays.

## Step 5: Verify
- Write `site-prototype/check_data.py` that prints the counts the site should show. Confirm the site matches it.
- Expected for Missouri Prop A, **to be verified, not assumed**: 102 records, 70 with `counts_in_denominator == true`, 32 components. `MO-2024-PropA-p003` should show partially deleted, narrows, escalation removal, and `dependency_affected` true.
- If you can run a browser (for example Playwright), screenshot at desktop and narrow widths and review against `DESIGN.md`. Otherwise say you could not.
- Report any mismatch between what the display needs and what the schema provides, and add each as an entry to `docs/log/friction-log.md`.

## Step 6: Finish
Update `HANDOFF.md`. Commit on the `site-prototype` branch. Give the exact command to run it: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000/site-prototype/`.

## Seed for `site-prototype/data/corpus-seed.json`
Create this file with these rows. Status values: `coded_model_unaudited`, `candidate_unverified`. Rows marked "Ballotpedia list" come from Ballotpedia's list of indirect initiated statutes approved by legislatures, and are still to be verified against primary sources. Do not add any row or fact beyond what is here.

| title | state | year | enacted_by | status | altering instrument | link |
|---|---|---|---|---|---|---|
| Missouri Proposition A | Missouri | 2024 | voters (Route A) | coded_model_unaudited | HB 567, signed July 10, 2025 | none yet |
| South Dakota Initiated Measure 22 | South Dakota | 2016 | voters (Route A) | coded_model_unaudited (check `coded_by`) | HB 1069, signed February 2, 2017 | none yet |
| Missouri Proposition B | Missouri | 2010 | voters (Route A) | candidate_unverified | | none yet |
| Utah Proposition 4 | Utah | 2018 | voters (Route A) | candidate_unverified | | none yet |
| Maine income surcharge | Maine | 2016 | voters (Route A) | candidate_unverified | | none yet |
| Maine minimum wage | Maine | 2016 | voters (Route A) | candidate_unverified | | none yet |
| Michigan minimum wage increase | Michigan | 2018 | legislature (Route B) | candidate_unverified | adopted by the legislature Sep 5, 2018; amended by SB 1171, Dec 13, 2018 (Ballotpedia list) | https://ballotpedia.org/Michigan_Minimum_Wage_Increase_Initiative_(2018) |
| Michigan paid sick leave | Michigan | 2018 | legislature (Route B) | candidate_unverified | adopted Sep 5, 2018; amended by SB 1175, Dec 13, 2018 (Ballotpedia list) | https://ballotpedia.org/Michigan_Paid_Sick_Leave_Initiative_(2018) |
| Michigan repeal of prevailing wages on state projects | Michigan | 2018 | legislature (Route B) | candidate_unverified | adopted Jun 6, 2018; repealed by HB 4007, 2023 (Ballotpedia list) | https://ballotpedia.org/Michigan_Repeal_Prevailing_Wages_and_Fringe_Benefits_on_State_Projects_Initiative_(2018) |
| Washington Initiative 2081 (parental rights) | Washington | 2024 | legislature (Route B) | candidate_unverified | approved Mar 4, 2024; amended by HB 1296, signed May 20, 2025 (Ballotpedia list) | none yet |

Route B has **no coded case yet**. Show that honestly: a Route B filter that lists the four candidates, each marked "Not coded yet". On the corpus page, the status shown for every `candidate_unverified` row is "Not coded yet".

## Out of scope
Deployment, a backend, user accounts, editing data, the real corpus, anything that changes the schema.
