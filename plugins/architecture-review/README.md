# architecture-review

A read-only `architecture-reviewer` subagent that checks a diff or path set
against a repository's *own* documented layering rules, instead of
assuming any one repo's specific module names. Depends on
`engineering-paved-path@^1.0.0` for the domain skills it applies.

Before reviewing anything, the agent runs a "Step zero" pass: it looks for
`ARCHITECTURE.md`/`docs/architecture.md`, each touched package's own
`AGENTS.md`/`README.md`, and a root `CLAUDE.md`/`AGENTS.md`, to learn the
target repo's actual file-role vocabulary and layering rules before citing
any violation. It never produces a pass/fail verdict — only cited findings.

## Install

```
/plugin install architecture-review@dev-digest-ai-marketplace
```
