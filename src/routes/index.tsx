import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  FolderInput,
  Gavel,
  Radio,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { CollapsibleSection } from "@/components/workspace/CollapsibleSection";
import { CaseInfoBar } from "@/components/workspace/sections/CaseInfoBar";
import {
  FiltersBar,
  defaultFilters,
  type FiltersState,
} from "@/components/workspace/sections/FiltersBar";
import { Statistics } from "@/components/workspace/sections/Statistics";
import { OfflineImport } from "@/components/workspace/sections/OfflineImport";
import { PolicyManagement } from "@/components/workspace/sections/PolicyManagement";
import { LiveContent } from "@/components/workspace/sections/LiveContent";
import { AssessmentTable } from "@/components/workspace/sections/AssessmentTable";
import { ViolationQueue } from "@/components/workspace/sections/ViolationQueue";
import { ExportPanel } from "@/components/workspace/sections/ExportPanel";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: WorkspacePage,
});

function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-panel-header/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldAlert className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight text-foreground">
              سکوی حاکمیت رسانه — میز کار تحلیلگر
            </div>
            <div className="text-[10px] text-muted-foreground">
              Media Governance Platform · Investigation Workspace
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 border-success/40 bg-success/15 text-success">
            <span className="size-1.5 rounded-full bg-success" />
            سرویس‌ها آنلاین
          </Badge>
          <Badge className="gap-1 border-info/40 bg-info/10 text-info">
            <Activity className="size-3" />
            <span className="num-fa">۲۱۶</span> در صف
          </Badge>
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
            م.ه
          </div>
        </div>
      </div>
    </header>
  );
}

function WorkspacePage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  function refreshAll() {
    qc.invalidateQueries();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4">
        <CaseInfoBar />

        <CollapsibleSection
          id="filters"
          title="فیلترها"
          subtitle={`منبع: ${filters.source} · پلتفرم: ${filters.platform} · بازه: ${filters.period}`}
          icon={<SlidersHorizontal className="size-4" />}
          accent="info"
          dense
        >
          <FiltersBar value={filters} onChange={setFilters} onRefresh={refreshAll} />
        </CollapsibleSection>

        <CollapsibleSection
          id="statistics"
          title="آمار عملیاتی"
          subtitle="KPI و توزیع دسته‌بندی تخلفات"
          icon={<BarChart3 className="size-4" />}
          accent="info"
        >
          <Statistics />
        </CollapsibleSection>

        <CollapsibleSection
          id="offline"
          title="بارگذاری آفلاین"
          subtitle="Offline Import"
          icon={<FolderInput className="size-4" />}
          defaultOpen={false}
        >
          <OfflineImport />
        </CollapsibleSection>

        <CollapsibleSection
          id="policies"
          title="مدیریت قوانین"
          subtitle="Policy Management"
          icon={<ScrollText className="size-4" />}
        >
          <PolicyManagement />
        </CollapsibleSection>

        <CollapsibleSection
          id="live"
          title="محتوای زنده"
          subtitle="آخرین محتواهای منتشر شده — مرتب بر اساس زمان انتشار"
          icon={<Radio className="size-4" />}
          accent="info"
        >
          <LiveContent />
        </CollapsibleSection>

        <CollapsibleSection
          id="assessment"
          title="نتایج ارزیابی"
          subtitle="Assessment Results"
          icon={<ClipboardList className="size-4" />}
        >
          <AssessmentTable />
        </CollapsibleSection>

        <CollapsibleSection
          id="queue"
          title="صف پردازش تخلفات"
          subtitle="اصلی‌ترین بخش عملیات — تصمیم‌گیری کارشناس"
          icon={<Gavel className="size-4" />}
          accent="critical"
          actions={
            <Badge className="gap-1 border-critical/40 bg-critical/15 text-critical">
              <Zap className="size-3" /> اولویت بالا
            </Badge>
          }
        >
          <ViolationQueue />
        </CollapsibleSection>

        <CollapsibleSection
          id="export"
          title="خروجی گزارش"
          subtitle="Excel Export"
          icon={<FileSpreadsheet className="size-4" />}
          defaultOpen={false}
        >
          <ExportPanel />
        </CollapsibleSection>

        <footer className="pb-4 pt-2 text-center text-[10px] text-muted-foreground">
          Media Governance Platform · Investigation Workspace v۱٫۰ · داده‌های نمایشی
        </footer>
      </main>
    </div>
  );
}
