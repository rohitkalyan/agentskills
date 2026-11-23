import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
export const digest = data => crypto.createHash('sha256').update(data).digest('hex');
export const same = (a, b) => a === null || b === null ? a === b : a.equals(b);
export const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const equal = (a, b) => {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => equal(v, b[i]));
  if (object(a) && object(b)) return Object.keys(a).length === Object.keys(b).length
    && Object.keys(a).every(k => Object.hasOwn(b, k) && equal(a[k], b[k]));
  return false;
};

export function safePath(root, name) {
  if (typeof name !== 'string' || !name || path.isAbsolute(name) || /[\\\0\r\n]/.test(name)
      || name.split('/').some(p => !p || p === '..' || p === '.')) {
    throw new Error('Unsafe installation path');
  }
  let current = root;
  for (const part of name.split('/')) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Symlink preserved: ' + name);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return current;
}

export function readFile(file) {
  try { return fs.readFileSync(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

export function atomic(file, data, mode = 0o644) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = path.join(path.dirname(file), '.agent-skills-pending-' + crypto.randomUUID());
  try {
    fs.writeFileSync(temp, data, { flag: 'wx', mode });
    fs.chmodSync(temp, mode);
    fs.renameSync(temp, file);
  } finally { fs.rmSync(temp, { force: true }); }
}

export function walk(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(folder, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Asset symlink refused: ' + file);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) result.push(file);
    }
  }
  visit(root);
  return result;
}
