import { useQuery } from "@tanstack/react-query";
import { investigationService } from "@/lib/services/investigation";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { PlatformBadge, ReasonBadge } from "@/components/workspace/badges";
import type { ContentItem } from "@/lib/mock/types";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function LiveContent() {
  const { data = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: investigationService.getContents,
  });

  const sorted = [...data].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const columns: Column<ContentItem>[] = [
    {
      key: "publishedAt",
      header: "زمان انتشار",
      accessor: (r) => r.publishedAt,
      sortable: true,
      cell: (r) => <span className="num-fa font-mono text-[11px]">{r.publishedAt}</span>,
      width: "120px",
    },
    {
      key: "text",
      header: "متن محتوا",
      cell: (r) => (
        <div className="flex flex-col gap-1">
          <span className="line-clamp-2 max-w-[380px] text-[12px] text-foreground">{r.text}</span>
          {r.suspicious && (
            <div className="flex flex-wrap gap-1">
              {r.reasons.map((rs) => (
                <ReasonBadge key={rs} value={rs} />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "publisher",
      header: "منتشرکننده",
      accessor: (r) => r.publisher,
      sortable: true,
      cell: (r) => (
        <div className="leading-tight">
          <div className="text-[12px] font-medium">{r.publisher}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{r.publisherHandle}</div>
        </div>
      ),
    },
    {
      key: "platform",
      header: "پلتفرم",
      accessor: (r) => r.platform,
      sortable: true,
      cell: (r) => <PlatformBadge value={r.platform} />,
      width: "100px",
    },
    {
      key: "channelType",
      header: "نوع بستر",
      accessor: (r) => r.channelType,
      width: "110px",
    },
    { key: "channelTitle", header: "عنوان بستر", accessor: (r) => r.channelTitle, width: "140px" },
    {
      key: "contentId",
      header: "شناسه محتوا",
      accessor: (r) => r.contentId,
      cell: (r) => <span className="font-mono text-[11px] text-primary">{r.contentId}</span>,
      width: "110px",
    },
    {
      key: "link",
      header: "لینک",
      cell: (r) => (
        <a
          href={r.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-info hover:underline"
        >
          <ExternalLink className="size-3" />
          مشاهده
        </a>
      ),
      width: "80px",
    },
  ];

  return (
    <DataTable
      data={sorted}
      columns={columns}
      rowKey={(r) => r.id}
      searchPlaceholder="جستجو در محتواها…"
      searchAccessor={(r) => `${r.text} ${r.publisher} ${r.contentId} ${r.channelTitle}`}
      rowClassName={(r) => cn(r.suspicious && "row-suspicious")}
    />
  );
}
