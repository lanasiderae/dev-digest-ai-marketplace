# Plugin guidelines: classification

Every file considered for extraction from the source course project
(`dev-digest-ai/.claude/`) falls into one of four categories. This document
records which category each extracted (or deliberately excluded) file fell
into, and why — so a future contributor can tell "generalized on purpose"
from "forgot to check."

## The four categories

1. **Reusable** — framework/practice knowledge that applies to any
   TypeScript web app repo, independent of the source product. Extracted
   faithfully, with only stray product-specific paths/names stripped.
2. **Project-specific** — content whose *rules* are reusable but whose
   *content* assumed one repo's fixed module names, tool names, or file
   layout. Extracted with the assumptions rewritten to be discovered at
   run time rather than hardcoded.
3. **Optional integrations** — content that calls out to a specific
   external system (an MCP tool, a specific product's API) that most
   target repos won't have. Either generalized to work without that
   integration, or excluded if the content has no meaning without it.
4. **Local artifacts** — content whose entire value is specific to the
   source repository's own state (a dated spec for a feature only that
   product has, a product-specific review gate hardcoding that repo's own
   skill catalog). Excluded — there is nothing to generalize because the
   content *is* the product-specific detail.

## Classification by file

### `engineering-paved-path` plugin

| Source | Category | Decision |
|---|---|---|
| `react-best-practices/`, `next-best-practices/`, `fastify-best-practices/`, `drizzle-orm-patterns/`, `postgresql-table-design/`, `zod/`, `typescript-expert/`, `security/`, `mermaid-diagram/`, `react-testing-library/` | Reusable | Copied verbatim. Scanned for DevDigest/path references — none found. |
| `frontend-ui-architecture/` | Reusable, with light Project-specific residue | Copied, then edited: `rules/layout.md` and `rules/conventions.md` had 4 lines reading "In this repo: `client/AGENTS.md` states..." / "this repo's client does... see `client/docs/ui-architecture.md`" / "reinforces root `CLAUDE.md`'s... for this repo" — rewritten to describe the *pattern* generically and say "check the target project's own docs if present" instead of asserting DevDigest's own files exist. |
| `onion-architecture/` | Project-specific (heaviest case) | This skill's `SKILL.md`, `README.md`, `examples.md`, and both `rules/*.md` files were written entirely around DevDigest's own module names (`settings`, `reviews`, `polling`, `pulls`, `repos`, `repo-intel`), its container adapter names (`container.github()`, `container.llm()`), and direct citations of `server/docs/architecture.md`/`server/AGENTS.md`/root `CLAUDE.md`. Fully rewritten: generic module names (`orders`, `billing`, `settings`), generic adapters (`container.paymentGateway()`, `container.emailSender()`), and a new "Project-local grounding" section in `README.md` telling the agent to read *the target repo's own* architecture docs rather than assuming DevDigest's. All external research citations (Palermo, herbertograca.com, victorrentea.ro, etc.) were kept — those are genuine, product-independent sources. |

