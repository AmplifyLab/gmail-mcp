import type {
  RegisteredTool,
  ToolCallback
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";

export type RegisterTool = <Schema extends z.ZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,
  cb: ToolCallback<Schema>
) => RegisteredTool;

