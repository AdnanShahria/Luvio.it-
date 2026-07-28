'use client';

/**
 * Luvio Platform — Auth Context Provider
 * Manages authentication state across the React app.
 * Provides login, logout, register functions and current user data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api-client';
import type { User, LoginResponse } from '@luvio/shared';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email?: string;
    phone?: string;
    phoneCountryCode?: string;
    password: string;
    displayName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('luvio-access-token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          api.clearTokens();
        }
      } catch {
        api.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Handle unauthorized redirect
    api.setOnUnauthorized(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password }, { skipAuth: true });
    if (response.success && response.data) {
      api.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      setUser(response.data.user as User);
      return { success: true };
    }
    return { success: false, error: response.error || 'Login failed' };
  }, []);

  const loginWithPhone = useCallback(async (phone: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { phone, password }, { skipAuth: true });
    if (response.success && response.data) {
      api.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      setUser(response.data.user as User);
      return { success: true };
    }
    return { success: false, error: response.error || 'Login failed' };
  }, []);

  const register = useCallback(async (data: {
    email?: string;
    phone?: string;
    phoneCountryCode?: string;
    password: string;
    displayName: string;
  }) => {
    const response = await api.post<LoginResponse>('/auth/register', data, { skipAuth: true });
    if (response.success && response.data) {
      api.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      setUser(response.data.user as User);
      return { success: true };
    }
    return { success: false, error: response.error || 'Registration failed' };
  }, []);

  const logout = useCallback(() => {
    api.clearTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await api.get<User>('/auth/me');
    if (response.success && response.data) {
      setUser(response.data);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithPhone,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
