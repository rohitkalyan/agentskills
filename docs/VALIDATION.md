# npm toolkit validation

Version 0.5.0 replaces the Python toolkit implementation with Node and shell entrypoints. Earlier Python test counts and coverage measurements do not describe this release.

Acceptance checks:
- No .py implementation, Python setup manifest or virtualenv in source or npm archive.
- All 22 skills, nine agent profiles, shared rules and upstream licenses retained.
- No application scaffolding, package manifest or node_modules installed into the destination.
- Migration reads old ownership manifests, removes owned Python helpers/configuration and preserves user files.
- Actual shell hooks, context, real Git push rejection/sync and real stdio MCP calls work.
- npm tarball installs and runs independently of the checkout.

Current check results are recorded after running npm run check, npm run audit:deps and npm run pack:check. Automated checks do not prove every host's UI activation, remote MCP authentication or enterprise scanner configuration. The prior live Copilot discovery/read-skill evidence remains historical.

Verified 2026-11-21 on macOS arm64:

- 32 behavioral tests passed on Node 22 and installed Node 25.1.0.
- Skill metadata, references, JSON/TOML/YAML, JavaScript/shell syntax and all four adapted-skill integrity records passed.
- npm audit reported zero known vulnerabilities in the npm dependency tree.
- Packed tarball passed isolated npm installation, all-client installation/doctor, shell context resume, real stdio MCP calls, plugin export and uninstall.
- The one-command install.sh ran npm ci and installed all clients in a disposable empty project without Python.
- Current workspace migrated from the Python distribution to schema 2; doctor passed and its generated MCP configuration connected to the global npm server.
- The old Python tool environment and source virtualenv were removed.

No external MCP service accounts or enterprise scanners are configured, and the package has not been published to npm. The GitHub remote is configured; its initial push and GitHub Actions run are pending.
