# Onion Architecture Skill — Sources

This skill (current version: **1.1.0**, see `SKILL.md` frontmatter) was built from a four-part research pass covering: Onion Architecture's core principles and layers, its relationship to Clean/Hexagonal architecture, TypeScript/Node/Fastify/Drizzle/Zod implementation patterns, and overengineering pitfalls — synthesized into one report. It is designed to be cross-checked against a *target* repository's own architecture documentation and actual module layout, not against any one specific codebase.

The skill content is split, mirroring a `rules/` convention rather than one monolithic file: `rules/layers.md` (the structural picture — layers, file-role mapping, when a module needs more structure) and `rules/enforcement.md` (the checkable rules — dependency direction, the adapters-off-limits-from-routes prohibition, ORM/validation boundary, repository-interface threshold, named anti-patterns, decision checklist). `SKILL.md` itself is a lean index pointing at both, plus `examples.md`.

Every claim in `rules/*.md` and `examples.md` traces back to one of the sources below. Where a source is secondary (an aggregator or community blog corroborating, rather than originating, a claim) it's noted as such.

## How this skill was scoped

- **In scope**: dependency direction inside one feature-module folder, when a module needs more structure than a routing file alone, where ORM row types vs. domain shapes vs. validation-library contracts belong, and when a repository interface is worth adding.
- **Explicitly out of scope** (to avoid duplicating sibling skills in this plugin):
  - Web-framework plugin registration, hooks, route schema syntax → `fastify-best-practices`
  - ORM schema definition, query/relation authoring, migrations → `drizzle-orm-patterns`
  - Schema-validation syntax and parsing mechanics → `zod`
  - Relational column types, indexing, constraints → `postgresql-table-design`

## Sources

| URL | Title | Relevance |
|---|---|---|
| https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/ | Jeffrey Palermo: The Onion Architecture, part 1 | Primary/original source — the dependency rule, named layers, motivation |
| https://herbertograca.com/2017/09/21/onion-architecture/ | herbertograca.com: Onion Architecture | Modern restatement; explicit disagreement with Palermo on repository-interface placement; "any outer layer can call any inner layer" relaxed-call-direction point |
| https://milanjovanovic.tech/blog/clean-architecture-vs-onion-vs-hexagonal | milanjovanovic.tech: Clean vs Onion vs Hexagonal Architecture | Direct comparison of the three patterns' vocabulary and organizing axis; "Onion is Hexagonal with a layering vocabulary" framing |
| https://code-maze.com/dotnet-differences-between-onion-architecture-and-clean-architecture/ | Code Maze: Onion vs Clean Architecture in .NET | Corroborating comparison source |
| https://www.tothenew.com/blog/learn-onion-architecture-as-a-complete-beginner-and-implement-as-an-architect | tothenew.com: Learn Onion Architecture as a Complete Beginner | Four-layer breakdown (Domain/Application/Infrastructure/Presentation) |
| https://github.com/iammukeshm/OnionArchitecture | GitHub: iammukeshm/OnionArchitecture | Corroborates four-layer breakdown and "all layers depend only on core" framing |
| https://medium.com/@debasisdasnospdii/onion-architecture-an-example-folder-structure-nest-js-480ea9c6ec3a | Onion Architecture: An Example Folder Structure (Nest.js) | Node/TS folder-structure example (domain/application/infrastructure/ui) |
| https://medium.com/@myjob.rajesh/onion-architecture-in-node-js-05a475ada097 | Onion Architecture in Node.js | Node.js-specific restatement of inner-defines/outer-implements interface rule |
| https://sankhadip.medium.com/onion-architecture-in-node-js-with-typescript-5508612a4391 | Onion Architecture in Node.js with TypeScript | Additional Node/TS implementation example |
| https://github.com/marcoturi/fastify-boilerplate | GitHub: marcoturi/fastify-boilerplate | Concrete Fastify + DDD/CQRS boilerplate; per-feature vertical-slice layer contract (Route/Handler/Domain/Repository) and repository port/implementation split |
| https://medium.com/@deivisonisidoro_94304/revolutionizing-software-development-unveiling-the-power-of-clean-architecture-with-typescript-5ee968357d35 | Building Robust Clean Architecture with TypeScript | Framework-independence and unit-testability rationale for the layered split |
| https://medium.com/@pethumshayam66/mastering-backend-development-a-practical-guide-to-clean-architecture-129de1bd1306 | Mastering Backend Development: A Practical Guide to Clean Architecture | Application-layer-owns-repository-interfaces framing; auth-at-interface-layer point |
| https://medium.com/@vimulatus/repository-pattern-in-nest-js-with-drizzle-orm-e848aa75ecae | Repository Pattern in Nest.js with Drizzle ORM | Drizzle-specific repository-interface-in-application-layer guidance |
| https://www.arnaudlanglade.com/repository-design-pattern/ | arnaudlanglade.com: Repository Design Pattern | "Business operations, not database operations" naming test for repository methods |
| https://medium.com/@abied.abiad/the-repository-pattern-your-gateway-to-clean-data-c72235f34916 | The Repository Pattern: A Necessary Abstraction or Over-Engineering? | Data-source-swap rationale for the repository pattern |
| https://blog.paulserban.eu/post/drizzle-orm-best-practices-principles-patterns-and-real-world-case-studies/ | Drizzle ORM Best Practices | Drizzle's plain-TypeScript-type generation (`$inferSelect`/`$inferInsert`) as a lower-friction basis for repository mapping than ActiveRecord-style ORMs |
| https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/ | victorrentea.ro: Overengineering in Onion/Hexagonal Architectures | Primary source for the named overengineering anti-patterns (single-implementation interfaces, pass-through methods, DTO proliferation, domain/ORM duplication) and the CRUD-complexity decision rule — the backbone of this skill's "match ceremony to complexity" principle |
| https://medium.com/@gunjanmodi/is-clean-architecture-overengineering-ccca6ff34dcc | Is Clean Architecture Overengineering? | Corroborates overengineering risk for small/solo projects; converse case for complex/long-lived systems |
| https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/ | Alexis King: Parse, Don't Validate | Primary source for the parse-vs-validate distinction underlying a schema-validation library's role at a Presentation→Application boundary |
| https://dev.to/eme_gug_0821b41b948be6516/why-your-typescript-still-crashes-in-production-validating-data-at-the-boundary-with-zod-n13 | Why Your TypeScript Still Crashes in Production: Validating Data at the Boundary with Zod | Zod-specific restatement of "parse once at the boundary, trust it after" |
| https://joshkaramuth.com/blog/tanstack-zod-dto/ | Stop Trusting Your API: Zod and React Query | "DTO = schema + parse function + inferred type" framing connecting Zod contracts to the DTO concept |

