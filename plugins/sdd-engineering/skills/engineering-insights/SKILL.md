---
name: engineering-insights
description: Captures non-obvious engineering insights in the touched package's INSIGHTS.md, as a per-package convention this skill documents and applies rather than a fixed list of package names. Use when a reusable gotcha, working approach, dead-end, codebase pattern, recurring error/fix, or open question surfaces, and again at session wrap-up. Reads existing findings first, avoids duplicates, writes only actionable file-grounded entries, and is strictly append-only.
---
# Engineering Insights

## Qualification

Write only findings that match one of these. See `examples.md` for vague-vs-useful examples:

1. **Dead-end / antipattern** — a reasonable approach failed and why.
2. **Meaningful complexity** — a non-obvious codebase behavior, convention,
   dependency, or architectural constraint.
3. **Gotcha** — surprising behavior that required investigation to discover.
4. **Working approach** — a non-obvious successful approach worth repeating.
5. **Open question** — an unresolved issue worth continuing later.

Reject findings that are:

- obvious from the code or existing docs;
- trivial or specific only to the current session;
- vague or unactionable;
- already captured in the relevant `INSIGHTS.md`.

A finding must make sense without session context. Include the trigger,
rule/fix, and evidence when available (`file:line`, command, error text,
test result).

If nothing qualifies, make no file changes.

## Target File — a convention this skill applies, not a fixed package list

This skill assumes **"each package gets its own `INSIGHTS.md`, at that
package's root"** as its default convention — it does not hardcode any
specific repo's package names. To route a finding:

1. Determine the repo's actual top-level packages: a workspace config
   (`pnpm-workspace.yaml`, npm/yarn `workspaces`, a monorepo tool config),
   or — for a non-monorepo — the single package at the repo root.
2. Route the finding to `<package>/INSIGHTS.md` for the package it
   concerns.
3. Use a root `INSIGHTS.md` only when a finding does not belong to one
   package — e.g. `.claude/` configuration, root-level tooling, a
   cross-package convention, or CI-wide behavior.
4. For sessions spanning packages, split findings by package rather than
   writing one combined entry.

If the repo already documents a different `INSIGHTS.md` convention (a
different file name, a different location, or no per-package split at all)
in its own root `CLAUDE.md`/`AGENTS.md`, follow the repo's own documented
convention instead of this skill's default — state which one you're
following when you report back.

Do not read or modify unrelated packages' `INSIGHTS.md` files.

If a target file does not exist, create it only when a finding qualifies.

## Sections

Use exactly these sections for new entries:

- `## What Works` — working approach
- `## What Doesn't Work` — dead-end / antipattern
- `## Codebase Patterns` — meaningful complexity
- `## Tool & Library Notes` — third-party tool/dependency gotcha
- `## Recurring Errors & Fixes` — code error/bug and its fix
- `## Session Notes` — qualifying finding that fits no section above
- `## Open Questions` — unresolved question

`Session Notes` is not a session summary. Entries there must still qualify.
Group them under `### YYYY-MM-DD`.

Add only missing sections required by the current findings. Append new section
headings after existing content.

Never rename, reorder, or remove existing headings.

A repo's `INSIGHTS.md` may already contain legacy or differently-named
headings from before this skill was adopted (e.g. `## Findings` or
`## Open decision: ...`). Leave them untouched and never add new entries
under them.

## Entry Format

Append one bullet under the matching `##` section:

```md id="x7w2kx"
- **YYYY-MM-DD** — <problem / behavior> → <action / rule>. Evidence: `path/file.ts:NN`.
```

Use other concrete evidence when a file/line is not applicable, such as a command,
error string, test result, or commit.

Keep each entry to 1–3 lines and understandable without the original session.

For `Session Notes`, group entries under a dated subheading:

```md id="zg7nfb"
### YYYY-MM-DD
- <qualifying session-specific finding or decision>
```

`Session Notes` is for useful context worth carrying forward that does not yet
establish a reusable rule or fit another section. Do not use it as a general
session summary.

## Constraints

- Append only. Never edit or delete existing entries.
- If an existing entry is wrong or stale, append a correction referencing it.
- If existing entries conflict, do not choose one silently; report the conflict.
- Do not duplicate existing insights or behavior already documented elsewhere.
- If new evidence only reinforces an existing insight, add at most a short
  cross-reference instead of restating it.

## Process

1. Review the conversation and diff for qualifying candidates.
2. Determine the repo's actual package layout (see "Target File" above) and
   assign each candidate to its target `INSIGHTS.md`.
3. For each target with candidates, read:
   - the complete target `INSIGHTS.md`, if it exists;
   - that package's own `AGENTS.md`/`README.md`;
   - relevant package docs.
   For root candidates, read relevant root `AGENTS.md`/`CLAUDE.md`,
   `README.md`, and repo-wide docs.
4. Drop candidates that fail qualification or are already documented.
5. If nothing survives, make no changes and report that nothing qualified.
6. Map each surviving finding to one canonical section.
7. Create the target file if needed, append missing required sections, then
   append entries without changing existing content.
8. Report additions grouped by file and section, plus any conflicts found.
