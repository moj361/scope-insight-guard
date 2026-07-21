import { cn } from "@/lib/utils";
import type { ExpertAction, Platform, Priority, Severity, SuspiciousReason, ViolationStatus } from "@/lib/mock/types";

interface TokenBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: string;
  icon?: React.ReactNode;
}

function TokenBadge({ children, className, icon }: TokenBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const severityMap: Record<Severity, { label: string; cls: string }> = {
  critical: { label: "بحرانی", cls: "border-critical/40 bg-critical/15 text-critical" },
  high: { label: "بالا", cls: "border-high/40 bg-high/15 text-high" },
  medium: { label: "متوسط", cls: "border-medium/40 bg-medium/15 text-medium" },
  low: { label: "پایین", cls: "border-low/50 bg-low/20 text-foreground/80" },
};

export function SeverityBadge({ value }: { value: Severity }) {
  const c = severityMap[value];
  return <TokenBadge className={c.cls}>{c.label}</TokenBadge>;
}

export function PriorityBadge({ value }: { value: Priority }) {
  const c = severityMap[value];
  return (
    <TokenBadge className={cn(c.cls, "font-semibold")}>
      <span className="inline-block size-1.5 rounded-full bg-current" />
      {c.label}
    </TokenBadge>
  );
}

const platformMap: Record<Platform, { label: string; cls: string }> = {
  telegram: { label: "تلگرام", cls: "border-info/30 bg-info/10 text-info" },
  twitter: { label: "توییتر", cls: "border-primary/30 bg-primary/10 text-primary" },
  instagram: { label: "اینستاگرام", cls: "border-high/30 bg-high/10 text-high" },
};

export function PlatformBadge({ value }: { value: Platform }) {
  const c = platformMap[value];
  return <TokenBadge className={c.cls}>{c.label}</TokenBadge>;
}

const actionMap: Record<Exclude<ExpertAction, "">, { label: string; cls: string }> = {
  confront: { label: "برخورد", cls: "border-critical/40 bg-critical/15 text-critical" },
  sms: { label: "پیامک", cls: "border-warning/40 bg-warning/15 text-warning" },
  monitor: { label: "رصد", cls: "border-info/40 bg-info/15 text-info" },
  block: { label: "مسدودسازی", cls: "border-high/40 bg-high/15 text-high" },
  no_action: { label: "عدم اقدام", cls: "border-low/50 bg-low/20 text-foreground/80" },
};

export function ActionBadge({ value }: { value: ExpertAction }) {
  if (!value) return <span className="text-[11px] text-muted-foreground">—</span>;
  const c = actionMap[value];
  return <TokenBadge className={c.cls}>{c.label}</TokenBadge>;
}

export const actionOptions = Object.entries(actionMap).map(([value, { label }]) => ({
  value: value as ExpertAction,
  label,
}));

const statusMap: Record<ViolationStatus, { label: string; cls: string }> = {
  pending: { label: "در انتظار", cls: "border-warning/40 bg-warning/10 text-warning" },
  in_review: { label: "در حال بررسی", cls: "border-info/40 bg-info/10 text-info" },
  approved: { label: "تایید شده", cls: "border-success/40 bg-success/10 text-success" },
  rejected: { label: "رد شده", cls: "border-critical/40 bg-critical/10 text-critical" },
};

export function StatusBadge({ value }: { value: ViolationStatus }) {
  const c = statusMap[value];
  return <TokenBadge className={c.cls}>{c.label}</TokenBadge>;
}

const reasonMap: Record<SuspiciousReason, string> = {
  suspicious_user: "کاربر مظنون",
  keyword_match: "تطابق کلیدواژه",
  rule_match: "Rule Match",
  high_risk_user: "High Risk User",
};

export function ReasonBadge({ value }: { value: SuspiciousReason }) {
  return (
    <TokenBadge className="border-warning/40 bg-warning/10 text-warning">
      {reasonMap[value]}
    </TokenBadge>
  );
}
