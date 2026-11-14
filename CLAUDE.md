# Standing rules for agents working in this repo

Read `GLOSSARY.md` first. Read `docs/method/schema.md` before touching any record.

## Hard rules

1. **Never write to `gold/`.** It holds hand-coded ground truth. Only the human writes there. Pipeline output goes to `out/`.
2. **Never paraphrase source text.** Every quoted span must match the source file character for character at its stated offsets. If it does not, the record is invalid.
3. **Schema changes only by migration.** Bump `schema_version`, update the codebook in `spec/`, add a line to `docs/log/schema-changelog.md`, and add an ADR if the change is a decision. Never edit enum values silently.
4. **Tests import enums from the codebook.** Do not hard-code permitted values anywhere else.

## Working rules

5. **Report counts before and after every bulk edit.** Records in, records out, records changed, records skipped. Unexplained attrition is the most common silent failure.
6. **Tasks are rules, not ID lists.** If a task names specific records, also state the rule they were drawn from, and check whether the rule matches more records than were named. Report any difference instead of silently following the list.
7. **Code one field across all records before the next field.** Do not complete one record at a time. Criteria drift is invisible.
8. **Do not open the amending bill while coding base-witness fields** (provenance, depends_on, provision type).
9. **Run the validator after every edit to a coded file.** Do not report a task complete if it fails.
10. **Log friction as it happens** in `docs/log/friction-log.md`. An empty friction log means the work was not done attentively.

## Context discipline

11. Agents receive the codebook and one case's text, never the whole corpus.
12. Agents write results to files and return a short summary. Never paste raw records into the conversation.
13. Every stage writes to disk, can be re-run alone, and caches API calls keyed on a hash of the input.
