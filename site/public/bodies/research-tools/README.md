# research-tools

A read-only `researcher` subagent for investigating a specific, bounded
question — either inside the current repository (code, docs, config, git
history) or externally (web pages, docs, APIs) — and returning a
structured, evidence-cited findings report. No dependencies.

The agent has no Write/Edit capability and never mutates git or filesystem
state; it asks for a narrower scope before researching if the request is
too open-ended to know when it's "done."

## Install

```
/plugin install research-tools@dev-digest-ai-marketplace
```
