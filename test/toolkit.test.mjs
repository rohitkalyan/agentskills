import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse as parseToml } from 'smol-toml';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { installPlan, uninstallPlan, doctor, pluginPlan, gitHook } from '../lib/installer.mjs';
import { Plan, MANIFEST } from '../lib/ownership.mjs';
import { atomic, digest, encode, safePath } from '../lib/files.mjs';
import { bundleFiles, ROOT, VERSION } from '../lib/assets.mjs';
import { CLIENTS } from '../lib/adapters.mjs';
import { checkpoint, resume, codeMap } from '../lib/context.mjs';
import { hook } from '../lib/runtime.mjs';
import { checkPush, parseUpdates, syncMain } from '../lib/git.mjs';
import { callGuidance } from '../lib/mcp-server.mjs';

function temporary(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-node-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return fs.realpathSync(root);
}
function write(root, name, data) {
  const target = path.join(root, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, data);
}
function read(root, name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
function install(root, clients = CLIENTS, settings) {
  const result = installPlan(root, clients, settings); result.plan.apply(); return result;
}
function inventory(root) {
  const files = {};
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const target = path.join(folder, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile()) files[path.relative(root, target)] = fs.readFileSync(target).toString('base64');
    }
  }
  visit(root); return files;
}
function git(root, ...args) {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8',
    env: { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: '1' } });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
}