| `pr-self-review/` | **Excluded per instructions** (Local artifact) | Not pulled into any plugin, per the task's explicit instruction — it hardcodes this repo's own skill catalog as a routing table and has no meaning as a generic component. Its *idea* (match changed files to skills by the skills' own trigger descriptions, then gate on severity) survives in generalized form inside `sdd-engineering`'s `implementer`/`implementation-planner` agents, which select skills by matching file patterns against installed skills' own descriptions instead of copying a static table — but the skill file itself stays behind. |

### `research-tools` plugin

| Source | Category | Decision |
|---|---|---|
| `agents/researcher.md` | Reusable | Already read-only and generic in the source (its tool list had no DevDigest-specific MCP tools to strip). Minor generalization: removed a hardcoded reference to invoking "`/deep-research`" by name (that's a specific external skill DevDigest's own session happened to have, not something this plugin can assume exists) in favor of "a deep-research skill/tool, if the invoking session provides one." |

### `architecture-review` plugin

| Source | Category | Decision |
|---|---|---|
| `agents/architecture-reviewer.md` | Project-specific (hard acceptance criterion) | The source prompt asserted DevDigest's own layering as ground truth: "server onion layering," "reviewer-core purity," literal mentions of `reviewer-core`, `@devdigest`, `server/src/modules`. Rewritten with a new "Step zero: find the repository's own architecture rules" section that reads `ARCHITECTURE.md`/`docs/architecture.md`/package `AGENTS.md`/root `CLAUDE.md` *at review time*, falls back to asking rather than assuming, and applies the companion skills' general *principles* to whatever module names the target repo actually has. Verified by `grep -rliE "reviewer-core|@devdigest|server/src/modules"` against the final file — zero hits. |

### `sdd-engineering` plugin

| Source | Category | Decision |
|---|---|---|
| `agents/spec-creator.md` | Project-specific | Removed the hardcoded "Current L05 target: `specs/2026-10-22-l05-context-brief-onboarding.md`" line (a dated, product-specific in-progress task) and the four `mcp__devdigest__*` read-only tools (no generic equivalent exists outside the source product, so they're simply dropped — the agent now relies on `Read`/`Grep`/`Glob`/repo inspection for repository facts). Added an explicit "Where to write the spec" section defining the fallback convention (existing `specs/`→ existing `docs/sdd/` → create root `specs/`) for a target repo with no pre-existing convention, since the source prompt only ever operated inside a repo that already had one. |
| `agents/implementation-planner.md`, `agents/implementer.md` | Project-specific | Removed the hardcoded "server/client/reviewer-core/e2e" module list and the literal, duplicated "File → skill matching table" (copied from the excluded `pr-self-review` skill in both agents in the source). Replaced with "match the touched files against each *installed* skill's own trigger description" — this both generalizes the rule and removes the duplication the task's requirement 10 flagged (two agents no longer carry two independent, driftable copies of the same table). Added explicit test-command discovery behavior (read `package.json` scripts / build-tool config; never assume `pnpm`/`npm test`; ask or flag "none found" otherwise) since the source assumed a fixed two-package-manager split that only applies to the source repo. |
| `agents/plan-verifier.md` | Reusable | Already had no DevDigest-specific module/tool assumptions in the source. Copied with small wording generalizations (e.g. "existence-only paths like lockfiles, `dist/`, `.next/`, and `INSIGHTS.md`" → described generically as build-output/log-artifact paths) and an explicit note that it carries no built-in package-layout assumption. |
| `skills/run-plan/` | Reusable | Minor rewording only — referenced `plan-verifier`/`spec-creator`/`implementation-planner` by their (unchanged) same-plugin names, and the cross-plugin `architecture-reviewer` reference was namespaced to `architecture-review:architecture-reviewer`. |
| `skills/engineering-insights/` | Project-specific | The source hardcoded "server → `server/INSIGHTS.md`, client → `client/INSIGHTS.md`, reviewer-core → ..., e2e → ..." as a fixed four-package table. Rewritten so the skill *documents the convention* (one `INSIGHTS.md` per discovered top-level package, root `INSIGHTS.md` for cross-package findings) and discovers the actual package list from the target repo's workspace config/top-level folders, deferring to the repo's own documented convention if it states something different. `examples.md` was rewritten from DevDigest-specific examples (naming `reviewer-core`'s grounding gate, `REPO_INTEL_ENABLED`, specific DevDigest file paths) to a generic `api/`+`web/`+`core/` example split, preserving the same vague-vs-useful teaching structure. |
| `skills/workflow-retro/` | Reusable, with one path fix | The skill content itself (manual retro process, usage-report parser) was already generic. Fixed one hardcoded invocation path in `SKILL.md` (`.claude/skills/workflow-retro/scripts/usage-report.py` → `${CLAUDE_SKILL_DIR}/scripts/usage-report.py`) per the task's explicit requirement 7. The Python script itself took its log paths as CLI arguments already and had no hardcoded paths to fix. |
| `evals/small-feature-spec-and-plan/` | New (not extracted) | Written fresh for this plugin — the source repo had no `claude plugin eval`-shaped eval suite to extract. Covers the brief's fixed scenario with a `prompt.md` + two `graders/*.md` files. |
