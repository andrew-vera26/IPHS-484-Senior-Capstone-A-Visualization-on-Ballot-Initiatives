# Plan

This is the roadmap. It is the reference for direction across the project.

**Rules for changing it**

1. A step is never skipped, reordered or added silently. A change needs an ADR in `docs/log/decisions/` and a line in the change log at the bottom of this page.
2. Before starting any work, an agent states which step it belongs to.
3. A step's "done when" is checked, not assumed.
4. This plan is compared against the frozen original spec in `spec/v1/`. Differences are tracked in [spec drift](../log/spec-drift.md).

Status: `done`, `next`, `todo`, `decide` (needs a decision before work starts).

## Measurement track

| # | Step | Owner | Done when | Status |
|---|---|---|---|---|
| 0 | Publish repo and docs site | You | Site loads at the Pages address | done (Nov 14) |
| 1 | Bring prototype files into the repo | You | Files copied, counts checked, committed and pushed | copied Nov 15; commit pending |
| 2 | Install workflow skills, run setup, then `/grill-with-docs` | You + agent | A v2 spec exists in `spec/` and the grilling's decisions are in ADRs | next |
| 3 | Settle scope decisions S1 to S4 below | You | Each has an ADR | decide |
| 4 | Schema v2: batch known gaps, codebook as single source of truth, `schema_version` on every record, permanent validate script | Agent, you review | Validator passes on the Prop A file under v2 | todo |
| 5 | Corpus universe and retrieval (see Corpus below) | Agent, you verify | Candidate list with primary-source checks; all witnesses on disk for each gold case | todo |
| 6 | Hand-code gold, blind to machine output, timed | You | Cases coded and timed; second coder on a subset | todo |
| 7 | Eval spec, then dev and held-out split of gold | Agent, you approve | Split committed before any prompt is written | todo |
| 8 | Build the pipeline eval-first | Agent | Each stage passes its evals and the invariants | todo |
| 9 | Iterate on dev, freeze, run held-out once | Both | Held-out results recorded, good or bad | todo |
| 10 | Scale: machine-code the full corpus, verify toward 15 | Agent, then you | Corpus coded; verified cases marked | todo |
| 11 | Site and paper | Both | Site built from audited data; paper written | todo |

**Gates**

- Step 6 does not start until step 5 has the documents for the cases to be coded.
- Step 8 does not start until step 7 exists. Evals come before the pipeline.
- Step 9's held-out run happens once.
- No figure is published without a label saying how it was produced.

## Design track

Runs in parallel and gates nothing. See [ADR 0007](../log/decisions/0007-website-prototype-parallel.md).

| # | Step | Owner | Done when | Status |
|---|---|---|---|---|
| D1 | Planning model researches reference sites | Opus | `docs/design/references.md` lists sites, what each does well, and what to borrow | todo |
| D2 | Planning model writes the design spec | Opus | `docs/design/DESIGN.md`: views, interactions, data fields each view reads | todo |
| D3 | Build the prototype on a local server | Fable | `site-prototype/` runs locally on two coded cases, labeled model-coded | todo |
| D4 | Review and log friction | You | Gaps between display needs and schema are in the friction log | todo |
| D5 | Iterate; port to the real site in step 11 | Any model | Real site uses audited data only | todo |

Local server: from inside `site-prototype/`, run `python3 -m http.server 8000` and open `http://localhost:8000`. A server is required because the page loads JSON files, which browsers block when a file is opened directly.

## Scope decisions to settle in step 3

- **S1. Window.** Original: Ballotpedia 2010 to 2024. Ballotpedia's current page runs through 2025 and 2026 alterations. Choose the end year.
- **S2. Adopt-and-amend.** Ballotpedia's alteration list excludes pre-election legislative compromises. The original candidate list includes Michigan 2018 cases, which are exactly that. Decide whether they are in the corpus, and mark them as a separate route.
- **S3. Second and third gold cases.** Prop A alone cannot test Layer 4. Original second case was South Dakota IM 22. Documented alternative was Missouri Prop B. Prop A has been seen as machine output, so it cannot be blind gold.
- **S4. Status of the SD IM 22 files.** A coded file exists. Confirm whether it is model-coded or hand-coded before deciding what to do with it.

## Corpus

**Definition.** Enacted initiated statutes that a legislature later amended or repealed in key part. Constitutional amendments are excluded. Pre-election compromises are decided by S2.

**Size.** Ballotpedia's page, as of March 10, 2026, counts **34** altered initiatives from 2010: 29 amended and 5 with key provisions repealed. An older Ballotpedia page counted 29 altered of 152 approved for 2010 to 2023. The newer page's own tables disagree with its headline in several places, and its headline approved total conflicts with the older page, so these are a starting point, not the corpus. Step 5 audits them.

**Bills.** No count exists. One bill can alter several initiatives (Idaho HB 425 repealed three), and one initiative can be altered by several bills, so bills and initiatives do not line up. The number of amending bills is a step 5 output.

## Change log

| Date | Change | ADR |
|---|---|---|
| 2026-11-15 | Plan created from the original spec and the work to date. Added design track | 0007 |
