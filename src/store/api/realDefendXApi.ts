import { apiSlice } from './apiSlice';
import type { 
  Assessment,
  Question,
  AssessmentResponse,
  AssessmentResultDto,
  CreateAssessmentDto,
  AssessmentType,
  PaginatedResponse,
  ApiResponse
} from '../../types';

// Enhanced Assessment Types for Backend Integration
export interface StartAssessmentResponse {
  assessment: Assessment;
  questions: Question[];
}

export interface AssessmentHistoryParams {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  type?: AssessmentType;
  startDate?: string;
  endDate?: string;
}

export interface LatestCSIResult {
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  trend: 'improving' | 'declining' | 'stable';
  previousScore?: number;
  changePercent?: number;
  nextAssessmentDue?: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface Vulnerability {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

export interface DetailedAssessmentResult extends AssessmentResultDto {
  breakdown: CategoryScore[];
  recommendations: Recommendation[];
  vulnerabilities?: Vulnerability[];
}

export const assessmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create new assessment
    createAssessment: builder.mutation<Assessment & {
      organization: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      website: string | null;
      description: string | null;
      logo: string | null;
      address: string | null;
      city: string | null;
      region: string | null;
      country: string;
      gpsAddress: string | null;
      size: string;
      sector: string;
      isPublic: boolean;
      csiScore: number | null;
      riskTier: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      };
      user: {
      id: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone: string;
      avatar: string | null;
      emailVerified: boolean;
      isActive: boolean;
      role: string;
      createdAt: string;
      updatedAt: string;
      organizationId: string;
      };
    }, CreateAssessmentDto>({
      query: (assessmentData) => ({
      url: '/defendx/assessments',
      method: 'POST',
      body: assessmentData,
      }),
      invalidatesTags: ['Assessment'],
    }),

