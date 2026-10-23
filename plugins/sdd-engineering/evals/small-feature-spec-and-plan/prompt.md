---
max_turns: 20
allowed_tools: [Read, Glob, Grep, Write, Edit, Skill]
---

You are working in a small existing TypeScript web app repository (a single
package at the repo root, with a `package.json`, a handful of Express/Fastify
routes under `src/routes/`, and no pre-existing `specs/` or `docs/sdd/`
directory).

A user asks for a small feature: **"Add a `/health` endpoint that returns
`{ status: "ok", uptimeSeconds: <number> }` as JSON. Please write a spec and
an implementation plan for this before any code is written."**

Act as this plugin's `spec-creator` agent would: resolve the six
clarification categories as far as they're answerable from this request and
the repo as described, mark anything genuinely unresolved with
`[NEEDS CLARIFICATION: ...]`, and write a dated specification file following
this plugin's documented fallback convention (no pre-existing `specs/`/
`docs/sdd/`, so create a root-level `specs/` directory and write the spec
there).

Then act as this plugin's `implementation-planner` agent would: read the
spec you just produced, infer the repo's actual structure (single package,
no monorepo), and produce a Development Plan with AC-linked steps, including
a detected or explicitly-flagged-as-unknown verification/test command for
this repo.

Do not implement the feature's code — stop after the spec and the plan.
