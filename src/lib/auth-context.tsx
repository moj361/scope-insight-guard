/**
 * وضعیت احراز هویت سراسری برنامه.
 *
 * در شروع برنامه، اگر توکنی موجود باشد /api/v1/auth/me فراخوانی می‌شود؛
 * در صورت نامعتبر بودن توکن پاک شده و کاربر خارج‌شده در نظر گرفته می‌شود.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type CurrentUser } from "@/lib/services/auth";

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  /** true تا زمانی که بررسی اولیه توکن تمام شود */
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      setUser(await authService.getCurrentUser());
    } catch {
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    await authService.login({ username, password });
    setUser(await authService.getCurrentUser());
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, logout, refresh }),
    [user, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
