# Working with this user

Please no big word soup, that I wont sit and read. if it can be explained in a few sentences, do so. Prefer terse language.

## Universal preferences

### Always-on skills (every session, main thread AND subagents)

- **human-writing** (always): apply to ALL outward-facing text drafted on my behalf — Slack, PR comments/descriptions, emails, docs, commit messages. Load the skill before drafting any of these; no AI-slop, user's voice, shorter over longer. (human-writing governs text other people read.)

### Communication & process

- **Answer "why isn't X like Y?" with an explanation, not a code change.** Treat sibling-pattern questions as requests for rationale. Don't auto-edit; explain first, then ask one focused question if intent is unclear.

### Task execution and delegation

Work directly when the task is clear and the current agent has the needed tools and context.

Use subagents only when they provide a clear net benefit: independent parallel work, very large context, a specialist review, or an explicitly requested workflow.

- Delegation is optional for searches, audits, data gathering, debugging, and implementation. Never delegate merely to satisfy a policy.
- If delegating, give the subagent a narrow scope and verify its actual artifact or result. The main agent owns integration, final decisions, and verification.
- A missing, unavailable, or unsuitable subagent must never block useful progress.
- Choose models from the capabilities actually available in the active harness. Do not rely on a stale global model table or hard-coded model names.
- Keep vendor-specific commands, model routing, and review-gate configuration in harness or project configuration, not in global instructions.

### Git & PR discipline

- **Never open an upstream PR without on-device/runtime verification AND explicit user approval — even when a fix "looks right" against the source.** Static reasoning about codegen, bindings, and C++ template behavior is unreliable; bugs in cross-language interop layers (Nitro modules, Swift Cxx-interop, JSI) routinely defy "this should work because the code reads correctly." Workflow: (1) apply the candidate fix locally via patch-package, (2) rebuild, (3) capture logs proving the symptom is gone, (4) ask the user to approve raising the PR, (5) only then `gh pr create`. Failed verification = don't ship.
- **Each git-state change is its own approval gate.** Edits and lint/typecheck are free; `git commit`, `git push`, and `gh pr create/edit/comment` each need an explicit go. Default cadence: edits → lint/typecheck → summarise diff → stop and wait. Don't bundle these into one turn unless authorised ("commit and push", "go raise the PR").
- **After a push, stay on the branch and verify upstream tracking.** `git branch -vv` should show `[origin/<branch>]`, not a parent ref inherited from `git checkout -b`. If wrong, fix with `git branch --set-upstream-to=origin/<branch> <branch>`. Matters for stacked-PR flows (worktrunk, `gh pr status`).
- **PR descriptions: plain text, no plan/tree links.** Reference the plan by name only — skip `../../tree/...` markdown links and links to plan docs unless asked.

### Comment policy

- **"If you need a paragraph-long comment to justify why the workaround is OK, the code is wrong — fix the code."** A multi-line justification comment is a smell: reconsider the code (root cause, upstream patch, simpler shape) instead of defending it. If the code is actually right, the comment is at most **one line, period** — a short "why", optionally an issue/PR ref (e.g. `// reanimated#9574`).
- **The one-line rule covers ALL comment kinds, not just workaround defenses**: JSDoc headers, union/enum value legends, store-field notes, effect-dep rationales. A 5-line doc block enumerating what each union member means is an essay — the names should carry it; if they can't, rename the values, don't document them.
- **Never re-add a comment the user deleted.** Their deletion is a style ruling, not an accident. When they trim comments in a diff, sweep the rest of the diff to the same bar before they have to ask.

### Code shape

- **No IIFEs for branch dispatch.** `const x = (() => { switch … })()` inside a component/function body is a smell: extract a module-level pure function (`resolvePrimaryAction(status, deps)`). It's testable, the exhaustive `switch` keeps the return-type check, and the call site shrinks to one line.
- **Derive state through pure functions with one small test.** UI status / capability / gate decisions live as pure `derive*(inputs) → union` functions (e.g. `deriveLocationCapability(permission, accuracy)`, `deriveStartGateStatus(...)`), colocated with their model, with a compact test enumerating the matrix. Hooks stay thin wrappers over the derivation.
- **Clean global abstractions over inline patches.** When the same OS/state pair is checked in several features, build one model (a store-derived union like `TLocationCapability`), one sync point (a single App-root hook handling seed + foreground refresh), and make every consumer read the derived value — never raw permission/accuracy pairs sprinkled with per-feature AppState listeners. Session-scoped flags (nudge shown once, etc.) live in the store, not component refs that reset on remount.
- **In discriminated returns, make the falsy fields optional** so each branch states only what's true for it (`{ text, onPress }` vs five explicit `false`s per case).

