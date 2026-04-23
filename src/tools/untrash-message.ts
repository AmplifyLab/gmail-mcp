import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailUntrashMessageTool = {
  name: "gmail_untrash_message",
  description: "Remove a message from trash.",
  inputSchema: {
    message_id: z.string(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({ message_id, user_id = "me" }: { message_id: string; user_id?: string }) => {
    const data = await gmailRequest("POST", `/users/${user_id}/messages/${message_id}/untrash`);
    return mcpResponse(data);
  }
};

