import fs from 'node:fs';
import path from 'node:path';
import { Plan, MANIFEST } from './ownership.mjs';
import { bundleFiles, verifyAssets, VERSION, ROOT } from './assets.mjs';
import { addClient, CLIENTS, quote } from './adapters.mjs';
import { encode, safePath } from './files.mjs';
import { git } from './git.mjs';

export function gitHook() {
  return '#!/bin/sh\n# agent-skills main freshness guard\nroot=$(git rev-parse --show-toplevel) || exit $?\nexec '
    + quote(process.execPath) + ' "$root/.agent-skills/lib/runtime.mjs" git-sync pre-push "$@"\n';
}
export function installPlan(project, clients = CLIENTS, settings = {}) {
  const options = { hooks: true, mcp: true, gitHook: true, ...settings };
  const plan = new Plan(project), notices = [];
  if (plan.root === ROOT) throw new Error('Install into your custom project, not the toolkit source folder');
  plan.removeOld();
  clients = [...new Set([...clients, ...(plan.old.clients || [])])].sort();
  if (!clients.length || clients.some(c => !CLIENTS.includes(c))) throw new Error('Select known clients');
  if (options.hooks && process.platform === 'win32') throw new Error('Use --no-hooks --no-git-hook on native Windows');
  const assets = bundleFiles(); verifyAssets(assets);
  for (const [name, data] of assets) plan.file('.agent-skills/' + name, data, name.endsWith('.sh') ? 0o755 : 0o644);
  plan.file('.agent-skills/USAGE.md', assets.get('docs/USAGE.md'));
  plan.block('AGENTS.md', assets.get('docs/PROJECT_INSTRUCTIONS.md').toString());
  plan.block('.gitignore', '.context/local/\n.agent-skills.install.lock', true);
  for (const client of clients) addClient(plan, client, assets, options);
  if (clients.includes('cline') && options.mcp) notices.push('Cline: import .agent-skills/mcp/cline.json through its MCP settings.');
  if (options.gitHook) {
    const gitDir = path.join(plan.root, '.git');
    if (fs.existsSync(gitDir) && !fs.lstatSync(gitDir).isSymbolicLink() && fs.statSync(gitDir).isDirectory()) {
      const custom = git(plan.root, ['config', '--get', 'core.hooksPath']);
      if (![0, 1].includes(custom.status)) throw new Error('Cannot inspect Git hook configuration');
      if (custom.stdout.trim()) notices.push('Existing core.hooksPath preserved; integrate the pre-push command with your hook manager.');
      else {
        const name = '.git/hooks/pre-push', existing = plan.read(name);
        if (existing !== null && existing.toString() !== gitHook()) notices.push('Existing pre-push hook preserved; integrate the guard manually.');
        else plan.file(name, gitHook(), 0o755);
      }
    } else notices.push('No ordinary .git directory: initialize Git and rerun install, or integrate the shared worktree hook manager.');
  }
  plan.write(MANIFEST, encode({ schema: 2, version: VERSION, clients, node: process.execPath,
    package_root: ROOT, project: plan.root, hooks: options.hooks, mcp: options.mcp,
    git_hook: options.gitHook, notices, records: plan.records }), 0o600);
  return { plan, notices };
}
export function uninstallPlan(project) {
  const plan = new Plan(project);
  if (!Object.keys(plan.old).length) throw new Error('No managed installation found');
  plan.removeOld();
  if (fs.existsSync(path.join(plan.root, '.context/local'))) {
    const ignored = plan.read('.gitignore')?.toString() || '';
    if (!ignored.includes('.context/local/')) plan.write('.gitignore', ignored + '\n# Private handoff retained\n.context/local/\n');
  }
  plan.write(MANIFEST, null);
  return plan;
}
export function doctor(project) {
  const plan = new Plan(project), issues = [];
  if (!Object.keys(plan.old).length) issues.push('No managed installation found');
  else {
    try { plan.removeOld(); } catch (error) { issues.push(error.message); }
    if (plan.old.schema !== 2) issues.push('Legacy Python installation: rerun the npm installer to migrate');
    if (plan.old.project !== plan.root) issues.push('Project moved: rerun install');
    try { fs.accessSync(plan.old.node || '', fs.constants.X_OK); } catch { issues.push('Node executable unavailable: rerun install'); }
    if (plan.old.mcp && !fs.existsSync(path.join(plan.old.package_root || '', 'lib/mcp-server.mjs'))) issues.push('MCP package moved or removed: reinstall and rerun install');
    for (const record of plan.old.records || []) {
      if (record.kind === 'file' && (record.mode & 0o111)) {
        const file = safePath(plan.root, record.path);
        try { fs.accessSync(file, fs.constants.X_OK); } catch { issues.push('Executable helper missing: ' + record.path); }
        if (record.path === '.git/hooks/pre-push' && fs.existsSync(file) && fs.readFileSync(file, 'utf8') !== gitHook()) {
          issues.push('Pre-push guard replaced; integrate it with your hook manager');
        }
      }
    }
  }
  return { ok: !issues.length, version: VERSION, installed_version: plan.old.version, clients: plan.old.clients || [],
    issues, activation: 'Filesystem checks only; inspect discovery and trust in each host.', notices: plan.old.notices || [] };
}
export function pluginPlan(destination) {
  const plan = new Plan(destination), assets = bundleFiles();
  verifyAssets(assets);
  // This export contains guidance only; shell hooks and MCP need a workspace installation.
  for (const [name, data] of assets) if (!name.startsWith('lib/') && name !== 'run.sh') plan.file(name, data);
  for (const [name, data] of assets) {
    if (!name.startsWith('.agents/skills/') || !name.endsWith('/SKILL.md')) continue;
    const skill = path.basename(path.dirname(name));
    plan.file('skills/' + skill + '/SKILL.md', '---' + data.toString().split('---')[1] + '---\n\n'
      + 'Read [the canonical skill](../../' + name + ') and only its relevant references. Local commands require a workspace installation.\n');
    const license = assets.get('.agents/skills/' + skill + '/LICENSE');
    if (license) plan.file('skills/' + skill + '/LICENSE', license);
  }
  plan.file('plugin.json', encode({ $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name: 'agent-skills-toolkit', version: VERSION, description: 'Coding skills, rules, references and licenses.' }));
  plan.file('README.md', '# Coding toolkit plugin\n\nUnpublished skills-only export. Use the npm package in a local workspace for hooks, Git, context and MCP. See docs/COMPATIBILITY.md.\n');
  return plan;
}
