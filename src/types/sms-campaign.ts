export interface SMSCampaignTarget {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  customFields?: Record<string, string>;
}

export interface CreateSMSCampaignDto {
  name: string;
  description?: string;
  template: 'SMS_PHISHING';
  senderName: string;
  targets: SMSCampaignTarget[];
  message: string;
}

export interface LaunchSMSCampaignDto {
  campaignId: string;
  scheduledTime?: string;
  immediateStart: boolean;
}

export interface SMSCampaignResults {
  campaignId: string;
  overview: {
    totalTargets: number;
    smsSent: number;
    smsDelivered: number;
    linksClicked: number;
  };
  timeline: Array<{
    timestamp: string;
    event: 'SMS_QUEUED' | 'SMS_SENT' | 'SMS_DELIVERED' | 'SMS_FAILED' | 'SMS_CLICKED';
    count: number;
    targetPhone?: string;
  }>;
  targetPerformance: Array<{
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    delivered: boolean;
    clicked: boolean;
    actionTimestamp?: string;
  }>;
}

export interface SMSCampaignFilters {
  status?: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  page?: number;
  limit?: number;
}

export interface SMSCampaign {
  id: string;
  name: string;
  description?: string;
  senderName: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  scheduledTime?: string;
  completedAt?: string;
  targetCount: number;
  deliveryStats: {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
  };
}