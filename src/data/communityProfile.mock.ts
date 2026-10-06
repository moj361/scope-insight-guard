/**
 * Community Profile — mock data (demo only, values are illustrative).
 * Consumed ONLY by src/lib/services/communityProfile.ts.
 */
import { MOCK_CITIES, MOCK_PROVINCES } from "@/data/situationRoom.mock";

/* ---------------- Types (shape of future FastAPI responses) ---------------- */
export type ProfilePlatform = "telegram" | "instagram" | "x" | "other";
export type SourceType = "telegram_group" | "telegram_channel" | "instagram_account" | "x_account" | "other";
export type Level = "high" | "medium" | "low";
export type PersonRole =
  | "community_admin" | "moderator" | "content_creator" | "topic_contributor"
  | "highly_active" | "connector" | "high_reach";
export type InsightKind = "increase" | "decrease" | "new" | "emerging";
export type DynamicsMetric = "activity" | "content" | "sources" | "members" | "engagement";

export interface CommunityInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  geography: string;
  mainTopics: string[];
  platforms: ProfilePlatform[];
  updatedAt: string; // ISO
}
export interface CommunityMetricsSummary {
  relatedSources: number;
  estimatedMembers: number;
  activeCommunities: number;
  platforms: number;
  provincesCovered: number;
  activityGrowth: number;
}
export interface ProfileInsight { id: string; kind: InsightKind; text: string; value?: string }
export interface Segment {
  id: string; name: string; nameEn: string; description: string; share: number;
  sources: number; members: number; activity: Level; growth: number; topTopics: string[];
}
export interface DynamicsPoint { label: string; value: number }
export interface PlatformPresence { platform: ProfilePlatform; share: number; activity: Level; growth: number }
export interface GeoPresence { provinceId: string; name: string; sources: number; intensity: number; growth: number }
export interface RelatedCommunity { id: string; name: string; relationship: string; activity: Level; growth: number; sharedTopics: string[] }
export interface Person {
  id: string; name: string; handle: string; role: PersonRole; platforms: ProfilePlatform[];
  relatedCommunities: number; content: number; engagement: number; reach: number;
  topicBreadth: number; activity: Level; provinceId: string; topics: string[];
}
export interface Topic { id: string; name: string; parentId: string | null; share: number; growth: number; sources: number; communities: number }
export interface EmergingTopic {
  id: string; name: string; growth: number; window: string; communities: number;
  sources: number; provinces: number; platforms: ProfilePlatform[]; spread: "isolated" | "spreading" | "widespread";
}
export interface ContentItem {
  id: string; title: string; summary: string; sourceName: string; sourceType: SourceType;
  platform: ProfilePlatform; minutesAgo: number; topic: string; activity: Level;
  engagement: number; communitiesObserved: number; importance: number; // 0..100
}
export interface Source {
  id: string; name: string; platform: ProfilePlatform; type: SourceType; segmentId: string;
  provinceId: string; cityId: string; members: number; activity: Level; growth: number;
  topTopic: string; lastActiveMin: number;
}

/* ---------------- Seeded RNG ---------------- */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
/** weighted pick */
function wpick<T>(r: () => number, items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((a, [, w]) => a + w, 0);
  let x = r() * total;
  for (const [v, w] of items) if ((x -= w) <= 0) return v;
  return items[items.length - 1][0];
}

