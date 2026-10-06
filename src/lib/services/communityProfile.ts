/**
 * Community Profile service layer.
 * Mock-backed today. Each method mirrors a future FastAPI endpoint; when ready,
 * replace the body with `authFetch(apiUrl(...))` (existing client in ./auth)
 * and keep the return types — the UI does not change.
 */
import {
  MOCK_PROFILES,
  getMockContent,
  getMockPeople,
  getMockSources,
  type ContentItem,
  type DynamicsMetric,
  type GeoPresence,
  type Level,
  type Person,
  type PersonRole,
  type ProfilePlatform,
  type Source,
  type SourceType,
} from "@/data/communityProfile.mock";
import { MOCK_PROVINCES } from "@/data/situationRoom.mock";

export type * from "@/data/communityProfile.mock";

export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
export type SortDir = "asc" | "desc";

export class CommunityNotFoundError extends Error {
  constructor(id: string) { super(`Community not found: ${id}`); this.name = "CommunityNotFoundError"; }
}

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const profileOf = (id: string) => {
  const p = MOCK_PROFILES[id];
  if (!p) throw new CommunityNotFoundError(id);
  return p;
};
function paginate<T>(rows: T[], page: number, pageSize: number): Page<T> {
  const p = Math.max(1, page);
  return { items: rows.slice((p - 1) * pageSize, p * pageSize), total: rows.length, page: p, pageSize };
}
function sortBy<T>(rows: T[], key: keyof T | undefined, dir: SortDir) {
  if (!key) return rows;
  const m = dir === "asc" ? 1 : -1;
  const lv: Record<string, number> = { low: 0, medium: 1, high: 2 };
  return [...rows].sort((a, b) => {
    const x = a[key] as unknown, y = b[key] as unknown;
    if (typeof x === "number" && typeof y === "number") return (x - y) * m;
    if (typeof x === "string" && typeof y === "string") {
      if (x in lv && y in lv) return (lv[x] - lv[y]) * m;
      return x.localeCompare(y, "fa") * m;
    }
    return 0;
  });
}
const provinceName = (id: string) => MOCK_PROVINCES.find((p) => p.id === id)?.name ?? id;

/* ---------- Filters (mirror future query params) ---------- */
export interface SourceFilters {
  search?: string; platform?: ProfilePlatform; type?: SourceType; segment?: string;
  province?: string; city?: string; activity?: Level; growth?: "growing" | "declining";
  topic?: string; size?: "small" | "medium" | "large";
  sort?: keyof Source; dir?: SortDir; page: number; pageSize: number;
}
export interface PeopleFilters {
  search?: string; platform?: ProfilePlatform; role?: PersonRole; province?: string;
  topic?: string; activity?: Level; reach?: "lt10k" | "10k-100k" | "gt100k";
  sort?: keyof Person; dir?: SortDir; page: number; pageSize: number;
}
export type ContentView = "trending" | "important" | "latest";
export interface ContentFilters { view: ContentView; platform?: ProfilePlatform; topic?: string; page: number; pageSize: number }