## Project-local grounding (read when present in the target repo, not fabricated)

When applying this skill to a real repository, read its own architecture documentation before inferring anything — the structure below is a *generic shape*, not a specific repo's ground truth:

- A backend package's own architecture doc (`docs/architecture.md`, `ARCHITECTURE.md`, or similar) — confirms whether a DI container + adapter-interface layer (Ports & Adapters) already exists for cross-cutting concerns; this skill extends that, it should never introduce a parallel pattern.
- That package's own `AGENTS.md`/`README.md` — any existing schema-first validation convention (e.g. Zod + a typed route-validation integration) should be treated as already-correct "parse, don't validate" at the module boundary unless it says otherwise; also check for an existing integration-test pattern that may already cover most per-module repository swap needs.
- A root `CLAUDE.md`/`AGENTS.md` Naming conventions section — the actual file-role vocabulary (routing file / service file / repository file / helpers / constants) this skill's dependency rule should be applied to, if it differs from the generic names used in `examples.md`.
- The actual module folder layout (read directly) — which modules have the full routing→service→repository chain vs. routing-file-only, and whether any pure/framework-free logic is already being extracted into helpers.
- A targeted grep for direct adapter calls from route/controller files (e.g. `grep -rn "container\.\(someExternalClient\)\b" **/*routes*` or your repo's equivalent) — the concrete, in-repo evidence for whether `rules/enforcement.md`'s "Adapters Are Off-Limits From Routes" rule is already being followed, violated as pre-existing debt, or genuinely clean.

## Scope note: pure/stateless core libraries

A repository may also contain a pure, framework-free core library (no web framework, no DB access — e.g. a shared business-rule or computation engine consumed by the backend). Such a library is typically **not** covered by this skill: it has no `modules/<name>/` layout to apply the dependency-rule table to, and usually documents its own structure separately. Scope this skill to the actual feature-module tree where the file-role vocabulary and the layering question it answers apply.
