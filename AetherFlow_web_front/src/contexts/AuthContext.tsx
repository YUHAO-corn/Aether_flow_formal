import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api';

// 定义用户类型
interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; passwordConfirm: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证上下文提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 加载用户信息
  const loadUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.auth.getMe();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('加载用户信息失败:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时加载用户信息
  useEffect(() => {
    loadUser();
  }, []);

  // 登录
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await apiClient.auth.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      // 保存token到localStorage
      localStorage.setItem('token', newToken);
      
      // 更新状态
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查您的凭据');
      throw err;
    }
  };

  // 注册
  const register = async (userData: { username: string; email: string; password: string; passwordConfirm: string }) => {
    setError(null);
    try {
      await apiClient.auth.register(userData);
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
      throw err;
    }
  };

  // 登出
  const logout = () => {
    // 清除本地存储的token
    localStorage.removeItem('token');
    
    // 更新状态
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // 调用API登出
    apiClient.auth.logout().catch(err => {
      console.error('登出API调用失败:', err);
    });
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 自定义Hook，用于访问认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 