import { apiSlice } from './apiSlice';
import type {
  PhishingCampaign,
  CampaignsResponse,
  CreateCampaignDto,
  UpdateCampaignDto,
  LaunchCampaignDto,
  CampaignResultsDto,
  CampaignFiltersDto,
  CampaignTemplate,
  CreateTemplateDto,
  TemplatesPaginationResponse,
  ReportIncidentDto,
  PaginatedResponse,
  ApiResponse,
  Alert,
  SystemScan
} from '../../types';

// Enhanced DefendX Plus Types for Backend Integration
export interface CampaignAnalytics {
  campaignId: string;
  overview: {
    totalTargets: number;
    emailsSent: number;
    emailsDelivered: number;
    emailsOpened: number;
    linksClicked: number;
    credentialsEntered: number;
    usersReported: number;
  };
  timeline: Array<{
    timestamp: string;
    event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'reported' | 'credentials_entered';
    count: number;
    targetEmail?: string;
  }>;
  userPerformance: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    delivered: boolean;
    opened: boolean;
    clicked: boolean;
    reported: boolean;
    enteredCredentials: boolean;
    actionTimestamp?: string;
  }>;
  departments: Array<{
    name: string;
    totalUsers: number;
    clickRate: number;
    reportRate: number;
    riskScore: number;
  }>;
  riskMetrics: {
    overallRiskScore: number;
    highRiskUsers: Array<{
      email: string;
      riskScore: number;
      reasoning: string;
    }>;
    improvements: string[];
  };
}

export interface AgentRegistration {
  organizationId: string;
  hostname: string;
  operatingSystem: string;
  agentVersion: string;
  installationKey: string;
}

export interface AgentConfig {
  scanInterval: number;
  reportingEndpoint: string;
  features: {
    realTimeProtection: boolean;
    scheduledScans: boolean;
    behaviorAnalysis: boolean;
    webProtection: boolean;
  };
  exclusions: {
    directories: string[];
    fileExtensions: string[];
    processes: string[];
  };
}

