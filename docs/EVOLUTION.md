# Keeping assistant guidance current

Update a skill, rule, host adapter or MCP recipe when the user's task needs new capabilities or a verified compatibility change. Record primary documentation, review date, supported versions and limitations. A review date is not a promise that a dependency remains latest.

For a new host or transport, verify its current discovery paths, configuration, permissions and lifecycle semantics. Add a narrow adapter and behavior check. Never auto-enable remote tools or replace unrelated client settings.

For toolkit releases, run focused tests, npm run check, npm run audit:deps and npm run pack:check. Review archive contents for private data. Test updates from the prior installation and preserve application files and project context.

For knowledge about new app features such as streaming, RAG or ADK sessions, update the relevant skill and reference guide. Implement that feature only in the user's destination project after inspecting its architecture.

Dependabot proposes toolkit dependency and GitHub Action updates after publication to a supported repository. It does not auto-merge or activate services. Model quality and live integration behavior require separate evaluations in the destination environment.