/* ---------------- Farhangian demo community ---------------- */
const SEGMENTS: Segment[] = [
  { id: "teachers", name: "معلمان", nameEn: "Teachers & Educators", description: "گروه‌ها و کانال‌های صنفی و تخصصی معلمان مقاطع مختلف", share: 48, sources: 1671, members: 864000, activity: "high", growth: 21, topTopics: ["حقوق و مزایا", "رتبه‌بندی", "طرح درس"] },
  { id: "schools", name: "مدارس", nameEn: "Schools", description: "کانال‌های رسمی و گروه‌های اطلاع‌رسانی مدارس", share: 17, sources: 592, members: 306000, activity: "medium", growth: 9, topTopics: ["اطلاعیه‌ها", "ثبت‌نام", "تقویم آموزشی"] },
  { id: "managers", name: "مدیران مدارس", nameEn: "School Management", description: "شبکه مدیران، معاونان و کادر اجرایی مدارس", share: 12, sources: 418, members: 97000, activity: "medium", growth: 14, topTopics: ["بخشنامه‌ها", "بودجه مدارس", "سامانه‌ها"] },
  { id: "exams", name: "آموزش و امتحانات", nameEn: "Education & Exams", description: "محتوای آموزشی، نمونه سؤال و برنامه امتحانات", share: 11, sources: 383, members: 241000, activity: "high", growth: 32, topTopics: ["امتحانات نهایی", "نمونه سؤال", "تأثیر معدل"] },
  { id: "parents", name: "والدین و آموزش", nameEn: "Parents & Education", description: "گروه‌های اولیا و انجمن‌های اولیا و مربیان", share: 7, sources: 244, members: 189000, activity: "medium", growth: 6, topTopics: ["شهریه", "سرویس مدارس", "کیفیت آموزش"] },
  { id: "konkur", name: "کنکور و آزمون", nameEn: "Konkur & Tests", description: "مشاوران و معلمان کنکور و آزمون‌های استخدامی", share: 5, sources: 174, members: 103000, activity: "low", growth: -4, topTopics: ["کنکور ۱۴۰۵", "آزمون استخدامی", "مشاوره"] },
];

const TOPICS: Topic[] = [
  { id: "t-salary", name: "حقوق و مزایا", parentId: null, share: 24, growth: 240, sources: 1184, communities: 412 },
  { id: "t-salary-1", name: "حقوق و مزایای معلمان", parentId: "t-salary", share: 13, growth: 310, sources: 806, communities: 286 },
  { id: "t-salary-2", name: "معوقات و پاداش", parentId: "t-salary", share: 7, growth: 120, sources: 391, communities: 148 },
  { id: "t-salary-3", name: "بیمه تکمیلی", parentId: "t-salary", share: 4, growth: 38, sources: 207, communities: 81 },
  { id: "t-rank", name: "رتبه‌بندی معلمان", parentId: null, share: 18, growth: 64, sources: 932, communities: 318 },
  { id: "t-rank-1", name: "نتایج رتبه‌بندی", parentId: "t-rank", share: 10, growth: 92, sources: 611, communities: 207 },
  { id: "t-rank-2", name: "اعتراض به رتبه", parentId: "t-rank", share: 8, growth: 41, sources: 388, communities: 132 },
  { id: "t-exam", name: "امتحانات", parentId: null, share: 16, growth: 88, sources: 841, communities: 276 },
  { id: "t-exam-1", name: "امتحانات نهایی", parentId: "t-exam", share: 9, growth: 140, sources: 514, communities: 173 },
  { id: "t-exam-2", name: "تأثیر معدل", parentId: "t-exam", share: 7, growth: 52, sources: 402, communities: 121 },
  { id: "t-reform", name: "تغییرات آموزشی", parentId: null, share: 12, growth: 47, sources: 603, communities: 198 },
  { id: "t-reform-1", name: "کتب درسی جدید", parentId: "t-reform", share: 6, growth: 33, sources: 298, communities: 96 },
  { id: "t-reform-2", name: "آموزش مجازی و شاد", parentId: "t-reform", share: 6, growth: -11, sources: 287, communities: 89 },
  { id: "t-hire", name: "استخدام و جذب", parentId: null, share: 10, growth: 21, sources: 488, communities: 154 },
  { id: "t-hire-1", name: "دانشگاه فرهنگیان", parentId: "t-hire", share: 6, growth: 26, sources: 301, communities: 97 },
  { id: "t-hire-2", name: "ماده ۲۸ و حق‌التدریس", parentId: "t-hire", share: 4, growth: 14, sources: 187, communities: 63 },
  { id: "t-school", name: "امور مدارس", parentId: null, share: 12, growth: 5, sources: 702, communities: 231 },
  { id: "t-school-1", name: "ثبت‌نام و شهریه", parentId: "t-school", share: 7, growth: 8, sources: 422, communities: 141 },
  { id: "t-school-2", name: "تقویم آموزشی", parentId: "t-school", share: 5, growth: 1, sources: 280, communities: 90 },
  { id: "t-other", name: "سایر", parentId: null, share: 8, growth: -3, sources: 412, communities: 120 },
];