export interface TelemetryData {
  agentId: string;
  timestamp: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkActivity: {
      bytesIn: number;
      bytesOut: number;
    };
  };
  events: Array<{
    type: 'file_access' | 'network_connection' | 'process_start' | 'registry_change';
    timestamp: string;
    details: Record<string, any>;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface ScanSchedule {
  id: string;
  name: string;
  agentIds: string[];
  scanType: 'quick' | 'full' | 'custom';
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
}

export const defendxPlusApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Campaign Management
    getCampaigns: builder.query<CampaignsResponse, CampaignFiltersDto>({
      query: (params = {}) => ({
        url: '/defendx-plus/campaigns',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['Campaign' as const],
    }),

    getCampaign: builder.query<ApiResponse<PhishingCampaign>, string>({
      query: (campaignId) => `/defendx-plus/campaigns/${campaignId}`,
      providesTags: (_result, _error, campaignId) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    createCampaign: builder.mutation<ApiResponse<PhishingCampaign>, CreateCampaignDto>({
      query: (campaignData) => ({
        url: '/defendx-plus/campaigns',
        method: 'POST',
        body: campaignData,
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    updateCampaign: builder.mutation<ApiResponse<PhishingCampaign>, { id: string; data: UpdateCampaignDto }>({
      query: ({ id, data }) => ({
        url: `/defendx-plus/campaigns/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Campaign' as const,
        { type: 'Campaign' as const, id }
      ],
    }),

    deleteCampaign: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (campaignId) => ({
        url: `/defendx-plus/campaigns/${campaignId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    launchCampaign: builder.mutation<ApiResponse<{ campaignId: string; status: string }>, LaunchCampaignDto>({
      query: (launchData) => ({
        url: `/defendx-plus/campaigns/${launchData.campaignId}/launch`,
        method: 'POST',
        body: launchData,
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [
        'Campaign' as const,
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    // Campaign Analytics and Results
    getCampaignResults: builder.query<ApiResponse<CampaignResultsDto>, string>({
      query: (campaignId) => `/defendx-plus/campaigns/${campaignId}/analytics`,
      providesTags: (_result, _error, campaignId) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    getCampaignAnalytics: builder.query<ApiResponse<CampaignAnalytics>, string>({
      query: (campaignId) => `/defendx-plus/campaigns/${campaignId}/analytics`,
      providesTags: (_result, _error, campaignId) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    // Campaign Templates
    getCampaignTemplates: builder.query<TemplatesPaginationResponse, void>({
      query: () => '/defendx-plus/templates',
      providesTags: ['Campaign' as const],
    }),

    getTemplatePreview: builder.query<ApiResponse<{ preview: string }>, string>({
      query: (templateId) => `/defendx-plus/templates/${templateId}/preview`,
      providesTags: ['Campaign' as const],
    }),

    // Template CRUD Operations
    createTemplate: builder.mutation<ApiResponse<CampaignTemplate>, CreateTemplateDto>({
      query: (templateData) => ({
        url: '/defendx-plus/templates',
        method: 'POST',
        body: templateData,
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    updateTemplate: builder.mutation<ApiResponse<CampaignTemplate>, { id: string; data: Partial<CreateTemplateDto> }>({
      query: ({ id, data }) => ({
        url: `/defendx-plus/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    deleteTemplate: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (templateId) => ({
        url: `/defendx-plus/templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    getTemplate: builder.query<ApiResponse<CampaignTemplate>, string>({
      query: (templateId) => `/defendx-plus/templates/${templateId}`,
      providesTags: (_result, _error, templateId) => [
        { type: 'Campaign' as const, id: templateId }
      ],
    }),

    // Campaign Lifecycle Management
    pauseCampaign: builder.mutation<ApiResponse<PhishingCampaign>, string>({
      query: (campaignId) => ({
        url: `/defendx-plus/campaigns/${campaignId}/pause`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, campaignId) => [
        'Campaign' as const,
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    resumeCampaign: builder.mutation<ApiResponse<PhishingCampaign>, string>({
      query: (campaignId) => ({
        url: `/defendx-plus/campaigns/${campaignId}/resume`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, campaignId) => [
        'Campaign' as const,
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    completeCampaign: builder.mutation<ApiResponse<PhishingCampaign>, string>({
      query: (campaignId) => ({
        url: `/defendx-plus/campaigns/${campaignId}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, campaignId) => [
        'Campaign' as const,
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    // Target Management
    addCampaignTargets: builder.mutation<ApiResponse<{ added: number }>, { campaignId: string; targets: any[] }>({
      query: ({ campaignId, targets }) => ({
        url: `/defendx-plus/campaigns/${campaignId}/targets`,
        method: 'POST',
        body: { targets },
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    removeCampaignTarget: builder.mutation<ApiResponse<{ success: boolean }>, { campaignId: string; targetId: string }>({
      query: ({ campaignId, targetId }) => ({
        url: `/defendx-plus/campaigns/${campaignId}/targets/${targetId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    searchCampaignTargets: builder.query<ApiResponse<any[]>, { campaignId: string; search: string }>({
      query: ({ campaignId, search }) => ({
        url: `/defendx-plus/campaigns/${campaignId}/targets/search`,
        params: { search },
      }),
      providesTags: (_result, _error, { campaignId }) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    // Live Statistics
    getCampaignLiveStats: builder.query<ApiResponse<any>, string>({
      query: (campaignId) => `/defendx-plus/campaigns/${campaignId}/live-stats`,
      providesTags: (_result, _error, campaignId) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    // Campaign Export
    exportCampaignData: builder.mutation<Blob, { campaignId: string; format?: 'csv' | 'xlsx' | 'pdf' }>({
      query: ({ campaignId, format = 'csv' }) => ({
        url: `/defendx-plus/campaigns/${campaignId}/export`,
        method: 'POST',
        body: { format },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // Campaign Cloning
    cloneCampaign: builder.mutation<ApiResponse<PhishingCampaign>, { campaignId: string; newName: string }>({
      query: ({ campaignId, newName }) => ({
        url: `/defendx-plus/campaigns/${campaignId}/clone`,
        method: 'POST',
        body: { newName },
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    // Bulk Actions
    bulkCampaignActions: builder.mutation<ApiResponse<{ success: boolean; results: any[] }>, { action: string; campaignIds: string[] }>({
      query: ({ action, campaignIds }) => ({
        url: '/defendx-plus/campaigns/bulk-actions',
        method: 'POST',
        body: { action, campaignIds },
      }),
      invalidatesTags: ['Campaign' as const],
    }),

    // Campaign Tracking Endpoints
    trackEmailOpen: builder.query<void, { campaignId: string; targetId: string }>({
      query: ({ campaignId, targetId }) => `/defendx-plus/campaigns/track/open/${campaignId}/${targetId}`,
    }),

    trackLinkClick: builder.query<void, { campaignId: string; targetId: string }>({
      query: ({ campaignId, targetId }) => `/defendx-plus/campaigns/track/click/${campaignId}/${targetId}`,
    }),

    trackCredentialSubmission: builder.mutation<void, { campaignId: string; targetId: string; credentials: any }>({
      query: ({ campaignId, targetId, credentials }) => ({
        url: `/defendx-plus/campaigns/track/credentials/${campaignId}/${targetId}`,
        method: 'POST',
        body: credentials,
      }),
    }),

    trackPhishingReport: builder.mutation<void, { campaignId: string; targetId: string; reportData: any }>({
      query: ({ campaignId, targetId, reportData }) => ({
        url: `/defendx-plus/campaigns/track/report/${campaignId}/${targetId}`,
        method: 'POST',
        body: reportData,
      }),
    }),

    // Webhook Configuration
    configureCampaignWebhooks: builder.mutation<ApiResponse<{ webhookId: string }>, { campaignId: string; webhookConfig: any }>({
      query: ({ campaignId, webhookConfig }) => ({
        url: `/defendx-plus/campaigns/${campaignId}/webhooks`,
        method: 'POST',
        body: webhookConfig,
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [
        { type: 'Campaign' as const, id: campaignId }
      ],
    }),

    // Incident Reporting
    reportIncident: builder.mutation<ApiResponse<{ incidentId: string }>, ReportIncidentDto>({
      query: (incidentData) => ({
        url: '/defendx-plus/incidents/report',
        method: 'POST',
        body: incidentData,
      }),
      invalidatesTags: ['Alert' as const],
    }),

    // Agent Management
    getAgents: builder.query<PaginatedResponse<{
      id: string;
      hostname: string;
      ipAddress: string;
      operatingSystem: string;
      agentVersion: string;
      status: 'online' | 'offline' | 'error';
      lastSeen: string;
      organizationId: string;
    }>, {
      page?: number;
      limit?: number;
      status?: 'online' | 'offline' | 'error';
      search?: string;
    }>({
      query: (params = {}) => ({
        url: '/defendx-plus/agents',
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...params,
        },
      }),
      providesTags: ['Agent' as const],
    }),

    registerAgent: builder.mutation<ApiResponse<{ agentId: string; config: AgentConfig }>, AgentRegistration>({
      query: (agentData) => ({
        url: '/defendx-plus/agents/register',
        method: 'POST',
        body: agentData,
      }),
      invalidatesTags: ['Agent' as const],
    }),

    getAgentConfig: builder.query<ApiResponse<AgentConfig>, string>({
      query: (agentId) => `/defendx-plus/agents/${agentId}/config`,
      providesTags: (_result, _error, agentId) => [
        { type: 'Agent' as const, id: agentId }
      ],
    }),

    sendHeartbeat: builder.mutation<ApiResponse<{ status: string }>, {
      agentId: string;
      status: 'online' | 'scanning' | 'idle' | 'error';
      metrics?: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
      };
    }>({
      query: ({ agentId, ...data }) => ({
        url: `/defendx-plus/agents/${agentId}/heartbeat`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { agentId }) => [
        { type: 'Agent' as const, id: agentId }
      ],
    }),

    // Telemetry
    sendTelemetry: builder.mutation<ApiResponse<{ received: boolean }>, TelemetryData>({
      query: (telemetryData) => ({
        url: '/defendx-plus/telemetry',
        method: 'POST',
        body: telemetryData,
      }),
    }),

    // Alerts Management
    getAlerts: builder.query<PaginatedResponse<Alert>, {
      page?: number;
      limit?: number;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      acknowledged?: boolean;
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => ({
        url: '/defendx-plus/alerts',
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...params,
        },
      }),
      providesTags: ['Alert' as const],
    }),

    getLiveAlerts: builder.query<ApiResponse<Alert[]>, void>({
      query: () => '/defendx-plus/alerts/live',
      providesTags: ['Alert' as const],
      // Note: pollingInterval should be used when calling the hook, not here
      // Example: useGetLiveAlertsQuery(undefined, { pollingInterval: 30000 })
    }),

    acknowledgeAlert: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (alertId) => ({
        url: `/defendx-plus/alerts/${alertId}/acknowledge`,
        method: 'PUT',
      }),
      invalidatesTags: ['Alert' as const],
    }),

    closeAlert: builder.mutation<ApiResponse<{ success: boolean }>, { 
      alertId: string; 
      resolution?: string; 
    }>({
      query: ({ alertId, resolution }) => ({
        url: `/defendx-plus/alerts/${alertId}/close`,
        method: 'PUT',
        body: { resolution },
      }),
      invalidatesTags: ['Alert' as const],
    }),

    // Scanning Management
    getScanSchedules: builder.query<PaginatedResponse<ScanSchedule>, {
      page?: number;
      limit?: number;
      isActive?: boolean;
    }>({
      query: (params = {}) => ({
        url: '/defendx-plus/scans/schedules',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['Scan' as const],
    }),

    scheduleScan: builder.mutation<ApiResponse<ScanSchedule>, {
      name: string;
      agentIds: string[];
      scanType: 'quick' | 'full' | 'custom';
      schedule: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time: string;
        daysOfWeek?: number[];
        dayOfMonth?: number;
      };
    }>({
      query: (scheduleData) => ({
        url: '/defendx-plus/scans/schedule',
        method: 'POST',
        body: scheduleData,
      }),
      invalidatesTags: ['Scan' as const],
    }),

    triggerScan: builder.mutation<ApiResponse<{ scanId: string }>, {
      agentIds: string[];
      scanType: 'quick' | 'full' | 'custom';
      priority?: 'low' | 'medium' | 'high';
    }>({
      query: (scanData) => ({
        url: '/defendx-plus/scans/trigger',
        method: 'POST',
        body: scanData,
      }),
      invalidatesTags: ['Scan' as const],
    }),

    getScanResults: builder.query<PaginatedResponse<SystemScan>, {
      page?: number;
      limit?: number;
      agentId?: string;
      status?: 'scheduled' | 'running' | 'completed' | 'failed';
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => ({
        url: '/defendx-plus/scans/results',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['Scan' as const],
    }),

    getScanResult: builder.query<ApiResponse<SystemScan & {
      findings: Array<{
        type: 'malware' | 'vulnerability' | 'suspicious_activity' | 'policy_violation';
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        location: string;
        recommendation: string;
        resolved: boolean;
      }>;
      recommendations: string[];
    }>, string>({
      query: (scanId) => `/defendx-plus/scans/${scanId}`,
      providesTags: (_result, _error, scanId) => [
        { type: 'Scan' as const, id: scanId }
      ],
    }),

    downloadScanReport: builder.query<Blob, {
      scanId: string;
      format: 'pdf' | 'excel' | 'csv';
    }>({
      query: ({ scanId, format }) => ({
        url: `/defendx-plus/scans/${scanId}/report`,
        params: { format },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  // Campaign hooks
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useLaunchCampaignMutation,
  useGetCampaignResultsQuery,
  useGetCampaignAnalyticsQuery,
  // Campaign Templates hooks
  useGetCampaignTemplatesQuery,
  useGetTemplatePreviewQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useGetTemplateQuery,
  
  // Campaign Lifecycle hooks
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useCompleteCampaignMutation,
  
  // Target Management hooks
  useAddCampaignTargetsMutation,
  useRemoveCampaignTargetMutation,
  useSearchCampaignTargetsQuery,
  
  // Campaign Statistics hooks
  useGetCampaignLiveStatsQuery,
  useExportCampaignDataMutation,
  useCloneCampaignMutation,
  useBulkCampaignActionsMutation,
  
  // Campaign Tracking hooks
  useLazyTrackEmailOpenQuery,
  useLazyTrackLinkClickQuery,
  useTrackCredentialSubmissionMutation,
  useTrackPhishingReportMutation,
  
  // Webhook hooks
  useConfigureCampaignWebhooksMutation,
  
  // Incident hooks
  useReportIncidentMutation,
  
  // Agent hooks
  useGetAgentsQuery,
  useRegisterAgentMutation,
  useGetAgentConfigQuery,
  useSendHeartbeatMutation,
  
  // Telemetry hooks
  useSendTelemetryMutation,
  
  // Alert hooks
  useGetAlertsQuery,
  useGetLiveAlertsQuery,
  useAcknowledgeAlertMutation,
  useCloseAlertMutation,
  
  // Scan hooks
  useGetScanSchedulesQuery,
  useScheduleScanMutation,
  useTriggerScanMutation,
  useGetScanResultsQuery,
  useGetScanResultQuery,
  useLazyDownloadScanReportQuery,
} = defendxPlusApi;