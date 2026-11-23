# Agent Skills Toolkit

Install skills, agent profiles, rules, hooks and MCP guidance before building your own Python project. Version 0.5.0 is an npm package. It requires Node.js 22+, npm and Git. There is no Python, pip, uv, virtualenv or application runtime dependency.

## Clone and set it up

    git clone https://github.com/rohitkalyan/agentskills.git
    cd agentskills
    npm ci --ignore-scripts
    npm link

This installs the reusable `agent-skills` command from your clone. Keep the clone in place while using its local MCP server. The repository is not an application and has no web server to run.

In the folder of your own existing project:

    agent-skills install --project . --clients all
    agent-skills doctor --project .

The project folder must already exist. Initialize Git first if you want the pre-push guard, or rerun `agent-skills install` after `git init`. Windows users can use WSL; native Windows hooks are unverified.

See [Clone and run](docs/CLONE_AND_RUN.md) for setup alternatives and [How to use it](docs/USE_GUIDE.md) for the coding workflow.

## Included

- 22 skills, including Python/ADK guidance, debugging, security, coverage, design, research and streaming.
- Nine optional specialist agent profiles.
- Shared rules for context, quality, Git and tool permissions.
- Session hooks, compact handoffs and a bounded code navigation index.
- A pre-push guard that fetches main and rejects stale pushed commits.
- A local read-only guidance MCP and a 15-category integration catalog.

No application source, package.json, pyproject, node_modules or CI scaffold is created in the destination. Your project's language, dependencies and architecture remain your choice. Node runs only the toolkit helpers.

Open the same project folder in your assistant and reload discovery. Cline requires importing its generated MCP settings. External services require their own authentication; web chat does not automatically gain local file access. Inspect actual skill/tool activity to verify invocation.

## Daily shell commands

    sh .agent-skills/run.sh context resume
    sh .agent-skills/run.sh context map
    sh .agent-skills/run.sh context checkpoint --summary '...' --next '...' --checks '...'
    sh .agent-skills/run.sh git-sync sync

The sync command requires a clean branch and configured remote. It merges main before work; the guard never merges while pushing. Hooks save metadata; the assistant writes semantic checkpoints. Context savings and complete code understanding are not guaranteed.

## Repository map

- .agents/skills/: canonical knowledge and upstream licenses.
- .codex/agents/: agent profiles.
- rules/ and configs/: shared rules and MCP registry.
- lib/ and bin/: Node toolkit helpers.
- install.sh and scripts/: shell setup and npm maintenance.
- test/: Node behavioral tests.
- npm-shrinkwrap.json: locked npm dependency tree.

Maintainers run npm ci --ignore-scripts, npm run check, npm run audit:deps and npm run pack:check. These checks validate the toolkit, not the user's application.

[Clone and run](docs/CLONE_AND_RUN.md) | [How to use it](docs/USE_GUIDE.md) | [installation details](docs/INSTALL.md) | [compatibility](docs/COMPATIBILITY.md) | [MCP](docs/MCP.md) | [Git](docs/GIT_WORKFLOW.md) | [skills](docs/CATALOG.md) | [validation](docs/VALIDATION.md)
