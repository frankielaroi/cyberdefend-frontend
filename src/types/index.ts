export type UserRole = 'SUPER_ADMIN' | 'CSA_ADMIN' | 'ORG_ADMIN' | 'ORG_MANAGER' | 'END_USER';

export * from './sms-campaign';

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
  features?: Record<string, string[]>; // Features accessible based on subscription
}

export interface Assessment {
  id: string;
  organizationId: string;
  title?: string;
  description?: string;
  type?: AssessmentType;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  score?: number;
  tier?: 'A' | 'B' | 'C' | 'D' | 'F';
  startedAt: string;
  completedAt?: string;
  reportUrl?: string;
  questions?: Question[];
  responses?: AssessmentResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  category: string | {
    id: string;
    name: string;
    description: string;
    weight: number;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  text: string;
  description?: string;
  type: 'multiple_choice' | 'yes_no' | 'rating' | 'SINGLE_CHOICE' | 'YES_NO' | 'RATING';
  isRequired: boolean;
  options?: string[] | Array<{
    id: string;
    text: string;
    value: string;
  }>;
  weight?: number;
  followUp?: string[];
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number;
  timeSpent?: number;
}

export interface PhishingCampaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  template: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  landingPageUrl?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt?: string;
  launchedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  targetCount: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  linksClicked: number;
  credentialsEntered: number;
  phishingReported: number;
  emailsBounced: number;
  createdBy: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    targets: number;
    events: number;
  };
}

export interface CampaignsResponse {
  campaigns: PhishingCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  organizationId: string; // Required by backend
}

// New response submission interfaces
export interface SingleResponseDto {
  questionId: string;
  answer: string | number;
  timeSpent?: number;
}

export interface BulkResponseDto {
  assessmentId: string;
  responses: SingleResponseDto[];
}

