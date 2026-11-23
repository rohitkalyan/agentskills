# MCP integration catalog

The machine-readable registry is configs/mcp/registry.json. Version 0.5 has 15 categories: eight configuration recipes and seven deployment-specific references. Only the local guidance connection is enabled by installation.

## Node guidance server

The npm package uses the official TypeScript SDK and stdio transport. It exposes skill_catalog, read_skill and framework_info. Output is bounded public skill content; it has no project-file, shell, secret, model or external-network access.

Install with agent-skills install --project PATH --clients all, then reload/trust the chosen host. Generated launch commands use Node and the installed package's lib/mcp-server.mjs. There is no Python server or virtualenv. Keep that npm installation or source checkout in place; rerun installation after moving it.

For a direct stdio launch from the source checkout, run node lib/mcp-server.mjs. This waits for MCP JSON-RPC input and is intended for an MCP client, not an interactive chat. A real SDK client/server test runs in npm run check and npm run pack:check.

Sources: [official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), [stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports). Protocol negotiation is delegated to the pinned SDK; no claim is made that every host supports every newer protocol revision.

## Available integrations

| ID suffix | Purpose and upstream | Default / prerequisites |
| --- | --- | --- |
| local | [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Enabled; installed npm package and Node |
| docs | [OpenAI documentation](https://developers.openai.com/learn/docs-mcp) | Disabled; discover tool schemas and set allowlist |
| filesystem | [Reference filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) | Disabled; Node/npx; source directory only |
| git | [Reference Git server](https://github.com/modelcontextprotocol/servers/tree/main/src/git) | Catalog only; use native Git shell commands and bundled push guard |
| github | [GitHub's server](https://github.com/github/github-mcp-server) | Disabled; fine-grained read-only token, selected repositories |
| playwright | [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) | Disabled; Node, browser binaries; isolated profile |
| tavily | [Tavily research](https://github.com/tavily-ai/tavily-mcp) | Disabled; API key; queries go to provider |
| qdrant | [Qdrant vector retrieval](https://github.com/qdrant/mcp-server-qdrant) | Catalog only; separately managed retrieval endpoint and selected collection |
| sonarqube | [SonarQube findings](https://github.com/SonarSource/sonarqube-mcp-server) | Disabled; Docker, URL, appropriate user token; read-only mode |
| sentry | [Sentry errors](https://mcp.sentry.dev/) | Disabled; scoped URL, OAuth and chosen tool allowlist |
| database | [Google MCP Toolbox](https://github.com/googleapis/mcp-toolbox) | Catalog only; source/query definitions and database role needed |
| redis | [Redis MCP](https://github.com/redis/mcp-redis) | Catalog only; pinned release, key scope and Redis ACL needed |
| semgrep | [Semgrep MCP](https://github.com/semgrep/semgrep/tree/develop/cli/src/semgrep/mcp) | Catalog only; vetted CLI/rules and source handling policy |
| dory | [Dory SQL workspace](https://github.com/dorylab/skills) | Catalog only; skill installed, runtime/account/connection not configured |
| google_cloud | [Google Cloud services](https://docs.cloud.google.com/mcp/overview) | Catalog only; service, project, endpoint and IAM needed |

Package recipes pin the reviewed direct release; Sonar uses an image digest. External server installs are outside the toolkit's lockfile and audit; vet their full dependencies before enabling them. Hosted servers can change independently. The catalog records provenance and review dates, not a promise of perpetual compatibility.

## Enable a selected external integration

1. Read its registry entry and current maintainer documentation. Choose the account, permitted data and concrete tools needed for the task. Prefer an existing sufficient connector/API if available.
2. Install the required runtime deliberately. Use least-privilege credentials restricted by the provider itself. Forward environment names using `env_vars` or `bearer_token_env_var`; keep values in the host environment/secret store. OAuth login is a separate host action.
3. Inspect the server's current tool schemas in a controlled environment. Set a nonempty `enabled_tools` allowlist. The docs and Sentry templates deliberately start with no tools available.
4. Set `enabled = true` only for that server in local TOML. Reload the host, test tool listing and a harmless read, then verify denied operations and shutdown.
5. Record version/protocol, scope, owner, validation and the next review date. Do not treat a successful handshake as proof of safe tool behavior.

Stdio is appropriate for local processes. For hosted servers, verify the provider's supported HTTP transport and protocol revision; the ecosystem evolves. Client allowlists and `read_only_hint` annotations do not replace server authorization or an OS sandbox. A filesystem process can still have normal process permissions; a browser can send network traffic. Keep arbitrary URLs, broad shell execution and unrestricted SQL outside the default tool surface. See [MCP security guidance](https://modelcontextprotocol.io/specification/latest/basic/security_best_practices).

Development handoffs in `.context/local` remain private local state. Application chat storage is a decision for the destination project. A vector store or memory MCP is not a substitute for access-controlled, versioned memory with retention and deletion rules.
