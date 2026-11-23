---
name: skill-curation
description: Find, assess, create or update reusable coding skills with provenance, narrow routing and behavioral validation.
---

Start with the missing repeated workflow and check `.agents/skills` for overlap. Consult `docs/CATALOG.md` as a shortlist, then verify the exact upstream source, revision, license, dependencies and maintenance status. Publisher identity alone does not establish safety.

For skills.sh additions, read `docs/SKILL_REVIEW.md` and `configs/skills/sources.json`. Separate sitemap/name screening from full instruction and script review. Compare the catalog against the actual pinned repository tree; listings can be stale. Existing adopted skills are project-local adaptations, so preserve their documented corrections and licenses on update.

Before adoption read the full skill and referenced scripts. Identify writes, network access, credentials, subprocesses and approval behavior. Avoid duplicate global/project installations and executable downloads from unverified URLs. Keep upstream license/attribution when copying; record origin, revision, review date and local changes.

Prefer a short original instruction-only skill when deterministic code is unnecessary. Use clear `name` and `description` YAML fields; disclose substantial detail through relevant references. Keep tool-specific paths and helpers available in the destination. Do not add rules for unrelated tasks or invent permission requirements.

Validate frontmatter and links with `node scripts/validate.mjs` from the toolkit source checkout. Exercise meaningful script behavior with synthetic inputs in a temporary workspace, and inspect resulting files and side effects. Format validation is not a behavioral or security audit. Keep an adoption note with the evidence and limitations.

Source validation also verifies the recorded local hashes. Update those hashes only after reviewing the actual change; never regenerate them just to silence a failure. Do not overwrite existing skills or activate vendor accounts as a side effect of discovery.
