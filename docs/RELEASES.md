# Releases

## Semver rules

Each plugin's `plugin.json` `version` follows semver independently — the
four plugins in this marketplace do **not** share a version number.

- **MAJOR** — a breaking change to a plugin's public surface: an agent/skill
  renamed or removed, a tool requirement added that wasn't there before, a
  manifest field that changes meaning, or a dependency bump that itself
  requires a major bump in a dependent plugin.
- **MINOR** — backward-compatible additions: a new skill/agent, a new eval
  case, new optional capability.
- **PATCH** — fixes that don't change behavior contracts: prompt wording
  corrections, doc fixes, a dependency bumped to a compatible range.

A dependency listed as `"engineering-paved-path@^1.0.0"` accepts any
`1.x.y` — bump the dependent plugin's own version (per the rules above)
whenever you bump the range itself, not just the pinned number.

## Tag convention

Tag a plugin release as `<plugin-name>--v<version>`, e.g.
`sdd-engineering--v1.0.0`. Use `claude plugin tag` from inside the plugin's
own directory — it validates that `plugin.json` and any enclosing
marketplace entry agree before creating the tag.

```
cd plugins/sdd-engineering
claude plugin tag --dry-run     # always dry-run first; review the output
claude plugin tag --push        # only once dry-run looks right AND you intend
                                  # to actually push a tag to a real remote —
                                  # this repo has no remote configured, so
                                  # --push is not run as part of this
                                  # extraction work
```

## Release channels

- **`stable`** — pinned to a specific commit/tag. Installers who want
  reproducible behavior point their `marketplace.json` `source`/ref at this
  channel's tag, not at a moving branch.
- **`latest`** — tracks the newest tagged release of each plugin. Installers
  who want to stay current without manual bumps use this channel, accepting
  that a new minor/patch can land without a separate opt-in.

### Mechanism actually used (since this repo is pushed to a real remote)

A dedicated **git branch named `stable`**, pushed to `origin`, currently
pointing at the same commit as every plugin's `*--v1.0.0` tag
(`1df9849`). `main` plays the role of `latest` — it moves forward with
every release (it's already past `stable`, at `sdd-engineering--v1.1.0`).

`claude plugin marketplace add <owner>/<repo>@<ref>` accepts a git ref
suffix directly on the source string (confirmed: `claude plugin
marketplace add lanasiderae/dev-digest-ai-marketplace@stable` clones at
the `stable` ref, not the repo's default branch). So:

```
claude plugin marketplace add lanasiderae/dev-digest-ai-marketplace@stable --scope project
claude plugin install sdd-engineering@dev-digest-ai-marketplace --scope project
claude plugin list --json   # confirm version: "1.0.0" for all four plugins
```

versus tracking the moving release line:

```
claude plugin marketplace add lanasiderae/dev-digest-ai-marketplace --scope project
# (no @ref ⇒ default branch ⇒ main ⇒ currently sdd-engineering 1.1.0)
```

Verified 2026-10-23 in a disposable sandbox project (not a real target
project — see Part 5/7 of `docs/sdd/l08/marketplace-task-sequence.md` for
that still-pending step): `@stable` resolved all four plugins to
`1.0.0` with no dependency-unsatisfied/range-conflict/no-matching-tag
errors.

To advance `stable` to a newer known-good release later: `git push
origin <tag-or-commit>:stable --force-with-lease` (moves the branch ref,
does not rewrite history anyone installed from).

## Rollback procedure

If a release misbehaves:

1. **Install from `stable`** instead of `latest` — that's the entire
   rollback mechanism. There is no `plugin rollback` command; don't invent
   one or script around its absence. Concretely:
   `claude plugin marketplace add <owner>/<repo>@stable` (see above).
2. If `stable` itself is the broken version, point `stable` at the last
   known-good tag (update the ref/branch it points to) rather than trying
   to "undo" the bad release in place — i.e. force-push the `stable`
   branch ref at the right commit, don't rewrite the tag.
3. Follow `docs/SECURITY.md`'s yank procedure instead of this one if the
   issue is a security exposure rather than an ordinary regression — that
   path also covers removing the marketplace listing, not just rolling
   back which version is recommended.
4. Rolling back the plugin version does **not** revert files the plugin
   already wrote in a target project (specs, plans, etc.) — that's
   separate, ordinary version control in that project, not something
   `claude plugin` manages.
