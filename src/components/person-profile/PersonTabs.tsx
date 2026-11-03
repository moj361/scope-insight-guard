import { useMemo, useState } from "react";
import {
  AlertTriangle, BadgeCheck, Briefcase, CheckCircle2, CircleDashed, CircleHelp, Clock, FileText, Gavel, Image as ImageIcon,
  Link2, MessageSquare, Network, ShieldAlert, ShieldQuestion, UserX, Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  ActionStatus, InfluenceLevel, LinkedAccount, MatchStatus, PersonPlatform, PersonProfile, Severity, Verification, Violation, ViolationStatus,
} from "@/lib/services/personProfile";
import { Card, EmptyState, FilterSelect, ago, compact, fa } from "@/components/community-profile/shared";

/* ---------------- shared labels ---------------- */
export const PLAT: Record<PersonPlatform, string> = { telegram: "Telegram", bale: "Bale", instagram: "Instagram", x: "X", linkedin: "LinkedIn" };
export const PLAT_FA: Record<PersonPlatform, string> = { telegram: "تلگرام", bale: "بله", instagram: "اینستاگرام", x: "ایکس", linkedin: "لینکدین" };
const days = (d: number) => (d === 0 ? "امروز" : d === 1 ? "دیروز" : `${fa(d)} روز پیش`);

const MATCH: Record<MatchStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  verified: { label: "تأییدشده", cls: "border-success/40 bg-success/15 text-success", icon: <BadgeCheck className="size-3" /> },
  probable: { label: "تطابق محتمل", cls: "border-info/40 bg-info/15 text-info", icon: <CircleDashed className="size-3" /> },
  possible: { label: "تطابق احتمالی", cls: "border-warning/40 bg-warning/15 text-warning", icon: <CircleHelp className="size-3" /> },
  unverified: { label: "تأییدنشده", cls: "border-border bg-muted text-muted-foreground", icon: <ShieldQuestion className="size-3" /> },
};
export function MatchBadge({ value }: { value: MatchStatus }) {
  const m = MATCH[value];
  return <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", m.cls)}>{m.icon}{m.label}</span>;
}
const VER: Record<Verification, { label: string; cls: string }> = {
  verified: { label: "تأییدشده", cls: "border-success/40 bg-success/15 text-success" },
  needs_verification: { label: "نیازمند تأیید", cls: "border-warning/40 bg-warning/15 text-warning" },
  unverified: { label: "ادعای تأییدنشده", cls: "border-border bg-muted text-muted-foreground" },
};
export function VerBadge({ value }: { value: Verification }) {
  return <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium", VER[value].cls)}>{VER[value].label}</span>;
}
export const INF: Record<InfluenceLevel, { label: string; cls: string }> = {
  very_high: { label: "بسیار زیاد", cls: "text-critical" }, high: { label: "زیاد", cls: "text-high" },
  medium: { label: "متوسط", cls: "text-warning" }, low: { label: "کم", cls: "text-muted-foreground" },
};
const SEV: Record<Severity, { label: string; cls: string }> = {
  critical: { label: "بحرانی", cls: "border-critical/40 bg-critical/15 text-critical" }, high: { label: "بالا", cls: "border-high/40 bg-high/15 text-high" },
  medium: { label: "متوسط", cls: "border-warning/40 bg-warning/15 text-warning" }, low: { label: "پایین", cls: "border-border bg-muted text-muted-foreground" },
};
/** Status wording deliberately separates confirmed from unconfirmed reports. */
const VST: Record<ViolationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  confirmed: { label: "تخلف تأییدشده", cls: "border-critical/40 bg-critical/15 text-critical", icon: <ShieldAlert className="size-3" /> },
  under_review: { label: "در حال بررسی", cls: "border-warning/40 bg-warning/15 text-warning", icon: <Clock className="size-3" /> },
  unconfirmed: { label: "گزارش تأییدنشده", cls: "border-dashed border-muted-foreground/50 bg-muted/50 text-muted-foreground", icon: <CircleHelp className="size-3" /> },
  dismissed: { label: "رد شده", cls: "border-border bg-muted text-muted-foreground line-through", icon: <CircleDashed className="size-3" /> },
};
const AST: Record<ActionStatus, { label: string; cls: string }> = {
  done: { label: "انجام‌شده", cls: "border-success/40 bg-success/15 text-success" },
  in_progress: { label: "در جریان", cls: "border-info/40 bg-info/15 text-info" },
  pending: { label: "در انتظار", cls: "border-warning/40 bg-warning/15 text-warning" },
};
const Pill = ({ cls, children }: { cls: string; children: React.ReactNode }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", cls)}>{children}</span>
);

