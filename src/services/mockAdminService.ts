import {
  Question,
  User,
  ApiResponse,
  PaginatedResponse
} from '../types';
import { localStorageService } from './localStorageService';
import { 
  mockUsers, 
  mockOrganizations, 
  mockQuestions,
  generateId 
} from '../data/mockData';

// Admin-specific types
interface AdminUser extends User {
  lastActivity?: string;
  accountStatus: 'active' | 'suspended' | 'pending';
}

interface AdminOrganization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  size: string;
  sector: string;
  region: string;
  status: 'active' | 'suspended' | 'pending';
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  userCount: number;
  assessmentCount: number;
  lastActivity?: string;
  createdAt: string;
}

interface QuestionCategory {
  id: string;
  name: string;
  weight: number;
  questionCount: number;
}

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt: string;
  updatedBy: string;
}

interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalAlerts: number;
  unacknowledgedAlerts: number;
}

interface AdminDashboardStats extends OrganizationStats {
  byRegion: Record<string, number>;
  bySector: Record<string, number>;
  trends: Array<{
    date: string;
    assessments: number;
    campaigns: number;
    alerts: number;
    newUsers: number;
  }>;
  recentActivity: AuditLog[];
}

// Mock data generators
const generateMockAdminUsers = (): AdminUser[] => {
  return mockUsers.map(user => ({
    ...user,
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(),
    accountStatus: Math.random() > 0.1 ? 'active' : 'suspended'
  }));
};

const generateMockAdminOrganizations = (): AdminOrganization[] => {
  return mockOrganizations.map(org => ({
    ...org,
    status: Math.random() > 0.1 ? 'active' : 'suspended',
    subscriptionPlan: ['DefendCore', 'DefendVault', 'DefendClick', 'Enterprise'][Math.floor(Math.random() * 4)],
    subscriptionStatus: ['active', 'trial', 'expired'][Math.floor(Math.random() * 3)],
    userCount: Math.floor(Math.random() * 100) + 10,
    assessmentCount: Math.floor(Math.random() * 50) + 5,
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString()
  }));
};

const generateMockCategories = (): QuestionCategory[] => [
  { id: 'cat-1', name: 'Network Security', weight: 20, questionCount: 15 },
  { id: 'cat-2', name: 'Data Protection', weight: 25, questionCount: 20 },
  { id: 'cat-3', name: 'Access Control', weight: 20, questionCount: 18 },
  { id: 'cat-4', name: 'Incident Response', weight: 15, questionCount: 12 },
  { id: 'cat-5', name: 'Employee Training', weight: 10, questionCount: 8 },
  { id: 'cat-6', name: 'Compliance', weight: 10, questionCount: 10 }
];

