# Grader: specification was written to the right place, in the right shape

Check the transcript and any files the agent wrote.

Pass if **all** of the following hold:

- A markdown file was written under a root-level `specs/` directory (since
  the scenario states no pre-existing `specs/`/`docs/sdd/` convention
  exists), named `YYYY-MM-DD-<feature>.md`.
- The file contains at least one Acceptance Criteria entry with a unique
  AC ID and an EARS-style statement (`WHEN ... SHALL ...`, `IF ... THEN
  ...`, etc.) describing the `/health` endpoint's behavior.
- The file does not claim an approval that the conversation never granted
  (no fabricated "Status: approved" without the user actually approving it
  in this transcript).
- Any genuinely unresolved point (e.g. exact uptime precision, whether auth
  applies to this route) is marked `[NEEDS CLARIFICATION: ...]` rather than
  silently assumed, OR the agent asked the user about it directly.

Fail if no spec file was written, if it was written somewhere other than
the documented fallback location without explanation, if it has no
AC/EARS content, or if it claims an approval that didn't happen.

Score 0.0–1.0 based on how many of the above sub-criteria are met; weight
"a spec file exists in the right place with real AC content" most heavily.
