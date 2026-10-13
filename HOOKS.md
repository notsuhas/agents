# Hook ownership

Agent Backbone keeps the session-start refresh integration and launchers. Do not duplicate them in Skillshare.

Skillshare owns user-authored portable hooks. Use its native per-agent bindings: Claude and Codex event maps, OpenCode plugin code. Hook event names and timeout units remain agent-specific.

Herdr keeps ownership of its generated session/state reporting scripts and registrations. Its installer overwrites those files. Do not vendor them, relocate them, or add duplicate Skillshare registrations.

## Current audit

Checked throwbook on 2026-10-14. Skillshare has no configured hooks. Claude has Herdr session tracking and Backbone refresh; Codex has Herdr session tracking. Skillshare also reports unmanaged Cursor/OpenCode hooks. OpenCode's Herdr integration is installer-managed.

No user-authored portable hook was found to migrate. Mainbook's audit is pending: SSH to its renamed hostname timed out.

## Adding a shared hook

Store a reviewed entry definition under this repository's `hooks/` directory, including portable scripts in its `bindings.<agent>.files` or OpenCode plugin in `bindings.opencode.code`. Keep credentials and machine paths out of the definition.

On a machine, import it with `skillshare hooks add NAME --file PATH`, inspect `skillshare hooks sync --dry-run`, then run `skillshare hooks sync`. Skillshare writes only its owned outputs and preserves unrelated native hooks.

The current adapter does not automatically import a directory of hook definitions from Git. Import is explicit; future directory reconciliation must preserve local edits and hook ownership. Do not claim hook distribution across machines until that path is implemented and tested.
