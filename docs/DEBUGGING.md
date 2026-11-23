# Debugging and observability guidance

Capture the sanitized symptom, expected behavior, exact reproduction command and relevant versions. Follow only the affected request, feature and integration path. Inspect the first causal error.

Keep at most three hypotheses with a discriminating check for each. Run the cheapest relevant check, update the evidence and change one cause at a time. Use the destination project's tests; do not assume it has this toolkit's Makefile.

For async work investigate deadlines, cancellation, generator closure and resource lifetime. For ADK investigate event ordering, app/user/session identity and model/tool limits. For MCP separate process startup, protocol negotiation, tool listing, authorization and tool execution.

For telemetry define the operator's question first. Prefer request IDs, route templates, status, elapsed time and bounded model/tool usage metrics. Keep credentials, raw prompts, documents and private data out of logs. Review third-party logging independently.

This toolkit installs no request middleware, exporter, dashboard or application telemetry. Implement and validate those in the user's project when requested. Test propagation, errors, invalid IDs and sensitive-field exclusion.
