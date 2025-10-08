// Real CSI Directory API connected to backend
export {
  useGetCSIDirectoryQuery,
  useGetCSILeaderboardQuery,
  useGetCSIHeatmapQuery,
  useGetCSITrendsQuery,
  useGetPublicCSIProfileQuery,
  useSearchCSIDirectoryQuery,
  useGetCSIDirectoryFiltersQuery,
  useLazyExportCSIDirectoryQuery,
  useGetCSIInsightsQuery,
  // Type exports
  type CSIDirectoryFilters,
  type LeaderboardEntry,
  type HeatmapData,
  type CSITrends,
} from './realCSIDirectoryApi';

// Legacy exports for backward compatibility
export {
  useGetCSIInsightsQuery as useGetCSIAdminStatsQuery
} from './realCSIDirectoryApi';