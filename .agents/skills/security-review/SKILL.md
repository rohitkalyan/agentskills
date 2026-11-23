---
name: security-review
description: Review security-sensitive Python or agent changes and triage Checkmarx, Veracode, SonarQube or local scanner findings.
---

Inspect the destination project's security gates and organization policy. Read `docs/SECURITY.md` for toolkit maintenance examples and external scanner prerequisites; adapt commands to the actual project. For a finding, record its rule/CWE, affected version, source location, input trust boundary, reachable path and impact. Confirm the source-to-sink path; distinguish demonstrated exploitability from uncertainty.

Focus on authorization/tenant isolation, injection, SSRF, path traversal, secret exposure, unsafe deserialization, dependencies and agent tool privileges. Check whether model-controlled input reaches an operation without independent validation. Do not treat prompt instructions or a clean lint report as an authorization control.

Fix the root cause and add a regression test that fails before the fix. For accepted exceptions record rationale, owner and expiry. Do not disable a whole rule or regenerate baselines to hide findings. Report severity with a concrete scenario and evidence, and distinguish local checks from enterprise scan results. Source upload requires an intended configured account and authorization; a scanner setup task alone is not permission to upload private code.
