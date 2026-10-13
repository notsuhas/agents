# Firebase setup

Backbone shares the official Firebase skills and a versioned MCP definition with Claude, Codex, and OpenCode. Run `agent-backbone sync` and restart the agents after receiving this change.

For Firebase access, sign in once on each machine:

```sh
npx --yes firebase-tools@15.32.1 login
```

For remote/headless login, use:

```sh
npx --yes firebase-tools@15.32.1 login --no-localhost
```

Complete the browser authorization privately. Keep credentials and login redirects out of Git and chat.

The MCP starts with `--dir .`. Confirm the current project directory and intended Firebase project before using project tools. Do not put a personal default project ID or service-account key in the shared definition.

Check discovery:

```sh
skillshare mcp check firebase --live --accept-tools --timeout 30s --json
```

A discovery check does not test project permissions, queries, deployments, or billing. Native Codex Firebase plugins can provide a duplicate server/skill bundle. Review their extra features before removing them; this migration leaves existing plugins installed.

Firebase skill source updates use the combined daily PR. The MCP CLI version is explicit in mcp.yaml and needs a reviewed version change; skill updates alone do not upgrade it.

Source: https://github.com/firebase/agent-skills
