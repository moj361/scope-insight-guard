/**
 * Person Intelligence Profile — mock data (DEMO ONLY).
 * All people, accounts, positions and events are fictional.
 * Consumed ONLY by src/lib/services/personProfile.ts.
 */
import aliImg from "@/assets/person-ali.jpg";
import maryamImg from "@/assets/person-maryam.jpg";
import booksImg from "@/assets/avatar-books.jpg";
import mountainImg from "@/assets/avatar-mountain.jpg";

export type PersonPlatform = "telegram" | "bale" | "instagram" | "x" | "linkedin";
export type IdentityStatus = "verified" | "partial" | "anonymous";
export type MatchStatus = "verified" | "probable" | "possible" | "unverified";
export type Verification = "verified" | "needs_verification" | "unverified";
export type InfluenceLevel = "very_high" | "high" | "medium" | "low";
export type Severity = "critical" | "high" | "medium" | "low";
export type ViolationStatus = "confirmed" | "under_review" | "unconfirmed" | "dismissed";
export type ActionStatus = "done" | "in_progress" | "pending";

export interface LinkedAccount {
  id: string; platform: PersonPlatform; handle: string; displayName: string; image?: string;
  followers: number; posts: number; createdYear: number; lastActiveMin: number;
  match: MatchStatus; confidence: number; evidence: string[]; bio?: string;
}
export interface Position {
  id: string; title: string; org: string; unit?: string; period: string; current: boolean;
  verification: Verification; sources: { label: string; kind: "official" | "media" | "self_declared" | "analyst"; date: string }[];
}
export interface InfluenceIndicator { score: number; level: InfluenceLevel; note: string }
export interface ContentSample {
  id: string; platform: PersonPlatform; accountId: string; daysAgo: number; kind: "post" | "message" | "comment";
  text: string; topic: string; engagement: number; views: number; flagged?: boolean;
}
export interface Membership {
  id: string; name: string; platform: PersonPlatform; type: "group" | "channel"; role: "owner" | "admin" | "member";
  members: number; sinceYear: number; communityName: string;
}
export interface Relationship { id: string; name: string; relation: string; strength: "strong" | "medium" | "weak"; basis: string; verified: boolean }
export interface Violation {
  id: string; title: string; category: string; daysAgo: number; severity: Severity; status: ViolationStatus;
  attributionConfidence: number; accountId: string; summary: string;
  evidence: { label: string; kind: "screenshot" | "message" | "link" | "report"; daysAgo: number }[];
}
export interface ActionRecord {
  id: string; title: string; type: "notice" | "sms" | "monitor" | "restrict" | "referral" | "verify";
  daysAgo: number; status: ActionStatus; violationId?: string; result?: string; by: string;
}
export interface IdentityEvidence { id: string; label: string; kind: string; strength: "strong" | "medium" | "weak"; daysAgo: number }
export interface HistoryEvent { id: string; daysAgo: number; text: string; kind: "identity" | "violation" | "action" | "position" | "account" }

export interface PersonProfile {
  id: string;
  communityId: string;
  communityName: string;
  displayName: string;
  personCode: string;
  identityStatus: IdentityStatus;
  identityConfidence: number;
  primaryImage?: string; // verified identity photo — distinct from account images
  primaryImageNote?: string;
  headlinePosition?: { title: string; org: string; verification: Verification };
  influenceLevel: InfluenceLevel;
  lastActivityMin: number;
  summary: string;
  province: string;
  metrics: { accounts: number; communities: number; posts30d: number; audience: number; violations: number; pendingActions: number };
  accounts: LinkedAccount[];
  positions: Position[];
  influence: { organizational: InfluenceIndicator; audience: InfluenceIndicator; activity: InfluenceIndicator; observed: InfluenceIndicator };
  content: ContentSample[];
  memberships: Membership[];
  relationships: Relationship[];
  violations: Violation[];
  actions: ActionRecord[];
  identityEvidence: IdentityEvidence[];
  history: HistoryEvent[];
}

