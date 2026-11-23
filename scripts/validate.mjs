import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse as parseToml } from 'smol-toml';
import { parse as parseYaml } from 'yaml';
import { ROOT, publicAssets, skillMetadata } from '../lib/assets.mjs';
import { walk } from '../lib/files.mjs';

const assets = publicAssets();
const skills = [...assets].filter(([name]) => name.startsWith('.agents/skills/') && name.endsWith('/SKILL.md'));
if (skills.length !== 22) throw new Error('Expected 22 canonical skills');
for (const [name, data] of skills) {
  const fields = skillMetadata(data);
  if (fields.name !== path.basename(path.dirname(name))) throw new Error('Mismatched skill name: ' + name);
  for (const match of data.toString().matchAll(/\]\(([^)]+)\)/g)) {
    const reference = match[1].split('#')[0];
    if (!reference || reference.includes('://')) continue;
    const target = path.resolve(ROOT, path.dirname(name), reference);
    if (!target.startsWith(ROOT + path.sep) || !fs.existsSync(target)) throw new Error('Missing/escaping skill link: ' + name);
  }
}
for (const [name, data] of assets) {
  if (name.endsWith('.json')) JSON.parse(data);
  if (name.endsWith('.toml')) parseToml(data.toString());
  if (name.endsWith('.yaml') || name.endsWith('.yml')) parseYaml(data.toString());
  if (name.endsWith('.py')) throw new Error('Python implementation remains: ' + name);
}
const registry = JSON.parse(assets.get('configs/mcp/registry.json'));
if (registry.servers.filter(s => s.config?.enabled).length !== 1) throw new Error('Only local guidance should be enabled');
if (registry.servers.some(s => ['uv', '{uv}', 'python', '{python}'].includes(s.config?.command))) throw new Error('Python-based MCP launcher remains');
for (const folder of ['bin', 'lib', 'scripts', 'test']) {
  for (const file of walk(path.join(ROOT, folder))) {
    if (file.endsWith('.py')) throw new Error('Python implementation remains');
    if (!file.endsWith('.mjs') && !file.endsWith('.sh')) continue;
    const result = spawnSync(file.endsWith('.sh') ? '/bin/sh' : process.execPath,
      [file.endsWith('.sh') ? '-n' : '--check', file], { encoding: 'utf8' });
    if (result.status) throw new Error('Syntax check failed: ' + path.relative(ROOT, file));
  }
}
for (const name of ['pyproject.toml', 'uv.lock', '.python-version', '.pre-commit-config.yaml']) {
  if (fs.existsSync(path.join(ROOT, name))) throw new Error('Retired Python setup remains: ' + name);
}
console.log('22 skills, licenses/hashes, links, MCP recipes, JSON/TOML/YAML and Node/shell syntax validated.');
