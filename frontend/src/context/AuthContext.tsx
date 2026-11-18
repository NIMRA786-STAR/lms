import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import type { User, AuthResponse } from '../types';

interface LoginResult {
  success: boolean;
  message?: string;
}

interface RegisterResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<RegisterResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  );

  // ─── Logout: pure state reset ───
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  // ─── Fetch current user from token ───
  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get<{ data: User }>('/api/auth/me');
      setUser(response.data.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // ─── On mount / token change: fetch user only if not already set ───
  useEffect(() => {
    if (token && !user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else if (!token) {
      setLoading(false);
    }
  }, [token, user, fetchUser]);

  // ─── Login ───
  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await axios.post<{ data: AuthResponse }>(
        '/api/auth/login',
        { email, password }
      );
      const { token: newToken, ...userData } = response.data.data;

      // ✅ Set user FIRST, then token — prevents redundant /me call
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData as User);
      setToken(newToken);

      return { success: true };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Login failed'
        : 'Login failed';
      return { success: false, message };
    }
  };

  // ─── Register ───
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = 'student'
  ): Promise<RegisterResult> => {
    try {
      await axios.post('/api/auth/register', { name, email, password, role });
      return {
        success: true,
        message: 'Registration successful! Please login.',
      };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Registration failed'
        : 'Registration failed';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};