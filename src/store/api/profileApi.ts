import { apiSlice } from './apiSlice';
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
  UserSecurityInfo,
  TwoFactorAuthDto,
  TwoFactorAuthResponse,
  TerminateSessionsResponse,
  UserPreferences,
  UpdateNotificationPreferencesDto,
  UpdateAccountPreferencesDto,
  UploadAvatarDto,
  UploadAvatarResponse,
  ExportDataResponse,
  DeleteAccountDto,
  DeleteAccountResponse,
  StandardApiResponse
} from '../../types';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Profile Management
    getUserProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      providesTags: ['UserProfile'],
    }),

    updateUserProfile: builder.mutation<UserProfile, UpdateProfileDto>({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['UserProfile', 'User'],
    }),

    // Password & Security
    changePassword: builder.mutation<StandardApiResponse, ChangePasswordDto>({
      query: (data) => ({
        url: '/profile/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    getUserSecurity: builder.query<UserSecurityInfo, void>({
      query: () => '/profile/security',
      providesTags: ['UserSecurity'],
    }),

    updateTwoFactorAuth: builder.mutation<TwoFactorAuthResponse, TwoFactorAuthDto>({
      query: (data) => ({
        url: '/profile/security/two-factor',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserSecurity', 'UserProfile'],
    }),

    terminateAllSessions: builder.mutation<TerminateSessionsResponse, void>({
      query: () => ({
        url: '/profile/security/sessions/terminate-all',
        method: 'POST',
      }),
      invalidatesTags: ['UserSecurity'],
    }),

    // User Preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => '/profile/preferences',
      providesTags: ['UserPreferences'],
    }),

    updateNotificationPreferences: builder.mutation<UserPreferences['notifications'], UpdateNotificationPreferencesDto>({
      query: (data) => ({
        url: '/profile/preferences/notifications',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    updateAccountPreferences: builder.mutation<UserPreferences['account'], UpdateAccountPreferencesDto>({
      query: (data) => ({
        url: '/profile/preferences/account',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    // Avatar Management
    uploadAvatar: builder.mutation<UploadAvatarResponse, UploadAvatarDto>({
      query: (data) => ({
        url: '/profile/upload-avatar',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    removeAvatar: builder.mutation<StandardApiResponse, void>({
      query: () => ({
        url: '/profile/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Data Management
    exportUserData: builder.mutation<ExportDataResponse, void>({
      query: () => ({
        url: '/profile/export',
        method: 'GET',
      }),
    }),

    deleteAccount: builder.mutation<DeleteAccountResponse, DeleteAccountDto>({
      query: (data) => ({
        url: '/profile',
        method: 'DELETE',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetUserSecurityQuery,
  useUpdateTwoFactorAuthMutation,
  useTerminateAllSessionsMutation,
  useGetUserPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateAccountPreferencesMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useExportUserDataMutation,
  useDeleteAccountMutation,
} = profileApi;