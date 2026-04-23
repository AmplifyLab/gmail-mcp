import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailCreateLabelTool = {
  name: "gmail_create_label",
  description: "Create a new Gmail label.",
  inputSchema: {
    name: z.string(),
    message_list_visibility: z.enum(["show", "hide"]).optional(),
    label_list_visibility: z
      .enum(["labelShow", "labelShowIfUnread", "labelHide"])
      .optional(),
    background_color: z.string().optional(),
    text_color: z.string().optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    name,
    message_list_visibility,
    label_list_visibility,
    background_color,
    text_color,
    user_id = "me"
  }: {
    name: string;
    message_list_visibility?: "show" | "hide";
    label_list_visibility?: "labelShow" | "labelShowIfUnread" | "labelHide";
    background_color?: string;
    text_color?: string;
    user_id?: string;
  }) => {
    const data = await gmailRequest("POST", `/users/${user_id}/labels`, {
      body: {
        name,
        messageListVisibility: message_list_visibility,
        labelListVisibility: label_list_visibility,
        color:
          background_color || text_color
            ? {
                backgroundColor: background_color,
                textColor: text_color
              }
            : undefined
      }
    });
    return mcpResponse(data);
  }
};

