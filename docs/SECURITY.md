# Security guidance and integration boundaries

Checkmarx, Veracode and SonarQube apply organization-specific policies; their presence in a catalog is not a completed scan or certification.

## Toolkit checks

npm run check validates behavior, syntax, skill integrity and installation boundaries. npm run audit:deps checks known advisories for the locked npm dependencies; it sends package/version information to the advisory service. npm ci --ignore-scripts avoids dependency lifecycle execution during setup. There is no Python, pip, uv, Bandit or pre-commit dependency in this toolkit.

These checks do not constitute a full JavaScript SAST or secret scan. Review sensitive changes and use the organization's chosen scanners. Keep credentials and .context/local out of archives. Package contents are explicitly allowlisted and tested.

The installer uses an ownership manifest, refuses symlinks/conflicting content, preserves unrelated settings, checks for concurrent edits, and rolls back ordinary I/O failures. A process kill or power loss is not guaranteed transactional recovery; preserve local work and inspect any stale lock before retrying.

## Custom Python project checks

Inspect the project's actual dependencies, tests and CI. Select lint, typing, coverage, secret detection, SAST and dependency scanning appropriate to that project. Do not impose toolkit npm commands on a Python app.

Review input validation, tenant authorization, SQL injection, SSRF, path traversal, quotas, timeout/cancellation behavior, logging privacy and dependency provenance. For agents also review prompt injection, tool authorization, data egress, bounded model/tool loops and session isolation. Model instructions are not authorization.

## Enterprise integrations

- SonarQube: configure the intended project, quality profile/gate and scanner. The optional toolkit sonar-project.properties describes Node helper source; a custom Python project needs its own configuration and generated coverage.
- Checkmarx: provision the organization-approved CLI and authentication, verify SAST/SCA support, and test a policy that blocks a known failing fixture before making it required.
- Veracode: select the licensed scanner/workflow and correct language packaging. Pipeline findings and application policy compliance are different deliverables.

Scanner uploads require the intended account and source scope. Keep tokens in approved environment/secret stores. Package manifests alone do not prove every scanner supports the dependency format.

## Tool boundaries

The local guidance MCP returns only bundled public skills. It cannot read project files or credentials, run shell commands, or call a model. Remote recipes are optional; client tool allowlists are not an OS sandbox. Git hooks and lifecycle hooks are not substitutes for CI or server authorization.

References: [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [GenAI security](https://genai.owasp.org/), [Sonar Python coverage](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/test-coverage/python-test-coverage), [Checkmarx scan](https://docs.checkmarx.com/en/34965-68643-scan.html), [Veracode packaging](https://docs.veracode.com/r/compilation_python).
