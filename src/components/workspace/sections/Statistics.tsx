import { useQuery } from "@tanstack/react-query";
import { investigationService } from "@/lib/services/investigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { KpiStat } from "@/lib/mock/types";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const toneMap: Record<NonNullable<KpiStat["tone"]>, string> = {
  neutral: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
  info: "text-info",
};

function KpiCard({ stat }: { stat: KpiStat }) {
  return (
    <div className="group relative rounded-md border border-border bg-card p-3 transition hover:border-primary/40">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {stat.label}
        </span>
        {stat.delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium",
              stat.delta >= 0 ? "text-success" : "text-critical",
            )}
          >
            {stat.delta >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(stat.delta).toLocaleString("fa-IR")}٪
          </span>
        )}
      </div>
      <div className={cn("mt-1 flex items-baseline gap-1", toneMap[stat.tone ?? "neutral"])}>
        <span className="text-xl font-bold tabular-nums num-fa">
          {stat.value.toLocaleString("fa-IR")}
        </span>
        {stat.hint && <span className="text-[10px] text-muted-foreground">{stat.hint}</span>}
      </div>
    </div>
  );
}

export function Statistics() {
  const kpisQ = useQuery({ queryKey: ["kpis"], queryFn: investigationService.getKpis });
  const catsQ = useQuery({
    queryKey: ["policyCategories"],
    queryFn: investigationService.getPolicyCategories,
  });

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {kpisQ.isLoading &&
          Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-[68px]" />)}
        {kpisQ.data?.map((s) => <KpiCard key={s.key} stat={s} />)}
      </div>
      <div className="rounded-md border border-border bg-card p-3">
        <div className="mb-1 text-[11px] font-semibold text-foreground">
          نسبت تخلفات شناسایی شده
        </div>
        <div className="text-[10px] text-muted-foreground">دسته‌بندی بر اساس Policy</div>
        <div className="h-[220px]">
          {catsQ.data && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catsQ.data}
                  dataKey="count"
                  nameKey="title"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="var(--color-panel)"
                >
                  {catsQ.data.map((c) => (
                    <Cell key={c.code} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, direction: "rtl" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
