# ADR 0007: Website prototype runs in parallel, local only

- **Status:** accepted
- **Date:** 2026-11-15

## Context
The original Prototype Specification (v1.0, sections 5 and 8) put any visualization, website or interface out of scope for the prototype stage. Access to a stronger model is time-limited, and a working prototype would help test whether the schema serves the intended display.

## Decision
A website prototype is built in parallel with the measurement work, under these limits:

- It lives in `site-prototype/` and is viewed on a local server only. The documentation workflow never deploys it.
- It reads only existing model-coded cases, and every view is labeled "model-coded, unaudited".
- Design is planned first by a planning model (reference research, then `docs/design/DESIGN.md`), and built second.
- It gates nothing. No pipeline or gold step waits on it.

## Consequences
This departs from the original spec. It is recorded here so the departure is deliberate. Nothing is published until the data behind it has been audited. Friction found while building it (fields the display needs that the schema lacks) goes in the friction log.
