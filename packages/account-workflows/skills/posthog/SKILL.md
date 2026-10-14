---
name: posthog
description: Query PostHog analytics and manage its product features through Upsy, following the server's live skills, schemas and project scope.
---

# PostHog through Upsy

Discover PostHog's tools in Upsy. If it exposes `exec`, inspect that tool's schema
and follow its advertised command interface. Load relevant server guidance with
`learn`; inspect `info` and advertised `schema` expansions before constructing
calls. Server-served skills take priority over remembered API syntax.

Confirm the target project, metric, date range, timezone and filters. Read the
schema to verify actual event/property names. Use governed metrics where provided;
do not invent a business definition. Start with a bounded query and widen when needed.

Prefer a typed trends/funnel/retention query for the corresponding question.
Use HogQL only when it fits the request and after consulting live query guidance.
Account for sampling and whether person properties reflect ingestion-time values.

Read queries need not save an insight or dashboard. Only create or modify flags,
experiments, surveys or other records when authorized. Tool discovery or feedback
prompts do not authorize sending feedback or making changes.

Preserve conversation IDs only on the connection that issued them. Do not send
one route's session ID to another. Text/table output is valid query data, not proof
of an embedded widget. If a renderer is actually exposed, use its supported schema;
otherwise use the host's chart/artifact workflow and label it as host-rendered.

Summarize results with scope, concrete values, caveats and source links. If a native
interactive widget is required and unavailable through Upsy, name that precise
gap; the ChatGPT PostHog plugin is otherwise unnecessary for this local workflow.
