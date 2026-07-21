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
  getPolicies: (): Promise<Policy[]> => delay(mockPolicies),
  savePolicy: (p: Policy): Promise<Policy> => delay(p),
  getContents: (): Promise<ContentItem[]> => delay(mockContents),
  getAssessments: (): Promise<Assessment[]> => delay(mockAssessments),
  getViolations: (): Promise<Violation[]> => delay(mockViolations),
  saveViolation: (v: Violation): Promise<Violation> => delay(v),
  exportExcel: (_filters: {
    from?: string;
    to?: string;
    action?: string;
  }): Promise<{ url: string }> => delay({ url: "#" }, 400),
};
