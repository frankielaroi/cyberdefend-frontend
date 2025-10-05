import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateTokens } from '../store/slices/authSlice';
import { isTokenExpired, isTokenExpiringSoon } from '../utils/auth';

/**
 * Custom hook to handle automatic token refresh and expiration checking
 */
export function useTokenManagement() {
  const dispatch = useAppDispatch();
  const { token, refreshToken, isAuthenticated } = useAppSelector((state) => state.auth);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      dispatch(logout());
      return false;
    }

    try {
      console.log('🔄 Refreshing access token...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token refreshed successfully');
        dispatch(updateTokens({
          token: data.access_token,
          refreshToken: data.refresh_token,
        }));
        return true;
      } else {
        console.log('❌ Token refresh failed');
        dispatch(logout());
        return false;
      }
    } catch (error) {
      console.error('🚨 Token refresh error:', error);
      dispatch(logout());
      return false;
    }
  }, [refreshToken, dispatch]);

  // Check token expiration and refresh if needed
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Check if token is already expired
    if (isTokenExpired(token)) {
      console.log('🔴 Token is expired, attempting refresh...');
      refreshAccessToken();
      return;
    }

    // Check if token is expiring soon and refresh proactively
    if (isTokenExpiringSoon(token, 5)) {
      console.log('🟡 Token expiring soon, refreshing proactively...');
      refreshAccessToken();
      return;
    }

    // Set up interval to check token expiration every minute
    const intervalId = setInterval(() => {
      if (isTokenExpired(token)) {
        console.log('🔴 Token expired during session, attempting refresh...');
        refreshAccessToken();
      } else if (isTokenExpiringSoon(token, 5)) {
        console.log('🟡 Token expiring soon during session, refreshing...');
        refreshAccessToken();
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [token, isAuthenticated, refreshAccessToken]);

  return {
    refreshAccessToken,
  };
}