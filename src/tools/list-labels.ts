import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailListLabelsTool = {
  name: "gmail_list_labels",
  description: "List labels in a mailbox.",
  inputSchema: {
    user_id: z.string().default("me").optional()
  },
  cb: async ({ user_id = "me" }: { user_id?: string }) => {
    const data = await gmailRequest("GET", `/users/${user_id}/labels`);
    return mcpResponse(data);
  }
};

