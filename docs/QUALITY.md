# Quality guidance

Use the destination project's own tests, type checks, coverage, security and deployment checks. Installing these skills does not choose the application tooling, coverage threshold or CI workflow.

For this Node toolkit, run:

    npm ci --ignore-scripts
    npm run check
    npm run audit:deps
    npm run pack:check

These check skill metadata/provenance, local links, configuration, JavaScript/shell syntax, installation/update/uninstall, hooks, context, Git and actual MCP connections. The package smoke test installs the npm tarball outside the checkout.

The old Python test counts and coverage gate do not apply to this rewrite. Node's built-in test runner executes behavioral tests; no numeric coverage gate is claimed. Optional coverage inspection: node --test --experimental-test-coverage.

For a custom Python project, identify meaningful uncovered branches and appropriate tools there. Coverage percentages are execution evidence, not a substitute for assertions.
