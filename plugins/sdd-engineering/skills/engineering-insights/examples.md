# Examples: vague vs. useful

Each pair shows the same underlying discovery written two ways. The vague
version restates a general truth a reader already knows; the useful version
names the concrete trigger and the fix, so a future session can act on it
without re-deriving it. Each heading also notes which package's
`INSIGHTS.md` the example would actually land in, using a generic example
backend/frontend split (`api/`, `web/`, `core/`) rather than any one
specific repository's package names — substitute your repo's actual
packages when applying this.

## What Works — `api/INSIGHTS.md`

Vague:
> Promises can be tricky in pipelines.

Useful:
> Batch `Promise.allSettled()` in groups of 10 for the order-ingest loop —
> `Promise.all()` over the full order list times out past ~30 items
> (`api/src/modules/orders/run-executor.ts`).

## What Doesn't Work — `api/INSIGHTS.md`

Vague:
> Watch out for async issues in tests.

Useful:
> A test importing `test/helpers/pg.ts` but not named `*.it.test.ts` lands
> in the unit CI lane and silently never runs against real Postgres — no
> failure, no warning. Always suffix `.it.test.ts` for DB-backed tests (see
> `api/AGENTS.md` Gotchas).

## Codebase Patterns — `api/INSIGHTS.md`

Vague:
> We decided to keep things simple for now.

Useful:
> Cost-per-run tracking is deliberately absent from the billing module —
> only unit pricing is stored. Usage metering doesn't exist yet, and a
> half-implemented cost field would look authoritative while being wrong.
> Revisit once usage metering lands (see commit `d45ab0d`).

## Tool & Library Notes — `api/INSIGHTS.md`

Vague:
> Be careful with Zod and Fastify together.

Useful:
> `fastify-type-provider-zod` route schemas default to stripping unknown
> keys silently instead of 422ing — a client's typo'd field name (e.g.
> `serverity` for `severity`) just vanishes instead of erroring. Add
> `.strict()` to any object schema where a silently-dropped field would be
> dangerous to miss.

## Recurring Errors & Fixes — `api/INSIGHTS.md`

Vague:
> Zod schemas can be tricky with optional fields.

Useful:
> `PATCH /orders/:id` silently accepted `{}` and no-opped instead of
> 400ing — the Zod schema had every field `.optional()` with no
> `.refine()` requiring at least one key. Fixed in
> `api/src/vendor/shared/contracts/orders.ts`.

## Session Notes (`### YYYY-MM-DD`) — `core/INSIGHTS.md`

Vague:
> ### 2026-09-25
> Worked on the pricing engine, fixed some bugs.

Useful:
> ### 2026-09-25
> The pricing core's grounding gate rejected a result whose quoted input
> had trailing whitespace the source didn't — the gate compares raw
> substrings, not trimmed. Not a bug in the gate; the caller needs to
> normalize whitespace before passing data in, not after.

## Open Questions — `api/INSIGHTS.md`

Vague:
> Not sure if this is the best approach long-term.

Useful:
> A feature flag degrades silently to a reduced-context mode when a
> dependency isn't warmed up yet (by design, per `api/AGENTS.md`) — open
> question: should the UI surface *that* a request ran in degraded mode, so
> a user doesn't mistake missing context for the system having checked and
> found nothing?
