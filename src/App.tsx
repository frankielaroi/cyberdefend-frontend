import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setLoading, logout } from './store/slices/authSlice';
import { useTokenManagement } from './hooks/useTokenManagement';
import { isTokenExpired } from './utils/auth';

// Import debug utilities in development
if (import.meta.env.DEV) {
  import('./utils/debugAuth');
}

function App() {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Initialize token management
  useTokenManagement();

  useEffect(() => {
    const validateToken = async () => {
      if (token && isAuthenticated) {
        // Quick client-side check for token expiration
        if (isTokenExpired(token)) {
          console.log('❌ Token is expired on startup, logging out');
          dispatch(logout());
          return;
        }

        dispatch(setLoading(true));
        
        try {
          // Try to make a simple authenticated request to validate the token
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/validate-token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            // Token is invalid, logout the user
            console.log('❌ Token validation failed, logging out');
            dispatch(logout());
          } else {
            console.log('✅ Token validation successful');
          }
        } catch (error) {
          console.error('🚨 Token validation error:', error);
          // On network error, keep the user logged in but they'll get refreshed on next API call
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    };

    validateToken();
  }, [token, isAuthenticated, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Start prompting (or editing) to see magic happen :)</p>
    </div>
  );
}

export default App;
