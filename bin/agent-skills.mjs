#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { installPlan, uninstallPlan, doctor, pluginPlan } from '../lib/installer.mjs';
import { runtime } from '../lib/runtime.mjs';
import { VERSION } from '../lib/assets.mjs';
import { CLIENTS } from '../lib/adapters.mjs';

try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    project: { type: 'string', default: process.cwd() }, clients: { type: 'string', default: 'all' },
    output: { type: 'string' }, 'dry-run': { type: 'boolean' }, 'no-hooks': { type: 'boolean' },
    'no-mcp': { type: 'boolean' }, 'no-git-hook': { type: 'boolean' }, version: { type: 'boolean' },
    help: { type: 'boolean' }, summary: { type: 'string' }, next: { type: 'string' }, checks: { type: 'string' },
  } });
  const [command, ...rest] = positionals;
  if (values.version) console.log(VERSION);
  else if (values.help || !command) console.log([
    'agent-skills install --project PATH --clients all [--dry-run]',
    'agent-skills doctor|uninstall --project PATH',
    'agent-skills context resume|map|checkpoint --project PATH',
    'agent-skills git-sync sync --project PATH',
    'agent-skills export-plugin --output EXISTING_DIRECTORY',
    'Node.js 22+, npm and Git. No Python, pip or uv required.',
  ].join('\n'));
  else if (command === 'clients') console.log(JSON.stringify(CLIENTS));
  else if (command === 'doctor') {
    const report = doctor(values.project); console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  } else if (['context', 'git-sync', 'hook'].includes(command)) {
    for (const name of ['summary', 'next', 'checks']) if (values[name] !== undefined) rest.push('--' + name, values[name]);
    const output = await runtime([command, ...rest], values.project);
    if (output) console.log(output);
  } else {
    let plan, notices = [];
    if (command === 'install') ({ plan, notices } = installPlan(values.project,
      values.clients === 'all' ? CLIENTS : values.clients.split(','),
      { hooks: !values['no-hooks'], mcp: !values['no-mcp'], gitHook: !values['no-git-hook'] }));
    else if (command === 'uninstall') plan = uninstallPlan(values.project);
    else if (command === 'export-plugin' && values.output) plan = pluginPlan(values.output);
    else throw new Error('Unknown command or missing output; use --help');
    const changes = plan.changes();
    if (!values['dry-run']) plan.apply();
    console.log(JSON.stringify({ operation: command, dry_run: Boolean(values['dry-run']), changed_files: changes.length, paths: changes, notices }, null, 2));
  }
} catch (error) {
  // Do not serialize command arguments, existing settings or credential-bearing subprocess errors.
  const message = error.code ? 'Filesystem operation failed (' + error.code + ')' : error.message;
  console.error('agent-skills: ' + message); process.exitCode = 2;
}
