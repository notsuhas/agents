# Bundle setup

Backbone shares these skill folders with Claude, Codex, and OpenCode. It does not enroll accounts or install project hooks from their upstream installers.

For new Macs with Apple simulators, follow [Simslim setup](SIMSLIM.md) to install the CLI and enable automatic slimming. This host setup runs separately from skill sync.

| Bundle | Setup | Ownership |
|---|---|---|
| Cloudflare Security Audit | Invoke `security-audit` against a repository. Node.js runs its bundled validators. Full audits require independent subagents; target execution requires every OS sandbox control listed in the skill. | Skill sync does not provision a sandbox. Missing controls leave execution-dependent findings as `needs_validation`; they do not justify running target code unsandboxed. Reports stay outside the target repository by default. |
| Fallow | Run `npx fallow --help`; install a project dev dependency when using its analysis. | Do not run `fallow agent install` against Backbone-managed global skills or instructions. Inspect its dry-run before adding project hooks or task maps. |
| HyperFrames | Node 22+ and `npx hyperframes --help`. Install FFmpeg for rendering, for example `brew install ffmpeg` on macOS. | Keep Backbone-owned skills under Backbone control; do not overwrite them with a CLI skill installer. Cloud rendering, media accounts, and deployment credentials are separate. |
| Tailscale | Install Tailscale and sign this machine into your tailnet. | Existing enrollment is retained. Shared guidance does not share node identity or permissions. |
| 1Password | Install the desktop app, enable Settings → Developer → MCP, and Backbone configures all three agents to run `1password-mcp`. | Each client needs desktop approval. Environment access can need further approval. Credentials stay local. |
| Matt Pocock | No single runtime required. Follow each workflow's prerequisites and your host's available tools. | Use `matt-tdd`, `matt-teach`, etc. Seven upstream beta workflows under `skills/in-progress` are excluded from every target. Claude-only commands do not become portable by sharing their Markdown. |

Matt's original source is https://github.com/mattpocock/skills. Backbone adds the `matt-` prefix to skill links and active frontmatter, while preserving the source files and references. The daily updater preserves that prefix.

User and host instructions take precedence over workflow instructions, including commit/push approvals and tool routing. Setup skills must not replace the shared global instructions or install a second owner for shared skills.

The source folders include licenses, references, and supporting files. Importing them does not activate native plugin hooks, commands, agents, or MCP registrations. Existing Codex plugins remain installed.

Matt uses a shared stable-skill allowlist. Existing approved skills keep updating; new Matt skill names stay hidden until reviewed and explicitly allowed.
