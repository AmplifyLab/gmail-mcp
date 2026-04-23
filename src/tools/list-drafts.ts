import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailListDraftsTool = {
  name: "gmail_list_drafts",
  description: "List drafts in a mailbox.",
  inputSchema: {
    max_results: z.number().int().positive().max(500).optional(),
    page_token: z.string().optional(),
    include_spam_trash: z.boolean().optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    max_results,
    page_token,
    include_spam_trash,
    user_id = "me"
  }: {
    max_results?: number;
    page_token?: string;
    include_spam_trash?: boolean;
    user_id?: string;
  }) => {
    const data = await gmailRequest("GET", `/users/${user_id}/drafts`, {
      query: {
        maxResults: max_results,
        pageToken: page_token,
        includeSpamTrash: include_spam_trash
      }
    });
    return mcpResponse(data);
  }
};

