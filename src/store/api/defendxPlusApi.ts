import { apiSlice } from './apiSlice';
import type { 
  PhishingCampaign,
  Alert,
  CreateCampaignDto,
  LaunchCampaignDto,
  CampaignResultsDto,
  UpdateCampaignDto,
  ReportIncidentDto,
  RegisterAgentDto,
  AgentRegistrationResponse,
  Agent,
  AgentConfig,
  HeartbeatDto,
  TelemetryPayload,
  AlertsParams,
  AcknowledgeAlertDto,
  CloseAlertDto,
  ScheduleScanDto,
  TriggerScanDto,
  ScanSchedule,
  ScanResult,
  ScanResultsParams,
  ApiResponse,
  PaginatedResponse
} from '../../types';

export const defendxPlusApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Phishing Campaign Management
    createCampaign: builder.mutation<PhishingCampaign, CreateCampaignDto>({
      query: (campaignData) => ({
        url: '/defendxplus/campaign/create',
        method: 'POST',
        body: campaignData,
      }),
      invalidatesTags: ['Campaign'],
    }),
    launchCampaign: builder.mutation<ApiResponse, LaunchCampaignDto>({
      query: (launchData) => ({
        url: '/defendxplus/campaign/launch',
        method: 'POST',
        body: launchData,
      }),
      invalidatesTags: ['Campaign'],
    }),
    getCampaignResults: builder.query<CampaignResultsDto, string>({
      query: (campaignId) => `/defendxplus/campaign/${campaignId}/results`,
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),
    getCampaignAnalytics: builder.query<CampaignResultsDto, string>({
      query: (campaignId) => `/defendxplus/campaign/${campaignId}/analytics`,
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),
    getCampaigns: builder.query<PaginatedResponse<PhishingCampaign>, void>({
      query: () => '/defendxplus/campaign',
      providesTags: ['Campaign'],
    }),
    updateCampaign: builder.mutation<PhishingCampaign, { id: string; data: UpdateCampaignDto }>({
      query: ({ id, data }) => ({
        url: `/defendxplus/campaign/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Campaign', id }],
    }),
    deleteCampaign: builder.mutation<ApiResponse, string>({
      query: (campaignId) => ({
        url: `/defendxplus/campaign/${campaignId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),

    // Incident Reporting
    reportIncident: builder.mutation<ApiResponse, ReportIncidentDto>({
      query: (incidentData) => ({
        url: '/defendxplus/report/incident',
        method: 'POST',
        body: incidentData,
      }),
      invalidatesTags: ['Alert'],
    }),

    // Agent Management
    registerAgent: builder.mutation<AgentRegistrationResponse, RegisterAgentDto>({
      query: (agentData) => ({
        url: '/defendxplus/agents/register',
        method: 'POST',
        body: agentData,
      }),
      invalidatesTags: ['Agent'],
    }),
    getAgentConfig: builder.query<AgentConfig, string>({
      query: (agentId) => `/defendxplus/agents/${agentId}/config`,
      providesTags: (_result, _error, id) => [{ type: 'Agent', id }],
    }),
    getAgents: builder.query<Agent[], void>({
      query: () => '/defendxplus/agents',
      providesTags: ['Agent'],
    }),
    sendHeartbeat: builder.mutation<ApiResponse, { id: string; data: HeartbeatDto }>({
      query: ({ id, data }) => ({
        url: `/defendxplus/agents/${id}/heartbeat`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Agent', id }],
    }),

    // Telemetry
    sendTelemetry: builder.mutation<ApiResponse, TelemetryPayload>({
      query: (telemetryData) => ({
        url: '/defendxplus/telemetry',
        method: 'POST',
        body: telemetryData,
      }),
    }),

    // Alert Management
    getAlerts: builder.query<PaginatedResponse<Alert>, AlertsParams>({
      query: (params) => ({
        url: '/defendxplus/alerts',
        params,
      }),
      providesTags: ['Alert'],
    }),
    acknowledgeAlert: builder.mutation<ApiResponse, { id: string; data: AcknowledgeAlertDto }>({
      query: ({ id, data }) => ({
        url: `/defendxplus/alerts/${id}/ack`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Alert', id }],
    }),
    closeAlert: builder.mutation<ApiResponse, { id: string; data: CloseAlertDto }>({
      query: ({ id, data }) => ({
        url: `/defendxplus/alerts/${id}/close`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Alert', id }],
    }),

    // Real-time alerts using Server-Sent Events
    // Note: This would need special handling for SSE in a real implementation
    getLiveAlerts: builder.query<Alert[], void>({
      query: () => '/defendxplus/alerts/live',
      // This endpoint returns Server-Sent Events, might need custom handling
    }),

    // Scan Management
    scheduleScan: builder.mutation<ApiResponse, ScheduleScanDto>({
      query: (scanData) => ({
        url: '/defendxplus/scans/schedule',
        method: 'POST',
        body: scanData,
      }),
      invalidatesTags: ['Scan'],
    }),
    triggerScan: builder.mutation<ApiResponse, TriggerScanDto>({
      query: (scanData) => ({
        url: '/defendxplus/scans/run',
        method: 'POST',
        body: scanData,
      }),
      invalidatesTags: ['Scan'],
    }),
    getScanSchedules: builder.query<ScanSchedule[], void>({
      query: () => '/defendxplus/scans',
      providesTags: ['Scan'],
    }),
    getScanResults: builder.query<PaginatedResponse<ScanResult>, ScanResultsParams>({
      query: (params) => ({
        url: '/defendxplus/scans/results',
        params,
      }),
      providesTags: ['Scan'],
    }),
    getScanResult: builder.query<ScanResult, string>({
      query: (scanId) => `/defendxplus/scans/results/${scanId}`,
      providesTags: (_result, _error, id) => [{ type: 'Scan', id }],
    }),

    // Download scan report
    downloadScanReport: builder.query<Blob, string>({
      query: (scanId) => ({
        url: `/defendxplus/scans/results/${scanId}`,
        params: { format: 'pdf' },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  // Campaign hooks
  useCreateCampaignMutation,
  useLaunchCampaignMutation,
  useGetCampaignResultsQuery,
  useGetCampaignAnalyticsQuery,
  useGetCampaignsQuery,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  
  // Incident hooks
  useReportIncidentMutation,
  
  // Agent hooks
  useRegisterAgentMutation,
  useGetAgentConfigQuery,
  useGetAgentsQuery,
  useSendHeartbeatMutation,
  
  // Telemetry hooks
  useSendTelemetryMutation,
  
  // Alert hooks
  useGetAlertsQuery,
  useAcknowledgeAlertMutation,
  useCloseAlertMutation,
  useGetLiveAlertsQuery,
  
  // Scan hooks
  useScheduleScanMutation,
  useTriggerScanMutation,
  useGetScanSchedulesQuery,
  useGetScanResultsQuery,
  useGetScanResultQuery,
  useLazyDownloadScanReportQuery,
} = defendxPlusApi;