/* =========================================================== */
const ali: PersonProfile = {
  id: "ali-rezaei",
  communityId: "farhangian",
  communityName: "فرهنگیان",
  displayName: "علی رضایی",
  personCode: "PRS-10422",
  identityStatus: "verified",
  identityConfidence: 96,
  primaryImage: aliImg,
  primaryImageNote: "تصویر هویتی تأییدشده — منبع: اطلاعات رسمی سازمانی",
  headlinePosition: { title: "معاون آموزش متوسطه", org: "اداره کل آموزش و پرورش استان (نمونه)", verification: "verified" },
  influenceLevel: "very_high",
  lastActivityMin: 38,
  summary: "فرد شناسایی‌شده با جایگاه سازمانی مهم در حوزه آموزش متوسطه؛ مدیر چند کانال پرمخاطب صنفی و از چهره‌های پرارجاع در بحث‌های رتبه‌بندی و امتحانات.",
  province: "تهران",
  metrics: { accounts: 5, communities: 14, posts30d: 312, audience: 486_000, violations: 2, pendingActions: 1 },
  accounts: [
    { id: "a1", platform: "telegram", handle: "@rezaei_edu", displayName: "کانال رسمی علی رضایی", image: aliImg, followers: 214_000, posts: 4820, createdYear: 2017, lastActiveMin: 38, match: "verified", confidence: 98, evidence: ["تطابق شماره تماس ثبت‌شده", "معرفی رسمی در وب‌سایت سازمان", "تطابق تصویر هویتی"], bio: "اطلاع‌رسانی آموزش متوسطه و پاسخ به پرسش‌های همکاران" },
    { id: "a2", platform: "bale", handle: "@rezaei_official", displayName: "علی رضایی", image: aliImg, followers: 61_000, posts: 1290, createdYear: 2021, lastActiveMin: 240, match: "verified", confidence: 95, evidence: ["تأیید حساب رسمی در پیام‌رسان", "تطابق محتوا با کانال تلگرام"] },
    { id: "a3", platform: "instagram", handle: "ali.rezaei.edu", displayName: "Ali Rezaei | آموزش", image: booksImg, followers: 132_000, posts: 640, createdYear: 2019, lastActiveMin: 600, match: "probable", confidence: 84, evidence: ["پیوند در بیو کانال تلگرام", "انتشار هم‌زمان محتوای یکسان"], bio: "روایت‌های آموزشی و تجربه‌های کلاس" },
    { id: "a4", platform: "x", handle: "@a_rezaei_ir", displayName: "علی رضایی", image: mountainImg, followers: 48_500, posts: 3110, createdYear: 2016, lastActiveMin: 1440, match: "probable", confidence: 77, evidence: ["الگوی نگارشی مشابه", "ارجاع متقابل به کانال رسمی"] },
    { id: "a5", platform: "linkedin", handle: "ali-rezaei-edu", displayName: "Ali Rezaei", image: aliImg, followers: 30_500, posts: 85, createdYear: 2015, lastActiveMin: 7200, match: "verified", confidence: 92, evidence: ["سوابق شغلی منطبق با سمت رسمی", "تطابق تصویر هویتی"] },
  ],
  positions: [
    { id: "pos1", title: "معاون آموزش متوسطه", org: "اداره کل آموزش و پرورش استان (نمونه)", unit: "معاونت آموزش متوسطه", period: "۱۴۰۲ – اکنون", current: true, verification: "verified", sources: [{ label: "حکم انتصاب منتشرشده در پایگاه رسمی", kind: "official", date: "مهر ۱۴۰۲" }, { label: "گزارش خبرگزاری آموزشی", kind: "media", date: "مهر ۱۴۰۲" }] },
    { id: "pos2", title: "عضو کارگروه رتبه‌بندی معلمان", org: "کارگروه استانی رتبه‌بندی (نمونه)", period: "۱۴۰۳ – اکنون", current: true, verification: "verified", sources: [{ label: "صورت‌جلسه رسمی کارگروه", kind: "official", date: "فروردین ۱۴۰۳" }] },
    { id: "pos3", title: "مدیر دبیرستان", org: "دبیرستان نمونه دولتی (نمونه)", period: "۱۳۹۴ – ۱۴۰۲", current: false, verification: "verified", sources: [{ label: "سوابق سامانه منابع انسانی", kind: "official", date: "۱۴۰۲" }] },
    { id: "pos4", title: "دبیر ریاضی", org: "آموزش و پرورش ناحیه ۳ (نمونه)", period: "۱۳۸۴ – ۱۳۹۴", current: false, verification: "needs_verification", sources: [{ label: "اظهار در پروفایل لینکدین", kind: "self_declared", date: "—" }] },
  ],
  influence: {
    organizational: { score: 88, level: "very_high", note: "سمت رسمی با اختیار تصمیم‌گیری در حوزه آموزش متوسطه استان" },
    audience: { score: 82, level: "very_high", note: "حدود ۴۸۶ هزار مخاطب در ۵ حساب؛ بیشترین مخاطب در تلگرام" },
    activity: { score: 71, level: "high", note: "میانگین ۱۰ انتشار در روز در ۳۰ روز اخیر" },
    observed: { score: 79, level: "high", note: "بازنشر محتوای او در ۱۴ جامعه؛ ارجاع مکرر در بحث رتبه‌بندی" },
  },
  content: [
    { id: "c1", platform: "telegram", accountId: "a1", daysAgo: 0, kind: "post", text: "زمان‌بندی امتحانات نهایی خرداد پس از هماهنگی با ستاد منتشر می‌شود؛ از انتشار جداول غیررسمی خودداری کنید.", topic: "امتحانات", engagement: 9400, views: 182000 },
    { id: "c2", platform: "telegram", accountId: "a1", daysAgo: 1, kind: "post", text: "نتایج مرحله دوم رتبه‌بندی تا پایان هفته در سامانه بارگذاری خواهد شد. همکاران تا آن زمان صبور باشند.", topic: "رتبه‌بندی", engagement: 12100, views: 201000 },
    { id: "c3", platform: "instagram", accountId: "a3", daysAgo: 2, kind: "post", text: "روایت یک روز از بازدید مدارس شهرستان‌ها؛ مسائل زیرساختی هنوز اولویت اصلی است.", topic: "امور مدارس", engagement: 6800, views: 74000 },
    { id: "c4", platform: "x", accountId: "a4", daysAgo: 3, kind: "post", text: "بخشی از مطالبات معوق همکاران تا پایان ماه پرداخت می‌شود؛ پیگیری ادامه دارد.", topic: "حقوق و مزایا", engagement: 3100, views: 41000, flagged: true },
    { id: "c5", platform: "bale", accountId: "a2", daysAgo: 4, kind: "message", text: "اطلاعیه: جلسه هماهنگی مدیران مدارس متوسطه روز شنبه به‌صورت مجازی برگزار می‌شود.", topic: "امور مدارس", engagement: 1900, views: 28000 },
    { id: "c6", platform: "telegram", accountId: "a1", daysAgo: 6, kind: "post", text: "در پاسخ به پرسش‌ها: تأثیر معدل در کنکور ۱۴۰۵ طبق مصوبه قبلی است و تغییری نکرده است.", topic: "امتحانات", engagement: 8700, views: 166000 },
    { id: "c7", platform: "x", accountId: "a4", daysAgo: 9, kind: "comment", text: "جدولی که در برخی گروه‌ها دست‌به‌دست می‌شود اعتبار ندارد.", topic: "رتبه‌بندی", engagement: 900, views: 12000 },
    { id: "c8", platform: "linkedin", accountId: "a5", daysAgo: 14, kind: "post", text: "گزارش عملکرد شش‌ماهه معاونت آموزش متوسطه و برنامه‌های نیمسال دوم.", topic: "تغییرات آموزشی", engagement: 420, views: 5100 },
    { id: "c9", platform: "telegram", accountId: "a1", daysAgo: 21, kind: "post", text: "فراخوان جذب داوطلب برای طرح کلاس‌های جبرانی تابستان.", topic: "امور مدارس", engagement: 5200, views: 97000 },
  ],
  memberships: [
    { id: "m1", name: "کانال رسمی علی رضایی", platform: "telegram", type: "channel", role: "owner", members: 214000, sinceYear: 2017, communityName: "فرهنگیان" },
    { id: "m2", name: "حلقه مدیران مدارس متوسطه", platform: "telegram", type: "group", role: "admin", members: 3800, sinceYear: 2019, communityName: "مدیران مدارس" },
    { id: "m3", name: "شبکه دبیران ریاضی", platform: "telegram", type: "group", role: "admin", members: 12400, sinceYear: 2016, communityName: "معلمان" },
    { id: "m4", name: "اطلاع‌رسانی رتبه‌بندی", platform: "bale", type: "channel", role: "admin", members: 41000, sinceYear: 2022, communityName: "معلمان" },
    { id: "m5", name: "صدای فرهنگیان", platform: "telegram", type: "channel", role: "member", members: 98000, sinceYear: 2018, communityName: "فرهنگیان" },
    { id: "m6", name: "خبرنامه امتحانات نهایی", platform: "telegram", type: "channel", role: "member", members: 76000, sinceYear: 2020, communityName: "آموزش و امتحانات" },
  ],
  relationships: [
    { id: "r1", name: "مریم احمدی", relation: "هم‌مدیر گروه", strength: "strong", basis: "مدیریت مشترک «شبکه دبیران ریاضی»", verified: true },
    { id: "r2", name: "حمید کریمی", relation: "همکار سازمانی", strength: "medium", basis: "عضویت مشترک در کارگروه رتبه‌بندی", verified: true },
    { id: "r3", name: "کاربر ناشناس ۰۰۳", relation: "تعامل مکرر", strength: "weak", basis: "پاسخ‌ها و بازنشرهای مکرر در کانال", verified: false },
    { id: "r4", name: "سمیه نوری", relation: "بازنشر متقابل", strength: "medium", basis: "بازنشر محتوای یکدیگر در ۳ جامعه", verified: false },
  ],
  violations: [
    { id: "v1", title: "انتشار اطلاعات پرداخت پیش از اعلام رسمی", category: "انتشار اطلاعات نادرست/زودهنگام", daysAgo: 3, severity: "medium", status: "confirmed", attributionConfidence: 91, accountId: "a4", summary: "اعلام زمان پرداخت معوقات پیش از تصویب نهایی که موجب موج پرسش و نارضایتی در گروه‌ها شد.", evidence: [{ label: "تصویر پست در X", kind: "screenshot", daysAgo: 3 }, { label: "بازنشر در ۹ گروه", kind: "link", daysAgo: 2 }] },
    { id: "v2", title: "افشای فهرست اسامی در گروه مدیران", category: "حریم خصوصی", daysAgo: 64, severity: "high", status: "confirmed", attributionConfidence: 88, accountId: "a1", summary: "ارسال فایل حاوی اسامی و کد پرسنلی همکاران در گروه عمومی.", evidence: [{ label: "پیام اصلی در گروه", kind: "message", daysAgo: 64 }, { label: "گزارش کاربر", kind: "report", daysAgo: 63 }] },
    { id: "v3", title: "گزارش کاربر درباره محتوای توهین‌آمیز", category: "رفتار نامناسب", daysAgo: 120, severity: "low", status: "dismissed", attributionConfidence: 40, accountId: "a4", summary: "بررسی نشان داد محتوای گزارش‌شده متعلق به حساب دیگری بوده است.", evidence: [{ label: "گزارش کاربر", kind: "report", daysAgo: 120 }] },
  ],
  actions: [
    { id: "ac1", title: "ارسال تذکر رسمی", type: "notice", daysAgo: 60, status: "done", violationId: "v2", result: "حذف فایل ظرف ۲ ساعت و عذرخواهی در گروه", by: "کارشناس پرونده" },
    { id: "ac2", title: "پیامک اطلاع‌رسانی", type: "sms", daysAgo: 2, status: "done", violationId: "v1", result: "اصلاحیه منتشر شد", by: "سامانه" },
    { id: "ac3", title: "پایش ویژه حساب X", type: "monitor", daysAgo: 2, status: "in_progress", violationId: "v1", by: "کارشناس پرونده" },
    { id: "ac4", title: "ارجاع به واحد حقوقی برای بررسی تکرار", type: "referral", daysAgo: 0, status: "pending", violationId: "v1", by: "سرپرست" },
  ],
  identityEvidence: [
    { id: "ie1", label: "تطابق تصویر هویتی با اطلاعات رسمی", kind: "تصویر", strength: "strong", daysAgo: 400 },
    { id: "ie2", label: "معرفی کانال در وب‌سایت رسمی سازمان", kind: "منبع رسمی", strength: "strong", daysAgo: 380 },
    { id: "ie3", label: "تطابق شماره تماس ثبت‌شده حساب تلگرام", kind: "اطلاعات تماس", strength: "strong", daysAgo: 300 },
    { id: "ie4", label: "الگوی نگارشی مشترک در X و تلگرام", kind: "تحلیل سبک", strength: "medium", daysAgo: 90 },
  ],
  history: [
    { id: "h1", daysAgo: 0, text: "ارجاع به واحد حقوقی ثبت شد", kind: "action" },
    { id: "h2", daysAgo: 3, text: "تخلف «انتشار اطلاعات پرداخت» تأیید شد", kind: "violation" },
    { id: "h3", daysAgo: 64, text: "تخلف «افشای فهرست اسامی» ثبت و تأیید شد", kind: "violation" },
    { id: "h4", daysAgo: 300, text: "حساب LinkedIn به هویت متصل شد", kind: "account" },
    { id: "h5", daysAgo: 400, text: "هویت با اطلاعات رسمی تأیید شد", kind: "identity" },
    { id: "h6", daysAgo: 720, text: "انتصاب به سمت معاون آموزش متوسطه", kind: "position" },
  ],
};

