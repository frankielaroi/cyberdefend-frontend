import { apiSlice } from './apiSlice';
import type { 
  Question,
  OrganizationStats,
  AdminUser,
  AdminOrganization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  ApiResponse,
  PaginatedResponse
} from '../../types';

interface QuestionCategory {
  id: string;
  name: string;
  weight: number;
  questionCount: number;
}

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt: string;
  updatedBy: string;
}

interface AdminDashboardStats extends OrganizationStats {
  byRegion: Record<string, number>;
  bySector: Record<string, number>;
  trends: Array<{
    date: string;
    assessments: number;
    campaigns: number;
    alerts: number;
    newUsers: number;
  }>;
  recentActivity: AuditLog[];
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard & Statistics
    getDashboardStats: builder.query<AdminDashboardStats, { 
      region?: string; 
      sector?: string; 
      startDate?: string; 
      endDate?: string 
    }>({
      query: (params) => ({
        url: '/admin/dashboard/stats',
        params,
      }),
    }),
    getSystemStats: builder.query<OrganizationStats, void>({
      query: () => '/admin/stats/system',
    }),

    // User Management
    getUsers: builder.query<PaginatedResponse<AdminUser>, {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      organizationId?: string;
      isActive?: boolean;
    }>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),
    getUser: builder.query<AdminUser, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<AdminUser, {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      organizationId?: string;
      sendInvite?: boolean;
    }>({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<AdminUser, { 
      id: string; 
      data: {
        firstName?: string;
        lastName?: string;
        role?: string;
        isActive?: boolean;
        organizationId?: string;
      }
    }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
    deactivateUser: builder.mutation<ApiResponse, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    reactivateUser: builder.mutation<ApiResponse, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/reactivate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Organization Management
    getOrganizations: builder.query<PaginatedResponse<AdminOrganization>, {
      page?: number;
      limit?: number;
      search?: string;
      sector?: string;
      region?: string;
      subscriptionStatus?: string;
    }>({
      query: (params) => ({
        url: '/admin/orgs',
        params,
      }),
      providesTags: ['Organization'],
    }),
    getOrganization: builder.query<AdminOrganization, string>({
      query: (orgId) => `/admin/orgs/${orgId}`,
      providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),
    updateOrganizationStatus: builder.mutation<ApiResponse, { 
      id: string; 
      status: 'active' | 'suspended' 
    }>({
      query: ({ id, status }) => ({
        url: `/admin/orgs/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Organization', id }],
    }),
    createOrganization: builder.mutation<AdminOrganization, CreateOrganizationDto>({
      query: (orgData) => ({
        url: '/admin/orgs',
        method: 'POST',
        body: orgData,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation<AdminOrganization, { 
      id: string; 
      data: UpdateOrganizationDto 
    }>({
      query: ({ id, data }) => ({
        url: `/admin/orgs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Organization', id }],
    }),
    deleteOrganization: builder.mutation<ApiResponse, string>({
      query: (orgId) => ({
        url: `/admin/orgs/${orgId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),

    // Question Management
    getQuestions: builder.query<PaginatedResponse<Question>, { 
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    }>({
      query: (params) => ({
        url: '/admin/questions',
        params,
      }),
      providesTags: ['Question'],
    }),
    getQuestion: builder.query<Question, string>({
      query: (questionId) => `/admin/questions/${questionId}`,
      providesTags: (_result, _error, id) => [{ type: 'Question', id }],
    }),
    createQuestion: builder.mutation<Question, Omit<Question, 'id'>>({
      query: (questionData) => ({
        url: '/admin/questions',
        method: 'POST',
        body: questionData,
      }),
      invalidatesTags: ['Question'],
    }),
    updateQuestion: builder.mutation<Question, { id: string; data: Partial<Question> }>({
      query: ({ id, data }) => ({
        url: `/admin/questions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Question', id }],
    }),
    deleteQuestion: builder.mutation<ApiResponse, string>({
      query: (questionId) => ({
        url: `/admin/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Question', id }],
    }),
    bulkUpdateQuestions: builder.mutation<ApiResponse, { questionIds: string[]; updates: Partial<Question> }>({
      query: (data) => ({
        url: '/admin/questions/bulk',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Question'],
    }),

    // Category Management
    getCategories: builder.query<QuestionCategory[], void>({
      query: () => '/admin/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<QuestionCategory, Omit<QuestionCategory, 'id' | 'questionCount'>>({
      query: (categoryData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<QuestionCategory, { id: string; data: Partial<QuestionCategory> }>({
      query: ({ id, data }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<ApiResponse, string>({
      query: (categoryId) => ({
        url: `/admin/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // System Configuration
    getSystemConfig: builder.query<SystemConfig[], void>({
      query: () => '/admin/config',
      providesTags: ['Config'],
    }),
    updateSystemConfig: builder.mutation<SystemConfig, { key: string; value: string }>({
      query: (configData) => ({
        url: '/admin/config',
        method: 'PUT',
        body: configData,
      }),
      invalidatesTags: ['Config'],
    }),

    // Audit & Monitoring
    getAuditLogs: builder.query<PaginatedResponse<AuditLog>, { 
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
    }>({
      query: (params) => ({
        url: '/admin/audit-logs',
        params,
      }),
    }),

    // CSI Directory Management
    approveCsiEntry: builder.mutation<ApiResponse, string>({
      query: (organizationId) => ({
        url: `/admin/csi-directory/${organizationId}/approve`,
        method: 'POST',
      }),
    }),
    rejectCsiEntry: builder.mutation<ApiResponse, { organizationId: string; reason: string }>({
      query: ({ organizationId, reason }) => ({
        url: `/admin/csi-directory/${organizationId}/reject`,
        method: 'POST',
        body: { reason },
      }),
    }),
    getPendingCsiEntries: builder.query<any[], void>({
      query: () => '/admin/csi-directory/pending',
    }),

    // Reports & Analytics
    generateSystemReport: builder.mutation<Blob, {
      type: 'organizations' | 'assessments' | 'users' | 'security';
      format: 'pdf' | 'csv' | 'excel';
      filters?: Record<string, any>;
    }>({
      query: (reportData) => ({
        url: '/admin/reports/generate',
        method: 'POST',
        body: reportData,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
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
} = adminApi;
