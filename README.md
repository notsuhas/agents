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

`instructions/global.md` contains shared portable instructions. Skillshare single-file extras append managed blocks in each agent’s instruction file, preserving local content and existing dotfiles symlinks. The Backbone adapter supplies package access policy and automatic refresh.

GitHub Actions checks upstream packages daily at 08:47 IST (03:17 UTC), or on manual dispatch. It opens or refreshes one update PR only when a package tree changes. Merge after review and runtime testing; machines then refresh automatically. Skills without an upstream declaration stay locally maintained. Enable “Allow GitHub Actions to create and approve pull requests” in this repository's Actions settings; the workflow does not approve or merge PRs. Public-repository schedules may be disabled after 60 days of inactivity and can run late.

`mcp.yaml` is the shared MCP definition file. Add portable endpoints and environment references through `skillshare mcp` or `skillshare ui`. Keep token values and OAuth stores on each machine. Review and publish changes to this file before expecting other machines to receive them. Shared custom agents can go in `agents/`; shared extras can go in `extras/`.
