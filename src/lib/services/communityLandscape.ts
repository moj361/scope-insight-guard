/**
 * Community Landscape service layer (mock-backed).
 * Each method maps to a future FastAPI endpoint; swap bodies for authFetch(apiUrl(...)).
 */
import {
  MOCK_CATEGORY_WEIGHTS,
  MOCK_COMMUNITIES,
  MOCK_INSIGHTS,
  MOCK_NATIONAL_TOTAL,
  MOCK_PLATFORM_SHARE,
  MOCK_PROVINCE_WEIGHTS,
  PLATFORM_LABELS,
  type ActivityLevel,
  type Community,
  type CommunityPlatform,
  type InsightType,
} from "@/data/communityLandscape.mock";
import { MOCK_CATEGORIES, MOCK_CITIES } from "@/data/situationRoom.mock";
import type { SituationContext } from "@/lib/services/situationRoom";

export type { ActivityLevel, Community, CommunityPlatform, InsightType };
export { PLATFORM_LABELS };

export interface GeographicContext { countryId: string | null; provinceId: string | null; cityId: string | null }
export interface TopicContext { categoryId: string | null; subcategoryId: string | null }
export type PlatformFilter = CommunityPlatform | "all";
export interface LandscapeContext extends SituationContext { platform: PlatformFilter }

export interface CommunityMetrics { total: number; active: number; growing: number; newCount: number }
export interface DistributionItem { id: string; label: string; value: number }
export interface CommunityDistribution { byCategory: DistributionItem[]; byPlatform: DistributionItem[]; categoryLevel: "category" | "subcategory" }
export interface CommunityInsight { id: string; type: InsightType; topic: string; detail: string; change: number | null; communities: number }
export interface AttentionItem { id: string; label: string; count: number; tone: "critical" | "warning" | "info" }

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}
const keyOf = (c: LandscapeContext) =>
  [c.countryId, c.provinceId, c.cityId, c.categoryId, c.subcategoryId, c.platform].join("|");

function geoFactor(c: LandscapeContext) {
  if (c.countryId !== "IRN") return 0.06 + (hash(c.countryId ?? "") % 30) / 100;
  if (!c.provinceId) return 1;
  const p = MOCK_PROVINCE_WEIGHTS[c.provinceId] ?? 0.012 + (hash(c.provinceId) % 10) / 1000;
  if (!c.cityId) return p;
  const cities = MOCK_CITIES.filter((x) => x.provinceId === c.provinceId);
  const isCapital = cities[0]?.id === c.cityId;
  return p * (isCapital ? 0.68 : 0.32 / Math.max(1, cities.length - 1));
}

function categoryItems(c: LandscapeContext): { items: DistributionItem[]; level: "category" | "subcategory" } {
  const cat = MOCK_CATEGORIES.find((x) => x.id === c.categoryId);
  if (cat) {
    const raw = cat.subcategories.map((s) => ({ id: s.id, label: s.name, w: 2 + (hash(s.id + c.provinceId) % 9) + (s.id === "economy-5" ? 8 : 0) }));
    const sum = raw.reduce((a, b) => a + b.w, 0);
    return { level: "subcategory", items: raw.map((r) => ({ id: r.id, label: r.label, value: (r.w / sum) * 100 })).sort((a, b) => b.value - a.value) };
  }
  const raw = MOCK_CATEGORIES.map((x) => ({ id: x.id, label: x.name, w: (MOCK_CATEGORY_WEIGHTS[x.id] ?? 2) * (0.85 + (hash(x.id + c.provinceId + c.cityId) % 30) / 100) }));
  const sum = raw.reduce((a, b) => a + b.w, 0);
  return { level: "category", items: raw.map((r) => ({ id: r.id, label: r.label, value: (r.w / sum) * 100 })).sort((a, b) => b.value - a.value) };
}

function platformItems(c: LandscapeContext): DistributionItem[] {
  const raw = (Object.keys(MOCK_PLATFORM_SHARE) as CommunityPlatform[]).map((p) => ({
    id: p, label: PLATFORM_LABELS[p], w: MOCK_PLATFORM_SHARE[p] * (0.85 + (hash(p + c.provinceId + c.categoryId) % 30) / 100),
  }));
  const sum = raw.reduce((a, b) => a + b.w, 0);
  return raw.map((r) => ({ id: r.id, label: r.label, value: (r.w / sum) * 100 })).sort((a, b) => b.value - a.value);
}

