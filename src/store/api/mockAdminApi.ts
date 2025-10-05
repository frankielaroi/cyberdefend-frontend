import React from 'react';
import { mockAdminService } from '../../services/mockAdminService';

// Helper to create a mock query hook
const createMockQuery = <TData, TParams = void>(
  queryFn: (params: TParams) => Promise<TData>
) => {
  return (params?: TParams, options?: { skip?: boolean }) => {
    const [data, setData] = React.useState<TData | undefined>();
    const [error, setError] = React.useState<any>();
    const [isLoading, setIsLoading] = React.useState(!options?.skip);

    const executeQuery = React.useCallback(async () => {
      if (options?.skip) return;
      
      setIsLoading(true);
      setError(undefined);
      
      try {
        const result = await queryFn(params as TParams);
        setData(result);
      } catch (err) {
        setError({ status: 500, data: { message: (err as Error).message } });
      } finally {
        setIsLoading(false);
      }
    }, [params, options?.skip]);

    React.useEffect(() => {
      executeQuery();
    }, [executeQuery]);

    return {
      data,
      error,
      isLoading,
      isSuccess: !isLoading && !error && data !== undefined,
      isError: !isLoading && !!error,
      refetch: executeQuery
    };
  };
};

// Helper to create a mock mutation hook
const createMockMutation = <TData, TParams>(
  mutationFn: (params: TParams) => Promise<TData>
) => {
  return () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<any>();

    const mutate = async (params: TParams): Promise<{ data: TData }> => {
      setIsLoading(true);
      setError(undefined);

      try {
        const data = await mutationFn(params);
        return { data };
      } catch (err) {
        const error = { status: 400, data: { message: (err as Error).message } };
        setError(error);
        throw { error };
      } finally {
        setIsLoading(false);
      }
    };

    return [
      mutate,
      {
        isLoading,
        error,
        reset: () => {
          setError(undefined);
        }
      }
    ];
  };
};

// Mock Admin API hooks
export const useGetDashboardStatsQuery = createMockQuery(
  (params: { region?: string; sector?: string; startDate?: string; endDate?: string } = {}) =>
    mockAdminService.getDashboardStats(params)
);

export const useGetSystemStatsQuery = createMockQuery(
  () => mockAdminService.getSystemStats()
);

// User Management Hooks
export const useGetUsersQuery = createMockQuery(
  (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    organizationId?: string;
    isActive?: boolean;
  } = {}) => mockAdminService.getUsers(params)
);

export const useGetUserQuery = createMockQuery(
  (userId: string) => mockAdminService.getUser(userId)
);

export const useCreateUserMutation = createMockMutation(
  (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId?: string;
    sendInvite?: boolean;
  }) => mockAdminService.createUser(userData)
);

export const useUpdateUserMutation = createMockMutation(
  ({ id, data }: {
    id: string;
    data: {
      firstName?: string;
      lastName?: string;
      role?: string;
      isActive?: boolean;
      organizationId?: string;
    };
  }) => mockAdminService.updateUser(id, data)
);

export const useDeactivateUserMutation = createMockMutation(
  (userId: string) => mockAdminService.deactivateUser(userId)
);

export const useReactivateUserMutation = createMockMutation(
  (userId: string) => mockAdminService.reactivateUser(userId)
);

// Organization Management Hooks (simplified for now)
export const useGetOrganizationsQuery = createMockQuery(
  (_params: {
    page?: number;
    limit?: number;
    search?: string;
    sector?: string;
    region?: string;
    subscriptionStatus?: string;
  } = {}) => {
    // Return mock paginated organizations
    return Promise.resolve({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    });
  }
);

export const useGetOrganizationQuery = createMockQuery(
  (orgId: string) => {
    // Return mock organization
    return Promise.resolve({
      id: orgId,
      name: 'Mock Organization',
      email: 'mock@org.com',
      status: 'active' as const,
      userCount: 10,
      assessmentCount: 5,
      createdAt: new Date().toISOString()
    });
  }
);

export const useUpdateOrganizationStatusMutation = createMockMutation(
  ({ id: _id, status }: { id: string; status: 'active' | 'suspended' }) => {
    return Promise.resolve({ success: true, message: `Organization ${status}` });
  }
);

export const useCreateOrganizationMutation = createMockMutation(
  (orgData: any) => {
    return Promise.resolve({
      id: 'new-org-id',
      ...orgData,
      createdAt: new Date().toISOString()
    });
  }
);

export const useUpdateOrganizationMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => {
    return Promise.resolve({
      id,
      ...data,
      updatedAt: new Date().toISOString()
    });
  }
);

export const useDeleteOrganizationMutation = createMockMutation(
  (_orgId: string) => {
    return Promise.resolve({ success: true, message: 'Organization deleted' });
  }
);

// Question Management Hooks
export const useGetQuestionsQuery = createMockQuery(
  (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  } = {}) => mockAdminService.getQuestions(params)
);

export const useGetQuestionQuery = createMockQuery(
  (questionId: string) => mockAdminService.getQuestion(questionId)
);

export const useCreateQuestionMutation = createMockMutation(
  (questionData: any) => mockAdminService.createQuestion(questionData)
);

export const useUpdateQuestionMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => mockAdminService.updateQuestion(id, data)
);

export const useDeleteQuestionMutation = createMockMutation(
  (questionId: string) => mockAdminService.deleteQuestion(questionId)
);

export const useBulkUpdateQuestionsMutation = createMockMutation(
  (_data: { questionIds: string[]; updates: any }) => {
    return Promise.resolve({ success: true, message: 'Questions updated' });
  }
);

// Category Management Hooks
export const useGetCategoriesQuery = createMockQuery(
  () => mockAdminService.getCategories()
);

export const useCreateCategoryMutation = createMockMutation(
  (categoryData: any) => mockAdminService.createCategory(categoryData)
);

export const useUpdateCategoryMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => {
    return Promise.resolve({ id, ...data });
  }
);

export const useDeleteCategoryMutation = createMockMutation(
  (_categoryId: string) => {
    return Promise.resolve({ success: true, message: 'Category deleted' });
  }
);

// System Configuration Hooks
export const useGetSystemConfigQuery = createMockQuery(
  () => Promise.resolve([])
);

export const useUpdateSystemConfigMutation = createMockMutation(
  (configData: { key: string; value: string }) => {
    return Promise.resolve({
      id: 'config-' + configData.key,
      ...configData,
      updatedAt: new Date().toISOString()
    });
  }
);

// Audit Hooks
export const useGetAuditLogsQuery = createMockQuery(
  (params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => mockAdminService.getAuditLogs(params)
);

// CSI Directory Hooks
export const useApproveCsiEntryMutation = createMockMutation(
  (_organizationId: string) => {
    return Promise.resolve({ success: true, message: 'CSI entry approved' });
  }
);

export const useRejectCsiEntryMutation = createMockMutation(
  ({ organizationId: _organizationId, reason: _reason }: { organizationId: string; reason: string }) => {
    return Promise.resolve({ success: true, message: 'CSI entry rejected' });
  }
);

export const useGetPendingCsiEntriesQuery = createMockQuery(
  () => Promise.resolve([])
);

// Reports Hooks
export const useGenerateSystemReportMutation = createMockMutation(
  (_reportData: {
    type: 'organizations' | 'assessments' | 'users' | 'security';
    format: 'pdf' | 'csv' | 'excel';
    filters?: Record<string, any>;
  }) => {
    // Return a mock blob
    return Promise.resolve(new Blob(['Mock report data'], { type: 'application/pdf' }));
  }
);