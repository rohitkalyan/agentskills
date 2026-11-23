import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ROOT, VERSION } from '../lib/assets.mjs';
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-npm-'));
function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
  if (result.status !== 0) throw new Error('Package verification command failed: ' + command + '\n' + result.stderr.slice(-1500));
  return result.stdout;
}
try {
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  const [packed] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', path.join(ROOT, 'dist')]));
  const names = packed.files.map(f => f.path);
  assert.equal(names.filter(n => n.startsWith('.agents/skills/') && n.endsWith('/SKILL.md')).length, 22);
  assert.ok(names.includes('npm-shrinkwrap.json')); assert.ok(names.includes('rules/CORE.md'));
  assert.ok(names.every(n => !n.endsWith('.py') && !n.includes('.context/local') && !n.includes('.env') && !n.startsWith('node_modules/')));
  const env = path.join(temp, 'env'), project = path.join(temp, 'project'), plugin = path.join(temp, 'plugin');
  for (const dir of [env, project, plugin]) fs.mkdirSync(dir);
  run('npm', ['install', '--prefix', env, '--ignore-scripts', '--no-audit', '--no-fund', path.join(ROOT, 'dist', packed.filename)], temp);
  const pkg = path.join(env, 'node_modules/agent-skills-toolkit');
  const cli = path.join(pkg, 'bin/agent-skills.mjs');
  run(process.execPath, [cli, 'install', '--project', project, '--clients', 'all'], temp);
  assert.equal(JSON.parse(run(process.execPath, [cli, 'doctor', '--project', project], temp)).ok, true);
  for (const name of ['src', 'app', 'pyproject.toml', 'package.json', 'node_modules', 'Makefile']) assert.equal(fs.existsSync(path.join(project, name)), false);
  assert.match(run('/bin/sh', [path.join(project, '.agent-skills/run.sh'), 'context', 'resume'], temp), /Repository resume/);
  const client = new Client({ name: 'packed-toolkit-test', version: '1.0.0' });
  try {
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(pkg, 'lib/mcp-server.mjs')], cwd: temp, stderr: 'inherit' }));
    assert.equal((await client.callTool({ name: 'framework_info', arguments: {} })).structuredContent.version, VERSION);
  } finally { await client.close(); }
  run(process.execPath, [cli, 'export-plugin', '--output', plugin], temp);
  run(process.execPath, [cli, 'uninstall', '--project', project], temp);
  assert.equal(fs.existsSync(path.join(project, '.agent-skills/install.json')), false);
  console.log('Packed npm archive verified: isolated install, all clients, shell context, real MCP, plugin and uninstall passed. No Python or application scaffold.');
  console.log(path.join(ROOT, 'dist', packed.filename));
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
