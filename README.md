# dev-digest-ai-marketplace

A Claude Code plugin marketplace of four standalone, installable plugins,
extracted and generalized from the DevDigest course project's own internal
`.claude/agents/` and `.claude/skills/` so they work against *any* target
repository, not just the one they came from.

## Plugins

| Plugin | What it provides |
|---|---|
| [`engineering-paved-path`](./plugins/engineering-paved-path) | Shared engineering-practice skills: React, Next.js, Fastify, Drizzle ORM, PostgreSQL table design, Zod, TypeScript, security (OWASP), layered ("onion") backend architecture, frontend UI architecture, Mermaid diagrams, React Testing Library. No dependencies. |
| [`research-tools`](./plugins/research-tools) | A read-only `researcher` subagent for investigating a specific question, in-repo or on the web, and returning a structured, cited findings report. No dependencies. |
| [`architecture-review`](./plugins/architecture-review) | A read-only `architecture-reviewer` subagent that reads a *target repository's own* architecture documentation first, then checks a diff against it — never assumes a fixed module layout. Depends on `engineering-paved-path`. |
| [`sdd-engineering`](./plugins/sdd-engineering) | The main deliverable: a full spec-driven-development pipeline — `spec-creator` → `implementation-planner` → `implementer` → `plan-verifier`, plus `run-plan`/`engineering-insights`/`workflow-retro` skills and a minimal eval suite. Depends on all three plugins above. |

## Install

Add this marketplace locally (from a clone of this repo — nothing here is
published or pushed anywhere):

```
claude plugin marketplace add /path/to/dev-digest-ai-marketplace
```

Then install the plugin you want, e.g. the full pipeline:

```
/plugin install sdd-engineering@dev-digest-ai-marketplace
```

Installing `sdd-engineering` auto-installs its three declared dependencies.
To install an individual plugin on its own:

```
/plugin install engineering-paved-path@dev-digest-ai-marketplace
/plugin install research-tools@dev-digest-ai-marketplace
/plugin install architecture-review@dev-digest-ai-marketplace
```

## Docs

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — plugin structure, manifest
  fields, dependency rules, validation commands, PR checklist.
- [`docs/PLUGIN-GUIDELINES.md`](./docs/PLUGIN-GUIDELINES.md) — the
  Reusable / Project-specific / Optional-integration / Local-artifact
  classification this extraction used, file by file.
- [`docs/SECURITY.md`](./docs/SECURITY.md) — what's prohibited in any
  plugin file, and the incident process if something unsafe ships.
- [`docs/RELEASES.md`](./docs/RELEASES.md) — semver rules, the release-tag
  convention, channels, and rollback.
- [`docs/COST-BASELINE.md`](./docs/COST-BASELINE.md) — the cost/latency
  baseline template for the fixed SDD eval scenario (template only — no
  numbers are fabricated; fill in after real runs).
- [`docs/SITE-SPEC.md`](./docs/SITE-SPEC.md) — the spec for the `site/`
  static marketplace browser (routes, index fields, search, detail pages).

## Repository layout

```
dev-digest-ai-marketplace/
├── .claude-plugin/marketplace.json
├── .github/workflows/{validate,pages}.yml
├── plugins/{engineering-paved-path,research-tools,architecture-review,sdd-engineering}/
├── docs/
├── scripts/build-index.mjs
├── site/            (Vite + React + TS marketplace browser)
├── CODEOWNERS
├── CONTRIBUTING.md
└── README.md
```

## Status

This repository is local-only, built as course extraction/generalization
work. No GitHub remote has been created, nothing has been pushed, and no
`claude plugin marketplace add`/`claude plugin tag --push` has been run
against a remote. See each plugin's own `README.md`/`CHANGELOG.md` for its
specific contents and version history.
