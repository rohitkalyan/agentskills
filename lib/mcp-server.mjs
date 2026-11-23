import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { publicAssets, skillMetadata, VERSION } from './assets.mjs';
import { object } from './files.mjs';

const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const empty = { type: 'object', properties: {}, additionalProperties: false };
export const TOOLS = [
  { name: 'skill_catalog', description: 'List bundled skill names and routing descriptions.', inputSchema: empty, annotations },
  { name: 'read_skill', description: 'Read a public skill resource in pages of at most 12000 characters.', annotations,
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, resource: { type: 'string', default: 'SKILL.md' },
      offset: { type: 'integer', minimum: 0, default: 0 } }, required: ['name'], additionalProperties: false } },
  { name: 'framework_info', description: 'Describe public toolkit capabilities, without inspecting the project.', inputSchema: empty, annotations },
];
export function callGuidance(assets, name, args = {}) {
  if (!object(args)) throw new Error('Arguments must be an object');
  if (!TOOLS.some(tool => tool.name === name)) throw new Error('Unknown tool');
  if (name !== 'read_skill' && Object.keys(args).length) throw new Error('This tool accepts no arguments');
  if (name === 'skill_catalog') return [...assets].filter(([n]) => n.startsWith('.agents/skills/') && n.endsWith('/SKILL.md'))
    .map(([, data]) => skillMetadata(data)).map(({ name, description }) => ({ name, description }));
  if (name === 'framework_info') return { version: VERSION, transport: 'stdio', writes: 'none', network: 'none',
    scope: 'Bundled public skills only. No project, session, shell or credential access.', runtime: 'Node.js; no Python' };
  const { name: skill, resource = 'SKILL.md', offset = 0 } = args;
  if (Object.keys(args).some(key => !['name', 'resource', 'offset'].includes(key))
      || typeof skill !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill)
      || typeof resource !== 'string' || !Number.isSafeInteger(offset) || offset < 0) throw new Error('Invalid skill arguments');
  const prefix = '.agents/skills/' + skill + '/';
  const resources = [...assets.keys()].filter(n => n.startsWith(prefix)).map(n => n.slice(prefix.length)).sort();
  if (!resources.includes(resource) || !(resource.endsWith('.md') || resource === 'LICENSE')) {
    return { error: 'Unknown public text resource', resources };
  }
  const text = assets.get(prefix + resource).toString();
  return { name: skill, resource, text: text.slice(offset, offset + 12000),
    next_offset: offset + 12000 < text.length ? offset + 12000 : null, resources };
}
export function createServer() {
  const assets = publicAssets();
  const server = new Server({ name: 'agent-skills-toolkit', version: VERSION }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async request => {
    if (!TOOLS.some(t => t.name === request.params.name)) throw new McpError(ErrorCode.InvalidParams, 'Unknown tool');
    try {
      const value = callGuidance(assets, request.params.name, request.params.arguments);
      const structured = Array.isArray(value) ? { skills: value } : value;
      return { content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: structured, isError: Boolean(value.error) };
    } catch (error) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
  });
  return server;
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await createServer().connect(new StdioServerTransport()); }
  catch (error) {
    // Startup reads only public package assets; no user configuration or credentials.
    console.error('Guidance MCP failed to start: ' + error.message); process.exitCode = 1;
  }
}
