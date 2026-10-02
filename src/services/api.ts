// =============================================================================
// API client — every request to the backend goes through here.
//
// • Sends the session cookie (credentials: "include").
// • Adds the CSRF token header on POST/PUT/DELETE.
// • Turns error responses into an `ApiError` with field-level messages.
//
// The React app NEVER talks to MySQL directly and holds no secrets.
// =============================================================================
import type { ApiEnvelope, Paginated, QueryParams } from "@/types";

/** In development this is "/api" (Vite proxies it). In production set VITE_API_BASE_URL. */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "/api";

let csrfToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called by AuthContext after login / session check. Kept in memory only. */
export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

/** AuthContext registers this to react when the session expires. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** e.g. { firstName: "First name is required." } */
  readonly fieldErrors: Record<string, string>;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> = {}, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}

/** Full URL of an API path, e.g. for an <img src>: apiUrl("/announcements/3/image"). */
export function apiUrl(path: string) {
  return `${BASE_URL}${path}`;
}

function buildUrl(path: string, query?: QueryParams) {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function request<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, options: { body?: unknown; query?: QueryParams; file?: Blob } = {}) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.file) headers["Content-Type"] = options.file.type;
  else if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      credentials: "include",
      body: options.file ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Please check your connection and try again.");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const error = new ApiError(
      response.status,
      payload?.error_code ?? "UNKNOWN_ERROR",
      payload?.message ?? "Something went wrong. Please try again.",
      payload?.errors ?? {},
      payload?.details,
    );
    // An expired session on a normal request -> let AuthContext send the user to login.
    if (response.status === 401 && !path.startsWith("/auth/")) onUnauthorized?.();
    throw error;
  }

  return payload as ApiEnvelope<T>;
}

export const api = {
  /** GET that returns just `data`. */
  get: async <T>(path: string, query?: QueryParams) => (await request<T>("GET", path, { query })).data,

  /** GET for paginated lists: returns { items, meta } plus the full envelope for extras. */
  list: async <T>(path: string, query?: QueryParams): Promise<Paginated<T> & { envelope: ApiEnvelope<T[]> }> => {
    const envelope = await request<T[]>("GET", path, { query });
    return {
      items: envelope.data,
      meta: envelope.meta ?? { page: 1, pageSize: envelope.data.length, total: envelope.data.length, totalPages: 1 },
      envelope,
    };
  },

  /** POST/PUT/DELETE return the full envelope so pages can show `message`. */
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body: body ?? {} }),
  delete: <T>(path: string) => request<T>("DELETE", path),
  /** Sends a file (e.g. a photo) as the raw request body. */
  upload: <T>(path: string, file: Blob) => request<T>("PUT", path, { file }),
};

/** Human-friendly message for any error thrown by the API client. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
