import { useQuery } from "@tanstack/react-query";
import { investigationService } from "@/lib/services/investigation";
import { Hash, ShieldAlert, User2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CaseInfoBar() {
  const { data, isLoading } = useQuery({
    queryKey: ["case"],
    queryFn: investigationService.getCase,
  });

  if (isLoading || !data) {
    return <Skeleton className="h-14 w-full" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-gradient-to-l from-panel via-panel to-panel-header px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <ShieldAlert className="size-4" />
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            عنوان پرونده
          </div>
          <div className="text-sm font-semibold text-foreground">{data.title}</div>
        </div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <Hash className="size-4 text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            شماره پرونده
          </div>
          <div className="text-sm font-mono text-foreground num-fa">{data.caseNumber}</div>
        </div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            وضعیت پرونده
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
            <span className="relative inline-flex">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-success/60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            فعال
          </div>
        </div>
      </div>
      <div className="ms-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <User2 className="size-3.5" />
          <span>تحلیلگر: <span className="text-foreground">{data.analyst}</span></span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          گشوده شده: <span className="text-foreground num-fa">{data.openedAt}</span>
        </div>
      </div>
    </div>
  );
}
