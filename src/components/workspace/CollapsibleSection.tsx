import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  accent?: "default" | "critical" | "info" | "success";
  dense?: boolean;
}

const accentMap = {
  default: "before:bg-primary/60",
  critical: "before:bg-critical/80",
  info: "before:bg-info/70",
  success: "before:bg-success/70",
};

export function CollapsibleSection({
  id,
  title,
  subtitle,
  icon,
  actions,
  defaultOpen = true,
  children,
  accent = "default",
  dense = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={id}
      className="relative overflow-hidden rounded-lg border border-border bg-panel shadow-sm"
    >
      <header
        className={cn(
          "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-panel-header/95 px-4 py-2.5 backdrop-blur",
          "before:absolute before:inset-y-0 before:end-0 before:w-[3px]",
          accentMap[accent],
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2.5 text-start"
          aria-expanded={open}
          aria-controls={`${id}-body`}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
          {icon && <span className="text-primary">{icon}</span>}
          <div className="flex flex-1 items-baseline gap-3">
            <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {subtitle && (
              <span className="text-[11px] text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </button>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </header>
      <div
        id={`${id}-body`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn(dense ? "p-2" : "p-4")}>{children}</div>
        </div>
      </div>
    </section>
  );
}
