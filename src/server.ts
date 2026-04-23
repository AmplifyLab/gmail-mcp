import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRegisterTool } from "./tools/register-tool.js";
import { gmailCreateDraftTool } from "./tools/create-draft.js";
import { gmailCreateLabelTool } from "./tools/create-label.js";
import { gmailDeleteDraftTool } from "./tools/delete-draft.js";
import { gmailDeleteLabelTool } from "./tools/delete-label.js";
import { gmailGetLabelTool } from "./tools/get-label.js";
import { gmailGetMessageTool } from "./tools/get-message.js";
import { gmailGetProfileTool } from "./tools/get-profile.js";
import { gmailGetThreadTool } from "./tools/get-thread.js";
import { gmailListDraftsTool } from "./tools/list-drafts.js";
import { gmailListLabelsTool } from "./tools/list-labels.js";
import { gmailListMessagesTool } from "./tools/list-messages.js";
import { gmailListThreadsTool } from "./tools/list-threads.js";
import { gmailModifyMessageTool } from "./tools/modify-message.js";
import { gmailRawRequestTool } from "./tools/raw-request.js";
import { gmailSendDraftTool } from "./tools/send-draft.js";
import { gmailSendMessageTool } from "./tools/send-message.js";
import { gmailTrashMessageTool } from "./tools/trash-message.js";
import { gmailUntrashMessageTool } from "./tools/untrash-message.js";
import { gmailUpdateLabelTool } from "./tools/update-label.js";

const server = new McpServer({
  name: "gmail-mcp-server",
  version: "0.1.0"
});

const registerTool = createRegisterTool(server);

const tools = [
  gmailRawRequestTool,
  gmailGetProfileTool,
  gmailListLabelsTool,
  gmailGetLabelTool,
  gmailCreateLabelTool,
  gmailUpdateLabelTool,
  gmailDeleteLabelTool,
  gmailListMessagesTool,
  gmailGetMessageTool,
  gmailSendMessageTool,
  gmailModifyMessageTool,
  gmailTrashMessageTool,
  gmailUntrashMessageTool,
  gmailListThreadsTool,
  gmailGetThreadTool,
  gmailListDraftsTool,
  gmailCreateDraftTool,
  gmailSendDraftTool,
  gmailDeleteDraftTool
];

for (const tool of tools) {
  registerTool(tool.name, tool.description, tool.inputSchema, tool.cb);
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

await main();
