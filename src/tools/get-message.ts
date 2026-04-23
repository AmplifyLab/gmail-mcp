import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailGetMessageTool = {
  name: "gmail_get_message",
  description: "Get a message by id.",
  inputSchema: {
    message_id: z.string(),
    format: z.enum(["full", "metadata", "minimal", "raw"]).optional(),
    metadata_headers: z.array(z.string()).optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    message_id,
    format,
    metadata_headers,
    user_id = "me"
  }: {
    message_id: string;
    format?: "full" | "metadata" | "minimal" | "raw";
    metadata_headers?: string[];
    user_id?: string;
  }) => {
    const data = await gmailRequest("GET", `/users/${user_id}/messages/${message_id}`, {
      query: {
        format,
        metadataHeaders: metadata_headers
      }
    });
    return mcpResponse(data);
  }
};

