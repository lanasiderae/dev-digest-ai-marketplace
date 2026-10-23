# Compatibility

- **Claude Code:** `>= 2.1.110`

This floor was chosen because the release process this plugin relies on
(`claude plugin validate`, `claude plugin tag`, `claude plugin eval`) is
exercised and confirmed working on Claude Code `2.1.274` during this
plugin's initial 1.0.0 release. `2.1.110` is documented as a safe floor for
those specific subcommands, not independently re-verified against every
intermediate version between `2.1.110` and `2.1.274` — if you hit a
validation/tag/eval incompatibility on an older `2.1.x` patch, please file
an issue with the exact version and command output.

## Dependency compatibility

This plugin depends on `engineering-paved-path@^1.0.0`,
`research-tools@^1.0.0`, and `architecture-review@^1.0.0` from this same
marketplace. Installing `sdd-engineering` without them (or with incompatible
versions) leaves `implementer`/`implementation-planner` unable to resolve
domain skills, `spec-creator` unable to delegate to the researcher subagent,
and `run-plan` unable to invoke the architecture-reviewer subagent — the
agents degrade to asking the user instead of silently guessing, per each
agent's own hard rules, but the pipeline is not fully functional without
them.
