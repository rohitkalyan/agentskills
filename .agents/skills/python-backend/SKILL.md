---
name: python-backend
description: Implement or debug Python API and service behavior, including validation, typed boundaries and regression tests.
---

Trace the affected request through routing, service logic and persistence before editing. Locate the destination project's actual entrypoints and preserve its architecture. This toolkit contains no backend implementation.

Use explicit request/response types, bounded inputs and deterministic error handling. Keep authorization at the operation boundary; possession of an object ID is not authorization. Use timeouts for network operations, parameterized database queries and narrow exception handling. Avoid blocking I/O inside async handlers.

Implement the smallest complete behavior change. Test the relevant successful path, invalid input and permission/isolation boundary where applicable. Keep dependencies in `pyproject.toml` and refresh `uv.lock` deliberately. Run focused tests, then the repository's applicable checks (discover commands in the destination project's tooling). State failed or unrun checks and any migration implications.
