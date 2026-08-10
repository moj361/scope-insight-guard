import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, AuthError } from "@/lib/services/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ورود تحلیلگر — سکوی حاکمیت رسانه" },
      {
        name: "description",
        content:
          "ورود امن تحلیلگران اطلاعاتی به میز کار بررسی محتوای مشکوک و پردازش تخلفات در سکوی حاکمیت رسانه.",
      },
      { property: "og:title", content: "ورود تحلیلگر — سکوی حاکمیت رسانه" },
      {
        property: "og:description",
        content: "ورود امن تحلیلگران اطلاعاتی به میز کار بررسی محتوای مشکوک و پردازش تخلفات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("نام کاربری و گذرواژه الزامی است.");
      return;
    }

    setLoading(true);
    try {
      // اتصال به بک‌اند در authService.login انجام می‌شود.
      await authService.login({ username: username.trim(), password });
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "ورود ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="text-base font-semibold text-foreground">سکوی حاکمیت رسانه</h1>
          <p className="text-xs text-muted-foreground">
            برای دسترسی به میز کار تحلیلگر وارد شوید
          </p>
        </div>

        <div className="rounded-lg border border-border bg-panel p-5 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs">
                نام کاربری
              </Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                dir="ltr"
                className="h-9 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="analyst.name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                گذرواژه
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-9 pe-9 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "پنهان کردن گذرواژه" : "نمایش گذرواژه"}
                  className="absolute inset-y-0 end-0 flex w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div aria-live="polite" className="min-h-[1.25rem]">
              {error ? (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="mt-px size-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
            </div>

            <Button type="submit" className="h-9 w-full text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ورود…
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  ورود
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          دسترسی محدود و ثبت‌شده — استفاده غیرمجاز پیگرد قانونی دارد.
        </p>
      </div>
    </main>
  );
}
