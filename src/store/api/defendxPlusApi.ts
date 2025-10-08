// Real DefendX Plus API - Backend Integration Ready
export {
  // Campaign hooks
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useLaunchCampaignMutation,
  useGetCampaignResultsQuery,
  useGetCampaignAnalyticsQuery,
  useGetCampaignTemplatesQuery,
  
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
} from './realDefendXPlusApi';
