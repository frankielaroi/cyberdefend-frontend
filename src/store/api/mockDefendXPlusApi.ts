import React from 'react';
import { mockDefendXPlusService } from '../../services/mockDefendXPlusService';

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

// Campaign hooks
export const useCreateCampaignMutation = createMockMutation(
  (campaignData: any) => mockDefendXPlusService.createCampaign(campaignData)
);

export const useLaunchCampaignMutation = createMockMutation(
  (launchData: any) => mockDefendXPlusService.launchCampaign(launchData)
);

export const useGetCampaignResultsQuery = createMockQuery(
  (campaignId: string) => mockDefendXPlusService.getCampaignResults(campaignId)
);

export const useGetCampaignAnalyticsQuery = createMockQuery(
  (campaignId: string) => mockDefendXPlusService.getCampaignAnalytics(campaignId)
);

export const useGetCampaignsQuery = createMockQuery(
  () => mockDefendXPlusService.getCampaigns()
);

export const useUpdateCampaignMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => mockDefendXPlusService.updateCampaign(id, data)
);

export const useDeleteCampaignMutation = createMockMutation(
  (campaignId: string) => mockDefendXPlusService.deleteCampaign(campaignId)
);

// Incident hooks
export const useReportIncidentMutation = createMockMutation(
  (incidentData: any) => mockDefendXPlusService.reportIncident(incidentData)
);

// Agent hooks
export const useRegisterAgentMutation = createMockMutation(
  (agentData: any) => mockDefendXPlusService.registerAgent(agentData)
);

export const useGetAgentConfigQuery = createMockQuery(
  (agentId: string) => mockDefendXPlusService.getAgentConfig(agentId)
);

export const useGetAgentsQuery = createMockQuery(
  () => mockDefendXPlusService.getAgents()
);

export const useSendHeartbeatMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => mockDefendXPlusService.sendHeartbeat(id, data)
);

// Telemetry hooks
export const useSendTelemetryMutation = createMockMutation(
  (telemetryData: any) => mockDefendXPlusService.sendTelemetry(telemetryData)
);

// Alert hooks
export const useGetAlertsQuery = createMockQuery(
  (params: any = {}) => mockDefendXPlusService.getAlerts(params)
);

export const useAcknowledgeAlertMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => mockDefendXPlusService.acknowledgeAlert(id, data)
);

export const useCloseAlertMutation = createMockMutation(
  ({ id, data }: { id: string; data: any }) => mockDefendXPlusService.closeAlert(id, data)
);

export const useGetLiveAlertsQuery = createMockQuery(
  () => mockDefendXPlusService.getLiveAlerts()
);

// Scan hooks
export const useScheduleScanMutation = createMockMutation(
  (scanData: any) => mockDefendXPlusService.scheduleScan(scanData)
);

export const useTriggerScanMutation = createMockMutation(
  (scanData: any) => mockDefendXPlusService.triggerScan(scanData)
);

export const useGetScanSchedulesQuery = createMockQuery(
  () => mockDefendXPlusService.getScanSchedules()
);

export const useGetScanResultsQuery = createMockQuery(
  (params: any = {}) => mockDefendXPlusService.getScanResults(params)
);

export const useGetScanResultQuery = createMockQuery(
  (scanId: string) => mockDefendXPlusService.getScanResult(scanId)
);

export const useLazyDownloadScanReportQuery = createMockLazyQuery(
  (scanId: string) => mockDefendXPlusService.downloadScanReport(scanId)
);