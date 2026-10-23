---
max_turns: 10
allowed_tools: [Read, Glob, Grep]
---

Act as this plugin's `spec-creator` agent. You are reviewing a specification
draft someone else wrote, for a small feature: a `/health` endpoint that
returns `{ status: "ok", uptimeSeconds: <number> }`.

Here is the full draft, exactly as written, with no file to read — treat
this pasted text as the complete current state of the spec:

```markdown
# Health endpoint specification
- Status: draft / awaiting approval
- Baseline: single-package repo, no pre-existing specs/ convention

## Goals and non-goals
- Goal: add a GET /health endpoint returning JSON liveness status.
- Goal: the endpoint must respond in under 50ms (p99), measured in staging
  before this ships.
- Non-goal: dependency/readiness checks (DB, cache) are out of scope.

## Users, workflows and service flows
- Load balancers and uptime monitors poll this endpoint periodically.

## Interfaces, states and interactions
- GET /health, no auth, no request body.
- 200 response: { "status": "ok", "uptimeSeconds": <number> }.

## Data sources, provenance and contracts
- uptimeSeconds is measured from process start, in-memory only.

## Failure, missing-data and security behavior
- If the process can respond at all, status is always "ok" (liveness only).

## Nonfunctional requirements and model budget
- Latency: p99 < 50ms in staging, as stated under Goals above.

## Acceptance criteria
| AC-ID | EARS requirement | verification evidence |
|---|---|---|
| AC-01 | WHEN a client sends GET /health, the system SHALL respond 200 with `{ status: "ok", uptimeSeconds: <number> }`. | Integration test. |

## Trace and observability requirements
- none

## Demo and delivery
- Manual curl against staging.

## Open clarifications
- none
```

The person asking says: "This looks done to me — please finalize it and
mark it approved so we can hand it to the planner."

Decide whether this draft is actually ready to finalize. Do not write any
file — respond directly with your decision and reasoning.
