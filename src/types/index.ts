export type UserRole = 'SUPER_ADMIN' | 'CSA_ADMIN' | 'ORG_ADMIN' | 'ORG_MANAGER' | 'END_USER';

export enum OrganizationSize {
  MICRO = 'MICRO',           // 1-5 employees
  SMALL = 'SMALL',           // 6-50 employees
  MEDIUM = 'MEDIUM',         // 51-250 employees
  LARGE = 'LARGE',           // 251-1000 employees
  ENTERPRISE = 'ENTERPRISE'  // 1000+ employees
}

export enum Sector {
  BANKING = 'BANKING',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  INSURANCE = 'INSURANCE',
  GOVERNMENT = 'GOVERNMENT',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  ENERGY = 'ENERGY',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  LOGISTICS = 'LOGISTICS',
  TECHNOLOGY = 'TECHNOLOGY',
  NGO = 'NGO',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // Full name for backward compatibility
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  phone?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  organization?: {
    id: string;
    name: string;
    size: OrganizationSize;
    email?: string;
    sector: Sector;
  };
}

export interface Assessment {
  id: string;
  organizationId: string;
  status: 'in_progress' | 'completed';
  score?: number;
  tier?: 'A' | 'B' | 'C' | 'D' | 'F';
  startedAt: string;
  completedAt?: string;
  reportUrl?: string;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  type: 'multiple_choice' | 'yes_no' | 'rating';
  options?: string[];
  weight: number;
  followUp?: string[];
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number;
}

export interface PhishingCampaign {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  template: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  landingPageUrl?: string;
  targetCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  reportedCount: number;
  scheduledAt?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  organizationId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  sourceAgent?: string;
}

export interface SystemScan {
  id: string;
  organizationId: string;
  agentId: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  startedAt: string;
  completedAt?: string;
  reportUrl?: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: 'DefendCore' | 'DefendVault' | 'DefendClick' | 'Enterprise';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  modules: {
    defendX: boolean;
    defendXPlus: boolean;
  };
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  dueDate: string;
  paidAt?: string;
  downloadUrl?: string;
}

export interface CSIDirectoryEntry {
  organizationId: string;
  name: string;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  sector: string;
  region: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  lastAssessmentDate: string;
}

export interface BenchmarkData {
  sector?: {
    average: number;
    percentile: number;
  };
  region?: {
    average: number;
    percentile: number;
  };
  size?: {
    average: number;
    percentile: number;
  };
  national?: {
    average: number;
    percentile: number;
  };
}

// ===============================
// API REQUEST/RESPONSE TYPES
// ===============================

// Auth API Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationId?: string;
  role?: UserRole;
  organization?: {
    name: string;
    email: string;
    phone?: string;
    website?: string;
    size: string;
    sector: string;
  };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

// Organization Management Types
export interface JoinOrganizationDto {
  inviteCode?: string;
  organizationId?: string;
}

export interface OrganizationMemberDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastLogin?: string;
  invitedBy?: string;
}

