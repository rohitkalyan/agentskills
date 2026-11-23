---
name: code-map
description: Locate relevant Python modules, ownership, call paths and tests while keeping repository exploration bounded.
---

Read `.context/PROJECT.md` and the current handoff first. Run `sh .agent-skills/run.sh context map` when the code is unfamiliar; read its generated local index. The Node helper finds top-level symbol-like declarations with bounded text matching in conventional source/test folders and intentionally caps output. It is not a call graph or a complete semantic model.

Use `rg --files` and targeted `rg` searches to find the entry point and follow only the affected path. Verify dynamic imports, framework registration and external boundaries directly when static symbols are insufficient. Do not load `.venv`, lockfiles, large logs, secrets or generated assets for orientation.

Return file/symbol locations, the request/data flow, relevant tests and explicit gaps. Refresh the index after structural changes; stale line numbers are navigation hints. If a needed root is missing, extend the helper's scan roots narrowly rather than recursively scanning private home directories.
