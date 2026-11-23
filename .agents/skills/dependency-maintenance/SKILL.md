---
name: dependency-maintenance
description: Upgrade Python dependencies or remediate dependency advisories while preserving a reproducible lockfile.
---

Identify the direct or transitive dependency and why it needs to change. Check the publisher's release notes and advisory for affected and fixed versions; do not assume latest is compatible. Inspect Python/platform support and API migrations.

Change the smallest necessary dependency constraint and regenerate the lock with uv. Review the actual lock diff for unexpected new packages or sources. Use the destination project's package manager, locked installation, affected tests and dependency audit commands; do not assume toolkit maintenance commands exist there. Avoid unreviewed bulk upgrades, blanket ignores and `pip-audit --fix` without examining changes.

If no compatible fix exists, record the specific advisory, reachability assessment, temporary mitigation, owner and expiry. Preserve nonzero scanner exit codes; distinguish an audit service outage from a clean report. Use hashes/locked versions and approved registries in CI.
