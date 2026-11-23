# npm setup before building a custom project

Use Node.js 22+, npm and Git. This toolkit has no Python dependency. It supplies skills, rules, agent profiles, shell hooks and a Node guidance MCP; it supplies no application.

## One-command setup from a checkout

Clone the toolkit and install its npm dependencies once:

    git clone https://github.com/rohitkalyan/agentskills.git
    cd agentskills
    npm ci --ignore-scripts

Then, from your custom project's existing directory:

    sh /path/to/agentskills/install.sh --project . --clients all

The script uses the locked npm dependencies in the toolkit checkout and writes assistant files into the project. Keep the checkout in place for its MCP server. No node_modules or package.json is added to the project.

## Install a reusable CLI

Install the CLI directly from the GitHub repository:

    npm install -g git+https://github.com/rohitkalyan/agentskills.git

Then, from each custom project folder:

    agent-skills install --project . --clients all
    agent-skills doctor --project .

This installs the command from the Git repository; it does not publish the package to npm. If the GitHub repository is private, your Git credentials must have access.

Select hosts with --clients codex,cline or use all. --no-mcp, --no-hooks and --no-git-hook omit components. Native Windows shell hooks remain unverified; use WSL or disable both hook types. Existing Git hook managers are preserved and reported for integration.

## Activate

Reload your assistant in the same folder. Inspect skill discovery, profiles, hooks and MCP. Doctor checks files, paths and ownership; it does not prove host activation. Cline requires importing .agent-skills/mcp/cline.json in its MCP settings. Keep the npm installation available for the guidance MCP. External services still need selected credentials and scopes.

## Daily commands

    sh .agent-skills/run.sh context resume
    sh .agent-skills/run.sh context map
    sh .agent-skills/run.sh context checkpoint --summary '...' --next '...' --checks '...'
    sh .agent-skills/run.sh git-sync sync

The copied helpers use Node built-ins only; no npm install inside your application is required. The navigation index is bounded text matching, not a Python parser. Sync requires a clean branch and remote.

## Upgrade and migration

Install the newer npm archive, then rerun agent-skills install in each project. --dry-run previews changes without writing. The Node installer reads legacy 0.3/0.4 ownership manifests and removes their owned Python helpers and hook/MCP settings before adding Node replacements. It never executes Python during migration. Edited managed files stop the update; preserve your edits separately.

Old global Python tool installations can be retired after their projects are migrated. Check command -v agent-skills and agent-skills --version afterward: an old shim earlier on PATH can shadow the npm executable. No Python tool environment is needed by 0.5.

## Uninstall or export

    agent-skills uninstall --project . --dry-run
    agent-skills export-plugin --output /path/to/empty/directory

Omit --dry-run to apply uninstall. Unrelated project content and private handoffs survive. The export is a skills-only unpublished plugin; local hooks/MCP require workspace installation. See [compatibility](COMPATIBILITY.md).
