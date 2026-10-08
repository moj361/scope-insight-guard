import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Construction, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  communityProfileService as svc,
  type ProfilePlatform,
  type Segment,
  type Source,
  type SourceFilters,
  type SourceType,
} from "@/lib/services/communityProfile";
import { MOCK_CITIES, MOCK_PROVINCES } from "@/data/situationRoom.mock";
import { provinceOpts, SearchBox } from "./ListTabs";
import { Card, EmptyState, ErrorState, FilterSelect, Growth, LevelBadge, LoadingRows, PLATFORM, Pager, SOURCE_TYPE, SortTh, ago, compact, fa } from "./shared";

const pName = (id: string) => MOCK_PROVINCES.find((p) => p.id === id)?.name ?? "—";
const cName = (id: string) => MOCK_CITIES.find((c) => c.id === id)?.name ?? "—";

export function SourcesTab({ communityId, segments, initialSegment }: { communityId: string; segments: Segment[]; initialSegment?: string }) {
  const init: SourceFilters = { page: 1, pageSize: 20, sort: "members", dir: "desc" };
  const [f, setF] = useState<SourceFilters>({ ...init, segment: initialSegment });
  const [sel, setSel] = useState<Source | null>(null);
  const set = (p: Partial<SourceFilters>) => setF((o) => ({ ...o, page: 1, ...p }));
  const q = useQuery({ queryKey: ["community", communityId, "sources", f], queryFn: () => svc.getCommunitySources(communityId, f), placeholderData: keepPreviousData });
  const topics = useQuery({ queryKey: ["community", communityId, "source-topics"], queryFn: () => svc.getSourceTopics(communityId), staleTime: Infinity });
  const onSort = (k: keyof Source) => setF((o) => ({ ...o, sort: k, dir: o.sort === k && o.dir === "desc" ? "asc" : "desc" }));
  const segName = (id: string) => segments.find((s) => s.id === id)?.name ?? id;
  const filtered = !!(f.search || f.platform || f.type || f.segment || f.province || f.city || f.activity || f.growth || f.topic || f.size);
  const cities = f.province ? MOCK_CITIES.filter((c) => c.provinceId === f.province) : [];
  const th = (label: string, k?: keyof Source) => <SortTh label={label} k={k} sort={f.sort} dir={f.dir ?? "desc"} onSort={onSort} />;

  return (
    <Card title="منابع · Sources" icon={<Radio className="size-4" />}
      actions={<span className="num-fa text-[11px] text-muted-foreground">{q.data ? `${fa(q.data.total)} منبع` : ""}</span>}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox value={f.search ?? ""} onChange={(v) => set({ search: v || undefined })} placeholder="جستجوی نام منبع یا موضوع…" />
        <FilterSelect label="پلتفرم" value={f.platform} onChange={(v) => set({ platform: v as ProfilePlatform })} options={(Object.keys(PLATFORM) as ProfilePlatform[]).map((p) => ({ value: p, label: PLATFORM[p] }))} />
        <FilterSelect label="نوع" value={f.type} onChange={(v) => set({ type: v as SourceType })} options={(Object.keys(SOURCE_TYPE) as SourceType[]).map((t) => ({ value: t, label: SOURCE_TYPE[t] }))} />
        <FilterSelect label="بخش" value={f.segment} onChange={(v) => set({ segment: v })} options={segments.map((s) => ({ value: s.id, label: s.name }))} />
        <FilterSelect label="استان" value={f.province} onChange={(v) => set({ province: v, city: undefined })} options={provinceOpts} />
        {f.province && <FilterSelect label="شهر" value={f.city} onChange={(v) => set({ city: v })} options={cities.map((c) => ({ value: c.id, label: c.name }))} />}
        <FilterSelect label="فعالیت" value={f.activity} onChange={(v) => set({ activity: v as SourceFilters["activity"] })} options={[{ value: "high", label: "زیاد" }, { value: "medium", label: "متوسط" }, { value: "low", label: "کم" }]} />
        <FilterSelect label="رشد" value={f.growth} onChange={(v) => set({ growth: v as SourceFilters["growth"] })} options={[{ value: "growing", label: "در حال رشد" }, { value: "declining", label: "در حال کاهش" }]} />
        <FilterSelect label="موضوع" value={f.topic} onChange={(v) => set({ topic: v })} options={(topics.data ?? []).map((t) => ({ value: t, label: t }))} />
        <FilterSelect label="اندازه" value={f.size} onChange={(v) => set({ size: v as SourceFilters["size"] })} options={[{ value: "small", label: "کوچک (<۱K)" }, { value: "medium", label: "متوسط (۱K–۱۰K)" }, { value: "large", label: "بزرگ (>۱۰K)" }]} />
        {filtered && <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setF(init)}>پاک کردن فیلترها</Button>}
      </div>

      {q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !q.data ? <LoadingRows rows={12} /> : q.data.items.length === 0 ? (
        <EmptyState filtered={filtered} onClear={() => setF(init)} />
      ) : (
        <>
          <div className={cn("overflow-x-auto transition-opacity", q.isFetching && "opacity-60")}>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-panel text-[10px] text-muted-foreground">
                <tr className="border-b border-border">
                  {th("منبع", "name")}{th("پلتفرم", "platform")}{th("نوع", "type")}{th("بخش", "segmentId")}{th("استان")}{th("شهر")}
                  {th("اعضا", "members")}{th("فعالیت", "activity")}{th("رشد", "growth")}{th("موضوع اصلی", "topTopic")}{th("آخرین فعالیت", "lastActiveMin")}
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((s) => (
                  <tr key={s.id} tabIndex={0} onClick={() => setSel(s)} onKeyDown={(e) => e.key === "Enter" && setSel(s)}
                    className="cursor-pointer border-b border-border/60 outline-none hover:bg-accent/50 focus-visible:bg-accent/50">
                    <td className="max-w-[240px] truncate px-2 py-2 font-medium">{s.name}</td>
                    <td className="px-2 py-2" dir="ltr">{PLATFORM[s.platform]}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-[11px] text-muted-foreground">{SOURCE_TYPE[s.type]}</td>
                    <td className="whitespace-nowrap px-2 py-2">{segName(s.segmentId)}</td>
                    <td className="whitespace-nowrap px-2 py-2">{pName(s.provinceId)}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-muted-foreground">{cName(s.cityId)}</td>
                    <td className="num-fa px-2 py-2 tabular-nums">{compact(s.members)}</td>
                    <td className="px-2 py-2"><LevelBadge value={s.activity} /></td>
                    <td className="px-2 py-2"><Growth value={s.growth} /></td>
                    <td className="whitespace-nowrap px-2 py-2 text-[11px]">{s.topTopic}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-[10px] text-muted-foreground">{ago(s.lastActiveMin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={q.data.page} pageSize={q.data.pageSize} total={q.data.total} onPage={(page) => setF((o) => ({ ...o, page }))} />
        </>
      )}

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          {sel && (
            <>
              <SheetHeader className="text-start">
                <SheetTitle>{sel.name}</SheetTitle>
                <SheetDescription className="text-start">{SOURCE_TYPE[sel.type]} · {pName(sel.provinceId)} / {cName(sel.cityId)}</SheetDescription>
              </SheetHeader>
              <div className="mt-2 grid grid-cols-3 gap-2 px-4">
                {[["اعضا", compact(sel.members)], ["بخش", segName(sel.segmentId)], ["آخرین فعالیت", ago(sel.lastActiveMin)]].map(([l, v]) => (
                  <div key={l} className="rounded-md border border-border bg-background/40 p-2"><div className="num-fa text-sm font-semibold">{v}</div><div className="text-[10px] text-muted-foreground">{l}</div></div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 px-4 text-xs">
                <LevelBadge value={sel.activity} /> <Growth value={sel.growth} /> <span className="text-muted-foreground">موضوع اصلی: <span className="text-foreground">{sel.topTopic}</span></span>
              </div>
              <div className="m-4 flex items-start gap-3 rounded-md border border-dashed border-primary/50 bg-primary/5 p-3 text-xs">
                <Construction className="mt-0.5 size-4 shrink-0 text-primary" />
                <div><div className="font-medium">جزئیات منبع · Source Detail</div><p className="mt-1 text-muted-foreground">صفحه کامل جزئیات منبع در مرحله بعدی توسعه اضافه می‌شود.</p></div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
