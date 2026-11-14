# What Survives

Measuring legislative alteration of voter-approved ballot initiatives.

Existing methods measure whether a law's text changed. This project measures whether the law still does what voters voted for: provision by provision, with every claim traceable to source text.

Andrew Vera · Kenyon College · IPHS 484 Senior Seminar

## Status

Prototype phase. One case (Missouri Proposition A) has been coded in a first pass. Every figure in this repository is **provisional** until hand-verified. See `docs/log/experiments/E001-prop-a-prototype.md`.

## Repository map

| Path | What lives there |
|---|---|
| `docs/` | The documentation site: project, method, workflow, and every log |
| `spec/` | The written specification and the codebook (single source of truth for the schema) |
| `gold/` | Hand-coded cases. Written by a human only. Never by the pipeline |
| `data/` | Source documents per case, with a manifest of where each came from |
| `src/` | The pipeline |
| `tests/` | Unit tests, invariant checks, and evals against `gold/` |
| `CLAUDE.md` | Standing rules for coding agents working in this repo |
| `GLOSSARY.md` | The project's vocabulary. Same file is published at `docs/glossary.md` |

## Documentation site

```bash
pip install -r requirements-docs.txt
mkdocs serve        # preview at http://127.0.0.1:8000
```

Pushing to `main` publishes the site to GitHub Pages through `.github/workflows/docs.yml`. One-time setup: in the repo's Settings → Pages, set the source to the `gh-pages` branch.

## Conventions

- Every schema change bumps `schema_version` and gets an entry in `docs/log/schema-changelog.md`.
- Every non-obvious decision gets an ADR in `docs/log/decisions/`.
- Every experiment gets an entry in `docs/log/experiments/`, written before it is run.
- Friction encountered while coding goes in `docs/log/friction-log.md` as it happens.
