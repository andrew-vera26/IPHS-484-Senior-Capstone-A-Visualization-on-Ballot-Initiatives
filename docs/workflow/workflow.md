# Workflow

How the work is done, so that it can be audited and repeated.

## The loop

1. **Grill.** An agent interrogates the plan against the existing docs until the ambiguities are gone. Decisions are written to ADRs and terms to the glossary.
2. **Spec.** The settled plan becomes a spec in `spec/`.
3. **Tickets.** The spec is broken into small independent tickets.
4. **Implement.** Tickets are built in parallel by subagents, each given the codebook and one case.
5. **Evaluate.** Output is scored against gold, and the result is written to the experiment log.
6. **Retro.** Friction is logged and feeds the next schema batch.

## Eval first

Gold and the eval spec are written before the pipeline. The evals are the specification: a pipeline stage is done when it passes its evals, not when it looks right.

## Rules for agents

See `CLAUDE.md` at the repo root. The ones that matter most: agents never write to `gold/`; quoted spans must match the source character for character; schema changes only by migration.

## What every run leaves behind

- An experiment entry with hypothesis, setup, result, and what changed as a consequence
- Friction-log entries as they happen
- Timing, for hand-coding, so the labour claim is measured
- A commit

## Handoffs

Long sessions end with a written handoff, so a crashed terminal or a new session loses nothing. State lives in the repo, not in the conversation.
