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

function getScopeKeys(role?: RoleName | null) {
  if (role === RoleName.ADMIN || role === RoleName.SUPER_ADMIN || role === RoleName.STAFF) {
    return { tokenKey: 'tvg_admin_token', userKey: 'tvg_admin_user' };
  }
  if (role === RoleName.CLIENT) {
    return { tokenKey: 'tvg_client_token', userKey: 'tvg_client_user' };
  }
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.startsWith('/admin')) {
    return { tokenKey: 'tvg_admin_token', userKey: 'tvg_admin_user' };
  }
  if (path.startsWith('/client')) {
    return { tokenKey: 'tvg_client_token', userKey: 'tvg_client_user' };
  }
  return { tokenKey: 'tvg_token', userKey: 'tvg_user' };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const { userKey } = getScopeKeys();
    // IMPORTANT: Only read portal-scoped key — no fallback to tvg_user/tvg_token
    // to avoid CLIENT session overwriting ADMIN session
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const { tokenKey } = getScopeKeys();
    return localStorage.getItem(tokenKey);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const { tokenKey, userKey } = getScopeKeys();
    try {
      const storedToken = localStorage.getItem(tokenKey);
      if (storedToken) {
        const res: any = await api.get('/auth/me');
        if (res.data) {
          setUser(res.data);
          const roleKeys = getScopeKeys(res.data.role);
          localStorage.setItem(roleKeys.userKey, JSON.stringify(res.data));
          localStorage.setItem(roleKeys.tokenKey, storedToken);
        }
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const persistSession = (receivedToken: string, receivedUser: AuthUser) => {
    const { tokenKey, userKey } = getScopeKeys(receivedUser.role);
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem(tokenKey, receivedToken);
    localStorage.setItem(userKey, JSON.stringify(receivedUser));
  };

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
    persistSession(receivedToken, receivedUser);

    return {
      requiresMfa: false,
      token: receivedToken,
      user: receivedUser,
    };
  };

  const verifyMfa = async (mfaToken: string, code: string): Promise<AuthUser> => {
    const res: any = await api.post('/auth/verify-mfa', { mfaToken, code });
    const { token: receivedToken, user: receivedUser } = res.data;

    persistSession(receivedToken, receivedUser);

    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    const { tokenKey, userKey } = getScopeKeys(user?.role);
    setUser(null);
    setToken(null);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
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
