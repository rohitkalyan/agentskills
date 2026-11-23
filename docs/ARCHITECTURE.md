# Design guidance for the destination project

This toolkit has no application architecture to inherit. Inspect the user's project, requirements, deployment constraints and team conventions before proposing a structure. The installer does not generate source folders, a web API or an ADK agent.

Start with the smallest design that satisfies the feature. A feature-oriented modular monolith is one option when local transactions and one deployment are sufficient. Split services only when ownership, independent scaling or isolation justify distributed-system costs.

For a project that chooses this style, keep capability rules, schemas and routes close together. Put provider-specific I/O behind narrow integration adapters and assemble dependencies at a composition root. Define an interface only when there is a real substitution boundary. Do not create empty folders to imitate an industry standard.

Before implementation, establish callers, inputs/outputs, identity, tenancy, data ownership, failure behavior and expected load. Compare plausible designs and record consequential tradeoffs with the [ADR template](templates/ADR.md).

Review retries, timeouts, cancellation, idempotency, concurrency, migrations, backup/restore and rollback where relevant. Add import-boundary checks using that project's tools when useful. No architecture enforcement is installed into the application by this toolkit.

Primary references: [FastAPI larger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/), [Python Protocols](https://docs.python.org/3/library/typing.html#typing.Protocol), [import-linter](https://github.com/import-linter/import-linter).
