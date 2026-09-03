/**
 * Data service layer.
 *
 * All UI components consume data through this module. To connect to a real
 * FastAPI backend later, replace the mock returns with fetch() calls — the
 * signatures below are the API contract.
 */
import { authFetch } from "@/lib/services/auth";
import {
  assessments as mockAssessments,
  caseInfo as mockCase,
  contents as mockContents,
  kpis as mockKpis,
  policies as mockPolicies,
  policyCategories as mockPolicyCategories,
  violations as mockViolations,
} from "@/lib/mock/data";
import type {
  Assessment,
  CaseInfo,
  ContentItem,
  KpiStat,
  Policy,
  PolicyCategory,
  Violation,
} from "@/lib/mock/types";

const delay = <T,>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const investigationService = {
  getCase: (): Promise<CaseInfo> => delay(mockCase),
  // اتصال KPI ها به بک‌اند با پشتیبان‌گیری هوشمند
  getKpis: async (): Promise<KpiStat[]> => {
    try {
      const res = await authFetch("/api/v1/dashboard/kpis");
      if (!res.ok) return mockKpis; // اگر بک‌اند در دسترس نبود، دیتای موک را لود کن
      return await res.json();
    } catch (error) {
      console.error("Dashboard KPI Error:", error);
      return mockKpis;
    }
  },
  // اتصال نمودار دسته‌بندی‌ها به بک‌اند
  getPolicyCategories: async (): Promise<PolicyCategory[]> => {
    try {
      const res = await authFetch("/api/v1/dashboard/policy-categories");
      if (!res.ok) return mockPolicyCategories; 
      return await res.json();
    } catch (error) {
      console.error("Dashboard Categories Error:", error);
      return mockPolicyCategories;
    }
  },
  getPolicies: async (): Promise<Policy[]> => {
    try {
      const response = await authFetch("/api/v1/policies/");
      
      if (!response.ok) {
        console.error("Backend Error:", response.status);
        return []; 
      }
      
      const backendData = await response.json();
      
      // آرایه مقادیر مجاز برای فرانت‌اند
      const validSeverities = ["critical", "high", "medium", "low"];
      const validActions = ["confront", "sms", "monitor", "block", "no_action"];
      
      const defaultTiers = { first: "sms", second: "sms", third: "block", exceeded: "confront" };

      return backendData.map((item: any) => {
        // ۱. استانداردسازی سطح اهمیت (حروف کوچک و بررسی اعتبار)
        const rawSeverity = (item.severity || "").toLowerCase();
        const safeSeverity = validSeverities.includes(rawSeverity) ? rawSeverity : "medium";

        // ۲. استانداردسازی اکشن پیش‌فرض
        const rawAction = (item.default_recomned || "").toLowerCase();
        const safeAction = validActions.includes(rawAction) ? rawAction : "monitor";

        const rawStatus = String(item.status || "active").toLowerCase();
        const isEnabled = rawStatus === "active" || rawStatus === "true" || rawStatus === "1";

        return {
          id: item.id || Math.random().toString(),
          code: item.code || "-",
          title: item.title || "بدون عنوان",
          severity: safeSeverity as Policy["severity"], // استفاده از مقدار امن
          weight: typeof item.weight === "number" ? item.weight : 50,
          defaultAction: safeAction as Policy["defaultAction"], // استفاده از اکشن امن
          tieredActions: item.tiered_actions && typeof item.tiered_actions === 'object'
            ? item.tiered_actions 
            : defaultTiers,
          keywords: typeof item.keywords === 'string' 
            ? item.keywords.split(",").map((k: string) => k.trim()).filter(Boolean) 
            : [], 
          prompt: item.prompt || "",
          enabled: isEnabled,
        };
      });
      
    } catch (error) {
      console.error("Connection Error:", error);
      return []; 
    }
  },
  savePolicy: async (p: Policy): Promise<Policy> => {
    // تبدیل ساختار فرانت‌اند به دیتابیس
    const payload = {
      title: p.title,
      severity: p.severity,
      weight: Number(p.weight) || 50,
      default_recomned: p.defaultAction,
      tiered_actions: p.tieredActions,
      keywords: p.keywords.join(","), // تبدیل آرایه به رشته
      prompt: p.prompt,
      status: p.enabled ? "active" : "inactive"
    };

    const res = await authFetch(`/api/v1/policies/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("خطا در ذخیره قانون");
    return p; // برگرداندن خود آبجکت برای آپدیت شدن UI
  },
  getContents: async (): Promise<ContentItem[]> => {
    try {
      const res = await authFetch("/api/v1/contents/");
      
      if (!res.ok) {
        console.error("Backend Error (Contents):", res.status);
        return [];
      }
      
      const backendData = await res.json();
      
      return backendData.map((item: any) => {
        const firstName = item.account?.first_name || "";
        const lastName = item.account?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: item.id || Math.random().toString(),
          // به جای تبدیل به fa-IR، دیتای خام را پاس می‌دهیم
          publishedAt: item.publish_time ? item.publish_time : new Date().toISOString(),
          text: item.body || "[بدون متن]",
          publisher: fullName || item.account?.username || "کاربر ناشناس",
          publisherHandle: item.account?.username ? `@${item.account.username}` : "@user",
          platform: (item.platform || "telegram").toLowerCase() as any,
          channelType: item.telegram_chat?.chat_type || "عمومی",
          channelTitle: item.telegram_chat?.name || "کانال پایش",
          contentId: item.content_id || "MSG-0000",
          link: item.url || "#",
          suspicious: true,
          reasons: ["keyword_match", "rule_match"],
        };
      });
      
    } catch (error) {
      console.error("Connection Error (Contents):", error);
      return [];
    }
  },
  getAssessments: async (): Promise<Assessment[]> => {
    try {
      const response = await authFetch("/api/v1/assessments/");
      
      if (!response.ok) {
        console.error("Backend Error:", response.status);
        return [];
      }
      
      const backendData = await response.json();
      
      // لیست سفید برای مقادیر مجاز Severity و Priority بر اساس تایپ‌های فرانت‌اند
      const validSeverities = ["critical", "high", "medium", "low"];
      
      return backendData.map((item: any) => {
        // ۱. استانداردسازی مقادیر برای جلوگیری از کرش کردن UI
      const rawSeverity = (item.risk || "medium").toLowerCase();
      const safeSeverity = validSeverities.includes(rawSeverity) ? rawSeverity : "medium";

      // محاسبه پویا سطح اولویت بر اساس priority_score
      const pScore = Number(item.priority_score) || 0;
      let dynamicPriority = "low";

      const isClean = item.status === "clean" || !item.policy;

      if (pScore >= 80) {
          dynamicPriority = "critical";
      } else if (pScore >= 60) {
          dynamicPriority = "high";
      } else if (pScore >= 40) {
          dynamicPriority = "medium";
      }

      return {
        id: item.id || Math.random().toString(),
        contentId: item.content?.content_id || item.content_id || "-",
        
        // ۲. 🌟 استخراج دقیق متن از جدول Join شده Content
        // استفاده از علامت ?. (Optional Chaining) باعث می‌شود اگر 
        // یک ارزیابی به هر دلیلی محتوای متصل نداشت، صفحه کرش نکند.
        text: item.content?.body || "[بدون متن - محتوا یافت نشد]", 
        
        // ۳. 🌟 پشتیبانی از نمایش چند کد و عنوان برای تخلفات هم‌زمان
        violationCode: isClean ? "-" : (item.matchedRules?.length > 0 
          ? item.matchedRules.map((m: any) => m.code).join(", ") 
          : (item.policy?.code || item.category || "-")),
          
        violationTitle: isClean ? "تایید شده (بدون تخلف)" : (item.matchedRules?.length > 0 
          ? item.matchedRules.map((m: any) => m.title).join(" | ") 
          : (item.policy?.title || item.category || "ارزیابی سیستم")),
        
        // ۴. مپ کردن سایر فیلدهای عددی و متنی
        detectionReason: item.reason || "بدون توضیح",
        analyst: item.analyser || "سیستم",
        confidence: Number(item.confidence_score) || 0,
        riskScore: Number(item.priority_score) || 0,
        history: Number(item.previous_violations_count) || 0,
        severity: safeSeverity as any,
        impact: Number(item.importance_score) || 0,
        repetition: Number(item.frequency_score) || 0,
        priority: dynamicPriority as any,
      };
    });
      
    } catch (error) {
      console.error("Connection Error (Assessments):", error);
      return [];
    }
  },
  getViolations: async (): Promise<Violation[]> => {
    try {
      const res = await authFetch("/api/v1/violations/");
      
      if (!res.ok) {
        console.error("Backend Error (Violations):", res.status);
        return [];
      }
      
      const backendData = await res.json();
      
      // لیست سفید برای اطمینان از کرش نکردن UI
      const validStatuses = ["pending", "in_review", "approved", "rejected"];
      const validPriorities = ["critical", "high", "medium", "low"];
      const validActions = ["confront", "sms", "monitor", "block", "no_action", "action1"];

      return backendData.map((item: any) => {
        // باز کردن آبجکت‌های Join شده با پشتیبان (Fallback)
        const policy = item.policy || {};
        const content = item.content || {};
        const account = item.account || {};
        const assessment = item.assessment || {};

        // ساخت نام متخلف
        const firstName = account.first_name || "";
        const lastName = account.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim() || "کاربر ناشناس";

        // اعتبارسنجی مقادیر مهم
        const rawStatus = (item.action_status || "pending").toLowerCase();
        const safeStatus = validStatuses.includes(rawStatus) ? rawStatus : "pending";

        // محاسبه پویا سطح اولویت بر اساس priority_score
        const pScore = Number(item.priority_score) || 0;
        let dynamicPriority = "low";

        if (pScore >= 80) {
            dynamicPriority = "critical";
        } else if (pScore >= 60) {
            dynamicPriority = "high";
        } else if (pScore >= 40) {
            dynamicPriority = "medium";
        }

        const rawExpAction = (item.expert_action || "").toLowerCase();
        const safeExpAction = validActions.includes(rawExpAction) ? rawExpAction : "";
        
        const rawSugAction = (policy.default_recomned || "monitor").toLowerCase();
        const safeSugAction = validActions.includes(rawSugAction) ? rawSugAction : "monitor";

        return {
          id: item.id || Math.random().toString(),
          priority: dynamicPriority as any,
          
          // اطلاعات جدول
          title: item.matchedRules?.length > 1 
            ? item.matchedRules.map((m: any) => m.title).join(" | ") 
            : (policy.title || "تخلف نامشخص"),
          description: assessment.reason ? assessment.reason.substring(0, 45) + "..." : "[بدون دلیل مشخص]",
          
          // اطلاعات هویت متخلف (برای جدول و داشبورد)
          offender: {
            name: fullName,
            handle: account.username ? `@${account.username}` : "@user",
            platform: (account.platform || "telegram").toLowerCase() as any,
            userId: account.platform_account_id || "UID-0000",
            historyCount: Number(assessment.previous_violations_count) || 0,
            riskScore: Number(assessment.priority_score) || 0,
          },

          suggestedAction: safeSugAction as any,
          expertAction: safeExpAction as any,
          expertComment: item.expert_comment || "",
          status: safeStatus as any,
          
          // اطلاعات تکمیلی برای داشبورد کناری (Sidebar)
          contentId: content.content_id || "MSG-0000",
          fullContent: content.body || "متن کامل در دسترس نیست.",
          
          // 👈 کلید حل مشکل: اولویت دادن به آرایه واقعی بک‌اند
          matchedRules: item.matchedRules && item.matchedRules.length > 0 
            ? item.matchedRules 
            : [
                {
                  code: policy.code || "R-000",
                  title: policy.title || "قانون نامشخص",
                }
              ],
              
          detectionReason: assessment.reason || "تطابق با قوانین سیستمی",
          
          // نمودارهای داشبورد کناری
          // نمودارهای داشبورد کناری
          risk: {
            score: Number(assessment.priority_score) || 0,
            breakdown: [
              // 👇 اینجا دست نمی‌زنیم چون می‌خواهیم در نوار پیشرفت همان نمره (مثلاً 20) نشان داده شود
              { label: "سابقه کاربر", value: Number(assessment.history_score) || 0 },
              { label: "تطابق کلیدواژه", value: Number(assessment.influence_score) || 0 },
              { label: "شدت قانون", value: Number(assessment.importance_score) || 0 },
              { label: "میزان تکرار", value: Number(assessment.frequency_score) || 0 },
            ]
          },
          priorityBreakdown: [
            { label: "درجه اهمیت", value: Number(assessment.importance_score) || 0 },
            { label: "درجه تاثیر", value: Number(assessment.influence_score) || 0 },
            { label: "درجه تکرار", value: Number(assessment.frequency_score) || 0 },
            { label: "Confidence", value: Number(assessment.confidence_score) || 0 },
          ],
          
          // 👇 این خط را دقیقاً قبل از پایان آبجکت اضافه کنید تا به Drawer برسد
          previous_violations_count: Number(assessment.previous_violations_count) || 0,
        };
      });
      
    } catch (error) {
      console.error("Connection Error (Violations):", error);
      return [];
    }
  },
  saveViolation: async (v: Violation): Promise<Violation> => {
    // تبدیل ساختار فرانت‌اند به دیتابیس
    const payload = {
      expert_action: v.expertAction,
      expert_comment: v.expertComment,
      action_status: v.status,
    };

    const res = await authFetch(`/api/v1/violations/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("خطا در ذخیره تخلف");
    return v;
  },
  exportExcel: async (filters: {
  from?: string;
  to?: string;
  action?: string;
}): Promise<Blob> => {
  if (!filters.from || !filters.to) {
    throw new Error("تاریخ شروع و تاریخ پایان الزامی است.");
  }

  const body: {
    from_date: string;
    to_date: string;
    expert_action?: string;
  } = {
    from_date: filters.from,
    to_date: filters.to,
  };

  // اگر "همه" انتخاب نشده باشد، فیلتر expert_action ارسال می‌شود
  if (filters.action && filters.action !== "all") {
    body.expert_action = filters.action;
  }

  const response = await authFetch("/api/v1/violations/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "خطا در دریافت فایل Excel";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // اگر Response JSON نبود
    }

    throw new Error(message);
  }

  return await response.blob();
},
};
  
