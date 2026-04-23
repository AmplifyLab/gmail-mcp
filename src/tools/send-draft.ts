import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailSendDraftTool = {
  name: "gmail_send_draft",
  description: "Send a draft by id.",
  inputSchema: {
    draft_id: z.string(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({ draft_id, user_id = "me" }: { draft_id: string; user_id?: string }) => {
    const data = await gmailRequest("POST", `/users/${user_id}/drafts/send`, {
      body: {
        id: draft_id
      }
    });
    return mcpResponse(data);
  }
};

