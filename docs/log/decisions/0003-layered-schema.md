# ADR 0003: A layered schema with no severity field

- **Status:** accepted
- **Date:** 2026-11-14

## Context
A single label such as altered cannot separate a technical fix from a gutting. A severity score would encode the researcher's judgment as a number.

## Decision
Nine layers separate what the text did from what it means, from near-objective to interpretive. Prior and subsequent similar-measure years are stored, not thresholded. There is no severity field.

## Consequences
Readers judge how much a change matters. Interpretive layers are reported separately so their lower reliability is visible.
