/**
 * Community Landscape — mock data (demo).
 * Consumed ONLY by src/lib/services/communityLandscape.ts.
 */

export type CommunityPlatform = "telegram" | "instagram" | "x" | "eitaa" | "rubika";
export type ActivityLevel = "high" | "medium" | "low";

export interface Community {
  id: string;
  name: string;
  handle: string;
  platform: CommunityPlatform;
  members: number;
  activity: ActivityLevel;
  growth: number; // % over last 30 days
  categoryId: string;
  subcategoryId?: string;
  /** null = national reach */
  provinceId: string | null;
  isNew?: boolean;
}

export type InsightType = "emerging" | "increase" | "decrease" | "new_community" | "shift";

export interface CommunityInsightSeed {
  id: string;
  type: InsightType;
  topic: string;
  detail: string;
  change: number | null; // null = NEW
  communities: number;
  categoryId: string;
  subcategoryId?: string;
}

export const PLATFORM_LABELS: Record<CommunityPlatform, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  x: "X",
  eitaa: "Eitaa",
  rubika: "Rubika",
};

/** National baseline platform share (%) */
export const MOCK_PLATFORM_SHARE: Record<CommunityPlatform, number> = {
  telegram: 46,
  instagram: 27,
  x: 12,
  eitaa: 9,
  rubika: 6,
};

/** National baseline category weights */
export const MOCK_CATEGORY_WEIGHTS: Record<string, number> = {
  media: 16, economy: 14, lifestyle: 11, sports: 10, politics: 9, art: 7, education: 6,
  business: 6, health: 5, religion: 5, travel: 3, women: 3, environment: 2, military: 2, security: 1,
};

/** Share of national communities hosted per province (rest split evenly) */
export const MOCK_PROVINCE_WEIGHTS: Record<string, number> = {
  tehran: 0.27, "khorasan-razavi": 0.08, isfahan: 0.07, fars: 0.06, "east-azerbaijan": 0.05,
  khuzestan: 0.045, alborz: 0.04, mazandaran: 0.035, gilan: 0.03, kerman: 0.025, qom: 0.02,
};

export const MOCK_NATIONAL_TOTAL = 12480;

const c = (
  id: string, name: string, handle: string, platform: CommunityPlatform, members: number,
  activity: ActivityLevel, growth: number, categoryId: string, subcategoryId: string | undefined,
  provinceId: string | null, isNew = false,
): Community => ({ id, name, handle, platform, members, activity, growth, categoryId, subcategoryId, provinceId, isNew });

export const MOCK_COMMUNITIES: Community[] = [
  c("cm-01", "جامعه اقتصادی ایران", "@iran_economy", "telegram", 42300, "high", 38, "economy", "economy-5", null),
  c("cm-02", "نرخ لحظه‌ای ارز تهران", "@tehran_fx_live", "telegram", 61800, "high", 74, "economy", "economy-5", "tehran"),
  c("cm-03", "صرافان منوچهری", "@manouchehri_ex", "telegram", 18400, "high", 52, "economy", "economy-10", "tehran"),
  c("cm-04", "دلار فردایی", "@dollar_fardaei", "telegram", 27900, "high", 121, "economy", "economy-5", "tehran", true),
  c("cm-05", "تحلیل بازار ارز", "fx.analysis.ir", "instagram", 33600, "medium", 19, "economy", "economy-5", null),
  c("cm-06", "بورس‌بازان پایتخت", "@bourse_tehran", "telegram", 24100, "medium", -8, "economy", "economy-1", "tehran"),
  c("cm-07", "طلا و سکه امروز", "@gold_coin_today", "eitaa", 15200, "medium", 27, "economy", "economy-4", null),
  c("cm-08", "رمزارز فارسی", "@crypto_fa", "x", 21700, "high", 44, "economy", "economy-2", null),
  c("cm-09", "اخبار تهران", "@tehran_news", "telegram", 31200, "high", 21, "media", "media-3", "tehran"),
  c("cm-10", "فناوری ایران", "iran.tech", "instagram", 18300, "medium", 14, "business", "business-6", null),
  c("cm-11", "خبر فوری مشهد", "@mashhad_fori", "telegram", 22900, "high", 16, "media", "media-3", "khorasan-razavi"),
  c("cm-12", "اصفهان امروز", "isfahan.emrooz", "instagram", 17600, "medium", 9, "media", "media-5", "isfahan"),
  c("cm-13", "هواداران پرسپولیس", "@perspolis_fans", "telegram", 88400, "high", 6, "sports", "sports-12", null),
  c("cm-14", "سکوی آبی", "@esteghlal_sakoo", "telegram", 71200, "high", 11, "sports", "sports-11", "tehran"),
  c("cm-15", "مسکن و اجاره تهران", "@maskan_tehran", "telegram", 29800, "high", 33, "economy", "economy-6", "tehran"),
  c("cm-16", "بازار خودرو", "@khodro_market", "rubika", 19500, "medium", -12, "economy", "economy-7", null),
  c("cm-17", "کنکوری‌ها", "@konkur_1405", "telegram", 39100, "medium", 24, "education", "education-1", null),
  c("cm-18", "شیراز گردی", "shiraz.gardi", "instagram", 14200, "low", 4, "travel", "travel-1", "fars"),
  c("cm-19", "مهاجرت کاری", "@mohajerat_kari", "telegram", 26400, "high", 47, "travel", "travel-3", null, true),
  c("cm-20", "تبریز نیوز", "@tabriz_news", "telegram", 16800, "medium", 12, "media", "media-5", "east-azerbaijan"),
  c("cm-21", "اهواز و هوای آلوده", "@ahvaz_hava", "x", 8900, "high", 96, "environment", "environment-2", "khuzestan", true),
  c("cm-22", "پادکست‌های فارسی", "@fa_podcasts", "telegram", 12300, "low", 7, "media", "media-7", null),
  c("cm-23", "استارتاپ‌های تهران", "@tehran_startups", "x", 11600, "medium", 18, "business", "business-6", "tehran"),
  c("cm-24", "سینما و فیلم", "cinema.fa", "instagram", 45700, "medium", -3, "art", "art-6", null),
  c("cm-25", "ارز دیجیتال کرج", "@karaj_crypto", "telegram", 9400, "medium", 29, "economy", "economy-2", "alborz"),
  c("cm-26", "پرستاران ایران", "@iran_nurses", "eitaa", 13800, "medium", 15, "health", "health-8", null),
  c("cm-27", "هیئت‌های پایتخت", "@heyat_tehran", "eitaa", 10200, "low", 3, "religion", "religion-7", "tehran"),
  c("cm-28", "صرافی آنلاین ارز", "@online_sarrafi", "rubika", 12700, "high", 63, "economy", "economy-5", null, true),
];

