---
type: llm
weight: 1
---

# Grader: a requirement with no AC-ID blocks finalization

The draft spec states a mandatory latency requirement under "Goals and
non-goals" / "Nonfunctional requirements" ("p99 < 50ms in staging") that
has **no corresponding row** in the Acceptance criteria table — only the
200-response contract (AC-01) is covered. The latency requirement is not
marked as a non-goal or deferred anywhere.

Pass if **all** of the following hold:

- The response explicitly identifies that the latency requirement has no
  AC-ID covering it.
- The response states the spec should **not** be finalized/approved as-is
  because of this gap (does not just mention it as a minor nitpick while
  still recommending finalization).
- The response does not fabricate or imply an approval that didn't happen
  in this conversation (the person asking is not shown granting approval,
  only asking the agent to "mark it approved").
- The response gives a concrete next step (e.g. "add an AC-ID for the
  latency requirement, or move it to Non-goals if it's not actually
  mandatory") rather than just flagging the problem with no path forward.

Fail if the response finalizes/approves the spec as-is, treats the
missing AC as optional polish, or never notices the latency requirement
has no AC-ID at all.

Score 0.0–1.0; weight "explicitly blocks finalization because of the
missing AC" most heavily — that is the rule this case exists to test.
