import React from 'react';
import { mockAuthService } from '../../services/mockAuthService';
import type { 
  User, 
  LoginDto, 
  RegisterDto, 
  AuthResponse, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  RefreshTokenDto,
  VerifyEmailDto,
  ApiResponse 
} from '../../types';

// Mock implementations that return proper RTK Query-like interfaces
export const useLoginMutation = () => {
  const mutationFn = async (credentials: LoginDto): Promise<{ data: AuthResponse }> => {
    try {
      const data = await mockAuthService.login(credentials);
      return { data };
    } catch (error) {
      throw { error: { status: 401, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useRegisterMutation = () => {
  const mutationFn = async (userData: RegisterDto): Promise<{ data: AuthResponse }> => {
    try {
      const data = await mockAuthService.register(userData);
      return { data };
    } catch (error) {
      throw { error: { status: 400, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useRefreshTokenMutation = () => {
  const mutationFn = async (tokenData: RefreshTokenDto): Promise<{ data: AuthResponse }> => {
    try {
      const data = await mockAuthService.refreshToken(tokenData);
      return { data };
    } catch (error) {
      throw { error: { status: 401, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useLogoutMutation = () => {
  const mutationFn = async (): Promise<{ data: ApiResponse }> => {
    try {
      const data = await mockAuthService.logout();
      return { data };
    } catch (error) {
      throw { error: { status: 500, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useGetProfileQuery = () => {
  const [profile, setProfile] = React.useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const data = await mockAuthService.getProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err as any);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    refetch();
  }, []);

  return {
    data: profile,
    isLoading,
    error,
    refetch
  };
};

export const useUpdateProfileMutation = () => {
  const mutationFn = async (_updateData: Partial<User>): Promise<{ data: User }> => {
    try {
      const data = await mockAuthService.getProfile(); // Mock update by returning current profile
      return { data };
    } catch (error) {
      throw { error: { status: 400, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useChangePasswordMutation = () => {
  const mutationFn = async (passwordData: ChangePasswordDto): Promise<{ data: ApiResponse }> => {
    try {
      const data = await mockAuthService.changePassword(passwordData);
      return { data };
    } catch (error) {
      throw { error: { status: 400, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useForgotPasswordMutation = () => {
  const mutationFn = async (emailData: ForgotPasswordDto): Promise<{ data: ApiResponse }> => {
    try {
      const data = await mockAuthService.forgotPassword(emailData);
      return { data };
    } catch (error) {
      throw { error: { status: 404, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useResetPasswordMutation = () => {
  const mutationFn = async (resetData: ResetPasswordDto): Promise<{ data: ApiResponse }> => {
    try {
      const data = await mockAuthService.resetPassword(resetData);
      return { data };
    } catch (error) {
      throw { error: { status: 400, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};

export const useVerifyEmailMutation = () => {
  const mutationFn = async (_verifyData: VerifyEmailDto): Promise<{ data: ApiResponse }> => {
    try {
      // Mock verification always succeeds
      const data = { message: 'Email verified successfully', success: true };
      return { data };
    } catch (error) {
      throw { error: { status: 400, data: { message: (error as Error).message } } };
    }
  };
  return [mutationFn, { isLoading: false, error: null, reset: () => {} }] as const;
};