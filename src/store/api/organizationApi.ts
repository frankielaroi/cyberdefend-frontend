import { apiSlice } from './apiSlice';
import type { ApiResponse, PaginatedResponse } from '../../types';

interface CreateOrganizationDto {
  name: string;
  email: string;
  industry: string;
  size: string;
  description?: string;
}

interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  industry?: string;
  size?: string;
  description?: string;
}

interface JoinOrganizationDto {
  // For joining by ID (public organizations)
  organizationId?: string;
  // For joining by invite code (private organizations)
  inviteCode?: string;
}

interface QueryOrganizationsDto {
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
  size?: string;
}

interface UpdateMemberRoleDto {
  role: 'ORG_ADMIN' | 'ORG_MANAGER' | 'END_USER';
}

interface Organization {
  id: string;
  name: string;
  email?: string;
  industry: string;
  size: string;
  description?: string;
  plan: string;
  status: 'active' | 'suspended';
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedAt: string;
  lastActive?: string;
}

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Organization Discovery & Management
    getOrganizations: builder.query<PaginatedResponse<Organization>, QueryOrganizationsDto>({
      query: (params) => ({
        url: '/organizations',
        params,
      }),
      providesTags: ['Organization'],
    }),
    
    createOrganization: builder.mutation<Organization, CreateOrganizationDto>({
      query: (orgData) => ({
        url: '/organizations',
        method: 'POST',
        body: orgData,
      }),
      invalidatesTags: ['Organization', 'User'],
    }),
    
    getOrganization: builder.query<Organization, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),
    
    updateOrganization: builder.mutation<Organization, { id: string; data: UpdateOrganizationDto }>({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Organization', id }],
    }),
    
    deleteOrganization: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),

    // User Organization Context
    getCurrentUserOrganization: builder.query<Organization, void>({
      query: () => '/organizations/me',
      providesTags: ['Organization', 'User'],
    }),
    
    leaveOrganization: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/organizations/leave',
        method: 'POST',
      }),
      invalidatesTags: ['Organization', 'User'],
    }),
    
    joinOrganization: builder.mutation<ApiResponse, JoinOrganizationDto>({
      query: (joinData) => ({
        url: joinData.organizationId 
          ? `/organizations/${joinData.organizationId}/join`
          : '/organizations/join',
        method: 'POST',
        body: joinData.inviteCode ? { inviteCode: joinData.inviteCode } : {},
      }),
      invalidatesTags: ['Organization', 'User'],
    }),

    // Organization Member Management
    getOrganizationMembers: builder.query<OrganizationMember[], string>({
      query: (orgId) => `/organizations/${orgId}/members`,
      providesTags: (_result, _error, orgId) => [{ type: 'Organization', id: orgId }],
    }),
    
    updateMemberRole: builder.mutation<ApiResponse, { 
      orgId: string; 
      userId: string; 
      data: UpdateMemberRoleDto 
    }>({
      query: ({ orgId, userId, data }) => ({
        url: `/organizations/${orgId}/members/${userId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { orgId }) => [{ type: 'Organization', id: orgId }],
    }),
    
    removeMember: builder.mutation<ApiResponse, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: `/organizations/${orgId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { orgId }) => [{ type: 'Organization', id: orgId }],
    }),

    // Generate invite code (for organization admins)
    generateInviteCode: builder.mutation<{ inviteCode: string; expiresAt: string }, void>({
      query: () => ({
        url: '/organizations/invite-code',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  // Organization discovery & management
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  
  // User organization context
  useGetCurrentUserOrganizationQuery,
  useLeaveOrganizationMutation,
  useJoinOrganizationMutation,
  
  // Member management
  useGetOrganizationMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  
  // Invite management
  useGenerateInviteCodeMutation,
} = organizationApi;