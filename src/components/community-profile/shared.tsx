import { AlertCircle, ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown, Inbox, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Level, PersonRole, ProfilePlatform, SourceType } from "@/lib/services/communityProfile";

export const fa = (n: number) => n.toLocaleString("fa-IR");
export const compact = (n: number) =>
  n >= 1_000_000 ? `${fa(Math.round(n / 100_000) / 10)}M` : n >= 1000 ? `${fa(Math.round(n / 100) / 10)}K` : fa(n);
export const signed = (n: number) => `${n >= 0 ? "+" : "−"}٪${fa(Math.abs(n))}`;
export const ago = (min: number) =>
  min < 60 ? `${fa(min)} دقیقه پیش` : min < 1440 ? `${fa(Math.round(min / 60))} ساعت پیش` : `${fa(Math.round(min / 1440))} روز پیش`;

export const PLATFORM: Record<ProfilePlatform, string> = { telegram: "Telegram", instagram: "Instagram", x: "X", other: "Other" };
export const SOURCE_TYPE: Record<SourceType, string> = {
  telegram_group: "گروه تلگرام", telegram_channel: "کانال تلگرام", instagram_account: "حساب اینستاگرام", x_account: "حساب X", other: "سایر",
};
export const ROLE: Record<PersonRole, string> = {
  community_admin: "مدیر جامعه · Admin", moderator: "ناظر · Moderator", content_creator: "تولیدکننده محتوا",
  topic_contributor: "مشارکت‌کننده موضوعی", highly_active: "بسیار فعال", connector: "پیونددهنده بین‌جامعه‌ای", high_reach: "حساب پربرد",
};

const LV: Record<Level, { label: string; cls: string }> = {
  high: { label: "زیاد", cls: "border-success/40 bg-success/15 text-success" },
  medium: { label: "متوسط", cls: "border-warning/40 bg-warning/15 text-warning" },
  low: { label: "کم", cls: "border-border bg-muted text-muted-foreground" },
};
export function LevelBadge({ value }: { value: Level }) {
  return <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium", LV[value].cls)}>{LV[value].label}</span>;
}
export function Growth({ value, className }: { value: number; className?: string }) {
  return <span className={cn("num-fa tabular-nums", value >= 0 ? "text-success" : "text-critical", className)}>{signed(value)}</span>;
}

export function Card({ title, icon, actions, children, className, bodyClassName }: {
  title: string; icon?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-panel shadow-sm", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-panel-header/95 px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h2>
        {actions}
      </header>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function LoadingRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)}
    </div>
  );
}
export function EmptyState({ filtered, onClear }: { filtered?: boolean; onClear?: () => void }) {
  const Icon = filtered ? SearchX : Inbox;
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-xs text-muted-foreground">
      <Icon className="size-6" />
      {filtered ? "نتیجه‌ای برای فیلترهای انتخاب‌شده یافت نشد." : "داده‌ای برای نمایش وجود ندارد."}
      {filtered && onClear && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onClear}>پاک کردن فیلترها</Button>}
    </div>
  );
}
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-xs text-critical">
      <AlertCircle className="size-6" />
      دریافت داده با خطا مواجه شد.
      {onRetry && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onRetry}>تلاش مجدد</Button>}
    </div>
  );
}

export function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  return (
    <div className="flex items-center justify-between gap-2 pt-3 text-[11px] text-muted-foreground">
      <span className="num-fa">{fa(from)}–{fa(Math.min(total, page * pageSize))} از {fa(total)}</span>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="outline" className="size-7" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronRight className="size-3.5" />
        </Button>
        <span className="num-fa px-2">صفحه {fa(page)} از {fa(pages)}</span>
        <Button size="icon" variant="outline" className="size-7" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export const ALL = "__all";
export function FilterSelect({ label, value, onChange, options, className }: {
  label: string; value: string | undefined; onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)}>
      <SelectTrigger className={cn("h-8 w-auto min-w-[120px] gap-1 text-xs", value && "border-primary/60", className)} aria-label={label}>
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>همه</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function SortTh<K extends string>({ label, k, sort, dir, onSort, className }: {
  label: string; k?: K; sort?: K; dir: "asc" | "desc"; onSort: (k: K) => void; className?: string;
}) {
  if (!k) return <th className={cn("px-2 py-2 text-start font-medium", className)}>{label}</th>;
  const active = sort === k;
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-2 py-2 text-start font-medium", className)} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground")}>
        {label}<Icon className="size-3" />
      </button>
    </th>
  );
}
