---
name: streaming-realtime
description: Build or debug HTTP SSE, ADK token streaming, cancellation, backpressure or a proposed WebSocket/live voice feature.
---

Read [streaming](../../../docs/STREAMING.md). Choose one-way SSE for server updates; use bidirectional transport only for a concrete client-input requirement. Specify event names, ordering, terminal events, error semantics and reconnection policy before implementation.

For ADK expose partial text as deltas and final text as an authoritative replacement. Filter thought parts. Do not append final aggregates to already displayed deltas. A replay must not silently re-run billable tools or duplicate mutations.

Use structured JSON framing, bounded messages, end-to-end timeouts and explicit async generator closure. Stop work after disconnect or cancellation; avoid unbounded queues, blocking I/O and speculative retries after bytes have been sent. Authenticate and authorize before starting a private stream.

Test framing injection, disconnect, slow consumer behavior where queues exist, timeout, final output and provider cleanup. Verify the destination project's actual transport and runtime. The toolkit provides no HTTP demo, ADK CLI or live voice implementation.
