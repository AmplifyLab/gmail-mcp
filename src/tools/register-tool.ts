import type {
  McpServer
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisterTool } from "../types/tool.js";

export function createRegisterTool(server: McpServer): RegisterTool {
  return (name, description, inputSchema, cb) =>
    server.registerTool(name, { description, inputSchema }, cb);
}
