# Toolkit repository instructions

This is a pre-project coding-assistant toolkit. Keep it limited to skills, agents, rules, hooks, MCP guidance and helper tooling. Do not add application scaffolds, Python runtime code, model dependencies or demo APIs.

Read .context/PROJECT.md and run node bin/agent-skills.mjs context resume. Read rules/CORE.md. Verify historical handoffs against source and Git. Never impose the toolkit's Node layout or maintenance checks on a custom Python project.

Runtime: Node.js 22+, npm and Git. Use npm ci --ignore-scripts for the locked dependencies. npm run check validates skills, hashes, references, Node/shell syntax and behavior. npm run audit:deps checks dependency advisories. npm run pack:check exercises the npm tarball in isolation.

Use node bin/agent-skills.mjs git-sync sync only on a clean branch with a configured main remote. Preserve existing hooks and unrelated project files. Never merge during a push or discard work to pass a check.

External MCP entries remain optional and need deliberate scopes/authentication. Keep secrets out of source and archives. Preserve third-party skill licenses and integrity records. Use specialist delegation only when requested.

Before ending substantive work, save a checkpoint with node bin/agent-skills.mjs context checkpoint --summary '...' --next '...' --checks '...'. No raw chat or secrets.
