import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowDownRight, ArrowUpRight, Boxes, Globe2, Layers, Map as MapIcon, Network, Sparkles, Target, TrendingUp, Users, Waypoints, Radio, Plus } from "lucide-react";
import { IranMap } from "@/components/situation-room/IranMap";
import { cn } from "@/lib/utils";
import type { communityProfileService, DynamicsMetric, InsightKind } from "@/lib/services/communityProfile";
import { Card, Growth, LevelBadge, PLATFORM, ROLE, compact, fa } from "./shared";

type Profile = Awaited<ReturnType<typeof communityProfileService.getCommunityProfile>>;

const INSIGHT: Record<InsightKind, { icon: React.ReactNode; label: string; cls: string }> = {
  increase: { icon: <ArrowUpRight className="size-3.5" />, label: "افزایش", cls: "text-success border-success/40 bg-success/10" },
  decrease: { icon: <ArrowDownRight className="size-3.5" />, label: "کاهش", cls: "text-critical border-critical/40 bg-critical/10" },
  new: { icon: <Plus className="size-3.5" />, label: "جدید", cls: "text-primary border-primary/40 bg-primary/10" },
  emerging: { icon: <Sparkles className="size-3.5" />, label: "نوظهور", cls: "text-warning border-warning/40 bg-warning/10" },
};
const METRICS: { id: DynamicsMetric; label: string }[] = [
  { id: "activity", label: "فعالیت" }, { id: "content", label: "حجم محتوا" }, { id: "sources", label: "منابع فعال" },
  { id: "members", label: "اعضای فعال" }, { id: "engagement", label: "تعامل" },
];
const SEG_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-muted-foreground/60"];

