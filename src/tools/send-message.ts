import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest } from "../gmail-request.js";
import { buildRawEmail } from "../email-raw.js";

export const gmailSendMessageTool = {
  name: "gmail_send_message",
  description:
    "Send a message. Prefer structured fields (to/subject/text/html/attachments); use raw RFC2822 base64/base64url only for advanced cases.",
  inputSchema: {
    raw: z.string().optional(),
    from: z.string().optional(),
    to: z.array(z.string()).optional(),
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
    subject: z.string().optional(),
    text: z.string().optional(),
    html: z.string().optional(),
    attachments: z
      .array(
        z.object({
          filename: z.string(),
          mime_type: z.string(),
          content_base64: z.string(),
          inline_cid: z.string().optional()
        })
      )
      .optional(),
    thread_id: z.string().optional(),
    label_ids: z.array(z.string()).optional(),
    user_id: z.string().default("me").optional()
  },
  cb: async ({
    raw,
    from,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
    thread_id,
    label_ids,
    user_id = "me"
  }: {
    raw?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      mime_type: string;
      content_base64: string;
      inline_cid?: string;
    }>;
    thread_id?: string;
    label_ids?: string[];
    user_id?: string;
  }) => {
    const finalRaw = buildRawEmail({
      raw,
      from,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments
    });

    const data = await gmailRequest("POST", `/users/${user_id}/messages/send`, {
      body: {
        raw: finalRaw,
        threadId: thread_id,
        labelIds: label_ids
      }
    });
    return mcpResponse(data);
  }
};
