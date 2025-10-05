// Mock Organization API - Replace with actual implementation when backend is ready
import { mockBillingOrganizationService } from '../../services/mockBillingOrganizationService';
// Simple mock implementations that return promises
export const useGetOrganizationQuery = (_id: string) => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getOrganization()
});

export const useUpdateOrganizationMutation = () => {
  const mutationFn = (_data: any) => mockBillingOrganizationService.updateOrganization(_data);
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useCreateOrganizationMutation = () => {
  const mutationFn = (_data: any) => mockBillingOrganizationService.mockGeneric(_data);
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useJoinOrganizationMutation = () => {
  const mutationFn = (_data: any) => mockBillingOrganizationService.mockGeneric(_data);
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useLeaveOrganizationMutation = () => {
  const mutationFn = () => mockBillingOrganizationService.mockGeneric({ success: true, message: 'Left organization' });
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useGetOrganizationsQuery = (_params?: any, _options?: any) => ({
  data: { 
    data: [
      {
        id: 'org-1',
        name: 'Tech Solutions Inc',
        industry: 'Technology',
        size: '51-200',
        description: 'Leading software development company',
        memberCount: 125,
        plan: 'Professional',
        status: 'active',
        isPublic: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'org-2', 
        name: 'Healthcare Innovations',
        industry: 'Healthcare',
        size: '201-1000',
        description: 'Medical technology solutions',
        memberCount: 350,
        plan: 'Enterprise',
        status: 'active',
        isPublic: true,
        createdAt: new Date().toISOString()
      }
    ], 
    pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } 
  },
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.mockGeneric({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })
});

export const useGetOrganizationMembersQuery = (_orgId: string) => ({
  data: [],
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.mockGeneric([])
});

export const useUpdateMemberRoleMutation = () => {
  const mutationFn = (_data: any) => mockBillingOrganizationService.mockGeneric(_data);
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useRemoveMemberMutation = () => {
  const mutationFn = (_data: any) => mockBillingOrganizationService.mockGeneric({ success: true, message: 'Member removed' });
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useGetCurrentUserOrganizationQuery = () => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getOrganization()
});

export const useDeleteOrganizationMutation = () => {
  const mutationFn = (_id: string) => mockBillingOrganizationService.mockGeneric({ success: true, message: 'Organization deleted' });
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useGenerateInviteCodeMutation = () => {
  const mutationFn = () => mockBillingOrganizationService.mockGeneric({ inviteCode: 'mock-invite-123', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};