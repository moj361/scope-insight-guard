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
import { RefreshCw, RotateCcw, Search } from "lucide-react";

export interface FiltersState {
  source: string;
  platform: string;
  period: string;
  query: string;
}

const DEFAULTS: FiltersState = {
  source: "all",
  platform: "all",
  period: "today",
  query: "",
};

export function FiltersBar({
  value,
  onChange,
  onRefresh,
}: {
  value: FiltersState;
  onChange: (v: FiltersState) => void;
  onRefresh: () => void;
}) {
  const [local, setLocal] = useState(value);

  function apply(patch: Partial<FiltersState>) {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_2fr_auto]">
      <FilterBlock label="منبع">
        <Select value={local.source} onValueChange={(v) => apply({ source: v })}>
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="crawler">خزنده داخلی</SelectItem>
            <SelectItem value="partner">شرکای اطلاعاتی</SelectItem>
            <SelectItem value="manual">ورود دستی</SelectItem>
          </SelectContent>
        </Select>
      </FilterBlock>

      <FilterBlock label="پلتفرم">
        <Select value={local.platform} onValueChange={(v) => apply({ platform: v })}>
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="telegram">تلگرام</SelectItem>
            <SelectItem value="twitter">توییتر</SelectItem>
            <SelectItem value="instagram">اینستاگرام</SelectItem>
          </SelectContent>
        </Select>
      </FilterBlock>

      <FilterBlock label="بازه زمانی">
        <Select value={local.period} onValueChange={(v) => apply({ period: v })}>
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">امروز</SelectItem>
            <SelectItem value="48h">۴۸ ساعت</SelectItem>
            <SelectItem value="72h">۷۲ ساعت</SelectItem>
            <SelectItem value="1w">یک هفته</SelectItem>
            <SelectItem value="1m">یک ماه</SelectItem>
          </SelectContent>
        </Select>
      </FilterBlock>

      <FilterBlock label="جستجوی سراسری">
        <div className="relative">
          <Search className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={local.query}
            onChange={(e) => apply({ query: e.target.value })}
            placeholder="متن، شناسه، کاربر، کانال…"
            className="h-8 pe-8 text-[12px]"
          />
        </div>
      </FilterBlock>

      <div className="flex items-end gap-1.5">
        <Button size="sm" variant="secondary" className="h-8 gap-1.5" onClick={onRefresh}>
          <RefreshCw className="size-3.5" />
          به‌روزرسانی
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          onClick={() => {
            setLocal(DEFAULTS);
            onChange(DEFAULTS);
          }}
        >
          <RotateCcw className="size-3.5" />
          پاک‌سازی
        </Button>
      </div>
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export const defaultFilters = DEFAULTS;
