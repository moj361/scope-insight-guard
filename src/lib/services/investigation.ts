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
  getKpis: (): Promise<KpiStat[]> => delay(mockKpis),
  getPolicyCategories: (): Promise<PolicyCategory[]> => delay(mockPolicyCategories),
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
          enabled: true,
        };
      });
      
    } catch (error) {
      console.error("Connection Error:", error);
      return []; 
    }
  },
  savePolicy: (p: Policy): Promise<Policy> => delay(p),
  getContents: (): Promise<ContentItem[]> => delay(mockContents),
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
  getViolations: (): Promise<Violation[]> => delay(mockViolations),
  saveViolation: (v: Violation): Promise<Violation> => delay(v),
  exportExcel: (_filters: {
    from?: string;
    to?: string;
    action?: string;
  }): Promise<{ url: string }> => delay({ url: "#" }, 400),
};
