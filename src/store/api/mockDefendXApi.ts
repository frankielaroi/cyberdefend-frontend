import React from 'react';
import { mockDefendXService } from '../../services/mockDefendXService';

// Helper to create a mock query hook
const createMockQuery = <TData, TParams = void>(
  queryFn: (params: TParams) => Promise<TData>
) => {
  return (params?: TParams, options?: { skip?: boolean }) => {
    const [data, setData] = React.useState<TData | undefined>();
    const [error, setError] = React.useState<any>();
    const [isLoading, setIsLoading] = React.useState(!options?.skip);

    const executeQuery = React.useCallback(async () => {
      if (options?.skip) return;
      
      setIsLoading(true);
      setError(undefined);
      
      try {
        const result = await queryFn(params as TParams);
        setData(result);
      } catch (err) {
        setError({ status: 500, data: { message: (err as Error).message } });
      } finally {
        setIsLoading(false);
      }
    }, [params, options?.skip]);

    React.useEffect(() => {
      executeQuery();
    }, [executeQuery]);

    return {
      data,
      error,
      isLoading,
      isSuccess: !isLoading && !error && data !== undefined,
      isError: !isLoading && !!error,
      refetch: executeQuery
    };
  };
};

// Helper to create a mock lazy query hook
const createMockLazyQuery = <TData, TParams = void>(
  queryFn: (params: TParams) => Promise<TData>
) => {
  return () => {
    const [data, setData] = React.useState<TData | undefined>();
    const [error, setError] = React.useState<any>();
    const [isLoading, setIsLoading] = React.useState(false);

    const trigger = React.useCallback(async (params: TParams) => {
      setIsLoading(true);
      setError(undefined);
      
      try {
        const result = await queryFn(params);
        setData(result);
        return { data: result };
      } catch (err) {
        const error = { status: 500, data: { message: (err as Error).message } };
        setError(error);
        throw { error };
      } finally {
        setIsLoading(false);
      }
    }, []);

    return [
      trigger,
      {
        data,
        error,
        isLoading,
        isSuccess: !isLoading && !error && data !== undefined,
        isError: !isLoading && !!error
      }
    ];
  };
};

// Helper to create a mock mutation hook
const createMockMutation = <TData, TParams>(
  mutationFn: (params: TParams) => Promise<TData>
) => {
  return () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<any>();

    const mutate = async (params: TParams): Promise<{ data: TData }> => {
      setIsLoading(true);
      setError(undefined);

      try {
        const data = await mutationFn(params);
        return { data };
      } catch (err) {
        const error = { status: 400, data: { message: (err as Error).message } };
        setError(error);
        throw { error };
      } finally {
        setIsLoading(false);
      }
    };

    return [
      mutate,
      {
        isLoading,
        error,
        reset: () => {
          setError(undefined);
        }
      }
    ];
  };
};

// Mock DefendX API hooks
export const useGetDashboardQuery = createMockQuery(
  () => mockDefendXService.getDashboard()
);

// Statistics hooks
export const useGetRegionalStatsQuery = createMockQuery(
  () => mockDefendXService.getRegionalStats()
);

export const useGetSectoralStatsQuery = createMockQuery(
  () => mockDefendXService.getSectoralStats()
);

// Assessment hooks
export const useStartAssessmentMutation = createMockMutation(
  (assessmentData: any) => mockDefendXService.startAssessment(assessmentData)
);

export const useSubmitAssessmentMutation = createMockMutation(
  (data: any) => mockDefendXService.submitAssessment(data)
);

export const useCompleteAssessmentMutation = createMockMutation(
  (assessmentId: string) => mockDefendXService.completeAssessment(assessmentId)
);

export const useGetAssessmentResultQuery = createMockQuery(
  (id: string) => mockDefendXService.getAssessmentResult(id)
);

export const useGetLatestCSIResultQuery = createMockQuery(
  () => mockDefendXService.getLatestCSIResult()
);

export const useGetOrganizationAssessmentsQuery = createMockQuery(
  (organizationId: string) => mockDefendXService.getOrganizationAssessments(organizationId)
);

// Report hooks
export const useLazyDownloadAssessmentReportQuery = createMockLazyQuery(
  ({ id, format = 'pdf' }: { id: string; format?: 'pdf' | 'html' | 'json' }) => 
    mockDefendXService.downloadAssessmentReport(id, format)
);

// Legacy export for backward compatibility
export const useGetAssessmentHistoryQuery = useGetOrganizationAssessmentsQuery;