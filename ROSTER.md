# Shared skill roster

Imported on 2026-10-14. Machines need Agent Backbone v0.7.0 or later to apply the runtime policy and unified instruction links.

## Shared bundles: 231 source skills

Seven Matt beta workflows remain excluded: 224 shared skills are delivered.

- Pstack: 56. Kept intact, including HOST.md and local Claude adapter.
- [Cloudflare Security Audit](https://github.com/cloudflare/security-audit-skill): 1 MIT-licensed skill, `security-audit`, with all companion guides, schema and validators. Tracked by the daily updater. Node.js is required for validators; full audits need independent subagents and OS-enforced sandbox controls before executing target code. See BUNDLE_SETUP.md.
- Human writing: 1. Personal shared skill.
- [Theo Browne's tstack](https://github.com/t3dotgg/tstack): all 9 MIT-licensed
  skills, original names and sibling dependencies preserved. Includes the
  non-T3 PR watcher script; T3 uses its native watcher instead. Cross-provider
  reviews require those models in the active harness. Invoke full-stop to leave
  merging to the user, or explicitly full-send for its unattended merge workflow.
- Account workflows: 5 independently authored local skills for Upsy, Sentry,
  PostHog, connected-data analysis and product-flow design. See CLOUD.md for gaps.
- [Convex](https://github.com/get-convex/agent-skills): 2 licensed, upstream-tracked
  standalone skills: convex-expert and convex-reviewer. Hosted scaffold recipes
  and transcript feedback are excluded; deployment remains authorization-bound.
- [Expo](https://github.com/expo/skills): 24 production skills, including EAS, UI, animation, routing, modules, and feedback. Full folders, references, scripts, agents, and assets retained. Importing the skills does not activate Expo's plugin hooks or install its MCP. Telemetry stays opt-in.
- [Callstack](https://github.com/callstackincubator/agent-skills): 9 maintained React Native skills plus 3 skills vendored by its testing bundle: agent-device, dogfood, and react-native-testing. Preserve the testing bundle's source lockfile when updating it. In T3 use its native device panel and supplied launcher for device work.
- [Ponytail](https://github.com/DietrichGebert/ponytail): all 6 standard skills. No optional hooks were activated. It overlaps with Pstack's simplicity guidance; invoke the style modes deliberately.
- [Vercel](https://github.com/vercel-labs/agent-skills): all 9 skills. MIT is declared in the upstream README. Names from skill frontmatter are used for shared links where folder names differ, preserving the upstream instructions.
- [Emil Kowalski](https://github.com/emilkowalski/skills): all 15 design/animation/mobile/Swift skills, including apple-design and write-swift.
- [SwiftUI Expert](https://github.com/AvdLee/SwiftUI-Agent-Skill): 1 skill with all references. Covers modern SwiftUI, composition, state, performance, and Liquid Glass.

- [Reverse Engineer Anything](https://github.com/morluto/rea): 1 shared skill with all 6 reference guides, MIT license, and upstream revision tracking. Existing local copies are adopted into Backbone delivery. The REA CLI remains separately installed; skill updates do not install or update analysis engines. Follow the connected server's actual schemas when a newer skill describes tools absent from the installed CLI.
- [Firebase](https://github.com/firebase/agent-skills): 13 skills, including the newly added firestore-rules-creation skill absent from the local Codex plugin snapshot. Full package and Apache-2.0 license retained. Firebase MCP is shared; authentication and project selection remain local.
- [Build macOS Apps](https://github.com/openai/plugins/tree/main/plugins/build-macos-apps): 11 skills for SwiftUI/AppKit, build/run/debug, tests, signing, packaging, windows, and telemetry. Upstream metadata declares MIT. Codex-specific Run button and command metadata are retained but are not installed into other agents.

- [Fallow](https://github.com/fallow-rs/fallow-skills): 4 skills for code analysis, review, setup, and Codex onboarding. CLI installation and project gates remain separate.
- [HyperFrames](https://github.com/heygen-com/hyperframes): 21 current video and rendering skills, with references retained. Requires Node 22+; rendering needs FFmpeg.
- [Tailscale](https://github.com/tailscale/tailscale-skill): 1 official networking skill. Machine enrollment stays local.
- [1Password](https://github.com/1Password/1password-codex-plugin): 1 Developer Environments skill. Requires the desktop app's local MCP server and client approval.
- [Matt Pocock](https://github.com/mattpocock/skills): 31 active original skills; seven upstream beta workflows are excluded by the shared ignore policy. All use matt- names in delivery to avoid collisions; upstream files stay unchanged. The third-party curated fork is not shared.

No production skill was removed from these bundles. All upstream sources are tracked in backbone.json with source paths and approved revisions. Upstream instructions remain unchanged; host and user instructions take precedence.

## Explicit exclusions

Repository-maintenance skills are not exposed as user skills: Expo's expo-skill-eval, Callstack's validate-skills, and SwiftUI's update-swiftui-apis. Expo's separately packaged experimental expo-migrate-module is not imported. Ponytail's duplicate OpenClaw layouts are not exposed a second time. These are scope choices, not edits to production skills.

Playwright and Skillshare's own management skill remain future additions; the original shortlist held them for later. Existing Codex curated plugins are untouched. Some overlap with shared Callstack/SwiftUI/Vercel skills; sharing these bundles makes the same guidance available to all three agents.

## Argent: installer-owned, 18 skills

[Argent](https://github.com/software-mansion/argent) 0.28.0 is installed globally. Its official skills installer owns all 18 skills and its global lockfile. They are not vendored or collected into this repository. Claude links to the installer-owned files in ~/.agents/skills; compatible agents can read that global directory.

Argent's update command refreshes tracked skills from the matching release tag, with a bundled-assets fallback. A plain npm global version bump alone does not guarantee skill refresh. Backbone uses the official update command, verifies the installed version and bundled skill content, and records success locally. MCP discovery returned 77 tools; device operations and profiler flows were not exercised.

The approved version lives in runtimes.json. Daily CI proposes stable versions with an available Git tag in the same combined update PR as skill changes. After merge, updated Backbone installations apply the version on refresh. A local version change is reported as drift, not silently overwritten. To share a deliberate local update, record it with agent-backbone runtime pin argent VERSION, then review and publish the Git change. Local edits do not propagate to other machines automatically.

Argent CLI skills are outside Skillshare's managed roster, so its source list and toggles do not own them. Do not use Collect on these entries.

## Instructions and delivery

instructions/AGENTS.md is the sole global source. Claude's CLAUDE.md, Codex's AGENTS.md, and OpenCode's AGENTS.md link to the same file through Skillshare extras. Append blocks were removed. Project instructions remain separate.

Skill merge mode already links individual skills and preserves installer-owned neighbors. Keep it instead of linking the whole skill directory. No additional Universal target is necessary: Codex already publishes into ~/.agents/skills. Future agents may reuse that directory but still need their own MCP/hook/instruction configuration.

## Updates and use

Open the Skillshare dashboard or run skillshare list. Use agent-backbone enable NAME or disable NAME for shared skills. Disabled shared skills keep receiving source updates. Start a new agent session after changing discovery.

Daily updates accumulate on automation/upstream-skills until its combined PR is merged. Machines pull approved changes on refresh. Dirty or divergent checkouts pause automatic Git refresh and retain cached delivery. Review instruction changes before merge.

Licenses and attribution are retained. No credentials or private account context belongs in this public repository. See HOOKS.md for installer-owned integrations.

See AUDIT.md for the local Codex bundles and cloud exports that are not shared. A locally available plugin is not proof of cross-machine or cross-agent delivery.

See BUNDLE_SETUP.md for prerequisites and ownership rules for these additions.

Matt uses a shared stable-skill allowlist. Existing approved skills keep updating; new Matt skill names stay hidden until reviewed and explicitly allowed.
