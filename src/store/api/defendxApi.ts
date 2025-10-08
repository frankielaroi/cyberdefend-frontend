// Real DefendX API connected to backend
export {
  // Assessment hooks from real API
  useStartAssessmentMutation,
  useSubmitAssessmentMutation,
  useCompleteAssessmentMutation,
  useGetAssessmentQuery,
  useGetAssessmentResultQuery,
  useGetOrganizationAssessmentsQuery,
  useGetLatestCSIResultQuery,
  useLazyDownloadAssessmentReportQuery,
  useGetDashboardQuery,
  useResumeAssessmentQuery,
  useSaveAssessmentProgressMutation,
  useCancelAssessmentMutation,
  useGetAssessmentQuestionsQuery,
  useGetAssessmentResponsesQuery,
} from './realDefendXApi';

export {
  // CSI Directory hooks from real API
  useGetCSIDirectoryQuery,
  useGetCSILeaderboardQuery,
  useGetCSIHeatmapQuery,
  useGetCSITrendsQuery,
  useGetPublicCSIProfileQuery,
  useSearchCSIDirectoryQuery,
  useGetCSIDirectoryFiltersQuery,
  useLazyExportCSIDirectoryQuery,
  useGetCSIInsightsQuery,
} from './realCSIDirectoryApi';

export {
  // Statistics hooks from real API
  useGetRegionalStatsQuery,
  useGetSectoralStatsQuery,
  useGetBenchmarkingDataQuery,
  useGetMaturityMetricsQuery,
  useGetThreatLandscapeQuery,
  useGetComplianceMetricsQuery,
  useGetHistoricalTrendsQuery,
  useLazyExportStatisticsQuery,
  useGetStatisticsDashboardQuery,
} from './realStatisticsApi';

// Legacy exports for backward compatibility
export { 
  useGetOrganizationAssessmentsQuery as useGetAssessmentHistoryQuery 
} from './realDefendXApi';
