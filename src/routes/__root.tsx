import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">صفحه پیدا نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            بازگشت به میز کار
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          بارگذاری صفحه با خطا مواجه شد
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          تلاش مجدد کنید یا به میز کار بازگردید.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            تلاش مجدد
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            میز کار
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "میز کار تحلیلگر — سکوی حاکمیت رسانه" },
      {
        name: "description",
        content:
          "میز کار عملیاتی تحلیلگران اطلاعاتی برای بررسی محتوای مشکوک، ارزیابی تخلفات و پردازش صف اقدامات در سکوی حاکمیت رسانه مبتنی بر هوش مصنوعی.",
      },
      { name: "author", content: "Media Governance Platform" },
      { property: "og:title", content: "میز کار تحلیلگر — سکوی حاکمیت رسانه" },
      {
        property: "og:description",
        content:
          "میز کار عملیاتی تحلیلگران اطلاعاتی برای بررسی محتوای مشکوک، ارزیابی تخلفات و پردازش صف اقدامات در سکوی حاکمیت رسانه مبتنی بر هوش مصنوعی.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "میز کار تحلیلگر — سکوی حاکمیت رسانه" },
      { name: "twitter:description", content: "میز کار عملیاتی تحلیلگران اطلاعاتی برای بررسی محتوای مشکوک، ارزیابی تخلفات و پردازش صف اقدامات در سکوی حاکمیت رسانه مبتنی بر هوش مصنوعی." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cff0deca-08c7-4adf-bc23-bb5dade2bf10/id-preview-21b83497--8a85fdf0-3139-459b-a050-772106336284.lovable.app-1784625635522.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cff0deca-08c7-4adf-bc23-bb5dade2bf10/id-preview-21b83497--8a85fdf0-3139-459b-a050-772106336284.lovable.app-1784625635522.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <Outlet />
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
