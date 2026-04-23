import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailDeleteDraftTool = {
  name: "gmail_delete_draft",
  description: "Delete a draft by id.",
  inputSchema: {
    draft_id: z.string(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({ draft_id, user_id = "me" }: { draft_id: string; user_id?: string }) => {
    const data = await gmailRequest("DELETE", `/users/${user_id}/drafts/${draft_id}`);
    return mcpResponse(data);
  }
};

