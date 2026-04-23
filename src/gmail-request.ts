const GMAIL_API_BASE_URL = "https://gmail.googleapis.com/gmail/v1";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID?.trim();
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET?.trim();
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN?.trim();

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
  throw new Error(
    "Missing Gmail auth configuration. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN."
  );
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | ReadonlyArray<string | number | boolean>;

type RequestOptions = {
  query?: Record<string, QueryValue | undefined>;
  body?: unknown;
};

let cachedAccessToken: string | undefined;
let cachedAccessTokenExpiresAt = 0;
let refreshInFlight: Promise<string> | null = null;

function buildUrl(path: string, query?: Record<string, QueryValue | undefined>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${GMAIL_API_BASE_URL}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function buildBody(options?: RequestOptions): string | undefined {
  if (!options || !("body" in options) || options.body === undefined) {
    return undefined;
  }
  return JSON.stringify(options.body);
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (
    !forceRefresh &&
    cachedAccessToken &&
    Date.now() < cachedAccessTokenExpiresAt - 60_000
  ) {
    return cachedAccessToken;
  }

  if (!forceRefresh && refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = refreshAccessToken();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function refreshAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: GMAIL_CLIENT_ID as string,
    client_secret: GMAIL_CLIENT_SECRET as string,
    refresh_token: GMAIL_REFRESH_TOKEN as string,
    grant_type: "refresh_token"
  }).toString();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(
      `OAuth token refresh failed.\n${JSON.stringify(
        {
          url: GOOGLE_TOKEN_URL,
          status: response.status,
          statusText: response.statusText,
          responseBody: raw
        },
        null,
        2
      )}`
    );
  }

  const parsed = JSON.parse(raw) as { access_token?: string; expires_in?: number };
  if (!parsed.access_token) {
    throw new Error(
      `OAuth token refresh response did not include access_token.\n${raw}`
    );
  }

  const expiresInSeconds =
    typeof parsed.expires_in === "number" && parsed.expires_in > 0
      ? parsed.expires_in
      : 3600;
  cachedAccessToken = parsed.access_token;
  cachedAccessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  return cachedAccessToken;
}

async function buildHeaders(body: string | undefined): Promise<Record<string, string>> {
  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function parseSuccessPayload(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return null;
  }

  const raw = await response.text();
  if (!raw) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.parse(raw);
  }

  return raw;
}

async function getFailureDetails(
  method: HttpMethod,
  url: string,
  response: Response
): Promise<string> {
  const responseBody = await response.text();
  const details = {
    method,
    url,
    status: response.status,
    statusText: response.statusText,
    responseHeaders: Object.fromEntries(response.headers.entries()),
    responseBody
  };
  return JSON.stringify(details, null, 2);
}

export async function gmailRequest(
  method: HttpMethod,
  path: string,
  options?: RequestOptions
): Promise<unknown> {
  const url = buildUrl(path, options?.query);
  const body = buildBody(options);
  let response = await fetch(url, {
    method,
    headers: await buildHeaders(body),
    body
  });

  if (response.status === 401) {
    response = await fetch(url, {
      method,
      headers: await (async () => {
        const accessToken = await getAccessToken(true);
        const headers: Record<string, string> = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        };
        if (body !== undefined) {
          headers["Content-Type"] = "application/json";
        }
        return headers;
      })(),
      body
    });
  }

  if (response.ok) {
    return parseSuccessPayload(response);
  }

  throw new Error(`Gmail API request failed.\n${await getFailureDetails(method, url, response)}`);
}
