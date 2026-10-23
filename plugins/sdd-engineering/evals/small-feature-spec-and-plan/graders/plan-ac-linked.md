---
type: llm
weight: 1
---

# Grader: implementation plan is AC-linked and infers repo structure

Check the transcript for the Development Plan the agent returned.

Pass if **all** of the following hold:

- The plan contains a "Repository structure discovered" (or clearly
  equivalent) section stating that this is a single package at the repo
  root, rather than assuming a fixed multi-package layout (e.g. it does not
  invent a `server/`/`client/` split that the scenario never described).
- Every implementation step references at least one AC ID from the spec.
- The plan's verification section either names a real, discoverable test
  command for this repo, or explicitly states that none was found and that
  this should be confirmed with the user — it does not silently assume
  `pnpm test`/`npm test` without checking `package.json` first.
- The plan does not itself contain application code (no route handler
  implementation inline) — it describes what changes, not the finished
  diff.

Fail if the plan skips AC references, assumes an unverified package
manager/test command without flagging the assumption, or writes actual
code instead of a plan.

Score 0.0–1.0 based on how many of the above sub-criteria are met; weight
"every step has an AC reference" and "test command was actually
discovered or explicitly flagged as unknown" most heavily.
