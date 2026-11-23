import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { object } from './files.mjs';
import { checkpoint, codeMap, resume, snapshot } from './context.mjs';
import { checkPush, syncMain } from './git.mjs';

export async function stdin(limit = 262144) {
  const chunks = []; let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > limit) throw new Error('Input exceeds size limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}
export function hook(root, host, event, raw) {
  if (!['codex', 'claude', 'cline', 'antigravity', 'copilot'].includes(host)) throw new Error('Unsupported hook host');
  if (Buffer.byteLength(raw) > 262144) throw new Error('Hook input exceeds size limit');
  const payload = JSON.parse(raw || '{}');
  if (!object(payload)) throw new Error('Expected hook JSON object');
  if (['SessionStart', 'TaskStart', 'TaskResume', 'sessionStart'].includes(event)) {
    const notes = resume(root);
    if (host === 'cline') return { cancel: false, contextModification: notes };
    if (host === 'copilot') return { additionalContext: notes };
    if (host === 'antigravity') return { injectSteps: [{ systemMessage: { systemMessage: notes } }] };
    return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: notes } };
  }
  if (!['Stop', 'PreCompact', 'TaskCancel', 'agentStop', 'sessionEnd'].includes(event)) throw new Error('Unsupported lifecycle event');
  snapshot(root, payload.session_id ?? payload.taskId ?? payload.sessionId ?? 'local', event);
  return host === 'cline' ? { cancel: false } : {};
}
export async function runtime(args, root) {
  root = fs.realpathSync(root);
  const [command, action, ...rest] = args;
  if (command === 'hook') return JSON.stringify(hook(root, action, rest[0], await stdin()));
  if (command === 'git-sync') {
    if (action === 'sync') return syncMain(root);
    if (action === 'pre-push') { checkPush(root, rest[0] || 'origin', await stdin()); return ''; }
  }
  if (command === 'context') {
    if (action === 'resume') return resume(root);
    if (action === 'map') return codeMap(root);
    if (action === 'checkpoint') {
      const values = {};
      while (rest.length) {
        const key = rest.shift();
        if (!['--summary', '--next', '--checks'].includes(key) || !rest.length) throw new Error('Invalid checkpoint options');
        values[key] = rest.shift();
      }
      return checkpoint(root, values['--summary'], values['--next'], values['--checks']);
    }
  }
  throw new Error('Use context resume|map|checkpoint, git-sync sync|pre-push, or hook HOST EVENT');
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  try { const output = await runtime(process.argv.slice(2), root); if (output) console.log(output); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
