# sdd-engineering

A spec-driven development (SDD) pipeline for Claude Code: take a requirement
from an evidence-based specification through an AC-linked implementation
plan, implementation, architecture review, and closed-list verification —
without assuming any one repository's package layout.

## What's in this plugin

**Agents**

| Agent | Role | Produces |
|---|---|---|
| `spec-creator` | Resolve six clarification categories and write unique EARS acceptance criteria from text/designs/code/repo state | A dated specification markdown file |
| `implementation-planner` | Turn an approved specification into an AC-linked Development Plan, inferring the repo's real structure first | A Development Plan (returned as its message; persisting it is the caller's choice) |
| `implementer` | Execute an approved Development Plan, selecting skills by matching touched files against each installed skill's own trigger description | Code changes + an Implementation Report |
| `plan-verifier` | Read-only, closed-list verification of a completed change against its Development Plan | A Plan verification report (DONE/PARTIAL/MISSING/CANNOT VERIFY per item) |

**Skills**

| Skill | Role |
|---|---|
| `run-plan` | Orchestrates implementation → focused AC-derived tests → architecture review → bounded fixes → final `plan-verifier` check, manual invocation only |
| `engineering-insights` | Appends non-obvious, reusable findings to the touched package's `INSIGHTS.md` (a documented convention, not a hardcoded package list) |
| `workflow-retro` | Manual retrospective over a completed run's context (and, with `--deep`, its logs), using a stdlib-only usage-report script |

**Evals**

`evals/small-feature-spec-and-plan/` — the fixed SDD scenario ("a user
requests a specification and implementation plan for a small feature")
with two graders (`spec-written.md`, `plan-ac-linked.md`). Run with:

```
claude plugin eval sdd-engineering
```

## Dependencies

This plugin declares a dependency on three sibling plugins in this
marketplace (see `.claude-plugin/plugin.json`):

- `engineering-paved-path@^1.0.0` — the domain skills (`onion-architecture`,
  `fastify-best-practices`, `frontend-ui-architecture`, `zod`, etc.)
  `implementer` and `implementation-planner` select by file/content match.
- `research-tools@^1.0.0` — the `researcher` subagent `spec-creator`
  delegates bounded research to.
- `architecture-review@^1.0.0` — the `architecture-reviewer` subagent
  `run-plan` invokes between implementation and final verification.

Install all four together for the full pipeline; `claude plugin install`
resolves these as auto-installed dependencies.

## Where specs and plans live in a new target repo

`spec-creator` checks, in order: an existing `specs/` directory (root or
per-package), then an existing `docs/sdd/`-style directory, then falls back
to creating a root-level `specs/` directory as a new convention — it never
invents a package-local location speculatively. `implementation-planner`
has no file-write capability; persisting its plan to a file (and where) is
the caller's choice.

## Test commands in a new target repo

No agent in this plugin assumes `pnpm`/`npm test`. Each agent reads the
target package's own `package.json` scripts (or equivalent build-tool
config) to discover its real verification commands, and explicitly flags
"no test command found — ask the user" rather than guessing one that may
not exist.

## Install

```
/plugin install sdd-engineering@dev-digest-ai-marketplace
```

See the marketplace root `README.md` and `docs/` for the full marketplace,
and `COMPATIBILITY.md`/`CHANGELOG.md` in this directory for this plugin's
own version history and compatibility floor.
