# Friction log

Places where the schema or method failed to fit real text. These are results.

## Missouri Prop A prototype

**1. Inherited text.** The certified measure reprints statutory sections including 2006 language. Counting it inflates survival. Fixed by adding `provenance`.

**2. Hidden dependency.** Provision p003 points at p002 for its escalation formula, so p003 can be textually intact and substantively changed. Fixed by adding `depends_on`.

**3. No Layer 4 value for escalation removal.** HB 567 removed indexing clauses while keeping step increases. The schema could not name it, even though indexing removal is the pattern the central hypothesis predicts. Value added.

**4. Dependency field in the wrong block.** `dependency_affected` was nested inside `exemption_sweep`, mixing a hand-derived finding with a machine sweep result. Separated.

**5. Definition sub-items inflated the denominator.** 38 of 102 records were definitional. Resolved by flagging instead of merging, which kept spine IDs stable.

**6. The provision rule keyed on typography.** Lettered sub-items were treated as components. Section 290.603(4)'s lettered paragraphs are each separately survivable, while section 290.630(2)'s complete one sentence. Replaced with the separate-survivability test. Section 290.606(7) was the first list that split across the test.

**7. Task scope error.** A fix task named 23 sub-items when the file contained 39 two-level records. Tasks are now written as rules, not ID lists.

**8. Layer 4 never discriminated.** It took one value on 99 of 102 records because the bill repealed the sections wholesale. A property of the case. Resolved by case selection.
