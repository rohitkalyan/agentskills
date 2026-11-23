import path from 'node:path';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';
import { encode } from './files.mjs';
import { ROOT } from './assets.mjs';

export const CLIENTS = ['codex', 'claude', 'cline', 'antigravity', 'copilot', 'generic'];
export const MCP_NAME = 'agent_skills_kit';
export const MCP_TOOLS = ['skill_catalog', 'read_skill', 'framework_info'];
export const quote = value => "'" + String(value).replaceAll("'", "'\\''") + "'";
export function hookCommand(root, host, event) {
  return [process.execPath, path.join(root, '.agent-skills/lib/runtime.mjs'), 'hook', host, event].map(quote).join(' ');
}
function addHooks(plan, client) {
  if (['codex', 'claude'].includes(client)) {
    const location = client === 'codex' ? '.codex/hooks.json' : '.claude/settings.json';
    for (const event of ['SessionStart', 'PreCompact', 'Stop']) {
      plan.jsonEntry(location, ['hooks', event], { hooks: [{ type: 'command', command: hookCommand(plan.root, client, event), timeout: 10 }] }, true);
    }
  } else if (client === 'antigravity') {
    const value = {};
    for (const event of ['SessionStart', 'Stop']) value[event] = [{ type: 'command', command: hookCommand(plan.root, client, event), timeout: 10 }];
    plan.jsonEntry('.agents/hooks.json', ['agent-skills-memory'], value);
  } else if (client === 'copilot') {
    plan.jsonEntry('.github/hooks/agent-skills.json', ['version'], 1);
    for (const event of ['sessionStart', 'agentStop', 'sessionEnd']) {
      plan.jsonEntry('.github/hooks/agent-skills.json', ['hooks', event],
        { type: 'command', bash: hookCommand(plan.root, client, event), timeoutSec: 10 }, true);
    }
  } else if (client === 'cline') {
    for (const event of ['TaskStart', 'TaskResume', 'PreCompact', 'TaskCancel']) {
      plan.file('.clinerules/hooks/' + event, '#!/bin/sh\nexec ' + hookCommand(plan.root, client, event) + '\n', 0o755);
    }
  }
}
function addMcp(plan, client) {
  const server = { command: process.execPath, args: [path.join(ROOT, 'lib/mcp-server.mjs')] };
  if (client === 'codex') {
    const name = '.codex/config.toml', current = plan.read(name)?.toString() || '';
    let parsed;
    try { parsed = parseToml(current); } catch { throw new Error('Invalid Codex TOML configuration'); }
    if (parsed.mcp_servers?.[MCP_NAME]) throw new Error('Existing Codex MCP entry preserved');
    plan.block(name, stringifyToml({ mcp_servers: { [MCP_NAME]: { ...server, enabled_tools: MCP_TOOLS } } }), true);
    parseToml(plan.read(name).toString());
  } else if (client === 'claude') {
    plan.jsonEntry('.mcp.json', ['mcpServers', MCP_NAME], server);
  } else if (client === 'antigravity') {
    plan.jsonEntry('.agents/mcp_config.json', ['mcpServers', MCP_NAME], server);
  } else if (client === 'copilot') {
    plan.jsonEntry('.github/mcp.json', ['mcpServers', MCP_NAME], { ...server, type: 'local', tools: MCP_TOOLS });
  } else {
    if (client === 'cline') Object.assign(server, { disabled: false, autoApprove: [] });
    plan.file('.agent-skills/mcp/' + client + '.json', encode({ mcpServers: { [MCP_NAME]: server } }));
  }
}
function addProfiles(plan, client, assets) {
  for (const [file, data] of assets) {
    if (!file.startsWith('.codex/agents/') || !file.endsWith('.toml')) continue;
    const agent = parseToml(data.toString()), name = 'framework-' + agent.name;
    if (client === 'codex') {
      plan.file('.codex/agents/' + name + '.toml', stringifyToml({ ...agent, name }));
    } else if (['claude', 'copilot', 'antigravity'].includes(client)) {
      const extra = client === 'claude' ? 'model: inherit\n' : client === 'antigravity'
        ? 'model: inherit\ncommandExecutionPolicy: sandbox\ntools: [view_file, grep_search, run_command, replace_file_content]\n' : '';
      const location = { claude: '.claude/agents', copilot: '.github/agents', antigravity: '.agents/agents' }[client];
      const suffix = client === 'copilot' ? '.agent.md' : '.md';
      plan.file(location + '/' + name + suffix, '---\nname: ' + name + '\ndescription: ' + JSON.stringify(agent.description)
        + '\n' + extra + '---\n\nRead .agent-skills/USAGE.md for command mappings.\n\n'
        + agent.developer_instructions.replaceAll('.agents/skills/', '.agent-skills/.agents/skills/') + '\n');
    }
  }
}
export function addClient(plan, client, assets, options) {
  const folder = { claude: '.claude/skills', cline: '.cline/skills', copilot: '.github/skills' }[client] || '.agents/skills';
  for (const [file, data] of assets) {
    if (!file.startsWith('.agents/skills/') || !file.endsWith('/SKILL.md')) continue;
    const frontmatter = data.toString().split('---')[1], name = path.basename(path.dirname(file));
    plan.file(folder + '/' + name + '/SKILL.md', '---' + frontmatter + '---\n\nRead .agent-skills/USAGE.md, then '
      + '[the canonical skill](../../../.agent-skills/' + file + '). Load only relevant references.\n');
    const license = assets.get('.agents/skills/' + name + '/LICENSE');
    if (license) plan.file(folder + '/' + name + '/LICENSE', license);
  }
  const instruction = { claude: 'CLAUDE.md', copilot: '.github/copilot-instructions.md' }[client];
  if (instruction) plan.block(instruction, 'Read AGENTS.md and .agent-skills/USAGE.md for shared engineering workflows.');
  addProfiles(plan, client, assets);
  if (options.hooks) addHooks(plan, client);
  if (options.mcp) addMcp(plan, client);
}
