import { localStorageService } from './localStorageService';
import { 
  mockSubscriptions,
  mockInvoices,
  mockOrganizations
} from '../data/mockData';

// Simulate network delay
const simulateDelay = (ms = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock billing and organization service
export class MockBillingOrganizationService {
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    localStorageService.initializeWithMockData({
      subscriptions: mockSubscriptions,
      invoices: mockInvoices,
      organizations: mockOrganizations
    });
  }

  // Billing methods
  async getBillingInfo() {
    await simulateDelay();
    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const subscription = localStorageService.getSubscriptionByOrganization(currentUser.organizationId);
    return {
      subscription,
      organization: {
        id: currentUser.organizationId,
        name: currentUser.organizationName || 'Unknown Organization'
      }
    };
  }

  async getSubscription() {
    await simulateDelay();
    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    return localStorageService.getSubscriptionByOrganization(currentUser.organizationId);
  }

  async getSubscriptionPlans() {
    await simulateDelay();
    return [
      {
        id: 'defend-core',
        name: 'DefendCore',
        price: 99.99,
        features: ['Basic Assessment', 'Monthly Reports', 'Email Support']
      },
      {
        id: 'defend-vault',
        name: 'DefendVault',
        price: 199.99,
        features: ['Advanced Assessment', 'Real-time Monitoring', 'Phone Support']
      },
      {
        id: 'defend-click',
        name: 'DefendClick',
        price: 299.99,
        features: ['Phishing Campaigns', 'Employee Training', 'Custom Reports']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499.99,
        features: ['All Features', '24/7 Support', 'Custom Integration']
      }
    ];
  }

  async getInvoices() {
    await simulateDelay();
    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const subscription = localStorageService.getSubscriptionByOrganization(currentUser.organizationId);
    if (!subscription) {
      return [];
    }

    return localStorageService.getInvoicesBySubscription(subscription.id);
  }

  // Organization methods
  async getOrganization() {
    await simulateDelay();
    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    return localStorageService.getItemById('cyberdefend_organizations', currentUser.organizationId);
  }

  async updateOrganization(data: any) {
    await simulateDelay();
    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    localStorageService.updateItem('cyberdefend_organizations', currentUser.organizationId, data);
    
    return localStorageService.getItemById('cyberdefend_organizations', currentUser.organizationId);
  }

  // Generic mock methods for other endpoints
  async mockGeneric(returnData?: any) {
    await simulateDelay();
    return returnData || { success: true, message: 'Mock operation completed' };
  }
}

export const mockBillingOrganizationService = new MockBillingOrganizationService();
export default mockBillingOrganizationService;