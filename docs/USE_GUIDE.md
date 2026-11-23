# How to use the toolkit

Install the toolkit into your project and reload the coding assistant first. Start work in the folder containing the application you want to build, not in the toolkit clone.

## 1. Start with your project context

Ask the assistant to read your project instructions, then resume the compact handoff:

    sh .agent-skills/run.sh context resume

If you are starting a project, describe its goal and constraints. Ask for a design proposal before asking it to generate code when the architecture is still open. The toolkit provides Python and agent-engineering knowledge; it does not choose a project layout for you.

## 2. Ask for the change you need

For example:

> Add a CSV upload endpoint to this application. First map the request path and current tests, then propose the smallest design. Implement it using the project's existing conventions and run its relevant checks.

The host/model chooses relevant skills based on the prompt. To make routing explicit, name a skill:

> Use `debugging-python` to trace this failure from the entrypoint through the affected function and test. Reproduce it, explain the cause, fix it, and verify the regression test.

Use host UI activity, such as “Read skill” events and opened skill files, to confirm what was loaded. A model saying it used a skill is not proof that the host invoked it. Automatic selection varies across hosts and models.

## 3. Use specialist agents when they fit

Ask for a focused review when it helps:

- “Use the system architect profile to compare two designs and record the tradeoffs.”
- “Use the security reviewer profile to trace this scanner finding from source to sink.”
- “Use the test engineer profile to identify important untested branches.”

Agent profiles are optional instructions. The host controls whether and how it invokes them.

## 4. Connect MCP services deliberately

The built-in local MCP offers `skill_catalog`, `read_skill` and `framework_info` for public toolkit guidance. It cannot inspect your app, run commands or read credentials.

The registry also lists external MCP options. Pick only a service needed for your task, check its permissions and authentication, and configure it in the relevant host. Installing a recipe does not connect an account. Cline requires a manual import of `.agent-skills/mcp/cline.json`.

## 5. Keep session context compact

At the beginning of later sessions:

    sh .agent-skills/run.sh context resume

Create a bounded code map when the repository is unfamiliar:

    sh .agent-skills/run.sh context map

Before a handoff, save decisions and verified checks:

    sh .agent-skills/run.sh context checkpoint \
      --summary 'Implemented invoice upload validation and storage boundary.' \
      --next 'Review the migration and run the full project suite.' \
      --checks 'Targeted upload tests passed.'

Hooks capture Git metadata; they do not read the transcript or infer what you decided. The assistant must write the semantic checkpoint. The map is a navigation aid and must be checked against current code.

## 6. Keep Git current

Before work on a branch, sync a clean tree with main:

    sh .agent-skills/run.sh git-sync sync

Run the custom project's tests and checks before pushing:

    git push

The pre-push guard fetches main and blocks stale branches. Resolve a blocked push by syncing, resolving any merge, running the project checks and pushing again. It never merges while the push is in progress. GitHub authentication, pull requests and branch protections remain controlled by your Git/GitHub setup.

## 7. Update or remove the toolkit

After updating the npm package or toolkit checkout, rerun `agent-skills install --project . --clients all`. Preview changes with `--dry-run`. The ownership manifest tracks toolkit-managed files; edited managed content blocks updates so it can be preserved.

Preview uninstall:

    agent-skills uninstall --project . --dry-run

Remove the flag to apply it. The installer preserves unrelated project files and local semantic handoffs.
