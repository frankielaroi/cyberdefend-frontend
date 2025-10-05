import { faker } from '@faker-js/faker';
import { 
  User, 
  UserRole, 
  OrganizationSize, 
  Sector, 
  Assessment, 
  Question, 
  PhishingCampaign, 
  Alert, 
  SystemScan, 
  Subscription, 
  Invoice, 
  CSIDirectoryEntry 
} from '../types';

// Generate mock IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock organizations
export const mockOrganizations = [
  {
    id: 'org-1',
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    phone: '+1-555-0123',
    website: 'https://techcorp.com',
    size: OrganizationSize.LARGE,
    sector: Sector.TECHNOLOGY,
    region: 'North America',
    createdAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'org-2',
    name: 'Global Bank Ltd',
    email: 'security@globalbank.com',
    phone: '+1-555-0456',
    website: 'https://globalbank.com',
    size: OrganizationSize.ENTERPRISE,
    sector: Sector.BANKING,
    region: 'Europe',
    createdAt: '2023-02-20T00:00:00Z'
  },
  {
    id: 'org-3',
    name: 'HealthCare Plus',
    email: 'it@healthcareplus.com',
    phone: '+1-555-0789',
    website: 'https://healthcareplus.com',
    size: OrganizationSize.MEDIUM,
    sector: Sector.HEALTHCARE,
    region: 'North America',
    createdAt: '2023-03-10T00:00:00Z'
  }
];

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@cyberdefend.com',
    firstName: 'John',
    lastName: 'Admin',
    name: 'John Admin',
    role: 'SUPER_ADMIN',
    emailVerified: true,
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'manager@techcorp.com',
    firstName: 'Jane',
    lastName: 'Manager',
    name: 'Jane Manager',
    role: 'ORG_MANAGER',
    organizationId: 'org-1',
    organizationName: 'TechCorp Solutions',
    phone: '+1-555-1234',
    emailVerified: true,
    isActive: true,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2023-01-15T00:00:00Z',
    organization: mockOrganizations[0]
  },
  {
    id: 'user-3',
    email: 'user@techcorp.com',
    firstName: 'Bob',
    lastName: 'User',
    name: 'Bob User',
    role: 'END_USER',
    organizationId: 'org-1',
    organizationName: 'TechCorp Solutions',
    phone: '+1-555-5678',
    emailVerified: true,
    isActive: true,
    lastLogin: new Date(Date.now() - 14400000).toISOString(),
    createdAt: '2023-01-20T00:00:00Z',
    organization: mockOrganizations[0]
  },
  {
    id: 'user-4',
    email: 'security@globalbank.com',
    firstName: 'Alice',
    lastName: 'Security',
    name: 'Alice Security',
    role: 'ORG_ADMIN',
    organizationId: 'org-2',
    organizationName: 'Global Bank Ltd',
    phone: '+1-555-9876',
    emailVerified: true,
    isActive: true,
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2023-02-20T00:00:00Z',
    organization: mockOrganizations[1]
  }
];

// Mock questions for assessments
export const mockQuestions: Question[] = [
  {
    id: 'q-1',
    category: 'Network Security',
    text: 'Does your organization have a firewall implemented?',
    type: 'yes_no',
    weight: 10,
    followUp: ['What type of firewall?', 'When was it last updated?']
  },
  {
    id: 'q-2',
    category: 'Data Protection',
    text: 'How often does your organization back up critical data?',
    type: 'multiple_choice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
    weight: 15,
    followUp: ['Where are backups stored?', 'Are backups tested regularly?']
  },
  {
    id: 'q-3',
    category: 'Access Control',
    text: 'Rate your organization\'s password policy strength (1-5)',
    type: 'rating',
    weight: 12,
    followUp: ['Do you enforce multi-factor authentication?']
  },
  {
    id: 'q-4',
    category: 'Incident Response',
    text: 'Does your organization have a documented incident response plan?',
    type: 'yes_no',
    weight: 18,
    followUp: ['How often is the plan reviewed?', 'Has it been tested?']
  },
  {
    id: 'q-5',
    category: 'Employee Training',
    text: 'How frequently does your organization conduct cybersecurity awareness training?',
    type: 'multiple_choice',
    options: ['Monthly', 'Quarterly', 'Annually', 'Ad-hoc', 'Never'],
    weight: 8,
    followUp: ['What topics are covered?', 'Is training mandatory?']
  }
];

// Mock assessments
export const mockAssessments: Assessment[] = [
  {
    id: 'assessment-1',
    organizationId: 'org-1',
    status: 'completed',
    score: 85,
    tier: 'B',
    startedAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T11:30:00Z',
    reportUrl: '/reports/assessment-1.pdf'
  },
  {
    id: 'assessment-2',
    organizationId: 'org-1',
    status: 'in_progress',
    startedAt: '2024-10-01T14:00:00Z'
  },
  {
    id: 'assessment-3',
    organizationId: 'org-2',
    status: 'completed',
    score: 92,
    tier: 'A',
    startedAt: '2024-02-10T09:00:00Z',
    completedAt: '2024-02-10T10:45:00Z',
    reportUrl: '/reports/assessment-3.pdf'
  }
];

