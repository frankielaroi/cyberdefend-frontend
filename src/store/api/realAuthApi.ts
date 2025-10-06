import { apiSlice } from './apiSlice';
import type { 
  User, 
  LoginDto, 
  RegisterDto, 
  AuthResponse, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  RefreshTokenDto,
  VerifyEmailDto,
  ApiResponse 
} from '../../types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginDto>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<AuthResponse, RegisterDto>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<AuthResponse, RefreshTokenDto>({
      query: (tokenData) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: tokenData,
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getProfile: builder.query<{ user: User }, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    changePassword: builder.mutation<ApiResponse<void>, ChangePasswordDto>({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    forgotPassword: builder.mutation<ApiResponse<void>, ForgotPasswordDto>({
      query: (emailData) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: emailData,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<void>, ResetPasswordDto>({
      query: (resetData) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),

    verifyEmail: builder.mutation<ApiResponse<void>, VerifyEmailDto>({
      query: (verificationData) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['User'],
    }),

    validateToken: builder.query<{ valid: boolean }, void>({
      query: () => '/auth/validate-token',
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useValidateTokenQuery,
} = authApi;