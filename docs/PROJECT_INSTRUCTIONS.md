Use this toolkit to build the user's custom project; it supplies no application scaffold.
Read .agent-skills/rules/CORE.md and .agent-skills/USAGE.md. Load only relevant skills and references.
At session start run sh .agent-skills/run.sh context resume. Verify historical notes against current code.
Discover this project's architecture and checks. Toolkit maintenance checks do not test the application.
Before coding, use sh .agent-skills/run.sh git-sync sync on a clean branch when a main remote exists.
Never discard work to make it clean. The pre-push guard fetches main and blocks stale commits.
Before ending substantive work, save decisions with sh .agent-skills/run.sh context checkpoint
--summary '...' --next '...' --checks '...'. Hooks save Git metadata, not semantic understanding.
Do not store raw chats or secrets. Use specialist delegation only when requested.
External MCP and enterprise scanners require selected services, authentication and permissions.
