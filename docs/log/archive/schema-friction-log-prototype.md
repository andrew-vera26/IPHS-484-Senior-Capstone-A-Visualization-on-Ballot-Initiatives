# Schema friction log — What Survives

Tracks changes to the 9-layer coding schema and record template discovered during
prototype-stage hand-coding (not bugs — the prototype's whole purpose is to surface
exactly this kind of friction before the schema is locked for the full corpus).

---

## 2026-10-05 — Two issues found during Missouri Proposition A hand-coding

Source: `schema-fixes-prop-a.md` (Andrew, from reading the certified initiative text while
hand-coding). Both required changes to `prop-a-provisions-scaffold.json` and
`prop-a-structural-outline.md`.

### Issue 1 — Corpus mixes three provenances

`01-initiative-text.md` is the certified measure as printed, which reprints entire
statutory sections verbatim, including language inherited from earlier enactments.
Example: `MO-2024-PropA-p001` (290.502(1), the $6.50/2007 baseline) is 2006 ballot-measure
language carried forward, not text Proposition A wrote. Counting unchanged inherited text
as "survived" inflates the survival-rate metric — it isn't evidence that voters' 2024
choices were preserved, since Prop A didn't choose that text in the first place.

**Fix applied:** Added `provenance` (`created` | `amended` | `inherited` | `uncertain`) and
`provenance_basis` (free text) fields to every record, immediately after `measure_id`.
Survival-rate denominators will include only `created` and `amended` records; `inherited`
stays visible in the case view flagged as context; `uncertain` is reported as a coverage
gap rather than silently dropped or silently counted. Documented in
`prop-a-structural-outline.md`.

**Status:** Schema change applied (scaffold + outline). Assigning the actual `provenance`
value per chunk is hand-coding work — Andrew's, not the pipeline's or mine — and proceeds
separately, chunk by chunk, per the prototype spec's division of labor.

### Issue 2 — Provisions depend on other provisions

`MO-2024-PropA-p003` (290.502(3), the Prop A wage schedule) does not contain its own
escalation formula — it incorporates it by reference ("per the method set forth in
subsection 2," i.e. `p002`). A provision's own text can be unchanged while its operative
effect changes completely because something it depends on was altered. Comparing `p003` to
its counterpart in isolation, ignoring `p002`'s alteration, would misscore it as intact.
This is the exemption-sweep pass/fail criterion from the prototype spec, in its first live
instance.

**Fix applied:** Added `depends_on` (list of spine IDs, hand-assigned by reading the base
witness alone, before opening the comparison witness) and `depended_on_by` (inverted
mechanically once hand-coding is complete) after `comparison_witness`. Added
`dependency_affected` (bool) and `dependency_source_ids` (list) inside `exemption_sweep` —
the sweep now checks two things, not one: limiting language added elsewhere in the amended
statute, AND alteration of any provision in `depends_on`.

**Status:** Schema change applied. `p003` is the named benchmark case for prototype
acceptance criterion 5 (the exemption sweep) — its Layer 1/Layer 3 reasoning, and its
`depends_on: [MO-2024-PropA-p002]` relationship to the now-narrowed CPI clause, is the test
case for whether the sweep logic actually works once the pipeline runs.

### Coding-order instruction (from Andrew, logged for continuity)

Fields are coded one at a time across all 102 chunks, not one record at a time — per-record
coding lets judgment criteria drift unnoticed across a long chunk sequence; coding one field
at a time keeps the criterion fixed while it's being applied. `provenance` and `depends_on`
are coded first, reading the base witness only (HB 567 not yet open), before any comparison
layers are touched.

## 2026-10-05 — Provenance re-derived from an actual prior-statute diff; one guess corrected

Earlier `provenance` values for `p001`–`p004` (in the worked example only) were assigned by
reasoning from the legislative-history note and a guess at what subsection 4 probably said
before 2024 — `p004` was marked `amended` at "medium confidence," flagged as "not
independently verified." Andrew asked for a real diff: `00-prior-statute-2023.md`
(RSMo 290.500–290.530 as in force December 2023, pulled from revisor.mo.gov's historical
`bid` versions) was added as the base witness, and `01-initiative-text.md` was re-derived to
preserve the certified PDF's own bracket markup (`[deleted]` / plain-unbracketed-retained-or-
added) for the one section Prop A amended, 290.502.

