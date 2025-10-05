import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { updateTokens, logout } from '../slices/authSlice';
import { isTokenExpired } from '../../utils/auth';

// Get API base URL from environment variables
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Base query with authentication and error handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    // Add authorization header if token exists
    const state = getState() as RootState;
    const token = state.auth.token || localStorage.getItem('token');
    
    if (token) {
      // Check if token is expired before using it
      if (isTokenExpired(token)) {
        console.log('🔴 Token is expired, removing from headers');
        // Don't use expired token, let the reauth logic handle it
      } else {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    // Set content type for JSON requests
    headers.set('content-type', 'application/json');
    
    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    console.log('🔄 Attempting token refresh...');
    
    // Try to refresh the token
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await baseQueryWithAuth(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        console.log('✅ Token refreshed successfully');
        // Store the new tokens using proper action creator
        const { access_token: newToken, refresh_token: newRefreshToken } = refreshResult.data as { access_token: string; refresh_token: string };
        api.dispatch(updateTokens({ 
          token: newToken, 
          refreshToken: newRefreshToken 
        }));
        
        // Retry the original query with new token
        result = await baseQueryWithAuth(args, api, extraOptions);
      } else {
        console.log('❌ Token refresh failed, logging out');
        // Refresh failed, logout user
        api.dispatch(logout());
      }
    } else {
      console.log('❌ No refresh token available, logging out');
      // No refresh token, logout user
      api.dispatch(logout());
    }
  }
  
  // Log API errors for debugging
  if (result.error) {
    console.error('🚨 API Error:', {
      url: typeof args === 'string' ? args : args.url,
      method: typeof args === 'string' ? 'GET' : args.method,
      status: result.error.status,
      error: result.error
    });
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Assessment',
    'Campaign', 
    'Alert', 
    'Subscription', 
    'User', 
    'Question',
    'Agent',
    'Scan',
    'Organization',
    'Category',
    'Config'
  ],
  endpoints: () => ({}),
});

export default apiSlice;
