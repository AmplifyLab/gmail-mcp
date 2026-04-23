import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailModifyMessageTool = {
  name: "gmail_modify_message",
  description: "Modify labels on a message.",
  inputSchema: {
    message_id: z.string(),
    add_label_ids: z.array(z.string()).optional(),
    remove_label_ids: z.array(z.string()).optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    message_id,
    add_label_ids,
    remove_label_ids,
    user_id = "me"
  }: {
    message_id: string;
    add_label_ids?: string[];
    remove_label_ids?: string[];
    user_id?: string;
  }) => {
    const data = await gmailRequest("POST", `/users/${user_id}/messages/${message_id}/modify`, {
      body: {
        addLabelIds: add_label_ids,
        removeLabelIds: remove_label_ids
      }
    });
    return mcpResponse(data);
  }
};

