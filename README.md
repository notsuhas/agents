# Personal agent setup

The shared skill content for my agents. Tooling lives separately in [agent-backbone](https://github.com/notsuhas/agent-backbone).

```sh
brew install notsuhas/tap/agent-backbone
agent-backbone configure notsuhas/agents
```

`backbone.json` describes the skill source view, full plugin packages, host notes and upstream pins. `skills/` contains portable relative links; `packages/` preserves complete packages. Pstack is vendored from Cursor's public plugin repository with its MIT license. Local host adapters are declared explicitly so an upstream update preserves them.

To update Pstack: run `agent-backbone upstream check`, then `agent-backbone upstream update pstack`. Review the resulting Git diff, commit and push. Other configured machines receive the approved revision automatically. Upstream updates do not auto-publish.

Other CLI-installed skills remain owned by their installers until deliberately adopted. Use `agent-backbone inventory` to inspect duplicates and `agent-backbone adopt /path/to/skill --name my-skill` to copy a complete skill directory into this repository. Review license, private context and runtime compatibility before publication.

Cloud exports, credentials and company-specific material are excluded from this public repository. Package licenses remain in their respective directories.

`instructions/global.md` contains shared portable instructions. Agent Backbone updates only its marked block in each agent’s instruction file, preserving local content and existing dotfiles symlinks.
