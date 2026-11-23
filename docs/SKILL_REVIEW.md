# skills.sh selection and adoption review

Reviewed **2026-11-21** for this Python 3.12 / Google ADK / MCP framework. Four project-local adaptations were installed from exact GitHub commits using Codex's skill-installer helper. No global skills, vendor CLI runtimes, database connections or hosted tracing services were installed.

## What was scanned

Both skill sitemaps linked by the public [skills.sh sitemap index](https://www.skills.sh/sitemap.xml) were downloaded and parsed: **20,000 unique skill URLs**, with **1,107 URL-name matches** for 21 Python, ADK, testing, security, SQL, MCP, retrieval, streaming and architecture terms. The official-publisher page and repository trees supplemented that keyword filter; a name filter alone misses relevant entries such as PostgreSQL.

Twenty candidate entrypoints were downloaded, eleven were read in full, and all instructions/references/assets retained in the four adopted packages were inspected. Downloaded-but-unreviewed candidates were not installed. This is broad catalog discovery followed by targeted source review, **not a security audit of all 20,000 skills or the entire live platform**. The [documented full-catalog API](https://www.skills.sh/docs/api) requires Vercel OIDC; no account was linked. Public sitemaps can lag or omit entries.

Reproducibility data:

- `configs/skills/discovery-2026-11-21.json`: scope, filters, counts and sitemap SHA-256 hashes.
- `configs/skills/sources.json`: adopted source commits, license evidence, local changes and file hashes.
- `reports/skills-review-2026-11-21/`: Git-ignored complete URL snapshot, filtered candidates and behavioral-check evidence.

Selection prioritized project fit, distinct value, inspectable instructions, dependency compatibility, license evidence and controlled side effects. Popularity and marketplace audit badges were discovery signals, not proofs of safety. “Best” here means the strongest incremental fit among the reviewed candidates.

## Installed additions

| Skill | Why selected | Local treatment |
| --- | --- | --- |
| [Dory](https://github.com/dorylab/skills/tree/5066789e2e7720b3c677070054598692887a3bbd/plugins/dory/skills/dory) | Schema-first SQL investigations and editable analysis workspaces | Narrowed routing to chosen Dory tasks; explicit result-persistence boundary; unpinned installer recipes replaced with setup guidance |
| [Property-based testing](https://github.com/trailofbits/skills/tree/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing) | Invariants, roundtrips, shrinking and meaningful test review beyond example tests | Corrected health-check claims, removed unsupported frontmatter and aligned dependency/refactor decisions with task authorization |
| [Supabase Postgres practices](https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase-postgres-best-practices) | Focused SQL plans, partial/JSONB indexes, upserts and worker claims | Selected six references, corrected inaccurate absolutes, added a concise identity/RLS/migration reference; broad server-tuning recipes omitted |
| [Python performance optimization](https://github.com/wshobson/agents/tree/42203085cfc5736204bf0f6d436dff7e1da0bf3f/plugins/python-development/skills/python-performance-optimization) | Profiling and measured CPU/memory/latency improvements | Monotonic timers, finite HTTP timeouts, measured rather than universal speed claims, corrected allocation-retention example |

The PostgreSQL adaptation deliberately omits the upstream authoring templates, blanket connection-memory formulas, prepared-statement assumptions and other operational examples that need more version/workload-specific review. Its six retained upstream references are partial indexes, JSONB indexing, upserts, lowercase identifiers, SKIP LOCKED and EXPLAIN diagnosis. Primary PostgreSQL documentation takes precedence when applying them to a real engine.

Dory is a **database workspace**, not the framework's coding-session memory. Its read-only SQL tool can still store SQL, result snapshots and Agent Run metadata in Dory. The skill files are installed; Dory MCP is only a catalog entry until the intended deployment, connection and data scope are chosen.

## Other reviewed entrypoints

| Candidate | Decision and reason |
| --- | --- |
| [Google agents-cli ADK code](https://github.com/google/agents-cli/blob/2fa159a803aceec3b4df808901e53a08a6f1fb2a/skills/google-agents-cli-adk-code/SKILL.md) | Reference only: requires its companion workflow and scaffolding CLI; installing it alone would force a different project lifecycle |
| [Anthropic MCP builder](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/mcp-builder/SKILL.md) | Reference only: overlaps the tested local MCP skill; Python FastMCP references need reconciliation with this project's MCP 2.x SDK |
| [Langfuse](https://github.com/langfuse/skills/blob/f0bcb13088b490c04b3f4870bace17f6d57b199c/skills/langfuse/SKILL.md) | Optional product-specific reference: broad auto-routing, CLI and tracing-account assumptions are unsuitable as a generic default |
| [Semgrep LLM security](https://github.com/semgrep/skills/blob/68177b8830f96cd9d10dacbb14dde2566360503d/skills/llm-security/SKILL.md) | Reference only: existing security skill covers the workflow; upstream uses the Semgrep Rules License, so do not treat it as an MIT/Apache redistribution |
| [Async Python patterns](https://github.com/wshobson/agents/blob/42203085cfc5736204bf0f6d436dff7e1da0bf3f/plugins/python-development/skills/async-python-patterns/SKILL.md) | Not installed: overlaps streaming/debugging; generic to-thread/CPU and unbounded gather examples need context-specific correction |
| [Python resilience](https://github.com/wshobson/agents/blob/42203085cfc5736204bf0f6d436dff7e1da0bf3f/plugins/python-development/skills/python-resilience/SKILL.md) | Not installed: retrying a generic POST needs explicit idempotency and end-to-end budget rules |
| [Python testing patterns](https://github.com/wshobson/agents/blob/42203085cfc5736204bf0f6d436dff7e1da0bf3f/plugins/python-development/skills/python-testing-patterns/SKILL.md) | Not installed: substantial overlap with existing coverage/debugging skills; example coverage threshold differs from the project's 90% gate |

An additional catalog/source mismatch was found: the public sitemap lists `google/adk-docs/adk-dev-guide` and related guide skills, but those paths were absent from the reviewed `google/adk-docs` tree at `416a74dbd58f046471fc90acfd04514e675096fe`. No stale path was installed. Other downloaded candidate entrypoints remain unadopted, rather than being represented as fully audited.

## Licenses and updates

Each adopted directory contains a `LICENSE`. [Third-party notices](THIRD_PARTY_NOTICES.md) records attribution and terms. Dory's pinned plugin manifest declares Apache-2.0; the repository API has no detected root license, so that distinction is preserved in the manifest. Trail of Bits materials retain CC-BY-SA-4.0. Supabase and wshobson materials retain MIT notices.

`python scripts/validate_skill_sources.py` verifies pinned commits, recorded licenses, file hashes and unexpected files without network access. It detects drift from the reviewed snapshot, not malicious intent or every possible defect. Editing the manifest can change the trusted snapshot; review manifest changes together with skill changes. Do not auto-refresh hashes after a download. Inspect the diff, reread changed references, preserve licenses, rerun relevant checks and then update provenance deliberately.

Do not run `npx skills add ... --all` against an unreviewed collection. If using the marketplace CLI for future discovery, review the exact source revision and destination first. The four selected packages contain no executable helper scripts; their code blocks are examples that still require task-specific judgment before execution.
