import { User, Assessment, PhishingCampaign, Alert, SystemScan, Subscription, Invoice } from '../types';

// localStorage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'cyberdefend_token',
  REFRESH_TOKEN: 'cyberdefend_refresh_token',
  USER_DATA: 'cyberdefend_user',
  ASSESSMENTS: 'cyberdefend_assessments',
  CAMPAIGNS: 'cyberdefend_campaigns',
  ALERTS: 'cyberdefend_alerts',
  SCANS: 'cyberdefend_scans',
  SUBSCRIPTIONS: 'cyberdefend_subscriptions',
  INVOICES: 'cyberdefend_invoices',
  QUESTIONS: 'cyberdefend_questions',
  ORGANIZATIONS: 'cyberdefend_organizations',
  USERS: 'cyberdefend_users',
  CSI_DIRECTORY: 'cyberdefend_csi_directory'
} as const;

// Generic storage operations
class LocalStorageService {
  // Generic get method with type safety
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  // Generic set method
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  // Remove item
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  // Clear all app data
  clearAll(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Auth token operations
  getAuthToken(): string | null {
    return this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  setAuthToken(token: string): boolean {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  removeAuthToken(): boolean {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  getRefreshToken(): string | null {
    return this.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setRefreshToken(token: string): boolean {
    return this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  removeRefreshToken(): boolean {
    return this.remove(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // User data operations
  getCurrentUser(): User | null {
    return this.get<User>(STORAGE_KEYS.USER_DATA);
  }

  setCurrentUser(user: User): boolean {
    return this.set(STORAGE_KEYS.USER_DATA, user);
  }

  removeCurrentUser(): boolean {
    return this.remove(STORAGE_KEYS.USER_DATA);
  }

  // Generic array operations with filtering support
  getItems<T>(key: string): T[] {
    return this.get<T[]>(key, []) || [];
  }

  setItems<T>(key: string, items: T[]): boolean {
    return this.set(key, items);
  }

  addItem<T extends { id: string }>(key: string, item: T): boolean {
    const items = this.getItems<T>(key);
    const existingIndex = items.findIndex(existing => existing.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    
    return this.setItems(key, items);
  }

  updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): boolean {
    const items = this.getItems<T>(key);
    const index = items.findIndex(item => item.id === id);
    
    if (index >= 0) {
      items[index] = { ...items[index], ...updates };
      return this.setItems(key, items);
    }
    
    return false;
  }

  removeItem<T extends { id: string }>(key: string, id: string): boolean {
    const items = this.getItems<T>(key);
    const filteredItems = items.filter(item => item.id !== id);
    return this.setItems(key, filteredItems);
  }

  getItemById<T extends { id: string }>(key: string, id: string): T | null {
    const items = this.getItems<T>(key);
    return items.find(item => item.id === id) || null;
  }

  getItemsByFilter<T>(key: string, predicate: (item: T) => boolean): T[] {
    const items = this.getItems<T>(key);
    return items.filter(predicate);
  }

  // Specific entity operations
  // Assessments
  getAssessments(): Assessment[] {
    return this.getItems<Assessment>(STORAGE_KEYS.ASSESSMENTS);
  }

  addAssessment(assessment: Assessment): boolean {
    return this.addItem(STORAGE_KEYS.ASSESSMENTS, assessment);
  }

  updateAssessment(id: string, updates: Partial<Assessment>): boolean {
    return this.updateItem(STORAGE_KEYS.ASSESSMENTS, id, updates);
  }

  getAssessmentsByOrganization(organizationId: string): Assessment[] {
    return this.getItemsByFilter<Assessment>(STORAGE_KEYS.ASSESSMENTS, 
      assessment => assessment.organizationId === organizationId);
  }

  // Campaigns
  getCampaigns(): PhishingCampaign[] {
    return this.getItems<PhishingCampaign>(STORAGE_KEYS.CAMPAIGNS);
  }

  addCampaign(campaign: PhishingCampaign): boolean {
    return this.addItem(STORAGE_KEYS.CAMPAIGNS, campaign);
  }

  updateCampaign(id: string, updates: Partial<PhishingCampaign>): boolean {
    return this.updateItem(STORAGE_KEYS.CAMPAIGNS, id, updates);
  }

  getCampaignsByOrganization(organizationId: string): PhishingCampaign[] {
    return this.getItemsByFilter<PhishingCampaign>(STORAGE_KEYS.CAMPAIGNS, 
      campaign => campaign.organizationId === organizationId);
  }

  // Alerts
  getAlerts(): Alert[] {
    return this.getItems<Alert>(STORAGE_KEYS.ALERTS);
  }

  addAlert(alert: Alert): boolean {
    return this.addItem(STORAGE_KEYS.ALERTS, alert);
  }

  updateAlert(id: string, updates: Partial<Alert>): boolean {
    return this.updateItem(STORAGE_KEYS.ALERTS, id, updates);
  }

  getAlertsByOrganization(organizationId: string): Alert[] {
    return this.getItemsByFilter<Alert>(STORAGE_KEYS.ALERTS, 
      alert => alert.organizationId === organizationId);
  }

  // System Scans
  getScans(): SystemScan[] {
    return this.getItems<SystemScan>(STORAGE_KEYS.SCANS);
  }

  addScan(scan: SystemScan): boolean {
    return this.addItem(STORAGE_KEYS.SCANS, scan);
  }

  updateScan(id: string, updates: Partial<SystemScan>): boolean {
    return this.updateItem(STORAGE_KEYS.SCANS, id, updates);
  }

  getScansByOrganization(organizationId: string): SystemScan[] {
    return this.getItemsByFilter<SystemScan>(STORAGE_KEYS.SCANS, 
      scan => scan.organizationId === organizationId);
  }

  // Subscriptions
  getSubscriptions(): Subscription[] {
    return this.getItems<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
  }

  addSubscription(subscription: Subscription): boolean {
    return this.addItem(STORAGE_KEYS.SUBSCRIPTIONS, subscription);
  }

  updateSubscription(id: string, updates: Partial<Subscription>): boolean {
    return this.updateItem(STORAGE_KEYS.SUBSCRIPTIONS, id, updates);
  }

  getSubscriptionByOrganization(organizationId: string): Subscription | null {
    const subscriptions = this.getItemsByFilter<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS, 
      subscription => subscription.organizationId === organizationId);
    return subscriptions[0] || null;
  }

  // Invoices
  getInvoices(): Invoice[] {
    return this.getItems<Invoice>(STORAGE_KEYS.INVOICES);
  }

  addInvoice(invoice: Invoice): boolean {
    return this.addItem(STORAGE_KEYS.INVOICES, invoice);
  }

  updateInvoice(id: string, updates: Partial<Invoice>): boolean {
    return this.updateItem(STORAGE_KEYS.INVOICES, id, updates);
  }

  getInvoicesBySubscription(subscriptionId: string): Invoice[] {
    return this.getItemsByFilter<Invoice>(STORAGE_KEYS.INVOICES, 
      invoice => invoice.subscriptionId === subscriptionId);
  }

  // Initialize storage with mock data
  initializeWithMockData(mockData: {
    users?: User[];
    assessments?: Assessment[];
    campaigns?: PhishingCampaign[];
    alerts?: Alert[];
    scans?: SystemScan[];
    subscriptions?: Subscription[];
    invoices?: Invoice[];
    [key: string]: any;
  }): boolean {
    try {
      // Only initialize if no data exists
      if (mockData.users && this.getItems(STORAGE_KEYS.USERS).length === 0) {
        this.setItems(STORAGE_KEYS.USERS, mockData.users);
      }
      if (mockData.assessments && this.getItems(STORAGE_KEYS.ASSESSMENTS).length === 0) {
        this.setItems(STORAGE_KEYS.ASSESSMENTS, mockData.assessments);
      }
      if (mockData.campaigns && this.getItems(STORAGE_KEYS.CAMPAIGNS).length === 0) {
        this.setItems(STORAGE_KEYS.CAMPAIGNS, mockData.campaigns);
      }
      if (mockData.alerts && this.getItems(STORAGE_KEYS.ALERTS).length === 0) {
        this.setItems(STORAGE_KEYS.ALERTS, mockData.alerts);
      }
      if (mockData.scans && this.getItems(STORAGE_KEYS.SCANS).length === 0) {
        this.setItems(STORAGE_KEYS.SCANS, mockData.scans);
      }
      if (mockData.subscriptions && this.getItems(STORAGE_KEYS.SUBSCRIPTIONS).length === 0) {
        this.setItems(STORAGE_KEYS.SUBSCRIPTIONS, mockData.subscriptions);
      }
      if (mockData.invoices && this.getItems(STORAGE_KEYS.INVOICES).length === 0) {
        this.setItems(STORAGE_KEYS.INVOICES, mockData.invoices);
      }
      
      // Initialize other mock data keys
      Object.entries(mockData).forEach(([key, value]) => {
        if (!['users', 'assessments', 'campaigns', 'alerts', 'scans', 'subscriptions', 'invoices'].includes(key)) {
          const storageKey = (STORAGE_KEYS as any)[key.toUpperCase()] || `cyberdefend_${key}`;
          if (this.getItems(storageKey).length === 0) {
            this.setItems(storageKey, value);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing mock data:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const localStorageService = new LocalStorageService();
export { STORAGE_KEYS };
export default localStorageService;