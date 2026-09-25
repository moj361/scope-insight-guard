/**
 * Situation Room — mock data (MVP).
 * Replace with FastAPI responses via src/lib/services/situationRoom.ts.
 * UI components must NOT import this file directly.
 */

export interface Country {
  id: string; // ISO-3 (matches world map feature id)
  name: string;
  nameFa?: string;
  hasTaxonomy: boolean; // country-specific taxonomy available
}

export interface Province {
  id: string;
  countryId: string;
  name: string;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Category {
  id: string;
  countryId: string;
  name: string;
  subcategories: Subcategory[];
}

export interface CaseConnection {
  caseId: string;
  title: string;
  /** Country the case belongs to */
  countryId: string;
  /** Subcategory the case is attached to (if any) */
  subcategoryId?: string;
  /** Route of the EXISTING Case Workspace */
  route: "/";
  status: "active";
}

/* ---------------- Countries ---------------- */
export const MOCK_COUNTRIES_WITH_TAXONOMY: Record<string, { nameFa: string }> = {
  IRN: { nameFa: "ایران" },
};

/* ---------------- Iran provinces / cities ---------------- */
const P = (id: string, name: string, cities: string[]) => ({ id, name, cities });

const IRAN_GEO = [
  P("tehran", "تهران", ["تهران", "شهریار", "اسلامشهر", "ورامین", "دماوند"]),
  P("alborz", "البرز", ["کرج", "فردیس", "نظرآباد"]),
  P("isfahan", "اصفهان", ["اصفهان", "کاشان", "نجف‌آباد", "خمینی‌شهر"]),
  P("fars", "فارس", ["شیراز", "مرودشت", "کازرون", "جهرم"]),
  P("khorasan-razavi", "خراسان رضوی", ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه"]),
  P("east-azerbaijan", "آذربایجان شرقی", ["تبریز", "مراغه", "مرند"]),
  P("west-azerbaijan", "آذربایجان غربی", ["ارومیه", "خوی", "مهاباد"]),
  P("ardabil", "اردبیل", ["اردبیل", "پارس‌آباد", "مشگین‌شهر"]),
  P("khuzestan", "خوزستان", ["اهواز", "دزفول", "آبادان", "خرمشهر"]),
  P("gilan", "گیلان", ["رشت", "بندر انزلی", "لاهیجان"]),
  P("mazandaran", "مازندران", ["ساری", "بابل", "آمل", "قائم‌شهر"]),
  P("golestan", "گلستان", ["گرگان", "گنبد کاووس"]),
  P("kerman", "کرمان", ["کرمان", "سیرجان", "رفسنجان", "بم"]),
  P("sistan-baluchestan", "سیستان و بلوچستان", ["زاهدان", "چابهار", "زابل", "ایرانشهر"]),
  P("hormozgan", "هرمزگان", ["بندرعباس", "قشم", "کیش"]),
  P("bushehr", "بوشهر", ["بوشهر", "برازجان", "کنگان"]),
  P("kermanshah", "کرمانشاه", ["کرمانشاه", "اسلام‌آباد غرب"]),
  P("kurdistan", "کردستان", ["سنندج", "سقز", "مریوان"]),
  P("hamadan", "همدان", ["همدان", "ملایر"]),
  P("lorestan", "لرستان", ["خرم‌آباد", "بروجرد"]),
  P("ilam", "ایلام", ["ایلام", "دهلران"]),
  P("markazi", "مرکزی", ["اراک", "ساوه"]),
  P("qom", "قم", ["قم"]),
  P("qazvin", "قزوین", ["قزوین", "تاکستان"]),
  P("zanjan", "زنجان", ["زنجان", "ابهر"]),
  P("semnan", "سمنان", ["سمنان", "شاهرود"]),
  P("yazd", "یزد", ["یزد", "میبد", "اردکان"]),
  P("chaharmahal", "چهارمحال و بختیاری", ["شهرکرد", "بروجن"]),
  P("kohgiluyeh", "کهگیلویه و بویراحمد", ["یاسوج", "دوگنبدان"]),
  P("north-khorasan", "خراسان شمالی", ["بجنورد", "شیروان"]),
  P("south-khorasan", "خراسان جنوبی", ["بیرجند", "طبس"]),
];

export const MOCK_PROVINCES: Province[] = IRAN_GEO.map((p) => ({
  id: p.id,
  countryId: "IRN",
  name: p.name,
}));

export const MOCK_CITIES: City[] = IRAN_GEO.flatMap((p) =>
  p.cities.map((c, i) => ({ id: `${p.id}-${i + 1}`, provinceId: p.id, name: c })),
);

/* ---------------- Iran taxonomy (exact, do not edit names) ---------------- */
const C = (id: string, name: string, subs: string[]): Category => ({
  id,
  countryId: "IRN",
  name,
  subcategories: subs.map((s, i) => ({
    id: id === "security" && s === "پرونده الف" ? "case-alfa" : `${id}-${i + 1}`,
    categoryId: id,
    name: s,
  })),
});

export const MOCK_CATEGORIES: Category[] = [
  C("media", "رسانه", [
    "بلاگر و اینفلوئنسرها", "نشریات و روزنامه‌ها", "خبرگزاری‌ها", "صداوسیما",
    "شبکه‌های استانی", "رادیو", "پادکست", "یوتیوبرها", "رسانه‌های مستقل",
  ]),
  C("economy", "اقتصادی", [
    "بورس ایران", "ارز دیجیتال", "بورس بین‌الملل", "طلا و سکه", "دلار و ارز",
    "مسکن و املاک", "خودرو", "بانکداری", "مالیات و بیمه", "صرافی", "لیزینگ",
    "بازاریابی شبکه‌ای",
  ]),
  C("education", "آموزشی", [
    "کنکور و آزمون‌ها", "آموزشگاه ها", "مدارس", "دانشگاه ها",
    "فنی‌وحرفه‌ای و هنرستان‌ها", "تیزهوشان و سمپاد", "مدارس دولتی",
    "مدارس غیرانتفاعی", "مدارس بین‌المللی", "مدارس استثنایی", "معلمان", "مدیران مدرسه",
  ]),
  C("business", "تجارت و کسب‌وکار", [
    "خرید و فروش خدمات", "فروشگاه‌های آنلاین", "صادرات و واردات",
    "بازاریابی و فروش", "اصناف", "استارتاپ",
  ]),
  C("health", "سلامت و پزشکی", [
    "دارو", "تجهیزات پزشکی", "مامایی و زنان و زایمان", "طب سنتی و طب اسلامی",
    "تناسب اندام", "روان‌شناسی و مشاوره", "زیبایی و پوست", "پرستاران و کادر درمان",
    "دندان‌پزشکی", "فیزیوتراپی", "مراکز سلامت", "بیمارستان‌ها و درمانگاه‌ها",
    "کلینیک‌ها", "تکنسین‌های آزمایشگاه",
  ]),
  C("politics", "سیاسی", [
    "جبهه پایداری", "جبهه اصول‌گرا", "جبهه اصلاحات", "جبهه مشارکت", "جبهه نفاق",
    "جبهه سلطنت‌طلب", "جبهه دولت بهار", "مستقل‌ها",
  ]),
  C("lifestyle", "فرهنگی، اجتماعی و سبک زندگی", [
    "اعتیاد", "مشروبات", "سیگار و قلیان", "روابط جنسی خارج از چارچوب", "صیغه",
    "حجاب", "قهوه‌خانه", "کافه ها", "خدمات ماساژ", "سالن‌های زیبایی",
  ]),
  C("religion", "مذهبی", [
    "حوزه‌های علمیه", "مسیحیت", "یهودیت", "مداحان", "قرآن و حدیث", "مساجد",
    "هیئت‌ها", "پرسش و پاسخ دینی، معارف و تبلیغ اسلام", "حج و زیارت", "اهل سنت",
    "زرتشتی", "بهائیت", "اماکن مذهبی، بقاع امامان و امامزادگان",
  ]),
  C("military", "نظامی", [
    "سپاه", "ستاد کل", "فراجا", "ارتش", "تجهیزات نظامی",
    "وزارت دفاع و پشتیبانی نیروهای مسلح", "موساد", "ارتش آمریکا", "ارتش اسرائیل",
  ]),
  C("art", "هنری", [
    "انیمیشن", "سریال و نمایش خانگی", "موسیقی پاپ", "موسیقی رپ", "تئاتر",
    "سینما و فیلم", "شعر و فلسفه", "عکاسی",
  ]),
  C("sports", "ورزشی", [
    "اسنوبرد", "دوومیدانی", "ورزش‌های رزمی", "بسکتبال", "فوتبال ایران", "فوتبال جهان",
    "کشتی", "والیبال", "بدنسازی", "شنا", "هواداران استقلال", "هواداران پرسپولیس",
  ]),
  C("environment", "محیط زیست", ["جنگل‌ها و مراتع", "آلودگی هوا", "پسماند و بازیافت", "آب"]),
  C("women", "زنان", ["موتورسواری زنان", "اشتغال زنان", "حجاب", "استادیوم زنان"]),
  C("travel", "سفر و گردشگری", ["تورهای گردشگری", "هتل‌ها", "مهاجرت"]),
  C("security", "امنیتی", ["پرونده الف"]),
];

/* ---------------- Case connections ----------------
 * ONLY ONE active case exists in the MVP.
 * "دلار و ارز" (economy-5) is intentionally NOT connected.
 */
export const MOCK_CASE_CONNECTIONS: CaseConnection[] = [
  {
    caseId: "case-alfa",
    title: "پرونده الف",
    countryId: "IRN",
    subcategoryId: "case-alfa",
    route: "/", // existing Case Workspace
    status: "active",
  },
];
