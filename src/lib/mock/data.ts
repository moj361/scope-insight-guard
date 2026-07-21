import type {
  Assessment,
  CaseInfo,
  ContentItem,
  KpiStat,
  Platform,
  Policy,
  PolicyCategory,
  Violation,
} from "./types";

export const caseInfo: CaseInfo = {
  title: "فراخوان و دعوت به اغتشاش",
  caseNumber: "312413241",
  status: "active",
  openedAt: "۱۴۰۳/۰۹/۱۲ - ۰۸:۳۲",
  analyst: "سرکار خانم موسوی",
};

export const kpis: KpiStat[] = [
  { key: "users_total", label: "تعداد کل کاربران", value: 128432, tone: "neutral", delta: 3.2 },
  { key: "users_watched", label: "کاربران تحت پایش", value: 4127, tone: "info", delta: 1.4 },
  { key: "groups_total", label: "تعداد کل گروه‌ها", value: 8_612, tone: "neutral" },
  { key: "groups_watched", label: "گروه‌های تحت پایش", value: 312, tone: "info" },
  { key: "critical", label: "تخلفات بحرانی", value: 47, tone: "critical", delta: 12 },
  { key: "pending", label: "در انتظار بررسی", value: 216, tone: "warning" },
  { key: "today", label: "تخلفات امروز", value: 389, tone: "neutral", delta: -4.1 },
  { key: "avg_review", label: "میانگین زمان بررسی", value: 142, tone: "info", hint: "ثانیه" },
  { key: "approved", label: "پیشنهادهای تایید شده", value: 1284, tone: "success" },
  { key: "rejected", label: "پیشنهادهای رد شده", value: 173, tone: "warning" },
];

export const policyCategories: PolicyCategory[] = [
  { code: "P-01", title: "دعوت به اغتشاش", count: 128, color: "var(--color-critical)" },
  { code: "P-02", title: "توهین و افترا", count: 96, color: "var(--color-high)" },
  { code: "P-03", title: "نشر اکاذیب", count: 74, color: "var(--color-medium)" },
  { code: "P-04", title: "تبلیغ خشونت", count: 52, color: "var(--color-warning)" },
  { code: "P-05", title: "سایر", count: 38, color: "var(--color-low)" },
];