export const MOCK_INSIGHTS: CommunityInsightSeed[] = [
  { id: "in-01", type: "increase", topic: "دلار و ارز", detail: "جهش فعالیت پس از نوسان نرخ", change: 420, communities: 73, categoryId: "economy", subcategoryId: "economy-5" },
  { id: "in-02", type: "emerging", topic: "پیش‌فروش ارز فردایی", detail: "موضوع نوظهور در کانال‌های صرافی", change: null, communities: 28, categoryId: "economy", subcategoryId: "economy-5" },
  { id: "in-03", type: "increase", topic: "مسکن و اجاره", detail: "افزایش بحث درباره تمدید قرارداد", change: 180, communities: 41, categoryId: "economy", subcategoryId: "economy-6" },
  { id: "in-04", type: "shift", topic: "بورس ← طلا", detail: "مهاجرت مخاطب از بورس به طلا و سکه", change: 64, communities: 19, categoryId: "economy", subcategoryId: "economy-4" },
  { id: "in-05", type: "decrease", topic: "بازار خودرو", detail: "کاهش تعامل در گروه‌های خرید و فروش", change: -37, communities: 22, categoryId: "economy", subcategoryId: "economy-7" },
  { id: "in-06", type: "new_community", topic: "آلودگی هوا", detail: "تشکیل جوامع محلی جدید", change: null, communities: 14, categoryId: "environment", subcategoryId: "environment-2" },
  { id: "in-07", type: "increase", topic: "مهاجرت", detail: "رشد پرسش‌ها درباره ویزای کاری", change: 145, communities: 36, categoryId: "travel", subcategoryId: "travel-3" },
  { id: "in-08", type: "emerging", topic: "کنکور ۱۴۰۵", detail: "داغ شدن بحث تأثیر معدل", change: null, communities: 31, categoryId: "education", subcategoryId: "education-1" },
  { id: "in-09", type: "shift", topic: "اخبار محلی ← اقتصاد", detail: "کانال‌های خبری به محتوای اقتصادی چرخیده‌اند", change: 58, communities: 26, categoryId: "media", subcategoryId: "media-3" },
  { id: "in-10", type: "decrease", topic: "سینما و فیلم", detail: "افت فعالیت پس از پایان جشنواره", change: -24, communities: 17, categoryId: "art", subcategoryId: "art-6" },
  { id: "in-11", type: "increase", topic: "ارز دیجیتال", detail: "بازگشت کاربران به گروه‌های سیگنال", change: 96, communities: 33, categoryId: "economy", subcategoryId: "economy-2" },
  { id: "in-12", type: "new_community", topic: "هواداران استقلال", detail: "شکل‌گیری کانال‌های هواداری تازه", change: null, communities: 12, categoryId: "sports", subcategoryId: "sports-11" },
];
