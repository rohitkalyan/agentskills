---
name: debugging-python
description: Diagnose Python exceptions, failing tests, async hangs, streaming defects or ADK tool/session failures using reproducible evidence.
---

Read [debugging](../../../docs/DEBUGGING.md). Capture a sanitized symptom, expected behavior, exact command, dependency version and smallest reproduction. Follow the request through feature routes, domain logic and provider adapters; inspect the first causal error instead of only the final wrapper.

Keep at most three ranked hypotheses with a discriminating check for each. Run the cheapest relevant check, update the hypothesis, and change one cause at a time. Use request IDs and metadata; do not dump credentials, prompts, session databases or customer documents.

For async defects test timeout, cancellation, generator cleanup and resource lifetime. For ADK inspect partial versus final events, tool arguments, app/user/session identity and model-call bounds. For MCP isolate process startup, negotiation, tool listing, authorization and tool execution.

Add a regression test that fails before the fix, apply the smallest fix, run focused tests then required gates. Report root cause, evidence, changed behavior and any remaining uncertainty. Do not repair a failure by weakening assertions or hiding exceptions.
