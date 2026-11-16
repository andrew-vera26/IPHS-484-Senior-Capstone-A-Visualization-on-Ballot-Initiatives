# Planning

A parking lot for ideas that come up during the work and are not pressing. **Nothing here is a decision.** When an idea is adopted, it moves into the plan (`docs/workflow/plan.md`) with an ADR, and its entry here is marked as moved.

Format: date, idea, why it might matter, when it could fit.

## Ideas

**2026-11-15. Side-by-side text in a dropdown panel.** On the site, each provision opens an expandable panel showing the voter-enacted text and the amending text side by side. Why: it is the core reading experience for a scholar checking a claim. Fits: the website prototype now, and the real site later.

**2026-11-15. Form-style coding screen.** A local page for hand-coding gold: voter text and amending text side by side, a dropdown for each layer built from the closed value lists, saving to `gold/` only on a human's input. Why: more intuitive than spreadsheet tabs and enforces the closed lists. Fits: after the site prototype, before the main gold coding. Note: the rule that agents never write to `gold/` still applies. The tool would only record what the human selects.

**2026-11-15. Ballotpedia links on every corpus row.** Store the link and our own coded fields, never copied Ballotpedia text (their reuse terms apply the GFDL when text is copied). No API key is needed for links. Fits: corpus construction.

**2026-11-15. Other model families as judges.** Gemini and ChatGPT, alongside cross-checks between Claude models. Each judge is validated against the hand-coded gold before it is trusted, and a judge from a different family than the coder is preferred. Fits: after the pipeline exists.

**2026-11-15. Corpus in two forms.** A scrollable page on the site plus a data file on GitHub, with a page per initiative. Fits: corpus construction and the real site.

**2026-11-15. Time-indexed view.** Show how a law erodes across successive amending bills, not only its state after one bill. Follows from indexing outcomes by bill. Fits: the real site.

**2026-11-15. Post-cutoff list display.** A visible list of initiatives altered after the December 31, 2025 cutoff. Fits: corpus and site.

**Earlier. Justification analysis.** How legislators publicly justify overriding a popular vote (floor statements, committee testimony, sponsor memos). Deferred on retrieval cost. Fits: after the core corpus is coded. To be raised again when that stage arrives.

**Earlier. Vehicle choice, large-n.** Code every initiative in the initiative states on one dimension: statutory or constitutional. Several hundred measures. Makes the escalation cycle measurable. Fits: beyond the semester.

**Earlier. Citable archive and license.** A Zenodo DOI through GitHub releases, and a license choice for code and for data. Fits: before the site is called finished.

**Earlier. A paper on the side.** Personal project, not part of the capstone. Revisit much later.

**2026-11-15. Check the Manifesto Project's document viewer.** It codes party manifestos sentence by sentence and could be a useful reference. It could not be fetched during research. Fits: design references.

## Moved to the plan
(none yet)
