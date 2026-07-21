import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { investigationService } from "@/lib/services/investigation";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import {
  ActionBadge,
  PlatformBadge,
  PriorityBadge,
  StatusBadge,
  actionOptions,
} from "@/components/workspace/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import type { ExpertAction, Priority, Violation } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ViolationDrawer,
  useViolationDrawer,
} from "@/components/workspace/ViolationDrawer";

const priorityRowClass: Record<Priority, string> = {
  critical: "row-critical",
  high: "row-high",
  medium: "row-medium",
  low: "row-low",
};

export function ViolationQueue() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["violations"],
    queryFn: investigationService.getViolations,
  });
  const drawer = useViolationDrawer();

  const [drafts, setDrafts] = useState<
    Record<string, { expertAction: ExpertAction; expertComment: string }>
  >({});

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      data.forEach((v) => {
        if (!next[v.id])
          next[v.id] = { expertAction: v.expertAction, expertComment: v.expertComment };
      });
      return next;
    });
  }, [data]);

  const save = useMutation({
    mutationFn: investigationService.saveViolation,
    onSuccess: (updated) => {
      qc.setQueryData<Violation[]>(["violations"], (old) =>
        old?.map((v) => (v.id === updated.id ? updated : v)),
      );
      toast.success(`تصمیم برای ${updated.id} ذخیره شد`);
    },
  });

  function updateDraft(id: string, patch: Partial<(typeof drafts)[string]>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  const columns: Column<Violation>[] = [
    {
      key: "priority",
      header: "اولویت",
      accessor: (r) => r.priority,
      sortable: true,
      cell: (r) => <PriorityBadge value={r.priority} />,
      width: "100px",
    },
    {
      key: "title",
      header: "عنوان تخلف",
      accessor: (r) => r.title,
      sortable: true,
      cell: (r) => (
        <div className="flex flex-col leading-tight">
          <span className="font-medium text-[12px]">{r.title}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{r.contentId}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "شرح تخلف",
      cell: (r) => (
        <span className="line-clamp-2 max-w-[260px] text-[11px] text-muted-foreground">
          {r.description}
        </span>
      ),
    },
    {
      key: "offender",
      header: "هویت متخلف",
      cell: (r) => (
        <div className="flex flex-col gap-1 leading-tight">
          <span className="text-[12px] font-medium">{r.offender.name}</span>
          <div className="flex items-center gap-1">
            <PlatformBadge value={r.offender.platform} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {r.offender.handle}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "suggested",
      header: "پیشنهاد سیستم",
      cell: (r) => <ActionBadge value={r.suggestedAction} />,
      width: "130px",
    },
    {
      key: "expertAction",
      header: "اقدام کارشناس",
      cell: (r) => (
        <Select
          value={drafts[r.id]?.expertAction || ""}
          onValueChange={(v) => updateDraft(r.id, { expertAction: v as ExpertAction })}
        >
          <SelectTrigger
            className="h-7 w-[130px] text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="انتخاب…" />
          </SelectTrigger>
          <SelectContent>
            {actionOptions.map((o) => (
              <SelectItem key={o.value} value={o.value as string}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
      width: "150px",
    },
    {
      key: "expertComment",
      header: "نظر کارشناس",
      cell: (r) => (
        <Textarea
          value={drafts[r.id]?.expertComment ?? ""}
          onChange={(e) => updateDraft(r.id, { expertComment: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="یادداشت تحلیلگر…"
          className="min-h-[56px] w-[220px] resize-none text-[11px]"
        />
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => <StatusBadge value={r.status} />,
      width: "110px",
    },
    {
      key: "save",
      header: "",
      cell: (r) => (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 gap-1 text-[11px]"
          onClick={(e) => {
            e.stopPropagation();
            const d = drafts[r.id];
            if (!d?.expertAction) {
              toast.error("لطفاً اقدام کارشناس را انتخاب کنید");
              return;
            }
            save.mutate({
              ...r,
              expertAction: d.expertAction,
              expertComment: d.expertComment,
              status: "approved",
            });
          }}
        >
          <Save className="size-3.5" />
          ذخیره
        </Button>
      ),
      width: "90px",
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        rowKey={(r) => r.id}
        onRowClick={(r) => drawer.open(r)}
        searchPlaceholder="جستجو در صف تخلفات…"
        searchAccessor={(r) => `${r.title} ${r.description} ${r.offender.name} ${r.contentId}`}
        maxHeight="560px"
        rowClassName={(r) => cn(priorityRowClass[r.priority])}
      />
      <ViolationDrawer violation={drawer.current} onOpenChange={drawer.onOpenChange} />
    </>
  );
}
