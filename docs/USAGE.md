# Installed coding-assistant toolkit

This library is managed by agent-skills install. Put project-specific changes outside it. Updates refuse to erase edited managed files.

The canonical skill library is .agent-skills/.agents/skills/. Native host entrypoints link there. Read only the relevant skill and follow links from the canonical file. Rules, agent profiles, documentation, provenance and MCP recipes accompany it.

The toolkit runs on Node.js and shell commands. No Python interpreter, pip, uv, virtualenv, application code or application dependency installation is required. Python examples within skills are instructions for your own project.

## Commands inside your custom project

    sh .agent-skills/run.sh context resume
    sh .agent-skills/run.sh context map
    sh .agent-skills/run.sh context checkpoint --summary '...' --next '...' --checks '...'
    sh .agent-skills/run.sh git-sync sync

The sync command requires a clean branch and configured remote. It merges main before work; the pre-push guard checks freshly fetched main without mutating a push.

The code map uses bounded text matching, not a Python AST parser. Treat it as navigation and verify source. Compact handoffs live in .context/local/, ignored by Git. Hooks never call a model or collect raw transcripts.

References to docs/, rules/ and configs/ mean files beneath .agent-skills/. PROJECT.md describes your own project. Discover your project's test, coverage and scanner commands rather than assuming the toolkit's npm maintenance commands exist there.

## Activation

Reload the host in this same workspace and inspect actual skill/tool activity. Keep the npm package installed for the local MCP server; rerun installation after moving the package, Node executable or project. Copied context/Git helpers need Node only and do not require node_modules inside your project.

Cline: import .agent-skills/mcp/cline.json in its MCP settings and enable supported hooks. Other hosts may require trust or activation. No account settings are changed. Normal web chat cannot automatically read local files.

The local MCP returns public bundled guidance only. External entries remain optional recipes/catalog references. They require their own runtimes, authentication and permissions.
