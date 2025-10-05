// Mock DefendX Plus API - Replace with actual implementation when backend is ready
export {
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
} from './mockDefendXPlusApi';
