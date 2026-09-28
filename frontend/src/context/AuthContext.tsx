import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfileResponse, RegisterPayload } from '../types';

interface AuthContextType {
  user: UserProfileResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitch: (email: string) => Promise<boolean>;
  hasRole: (allowedRoles: string[]) => boolean;
  updateUser: (updatedUser: Partial<UserProfileResponse>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nlams_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Validate existing token on boot
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('nlams_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          localStorage.removeItem('nlams_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to validate token:', err);
        localStorage.removeItem('nlams_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setLoading(false);
        return false;
      }

      const data = await res.json();
      localStorage.setItem('nlams_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      return false;
    }
  };

  const register = async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        setLoading(false);
        return { success: false, error: errData.detail || 'Registration failed' };
      }

      const data = await res.json();
      localStorage.setItem('nlams_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      setLoading(false);
      return { success: false, error: 'Network communication failure during registration' };
    }
  };

  const quickSwitch = async (email: string): Promise<boolean> => {
    return login(email, 'nlams@password2026');
  };

  const logout = () => {
    localStorage.removeItem('nlams_token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles: string[]): boolean => {
    if (!user) return false;
    if (user.role_id === 'ROLE_NATIONAL_ADMIN') return true; // Super admin has access
    return allowedRoles.includes(user.role_id);
  };

  const updateUser = (updatedUser: Partial<UserProfileResponse>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('nlams_token');
    if (!storedToken) return;
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitch, hasRole, updateUser, refreshUser }}>
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
