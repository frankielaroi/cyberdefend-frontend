import { apiSlice } from './apiSlice';
import type { 
  Assessment, 
  Question, 
  CreateAssessmentDto,
  RegionalStats,
  SectoralStats,
  AssessmentSubmitDto,
  AssessmentResultDto} from '../../types';

interface StartAssessmentResponse {
  assessment: Assessment;
  questions: Question[];
}

export const defendxApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard endpoint
    getDashboard: builder.query<any, void>({
      query: () => '/defendx/dashboard',
      providesTags: ['Assessment'],
    }),
    
    // Statistics endpoints
    getRegionalStats: builder.query<RegionalStats[], void>({
      query: () => '/defendx/stats/regional',
    }),
    getSectoralStats: builder.query<SectoralStats[], void>({
      query: () => '/defendx/stats/sectoral',
    }),
    
    // Assessment endpoints
    startAssessment: builder.mutation<StartAssessmentResponse, CreateAssessmentDto>({
      query: (assessmentData) => ({
        url: '/defendx/csi/start',
        method: 'POST',
        body: assessmentData,
      }),
      invalidatesTags: ['Assessment'],
    }),
    submitAssessment: builder.mutation<AssessmentResultDto, AssessmentSubmitDto>({
      query: (data) => ({
        url: '/defendx/csi/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assessment'],
    }),
    completeAssessment: builder.mutation<AssessmentResultDto, string>({
      query: (assessmentId) => ({
        url: `/defendx/assessments/${assessmentId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['Assessment'],
    }),
    getAssessmentResult: builder.query<AssessmentResultDto, string>({
      query: (id) => `/defendx/csi/result/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Assessment', id }],
    }),
    getLatestCSIResult: builder.query<AssessmentResultDto, void>({
      query: () => '/defendx/csi/latest',
      providesTags: ['Assessment'],
    }),
    getOrganizationAssessments: builder.query<Assessment[], string>({
      query: (organizationId) => `/defendx/organizations/${organizationId}/assessments`,
      providesTags: ['Assessment'],
    }),
    
    // Report download endpoint
    downloadAssessmentReport: builder.query<Blob, { id: string; format?: 'pdf' | 'html' | 'json' }>({
      query: ({ id, format = 'pdf' }) => ({
        url: `/defendx/csi/result/${id}`,
        params: { format },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  // Dashboard hooks
  useGetDashboardQuery,
  
  // Statistics hooks
  useGetRegionalStatsQuery,
  useGetSectoralStatsQuery,
  
  // Assessment hooks
  useStartAssessmentMutation,
  useSubmitAssessmentMutation,
  useCompleteAssessmentMutation,
  useGetAssessmentResultQuery,
  useGetLatestCSIResultQuery,
  useGetOrganizationAssessmentsQuery,
  
  // Report hooks
  useLazyDownloadAssessmentReportQuery,
} = defendxApi;

// Legacy exports for backward compatibility
export const useGetAssessmentHistoryQuery = defendxApi.endpoints.getOrganizationAssessments.useQuery;
