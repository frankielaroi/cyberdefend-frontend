import { 
  LoginDto, 
  RegisterDto, 
  AuthResponse, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  VerifyEmailDto,
  RefreshTokenDto,
  ApiResponse,
  User
} from '../types';
import { localStorageService } from './localStorageService';
import { 
  mockUsers, 
  mockOrganizations, 
  getMockUserByEmail, 
  generateId 
} from '../data/mockData';

// Generate JWT-like tokens (mock implementation)
const generateToken = (userId: string, expiresIn = '1h'): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    sub: userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expiresIn === '1h' ? 3600 : 86400 * 7) // 1 hour or 7 days
  }));
  const signature = btoa('mock-signature-' + userId);
  return `${header}.${payload}.${signature}`;
};

// Simulate network delay
const simulateDelay = (ms = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock Auth Service
export class MockAuthService {
  constructor() {
    // Initialize localStorage with mock data if empty
    this.initializeMockData();
  }

  private initializeMockData() {
    localStorageService.initializeWithMockData({
      users: mockUsers,
      organizations: mockOrganizations
    });
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    await simulateDelay();
    
    const user = getMockUserByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Simple password validation (in real app, this would be hashed)
    if (credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const accessToken = generateToken(user.id, '1h');
    const refreshToken = generateToken(user.id, '7d');

    // Update last login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    localStorageService.updateItem('cyberdefend_users', user.id, updatedUser);

    // Store tokens
    localStorageService.setAuthToken(accessToken);
    localStorageService.setRefreshToken(refreshToken);
    localStorageService.setCurrentUser(updatedUser);

    return {
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: updatedUser
    };
  }

  async register(userData: RegisterDto): Promise<AuthResponse> {
    await simulateDelay();

    // Check if user already exists
    const existingUser = getMockUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: generateId(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
      role: userData.role || 'END_USER',
      phone: userData.phone,
      emailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      organizationId: userData.organizationId
    };

    // If creating a new organization
    if (userData.organization && !userData.organizationId) {
      const newOrganization = {
        id: generateId(),
        name: userData.organization.name,
        email: userData.organization.email,
        phone: userData.organization.phone,
        website: userData.organization.website,
        size: userData.organization.size as any, // Cast to proper enum
        sector: userData.organization.sector as any, // Cast to proper enum
        region: 'North America', // Default region
        createdAt: new Date().toISOString()
      };
      
      localStorageService.addItem('cyberdefend_organizations', newOrganization);
      newUser.organizationId = newOrganization.id;
      newUser.organizationName = newOrganization.name;
      newUser.organization = {
        id: newOrganization.id,
        name: newOrganization.name,
        size: newOrganization.size,
        email: newOrganization.email,
        sector: newOrganization.sector
      };
    } else if (userData.organizationId) {
      const organization = localStorageService.getItemById<any>('cyberdefend_organizations', userData.organizationId);
      if (organization) {
        newUser.organizationName = organization.name;
        newUser.organization = {
          id: organization.id,
          name: organization.name,
          size: organization.size,
          email: organization.email,
          sector: organization.sector
        };
      }
    }

    // Save user
    localStorageService.addItem('cyberdefend_users', newUser);

    const accessToken = generateToken(newUser.id, '1h');
    const refreshToken = generateToken(newUser.id, '7d');

    // Store tokens
    localStorageService.setAuthToken(accessToken);
    localStorageService.setRefreshToken(refreshToken);
    localStorageService.setCurrentUser(newUser);

    return {
      message: 'Registration successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: newUser
    };
  }

  async refreshToken(_tokenData: RefreshTokenDto): Promise<AuthResponse> {
    await simulateDelay(200);

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user session found');
    }

    // In a real app, you'd validate the refresh token
    const newAccessToken = generateToken(currentUser.id, '1h');
    const newRefreshToken = generateToken(currentUser.id, '7d');

    localStorageService.setAuthToken(newAccessToken);
    localStorageService.setRefreshToken(newRefreshToken);

    return {
      message: 'Token refreshed successfully',
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      user: currentUser
    };
  }

  async logout(): Promise<ApiResponse> {
    await simulateDelay(200);

    localStorageService.removeAuthToken();
    localStorageService.removeRefreshToken();
    localStorageService.removeCurrentUser();

    return {
      success: true,
      message: 'Logout successful'
    };
  }

  async getProfile(): Promise<User> {
    await simulateDelay(200);

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user session found');
    }

    // Get fresh user data from storage
    const freshUser = localStorageService.getItemById<User>('cyberdefend_users', currentUser.id);
    if (!freshUser) {
      throw new Error('User not found');
    }

    return freshUser;
  }

  async changePassword(passwordData: ChangePasswordDto): Promise<ApiResponse> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user session found');
    }

    // In a real app, you'd verify the current password
    if (passwordData.currentPassword !== 'password123') {
      throw new Error('Current password is incorrect');
    }

    // In a real app, you'd hash and save the new password
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  async forgotPassword(emailData: ForgotPasswordDto): Promise<ApiResponse> {
    await simulateDelay();

    const user = getMockUserByEmail(emailData.email);
    if (!user) {
      // Don't reveal if email exists for security
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      };
    }

    return {
      success: true,
      message: 'Password reset link has been sent to your email'
    };
  }

  async resetPassword(_resetData: ResetPasswordDto): Promise<ApiResponse> {
    await simulateDelay();

    // In a real app, you'd validate the token and update the password
    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  }

  async verifyEmail(_verificationData: VerifyEmailDto): Promise<ApiResponse> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user session found');
    }

    // Update user verification status
    const updatedUser = { ...currentUser, emailVerified: true };
    localStorageService.updateItem('cyberdefend_users', currentUser.id, updatedUser);
    localStorageService.setCurrentUser(updatedUser);

    return {
      success: true,
      message: 'Email verified successfully'
    };
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorageService.getAuthToken();
    const user = localStorageService.getCurrentUser();
    return !!(token && user);
  }

  // Helper method to get current user
  getCurrentUser(): User | null {
    return localStorageService.getCurrentUser();
  }
}

// Create and export singleton instance
export const mockAuthService = new MockAuthService();
export default mockAuthService;