// Mock phishing campaigns
export const mockCampaigns: PhishingCampaign[] = [
  {
    id: 'campaign-1',
    name: 'Q4 Security Awareness',
    description: 'Quarterly phishing simulation for all employees',
    organizationId: 'org-1',
    status: 'COMPLETED',
    template: 'fake-bank-login',
    subject: 'Urgent: Account Verification Required',
    senderName: 'Security Team',
    senderEmail: 'security@bank-fake.com',
    landingPageUrl: 'https://fake-bank.example.com/login',
    targetCount: 250,
    deliveredCount: 245,
    openedCount: 180,
    clickedCount: 45,
    reportedCount: 12,
    startDate: '2024-09-01T00:00:00Z',
    endDate: '2024-09-30T23:59:59Z',
    createdAt: '2024-08-25T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z'
  },
  {
    id: 'campaign-2',
    name: 'Holiday Themed Test',
    description: 'Holiday-themed phishing simulation',
    organizationId: 'org-1',
    status: 'ACTIVE',
    template: 'holiday-gift',
    subject: 'You\'ve received a holiday gift!',
    senderName: 'HR Department',
    senderEmail: 'hr@company-fake.com',
    landingPageUrl: 'https://fake-gifts.example.com',
    targetCount: 300,
    deliveredCount: 298,
    openedCount: 220,
    clickedCount: 65,
    reportedCount: 8,
    startDate: '2024-10-01T00:00:00Z',
    endDate: '2024-10-31T23:59:59Z',
    createdAt: '2024-09-20T00:00:00Z',
    updatedAt: '2024-10-05T00:00:00Z'
  }
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    organizationId: 'org-1',
    severity: 'high',
    type: 'Suspicious Login',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    acknowledged: false,
    sourceAgent: 'agent-1'
  },
  {
    id: 'alert-2',
    organizationId: 'org-1',
    severity: 'medium',
    type: 'Malware Detected',
    message: 'Potential malware detected on workstation WS-025',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    acknowledged: true,
    sourceAgent: 'agent-2'
  },
  {
    id: 'alert-3',
    organizationId: 'org-2',
    severity: 'critical',
    type: 'Data Breach Attempt',
    message: 'Unauthorized access attempt to database server',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    acknowledged: false,
    sourceAgent: 'agent-3'
  }
];

// Mock system scans
export const mockScans: SystemScan[] = [
  {
    id: 'scan-1',
    organizationId: 'org-1',
    agentId: 'agent-1',
    status: 'completed',
    grade: 'B',
    startedAt: '2024-10-01T08:00:00Z',
    completedAt: '2024-10-01T09:30:00Z',
    reportUrl: '/reports/scan-1.pdf'
  },
  {
    id: 'scan-2',
    organizationId: 'org-1',
    agentId: 'agent-2',
    status: 'running',
    startedAt: '2024-10-05T10:00:00Z'
  },
  {
    id: 'scan-3',
    organizationId: 'org-2',
    agentId: 'agent-3',
    status: 'completed',
    grade: 'A',
    startedAt: '2024-09-28T14:00:00Z',
    completedAt: '2024-09-28T15:45:00Z',
    reportUrl: '/reports/scan-3.pdf'
  }
];

// Mock subscriptions
export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    organizationId: 'org-1',
    plan: 'DefendCore',
    status: 'active',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-12-31T23:59:59Z',
    autoRenew: true,
    modules: {
      defendX: true,
      defendXPlus: true
    }
  },
  {
    id: 'sub-2',
    organizationId: 'org-2',
    plan: 'Enterprise',
    status: 'active',
    currentPeriodStart: '2024-02-01T00:00:00Z',
    currentPeriodEnd: '2025-01-31T23:59:59Z',
    autoRenew: true,
    modules: {
      defendX: true,
      defendXPlus: true
    }
  },
  {
    id: 'sub-3',
    organizationId: 'org-3',
    plan: 'DefendClick',
    status: 'trial',
    currentPeriodStart: '2024-09-01T00:00:00Z',
    currentPeriodEnd: '2024-10-31T23:59:59Z',
    autoRenew: false,
    modules: {
      defendX: false,
      defendXPlus: true
    }
  }
];

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    subscriptionId: 'sub-1',
    amount: 9999.99,
    currency: 'USD',
    status: 'paid',
    dueDate: '2024-01-31T23:59:59Z',
    paidAt: '2024-01-25T00:00:00Z',
    downloadUrl: '/invoices/inv-1.pdf'
  },
  {
    id: 'inv-2',
    subscriptionId: 'sub-2',
    amount: 24999.99,
    currency: 'USD',
    status: 'paid',
    dueDate: '2024-02-29T23:59:59Z',
    paidAt: '2024-02-20T00:00:00Z',
    downloadUrl: '/invoices/inv-2.pdf'
  },
  {
    id: 'inv-3',
    subscriptionId: 'sub-1',
    amount: 9999.99,
    currency: 'USD',
    status: 'pending',
    dueDate: '2024-10-31T23:59:59Z'
  }
];

