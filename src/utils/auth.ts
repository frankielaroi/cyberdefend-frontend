/**
 * Utility functions for authentication and token management
 */

/**
 * Decode a JWT token without verifying the signature
 * @param token JWT token string
 * @returns Decoded payload object or null if invalid
 */
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Check if a JWT token will expire within the specified minutes
 * @param token JWT token string
 * @param minutesBeforeExpiry Number of minutes before expiry to consider as "expiring soon"
 * @returns true if token will expire soon, false otherwise
 */
export function isTokenExpiringSoon(token: string, minutesBeforeExpiry: number = 5): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryThreshold = decoded.exp - (minutesBeforeExpiry * 60);
  return currentTime >= expiryThreshold;
}

/**
 * Get the expiration time of a JWT token
 * @param token JWT token string
 * @returns Date object of expiration time or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
}