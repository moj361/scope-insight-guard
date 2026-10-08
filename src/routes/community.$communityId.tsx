import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Boxes, Clock, Globe2, Hash, LayoutDashboard, Layers, Newspaper, Radar, Radio, Tags, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { communityProfileService as svc, CommunityNotFoundError } from "@/lib/services/communityProfile";
import { OverviewTab } from "@/components/community-profile/OverviewTab";
import { ContentTab, PeopleTab, SegmentsTab, TopicsTab } from "@/components/community-profile/ListTabs";
import { SourcesTab } from "@/components/community-profile/SourcesTab";
import { ErrorState, PLATFORM } from "@/components/community-profile/shared";

// Demo route: like the Situation Room, it renders without the login guard.
export const Route = createFileRoute("/community/$communityId")({
  head: () => ({
    meta: [
      { title: "پروفایل جامعه · Community Profile" },
      { name: "description", content: "Community intelligence profile: segments, people, topics, content and sources." },
      { property: "og:title", content: "پروفایل جامعه · Community Profile" },
      { property: "og:description", content: "Community intelligence profile: segments, people, topics, content and sources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityProfilePage,
});

const TABS = [
  { id: "overview", label: "نمای کلی", en: "Overview", icon: LayoutDashboard },
  { id: "communities", label: "جوامع", en: "Communities", icon: Boxes },
  { id: "people", label: "افراد", en: "People", icon: Users },
  { id: "topics", label: "موضوعات", en: "Topics", icon: Tags },
  { id: "content", label: "محتوا", en: "Content", icon: Newspaper },
  { id: "sources", label: "منابع", en: "Sources", icon: Radio },
] as const;
type TabId = (typeof TABS)[number]["id"];

function CommunityProfilePage() {
  const { communityId } = Route.useParams();
  const [tab, setTab] = useState<TabId>("overview");
  const [segment, setSegment] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["community", communityId, "profile"], queryFn: () => svc.getCommunityProfile(communityId), retry: (n, e) => !(e instanceof CommunityNotFoundError) && n < 2 });
  const c = q.data?.community;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-panel-header/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Radar className="size-4" /></div>
            <nav className="flex items-center gap-1.5 text-[12px]" aria-label="Breadcrumb">
              <Link to="/situation-room" className="text-muted-foreground hover:text-foreground">سپهر فضای مجازی</Link>
              <span className="text-muted-foreground">›</span>
              <span className="font-semibold">{c?.name ?? communityId}</span>
              <span className="text-muted-foreground">›</span>
              <span className="text-muted-foreground">پروفایل جامعه</span>
            </nav>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Link to="/situation-room"><ArrowRight className="size-3.5" />بازگشت به چشم‌انداز</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4">
        {q.isError ? (
          q.error instanceof CommunityNotFoundError ? (
            <div className="rounded-lg border border-border bg-panel p-10 text-center text-sm">
              <p>جامعه‌ای با شناسه <code dir="ltr" className="rounded bg-muted px-1">{communityId}</code> یافت نشد.</p>
              <Button asChild size="sm" variant="outline" className="mt-4 text-xs"><Link to="/community/$communityId" params={{ communityId: "farhangian" }}>مشاهده جامعه نمونه «فرهنگیان»</Link></Button>
            </div>
          ) : <div className="rounded-lg border border-border bg-panel"><ErrorState onRetry={() => q.refetch()} /></div>
        ) : !q.data || !c ? (
          <div className="flex flex-col gap-3"><Skeleton className="h-32 w-full" /><div className="grid grid-cols-6 gap-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div><Skeleton className="h-80 w-full" /></div>
        ) : (
          <>
            <section className="rounded-lg border border-border bg-panel p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{c.name}</h1>
                    <span className="text-sm text-muted-foreground" dir="ltr">{c.nameEn}</span>
                  </div>
                  <p className="mt-1.5 max-w-3xl text-[13px] text-muted-foreground">{c.description}</p>
                </div>
                <span className="rounded border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] text-warning">داده نمایشی · Demo data</span>
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                <Meta icon={<Globe2 className="size-3.5" />} label="جغرافیا" value={c.geography} />
                <Meta icon={<Tags className="size-3.5" />} label="موضوعات اصلی" value={c.mainTopics.join("، ")} />
                <Meta icon={<Layers className="size-3.5" />} label="پلتفرم‌ها" value={c.platforms.map((p) => PLATFORM[p]).join(" · ")} ltr />
                <Meta icon={<Clock className="size-3.5" />} label="آخرین به‌روزرسانی" value={new Date(c.updatedAt).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" })} />
                <Meta icon={<Hash className="size-3.5" />} label="شناسه" value={c.id} ltr />
              </dl>
            </section>

            <div className="sticky top-[53px] z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur" role="tablist" aria-label="Community profile sections">
              <div className="flex gap-1 overflow-x-auto">
                {TABS.map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                    className={cn("flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs transition-colors", tab === t.id ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                    <t.icon className="size-3.5" />{t.label}<span className="text-[10px] text-muted-foreground" dir="ltr">{t.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {tab === "overview" && <OverviewTab data={q.data} onGoTab={(t) => setTab(t as TabId)} onOpenSegment={(id) => { setSegment(id); setTab("communities"); }} />}
            {tab === "communities" && <SegmentsTab segments={q.data.segments} selectedId={segment} onSelect={setSegment} />}
            {tab === "people" && <PeopleTab communityId={communityId} />}
            {tab === "topics" && <TopicsTab communityId={communityId} />}
            {tab === "content" && <ContentTab communityId={communityId} />}
            {tab === "sources" && <SourcesTab communityId={communityId} segments={q.data.segments} initialSegment={segment ?? undefined} />}
          </>
        )}
      </main>
    </div>
  );
}

function Meta({ icon, label, value, ltr }: { icon: React.ReactNode; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-primary">{icon}</span>
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="font-medium" dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
