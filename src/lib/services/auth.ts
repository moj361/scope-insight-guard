/**
 * Authentication service.
 *
 * This module is the single place where the frontend talks to the backend
 * auth API. The real network call is intentionally NOT wired yet — see the
 * marked block inside `login()`.
 *
 * Backend contract (FastAPI):
 *   POST {VITE_API_BASE_URL}/api/v1/auth/login
 *   body: { username: string, password: string }
 *   200 : { access_token: string, token_type: "bearer" }
 *   401 : invalid credentials
 */
import { apiUrl } from "@/lib/config";

export const AUTH_LOGIN_PATH = "/api/v1/auth/login";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
}

export class AuthError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export const authService = {
  /** Endpoint the login form will post to once the backend is connected. */
  loginEndpoint: (): string => apiUrl(AUTH_LOGIN_PATH),

  /**
   * Sign in with username + password.
   *
   * TODO(backend): replace the throw below with the real request:
   *
   *   const res = await fetch(apiUrl(AUTH_LOGIN_PATH), {
   *     method: "POST",
   *     headers: { "Content-Type": "application/json" },
   *     body: JSON.stringify(credentials),
   *   });
   *   if (!res.ok) throw new AuthError("نام کاربری یا گذرواژه نادرست است.", res.status);
   *   return (await res.json()) as LoginResponse;
   */
  login: async (_credentials: LoginCredentials): Promise<LoginResponse> => {
    throw new AuthError("سرویس احراز هویت هنوز به بک‌اند متصل نشده است.");
  },
};