/** Fraction of communities matched by topic + platform filters */
function filterFactor(c: LandscapeContext) {
  let f = 1;
  if (c.categoryId) {
    const total = Object.values(MOCK_CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    f *= (MOCK_CATEGORY_WEIGHTS[c.categoryId] ?? 2) / total;
    if (c.subcategoryId) f *= (categoryItems(c).items.find((i) => i.id === c.subcategoryId)?.value ?? 8) / 100;
  }
  if (c.platform !== "all") f *= (platformItems(c).find((p) => p.id === c.platform)?.value ?? 10) / 100;
  return f;
}

const placeName = (c: LandscapeContext) =>
  (c.cityId && MOCK_CITIES.find((x) => x.id === c.cityId)?.name) || "";

export const communityLandscapeService = {
  /** GET /community-landscape/overview */
  async getCommunityMetrics(c: LandscapeContext): Promise<CommunityMetrics> {
    const h = hash(keyOf(c));
    const total = Math.max(9, Math.round(MOCK_NATIONAL_TOTAL * geoFactor(c) * filterFactor(c)));
    const hot = c.subcategoryId === "economy-5" ? 2.4 : 1;
    return {
      total,
      active: Math.max(4, Math.round(total * (0.31 + (h % 10) / 100))),
      growing: Math.max(2, Math.round(total * (0.014 + (h % 7) / 1000) * hot)),
      newCount: Math.max(1, Math.round(total * (0.006 + (h % 5) / 1000) * hot)),
    };
  },

  /** GET /community-landscape/distribution */
  async getCommunityDistribution(c: LandscapeContext): Promise<CommunityDistribution> {
    const cat = categoryItems(c);
    return { byCategory: cat.items, categoryLevel: cat.level, byPlatform: platformItems(c) };
  },

  /** GET /community-landscape/insights */
  async getCommunityInsights(c: LandscapeContext): Promise<CommunityInsight[]> {
    let list = MOCK_INSIGHTS.filter((i) => !c.categoryId || i.categoryId === c.categoryId);
    if (c.subcategoryId) {
      const exact = list.filter((i) => i.subcategoryId === c.subcategoryId);
      list = [...exact, ...list.filter((i) => i.subcategoryId !== c.subcategoryId)];
    }
    if (list.length < 3) list = [...list, ...MOCK_INSIGHTS.filter((i) => !list.includes(i))].slice(0, 4);
    const g = Math.max(0.08, Math.sqrt(geoFactor(c)));
    return list.slice(0, 6).map((i) => ({
      id: i.id, type: i.type, topic: i.topic, detail: i.detail, change: i.change,
      communities: Math.max(2, Math.round(i.communities * g)),
    }));
  },

  /** GET /community-landscape/communities */
  async getCommunities(c: LandscapeContext): Promise<Community[]> {
    const g = geoFactor(c);
    let list = MOCK_COMMUNITIES.filter(
      (m) =>
        (!c.categoryId || m.categoryId === c.categoryId) &&
        (!c.subcategoryId || m.subcategoryId === c.subcategoryId) &&
        (c.platform === "all" || m.platform === c.platform),
    );
    if (c.provinceId) list = list.filter((m) => m.provinceId === c.provinceId || m.provinceId === null);
    // Synthesize local communities so drilled-down scopes stay populated
    const place = placeName(c);
    const sub = MOCK_CATEGORIES.flatMap((x) => x.subcategories).find((s) => s.id === c.subcategoryId);
    const cat = MOCK_CATEGORIES.find((x) => x.id === c.categoryId);
    if (place && list.length < 8) {
      const topic = sub?.name ?? cat?.name ?? "اخبار";
      const tpl = [`${topic} ${place}`, `گفتگوی ${topic} | ${place}`, `${place} لحظه‌به‌لحظه`, `کانال ${topic}`];
      const plats: CommunityPlatform[] = ["telegram", "instagram", "telegram", "eitaa"];
      tpl.forEach((name, i) => {
        const p = c.platform === "all" ? plats[i] : c.platform;
        const h = hash(name + i);
        list.push({
          id: `gen-${c.cityId}-${c.subcategoryId ?? c.categoryId ?? "all"}-${i}`, name,
          handle: `@local_${(h % 9000) + 1000}`, platform: p, members: 3000 + (h % 14000),
          activity: (["high", "medium", "medium", "low"] as ActivityLevel[])[i], growth: (h % 70) - 10,
          categoryId: cat?.id ?? "media", subcategoryId: sub?.id, provinceId: c.provinceId, isNew: i === 3,
        });
      });
    }
    return list
      .map((m) => (m.provinceId === null && c.provinceId ? { ...m, members: Math.round(m.members * Math.max(0.15, g * 1.5)) } : m))
      .sort((a, b) => b.members - a.members)
      .slice(0, 10);
  },

  /** Derived from insights for demo */
  async getAttention(c: LandscapeContext): Promise<AttentionItem[]> {
    const h = hash(keyOf(c));
    const hot = c.subcategoryId === "economy-5" ? 2 : 0;
    return [
      { id: "unusual", label: "فعالیت غیرعادی · Unusual activity", count: 2 + (h % 5) + hot, tone: "critical" },
      { id: "shift", label: "تغییر موضوع مهم · Topic shifts", count: 1 + ((h >> 3) % 4), tone: "warning" },
      { id: "emerging", label: "موضوع نوظهور · Emerging topics", count: 3 + ((h >> 5) % 6) + hot, tone: "info" },
    ];
  },
};
