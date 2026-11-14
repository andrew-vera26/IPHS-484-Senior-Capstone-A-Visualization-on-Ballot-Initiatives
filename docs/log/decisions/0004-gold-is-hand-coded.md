# ADR 0004: Gold is hand-coded

- **Status:** accepted
- **Date:** 2026-11-14

## Context
The Prop A prototype was coded by a model. Evaluating a model against model output would measure self-agreement.

## Decision
Only human-coded records enter `gold/`, and no agent may write there. Model-coded files are labeled as such and never used as ground truth.

## Consequences
Hand-coding is a real cost and must be timed. A second coder is needed for a subset to establish a human ceiling.