const generateMockAuditLogs = (): AuditLog[] => {
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'];
  const resources = ['User', 'Organization', 'Assessment', 'Campaign', 'Question'];
  const logs: AuditLog[] = [];

  for (let i = 0; i < 100; i++) {
    logs.push({
      id: generateId(),
      userId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
      userEmail: mockUsers[Math.floor(Math.random() * mockUsers.length)].email,
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      resourceId: generateId(),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      details: { result: 'success' }
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateMockSystemConfig = (): SystemConfig[] => [
  {
    id: 'config-1',
    key: 'max_assessment_time',
    value: '3600',
    description: 'Maximum time allowed for assessment completion (seconds)',
    type: 'number',
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@cyberdefend.com'
  },
  {
    id: 'config-2',
    key: 'email_notifications_enabled',
    value: 'true',
    description: 'Enable email notifications system-wide',
    type: 'boolean',
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@cyberdefend.com'
  },
  {
    id: 'config-3',
    key: 'default_campaign_duration',
    value: '7',
    description: 'Default duration for phishing campaigns (days)',
    type: 'number',
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@cyberdefend.com'
  }
];

// Simulate network delay
const simulateDelay = (ms = 300): Promise<void> => {
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

export class MockAdminService {
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    localStorageService.initializeWithMockData({
      users: generateMockAdminUsers(),
      organizations: generateMockAdminOrganizations(),
      questions: mockQuestions,
      categories: generateMockCategories(),
      auditLogs: generateMockAuditLogs(),
      systemConfig: generateMockSystemConfig()
    });
  }

  // Dashboard & Statistics
  async getDashboardStats(_params: {
    region?: string;
    sector?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AdminDashboardStats> {
    await simulateDelay();

    const stats: AdminDashboardStats = {
      totalUsers: 1234,
      activeUsers: 1100,
      totalAssessments: 567,
      completedAssessments: 456,
      averageScore: 78.5,
      totalCampaigns: 89,
      activeCampaigns: 12,
      totalAlerts: 234,
      unacknowledgedAlerts: 45,
      byRegion: {
        'North America': 450,
        'Europe': 320,
        'Asia Pacific': 280,
        'Latin America': 120,
        'Africa': 64
      },
      bySector: {
        'Banking': 234,
        'Healthcare': 189,
        'Technology': 167,
        'Government': 145,
        'Education': 123,
        'Manufacturing': 98,
        'Other': 278
      },
      trends: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          assessments: Math.floor(Math.random() * 20) + 5,
          campaigns: Math.floor(Math.random() * 5) + 1,
          alerts: Math.floor(Math.random() * 15) + 3,
          newUsers: Math.floor(Math.random() * 10) + 2
        };
      }),
      recentActivity: localStorageService.getItems<AuditLog>('cyberdefend_auditLogs').slice(0, 10)
    };

    return stats;
  }

  async getSystemStats(): Promise<OrganizationStats> {
    await simulateDelay();

    return {
      totalUsers: 1234,
      activeUsers: 1100,
      totalAssessments: 567,
      completedAssessments: 456,
      averageScore: 78.5,
      totalCampaigns: 89,
      activeCampaigns: 12,
      totalAlerts: 234,
      unacknowledgedAlerts: 45
    };
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    organizationId?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<AdminUser>> {
    await simulateDelay();

    let users = localStorageService.getItems<AdminUser>('cyberdefend_users');

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search)
      );
    }

    if (params.role) {
      users = users.filter(user => user.role === params.role);
    }

    if (params.organizationId) {
      users = users.filter(user => user.organizationId === params.organizationId);
    }

    if (params.isActive !== undefined) {
      users = users.filter(user => user.isActive === params.isActive);
    }

    return paginate(users, params.page, params.limit);
  }

  async getUser(userId: string): Promise<AdminUser> {
    await simulateDelay();

    const user = localStorageService.getItemById<AdminUser>('cyberdefend_users', userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId?: string;
    sendInvite?: boolean;
  }): Promise<AdminUser> {
    await simulateDelay();

    const newUser: AdminUser = {
      id: generateId(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
      role: userData.role as any,
      organizationId: userData.organizationId,
      emailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      accountStatus: 'active',
      lastActivity: new Date().toISOString()
    };

    localStorageService.addItem('cyberdefend_users', newUser);
    return newUser;
  }

  async updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
    organizationId?: string;
  }): Promise<AdminUser> {
    await simulateDelay();

    const updated = localStorageService.updateItem('cyberdefend_users', id, { ...data } as Partial<AdminUser>);
    if (!updated) {
      throw new Error('User not found');
    }

    const user = localStorageService.getItemById<AdminUser>('cyberdefend_users', id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async deactivateUser(userId: string): Promise<ApiResponse> {
    await simulateDelay();

    const updated = localStorageService.updateItem('cyberdefend_users', userId, { 
      accountStatus: 'suspended'
    } as any);

    if (!updated) {
      throw new Error('User not found');
    }

    return { success: true, message: 'User deactivated successfully' };
  }

  async reactivateUser(userId: string): Promise<ApiResponse> {
    await simulateDelay();

    const updated = localStorageService.updateItem('cyberdefend_users', userId, { 
      accountStatus: 'active'
    } as any);

    if (!updated) {
      throw new Error('User not found');
    }

    return { success: true, message: 'User reactivated successfully' };
  }

  // Question Management
  async getQuestions(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Question>> {
    await simulateDelay();

    let questions = localStorageService.getItems<Question>('cyberdefend_questions');

    if (params.category) {
      questions = questions.filter(q => q.category === params.category);
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      questions = questions.filter(q => q.text.toLowerCase().includes(search));
    }

    return paginate(questions, params.page, params.limit);
  }

  async getQuestion(questionId: string): Promise<Question> {
    await simulateDelay();

    const question = localStorageService.getItemById<Question>('cyberdefend_questions', questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    return question;
  }

  async createQuestion(questionData: Omit<Question, 'id'>): Promise<Question> {
    await simulateDelay();

    const newQuestion: Question = {
      id: generateId(),
      ...questionData
    };

    localStorageService.addItem('cyberdefend_questions', newQuestion);
    return newQuestion;
  }

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    await simulateDelay();

    const updated = localStorageService.updateItem('cyberdefend_questions', id, data);
    if (!updated) {
      throw new Error('Question not found');
    }

    const question = localStorageService.getItemById<Question>('cyberdefend_questions', id);
    if (!question) {
      throw new Error('Question not found');
    }

    return question;
  }

  async deleteQuestion(questionId: string): Promise<ApiResponse> {
    await simulateDelay();

    const deleted = localStorageService.removeItem('cyberdefend_questions', questionId);
    if (!deleted) {
      throw new Error('Question not found');
    }

    return { success: true, message: 'Question deleted successfully' };
  }

  // Category Management
  async getCategories(): Promise<QuestionCategory[]> {
    await simulateDelay();
    return localStorageService.getItems<QuestionCategory>('cyberdefend_categories');
  }

  async createCategory(categoryData: Omit<QuestionCategory, 'id' | 'questionCount'>): Promise<QuestionCategory> {
    await simulateDelay();

    const newCategory: QuestionCategory = {
      id: generateId(),
      ...categoryData,
      questionCount: 0
    };

    localStorageService.addItem('cyberdefend_categories', newCategory);
    return newCategory;
  }

  // Audit Logs
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    await simulateDelay();

    let logs = localStorageService.getItems<AuditLog>('cyberdefend_auditLogs');

    // Apply filters
    if (params.userId) {
      logs = logs.filter(log => log.userId === params.userId);
    }

    if (params.action) {
      logs = logs.filter(log => log.action === params.action);
    }

    if (params.resource) {
      logs = logs.filter(log => log.resource === params.resource);
    }

    return paginate(logs, params.page, params.limit);
  }
}

export const mockAdminService = new MockAdminService();
export default mockAdminService;