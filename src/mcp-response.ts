import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function mcpResponse(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}
