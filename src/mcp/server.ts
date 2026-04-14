/**
 * Convergio Frontend MCP Server
 *
 * Exposes the framework's component catalog, YAML generation,
 * and composition patterns as MCP tools for AI agents.
 *
 * Usage:
 *   npx tsx src/mcp/server.ts          # stdio transport (Copilot CLI, Claude Desktop)
 *   npx tsx src/mcp/server.ts --http   # Streamable HTTP transport (web agents)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { registerSearchTools } from './tools/search';
import { registerComponentTool } from './tools/component';
import { registerGenerateTools } from './tools/generate';
import { registerCompositionTools } from './tools/composition';
import { registerAnalyzeTools } from './tools/analyze';
import { registerDepsTools } from './tools/deps';

const server = new McpServer({
  name: 'convergio-ui-framework',
  version: '1.1.0',
});

registerSearchTools(server);
registerComponentTool(server);
registerGenerateTools(server);
registerCompositionTools(server);
registerAnalyzeTools(server);
registerDepsTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});

export { server, z };
