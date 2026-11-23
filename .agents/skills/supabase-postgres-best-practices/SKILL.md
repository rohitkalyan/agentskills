---
name: supabase-postgres-best-practices
description: Review PostgreSQL query plans, indexes, upserts, worker claims and tenant isolation using selected Supabase references. Use for PostgreSQL-specific design or debugging; this does not require Supabase hosting.
license: MIT
metadata:
  author: Supabase; locally curated adaptation
---

# PostgreSQL design and review

A selected, locally corrected subset of Supabase's reference library. Confirm the deployed PostgreSQL version, actual schema, data volume and workload before choosing a rule. Example SQL and plan costs are illustrative, not benchmarks or migration instructions for the current database. Preserve the user's existing provider and framework.

Read only the relevant reference:

- [Plan diagnosis](references/monitor-explain-analyze.md): distinguish planner estimates from observed execution.
- [Partial indexes](references/query-partial-indexes.md): predicate matching and index scope.
- [JSONB indexes](references/advanced-jsonb-indexing.md): containment versus expression queries.
- [Upserts](references/data-upsert.md): use a real matching unique constraint and define update semantics.
- [Worker claims](references/lock-skip-locked.md): atomic claims, separate from delivery/recovery guarantees.
- [Identifiers](references/schema-lowercase-identifiers.md): avoid accidental quoted-name incompatibility.
- [Security and migrations](references/security-and-migrations.md): identity, RLS, parameters and change review.

Start with bounded read-only inspection. `EXPLAIN ANALYZE` actually executes its statement, including mutations or invoked functions. Use plain EXPLAIN when execution is not authorized. Do not run DDL, change server settings, reset shared statistics or apply a migration solely because a reference includes that command. Existing authorization for the intended change still applies.

Measure a representative before/after plan and preserve correctness tests, write amplification, locking and rollback behavior. Generic examples are not a substitute for checking the installed engine, pooler and driver versions. For current semantics consult [PostgreSQL documentation](https://www.postgresql.org/docs/), selecting the deployed version.

Origin, pinned commit, omitted references and MIT attribution: [source review](../../../docs/SKILL_REVIEW.md).
