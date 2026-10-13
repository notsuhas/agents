# Set up REA with Backbone

Backbone shares `reverse-engineer-anything` and its reference guides across Claude Code, Codex, and OpenCode. The MCP definition runs the approved REA npm release. A skill alone does not provide analysis tools.

## Set up a machine

Install Backbone and configure the shared repository:

```sh
brew install notsuhas/tap/agent-backbone
agent-backbone configure notsuhas/agents
```

For an existing installation:

```sh
agent-backbone sync
```

`mcp.yaml` launches `npx --yes rea-agents@6.4.0 mcp` for all three agents. Node and npm must be on the agent's PATH. REA requires Node 22.19+, supported Node 24.11+, or Node 26+. Homebrew's Backbone dependency supplies Node 22; the first MCP launch downloads the approved npm package and needs network access. A separate global REA installation is optional.

Restart the agent or reconnect its MCP servers after sync. Confirm that REA's tools appear. Start an investigation with the installed `reverse-engineer-anything` skill and an explicit artifact path or application name.

## Keep skill ownership in Backbone

Do not run `rea setup --yes` as part of Backbone refresh. REA setup also installs its bundled skill and can replace the shared links. Backbone owns the shared instructions and MCP definition; REA owns analysis behavior.

To inspect an existing setup without changing it:

```sh
npx --yes rea-agents@6.4.0 setup \
  --client claude_code --client codex --client opencode \
  --dry-run --format json
```

The plan can report a newer shared skill as stale because it compares against its own bundled version. An installed global CLI can also report the versioned npm launcher as stale because it expects its own executable path. Do not replace the shared setup solely to clear those warnings. Verify the configured command, actual tools, and the requested operation separately. A dry-run or doctor result does not prove a live MCP connection.

Check the shared launcher directly:

```sh
skillshare mcp check rea --live --accept-tools --timeout 15s --json
```

This starts the configured MCP and checks discovery. It does not prove that a particular analysis engine or agent session is connected.

## Add analysis engines only when needed

Static JavaScript analysis and ordinary archive inventory do not require a native decompiler. Native decompilation needs a supported Hopper, Ghidra, or IDA installation. Other operations can require their own tools and operating system.

Follow [REA's provider setup guide](https://github.com/morluto/rea/blob/main/docs/installation.md) for the operation you need. Keep engine paths, license keys, provider environment, and local overrides on each machine. Do not put credentials in this repository. Backbone does not install engines or broaden target-execution permissions.

Existing native REA registrations can use different commands or provider settings. Review MCP sync's proposed changes before replacing them, and retain the required local settings.

## Approve updates

Daily CI checks the REA skill's declared upstream path and includes changes in the combined update PR. REA's MCP runtime stays at the version in `mcp.yaml`; it is not currently managed by the Argent-only runtime updater. To upgrade the REA runtime, change that version deliberately, verify discovery and a relevant operation, and publish the reviewed change.

The shared skill can be newer than the runtime. Always use the connected server's actual tool names and schemas. Updating the skill does not add runtime capabilities. Matching-release skill snapshots are an alternative if strict CLI/skill alignment is required.

Source: [morluto/rea](https://github.com/morluto/rea).