// Enhanced assessment result interfaces
export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface Vulnerability {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

export interface CSIDirectoryParams {
  region?: string;
  sector?: string;
  size?: string;
  page?: number;
  limit?: number;
}

export interface CSILeaderboardParams {
  sector?: Sector;
  region?: string;
  size?: OrganizationSize;
  limit?: number;
  timeframe?: 'current' | 'monthly' | 'yearly';
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
  organizationId: string;
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

// Assessment Results UI Types
export interface AssessmentScoreData {
  score: number;
  totalQuestions: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  percentage: number;
}

export interface CategoryChartData {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ComplianceAlert {
  type: 'CSA_DATA_PROTECTION' | 'CYBER_SECURITY_ACT' | 'GDPR' | 'ISO27001';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  year?: number;
}

export interface AssessmentResultsDisplay {
  scoreData: AssessmentScoreData;
  chartData: CategoryChartData[];
  alerts: ComplianceAlert[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  actionPlanUrl?: string;
}

// DefendX+ Phishing Campaign Types
export interface PhishingTargetDto {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  jobTitle?: string;
  userId?: string;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  templateId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  landingPageUrl?: string;
  scheduledAt?: string;
  targets: PhishingTargetDto[];
  organizationId?: string;
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
  senderName?: string;
  senderEmail?: string;
  landingPageUrl?: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt?: string;
}

export interface CampaignFiltersDto {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  template?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'SECURITY' | 'COMPLIANCE' | 'GENERAL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  defaultSubject: string;
  defaultSenderName: string;
  emailBodyHtml: string;
  emailBodyText: string;
  landingPageHtml?: string;
  captureCredentials: boolean;
  isActive: boolean;
  previewContent: string;
  tags: string[];
  usageCount: number;
  successRate: number | null;
  createdBy: string;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organization: any | null;
}

export interface TemplatesPaginationResponse {
  templates: CampaignTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTemplateDto {
  name: string;
  description: string;
  category: 'SECURITY' | 'IT' | 'FINANCE' | 'HR' | 'EXECUTIVE' | 'GENERAL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  defaultSubject: string;
  defaultSenderName: string;
  emailBodyHtml: string;
  emailBodyText: string;
  landingPageHtml?: string;
  captureCredentials?: boolean;
  previewContent: string;
  tags?: string[];
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

// Question Management DTOs
export interface CreateQuestionDto {
  category: string;
  text: string;
  type: 'multiple_choice' | 'yes_no' | 'rating';
  options?: string[];
  weight: number;
  followUp?: string[];
  isActive?: boolean;
}

export interface UpdateQuestionDto {
  category?: string;
  text?: string;
  type?: 'multiple_choice' | 'yes_no' | 'rating';
  options?: string[];
  weight?: number;
  followUp?: string[];
  isActive?: boolean;
}

export interface QuestionFiltersDto {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  type?: 'multiple_choice' | 'yes_no' | 'rating';
  isActive?: boolean;
}

export interface QuestionCategoryDto {
  name: string;
  description?: string;
  weight?: number;
  isActive?: boolean;
}

export interface BulkQuestionUpdateDto {
  questionIds: string[];
  updates: Partial<UpdateQuestionDto>;
}

// Organization Management Types
export interface OrganizationSettings {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  gpsAddress?: string;
  size: OrganizationSize;
  sector: Sector;
  isPublic: boolean;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationSettingsDto {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  gpsAddress?: string;
  size?: OrganizationSize;
  sector?: Sector;
  isPublic?: boolean;
}

export interface OrganizationMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  joinedAt: string;
  lastActiveAt?: string;
  isActive: boolean;
}

export interface InviteMemberDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  message?: string;
}

export interface InviteMemberResponse {
  success: boolean;
  message: string;
  invitationId: string;
}

export interface UpdateMemberRoleDto {
  role: UserRole;
}

export interface UpdateMemberRoleResponse {
  success: boolean;
  message: string;
  member: {
    id: string;
    role: UserRole;
  };
}

export interface RemoveMemberDto {
  reason?: string;
}

export interface ResendInvitationDto {
  message?: string;
}

export interface StandardApiResponse {
  success: boolean;
  message: string;
}

// User Profile Management Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  organization?: {
    id: string;
    name: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSecurityInfo {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  activeSessions: number;
  lastLogin?: {
    date: string;
    ipAddress: string;
    userAgent: string;
  };
  recentLoginAttempts: Array<{
    date: string;
    success: boolean;
    ipAddress: string;
    userAgent: string;
  }>;
}

export interface TwoFactorAuthDto {
  enabled: boolean;
  phoneNumber?: string;
  backupEmail?: string;
}

export interface TwoFactorAuthResponse {
  success: boolean;
  message: string;
  backupCodes?: string[];
}

export interface TerminateSessionsResponse {
  success: boolean;
  message: string;
  terminatedSessions: number;
}

export interface UserPreferences {
  notifications: {
    emailNotifications: boolean;
    assessmentReminders: boolean;
    securityAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    phishingNotifications: boolean;
  };
  twoFactorAuth: {
    enabled: boolean;
    phoneNumber?: string;
    backupEmail?: string;
  };
  account: {
    language: string;
    timezone: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface UpdateNotificationPreferencesDto {
  emailNotifications?: boolean;
  assessmentReminders?: boolean;
  securityAlerts?: boolean;
  weeklyReports?: boolean;
  monthlyReports?: boolean;
  phishingNotifications?: boolean;
}

export interface UpdateAccountPreferencesDto {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface UploadAvatarDto {
  avatarData: string; // base64 encoded image
  fileName: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  message: string;
  avatarUrl: string;
}

export interface ExportDataResponse {
  success: boolean;
  message: string;
  downloadUrl: string;
  expiresAt: string;
}

export interface DeleteAccountDto {
  password: string;
  reason: string;
  confirmation: string; // Must be "DELETE MY ACCOUNT"
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletionDate: string;
}
