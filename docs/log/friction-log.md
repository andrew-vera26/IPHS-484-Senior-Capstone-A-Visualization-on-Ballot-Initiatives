# Friction log

Places where the schema or method failed to fit real text. These are results.

## Missouri Prop A prototype

**1. Inherited text.** The certified measure reprints statutory sections including 2006 language. Counting it inflates survival. Fixed by adding `provenance`.

**2. Hidden dependency.** Provision p003 points at p002 for its escalation formula, so p003 can be textually intact and substantively changed. Fixed by adding `depends_on`.

**3. No Layer 4 value for escalation removal.** HB 567 removed indexing clauses while keeping step increases. The schema could not name it, even though indexing removal is the pattern the central hypothesis predicts. Value added.

**4. Dependency field in the wrong block.** `dependency_affected` was nested inside `exemption_sweep`, mixing a hand-derived finding with a machine sweep result. Separated.

**5. Definition sub-items inflated the denominator.** 38 of 102 records were definitional. Resolved by flagging instead of merging, which kept spine IDs stable.

**6. The provision rule keyed on typography.** Lettered sub-items were treated as components. Section 290.603(4)'s lettered paragraphs are each separately survivable, while section 290.630(2)'s complete one sentence. Replaced with the separate-survivability test. Section 290.606(7) was the first list that split across the test.

**7. Task scope error.** A fix task named 23 sub-items when the file contained 39 two-level records. Tasks are now written as rules, not ID lists.

**8. Layer 4 never discriminated.** It took one value on 99 of 102 records because the bill repealed the sections wholesale. A property of the case. Resolved by case selection.

## Site prototype (2026-11-15)

Mismatches between what the display needs and what the schema and files provide. Found while building `site-prototype/`. None was fixed in the data; the site shows "Not coded yet" in each place. Field details are in `docs/design/data-contract.md`.

**9. Route A/B is not in the data.** The site must show `enacted_by` on every case, and no coded file or schema layer has it. `layer_7.initiative_route` is the path to the ballot (direct or indirect), and `layer_6.adopt_and_amend` is a bill-level flag; neither is the route. The prototype reads it from `site-prototype/data/corpus-seed.json`. Needs a measure-level field.

**10. The two coded files are on different schema versions, and neither says which.** South Dakota has no `counts_in_denominator` or `parent_spine_id`, and keeps `dependency_affected` inside `exemption_sweep` (the position fixed in entry 4). No record carries `schema_version`. Consequence: the denominator rule cannot be applied to South Dakota, so its summary band reads "Not coded yet".

**11. No evidence spans.** `base_witness.span`, `comparison_witness.span` and `layer_3_driving_span` are `[null, null]` on all 172 records. The panel is meant to show quoted evidence and cannot. It shows the full stored texts and a mechanical word comparison instead, labeled as not coded evidence. Rule 2 in `CLAUDE.md` (spans must match the source at their offsets) cannot be checked for these files.

**12. Layer 2 has two value lists.** The South Dakota file uses six provision types that are not in `spec/codebook.md` (`other`, `public financing mechanism`, `disclosure/reporting requirement`, `enforcement/penalty`, `conduct restriction`, `institutional/administrative`); 21 of its 70 records are `other`. Types cannot be compared across the two cases. The legend marks these values "not in codebook".

**13. Layer 3 does not discriminate.** `narrows` on 169 of 172 records, null on 3. The Direction lens is a single color. Same shape as entry 8, now on a second case. Nineteen South Dakota records are coded `narrows` with a rationale that says the effect was not verified.

**14. Bill-level and measure-level values are copied onto every record.** Layers 5 to 8 repeat on all records of a case, while two fields inside them vary per record (`description_effect_gap`, `altered_before_provision_took_effect`). The site has to guess which is which. This is the case for the planned four-table split.

**15. No case-level metadata in the coded files.** Title, state, year, enactment date, the bill's name and signing date are absent. The site takes title, year and instrument from the seed, and derives a short bill name from `witness_id`.

**16. Layer 5 stores a label, not the description.** `stated_rationale` is a short coder label ("compliance burden"), so "how the bill described itself" cannot be shown in the bill's own words. The real titles and summaries are in `sources/04-description-materials.md`, unlinked to records.

**17. One comparison witness per record.** The erosion timeline needs outcomes indexed by bill. Already proposed for v0.3 (known gap 1); the site shows two real rows and an empty third.

**18. Null base text has no stated meaning.** Two South Dakota records (p017, p018) have `base_witness.text: null` because the measure repealed the section. The schema does not distinguish "the measure's act was a repeal" from "text missing". The panel says only that no text is stored.

**19. Citations are not unique and some are approximate.** South Dakota has 39 distinct citations over 70 records, several marked "(approx.)" or "12-28-X". Section grouping on the strip is derived by a heuristic in `data.js`.

**20. Brief named files that do not exist.** `docs/workflow/plan.md` and `spec/v1/01-Project-Context-What-Survives.txt` are not in the repository. `docs/planning.md` refers to the first.
