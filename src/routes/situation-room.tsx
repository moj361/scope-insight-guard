import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Globe2,
  Layers,
  MapPin,
  Radar,
  Search,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";
// MVP demo bypass (temporary): Situation Room renders without the login guard.
import { WorldMap } from "@/components/situation-room/WorldMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  emptyContext,
  situationRoomService as svc,
  type CaseConnection,
  type Category,
  type SituationContext,
  type Subcategory,
} from "@/lib/services/situationRoom";

const L = {
  title: "سپهر فضای مجازی",
  subtitle: "Macro-level situational awareness by geography and topic",
  where: "موقعیت · Location",
  what: "نظام موضوعی · Categories",
  countrySearch: "جستجوی کشور…",
  topicSearch: "جستجوی دسته یا موضوع…",
  national: "ملی",
  province: "استان",
  city: "شهر",
  allProvinces: "بدون انتخاب (ملی)",
  allCities: "بدون انتخاب",
  noCase: "هنوز پرونده‌ای متصل نیست",
  activeCase: "پرونده فعال",
  openCase: "باز کردن پرونده",
  noCountryCases: "هنوز پرونده متصلی برای این کشور موجود نیست.",
  connectedCases: "پرونده‌های متصل",
  pickCountry: "یک کشور را روی نقشه یا از طریق جستجو انتخاب کنید.",
  scope: "دامنه",
  category: "دسته",
  topic: "موضوع",
  back: "میز کار",
  noResults: "نتیجه‌ای یافت نشد",
};

