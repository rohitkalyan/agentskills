# Design decisions

- 2026-11-21: User clarified the repository is a pre-project coding-assistant toolkit. Removed all bundled application/ADK/API code and model dependencies. Retained only helper programs for installation, hooks, MCP guidance and validation. Python/ADK skills remain knowledge for destination projects.
- 2026-11-21: Version 0.4.0 uses distribution agent-skills-toolkit and keeps the agent-skills CLI. One canonical skill/rule library is installed behind native host entrypoints. No application files, pyproject, CI or folder layout are created in the destination root.
- 2026-11-21: Ownership manifest preserves unrelated configuration, blocks managed-content drift, and supports update/uninstall. Compact private handoffs survive uninstall.
- 2026-11-21: Copilot requires native .github/skills/ entrypoints in the verified VS Code harness. Real explicit and natural-language prompts loaded debugging-python in the prior activation check.
- 2026-11-21: External MCP accounts and enterprise scanners are selected integrations with credentials and tool scopes. The local guidance server is the only default connection.
- 2026-11-20: Pre-push fetches main and checks every pushed branch. Sync merges on a clean branch before work or after a blocked push. Never mutate commits during a push.
- 2026-11-20: Context hooks store metadata without model calls or transcript scraping. Semantic decisions require an explicit compact checkpoint.
- 2026-11-21: Four third-party skill adaptations retain pinned provenance, licenses and file hashes. Skill popularity is not a trust guarantee.

- 2026-11-21: User replaced Python toolkit helpers with npm/Node and shell commands. Version 0.5 uses schema 2 with migration from schema 1. Git and Qdrant Python launcher recipes became catalog references; Python coding knowledge remains in skills.
