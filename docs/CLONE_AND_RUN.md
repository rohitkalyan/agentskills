# Clone and run the toolkit

This GitHub repository is a coding-assistant toolkit, not a Python or web application. You clone it to install skills, agents, rules, hooks and MCP guidance into the separate project you want to build.

## Requirements

- Node.js 22 or newer and npm
- Git
- A supported coding assistant; see [host compatibility](COMPATIBILITY.md)

No Python interpreter, pip, uv or Python virtual environment is needed for this toolkit.

## Option A: clone once and install into projects

Clone the toolkit and install its locked Node dependencies:

    git clone https://github.com/rohitkalyan/agentskills.git
    cd agentskills
    npm ci --ignore-scripts
    npm link

Keep this checkout in place because the local MCP server uses files from the toolkit installation. From the root of each existing project, install the assistant configuration:

    sh /path/to/agentskills/install.sh --project . --clients all
    agent-skills doctor --project .

To make the `agent-skills` command available after using the install script, link the CLI once from the toolkit checkout:

    cd /path/to/agentskills
    npm link

Or skip the global link and run the local CLI directly:

    node /path/to/agentskills/bin/agent-skills.mjs install --project /path/to/your/project --clients all

## Option B: install the command from GitHub

Install the package globally from the repository:

    npm install -g git+https://github.com/rohitkalyan/agentskills.git

Then use it inside each project:

    agent-skills install --project . --clients all
    agent-skills doctor --project .

The global npm installation keeps its own dependencies. The package contains the local MCP server, so the toolkit clone is unnecessary for the CLI flow. An existing package can be updated with `npm update -g agent-skills-toolkit`.

## What setup writes

The installer writes managed skill entrypoints and one canonical skill library, shared rules, selected host agent profiles and hooks, the local guidance MCP settings and—when Git is initialized and no hook manager conflicts—a pre-push freshness check. It does not create application source, a Python dependency manifest, a Node application package or CI workflow.

If you want the Git guard, initialize Git before installation. If you run `git init` afterward, rerun the installer. The push guard fetches the destination's main branch and blocks stale branch updates; it does not merge during `git push`.

After installation, open that same project folder in your assistant, trust it if the host asks, and reload its workspace. Cline requires importing `.agent-skills/mcp/cline.json` in MCP settings. External MCP services require their own selected credentials and permissions.

## Checks for contributors

From the toolkit clone:

    npm ci --ignore-scripts
    npm run check
    npm run audit:deps
    npm run pack:check

These commands validate and package the toolkit. They do not run or deploy an application.
