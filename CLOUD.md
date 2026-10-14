# Cloud plugin exit

Backbone delivers local skills and global instructions. Upsy provides connected
accounts, custom MCP servers and permitted cloud-browser access. A native ChatGPT
plugin is a fallback for a specific required capability, not the default route.
ChatGPT cannot read Backbone's local skill files; it uses Upsy's own tool guidance.

## Ready to disable

- Sentry: use Upsy. The local Sentry guide replaces the cloud-only REST-helper
  workflow without needing another token. Read operations were tested; issue
  changes and Seer were schema-checked, not executed.
- PostHog: use Upsy and its live server skills. Shared tool metadata and all
  advertised schema expansions matched; an actual trends query returned matching
  chart data. Native embedded widgets are not verified and are not supplied by
  either route in the current T3 session.
- Wispr Flow: use its connected custom MCP through Upsy. Paired read tests passed;
  folder-content reads lacked a real fixture because no folders were returned.
- Migrating to React Native: use the shared Callstack skills, including the newer
  brownfield version. No cloud API dependency remains.
- Build macOS Apps: use the shared skills. Native slash-command/UI shortcuts are
  retired; their workflows remain available by asking the local agent.
- HyperFrames: use the newer shared official bundle. This retires old cloud skill
  entry points rather than claiming byte-identical versions.

GitHub, Gmail, Calendar, Drive, Slack, Linear and Granola have working Upsy routes.
Their ChatGPT plugins can be disabled for ordinary supported tasks. Some native
APIs differ or are broader; discover Composio through Upsy for a missing operation
before falling back. Do not promise untested bulk authoring or write parity.

Mixpanel is connected through Upsy. The native-only audit-log and recall-context
interfaces remain gaps; keep a native fallback only if those operations are used.

## Finish connection setup before retiring specialized APIs

Figma's connected Composio toolkit covers REST reads, not the full design tool
surface. Its official remote MCP is `https://mcp.figma.com/mcp`: add it as a custom
MCP in Upsy, complete OAuth, then verify file context and any required design writes.
See [Figma's setup](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/).

Vercel's official remote MCP is `https://mcp.vercel.com`: connect it in Upsy and
verify the required project/deployment operations after OAuth. Do not add another
direct local registration merely to duplicate Upsy.
See [Vercel's setup](https://vercel.com/docs/agent-resources/vercel-mcp).

Context7, Spotify, Statsig and WorkOS were discoverable in Composio but inactive
when audited. Discovery alone does not make them replacements. Connect only the
services actually needed, then test the requested reads before disabling the fallback.

## Optional native-only features

Booking.com, Headout, Skyscanner and Shazam have no verified equivalent active
API route. Upsy's authenticated browser may handle a website task, but does not
prove flight-price, recognition or wishlist API equivalence. Disable these if
those specialized features are not needed; restore only for a concrete gap.

Data and Product Design have proprietary workflow assets and platform publishing
features. They were not copied into this public repository. Local data analysis,
charts and design work use independently authored analyze-connected-data and
design-product-flow skills with the host's normal tools and shared design skills;
ChatGPT Sites/template features are not promised by Backbone or Upsy.

Convex's hosted quickstart/runbook tools are separate from a normal local Convex
CLI workflow. The licensed official convex-expert and convex-reviewer skills are
shared and upstream-tracked; deployment verification remains authorization-bound.
Do not copy a quickstart that silently sends ideas to a scaffold
service or executes returned bootstrap code. Keep that native onboarding only
if it is explicitly wanted.

Keep the Upsy ChatGPT plugin/connection: that is how ChatGPT reaches Upsy. Local
agents use the shared Upsy MCP definition instead. Do not revoke the underlying
Upsy account when removing another plugin. Definitions never contain OAuth tokens.

No plugin is automatically uninstalled by Backbone. Disable and uninstall differ;
plugin changes require exact targets. Restart local agent sessions after syncing.
