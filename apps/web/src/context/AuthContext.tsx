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
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // The session lives in the httpOnly cookie set by the server, so the only
  // way to know who is signed in is to ask the server. No token or user
  // record is ever kept in browser storage.
  const fetchCurrentUser = async () => {
    try {
      const res: any = await api.get('/auth/me');
      if (res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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

    const { user: receivedUser } = data;
    setUser(receivedUser);

    return {
      requiresMfa: false,
      user: receivedUser,
    };
  };

  const verifyMfa = async (mfaToken: string, code: string): Promise<AuthUser> => {
    const res: any = await api.post('/auth/verify-mfa', { mfaToken, code });
    const { user: receivedUser } = res.data;

    setUser(receivedUser);

    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
