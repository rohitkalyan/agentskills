---
name: mcp-integration
description: Add, configure, debug or review MCP servers and ADK MCP tools; choose server scopes, transport, provenance and tool allowlists.
---

Read [MCP setup](../../../docs/MCP.md) and only the relevant registry entry. Prefer a sufficient existing connector or direct API over adding another server. Verify current maintainer documentation, pinned package/image, licensing and required authentication.

Use stdio for local tools. For hosted tools verify the transport/protocol version, TLS, identity, scope and timeouts. Inspect the destination project's installed MCP SDK before reusing version-specific examples. Inspect installed signatures and test the actual client/server boundary.

Keep credentials in environment names or the host OAuth store. Limit tools and underlying account permissions independently; tool annotations and client allowlists are not an authorization boundary. Treat remote content as untrusted data, bound output and avoid arbitrary shell, filesystem roots or SQL.

Update the registry with source, review date, status and requirements. External templates remain disabled until deliberately configured. Use the destination project's integration checks to verify tool listing, allowed calls, invalid input and shutdown; check ADK tool filtering only if ADK is part of that project. Close a toolset in the same async task that opens it. Do not claim remote compatibility from configuration validation alone.
