# Gmail MCP Server

MCP server that exposes Gmail REST API (`https://gmail.googleapis.com/gmail/v1`) as MCP tools.

## What You Need

- Docker
- Google OAuth credentials for Gmail API
  - Required: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`

### How to get Gmail OAuth credentials

1. In Google Cloud Console, create/select a project and enable the **Gmail API**.
2. Configure OAuth consent screen (External/Internal) and add yourself as a test user if needed.
3. Create OAuth client credentials (**Desktop app** is simplest for local use).
   - Important: for any web-based OAuth flow (including OAuth Playground), use a **Web application** client and configure matching redirect URIs.
   - `redirect_uri` must match **exactly** what you send in the auth request (scheme, host, path, trailing slash), or Google returns `Error 400: redirect_uri_mismatch`.
4. Get an access token using OAuth flow (quick option: [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)):
   - Click the gear icon and enable **Use your own OAuth credentials**.
   - Paste your OAuth client ID/secret.
   - Select Gmail scopes (for example `https://www.googleapis.com/auth/gmail.modify`).
   - Authorize, then exchange code for tokens.
5. Copy:
   - `refresh_token` -> `GMAIL_REFRESH_TOKEN`
   - OAuth client values -> `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET`

Example:

```bash
export GMAIL_CLIENT_ID="..."
export GMAIL_CLIENT_SECRET="..."
export GMAIL_REFRESH_TOKEN="..."
```

### Troubleshooting OAuth

- `Error 400: redirect_uri_mismatch` means the `redirect_uri` in your request is not in the OAuth client's allowed redirect URI list.
- For OAuth Playground specifically, add this exact URI to your **Web application** client:
  - `https://developers.google.com/oauthplayground`
- `Error 403: access_denied` with message like "app is being tested" means your OAuth app is in **Testing** mode and the Google account is not in **Test users**.
  - Fix: Google Cloud Console -> APIs & Services -> OAuth consent screen -> **Test users** -> add the account that is authorizing.
  - If you need broad public access, move app to **Production** and complete Google verification for requested Gmail scopes.

## Docker Usage (Build Locally)

1. Build image:
```bash
docker build -t gmail-mcp:latest .
```

2. Run the MCP server (for Claude/Desktop clients):

```bash
docker run --rm -i \
  -e GMAIL_CLIENT_ID="your_client_id" \
  -e GMAIL_CLIENT_SECRET="your_client_secret" \
  -e GMAIL_REFRESH_TOKEN="your_refresh_token" \
  gmail-mcp:latest
```

## Claude Desktop Config (Local Image)

```json
{
  "mcpServers": {
    "gmail": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "GMAIL_CLIENT_ID=your_client_id_here",
        "-e",
        "GMAIL_CLIENT_SECRET=your_client_secret_here",
        "-e",
        "GMAIL_REFRESH_TOKEN=your_refresh_token_here",
        "gmail-mcp:latest"
      ]
    }
  }
}
```

## Claude Desktop Config (Prebuilt GHCR Image)

```json
{
  "mcpServers": {
    "gmail": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "GMAIL_CLIENT_ID=your_client_id_here",
        "-e",
        "GMAIL_CLIENT_SECRET=your_client_secret_here",
        "-e",
        "GMAIL_REFRESH_TOKEN=your_refresh_token_here",
        "ghcr.io/amplifylab/gmail-mcp:latest"
      ]
    }
  }
}
```

## Available Tool Groups

- Mailbox profile
- Labels (list/get/create/update/delete)
- Messages (list/get/send/modify/trash/untrash)
- Threads (list/get)
- Drafts (list/create/send/delete)
- Raw Gmail request for unsupported endpoints

## Tools

- `gmail_raw_request`
- `gmail_get_profile`
- `gmail_list_labels`
- `gmail_get_label`
- `gmail_create_label`
- `gmail_update_label`
- `gmail_delete_label`
- `gmail_list_messages`
- `gmail_get_message`
- `gmail_send_message`
- `gmail_modify_message`
- `gmail_trash_message`
- `gmail_untrash_message`
- `gmail_list_threads`
- `gmail_get_thread`
- `gmail_list_drafts`
- `gmail_create_draft`
- `gmail_send_draft`
- `gmail_delete_draft`

## Sending Emails

You do not need to build Gmail `raw` payloads manually.

Just ask Claude normally, for example:

- "Send an email to `recipient@example.com` with subject `Test` and body `Hello`."
- "Draft an email to `team@example.com` with subject `Weekly update`."
- "Send this email and attach `document.pdf`."
- "Send HTML email and include `image.png` inline."

The server converts this into the correct Gmail MIME format automatically.

Developer note: `gmail_send_message` and `gmail_create_draft` accept structured fields (`to`, `subject`, `text/html`, `attachments`) and support `raw` only for advanced/manual use.

## API Reference

- Gmail API docs: https://developers.google.com/workspace/gmail/api/reference/rest