Checked first whether the certified PDF uses underline/strikethrough as hypothesized: it does
not (confirmed via font-level inspection, not just visual read — every character in the
amended subsection renders in one plain, non-bold font). It uses Missouri's standard
bracket-for-deletion bill-drafting convention instead, with no distinct marking for additions.

The diff against subsection 4 showed it is byte-identical to the pre-2024 text — zero bracket
markers. **`p004`'s provenance is `inherited`, not `amended`.** The earlier guess was wrong.
`p001`, `p002` (also zero brackets) confirmed `inherited`; `p003` (five bracket deletions)
confirmed `amended`. `provenance` for all 102 chunks is now set in both
`prop-a-provisions-scaffold.json` and `prop-a-provisions-EXAMPLE-coded.json`, using the diff
method for p001–p004 and "enacting new section, no prior counterpart exists" for p005–p102.
`prop-a-structural-outline.md` now carries inline `[CREATED]`/`[AMENDED]`/`[INHERITED]` and
`[DEPENDED-ON-BY: ...]` tags per chunk as a reading aid, sourced from the EXAMPLE file (the
only one with `depends_on` populated so far).

**Lesson:** a provenance guess reasoned from surrounding context, without checking the actual
prior text, got the benchmark-adjacent record wrong. Diff against a real base witness before
assigning `provenance`, even when the guess seems well-supported.

## 2026-10-05 — Layer 6/7/8 bill-level/measure-level gaps filled (EXAMPLE only)

Filled the remaining null sub-fields in `layer_6_temporal_procedural`, `layer_7_measure_context`,
and `layer_8_subsequent_fate` across all 102 records of `prop-a-provisions-EXAMPLE-coded.json`
(scaffold untouched — these fields are hand-coding work for Andrew there, per the established
division of labor). Because these fields are `"scope": "bill-level"` / `"measure-level"`, this
was ~11 real-world research lookups applied uniformly, not 102 judgment calls.

Sources (WebSearch, 2026-10-05): HB 567 introduced Dec 16, 2024; House passed 84-62 (Mar 13,
2025); Senate passed 22-11 (May 14, 2025); House Committee on Commerce recommended Do Pass
Feb 27, 2025 (also Committee on Legislative Review, 7-3, Mar 5, 2025) — replaces the prior
`"NOT_RETRIEVABLE"` sentinel for `committee_of_origin`. Governor signed July 10, 2025; effective
Aug 28, 2025 (confirms existing `emergency_clause: false`). Support campaign "Missourians for
Healthy Families & Fair Wages" raised ~$6M (incl. $500K Sixteen Thirty Fund, $250K Open Society
Policy Center); opposition total not found in available sources, left unquantified rather than
guessed. Missouri Supreme Court, 5-2, April 29, 2025: upheld Prop A against a post-election
challenge (business groups incl. Missouri Chamber of Commerce, NFIB) to the ballot summary/fiscal
note; declined jurisdiction over the single-subject claim post-election. A 2026 constitutional
amendment campaign ("Missouri Minimum Wage Amendment" / Initiative Petition 2026-047) is
circulating, signature deadline May 3, 2026, targeting the Nov 3, 2026 ballot.

`days_enactment_to_introduction` = 41, computed as Nov 5, 2024 (election/certification date —
confirmed as this schema's "enactment" anchor by reverse-engineering the pre-existing
`days_enactment_to_alteration_effective: 296` value) to Dec 16, 2024 (HB 567 introduction).

**Two sub-fields deliberately left null, not guessed:**
- `supermajority_met` — `supermajority_required` is `false` for this measure type (ordinary
  statute, simple-majority override), so "was a supermajority met" has no defined meaning here;
  encoding `true` or `false` would imply a threshold that doesn't apply. Left `null` as
  not-applicable rather than computing the numeric coincidence that the Senate margin (22-11)
  happens to equal 2/3 while the House margin (84-62) does not.
