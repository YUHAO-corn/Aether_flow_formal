import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/apiClient';

// 创建认证上下文
const AuthContext = createContext();

// 认证上下文提供者组件
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化时检查用户是否已登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          // 验证token是否有效
          const response = await authAPI.getCurrentUser();
          setCurrentUser(response.data);
        } catch (error) {
          // token无效，清除本地存储
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // 用户注册
  const register = async (username, email, password) => {
    setError(null);
    
    // 打印注册参数，用于调试
    console.log('注册参数:', { username, email, password });
    
    try {
      // 确保passwordConfirm与password相同
      const userData = { 
        username, 
        email, 
        password,
        passwordConfirm: password 
      };
      
      console.log('发送到后端的数据:', userData);
      
      const response = await authAPI.register(userData);
      
      console.log('注册成功，响应:', response.data);
      
      // 保存token和用户信息
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        username: response.data.username,
        email: response.data.email
      }));
      
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      
      // 详细记录错误信息
      if (error.response) {
        console.error('错误响应数据:', error.response.data);
        console.error('错误状态码:', error.response.status);
        setError(error.response.data.error?.message || '注册失败，请稍后再试');
      } else if (error.request) {
        console.error('未收到响应:', error.request);
        setError('网络错误，请检查您的网络连接');
      } else {
        console.error('请求配置错误:', error.message);
        setError('请求错误，请稍后再试');
      }
      
      throw error;
    }
  };

  // 用户登录
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      
      // 保存token和用户信息
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        username: response.data.username
      }));
      
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error?.message || '登录失败，请检查邮箱和密码');
      } else {
        setError('网络错误，请稍后再试');
      }
      throw error;
    }
  };

  // 用户登出
  const logout = async () => {
    setError(null);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('登出时发生错误:', error);
    } finally {
      // 无论API调用是否成功，都清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  // 更新用户信息
  const updateUserInfo = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.updateUser(userData);
      
      // 更新本地存储的用户信息
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...storedUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || '更新用户信息失败');
      throw error;
    }
  };

  // 上下文值
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，方便使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export default AuthContext; 