import {
  PhishingCampaign,
  Alert,
  ApiResponse,
  PaginatedResponse
} from '../types';
import { localStorageService } from './localStorageService';
import { 
  mockCampaigns,
  mockAlerts,
  mockScans,
  generateId
} from '../data/mockData';

// DefendX Plus specific types
interface CreateCampaignDto {
  name: string;
  description?: string;
  template: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  landingPageUrl?: string;
  targets: string[];
  scheduledAt?: string;
}

interface LaunchCampaignDto {
  campaignId: string;
  scheduledAt?: string;
}

interface CampaignResultsDto {
  targetCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  reportedCount: number;
  name: string;
  status: string;
  startDate: string;
  campaign: PhishingCampaign;
  timeline: Array<{
    timestamp: string;
    event: 'delivered' | 'opened' | 'clicked' | 'reported';
    count: number;
  }>;
  targets: Array<{
    email: string;
    delivered: boolean;
    opened: boolean;
    clicked: boolean;
    reported: boolean;
    timestamp?: string;
  }>;
}

interface UpdateCampaignDto {
  name?: string;
  description?: string;
  status?: PhishingCampaign['status'];
}

interface ReportIncidentDto {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

interface RegisterAgentDto {
  name: string;
  hostname: string;
  os: string;
  version: string;
}

interface AgentRegistrationResponse {
  agentId: string;
  token: string;
  configUrl: string;
}

interface Agent {
  id: string;
  name: string;
  hostname: string;
  os: string;
  version: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  organizationId: string;
}

interface AgentConfig {
  agentId: string;
  scanInterval: number;
  reportingEndpoint: string;
  alertThresholds: Record<string, number>;
}

interface HeartbeatDto {
  status: 'online' | 'offline' | 'error';
  systemInfo?: Record<string, any>;
}

interface TelemetryPayload {
  agentId: string;
  timestamp: string;
  metrics: Record<string, any>;
}

interface AlertsParams {
  page?: number;
  limit?: number;
  severity?: string;
  acknowledged?: boolean;
  startDate?: string;
  endDate?: string;
}

interface AcknowledgeAlertDto {
  userId: string;
  note?: string;
}

interface CloseAlertDto {
  userId: string;
  resolution: string;
  note?: string;
}

interface ScheduleScanDto {
  name: string;
  type: 'vulnerability' | 'compliance' | 'malware';
  schedule: string; // cron expression
  targets: string[];
}

interface TriggerScanDto {
  name: string;
  type: 'vulnerability' | 'compliance' | 'malware';
  targets: string[];
}

interface ScanSchedule {
  id: string;
  name: string;
  type: 'vulnerability' | 'compliance' | 'malware';
  schedule: string;
  targets: string[];
  lastRun?: string;
  nextRun: string;
  enabled: boolean;
}

interface ScanResult {
  id: string;
  scheduleId?: string;
  name: string;
  type: 'vulnerability' | 'compliance' | 'malware';
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  reportUrl?: string;
}

interface ScanResultsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Mock data generators
const generateMockAgents = (): Agent[] => [
  {
    id: 'agent-1',
    name: 'Windows Desktop Agent',
    hostname: 'DESKTOP-123',
    os: 'Windows 11',
    version: '1.2.3',
    status: 'online',
    lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    organizationId: 'org-1'
  },
  {
    id: 'agent-2',
    name: 'Linux Server Agent',
    hostname: 'web-server-01',
    os: 'Ubuntu 22.04',
    version: '1.2.3',
    status: 'online',
    lastSeen: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    organizationId: 'org-1'
  },
  {
    id: 'agent-3',
    name: 'Database Server Agent',
    hostname: 'db-server-01',
    os: 'CentOS 8',
    version: '1.2.2',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    organizationId: 'org-2'
  }
];

const generateMockScanSchedules = (): ScanSchedule[] => [
  {
    id: 'schedule-1',
    name: 'Weekly Vulnerability Scan',
    type: 'vulnerability',
    schedule: '0 2 * * 1', // Every Monday at 2 AM
    targets: ['192.168.1.0/24'],
    lastRun: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    nextRun: new Date(Date.now() + 24 * 3600000).toISOString(),
    enabled: true
  },
  {
    id: 'schedule-2',
    name: 'Daily Compliance Check',
    type: 'compliance',
    schedule: '0 1 * * *', // Every day at 1 AM
    targets: ['all-systems'],
    lastRun: new Date(Date.now() - 24 * 3600000).toISOString(),
    nextRun: new Date(Date.now() + 3600000).toISOString(),
    enabled: true
  }
];

const generateMockScanResults = (): ScanResult[] => [
  {
    id: 'scan-result-1',
    scheduleId: 'schedule-1',
    name: 'Weekly Vulnerability Scan',
    type: 'vulnerability',
    status: 'completed',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    summary: {
      totalChecks: 150,
      passed: 135,
      failed: 12,
      warnings: 3
    },
    reportUrl: '/reports/scan-result-1.pdf'
  },
  {
    id: 'scan-result-2',
    scheduleId: 'schedule-2',
    name: 'Daily Compliance Check',
    type: 'compliance',
    status: 'completed',
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 900000).toISOString(),
    summary: {
      totalChecks: 85,
      passed: 80,
      failed: 3,
      warnings: 2
    },
    reportUrl: '/reports/scan-result-2.pdf'
  },
  {
    id: 'scan-result-3',
    name: 'Ad-hoc Malware Scan',
    type: 'malware',
    status: 'running',
    startedAt: new Date(Date.now() - 600000).toISOString(),
    summary: {
      totalChecks: 200,
      passed: 150,
      failed: 0,
      warnings: 0
    }
  }
];

