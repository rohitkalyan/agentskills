# Project context

Agent Skills Toolkit 0.5.0 is a local npm package for preparing coding assistants before building a custom Python project.

- User explicitly replaced Python toolkit dependencies with npm/Node and shell commands.
- No Python implementations, Python manifests, virtualenv or Python-based helper launchers belong here.
- lib/ and bin/: Node installer, safe updates/uninstall, context/Git and guidance MCP.
- install.sh: one-command npm setup and project installation; copied run.sh invokes Node helpers.
- .agents/skills/: 22 workflows; .codex/agents/: nine profiles; rules/: shared instructions.
- configs/mcp/: 15 categories, eight recipes and seven catalog references; only local guidance enabled.
- npm-shrinkwrap.json: pinned npm dependencies. test/: Node built-in tests.
- No application scaffold is installed. Python examples in skills are knowledge for destination projects.

Consumer: install local npm tarball globally, then agent-skills install --project PATH --clients all. Or use sh install.sh --project PATH from a stable checkout. Reload the host and verify actual skill/tool activity. Cline MCP import and external authentication remain separate.

Maintenance: npm run check, npm run audit:deps, npm run pack:check. GitHub remote: https://github.com/rohitkalyan/agentskills.git. The project has not been published to the npm registry.