const EMERGING: EmergingTopic[] = [
  { id: "e-1", name: "حقوق و مزایای معلمان", growth: 240, window: "۴۸ ساعت", communities: 86, sources: 412, provinces: 14, platforms: ["telegram", "instagram", "x"], spread: "widespread" },
  { id: "e-2", name: "امتحانات نهایی", growth: 140, window: "۷ روز", communities: 61, sources: 288, provinces: 9, platforms: ["telegram", "instagram"], spread: "spreading" },
  { id: "e-3", name: "نتایج رتبه‌بندی", growth: 92, window: "۷ روز", communities: 47, sources: 203, provinces: 11, platforms: ["telegram", "x"], spread: "spreading" },
  { id: "e-4", name: "تغییرات آموزشی", growth: 47, window: "۱۴ روز", communities: 23, sources: 96, provinces: 5, platforms: ["telegram"], spread: "isolated" },
];

const RELATED: RelatedCommunity[] = [
  { id: "students", name: "دانش‌آموزان", relationship: "مخاطب مستقیم", activity: "high", growth: 17, sharedTopics: ["امتحانات", "تأثیر معدل"] },
  { id: "parents", name: "والدین", relationship: "ذی‌نفع", activity: "medium", growth: 6, sharedTopics: ["شهریه", "کیفیت آموزش"] },
  { id: "edu-org", name: "آموزش و پرورش", relationship: "نهاد مرتبط", activity: "medium", growth: 11, sharedTopics: ["بخشنامه‌ها", "رتبه‌بندی"] },
  { id: "konkur", name: "کنکور", relationship: "هم‌پوشان", activity: "medium", growth: -2, sharedTopics: ["کنکور ۱۴۰۵", "مشاوره"] },
  { id: "universities", name: "دانشگاه‌ها", relationship: "هم‌پوشان", activity: "low", growth: 4, sharedTopics: ["دانشگاه فرهنگیان"] },
  { id: "retirees", name: "بازنشستگان", relationship: "هم‌پوشان", activity: "medium", growth: 19, sharedTopics: ["حقوق و مزایا", "بیمه تکمیلی"] },
];

const PROVINCE_WEIGHT: Record<string, number> = {
  tehran: 18, "khorasan-razavi": 9, isfahan: 8, fars: 7, "east-azerbaijan": 6, khuzestan: 6,
  mazandaran: 4.5, alborz: 4, kerman: 3.5, gilan: 3.5, "west-azerbaijan": 3.2, kermanshah: 2.6,
  "sistan-baluchestan": 2.6, hamadan: 2.2, lorestan: 2, golestan: 2, yazd: 1.8, qom: 1.8,
  markazi: 1.7, kurdistan: 1.7, ardabil: 1.5, hormozgan: 1.5, qazvin: 1.4, zanjan: 1.2,
  bushehr: 1.1, chaharmahal: 1, kohgiluyeh: 0.9, "north-khorasan": 0.9, "south-khorasan": 0.9, semnan: 0.8, ilam: 0.7,
};

const SOURCE_TOTAL = 3482;

