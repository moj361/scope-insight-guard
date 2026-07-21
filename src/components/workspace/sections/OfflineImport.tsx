import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";

export function OfflineImport() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-border bg-card/50 p-4">
      <div>
        <div className="text-[13px] font-semibold text-foreground">بارگذاری داده‌های آفلاین</div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          امکان بارگذاری فایل‌های استخراج شده از منابع آفلاین و بدون اتصال به شبکه — این قابلیت در
          نسخه‌های بعدی فعال خواهد شد.
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button
              disabled
              className="pointer-events-none gap-2 opacity-60"
              variant="secondary"
            >
              <Upload className="size-4" />
              بارگذاری فایل — به زودی
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>در نسخه‌های بعدی فعال خواهد شد.</TooltipContent>
      </Tooltip>
    </div>
  );
}
