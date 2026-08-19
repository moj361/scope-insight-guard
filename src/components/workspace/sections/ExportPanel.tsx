import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { investigationService } from "@/lib/services/investigation";

export function ExportPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [action, setAction] = useState("all");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!from || !to) {
      toast.error("لطفاً تاریخ شروع و پایان را انتخاب کنید.");
      return;
    }

    if (from > to) {
      toast.error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }

    setLoading(true);

    try {
      const blob = await investigationService.exportExcel({
        from,
        to,
        action: action === "all" ? undefined : action,
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `violations_${from}_${to}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("فایل خروجی آماده شد", {
        description: "دانلود فایل Excel آغاز شد.",
      });
    } catch (error) {
      console.error("Export Excel Error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "دریافت فایل Excel ناموفق بود.";

      toast.error("خطا در دریافت فایل", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          از تاریخ
        </span>

        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-8 text-[12px]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          تا تاریخ
        </span>

        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-8 text-[12px]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          نوع اقدام
        </span>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="confront">برخورد</SelectItem>
            <SelectItem value="sms">پیامک</SelectItem>
            <SelectItem value="monitor">رصد</SelectItem>
            <SelectItem value="block">مسدودسازی</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <div className="flex items-end">
        <Button
          className="h-8 w-full gap-2 md:w-auto"
          onClick={handleExport}
          disabled={loading}
        >
          <FileSpreadsheet className="size-4" />

          {loading ? "در حال آماده‌سازی…" : "خروجی Excel"}
        </Button>
      </div>
    </div>
  );
}