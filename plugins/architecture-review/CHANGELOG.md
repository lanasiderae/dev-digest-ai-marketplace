# Changelog

## [1.0.0] — 2026-10-23

Initial extraction and release. `architecture-reviewer` agent rewritten
from a course project's `.claude/agents/architecture-reviewer.md`, which
assumed that specific repo's own onion layering, a pure-core-library
purity rule, and literal module paths (`reviewer-core`, `@devdigest`,
`server/src/modules`). Added a "Step zero" procedure that reads the
*target* repository's own architecture documentation before reviewing
anything, and verified zero remaining references to the source product's
module names.
