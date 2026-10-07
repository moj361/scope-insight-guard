import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Ring = number[][];
interface Feature { id: string; geometry: { type: "MultiPolygon"; coordinates: Ring[][] } }

const W = 1000;
const H = 620;
const PAD = 24;

interface CityPoint { id: string; name: string; coord?: [number, number] }
interface Props {
  provinceId: string | null;
  cityId: string | null;
  provinceNames: Record<string, string>;
  cities: CityPoint[];
  onSelectProvince: (id: string) => void;
  onSelectCity: (id: string) => void;
  /** Optional 0..1 intensity per province — renders a presence choropleth */
  values?: Record<string, number>;
}

/** Iran province/city drill-down map. Fits to the whole country or the selected province. */
export function IranMap({ provinceId, cityId, provinceNames, cities, onSelectProvince, onSelectCity, values }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/iran-provinces.geo.json")
      .then((r) => r.json())
      .then((g: { features: Feature[] }) => alive && setFeatures(g.features));
    return () => { alive = false; };
  }, []);

  const project = useMemo(() => {
    const focus = provinceId ? features.filter((f) => f.id === provinceId) : features;
    let minX = 180, maxX = -180, minY = 90, maxY = -90;
    for (const f of focus) for (const poly of f.geometry.coordinates) for (const [x, y] of poly[0]) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    if (minX > maxX) { minX = 44; maxX = 63.5; minY = 25; maxY = 40; }
    const kx = Math.cos((((minY + maxY) / 2) * Math.PI) / 180);
    const s = Math.min((W - PAD * 2) / ((maxX - minX) * kx), (H - PAD * 2) / (maxY - minY));
    const ox = (W - (maxX - minX) * kx * s) / 2;
    const oy = (H - (maxY - minY) * s) / 2;
    return ([lon, lat]: number[]) => [ox + (lon - minX) * kx * s, oy + (maxY - lat) * s];
  }, [features, provinceId]);

  const paths = useMemo(
    () => features.map((f) => ({
      id: f.id,
      d: f.geometry.coordinates
        .map((poly) => "M" + poly[0].map((p) => project(p).map((n) => n.toFixed(1)).join(",")).join("L") + "Z")
        .join(""),
    })),
    [features, project],
  );

  const showHover = (name: string) => (e: React.MouseEvent<SVGElement>) => {
    const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    setHover({ name, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-background/60" dir="ltr">
      <svg
        key={provinceId ?? "iran"}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full animate-in fade-in zoom-in-95 duration-300"
        role="img"
        aria-label="Iran map"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <pattern id="ir-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#ir-grid)" />
        {paths.map(({ id, d }) => {
          const selected = id === provinceId;
          const dim = !!provinceId && !selected;
          const v = values?.[id];
          return (
            <path
              key={id}
              d={d}
              tabIndex={dim ? -1 : 0}
              role="button"
              aria-label={provinceNames[id] ?? id}
              aria-pressed={selected}
              onClick={() => onSelectProvince(id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectProvince(id)}
              onMouseMove={showHover(provinceNames[id] ?? id)}
              className={cn(
                "cursor-pointer outline-none transition-colors duration-150",
                selected
                  ? "fill-primary/25 stroke-primary"
                  : dim
                    ? "fill-muted/40 stroke-border hover:fill-muted"
                    : "fill-muted stroke-border hover:fill-primary/50 focus-visible:fill-primary/50",
              )}
              strokeWidth={selected ? 1.5 : 0.6}
              style={v != null && !selected ? { fill: `color-mix(in oklab, var(--color-primary) ${Math.round(12 + v * 78)}%, var(--color-muted))` } : undefined}
            />
          );
        })}
        {provinceId &&
          cities.filter((c) => c.coord).map((c) => {
            const [x, y] = project(c.coord!);
            const sel = c.id === cityId;
            return (
              <g
                key={c.id}
                role="button"
                tabIndex={0}
                aria-label={c.name}
                aria-pressed={sel}
                className="cursor-pointer outline-none"
                onClick={() => onSelectCity(c.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectCity(c.id)}
                onMouseMove={showHover(c.name)}
              >
                <circle cx={x} cy={y} r={sel ? 14 : 10} className={sel ? "fill-primary/25" : "fill-transparent"} />
                <circle
                  cx={x} cy={y} r={sel ? 7 : 5}
                  className={cn("stroke-background transition-all", sel ? "fill-primary" : "fill-foreground/80 hover:fill-primary")}
                  strokeWidth={1.5}
                />
                <text x={x} y={y - 12} textAnchor="middle" className={cn("pointer-events-none text-[15px]", sel ? "fill-primary font-semibold" : "fill-muted-foreground")}>
                  {c.name}
                </text>
              </g>
            );
          })}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded border border-border bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          {hover.name}
        </div>
      )}
      {features.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Loading map…</div>
      )}
    </div>
  );
}
