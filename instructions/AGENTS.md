# Working with this user

Be terse. Lead with the point; include only the detail needed to understand or act.
Use human-writing in the main thread and subagents for all outward-facing text
drafted on the user's behalf,
including messages, docs, commits, and PRs. Read the skill before drafting.

A “why isn't X like Y?” question asks for an explanation, not an automatic edit.
Explain first; ask one focused question only if the intended action is unclear.

## Execution and delegation

Work directly when the task is clear and the tools are available. Delegate only
for a clear benefit: independent work, large context, specialist review, or a
requested workflow. Give a narrow scope, verify the result, and own integration.
Missing subagents must not block useful work. Use the live harness model catalog;
keep model routing and review-gate configuration in the harness or project.

Preserve existing work and user instructions. Keep credentials and private
context out of public repositories. Verify actual behavior before claiming done;
state material limits plainly. Respect disabled skills and per-agent exclusions,
including when reading source caches or following sibling references.

## Git and external actions

- Commit, push, and PR creation/edit/comment each require explicit authorization.
  Existing authorization can cover a stated sequence; do not ask again for it.
  Otherwise, edit and verify, summarize the diff, then wait before those actions.
- An upstream PR also needs explicit approval and runtime/on-device verification.
  Apply and rebuild a candidate dependency fix locally, capture evidence that the
  symptom is gone, then seek approval to raise it. Failed verification means no PR.
- After pushing, stay on the branch and check `git branch -vv` tracks its own
  `origin/<branch>`. Correct inherited parent tracking when necessary.
- Use Conventional Commits for commits and PR titles:
  `<type>[optional scope][!]: <description>`. Check before creating/updating;
  use `!` and a `BREAKING CHANGE:` footer for breaking changes. Squash messages
  follow the same rule.
- PR descriptions use plain text. Name a plan when useful; omit plan/tree links
  unless asked. Drafting a message does not authorize sending it.

## Code shape

- Keep comments to one line, including JSDoc and workaround explanations. If a
  workaround needs a paragraph of defense, reconsider the code. Never restore a
  comment the user deleted; apply their trimming standard throughout the diff.
- No IIFEs for branch dispatch. Extract a module-level pure function with an
  exhaustive return type instead.
- Derive UI status/capabilities/gates through pure functions beside their model,
  with one compact meaningful test of the cases. Hooks wrap those derivations.
- Repeated OS/state decisions belong in one shared model and one synchronization
  point. Consumers read derived state. Session flags belong in shared state,
  not remounting refs; avoid per-feature foreground listeners for the same state.
- Omit optional falsy fields in discriminated returns; retain discriminants and
  fields required for type safety.
- Export only symbols consumed across files. Internal helpers/types stay private.
- Short-lived developer toggles are plain exported boolean constants; avoid
  persisted flags and debug UI unless QA needs runtime control.
- Upgrade monorepos by workspace vertical slices. A shared dependency floor bump
  is fine; handle its consequences within the affected workspace slice.

## Dependencies and verification

Read the relevant dependency source before adding an app workaround. Reproduce
and trace the failure, look for an upstream fix, and backport it using the
project's patch mechanism (including native code). Rebuild and verify on device
when affected. Record when the patch can be removed on upgrade.

If no usable upstream fix exists, prefer disabling the offending feature/flag;
app-level mitigation is the last resort. Preserve the upstream PR approval and
verification gates above; a source-level theory is not runtime evidence.

## UI and React conventions

- Wire screens through real navigation and real selectors/state for visual
  testing. Cover every handoff artboard, including secondary screens, and provide
  a manual walkthrough. Sheets default closed and require explicit open state.
- A structural redesign changes navigation/panes/IA first; do not just retoken
  existing components. Avoid global button press scale transforms.
- Interfaces use `I<Name>`, never `I<Name>Props`.
- React components take a typed `props` parameter and destructure in the body,
  not the signature.
- Literal colors use `rgba(...)`, including SVG and gradients. Named design
  tokens are fine; no new hex literals.
- Check the project's installed APIs and use supported replacements for
  deprecations, including deprecated calls in code being touched.

## React Native

Each RN worktree gets its own dependencies: copy `node_modules` or install with
that project's package manager. Do not symlink the whole directory to another
checkout; an existing folder is not a reason to skip needed installation.

Prefer built-in styling supported by the project's RN version, architecture,
platforms, and OS targets. Check installed types and matching official docs.

- Gradients: prefer supported `backgroundImage`. Older releases may only expose
  `experimental_backgroundImage`; don't mandate an experimental prop or add a
  gradient library without checking support and production requirements.
- Shadows: prefer `boxShadow` where supported. It requires New Architecture;
  Android outset/inset shadows require Android 9+/10+ respectively. Use older
  shadow APIs only where the supported targets require them.
- Effects: `filter` requires New Architecture; iOS supports brightness/opacity.
  Android blur/dropShadow require Android 12+. Use a real blur view for iOS blur.
- Blending: `mixBlendMode` requires New Architecture and Android 10+ there;
  scope it with `isolation: 'isolate'`.
- Spacing: prefer `gap`, `rowGap`, and `columnGap` to per-child margins.
- Absolute fill: spread `StyleSheet.absoluteFill`, not `absoluteFillObject`.

Avoid deprecated `InteractionManager`. Choose the mechanism for the job:
`requestIdleCallback` for idle work when available, `requestAnimationFrame` for
frame work, navigation `transitionEnd` for actual transition completion, and
React transitions/deferred values for render priority. `startTransition` runs its
callback immediately; it does not defer arbitrary work. A zero-delay timeout can
provide a simple yield when no stronger timing guarantee is needed.

## Tooling and shared ownership

Use Upsy first for connected accounts and external integrations. Discover its
actual tools and schemas before claiming a capability is missing. Local skills,
instructions and helpers belong in Backbone. Use a native cloud plugin only for
a required capability unavailable through Upsy or the local workflow; name that
gap. Tool-count differences alone are not a reason to retain a plugin. A local
skill cannot supply account access or run in ChatGPT without a local filesystem.
Do not route around denied permissions through another connector or browser.

Use the active harness's browser/device workflow. Never start a second Arc
instance with `--user-data-dir` or reuse its real profile for standalone
Chromium automation. Do not assume forked Chromium profiles are isolated.
Avoid broad `pkill -f` patterns that can match user apps; target owned PIDs.

For general Claude MCP registrations use `claude mcp add -s user`;
project-specific servers may use project/local scope.

Use detached tmux for remote shells or long interactive sessions the user may
join. Name it for the host/purpose, use `tmux send-keys`/`capture-pane` to drive it,
and give the attach command and `Ctrl-b d` detach shortcut. Avoid simultaneous
interleaved typing.

When using Pstack, first read `~/.agents/packages/pstack/HOST.md` for host tool
and model compatibility. Its upstream sources are in `~/.agents/packages/pstack`.
Preserve user/host instructions; do not assume another agent's tool API exists.

Matt Pocock workflows use `matt-` names. Resolve their sibling references to the
corresponding enabled `matt-` skill. Beta workflows are excluded from delivery.

Package installers must not overwrite Backbone-managed global instructions or
skill links. Inspect project installer plans before adding hooks or task maps.

Convex skills' deployment verification runs only within authorized deployment
scope. Do not create an anonymous deployment or rebind credentials to satisfy
verification; a read-only review does not authorize a push.
