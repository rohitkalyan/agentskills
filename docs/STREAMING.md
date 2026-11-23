# Streaming and realtime guidance

The toolkit contains a streaming skill, not a stream server or ADK runtime. Choose transport and protocol inside the user's project.

Use SSE for one-way server updates. Choose WebSocket/live bidirectional transport only when ongoing client input requires it. Define event types, ordering, IDs, terminal states, error behavior and reconnection before coding.

For partial model text, distinguish deltas from a final aggregate. Do not append the same content twice. Filter provider-internal thought parts and validate which events are intended for the caller.

Use structured framing, bounded messages/queues, deadlines and explicit cleanup. Cancel upstream work after disconnect; avoid speculative retries after bytes have been sent. Authenticate and authorize private streams before output.

Test framing injection, cancellation, timeouts, final/error handling, slow consumers and provider cleanup. Reconnection must not repeat paid tool calls or mutations silently. Live voice requires its own privacy, interruption and audio-lifecycle design.

Verify current provider APIs with primary documentation before adopting a new model streaming feature.
