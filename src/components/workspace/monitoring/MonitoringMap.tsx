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
      <defs>
        {[...markers.values()].map((e) => {
          // Radial heat blob: cyan low → green/yellow medium → orange/red high, with a hot core.
          const i = e.intensity;
          const core = i >= 0.75 ? "#ef4444" : i >= 0.5 ? "#f97316" : i >= 0.3 ? "#eab308" : "#22d3ee";
          const mid = i >= 0.75 ? "#f97316" : i >= 0.5 ? "#eab308" : i >= 0.3 ? "#4ade80" : "#2dd4bf";
          const edge = i >= 0.5 ? "#22c55e" : "#06b6d4";
          return (
            <radialGradient key={e.event_id} id={`heat-${e.event_id}`}>
              <stop offset="0%" stopColor={core} stopOpacity={0.55 + i * 0.4} />
              <stop offset="35%" stopColor={mid} stopOpacity={0.3 + i * 0.3} />
              <stop offset="70%" stopColor={edge} stopOpacity={0.12 + i * 0.12} />
              <stop offset="100%" stopColor={edge} stopOpacity={0} />
            </radialGradient>
          );
        })}
      </defs>
      {geometry.data?.features.map((f) => {
        const items = grouped.get(f.id) ?? [];
        const name = provinceNames[f.id] ?? f.id;
        return <path key={f.id} d={f.geometry.coordinates.map((poly) => poly.map((ring) => "M" + ring.map(([lng, lat]) => project(lng, lat).join(",")).join("L") + "Z").join("")).join("")}
          fillRule="evenodd" className={cn("cursor-pointer fill-muted/70 outline-none transition-[filter] duration-150 hover:brightness-125 focus-visible:brightness-125", selectedProvince === f.id ? "stroke-primary" : "stroke-border/60")}
          strokeWidth={selectedProvince === f.id ? 2 : 0.6} role="button" tabIndex={0} aria-label={`فعالیت استان ${name}`}
          onClick={() => onProvince(f.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onProvince(f.id); } }}>
          <title>{name} · {items.length.toLocaleString("fa-IR")} رخداد</title>
        </path>;
      })}
      {/* Continuous heatmap layer: soft radial glows over the neutral map, under the markers. */}
      <g className="pointer-events-none" style={{ mixBlendMode: "screen" }}>
        {[...markers.values()].map((e) => {
          const [x, y] = project(e.lng, e.lat);
          const r = 26 + e.intensity * 46;
          return <circle key={`heat-${e.event_id}`} cx={x} cy={y} r={r} fill={`url(#heat-${e.event_id})`} />;
        })}
      </g>
      {/* Border pass above the heat so province boundaries stay visible through the glow. */}
      <g className="pointer-events-none">
        {geometry.data?.features.map((f) => (
          <path key={`border-${f.id}`} d={f.geometry.coordinates.map((poly) => poly.map((ring) => "M" + ring.map(([lng, lat]) => project(lng, lat).join(",")).join("L") + "Z").join("")).join("")}
            fillRule="evenodd" className="fill-none stroke-border/80" strokeWidth={0.6} />
        ))}
      </g>
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
      <span className="flex items-center gap-1">تراکم <i className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(to left, #ef4444, #f97316, #eab308, #4ade80, #22d3ee)" }} /></span>
    </div>
  </div>;
}