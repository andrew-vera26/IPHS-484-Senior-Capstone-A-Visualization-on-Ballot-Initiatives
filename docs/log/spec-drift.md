# Spec drift

Comparison of the frozen original specification (`spec/v1/`, v1.0, September 2026) against the current plan and work. Every difference is classed as **kept**, **changed on purpose**, **departed from** (not planned, needs a decision), or **open**.

## Prototype Specification (v1.0)

| Spec item | Status | Notes |
|---|---|---|
| Prototype pair: Missouri Prop A and South Dakota IM 22 | Changed, undecided | Prop A coded. SD IM 22 files exist; whether they are hand-coded is unconfirmed (S4). Prop B proposed as second case because Prop A leaves Layer 4 nearly untested (S3) |
| Prop A profile "selective partial hollowing" | Wrong | Prototype result: near-total deletion, one provision partly surviving. Of the 67 counted provisions, 66 were deleted entirely |
| Prop A "alignment across partial survival" test | Not delivered | There was almost no partial survival to align |
| Hand-code first, with no pipeline (4.1) | **Departed from** | Prop A was coded by a model first, no timing recorded. The spec's own failure list names "hand-coding skipped or done after seeing machine output". The Prop A file is therefore an audited hypothesis, not blind gold |
| Record time per case and stage | Not done | Timing log is empty |
| Pipeline built after hand-coding, in eight listed stages | Kept, plus additions | Now eval-first, with a dev and held-out split and invariant tests, none of which the spec had |
| Caching from the start | Kept | Written into `CLAUDE.md` |
| Exemption sweep as the key test (criterion 5) | Changed on purpose | Split into two checks: limiting language elsewhere, and a dependency check. Prop A's p003 was caught by the hand-built dependency graph, not by a sweep |
| Schema of nine layers | Kept, revised to v0.2 | Added provenance, dependency fields, denominator fields, Layer 4 value `escalation removal` |
| Open question: what is a provision | Answered | Separate-survivability test (ADR 0001) |
| Open question: sections that amend several provisions | Open | Batched for v0.3 |
| Open question: base witness when amended before taking effect | Open | |
| Open question: telling `none` from retrieval failure | Open | Must be solved before step 8 |
| Open question: sweep scope, amended statute or whole code | Open | |
| Open question: is fifteen the right number | Open | Needs timing from step 6 |
| Cross-model check deferred | Kept | Still deferred to the full build |
| Synthetic perturbation testing deferred | Kept | |
| **No website or visualization at this stage (5, 8)** | **Departed from, deliberately** | Prototype site built in parallel, local only, labeled (ADR 0007) |
| Six prototype artifacts | Partly met | Friction log: done. Machine-coded Prop A file: exists, model-coded in conversation, not by the pipeline. Hand-coded files, agreement report, timing record, working pipeline: none yet |
| Acceptance criteria 1 and 8 (hand-coded before machine; timing) | Not met | |
| Acceptance criterion 7 (friction log not empty) | Met | |

## Project Context (v1.0)

| Spec item | Status | Notes |
|---|---|---|
| Corpus about 30 from Ballotpedia 2010 to 2024 | Updated | Ballotpedia now shows 34 through 2025 and 2026 alterations. Window is S1 |
| Fifteen hand-verified, all machine-coded | Kept | Number still provisional |
| Candidate case list | Kept, unverified | Michigan cases conflict with Ballotpedia's exclusion of compromises (S2) |
| Roadmap stage order: prototype, then list verification | Changed | Retrieval and a first list check now come before gold coding, since gold needs the documents |
| Roadmap places site last | Changed | Design track runs in parallel |
| Workflow | Added | Pocock flow, eval-driven development, docs-first repo, `CLAUDE.md` rules, handoffs. None were in v1 |
| Selection-bias defense, tiering, counter-cases | Kept | ADR 0006 |
| Deferred extensions: justification analysis, vehicle choice | Kept | Still deferred |
| Per-layer reliability reporting | Kept | |
| Visual commitment: magnitude and direction on separate channels, "intensity for magnitude, hue for direction" (7.2, 13.1) | Changed on purpose | Met by the "Both" lens: hue is Layer 3, Layer 1's pattern and fill stand in for intensity. No light-to-dark ramp, because the project has no severity score (ADR 0008) |

## How this file is used

Each time the plan changes, this table gets a row or a status change, and an ADR records why.