export const policies: Policy[] = [
  {
    id: "R-001",
    code: "R-001",
    title: "دعوت به تجمع غیرقانونی",
    severity: "critical",
    weight: 95,
    defaultAction: "block",
    keywords: ["فراخوان", "تجمع", "میدان", "ساعت ۱۸"],
    prompt: "شناسایی محتوایی که مخاطبان را به تجمع در مکان و زمان مشخص دعوت می‌کند.",
    enabled: true,
  },
  {
    id: "R-002",
    code: "R-002",
    title: "تحریک به خشونت",
    severity: "critical",
    weight: 90,
    defaultAction: "confront",
    keywords: ["حمله", "آتش", "تخریب"],
    prompt: "محتوایی که به‌طور صریح مخاطب را به خشونت فیزیکی تشویق می‌کند.",
    enabled: true,
  },
  {
    id: "R-003",
    code: "R-003",
    title: "نشر اکاذیب امنیتی",
    severity: "high",
    weight: 78,
    defaultAction: "sms",
    keywords: ["شایعه", "کشته", "انفجار جعلی"],
    prompt: "انتشار اطلاعات نادرست با هدف ایجاد ناامنی روانی.",
    enabled: true,
  },
  {
    id: "R-004",
    code: "R-004",
    title: "توهین به مقامات",
    severity: "high",
    weight: 70,
    defaultAction: "sms",
    keywords: ["توهین", "دشنام"],
    prompt: "توهین آشکار به مقام‌های رسمی کشور.",
    enabled: true,
  },
  {
    id: "R-005",
    code: "R-005",
    title: "تبلیغ گروه‌های معاند",
    severity: "high",
    weight: 82,
    defaultAction: "block",
    keywords: ["سازمان", "معاند", "لوگو"],
    prompt: "بازنشر یا تبلیغ محتوای گروه‌های معاند.",
    enabled: true,
  },
  {
    id: "R-006",
    code: "R-006",
    title: "انتشار محتوای مستهجن",
    severity: "medium",
    weight: 60,
    defaultAction: "block",
    keywords: [],
    prompt: "شناسایی تصاویر یا متون مستهجن.",
    enabled: true,
  },
  {
    id: "R-007",
    code: "R-007",
    title: "شایعه پراکنی اقتصادی",
    severity: "medium",
    weight: 55,
    defaultAction: "monitor",
    keywords: ["دلار", "سقوط", "ورشکستگی"],
    prompt: "انتشار شایعات موثر بر بازار.",
    enabled: true,
  },
  {
    id: "R-008",
    code: "R-008",
    title: "پروپاگاندای منفی سبک زندگی",
    severity: "low",
    weight: 30,
    defaultAction: "monitor",
    keywords: [],
    prompt: "محتوایی که سبک زندگی متعارض با ارزش‌ها را تبلیغ می‌کند.",
    enabled: true,
  },
  {
    id: "R-009",
    code: "R-009",
    title: "بی‌احترامی به شعائر",
    severity: "high",
    weight: 74,
    defaultAction: "sms",
    keywords: ["توهین به مقدسات"],
    prompt: "بی‌احترامی صریح به شعائر دینی و ملی.",
    enabled: true,
  },
  {
    id: "R-010",
    code: "R-010",
    title: "افشای اطلاعات محرمانه",
    severity: "critical",
    weight: 92,
    defaultAction: "block",
    keywords: ["محرمانه", "سند"],
    prompt: "افشای اسناد یا داده‌های محرمانه سازمانی.",
    enabled: true,
  },
  {
    id: "R-011",
    code: "R-011",
    title: "کلاهبرداری آنلاین",
    severity: "medium",
    weight: 58,
    defaultAction: "confront",
    keywords: ["سرمایه گذاری", "سود تضمینی"],
    prompt: "شناسایی الگوهای کلاهبرداری در تبلیغات.",
    enabled: true,
  },
  {
    id: "R-012",
    code: "R-012",
    title: "سایر",
    severity: "low",
    weight: 20,
    defaultAction: "monitor",
    keywords: [],
    prompt: "دسته باقی‌مانده برای مواردی که در قوانین دیگر جای نمی‌گیرند.",
    enabled: false,
  },
];

const platforms: Platform[] = ["telegram", "twitter", "instagram"];
const channelTypes = ["کانال عمومی", "گروه خصوصی", "پروفایل شخصی", "کانال خبری"];
const publishers = [
  { n: "امیر رضایی", h: "@amirrz" },
  { n: "کانال آزادی", h: "@azadi_ch" },
  { n: "نگار حسینی", h: "@negarh" },
  { n: "علی محمدی", h: "@alimd" },
  { n: "خبرگزاری آزاد", h: "@freenews_ir" },
  { n: "سارا کریمی", h: "@sarak" },
  { n: "کاربر ناشناس", h: "@anon_9821" },
  { n: "محمد جعفری", h: "@mjafari" },
];

const sampleTexts = [
  "امشب ساعت ۱۸ در میدان اصلی شهر منتظرتان هستیم؛ فراخوان همه دوستان.",
  "آخرین اخبار از تحولات اقتصادی و نوسانات بازار ارز داخلی.",
  "این ویدیو باید همه ببینند! بازنشر کنید و منتشر کنید تا فردا همه بدانند.",
  "توضیحاتی درباره وضعیت جاده‌ها و ترافیک ورودی شهر برای مسافران.",
  "دعوت از تمامی افراد برای حضور در تجمع اعتراضی روز جمعه.",
  "بررسی وضعیت آب‌وهوا و بارش‌های احتمالی هفته آینده در نواحی شمالی.",
  "پیام مهم: در صورت مشاهده هرگونه محتوای مشکوک، فوراً گزارش دهید.",
  "کمپین جدید فرهنگی برای حمایت از هنرمندان جوان کشور آغاز به کار کرد.",
  "افشای اسناد محرمانه یک نهاد رسمی توسط یک منبع ناشناس.",
  "برنامه‌ریزی برای تظاهرات گسترده در چند شهر بزرگ کشور در حال انجام است.",
];

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

