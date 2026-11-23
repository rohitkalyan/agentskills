---
name: api-contracts
description: Add or change FastAPI endpoints, request/response schemas, error contracts, authentication boundaries or API compatibility.
---

Inspect the feature route and [architecture](../../../docs/ARCHITECTURE.md). Define typed inputs, bounded sizes, response schemas, status codes and compatibility before implementation. Keep transport validation at the boundary and business decisions in domain/service code.

Private endpoints need server-verified identity and per-resource authorization. Never accept a client-supplied user/tenant ID as proof of identity. Use parameterized data access, explicit timeouts and an intentional retry/idempotency policy for mutations.

Document error responses without exposing stack traces or secret details. Use stable pagination and versioning only where consumers require them. Keep public health checks free of sensitive configuration. For streaming consult `streaming-realtime` because headers/status cannot be replaced after streaming starts.

Test public contracts, invalid inputs, unknown resources and authorization failures where identity exists. This toolkit includes no API. Inspect the destination project's authentication and data boundaries before adding routes.