// Simulate network delay
const simulateDelay = (ms = 400): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Paginate results
const paginate = <T>(items: T[], page = 1, limit = 10): PaginatedResponse<T> => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  };
};

export class MockDefendXPlusService {
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    localStorageService.initializeWithMockData({
      campaigns: mockCampaigns,
      alerts: mockAlerts,
      scans: mockScans,
      agents: generateMockAgents(),
      scanSchedules: generateMockScanSchedules(),
      scanResults: generateMockScanResults()
    });
  }

  // Campaign Management
  async createCampaign(campaignData: CreateCampaignDto): Promise<PhishingCampaign> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const newCampaign: PhishingCampaign = {
      id: generateId(),
      name: campaignData.name,
      description: campaignData.description,
      templateId: 'template-1', // Default template ID
      organizationId: currentUser.organizationId,
      status: 'DRAFT',
      template: campaignData.template,
      subject: campaignData.subject,
      senderName: campaignData.senderName,
      senderEmail: campaignData.senderEmail,
      landingPageUrl: campaignData.landingPageUrl,
      targetCount: campaignData.targets.length,
      emailsSent: 0,
      emailsDelivered: 0,
      emailsOpened: 0,
      linksClicked: 0,
      credentialsEntered: 0,
      phishingReported: 0,
      emailsBounced: 0,
      createdBy: currentUser.id,
      scheduledAt: campaignData.scheduledAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorageService.addCampaign(newCampaign);
    return newCampaign;
  }

  async launchCampaign(launchData: LaunchCampaignDto): Promise<ApiResponse> {
    await simulateDelay();

    const campaign = localStorageService.getItemById<PhishingCampaign>('cyberdefend_campaigns', launchData.campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const updatedCampaign = {
      ...campaign,
      status: 'ACTIVE' as const,
      startDate: launchData.scheduledAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorageService.updateCampaign(launchData.campaignId, updatedCampaign);

    return { success: true, message: 'Campaign launched successfully' };
  }

  async getCampaignResults(campaignId: string): Promise<CampaignResultsDto> {
    await simulateDelay();

    const campaign = localStorageService.getItemById<PhishingCampaign>('cyberdefend_campaigns', campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Generate mock timeline
    const timeline = [
      { timestamp: campaign.launchedAt || campaign.createdAt, event: 'delivered' as const, count: campaign.emailsDelivered },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'opened' as const, count: campaign.emailsOpened },
      { timestamp: new Date(Date.now() - 1800000).toISOString(), event: 'clicked' as const, count: campaign.linksClicked },
      { timestamp: new Date(Date.now() - 900000).toISOString(), event: 'reported' as const, count: campaign.phishingReported }
    ].filter(item => item.count > 0);

    // Generate mock targets
    const targets = Array.from({ length: campaign.targetCount }, (_, i) => ({
      email: `user${i + 1}@example.com`,
      delivered: i < campaign.emailsDelivered,
      opened: i < campaign.emailsOpened,
      clicked: i < campaign.linksClicked,
      reported: i < campaign.phishingReported,
      timestamp: i < campaign.emailsDelivered ? campaign.launchedAt : undefined
    }));

    return {
      targetCount: campaign.targetCount,
      deliveredCount: campaign.emailsDelivered,
      openedCount: campaign.emailsOpened,
      clickedCount: campaign.linksClicked,
      reportedCount: campaign.phishingReported,
      name: campaign.name,
      status: campaign.status,
      startDate: campaign.launchedAt || campaign.createdAt,
      campaign,
      timeline,
      targets
    };
  }

  async getCampaignAnalytics(campaignId: string): Promise<CampaignResultsDto> {
    // Same as getCampaignResults for now
    return this.getCampaignResults(campaignId);
  }

  async getCampaigns(): Promise<PaginatedResponse<PhishingCampaign>> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const campaigns = localStorageService.getCampaignsByOrganization(currentUser.organizationId);
    return paginate(campaigns);
  }

  async updateCampaign(id: string, data: UpdateCampaignDto): Promise<PhishingCampaign> {
    await simulateDelay();

    const updated = localStorageService.updateCampaign(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    if (!updated) {
      throw new Error('Campaign not found');
    }

    const campaign = localStorageService.getItemById<PhishingCampaign>('cyberdefend_campaigns', id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign;
  }

  async deleteCampaign(campaignId: string): Promise<ApiResponse> {
    await simulateDelay();

    const deleted = localStorageService.removeItem('cyberdefend_campaigns', campaignId);
    if (!deleted) {
      throw new Error('Campaign not found');
    }

    return { success: true, message: 'Campaign deleted successfully' };
  }

  // Incident Reporting
  async reportIncident(incidentData: ReportIncidentDto): Promise<ApiResponse> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    // Create alert from incident
    const newAlert: Alert = {
      id: generateId(),
      organizationId: currentUser.organizationId,
      severity: incidentData.severity,
      type: incidentData.category,
      message: `${incidentData.title}: ${incidentData.description}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    localStorageService.addAlert(newAlert);

    return { success: true, message: 'Incident reported successfully' };
  }

  // Agent Management
  async registerAgent(agentData: RegisterAgentDto): Promise<AgentRegistrationResponse> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const newAgent: Agent = {
      id: generateId(),
      name: agentData.name,
      hostname: agentData.hostname,
      os: agentData.os,
      version: agentData.version,
      status: 'online',
      lastSeen: new Date().toISOString(),
      organizationId: currentUser.organizationId
    };

    localStorageService.addItem('cyberdefend_agents', newAgent);

    return {
      agentId: newAgent.id,
      token: `token_${newAgent.id}`,
      configUrl: `/api/agents/${newAgent.id}/config`
    };
  }

  async getAgentConfig(agentId: string): Promise<AgentConfig> {
    await simulateDelay();

    const agent = localStorageService.getItemById<Agent>('cyberdefend_agents', agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    return {
      agentId,
      scanInterval: 3600, // 1 hour
      reportingEndpoint: '/api/defendxplus/telemetry',
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90
      }
    };
  }

  async getAgents(): Promise<Agent[]> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    return localStorageService.getItemsByFilter<Agent>('cyberdefend_agents', 
      agent => agent.organizationId === currentUser.organizationId);
  }

  async sendHeartbeat(id: string, data: HeartbeatDto): Promise<ApiResponse> {
    await simulateDelay();

    const updated = localStorageService.updateItem<Agent>('cyberdefend_agents', id, {
      status: data.status,
      lastSeen: new Date().toISOString()
    } as Partial<Agent>);

    if (!updated) {
      throw new Error('Agent not found');
    }

    return { success: true, message: 'Heartbeat received' };
  }

  // Telemetry
  async sendTelemetry(_telemetryData: TelemetryPayload): Promise<ApiResponse> {
    await simulateDelay();

    // Store telemetry data (simplified)
    return { success: true, message: 'Telemetry data received' };
  }

  // Alert Management
  async getAlerts(params: AlertsParams): Promise<PaginatedResponse<Alert>> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    let alerts = localStorageService.getAlertsByOrganization(currentUser.organizationId);

    // Apply filters
    if (params.severity) {
      alerts = alerts.filter(alert => alert.severity === params.severity);
    }
    if (params.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === params.acknowledged);
    }

    return paginate(alerts, params.page, params.limit);
  }

  async acknowledgeAlert(id: string, _data: AcknowledgeAlertDto): Promise<ApiResponse> {
    await simulateDelay();

    const updated = localStorageService.updateAlert(id, {
      acknowledged: true
    });

    if (!updated) {
      throw new Error('Alert not found');
    }

    return { success: true, message: 'Alert acknowledged' };
  }

  async closeAlert(id: string, _data: CloseAlertDto): Promise<ApiResponse> {
    await simulateDelay();

    // In a real implementation, you might update the alert status instead of removing it
    const deleted = localStorageService.removeItem('cyberdefend_alerts', id);
    if (!deleted) {
      throw new Error('Alert not found');
    }

    return { success: true, message: 'Alert closed' };
  }

  async getLiveAlerts(): Promise<Alert[]> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    // Return recent unacknowledged alerts
    const alerts = localStorageService.getAlertsByOrganization(currentUser.organizationId);
    return alerts.filter(alert => !alert.acknowledged).slice(0, 10);
  }

  // Scan Management
  async scheduleScan(scanData: ScheduleScanDto): Promise<ApiResponse> {
    await simulateDelay();

    const newSchedule: ScanSchedule = {
      id: generateId(),
      name: scanData.name,
      type: scanData.type,
      schedule: scanData.schedule,
      targets: scanData.targets,
      nextRun: new Date(Date.now() + 24 * 3600000).toISOString(), // Tomorrow
      enabled: true
    };

    localStorageService.addItem('cyberdefend_scanSchedules', newSchedule);

    return { success: true, message: 'Scan scheduled successfully' };
  }

  async triggerScan(scanData: TriggerScanDto): Promise<ApiResponse> {
    await simulateDelay();

    const newScanResult: ScanResult = {
      id: generateId(),
      name: scanData.name,
      type: scanData.type,
      status: 'running',
      startedAt: new Date().toISOString(),
      summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    localStorageService.addItem('cyberdefend_scanResults', newScanResult);

    return { success: true, message: 'Scan triggered successfully' };
  }

  async getScanSchedules(): Promise<ScanSchedule[]> {
    await simulateDelay();
    return localStorageService.getItems<ScanSchedule>('cyberdefend_scanSchedules');
  }

  async getScanResults(params: ScanResultsParams): Promise<PaginatedResponse<ScanResult>> {
    await simulateDelay();

    let results = localStorageService.getItems<ScanResult>('cyberdefend_scanResults');

    // Apply filters
    if (params.type) {
      results = results.filter(result => result.type === params.type);
    }
    if (params.status) {
      results = results.filter(result => result.status === params.status);
    }

    return paginate(results, params.page, params.limit);
  }

  async getScanResult(scanId: string): Promise<ScanResult> {
    await simulateDelay();

    const result = localStorageService.getItemById<ScanResult>('cyberdefend_scanResults', scanId);
    if (!result) {
      throw new Error('Scan result not found');
    }

    return result;
  }

  async downloadScanReport(scanId: string): Promise<Blob> {
    await simulateDelay();

    const result = localStorageService.getItemById<ScanResult>('cyberdefend_scanResults', scanId);
    if (!result) {
      throw new Error('Scan result not found');
    }

    const reportContent = `Mock Scan Report
Scan ID: ${scanId}
Name: ${result.name}
Type: ${result.type}
Status: ${result.status}
Started: ${result.startedAt}
Completed: ${result.completedAt || 'N/A'}
Summary: ${JSON.stringify(result.summary, null, 2)}`;

    return new Blob([reportContent], { type: 'application/pdf' });
  }
}

export const mockDefendXPlusService = new MockDefendXPlusService();
export default mockDefendXPlusService;