const NAME_PARTS = {
  prefix: ["کانال", "گروه", "انجمن", "شبکه", "صدای", "خبرنامه", "همیاران", "حلقه", "تریبون", "دفتر"],
  core: ["معلمان", "فرهنگیان", "مدیران مدارس", "دبیران", "آموزگاران", "هنرآموزان", "معلمان ابتدایی", "دبیران ریاضی", "معلمان حق‌التدریس", "اولیا و مربیان", "امتحانات نهایی", "رتبه‌بندی معلمان", "مشاوران تحصیلی"],
};

const SEG_TOPIC: Record<string, string[]> = {
  teachers: ["حقوق و مزایای معلمان", "نتایج رتبه‌بندی", "معوقات و پاداش", "طرح درس"],
  schools: ["تقویم آموزشی", "ثبت‌نام و شهریه", "اطلاعیه‌ها"],
  managers: ["بخشنامه‌ها", "بودجه مدارس", "سامانه‌ها"],
  exams: ["امتحانات نهایی", "تأثیر معدل", "نمونه سؤال"],
  parents: ["ثبت‌نام و شهریه", "سرویس مدارس", "کیفیت آموزش"],
  konkur: ["کنکور ۱۴۰۵", "آزمون استخدامی", "مشاوره"],
};

let sourcesCache: Source[] | null = null;
/** Generated lazily once; the service paginates so the UI never renders them all. */
export function getMockSources(): Source[] {
  if (sourcesCache) return sourcesCache;
  const r = rng(1404);
  const provinces = MOCK_PROVINCES.map((p) => [p.id, PROVINCE_WEIGHT[p.id] ?? 1] as const);
  const segs = SEGMENTS.map((s) => [s.id, s.share] as const);
  const out: Source[] = [];
  for (let i = 0; i < SOURCE_TOTAL; i++) {
    const segmentId = wpick(r, segs);
    const provinceId = wpick(r, provinces);
    const cities = MOCK_CITIES.filter((c) => c.provinceId === provinceId);
    const city = r() < 0.55 ? cities[0] : pick(r, cities);
    const platform = wpick(r, [["telegram", 72], ["instagram", 19], ["x", 7], ["other", 2]] as const);
    const type: SourceType =
      platform === "telegram" ? (r() < 0.62 ? "telegram_group" : "telegram_channel")
        : platform === "instagram" ? "instagram_account" : platform === "x" ? "x_account" : "other";
    const pname = MOCK_PROVINCES.find((p) => p.id === provinceId)!.name;
    const core = pick(r, NAME_PARTS.core);
    const name =
      r() < 0.5 ? `${pick(r, NAME_PARTS.prefix)} ${core} ${city?.name ?? pname}`
        : r() < 0.5 ? `${core} استان ${pname}` : `${pick(r, NAME_PARTS.prefix)} ${core}`;
    const members = Math.round(Math.exp(5 + r() * 6.2)); // ~150 .. ~70k long-tail
    const actRoll = r();
    out.push({
      id: `src-${(i + 1).toString().padStart(4, "0")}`,
      name,
      platform,
      type,
      segmentId,
      provinceId,
      cityId: city?.id ?? "",
      members,
      activity: actRoll < 0.22 ? "high" : actRoll < 0.62 ? "medium" : "low",
      growth: Math.round((r() * 90 - 25) * 10) / 10,
      topTopic: pick(r, SEG_TOPIC[segmentId]),
      lastActiveMin: Math.round(Math.pow(r(), 3) * 60 * 24 * 14),
    });
  }
  sourcesCache = out;
  return out;
}

const FIRST = ["علی", "مریم", "حسین", "زهرا", "محمد", "فاطمه", "رضا", "سمیه", "مهدی", "لیلا", "حمید", "نرگس", "سعید", "الهام", "امیر", "مینا", "جواد", "شیما", "کاظم", "پروین"];
const LAST = ["رحیمی", "کریمی", "موسوی", "احمدی", "حسینی", "جعفری", "صادقی", "نوری", "طاهری", "قاسمی", "باقری", "شریفی", "یزدانی", "فرهادی", "کاظمی", "عباسی", "مرادی", "سلطانی"];
const ROLES: (readonly [PersonRole, number])[] = [
  ["community_admin", 14], ["moderator", 16], ["content_creator", 20], ["topic_contributor", 18],
  ["highly_active", 16], ["connector", 8], ["high_reach", 8],
];
const PERSON_TOPICS = ["حقوق و مزایا", "رتبه‌بندی", "امتحانات", "تغییرات آموزشی", "استخدام", "امور مدارس", "بیمه تکمیلی", "کنکور"];

