# Curated upstream sources

Reviewed on 2026-11-20. “Official” identifies the publisher; it does not mean every file is audited or permanently safe. The core 18 skills are original workflows. Four reviewed third-party adaptations were added on 2026-11-21; [the review](SKILL_REVIEW.md) records exact scope, commits, corrections and licenses. No entire collection was bulk-installed. Toolkit Node package versions are recorded in package.json and npm-shrinkwrap.json. Python tooling below is guidance for destination projects, not installed toolkit dependencies.

| Source | Why it belongs on the shortlist | Adoption status |
| --- | --- | --- |
| [Google ADK Python](https://github.com/google/adk-python) | Primary runtime, code and release history | Guidance reference only; install in a custom project when needed |
| [Google ADK recipes](https://github.com/google/adk-recipes) | Official patterns and examples; former adk-samples URL redirects here | Reference only; adapt a relevant recipe |
| [ADK session guide](https://google.github.io/adk-docs/sessions/session/) | Durable conversation state and database choices | Design reference; no runner or session database is supplied |
| [OpenAI skills](https://github.com/openai/skills) | Publisher-maintained Codex skill catalog | Reference only; review individual skills before adoption |
| [Anthropic skills](https://github.com/anthropics/skills) | Skill format examples and workflow ideas | Reference only; inspect per-skill license and host assumptions |
| [Agent Skills specification](https://agentskills.io/specification) | Portable frontmatter and skill structure | Local skills follow the basic format |
| [Codex skills](https://learn.chatgpt.com/docs/build-skills) | Discovery and progressive disclosure | Project skills under `.agents/skills` |
| [Codex hooks](https://learn.chatgpt.com/docs/hooks) | Current event schema and trust behavior | Local lifecycle adapter; host activation still required |
| [Codex custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents) | Current standalone TOML profile format | Nine optional profiles; no forced model overrides |
| [uv](https://github.com/astral-sh/uv) | Reproducible Python environments and lockfiles | Destination Python project reference |
| [Ruff](https://github.com/astral-sh/ruff) | Python lint and formatting | Destination Python project reference |
| [pre-commit](https://github.com/pre-commit/pre-commit) | Repeatable local Git checks | Optional destination project choice; toolkit uses shell/Node hooks |
| [Bandit](https://github.com/PyCQA/bandit) | Python security lint | Destination Python project reference |
| [pip-audit](https://github.com/pypa/pip-audit) | Known vulnerability checks for Python dependencies | Destination Python project reference; toolkit uses npm audit |
| [detect-secrets](https://github.com/Yelp/detect-secrets) | Prevent accidental credential commits | Optional destination project choice |
| [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) | Application security requirements to map to org policy | Review reference, not a certification claim |

## How to add a skill or repository

Use `skill-curation` for actual adoption and `research-sources` for discovery. Identify the exact missing capability before searching. Prefer official publisher repositories; inspect maintenance, license, dependencies and executable content. Pin a reviewed commit or release, read the entire skill plus referenced scripts, and check filesystem/network permissions and prompt-injection risks.

Record upstream URL, commit/tag, review date, reviewer, license, local changes and behavioral test evidence in an adoption note. Exercise the skill in a disposable local repository with synthetic data and no production credentials. A format check alone does not establish safe behavior. Re-review executable changes on upgrade.

Avoid giant “awesome” lists as installed defaults. Catalog breadth is useful for discovery, but loading overlapping skills consumes context and makes routing less precise. Keep reusable decisions in skills and deterministic work in scripts.

## Included skill routing

| Skill | Use it for |
| --- | --- |
| `python-backend` | Implement or repair a typed Python API/service boundary |
| `google-adk` | Build agents, tools, runner/session behavior or ADK integrations |
| `agent-evaluation` | Assess tool use, task success, injection resistance and budget behavior |
| `security-review` | Review vulnerabilities, scanner findings or a sensitive change |
| `dependency-maintenance` | Deliberate dependency upgrades, lock changes and CVE remediation |
| `research-sources` | Version-specific research with primary sources and evidence |
| `skill-curation` | Find, assess and add/update reusable skills |
| `code-map` | Locate ownership, call paths and relevant tests without reading everything |
| `session-handoff` | Resume interrupted work or record a compact verified checkpoint |
| `system-design` | Feature boundaries, scaling, reliability and architectural tradeoffs |
| `debugging-python` | Reproduce async, API, model/tool or persistence failures |
| `coverage-analysis` | Identify high-impact missing tests and interpret coverage gates |
| `mcp-integration` | Review, configure, implement and test scoped MCP tools |
| `streaming-realtime` | SSE, text deltas, cancellation and live transport design |
| `observability` | Metadata logs, diagnostics, telemetry privacy and monitoring design |
| `rag-engineering` | Retrieval design, ingestion, provenance and grounding evaluations |
| `api-contracts` | Typed API behavior, compatibility and authorization boundaries |
| `release-readiness` | Upgrade evidence, migrations, release checks and rollback |

MCP sources and per-entry review status are in [the MCP catalog](MCP.md) and `configs/mcp/registry.json`. Architecture and streaming references are linked from their focused guides rather than loaded into every skill.

| Added skill | Use it for |
| --- | --- |
| `dory` | Explicitly selected Dory SQL workspaces; no database connection is configured by installation |
| `property-based-testing` | Hypothesis/invariant design, shrinking and property-test review |
| `supabase-postgres-best-practices` | Selected PostgreSQL plans, indexes, upserts, worker claims and isolation review |
| `python-performance-optimization` | Measured CPU, memory and latency diagnosis |

These four adaptations have per-directory licenses and integrity records in `configs/skills/sources.json`. Read the [third-party notices](THIRD_PARTY_NOTICES.md) when reusing them.
