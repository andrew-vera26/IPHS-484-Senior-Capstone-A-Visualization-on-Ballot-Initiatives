# Schema

**Current version: 0.2.** The codebook is the single source of truth. Tests import enums from it.

## Unit of analysis

A **provision** is a separately survivable unit. An enumerated item is its own provision if the legislature could delete it while leaving its siblings intact and the statute would still be coherent. Otherwise it is a **component**: it keeps a record, with `parent_spine_id` set and `counts_in_denominator: false`. Typography does not decide this; the test is applied by reading the text. See [ADR 0001](../log/decisions/0001-provision-unit.md).

## Spine

IDs look like `MO-2024-PropA-p017`. They are assigned on the base witness (the voter text) and never reassigned. A provision the legislature adds gets its own ID, flagged as having no initiative counterpart. Restructuring is one-to-many. See [ADR 0002](../log/decisions/0002-spine-ids.md).

## Layers

| # | Layer | Nature | Notes |
|---|---|---|---|
| 1 | Structural operation | Near-objective | What happened to the text. Assigned by comparing base witness to the amending bill, never to the prior statute |
| 2 | Provision type | Near-objective | What kind of rule it is |
| 3 | Directional effect | Interpretive | Narrows, expands, neutral, indeterminate. Carries a rationale and a driving span |
| 4 | Mechanism | Interpretive | How a narrowing or delay was achieved. Only applies where Layer 3 narrows or delays. Includes `escalation removal` (added in v0.2) |
| 5 | Description and justification | Bill-level | How the change was described. A binary gap flag |
| 6 | Temporal and procedural | Near-objective, bill-level | Committee of origin, timing, referendum-proof clause |
| 7 | Measure context | Near-objective | Prior and subsequent similar-measure years, stored and not thresholded |
| 8 | Subsequent fate | Near-objective | Includes re-enacted in substantially the same form |
| 9 | Coding metadata | | Who coded it, when, schema version, agreement |

There is **no severity field**. See [ADR 0003](../log/decisions/0003-layered-schema.md).

## Fields added after the prototype (v0.2)

- `provenance` (`created`, `amended`, `inherited`, `uncertain`) and `provenance_basis`
- `depends_on`, `depended_on_by` (the latter derived mechanically by inverting the former)
- `dependency_affected`, `dependency_source_ids` (top level, separate from the exemption sweep)
- `parent_spine_id`, `counts_in_denominator`
- Layer 4 value `escalation removal`

## Denominator rule

A record counts toward a survival rate only if `counts_in_denominator == true` and `provenance` is `created` or `amended`. Inherited and uncertain records stay visible as context. See [ADR 0005](../log/decisions/0005-provenance-denominator.md).

## Known gaps, proposed for v0.3 and not applied

1. Multi-witness comparison: survival indexed over time, as a provision can differ at each amending bill.
2. A `replaced_by` field (South Dakota: a deleted provision was substituted by a different one).
3. A Layer 1 value for judicial restoration (Michigan).
4. A `policy_pillar` field to group provisions by function.

These are batched on purpose. Changing the schema one case at a time makes cases incomparable. All schema changes go through a migration: bump `schema_version`, update the codebook, the [changelog](../log/schema-changelog.md) and an ADR.
