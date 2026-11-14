# ADR 0001: What counts as a provision

- **Status:** accepted
- **Date:** 2026-11-14

## Context
The mechanical split gave one record per definition sub-item, so 38 of 102 records were definitional and the survival denominator was dominated by vocabulary. A first rule based on typography was wrong.

## Decision
A provision is a separately survivable unit. An enumerated item is its own provision if it could be deleted alone and leave a coherent statute. Otherwise it is a component, kept as a record with `parent_spine_id` set and `counts_in_denominator: false`.

## Consequences
Spine IDs are preserved and the rule is reversible. Applying the test needs reading the text and is a judgment, so it is a source of coder disagreement to measure.
