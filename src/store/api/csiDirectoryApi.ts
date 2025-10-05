import { apiSlice } from './apiSlice';
import type { 
  CSIDirectoryEntry,
  CSIDirectoryParams,
  CSILeaderboardParams,
  LeaderboardEntry,
  HeatmapData,
  PaginatedResponse
} from '../../types';

export const csiDirectoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public CSI Directory endpoints
    getCSIDirectory: builder.query<PaginatedResponse<CSIDirectoryEntry>, CSIDirectoryParams>({
      query: (params) => ({
        url: '/csi-directory/public',
        params,
      }),
    }),
    getCSILeaderboard: builder.query<LeaderboardEntry[], CSILeaderboardParams>({
      query: (params) => ({
        url: '/csi-directory/leaderboard',
        params,
      }),
    }),
    getCSIHeatmap: builder.query<HeatmapData[], void>({
      query: () => '/csi-directory/heatmap',
    }),
    getCSIAdminStats: builder.query<any, void>({
      query: () => '/csi-directory/admin/stats',
      providesTags: ['Assessment'],
    }),
  }),
});

export const {
  // CSI Directory hooks
  useGetCSIDirectoryQuery,
  useGetCSILeaderboardQuery,
  useGetCSIHeatmapQuery,
  useGetCSIAdminStatsQuery,
} = csiDirectoryApi;