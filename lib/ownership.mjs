import fs from 'node:fs';
import { atomic, digest, encode, equal, object, readFile, safePath, same } from './files.mjs';

export const MANIFEST = '.agent-skills/install.json';
function parseJson(data, name) {
  try { return JSON.parse(data?.toString() || '{}'); }
  catch { throw new Error('Invalid JSON file: ' + name); }
}

// Schema 1 remains readable so a Node-only upgrade can retire the Python installation.
export class Plan {
  constructor(root) {
    this.root = fs.realpathSync(root);
    if (!fs.statSync(this.root).isDirectory()) throw new Error('Project must be a directory');
    this.before = new Map(); this.after = new Map(); this.modes = new Map(); this.originalModes = new Map();
    this.records = [];
    this.old = parseJson(this.read(MANIFEST), MANIFEST);
    if (!object(this.old) || (Object.keys(this.old).length
        && (![1, 2].includes(this.old.schema) || !Array.isArray(this.old.records)))) {
      throw new Error('Unsupported installation manifest');
    }
  }
  read(name) {
    if (!this.before.has(name)) {
      const file = safePath(this.root, name);
      const data = readFile(file);
      const mode = data === null ? 0o644 : fs.statSync(file).mode & 0o777;
      this.before.set(name, data); this.after.set(name, data);
      this.modes.set(name, mode); this.originalModes.set(name, mode);
    }
    return this.after.get(name);
  }
  write(name, data, mode) {
    this.read(name);
    this.after.set(name, data === null ? null : Buffer.from(data));
    if (mode !== undefined) this.modes.set(name, mode);
  }
  removeOld() {
    for (const record of [...(this.old.records || [])].reverse()) {
      const { path: name, kind } = record;
      const data = this.read(name);
      if (name === '.git/hooks/pre-push' && (data === null || digest(data) !== record.sha256)) continue;
      if (data === null) throw new Error('Managed file is missing: ' + name);
      if (kind === 'file') {
        if (digest(data) !== record.sha256) throw new Error('Managed file was edited: ' + name);
        this.write(name, null);
      } else if (kind === 'block') {
        if (typeof record.content !== 'string' || !record.content) throw new Error('Invalid managed block');
        const parts = data.toString().split(record.content);
        if (parts.length !== 2) throw new Error('Managed block was edited: ' + name);
        const remaining = parts.join('');
        this.write(name, record.created && !remaining ? null : remaining);
      } else if (kind === 'json') {
        const document = parseJson(data, name);
        let parent = document;
        const lineage = [];
        this.checkKeys(record.keys);
        for (const key of record.keys.slice(0, -1)) {
          if (!object(parent) || !Object.hasOwn(parent, key) || !object(parent[key])) {
            throw new Error('Managed JSON location was edited: ' + name);
          }
          lineage.push([parent, key]); parent = parent[key];
        }
        const key = record.keys.at(-1);
        if (!object(parent)) throw new Error('Managed JSON location was edited: ' + name);
        if (record.append) {
          const values = parent[key];
          if (!Array.isArray(values) || values.filter(v => equal(v, record.value)).length !== 1) {
            throw new Error('Managed hook was edited: ' + name);
          }
          values.splice(values.findIndex(v => equal(v, record.value)), 1);
          if (!values.length && record.leaf_created) delete parent[key];
        } else if (Object.hasOwn(parent, key) && equal(parent[key], record.value)) delete parent[key];
        else throw new Error('Managed JSON entry was edited: ' + name);
        for (const [container, child] of lineage.reverse()) {
          if (!Object.keys(container[child]).length && record.parents_created.includes(child)) delete container[child];
        }
        this.write(name, record.created && !Object.keys(document).length ? null : encode(document));
      } else throw new Error('Unknown manifest record type');
    }
  }
  file(name, data, mode = 0o644) {
    data = Buffer.from(data);
    const current = this.read(name);
    if (same(current, data)) return;
    if (current !== null) throw new Error('Existing file preserved: ' + name);
    this.write(name, data, mode);
    this.records.push({ kind: 'file', path: name, sha256: digest(data), mode });
  }
  block(name, content, comment = false) {
    const current = this.read(name), text = current?.toString() || '';
    const start = comment ? '# agent-skills:begin' : '<!-- agent-skills:begin -->';
    const end = comment ? '# agent-skills:end' : '<!-- agent-skills:end -->';
    if (text.includes(start) || text.includes(end)) throw new Error('Unowned managed marker preserved: ' + name);
    const block = (text ? '\n' : '') + start + '\n' + content.trimEnd() + '\n' + end + '\n';
    this.write(name, text + block);
    this.records.push({ kind: 'block', path: name, content: block, created: current === null });
  }
  checkKeys(keys) {
    if (!Array.isArray(keys) || !keys.length || keys.some(k => typeof k !== 'string'
        || ['__proto__', 'constructor', 'prototype'].includes(k))) throw new Error('Unsafe JSON key');
  }
  jsonEntry(name, keys, value, append = false) {
    this.checkKeys(keys);
    const current = this.read(name), document = parseJson(current, name);
    if (!object(document)) throw new Error('Expected JSON object: ' + name);
    let parent = document;
    const created = [];
    for (const key of keys.slice(0, -1)) {
      if (!Object.hasOwn(parent, key)) { parent[key] = {}; created.push(key); }
      if (!object(parent[key])) throw new Error('Existing JSON structure preserved: ' + name);
      parent = parent[key];
    }
    const key = keys.at(-1), leafCreated = !Object.hasOwn(parent, key);
    if (append) {
      if (leafCreated) parent[key] = [];
      if (!Array.isArray(parent[key])) throw new Error('Expected hook list: ' + name);
      if (parent[key].some(v => equal(v, value))) return;
      parent[key].push(value);
    } else {
      if (!leafCreated) {
        if (equal(parent[key], value)) return;
        throw new Error('Existing JSON entry preserved: ' + name);
      }
      parent[key] = value;
    }
    this.write(name, encode(document));
    this.records.push({ kind: 'json', path: name, keys, value, append, created: current === null,
      leaf_created: leafCreated, parents_created: created });
  }
  changes() {
    return [...this.after.keys()].filter(n => !same(this.before.get(n), this.after.get(n))).sort();
  }
  apply(writer = atomic) {
    const lock = safePath(this.root, '.agent-skills.install.lock');
    let descriptor;
    try { descriptor = fs.openSync(lock, 'wx', 0o600); }
    catch (error) { if (error.code === 'EEXIST') throw new Error('Another install is running or a stale lock exists'); throw error; }
    fs.closeSync(descriptor);
    const written = [];
    try {
      for (const name of this.changes()) {
        if (!same(readFile(safePath(this.root, name)), this.before.get(name))) {
          throw new Error('File changed during planning: ' + name);
        }
      }
      for (const name of this.changes().sort((a, b) => Number(a === MANIFEST) - Number(b === MANIFEST))) {
        const file = safePath(this.root, name), data = this.after.get(name);
        if (data === null) fs.rmSync(file, { force: true });
        else writer(file, data, this.modes.get(name));
        written.push(name);
      }
    } catch (error) {
      for (const name of written.reverse()) {
        const file = safePath(this.root, name), data = this.before.get(name);
        if (data === null) fs.rmSync(file, { force: true });
        else atomic(file, data, this.originalModes.get(name));
      }
      throw error;
    } finally { fs.rmSync(lock, { force: true }); }
  }
}
