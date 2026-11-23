---
name: system-design
description: Design Python/ADK service boundaries, new features, storage choices, scaling or reliability tradeoffs; use before structural changes.
---

Read [architecture](../../../docs/ARCHITECTURE.md), the affected feature and current dependency contracts. Establish actors, use cases, tenancy, data sensitivity, throughput, latency, availability and budget targets; label unknowns as assumptions.

Trace the request, data and failure paths. Keep domain logic pure, I/O in adapters and assembly in bootstrap. Add an interface only where there is a real substitution or testing boundary. Start with a modular monolith; split deployment only when independent scaling, ownership or isolation justifies the cost.

Compare two plausible designs against those requirements. Explain consistency, idempotency, retries, cancellation, backpressure, migrations and rollback. Use an ADR for consequential choices; include authorization and data egress boundaries. Do not call a pattern an industry standard without a primary source.

Implement the smallest vertical slice and a behavior test. If the destination project uses import contracts, update them and run its architecture checks and relevant tests. This toolkit imposes no application layout. Distinguish implemented guarantees from the production design checklist.
