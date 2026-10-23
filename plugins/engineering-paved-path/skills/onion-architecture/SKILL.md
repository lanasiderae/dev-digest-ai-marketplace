---
name: onion-architecture
version: 1.1.0
description: "Onion Architecture for a backend's feature modules (a layout like `src/modules/<name>/`): dependency direction inside a module (routes/controller → service → repository, inward only), the prohibition on calling container adapters (external APIs/LLM/storage/secrets) or the repository directly from the routing layer, when a module needs an explicit domain split vs. when it doesn't, where ORM row types vs. validation-library contracts vs. domain shapes belong, and when a repository interface is actually worth adding. Use this whenever creating a new backend module, adding a cross-file call inside an existing module, wiring a new adapter call, deciding where a business rule belongs, or reviewing a PR for layering/coupling inside a modules/ tree. Scoped strictly to dependency DIRECTION and LAYER PLACEMENT inside a module — it does not cover web-framework plugin/route mechanics (see fastify-best-practices), ORM schema/query authoring (see drizzle-orm-patterns), schema-validation syntax (see zod), or relational schema design (see postgresql-table-design)."
---

# Onion Architecture

**Version 1.1.0** · For sources, see [README.md](README.md).

Onion Architecture's one rule: **dependencies point inward only**, enforced here via Dependency Inversion — outer layers implement interfaces the inner layers own, never the reverse ([Jeffrey Palermo](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)). Many backends already have that inversion wired up at the cross-cutting level — a DI container plus a set of adapter interfaces for external systems (a "Ports & Adapters" layer). This skill's job is the layering *inside* one feature-module folder (e.g. `src/modules/<name>/`), where a fixed file-role vocabulary (routing/controller file, service file, repository file, helpers/constants) commonly exists but the inward-call rule often isn't written down anywhere checkable.

## When to use

Use this skill when you need to:
- Create a new feature-module folder, or decide whether it needs a service/repository layer at all
- Add a call between files inside an existing module (route → service, service → repository, service → container adapter)
- Decide where a business rule or a data shape (ORM row, validation-library contract, domain shape) belongs
- Review a PR for layering, dependency-direction, or adapter-coupling issues inside a modules tree

## How to use

Read the rule files for the full picture and the citations behind it:

- [rules/layers.md](rules/layers.md) — the layers, the file-role-to-layer mapping, which modules have the full chain vs. route-only, and when a module needs more structure
- [rules/enforcement.md](rules/enforcement.md) — the checkable rules: dependency direction, the adapters-off-limits-from-routes prohibition, ORM/validation boundary placement, repository-interface threshold, named anti-patterns, and the closing decision checklist
- [examples.md](examples.md) — before/after code for every rule above, using a generic example backend's module names
- [README.md](README.md) — every source this skill is grounded in, plus how it was scoped

**Recommended reading order:**
- **Creating a new module?** → `layers.md` (structure) → `enforcement.md`'s checklist
- **Adding a call to a container adapter?** → `enforcement.md`'s "Adapters Are Off-Limits From Routes"
- **Reviewing a PR for layering?** → `enforcement.md` top to bottom, cross-checking `examples.md`

Before applying this skill to a specific repository, check that repository's own architecture documentation first (e.g. `ARCHITECTURE.md`, `docs/architecture.md`, a backend package's `AGENTS.md`/`README.md`, or its root `CLAUDE.md`/`AGENTS.md` Naming/Conventions sections) — this skill's module names and file-role vocabulary below are a common, generic shape, not a specific repo's ground truth. Where the repo's own docs state a different vocabulary or a different threshold, defer to them; apply this skill's *rules* (dependency direction, adapter isolation, ceremony-matches-complexity) to whatever vocabulary the repo actually uses.

## Severity Levels

- **CRITICAL** — Violates the dependency rule itself (an inner file reaching into an outer one, a route calling a repository or adapter directly) or collapses the Presentation/Application boundary
- **HIGH** — Doesn't break the rule today but creates a real coupling or breaking-change risk as the module grows
- **MEDIUM** — Ceremony/ergonomics judgment calls — getting these "wrong" doesn't break anything, it just adds or removes structure at the wrong time

## Guiding Principle: Match Ceremony to Complexity

Applying full Onion/Clean/Hexagonal layering to every module regardless of complexity is a **named overengineering anti-pattern**, not best practice: "if the domain complexity of your problem is fairly low (CRUD-like)... Onion/Hexagonal might not be the best choice" ([victorrentea.ro](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/)). Every rule in `rules/*.md` is a *threshold* rule — add a layer, an interface, or a type split only once a concrete trigger exists (real orchestration, an adapter call, a second implementation) — never preemptively "because the pattern says so." This is the same shape as this plugin's companion `frontend-ui-architecture` skill's "rule of two."

## Core Principles

- **Dependencies point inward, always** — a route never reaches past the service layer into the repository or a container adapter.
- **Adapters are the one thing worth protecting even in a route-only module** — a plain DB read via the container is low-risk; a direct call to an external API client, LLM provider, or payment gateway from a route is not.
- **Ceremony follows complexity, not the pattern's name** — a route-only module with no service/repository split is correctly structured, not incomplete.
- **Parse at the boundary, trust it after** — a well-set-up schema-validation convention (Zod, etc.) at the edge should already do this correctly.
- **Question every interface with one implementation** — a container's adapter interfaces earn theirs; a lone per-module repository interface usually hasn't yet.
