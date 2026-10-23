# Contributing

This marketplace holds four plugins under `plugins/<name>/`. A new
contributor should be able to find where everything goes from this file
alone — don't make someone ask.

## Plugin structure

Every plugin directory looks like this:

```
plugins/<name>/
├── .claude-plugin/plugin.json   (required — see "Manifest fields" below)
├── agents/*.md                  (optional — Claude Code subagent definitions)
├── skills/<skill-name>/SKILL.md (optional — skill directories, one per skill)
├── commands/*.md                (optional — slash commands, if a plugin adds any)
├── evals/                       (optional, required for sdd-engineering — see its manifest)
├── README.md                    (what the plugin does, install command)
├── CHANGELOG.md                 (every plugin should have one once it ships a change)
└── COMPATIBILITY.md             (Claude Code version floor, dependency notes)
```

`skills/` and `agents/` are auto-discovered by directory convention — you
do **not** need to list every skill/agent path inside `plugin.json`.

## Manifest fields (`plugin.json`)

Required:
- `$schema` — `https://anthropic.com/claude-code/plugin.schema.json`
- `name` — kebab-case, matches the plugin's directory name
- `version` — semver (`MAJOR.MINOR.PATCH`)
- `description` — one sentence, specific enough that `scripts/build-index.mjs`
  can show it verbatim in the site's search index

Optional:
- `author` — `{ "name": "..." }`
- `keywords` — array of strings, used by the site's search index
- `dependencies` — **array of strings**, each `"<plugin-name>@<semver-range>"`
  (confirmed via `claude plugin validate`; an object/map shape is rejected).
  Only list another plugin **in this marketplace** here — never a
  `plugin@marketplace` id pointing outside it, since this marketplace isn't
  published anywhere a resolver could reach it.

## Dependency rules

- A plugin that uses another plugin's skill or agent *must* declare that
  dependency in `plugin.json` — don't rely on "it'll probably be installed
  anyway."
- Reference a dependency's component with its fully-qualified namespaced
  name: `engineering-paved-path:react-best-practices`,
  `research-tools:researcher`, `architecture-review:architecture-reviewer`.
  A bare `researcher` inside `sdd-engineering` would be ambiguous once more
  than one plugin can define an agent by that name.
- Keep the dependency graph a DAG. Today: `architecture-review` depends on
  `engineering-paved-path`; `sdd-engineering` depends on all three others.
  Neither `engineering-paved-path` nor `research-tools` depends on anything.
- Don't duplicate another plugin's instructions into yours "just in case."
  If two agents (in the same or different plugins) need the same guidance,
  that's a sign that guidance belongs in a skill both can load, not copied
  prose in each agent's own `.md` file.

## Path references inside manifests/prompts

- Inside `plugin.json` or an agent's `.md` prompt, reference a file that
  ships with the plugin via `${CLAUDE_PLUGIN_ROOT}`, never a path assuming
  a specific install location.
- Inside a skill's own script (e.g. a Python helper under
  `skills/<name>/scripts/`), reference the skill's own directory via
  `${CLAUDE_SKILL_DIR}`, never a path hardcoding `.claude/skills/<name>/...`.
- Never put an absolute filesystem path, a secret, or a credential in any
  manifest or prompt file — see `docs/SECURITY.md`.

## Validation commands

Run these before opening a PR:

```
claude plugin validate ./plugins/<name>        # one plugin
claude plugin validate .                        # the marketplace manifest
claude plugin tag --dry-run                     # from inside plugins/<name>/, never --push in this repo
claude plugin eval <name>                       # if the plugin ships evals/ (sdd-engineering does)
node scripts/build-index.mjs                    # regenerates site/public/*.json — run after any manifest/README/CHANGELOG change
```

## PR checklist

- [ ] `plugin.json` version bumped if any plugin content changed (see
  `docs/RELEASES.md` for semver rules)
- [ ] `CHANGELOG.md` entry added for the bumped version
- [ ] `claude plugin validate` passes for every plugin you touched, and for
  the marketplace root if `marketplace.json` changed
- [ ] No absolute paths, secrets, or credentials introduced (grep your diff)
- [ ] If you added/changed a dependency, the dependency array uses
  `"name@range"` strings and the graph is still a DAG
- [ ] `node scripts/build-index.mjs` run and `site/public/*.json` regenerated
  if manifest/README/CHANGELOG content changed
- [ ] If you touched `site/`, `npm install && npm run build` inside `site/`
  still succeeds
