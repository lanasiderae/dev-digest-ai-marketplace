# Security

## Prohibited in any plugin file

No plugin in this marketplace (`plugin.json`, any agent/skill `.md`, any
script under `skills/*/scripts/`, any eval `prompt.md`/`graders/*.md`) may
contain:

- **Secrets of any kind** — API keys, tokens, passwords, connection
  strings, webhook URLs with embedded credentials. If an agent needs a
  credential at runtime, it reads it from the environment or the host's
  own secret-storage convention — never hardcoded, never checked in, never
  requested from the user and then written to a file.
- **Absolute filesystem paths.** Every path reference inside a manifest or
  prompt must be relative to the plugin (`${CLAUDE_PLUGIN_ROOT}`) or the
  skill (`${CLAUDE_SKILL_DIR}`) — never `/Users/...`, `/home/...`, or any
  other machine-specific absolute path. An absolute path baked into a
  shipped plugin is also a privacy leak (usernames, directory structure).
- **A hardcoded assumption that a specific external system is reachable**
  without a documented opt-in — e.g. a script that silently calls out to a
  specific SaaS API by default. Any such call must be gated behind an
  explicit flag/tool the installer has to wire up.

## Review expectation

Every PR touching a plugin's shipped files gets scanned (`grep -rn` for
common secret patterns, `grep -rn '/Users/\|/home/'` for absolute paths) as
part of the checklist in `CONTRIBUTING.md`, before merge — not just at
release time.

## If an unsafe release is found after shipping

1. **Yank it.** Remove the affected version's entry from
   `.claude-plugin/marketplace.json` (or point the affected plugin's
   `source` at a known-safe prior commit/tag) so new installs can't pick it
   up. Don't silently force-push history — add a new commit that reverts
   the exposure and makes that explicit in the message.
2. **Publish an advisory.** Add a dated entry to this file's "Advisories"
   section (below) stating what was exposed, which version(s), and what an
   installer who already pulled the bad version should do.
3. **Rotate anything exposed.** If a real secret was ever committed (even
   briefly), treat it as compromised — rotate it at the source, don't just
   delete it from git history and consider the matter closed.
4. **Tag the fix.** Release a new patch/minor version (per
   `docs/RELEASES.md`) once the exposure is fully removed, and reference
   the advisory from that version's `CHANGELOG.md` entry.

## Advisories

_(none — this section is appended to, never rewritten, the same way
`engineering-insights`-style logs work: each new advisory is a new dated
entry, nothing here is ever edited away.)_
