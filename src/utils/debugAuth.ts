/**
 * Development utility functions for debugging authentication state
 */

/**
 * Log the current authentication state stored in localStorage
 */
export function debugAuthState() {
  console.group('🔍 Authentication State Debug');
  
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'None');
  console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
  console.log('User:', user ? JSON.parse(user) : 'None');
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('Token Payload:', payload);
        console.log('Token Expires:', new Date(payload.exp * 1000));
        console.log('Token Valid:', payload.exp * 1000 > Date.now());
      }
    } catch (error) {
      console.log('Error decoding token:', error);
    }
  }
  
  console.groupEnd();
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthState() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  console.log('🧹 Authentication state cleared');
}

/**
 * Simulate a login state for testing
 */
export function simulateLogin() {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User',
    role: 'ORG_ADMIN' as const,
    organizationId: 'test-org',
    organizationName: 'Test Organization',
    emailVerified: true,
    isActive: true,
  };

  // Create a mock JWT token (not real, just for testing structure)
  const mockTokenPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(mockTokenPayload))}.mock-signature`;
  const mockRefreshToken = 'mock-refresh-token-' + Date.now();

  localStorage.setItem('token', mockToken);
  localStorage.setItem('refreshToken', mockRefreshToken);
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  console.log('🧪 Mock login state created');
  debugAuthState();
}

// Make these available globally in development
if (import.meta.env.DEV) {
  (window as any).debugAuth = {
    debugAuthState,
    clearAuthState,
    simulateLogin,
  };
  
  console.log('🛠️ Auth debug utilities available as window.debugAuth');
}