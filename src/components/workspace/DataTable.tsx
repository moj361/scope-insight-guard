import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  accessor?: (row: T) => string | number;
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
  headClassName?: string;
  width?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchAccessor?: (row: T) => string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  maxHeight?: string;
  toolbarExtra?: ReactNode;
  showRowNumbers?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "جستجو…",
  searchAccessor,
  rowClassName,
  onRowClick,
  emptyMessage = "موردی یافت نشد",
  maxHeight = "440px",
  toolbarExtra,
  showRowNumbers = true,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    const acc = searchAccessor ?? ((row: T) => JSON.stringify(row).toLowerCase());
    return data.filter((r) => acc(r).toLowerCase().includes(q));
  }, [data, query, searchAccessor]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.accessor) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {(searchable || toolbarExtra) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="h-8 pe-8 text-[12px]"
              />
            </div>
          )}
          {toolbarExtra}
          <div className="ms-auto text-[11px] text-muted-foreground num-fa">
            {sorted.length.toLocaleString("fa-IR")} ردیف
          </div>
        </div>
      )}
      <div
        className="relative overflow-auto rounded-md border border-border bg-card"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 z-10 bg-panel-header">
            <tr>
              {showRowNumbers && (
                <th className="w-10 border-b border-border px-2 py-2 text-center text-[11px] font-medium text-muted-foreground">
                  #
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "border-b border-border px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap",
                    col.headClassName,
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (showRowNumbers ? 1 : 0)}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {paged.map((row, i) => {
              const idx = start + i;
              return (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border/60 transition-colors last:border-b-0 hover:bg-accent/40",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row, idx),
                  )}
                >
                  {showRowNumbers && (
                    <td className="border-e border-border/40 px-2 py-2 text-center text-[11px] text-muted-foreground num-fa">
                      {(idx + 1).toLocaleString("fa-IR")}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-3 py-2 align-top", col.className)}
                    >
                      {col.cell
                        ? col.cell(row, idx)
                        : col.accessor
                          ? String(col.accessor(row))
                          : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="num-fa">
          صفحه {currentPage.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            بعدی
          </Button>
        </div>
      </div>
    </div>
  );
}
