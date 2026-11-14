# Overview

## The phenomenon

Twenty-one states let citizens enact statutes by initiative. In eleven of them the legislature can amend or repeal an initiated statute by simple majority, immediately. Eight impose time or supermajority limits. Arizona and California require voter approval or purpose-fidelity for substantive change.

Of initiated statutes approved 2010–2018, 28 of 99 had been repealed or amended as of April 2019. Marijuana was the most-altered topic, followed by elections.

## The gap

Trackers record that an initiative was altered. They cannot distinguish a legislature implementing a measure from one hollowing it out. No dataset measures how much of a voter-enacted law survives.

## What this project builds

1. A **measurement**: provision-level survival, coded in a nine-layer schema that separates what the text did from what the change means.
2. A **method**: persistent provision IDs, a hybrid retrieval and LLM-adjudication pipeline, and a validation design built on hand-coded ground truth.
3. A **resource**: a browsable, citable, dated-snapshot website over the coded cases.

## Novelty, stated narrowly

Established phenomenon, established method family, measurement nobody has taken. Comparative politics measures textual change with minimum-edit-distance methods. Those score a full rewording as a large change and a nine-word exemption elsewhere as a trivial one, and both readings are wrong. Measuring legal effect requires semantic judgment. This is an application novelty, not a contribution to natural language processing, and it is claimed as nothing more.

## Scope

- Initiated statutes only.
- Formal legal change only. Non-enforcement and underfunding are not captured.
- Small n. Description and typology, not hypothesis testing.
