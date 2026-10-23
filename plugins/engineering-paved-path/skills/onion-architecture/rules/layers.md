---
name: layers
description: The Onion/Hexagonal layers a typical backend already has, and how a fixed src/modules/<name>/ file-role vocabulary maps onto them
metadata:
  tags: onion-architecture, layering, modules, dependency-injection, ports-and-adapters
---

# Layers

## The cross-cutting layer a backend commonly already has

Onion Architecture's one rule: **dependencies point inward only**. Inner layers (domain/business rules) know nothing about outer layers (databases, HTTP frameworks, external APIs); outer layers depend on and implement interfaces the inner layers define, never the reverse ([Jeffrey Palermo: The Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)).

Many backends already have that inversion wired up at the **cross-cutting** level, independent of this skill:
- A platform/DI container defines interfaces for swappable dependencies (e.g. `PaymentGateway`, `EmailSender`, `ObjectStorage`, `SecretsProvider`, …).
- An adapters layer provides the concrete implementations (a real payment-provider client, a real email-sending client, …) selected by the DI container.
- Tests swap them for mocks via a dedicated test-adapters module.

(Confirm this by reading the target repo's own `docs/architecture.md` or equivalent — don't assume it exists.)

That's textbook Ports & Adapters, and Onion Architecture is widely described as "Hexagonal plus an internal layering vocabulary" ([milanjovanovic.tech](https://milanjovanovic.tech/blog/clean-architecture-vs-onion-vs-hexagonal)). **This skill's job is the layering *inside* one `modules/<name>/` folder** — the cross-cutting adapter boundary above is not something a module author re-implements; it's the thing a module *consumes* through the container.

## The four layers, mapped onto a fixed file-role vocabulary

Many repos fix a file-role vocabulary for `src/modules/<name>/` (a routing/controller file, a service file, a repository file, helpers/constants). This skill maps that vocabulary onto Onion's layers rather than inventing new folder names — substitute your repo's actual file names if they differ (e.g. `routes.ts` might be `controller.ts` or `handler.ts` elsewhere):

| File | Onion layer | May call into |
|---|---|---|
| `routes.ts` (routing/controller) | Presentation | `service.ts` — never an adapter or `repository.ts` directly (see `enforcement.md`) |
| `service.ts` | Application | `repository.ts`, container adapters (`container.paymentGateway()`, `container.emailSender()`, …), other services via the container, pure domain logic |
| `repository.ts` | Infrastructure | the DB (via the ORM) only — nothing else in the module |
| (pure functions in `helpers.ts`, or a dedicated file once warranted) | Domain | nothing — no ORM types, no web-framework types, no adapter calls in the signature |

There is no dedicated `domain.ts`/`domain/` file in most repos' convention by default. "Domain" in this skill means a *property* a function has (framework-free, infrastructure-free), not a folder every module must grow — see the threshold below.

## Not every module has all three files, and that's correct

In a typical backend:
- Modules with genuine orchestration (e.g. an `orders` or `billing` module coordinating multiple tables/external calls) tend to have the full `routes.ts` / `service.ts` / `repository.ts` chain.
- Simple CRUD modules (e.g. `settings`, `users`-profile-fields) are often `routes.ts`-only, querying the DB directly in the handler via the container.

That split is often correct — don't "complete" a route-only module by adding empty `service.ts`/`repository.ts` wrappers that just forward calls (see `enforcement.md`'s anti-patterns). The one caveat: a route-only module that calls a **container adapter** (not just a plain DB read) directly from the handler is a gap against the rule in `enforcement.md`, whether or not it predates this skill's application to the repo — see that file for why adapter calls are treated differently from a plain DB read.

## When a module needs an explicit Domain split vs. when it doesn't

- **CRUD-like modules** — `routes.ts` alone, or `routes.ts → service.ts → repository.ts` with `service.ts` as a thin pass-through, *is* correctly structured, not incomplete. A thin `service.ts` is the cost of keeping the Presentation/Infrastructure boundary enforceable once a module needs one — it's not a smell to "simplify away" by merging it back into `routes.ts`.
- **Modules with genuine orchestration or business rules** (multi-step workflows, cost/price computation, event emission, ranking/indexing) are where pulling out **pure, framework-free logic** — functions with no ORM types, no web-framework types, and no adapter calls in their signatures — out of `service.ts`/`helpers.ts` has real payoff: that logic becomes unit-testable without mocking infrastructure, and it's the actual "Domain" Onion Architecture is named for. If a pure core library already exists in the repo (see the companion `README.md`'s scope note), re-export from it rather than re-implementing the same logic inline.
- The trigger for extracting logic is concrete and testable, not aesthetic: "is this business rule becoming hard to unit-test because testing it requires standing up a DB, a web-framework request, or a live adapter?" If yes, extract it into a plain function (it can live in `helpers.ts` if the module has no dedicated domain file yet — don't invent a `domain.ts` for one function). If no, leave it where it is.
- The same threshold applies in the other direction: a route-only module should gain a `service.ts` only once it actually needs orchestration across more than one table/call, calls a container adapter (per `enforcement.md`), or a second route handler needs to share logic that currently lives inline — not preemptively to "match" modules that have the full chain.

## Repository interfaces — when they're worth a place in the layering

A container's existing adapter pattern (interfaces for genuinely swappable cross-cutting dependencies, selected at the composition root, swapped for mocks in tests) is the model for when an interface earns a place in the layering. A single per-module `repository.ts` is *not* automatically in the same category — see `enforcement.md` for the concrete threshold before adding a `*.repository.port.ts`-style interface.
