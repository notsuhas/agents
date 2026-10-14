---
name: analyze-connected-data
description: Analyze connected business or product data through Upsy and produce reproducible local reports, tables or charts with explicit metric definitions and evidence.
---

# Connected data analysis

Resolve the decision being made, target account/project, metric definition,
date window, timezone and comparison before querying. Use existing business
context or governed metric definitions when available; disclose unresolved ones.

Discover the source through Upsy and inspect its live schemas. Use source-specific
guidance for PostHog, Mixpanel, spreadsheets or another provider. Start with bounded
reads. Record filters, grain, units, sampling, pagination and completeness.

Separate raw extraction from transformations. Check missing values, duplicates,
join cardinality and denominator changes before attributing a metric movement.
Compare like periods and populations. Preserve reproducible query/transform code
locally without embedding credentials or private data in the public skill repo.

Use the host's supported SQL, notebook, plotting and artifact tools. Export shared
scientific figures with a standard plotting tool; use a supported HTML preview and
renderer for interactive exploration. Label axes, units, window and data sources.
Keep a downloadable artifact when requested; do not require ChatGPT Sites or a
proprietary dashboard template to complete ordinary analysis.

Lead the report with the finding and its evidence, then material uncertainty and
the decision it supports. Distinguish descriptive correlations from causal claims.
An empty result or permission failure does not establish a zero metric. Publishing
or sharing the report is a separate action subject to the user's authorization.

This local workflow does not replace provider-specific Sites publication,
proprietary templates or native office live-control runtimes. Name a required
missing capability rather than silently importing its cloud dependency.
