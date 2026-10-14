---
name: sentry
description: Investigate Sentry issues, events and production errors through the user's Upsy connection, using live discovery and bounded read queries.
---

# Sentry through Upsy

Discover Sentry in Upsy's app catalog and inspect the relevant tool schemas.
Use the requested organization, project, environment and time range; do not
silently substitute production or a different account. Start with bounded reads.

Use the advertised organization/project discovery and issue/event search tools.
Resolve returned issue IDs before requesting details. For dynamically exposed
operations, use the returned discovery and execution tools with their exact
schemas. Use explicit sorting when the server rejects an automatic sort.

Summarize the observed errors, counts, time range and useful issue links.
Separate symptoms from a proposed root cause. Avoid dumping personal identifiers
or full event payloads. Empty results do not establish that production is healthy.

Issue changes and Seer analyses are separate actions, not part of a read audit.
Follow existing authorization and disclose effects before a new action needing it.
After a timeout, inspect state before retrying a mutation.

Upsy supplies authenticated Sentry access. This workflow does not require the
ChatGPT Sentry skill plugin, a second direct MCP registration, or a local REST
token. If Upsy lacks a requested operation, report that specific gap before
choosing an authorized local helper or native connection.
