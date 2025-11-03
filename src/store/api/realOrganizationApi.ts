import { apiSlice } from './apiSlice';
import type { 
  PaginatedResponse, 
  ApiResponse,
  OrganizationSize,
  Sector 
} from '../../types';

// Organization Types
export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  sector: Sector;
  size: OrganizationSize;
  description?: string;
  logo?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  gpsAddress?: string;
  isPublic: boolean;
  isActive: boolean;
  status: 'active' | 'suspended' | 'pending';
  memberCount: number;
  plan?: string;
  subscription?: {
    id: string;
    status: 'active' | 'trial' | 'expired';
    currentPeriodEnd: string;
  };
  settings?: {
    allowPublicJoin: boolean;
    requireApprovalToJoin: boolean;
    maxMembers?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ORG_ADMIN' | 'ORG_MANAGER' | 'END_USER';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastLogin?: string;
  invitedBy?: string;
  inviteCode?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  organizationId: string;
  createdBy: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  sector: Sector;
  size: OrganizationSize;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateOrganizationRequest {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  isPublic?: boolean;
  settings?: {
    allowPublicJoin?: boolean;
    requireApprovalToJoin?: boolean;
    maxMembers?: number;
  };
}

export interface JoinOrganizationRequest {
  inviteCode?: string;
  organizationId?: string;
}

export interface GetOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
  sector?: Sector;
  size?: OrganizationSize;
  isPublic?: boolean;
}

export interface GetMembersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create new organization
    createOrganization: builder.mutation<Organization, CreateOrganizationRequest>({
      query: (orgData) => ({
        url: '/organizations',
        method: 'POST',
        body: orgData,
      }),
      invalidatesTags: ['Organization'],
    }),

    // Get public organizations for browsing
    getOrganizations: builder.query<PaginatedResponse<Organization>, GetOrganizationsParams>({
      query: (params = {}) => ({
        url: '/organizations',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...params,
        },
      }),
      providesTags: ['Organization'],
    }),

    // Get specific organization details
    getOrganization: builder.query<ApiResponse<Organization>, string>({
      query: (orgId) => `/organizations/${orgId}`,
      providesTags: (result, error, orgId) => [{ type: 'Organization', id: orgId }],
    }),

    // Update organization
    updateOrganization: builder.mutation<ApiResponse<Organization>, { id: string; data: UpdateOrganizationRequest }>({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Organization', id }],
    }),

    // Delete organization
    deleteOrganization: builder.mutation<ApiResponse<void>, string>({
      query: (orgId) => ({
        url: `/organizations/${orgId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization'],
    }),

    // Join organization (via invite code or organization ID)
    joinOrganization: builder.mutation<ApiResponse<{ organization: Organization; userRole: string; joinedAt: string }>, JoinOrganizationRequest>({
      query: (joinData) => ({
        url: '/organizations/join',
        method: 'POST',
        body: joinData,
      }),
      invalidatesTags: ['Organization', 'User'],
    }),

    // Leave organization
    leaveOrganization: builder.mutation<ApiResponse<void>, string>({
      query: (orgId) => ({
        url: `/organizations/${orgId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Organization', 'User'],
    }),

    // Get organization members
    getOrganizationMembers: builder.query<OrganizationMember[], { orgId: string; params?: GetMembersParams }>({
      query: ({ orgId, params = {} }) => ({
        url: `/organizations/${orgId}/members`,
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...params,
        },
      }),
      providesTags: (result, error, { orgId }) => [{ type: 'Organization', id: `${orgId}-members` }],
    }),

    // Update member role
    updateMemberRole: builder.mutation<ApiResponse<void>, { orgId: string; userId: string; role: string }>({
      query: ({ orgId, userId, role }) => ({
        url: `/organizations/${orgId}/members/${userId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (result, error, { orgId }) => [{ type: 'Organization', id: `${orgId}-members` }],
    }),

    // Remove member from organization
    removeMember: builder.mutation<ApiResponse<void>, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: `/organizations/${orgId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { orgId }) => [{ type: 'Organization', id: `${orgId}-members` }],
    }),

    // Generate invite code
    generateInviteCode: builder.mutation<ApiResponse<InviteCode>, { orgId: string; options?: { expiresIn?: number; usageLimit?: number } }>({
      query: ({ orgId, options = {} }) => ({
        url: `/organizations/${orgId}/invite-codes`,
        method: 'POST',
        body: options,
      }),
      invalidatesTags: (result, error, { orgId }) => [{ type: 'Organization', id: `${orgId}-invites` }],
    }),

    // Get organization invite codes
    getInviteCodes: builder.query<ApiResponse<InviteCode[]>, string>({
      query: (orgId) => `/organizations/${orgId}/invite-codes`,
      providesTags: (result, error, orgId) => [{ type: 'Organization', id: `${orgId}-invites` }],
    }),

    // Deactivate invite code
    deactivateInviteCode: builder.mutation<ApiResponse<void>, { orgId: string; codeId: string }>({
      query: ({ orgId, codeId }) => ({
        url: `/organizations/${orgId}/invite-codes/${codeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { orgId }) => [{ type: 'Organization', id: `${orgId}-invites` }],
    }),

    // Get current user's organization
    getCurrentUserOrganization: builder.query<ApiResponse<Organization>, void>({
      query: () => '/organizations/me',
      providesTags: ['Organization', 'User'],
    }),

    // NEW ENDPOINTS FOR ORGANIZATION SETTINGS & MANAGEMENT
    
    // Get organization settings
    getOrganizationSettings: builder.query<Organization, string>({
      query: (organizationId) => `/organizations/${organizationId}/settings`,
      providesTags: (result, error, organizationId) => [{ type: 'Organization', id: organizationId }],
    }),

    // Update organization settings (Admin only)
    updateOrganizationSettings: builder.mutation<Organization, { organizationId: string; data: Partial<Organization> }>({
      query: ({ organizationId, data }) => ({
        url: `/organizations/${organizationId}/settings`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Organization', id: organizationId }],
    }),

    // Send member invitation
    inviteMember: builder.mutation<{ success: boolean; message: string; invitationId: string }, { organizationId: string; data: { email: string; firstName: string; lastName: string; role: string; message?: string } }>({
      query: ({ organizationId, data }) => ({
        url: `/organizations/${organizationId}/members/invite`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Organization', id: `${organizationId}-members` }],
    }),

    // Resend invitation
    resendInvitation: builder.mutation<{ success: boolean; message: string }, { organizationId: string; invitationId: string; data?: { message?: string } }>({
      query: ({ organizationId, invitationId, data = {} }) => ({
        url: `/organizations/${organizationId}/invitations/${invitationId}/resend`,
        method: 'POST',
        body: data,
      }),
    }),

    // Cancel invitation (Admin only)
    cancelInvitation: builder.mutation<{ success: boolean; message: string }, { organizationId: string; invitationId: string }>({
      query: ({ organizationId, invitationId }) => ({
        url: `/organizations/${organizationId}/invitations/${invitationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Organization', id: `${organizationId}-members` }],
    }),
  }),
});

export const {
  useCreateOrganizationMutation,
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useJoinOrganizationMutation,
  useLeaveOrganizationMutation,
  useGetOrganizationMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGenerateInviteCodeMutation,
  useGetInviteCodesQuery,
  useDeactivateInviteCodeMutation,
  useGetCurrentUserOrganizationQuery,
  // New organization settings endpoints
  useGetOrganizationSettingsQuery,
  useUpdateOrganizationSettingsMutation,
  useInviteMemberMutation,
  useResendInvitationMutation,
  useCancelInvitationMutation,
} = organizationApi;