export function AccountAvatar({ acc, size = 40 }: { acc: LinkedAccount; size?: number }) {
  return acc.image ? (
    <img src={acc.image} alt={`تصویر حساب ${acc.handle}`} width={size} height={size} loading="lazy" className="shrink-0 rounded-full border border-border object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="flex shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-muted text-muted-foreground" style={{ width: size, height: size }} aria-label="بدون تصویر">
      <ImageIcon className="size-4" />
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  const tone = value >= 85 ? "bg-success" : value >= 60 ? "bg-info" : value >= 45 ? "bg-warning" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", tone)} style={{ width: `${value}%` }} /></div>
      <span className="num-fa text-[10px] text-muted-foreground">٪{fa(value)}</span>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-[10px] text-muted-foreground">
      راهنمای اعتبار: <MatchBadge value="verified" /> واقعیت تأییدشده <MatchBadge value="probable" /> <MatchBadge value="possible" /> تطابق احتمالی <VerBadge value="unverified" /> ادعای تأییدنشده
    </div>
  );
}

/* ---------------- Account dialog ---------------- */
export function AccountDialog({ acc, person, onClose }: { acc: LinkedAccount | null; person: PersonProfile; onClose: () => void }) {
  return (
    <Dialog open={!!acc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {acc && (
          <>
            <DialogHeader className="text-start">
              <div className="flex items-center gap-3">
                <AccountAvatar acc={acc} size={56} />
                <div>
                  <DialogTitle className="text-base">{acc.displayName}</DialogTitle>
                  <DialogDescription dir="ltr" className="text-start">{acc.handle} · {PLAT[acc.platform]}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex items-center gap-3"><MatchBadge value={acc.match} /><Confidence value={acc.confidence} /></div>
            {acc.bio && <p className="text-xs text-muted-foreground">{acc.bio}</p>}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[["دنبال‌کننده", compact(acc.followers)], ["انتشار", compact(acc.posts)], ["ایجاد", fa(acc.createdYear)]].map(([l, v]) => (
                <div key={l} className="rounded-md border border-border bg-background/40 p-2"><div className="num-fa font-semibold">{v}</div><div className="text-[10px] text-muted-foreground">{l}</div></div>
              ))}
            </div>
            <div>
              <div className="mb-1 text-[11px] font-medium">شواهد تطابق با هویت</div>
              <ul className="list-inside list-disc text-[11px] text-muted-foreground">{acc.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
            <p className="rounded-md border border-dashed border-border p-2 text-[10px] text-muted-foreground">
              تصویر این حساب، تصویر پروفایل خودِ حساب است و {person.primaryImage ? "جدا از تصویر هویتی اصلی فرد نمایش داده می‌شود" : "هیچ تصویر هویتی تأییدشده‌ای برای این فرد وجود ندارد"}.
              آخرین فعالیت: {ago(acc.lastActiveMin)}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ViolationDialog({ v, person, onClose }: { v: Violation | null; person: PersonProfile; onClose: () => void }) {
  const acc = person.accounts.find((a) => a.id === v?.accountId);
  const actions = person.actions.filter((a) => a.violationId === v?.id);
  return (
    <Dialog open={!!v} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {v && (
          <>
            <DialogHeader className="text-start">
              <DialogTitle className="text-base">{v.title}</DialogTitle>
              <DialogDescription className="text-start">{v.category} · {days(v.daysAgo)}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-2"><Pill cls={VST[v.status].cls}>{VST[v.status].icon}{VST[v.status].label}</Pill><Pill cls={SEV[v.severity].cls}>شدت: {SEV[v.severity].label}</Pill></div>
            {v.status !== "confirmed" && (
              <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-[11px] text-warning">این مورد تخلف تأییدشده نیست و نباید به‌عنوان سابقه قطعی فرد تلقی شود.</p>
            )}
            <p className="text-xs">{v.summary}</p>
            <div className="text-[11px]"><span className="text-muted-foreground">اطمینان انتساب: </span><Confidence value={v.attributionConfidence} /></div>
            {acc && <div className="flex items-center gap-2 text-[11px]"><AccountAvatar acc={acc} size={24} /><span dir="ltr">{acc.handle}</span><MatchBadge value={acc.match} /></div>}
            <div>
              <div className="mb-1 text-[11px] font-medium">شواهد</div>
              <ul className="flex flex-col gap-1">{v.evidence.map((e) => <li key={e.label} className="flex items-center justify-between rounded border border-border px-2 py-1 text-[11px]"><span className="flex items-center gap-1.5"><FileText className="size-3 text-primary" />{e.label}</span><span className="text-muted-foreground">{days(e.daysAgo)}</span></li>)}</ul>
            </div>
            {actions.length > 0 && (
              <div>
                <div className="mb-1 text-[11px] font-medium">اقدامات مرتبط</div>
                <ul className="flex flex-col gap-1">{actions.map((a) => <li key={a.id} className="flex items-center justify-between text-[11px]"><span>{a.title}</span><Pill cls={AST[a.status].cls}>{AST[a.status].label}</Pill></li>)}</ul>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Tabs ---------------- */
export function OverviewTab({ p, go }: { p: PersonProfile; go: (t: string) => void }) {
  const [acc, setAcc] = useState<LinkedAccount | null>(null);
  const [vio, setVio] = useState<Violation | null>(null);
  const confirmed = p.violations.filter((v) => v.status === "confirmed").length;
  const kpis = [
    ["حساب‌های مرتبط", fa(p.metrics.accounts)], ["جوامع", fa(p.metrics.communities)], ["انتشار ۳۰ روز", fa(p.metrics.posts30d)],
    ["مخاطب کل", compact(p.metrics.audience)], ["تخلف تأییدشده", fa(confirmed)], ["اقدام باز", fa(p.actions.filter((a) => a.status !== "done").length)],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(([l, v]) => (
          <div key={l} className="rounded-lg border border-border bg-panel px-3 py-2.5"><div className="text-[11px] text-muted-foreground">{l}</div><div className="num-fa mt-1 text-xl font-semibold">{v}</div></div>
        ))}
      </div>
      <Card title="خلاصه تحلیلی" icon={<FileText className="size-4" />}><p className="text-[13px] leading-7">{p.summary}</p></Card>
      <div className="grid gap-3 xl:grid-cols-2">
        <Card title="حساب‌ها" icon={<Link2 className="size-4" />} actions={<button type="button" onClick={() => go("identity")} className="text-[11px] text-primary hover:underline">همه حساب‌ها</button>}>
          <ul className="flex flex-col gap-1.5">
            {p.accounts.map((a) => (
              <li key={a.id}><button type="button" onClick={() => setAcc(a)} className="flex w-full items-center gap-3 rounded-md border border-border bg-background/40 px-2 py-1.5 text-start hover:border-primary/50">
                <AccountAvatar acc={a} size={32} />
                <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{PLAT_FA[a.platform]}</span><span className="block truncate text-[10px] text-muted-foreground" dir="ltr">{a.handle}</span></span>
                <MatchBadge value={a.match} />
              </button></li>
            ))}
          </ul>
        </Card>
        <Card title="سمت‌ها" icon={<Briefcase className="size-4" />} actions={<button type="button" onClick={() => go("positions")} className="text-[11px] text-primary hover:underline">جزئیات</button>}>
          {p.positions.length === 0 ? <NoPosition /> : (
            <ul className="flex flex-col gap-1.5">
              {p.positions.slice(0, 3).map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
                  <span><span className="font-medium">{x.title}</span><span className="block text-[10px] text-muted-foreground">{x.org} · {x.current ? "فعلی" : "سابق"}</span></span>
                  <VerBadge value={x.verification} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="فعالیت اخیر" icon={<MessageSquare className="size-4" />}>
          <ul className="flex flex-col gap-2">{p.content.slice(0, 3).map((c) => <li key={c.id} className="text-xs"><div>{c.text}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{PLAT_FA[c.platform]} · {days(c.daysAgo)} · {c.topic}</div></li>)}</ul>
        </Card>
        <Card title="تخلفات و اقدامات" icon={<Gavel className="size-4" />}>
          {p.violations.length === 0 ? <p className="text-xs text-muted-foreground">موردی ثبت نشده است.</p> : (
            <ul className="flex flex-col gap-1.5">
              {p.violations.map((v) => (
                <li key={v.id}><button type="button" onClick={() => setVio(v)} className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-start text-xs hover:border-primary/50">
                  <span>{v.title}</span><Pill cls={VST[v.status].cls}>{VST[v.status].icon}{VST[v.status].label}</Pill>
                </button></li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            {p.actions.map((a) => <Pill key={a.id} cls={AST[a.status].cls}>{a.title} · {AST[a.status].label}</Pill>)}
          </div>
        </Card>
      </div>
      <AccountDialog acc={acc} person={p} onClose={() => setAcc(null)} />
      <ViolationDialog v={vio} person={p} onClose={() => setVio(null)} />
    </div>
  );
}

function NoPosition() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center text-xs text-muted-foreground">
      <UserX className="size-6" />
      هیچ سمت رسمی شناخته‌شده‌ای برای این فرد ثبت نشده است.
      <span className="text-[10px]">نقش‌های مدیریتی در گروه‌ها و کانال‌ها سمت رسمی محسوب نمی‌شوند (تب «شبکه و عضویت‌ها»).</span>
    </div>
  );
}

export function IdentityTab({ p }: { p: PersonProfile }) {
  const [acc, setAcc] = useState<LinkedAccount | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <Legend />
      <Card title="هویت اصلی · Primary Identity" icon={<BadgeCheck className="size-4" />}>
        {p.identityStatus === "anonymous" ? (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground"><UserX className="size-8" /></div>
            <div className="text-muted-foreground"><div className="font-medium text-foreground">هویت واقعی ناشناخته</div>هیچ تصویر یا نام هویتی تأییدشده‌ای موجود نیست. حساب‌های زیر فقط بر اساس الگوی رفتاری به این پروفایل نسبت داده شده‌اند.</div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs">
            <img src={p.primaryImage} alt={`تصویر هویتی ${p.displayName}`} width={80} height={80} className={cn("size-20 rounded-lg object-cover", p.identityStatus === "verified" ? "ring-2 ring-success" : "ring-2 ring-dashed ring-warning")} />
            <div>
              <div className="text-sm font-semibold">{p.displayName}</div>
              <div className="mt-1 text-muted-foreground">{p.primaryImageNote}</div>
              <div className="mt-2"><Confidence value={p.identityConfidence} /></div>
            </div>
          </div>
        )}
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {p.accounts.map((a) => (
          <button key={a.id} type="button" onClick={() => setAcc(a)} className="rounded-lg border border-border bg-panel p-3 text-start transition-colors hover:border-primary/50">
            <div className="flex items-center gap-3">
              <AccountAvatar acc={a} size={44} />
              <div className="min-w-0 flex-1"><div className="text-xs font-semibold">{PLAT_FA[a.platform]} <span className="text-[10px] font-normal text-muted-foreground">· {PLAT[a.platform]}</span></div><div className="truncate text-[11px] text-muted-foreground" dir="ltr">{a.handle}</div></div>
            </div>
            <div className="mt-3 flex items-center justify-between"><MatchBadge value={a.match} /><Confidence value={a.confidence} /></div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span className="num-fa">{compact(a.followers)} دنبال‌کننده</span><span>{ago(a.lastActiveMin)}</span></div>
          </button>
        ))}
      </div>
      <AccountDialog acc={acc} person={p} onClose={() => setAcc(null)} />
    </div>
  );
}

export function PositionsTab({ p }: { p: PersonProfile }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-muted-foreground">این بخش فقط سمت‌ها و وابستگی‌های سازمانی را نشان می‌دهد. نقش مدیریت آنلاین (ادمین گروه/کانال) در تب «شبکه و عضویت‌ها» آمده است.</p>
      <Card title="سمت‌ها و وابستگی‌ها · Positions & Affiliations" icon={<Briefcase className="size-4" />}>
        {p.positions.length === 0 ? <NoPosition /> : (
          <ol className="relative flex flex-col gap-3 border-s border-border ps-4">
            {p.positions.map((x) => (
              <li key={x.id} className="relative">
                <span className={cn("absolute -start-[21px] top-1.5 size-2.5 rounded-full", x.current ? "bg-primary" : "bg-muted-foreground")} />
                <div className={cn("rounded-md border bg-background/40 p-3", x.verification === "verified" ? "border-border" : "border-dashed border-warning/50")}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><span className="text-[13px] font-semibold">{x.title}</span> <span className="text-[10px] text-muted-foreground">{x.current ? "· فعلی" : "· سابق"}</span></div>
                    <VerBadge value={x.verification} />
                  </div>
                  <div className="mt-1 text-xs">{x.org}{x.unit && <span className="text-muted-foreground"> · {x.unit}</span>}</div>
                  <div className="num-fa mt-0.5 text-[10px] text-muted-foreground">{x.period}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {x.sources.map((s) => (
                      <span key={s.label} className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {s.kind === "official" ? "منبع رسمی" : s.kind === "media" ? "رسانه" : s.kind === "self_declared" ? "اظهار شخصی" : "تحلیلگر"}: {s.label} ({s.date})
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

export function InfluenceTab({ p }: { p: PersonProfile }) {
  const items = [
    ["اهمیت سازمانی", "Organizational", p.influence.organizational],
    ["مخاطب", "Audience", p.influence.audience],
    ["فعالیت", "Activity", p.influence.activity],
    ["اثرگذاری مشاهده‌شده", "Observed influence", p.influence.observed],
  ] as const;
  const byPlatform = p.accounts.map((a) => ({ k: a.id, label: PLAT_FA[a.platform], v: a.followers }));
  const max = Math.max(...byPlatform.map((x) => x.v));
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-muted-foreground">این شاخص‌ها مستقل از هم‌اند و با هم جمع نمی‌شوند؛ مثلاً مخاطب زیاد لزوماً به معنای اهمیت سازمانی نیست.</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([fa_, en, x]) => (
          <div key={en} className="rounded-lg border border-border bg-panel p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>{fa_}</span><span dir="ltr">{en}</span></div>
            <div className="mt-2 flex items-baseline gap-2"><span className="num-fa text-2xl font-semibold">{fa(x.score)}</span><span className={cn("text-xs font-medium", INF[x.level].cls)}>{INF[x.level].label}</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${x.score}%` }} /></div>
            <p className="mt-2 text-[11px] text-muted-foreground">{x.note}</p>
          </div>
        ))}
      </div>
      <Card title="مخاطب به تفکیک حساب" icon={<Users className="size-4" />}>
        <ul className="flex flex-col gap-2">{byPlatform.map((x) => (
          <li key={x.k} className="grid grid-cols-[80px_1fr_60px] items-center gap-2 text-xs"><span>{x.label}</span><span className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-chart-1" style={{ width: `${(x.v / max) * 100}%` }} /></span><span className="num-fa text-end">{compact(x.v)}</span></li>
        ))}</ul>
      </Card>
    </div>
  );
}

export function ActivityTab({ p }: { p: PersonProfile }) {
  const [platform, setPlatform] = useState<string | undefined>();
  const [range, setRange] = useState<string | undefined>();
  const rows = useMemo(() => p.content.filter((c) => (!platform || c.platform === platform) && (!range || c.daysAgo <= Number(range))), [p, platform, range]);
  const platforms = [...new Set(p.accounts.map((a) => a.platform))].map((x) => ({ value: x, label: PLAT_FA[x] }));
  return (
    <Card title="فعالیت و محتوا · Activity & Content" icon={<MessageSquare className="size-4" />}
      actions={<div className="flex flex-wrap gap-2">
        <FilterSelect label="پلتفرم" value={platform} onChange={setPlatform} options={platforms} />
        <FilterSelect label="بازه" value={range} onChange={setRange} options={[{ value: "1", label: "۲۴ ساعت" }, { value: "7", label: "۷ روز" }, { value: "30", label: "۳۰ روز" }]} />
      </div>}>
      {rows.length === 0 ? <EmptyState filtered onClear={() => { setPlatform(undefined); setRange(undefined); }} /> : (
        <ul className="flex flex-col gap-2">
          {rows.map((c) => {
            const acc = p.accounts.find((a) => a.id === c.accountId)!;
            return (
              <li key={c.id} className={cn("rounded-md border bg-background/40 p-3", c.flagged ? "border-s-4 border-warning/40 border-s-warning" : "border-border")}>
                <div className="flex items-center gap-2 text-[11px]">
                  <AccountAvatar acc={acc} size={22} /><span dir="ltr" className="text-muted-foreground">{acc.handle}</span>
                  <span className="text-muted-foreground">· {PLAT_FA[c.platform]} · {c.kind === "post" ? "پست" : c.kind === "message" ? "پیام" : "نظر"} · {days(c.daysAgo)}</span>
                  {c.flagged && <Pill cls="border-warning/40 bg-warning/10 text-warning"><AlertTriangle className="size-3" />علامت‌گذاری برای بررسی</Pill>}
                </div>
                <p className="mt-1.5 text-[13px] leading-6">{c.text}</p>
                <div className="num-fa mt-1 flex gap-3 text-[10px] text-muted-foreground"><span>موضوع: {c.topic}</span><span>تعامل {compact(c.engagement)}</span><span>بازدید {compact(c.views)}</span></div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

const ROLE_FA = { owner: "مالک", admin: "ادمین", member: "عضو" } as const;
export function NetworkTab({ p }: { p: PersonProfile }) {
  return (
    <div className="grid gap-3 xl:grid-cols-12">
      <Card title="گروه‌ها، کانال‌ها و عضویت‌ها" icon={<Network className="size-4" />} className="xl:col-span-8" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-muted-foreground"><tr className="border-b border-border">{["نام", "پلتفرم", "نوع", "نقش آنلاین", "اعضا", "از سال", "جامعه"].map((h) => <th key={h} className="px-3 py-2 text-start font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {p.memberships.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2">{PLAT_FA[m.platform]}</td>
                  <td className="px-3 py-2">{m.type === "group" ? "گروه" : "کانال"}</td>
                  <td className="px-3 py-2"><Pill cls={m.role === "member" ? "border-border bg-muted text-muted-foreground" : "border-primary/40 bg-primary/10 text-primary"}>{ROLE_FA[m.role]}</Pill></td>
                  <td className="num-fa px-3 py-2">{compact(m.members)}</td>
                  <td className="num-fa px-3 py-2">{fa(m.sinceYear)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{m.communityName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="روابط" icon={<Users className="size-4" />} className="xl:col-span-4">
        <ul className="flex flex-col gap-2">
          {p.relationships.map((r) => (
            <li key={r.id} className="rounded-md border border-border bg-background/40 p-2 text-xs">
              <div className="flex items-center justify-between"><span className="font-medium">{r.name}</span>{r.verified ? <MatchBadge value="verified" /> : <MatchBadge value="possible" />}</div>
              <div className="mt-0.5 text-[11px]">{r.relation} · <span className="text-muted-foreground">قدرت: {r.strength === "strong" ? "قوی" : r.strength === "medium" ? "متوسط" : "ضعیف"}</span></div>
              <div className="text-[10px] text-muted-foreground">{r.basis}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function ViolationsTab({ p }: { p: PersonProfile }) {
  const [vio, setVio] = useState<Violation | null>(null);
  const [status, setStatus] = useState<string | undefined>();
  const rows = p.violations.filter((v) => !status || v.status === status);
  return (
    <Card title="سوابق تخلف · Violations" icon={<ShieldAlert className="size-4" />}
      actions={<FilterSelect label="وضعیت" value={status} onChange={setStatus} options={(Object.keys(VST) as ViolationStatus[]).map((k) => ({ value: k, label: VST[k].label }))} />}>
      {rows.length === 0 ? <EmptyState filtered={!!status} onClear={() => setStatus(undefined)} /> : (
        <ul className="flex flex-col gap-2">
          {rows.map((v) => (
            <li key={v.id}>
              <button type="button" onClick={() => setVio(v)} className={cn("w-full rounded-md border bg-background/40 p-3 text-start hover:border-primary/50", v.status === "confirmed" ? "border-s-4 border-critical/30 border-s-critical" : v.status === "unconfirmed" ? "border-dashed border-border" : "border-border")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{v.title}</span>
                  <span className="flex gap-1.5"><Pill cls={VST[v.status].cls}>{VST[v.status].icon}{VST[v.status].label}</Pill><Pill cls={SEV[v.severity].cls}>{SEV[v.severity].label}</Pill></span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{v.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
                  <span>{v.category}</span><span>{days(v.daysAgo)}</span><span className="num-fa">{fa(v.evidence.length)} شاهد</span>
                  <span className="flex items-center gap-1">اطمینان انتساب <Confidence value={v.attributionConfidence} /></span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <ViolationDialog v={vio} person={p} onClose={() => setVio(null)} />
    </Card>
  );
}

const ACT_TYPE = { notice: "تذکر", sms: "پیامک", monitor: "پایش", restrict: "محدودسازی", referral: "ارجاع", verify: "صحت‌سنجی" } as const;
export function ActionsTab({ p }: { p: PersonProfile }) {
  const vt = (id?: string) => p.violations.find((v) => v.id === id);
  return (
    <div className="grid gap-3 xl:grid-cols-12">
      <Card title="اقدامات" icon={<Gavel className="size-4" />} className="xl:col-span-7" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-muted-foreground"><tr className="border-b border-border">{["اقدام", "نوع", "وضعیت", "تخلف مرتبط", "نتیجه", "مسئول", "زمان"].map((h) => <th key={h} className="px-3 py-2 text-start font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {p.actions.map((a) => {
                const v = vt(a.violationId);
                return (
                  <tr key={a.id} className="border-b border-border/60">
                    <td className="px-3 py-2 font-medium">{a.title}</td>
                    <td className="px-3 py-2">{ACT_TYPE[a.type]}</td>
                    <td className="px-3 py-2"><Pill cls={AST[a.status].cls}>{AST[a.status].label}</Pill></td>
                    <td className="px-3 py-2 text-[11px]">{v ? <span>{v.title} <span className="text-muted-foreground">({VST[v.status].label})</span></span> : "—"}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{a.result ?? "—"}</td>
                    <td className="px-3 py-2 text-[11px]">{a.by}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{days(a.daysAgo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="flex flex-col gap-3 xl:col-span-5">
        <Card title="شواهد هویتی" icon={<BadgeCheck className="size-4" />}>
          <ul className="flex flex-col gap-1.5">
            {p.identityEvidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1.5 text-[11px]">
                <span>{e.label}<span className="block text-[10px] text-muted-foreground">{e.kind} · {days(e.daysAgo)}</span></span>
                <Pill cls={e.strength === "strong" ? "border-success/40 bg-success/15 text-success" : e.strength === "medium" ? "border-info/40 bg-info/15 text-info" : "border-border bg-muted text-muted-foreground"}>{e.strength === "strong" ? "قوی" : e.strength === "medium" ? "متوسط" : "ضعیف"}</Pill>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="تاریخچه" icon={<Clock className="size-4" />}>
          <ol className="flex flex-col gap-2 border-s border-border ps-3">
            {p.history.map((h) => (
              <li key={h.id} className="relative text-[11px]">
                <span className="absolute -start-[17px] top-1 size-2 rounded-full bg-primary" />
                {h.text}<span className="block text-[10px] text-muted-foreground">{days(h.daysAgo)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

export { CheckCircle2 };
