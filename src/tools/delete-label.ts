import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailDeleteLabelTool = {
  name: "gmail_delete_label",
  description: "Delete a Gmail label by id.",
  inputSchema: {
    label_id: z.string(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({ label_id, user_id = "me" }: { label_id: string; user_id?: string }) => {
    const data = await gmailRequest("DELETE", `/users/${user_id}/labels/${label_id}`);
    return mcpResponse(data);
  }
};

