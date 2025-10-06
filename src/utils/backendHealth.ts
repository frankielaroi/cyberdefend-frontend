import { useValidateTokenQuery } from '../store/api/authApi';
import { useAppSelector } from '../store/hooks';

/**
 * Hook to check backend connectivity and authentication status
 */
export const useBackendHealth = () => {
  const { token } = useAppSelector((state) => state.auth);
  
  // Only validate token if we have one
  const { 
    data: tokenValidation, 
    error: validationError, 
    isLoading: isValidating 
  } = useValidateTokenQuery(undefined, {
    skip: !token,
    pollingInterval: 300000, // Check every 5 minutes
  });

  return {
    isConnected: !validationError,
    isTokenValid: tokenValidation?.valid ?? false,
    isValidating,
    connectionError: validationError,
  };
};

/**
 * Test backend connectivity without authentication
 */
export const testBackendConnection = async (): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      return { connected: true, latency };
    } else {
      return { 
        connected: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};