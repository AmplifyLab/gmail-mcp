import { z } from "zod";
import { mcpResponse } from "../mcp-response.js";
import { gmailRequest, type HttpMethod } from "../gmail-request.js";

export const gmailRawRequestTool = {
  name: "gmail_raw_request",
  description:
    "Send a raw request to Gmail API v1. Use this for endpoints not covered by dedicated tools.",
  inputSchema: {
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    path: z.string().describe("Path like /users/me/messages or /users/me/labels"),
    query: z
      .record(z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))]))
      .optional(),
    body: z.unknown().optional()
  },
  cb: async ({
    method,
    path,
    query,
    body
  }: {
    method: HttpMethod;
    path: string;
    query?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    body?: unknown;
  }) => {
    const data = await gmailRequest(method, path, { query, body });
    return mcpResponse(data);
  }
};
