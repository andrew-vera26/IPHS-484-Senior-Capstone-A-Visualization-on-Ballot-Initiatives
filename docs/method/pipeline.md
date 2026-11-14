# Pipeline

**Status: designed, not built.** Nothing on this page has been run. Each stage is specified so it can be built eval-first and tested against hand-coded gold.

Every stage writes to disk, can be re-run alone, and caches by input hash.

| # | Stage | What it does | Main failure it guards against |
|---|---|---|---|
| 1 | Decomposition | Splits the voter-enacted text into provisions with persistent spine IDs | Inconsistent unit of analysis |
| 2 | Hybrid retrieval | For each provision, proposes candidate counterparts in the amended text | Missing a moved or rewritten provision |
| 3 | Alignment adjudication | An LLM picks the true counterpart from the candidates, or `none` | Forcing a match onto a deleted provision |
| 4 | Effect classification | Layer 1 (operation) and Layer 3 (direction), each with a rationale and a quoted span | Unsupported judgments |
| 5 | Exemption sweep and dependency check | Searches the whole amended statute for limiting language, and checks whether anything a provision depends on changed | Provisions that look intact but are hollowed elsewhere |
| 6 | Layers 4 to 9 | Mechanism, justification, procedure, measure context, subsequent fate, metadata | |
| 7 | Validation | Span verification, invariant tests, comparison to gold | Hallucination, internal contradiction |

## Terms

**Hybrid retrieval.** Two searches fused. Dense retrieval embeds each provision as a vector and finds near neighbours by meaning, so it finds a reworded provision. BM25 is keyword search, so it finds exact section numbers and defined terms. Reciprocal rank fusion merges the two ranked lists by position, with no score calibration. No vector database is needed at this corpus size.

**Alignment with a `none` branch.** The model is shown the original provision and the top candidates and must choose one or answer `none`. Without `none`, a deleted provision is paired with its nearest neighbour and scored as changed instead of deleted. The South Dakota IM 22 deletions are the benchmark.

**Exemption sweep.** A provision can be textually identical and still neutralised by a carve-out elsewhere. The sweep reads the full amended statute for language that limits the provision's reach.

**Dependency check.** If provision A computes something by reference to provision B and B changed, A has changed in effect even though its text did not. Missouri p003 is the benchmark.

**Span verification.** Every judgment must quote the supporting text with character offsets. Code checks that the quote matches the source exactly. This is the main hallucination guard.

**Self-consistency.** Each classification runs five times at low temperature, with candidate order shuffled to cancel position bias. Disagreement is recorded, not hidden.

**Contamination control.** State names and years are stripped from the prompt text where they are not needed, so the model judges the text and not what it remembers about the famous measure.

**Cross-model check.** A second model family re-codes a sample. Agreement between models is reported next to agreement with the human coder.

## Retrieval stack

Dense embeddings from a legal-domain model (Voyage), with sentence-transformers as a local fallback. `rank_bm25` for keyword scoring. Fusion in about twenty lines of Python.

## What the pipeline does not do

It does not decide severity. There is no severity field. It records what changed and in which direction, and the reader judges how much that matters.
