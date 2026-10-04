import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Repeat, Sparkles, TrendingUp, Users, PieChart, ListOrdered, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  communityLandscapeService as svc,
  PLATFORM_LABELS,
  type Community,
  type CommunityInsight,
  type DistributionItem,
  type LandscapeContext,
} from "@/lib/services/communityLandscape";
import { MOCK_CATEGORIES } from "@/data/situationRoom.mock";

const fa = (n: number) => n.toLocaleString("fa-IR");
const compact = (n: number) => (n >= 1000 ? `${fa(Math.round(n / 100) / 10)}K` : fa(n));
const catName = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? id;

export function SectionCard({ title, icon, children, actions, className }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-panel shadow-sm", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border bg-panel-header/95 px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        {actions}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

const qk = (name: string, c: LandscapeContext) => ["community-landscape", name, c];

export function CommunityOverview({ ctx }: { ctx: LandscapeContext }) {
  const { data } = useQuery({ queryKey: qk("metrics", ctx), queryFn: () => svc.getCommunityMetrics(ctx) });
  const items = [
    { label: "کل جوامع", en: "Communities", value: data?.total, cls: "text-foreground" },
    { label: "فعال", en: "Active", value: data?.active, cls: "text-primary" },
    { label: "در حال رشد", en: "Growing", value: data?.growing, cls: "text-success" },
    { label: "جدید", en: "New", value: data?.newCount, cls: "text-warning" },
  ];
  return (
    <SectionCard title="نمای کلی جوامع · Community Overview" icon={<Users className="size-4" />}>
      <div className="grid grid-cols-2 gap-2">
        {items.map((i) => (
          <div key={i.en} className="rounded-md border border-border bg-background/40 px-3 py-2.5">
            <div className={cn("num-fa text-2xl font-semibold tabular-nums", i.cls)}>{i.value != null ? fa(i.value) : "—"}</div>
            <div className="text-[11px] text-muted-foreground">{i.label} <span dir="ltr">· {i.en}</span></div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function AttentionRequired({ ctx }: { ctx: LandscapeContext }) {
  const { data = [] } = useQuery({ queryKey: qk("attention", ctx), queryFn: () => svc.getAttention(ctx) });
  const tone = { critical: "border-critical/50 text-critical", warning: "border-warning/50 text-warning", info: "border-primary/50 text-primary" };
  return (
    <SectionCard title="نیازمند توجه · Attention Required" icon={<AlertTriangle className="size-4" />}>
      <ul className="flex flex-col gap-1.5">
        {data.map((a) => (
          <li key={a.id} className={cn("flex items-center gap-3 rounded-md border border-s-4 bg-background/40 px-3 py-2", tone[a.tone])}>
            <span className="num-fa w-6 text-lg font-semibold tabular-nums">{fa(a.count)}</span>
            <span className="text-xs text-foreground">{a.label}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function Bars({ items, colors }: { items: DistributionItem[]; colors?: boolean }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const palette = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((i, idx) => (
        <li key={i.id} className="grid grid-cols-[minmax(0,7rem)_1fr_3rem] items-center gap-2 text-[11px]">
          <span className="truncate">{i.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span className={cn("block h-full rounded-full", colors ? palette[idx % 5] : "bg-primary/80")} style={{ width: `${(i.value / max) * 100}%` }} />
          </span>
          <span className="num-fa text-end tabular-nums text-muted-foreground">٪{fa(Math.round(i.value))}</span>
        </li>
      ))}
    </ul>
  );
}

export function CommunityDistribution({ ctx }: { ctx: LandscapeContext }) {
  const { data } = useQuery({ queryKey: qk("distribution", ctx), queryFn: () => svc.getCommunityDistribution(ctx) });
  return (
    <SectionCard title="توزیع جوامع · Distribution" icon={<PieChart className="size-4" />}>
      {data && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[11px] font-medium text-muted-foreground">
              {data.categoryLevel === "category" ? "بر اساس دسته · By Category" : "بر اساس موضوع · By Subcategory"}
            </h3>
            <Bars items={data.byCategory.slice(0, 6)} />
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-medium text-muted-foreground">بر اساس پلتفرم · By Platform</h3>
            <Bars items={data.byPlatform} colors />
          </div>
        </div>
      )}
    </SectionCard>
  );
}

const INSIGHT_META: Record<CommunityInsight["type"], { label: string; icon: React.ReactNode; cls: string }> = {
  emerging: { label: "Emerging", icon: <Sparkles className="size-3.5" />, cls: "text-warning" },
  increase: { label: "Increasing", icon: <ArrowUpRight className="size-3.5" />, cls: "text-success" },
  decrease: { label: "Decreasing", icon: <ArrowDownRight className="size-3.5" />, cls: "text-critical" },
  new_community: { label: "New", icon: <Users className="size-3.5" />, cls: "text-primary" },
  shift: { label: "Topic shift", icon: <Repeat className="size-3.5" />, cls: "text-chart-5" },
};

export function WhatsChanging({ ctx }: { ctx: LandscapeContext }) {
  const { data = [] } = useQuery({ queryKey: qk("insights", ctx), queryFn: () => svc.getCommunityInsights(ctx) });
  return (
    <SectionCard title="چه چیزی در حال تغییر است؟ · What's Changing" icon={<TrendingUp className="size-4" />}>
      <ul className="divide-y divide-border">
        {data.map((i) => {
          const m = INSIGHT_META[i.type];
          return (
            <li key={i.id} className="flex items-center gap-3 py-2">
              <span className={cn("flex w-24 shrink-0 items-center gap-1 text-[10px]", m.cls)} dir="ltr">{m.icon}{m.label}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{i.topic}</div>
                <div className="truncate text-[10px] text-muted-foreground">{i.detail}</div>
              </div>
              <span className={cn("num-fa w-16 text-end text-xs font-semibold tabular-nums", i.change == null ? "text-warning" : i.change >= 0 ? "text-success" : "text-critical")}>
                {i.change == null ? "جدید" : `${i.change > 0 ? "↑" : "↓"} ٪${fa(Math.abs(i.change))}`}
              </span>
              <span className="num-fa w-20 text-end text-[10px] text-muted-foreground">{fa(i.communities)} جامعه</span>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

const ACT: Record<Community["activity"], { label: string; cls: string }> = {
  high: { label: "زیاد", cls: "border-success/40 bg-success/15 text-success" },
  medium: { label: "متوسط", cls: "border-warning/40 bg-warning/15 text-warning" },
  low: { label: "کم", cls: "border-border bg-muted text-muted-foreground" },
};

/** Future Community Workspace route — kept isolated so wiring it later is a one-line change. */
export const COMMUNITY_WORKSPACE_READY = false;

export function TopCommunities({ ctx }: { ctx: LandscapeContext }) {
  const { data = [] } = useQuery({ queryKey: qk("communities", ctx), queryFn: () => svc.getCommunities(ctx) });
  const [selected, setSelected] = useState<Community | null>(null);
  return (
    <SectionCard title="جوامع برتر · Top Communities" icon={<ListOrdered className="size-4" />}>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-xs">
          <thead className="text-[10px] text-muted-foreground">
            <tr className="border-b border-border">
              {["جامعه · Community", "پلتفرم", "اعضا", "فعالیت", "رشد", "موضوع"].map((h) => (
                <th key={h} className="px-2 py-2 text-start font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr
                key={c.id}
                tabIndex={0}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(c)}
                className="cursor-pointer border-b border-border/60 outline-none hover:bg-accent/50 focus-visible:bg-accent/50"
              >
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2 font-medium">
                    {c.name}
                    {c.isNew && <Badge className="h-4 border-warning/40 bg-warning/15 px-1 text-[9px] text-warning">جدید</Badge>}
                  </div>
                  <div className="text-[10px] text-muted-foreground" dir="ltr">{c.handle}</div>
                </td>
                <td className="px-2 py-2" dir="ltr">{PLATFORM_LABELS[c.platform]}</td>
                <td className="num-fa px-2 py-2 tabular-nums">{compact(c.members)}</td>
                <td className="px-2 py-2"><Badge className={cn("text-[10px]", ACT[c.activity].cls)}>{ACT[c.activity].label}</Badge></td>
                <td className={cn("num-fa px-2 py-2 tabular-nums", c.growth >= 0 ? "text-success" : "text-critical")}>
                  {c.growth >= 0 ? "+" : "−"}٪{fa(Math.abs(c.growth))}
                </td>
                <td className="px-2 py-2 text-muted-foreground">{catName(c.categoryId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <ul className="flex flex-col gap-2 md:hidden">
        {data.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => setSelected(c)} className="w-full rounded-md border border-border bg-background/40 p-3 text-start">
              <div className="flex items-center justify-between text-xs font-medium">
                {c.name}
                <span className={cn("num-fa", c.growth >= 0 ? "text-success" : "text-critical")}>{c.growth >= 0 ? "+" : "−"}٪{fa(Math.abs(c.growth))}</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {PLATFORM_LABELS[c.platform]} · {compact(c.members)} عضو · {catName(c.categoryId)}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="text-start">
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription dir="ltr" className="text-start">{selected.handle} · {PLATFORM_LABELS[selected.platform]}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-3 gap-2 px-4">
                <Stat label="اعضا" value={compact(selected.members)} />
                <Stat label="رشد ۳۰ روزه" value={`${selected.growth >= 0 ? "+" : "−"}٪${fa(Math.abs(selected.growth))}`} />
                <Stat label="فعالیت" value={ACT[selected.activity].label} />
              </div>
              <div className="mt-3 px-4 text-xs text-muted-foreground">
                موضوع: <span className="text-foreground">{catName(selected.categoryId)}</span>
              </div>
              <div className="m-4 flex items-start gap-3 rounded-md border border-dashed border-primary/50 bg-primary/5 p-3">
                <Construction className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="text-xs">
                  <div className="font-medium">میز کار جامعه · Community Workspace</div>
                  <p className="mt-1 text-muted-foreground">
                    تحلیل کامل این جامعه در میز کار اختصاصی جامعه انجام خواهد شد. این بخش در مرحله بعدی توسعه اضافه می‌شود.
                  </p>
                </div>
              </div>
              <div className="px-4">
                <Button className="w-full gap-1.5 text-xs" disabled={!COMMUNITY_WORKSPACE_READY}>
                  <Activity className="size-3.5" /> ورود به میز کار جامعه (به‌زودی)
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </SectionCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-2">
      <div className="num-fa text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
