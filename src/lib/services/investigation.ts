/**
 * Data service layer.
 *
 * All UI components consume data through this module. To connect to a real
 * FastAPI backend later, replace the mock returns with fetch() calls — the
 * signatures below are the API contract.
 */
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
      const res = await fetch("http://localhost:8000/api/v1/dashboard/kpis");
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
      const res = await fetch("http://localhost:8000/api/v1/dashboard/policy-categories");
      if (!res.ok) return mockPolicyCategories; 
      return await res.json();
    } catch (error) {
      console.error("Dashboard Categories Error:", error);
      return mockPolicyCategories;
    }
  },
  getPolicies: async (): Promise<Policy[]> => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/policies/");
      
      if (!response.ok) {
        console.error("Backend Error:", response.status);
        return []; 
      }
      
      const backendData = await response.json();
      
      // آرایه مقادیر مجاز برای فرانت‌اند
      const validSeverities = ["critical", "high", "medium", "low"];
      const validActions = ["confront", "sms", "monitor", "block", "no_action"];
      
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
          weight: 50, 
          defaultAction: safeAction as Policy["defaultAction"], // استفاده از اکشن امن
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
  savePolicy: (p: Policy): Promise<Policy> => delay(p),
  getContents: async (): Promise<ContentItem[]> => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/contents/");
      
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
          publishedAt: item.publish_time ? new Date(item.publish_time).toLocaleString('fa-IR') : "—",
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
      const response = await fetch("http://localhost:8000/api/v1/assessments/");
      
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

      const rawPriority = (item.priority || "medium").toLowerCase();
      const safePriority = validSeverities.includes(rawPriority) ? rawPriority : "medium";

      return {
        id: item.id || Math.random().toString(),
        contentId: item.content?.content_id || item.content_id || "-",
        
        // ۲. 🌟 استخراج دقیق متن از جدول Join شده Content
        // استفاده از علامت ?. (Optional Chaining) باعث می‌شود اگر 
        // یک ارزیابی به هر دلیلی محتوای متصل نداشت، صفحه کرش نکند.
        text: item.content?.body || "[بدون متن - محتوا یافت نشد]", 
        
        // ۳. 🌟 استخراج دقیق کد و عنوان قانون از جدول Join شده Policy
        violationCode: item.policy?.code || item.category || "-",
        violationTitle: item.policy?.title || item.category || "ارزیابی سیستم",
        
        // ۴. مپ کردن سایر فیلدهای عددی و متنی
        detectionReason: item.reason || "بدون توضیح",
        analyst: item.analyser || "سیستم",
        confidence: Number(item.confidence_score) || 0,
        riskScore: Number(item.priority_score) || 0,
        history: Number(item.history_score) || 0,
        severity: safeSeverity as any,
        impact: Number(item.importance_score) || 0,
        repetition: Number(item.frequency_score) || 0,
        priority: safePriority as any,
      };
    });
      
    } catch (error) {
      console.error("Connection Error (Assessments):", error);
      return [];
    }
  },
  getViolations: async (): Promise<Violation[]> => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/violations/");
      
      if (!res.ok) {
        console.error("Backend Error (Violations):", res.status);
        return [];
      }
      
      const backendData = await res.json();
      
      // لیست سفید برای اطمینان از کرش نکردن UI
      const validStatuses = ["pending", "in_review", "approved", "rejected"];
      const validPriorities = ["critical", "high", "medium", "low"];
      const validActions = ["confront", "sms", "monitor", "block", "no_action", ""];

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

        const rawPriority = (assessment.priority || "medium").toLowerCase();
        const safePriority = validPriorities.includes(rawPriority) ? rawPriority : "medium";

        const rawExpAction = (item.expert_action || "").toLowerCase();
        const safeExpAction = validActions.includes(rawExpAction) ? rawExpAction : "";
        
        const rawSugAction = (policy.default_recomned || "monitor").toLowerCase();
        const safeSugAction = validActions.includes(rawSugAction) ? rawSugAction : "monitor";

        return {
          id: item.id || Math.random().toString(),
          priority: safePriority as any,
          
          // اطلاعات جدول
          title: policy.title || "تخلف نامشخص",
          description: content.body ? content.body.substring(0, 45) + "..." : "[بدون متن]",
          
          // اطلاعات هویت متخلف (برای جدول و داشبورد)
          offender: {
            name: fullName,
            handle: account.username ? `@${account.username}` : "@user",
            platform: (account.platform || "telegram").toLowerCase() as any,
            userId: account.platform_account_id || "UID-0000",
            historyCount: Number(assessment.history_score) || 0,
            riskScore: Number(assessment.priority_score) || 0,
          },
          
          suggestedAction: safeSugAction as any,
          expertAction: safeExpAction as any,
          expertComment: "", // یادداشت متنی مطابق درخواست شما خالی گذاشته شد
          status: safeStatus as any,
          
          // اطلاعات تکمیلی برای داشبورد کناری (Sidebar)
          contentId: content.content_id || "MSG-0000",
          fullContent: content.body || "متن کامل در دسترس نیست.",
          matchedRules: [
            {
              code: policy.code || "R-000",
              title: policy.title || "قانون نامشخص",
            }
          ],
          detectionReason: assessment.reason || "تطابق با قوانین سیستمی",
          
          // نمودارهای داشبورد کناری
          risk: {
            score: Number(assessment.priority_score) || 0,
            breakdown: [
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
          ]
        };
      });
      
    } catch (error) {
      console.error("Connection Error (Violations):", error);
      return [];
    }
  },
  saveViolation: (v: Violation): Promise<Violation> => delay(v),
  exportExcel: (_filters: {
    from?: string;
    to?: string;
    action?: string;
  }): Promise<{ url: string }> => delay({ url: "#" }, 400),
};
  