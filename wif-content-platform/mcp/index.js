// MCP Server for WIF Content Platform
// Supports stdio transport for use with Claude Desktop, Cursor, Windsurf, etc.
//
// Usage (CLI):
//   npx @modelcontextprotocol/server-stdio -- node mcp/server.js
//
// Or via Cloudflare Workers with SSE transport (wrangler-mcp adapter).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListContentTool,
  GetContentTool,
  SaveDraftTool,
  UploadImageTool,
  PublishPostTool,
  SearchContentTool,
  GetSeoReportTool,
} from "./tools/index.js";

// Initialize MCP server
const server = new McpServer({
  name: "wif-content-platform",
  version: "1.0.0",
});

// Register tools
server.tool(ListContentTool);
server.tool(GetContentTool);
server.tool(SaveDraftTool);
server.tool(UploadImageTool);
server.tool(PublishPostTool);
server.tool(SearchContentTool);
server.tool(GetSeoReportTool);

// Start server on stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WIF MCP Server running on stdio");
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});