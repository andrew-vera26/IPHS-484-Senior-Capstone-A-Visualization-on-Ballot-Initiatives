# ADR 0008: Magnitude and direction on separate visual channels, with no intensity ramp

- **Status:** accepted
- **Date:** 2026-11-15

## Context
The original spec (v1.0, sections 7.2 and 13.1) fixes two visual commitments: the eye must find the hot spots, and magnitude and direction must sit on separate visual channels. Section 7.2 names the channels "intensity for magnitude, hue for direction". The site prototype showed one layer at a time, all in fill color, so the two never appeared together (`docs/design/spec-vs-site.md`, row 8; friction entry 23). The design also rules out a severity scale (DESIGN.md section 5): Layer 1 values are categories, not degrees.

## Decision
A fifth lens, **Both**, on the case page and the landing page strips:

- **Hue is Layer 3, direction**, using the existing Layer 3 palette.
- **Pattern and fill are Layer 1, what happened**, using the vocabulary the "What happened" lens already has: hollow (unchanged), half filled (partially deleted), striped (rewritten), solid (deleted entirely). This is the magnitude channel.
- **No light-to-dark ramp for Layer 1.** An intensity ramp would rank provisions, and the project has no severity score. Pattern stands in for intensity.
- In **Facts only**, the hue is dropped and every cell is drawn in one ink, so only Layer 1 remains.
- The lens is linkable (`lens=both`), and its legend lists both channels with counts and links to the Method page. The direction hue is labeled interpretation.

## Consequences
This meets the spec's commitment in substance and departs from its wording: "intensity" becomes "pattern and fill". The departure is recorded in `docs/log/spec-drift.md`. The other four lenses are unchanged. While Layer 3 holds one value across almost all records (friction 13), the Both lens will look like the "What happened" lens in a single hue. That is a property of the data, not of the encoding.
