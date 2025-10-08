import { apiSlice } from './apiSlice';
import type { 
  CSIDirectoryEntry,
  PaginatedResponse,
  ApiResponse,
  OrganizationSize,
  Sector
} from '../../types';

// Backend-connected CSI Directory API
export interface CSIDirectoryFilters {
  page?: number;
  limit?: number;
  sector?: Sector;
  region?: string;
  size?: OrganizationSize;
  minScore?: number;
  maxScore?: number;
  tier?: 'A' | 'B' | 'C' | 'D' | 'F';
  search?: string;
  sortBy?: 'score' | 'name' | 'lastAssessmentDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CSILeaderboardParams {
  limit?: number;
  sector?: Sector;
  region?: string;
  size?: OrganizationSize;
  timeframe?: 'current' | 'monthly' | 'yearly';
}

export interface LeaderboardEntry {
  organizationId: string;
  name: string;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  sector: Sector;
  region: string;
  size: OrganizationSize;
  lastAssessmentDate: string;
  rank?: number;
  previousRank?: number;
  rankChange?: number;
}

export interface HeatmapData {
  regions: Array<{
    name: string;
    code: string;
    averageScore: number;
    organizationCount: number;
    coordinates: { lat: number; lng: number };
    distribution: { A: number; B: number; C: number; D: number; F: number };
  }>;
  national: {
    averageScore: number;
    totalOrganizations: number;
  };
}

export interface CSITrends {
  overallTrend: 'improving' | 'declining' | 'stable';
  averageScoreChange: number;
  timeframe: 'current' | 'monthly' | 'yearly';
  filters?: { sector?: Sector; region?: string };
  trendData: Array<{ period: string; averageScore: number; assessmentCount: number }>;
}

export interface CSIInsights {
  topPerformers: {
    bySector: Array<{ sector: Sector; organization: string; score: number }>;
    byRegion: Array<{ region: string; organization: string; score: number }>;
    overall: Array<{ organization: string; score: number; improvement?: number }>;
  };
  trends: {
    improving: Array<{ organization: string; improvement: number }>;
    declining: Array<{ organization: string; decline: number }>;
  };
  benchmarks: {
    nationalAverage: number;
    sectorAverages: Record<string, number>;
    regionalAverages: Record<string, number>;
    sizeAverages: Record<string, number>;
  };
  riskDistribution: {
    lowRisk: number;    // Count of organizations with 80-100 score
    mediumRisk: number; // Count of organizations with 60-79 score  
    highRisk: number;   // Count of organizations with 0-59 score
  };
}

export const csiDirectoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Main CSI Directory endpoint
    getCSIDirectory: builder.query<PaginatedResponse<CSIDirectoryEntry>, CSIDirectoryFilters>({
      query: (params = {}) => ({
        url: '/csi-directory',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: ['CSIDirectory' as const],
    }),

    // CSI Leaderboard endpoint
    getCSILeaderboard: builder.query<ApiResponse<LeaderboardEntry[]>, CSILeaderboardParams>({
      query: (params = {}) => ({
        url: '/csi-directory/leaderboard',
        params: {
          limit: params.limit || 10,
          ...params,
        },
      }),
      providesTags: ['CSIDirectory' as const],
    }),

    // Geographic heatmap data
    getCSIHeatmap: builder.query<ApiResponse<HeatmapData>, void>({
      query: () => '/csi-directory/heatmap',
      providesTags: ['CSIDirectory' as const],
    }),

    // CSI trends analytics
    getCSITrends: builder.query<ApiResponse<CSITrends>, {
      timeframe?: 'current' | 'monthly' | 'yearly';
      sector?: Sector;
      region?: string;
    }>({
      query: (params = {}) => ({
        url: '/csi-directory/trends',
        params: {
          timeframe: params.timeframe || 'monthly',
          ...params,
        },
      }),
      providesTags: ['CSIDirectory' as const],
    }),

    // Organization profile
    getPublicCSIProfile: builder.query<any, string>({
      query: (organizationId) => `/csi-directory/profile/${organizationId}`,
      providesTags: (_result, _error, organizationId) => [
        { type: 'CSIDirectory' as const, id: organizationId }
      ],
    }),

    // Search organizations
    searchCSIDirectory: builder.query<PaginatedResponse<CSIDirectoryEntry>, {
      q: string;
      limit?: number;
    }>({
      query: ({ q, limit = 20 }) => ({
        url: '/csi-directory/search',
        params: { q, limit },
      }),
      providesTags: ['CSIDirectory' as const],
    }),

    // Filter options
    getCSIDirectoryFilters: builder.query<ApiResponse<any>, void>({
      query: () => '/csi-directory/filters',
      providesTags: ['CSIDirectory' as const],
    }),

    // Export data
    exportCSIDirectory: builder.query<{ success: boolean; message: string; downloadUrl: string }, any>({
      query: (params = {}) => ({
        url: '/csi-directory/export',
        params: {
          format: params.format || 'csv',
          ...params,
        },
      }),
    }),

    // CSI insights and analytics
    getCSIInsights: builder.query<ApiResponse<CSIInsights>, void>({
      query: () => '/csi-directory/insights',
      providesTags: ['CSIDirectory' as const],
    }),
  }),
});

export const {
  useGetCSIDirectoryQuery,
  useGetCSILeaderboardQuery,
  useGetCSIHeatmapQuery,
  useGetCSITrendsQuery,
  useGetPublicCSIProfileQuery,
  useSearchCSIDirectoryQuery,
  useGetCSIDirectoryFiltersQuery,
  useLazyExportCSIDirectoryQuery,
  useGetCSIInsightsQuery,
} = csiDirectoryApi;

