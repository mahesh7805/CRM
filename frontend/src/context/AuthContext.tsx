import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickSwitchRole: (role: RoleName) => Promise<void>;
  logout: () => void;
  hasRole: (roles: RoleName[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('erp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('erp_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUserSession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('erp_user', JSON.stringify(res.data.user));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    verifyUserSession();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    const { token: jwtToken, user: userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('erp_token', jwtToken);
    localStorage.setItem('erp_user', JSON.stringify(userData));
  };

  // Quick switch role preset helper for demonstration
  const quickSwitchRole = async (role: RoleName) => {
    const roleCreds: Record<RoleName, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@fundsroom.com', pass: 'admin123' },
      SALES: { email: 'sales@fundsroom.com', pass: 'sales123' },
      WAREHOUSE: { email: 'warehouse@fundsroom.com', pass: 'wh123456' },
      ACCOUNTS: { email: 'accounts@fundsroom.com', pass: 'acc123456' },
    };

    const target = roleCreds[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  const hasRole = (allowedRoles: RoleName[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickSwitchRole, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
