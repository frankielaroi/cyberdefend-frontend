/**
 * Anonymous Session Management Utilities
 * Handles session ID generation and storage for anonymous assessments
 */

const ANONYMOUS_SESSION_KEY = 'defendx_anonymous_session';
const ANONYMOUS_ASSESSMENT_KEY = 'defendx_anonymous_assessment';
const ANONYMOUS_RESPONSES_KEY = 'defendx_anonymous_responses';
const ANONYMOUS_RESULT_KEY = 'defendx_anonymous_result';

/**
 * Generate a UUID v4 (RFC 4122 compliant)
 * Returns format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create anonymous session ID
 * Always creates a new session ID to avoid "already in use" conflicts
 */
export function getOrCreateSessionId(): string {
  try {
    // Always generate a new session ID to avoid conflicts
    const sessionId = generateSessionId();
    // Store it but don't rely on retrieval - always create new
    sessionStorage.setItem(ANONYMOUS_SESSION_KEY, sessionId);
    return sessionId;
  } catch (error) {
    console.error('Failed to get/create session ID:', error);
    // Return a temporary session ID if storage fails
    return generateSessionId();
  }
}

/**
 * Get current session ID without creating a new one
 */
export function getSessionId(): string | null {
  try {
    return sessionStorage.getItem(ANONYMOUS_SESSION_KEY);
  } catch (error) {
    console.error('Failed to get session ID:', error);
    return null;
  }
}

/**
 * Clear anonymous session
 */
export function clearAnonymousSession(): void {
  try {
    sessionStorage.removeItem(ANONYMOUS_SESSION_KEY);
    sessionStorage.removeItem(ANONYMOUS_ASSESSMENT_KEY);
    sessionStorage.removeItem(ANONYMOUS_RESPONSES_KEY);
    sessionStorage.removeItem(ANONYMOUS_RESULT_KEY);
  } catch (error) {
    console.error('Failed to clear anonymous session:', error);
  }
}

/**
 * Store anonymous assessment ID
 */
export function storeAnonymousAssessmentId(assessmentId: string): void {
  try {
    sessionStorage.setItem(ANONYMOUS_ASSESSMENT_KEY, assessmentId);
  } catch (error) {
    console.error('Failed to store anonymous assessment ID:', error);
  }
}

/**
 * Get anonymous assessment ID
 */
export function getAnonymousAssessmentId(): string | null {
  try {
    return sessionStorage.getItem(ANONYMOUS_ASSESSMENT_KEY);
  } catch (error) {
    console.error('Failed to get anonymous assessment ID:', error);
    return null;
  }
}

/**
 * Store anonymous responses temporarily
 */
export function storeAnonymousResponses(responses: any[]): void {
  try {
    sessionStorage.setItem(ANONYMOUS_RESPONSES_KEY, JSON.stringify(responses));
  } catch (error) {
    console.error('Failed to store anonymous responses:', error);
  }
}

/**
 * Get anonymous responses
 */
export function getAnonymousResponses(): any[] {
  try {
    const stored = sessionStorage.getItem(ANONYMOUS_RESPONSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get anonymous responses:', error);
    return [];
  }
}

/**
 * Check if there's an active anonymous session
 */
export function hasActiveAnonymousSession(): boolean {
  return getSessionId() !== null && getAnonymousAssessmentId() !== null;
}

/**
 * Validate UUID v4 format
 */
export function isValidSessionId(sessionId: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(sessionId);
}

/**
 * Get anonymous session data for transfer
 */
export interface AnonymousSessionData {
  sessionId: string;
  assessmentId: string;
  responses: any[];
}

export function getAnonymousSessionData(): AnonymousSessionData | null {
  const sessionId = getSessionId();
  const assessmentId = getAnonymousAssessmentId();
  const responses = getAnonymousResponses();
  
  if (!sessionId || !assessmentId) {
    return null;
  }
  
  return {
    sessionId,
    assessmentId,
    responses
  };
}

/**
 * Store anonymous assessment result
 */
export function storeAnonymousAssessmentResult(result: any): void {
  try {
    sessionStorage.setItem(ANONYMOUS_RESULT_KEY, JSON.stringify(result));
  } catch (error) {
    console.error('Failed to store anonymous assessment result:', error);
  }
}

/**
 * Get anonymous assessment result
 */
export function getAnonymousAssessmentResult(): any | null {
  try {
    const stored = sessionStorage.getItem(ANONYMOUS_RESULT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get anonymous assessment result:', error);
    return null;
  }
}

/**
 * Clear anonymous assessment result
 */
export function clearAnonymousAssessmentResult(): void {
  try {
    sessionStorage.removeItem(ANONYMOUS_RESULT_KEY);
  } catch (error) {
    console.error('Failed to clear anonymous assessment result:', error);
  }
}
