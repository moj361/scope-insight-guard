/**
 * Runtime configuration.
 *
 * API base URL comes from the VITE_API_BASE_URL environment variable so that
 * no host is hardcoded in application code.
 */
export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

/** Build an absolute URL for a backend path, e.g. apiUrl("/api/v1/auth/login") */
export const apiUrl = (path: string): string =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
