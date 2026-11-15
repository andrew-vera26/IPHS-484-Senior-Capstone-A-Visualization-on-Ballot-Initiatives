# What Survives — coding codebook

**Status note (created 2026-10-05):** no codebook file previously existed in this repo. Permitted
values for each layer had only ever been documented implicitly, as whatever values happened to
appear in `prop-a-provisions-EXAMPLE-coded.json`. This file is the first explicit codebook. Its
enums below are derived from the values actually observed in the Prop A EXAMPLE file, plus the one
addition below (Task 1). It should be treated as a working draft, not a closed/validated master
list — Prop A is a single case, and `layer_1`/`layer_2` enums in particular are likely incomplete
until more cases are coded (see "Not in scope" note in `schema-friction-log.md`, 2026-10-05: Layer
4 only ever discriminated on one case's data before this fix).

## provenance

`created` | `amended` | `inherited` | `uncertain`

## layer_1_structural_operation

Observed: `unchanged` | `partially deleted` | `deleted entirely` | `rewritten`

Assigned by comparing `base_witness` (the certified initiative text) to `comparison_witness` (the
amending bill's text) — **never** by comparing `base_witness` to the pre-initiative prior statute.
(Verified 2026-10-05 for all 102 Prop A EXAMPLE records — see Task 10 audit in
`schema-friction-log.md`.)

## layer_2_provision_type

Observed (Prop A only, not yet validated against a second case):
`administrative procedure (includes notice, recordkeeping, appeals and review)` |
`conflict or preemption clause` | `core obligation or entitlement` | `definitions` |
`enforcement authority` | `escalation, indexing, or adjustment` | `penalty or remedy` |
`private right of action` | `rate, amount, or threshold` |
`rulemaking authority and agency discretion` | `scope/coverage (includes eligibility)`

## layer_3_directional_effect

Observed: `narrows`. Only one value has appeared so far — Prop A's amending bill (HB 567) uniformly
narrowed or repealed every non-inherited provision it touched. Other values (e.g. `broadens`,
`unchanged`) are implied by the schema design but have no worked example yet.

## layer_4_mechanism

Observed: `outright repeal` | **`escalation removal`** (added 2026-10-05, Task 1)

### escalation removal

> Removal of an indexing, adjustment, or automatic-escalation mechanism from a provision that
> otherwise survives, such that the provision's substantive content is retained but ceases to
> adjust over time.

**Why added:** `MO-2024-PropA-p003` was coded `layer_1_structural_operation: "partially deleted"`
but `layer_4_mechanism: "outright repeal"` — internally contradictory, since HB 567 deleted the
two post-2026 CPI indexing clauses from this provision while retaining the $13.75 → $15.00 step
increases verbatim. The provision was not repealed outright. Re-coded to `escalation removal`
(see `schema-friction-log.md`, 2026-10-05, Task 2).

**Validation rule (Task 3):**

```
IF layer_4_mechanism == "outright repeal"
THEN layer_1_structural_operation MUST == "deleted entirely"
ELSE flag record as inconsistent
```

Checked against all 102 Prop A EXAMPLE records after the Task 2 fix: 0 inconsistencies.

## Denominator-control fields (added 2026-10-05, Tasks 5–8; test corrected 2026-10-05, Tasks 12–13)

- `parent_spine_id` (string or `null`) — if non-null, this record is a *component* of the
  provision at the given spine ID, not a separately survivable unit.
- `counts_in_denominator` (bool) — `false` for component records; `true` otherwise.
- **Separate survivability test** (replaces the earlier typography-based "lettered sub-items are
  always components" rule, which over-collapsed independent provisions): an enumerated item is
  its own provision if the legislature could delete it while leaving its sibling items intact,
  and the result would be a coherent statute; otherwise it is a component. Applied by reading the
  text, not by citation format. See `prop-a-structural-outline.md` for the full rule text and the
  worked 290.603(4)/290.606/290.630(2) examples.
- **Survival-rate denominator rule:** a record counts only if BOTH
  `counts_in_denominator == true` AND `provenance IN ("created", "amended")`. `inherited` and
  `uncertain` records stay in the dataset and in the case view, flagged as context, but are
  excluded from the metric.

As of the 2026-10-05 correction: 70 records `counts_in_denominator: true`, 32 `false`; final
denominator (also requiring `provenance IN ("created","amended")`) = 67.
