# Work from current main

Run `agent-skills install --project . --clients all` inside your custom Git project. The installer adds a native Git pre-push guard when no existing hook manager owns that location. It preserves unrelated hooks and reports the integration step when needed. Initialize Git before installation, or rerun installation after `git init`. Application quality hooks remain your project's choice. Toolkit maintainers run npm run check; application quality hooks remain project-owned.

Before starting work and before retrying a blocked push:

```bash
sh .agent-skills/run.sh git-sync sync
# Run this project's own checks, then:
git push
```

`git-sync sync` requires a clean working tree and a checked-out branch. It fetches current `origin/main` and merges it into that branch. Existing commits are preserved. If a conflict occurs, resolve it and finish the merge, then rerun your project's checks. It does not reset the tree or stash work automatically.

On every push containing branch updates, the hook fetches fresh main into a temporary ref and requires it to be an ancestor of each pushed commit. It blocks on stale branches, unavailable remotes, fetch failures or insufficient history. It never merges or rebases during `git push`: changing the branch inside a pre-push hook would leave Git's already-selected push commits out of date. After syncing and testing, issue a new push.

By default the push check uses main on the push destination; `git-sync sync` defaults to origin. For forks or to require one canonical source for every push, configure it explicitly:

```bash
git config agentSkills.mainRemote origin
# For a fork with an upstream remote, use upstream instead of origin.
git config agentSkills.mainBranch main
```

Installation does not create a GitHub repository or remote and does not push code. For a new empty remote, the guard permits the first push that creates main; other branches in that push must include that new main commit. It blocks feature-only publication when main is absent. Tag-only pushes and branch deletions are outside the branch-freshness rule.

To integrate with an existing pre-push hook manager, pass Git's original remote arguments and stdin to `sh .agent-skills/run.sh git-sync pre-push "$@"`. The guard consumes the pushed-ref list from stdin; if another hook also reads it, the manager must give each check its own copy. Do not replace existing checks.

This checks main at fetch time. Main can advance again before a remote accepts the push; use server branch protections/required up-to-date checks for merge-time enforcement. Local hooks are not an unbypassable server control. Git supports skipping hooks, but the project instructions prohibit using that to evade this check.

References: [Git pre-push protocol](https://git-scm.com/docs/githooks#_pre_push), [ancestor checks](https://git-scm.com/docs/git-merge-base#Documentation/git-merge-base.txt---is-ancestor).
