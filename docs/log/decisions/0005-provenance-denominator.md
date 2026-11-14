# ADR 0005: Provenance and the survival denominator

- **Status:** accepted
- **Date:** 2026-11-14

## Context
Certified measure text reprints earlier statute, so inherited text surviving says nothing about the voters' 2024 choice.

## Decision
Every record carries provenance. Survival counts only records with `counts_in_denominator == true` and provenance created or amended. Inherited and uncertain records stay visible as context.

## Consequences
On Prop A the denominator fell from 102 records to 67.