    // 2. Start existing assessment (changes status to IN_PROGRESS)
    startAssessment: builder.mutation<{
      id: string;
      status: 'IN_PROGRESS';
      startedAt: string;
      message: string;
    }, string>({
      query: (assessmentId) => ({
        url: `/defendx/assessments/${assessmentId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // Quick start CSI assessment (create + start in one step)
    quickStartCSIAssessment: builder.mutation<ApiResponse<Assessment>, void>({
      query: () => ({
        url: '/defendx/csi/start',
        method: 'POST',
      }),
      invalidatesTags: ['Assessment'],
    }),

    // 4. Submit single response
    submitSingleResponse: builder.mutation<ApiResponse<void>, {
      assessmentId: string;
      questionId: string;
      answer: string | number;
      timeSpent?: number;
    }>({
      query: ({ assessmentId, questionId, answer, timeSpent }) => ({
        url: `/defendx/assessments/${assessmentId}/responses`,
        method: 'POST',
        body: {
          questionId,
          answer,
          timeSpent,
        },
      }),
      invalidatesTags: (_result, _error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
      ],
    }),

    // Submit bulk responses
    submitBulkResponses: builder.mutation<ApiResponse<void>, {
      assessmentId: string;
      responses: Array<{
        questionId: string;
        answer: string | number;
        timeSpent?: number;
      }>;
    }>({
      query: ({ assessmentId, responses }) => ({
        url: `/defendx/assessments/${assessmentId}/responses/bulk`,
        method: 'POST',
        body: {
          assessmentId,
          responses,
        },
      }),
      invalidatesTags: (_result, _error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),
 
    getAnonymousQuestions: builder.query<ApiResponse<Question[]>, void>({
      query: () => ({
        url: '/defendx/assessments/questions',
      }),
      providesTags: ['Assessment'],
    }),
    // Legacy CSI submit (complete submission)
    submitCSIAssessment: builder.mutation<ApiResponse<DetailedAssessmentResult>, {
      assessmentId: string;
      responses: Array<{
        questionId: string;
        answer: string | number;
        timeSpent?: number;
      }>;
    }>({
      query: ({ assessmentId, responses }) => ({
        url: '/defendx/csi/submit',
        method: 'POST',
        body: {
          assessmentId,
          responses,
        },
      }),
      invalidatesTags: (_result, _error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // 5. Complete assessment (finalize and calculate scores)
    completeAssessment: builder.mutation<{
      id: string;
      status: 'COMPLETED';
      score: number;
      maxScore: number;
      riskTier: 'A' | 'B' | 'C' | 'D' | 'F';
      completedAt: string;
      result: {
        id: string;
        csiScore: number;
        tier: 'A' | 'B' | 'C' | 'D' | 'F';
        categoryScores: Record<string, number>;
        recommendations: string[];
        benchmarks: {
          regional: { average: number; position: string };
          sectoral: { average: number; position: string };
          sizeCategory: { average: number; position: string };
        };
      };
    }, string>({
      query: (assessmentId) => ({
        url: `/defendx/assessments/${assessmentId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // 3. Get specific assessment with questions (complete assessment object)
    getAssessment: builder.query<Assessment & { questions: Question[] }, string>({
      query: (assessmentId) => `/defendx/assessments/${assessmentId}`,
      providesTags: (_result, _error, assessmentId) => [{ type: 'Assessment', id: assessmentId }],
    }),

    // 6. Get assessment report/results
    getAssessmentReport: builder.query<ApiResponse<DetailedAssessmentResult>, {
      assessmentId: string;
      includeDetails?: boolean;
      includeRecommendations?: boolean;
      includeBenchmarks?: boolean;
    }>({
      query: ({ assessmentId, includeDetails = true, includeRecommendations = true, includeBenchmarks = true }) => ({
        url: `/defendx/assessments/${assessmentId}/report`,
        params: {
          includeDetails,
          includeRecommendations,
          includeBenchmarks,
        },
      }),
      providesTags: (_result, _error, { assessmentId }) => [{ type: 'Assessment', id: `${assessmentId}-report` }],
    }),

    // Legacy CSI result endpoint
    getCSIResult: builder.query<ApiResponse<DetailedAssessmentResult>, {
      assessmentId: string;
      format?: 'json' | 'pdf' | 'html';
    }>({
      query: ({ assessmentId, format = 'json' }) => ({
        url: `/defendx/csi/result/${assessmentId}`,
        params: { format },
      }),
      providesTags: (_result, _error, { assessmentId }) => [{ type: 'Assessment', id: `${assessmentId}-csi-result` }],
    }),

    // Get assessment result details (kept for backward compatibility)
    getAssessmentResult: builder.query<ApiResponse<DetailedAssessmentResult>, string>({
      query: (assessmentId) => `/defendx/assessments/${assessmentId}/result`,
      providesTags: (_result, _error, assessmentId) => [{ type: 'Assessment', id: `${assessmentId}-result` }],
    }),

    // Get organization's assessment history
    getOrganizationAssessments: builder.query<PaginatedResponse<Assessment>, AssessmentHistoryParams>({
      query: (params = {}) => ({
        url: '/defendx/assessments',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...params,
        },
      }),
      providesTags: ['Assessment'],
    }),

    // Get assessment statistics
    getAssessmentStats: builder.query<ApiResponse<{
      totalAssessments: number;
      completedAssessments: number;
      inProgressAssessments: number;
      averageScore: number;
      lastCompletedScore?: number;
      improvementTrend: number;
    }>, { organizationId?: string }>({
      query: ({ organizationId }) => ({
        url: '/defendx/assessments/stats',
        params: organizationId ? { organizationId } : undefined,
      }),
      providesTags: ['Assessment'],
    }),

    // Get latest CSI result for organization
    getLatestCSIResult: builder.query<LatestCSIResult, void>({
      query: () => '/defendx/assessments/latest-result',
      providesTags: [{ type: 'Assessment', id: 'latest' }],
    }),

    // Download assessment report
    downloadAssessmentReport: builder.query<Blob, { assessmentId: string; format?: 'pdf' | 'html' | 'json' }>({
      query: ({ assessmentId, format = 'pdf' }) => ({
        url: `/defendx/assessments/${assessmentId}/report`,
        params: { format },
        responseHandler: (response: Response) => response.blob(),
      }),
      providesTags: (_result, _error, { assessmentId }) => [{ type: 'Assessment', id: `${assessmentId}-report` }],
    }),

    // Download comprehensive assessment report
    downloadComprehensiveReport: builder.query<Blob, { assessmentId: string; format?: 'pdf' | 'html' | 'json' }>({
      query: ({ assessmentId, format = 'pdf' }) => ({
        url: `/defendx/assessments/${assessmentId}/report/comprehensive`,
        params: { format },
        responseHandler: (response: Response) => response.blob(),
      }),
      providesTags: (_result, _error, { assessmentId }) => [{ type: 'Assessment', id: `${assessmentId}-comprehensive-report` }],
    }),

    // Get assessment dashboard data
    getDashboard: builder.query<ApiResponse<{
      currentAssessment?: Assessment;
      lastCompletedScore?: number;
      lastCompletedTier?: 'A' | 'B' | 'C' | 'D' | 'F';
      assessmentHistory: Assessment[];
      averageScore: number;
      improvementTrend: number;
      nextAssessmentDue?: string;
      recommendations: string[];
    }>, void>({
      query: () => '/defendx/assessments/dashboard',
      providesTags: ['Assessment'],
    }),

    // Resume incomplete assessment
    resumeAssessment: builder.query<ApiResponse<{
      assessment: Assessment;
      questions: Question[];
      responses: AssessmentResponse[];
      currentQuestionIndex: number;
    }>, string>({
      query: (assessmentId) => `/defendx/assessments/${assessmentId}/resume`,
      providesTags: (_result, _error, assessmentId) => [{ type: 'Assessment', id: assessmentId }],
    }),

    // Save assessment progress (auto-save)
    saveAssessmentProgress: builder.mutation<ApiResponse<void>, {
      assessmentId: string;
      responses: AssessmentResponse[];
      currentQuestionIndex: number;
    }>({
      query: ({ assessmentId, responses, currentQuestionIndex }) => ({
        url: `/assessments/${assessmentId}/progress`,
        method: 'PUT',
        body: { responses, currentQuestionIndex },
      }),
      invalidatesTags: (_result, _error, { assessmentId }) => [{ type: 'Assessment', id: assessmentId }],
    }),

    // Cancel assessment
    cancelAssessment: builder.mutation<ApiResponse<void>, string>({
      query: (assessmentId) => ({
        url: `/assessments/${assessmentId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // Get assessment questions (for resuming or review)
    getAssessmentQuestions: builder.query<ApiResponse<Question[]>, string>({
      query: (assessmentId) => `/defendx/assessments/${assessmentId}/questions`,
      providesTags: (_result, _error, assessmentId) => [{ type: 'Assessment', id: `${assessmentId}-questions` }],
    }),

    // Get assessment responses (for resuming or review)
    getAssessmentResponses: builder.query<ApiResponse<AssessmentResponse[]>, string>({
      query: (assessmentId) => `/defendx/assessments/${assessmentId}/responses`,
      providesTags: (_result, _error, assessmentId) => [{ type: 'Assessment', id: `${assessmentId}-responses` }],
    }),


    // ============ ANONYMOUS ASSESSMENT ENDPOINTS ============
    
    // Create anonymous assessment (public endpoint - no auth required)
    createAnonymousAssessment: builder.mutation<{
      id: string;
      sessionId: string;
      status: 'DRAFT';
      createdAt: string;
      isAnonymous: boolean;
    }, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: '/defendx/assessments/anonymous',
        method: 'POST',
        body: { sessionId },
      }),
      invalidatesTags: ['Assessment'],
    }),

    // Submit anonymous responses (bulk - public endpoint)
    submitAnonymousResponses: builder.mutation<ApiResponse<void>, {
      assessmentId: string;
      sessionId: string;
      responses: Array<{
        questionId: string;
        answer: string | number;
        timeSpent?: number;
      }>;
    }>({
      query: ({ assessmentId, sessionId, responses }) => ({
        url: `/defendx/assessments/${assessmentId}/responses/bulk/anonymous`,
        method: 'POST',
        body: {
          sessionId,
          responses: responses.map(response => ({
            ...response,
            sessionId, // Add sessionId to each response object
          })),
        },
      }),
      invalidatesTags: (_result, _error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
      ],
    }),

    // Complete anonymous assessment (public endpoint)
    completeAnonymousAssessment: builder.mutation<{
      assessmentId: string;
      score: number;
      tier: 'A' | 'B' | 'C' | 'D' | 'F';
      completedAt: string;
      responses: number;
      questionsCount: number;
      isAnonymous: boolean;
    }, {
      assessmentId: string;
      sessionId: string;
    }>({
      query: ({ assessmentId, sessionId }) => ({
        url: `/defendx/assessments/${assessmentId}/complete/anonymous`,
        method: 'POST',
        body: { sessionId },
      }),
      invalidatesTags: (_result, _error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // Transfer anonymous assessment to authenticated user
    transferAnonymousAssessment: builder.mutation<{
      id: string;
      userId: string;
      organizationId: string;
      transferredAt: string;
      message: string;
    }, {
      sessionId: string;
      userId: string;
    }>({
      query: ({ sessionId, userId }) => ({
        url: '/defendx/assessments/transfer',
        method: 'POST',
        body: { sessionId, userId },
      }),
      invalidatesTags: ['Assessment'],
    }),

    // Get all questions (public endpoint - no auth required)
    getQuestions: builder.query<{
      categories: Array<{
        category: string;
        questions: Question[];
      }>;
    }, void>({
      query: () => ({
        url: '/defendx/questions',
        method: 'GET',
      }),
      providesTags: ['Assessment'],
    }),
  }),
});

export const {
  useCreateAssessmentMutation,
  useStartAssessmentMutation,
  useQuickStartCSIAssessmentMutation,
  useSubmitSingleResponseMutation,
  useSubmitBulkResponsesMutation,
  useSubmitCSIAssessmentMutation,
  useCompleteAssessmentMutation,
  useGetAssessmentQuery,
  useGetAssessmentReportQuery,
  useGetCSIResultQuery,
  useGetAssessmentResultQuery,
  useGetOrganizationAssessmentsQuery,
  useGetAssessmentStatsQuery,
  useGetLatestCSIResultQuery,
  useLazyDownloadAssessmentReportQuery,
  useLazyDownloadComprehensiveReportQuery,
  useGetDashboardQuery,
  useResumeAssessmentQuery,
  useSaveAssessmentProgressMutation,
  useCancelAssessmentMutation,
  useGetAssessmentQuestionsQuery,
  useGetAssessmentResponsesQuery,
  // Anonymous assessment hooks
  useCreateAnonymousAssessmentMutation,
  useSubmitAnonymousResponsesMutation,
  useCompleteAnonymousAssessmentMutation,
  useTransferAnonymousAssessmentMutation,
  useGetQuestionsQuery,
} = assessmentApi;
