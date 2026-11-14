# Glossary

**Initiated statute.** A citizen-proposed ordinary law enacted by popular vote. The unit this project studies. Constitutional amendments are out of scope because legislatures cannot unilaterally alter them.

**Direct / indirect initiative.** Describes the path *to* the ballot only. Direct goes straight to voters; indirect goes to the legislature first. Post-enactment alteration applies to both.

**Adopt and amend.** A legislature adopts an indirect initiative before the election to keep it off the ballot, then amends it under a lower threshold. Michigan, 2018.

**Witness.** One version of a legal text: the voter-enacted measure, an amending bill, or the current statute.

**Base witness.** The voter-enacted text. Spine IDs are assigned here and never change.

**Spine ID.** A persistent, human-legible provision identifier, e.g. `MO-2024-PropA-p017`: state, approval year, measure slug, zero-padded provision number in reading order.

**Provision.** One separately survivable unit of law. See the separate-survivability test below.

**Separate-survivability test.** An enumerated item is its own provision if the legislature could delete it while leaving its siblings intact and have the result make sense. Otherwise it is a component.

**Component.** An item that completes its parent provision. Kept as a record, flagged `counts_in_denominator: false`, with `parent_spine_id` set.

**Provenance.** Whether a provision was `created` by the measure, `amended` by it, or merely reprinted (`inherited`) from earlier law. Only created and amended provisions count toward survival.

**Denominator.** Records with `counts_in_denominator == true` and provenance `created` or `amended`.

**Survival.** What happened to a provision between the base witness and a comparison witness. Time-indexed: it can differ at each witness.

**Dependency.** A provision whose operation relies on another (a cross-reference, formula, or defined term). Recorded in `depends_on`.

**Exemption sweep.** A pipeline step that searches the whole amended statute for limiting language aimed at provisions that look intact.

**Hybrid retrieval.** Dense (embedding) search plus sparse (BM25 keyword) search, fused by reciprocal rank fusion.

**Alignment.** Matching an original provision to its counterpart in the amended text, or to `none`.

**Gold.** Hand-coded records, the ground truth the pipeline is measured against. Written by a human only.

**Dev / held-out split.** Gold used to tune the pipeline versus gold never touched until the pipeline is frozen.

**Friction log.** A running record of every place the schema failed to fit real statutory text.
