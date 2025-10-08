import { apiSlice } from './apiSlice';
import type { 
  Assessment,
  Question,
  AssessmentResponse,
  AssessmentSubmitDto,
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
  status?: 'in_progress' | 'completed' | 'cancelled';
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
    // Create and start new assessment
    startAssessment: builder.mutation<ApiResponse<StartAssessmentResponse>, CreateAssessmentDto>({
      query: (assessmentData) => ({
        url: '/assessments',
        method: 'POST',
        body: assessmentData,
      }),
      invalidatesTags: ['Assessment'],
    }),

    // Submit assessment responses and get results
    submitAssessment: builder.mutation<ApiResponse<DetailedAssessmentResult>, AssessmentSubmitDto>({
      query: (submitData) => ({
        url: `/assessments/${submitData.assessmentId}/submit`,
        method: 'POST',
        body: {
          responses: submitData.responses,
        },
      }),
      invalidatesTags: (result, error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // Complete assessment (mark as completed without submitting responses)
    completeAssessment: builder.mutation<ApiResponse<Assessment>, string>({
      query: (assessmentId) => ({
        url: `/assessments/${assessmentId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // Get specific assessment details
    getAssessment: builder.query<ApiResponse<Assessment>, string>({
      query: (assessmentId) => `/assessments/${assessmentId}`,
      providesTags: (result, error, assessmentId) => [{ type: 'Assessment', id: assessmentId }],
    }),

    // Get assessment result details
    getAssessmentResult: builder.query<ApiResponse<DetailedAssessmentResult>, string>({
      query: (assessmentId) => `/assessments/${assessmentId}/result`,
      providesTags: (result, error, assessmentId) => [{ type: 'Assessment', id: `${assessmentId}-result` }],
    }),

    // Get organization's assessment history
    getOrganizationAssessments: builder.query<PaginatedResponse<Assessment>, AssessmentHistoryParams>({
      query: (params = {}) => ({
        url: '/assessments',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...params,
        },
      }),
      providesTags: ['Assessment'],
    }),

    // Get latest CSI result for organization
    getLatestCSIResult: builder.query<ApiResponse<LatestCSIResult>, void>({
      query: () => '/assessments/latest-result',
      providesTags: [{ type: 'Assessment', id: 'latest' }],
    }),

    // Download assessment report
    downloadAssessmentReport: builder.query<Blob, { assessmentId: string; format?: 'pdf' | 'html' | 'json' }>({
      query: ({ assessmentId, format = 'pdf' }) => ({
        url: `/assessments/${assessmentId}/report`,
        params: { format },
        responseHandler: (response) => response.blob(),
      }),
      providesTags: (result, error, { assessmentId }) => [{ type: 'Assessment', id: `${assessmentId}-report` }],
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
      query: () => '/assessments/dashboard',
      providesTags: ['Assessment'],
    }),

    // Resume incomplete assessment
    resumeAssessment: builder.query<ApiResponse<{
      assessment: Assessment;
      questions: Question[];
      responses: AssessmentResponse[];
      currentQuestionIndex: number;
    }>, string>({
      query: (assessmentId) => `/assessments/${assessmentId}/resume`,
      providesTags: (result, error, assessmentId) => [{ type: 'Assessment', id: assessmentId }],
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
      invalidatesTags: (result, error, { assessmentId }) => [{ type: 'Assessment', id: assessmentId }],
    }),

    // Cancel assessment
    cancelAssessment: builder.mutation<ApiResponse<void>, string>({
      query: (assessmentId) => ({
        url: `/assessments/${assessmentId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
        'Assessment'
      ],
    }),

    // Get assessment questions (for resuming or review)
    getAssessmentQuestions: builder.query<ApiResponse<Question[]>, string>({
      query: (assessmentId) => `/assessments/${assessmentId}/questions`,
      providesTags: (result, error, assessmentId) => [{ type: 'Assessment', id: `${assessmentId}-questions` }],
    }),

    // Get assessment responses (for resuming or review)
    getAssessmentResponses: builder.query<ApiResponse<AssessmentResponse[]>, string>({
      query: (assessmentId) => `/assessments/${assessmentId}/responses`,
      providesTags: (result, error, assessmentId) => [{ type: 'Assessment', id: `${assessmentId}-responses` }],
    }),
  }),
});

export const {
  useStartAssessmentMutation,
  useSubmitAssessmentMutation,
  useCompleteAssessmentMutation,
  useGetAssessmentQuery,
  useGetAssessmentResultQuery,
  useGetOrganizationAssessmentsQuery,
  useGetLatestCSIResultQuery,
  useLazyDownloadAssessmentReportQuery,
  useGetDashboardQuery,
  useResumeAssessmentQuery,
  useSaveAssessmentProgressMutation,
  useCancelAssessmentMutation,
  useGetAssessmentQuestionsQuery,
  useGetAssessmentResponsesQuery,
} = assessmentApi;