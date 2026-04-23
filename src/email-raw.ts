import { randomUUID } from "node:crypto";

type FileAttachment = {
  filename: string;
  mime_type: string;
  content_base64: string;
  inline_cid?: string;
};

export type ComposedMessageInput = {
  raw?: string;
  from?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: FileAttachment[];
};

type MimeEntity = {
  headers: string[];
  body: string;
};

function ensureBase64Standard(content: string): string {
  const normalized = content.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad === 0) return normalized;
  return `${normalized}${"=".repeat(4 - pad)}`;
}

function toBase64Url(bytes: Buffer): string {
  return bytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function normalizeProvidedRaw(raw: string): string {
  const decoded = Buffer.from(ensureBase64Standard(raw), "base64");
  return toBase64Url(decoded);
}

function normalizeBody(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\r\n");
}

function wrapBase64(content: string): string {
  return content.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

function formatAddressList(value?: string[]): string | undefined {
  if (!value || value.length === 0) return undefined;
  const trimmed = value.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
  if (trimmed.length === 0) return undefined;
  return trimmed.join(", ");
}

function createTextEntity(
  contentType: "text/plain" | "text/html",
  content: string
): MimeEntity {
  return {
    headers: [
      `Content-Type: ${contentType}; charset=UTF-8`,
      "Content-Transfer-Encoding: 8bit"
    ],
    body: normalizeBody(content)
  };
}

function renderMimeEntity(entity: MimeEntity): string {
  return [...entity.headers, "", entity.body].join("\r\n");
}

function buildAlternativeEntity(text?: string, html?: string): MimeEntity | undefined {
  if (!text && !html) return undefined;

  if (text && html) {
    const boundary = `alt_${randomUUID()}`;
    const parts: string[] = [];
    parts.push(`--${boundary}`);
    parts.push(renderMimeEntity(createTextEntity("text/plain", text)));
    parts.push(`--${boundary}`);
    parts.push(renderMimeEntity(createTextEntity("text/html", html)));
    parts.push(`--${boundary}--`);

    return {
      headers: [`Content-Type: multipart/alternative; boundary="${boundary}"`],
      body: parts.join("\r\n")
    };
  }

  if (html) return createTextEntity("text/html", html);
  return createTextEntity("text/plain", text as string);
}

function buildAttachmentEntity(attachment: FileAttachment): MimeEntity {
  const encoded = wrapBase64(ensureBase64Standard(attachment.content_base64));
  const disposition = attachment.inline_cid ? "inline" : "attachment";
  const headers = [
    `Content-Type: ${attachment.mime_type}; name="${attachment.filename}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: ${disposition}; filename="${attachment.filename}"`
  ];

  if (attachment.inline_cid) {
    headers.push(`Content-ID: <${attachment.inline_cid}>`);
  }

  return {
    headers,
    body: encoded
  };
}

function buildMessageEntity(input: ComposedMessageInput): MimeEntity {
  const alternativeEntity = buildAlternativeEntity(input.text, input.html);
  const attachments = input.attachments ?? [];

  if (!alternativeEntity && attachments.length === 0) {
    throw new Error("Message must include text, html, attachments, or raw.");
  }

  if (attachments.length === 0) {
    return alternativeEntity as MimeEntity;
  }

  const boundary = `mix_${randomUUID()}`;
  const parts: string[] = [];

  if (alternativeEntity) {
    parts.push(`--${boundary}`);
    parts.push(renderMimeEntity(alternativeEntity));
  }

  for (const attachment of attachments) {
    parts.push(`--${boundary}`);
    parts.push(renderMimeEntity(buildAttachmentEntity(attachment)));
  }

  parts.push(`--${boundary}--`);

  return {
    headers: [`Content-Type: multipart/mixed; boundary="${boundary}"`],
    body: parts.join("\r\n")
  };
}

function encodeHeaderValue(value: string): string {
  // ASCII-safe headers can stay as-is.
  if (/^[\x20-\x7E]*$/.test(value)) {
    return value;
  }
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

export function buildRawEmail(input: ComposedMessageInput): string {
  if (input.raw) {
    return normalizeProvidedRaw(input.raw);
  }

  const to = formatAddressList(input.to);
  const cc = formatAddressList(input.cc);
  const bcc = formatAddressList(input.bcc);
  if (!to && !cc && !bcc) {
    throw new Error("At least one recipient is required in to, cc, or bcc.");
  }

  const messageEntity = buildMessageEntity(input);
  const headers = [
    input.from ? `From: ${input.from}` : undefined,
    to ? `To: ${to}` : undefined,
    cc ? `Cc: ${cc}` : undefined,
    bcc ? `Bcc: ${bcc}` : undefined,
    input.subject !== undefined
      ? `Subject: ${encodeHeaderValue(input.subject)}`
      : "Subject:",
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    ...messageEntity.headers
  ].filter((header): header is string => Boolean(header));

  const message = [...headers, "", messageEntity.body].join("\r\n");
  return toBase64Url(Buffer.from(message, "utf8"));
}
