# Bundle setup

Backbone shares these skill folders with Claude, Codex, and OpenCode. It does not enroll accounts or install project hooks from their upstream installers.

| Bundle | Setup | Ownership |
|---|---|---|
| Fallow | Run `npx fallow --help`; install a project dev dependency when using its analysis. | Do not run `fallow agent install` against Backbone-managed global skills or instructions. Inspect its dry-run before adding project hooks or task maps. |
| HyperFrames | Node 22+ and `npx hyperframes --help`. Install FFmpeg for rendering, for example `brew install ffmpeg` on macOS. | Keep Backbone-owned skills under Backbone control; do not overwrite them with a CLI skill installer. Cloud rendering, media accounts, and deployment credentials are separate. |
| Tailscale | Install Tailscale and sign this machine into your tailnet. | Existing enrollment is retained. Shared guidance does not share node identity or permissions. |
| 1Password | Install the desktop app, enable Settings → Developer → MCP, and Backbone configures all three agents to run `1password-mcp`. | Each client needs desktop approval. Environment access can need further approval. Credentials stay local. |
| Matt Pocock | No single runtime required. Follow each workflow's prerequisites and your host's available tools. | Use `matt-tdd`, `matt-teach`, etc. Seven skills under `skills/in-progress` are upstream beta workflows. Claude-only commands do not become portable by sharing their Markdown. |

Matt's original source is https://github.com/mattpocock/skills. Backbone adds the `matt-` prefix to skill links and active frontmatter, while preserving the source files and references. The daily updater preserves that prefix.

User and host instructions take precedence over workflow instructions, including commit/push approvals and tool routing. Setup skills must not replace the shared global instructions or install a second owner for shared skills.

The source folders include licenses, references, and supporting files. Importing them does not activate native plugin hooks, commands, agents, or MCP registrations. Existing Codex plugins remain installed.
