/**
 * Query Parameter Utilities
 * 
 * This file demonstrates the correct patterns for handling query parameters
 * based on the best practices solution guide.
 */

// ✅ CORRECT: URLSearchParams approach
export function buildQueryParams(params: Record<string, any>): string {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      urlParams.append(key, value.toString());
    }
  });
  
  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ✅ CORRECT: Manual query building with proper encoding
export function buildQueryString(params: Record<string, any>): string {
  const query: string[] = [];
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });
  
  return query.length > 0 ? `?${query.join('&')}` : '';
}

// ✅ CORRECT: Type-safe filter builder
export interface AssessmentFilters {
  organizationId?: string;
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  type?: 'CSI_ASSESSMENT' | 'COMPLIANCE_CHECK' | 'SECURITY_AUDIT' | 'BASELINE_ASSESSMENT';
  startDate?: string;
  endDate?: string;
}

export function validateAssessmentFilters(filters: Partial<AssessmentFilters>): string[] {
  const errors: string[] = [];
  
  // Validate organizationId format (UUID v4)
  if (filters.organizationId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(filters.organizationId)) {
    errors.push('Invalid organizationId format');
  }
  
  // Validate pagination
  if (filters.page && (filters.page < 1 || filters.page > 1000)) {
    errors.push('Page must be between 1 and 1000');
  }
  
  if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
    errors.push('Limit must be between 1 and 100');
  }
  
  // Validate enums
  const validStatuses = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED'];
  if (filters.status && !validStatuses.includes(filters.status)) {
    errors.push('Invalid status value');
  }
  
  const validTypes = ['CSI_ASSESSMENT', 'COMPLIANCE_CHECK', 'SECURITY_AUDIT', 'BASELINE_ASSESSMENT'];
  if (filters.type && !validTypes.includes(filters.type)) {
    errors.push('Invalid type value');
  }
  
  return errors;
}

// ✅ CORRECT: Status display helpers
export function getStatusDisplayName(status: string): string {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'IN_PROGRESS': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'EXPIRED': return 'Expired';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
    case 'DRAFT': return 'bg-blue-100 text-blue-700';
    case 'EXPIRED': return 'bg-orange-100 text-orange-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// ✅ CORRECT: Reusable API service class
export class AssessmentAPIService {
  constructor(private baseURL: string, private authToken: string) {}
  
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = `${this.baseURL}${endpoint}`;
    return params ? `${baseUrl}${buildQueryParams(params)}` : baseUrl;
  }
  
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }
  
  async fetchAssessments(filters: AssessmentFilters = {}): Promise<any> {
    // Validate input before making request
    const validationErrors = validateAssessmentFilters(filters);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Clean filters (remove empty values)
    const cleanFilters = this.cleanFilters(filters);
    const url = this.buildURL('/api/v1/defendx/assessments', cleanFilters);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      throw error;
    }
  }
  
  async getAssessment(id: string): Promise<any> {
    if (!id) {
      throw new Error('Assessment ID is required');
    }
    
    const url = this.buildURL(`/api/v1/defendx/assessments/${id}`);
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assessment: ${response.status}`);
    }
    
    return await response.json();
  }
  
  async createAssessment(assessmentData: any): Promise<any> {
    const url = this.buildURL('/api/v1/defendx/assessments');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(assessmentData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create assessment: ${errorData.message || response.status}`);
    }
    
    return await response.json();
  }
  
  private cleanFilters(filters: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }
}

// ✅ CORRECT: React hook with proper parameter handling
export function useAssessmentAPI(baseURL: string, authToken: string) {
  const api = new AssessmentAPIService(baseURL, authToken);
  
  return {
    fetchAssessments: (filters: AssessmentFilters) => api.fetchAssessments(filters),
    getAssessment: (id: string) => api.getAssessment(id),
    createAssessment: (data: any) => api.createAssessment(data)
  };
}

// ❌ WRONG: Examples of what NOT to do
export const incorrectExamples = {
  // DON'T spread strings as objects
  badSpreadString: (organizationId: string) => {
    // This would create: 0=4&1=a&2=c... instead of organizationId=4ac7978a...
    // return { ...organizationId }; // ❌ WRONG - TypeScript prevents this
    // But in JavaScript this would silently fail and spread each character
    return Object.assign({}, organizationId); // ❌ WRONG - same problem
  },
  
  // DON'T build query strings with concatenation without encoding
  badQueryConcat: (filters: any) => {
    // This is vulnerable to injection and doesn't handle special characters
    return `?organizationId=${filters.organizationId}&page=${filters.page}`; // ❌ WRONG
  },
  
  // DON'T include empty values in queries
  badEmptyValues: (filters: any) => {
    const params = new URLSearchParams();
    // This includes empty/null values which clutters the URL
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, value as string); // ❌ WRONG - no validation
    });
    return params.toString();
  }
};

// ✅ CORRECT: Usage examples
export const correctUsageExamples = {
  // Fetch assessments with filters
  fetchWithFilters: async () => {
    const api = new AssessmentAPIService('http://localhost:3000', 'your-token');
    
    const assessments = await api.fetchAssessments({
      organizationId: '4ac7978a-623b-4d81-887e-99c5523d7308',
      page: 1,
      limit: 10,
      status: 'COMPLETED'
    });
    
    return assessments;
  },
  
  // Build query string safely
  buildSafeQuery: () => {
    const params = {
      organizationId: '4ac7978a-623b-4d81-887e-99c5523d7308',
      page: 1,
      limit: 10,
      status: 'COMPLETED',
      emptyValue: '', // This will be filtered out
      nullValue: null, // This will be filtered out
      undefinedValue: undefined // This will be filtered out
    };
    
    return buildQueryParams(params);
    // Result: ?organizationId=4ac7978a-623b-4d81-887e-99c5523d7308&page=1&limit=10&status=COMPLETED
  }
};