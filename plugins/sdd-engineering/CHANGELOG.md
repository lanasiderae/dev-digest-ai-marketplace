# Changelog

All notable changes to the `sdd-engineering` plugin are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/),
versions follow [Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-10-23

- `spec-creator` now treats a mandatory requirement with no corresponding
  Acceptance Criteria row as a blocking gap, exactly as blocking as an
  unresolved `[NEEDS CLARIFICATION: ...]` marker — a specification cannot
  be finalized/approved while any mandatory requirement lacks an AC-ID.
  A requirement that's genuinely optional must be stated as a non-goal
  instead of left silently uncovered.
- Added `evals/spec-missing-ac-blocked/`: a draft spec with a latency
  requirement that has no AC-ID, and a request to finalize it anyway —
  the grader fails if the agent approves/finalizes instead of blocking on
  the gap.
- **Eval evidence (2026-10-23, Haiku, N=3):** `spec-missing-ac-blocked`
  passed 2/3 runs (score 0.67 avg) — the new blocking rule fires in the
  majority of runs. Raw result committed at
  `evals/results/2026-10-23T15-07-43-134Z/aggregate-result.json`.

## [1.0.0] — 2026-10-23

Initial extraction and release.

- Added `spec-creator`, `implementation-planner`, `implementer`, and
  `plan-verifier` agents, generalized from a product-specific course
  codebase to work against any target repository's own discovered package
  layout and test commands rather than a fixed set of package names.
- Added `run-plan`, `engineering-insights`, and `workflow-retro` skills.
  `engineering-insights` now documents the per-package `INSIGHTS.md`
  convention explicitly instead of hardcoding package names;
  `workflow-retro`'s bundled `usage-report.py` script is invoked via
  `${CLAUDE_SKILL_DIR}` rather than a hardcoded path.
- Added a minimal eval suite (`evals/small-feature-spec-and-plan/`) covering
  the fixed scenario: a user requests a specification and implementation
  plan for a small feature.
- Declared dependencies on `engineering-paved-path@^1.0.0`,
  `research-tools@^1.0.0`, and `architecture-review@^1.0.0`.
