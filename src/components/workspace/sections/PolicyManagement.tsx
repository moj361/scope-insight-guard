import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { investigationService } from "@/lib/services/investigation";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { SeverityBadge, ActionBadge, actionOptions } from "@/components/workspace/badges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Filter, Pencil, X } from "lucide-react";
import type { Policy, Severity } from "@/lib/mock/types";
import { toast } from "sonner";

const severityOptions: { value: Severity; label: string }[] = [
  { value: "critical", label: "بحرانی" },
  { value: "high", label: "بالا" },
  { value: "medium", label: "متوسط" },
  { value: "low", label: "پایین" },
];

export function PolicyManagement() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: investigationService.getPolicies,
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Policy | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const save = useMutation({
    mutationFn: investigationService.savePolicy,
    onSuccess: (updated) => {
      qc.setQueryData<Policy[]>(["policies"], (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p)),
      );
      toast.success(`قانون ${updated.code} ذخیره شد`);
      setEditing(null);
      setDraft(null);
    },
  });

  const filtered = useMemo(
    () => (severityFilter === "all" ? data : data.filter((p) => p.severity === severityFilter)),
    [data, severityFilter],
  );

  function startEdit(p: Policy) {
    setEditing(p.id);
    setDraft({ ...p });
  }

  const columns: Column<Policy>[] = [
    {
      key: "code",
      header: "کد قانون",
      accessor: (r) => r.code,
      sortable: true,
      cell: (r) => <span className="font-mono text-[11px] text-primary">{r.code}</span>,
      width: "90px",
    },
    {
      key: "title",
      header: "عنوان قانون",
      accessor: (r) => r.title,
      sortable: true,
      cell: (r) =>
        editing === r.id && draft ? (
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="h-7 text-[12px]"
          />
        ) : (
          <span className="font-medium">{r.title}</span>
        ),
    },
    {
      key: "severity",
      header: "سطح اهمیت",
      accessor: (r) => r.severity,
      sortable: true,
      cell: (r) =>
        editing === r.id && draft ? (
          <Select
            value={draft.severity}
            onValueChange={(v) => setDraft({ ...draft, severity: v as Severity })}
          >
            <SelectTrigger className="h-7 w-[110px] text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {severityOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <SeverityBadge value={r.severity} />
        ),
      width: "130px",
    },
    {
      key: "weight",
      header: "Weight",
      accessor: (r) => r.weight,
      sortable: true,
      cell: (r) =>
        editing === r.id && draft ? (
          <Input
            type="number"
            value={draft.weight}
            onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })}
            className="h-7 w-16 text-[12px]"
          />
        ) : (
          <span className="num-fa font-mono">{r.weight}</span>
        ),
      width: "80px",
    },
    {
      key: "defaultAction",
      header: "اقدام پیش‌فرض",
      accessor: (r) => r.defaultAction,
      cell: (r) =>
        editing === r.id && draft ? (
          <Select
            value={draft.defaultAction || "monitor"}
            onValueChange={(v) =>
              setDraft({ ...draft, defaultAction: v as Policy["defaultAction"] })
            }
          >
            <SelectTrigger className="h-7 w-[120px] text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((o) => (
                <SelectItem key={o.value} value={o.value as string}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <ActionBadge value={r.defaultAction} />
        ),
      width: "140px",
    },
    {
      key: "keywords",
      header: "کلمات کلیدی",
      cell: (r) =>
        editing === r.id && draft ? (
          <Input
            value={draft.keywords.join("، ")}
            onChange={(e) =>
              setDraft({
                ...draft,
                keywords: e.target.value.split("،").map((s) => s.trim()).filter(Boolean),
              })
            }
            className="h-7 min-w-[180px] text-[12px]"
          />
        ) : (
          <div className="flex flex-wrap gap-1">
            {r.keywords.length === 0 && <span className="text-muted-foreground">—</span>}
            {r.keywords.map((k) => (
              <span
                key={k}
                className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        ),
    },
    {
      key: "prompt",
      header: "Prompt",
      cell: (r) =>
        editing === r.id && draft ? (
          <Textarea
            value={draft.prompt}
            onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
            className="min-h-[64px] w-[260px] text-[12px]"
          />
        ) : (
          <span className="line-clamp-2 max-w-[260px] text-[11px] text-muted-foreground">
            {r.prompt}
          </span>
        ),
    },
    {
      key: "enabled",
      header: "وضعیت",
      cell: (r) =>
        editing === r.id && draft ? (
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
          />
        ) : (
          <span
            className={
              r.enabled
                ? "inline-flex items-center gap-1 rounded border border-success/40 bg-success/10 px-1.5 py-0.5 text-[10px] text-success"
                : "inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            }
          >
            {r.enabled ? "فعال" : "غیرفعال"}
          </span>
        ),
      width: "80px",
    },
    {
      key: "actions",
      header: "",
      cell: (r) =>
        editing === r.id && draft ? (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-success"
              onClick={() => save.mutate(draft)}
            >
              <Check className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground"
              onClick={() => {
                setEditing(null);
                setDraft(null);
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-muted-foreground hover:text-primary"
            onClick={() => startEdit(r)}
          >
            <Pencil className="size-3.5" />
          </Button>
        ),
      width: "80px",
    },
  ];

  return (
    <DataTable
      data={filtered}
      columns={columns}
      rowKey={(r) => r.id}
      searchPlaceholder="جستجو در قوانین…"
      searchAccessor={(r) => `${r.code} ${r.title} ${r.keywords.join(" ")}`}
      toolbarExtra={
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-8 w-[140px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه سطوح</SelectItem>
              {severityOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
}
