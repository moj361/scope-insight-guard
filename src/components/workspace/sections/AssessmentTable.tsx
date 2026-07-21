import { useQuery } from "@tanstack/react-query";
import { investigationService } from "@/lib/services/investigation";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { PriorityBadge, SeverityBadge } from "@/components/workspace/badges";
import type { Assessment } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

function Meter({ value, tone = "info" }: { value: number; tone?: "info" | "critical" | "success" | "warning" }) {
  const toneClass = {
    info: "bg-info",
    critical: "bg-critical",
    success: "bg-success",
    warning: "bg-warning",
  }[tone];
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", toneClass)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="num-fa font-mono text-[11px] text-foreground">
        {value.toLocaleString("fa-IR")}
      </span>
    </div>
  );
}

export function AssessmentTable() {
  const { data = [] } = useQuery({
    queryKey: ["assessments"],
    queryFn: investigationService.getAssessments,
  });

  const columns: Column<Assessment>[] = [
    {
      key: "contentId",
      header: "شناسه محتوا",
      accessor: (r) => r.contentId,
      sortable: true,
      cell: (r) => <span className="font-mono text-[11px] text-primary">{r.contentId}</span>,
      width: "110px",
    },
    {
      key: "text",
      header: "متن محتوا",
      cell: (r) => (
        <span className="line-clamp-2 max-w-[280px] text-[12px]">{r.text}</span>
      ),
    },
    {
      key: "violationCode",
      header: "کد تخلف",
      accessor: (r) => r.violationCode,
      sortable: true,
      cell: (r) => <span className="font-mono text-[11px]">{r.violationCode}</span>,
      width: "90px",
    },
    { key: "violationTitle", header: "عنوان تخلف", accessor: (r) => r.violationTitle, sortable: true },
    {
      key: "detectionReason",
      header: "دلیل تشخیص",
      cell: (r) => <span className="text-[11px] text-muted-foreground">{r.detectionReason}</span>,
    },
    {
      key: "analyst",
      header: "تحلیلگر",
      cell: (r) => <span className="font-mono text-[11px] text-info">{r.analyst}</span>,
      width: "130px",
    },
    {
      key: "confidence",
      header: "Confidence",
      accessor: (r) => r.confidence,
      sortable: true,
      cell: (r) => <Meter value={r.confidence} tone="info" />,
      width: "140px",
    },
    {
      key: "riskScore",
      header: "Risk Score",
      accessor: (r) => r.riskScore,
      sortable: true,
      cell: (r) => (
        <Meter
          value={r.riskScore}
          tone={r.riskScore > 80 ? "critical" : r.riskScore > 60 ? "warning" : "success"}
        />
      ),
      width: "140px",
    },
    {
      key: "history",
      header: "سابقه",
      accessor: (r) => r.history,
      sortable: true,
      cell: (r) => <span className="num-fa font-mono text-[11px]">{r.history}</span>,
      width: "70px",
    },
    {
      key: "severity",
      header: "درجه اهمیت",
      accessor: (r) => r.severity,
      cell: (r) => <SeverityBadge value={r.severity} />,
      width: "110px",
    },
    {
      key: "impact",
      header: "درجه تاثیر",
      accessor: (r) => r.impact,
      sortable: true,
      cell: (r) => <span className="num-fa font-mono text-[11px]">{r.impact}</span>,
      width: "90px",
    },
    {
      key: "repetition",
      header: "درجه تکرار",
      accessor: (r) => r.repetition,
      sortable: true,
      cell: (r) => <span className="num-fa font-mono text-[11px]">{r.repetition}</span>,
      width: "90px",
    },
    {
      key: "priority",
      header: "Priority",
      cell: (r) => <PriorityBadge value={r.priority} />,
      width: "100px",
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      rowKey={(r) => r.id}
      searchAccessor={(r) => `${r.contentId} ${r.text} ${r.violationCode} ${r.violationTitle}`}
      maxHeight="480px"
    />
  );
}
