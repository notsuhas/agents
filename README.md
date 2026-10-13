# Personal agent setup

The shared skill content for my agents. Tooling lives separately in [agent-backbone](https://github.com/notsuhas/agent-backbone).

```sh
brew install notsuhas/tap/agent-backbone
agent-backbone configure notsuhas/agents
skillshare list       # / searches, t toggles, q exits
skillshare ui         # dashboard
skillshare pull       # refresh this machine
```

`backbone.json` describes the skill source view, full plugin packages, host notes and upstream pins. `skills/` contains portable relative links; `packages/` preserves complete packages. Pstack is vendored from Cursor's public plugin repository with its MIT license. Local host adapters are declared explicitly so an upstream update preserves them.

To update Pstack: run `agent-backbone upstream check`, then `agent-backbone upstream update pstack`. Review the resulting Git diff, commit and push. Other configured machines receive the approved revision automatically. Upstream updates do not auto-publish.

Other CLI-installed skills remain owned by their installers until deliberately adopted. Use `agent-backbone inventory` to inspect duplicates and `agent-backbone adopt /path/to/skill --name my-skill` to copy a complete skill directory into this repository. Review license, private context and runtime compatibility before publication.

Cloud exports, credentials and company-specific material are excluded from this public repository. Package licenses remain in their respective directories.

`instructions/AGENTS.md` is the one shared global instruction file. Skillshare links Claude’s `~/.claude/CLAUDE.md`, Codex’s `~/.codex/AGENTS.md`, and OpenCode’s `~/.config/opencode/AGENTS.md` to it. There are no appended blocks or per-agent copies. Existing target files are preserved in Skillshare’s migration backups. Project instructions remain project-specific.

GitHub Actions checks upstream packages daily at 08:47 IST (03:17 UTC), or on manual dispatch. It opens or refreshes one update PR only when a package tree changes. Merge after review and runtime testing; machines then refresh automatically. Skills without an upstream declaration stay locally maintained. Enable “Allow GitHub Actions to create and approve pull requests” in this repository's Actions settings; the workflow does not approve or merge PRs. Public-repository schedules may be disabled after 60 days of inactivity and can run late.

`mcp.yaml` is the shared MCP definition file. Add portable endpoints and environment references through `skillshare mcp` or `skillshare ui`. Keep token values and OAuth stores on each machine. Review and publish changes to this file before expecting other machines to receive them. Shared custom agents can go in `agents/`; shared extras can go in `extras/`.

## Shared MCP definitions

`mcp.yaml` distributes Upsy's endpoint to Claude and Codex. OAuth credentials remain on each machine; sharing this file does not copy a login.

Bifrost's endpoint is catalogued with `targets: []`, so existing native connections remain untouched. Its Authorization header refers to `BIFROST_AUTHORIZATION`; set this in each agent's environment and test access before enabling managed delivery. No gateway token belongs in this public repository.

Skillshare installs change the local library checkout. Review, commit and push those changes to share them with other machines. Newly installed skills need upstream tracking before the daily package updater maintains them.

See [ROSTER.md](ROSTER.md) for installed bundles, exclusions, and CLI ownership. [HOOKS.md](HOOKS.md) records hook ownership. `runtimes.json` approves Argent’s CLI version; its installer owns its skills. Daily updates include runtime version changes in the same combined PR.
