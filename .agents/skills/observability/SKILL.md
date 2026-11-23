---
name: observability
description: Add or inspect Python request telemetry, error diagnostics, LLM latency/cost metrics, tracing or production monitoring design.
---

Read [debugging and telemetry](../../../docs/DEBUGGING.md). Start from the question an operator must answer: error rate, latency, model/tool failures, token cost or queue backlog. Select low-cardinality measurements and useful correlation IDs.

Inspect the project's existing telemetry. Prefer request ID, route template, method, status and elapsed time where useful; no middleware is supplied by this toolkit. Never log credentials, raw prompts, retrieved documents, database contents or unbounded identifiers. Redact at collection, not only at display.

For a real deployment add an explicitly configured OpenTelemetry exporter, retention, sampling and access policy. Link HTTP, model and tool spans without sending their contents by default. Define an SLO and actionable alert with owner/runbook; avoid alerts for unchanged routine state.

Test propagation, invalid IDs, errors and sensitive-field exclusion. Report which telemetry is implemented versus a proposed exporter/dashboard. Inspect third-party SDK logging separately; the request middleware cannot redact another library's logs.
