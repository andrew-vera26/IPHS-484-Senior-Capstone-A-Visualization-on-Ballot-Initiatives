# Data contract (what the files actually contain)

Written 2026-11-15 by inspecting the two coded files directly. The files are the truth; this page describes them. Only `site-prototype/js/data.js` reads these names.

## Files

| Case | File | Records | `coded_by` |
|---|---|---|---|
| Missouri Prop A (`MO-2024-PropA`) | `data/missouri-prop-a/coding/prop-a-provisions-EXAMPLE-coded.json` | 102 | `model` on all 102 |
| South Dakota IM 22 (`SD-2016-IM22`) | `data/south-dakota-im22/coding/im22-provisions-EXAMPLE-coded.json` | 70 | `model` on all 70 |

Both files are a bare JSON array of flat provision records in reading order. There is no file-level header, no `schema_version` field, and no `enacted_by` field anywhere.

## Record fields (present in both files unless noted)

| Field | Type | Notes |
|---|---|---|
| `spine_id` | string | e.g. `MO-2024-PropA-p003` |
| `measure_id` | string | `MO-2024-PropA`, `SD-2016-IM22` |
| `parent_spine_id` | string or null | **Missouri only.** Absent from every SD record |
| `counts_in_denominator` | bool | **Missouri only** (70 true, 32 false). Absent from every SD record |
| `base_witness.text` | string or null | Voter text. Null on 2 SD records (p017, p018: IM 22 repealed the section, so there is no voter text) |
| `base_witness.citation` | string | Section number. Unique per record in MO; shared by several records in SD (39 distinct over 70) |
| `base_witness.span` | `[null, null]` | Offsets never filled in either file |
| `comparison_witness.witness_id` | string | `MO-2025-HB567`, `SD-2017-HB1069` |
| `comparison_witness.text` | string or null | Null on 98 MO and 45 SD records (the deleted ones) |
| `comparison_witness.citation` | string or null | |
| `comparison_witness.span` | `[null, null]` | Never filled |
| `layer_1_structural_operation` | string | MO: `unchanged` 1, `rewritten` 2, `partially deleted` 1, `deleted entirely` 98. SD: `deleted entirely` 45, `rewritten` 25 |
| `layer_2_provision_type` | string | The two files use **different value lists** (MO 11 values from the codebook; SD 9 values, including `other`, `public financing mechanism`, `disclosure/reporting requirement`, `enforcement/penalty`, `conduct restriction`, `institutional/administrative`, none of which are in `spec/codebook.md`) |
| `layer_3_directional_effect` | string or null | `narrows` or null (MO: 99 narrows, 3 null. SD: 70 narrows) |
| `layer_3_rationale` | string or null | Free text. Often carries review flags |
| `layer_3_driving_span` | `[null, null]` | Never filled. **No quoted evidence span exists in either file** |
| `layer_4_mechanism` | string or null | MO: `outright repeal` 98, `escalation removal` 1, null 3. SD: `outright repeal` 51, null 19 |
| `layer_4_applies` | bool or null | |
| `exemption_sweep.{ran, limiting_language_found, limiting_source_citation, limiting_span, reclassified_from}` | | `ran` is false on every record in both files |
| `provenance` | string | MO: created 98, inherited 3, amended 1. SD: created 45, amended 25 |
| `provenance_basis` | string | Free text |
| `depends_on`, `depended_on_by` | string[] of spine IDs | Populated in MO. Empty on every SD record |
| `dependency_affected` | bool or null | **MO: top level** (true on p003 only, null elsewhere). **SD: nested in `exemption_sweep`** (null everywhere), the pre-v0.2 position |
| `dependency_source_ids` | string[] | Same placement split as above. MO p003 → `[p002]` |
| `layer_5_description.{scope, stated_rationale, rationale_source, description_effect_gap}` | | Bill-level values repeated on every record; `description_effect_gap` is per record (MO: true 100, false 2. SD: false 70) |
| `layer_6_temporal_procedural.*` | | Bill-level, repeated on every record: `days_enactment_to_introduction`, `days_enactment_to_alteration_effective`, `altered_before_provision_took_effect` (per record in MO: true on p002, p003), `sessions_elapsed`, `alteration_sequence_number`, `standalone_or_omnibus`, `session_type`, `passage_margin_upper`, `passage_margin_lower`, `supermajority_required`, `supermajority_met`, `party_control_vs_initiative_direction`, `executive_action`, `emergency_clause`, `adopt_and_amend`, `committee_of_origin` |
| `layer_7_measure_context.*` | | Measure-level, repeated: `initiative_route` (`direct`: the path to the ballot, **not** Route A/B), `vehicle`, `vote_margin`, `campaign_funding_profile`, `topic`, `state_rule_regime`, `prior_similar_measure_year`, `subsequent_similar_measure_year` |
| `layer_8_subsequent_fate.*` | | Measure-level, repeated: `litigated`, `litigation_outcome`, `struck_down`, `re_initiated_by_campaign`, `constitutional_amendment_pursued_after`, `altered_again_later_session`, `referendum_filed_against_alteration`, `provision_reenacted_substantially_same` |
| `layer_9_coding_metadata.*` | | `coded_by` (`model` everywhere), `model_self_consistency` (null), `human_model_agreement` (`not_hand_coded`), `flagged_for_review`, `adjudicated` (false), `confidence` |

## Consequences for the site

1. **Route A/B is not in the coded files.** `enacted_by` comes from `site-prototype/data/corpus-seed.json`, joined on `measure_id`. `layer_6.adopt_and_amend` is false on both coded cases, which is consistent with Route A but is not the same field.
2. **South Dakota has no `counts_in_denominator`.** The denominator rule cannot be applied to it as written. The site shows the SD denominator as "Not coded yet" and reports provenance counts only. It does not assume `true`.
3. **No evidence spans.** Every `span` and `layer_3_driving_span` is `[null, null]`. The panel shows the full stored witness text and "Not coded yet" for the quoted evidence span.
4. **Layer 2 lists differ by case**, so the Layer 2 lens builds its legend from the values present in the case.
5. **No dates, titles, or bill names in the coded files.** Titles, years, and altering instruments come from the seed file.
6. `dependency_affected` is read from the top level, falling back to `exemption_sweep`.
7. Bill-level and measure-level layers (5 to 8) are repeated on every record. `data.js` lifts them to case level by reading the first record and checking the value is constant; per-record fields (`description_effect_gap`, `altered_before_provision_took_effect`) are kept on the provision.

## Files the brief names that do not exist

`docs/workflow/plan.md` and `spec/v1/01-Project-Context-What-Survives.txt` are not in the repository. `docs/workflow/workflow.md`, `docs/method/schema.md` and `spec/codebook.md` were read instead.
