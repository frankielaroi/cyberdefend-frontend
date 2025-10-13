// Real DefendX API connected to backend
export {
  // Assessment hooks from real API
  useCreateAssessmentMutation,
  useStartAssessmentMutation,
  useQuickStartCSIAssessmentMutation,
  useSubmitSingleResponseMutation,
  useSubmitBulkResponsesMutation,
  useSubmitCSIAssessmentMutation,
  useCompleteAssessmentMutation,
  useGetAssessmentQuery,
  useGetAssessmentReportQuery,
  useGetCSIResultQuery,
  useGetAssessmentResultQuery,
  useGetOrganizationAssessmentsQuery,
  useGetAssessmentStatsQuery,
  useGetLatestCSIResultQuery,
  useLazyDownloadAssessmentReportQuery,
  useLazyDownloadComprehensiveReportQuery,
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
  useGetOrganizationAssessmentsQuery as useGetAssessmentHistoryQuery,
  // Add legacy support for old startAssessment that combined create+start
  useQuickStartCSIAssessmentMutation as useStartAssessmentMutation_Legacy,
  useSubmitCSIAssessmentMutation as useSubmitAssessmentMutation_Legacy
} from './realDefendXApi';
