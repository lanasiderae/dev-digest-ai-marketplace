# Changelog

## [1.0.0] — 2026-10-23

Initial extraction and release. Twelve skills extracted from a course
project's `.claude/skills/`, copied faithfully for the already-generic
skills, and generalized for `onion-architecture` (module names, adapter
names, and project-specific grounding references rewritten to be
discovered from the target repo rather than assumed) and
`frontend-ui-architecture` (a handful of "this repo's `client/...`"
references rewritten to check the target repo's own docs instead of
asserting the source repo's files exist).
