import { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface BackupJob {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  sourcePath: string;
  backupType: string;
  organizationId: string;
  agentId: string;
  s3Path: string | null;
  message: string;
  startedAt: string;
  finishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Backup {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  s3Key: string;
  s3Bucket: string;
  uploadedBy: string;
  userId: string | null;
  organizationId: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  job: BackupJob;
}

export interface DownloadUrlResponse {
  downloadUrl: string;  // Pre-signed S3 URL valid for 1 hour
}

export interface DeleteBackupResponse {
  message: string;
}

export interface BackupAgent {
  id: string;
  name: string;
  description?: string;
  token?: string; // Only present in creation response
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  organizationId: string;
}

// Create the backupApi slice
// Export hooks for usage in functional components
export const backupApi = createApi({
  reducerPath: 'backupApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    credentials: 'include', // This ensures cookies are sent with requests
    prepareHeaders: (headers) => {
      // Add required headers
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }) as BaseQueryFn,
  tagTypes: ['Backup'],
  endpoints: (builder) => ({
    // Get all backups for the organization
    getOrganizationBackups: builder.query<Backup[], void>({
      query: () => ({
        url: '/backup/organization',
        method: 'GET',
      }),
      transformResponse: (response: Backup[]) => {
        console.log('Received backups response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Backup API Error:', response);
        return response;
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          console.log('Starting backups fetch');
          const { data } = await queryFulfilled;
          console.log('Backups fetch completed:', data);
        } catch (error) {
          console.error('Backups fetch failed:', error);
        }
      },
      providesTags: ['Backup'],
    }),

    // Get download URL for a backup
    getBackupDownloadUrl: builder.query<DownloadUrlResponse, { backupId: string; s3Key: string; s3Bucket: string }>({
      query: ({ backupId, s3Key, s3Bucket }) => ({
        url: `/backup/organization/${backupId}/download`,
        method: 'GET',
        params: {
          s3Key,
          s3Bucket
        }
      }),
      providesTags: (result, error, { backupId }) => [{ type: 'Backup', id: backupId }],
    }),

    // Delete a backup
    deleteBackup: builder.mutation<{ message: string }, { backupId: string; organizationId: string }>({
      query: ({ backupId, organizationId }) => ({
        url: `/backup/organization/${backupId}`,
        method: 'DELETE',
        headers: {
          'organization-id': organizationId
        }
      }),
      invalidatesTags: ['Backup'], // This will trigger a refresh of backups after deletion
    }),

    // Register a new backup agent
    createAgent: builder.mutation<BackupAgent, CreateAgentRequest>({
      query: (body) => ({
        url: '/backup/agents',
        method: 'POST',
        body,
      }),
    }),
    
    // Get all backup agents for an organization
    getOrganizationAgents: builder.query<BackupAgent[], { organizationId: string }>({
      query: ({ organizationId }) => ({
        url: '/backup/agents',
        method: 'GET',
        headers: {
          'Organization-Id': organizationId
        }
      }),
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetOrganizationBackupsQuery,
  useGetBackupDownloadUrlQuery,
  useLazyGetBackupDownloadUrlQuery,
  useDeleteBackupMutation,
  useCreateAgentMutation,
  useGetOrganizationAgentsQuery,
} = backupApi;