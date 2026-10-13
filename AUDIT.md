# Shared skill coverage audit

Checked on 2026-10-14 against the shared source, local skill folders, 25 locally cached Codex plugin bundles containing 219 skill files, and public upstream packages. Cache presence does not establish that a plugin is enabled or its tools are connected. Counts describe the inspected snapshots, not every skill available online.

## Gaps fixed in this change

- Firebase: 13 official upstream skills, full references and supporting files, Apache-2.0 license, and upstream tracking. The local Codex snapshot contains only 12; upstream also includes firestore-rules-creation.
- Build macOS Apps: 11 official public skills, supporting files, MIT declaration retained in upstream metadata, and upstream tracking.
- Firebase MCP: portable definition for Claude, Codex, and OpenCode using firebase-tools 15.32.1. Login and project selection are per-machine/per-project. Discovery does not prove authenticated Firebase operations.

The shared source now contains 211 skills in 17 packages. Argent contributes another 18 installer-owned skills. Native plugin commands, agents, hooks, and Codex Run button integration are not activated merely by copying their skill packages.

The five requested additions are now shared: Fallow 4, HyperFrames 21, Tailscale 1, 1Password 1, and Matt Pocock original 38. Matt’s third-party curated fork remains provider-owned. See BUNDLE_SETUP.md for runtime requirements.

## Developer bundles still outside the shared source

| Bundle | Local skills | What is missing | Next step |
|---|---:|---|---|
| Vercel platform plugin | 33 | AI SDK, gateway, auth, deployments, storage, queues, and other platform guidance | Audit and import the public vercel/vercel-plugin package. This is different from the 9 shared vercel-labs/agent-skills. Preserve MCP ownership and resolve overlapping skill names. |
| Convex | 8 | Convex setup, review, components, and backend workflows | Establish the public redistribution source and required tools. Review the opt-in transcript-feedback workflow separately. |
| Figma | 14 | Figma implementation and design-tool workflows | Host-specific tool dependencies need adaptation; establish redistribution terms before copying. |
| Google Drive | 5 | Docs, Sheets, Slides, and comment workflows | Public plugin source is declared. Tools/auth need a working equivalent in each host. |
| Sentry | 1 | Sentry investigation guidance | Public plugin source is declared. Verify each host's connector/tool support. |
| PostHog | 1 | Product analytics guidance | Establish redistribution source and connector compatibility. |
| Upsy use-upsy | 1 | Provider-specific usage guidance | Upsy MCP is shared already. Check the skill's license and tool assumptions before copying. |

## Already covered or deliberately provider-owned

| Locally cached bundle | Skills | Status |
|---|---:|---|
| building-react-native-apps | 5 | Equivalent Callstack source skills already shared. Plugin registration remains separate. |
| migrating-to-react-native | 2 | Equivalent Callstack migration skills already shared. |
| swiftui-expert | 1 | Full upstream skill and references already shared. |
| firebase | 12 | Shared upstream replacement now has 13 skills. Existing Codex plugin can duplicate delivery. |
| build-macos-apps | 11 | All 11 now shared. Existing Codex plugin can duplicate delivery. |
| codex-security | 15 | Metadata declares Proprietary. Keep provider-owned; do not vendor into the public repo. |
| data-analytics | 20 | Metadata declares Proprietary; also depends on provider tools. |
| openai-templates | 20 | Metadata declares Proprietary. |
| pages | 4 | Metadata declares Proprietary; uses ChatGPT page/space tools. |
| plugin-management | 1 | Metadata declares Proprietary; tied to provider plugin installation. |
| product-design | 10 | Metadata declares Proprietary; provider tool dependencies. |
| sites | 1 | Metadata declares Proprietary; provider publishing tools. |
| work-pets | 3 | Metadata declares Proprietary; provider-owned pet features. |

No existing Codex plugin was uninstalled by this audit. Shared delivery and plugin delivery are separate. Consider removing overlapping native plugins only after verifying the shared skills and any replacement MCP, commands, agents, or hooks that you actually use.

## Other known gaps

- Playwright and Skillshare's own management skill were explicitly deferred in the previous roster. They are still not shared.
- Public OpenAI build-ios-apps has 9 skills and build-web-apps has 6. These were found during the broader source audit, not in the local cached bundle inventory. They are not imported by this change. Existing SwiftUI/Expo/Vercel coverage overlaps, but does not establish identical debugger, performance, Stripe, Supabase, or shadcn workflows. Review host dependencies before adding them.
- The built-in PDF, documents, presentations, spreadsheets, Excel control, template creator, and visualization skills are provider runtime capabilities. They are not supplied by this repository to a fresh Claude/OpenCode installation.
- Six visible cloud-exported skills remain machine-local: morning, run-update, pdf, docs, import-memory, and skill-creator. They are not part of the shared backbone. docs and import-memory require host tools; skill-creator needs script compatibility checks; morning and run-update need connected data sources. The earlier recommendation was not a completed migration or deletion.
- MCP definitions are shared for Upsy, Argent, REA, ipatool, Firebase, and 1Password. Bifrost is catalogued with no managed targets. Sharing definitions does not share OAuth, Apple Account credentials, or project access.
- Pstack's portable setup/doctor command is proposed, not implemented. Current compatibility instructions inherit the parent model when there is no approved host configuration.
- Firebase login, Xcode/signing identities, analysis engines, CLI installations such as ipatool, and project verification remain separate setup. macOS skill files do not install Xcode or prove a build/signing workflow.
- The local Tailscale dashboard service is not automatically provisioned on a fresh machine by Backbone.

## Audit limits

Package manifests and full-folder delivery can be checked without invoking every workflow. This audit does not claim that every cached skill, backend integration, deployment, signing operation, or cloud export has been exercised. Source metadata, actual discovery, host prerequisites, and an executed workflow are separate checks.

Public source declarations inspected: firebase/agent-skills, openai/plugins, vercel/vercel-plugin, fallow-rs/fallow-skills, heygen-com/hyperframes, tailscale/tailscale-skill, and 1Password/1password-codex-plugin. Missing source/license declarations above are gaps to resolve, not a claim that redistribution is prohibited.
