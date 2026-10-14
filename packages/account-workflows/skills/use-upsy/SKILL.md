---
name: use-upsy
description: Access connected accounts and custom MCP services through Upsy; discover tools, resolve account scope, and use its cloud browser for permitted website tasks.
---

# Upsy

Use Upsy for account integrations. Tool names vary by host; discover the actual
callable tools rather than copying another agent's namespace.

1. Inspect the available connector or app catalog. Pick the requested account.
2. Prefer directly exposed tools. For other apps, use `app_tools`, then request
   the returned tool names' full input schemas when the catalog is abbreviated.
3. Use `app_read` for tools marked read-only and `app_call` for other tools.
   Judge authorization from the underlying operation, not the generic dispatcher.
4. Read existing records before changing them. Handle pagination and distinguish empty
   results from missing access. Verify mutations before retrying a timeout.

For gaps in a built-in connector, discover the user's connected Composio MCP
through Upsy. Search the requested operation, inspect its exact schema and
connection status, and execute only through an active authorized account.
A searchable toolkit is not an authenticated integration. Do not connect new
accounts, submit feedback, or send messages unless the task authorizes it.

Use the host's browser workflow for ordinary browsing. For a task needing Upsy's
authenticated cloud browser, use its snapshot/navigation tools when available.
Use `browser_open` and its supported client only when needed. Keep temporary
endpoints private and honor the user's granted browser permissions.

Read relevant memory before asking for a saved preference. Explicit current
instructions override memory. Use Upsy files for user documents; uploaded Agent
files may be private to this assistant, so do not promise cross-agent visibility.

If access fails, distinguish expired authentication, missing service connection,
denied permissions and provider outage. Do not bypass a denial through another
route. Native cloud plugins are the last resort for a demonstrated required gap.
Report which capability is missing; do not claim that a local skill replaces an API.

Upsy OAuth stays client-local. Shared definitions and instructions contain no
tokens. ChatGPT uses its Upsy plugin/connection; local agents use the shared MCP.