test('all clients install without application scaffolding; repeated installs are identical', t => {
  const root = temporary(t);
  write(root, 'src/customer.py', '# user code\n'); write(root, 'pyproject.toml', '# user dependencies\n');
  write(root, 'AGENTS.md', 'User requirements without trailing newline');
  write(root, '.claude/settings.json', encode({ hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo user' }] }] }, preference: true }));
  write(root, '.codex/config.toml', 'model = "user-choice"\n');
  write(root, '.mcp.json', encode({ mcpServers: { existing: { command: 'existing' } } }));
  install(root); const first = inventory(root); install(root);
  assert.deepEqual(inventory(root), first); assert.equal(doctor(root).ok, true);
  for (const folder of ['.agents/skills', '.claude/skills', '.cline/skills', '.github/skills']) {
    assert.equal(fs.readdirSync(path.join(root, folder)).length, 22);
  }
  for (const folder of ['.codex/agents', '.claude/agents', '.github/agents', '.agents/agents']) assert.equal(fs.readdirSync(path.join(root, folder)).length, 9);
  assert.match(read(root, 'AGENTS.md'), /rules\/CORE.md/);
  assert.equal(read(root, 'src/customer.py'), '# user code\n');
  assert.equal(read(root, 'pyproject.toml'), '# user dependencies\n');
  for (const name of ['package.json', 'node_modules', 'Makefile', '.env.example', '.github/workflows', '.agent-skills/run.py']) {
    assert.equal(fs.existsSync(path.join(root, name)), false);
  }
  const settings = JSON.parse(read(root, '.claude/settings.json')); settings.newPreference = 'keep';
  write(root, '.claude/settings.json', encode(settings));
  fs.appendFileSync(path.join(root, 'AGENTS.md'), '\nAnother user rule\n');
  install(root); uninstallPlan(root).apply();
  assert.deepEqual(JSON.parse(read(root, '.claude/settings.json')),
    { hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo user' }] }] }, preference: true, newPreference: 'keep' });
  assert.deepEqual({ ...parseToml(read(root, '.codex/config.toml')) }, { model: 'user-choice' });
  assert.equal(read(root, 'AGENTS.md'), 'User requirements without trailing newline\nAnother user rule\n');
  assert.equal(fs.existsSync(path.join(root, MANIFEST)), false);
});

test('empty projects receive only toolkit assets and host entrypoints', t => {
  const root = temporary(t); install(root);
  for (const name of ['src', 'app', 'tests', 'pyproject.toml', 'package.json', 'node_modules']) assert.equal(fs.existsSync(path.join(root, name)), false);
  assert.equal(Object.keys(inventory(root)).some(n => n.endsWith('.py')), false);
});

test('dry-run and conflicts do not write anything', t => {
  const root = temporary(t);
  assert.ok(installPlan(root).plan.changes().length > 100); assert.deepEqual(inventory(root), {});
  write(root, '.claude/skills/python-backend/SKILL.md', 'user skill'); const before = inventory(root);
  assert.throws(() => install(root), /Existing file preserved/); assert.deepEqual(inventory(root), before);
});

for (const kind of ['file', 'block', 'json', 'missing']) test('managed drift preserves user edits: ' + kind, t => {
  const root = temporary(t); install(root);
  if (kind === 'file') write(root, '.agent-skills/USAGE.md', 'edited');
  if (kind === 'block') write(root, 'AGENTS.md', read(root, 'AGENTS.md').replace('Use this toolkit', 'Custom toolkit'));
  if (kind === 'missing') fs.unlinkSync(path.join(root, '.agent-skills/USAGE.md'));
  if (kind === 'json') {
    const data = JSON.parse(read(root, '.claude/settings.json')); data.hooks.Stop = []; write(root, '.claude/settings.json', encode(data));
  }
  const before = inventory(root);
  assert.throws(() => install(root), /edited|missing/); assert.throws(() => uninstallPlan(root), /edited|missing/);
  assert.deepEqual(inventory(root), before); assert.equal(doctor(root).ok, false);
});

test('schema-1 migration retires Python helpers and hook entries without executing Python', t => {
  const root = temporary(t), legacy = new Plan(root);
  legacy.file('.agent-skills/run.py', '# retired runtime\n');
  legacy.file('.agent-skills/scripts/context.py', '# retired helper\n');
  legacy.block('AGENTS.md', 'Use the previous Python helper.');
  legacy.jsonEntry('.mcp.json', ['mcpServers', 'agent_skills_kit'], { command: '/missing/python', args: ['-m', 'agent_skills.mcp_server'] });
  legacy.jsonEntry('.claude/settings.json', ['hooks', 'Stop'],
    { hooks: [{ type: 'command', command: '/missing/python old-hook.py' }] }, true);
  legacy.write(MANIFEST, encode({ schema: 1, version: '0.4.0', python: '/missing/python', clients: ['claude'],
    project: root, records: legacy.records }));
  legacy.apply(); write(root, 'custom.py', '# preserve application\n');
  install(root);
  assert.equal(fs.existsSync(path.join(root, '.agent-skills/run.py')), false);
  assert.equal(fs.existsSync(path.join(root, '.agent-skills/scripts/context.py')), false);
  assert.equal(read(root, 'custom.py'), '# preserve application\n');
  const manifest = JSON.parse(read(root, MANIFEST));
  assert.equal(manifest.schema, 2); assert.equal(manifest.python, undefined);
  assert.equal(JSON.parse(read(root, '.mcp.json')).mcpServers.agent_skills_kit.command, process.execPath);
  assert.equal(doctor(root).ok, true);
});

test('updates add clients, omit hooks/MCP when requested, and preserve borrowed files', t => {
  const root = temporary(t), assets = bundleFiles();
  write(root, '.agent-skills/lib/context.mjs', assets.get('lib/context.mjs'));
  install(root, ['generic'], { hooks: false, mcp: false });
  install(root, ['claude']); assert.deepEqual(JSON.parse(read(root, MANIFEST)).clients, ['claude', 'generic']);
  install(root, ['generic'], { hooks: false, mcp: false });
  assert.equal(fs.existsSync(path.join(root, '.claude/settings.json')), false);
  uninstallPlan(root).apply();
  assert.equal(read(root, '.agent-skills/lib/context.mjs'), assets.get('lib/context.mjs').toString());
});

for (const name of ['../escape', '/tmp/escape', 'x/../../escape', 'a\\escape', '', 'a\nb']) {
  test('unsafe path rejected: ' + JSON.stringify(name), t => assert.throws(() => safePath(temporary(t), name), /Unsafe/));
}
test('symlinks cannot redirect installer or private context', t => {
  const root = temporary(t), outside = temporary(t);
  fs.symlinkSync(outside, path.join(root, '.agents'));
  assert.throws(() => install(root), /Symlink/);
  fs.symlinkSync(outside, path.join(root, '.context'));
  assert.throws(() => checkpoint(root, 'x', 'y', 'z'), /Symlink/);
  assert.deepEqual(inventory(outside), {});
});
test('prototype keys and conflicting credential values are not exposed', t => {
  const root = temporary(t);
  assert.throws(() => new Plan(root).jsonEntry('a.json', ['__proto__', 'x'], 1), /Unsafe/);
  write(root, '.mcp.json', '{"mcpServers":{"agent_skills_kit":{"command":"private-value"}}}');
  assert.throws(() => install(root), e => !e.message.includes('private-value') && /preserved/.test(e.message));
  write(root, '.mcp.json', '{"private":"private-value",broken');
  assert.throws(() => install(root), e => !e.message.includes('private-value') && /Invalid JSON/.test(e.message));
});
test('partial I/O failure rolls back and concurrent edits/locks block apply', t => {
  const root = temporary(t); write(root, 'AGENTS.md', 'before');
  const { plan } = installPlan(root, ['generic'], { mcp: false, hooks: false });
  let count = 0;
  assert.throws(() => plan.apply((...args) => { if (++count === 4) throw new Error('disk failure'); atomic(...args); }), /disk failure/);
  assert.deepEqual(inventory(root), { 'AGENTS.md': Buffer.from('before').toString('base64') });
  const next = new Plan(root); next.file('new.md', 'planned'); write(root, 'new.md', 'racing edit');
  assert.throws(() => next.apply(), /changed during/);
  write(root, '.agent-skills.install.lock', '');
  assert.throws(() => install(root), /Another install/);
});

test('portable plugin retains all skills and licenses without helper code', t => {
  const root = temporary(t); pluginPlan(root).apply(); pluginPlan(root).apply();
  assert.equal(JSON.parse(read(root, 'plugin.json')).version, VERSION);
  assert.equal(fs.readdirSync(path.join(root, 'skills')).length, 22);
  assert.equal(Object.keys(inventory(root)).filter(n => /^skills\/[^/]+\/LICENSE$/.test(n)).length, 4);
  assert.equal(fs.existsSync(path.join(root, 'lib')), false);
});

for (const host of ['codex', 'claude', 'cline', 'antigravity', 'copilot']) test('real shell lifecycle hook: ' + host, t => {
  const parent = temporary(t), root = path.join(parent, "project with ' and $ spaces"); fs.mkdirSync(root);
  install(root, [host], { mcp: false });
  checkpoint(root, 'verified change', 'next step', 'checks passed');
  let command;
  if (host === 'cline') command = "'" + path.join(root, '.clinerules/hooks/TaskStart').replaceAll("'", "'\\''") + "'";
  else if (host === 'antigravity') command = JSON.parse(read(root, '.agents/hooks.json'))['agent-skills-memory'].SessionStart[0].command;
  else if (host === 'copilot') command = JSON.parse(read(root, '.github/hooks/agent-skills.json')).hooks.sessionStart[0].bash;
  else command = JSON.parse(read(root, host === 'codex' ? '.codex/hooks.json' : '.claude/settings.json')).hooks.SessionStart[0].hooks[0].command;
  const result = spawnSync('/bin/sh', ['-c', command], { cwd: parent, input: '{"prompt":"never save"}', encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /verified change/); JSON.parse(result.stdout);
  hook(root, host, 'Stop', '{"prompt":"never save","sessionId":"opaque"}');
  assert.equal(Object.values(inventory(path.join(root, '.context/local'))).some(b => Buffer.from(b, 'base64').toString().includes('never save')), false);
  assert.equal(fs.existsSync(path.join(parent, '.context')), false);
});
test('context is bounded, map does not execute Python, and handoff survives uninstall', t => {
  const root = temporary(t); install(root, ['generic'], { mcp: false, hooks: false });
  assert.match(resume(root), /No semantic handoff/);
  checkpoint(root, 'a'.repeat(1500), 'b'.repeat(1500), 'c'.repeat(1500)); assert.ok(resume(root).length <= 6000);
  assert.throws(() => checkpoint(root, '', 'x', 'y'), /Checkpoint/);
  write(root, 'src/feature.py', 'raise RuntimeError("must not execute")\ndef actual_feature(): pass\n');
  assert.match(fs.readFileSync(codeMap(root), 'utf8'), /actual_feature:2/);
  assert.throws(() => hook(root, 'codex', 'Stop', '[]'), /object/);
  assert.throws(() => hook(root, 'codex', 'Stop', 'x'.repeat(262145)), /limit/);
  assert.throws(() => hook(root, 'codex', 'NoSuchEvent', '{}'), /Unsupported/);
  uninstallPlan(root).apply(); assert.ok(fs.existsSync(path.join(root, '.context/local/HANDOFF.md')));
  assert.match(read(root, '.gitignore'), /.context\/local/);
});

test('real stale Git push blocked; explicit sync then fresh push succeeds', t => {
  const parent = temporary(t), remote = path.join(parent, 'remote.git'), seed = path.join(parent, 'seed'), project = path.join(parent, 'project');
  fs.mkdirSync(remote); fs.mkdirSync(seed);
  git(remote, 'init', '--bare', '-b', 'main'); git(seed, 'init', '-b', 'main');
  git(seed, 'config', 'user.name', 'Fixture'); git(seed, 'config', 'user.email', 'fixture@example.invalid');
  write(seed, 'base.txt', 'base'); git(seed, 'add', '.'); git(seed, 'commit', '-m', 'base');
  git(seed, 'remote', 'add', 'origin', remote); git(seed, 'push', 'origin', 'main');
  git(parent, 'clone', remote, project);
  git(project, 'config', 'user.name', 'Fixture'); git(project, 'config', 'user.email', 'fixture@example.invalid');
  git(project, 'switch', '-c', 'feature'); install(project, ['generic'], { hooks: false, mcp: false });
  git(project, 'add', '.'); git(project, 'commit', '-m', 'toolkit');
  write(seed, 'upstream.txt', 'new'); git(seed, 'add', '.'); git(seed, 'commit', '-m', 'advance'); git(seed, 'push', 'origin', 'main');
  const blocked = spawnSync('git', ['-C', project, 'push', 'origin', 'feature'], { encoding: 'utf8' });
  assert.notEqual(blocked.status, 0); assert.match(blocked.stderr, /freshly fetched main/);
  assert.equal(git(project, 'status', '--porcelain'), '');
  syncMain(project); git(project, 'push', 'origin', 'feature');
  git(project, 'merge-base', '--is-ancestor', git(seed, 'rev-parse', 'HEAD'), 'HEAD');
  assert.equal(git(project, 'for-each-ref', '--format=%(refname)', 'refs/agent-skills'), '');
  git(project, 'branch', 'stale-other-branch', 'HEAD~1');
  const staleOther = spawnSync('git', ['-C', project, 'push', 'origin', 'stale-other-branch'], { encoding: 'utf8' });
  assert.notEqual(staleOther.status, 0); assert.match(staleOther.stderr, /freshly fetched main/);
  write(project, 'dirty.txt', 'work'); assert.throws(() => syncMain(project), /clean/);
  assert.equal(read(project, '.git/hooks/pre-push'), gitHook());
});
test('Git protocol skips tags/deletions, rejects malformed input and fails closed for missing remote', t => {
  const root = temporary(t); git(root, 'init', '-b', 'main');
  const sha = 'a'.repeat(40), zero = '0'.repeat(40);
  checkPush(root, 'missing', 'refs/tags/v1 ' + sha + ' refs/tags/v1 ' + zero + '\n');
  checkPush(root, 'missing', '(delete) ' + zero + ' refs/heads/old ' + sha + '\n');
  assert.throws(() => parseUpdates('invalid'), /Invalid/);
  assert.throws(() => checkPush(root, 'missing', 'refs/heads/main ' + sha + ' refs/heads/main ' + zero), /Cannot read/);
});
test('new remote requires main bootstrap before a feature-only push', t => {
  const parent = temporary(t), remote = path.join(parent, 'remote.git'), project = path.join(parent, 'project');
  fs.mkdirSync(remote); fs.mkdirSync(project);
  git(remote, 'init', '--bare', '-b', 'main'); git(project, 'init', '-b', 'main');
  git(project, 'config', 'user.name', 'Fixture'); git(project, 'config', 'user.email', 'fixture@example.invalid');
  install(project, ['generic'], { mcp: false, hooks: false });
  git(project, 'add', '.'); git(project, 'commit', '-m', 'initial toolkit');
  git(project, 'remote', 'add', 'origin', remote); git(project, 'branch', 'feature');
  const rejected = spawnSync('git', ['-C', project, 'push', 'origin', 'feature'], { encoding: 'utf8' });
  assert.notEqual(rejected.status, 0); assert.match(rejected.stderr, /main is absent/);
  git(project, 'push', 'origin', 'main', 'feature');
  assert.equal(git(remote, 'rev-parse', 'main'), git(remote, 'rev-parse', 'feature'));
});
test('existing Git hooks and hook managers are preserved', t => {
  const root = temporary(t); git(root, 'init', '-b', 'main');
  write(root, '.git/hooks/pre-push', '#!/bin/sh\necho custom\n');
  assert.match(install(root).notices.join(' '), /Existing pre-push/);
  uninstallPlan(root).apply(); assert.match(read(root, '.git/hooks/pre-push'), /custom/);
  git(root, 'config', 'core.hooksPath', '.custom');
  assert.match(install(root).notices.join(' '), /core.hooksPath/);
});

test('MCP guidance validates arguments and paginates only public text resources', () => {
  const assets = bundleFiles();
  assert.equal(callGuidance(assets, 'skill_catalog').length, 22);
  const first = callGuidance(assets, 'read_skill', { name: 'property-based-testing', resource: 'LICENSE' });
  assert.ok(first.text.length <= 12000); assert.equal(first.next_offset, 12000);
  const next = callGuidance(assets, 'read_skill', { name: 'property-based-testing', resource: 'LICENSE', offset: first.next_offset });
  assert.notEqual(first.text, next.text);
  assert.ok(callGuidance(assets, 'read_skill', { name: 'dory', resource: '../../../.env' }).error);
  for (const args of [{ name: '../escape' }, { name: 'dory', offset: -1 }, { name: 'dory', offset: 0.5 }, { name: 'dory', command: 'pwd' }]) {
    assert.throws(() => callGuidance(assets, 'read_skill', args), /Invalid/);
  }
  assert.throws(() => callGuidance(assets, 'run_shell', {}), /Unknown/);
});
test('actual MCP stdio handshake and calls from unrelated cwd', async t => {
  const cwd = temporary(t);
  const linkedPackage = path.join(cwd, 'linked-package');
  fs.symlinkSync(ROOT, linkedPackage);
  const client = new Client({ name: 'toolkit-test', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(linkedPackage, 'lib/mcp-server.mjs')], cwd, stderr: 'pipe' });
  try {
    await client.connect(transport);
    assert.deepEqual((await client.listTools()).tools.map(t => t.name), ['skill_catalog', 'read_skill', 'framework_info']);
    const info = await client.callTool({ name: 'framework_info', arguments: {} });
    assert.equal(info.structuredContent.version, VERSION); assert.equal(info.structuredContent.writes, 'none');
    assert.match((await client.callTool({ name: 'read_skill', arguments: { name: 'python-backend' } })).content[0].text, /destination project/);
    await assert.rejects(client.callTool({ name: 'run_shell', arguments: { command: 'pwd' } }));
  } finally { await client.close(); }
});

test('shell context entrypoint also works through a symlinked project path', t => {
  const root = temporary(t), parent = temporary(t);
  install(root, ['generic'], { mcp: false, hooks: false });
  fs.symlinkSync(root, path.join(parent, 'linked-project'));
  const result = spawnSync('/bin/sh', [path.join(parent, 'linked-project/.agent-skills/run.sh'), 'context', 'resume'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /Repository resume/);
});