/* =========================================================== */
const maryam: PersonProfile = {
  id: "maryam-ahmadi",
  communityId: "farhangian",
  communityName: "فرهنگیان",
  displayName: "مریم احمدی",
  personCode: "PRS-20871",
  identityStatus: "partial",
  identityConfidence: 68,
  primaryImage: maryamImg,
  primaryImageNote: "تصویر احتمالی — تطبیق جزئی، نیازمند تأیید",
  headlinePosition: { title: "کارشناس مسئول سنجش (احتمالی)", org: "اداره سنجش و ارزشیابی ناحیه (نمونه)", verification: "needs_verification" },
  influenceLevel: "high",
  lastActivityMin: 190,
  summary: "هویت به‌صورت جزئی شناسایی شده است. ۳ حساب مرتبط دارد و جایگاه سازمانی احتمالی او در حوزه سنجش نیازمند تأیید است. یک تخلف در حال بررسی است.",
  province: "اصفهان",
  metrics: { accounts: 3, communities: 8, posts30d: 146, audience: 129_000, violations: 1, pendingActions: 2 },
  accounts: [
    { id: "b1", platform: "telegram", handle: "@ahmadi_sanjesh", displayName: "سنجش و ارزشیابی | احمدی", image: booksImg, followers: 87_000, posts: 2310, createdYear: 2019, lastActiveMin: 190, match: "probable", confidence: 79, evidence: ["امضای «م. احمدی» در پیام‌ها", "اشاره به محل خدمت در پیام سنجاق‌شده"], bio: "نمونه‌سؤال، بودجه‌بندی و اخبار امتحانات" },
    { id: "b2", platform: "instagram", handle: "maryam.ahmadi.teach", displayName: "مریم احمدی", image: maryamImg, followers: 36_000, posts: 410, createdYear: 2020, lastActiveMin: 1300, match: "possible", confidence: 61, evidence: ["تشابه نام و تصویر", "پیوند به کانال تلگرام در یک استوری"] },
    { id: "b3", platform: "x", handle: "@m_ahmadi_edu", displayName: "M. Ahmadi", followers: 6_000, posts: 880, createdYear: 2022, lastActiveMin: 4300, match: "unverified", confidence: 38, evidence: ["تشابه نام کاربری"] },
  ],
  positions: [
    { id: "pq1", title: "کارشناس مسئول سنجش", org: "اداره سنجش و ارزشیابی ناحیه (نمونه)", period: "۱۴۰۱ – اکنون (اظهارشده)", current: true, verification: "needs_verification", sources: [{ label: "پیام سنجاق‌شده در کانال تلگرام", kind: "self_declared", date: "۱۴۰۳" }, { label: "اشاره در یک خبر محلی (نام مشابه)", kind: "media", date: "۱۴۰۲" }] },
    { id: "pq2", title: "دبیر ادبیات", org: "دبیرستان دخترانه (نمونه)", period: "۱۳۹۲ – ۱۴۰۱", current: false, verification: "unverified", sources: [{ label: "بیو اینستاگرام", kind: "self_declared", date: "—" }] },
  ],
  influence: {
    organizational: { score: 42, level: "medium", note: "در صورت تأیید سمت، نقش اجرایی در سنجش ناحیه — فعلاً تأییدنشده" },
    audience: { score: 64, level: "high", note: "حدود ۱۲۹ هزار مخاطب؛ عمدتاً در کانال تلگرام" },
    activity: { score: 58, level: "medium", note: "میانگین ۵ انتشار در روز؛ اوج در فصل امتحانات" },
    observed: { score: 66, level: "high", note: "منبع پرارجاع برای نمونه‌سؤال و بودجه‌بندی در ۸ جامعه" },
  },
  content: [
    { id: "d1", platform: "telegram", accountId: "b1", daysAgo: 0, kind: "post", text: "بودجه‌بندی پیشنهادی امتحان ادبیات پایه دوازدهم؛ منتظر اطلاعیه رسمی باشید.", topic: "امتحانات", engagement: 5400, views: 71000 },
    { id: "d2", platform: "telegram", accountId: "b1", daysAgo: 2, kind: "post", text: "فایلی که با عنوان «سؤالات لو رفته» منتشر شده جعلی است؛ مراقب کلاهبرداری باشید.", topic: "امتحانات", engagement: 7900, views: 88000 },
    { id: "d3", platform: "telegram", accountId: "b1", daysAgo: 5, kind: "post", text: "نمونه‌سؤالات تشریحی فصل سوم برای تمرین دانش‌آموزان.", topic: "امتحانات", engagement: 3100, views: 52000, flagged: true },
    { id: "d4", platform: "instagram", accountId: "b2", daysAgo: 7, kind: "post", text: "چند پیشنهاد برای کاهش اضطراب امتحان در کلاس.", topic: "تغییرات آموزشی", engagement: 2600, views: 19000 },
    { id: "d5", platform: "x", accountId: "b3", daysAgo: 12, kind: "comment", text: "حق‌التدریسی‌ها هم باید در رتبه‌بندی دیده شوند.", topic: "رتبه‌بندی", engagement: 210, views: 3100 },
    { id: "d6", platform: "telegram", accountId: "b1", daysAgo: 18, kind: "message", text: "پاسخ به پرسش‌های همکاران درباره نحوه ثبت نمرات مستمر.", topic: "امور مدارس", engagement: 1200, views: 24000 },
  ],
  memberships: [
    { id: "n1", name: "سنجش و ارزشیابی | احمدی", platform: "telegram", type: "channel", role: "owner", members: 87000, sinceYear: 2019, communityName: "آموزش و امتحانات" },
    { id: "n2", name: "شبکه دبیران ریاضی", platform: "telegram", type: "group", role: "admin", members: 12400, sinceYear: 2020, communityName: "معلمان" },
    { id: "n3", name: "دبیران ادبیات اصفهان", platform: "telegram", type: "group", role: "member", members: 2100, sinceYear: 2018, communityName: "معلمان" },
    { id: "n4", name: "خبرنامه امتحانات نهایی", platform: "telegram", type: "channel", role: "member", members: 76000, sinceYear: 2021, communityName: "آموزش و امتحانات" },
  ],
  relationships: [
    { id: "s1", name: "علی رضایی", relation: "هم‌مدیر گروه", strength: "strong", basis: "مدیریت مشترک «شبکه دبیران ریاضی»", verified: true },
    { id: "s2", name: "الهام قاسمی", relation: "بازنشر متقابل", strength: "medium", basis: "بازنشر نمونه‌سؤال‌ها", verified: false },
  ],
  violations: [
    { id: "w1", title: "احتمال انتشار سؤالات امتحانی پیش از برگزاری", category: "افشای اطلاعات آزمون", daysAgo: 5, severity: "high", status: "under_review", attributionConfidence: 63, accountId: "b1", summary: "تشابه بخشی از «نمونه‌سؤالات» منتشرشده با سؤالات یک آزمون ناحیه‌ای؛ انتساب و ماهیت تخلف در حال بررسی است.", evidence: [{ label: "پیام کانال", kind: "message", daysAgo: 5 }, { label: "گزارش مقایسه سؤالات", kind: "report", daysAgo: 3 }] },
  ],
  actions: [
    { id: "bc1", title: "تأیید سمت سازمانی از مرجع رسمی", type: "verify", daysAgo: 4, status: "in_progress", by: "تحلیلگر هویت" },
    { id: "bc2", title: "بررسی تطابق سؤالات با مرجع آزمون", type: "referral", daysAgo: 3, status: "pending", violationId: "w1", by: "کارشناس پرونده" },
    { id: "bc3", title: "پایش کانال تلگرام", type: "monitor", daysAgo: 5, status: "in_progress", violationId: "w1", by: "سامانه" },
  ],
  identityEvidence: [
    { id: "je1", label: "امضای نام در پیام‌های کانال", kind: "محتوا", strength: "medium", daysAgo: 60 },
    { id: "je2", label: "تشابه تصویر پروفایل اینستاگرام", kind: "تصویر", strength: "weak", daysAgo: 40 },
    { id: "je3", label: "اشاره به محل خدمت در پیام سنجاق‌شده", kind: "اظهار شخصی", strength: "medium", daysAgo: 30 },
  ],
  history: [
    { id: "g1", daysAgo: 3, text: "پرونده تطابق سؤالات به مرجع آزمون ارجاع شد", kind: "action" },
    { id: "g2", daysAgo: 5, text: "گزارش احتمال انتشار سؤالات ثبت شد (در حال بررسی)", kind: "violation" },
    { id: "g3", daysAgo: 30, text: "سمت سازمانی احتمالی شناسایی شد — نیازمند تأیید", kind: "position" },
    { id: "g4", daysAgo: 40, text: "حساب اینستاگرام به‌عنوان تطابق احتمالی افزوده شد", kind: "account" },
  ],
};

