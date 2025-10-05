// Prefer env override if present, fallback to local dev URL
export const API_BASE_URL: string =
  (typeof process !== "undefined" &&
    (process as unknown as { env?: { API_BASE_URL?: string } }).env
      ?.API_BASE_URL) ||
  "http://127.0.0.1:8000";
