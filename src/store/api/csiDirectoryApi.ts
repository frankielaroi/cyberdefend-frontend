// Mock CSI Directory API - Replace with actual implementation when backend is ready
import { generateMockCSIEntry, generateMockLeaderboardEntry } from '../../data/mockData';

// Simple mock implementations
export const useGetCSIDirectoryQuery = () => ({
  data: { 
    data: Array.from({ length: 10 }, () => generateMockCSIEntry()),
    pagination: { page: 1, limit: 10, total: 100, totalPages: 10 }
  },
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve()
});

export const useGetCSILeaderboardQuery = () => ({
  data: Array.from({ length: 10 }, () => generateMockLeaderboardEntry()),
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve()
});

export const useGetCSIHeatmapQuery = () => ({
  data: [
    { region: 'North America', score: 85, count: 245 },
    { region: 'Europe', score: 78, count: 189 },
    { region: 'Asia Pacific', score: 72, count: 156 },
    { region: 'Latin America', score: 68, count: 89 },
    { region: 'Africa', score: 65, count: 34 }
  ],
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve()
});

export const useGetCSIAdminStatsQuery = () => ({
  data: {
    totalEntries: 713,
    averageScore: 76.2,
    topPerformers: 45,
    recentSubmissions: 23
  },
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve()
});