/* =========================================================== */
const anon: PersonProfile = {
  id: "anon-003",
  communityId: "farhangian",
  communityName: "فرهنگیان",
  displayName: "کاربر ناشناس ۰۰۳",
  personCode: "PRS-ANON-003",
  identityStatus: "anonymous",
  identityConfidence: 0,
  influenceLevel: "medium",
  lastActivityMin: 25,
  summary: "هویت واقعی ناشناخته است. دو حساب با الگوی رفتاری مشترک به این فرد نسبت داده شده‌اند. هیچ سمت رسمی شناخته‌شده‌ای ندارد و یک گزارش تخلف تأییدنشده دارد.",
  province: "نامشخص",
  metrics: { accounts: 2, communities: 5, posts30d: 228, audience: 23_400, violations: 0, pendingActions: 1 },
  accounts: [
    { id: "x1", platform: "telegram", handle: "@moallem_bi_nam", displayName: "معلم بی‌نام", image: mountainImg, followers: 19_800, posts: 3400, createdYear: 2023, lastActiveMin: 25, match: "probable", confidence: 72, evidence: ["الگوی زمانی انتشار مشابه با حساب X", "عبارات و غلط‌های املایی مشترک"], bio: "روایت‌های بی‌پرده از مدرسه" },
    { id: "x2", platform: "x", handle: "@teacher_anon03", displayName: "teacher", followers: 3_600, posts: 5100, createdYear: 2024, lastActiveMin: 90, match: "possible", confidence: 55, evidence: ["بازنشر هم‌زمان محتوا با حساب تلگرام"] },
  ],
  positions: [],
  influence: {
    organizational: { score: 0, level: "low", note: "جایگاه سازمانی شناخته‌شده‌ای وجود ندارد" },
    audience: { score: 34, level: "medium", note: "حدود ۲۳ هزار مخاطب در ۲ حساب" },
    activity: { score: 81, level: "high", note: "فعالیت بسیار زیاد — میانگین ۷ انتشار در روز، اغلب شبانه" },
    observed: { score: 47, level: "medium", note: "محتوای او در ۵ جامعه بازنشر شده است" },
  },
  content: [
    { id: "e1", platform: "telegram", accountId: "x1", daysAgo: 0, kind: "post", text: "باز هم وعده؛ کسی پاسخگوی معوقات نیست.", topic: "حقوق و مزایا", engagement: 2900, views: 21000 },
    { id: "e2", platform: "x", accountId: "x2", daysAgo: 1, kind: "post", text: "اسکرین‌شات‌هایی از گروه مدیران رسیده که نشان می‌دهد نتایج رتبه‌بندی دست‌کاری شده (تأییدنشده).", topic: "رتبه‌بندی", engagement: 1700, views: 14000, flagged: true },
    { id: "e3", platform: "telegram", accountId: "x1", daysAgo: 3, kind: "post", text: "روایت یک همکار از کلاس ۴۰ نفره در مدرسه‌ای بدون سرمایش.", topic: "امور مدارس", engagement: 2200, views: 18000 },
    { id: "e4", platform: "telegram", accountId: "x1", daysAgo: 8, kind: "message", text: "چه کسی از جزئیات بیمه تکمیلی جدید خبر دارد؟", topic: "حقوق و مزایا", engagement: 640, views: 9000 },
    { id: "e5", platform: "x", accountId: "x2", daysAgo: 15, kind: "comment", text: "این جدول جعلی است؛ منبع رسمی ندارد.", topic: "رتبه‌بندی", engagement: 120, views: 2000 },
  ],
  memberships: [
    { id: "o1", name: "معلم بی‌نام", platform: "telegram", type: "channel", role: "owner", members: 19800, sinceYear: 2023, communityName: "معلمان" },
    { id: "o2", name: "صدای فرهنگیان", platform: "telegram", type: "channel", role: "member", members: 98000, sinceYear: 2023, communityName: "فرهنگیان" },
    { id: "o3", name: "حلقه معلمان حق‌التدریس", platform: "telegram", type: "group", role: "member", members: 5600, sinceYear: 2024, communityName: "معلمان" },
  ],
  relationships: [
    { id: "t1", name: "علی رضایی", relation: "تعامل مکرر", strength: "weak", basis: "پاسخ‌ها و بازنشرهای مکرر", verified: false },
  ],
  violations: [
    { id: "u1", title: "گزارش انتشار ادعای دست‌کاری نتایج رتبه‌بندی", category: "انتشار اطلاعات نادرست", daysAgo: 1, severity: "medium", status: "unconfirmed", attributionConfidence: 52, accountId: "x2", summary: "یک گزارش کاربری ثبت شده است. صحت ادعا و انتساب حساب به این فرد هنوز تأیید نشده و این مورد تخلف قطعی محسوب نمی‌شود.", evidence: [{ label: "گزارش کاربر", kind: "report", daysAgo: 1 }, { label: "پیوند پست", kind: "link", daysAgo: 1 }] },
  ],
  actions: [
    { id: "xc1", title: "بررسی اولیه گزارش و صحت‌سنجی اسکرین‌شات‌ها", type: "verify", daysAgo: 1, status: "pending", violationId: "u1", by: "کارشناس پرونده" },
  ],
  identityEvidence: [
    { id: "ke1", label: "الگوی زمانی انتشار مشترک دو حساب", kind: "تحلیل رفتار", strength: "medium", daysAgo: 20 },
    { id: "ke2", label: "عبارات و خطاهای نگارشی مشترک", kind: "تحلیل سبک", strength: "weak", daysAgo: 20 },
  ],
  history: [
    { id: "k1", daysAgo: 1, text: "گزارش تأییدنشده ثبت شد", kind: "violation" },
    { id: "k2", daysAgo: 20, text: "حساب X به‌عنوان تطابق احتمالی افزوده شد", kind: "account" },
    { id: "k3", daysAgo: 60, text: "پروفایل ناشناس از روی کانال تلگرام ایجاد شد", kind: "identity" },
  ],
};

export const MOCK_PERSON_PROFILES: Record<string, PersonProfile> = { [ali.id]: ali, [maryam.id]: maryam, [anon.id]: anon };
/** Order shown first in Community Profile → People */
export const DEMO_PERSON_IDS = [ali.id, maryam.id, anon.id];
