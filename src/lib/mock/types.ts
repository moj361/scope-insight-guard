export type Platform = "telegram" | "twitter" | "instagram";
export type Severity = "critical" | "high" | "medium" | "low";
export type Priority = Severity;
export type CaseStatus = "active" | "closed" | "suspended";

export type ExpertAction =
  | "confront"
  | "sms"
  | "monitor"
  | "block"
  | "no_action"
  | "";

export type ViolationStatus = "pending" | "in_review" | "approved" | "rejected";

export interface CaseInfo {
  title: string;
  caseNumber: string;
  status: CaseStatus;
  openedAt: string;
  analyst: string;
}

export interface KpiStat {
  key: string;
  label: string;
  value: number;
  delta?: number;
  tone?: "neutral" | "success" | "warning" | "critical" | "info";
  hint?: string;
}

export interface PolicyCategory {
  code: string;
  title: string;
  count: number;
  color: string;
}

export interface Policy {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  weight: number;
  defaultAction: ExpertAction;
  keywords: string[];
  prompt: string;
  enabled: boolean;
}

export type SuspiciousReason =
  | "suspicious_user"
  | "keyword_match"
  | "rule_match"
  | "high_risk_user";

export interface ContentItem {
  id: string;
  publishedAt: string;
  text: string;
  publisher: string;
  publisherHandle: string;
  platform: Platform;
  channelType: string;
  channelTitle: string;
  contentId: string;
  link: string;
  suspicious: boolean;
  reasons: SuspiciousReason[];
}

export interface Assessment {
  id: string;
  contentId: string;
  text: string;
  violationCode: string;
  violationTitle: string;
  detectionReason: string;
  analyst: string;
  confidence: number;
  riskScore: number;
  history: number;
  severity: Severity;
  impact: number;
  repetition: number;
  priority: Priority;
}

export interface Violation {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  offender: {
    name: string;
    handle: string;
    platform: Platform;
    userId: string;
    historyCount: number;
    riskScore: number;
  };
  suggestedAction: ExpertAction;
  expertAction: ExpertAction;
  expertComment: string;
  status: ViolationStatus;
  contentId: string;
  fullContent: string;
  matchedRules: { code: string; title: string }[];
  detectionReason: string;
  risk: { score: number; breakdown: { label: string; value: number }[] };
  priorityBreakdown: { label: string; value: number }[];
}
