import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailGetProfileTool = {
  name: "gmail_get_profile",
  description: "Get mailbox profile for a user.",
  inputSchema: {
    user_id: z.string().default("me").optional()
  },
  cb: async ({ user_id = "me" }: { user_id?: string }) => {
    const data = await gmailRequest("GET", `/users/${user_id}/profile`);
    return mcpResponse(data);
  }
};