// Mock CSI Directory entries
export const mockCSIDirectory: CSIDirectoryEntry[] = [
  {
    organizationId: 'org-1',
    name: 'TechCorp Solutions',
    score: 85,
    tier: 'B',
    sector: 'Technology',
    region: 'North America',
    size: 'large',
    lastAssessmentDate: '2024-01-15T00:00:00Z'
  },
  {
    organizationId: 'org-2',
    name: 'Global Bank Ltd',
    score: 92,
    tier: 'A',
    sector: 'Banking',
    region: 'Europe',
    size: 'enterprise',
    lastAssessmentDate: '2024-02-10T00:00:00Z'
  },
  {
    organizationId: 'org-3',
    name: 'HealthCare Plus',
    score: 78,
    tier: 'C',
    sector: 'Healthcare',
    region: 'North America',
    size: 'medium',
    lastAssessmentDate: '2024-03-20T00:00:00Z'
  }
];

// Helper functions to get mock data
export const getMockUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getMockOrganizationById = (id: string) => {
  return mockOrganizations.find(org => org.id === id);
};

export const getMockAssessmentsByOrganization = (organizationId: string): Assessment[] => {
  return mockAssessments.filter(assessment => assessment.organizationId === organizationId);
};

export const getMockCampaignsByOrganization = (organizationId: string): PhishingCampaign[] => {
  return mockCampaigns.filter(campaign => campaign.organizationId === organizationId);
};

export const getMockAlertsByOrganization = (organizationId: string): Alert[] => {
  return mockAlerts.filter(alert => alert.organizationId === organizationId);
};

export const getMockScansByOrganization = (organizationId: string): SystemScan[] => {
  return mockScans.filter(scan => scan.organizationId === organizationId);
};

export const getMockSubscriptionByOrganization = (organizationId: string): Subscription | undefined => {
  return mockSubscriptions.find(sub => sub.organizationId === organizationId);
};

export const getMockInvoicesBySubscription = (subscriptionId: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.subscriptionId === subscriptionId);
};

// Generate additional mock data on demand
export const generateMockAssessment = (organizationId: string, status: 'in_progress' | 'completed' = 'in_progress'): Assessment => {
  const assessment: Assessment = {
    id: generateId(),
    organizationId,
    status,
    startedAt: new Date().toISOString()
  };

  if (status === 'completed') {
    assessment.score = Math.floor(Math.random() * 40) + 60; // Score between 60-100
    assessment.tier = assessment.score >= 90 ? 'A' : assessment.score >= 80 ? 'B' : assessment.score >= 70 ? 'C' : assessment.score >= 60 ? 'D' : 'F';
    assessment.completedAt = new Date(Date.now() + Math.random() * 3600000).toISOString();
    assessment.reportUrl = `/reports/${assessment.id}.pdf`;
  }

  return assessment;
};

export const generateMockCampaign = (organizationId: string): PhishingCampaign => {
  const templates = ['fake-bank-login', 'holiday-gift', 'urgent-update', 'prize-winner', 'security-alert'];
  const statuses: PhishingCampaign['status'][] = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED'];
  
  const targetCount = Math.floor(Math.random() * 500) + 50;
  const deliveredCount = Math.floor(targetCount * 0.95);
  const openedCount = Math.floor(deliveredCount * 0.7);
  const clickedCount = Math.floor(openedCount * 0.3);
  const reportedCount = Math.floor(clickedCount * 0.1);

  return {
    id: generateId(),
    name: `Campaign ${Date.now()}`,
    description: 'Generated mock campaign',
    organizationId,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    template: templates[Math.floor(Math.random() * templates.length)],
    subject: 'Mock Campaign Subject',
    senderName: 'Mock Sender',
    senderEmail: 'mock@example.com',
    landingPageUrl: 'https://mock.example.com',
    targetCount,
    deliveredCount,
    openedCount,
    clickedCount,
    reportedCount,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const generateMockCSIEntry = () => ({
  id: crypto.randomUUID(),
  organizationName: `${faker.company.name()}`,
  industry: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 'Government']),
  size: faker.helpers.arrayElement(['1-50', '51-200', '201-1000', '1000+']),
  location: `${faker.location.city()}, ${faker.location.state()}`,
  csiScore: faker.number.int({ min: 45, max: 95 }),
  assessmentDate: faker.date.recent({ days: 90 }).toISOString(),
  isPublic: faker.datatype.boolean(),
  ranking: faker.number.int({ min: 1, max: 1000 })
});

export const generateMockLeaderboardEntry = () => ({
  id: crypto.randomUUID(),
  organizationName: `${faker.company.name()}`,
  industry: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Manufacturing']),
  csiScore: faker.number.int({ min: 75, max: 95 }),
  ranking: faker.number.int({ min: 1, max: 100 }),
  change: faker.helpers.arrayElement(['+5', '+3', '+1', '0', '-1', '-2']),
  lastAssessment: faker.date.recent({ days: 30 }).toISOString()
});