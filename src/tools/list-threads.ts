import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";

export const gmailListThreadsTool = {
  name: "gmail_list_threads",
  description: "List threads in a mailbox.",
  inputSchema: {
    q: z.string().optional(),
    label_ids: z.array(z.string()).optional(),
    max_results: z.number().int().positive().max(500).optional(),
    page_token: z.string().optional(),
    include_spam_trash: z.boolean().optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    q,
    label_ids,
    max_results,
    page_token,
    include_spam_trash,
    user_id = "me"
  }: {
    q?: string;
    label_ids?: string[];
    max_results?: number;
    page_token?: string;
    include_spam_trash?: boolean;
    user_id?: string;
  }) => {
    const data = await gmailRequest("GET", `/users/${user_id}/threads`, {
      query: {
        q,
        labelIds: label_ids,
        maxResults: max_results,
        pageToken: page_token,
        includeSpamTrash: include_spam_trash
      }
    });
    return mcpResponse(data);
  }
};

