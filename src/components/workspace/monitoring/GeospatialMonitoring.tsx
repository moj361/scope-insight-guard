import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { geospatialMonitoringService, eventSummary, filterEvents, timelineBuckets, resolutionFor, rangeHours, monitoringDefaults, HOUR, type MonitoringEvent, type MonitoringRange } from "@/lib/services/geospatialMonitoring";
import { MonitoringMap } from "./MonitoringMap";
import { cn } from "@/lib/utils";

const rangeOptions = [{ id: "1h", name: "۱ ساعت اخیر" }, { id: "6h", name: "۶ ساعت اخیر" }, { id: "24h", name: "۲۴ ساعت اخیر" }, { id: "3d", name: "۳ روز اخیر" }, { id: "7d", name: "۷ روز اخیر" }, { id: "custom", name: "بازه دلخواه" }];
const severityNames: Record<string, string> = { high: "زیاد", medium: "متوسط", low: "کم" };
const dateText = (time: number | string) => new Date(time).toLocaleString("fa-IR", { timeZone: "Asia/Tehran", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { id: string; name: string }[]; onChange: (v: string) => void }) {
  return <div className="min-w-0 space-y-1"><span className="text-[10px] text-muted-foreground">{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{options.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select></div>;
}
export function GeospatialMonitoring() {
  const data = useQuery({ queryKey: ["geospatial-monitoring-events"], queryFn: geospatialMonitoringService.getEvents });
  const events = data.data?.events ?? [];
  const [filters, setFilters] = useState(monitoringDefaults);
  const [range, setRange] = useState<MonitoringRange>("24h");
  const [customStart, setCustomStart] = useState("2026-11-17T11:50");
  const [customEnd, setCustomEnd] = useState("2026-11-18T11:50");
  const [cursor, setCursor] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [selected, setSelected] = useState<MonitoringEvent | null>(null);
  const end = range === "custom" ? Date.parse(customEnd + ":00+03:30") : Date.parse(data.data?.asOf ?? "");
  const start = range === "custom" ? Date.parse(customStart + ":00+03:30") : end - rangeHours[range] * HOUR;
  const valid = Number.isFinite(start) && Number.isFinite(end) && end > start && end - start <= 31 * 24 * HOUR;
  const resolution = resolutionFor(end - start);
  const filtered = useMemo(() => valid ? filterEvents(events, filters, start, end) : [], [events, filters, start, end, valid]);
  const buckets = useMemo(() => valid ? timelineBuckets(start, end, resolution, filtered) : [], [start, end, resolution, filtered, valid]);
  const index = cursor === null ? null : Math.min(cursor, Math.max(0, buckets.length - 1));
  const bucket = index === null ? null : buckets[index];
  const visible = bucket ? filterEvents(filtered, monitoringDefaults, bucket.start, bucket.end) : filtered;
  const activeStart = bucket?.start ?? start;
  const activeEnd = bucket?.end ?? end;
  const summary = eventSummary(visible, filterEvents(events, filters, activeStart - (activeEnd - activeStart), activeStart));
  useEffect(() => {
    if (!playing || !buckets.length) return;
    const timer = window.setInterval(() => setCursor((previous) => {
      const next = (previous ?? -1) + 1;
      if (next >= buckets.length) { setPlaying(false); return buckets.length - 1; }
      return next;
    }), 1200 / Number(speed));
    return () => window.clearInterval(timer);
  }, [playing, speed, buckets.length]);
  const resetTime = () => { setCursor(null); setPlaying(false); };
  const unique = (key: "city" | "event_type" | "community" | "subject") => [...new Set(events.filter((e) => key !== "city" || filters.province === "all" || e.provinceId === filters.province).map((e) => e[key]))].sort().map((name) => ({ id: name, name }));
  const provinces = [...new Map(events.map((e) => [e.provinceId, { id: e.provinceId, name: e.province }])).values()];
  const all = { id: "all", name: "همه" };
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  if (data.isPending) return <div className="p-4 text-xs text-muted-foreground">در حال دریافت رخدادها…</div>;
  if (data.isError) return <div className="text-xs text-critical">دریافت رخدادها ناموفق بود</div>;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground"><span>داده‌های نمایشی · {dateText(data.data.asOf)}</span><span>مقایسه با بازه قبلِ هم‌طول</span></div>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{[
      ["تعداد رخدادها", summary.total.toLocaleString("fa-IR")], ["تعداد پیام‌ها", summary.messages.toLocaleString("fa-IR")], ["استان‌های فعال", summary.provinces.toLocaleString("fa-IR")], ["درصد تغییر", summary.change === null ? "—" : `${summary.change > 0 ? "+" : ""}${summary.change.toLocaleString("fa-IR")}٪`],
    ].map(([label, value]) => <div key={label} className="rounded-md border border-border bg-card p-3"><div className="text-[10px] text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold tabular-nums text-info" dir="ltr">{value}</div></div>)}</div>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
      <FilterSelect label="بازه زمانی" value={range} options={rangeOptions} onChange={(v) => { setRange(v as MonitoringRange); resetTime(); }} />
      <FilterSelect label="استان" value={filters.province} options={[all, ...provinces]} onChange={(province) => { setFilters((f) => ({ ...f, province, city: "all" })); resetTime(); }} />
      <FilterSelect label="شهر" value={filters.city} options={[all, ...unique("city")]} onChange={(city) => { setFilters((f) => ({ ...f, city })); resetTime(); }} />
      <FilterSelect label="نوع رخداد" value={filters.eventType} options={[all, ...unique("event_type")]} onChange={(eventType) => { setFilters((f) => ({ ...f, eventType })); resetTime(); }} />
      <FilterSelect label="جامعه" value={filters.community} options={[all, ...unique("community")]} onChange={(community) => { setFilters((f) => ({ ...f, community })); resetTime(); }} />
      <FilterSelect label="موضوع" value={filters.subject} options={[all, ...unique("subject")]} onChange={(subject) => { setFilters((f) => ({ ...f, subject })); resetTime(); }} />
      <FilterSelect label="سطح شدت" value={filters.severity} options={[all, ...Object.entries(severityNames).map(([id, name]) => ({ id, name }))]} onChange={(severity) => { setFilters((f) => ({ ...f, severity })); resetTime(); }} />
    </div>
    {range === "custom" && <div className="flex flex-wrap items-end gap-3"><label className="space-y-1 text-xs text-muted-foreground">شروع (تهران)<Input aria-label="شروع بازه" type="datetime-local" value={customStart} onChange={(e) => { setCustomStart(e.target.value); resetTime(); }} dir="ltr" /></label><label className="space-y-1 text-xs text-muted-foreground">پایان (تهران)<Input aria-label="پایان بازه" type="datetime-local" value={customEnd} onChange={(e) => { setCustomEnd(e.target.value); resetTime(); }} dir="ltr" /></label>{!valid && <span role="alert" className="text-xs text-critical">بازه معتبر تا حداکثر ۳۱ روز انتخاب کنید.</span>}</div>}
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
      <MonitoringMap events={visible} provinceNames={Object.fromEntries(data.data.provinces.map((p) => [p.id, p.name]))} recentStart={activeEnd - resolution} selectedProvince={filters.province} onProvince={(province) => { setFilters((f) => ({ ...f, province, city: "all" })); resetTime(); }} onEvent={setSelected} />
      <div className="min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-semibold">{filters.province === "all" ? "فعالیت اخیر" : `فعالیت ${provinces.find((p) => p.id === filters.province)?.name ?? "استان"}`}</h3><Button size="icon" variant="ghost" className="size-7" title="پاک‌سازی فیلترها" aria-label="پاک‌سازی فیلترهای پایش" onClick={() => { setFilters(monitoringDefaults); resetTime(); }}><RotateCcw /></Button></div>
        <div className="max-h-[390px] space-y-1 overflow-y-auto">{[...visible].sort((a, b) => Date.parse(b.time) - Date.parse(a.time)).map((e) => <Button key={e.event_id} variant="ghost" onClick={() => setSelected(e)} className="h-auto w-full justify-start whitespace-normal rounded-md border border-border p-2 text-start"><span className={cn("h-8 w-0.5 shrink-0", Date.parse(e.time) >= activeEnd - resolution ? "bg-success" : "bg-muted-foreground")} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-[11px]"><span>{e.event_type} · {e.city}</span><span className={e.severity === "high" ? "text-high" : "text-muted-foreground"}>{severityNames[e.severity]}</span></span><span className="mt-1 block text-[10px] text-muted-foreground">{e.community} · {dateText(e.time)}</span></span></Button>)}{visible.length === 0 && <div className="py-12 text-center text-xs text-muted-foreground">رخدادی در این بازه یافت نشد.</div>}</div>
      </div>
    </div>
    <div className="border-t border-border pt-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold">خط زمانی فعالیت‌های اخیر</h3><span className="text-[10px] text-muted-foreground">گام: {(resolution / 60_000).toLocaleString("fa-IR")} دقیقه · {dateText(activeStart)} — {dateText(activeEnd)}</span></div>
      <div className="flex h-20 items-end gap-1" dir="ltr">{buckets.map((b, i) => <Button key={b.start} variant="ghost" title={`${dateText(b.start)} · ${b.count.toLocaleString("fa-IR")} رخداد`} aria-label={`بازه ${dateText(b.start)}`} aria-pressed={index === i} onClick={() => { setCursor(i); setPlaying(false); }} className="relative h-full min-w-0 flex-1 rounded-none p-0"><svg viewBox="0 0 10 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true"><rect x="0" y={100 - Math.max(3, b.count / maxCount * 95)} width="10" height={Math.max(3, b.count / maxCount * 95)} className={index === i ? "fill-primary" : i === buckets.length - 1 ? "fill-success" : "fill-info/35"} /></svg></Button>)}</div>
      <div className="my-2 flex justify-between text-[10px] text-muted-foreground" dir="ltr"><span>{dateText(start)}</span><span>{dateText(end)}</span></div>
      <Slider aria-label="زمان پایش" dir="ltr" value={[index ?? Math.max(0, buckets.length - 1)]} min={0} max={Math.max(1, buckets.length - 1)} step={1} disabled={!valid} onValueChange={([v]) => { setCursor(v); setPlaying(false); }} />
      <div className="mt-3 flex flex-wrap items-center gap-2"><Button size="icon" className="size-8" disabled={!valid} title={playing ? "توقف" : "پخش"} aria-label={playing ? "توقف پخش" : "پخش خط زمانی"} onClick={() => { if (!playing && (cursor === null || cursor >= buckets.length - 1)) setCursor(0); setPlaying((p) => !p); }}>{playing ? <Pause /> : <Play />}</Button><Button size="icon" variant="outline" className="size-8" aria-label="گام قبلی" title="گام قبلی" disabled={!valid} onClick={() => { setPlaying(false); setCursor(Math.max(0, (index ?? buckets.length - 1) - 1)); }}><SkipBack /></Button><Button size="icon" variant="outline" className="size-8" aria-label="گام بعدی" title="گام بعدی" disabled={!valid} onClick={() => { setPlaying(false); setCursor(Math.min(buckets.length - 1, (index ?? 0) + 1)); }}><SkipForward /></Button><div className="w-24"><FilterSelect label="سرعت پخش" value={speed} onChange={setSpeed} options={["1", "2", "5"].map((id) => ({ id, name: `${id}x` }))} /></div><Button variant="ghost" size="sm" onClick={resetTime}>کل بازه</Button><span className="text-[10px] text-muted-foreground">{bucket ? `${(Number(index) + 1).toLocaleString("fa-IR")} / ${buckets.length.toLocaleString("fa-IR")}` : "کل بازه"}</span></div>
    </div>
    <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}><SheetContent side="right" className="overflow-y-auto" dir="rtl"><SheetTitle className="mt-4 flex items-center gap-2"><MapPin className="size-4 text-primary" />جزئیات رخداد</SheetTitle><SheetDescription className="mt-2">داده‌های نمایشی</SheetDescription>{selected && <dl className="mt-6 space-y-3">{[["نوع رخداد", selected.event_type], ["مکان", `${selected.province}، ${selected.city}`], ["زمان", dateText(selected.time)], ["جامعه", selected.community], ["موضوع", selected.subject], ["پیام‌ها", selected.message_count.toLocaleString("fa-IR")], ["منابع", selected.source_count.toLocaleString("fa-IR")], ["سطح", severityNames[selected.severity]], ["شدت", `${Math.round(selected.intensity * 100).toLocaleString("fa-IR")}٪`]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-border pb-3 text-xs"><dt className="text-muted-foreground">{label}</dt><dd className="text-end font-medium">{value}</dd></div>)}</dl>}</SheetContent></Sheet>
  </div>;
}