export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  TEAM_MEMBER = 'TEAM_MEMBER',
  HR_ADMIN = 'HR_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  AI_AGENT = 'AI_AGENT',
}

export enum FeedbackCategory {
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  SATISFACTION = 'SATISFACTION',
  WELLNESS = 'WELLNESS',
  TOXICITY_REPORT = 'TOXICITY_REPORT',
  WORKPLACE_ISSUE = 'WORKPLACE_ISSUE',
  HR_ISSUE = 'HR_ISSUE',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  AI_PROCESSING = 'AI_PROCESSING',
  AI_RESOLVED = 'AI_RESOLVED',
  AI_FAILED = 'AI_FAILED',
  IN_REVIEW = 'IN_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EmotionType {
  STRESS = 'STRESS',
  ANGER = 'ANGER',
  FRUSTRATION = 'FRUSTRATION',
  SATISFACTION = 'SATISFACTION',
  MOTIVATION = 'MOTIVATION',
  DEPRESSION = 'DEPRESSION',
  NEUTRAL = 'NEUTRAL',
  JOY = 'JOY',
  ANXIETY = 'ANXIETY',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

export interface AIAnalysisResult {
  sentiment: number;
  emotion: EmotionType;
  toxicityScore: number;
  urgencyScore: number;
  keywords: string[];
  category: string;
  summary: string;
  suggestions: string[];
  confidence: number;
}

export interface BurnoutAnalysis {
  score: number;
  riskLevel: RiskLevel;
  factors: string[];
  recommendations: string[];
  resignationProbability: number;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  satisfactionScore: number;
  stressScore: number;
  feedbackCount: number;
  complaintCount: number;
  resolvedCount: number;
  burnoutRisk: RiskLevel;
  topIssues: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface OrganizationHealth {
  overallScore: number;
  employeeSatisfaction: number;
  stressIndex: number;
  engagementRate: number;
  burnoutRisk: number;
  toxicityLevel: number;
  feedbackRate: number;
  resolutionRate: number;
  departments: DepartmentAnalytics[];
}
