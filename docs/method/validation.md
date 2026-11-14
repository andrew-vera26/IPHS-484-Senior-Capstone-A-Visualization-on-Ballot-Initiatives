# Validation

**Status: designed. No pipeline output has been validated yet, because no hand-coded gold exists.**

## Why gold must be hand-coded

The prototype file for Missouri Prop A was coded by a model. Every record says so. It is a hypothesis, not ground truth, and it is not used to evaluate the pipeline until a human has audited it. See [ADR 0004](../log/decisions/0004-gold-is-hand-coded.md).

## Three classes of test

1. **Deterministic unit tests.** Does the splitter produce the expected provisions? Do IDs stay stable on re-run?
2. **Invariants.** Rules that must hold for any correct output, with no gold needed:
    - `outright repeal` in Layer 4 implies `deleted entirely` in Layer 1
    - dependency inversion has zero mismatches
    - every component's dependencies appear in its parent's
    - every quoted span matches the source at its stated offsets
3. **Evals.** Pipeline output against gold, scored per layer by exact match against closed enums. No LLM judge is needed.

## Dev and held-out split

Gold is split before any prompt is written. The pipeline is tuned on the dev split. The held-out split is run once, after the pipeline is frozen. Without this, the prompts overfit to the cases they were tuned on and the reported agreement is inflated.

## Thresholds

Pre-registered after the first measurement and before tuning, and written into the repo with a date. Not chosen in advance, because there is no baseline to set them from.

## Benchmarks

- Missouri p003 must come out `dependency_affected: true`.
- The aligner must return `none` on the South Dakota IM 22 deletions.

## Human ceiling

A second coder codes a subset. Agreement between two humans is the ceiling the pipeline can reasonably be asked to reach, and is reported beside pipeline agreement.

## Reporting

Agreement is reported per layer, never as one overall number. Interpretive layers (3, 4) will be lower than near-objective ones, and a blended figure would hide that.
