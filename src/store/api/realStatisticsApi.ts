import { apiSlice } from './apiSlice';
import type { 
  ApiResponse,
  OrganizationSize,
  Sector
} from '../../types';

// Enhanced Statistics Types
export interface DetailedRegionalStats {
  regions: Array<{
    name: string;
    code: string;
    averageScore: number;
    organizationCount: number;
    assessmentCount: number;
    lastUpdated: string;
    distribution: {
      A: number; // Excellent (90-100)
      B: number; // Good (80-89) 
      C: number; // Fair (70-79)
      D: number; // Poor (60-69)
      F: number; // Critical (0-59)
    };
    trends: {
      currentQuarter: number;
      previousQuarter: number;
      yearOverYear: number;
      trend: 'improving' | 'declining' | 'stable';
    };
    topSectors: Array<{
      sector: Sector;
      averageScore: number;
      organizationCount: number;
    }>;
    coordinates: {
      lat: number;
      lng: number;
      bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
      };
    };
  }>;
  national: {
    averageScore: number;
    totalOrganizations: number;
    totalAssessments: number;
    lastUpdated: string;
    overallTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface DetailedSectoralStats {
  sectors: Array<{
    name: Sector;
    displayName: string;
    averageScore: number;
    organizationCount: number;
    assessmentCount: number;
    lastUpdated: string;
    distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
    trends: {
      currentQuarter: number;
      previousQuarter: number;
      yearOverYear: number;
      trend: 'improving' | 'declining' | 'stable';
    };
    regionalBreakdown: Array<{
      region: string;
      averageScore: number;
      organizationCount: number;
    }>;
    sizeBreakdown: Array<{
      size: OrganizationSize;
      averageScore: number;
      organizationCount: number;
    }>;
    topPerformers: Array<{
      organizationId: string;
      organizationName: string;
      score: number;
      tier: 'A' | 'B' | 'C' | 'D' | 'F';
    }>;
    commonVulnerabilities: Array<{
      category: string;
      frequency: number;
      averageScore: number;
    }>;
  }>;
  crossSectorComparison: {
    highest: { sector: Sector; score: number };
    lowest: { sector: Sector; score: number };
    mostImproved: { sector: Sector; improvement: number };
    trends: Array<{
      sector: Sector;
      scores: Array<{ month: string; score: number }>;
    }>;
  };
}

export interface BenchmarkingData {
  organization: {
    score: number;
    tier: 'A' | 'B' | 'C' | 'D' | 'F';
    lastAssessmentDate: string;
  };
  benchmarks: {
    sector: {
      average: number;
      percentile: number;
      rank: number;
      totalOrganizations: number;
    };
    region: {
      average: number;
      percentile: number;
      rank: number;
      totalOrganizations: number;
    };
    size: {
      average: number;
      percentile: number;
      rank: number;
      totalOrganizations: number;
    };
    national: {
      average: number;
      percentile: number;
      rank: number;
      totalOrganizations: number;
    };
  };
  peerComparison: Array<{
    organizationName: string;
    score: number;
    tier: 'A' | 'B' | 'C' | 'D' | 'F';
    isAnonymized: boolean;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    basedOn: 'sector' | 'region' | 'size' | 'national';
  }>;
}

export interface MaturityMetrics {
  overall: {
    averageScore: number;
    maturityLevel: 'Initial' | 'Developing' | 'Defined' | 'Managed' | 'Optimizing';
    assessmentFrequency: number; // assessments per year
  };
  categories: Array<{
    name: string;
    averageScore: number;
    maturityLevel: 'Initial' | 'Developing' | 'Defined' | 'Managed' | 'Optimizing';
    improvement: number;
    benchmarkComparison: {
      sector: number;
      region: number;
      national: number;
    };
  }>;
  trends: {
    sixMonthTrend: number;
    yearlyTrend: number;
    predictedScore: number; // AI/ML prediction for next assessment
  };
}

export const statisticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get detailed regional statistics
    getRegionalStats: builder.query<ApiResponse<DetailedRegionalStats>, {
      includeHistorical?: boolean;
      timeframe?: 'current' | 'quarterly' | 'yearly';
    }>({
      query: (params = {}) => ({
        url: '/statistics/regional',
        params: {
          includeHistorical: params.includeHistorical || false,
          timeframe: params.timeframe || 'current',
        },
      }),
      providesTags: ['Statistics'],
    }),

    // Get detailed sectoral statistics  
    getSectoralStats: builder.query<ApiResponse<DetailedSectoralStats>, {
      includeComparison?: boolean;
      timeframe?: 'current' | 'quarterly' | 'yearly';
    }>({
      query: (params = {}) => ({
        url: '/statistics/sectoral',
        params: {
          includeComparison: params.includeComparison || false,
          timeframe: params.timeframe || 'current',
        },
      }),
      providesTags: ['Statistics'],
    }),

    // Get organization benchmarking data
    getBenchmarkingData: builder.query<ApiResponse<BenchmarkingData>, {
      includeRecommendations?: boolean;
      peerCount?: number;
    }>({
      query: (params = {}) => ({
        url: '/statistics/benchmarking',
        params: {
          includeRecommendations: params.includeRecommendations || true,
          peerCount: params.peerCount || 5,
        },
      }),
      providesTags: ['Statistics', 'Assessment'],
    }),

    // Get cybersecurity maturity metrics
    getMaturityMetrics: builder.query<ApiResponse<MaturityMetrics>, void>({
      query: () => '/statistics/maturity',
      providesTags: ['Statistics', 'Assessment'],
    }),

    // Get industry-wide threat landscape
    getThreatLandscape: builder.query<ApiResponse<{
      topThreats: Array<{
        name: string;
        frequency: number;
        severity: 'critical' | 'high' | 'medium' | 'low';
        affectedSectors: Sector[];
        trend: 'increasing' | 'decreasing' | 'stable';
      }>;
      vulnerabilityCategories: Array<{
        category: string;
        prevalence: number;
        averageScore: number;
        improvement: number;
      }>;
      emergingRisks: Array<{
        risk: string;
        description: string;
        likelihood: number;
        impact: number;
        affectedSectors: Sector[];
      }>;
      recommendations: Array<{
        title: string;
        description: string;
        applicableTo: Sector[];
        priority: 'high' | 'medium' | 'low';
      }>;
    }>, {
      sector?: Sector;
      timeframe?: 'monthly' | 'quarterly' | 'yearly';
    }>({
      query: (params = {}) => ({
        url: '/statistics/threat-landscape',
        params,
      }),
      providesTags: ['Statistics'],
    }),

    // Get compliance metrics
    getComplianceMetrics: builder.query<ApiResponse<{
      frameworks: Array<{
        name: string; // NIST, ISO27001, etc.
        adoptionRate: number;
        averageCompliance: number;
        bySector: Record<Sector, number>;
        byRegion: Record<string, number>;
        trends: Array<{
          quarter: string;
          compliance: number;
        }>;
      }>;
      gaps: Array<{
        area: string;
        complianceRate: number;
        priority: 'high' | 'medium' | 'low';
        affectedOrganizations: number;
      }>;
      recommendations: Array<{
        framework: string;
        area: string;
        recommendation: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    }>, {
      framework?: string;
      sector?: Sector;
    }>({
      query: (params = {}) => ({
        url: '/statistics/compliance',
        params,
      }),
      providesTags: ['Statistics'],
    }),

    // Get historical trends
    getHistoricalTrends: builder.query<ApiResponse<{
      nationalTrends: Array<{
        period: string;
        averageScore: number;
        assessmentCount: number;
        organizationCount: number;
      }>;
      sectorTrends: Record<Sector, Array<{
        period: string;
        averageScore: number;
        assessmentCount: number;
      }>>;
      regionalTrends: Record<string, Array<{
        period: string;
        averageScore: number;
        assessmentCount: number;
      }>>;
      predictions: {
        nextQuarter: number;
        nextYear: number;
        confidence: number;
      };
    }>, {
      timeframe: 'monthly' | 'quarterly' | 'yearly';
      period: number; // number of periods to include
    }>({
      query: (params) => ({
        url: '/statistics/trends',
        params,
      }),
      providesTags: ['Statistics'],
    }),

    // Export statistics data
    exportStatistics: builder.query<Blob, {
      type: 'regional' | 'sectoral' | 'benchmarking' | 'trends';
      format: 'csv' | 'excel' | 'json' | 'pdf';
      filters?: Record<string, any>;
    }>({
      query: ({ type, format, filters = {} }) => ({
        url: `/statistics/export/${type}`,
        params: {
          format,
          ...filters,
        },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // Get real-time statistics dashboard
    getStatisticsDashboard: builder.query<ApiResponse<{
      summary: {
        totalOrganizations: number;
        totalAssessments: number;
        averageScore: number;
        assessmentsThisMonth: number;
        improvementRate: number;
      };
      recentActivity: Array<{
        type: 'assessment_completed' | 'new_organization' | 'score_improvement';
        timestamp: string;
        details: string;
        impact: 'high' | 'medium' | 'low';
      }>;
      alerts: Array<{
        type: 'declining_sector' | 'new_vulnerability' | 'compliance_gap';
        message: string;
        severity: 'critical' | 'warning' | 'info';
        timestamp: string;
      }>;
      upcomingDeadlines: Array<{
        organizationName: string;
        type: 'assessment_due' | 'compliance_deadline';
        date: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    }>, void>({
      query: () => '/statistics/dashboard',
      providesTags: ['Statistics'],
    }),
  }),
});

export const {
  useGetRegionalStatsQuery,
  useGetSectoralStatsQuery,
  useGetBenchmarkingDataQuery,
  useGetMaturityMetricsQuery,
  useGetThreatLandscapeQuery,
  useGetComplianceMetricsQuery,
  useGetHistoricalTrendsQuery,
  useLazyExportStatisticsQuery,
  useGetStatisticsDashboardQuery,
} = statisticsApi;