# Git and GitHub rules

Inspect status and the configured canonical main remote before branch work. Sync a clean branch with current main before implementation. Preserve dirty work and resolve conflicts explicitly; never reset or stash it silently.

The installed pre-push guard fetches main and verifies every pushed branch commit contains it. If blocked, sync the affected branch, resolve conflicts, run project checks and retry. Never merge inside pre-push or bypass the guard to obtain a successful push.

Respect existing hook managers. Initialize or configure the project's Git remote only within the requested task. Push, publish or open a PR when the user asks for that action; do not infer a remote destination from this toolkit.

Review diff and staged files, exclude secrets and generated local state, and write a clear commit/PR description. Require server CI and branch protection where appropriate; local hooks can be bypassed and are not a server policy.
