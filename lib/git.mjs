import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

export function git(root, args, timeout = 60000) {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout, maxBuffer: 2 * 1024 * 1024 });
  if (result.error) throw new Error(result.error.code === 'ETIMEDOUT' ? 'Git operation timed out' : 'Git is unavailable or failed');
  return result;
}
function settings(root, pushRemote = 'origin') {
  const remote = git(root, ['config', '--get', 'agentSkills.mainRemote']).stdout.trim() || pushRemote;
  const branch = git(root, ['config', '--get', 'agentSkills.mainBranch']).stdout.trim() || 'main';
  if (git(root, ['check-ref-format', 'refs/heads/' + branch]).status) throw new Error('Invalid main branch setting');
  return { remote, branch };
}
function withMain(root, remote, branch, action) {
  const source = 'refs/heads/' + branch;
  const probe = git(root, ['ls-remote', '--exit-code', '--heads', '--', remote, source]);
  if (probe.status === 2) return action(null);
  if (probe.status) throw new Error('Cannot read remote main; check authentication and network');
  const ref = 'refs/agent-skills/main-check/' + crypto.randomUUID().replaceAll('-', '');
  try {
    if (git(root, ['fetch', '--no-tags', '--no-recurse-submodules', '--no-write-fetch-head', '--', remote, source + ':' + ref]).status) {
      throw new Error('Cannot fetch latest main; push blocked');
    }
    const revision = git(root, ['rev-parse', '--verify', ref + '^{commit}']);
    if (revision.status) throw new Error('Fetched main is not a commit');
    return action(revision.stdout.trim());
  } finally { git(root, ['update-ref', '-d', ref]); }
}
export function parseUpdates(raw) {
  const branches = [];
  for (const line of raw.split('\n').filter(l => l.trim())) {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 4 || ![parts[1], parts[3]].every(s => /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(s))) {
      throw new Error('Invalid pre-push input');
    }
    const [, sha, ref, old] = parts;
    if (/^0+$/.test(sha) || !ref.startsWith('refs/heads/')) continue;
    branches.push({ sha, ref, old });
  }
  return branches;
}
export function checkPush(root, pushRemote, raw) {
  const branches = parseUpdates(raw);
  if (!branches.length) return;
  const { remote, branch } = settings(root, pushRemote);
  withMain(root, remote, branch, base => {
    if (!base) {
      const initial = branches.filter(b => b.ref === 'refs/heads/' + branch && /^0+$/.test(b.old));
      if (remote !== pushRemote || initial.length !== 1) throw new Error('Remote main is absent; publish main before feature branches');
      base = initial[0].sha;
    }
    for (const { sha, ref } of branches) {
      if (git(root, ['merge-base', '--is-ancestor', base, sha]).status) {
        throw new Error('Push blocked: ' + ref + ' does not contain freshly fetched main. Sync the branch, run project checks, and retry.');
      }
    }
  });
}
export function syncMain(root) {
  if (git(root, ['symbolic-ref', '--quiet', 'HEAD']).status) throw new Error('Switch to a branch before syncing main');
  const status = git(root, ['status', '--porcelain']);
  if (status.status || status.stdout.trim()) throw new Error('Commit or stash your work; the tree must be clean before syncing main');
  const { remote, branch } = settings(root);
  withMain(root, remote, branch, base => {
    if (!base) throw new Error('Remote main does not exist yet');
    if (git(root, ['merge', '--no-edit', base], 120000).status) {
      throw new Error('Merge did not complete. Inspect git status, resolve conflicts or use git merge --abort. No reset performed.');
    }
  });
  return 'Branch includes freshly fetched main. Run your project checks before pushing.';
}
