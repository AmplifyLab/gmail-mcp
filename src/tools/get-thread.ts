import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailGetThreadTool = {
  name: "gmail_get_thread",
  description: "Get a thread by id.",
  inputSchema: {
    thread_id: z.string(),
    format: z.enum(["full", "metadata", "minimal"]).optional(),
    metadata_headers: z.array(z.string()).optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    thread_id,
    format,
    metadata_headers,
    user_id = "me"
  }: {
    thread_id: string;
    format?: "full" | "metadata" | "minimal";
    metadata_headers?: string[];
    user_id?: string;
  }) => {
    const data = await gmailRequest("GET", `/users/${user_id}/threads/${thread_id}`, {
      query: {
        format,
        metadataHeaders: metadata_headers
      }
    });
    return mcpResponse(data);
  }
};

