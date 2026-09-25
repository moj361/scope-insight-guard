import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Ring = number[][];
interface Feature {
  id: string;
  properties: { name: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: Ring[] | Ring[][] };
}

const W = 1000;
const H = 500;
// Equirectangular, cropped at ~-58° lat to drop Antarctica space
const project = ([lon, lat]: number[]) => [((lon + 180) / 360) * W, ((84 - lat) / 142) * H];

function toPath(f: Feature): string {
  const polys = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as Ring[][];
  return polys
    .map((poly) =>
      poly
        .map((ring) => "M" + ring.map((p) => project(p).map((n) => n.toFixed(1)).join(",")).join("L") + "Z")
        .join(""),
    )
    .join("");
}

interface Props {
  selectedId: string | null;
  highlightIds?: string[];
  onSelect: (id: string) => void;
}

export function WorldMap({ selectedId, highlightIds = [], onSelect }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/world.geo.json")
      .then((r) => r.json())
      .then((g: { features: Feature[] }) => alive && setFeatures(g.features.filter((f) => f.id !== "ATA")));
    return () => {
      alive = false;
    };
  }, []);

  const paths = useMemo(() => features.map((f) => ({ f, d: toPath(f) })), [features]);

  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-background/60" dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label="World map"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <pattern id="sr-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#sr-grid)" />
        {paths.map(({ f, d }) => {
          const selected = f.id === selectedId;
          const hl = highlightIds.includes(f.id);
          return (
            <path
              key={f.id}
              d={d}
              tabIndex={0}
              role="button"
              aria-label={f.properties.name}
              aria-pressed={selected}
              onClick={() => onSelect(f.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(f.id)}
              onMouseMove={(e) => {
                const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                setHover({ name: f.properties.name, x: e.clientX - r.left, y: e.clientY - r.top });
              }}
              className={cn(
                "cursor-pointer outline-none transition-colors duration-150",
                selected
                  ? "fill-primary stroke-primary-foreground/70"
                  : hl
                    ? "fill-primary/35 stroke-border hover:fill-primary/60"
                    : "fill-muted stroke-border hover:fill-accent focus-visible:fill-accent",
              )}
              strokeWidth={selected ? 1 : 0.4}
            />
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
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Loading map…
        </div>
      )}
    </div>
  );
}