- `provision_reenacted_substantially_same` — the 2026 constitutional-amendment campaign has not
  yet reached a ballot or taken effect as of this research pass; nothing exists yet to compare
  against for "substantially the same" text. Genuinely unresolved, not unresearched.

Both are honest gaps per the project's established convention, not defects.

## 2026-10-05 — South Dakota Initiated Measure 22 (2016) case built: scope, markup, and gaps

Second case study built at `data/south-dakota-im22/`, mirroring the Prop A pipeline (`sources/00-04`,
`coding/im22-structural-outline.md`, `im22-provisions-scaffold.json`, `im22-provisions-EXAMPLE-coded.json`).
Andrew confirmed the coding-format split (scaffold + EXAMPLE, same as Prop A) and the scope decision below
before work started.

### Scope decision: all three categories HB 1069 touches

Before coding, a lookup was run (at Andrew's request) to check whether HB 1069 (2017), the bill that repealed
IM 22, treated all of IM 22's text uniformly. It does not. HB 1069 touches three distinct categories:
1. The wholly new SDCL ch. 12-28 (independent ethics commission, democracy-credit public financing,
   disclosure regime) — **repealed outright**.
2. New sections IM 22 added into the existing ch. 12-27 — **also repealed outright**.
3. ~23 pre-existing SDCL sections IM 22 had amended (ch. 12-27 contribution/disclosure sections, ch. 2-12
   lobbying/revolving-door sections) — HB 1069 **amends these again rather than repealing them**.

Category 3 is the only part of this case with partial-survival nuance comparable to Prop A; categories 1-2
are a clean "total repeal" story. Andrew chose to include all three categories rather than narrow scope,
specifically because of that asymmetry.

### Markup convention: confirmed by the source document itself, then cross-validated

Unlike Missouri (where the convention had to be discovered via font-level PDF inspection), the IM 22
transcription used as the base source states its own convention in its header: overstrike = deleted from
existing law, underline = added to existing law. Confirmed structurally this pass by cross-checking two
independent documents: resolving the certified-text file's own §4 (12-27-1) to its post-IM22 state and the
HB-1069-enacted file's §3 to its pre-HB1069 state — which describe the same statute text at the handoff
moment — produced near-identical text (12,141 vs. 12,146 characters, differing only in whitespace/bill-
preamble noise). The two independently-sourced documents agree.

### Deliberate deviations from the Prop A pipeline (flagged honestly, not silently)

- **Official SOS certified-text PDF not retrieved.** `https://sdsos.gov/elections-voting/assets/InitiatedMeasure22.pdf`
  returned HTTP 404; no working URL pattern was found within this research budget. Used the Dakota Free Press
  transcription (sourced from the measure's own sponsoring campaign committee) instead. Documented in
  `01-initiative-text.md`'s header.
- **Pre-2016 baseline (`00-prior-statute-2016.md`) is reconstructed, not independently fetched.** South
  Dakota's historical-statute tool is a JS-rendered SPA inaccessible to this pipeline's fetch tools (unlike
  Missouri's revisor.mo.gov, which exposes per-section historical versions directly). The baseline is instead
  reconstructed by resolving the certified text's own strike/underline markup to its PRE state. Weaker
  evidence than Missouri's independently-sourced base witness; flagged in the file header.
- **Chunking stopped at IM 22's own "Section N" unit (70 chunks), not sub-section/lettered granularity.**
  IM 22's text is much longer than Prop A's; splitting to the same granularity Prop A used would have produced
  several hundred chunks. Flagged in the structural outline's header as a scope/effort tradeoff, not hidden.
- **Ch. 12-28 per-subsection SDCL citations are approximate ("12-28-X (approx.)").** HB 1069's repeal list
  confirms the aggregate range (§12-28-1, §§12-28-2 to 12-28-37) but this pass did not individually re-derive
  which IM-22 "Section N" became which exact 12-28-N from the official Session Laws codification table.
  Confirmed precisely: IM22 §1 (short title) = 12-28-1 (direct match in HB1069's repeal list and in a Justia
  search-result snippet).
- **`layer_2_provision_type` values are descriptive labels** ("disclosure/reporting requirement",
  "enforcement/penalty", "institutional/administrative", "public financing mechanism", "conduct restriction"),
  not drawn from a confirmed master enum — this pass only had Prop A's four observed values
  ("rate, amount, or threshold", "escalation, indexing, or adjustment", "definitions", plus implied others) to
  go on, and none fit most of IM 22's content. Flagged for Andrew to reconcile against the real schema enum
  if one exists beyond what's been observed in the Prop A files.

### Genuine edge case found: two "revived citation" records (p017, p018)

IM 22 itself repealed two pre-existing sections outright (12-27-17, 12-27-17.1) rather than amending them —
a repeal nested inside the initiative, not something HB 1069 did. HB 1069 then enacted **new** text under
those same two citations (confirmed via HB 1069 §17's own text, which cross-references "§ 12-27-17" as an
existing citation) — not a restoration of the pre-2016 original. This doesn't cleanly fit the
created/amended/inherited provenance enum or the structural-operation enum (unchanged/rewritten/partially
deleted/deleted entirely). Classified provenance "amended" and structural operation "rewritten" as closest
fits, with the full reasoning left in each record's `layer_3_rationale` rather than smoothed over. Same spirit
as Prop A's p003 bundling note — a real schema boundary case worth the user's attention, not a coding error.

### Diff-based partial-survival finding (the point of including category 3)

Of the 23 category-3 "amended again" sections, diffing HB 1069's resulting text against the reconstructed
pre-2016 baseline shows only **6 sections reverted byte-for-byte** to the pre-IM22 original
(12-27-11, 12-27-12, 12-27-13, 12-27-21, 12-27-37, 2-12-8.2). The other **17 show a text-length delta against
the pre-2016 baseline**, meaning either some IM-22-originated language survived HB 1069's rewrite, or HB 1069
drafted genuinely new (non-restorative) 2017 language, or both. This pass did **not** hand-verify which of
those two explanations applies clause-by-clause for each of the 17 — that is real hand-coding work, flagged
in each affected record (`confidence: "low"`, `flagged_for_review: true`) rather than guessed at. 19 of 70
EXAMPLE records carry this flag (the 17 partial-reversion sections plus the 2 revived-citation sections).

### Layer 6-8 bill/measure-level fields: filled via real sourcing, same as Prop A

IM 22 enacted/certified Nov. 16, 2016 (enactment anchor, same convention as Prop A). HB 1069 introduced Jan.
20, 2017 (65 days later); House 54-13 (Jan 24), Senate 27-8 (Feb 1); signed Feb 2, 2017 (78 days after
enactment); **emergency clause: true** — this is the case's defining fact, specifically invoked to foreclose
a people's-veto referendum, confirmed set `referendum_filed_against_alteration: false` for that reason rather
than "none found." Litigation: enjoined but never finally decided on the merits (mooted by the repeal) —
`struck_down: false`, full reasoning in `litigation_outcome`. Subsequent similar measure: 2018 Amendment W,
confirmed **defeated** 45.06%-54.94% — unlike Prop A's still-pending 2026 campaign, this subsequent measure's
outcome is already known, so `provision_reenacted_substantially_same: false` (not left null) for all records.
Campaign funding: Represent.Us contributed ~$1M (57% of support-side total, implying ~$1.75M raised);
opposition total not found, left unquantified. `committee_of_origin` filled (House State Affairs, Senate State
Affairs) rather than left as the `"NOT_RETRIEVABLE"` sentinel Prop A needed.

**Final provenance counts (both files, identical):** created 45, amended 25 (23 ordinary amendments + 2
revived-citation edge cases), inherited 0 — no `inherited` records in this case, because every one of the 70
chunks either adds new law or demonstrably changes pre-existing text (confirmed per-section via strike/
underline presence, not assumed from the "be amended" label alone — the same check that caught Prop A's p004
error was re-run here and found all 23 "amended" sections genuinely contain diff markers).

## 2026-10-05 — Three issues found reviewing `prop-a-provisions-EXAMPLE-coded.json` by hand

Source: numbered task list from Andrew, after reading the EXAMPLE file himself. All three required
changes to `prop-a-provisions-EXAMPLE-coded.json`; the first also required a new `codebook.md`
(none existed before this).

### Issue 1 — Layer 4 lacked a mechanism for escalation removal

`MO-2024-PropA-p003` was coded `layer_1_structural_operation: "partially deleted"` but
`layer_4_mechanism: "outright repeal"` — contradictory, since HB 567 deleted the two post-2026 CPI
indexing clauses from this provision while retaining its $13.75 → $15.00 step increases verbatim.
Notable beyond this one record: indexing/escalation removal while retaining the underlying
substantive rate is exactly the pattern the project's central hypothesis predicts (text survives,
operative effect doesn't) — and the schema as designed had no name for it. Added `escalation
removal` to the Layer 4 enum (`codebook.md`); re-coded p003 to it; added a validation rule
(`layer_4_mechanism == "outright repeal"` implies `layer_1_structural_operation == "deleted
entirely"`, else flag inconsistent) and re-ran it against all 102 records: 0 inconsistencies after
the fix.

### Issue 2 — `dependency_affected` was nested inside `exemption_sweep`

All 102 records have `exemption_sweep.ran: false`, yet p003 reported a dependency finding
(`dependency_affected: true`, source `p002`) inside that same object — conflating a hand-derived
finding from the `depends_on` graph with a machine exemption-sweep result, which are different
operations with different inputs. Moved `dependency_affected` / `dependency_source_ids` to two new
top-level fields (positioned after `depended_on_by`) on all 102 records; `exemption_sweep` now
holds only sweep-proper fields (`ran`, `limiting_language_found`, `limiting_source_citation`,
`limiting_span`, `reclassified_from`). p003's existing values were preserved at the new location.

### Issue 3 — The mechanical split inflated the survival denominator with definition sub-items

38 of 102 records are definitional (290.600's defined-term list); 23 of those are lettered
sub-items of three parent terms (`290.600(5)`, 12 sub-items; `290.600(7)`, 5; `290.600(11)`, 6) —
e.g. `290.600(5)(A)`. Counting each sub-item as a separately survivable provision inflates the
denominator: a defined term with 6 lettered clauses weighs 6x a one-sentence provision in the
survival-rate metric, for no principled reason. Resolved by flagging rather than merging, which
preserves spine IDs and traceability: added `parent_spine_id` (null by default) and
`counts_in_denominator` (true by default) to every record; set `counts_in_denominator: false` and
`parent_spine_id` to the parent's spine ID for the 23 sub-items; rolled the `depends_on` of the 5
sub-items that had any (`p029`, `p036`, `p037`, `p038`, `p039`) up into their parents (`p024`,
`p033`), deduplicated, then re-derived `depended_on_by` for all 102 by inversion — 0 mismatches
after re-derivation. The survival-rate denominator rule is now: a record counts only if
`counts_in_denominator == true` AND `provenance IN ("created", "amended")`. This produced the
project's working answer to the prototype specification's open question "what is a provision"
(documented in `prop-a-structural-outline.md`): a defined term is one provision; its lettered
sub-items are components, not separately survivable units.

**Verification note:** before applying Issue 3's fix, re-checked (did not just trust) the claim
that no record outside the 23 depends on a sub-item and no sub-item has any `depended_on_by` —
confirmed true across all 102 records. Also audited every one of the 102 `layer_1_structural_
operation` values against `base_witness` vs. `comparison_witness` (HB 567) rather than against
`00-prior-statute-2023.md`, since `MO-2024-PropA-p002` (inherited, byte-identical to the pre-2024
statute) is coded `rewritten`, which is coherent only if Layer 1 reflects HB 567's treatment, not
the earlier diff. Result: 0 mismatches — HB 567 repealed all of 290.502 and re-enacted one new
section, so p001 (byte-identical in both witnesses) is correctly `unchanged` while p002 and p004
(text changed by HB 567 despite being `inherited` provenance) are correctly `rewritten`. No
re-coding required.

**Not in scope (flagged, not fixed):** Layer 4 took `outright repeal` on 99 of 102 records because
HB 567 repealed the paid-sick-time sections wholesale — the layer never had to discriminate, and
17 of its 18 values (now that `escalation removal` exists) remain untested on real data. This is a
property of the case, not a defect in the coding; resolved by second-case selection, not by
editing this file further.

## 2026-10-05 — Correction: the provision rule from the previous entry was itself wrong

Source: Andrew, after re-reading the file and finding a conflict between that entry's Task 6
(flag only the 23 §290.600 definition sub-items) and Task 9 (state a general rule: any
enumerated list elaborating one defined term or obligation is one provision). The file applied a
narrow fix but documented a broad rule — 39 records in the file have two-level citations, and
only 23 were flagged, so the stated rule and the actual data disagreed.

The initial provision rule keyed on typography — lettered sub-items were treated as components.
Applying it to the full set of enumerated lists showed this was wrong: §290.603(4)'s lettered
paragraphs each state an independent accrual rule and are separately survivable (accrual
commencement, overtime-exempt treatment, carryover, inter-division transfer, successor-employer
continuity, and employer-advanced loans are six unrelated rules, each a complete sentence/
paragraph on its own topic), while §290.630(2)'s lettered clauses complete a single sentence (one
recordkeeping mandate: maintain separately, treat as confidential, and do not disclose) and
cannot stand alone as independent rules. The rule was replaced with a separate-survivability
test — deletable alone without leaving the provision incoherent — applied by reading the text
rather than counting parenthesis levels (full rule text in `prop-a-structural-outline.md`,
Task 12).

Re-applied to all 16 previously-unflagged two-level records (the 23 §290.600 definition
sub-items were unaffected and remain flagged):
- `290.630(2)(A)–(C)` (p092–p094): components. Fragments of one sentence/obligation.
- `290.606(1)(A)–(D)` (p057–p060): components. Each item is a fragment of the single sentence
  "earned paid sick time shall be provided... for: (A)...(D)", enumerating the scope of one
  entitlement rather than stating independent rules.
- `290.603(4)(A)–(F)` (p047–p052): remain separate provisions, no change. Each is a complete,
  independent accrual rule on a distinct topic.
- `290.606(7)(A)–(C)` (p067–p069): **split** — the first case where one enumerated list divides
  across the test. (A) and (B) are both answers to the same question ("what counts as reasonable
  documentation," for the general case and the domestic-violence case respectively) and were
  treated as components of that single documentation-sufficiency provision (p066). (C) is a
  freestanding prohibition on the employer ("may not require that the documentation explain the
  nature of the illness...") — a different kind of rule, not a species of "what counts as
  reasonable" — and was left a separate provision, `counts_in_denominator: true`.

Dependencies for the 4 newly-flagged components with non-empty `depends_on` (p057–p060 had none;
p068 did) were rolled up into their parents (p056 gained 3 deps from p060; p066 gained 4 deps
from p068, one of which — p056 itself — is a dependency on the now-component-bearing parent
record, left as-is since p066 and p056 are siblings in the same subsection, not a p066-on-itself
cycle). `depended_on_by` was then re-derived for all 102 records by inverting `depends_on`: 0
mismatches. Also re-verified, across every record now carrying a `parent_spine_id` (not just the
4 newly rolled up), that each component's `depends_on` values are present in its parent's
`depends_on` — confirmed for all, including the original 23 from the prior entry (the original
Task 7 roll-up check could not have been meaningful for records where `parent_spine_id` was still
`null` at the time it ran; re-running it now against the final state closes that gap).

**Final counts after correction:** `counts_in_denominator: true` — 70 records; `false` — 32
records (the original 23 §290.600 definition sub-items plus 9 more: 3 from 290.630(2), 4 from
290.606(1), 2 from 290.606(7)). Final survival-rate denominator (`counts_in_denominator: true`
AND `provenance IN ("created","amended")`) = 67 records. By `layer_2_provision_type`: core
obligation or entitlement 25, definitions 15, administrative procedure 8, conflict or preemption
clause 8, enforcement authority 4, rulemaking authority and agency discretion 2, penalty or
remedy 2, private right of action 2, escalation/indexing/adjustment 1.

**Lesson:** a rule stated in general terms (Task 9) was applied narrowly (Task 6), and the gap
between the two went unnoticed until the file was re-read end to end. When a documented rule and
the data it's supposed to govern disagree, re-run the rule against the full dataset rather than
trusting that the first application was exhaustive.
