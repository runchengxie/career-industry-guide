# Career & Industry Guide

English | [简体中文](README.zh-CN.md)

A public, Chinese-language static site that compares three research samples — advertising and marketing services, elderly care, and domestic tourism — on demand evidence, entry points, barriers, risks and evidence gaps.

It is not an employment guarantee, not a ranking, and not a recruiting service. Every number carries a year, a scope and a source; missing data is marked as missing instead of filled in.

- Research version: 2026-11-15 (Asia/Shanghai). Verification of live job postings is still incomplete.
- Published at <https://runchengxie.github.io/career-industry-guide/>
- The two research prompts are included in redacted form under `docs/prompts/`. Personal material, raw conversations and unpublished attachments are not in this repository.

## Pages

| Path | Content |
| --- | --- |
| `/` | the three samples side by side, filterable by job direction |
| `/industries/<slug>/` | one sample: definition, demand evidence, roles, thresholds, risks, sources |
| `/roles/<slug>/` | one role: what it involves, what to prepare, verification status |
| `/data/` | every recorded metric, a map of what is tracked or missing, and the data files |
| `/methods/` | sources, scope, verification rules and open questions |

## Local development

Node.js 22.23.4 or newer.

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

`npm run verify` runs the same chain as CI: data validation, tests, type check, build, output checks (broken links, required and forbidden content) and HTML/WCAG checks.

## Deployment

GitHub Actions builds and deploys to GitHub Pages on every push to `main`. The workflow fixes `BASE_PATH=/career-industry-guide/` and `SITE=https://runchengxie.github.io`; both can be overridden locally to inspect the deployed paths.

```bash
BASE_PATH=/career-industry-guide/ SITE=https://runchengxie.github.io npm run build
BASE_PATH=/career-industry-guide/ npm run check:dist
```

## Data

Site content lives in `src/data/*.json`; the schema is `src/lib/types.ts`. Page templates never hard-code numbers, and `scripts/check-data.ts` fails the build when a value lacks a source, year or scope, or when a role claims a verified posting without a link and date.

## Documentation

- `docs/prompts/` — the two research prompts, plus how they were converted and redacted
- `docs/superpowers/specs/` — design record, including the revision log
- `docs/superpowers/plans/` — implementation plan and execution record

## License

- Text and data: [CC BY 4.0](LICENSE-content)
- Code: [MIT](LICENSE)
