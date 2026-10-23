# Changelog

All notable changes to the `sdd-engineering` plugin are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/),
versions follow [Semantic Versioning](https://semver.org/).

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