### Module hygiene

- **Export only what's consumed across files.** Internal types (function param/return shapes), helper consts, dedup state, etc. stay module-private. Don't blanket-`export` every interface "in case." Each export pollutes the import space, makes refactors harder (renames cascade), and signals "this is part of the public API" when it isn't.

### Debugging dependencies

- **Root cause over workaround — patch the library, don't quit into app-level mitigation.** When a bug traces to a dependency, the fix hierarchy is: (1) backport the upstream fix (identified commit/PR) as a patch-package patch — even C++/native code; (2) only if no fix exists anywhere upstream, disable the offending feature/flag; (3) app-level workarounds (AppState gates, restructured components, "just don't animate") are last resort and read as quitting. Verify on device after patching; note the "delete patch on next release" cleanup in the PR description.
- **Read upstream source in `node_modules` before writing JS-side workarounds.** When a third-party lib doesn't behave as documented (config option ignored, filter not applied, callback fires too often), open the relevant file under `node_modules/<pkg>/{ios,android,src}/...` and trace the option/code path _first_. AI tooling makes vendor source trivially readable — there's no excuse for "let's just throttle in JS" without first verifying the lib's filter is actually broken.
  - **Why:** workarounds compound. Every "just add a manual throttle" is dead code once upstream fixes the bug, and the workaround masks our ability to file a meaningful issue/PR.
  - **How to apply:** (1) reproduce with a clear log/repro, (2) read the source and confirm the bug, (3) file an issue/PR upstream when small (e.g. `react-native-nitro-geolocation` PR #96 was a one-line `Swift.abs` ambiguity fix), (4) patch via `patch-package` to unblock locally, (5) only fall back to a JS-side guard if upstream behavior is intentional or the fix is non-trivial.

### Implementation patterns

- **Wire new screens end-to-end for visual testing.** New UI must be reachable through real navigation and read from real state, so the user can load the simulator/browser and verify in context. Plans/PRs should specify which selectors feed the component, which route surfaces it, and a manual-test walkthrough.
- **Simple dev flags = `export const FOO_ENABLED = true`.** For short-lived integration toggles flipped only by the developer, use plain TS constants. Skip MMKV-backed getter/setter pairs, debug-modal UI, and `PRESERVED_KEYS` plumbing unless QA actually toggles it on TestFlight.
- **RN worktrees: copy or `yarn install` node_modules — never symlink.** Metro/native modules don't tolerate `ln -s ../main/node_modules`. Two acceptable options: `cp -R /path/to/main/node_modules /path/to/worktree/node_modules` (fast on macOS) or `yarn install` (slower but always correct). When using the using-git-worktrees skill on an RN project, override the "skip yarn install if node_modules exists" shortcut.
- **Per-package monorepo upgrades.** Vertical slice per workspace (auth → aws → db → redis → scripts → api → cli → web), not horizontal dep-family batches. Catalog/workspace-wide bumps OK as a floor-raise PR, but consequences (API shifts) handled per-package. Cross-cutting changes (auth migration touching middlewares) stay within the vertical slice for that workspace.
- **Redesign = restructure, not reskin.** When a design handoff specifies new IA / pane structure / nav primitives (split-view, mission-control, three-pane, command palettes, inline inspectors), build that structure first — don't just retoken existing components. Artboard names are structural signals. Avoid global `button:active { transform: scale(.97) }` press animations.
- **Cover every screen in a handoff.** Enumerate every artboard before claiming done; secondary screens (Users/Settings/Collab/Login) need the same bar as the hero. Default `<Sheet open={false}>`; gate controlled triggers on explicit state so sheets don't auto-open on mount.

### TypeScript / React conventions

- **Interface naming: `I<Name>`, never `I<Name>Props`.** Prefix component/object interfaces with `I` (e.g. `IBackButton`, `IExperienceHeader`). Do not add a `Props` suffix — the `I` already signals "interface", and `Props` is redundant noise. Applies to every interface, not just component props. **Why:** consistency with existing components in React Native project (e.g. `src/components/BackButton.tsx` defines `IBackButton`). **How to apply:** every new interface I write; if I see `IFooProps` in a diff I'm reviewing or editing, treat it as a violation to rename.
- **No inline prop destructuring in component signatures.** Components take a single `props` parameter typed with the `I<Name>` interface, then destructure inside the function body. Pattern: `const Foo = (props: IFoo) => { const { x, y } = props; … }`. Do **not** write `({ x, y }: IFoo) => …`. **Why:** matches the existing React Native project codebase pattern (see `src/components/BackButton.tsx`); keeps signatures readable when interfaces grow; makes it trivial to pass `props` through to other helpers. **How to apply:** every RN/React component I write in React Native project and related projects.
- **Colors: always RGBA, never hex.** Use `rgba(r, g, b, a)` for every literal color in style props, SVG `fill`/`stroke`/`stopColor`, gradient stops, etc. Do **not** use hex (`#FFAC96`, `#1a1a1a`, etc.). **Why:** consistent format makes opacity changes one-character edits, no mental conversion between formats, no mix of `#FFFFFF` vs `rgba(255,255,255,1)` in the same file. **How to apply:** when porting designs/SVGs from Figma, convert all hex stops to rgba inline. When reviewing diffs, flag any new hex literal as a fixup. Design-system tokens like `COLORS.BRAND_COLORS.WHITE` are fine — the rule is about LITERAL colors.
- **No deprecated APIs.** When a library marks a prop/method as `@deprecated`, use the suggested replacement. **Why:** keeps the codebase forward-compatible with library upgrades; avoids accumulating tech debt; deprecations are usually flagged because the old API has a known limitation the new one fixes. **How to apply:** when adding a new dependency call, check the TS hints / docs for deprecation comments. If I see a deprecation warning in the linter or in IDE tooltips on existing code I'm touching, fix it as part of the change. Example: `react-native-reanimated-carousel` v5 deprecated `width`/`height` props in favor of `style={{ width, height }}`.

### React Native styling (modern style-prop primitives — prefer over legacy alternatives)

Modern RN (0.76+) ships CSS-like style props. Default to these instead of pulling in extra libraries or older RN APIs.

- **Linear gradients: `experimental_backgroundImage` with a CSS-like string.** Don't reach for `react-native-linear-gradient` or `expo-linear-gradient` for simple gradients. Example: `experimental_backgroundImage: "linear-gradient(to right, red 20%, orange 20% 40%, yellow 40% 60%, green 60% 80%, blue 80%)"`.
- **Visual effects: `filter`.** Supports CSS-like string or array of objects (blur, brightness, contrast, hue-rotate, etc.). Caveats: full support is Android-only; blur requires Android 12+; iOS only supports `brightness` and `opacity`. Don't assume iOS blur works — use a real blur view (e.g. `expo-blur`) on iOS.
- **Shadows: `boxShadow` with a CSS-like string.** Supports offsets, blur, spread, color, and multiple comma-separated layers. Example: `boxShadow: "0 4px 24px rgba(0,0,0,0.15)"`. Skip the legacy `shadowOffset`/`shadowOpacity`/`shadowRadius`/`elevation` quartet unless targeting old RN.
- **Spacing: `gap`, `rowGap`, `columnGap`.** Use these in flex containers instead of per-child margins. `gap` sets both axes; `rowGap`/`columnGap` for independent control. Example: `gap: 12` or `rowGap: 6, columnGap: 28`.
- **Blending: `mixBlendMode` + `isolation: "isolate"`.** Use `mixBlendMode: "multiply" | "screen" | "overlay" | ...` to blend with background; wrap parent in `isolation: "isolate"` to scope blending to that container.
- **Absolute fill: always `...StyleSheet.absoluteFill`, never `...StyleSheet.absoluteFillObject`.** Both spread to the same `{ position: 'absolute', top/left/right/bottom: 0 }` shape in modern RN, so `absoluteFill` is the shorter, canonical form. Use it consistently — including when spreading inside a `StyleSheet.create` block. No mixed styles.

### React Native deprecated APIs (avoid)

- **`InteractionManager` (incl. `runAfterInteractions`) is deprecated.** Don't reach for it to defer work past a navigation/animation transition. Modern alternatives:
  - **`requestAnimationFrame`** to defer one paint frame (or chain a couple for "wait until transition has had a chance to start").
  - **React 18 `startTransition` / `useTransition`** to mark state updates as non-urgent so React batches them around urgent ones.
  - **`useDeferredValue`** for deferring a value derivation.
  - **React Navigation's `'transitionEnd'` event** (via `navigation.addListener`) when you specifically need to wait until a navigation transition completes.
  - **`setTimeout(fn, 0)`** as the simplest "yield current task" — fine for non-critical deferrals.
  - **Why:** `runAfterInteractions` has always been unreliable (no guaranteed firing under contention, depends on `InteractionManager.createInteractionHandle` participants registering properly). Concurrent React + modern RN scheduling primitives are the supported path.

### Tooling

- **MCP servers default to `-s user`.** Always pass `-s user` to `claude mcp add` unless the server is project-specific. The CLI default is `local` (current project), which is almost never what's wanted for general tools (browser automation, search, docs).
- **Never launch a second Arc instance with `--user-data-dir`.** Arc is not vanilla Chromium — its shared services (Browser Company sync, Spaces, sidebar) operate on the user's real Arc profile regardless of `--user-data-dir`. Launching a copy can wipe extensions and invalidate cookies on the real profile.
  - For Arc automation: ask the user to install the Playwright MCP Bridge extension in Arc.
  - For authenticated browser verification: drive Playwright with vanilla Chromium (have the user sign in there) or Google Chrome at default profile; never reuse Arc's binary/profile.
  - Same caution for other heavily-forked Chromium browsers (Brave, Edge, Opera).
  - Never use `pkill -f` against patterns that could match user-facing processes (`Arc`, `arc-profile`, etc.) — `pkill -f` matches the full command line. Use PID-based targeting.
- **Remote shells / long interactive sessions: run inside a detached tmux session.** When SSH-ing into a host (e.g. `ssh user@your-host`) or starting any long interactive process the user may want to watch or join, default to:
  ```
  tmux new-session -d -s <name> -x 200 -y 50 '<cmd>'
  ```
  Use the host/purpose as the session name (`remote`, `staging`, etc.). Drive the session with `tmux send-keys -t <name> '<cmd>' Enter` and read output with `tmux capture-pane -t <name> -p`. Tell the user the attach command (`tmux attach -t <name>`) so they can watch live and type in themselves; detach is `Ctrl-b d`. Note that simultaneous typing from both sides can interleave.

# Shared agent instructions

Preserve the user's instructions and existing work. Keep private context and credentials out of public repositories.

Use Conventional Commits for commit messages and pull request titles: `<type>[optional scope][!]: <description>`. Mark breaking changes with `!` and explain them with a `BREAKING CHANGE:` footer.

Before creating a commit or opening or updating a pull request, verify the message or title follows this convention. Ensure squash merge messages follow it as well.

Verify the actual behavior before declaring work complete. Explain what changed and any material limitations plainly.

# Commits and pull requests

- Use Conventional Commits for every commit message and pull request title: `<type>[optional scope][!]: <description>`.
- Choose a type that matches the change, such as `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, or `revert`. Write a concise, imperative description, for example `fix(auth): handle expired sessions`.
- Mark breaking changes with `!` before the colon and explain them in a `BREAKING CHANGE:` footer in the commit body or PR description.
- Before creating a commit or opening or updating a PR, verify that its message or title follows this format. Ensure squash merge commit messages follow the same convention.

# Pstack host integration

When using the installed Pstack skills, first read `~/.agents/packages/pstack/HOST.md`
for Claude/Codex tool and model compatibility. Upstream sources live in
`~/.agents/packages/pstack`. Preserve the current user and host instructions.

Respect disabled skills and per-agent exclusions. Do not invoke them through source caches or sibling references.

# Shared bundle ownership

Matt Pocock workflows use `matt-` skill names. Within a Matt workflow, resolve sibling skill references to the corresponding `matt-` skill, respecting disabled skills.

Do not let package setup commands overwrite Backbone-managed global instructions or skill links. Inspect project installer plans before adding their hooks or task maps.