let peopleCache: Person[] | null = null;
export function getMockPeople(): Person[] {
  if (peopleCache) return peopleCache;
  const r = rng(77);
  const provinces = MOCK_PROVINCES.map((p) => [p.id, PROVINCE_WEIGHT[p.id] ?? 1] as const);
  peopleCache = Array.from({ length: 264 }, (_, i) => {
    const role = wpick(r, ROLES);
    const platforms: ProfilePlatform[] = ["telegram"];
    if (r() < 0.45) platforms.push("instagram");
    if (r() < 0.22) platforms.push("x");
    const reachBase = role === "high_reach" ? 9 : role === "community_admin" ? 8 : 6.5;
    const breadth = 1 + Math.floor(r() * (role === "connector" ? 8 : 5));
    const topics = [...PERSON_TOPICS].sort(() => r() - 0.5).slice(0, Math.min(3, breadth));
    const a = r();
    const first = pick(r, FIRST);
    const last = pick(r, LAST);
    return {
      id: `p-${i + 1}`,
      name: `${first} ${last}`,
      handle: `@${["teacher", "moallem", "dabir", "farhangi", "edu"][i % 5]}_${(Math.floor(r() * 9000) + 1000).toString()}`,
      role,
      platforms,
      relatedCommunities: Math.max(1, Math.round((role === "connector" ? 30 : 8) * (0.3 + r()))),
      content: Math.round(40 + r() * (role === "content_creator" || role === "highly_active" ? 2400 : 700)),
      engagement: Math.round(r() * 100 * 10) / 10,
      reach: Math.round(Math.exp(reachBase + r() * 2.5)),
      topicBreadth: breadth,
      activity: a < 0.3 ? "high" : a < 0.7 ? "medium" : "low",
      provinceId: wpick(r, provinces),
      topics,
    };
  });
  return peopleCache;
}

