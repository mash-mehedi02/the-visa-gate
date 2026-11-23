import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { RoleName } from '@thevisagate/shared';

export interface AuthUser {
  id: string;
  identifier: string;
  email: string | null;
  role: RoleName;
  name: string;
  mustChangePassword?: boolean;
  clientProfile?: any;
  staffProfile?: any;
}

export interface LoginResponse {
  requiresMfa?: boolean;
  mfaToken?: string;
  maskedDestination?: string;
  token?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: RoleName | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResponse>;
  verifyMfa: (mfaToken: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('tvg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tvg_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (localStorage.getItem('tvg_token')) {
        const res: any = await api.get('/auth/me');
        if (res.data) {
          setUser(res.data);
          localStorage.setItem('tvg_user', JSON.stringify(res.data));
        }
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('tvg_token');
      localStorage.removeItem('tvg_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, password: string): Promise<LoginResponse> => {
    const res: any = await api.post('/auth/login', { identifier, password });
    const data = res.data;

    if (data.requiresMfa) {
      return {
        requiresMfa: true,
        mfaToken: data.mfaToken,
        maskedDestination: data.maskedDestination,
      };
    }

    const { token: receivedToken, user: receivedUser } = data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('tvg_token', receivedToken);
    localStorage.setItem('tvg_user', JSON.stringify(receivedUser));

    return {
      requiresMfa: false,
      token: receivedToken,
      user: receivedUser,
    };
  };

  const verifyMfa = async (mfaToken: string, code: string): Promise<AuthUser> => {
    const res: any = await api.post('/auth/verify-mfa', { mfaToken, code });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('tvg_token', receivedToken);
    localStorage.setItem('tvg_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('tvg_token');
    localStorage.removeItem('tvg_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyMfa,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