export const Route = createFileRoute("/situation-room")({
  head: () => ({
    meta: [
      { title: "سپهر فضای مجازی" },
      { name: "description", content: "Macro-level situational awareness by geography and topic." },
      { property: "og:title", content: "سپهر فضای مجازی" },
      { property: "og:description", content: "Macro-level situational awareness by geography and topic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SituationRoomPage,
});

function SituationRoomPage() {
  const [ctx, setCtx] = useState<SituationContext>({ ...emptyContext, countryId: "IRN" });
  const [countryQuery, setCountryQuery] = useState("");

  const { data: countries = [] } = useQuery({
    queryKey: ["situation-room", "countries"],
    queryFn: () => svc.getCountries(),
    staleTime: Infinity,
  });
  const country = countries.find((c) => c.id === ctx.countryId) ?? null;

  const selectCountry = (id: string) => {
    setCtx({ ...emptyContext, countryId: id });
    setCountryQuery("");
  };

  const countryMatches = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return [];
    return countries
      .filter((c) => c.name.toLowerCase().includes(q) || c.nameFa?.includes(q))
      .slice(0, 8);
  }, [countryQuery, countries]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-panel-header/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Radar className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-tight">
                {L.title}
              </div>
              <div className="text-[10px] text-muted-foreground" dir="ltr">{L.subtitle}</div>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Link to="/">
              <ArrowRight className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
              {L.back}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          {/* WHERE */}
          <Panel title={L.where} icon={<Globe2 className="size-4" />}>
            <div className="relative mb-3 max-w-sm">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && countryMatches[0] && selectCountry(countryMatches[0].id)}
                placeholder={L.countrySearch}
                className="h-8 ps-8 text-xs"
                aria-label={L.countrySearch}
              />
              {countryMatches.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-border bg-popover text-xs shadow-lg">
                  {countryMatches.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectCountry(c.id)}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-start hover:bg-accent"
                      >
                        <span>{c.nameFa ?? c.name}</span>
                        <span className="text-[10px] text-muted-foreground" dir="ltr">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <WorldMap selectedId={ctx.countryId} highlightIds={["IRN"]} onSelect={selectCountry} />
          </Panel>

          {country?.hasTaxonomy ? (
            <>
              <LocationScope ctx={ctx} setCtx={setCtx} countryName={country.nameFa ?? country.name} />
              <WhatSection ctx={ctx} setCtx={setCtx} />
            </>
          ) : country ? (
            <CountryCases countryId={country.id} countryName={country.name} />
          ) : (
            <Panel title={L.what} icon={<Layers className="size-4" />}>
              <p className="text-xs text-muted-foreground">{L.pickCountry}</p>
            </Panel>
          )}
        </div>

        <aside className="lg:sticky lg:top-16 lg:self-start">
          <ContextPanel ctx={ctx} countryName={country ? (country.nameFa ?? country.name) : null} />
        </aside>
      </main>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  actions,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-panel shadow-sm">
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

function LocationScope({
  ctx,
  setCtx,
  countryName,
}: {
  ctx: SituationContext;
  setCtx: (c: SituationContext) => void;
  countryName: string;
}) {
  const { data: provinces = [] } = useQuery({
    queryKey: ["situation-room", "provinces", ctx.countryId],
    queryFn: () => svc.getProvinces(ctx.countryId!),
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["situation-room", "cities", ctx.provinceId],
    queryFn: () => svc.getCities(ctx.provinceId!),
    enabled: !!ctx.provinceId,
  });
  const NONE = "__none";

  return (
    <Panel
      title={L.scope}
      icon={<MapPin className="size-4" />}
      actions={<Breadcrumb ctx={ctx} countryName={countryName} provinces={provinces} cities={cities} />}
    >
      <div className="flex flex-wrap items-end gap-3">
        <Button
          size="sm"
          variant={ctx.provinceId ? "outline" : "default"}
          className="h-8 text-xs"
          onClick={() => setCtx({ ...ctx, provinceId: null, cityId: null })}
        >
          {countryName} · {L.national}
        </Button>
        <div className="flex min-w-[180px] flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">{L.province} (اختیاری)</span>
          <Select
            value={ctx.provinceId ?? NONE}
            onValueChange={(v) => setCtx({ ...ctx, provinceId: v === NONE ? null : v, cityId: null })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{L.allProvinces}</SelectItem>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {ctx.provinceId && (
          <div className="flex min-w-[160px] flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">{L.city} (اختیاری)</span>
            <Select
              value={ctx.cityId ?? NONE}
              onValueChange={(v) => setCtx({ ...ctx, cityId: v === NONE ? null : v })}
            >
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{L.allCities}</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Breadcrumb({
  ctx,
  countryName,
  provinces,
  cities,
}: {
  ctx: SituationContext;
  countryName: string;
  provinces: { id: string; name: string }[];
  cities: { id: string; name: string }[];
}) {
  const parts = [countryName];
  if (!ctx.provinceId) parts.push(L.national);
  else {
    parts.push(provinces.find((p) => p.id === ctx.provinceId)?.name ?? "");
    if (ctx.cityId) parts.push(cities.find((c) => c.id === ctx.cityId)?.name ?? "");
  }
  return (
    <span className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
      {parts.join(" / ")}
    </span>
  );
}

function WhatSection({ ctx, setCtx }: { ctx: SituationContext; setCtx: (c: SituationContext) => void }) {
  const [q, setQ] = useState("");
  const { data: categories = [] } = useQuery({
    queryKey: ["situation-room", "categories", ctx.countryId, ctx.provinceId, ctx.cityId],
    queryFn: () => svc.getCategories(ctx),
  });

  const results = useMemo(() => {
    const s = q.trim();
    if (!s) return null;
    const out: { cat: Category; sub?: Subcategory }[] = [];
    for (const cat of categories) {
      if (cat.name.includes(s)) out.push({ cat });
      for (const sub of cat.subcategories) if (sub.name.includes(s)) out.push({ cat, sub });
    }
    return out;
  }, [q, categories]);

  const toggleCategory = (id: string) =>
    setCtx({ ...ctx, categoryId: ctx.categoryId === id ? null : id, subcategoryId: null });

  return (
    <Panel
      title={L.what}
      icon={<Layers className="size-4" />}
      actions={
        <div className="relative w-56 max-w-[50vw]">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L.topicSearch} className="h-7 ps-8 text-xs" />
        </div>
      }
    >
      {results && (
        <div className="mb-3 rounded-md border border-border bg-muted/30 p-2">
          {results.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">{L.noResults}</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {results.map(({ cat, sub }) => (
                <li key={sub?.id ?? cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCtx({ ...ctx, categoryId: cat.id, subcategoryId: sub?.id ?? null });
                      setQ("");
                    }}
                    className="rounded border border-border bg-panel px-2 py-1 text-[11px] hover:border-primary/60"
                  >
                    {cat.name}
                    {sub && <span className="text-muted-foreground"> ← </span>}
                    {sub?.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const open = ctx.categoryId === cat.id;
          return (
            <div
              key={cat.id}
              className={cn(
                "rounded-md border bg-background/40 transition-colors",
                open ? "border-primary/60 sm:col-span-2 xl:col-span-3" : "border-border hover:border-primary/40",
              )}
            >
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start"
              >
                <span className="text-[13px] font-medium">{cat.name}</span>
                <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="num-fa">{cat.subcategories.length.toLocaleString("fa-IR")}</span> موضوع
                  <ChevronDown className={cn("size-3.5 transition-transform", open ? "" : "-rotate-90 rtl:rotate-90")} />
                </span>
              </button>
              {open && (
                <div className="grid grid-cols-1 gap-1.5 border-t border-border p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cat.subcategories.map((sub) => (
                    <SubcategoryCard
                      key={sub.id}
                      sub={sub}
                      ctx={ctx}
                      selected={ctx.subcategoryId === sub.id}
                      onSelect={() => setCtx({ ...ctx, subcategoryId: sub.id })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function useCaseFor(subId: string | null, ctx: SituationContext) {
  return useQuery({
    queryKey: ["situation-room", "case", subId, ctx.countryId],
    queryFn: () => svc.getCaseForSubcategory(subId!, ctx),
    enabled: !!subId,
  });
}

function SubcategoryCard({
  sub,
  ctx,
  selected,
  onSelect,
}: {
  sub: Subcategory;
  ctx: SituationContext;
  selected: boolean;
  onSelect: () => void;
}) {
  const { data: kase } = useCaseFor(sub.id, ctx);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "flex cursor-pointer flex-col gap-1.5 rounded border px-2.5 py-2 transition-colors",
        selected ? "border-primary bg-primary/10" : "border-border bg-panel hover:border-primary/40",
        kase && "border-success/50",
      )}
    >
      <span className="text-xs font-medium">{sub.name}</span>
      {kase ? <CaseActions kase={kase} /> : <span className="text-[10px] text-muted-foreground">{L.noCase}</span>}
    </div>
  );
}

function CaseActions({ kase }: { kase: CaseConnection }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Badge className="gap-1 border-success/40 bg-success/15 text-[10px] text-success">
        <ShieldCheck className="size-3" /> {L.activeCase}
      </Badge>
      <Button asChild size="sm" className="h-6 gap-1 px-2 text-[10px]" onClick={(e) => e.stopPropagation()}>
        <Link to={kase.route}>
          <FolderOpen className="size-3" /> {L.openCase}
        </Link>
      </Button>
    </div>
  );
}

function CountryCases({ countryId, countryName }: { countryId: string; countryName: string }) {
  const { data: cases = [] } = useQuery({
    queryKey: ["situation-room", "country-cases", countryId],
    queryFn: () => svc.getCasesForCountry(countryId),
  });
  return (
    <Panel title={`${L.connectedCases} · ${countryName}`} icon={<FolderOpen className="size-4" />}>
      {cases.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">{L.noCountryCases}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {cases.map((c) => (
            <div key={c.caseId} className="flex flex-col gap-2 rounded border border-success/50 bg-panel p-3">
              <span className="text-sm font-medium">{c.title}</span>
              <CaseActions kase={c} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function ContextPanel({ ctx, countryName }: { ctx: SituationContext; countryName: string | null }) {
  const { data: provinces = [] } = useQuery({
    queryKey: ["situation-room", "provinces", ctx.countryId],
    queryFn: () => svc.getProvinces(ctx.countryId!),
    enabled: !!ctx.countryId,
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["situation-room", "cities", ctx.provinceId],
    queryFn: () => svc.getCities(ctx.provinceId!),
    enabled: !!ctx.provinceId,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["situation-room", "categories", ctx.countryId, ctx.provinceId, ctx.cityId],
    queryFn: () => svc.getCategories(ctx),
    enabled: !!ctx.countryId,
  });
  const { data: kase } = useCaseFor(ctx.subcategoryId, ctx);

  const hasTax = provinces.length > 0 || categories.length > 0;
  const cat = categories.find((c) => c.id === ctx.categoryId);
  const sub = cat?.subcategories.find((s) => s.id === ctx.subcategoryId);
  const scope = !hasTax
    ? null
    : ctx.provinceId
      ? [provinces.find((p) => p.id === ctx.provinceId)?.name, cities.find((c) => c.id === ctx.cityId)?.name]
          .filter(Boolean)
          .join(" / ")
      : L.national;

  const rows: [string, React.ReactNode][] = [[L.country, countryName ?? "—"]];
  if (scope) rows.push([L.scope, scope]);
  if (hasTax) {
    rows.push([L.category, cat?.name ?? "—"]);
    rows.push([L.topic, sub?.name ?? "—"]);
  }
  if (kase) rows.push([L.status, <span className="text-success">{L.activeCase}</span>]);

  return (
    <Panel title={L.context} icon={<Radar className="size-4" />}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {kase && (
        <div className="mt-3 border-t border-border pt-3">
          <CaseActions kase={kase} />
        </div>
      )}
      {sub && !kase && <p className="mt-3 text-[10px] text-muted-foreground">{L.noCase}</p>}
    </Panel>
  );
}