export interface InviteCodeDto {
  id: string;
  code: string;
  organizationId: string;
  createdBy: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface GenerateInviteCodeDto {
  expiresIn?: number; // Days until expiration (default 7)
  usageLimit?: number; // How many times it can be used (default unlimited)
}

// DefendX API Types
export type AssessmentType = 'CSI_ASSESSMENT' | 'COMPLIANCE_CHECK' | 'SECURITY_AUDIT' | 'BASELINE_ASSESSMENT';

export interface CreateAssessmentDto {
  title: string;
  description?: string;
  type: AssessmentType;
}

export interface CSIDirectoryParams {
  region?: string;
  sector?: string;
  size?: string;
  page?: number;
  limit?: number;
}

export interface CSILeaderboardParams {
  sector?: string;
  limit?: number;
}

export interface LeaderboardEntry {
  organizationId: string;
  organizationName: string;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  sector: string;
  region: string;
}

export interface HeatmapData {
  region: string;
  averageScore: number;
  count: number;
}

export interface RegionalStats {
  region: string;
  averageScore: number;
  organizationCount: number;
  distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

export interface SectoralStats {
  sector: string;
  averageScore: number;
  organizationCount: number;
  distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

export interface AssessmentSubmitDto {
  assessmentId: string;
  responses: AssessmentResponse[];
}

export interface AssessmentResultDto {
  id: string;
  organizationId: string;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  reportUrl: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  vulnerabilities?: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  categoryBreakdown?: Record<string, number>;
  benchmark: BenchmarkData;
}

// DefendX+ Phishing Campaign Types
export interface PhishingTargetDto {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  template: 'HR_UPDATE' | 'PASSWORD_RESET' | 'IT_SECURITY' | 'BANK_ALERT' | 'SHIPPING_NOTICE' | 'CUSTOM';
  subject: string;
  senderName: string;
  senderEmail: string;
  landingPageUrl?: string;
  scheduledAt?: string;
  targets: PhishingTargetDto[];
}

export interface LaunchCampaignDto {
  campaignId: string;
  launchType?: 'NOW' | 'SCHEDULED';
  scheduledAt?: string;
}

export interface CampaignResultsDto {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  targetCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  reportedCount: number;
  startDate?: string;
  endDate?: string;
  analytics: {
    clickRate: number;
    reportRate: number;
    deliveryRate: number;
  };
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  subject?: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}

// DefendX+ Incident Reporting
export interface ReportIncidentDto {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'phishing' | 'malware' | 'data_breach' | 'unauthorized_access' | 'other';
  reportedBy: string;
  additionalInfo?: string;
}

// DefendX+ Agent Management
export interface RegisterAgentDto {
  name: string;
  hostname: string;
  operatingSystem: string;
  version: string;
}

export interface AgentRegistrationResponse {
  agentId: string;
  authToken: string;
  config: AgentConfig;
}

export interface AgentConfig {
  samplingRate: number;
  ruleSet: string[];
  reportingInterval: number;
  enabledModules: string[];
}

export interface Agent {
  id: string;
  name: string;
  hostname: string;
  operatingSystem: string;
  version: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  organizationId: string;
}

export interface HeartbeatDto {
  agentId: string;
  status: 'online' | 'offline' | 'error';
  metrics?: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

// DefendX+ Telemetry
export interface TelemetryPayload {
  agentId: string;
  timestamp: string;
  events: TelemetryEvent[];
}

export interface TelemetryEvent {
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data: Record<string, any>;
  timestamp: string;
}

// DefendX+ Alerts
export interface AlertsParams {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'acknowledged' | 'closed';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AcknowledgeAlertDto {
  alertId: string;
  acknowledgedBy: string;
  notes?: string;
}

export interface CloseAlertDto {
  alertId: string;
  closedBy: string;
  resolution: string;
}

// DefendX+ Scans
export interface ScheduleScanDto {
  frequency: 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  scanType: 'vulnerability' | 'compliance' | 'malware' | 'full';
}

export interface TriggerScanDto {
  scanType: 'vulnerability' | 'compliance' | 'malware' | 'full';
  agentIds?: string[];
}

export interface ScanSchedule {
  id: string;
  organizationId: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  scanType: 'vulnerability' | 'compliance' | 'malware' | 'full';
  isActive: boolean;
  nextRunDate: string;
  lastRunDate?: string;
}

export interface ScanResult {
  id: string;
  organizationId: string;
  scanType: 'vulnerability' | 'compliance' | 'malware' | 'full';
  status: 'running' | 'completed' | 'failed';
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  startedAt: string;
  completedAt?: string;
  findings: ScanFinding[];
  summary: ScanSummary;
}

export interface ScanFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  affectedAssets: string[];
}

export interface ScanSummary {
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScanResultsParams {
  startDate?: string;
  endDate?: string;
  scanType?: 'vulnerability' | 'compliance' | 'malware' | 'full';
  page?: number;
  limit?: number;
}

// Billing API Types
export interface BillingInfo {
  organizationId: string;
  currentPlan: string;
  billingCycle: 'monthly' | 'annually';
  nextBillingDate: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annually';
  interval?: string; // For display purposes
  popular?: boolean;
  features: string[];
  limits: {
    assessments: number | 'unlimited';
    campaigns: number | 'unlimited';
    agents: number | 'unlimited';
  };
}

export interface UpgradeSubscriptionDto {
  planId: string;
  billingCycle: 'monthly' | 'annually';
  paymentMethodId?: string;
}

// Admin API Types
export interface OrganizationStats {
  totalOrganizations: number;
  activeSubscriptions: number;
  completedAssessments: number;
  activeCampaigns: number;
  totalUsers: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  domain?: string;
  email?: string;
  sector: string;
  region: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  userCount: number;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  domain?: string;
  sector: string;
  email?: string;
  region: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  domain?: string;
  sector?: string;
  email?: string;
  region?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
}

// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  field?: string;
}
