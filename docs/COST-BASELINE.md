# Cost baseline

**Rows marked `TBD` are not measured.** Do not copy plausible-looking
numbers from memory, another project, or a model's general sense of "about
what this should cost" — an invented number here is worse than no number,
because it looks measured. The 1.0.0/Haiku row below *is* a real,
measured run (see provenance note after the table).

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

| Plugin version | Commit SHA | Model | Input tokens (median) | Output tokens (median) | Cache read tokens (median) | Cache write tokens (median) | API call count (median) | Tool call count (median) | Median cost (USD) | Median latency (s) | Eval pass rate (N runs) | Critical failures | Cost per successful workflow (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.0.0 (before optimization) | `0a12f42786712be57bee0002552d36d02f2123f6` | claude-haiku-4-5-20251001 | 176 | 4,463.5 | 283,509.5 | 55,355.5 | 16.5 | 6 | $0.0619 | 50 | 20% (2/10) | 0 | $0.0647 |
| 1.0.0 (after optimization) | `a35447d` (`perf: remove implementer.md's duplicated skill-list restatement`) | claude-haiku-4-5-20251001 | 172 | 4,846.0 | 281,278.5 | 50,776.5 | 16 | 5 | $0.0648 | 53 | 10% (1/10) | 0 | $0.0686 |

Add one row per plugin version you baseline. Never edit a filled-in row in
place if a later run changes the number materially — append a new row for
the new measurement date/commit instead, the same append-only discipline
`engineering-insights` uses for its own logs, so a stale number is never
silently indistinguishable from a fresh one.

### Provenance — 1.0.0 / Haiku row (2026-10-23)

- Measured via `claude plugin eval ./plugins/sdd-engineering --trust-plugin
  --ablation none --runs 10 --model claude-haiku-4-5-20251001 --allow-tools
  Write Edit --keep-temp --json <path>`, against commit `0a12f42` (the
  `fix: grant Write/Edit to the CI eval run` commit). Raw JSON kept at
  `/tmp/l08-cost-baseline/haiku-n10-fixed.json` (session-local, not
  committed).
- Token/API/tool-call counts were derived from each kept run's
  `out/trace.jsonl` (not present in the eval's own JSON summary), parsed
  for `usage` fields and `tool_use` content blocks.
- Median cost/cost-per-successful-workflow above combine agent cost
  (`costUsd`) + judge cost (`judgeCostUsd`); total spend across all 10
  runs was $0.636.
- **Gotcha carried forward:** an earlier run attempt (N=10, Sonnet,
  without `--allow-tools Write Edit`) produced a 0% pass rate across all
  10 runs because every run's `spec-written` grader failed — not because
  the model couldn't do the task, but because `Write`/`Edit` were never
  granted, so the agent could only narrate the spec/plan in chat instead
  of writing the file the grader checks for. That data was discarded as
  invalid, not recorded above. Always pass `--allow-tools Write Edit`
  when running this eval case manually — CI's `validate.yml` already does
  (fixed in the same commit this baseline measures).
- **Real finding, not a tooling artifact:** even with tools correctly
  granted, Haiku's pass rate is 20% (2/10) — `spec-written` is the
  grader that most often fails (file written but missing required
  AC/EARS content, or written with a claimed approval that never
  happened), not `plan-ac-linked`. This is the actual current-commit
  baseline to compare an optimization against, not an artifact to
  re-run away.

### Quality gate — optimization applied 2026-10-23

**Optimization:** `perf: remove implementer.md's duplicated skill-list
restatement` (commit `a35447d`) — `implementer.md`'s Hard-rules bullet
re-enumerated the same skill-name list already in its own frontmatter
`description`; collapsed to a pointer, removing ~90 words of literal
self-duplication. No model or routing change in the same pass, per the
methodology's own rule, so this delta is attributable to the prompt
change alone.

Re-ran the identical N=10/Haiku/`--allow-tools Write Edit` methodology
against `a35447d`:

| Metric | Before | After | Delta |
|---|---|---|---|
| Median cost | $0.0619 | $0.0648 | +4.7% (worse) |
| Median latency | 50s | 53s | +6% (worse) |
| Median cache-write tokens | 55,355.5 | 50,776.5 | −8.3% (better) |
| Eval pass rate | 20% (2/10) | 10% (1/10) | −10pp (worse) |
| Cost per successful workflow | $0.0647 | $0.0686 | +6% (worse) |
| Critical failures | 0 | 0 | unchanged |

**Verdict: no measurable win — reporting plainly rather than claiming
one.** `implementer.md` isn't even in this eval case's execution path for
`spec-creator`/`implementation-planner` (the edited agent's Hard-rules
bullet only applies when `implementer` itself runs, which this fixed
scenario explicitly stops short of — "Do not implement the feature's
code — stop after the spec and the plan"), so a flat-to-slightly-worse
result end to end is expected, not surprising: the cache-write token drop
confirms the prompt itself did shrink, but that savings never had a path
to reach this particular eval case's cost/latency/pass-rate numbers. The
pass-rate delta (2/10 → 1/10) is one run's difference on a small, noisy
N and should not be read as a regression caused by the change — the
spec-creator/implementation-planner prompts, which actually run in this
scenario, were untouched.
**Quality gate (per the brief):** existing evals still pass at the same
rate class (no new critical failures, 0 → 0); cost/latency did not
measurably drop; cost-per-successful-workflow is recorded both before
and after. Since cost/latency didn't drop, this optimization does not
clear the bar to ship on cost grounds alone — it's net-neutral token
hygiene (real, but not a performance win), kept because it's correct on
its own (removes genuine duplication) not because it reduced cost.
