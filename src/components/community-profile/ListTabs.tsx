import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Boxes, Flame, Newspaper, Search, Share2, Sparkles, Star, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  communityProfileService as svc,
  type ContentView,
  type PeopleFilters,
  type Person,
  type PersonRole,
  type ProfilePlatform,
  type Segment,
} from "@/lib/services/communityProfile";
import { MOCK_PROVINCES } from "@/data/situationRoom.mock";
import {
  Card, EmptyState, ErrorState, FilterSelect, Growth, LevelBadge, LoadingRows, PLATFORM, Pager, ROLE, SOURCE_TYPE, SortTh, ago, compact, fa,
} from "./shared";

const platformOpts = (Object.keys(PLATFORM) as ProfilePlatform[]).map((p) => ({ value: p, label: PLATFORM[p] }));
const levelOpts = [{ value: "high", label: "زیاد" }, { value: "medium", label: "متوسط" }, { value: "low", label: "کم" }];
export const provinceOpts = MOCK_PROVINCES.map((p) => ({ value: p.id, label: p.name }));

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-60">
      <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 ps-8 text-xs" aria-label={placeholder} />
    </div>
  );
}

/* ---------------- Communities (segments) ---------------- */
export function SegmentsTab({ segments, selectedId, onSelect }: { segments: Segment[]; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const sel = segments.find((s) => s.id === selectedId);
  return (
    <div className="grid gap-3 xl:grid-cols-12">
      <Card title="بخش‌ها و خوشه‌های جامعه · Segments" icon={<Boxes className="size-4" />} className="xl:col-span-8" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-muted-foreground">
              <tr className="border-b border-border">
                {["بخش", "توضیح", "منابع", "اعضای تخمینی", "فعالیت", "رشد", "موضوعات اصلی"].map((h) => <th key={h} className="px-3 py-2 text-start font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.id} tabIndex={0} onClick={() => onSelect(s.id)} onKeyDown={(e) => e.key === "Enter" && onSelect(s.id)}
                  className={cn("cursor-pointer border-b border-border/60 outline-none hover:bg-accent/50 focus-visible:bg-accent/50", selectedId === s.id && "bg-primary/10")}>
                  <td className="px-3 py-2.5"><div className="font-medium">{s.name}</div><div className="text-[10px] text-muted-foreground" dir="ltr">{s.nameEn}</div></td>
                  <td className="max-w-[260px] px-3 py-2.5 text-[11px] text-muted-foreground">{s.description}</td>
                  <td className="num-fa px-3 py-2.5">{fa(s.sources)}</td>
                  <td className="num-fa px-3 py-2.5">{compact(s.members)}</td>
                  <td className="px-3 py-2.5"><LevelBadge value={s.activity} /></td>
                  <td className="px-3 py-2.5"><Growth value={s.growth} /></td>
                  <td className="px-3 py-2.5 text-[11px]">{s.topTopics.join("، ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title={sel ? `جزئیات بخش · ${sel.name}` : "جزئیات بخش"} icon={<Boxes className="size-4" />} className="xl:col-span-4"
        actions={sel && <Button size="icon" variant="ghost" className="size-6" onClick={() => onSelect(null)} aria-label="Close"><X className="size-3.5" /></Button>}>
        {!sel ? (
          <p className="py-8 text-center text-xs text-muted-foreground">یک بخش را برای مشاهده جزئیات انتخاب کنید.</p>
        ) : (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-muted-foreground">{sel.description}</p>
            <div className="grid grid-cols-2 gap-2">
              {[["سهم از جامعه", `٪${fa(sel.share)}`], ["منابع", fa(sel.sources)], ["اعضای تخمینی", compact(sel.members)]].map(([l, v]) => (
                <div key={l} className="rounded-md border border-border bg-background/40 p-2"><div className="num-fa text-base font-semibold">{v}</div><div className="text-[10px] text-muted-foreground">{l}</div></div>
              ))}
              <div className="rounded-md border border-border bg-background/40 p-2"><Growth value={sel.growth} className="text-base font-semibold" /><div className="text-[10px] text-muted-foreground">رشد</div></div>
            </div>
            <div>
              <div className="mb-1 text-[10px] text-muted-foreground">موضوعات اصلی</div>
              <div className="flex flex-wrap gap-1">{sel.topTopics.map((t) => <span key={t} className="rounded border border-border bg-muted/50 px-2 py-0.5">{t}</span>)}</div>
            </div>
            <p className="rounded-md border border-dashed border-border p-2 text-[11px] text-muted-foreground">برای مشاهده منابع این بخش، از تب «منابع» و فیلتر «بخش» استفاده کنید.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- People ---------------- */
const roleOpts = (Object.keys(ROLE) as PersonRole[]).map((r) => ({ value: r, label: ROLE[r] }));
const topicOpts = ["حقوق و مزایا", "رتبه‌بندی", "امتحانات", "تغییرات آموزشی", "استخدام", "امور مدارس", "بیمه تکمیلی", "کنکور"].map((t) => ({ value: t, label: t }));
const reachOpts = [{ value: "lt10k", label: "کمتر از ۱۰K" }, { value: "10k-100k", label: "۱۰K تا ۱۰۰K" }, { value: "gt100k", label: "بیش از ۱۰۰K" }];

export function PeopleTab({ communityId }: { communityId: string }) {
  const init: PeopleFilters = { page: 1, pageSize: 15, sort: "reach", dir: "desc" };
  const [f, setF] = useState<PeopleFilters>(init);
  const set = (p: Partial<PeopleFilters>) => setF((o) => ({ ...o, page: 1, ...p }));
  const q = useQuery({ queryKey: ["community", communityId, "people", f], queryFn: () => svc.getCommunityPeople(communityId, f), placeholderData: keepPreviousData });
  const onSort = (k: keyof Person) => setF((o) => ({ ...o, sort: k, dir: o.sort === k && o.dir === "desc" ? "asc" : "desc" }));
  const filtered = !!(f.search || f.platform || f.role || f.province || f.topic || f.activity || f.reach);
  return (
    <Card title="افراد · People" icon={<Star className="size-4" />}
      actions={<span className="num-fa text-[11px] text-muted-foreground">{q.data ? `${fa(q.data.total)} فرد` : ""}</span>}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox value={f.search ?? ""} onChange={(v) => set({ search: v || undefined })} placeholder="جستجوی نام یا شناسه…" />
        <FilterSelect label="پلتفرم" value={f.platform} onChange={(v) => set({ platform: v as ProfilePlatform })} options={platformOpts} />
        <FilterSelect label="نقش" value={f.role} onChange={(v) => set({ role: v as PersonRole })} options={roleOpts} />
        <FilterSelect label="استان" value={f.province} onChange={(v) => set({ province: v })} options={provinceOpts} />
        <FilterSelect label="موضوع" value={f.topic} onChange={(v) => set({ topic: v })} options={topicOpts} />
        <FilterSelect label="فعالیت" value={f.activity} onChange={(v) => set({ activity: v as PeopleFilters["activity"] })} options={levelOpts} />
        <FilterSelect label="برد" value={f.reach} onChange={(v) => set({ reach: v as PeopleFilters["reach"] })} options={reachOpts} />
        {filtered && <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setF(init)}>پاک کردن</Button>}
      </div>
      <p className="mb-2 text-[10px] text-muted-foreground">رتبه‌بندی بر اساس شاخص‌های قابل مشاهده (برد، جوامع مرتبط، حجم محتوا، تعامل، گستره موضوعی) است — داده نمایشی.</p>
      {q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !q.data ? <LoadingRows rows={10} /> : q.data.items.length === 0 ? (
        <EmptyState filtered={filtered} onClear={() => setF(init)} />
      ) : (
        <>
          <div className={cn("overflow-x-auto transition-opacity", q.isFetching && "opacity-60")}>
            <table className="w-full text-xs">
              <thead className="text-[10px] text-muted-foreground">
                <tr className="border-b border-border">
                  <SortTh label="فرد" k="name" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="نقش" k="role" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="پلتفرم‌ها" sort={f.sort} dir="desc" onSort={onSort} />
                  <SortTh label="جوامع مرتبط" k="relatedCommunities" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="محتوا" k="content" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="تعامل" k="engagement" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="برد" k="reach" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="گستره موضوعی" k="topicBreadth" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                  <SortTh label="فعالیت" k="activity" sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-accent/40">
                    <td className="px-2 py-2"><div className="font-medium">{p.name}</div><div className="text-[10px] text-muted-foreground" dir="ltr">{p.handle}</div></td>
                    <td className="px-2 py-2 text-[11px]">{ROLE[p.role]}</td>
                    <td className="px-2 py-2 text-[10px] text-muted-foreground" dir="ltr">{p.platforms.map((x) => PLATFORM[x]).join(" · ")}</td>
                    <td className="num-fa px-2 py-2">{fa(p.relatedCommunities)}</td>
                    <td className="num-fa px-2 py-2">{compact(p.content)}</td>
                    <td className="num-fa px-2 py-2">٪{fa(p.engagement)}</td>
                    <td className="num-fa px-2 py-2">{compact(p.reach)}</td>
                    <td className="num-fa px-2 py-2">{fa(p.topicBreadth)}</td>
                    <td className="px-2 py-2"><LevelBadge value={p.activity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={q.data.page} pageSize={q.data.pageSize} total={q.data.total} onPage={(page) => setF((o) => ({ ...o, page }))} />
        </>
      )}
    </Card>
  );
}

/* ---------------- Topics ---------------- */
const SPREAD = { isolated: { label: "محدود", cls: "text-muted-foreground border-border" }, spreading: { label: "در حال گسترش", cls: "text-warning border-warning/40" }, widespread: { label: "فراگیر", cls: "text-critical border-critical/40" } };

export function TopicsTab({ communityId }: { communityId: string }) {
  const q = useQuery({ queryKey: ["community", communityId, "topics"], queryFn: () => svc.getCommunityTopics(communityId) });
  const [open, setOpen] = useState<Record<string, boolean>>({ "t-salary": true });
  const [spreadId, setSpreadId] = useState<string | null>(null);
  if (q.isError) return <Card title="موضوعات"><ErrorState onRetry={() => q.refetch()} /></Card>;
  if (!q.data) return <Card title="موضوعات"><LoadingRows /></Card>;
  const { topics, emerging } = q.data;
  const roots = topics.filter((t) => !t.parentId);
  const spread = emerging.find((e) => e.id === spreadId) ?? emerging[0];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-12">
        <Card title="موضوعات نوظهور · Emerging Topics" icon={<Sparkles className="size-4" />} className="xl:col-span-7">
          <ul className="flex flex-col gap-1.5">
            {emerging.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => setSpreadId(e.id)} className={cn("grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-md border bg-background/40 px-3 py-2 text-start text-xs", spread.id === e.id ? "border-primary/60" : "border-border hover:border-primary/40")}>
                  <span><span className="font-medium">{e.name}</span><span className="block text-[10px] text-muted-foreground" dir="ltr">{e.platforms.map((p) => PLATFORM[p]).join(" · ")}</span></span>
                  <span className="num-fa text-[10px] text-muted-foreground">{fa(e.communities)} جامعه · {fa(e.sources)} منبع</span>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", SPREAD[e.spread].cls)}>{SPREAD[e.spread].label}</span>
                  <Growth value={e.growth} className="w-14 text-end font-semibold" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="گسترش موضوع · Topic Spread" icon={<Share2 className="size-4" />} className="xl:col-span-5">
          <div className="text-sm font-semibold">{spread.name}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[["جامعه", spread.communities], ["استان", spread.provinces], ["پلتفرم", spread.platforms.length], ["منبع", spread.sources]].map(([l, v]) => (
              <div key={l as string} className="rounded-md border border-border bg-background/40 p-2"><div className="num-fa text-xl font-semibold">{fa(v as number)}</div><div className="text-[10px] text-muted-foreground">{l}</div></div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
            <span>رشد در {spread.window}</span><Growth value={spread.growth} className="font-semibold" />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {spread.spread === "widespread" ? "این موضوع در بخش بزرگی از اکوسیستم جامعه پخش شده است." : spread.spread === "spreading" ? "این موضوع در حال گسترش از چند خوشه به خوشه‌های دیگر است." : "این موضوع فعلاً به چند خوشه محدود مانده است."}
          </p>
        </Card>
      </div>
      <Card title="ساختار موضوعی · Topic Structure" icon={<Boxes className="size-4" />} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-muted-foreground">
              <tr className="border-b border-border">{["موضوع", "سهم", "رشد", "منابع", "جوامع"].map((h) => <th key={h} className="px-3 py-2 text-start font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {roots.flatMap((r) => {
                const kids = topics.filter((t) => t.parentId === r.id);
                const isOpen = !!open[r.id];
                const row = (t: typeof r, child: boolean) => (
                  <tr key={t.id} className={cn("border-b border-border/60", child && "bg-background/30")}>
                    <td className={cn("px-3 py-2", child ? "ps-8 text-muted-foreground" : "font-medium")}>
                      {!child && kids.length > 0 ? (
                        <button type="button" onClick={() => setOpen((o) => ({ ...o, [r.id]: !isOpen }))} aria-expanded={isOpen} className="inline-flex items-center gap-1.5">
                          <span className="text-muted-foreground">{isOpen ? "▾" : "◂"}</span>{t.name}
                        </button>
                      ) : t.name}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2"><span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-primary/80" style={{ width: `${t.share * 4}%` }} /></span><span className="num-fa">٪{fa(t.share)}</span></div>
                    </td>
                    <td className="px-3 py-2"><Growth value={t.growth} /></td>
                    <td className="num-fa px-3 py-2">{fa(t.sources)}</td>
                    <td className="num-fa px-3 py-2">{fa(t.communities)}</td>
                  </tr>
                );
                return [row(r, false), ...(isOpen ? kids.map((k) => row(k, true)) : [])];
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Content ---------------- */
const VIEWS: { id: ContentView; label: string; icon: React.ReactNode }[] = [
  { id: "trending", label: "پرتکرار · Trending", icon: <Flame className="size-3.5" /> },
  { id: "important", label: "مهم · Important", icon: <Star className="size-3.5" /> },
  { id: "latest", label: "تازه‌ترین · Latest", icon: <Clock className="size-3.5" /> },
];
export function ContentTab({ communityId }: { communityId: string }) {
  const [view, setView] = useState<ContentView>("trending");
  const [platform, setPlatform] = useState<ProfilePlatform | undefined>();
  const [page, setPage] = useState(1);
  const f = { view, platform, page, pageSize: 8 };
  const q = useQuery({ queryKey: ["community", communityId, "content", f], queryFn: () => svc.getCommunityContent(communityId, f), placeholderData: keepPreviousData });
  return (
    <Card title="محتوا · Content" icon={<Newspaper className="size-4" />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1" role="tablist">
            {VIEWS.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button" onClick={() => { setView(v.id); setPage(1); }}
                className={cn("inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px]", view === v.id ? "border-primary bg-primary/15" : "border-border text-muted-foreground hover:border-primary/40")}>
                {v.icon}{v.label}
              </button>
            ))}
          </div>
          <FilterSelect label="پلتفرم" value={platform} onChange={(v) => { setPlatform(v as ProfilePlatform); setPage(1); }} options={platformOpts} />
        </div>
      }>
      {q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !q.data ? <LoadingRows /> : q.data.items.length === 0 ? <EmptyState filtered onClear={() => setPlatform(undefined)} /> : (
        <>
          <ul className={cn("flex flex-col gap-2 transition-opacity", q.isFetching && "opacity-60")}>
            {q.data.items.map((c) => {
              const hi = view === "important" && c.importance >= 70;
              return (
                <li key={c.id} className={cn("rounded-md border bg-background/40 p-3", hi ? "border-s-4 border-critical/60 border-s-critical" : "border-border")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium">{c.title}</div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{c.summary}</p>
                    </div>
                    {view === "important" && (
                      <span className={cn("num-fa rounded border px-1.5 py-0.5 text-[10px]", hi ? "border-critical/40 text-critical" : "border-border text-muted-foreground")}>اهمیت {fa(c.importance)}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                    <span className="text-foreground">{c.sourceName}</span>
                    <span>{SOURCE_TYPE[c.sourceType]}</span>
                    <span>{ago(c.minutesAgo)}</span>
                    <span className="rounded border border-border bg-muted/50 px-1.5">موضوع: {c.topic}</span>
                    <LevelBadge value={c.activity} />
                    <span className="num-fa">تعامل {compact(c.engagement)}</span>
                    <span className="num-fa">مشاهده‌شده در {fa(c.communitiesObserved)} جامعه</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pager page={q.data.page} pageSize={q.data.pageSize} total={q.data.total} onPage={setPage} />
        </>
      )}
    </Card>
  );
}
