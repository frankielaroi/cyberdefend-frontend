// Mock DefendX API - Replace with actual implementation when backend is ready
export {
  // Dashboard hooks
  useGetDashboardQuery,
  
  // Statistics hooks
  useGetRegionalStatsQuery,
  useGetSectoralStatsQuery,
  
  // Assessment hooks
  useStartAssessmentMutation,
  useSubmitAssessmentMutation,
  useCompleteAssessmentMutation,
  useGetAssessmentResultQuery,
  useGetLatestCSIResultQuery,
  useGetOrganizationAssessmentsQuery,
  
  // Report hooks
  useLazyDownloadAssessmentReportQuery,
  
  // Legacy exports for backward compatibility
  useGetAssessmentHistoryQuery,
} from './mockDefendXApi';
