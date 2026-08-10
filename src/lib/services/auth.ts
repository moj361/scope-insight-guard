/**
 * Authentication service.
 *
 * Single place where the frontend talks to the backend auth API.
 *
 * Backend contract (FastAPI):
 *   POST {VITE_API_BASE_URL}/api/v1/auth/login   -> { access_token, token_type }
 *   GET  {VITE_API_BASE_URL}/api/v1/auth/me      -> current user (Bearer token)
 */
import { apiUrl } from "@/lib/config";

export const AUTH_LOGIN_PATH = "/api/v1/auth/login";
export const AUTH_ME_PATH = "/api/v1/auth/me";
const TOKEN_KEY = "mgp.access_token";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
}

export interface CurrentUser {
  id?: string | number;
  username?: string;
  full_name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export class AuthError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/** توکن فقط در مرورگر نگهداری می‌شود (localStorage). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** هدرهای احراز هویت برای درخواست‌های محافظت‌شده. */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * fetch با هدر Authorization. در صورت ۴۰۱ توکن پاک شده و AuthError پرتاب می‌شود.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  if (res.status === 401) {
    clearToken();
    throw new AuthError("نشست شما منقضی شده است. دوباره وارد شوید.", 401);
  }
  return res;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown; message?: unknown };
    const detail = data?.detail ?? data?.message;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  } catch {
    /* non-json body */
  }
  return fallback;
}

export const authService = {
  loginEndpoint: (): string => apiUrl(AUTH_LOGIN_PATH),

  /** ورود با نام کاربری و گذرواژه؛ توکن ذخیره می‌شود. */
  login: async ({ username, password }: LoginCredentials): Promise<LoginResponse> => {
    let res: Response;
    try {
      res = await fetch(apiUrl(AUTH_LOGIN_PATH), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      throw new AuthError("ارتباط با سرور برقرار نشد.");
    }

    if (!res.ok) {
      const fallback =
        res.status === 401 || res.status === 400
          ? "نام کاربری یا گذرواژه نادرست است."
          : "ورود ناموفق بود. لطفاً دوباره تلاش کنید.";
      throw new AuthError(await readErrorMessage(res, fallback), res.status);
    }

    const data = (await res.json()) as LoginResponse;
    if (!data?.access_token) throw new AuthError("پاسخ نامعتبر از سرور احراز هویت.");
    setToken(data.access_token);
    return data;
  },

  /** کاربر جاری بر اساس توکن ذخیره‌شده. */
  getCurrentUser: async (): Promise<CurrentUser> => {
    if (!getToken()) throw new AuthError("توکنی برای احراز هویت وجود ندارد.", 401);
    let res: Response;
    try {
      res = await authFetch(AUTH_ME_PATH, { method: "GET" });
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("ارتباط با سرور برقرار نشد.");
    }
    if (!res.ok) {
      throw new AuthError(await readErrorMessage(res, "دریافت اطلاعات کاربر ناموفق بود."), res.status);
    }
    return (await res.json()) as CurrentUser;
  },

  /** خروج: حذف توکن. */
  logout: (): void => {
    clearToken();
  },

  isAuthenticated: (): boolean => Boolean(getToken()),
};
