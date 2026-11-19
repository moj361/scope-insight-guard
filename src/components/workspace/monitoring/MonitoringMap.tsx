import { useQuery } from "@tanstack/react-query";
import { geospatialMonitoringService, type MonitoringEvent } from "@/lib/services/geospatialMonitoring";
import { cn } from "@/lib/utils";

const project = (lng: number, lat: number) => [30 + (lng - 44) * 37, 30 + (40 - lat) * 37];
export function MonitoringMap({ events, provinceNames, recentStart, selectedProvince, onProvince, onEvent }: {
  provinceNames: Record<string, string>;
  events: MonitoringEvent[]; recentStart: number; selectedProvince: string;
  onProvince: (id: string) => void; onEvent: (event: MonitoringEvent) => void;
}) {
  const geometry = useQuery({ queryKey: ["monitoring-geometry"], queryFn: geospatialMonitoringService.getGeometry });
  const grouped = new Map<string, MonitoringEvent[]>();
  events.forEach((e) => grouped.set(e.provinceId, [...(grouped.get(e.provinceId) ?? []), e]));
  // One marker per city avoids overlapping targets; the strongest event opens its details.
  const markers = new Map<string, MonitoringEvent>();
  events.forEach((e) => {
    const key = `${e.provinceId}-${e.city}`;
    const previous = markers.get(key);
    if (!previous || e.intensity > previous.intensity) markers.set(key, e);
  });
  return <div className="relative overflow-hidden rounded-md border border-border bg-background/60" dir="ltr">
    <svg viewBox="0 0 780 620" className="block max-h-[440px] w-full" role="group" aria-label="نقشه پایش ایران">
      {geometry.data?.features.map((f) => {
        const items = grouped.get(f.id) ?? [];
        const intensity = items.reduce((sum, e) => sum + e.intensity, 0);
        // Continuous heat glow over one dark neutral base; intensity scales 0..~3.
        const heat = Math.min(intensity / 3, 1);
        const name = provinceNames[f.id] ?? f.id;
        return <path key={f.id} d={f.geometry.coordinates.map((poly) => poly.map((ring) => "M" + ring.map(([lng, lat]) => project(lng, lat).join(",")).join("L") + "Z").join("")).join("")}
          fillRule="evenodd" className={cn("cursor-pointer fill-muted/40 outline-none transition-[filter] duration-150 hover:brightness-125 focus-visible:brightness-125", selectedProvince === f.id ? "stroke-primary" : "stroke-border/60")}
          style={heat > 0 ? { fill: `color-mix(in oklab, var(--color-high) ${Math.round(8 + heat * 62)}%, var(--color-muted))` } : undefined}
          strokeWidth={selectedProvince === f.id ? 2 : 0.6} role="button" tabIndex={0} aria-label={`فعالیت استان ${name}`}
          onClick={() => onProvince(f.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onProvince(f.id); } }}>
          <title>{name} · {items.length.toLocaleString("fa-IR")} رخداد</title>
        </path>;
      })}
      {[...markers.values()].map((e) => {
        const [x, y] = project(e.lng, e.lat);
        const recent = Date.parse(e.time) >= recentStart;
        return <g key={e.event_id} role="button" tabIndex={0} aria-label={`رخداد ${e.event_type}، ${e.city}`} className="group cursor-pointer outline-none"
          onClick={() => onEvent(e)} onKeyDown={(key) => { if (key.key === "Enter" || key.key === " ") { key.preventDefault(); onEvent(e); } }}>
          <circle cx={x} cy={y} r={6} className="fill-transparent" />
          {recent && <circle cx={x} cy={y} r={10} className="pointer-events-none fill-none stroke-success" strokeWidth={1.5} />}
          <circle cx={x} cy={y} r={e.intensity >= 0.75 ? 5.5 : 4} className={cn("stroke-background group-hover:stroke-foreground group-focus-visible:stroke-foreground", recent ? "fill-success" : "fill-foreground/70")} strokeWidth={1.5} />
          <title>{e.city} · {e.event_type} · {Math.round(e.intensity * 100).toLocaleString("fa-IR")}٪</title>
        </g>;
      })}
    </svg>
    {geometry.isPending && <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">در حال دریافت نقشه…</div>}
    {geometry.isError && <div className="absolute inset-0 flex items-center justify-center text-xs text-critical">نقشه در دسترس نیست</div>}
    <div className="flex flex-wrap justify-center gap-4 border-t border-border p-2 text-[10px] text-muted-foreground" dir="rtl">
      <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-success" />تازه‌ترین فعالیت</span>
      <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-foreground/70" />فعالیت تاریخی</span>
      <span className="flex items-center gap-1">تراکم <i className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(to left, color-mix(in oklab, var(--color-high) 70%, var(--color-muted)), var(--color-muted))" }} /></span>
    </div>
  </div>;
}