export const communityProfileService = {
  /** GET /api/v1/communities/{id}/profile */
  async getCommunityProfile(communityId: string) {
    await delay();
    const p = profileOf(communityId);
    const sources = getMockSources();
    const counts: Record<string, { n: number; g: number }> = {};
    for (const s of sources) {
      const c = (counts[s.provinceId] ??= { n: 0, g: 0 });
      c.n++; c.g += s.growth;
    }
    const max = Math.max(...Object.values(counts).map((c) => c.n));
    const geography: GeoPresence[] = Object.entries(counts)
      .map(([provinceId, c]) => ({ provinceId, name: provinceName(provinceId), sources: c.n, intensity: c.n / max, growth: Math.round((c.g / c.n) * 10) / 10 }))
      .sort((a, b) => b.sources - a.sources);
    const keyPeople = [...getMockPeople()].sort((a, b) => b.reach * (1 + b.relatedCommunities / 10) - a.reach * (1 + a.relatedCommunities / 10)).slice(0, 8);
    return {
      community: p.community,
      metrics: p.metrics,
      insights: p.insights,
      segments: p.segments,
      dynamics: p.dynamics as Record<DynamicsMetric, { label: string; value: number }[]>,
      concentration: p.concentration,
      platforms: p.platforms,
      geography,
      keyPeople,
      relatedCommunities: p.relatedCommunities,
    };
  },

  /** GET /api/v1/communities/{id}/sources?search&platform&type&segment&province&city&topic&sort&page&page_size */
  async getCommunitySources(communityId: string, f: SourceFilters): Promise<Page<Source>> {
    await delay(160);
    profileOf(communityId);
    const q = f.search?.trim();
    const rows = getMockSources().filter((s) =>
      (!q || s.name.includes(q) || s.topTopic.includes(q)) &&
      (!f.platform || s.platform === f.platform) &&
      (!f.type || s.type === f.type) &&
      (!f.segment || s.segmentId === f.segment) &&
      (!f.province || s.provinceId === f.province) &&
      (!f.city || s.cityId === f.city) &&
      (!f.activity || s.activity === f.activity) &&
      (!f.topic || s.topTopic === f.topic) &&
      (!f.growth || (f.growth === "growing" ? s.growth > 0 : s.growth < 0)) &&
      (!f.size || (f.size === "small" ? s.members < 1000 : f.size === "medium" ? s.members < 10000 && s.members >= 1000 : s.members >= 10000)),
    );
    return paginate(sortBy(rows, f.sort ?? "members", f.dir ?? "desc"), f.page, f.pageSize);
  },

  /** Distinct source topics (for filter dropdown) */
  async getSourceTopics(communityId: string): Promise<string[]> {
    profileOf(communityId);
    return [...new Set(getMockSources().map((s) => s.topTopic))];
  },

  /** GET /api/v1/communities/{id}/people */
  async getCommunityPeople(communityId: string, f: PeopleFilters): Promise<Page<Person>> {
    await delay(160);
    profileOf(communityId);
    const q = f.search?.trim();
    const rows = getMockPeople().filter((p) =>
      (!q || p.name.includes(q) || p.handle.includes(q)) &&
      (!f.platform || p.platforms.includes(f.platform)) &&
      (!f.role || p.role === f.role) &&
      (!f.province || p.provinceId === f.province) &&
      (!f.topic || p.topics.includes(f.topic)) &&
      (!f.activity || p.activity === f.activity) &&
      (!f.reach || (f.reach === "lt10k" ? p.reach < 10000 : f.reach === "10k-100k" ? p.reach < 100000 && p.reach >= 10000 : p.reach >= 100000)),
    );
    return paginate(sortBy(rows, f.sort ?? "reach", f.dir ?? "desc"), f.page, f.pageSize);
  },

  /** GET /api/v1/communities/{id}/topics */
  async getCommunityTopics(communityId: string) {
    await delay(160);
    const p = profileOf(communityId);
    return { topics: p.topics, emerging: p.emerging };
  },

  /** GET /api/v1/communities/{id}/content?view&platform&topic&page&page_size */
  async getCommunityContent(communityId: string, f: ContentFilters): Promise<Page<ContentItem>> {
    await delay(160);
    profileOf(communityId);
    const rows = getMockContent().filter((c) => (!f.platform || c.platform === f.platform) && (!f.topic || c.topic === f.topic));
    const sorted =
      f.view === "latest" ? sortBy(rows, "minutesAgo", "asc")
        : f.view === "important" ? sortBy(rows, "importance", "desc")
          : [...rows].sort((a, b) => b.engagement / (1 + b.minutesAgo / 600) - a.engagement / (1 + a.minutesAgo / 600));
    return paginate(sorted, f.page, f.pageSize);
  },
};
