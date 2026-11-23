import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { digest, walk, safePath } from './files.mjs';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).version;
export function bundleFiles(root = ROOT) {
  const assets = new Map();
  for (const directory of ['.agents/skills', '.codex/agents', 'docs', 'rules', 'configs']) {
    for (const file of walk(path.join(root, directory))) assets.set(path.relative(root, file).split(path.sep).join('/'), fs.readFileSync(file));
  }
  for (const name of ['runtime.mjs', 'context.mjs', 'git.mjs', 'files.mjs']) {
    assets.set('lib/' + name, fs.readFileSync(path.join(root, 'lib', name)));
  }
  assets.set('run.sh', fs.readFileSync(path.join(root, 'scripts/run.sh')));
  return assets;
}
export function verifyAssets(assets) {
  const manifest = JSON.parse(assets.get('configs/skills/sources.json'));
  for (const skill of manifest.skills) {
    const prefix = '.agents/skills/' + skill.name + '/';
    const actual = [...assets.keys()].filter(n => n.startsWith(prefix)).map(n => n.slice(prefix.length)).sort();
    if (JSON.stringify(actual) !== JSON.stringify(Object.keys(skill.files).sort())) throw new Error('Unreviewed skill content: ' + skill.name);
    for (const [name, entry] of Object.entries(skill.files)) {
      if (digest(assets.get(prefix + name)) !== entry.sha256) throw new Error('Skill integrity mismatch: ' + skill.name);
    }
  }
}
export function skillMetadata(data) {
  const parts = data.toString().split('---');
  if (parts[0].trim() || parts.length < 3) throw new Error('Invalid skill frontmatter');
  const fields = parseYaml(parts[1]);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name) || typeof fields.description !== 'string') throw new Error('Invalid skill metadata');
  return fields;
}
export function publicAssets() {
  const assets = bundleFiles(); verifyAssets(assets); return assets;
}
export function canonicalSkillFile(name, resource = 'SKILL.md') {
  return safePath(ROOT, '.agents/skills/' + name + '/' + resource);
}
