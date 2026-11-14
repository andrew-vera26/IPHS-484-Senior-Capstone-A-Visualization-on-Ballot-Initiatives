# ADR 0002: Persistent spine IDs

- **Status:** accepted
- **Date:** 2026-11-14

## Context
Alteration happens across several amending bills over time, and provisions are renumbered, split and merged. Tracking survival needs a stable referent.

## Decision
Human-legible IDs are assigned once on the base witness (the voter text) and never reassigned. Provisions added by a legislature get IDs flagged as having no initiative counterpart. Restructuring is one-to-many.

## Consequences
Adapted from the Frankenstein Variorum collation model. Renumbering cannot silently break a record.
