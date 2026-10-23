# Cost baseline — template

**This document is a template only. No numbers below are measured.** Every
row is `TBD` until someone actually runs the methodology described below
and fills it in. Do not copy plausible-looking numbers from memory, another
project, or a model's general sense of "about what this should cost" — an
invented number here is worse than no number, because it looks measured.

## Methodology

- **Scenario:** the fixed SDD scenario defined in
  `plugins/sdd-engineering/evals/small-feature-spec-and-plan/prompt.md` — a
  user requests a specification and an implementation plan for a small,
  well-defined feature (a health-check endpoint) in a small single-package
  repo with no pre-existing `specs/`/`docs/sdd/` convention.
- **Run count:** run the scenario **N = 10** times per plugin
  version/commit under test, via `claude plugin eval sdd-engineering`
  (or a pinned commit/tag of it), on a clean scaffold each time (the
  `eval` command's own sandboxing handles this). Ten runs is enough to see
  variance without the baseline-collection effort itself becoming a
  multi-day project; increase N for a release candidate if the first 10
  runs show high variance (e.g. pass rate swinging by more than ~20
  percentage points run-to-run).
- **What counts as a "successful workflow":** both fixed-scenario graders
  (`spec-written.md`, `plan-ac-linked.md`) score at or above the threshold
  the eval run reports as "pass" for that case, **and** the run completed
  without an unhandled error, timeout, or cost-ceiling abort. A run that
  produces a spec/plan but fails either grader counts as a completed-but-
  unsuccessful workflow, not a successful one — don't average in partial
  credit when filling in "cost per successful workflow" below.
- **Cost/latency source:** the JSON report from
  `claude plugin eval sdd-engineering --json results.json` for each run —
  read `usage`/`total_cost_usd`/timing fields from that file rather than
  re-deriving them by hand. Record cache-read/cache-write tokens
  separately from fresh input tokens; don't collapse them into one number.

## Baseline table

| Plugin version | Commit SHA | Model | Input tokens (median) | Output tokens (median) | Cache tokens (median) | API call count (median) | Tool call count (median) | Median cost (USD) | Median latency (s) | Eval pass rate (N runs) | Critical failures | Cost per successful workflow (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.0.0 | TBD — fill in after running the fixed SDD scenario N times | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

Add one row per plugin version you baseline. Never edit a filled-in row in
place if a later run changes the number materially — append a new row for
the new measurement date/commit instead, the same append-only discipline
`engineering-insights` uses for its own logs, so a stale number is never
silently indistinguishable from a fresh one.
