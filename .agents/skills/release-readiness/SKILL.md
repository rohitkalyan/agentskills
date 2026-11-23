---
name: release-readiness
description: Prepare a custom Python/ADK project or coding-toolkit release, dependency/protocol upgrade, compatibility review or deployment readiness assessment.
---

Read [evolution](../../../docs/EVOLUTION.md) and [quality](../../../docs/QUALITY.md). Identify the target artifact, supported runtime, deployment environment and observable acceptance criteria. Inspect official release notes for changed SDK or protocol behavior.

Pin reviewed dependencies and update the lock deliberately. Run contract/integration tests, architecture checks, full coverage, secret scan and dependency audit. Exercise startup, stream cancellation, persistent-session compatibility and MCP tool schemas for related upgrades. Record skipped checks accurately.

Prepare a migration and rollback plan for data/schema/config changes; do not run destructive migrations by implication. Review package/source archive contents for private files before an authorized external upload. A scanner configuration is not a completed scan or certification.

Refresh source review dates and ADRs based on actual evidence. Keep future features behind tested boundaries; do not auto-enable a new transport, remote server or model alias merely because it is newer. Report concrete release evidence and outstanding environment-specific work.
