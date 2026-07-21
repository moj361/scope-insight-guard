import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  ActionBadge,
  PlatformBadge,
  PriorityBadge,
} from "@/components/workspace/badges";
import type { Violation } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Brain, FileText, Gauge, ShieldCheck, User2 } from "lucide-react";

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="text-[12px] text-foreground">{children}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-28 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full",
            value > 70 ? "bg-critical" : value > 40 ? "bg-warning" : "bg-info",
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-10 text-end font-mono num-fa">{Math.round(value)}</span>
    </div>
  );
}

export function ViolationDrawer({
  violation,
  onOpenChange,
}: {
  violation: Violation | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!violation} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-lg flex-col gap-0 overflow-hidden border-e p-0 sm:max-w-lg"
      >
        {violation && (
          <>
            <SheetHeader className="border-b border-border bg-panel-header px-4 py-3 text-start">
              <div className="flex items-center justify-between gap-2">
                <PriorityBadge value={violation.priority} />
                <span className="font-mono text-[11px] text-muted-foreground">{violation.id}</span>
              </div>
              <SheetTitle className="text-sm">{violation.title}</SheetTitle>
              <SheetDescription className="text-[11px]">
                {violation.description}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <Block icon={<FileText className="size-3.5" />} title="متن کامل محتوا">
                <p className="whitespace-pre-wrap leading-6">{violation.fullContent}</p>
              </Block>

              <Block icon={<User2 className="size-3.5" />} title="پروفایل منتشرکننده">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">نام: </span>
                    <span className="font-medium">{violation.offender.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">هندل: </span>
                    <span className="font-mono">{violation.offender.handle}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">شناسه: </span>
                    <span className="font-mono">{violation.offender.userId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">پلتفرم: </span>
                    <PlatformBadge value={violation.offender.platform} />
                  </div>
                </div>
              </Block>

              <Block icon={<AlertTriangle className="size-3.5" />} title="سوابق تخلفات">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-critical num-fa">
                    {violation.offender.historyCount.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    تخلف در ۹۰ روز گذشته
                  </span>
                </div>
              </Block>

              <Block icon={<ShieldCheck className="size-3.5" />} title="قوانین Match شده">
                <div className="flex flex-wrap gap-1.5">
                  {violation.matchedRules.map((m) => (
                    <span
                      key={m.code}
                      className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                    >
                      <span className="font-mono">{m.code}</span> — {m.title}
                    </span>
                  ))}
                </div>
              </Block>

              <Block icon={<Brain className="size-3.5" />} title="دلیل تشخیص">
                <p>{violation.detectionReason}</p>
              </Block>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Block icon={<Gauge className="size-3.5" />} title="محاسبه Risk">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[11px] text-muted-foreground">امتیاز نهایی</span>
                    <span className="text-lg font-bold num-fa text-critical">
                      {violation.risk.score}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {violation.risk.breakdown.map((b) => (
                      <Bar key={b.label} label={b.label} value={b.value} />
                    ))}
                  </div>
                </Block>
                <Block icon={<Gauge className="size-3.5" />} title="محاسبه Priority">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[11px] text-muted-foreground">اولویت</span>
                    <PriorityBadge value={violation.priority} />
                  </div>
                  <div className="space-y-1.5">
                    {violation.priorityBreakdown.map((b) => (
                      <Bar key={b.label} label={b.label} value={b.value} />
                    ))}
                  </div>
                </Block>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-card p-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    پیشنهاد سیستم
                  </div>
                  <ActionBadge value={violation.suggestedAction} />
                </div>
                <div className="rounded-md border border-border bg-card p-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    تصمیم کارشناس
                  </div>
                  <ActionBadge value={violation.expertAction} />
                </div>
              </div>
              {violation.expertComment && (
                <Block icon={<FileText className="size-3.5" />} title="نظر کارشناس">
                  <p className="whitespace-pre-wrap leading-6">{violation.expertComment}</p>
                </Block>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function useViolationDrawer() {
  const [current, setCurrent] = useState<Violation | null>(null);
  return {
    current,
    open: (v: Violation) => setCurrent(v),
    close: () => setCurrent(null),
    onOpenChange: (o: boolean) => !o && setCurrent(null),
  };
}
