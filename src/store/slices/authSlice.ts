import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
}

// Initialize state from localStorage
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  return {
    user: user ? JSON.parse(user) : null,
    token,
    refreshToken,
    isAuthenticated: !!token,
    loading: false,
    error: null,
    isEmailVerified: user ? JSON.parse(user)?.emailVerified || false : false,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { user, access_token, refresh_token } = action.payload;
      
      state.user = user;
      state.token = access_token;
      state.refreshToken = refresh_token;
      state.isAuthenticated = true;
      state.error = null;
      state.isEmailVerified = user.emailVerified || false;
      
      // Persist to localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    
    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      const { token, refreshToken } = action.payload;
      
      state.token = token;
      state.refreshToken = refreshToken;
      
      // Update localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
        
        // Update email verification status
        if ('emailVerified' in action.payload) {
          state.isEmailVerified = action.payload.emailVerified || false;
        }
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isEmailVerified = false;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;
      if (state.user) {
        state.user.emailVerified = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { 
  setCredentials, 
  updateTokens,
  updateUser,
  logout, 
  setLoading, 
  setError, 
  clearError,
  setEmailVerified
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsEmailVerified = (state: { auth: AuthState }) => state.auth.isEmailVerified;