function makeTime(hoursAgo: number) {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  return `۱۴۰۳/۰۹/${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export const contents: ContentItem[] = Array.from({ length: 24 }, (_, i) => {
  const pub = publishers[i % publishers.length];
  const plt = platforms[i % platforms.length];
  const suspicious = i % 3 === 0 || i % 7 === 0;
  const reasons: ContentItem["reasons"] = suspicious
    ? (
        [
          "suspicious_user",
          "keyword_match",
          "rule_match",
          "high_risk_user",
        ] as const
      )
        .filter((_, k) => (i + k) % 2 === 0)
        .slice(0, 2)
    : [];
  return {
    id: `C-${1000 + i}`,
    publishedAt: makeTime(i * 0.7),
    text: sampleTexts[i % sampleTexts.length],
    publisher: pub.n,
    publisherHandle: pub.h,
    platform: plt,
    channelType: channelTypes[i % channelTypes.length],
    channelTitle: `کانال ${["البرز", "خبر امروز", "پیام مردم", "رصد"][i % 4]}`,
    contentId: `MSG-${20000 + i}`,
    link: `https://t.me/example/${20000 + i}`,
    suspicious,
    reasons,
  };
});

export const assessments: Assessment[] = contents
  .filter((c) => c.suspicious)
  .map((c, i) => {
    const p = policies[i % 6];
    const severity = p.severity;
    return {
      id: `A-${500 + i}`,
      contentId: c.contentId,
      text: c.text,
      violationCode: p.code,
      violationTitle: p.title,
      detectionReason: `تطابق ${1 + (i % 3)} کلیدواژه و ${1 + (i % 2)} قانون`,
      analyst: ["GPT-Guardian v2", "PersianRuleNet", "SOC-LLM"][i % 3],
      confidence: 72 + ((i * 7) % 26),
      riskScore: 60 + ((i * 11) % 40),
      history: (i * 3) % 12,
      severity,
      impact: 40 + ((i * 13) % 60),
      repetition: (i * 5) % 20,
      priority: severity,
    };
  });

const suggestedList: Violation["suggestedAction"][] = [
  "block",
  "confront",
  "sms",
  "monitor",
  "no_action",
];

export const violations: Violation[] = assessments.map((a, i) => {
  const c = contents.find((x) => x.contentId === a.contentId)!;
  const suggested = suggestedList[i % suggestedList.length];
  return {
    id: `V-${900 + i}`,
    priority: a.priority,
    title: a.violationTitle,
    description: a.text.slice(0, 60) + (a.text.length > 60 ? "…" : ""),
    offender: {
      name: c.publisher,
      handle: c.publisherHandle,
      platform: c.platform,
      userId: `UID-${9000 + i}`,
      historyCount: a.history,
      riskScore: a.riskScore,
    },
    suggestedAction: suggested,
    expertAction: "",
    expertComment: "",
    status: "pending",
    contentId: c.contentId,
    fullContent: c.text + " " + c.text,
    matchedRules: [
      { code: a.violationCode, title: a.violationTitle },
      { code: "R-004", title: "توهین به مقامات" },
    ].slice(0, (i % 2) + 1),
    detectionReason: a.detectionReason,
    risk: {
      score: a.riskScore,
      breakdown: [
        { label: "سابقه کاربر", value: a.history * 5 },
        { label: "تطابق کلیدواژه", value: 25 },
        { label: "شدت قانون", value: a.impact / 2 },
        { label: "میزان تکرار", value: a.repetition },
      ],
    },
    priorityBreakdown: [
      { label: "درجه اهمیت", value: a.impact },
      { label: "درجه تاثیر", value: a.impact - 5 },
      { label: "درجه تکرار", value: a.repetition },
      { label: "Confidence", value: a.confidence },
    ],
  };
});