const CONTENT_SEED: Omit<ContentItem, "id">[] = [
  { title: "حقوق و مزایای معلمان در دستور کار جدید", summary: "بحث گسترده درباره زمان اجرای افزایش حقوق و نحوه محاسبه آن در گروه‌های صنفی.", sourceName: "صدای فرهنگیان", sourceType: "telegram_channel", platform: "telegram", minutesAgo: 120, topic: "حقوق و مزایا", activity: "high", engagement: 18400, communitiesObserved: 34, importance: 94 },
  { title: "زمان اعلام نتایج نهایی رتبه‌بندی", summary: "پرسش‌های تکراری درباره زمان و سامانه اعلام نتایج در گروه‌های استانی.", sourceName: "انجمن معلمان اصفهان", sourceType: "telegram_group", platform: "telegram", minutesAgo: 210, topic: "رتبه‌بندی", activity: "high", engagement: 12100, communitiesObserved: 27, importance: 88 },
  { title: "برنامه امتحانات نهایی خرداد منتشر شد", summary: "بازنشر گسترده برنامه امتحانات در کانال‌های مدارس و گروه‌های اولیا.", sourceName: "خبرنامه امتحانات نهایی", sourceType: "telegram_channel", platform: "telegram", minutesAgo: 45, topic: "امتحانات", activity: "high", engagement: 22600, communitiesObserved: 41, importance: 82 },
  { title: "نگرانی از تأخیر پرداخت معوقات", summary: "روایت‌های متعدد از تأخیر پرداخت در چند استان؛ تکرار در گروه‌های مدیران.", sourceName: "حلقه مدیران مدارس خراسان", sourceType: "telegram_group", platform: "telegram", minutesAgo: 380, topic: "حقوق و مزایا", activity: "medium", engagement: 7400, communitiesObserved: 19, importance: 79 },
  { title: "معرفی کتاب‌های درسی جدید پایه هفتم", summary: "ویدئوی معرفی سرفصل‌های جدید و واکنش دبیران.", sourceName: "dabiran.official", sourceType: "instagram_account", platform: "instagram", minutesAgo: 600, topic: "تغییرات آموزشی", activity: "medium", engagement: 9800, communitiesObserved: 8, importance: 52 },
  { title: "زمان ثبت‌نام آزمون دانشگاه فرهنگیان", summary: "اطلاع‌رسانی شرایط و ظرفیت پذیرش در کانال‌های مشاوره.", sourceName: "مشاوران تحصیلی ایران", sourceType: "telegram_channel", platform: "telegram", minutesAgo: 900, topic: "استخدام", activity: "medium", engagement: 6300, communitiesObserved: 12, importance: 48 },
  { title: "واکنش معلمان به بخشنامه جدید ارزشیابی", summary: "رشتو در X درباره تغییر شیوه ارزشیابی توصیفی.", sourceName: "@moallem_online", sourceType: "x_account", platform: "x", minutesAgo: 75, topic: "تغییرات آموزشی", activity: "high", engagement: 5100, communitiesObserved: 15, importance: 71 },
  { title: "شهریه مدارس غیردولتی سال آینده", summary: "مقایسه شهریه‌ها و گلایه اولیا در گروه‌های انجمن اولیا.", sourceName: "اولیا و مربیان تهران", sourceType: "telegram_group", platform: "telegram", minutesAgo: 1440, topic: "امور مدارس", activity: "medium", engagement: 4200, communitiesObserved: 11, importance: 44 },
  { title: "فراخوان جذب نیروی حق‌التدریس", summary: "بازنشر آگهی جذب در کانال‌های استانی.", sourceName: "معلمان حق‌التدریس فارس", sourceType: "telegram_channel", platform: "telegram", minutesAgo: 1800, topic: "استخدام", activity: "low", engagement: 2100, communitiesObserved: 6, importance: 33 },
  { title: "جمع‌بندی تأثیر معدل در کنکور ۱۴۰۵", summary: "اینفوگرافیک پربازدید درباره سهم سوابق تحصیلی.", sourceName: "konkur.guide", sourceType: "instagram_account", platform: "instagram", minutesAgo: 260, topic: "امتحانات", activity: "high", engagement: 16900, communitiesObserved: 22, importance: 67 },
  { title: "تمدید مهلت ثبت بیمه تکمیلی فرهنگیان", summary: "اطلاعیه و پرسش‌وپاسخ درباره پوشش‌های جدید.", sourceName: "شبکه فرهنگیان", sourceType: "telegram_channel", platform: "telegram", minutesAgo: 520, topic: "حقوق و مزایا", activity: "medium", engagement: 5600, communitiesObserved: 14, importance: 58 },
  { title: "تجربه کلاس‌های ترکیبی در مدارس روستایی", summary: "روایت معلمان از چالش‌های آموزش ترکیبی.", sourceName: "آموزگاران کرمان", sourceType: "telegram_group", platform: "telegram", minutesAgo: 3100, topic: "تغییرات آموزشی", activity: "low", engagement: 1300, communitiesObserved: 4, importance: 29 },
];

export function getMockContent(): ContentItem[] {
  // Repeat seed with shifted times to simulate a longer feed
  return [0, 1, 2].flatMap((round) =>
    CONTENT_SEED.map((c, i) => ({
      ...c,
      id: `ct-${round}-${i}`,
      minutesAgo: c.minutesAgo + round * 2900,
      engagement: Math.round(c.engagement * (1 - round * 0.3)),
      importance: Math.max(10, c.importance - round * 18),
      communitiesObserved: Math.max(2, c.communitiesObserved - round * 6),
    })),
  );
}

