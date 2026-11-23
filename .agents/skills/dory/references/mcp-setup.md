# Dory connection setup

Use this reference only for an actual request to configure Dory. The skill itself has no executable helpers and performs no connection setup.

For an installed Dory Desktop, the upstream skill documents Settings → Agent Access → MCP access. Use the endpoint displayed by that installation; the documented loopback default is `http://127.0.0.1:3318/api/mcp`. Confirm the active user, organization and intended database before loading tools. Desktop manages its local grant; do not request tokens in chat.

For standalone stdio, headless HTTP or a hosted bridge, read the [pinned upstream setup reference](https://github.com/dorylab/skills/blob/5066789e2e7720b3c677070054598692887a3bbd/plugins/dory/skills/dory/references/mcp-setup.md) and current [Dory documentation](https://getdory.dev/). Verify a concrete CLI release, its provenance, required Node version and existing local storage before executing an installer. The original reference contains unpinned npx/global-install examples; they are not automatically approved setup steps for this framework.

Configure only the needed tool names, with server-side permissions and database roles. Use the host's credential store or environment variable names, never literal tokens in repository configuration. Keep HTTP loopback-only unless TLS, identity and the deployment scope have been deliberately configured.

Test listing tools and a harmless authorized schema read before analysis. Read-only SQL may still save Dory workspace tabs, Agent Runs and result snapshots. Distinguish database permissions from workspace writes. Never invent schemas, connections or results when the MCP tools are unavailable.