export function OverviewTab({ data, onOpenSegment, onGoTab }: { data: Profile; onOpenSegment: (id: string) => void; onGoTab: (t: string) => void }) {
  const m = data.metrics;
  const kpis = [
    { label: "منابع مرتبط", en: "Related Sources", value: fa(m.relatedSources), icon: <Radio className="size-4" /> },
    { label: "اعضای تخمینی", en: "Estimated Members", value: compact(m.estimatedMembers), icon: <Users className="size-4" /> },
    { label: "جوامع فعال", en: "Active Communities", value: fa(m.activeCommunities), icon: <Boxes className="size-4" /> },
    { label: "پلتفرم‌ها", en: "Platforms", value: fa(m.platforms), icon: <Layers className="size-4" /> },
    { label: "پوشش جغرافیایی", en: "Coverage", value: `${fa(m.provincesCovered)} استان`, icon: <Globe2 className="size-4" /> },
    { label: "رشد فعالیت", en: "Activity Growth", value: `+٪${fa(m.activityGrowth)}`, icon: <TrendingUp className="size-4" />, tone: "text-success" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.en} className="rounded-lg border border-border bg-panel px-3 py-2.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px]">{k.label}</span>
              <span className="text-primary/80">{k.icon}</span>
            </div>
            <div className={cn("num-fa mt-1 text-xl font-semibold tabular-nums", k.tone)}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground" dir="ltr">{k.en} · demo</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <Card title="چه چیزی تغییر کرد · What Changed" icon={<Activity className="size-4" />} className="xl:col-span-7">
          <ul className="flex flex-col gap-1.5">
            {data.insights.map((i) => {
              const k = INSIGHT[i.kind];
              return (
                <li key={i.id} className="flex items-center gap-3 rounded-md border border-border bg-background/40 px-3 py-2">
                  <span className={cn("inline-flex w-[72px] shrink-0 items-center justify-center gap-1 rounded border px-1.5 py-0.5 text-[10px]", k.cls)}>{k.icon}{k.label}</span>
                  <span className="flex-1 text-xs">{i.text}</span>
                  {i.value && <span className="num-fa text-xs font-semibold tabular-nums">{i.value}</span>}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="ترکیب جامعه · Composition" icon={<Target className="size-4" />} className="xl:col-span-5">
          <div className="mb-3 flex h-3 overflow-hidden rounded-full" role="img" aria-label="Community composition">
            {data.segments.map((s, i) => <span key={s.id} className={SEG_COLORS[i % 6]} style={{ width: `${s.share}%` }} />)}
          </div>
          <ul className="flex flex-col gap-1">
            {data.segments.map((s, i) => (
              <li key={s.id}>
                <button type="button" onClick={() => onOpenSegment(s.id)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-xs hover:bg-accent/60">
                  <span className={cn("size-2.5 rounded-sm", SEG_COLORS[i % 6])} />
                  <span className="flex-1">{s.name} <span className="text-[10px] text-muted-foreground" dir="ltr">· {s.nameEn}</span></span>
                  <span className="num-fa w-10 text-end tabular-nums">٪{fa(s.share)}</span>
                  <ChevronHint />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <Dynamics data={data} className="xl:col-span-8" />
        <Card title="تمرکز فعالیت · Concentration" icon={<Waypoints className="size-4" />} className="xl:col-span-4">
          <p className="text-sm leading-7">
            <span className="num-fa text-2xl font-semibold text-primary">٪{fa(data.concentration.activityShare)}</span> از کل فعالیت از{" "}
            <span className="num-fa font-semibold">٪{fa(data.concentration.sourceShare)}</span> منابع می‌آید.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">زیرمجموعه کوچکی از منابع، سهم بزرگی از فعالیت جامعه را تولید می‌کند.</p>
          <div className="mt-3 h-28" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.concentration.curve} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="sources" tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `${v}%`} />
                <YAxis tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `${v}%`} />
                <Area dataKey="activity" type="monotone" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[9px] text-muted-foreground" dir="ltr">% of sources → cumulative % of activity</div>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <Card title="توزیع جغرافیایی · Geographic Distribution" icon={<MapIcon className="size-4" />} className="xl:col-span-8">
          <Geography data={data} />
        </Card>
        <Card title="حضور در پلتفرم‌ها · Platforms" icon={<Layers className="size-4" />} className="xl:col-span-4">
          <ul className="flex flex-col gap-3">
            {data.platforms.map((p, i) => (
              <li key={p.platform} className="text-xs">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span dir="ltr" className="font-medium">{PLATFORM[p.platform]}</span>
                  <span className="flex items-center gap-2"><LevelBadge value={p.activity} /><Growth value={p.growth} className="text-[11px]" /><span className="num-fa w-9 text-end font-semibold">٪{fa(p.share)}</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", SEG_COLORS[i])} style={{ width: `${p.share}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="خوشه‌های جامعه · Community Clusters" icon={<Boxes className="size-4" />}
        actions={<button type="button" className="text-[11px] text-primary hover:underline" onClick={() => onGoTab("communities")}>مشاهده همه</button>}>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.segments.map((s) => (
            <button key={s.id} type="button" onClick={() => onOpenSegment(s.id)} className="rounded-md border border-border bg-background/40 p-3 text-start transition-colors hover:border-primary/50">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{s.name}</span>
                <LevelBadge value={s.activity} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <span>اعضا<br /><b className="num-fa text-foreground">{compact(s.members)}</b></span>
                <span>منابع<br /><b className="num-fa text-foreground">{fa(s.sources)}</b></span>
                <span>رشد<br /><Growth value={s.growth} className="font-semibold" /></span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-12">
        <Card title="افراد کلیدی · Key People" icon={<Users className="size-4" />} className="xl:col-span-7" bodyClassName="p-0"
          actions={<button type="button" className="text-[11px] text-primary hover:underline" onClick={() => onGoTab("people")}>همه افراد</button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] text-muted-foreground">
                <tr className="border-b border-border">
                  {["فرد", "نقش", "جوامع", "محتوا", "تعامل", "برد", "موضوعات", "پلتفرم"].map((h) => <th key={h} className="px-3 py-2 text-start font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.keyPeople.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-3 py-2"><div className="font-medium">{p.name}</div><div className="text-[10px] text-muted-foreground" dir="ltr">{p.handle}</div></td>
                    <td className="px-3 py-2 text-[11px]">{ROLE[p.role]}</td>
                    <td className="num-fa px-3 py-2">{fa(p.relatedCommunities)}</td>
                    <td className="num-fa px-3 py-2">{compact(p.content)}</td>
                    <td className="num-fa px-3 py-2">٪{fa(p.engagement)}</td>
                    <td className="num-fa px-3 py-2">{compact(p.reach)}</td>
                    <td className="num-fa px-3 py-2">{fa(p.topicBreadth)}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground" dir="ltr">{p.platforms.map((x) => PLATFORM[x]).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="جوامع مرتبط · Related Communities" icon={<Network className="size-4" />} className="xl:col-span-5">
          <ul className="divide-y divide-border">
            {data.relatedCommunities.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{r.name} <span className="text-[10px] font-normal text-muted-foreground">· {r.relationship}</span></div>
                  <div className="truncate text-[10px] text-muted-foreground">موضوعات مشترک: {r.sharedTopics.join("، ")}</div>
                </div>
                <LevelBadge value={r.activity} />
                <Growth value={r.growth} className="w-12 text-end" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ChevronHint() {
  return <span className="text-muted-foreground">‹</span>;
}

function Dynamics({ data, className }: { data: Profile; className?: string }) {
  const [metric, setMetric] = useState<DynamicsMetric>("activity");
  const pts = data.dynamics[metric];
  const change = useMemo(() => {
    const a = pts.slice(0, 7).reduce((s, p) => s + p.value, 0);
    const b = pts.slice(-7).reduce((s, p) => s + p.value, 0);
    return Math.round(((b - a) / a) * 1000) / 10;
  }, [pts]);
  return (
    <Card title="پویایی جامعه · Dynamics (۳۰ روز)" icon={<TrendingUp className="size-4" />} className={className}
      actions={
        <div className="flex flex-wrap gap-1" role="group" aria-label="Metric">
          {METRICS.map((x) => (
            <button key={x.id} type="button" aria-pressed={metric === x.id} onClick={() => setMetric(x.id)}
              className={cn("rounded border px-2 py-0.5 text-[11px]", metric === x.id ? "border-primary bg-primary/15" : "border-border text-muted-foreground hover:border-primary/40")}>
              {x.label}
            </button>
          ))}
        </div>
      }>
      <div className="mb-2 text-[11px] text-muted-foreground">تغییر هفته آخر نسبت به هفته اول: <Growth value={change} className="font-semibold" /></div>
      <div className="h-56" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pts} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dyn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `${v}d`} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => compact(v as number)} width={44} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", fontSize: 11 }} labelFormatter={(l) => `${l} روز پیش`} formatter={(v) => [fa(v as number), METRICS.find((x) => x.id === metric)!.label]} />
            <Area dataKey="value" type="monotone" stroke="var(--color-primary)" strokeWidth={2} fill="url(#dyn)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Geography({ data }: { data: Profile }) {
  const [sel, setSel] = useState<string | null>(null);
  const values = useMemo(() => Object.fromEntries(data.geography.map((g) => [g.provinceId, g.intensity])), [data.geography]);
  const names = useMemo(() => Object.fromEntries(data.geography.map((g) => [g.provinceId, `${g.name} · ${fa(g.sources)} منبع`])), [data.geography]);
  const top = data.geography.slice(0, 8);
  const selected = data.geography.find((g) => g.provinceId === sel);
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
      <IranMap provinceId={null} cityId={null} provinceNames={names} cities={[]} values={values}
        onSelectProvince={(id) => setSel(sel === id ? null : id)} onSelectCity={() => {}} />
      <div className="flex flex-col gap-2">
        {selected && (
          <div className="rounded-md border border-primary/50 bg-primary/5 p-2 text-xs">
            <div className="font-medium">{selected.name}</div>
            <div className="num-fa mt-1 text-muted-foreground">{fa(selected.sources)} منبع · شدت ٪{fa(Math.round(selected.intensity * 100))} · <Growth value={selected.growth} /></div>
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">استان‌های پرفعالیت</div>
        <ul className="flex flex-col gap-1">
          {top.map((g) => (
            <li key={g.provinceId}>
              <button type="button" onClick={() => setSel(g.provinceId)} className={cn("grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 rounded px-2 py-1 text-[11px] hover:bg-accent/60", sel === g.provinceId && "bg-accent/60")}>
                <span className="truncate text-start">{g.name}</span>
                <span className="num-fa tabular-nums text-muted-foreground">{fa(g.sources)}</span>
                <Growth value={g.growth} className="w-12 text-end" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center gap-2 text-[10px] text-muted-foreground">
          کم
          <span className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(to left, var(--color-primary), var(--color-muted))" }} />
          زیاد
        </div>
      </div>
    </div>
  );
}
