import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, ArrowRight, BadgeCheck, Briefcase, Clock, Gavel, Gauge, LayoutDashboard, Link2, MessageSquare, Network, Radar, ShieldAlert, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { personProfileService as svc, PersonNotFoundError } from "@/lib/services/personProfile";
import { ErrorState, ago, fa } from "@/components/community-profile/shared";
import {
  ActionsTab, ActivityTab, IdentityTab, INF, InfluenceTab, NetworkTab, OverviewTab, PositionsTab, VerBadge, ViolationsTab,
} from "@/components/person-profile/PersonTabs";

// Demo route: renders without the login guard, like the Community Profile.
export const Route = createFileRoute("/person/$personId")({
  head: () => ({
    meta: [
      { title: "پروفایل فرد · Person Profile" },
      { name: "description", content: "Person intelligence profile: identity, accounts, positions, influence, activity, violations and actions." },
      { property: "og:title", content: "پروفایل فرد · Person Profile" },
      { property: "og:description", content: "Person intelligence profile: identity, accounts, positions, influence, activity, violations and actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PersonProfilePage,
});

const TABS = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard },
  { id: "identity", label: "هویت و حساب‌ها", icon: Link2 },
  { id: "positions", label: "سمت‌ها و وابستگی‌ها", icon: Briefcase },
  { id: "influence", label: "اثرگذاری", icon: Gauge },
  { id: "activity", label: "فعالیت و محتوا", icon: MessageSquare },
  { id: "network", label: "شبکه و عضویت‌ها", icon: Network },
  { id: "violations", label: "تخلفات", icon: ShieldAlert },
  { id: "actions", label: "اقدامات و شواهد", icon: Gavel },
] as const;
type TabId = (typeof TABS)[number]["id"];

const ID_STATUS = {
  verified: { label: "هویت تأییدشده", cls: "border-success/40 bg-success/15 text-success" },
  partial: { label: "شناسایی جزئی", cls: "border-warning/40 bg-warning/15 text-warning" },
  anonymous: { label: "ناشناس", cls: "border-border bg-muted text-muted-foreground" },
};

function PersonProfilePage() {
  const { personId } = Route.useParams();
  const [tab, setTab] = useState<TabId>("overview");
  const q = useQuery({ queryKey: ["person", personId], queryFn: () => svc.getPersonProfile(personId), retry: (n, e) => !(e instanceof PersonNotFoundError) && n < 2 });
  const p = q.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-panel-header/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Radar className="size-4" /></div>
            <nav className="flex items-center gap-1.5 text-[12px]" aria-label="Breadcrumb">
              <Link to="/situation-room" className="text-muted-foreground hover:text-foreground">سپهر فضای مجازی</Link>
              <span className="text-muted-foreground">›</span>
              <Link to="/community/$communityId" params={{ communityId: p?.communityId ?? "farhangian" }} className="text-muted-foreground hover:text-foreground">{p?.communityName ?? "جامعه"}</Link>
              <span className="text-muted-foreground">›</span>
              <span className="font-semibold">{p?.displayName ?? personId}</span>
            </nav>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Link to="/community/$communityId" params={{ communityId: p?.communityId ?? "farhangian" }}><ArrowRight className="size-3.5" />بازگشت به پروفایل جامعه</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4">
        {q.isError ? (
          q.error instanceof PersonNotFoundError ? (
            <div className="rounded-lg border border-border bg-panel p-10 text-center text-sm">
              فردی با شناسه <code dir="ltr" className="rounded bg-muted px-1">{personId}</code> یافت نشد.
              <div className="mt-4"><Button asChild size="sm" variant="outline" className="text-xs"><Link to="/community/$communityId" params={{ communityId: "farhangian" }}>بازگشت به جامعه فرهنگیان</Link></Button></div>
            </div>
          ) : <div className="rounded-lg border border-border bg-panel"><ErrorState onRetry={() => q.refetch()} /></div>
        ) : !p ? (
          <div className="flex flex-col gap-3"><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>
        ) : (
          <>
            <section className="rounded-lg border border-border bg-panel p-4 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  {p.primaryImage ? (
                    <img src={p.primaryImage} alt={`تصویر هویتی ${p.displayName}`} width={112} height={112}
                      className={cn("size-28 rounded-lg object-cover", p.identityStatus === "verified" ? "ring-2 ring-success" : "opacity-90 ring-2 ring-warning")} />
                  ) : (
                    <div className="flex size-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground"><UserX className="size-10" /></div>
                  )}
                  <span className="text-[9px] text-muted-foreground">{p.primaryImage ? (p.identityStatus === "verified" ? "تصویر هویتی تأییدشده" : "تصویر هویتی احتمالی") : "بدون تصویر هویتی"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{p.displayName}</h1>
                    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", ID_STATUS[p.identityStatus].cls)}>
                      {p.identityStatus === "verified" && <BadgeCheck className="size-3.5" />}{ID_STATUS[p.identityStatus].label}
                      {p.identityStatus !== "anonymous" && <span className="num-fa">· ٪{fa(p.identityConfidence)}</span>}
                    </span>
                    <code dir="ltr" className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.personCode}</code>
                  </div>
                  {p.headlinePosition ? (
                    <div className={cn("mt-2 inline-flex flex-wrap items-center gap-2 rounded-md border px-3 py-1.5", p.headlinePosition.verification === "verified" ? "border-primary/50 bg-primary/10" : "border-dashed border-warning/50 bg-warning/5")}>
                      <Briefcase className="size-4 text-primary" />
                      <span className="text-sm font-semibold">{p.headlinePosition.title}</span>
                      <span className="text-xs text-muted-foreground">{p.headlinePosition.org}</span>
                      <VerBadge value={p.headlinePosition.verification} />
                    </div>
                  ) : (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"><Briefcase className="size-4" />سمت رسمی شناخته‌شده‌ای ندارد</div>
                  )}
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                    <div className="flex items-center gap-1.5"><Gauge className="size-3.5 text-primary" /><dt className="text-muted-foreground">سطح اثرگذاری:</dt><dd className={cn("font-semibold", INF[p.influenceLevel].cls)}>{INF[p.influenceLevel].label}</dd></div>
                    <div className="flex items-center gap-1.5"><Link2 className="size-3.5 text-primary" /><dt className="text-muted-foreground">حساب‌های متصل:</dt><dd className="num-fa font-semibold">{fa(p.accounts.length)}</dd></div>
                    <div className="flex items-center gap-1.5"><Clock className="size-3.5 text-primary" /><dt className="text-muted-foreground">آخرین فعالیت:</dt><dd className="font-semibold">{ago(p.lastActivityMin)}</dd></div>
                    <div className="flex items-center gap-1.5"><Activity className="size-3.5 text-primary" /><dt className="text-muted-foreground">استان:</dt><dd className="font-semibold">{p.province}</dd></div>
                  </dl>
                </div>
                <span className="rounded border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] text-warning">داده نمایشی · افراد ساختگی</span>
              </div>
            </section>

            <div className="sticky top-[53px] z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur" role="tablist" aria-label="Person profile sections">
              <div className="flex gap-1 overflow-x-auto">
                {TABS.map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                    className={cn("flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs transition-colors", tab === t.id ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                    <t.icon className="size-3.5" />{t.label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "overview" && <OverviewTab p={p} go={(t) => setTab(t as TabId)} />}
            {tab === "identity" && <IdentityTab p={p} />}
            {tab === "positions" && <PositionsTab p={p} />}
            {tab === "influence" && <InfluenceTab p={p} />}
            {tab === "activity" && <ActivityTab p={p} />}
            {tab === "network" && <NetworkTab p={p} />}
            {tab === "violations" && <ViolationsTab p={p} />}
            {tab === "actions" && <ActionsTab p={p} />}
          </>
        )}
      </main>
    </div>
  );
}
