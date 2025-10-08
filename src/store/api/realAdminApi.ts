import { Organization } from './realOrganizationApi';
import { apiSlice } from './apiSlice';
import type {
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFiltersDto,
  QuestionCategoryDto,
  BulkQuestionUpdateDto,
  PaginatedResponse,
  ApiResponse,
  User,
  UserRole,
  OrganizationSize,
  Sector
} from '../../types';

// Enhanced Admin Types for Backend Integration
export interface DashboardStatsResponse {
  totalUsers: number;
  activeUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalAlerts: number;
  unacknowledgedAlerts: number;
  byRegion: Record<string, number>;
  bySector: Record<Sector, number>;
  trends: Array<{
    date: string;
    assessments: number;
    campaigns: number;
    alerts: number;
    newUsers: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'assessment' | 'campaign' | 'alert' | 'user';
    description: string;
    timestamp: string;
    userId?: string;
    organizationId?: string;
  }>;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  organizationId?: string;
  isActive?: boolean;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  password?: string;
  sendInvite?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  organizationId?: string;
  isActive?: boolean;
}

export interface OrganizationFilters {
  page?: number;
  limit?: number;
  search?: string;
  sector?: Sector;
  size?: OrganizationSize;
  region?: string;
  isActive?: boolean;
}

export interface CreateOrganizationDto {
  name: string;
  email: string;
  domain?: string;
  sector: Sector;
  size: OrganizationSize;
  region: string;
  phone?: string;
  website?: string;
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  domain?: string;
  sector?: Sector;
  size?: OrganizationSize;
  region?: string;
  phone?: string;
  website?: string;
  isActive?: boolean;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Statistics
    getDashboardStats: builder.query<ApiResponse<DashboardStatsResponse>, {
      region?: string;
      sector?: string;
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => ({
        url: '/admin/dashboard/stats',
        params,
      }),
      providesTags: ['Organization' as const, 'User' as const, 'Assessment' as const],
    }),

    // System Statistics
    getSystemStats: builder.query<ApiResponse<{
      serverHealth: 'healthy' | 'warning' | 'critical';
      uptime: number;
      memoryUsage: number;
      cpuUsage: number;
      storageUsage: number;
      activeConnections: number;
      apiRequestsToday: number;
      averageResponseTime: number;
    }>, void>({
      query: () => '/admin/system/stats',
      providesTags: ['Config' as const],
    }),

    // User Management
    getUsers: builder.query<PaginatedResponse<User>, UserFilters>({
      query: (params = {}) => ({
        url: '/admin/users',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['User' as const],
    }),

    getUser: builder.query<ApiResponse<User>, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: 'User' as const, id: userId }
      ],
    }),

    createUser: builder.mutation<ApiResponse<User>, CreateUserDto>({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User' as const],
    }),

    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'User' as const,
        { type: 'User' as const, id }
      ],
    }),

    deactivateUser: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, userId) => [
        'User' as const,
        { type: 'User' as const, id: userId }
      ],
    }),

    reactivateUser: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/reactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, userId) => [
        'User' as const,
        { type: 'User' as const, id: userId }
      ],
    }),

    // Organization Management
    getOrganizations: builder.query<PaginatedResponse<Organization>, OrganizationFilters>({
      query: (params = {}) => ({
        url: '/admin/organizations',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['Organization' as const],
    }),

    getOrganization: builder.query<ApiResponse<Organization>, string>({
      query: (orgId) => `/admin/organizations/${orgId}`,
      providesTags: (_result, _error, orgId) => [
        { type: 'Organization' as const, id: orgId }
      ],
    }),

    createOrganization: builder.mutation<ApiResponse<Organization>, CreateOrganizationDto>({
      query: (orgData) => ({
        url: '/admin/organizations',
        method: 'POST',
        body: orgData,
      }),
      invalidatesTags: ['Organization' as const, 'User' as const],
    }),

    updateOrganization: builder.mutation<ApiResponse<Organization>, { id: string; data: UpdateOrganizationDto }>({
      query: ({ id, data }) => ({
        url: `/admin/organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Organization' as const,
        { type: 'Organization' as const, id }
      ],
    }),

    updateOrganizationStatus: builder.mutation<ApiResponse<{ success: boolean }>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/organizations/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Organization' as const,
        { type: 'Organization' as const, id }
      ],
    }),

    deleteOrganization: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (orgId) => ({
        url: `/admin/organizations/${orgId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization' as const, 'User' as const],
    }),

    // Question Management
    getQuestions: builder.query<PaginatedResponse<Question>, QuestionFiltersDto>({
      query: (params = {}) => ({
        url: '/admin/questions',
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...params,
        },
      }),
      providesTags: ['Question' as const],
    }),

    getQuestion: builder.query<ApiResponse<Question>, string>({
      query: (questionId) => `/admin/questions/${questionId}`,
      providesTags: (_result, _error, questionId) => [
        { type: 'Question' as const, id: questionId }
      ],
    }),

    createQuestion: builder.mutation<ApiResponse<Question>, CreateQuestionDto>({
      query: (questionData) => ({
        url: '/admin/questions',
        method: 'POST',
        body: questionData,
      }),
      invalidatesTags: ['Question' as const],
    }),

    updateQuestion: builder.mutation<ApiResponse<Question>, { id: string; data: UpdateQuestionDto }>({
      query: ({ id, data }) => ({
        url: `/admin/questions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Question' as const,
        { type: 'Question' as const, id }
      ],
    }),

    deleteQuestion: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (questionId) => ({
        url: `/admin/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Question' as const],
    }),

    bulkUpdateQuestions: builder.mutation<ApiResponse<{ updated: number }>, BulkQuestionUpdateDto>({
      query: (data) => ({
        url: '/admin/questions/bulk-update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Question' as const],
    }),

    // Question Categories
    getCategories: builder.query<ApiResponse<Array<{
      name: string;
      description?: string;
      questionCount: number;
      weight?: number;
      isActive: boolean;
    }>>, void>({
      query: () => '/admin/questions/categories',
      providesTags: ['Category' as const],
    }),

    createCategory: builder.mutation<ApiResponse<{ name: string; description?: string; weight?: number }>, QuestionCategoryDto>({
      query: (categoryData) => ({
        url: '/admin/questions/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category' as const],
    }),

    updateCategory: builder.mutation<ApiResponse<{ name: string; description?: string; weight?: number }>, { id: string; data: Partial<QuestionCategoryDto> }>({
      query: ({ id, data }) => ({
        url: `/admin/questions/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category' as const],
    }),

    deleteCategory: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (categoryId) => ({
        url: `/admin/questions/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category' as const, 'Question' as const],
    }),

    // System Configuration
    getSystemConfig: builder.query<ApiResponse<Array<{
      key: string;
      value: string;
      description?: string;
      type: 'string' | 'number' | 'boolean' | 'json';
      updatedAt: string;
    }>>, void>({
      query: () => '/admin/system/config',
      providesTags: ['Config' as const],
    }),

    updateSystemConfig: builder.mutation<ApiResponse<{ key: string; value: string }>, { key: string; value: string }>({
      query: (configData) => ({
        url: '/admin/system/config',
        method: 'PUT',
        body: configData,
      }),
      invalidatesTags: ['Config' as const],
    }),

    // Audit Logs
    getAuditLogs: builder.query<PaginatedResponse<{
      id: string;
      userId: string;
      userEmail: string;
      action: string;
      resource: string;
      resourceId?: string;
      details?: Record<string, any>;
      ipAddress: string;
      userAgent: string;
      timestamp: string;
    }>, {
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => ({
        url: '/admin/audit-logs',
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...params,
        },
      }),
      providesTags: ['Audit' as const],
    }),

    // CSI Directory Management
    getPendingCsiEntries: builder.query<PaginatedResponse<{
      id: string;
      organizationId: string;
      organizationName: string;
      score: number;
      tier: 'A' | 'B' | 'C' | 'D' | 'F';
      submittedAt: string;
      status: 'pending' | 'approved' | 'rejected';
    }>, { page?: number; limit?: number }>({
      query: (params = {}) => ({
        url: '/admin/csi-directory/pending',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['CSIDirectory' as const],
    }),

    approveCsiEntry: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (entryId) => ({
        url: `/admin/csi-directory/${entryId}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['CSIDirectory' as const],
    }),

    rejectCsiEntry: builder.mutation<ApiResponse<{ success: boolean }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/csi-directory/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['CSIDirectory' as const],
    }),

    // System Reports
    generateSystemReport: builder.mutation<ApiResponse<{ reportUrl: string; reportId: string }>, {
      type: 'users' | 'organizations' | 'assessments' | 'security';
      format: 'pdf' | 'excel' | 'csv';
      dateRange?: {
        startDate: string;
        endDate: string;
      };
      filters?: Record<string, any>;
    }>({
      query: (reportData) => ({
        url: '/admin/reports/generate',
        method: 'POST',
        body: reportData,
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