function series(seed: number, base: number, trend: number, n = 30): DynamicsPoint[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const spike = i > n - 6 ? 1 + (i - (n - 6)) * 0.06 : 1;
    return { label: `${n - i}`, value: Math.round(base * (1 + (trend * i) / n) * spike * (0.92 + r() * 0.16)) };
  });
}

export const MOCK_PROFILES: Record<string, {
  community: CommunityInfo;
  metrics: CommunityMetricsSummary;
  insights: ProfileInsight[];
  segments: Segment[];
  dynamics: Record<DynamicsMetric, DynamicsPoint[]>;
  concentration: { activityShare: number; sourceShare: number; curve: { sources: number; activity: number }[] };
  platforms: PlatformPresence[];
  relatedCommunities: RelatedCommunity[];
  topics: Topic[];
  emerging: EmergingTopic[];
  provinceWeights: Record<string, number>;
}> = {
  farhangian: {
    community: {
      id: "farhangian",
      name: "فرهنگیان",
      nameEn: "Teachers & Educators Community",
      description: "شبکه‌ای از معلمان، مدیران مدارس، فعالان آموزشی و جوامع مرتبط با آموزش و پرورش.",
      geography: "ایران",
      mainTopics: ["حقوق و مزایا", "رتبه‌بندی", "امتحانات", "تغییرات آموزشی"],
      platforms: ["telegram", "instagram", "x"],
      updatedAt: "2026-10-06T05:30:00Z",
    },
    metrics: { relatedSources: SOURCE_TOTAL, estimatedMembers: 1_800_000, activeCommunities: 1126, platforms: 3, provincesCovered: 31, activityGrowth: 18.4 },
    insights: [
      { id: "i1", kind: "increase", text: "فعالیت کل جامعه در ۷ روز اخیر افزایش یافته است", value: "+۱۸٪" },
      { id: "i2", kind: "emerging", text: "«حقوق و مزایای معلمان» سریع‌ترین رشد را میان موضوعات داشته است", value: "+۲۴۰٪" },
      { id: "i3", kind: "new", text: "منبع جدید مرتبط با این جامعه شناسایی شد", value: "۴۲" },
      { id: "i4", kind: "increase", text: "بحث درباره امتحانات به ۹ استان گسترش یافته است", value: "۹ استان" },
      { id: "i5", kind: "decrease", text: "فعالیت بخش کنکور و آزمون کاهش داشته است", value: "−۴٪" },
      { id: "i6", kind: "increase", text: "تلگرام همچنان پلتفرم غالب این جامعه است", value: "۷۲٪" },
    ],
    segments: SEGMENTS,
    dynamics: {
      activity: series(1, 4200, 0.25),
      content: series(2, 9800, 0.2),
      sources: series(3, 1020, 0.1),
      members: series(4, 61000, 0.08),
      engagement: series(5, 38000, 0.3),
    },
    concentration: {
      activityShare: 32,
      sourceShare: 8,
      curve: [
        { sources: 0, activity: 0 }, { sources: 2, activity: 12 }, { sources: 5, activity: 23 }, { sources: 8, activity: 32 },
        { sources: 15, activity: 46 }, { sources: 25, activity: 60 }, { sources: 40, activity: 74 }, { sources: 60, activity: 87 },
        { sources: 80, activity: 95 }, { sources: 100, activity: 100 },
      ],
    },
    platforms: [
      { platform: "telegram", share: 72, activity: "high", growth: 16 },
      { platform: "instagram", share: 19, activity: "medium", growth: 24 },
      { platform: "x", share: 7, activity: "medium", growth: 9 },
      { platform: "other", share: 2, activity: "low", growth: -3 },
    ],
    relatedCommunities: RELATED,
    topics: TOPICS,
    emerging: EMERGING,
    provinceWeights: PROVINCE_WEIGHT,
  },
};
