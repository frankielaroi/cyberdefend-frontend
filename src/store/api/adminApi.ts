// Real Admin API - Backend Integration Ready
export {
  // Dashboard hooks
  useGetDashboardStatsQuery,
  useGetSystemStatsQuery,

  // User management hooks
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,

  // Organization management hooks
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationStatusMutation,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,

  // Question management hooks
  useGetQuestionsQuery,
  useGetQuestionQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useBulkUpdateQuestionsMutation,

  // Category management hooks
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // System configuration hooks
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,

  // Audit hooks
  useGetAuditLogsQuery,

  // CSI directory hooks
  useApproveCsiEntryMutation,
  useRejectCsiEntryMutation,
  useGetPendingCsiEntriesQuery,

  // Reports hooks
  useGenerateSystemReportMutation,
} from './realAdminApi';
