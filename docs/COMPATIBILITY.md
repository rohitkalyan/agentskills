# Cross-client research and compatibility

Reviewed 2026-11-21 against primary documentation and publisher source. These docs
track current releases, not a permanent common API. Minimum versions are not inferred
when publishers do not specify them. Revalidate discovery, payloads and trust behavior
when upgrading a host. Package schema version is 2 (legacy 1 is read for migration); npm package version is 0.5.0.

## Implemented adapters

| Client | Skills / persistent instructions | Specialist profiles | Lifecycle / MCP |
| --- | --- | --- | --- |
| Codex local desktop/CLI/IDE | `.agents/skills/`, `AGENTS.md` | `.codex/agents/*.toml` | `.codex/hooks.json`, `.codex/config.toml` |
| Claude Code | `.claude/skills/`, `CLAUDE.md` pointer | `.claude/agents/*.md` | `.claude/settings.json`, `.mcp.json` |
| Cline extension/CLI | `.cline/skills/`, `AGENTS.md` | Reference roles only | Executables in `.clinerules/hooks/`; MCP config exported for UI/import |
| Antigravity App/CLI/IDE | `.agents/skills/`, `AGENTS.md` | `.agents/agents/*.md` | `.agents/hooks.json`, `.agents/mcp_config.json` |
| GitHub Copilot VS Code/CLI | `.github/skills/`, `.github/copilot-instructions.md` pointer | `.github/agents/*.agent.md` | `.github/hooks/agent-skills.json`, `.github/mcp.json` |
| Generic compatible host | Agent Skills discovery folders + `AGENTS.md` | Reference roles | Standard stdio MCP config export; no invented host hooks |
| ChatGPT plugin surfaces | Skills-only Agent Plugins 1.0 export | No profile translation claimed | Publishing/local marketplace is a separate host step |

The common unit is a skill folder with frontmatter and on-demand resources, as defined
by [Agent Skills](https://agentskills.io/specification). Clients receive small discovery
entrypoints pointing at one canonical library. No symlink support is assumed. This
preserves upstream license/provenance files and avoids injecting all references into
every prompt. Token savings depend on the host and task; no measured savings claim
is made. A generic host needs file access or the guidance MCP to read the library.

## Evidence and decisions

**Codex.** Repository skills are discovered through `.agents/skills`; local hooks
load from trusted `.codex/hooks.json`. Current docs say hooks are enabled by default;
we do not write a deprecated feature flag or override the user's policy. A SessionStart
response supplies bounded additional context; Stop/PreCompact only write Git metadata.
Sources: [skills](https://learn.chatgpt.com/docs/build-skills),
[hooks](https://learn.chatgpt.com/docs/hooks),
[MCP](https://learn.chatgpt.com/docs/extend/mcp).

**Claude Code.** Skills, project settings hooks, project MCP configuration and Markdown
subagents are distinct surfaces. The adapter inherits the caller's model and permissions,
without preapproving tools. SessionStart returns the documented hook-specific context
object. Sources: [skills](https://code.claude.com/docs/en/skills),
[hooks](https://code.claude.com/docs/en/hooks),
[subagents](https://code.claude.com/docs/en/sub-agents),
[MCP project scope](https://code.claude.com/docs/en/mcp#project-scope).

**Cline.** Current skill discovery uses `.cline/skills/`; rules also accept `AGENTS.md`.
Extension MCP settings are selected through its UI; CLI settings have a documented
environment override. Hooks use TaskStart/TaskResume and `contextModification`, not
Claude's JSON envelope. Publisher source warns that CLI/SDK run-start hooks can be
fire-and-forget; explicit resume instructions remain necessary. TaskComplete is marked
coming soon in that source and is not installed. Sources:
[skills](https://docs.cline.bot/customization/skills),
[rules](https://docs.cline.bot/customization/cline-rules),
[MCP](https://docs.cline.bot/mcp/mcp-overview),
[publisher hook contract](https://github.com/cline/cline/blob/main/.clinerules/hooks/README.md).
The short public hooks page currently defers to SDK plugins, so it was insufficient
alone to establish the executable hook protocol.

**Antigravity.** Current documentation uses plural `.agents` for workspace discovery
across App, CLI and IDE, with singular legacy aliases. Its hook file maps a named
hook group to events; SessionStart handlers are direct arrays and return `injectSteps`.
We therefore render a separate adapter instead of copying Claude/Codex hook JSON.
Custom agents use documented tool identifiers and sandbox command policy. Sources:
[discovery](https://antigravity.google/docs/customization-discovery),
[skills](https://antigravity.google/docs/skills),
[hooks](https://antigravity.google/docs/hooks),
[subagents](https://antigravity.google/docs/subagents),
[MCP](https://antigravity.google/docs/mcp).

**Copilot CLI.** It discovers common project skill directories and Markdown custom
agents. Hook version 1 uses lower-camel event names and `bash` commands. Current
SessionStart consumes an `additionalContext` string. The CLI reads project `.mcp.json`
and `.github/mcp.json`; `.mcp.json` wins at the same level. When Claude and Copilot are
installed together, the shared local server command is equivalent in both files.
No claim is made that VS Code reads these same MCP settings. Sources:
[skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills),
[custom agents](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli),
[hooks](https://docs.github.com/en/copilot/reference/hooks-reference),
[MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers).

**ChatGPT and plugin distribution.** OpenAI documents a portable root `plugin.json`
and `skills/` layout, with local marketplace support varying by surface. An npm
package install cannot activate an arbitrary web chat or bypass directory publication,
account policy or workspace trust. This project exports the skills-only portable
format, preserving licenses and pointing to the unchanged reviewed content. It does
not claim a universal hook format or ship cloud credentials. Sources:
[plugin packaging](https://developers.openai.com/plugins/build/plugins),
[Agent Plugins manifest schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json).

## Verification boundary

Automated tests exercise filesystem installation, host-specific config parsing,
actual shell-hook invocation, bounded JSON output, context isolation, repeated updates,
drift rejection, conflict preservation, rollback, uninstall, a local stdio MCP handshake
and real Git push rejection/sync against a disposable bare remote. Packed npm archives are
installed and run outside the source checkout. These tests do not launch proprietary
host sessions or prove skill selection by their models.

External MCP services, database accounts, cloud credentials, enterprise scanner uploads
and public package/plugin publishing remain unconfigured. Host policy can disable
otherwise valid hooks or MCP. The package ships the reviewed 15-category registry as
reference data; it does not download every server or promise compatibility with every
client. Native Windows hooks and remote/cloud orchestration are not implemented.

## Extending the package

Add a host only after verifying its discovery path, instruction precedence, hook input
and output schemas, MCP transport/configuration, profile format and trust model from
primary sources. Implement its rendering in `lib/adapters.mjs`; add a
behavior test that executes its generated hook and verifies configuration preservation.
Keep generic skill and MCP fallbacks usable when a host has no equivalent capability.
Review new third-party skills with the existing pinned-source process; popularity on
skills.sh is discovery evidence, not a trust or correctness guarantee.

## Live VS Code verification (2026-11-21)

The Copilot harness detected zero workspace skills with only `.agents/skills/` and `.claude/skills/` entrypoints. Adding `.github/skills/` exposed all 22 workspace skills. The installer now generates this native Copilot location. A live `/debugging-python` prompt produced the `Read skill` tool event. Discovery alone does not prove automatic selection, hook execution, or MCP connectivity. See https://code.visualstudio.com/docs/agent-customization/agent-skills .
