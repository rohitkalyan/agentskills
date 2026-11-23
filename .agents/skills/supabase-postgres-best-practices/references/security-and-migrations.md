# Security and migration boundaries

Derive tenant/user identity from verified authentication. A client-provided identifier or user-settable database session variable is not proof of identity. Parameterize values and allowlist identifiers; keep database credentials out of tools, logs and prompts.

Use narrowly scoped application roles. Enabling RLS does not constrain superusers or BYPASSRLS roles; owners normally bypass policies unless FORCE ROW LEVEL SECURITY applies. Test positive and negative access with the actual application roles. Define both row visibility and allowed inserted/updated rows. Do not use a privileged service account to demonstrate that tenant isolation works.

With connection pooling, apply verified identity within the transaction and ensure it cannot leak into the next request. Do not expose arbitrary SQL under a role that can impersonate other tenants by changing session context. Supabase auth helpers are provider-specific, not portable PostgreSQL functions.

Review locks, existing data, unique/foreign-key constraints, concurrent deploys, rollback and backup/restore before a migration. Index creation and schema changes can block live traffic. Check engine/pooler/driver versions for transaction and prepared-statement behavior instead of adopting fixed global settings.

Primary reference: [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). Select the version matching the actual deployment.
