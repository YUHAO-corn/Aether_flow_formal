import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authAPI } from '../utils/apiClient';

// 模拟authAPI
jest.mock('../utils/apiClient', () => ({
  authAPI: {
    register: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    updateUser: jest.fn(),
    logout: jest.fn()
  }
}));

// 测试组件
const TestComponent = () => {
  const { currentUser, register, login, logout } = useAuth();
  
  return (
    <div>
      {currentUser && <p data-testid="user-info">User: {currentUser.username}</p>}
      
      <button onClick={() => register('testuser', 'test@example.com', 'password123')}>
        Register
      </button>
      
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用
    jest.clearAllMocks();
    
    // 清除localStorage
    localStorage.clear();
    
    // 默认模拟getCurrentUser返回null
    authAPI.getCurrentUser.mockResolvedValue({ data: null });
  });
  
  test('注册功能应该正常工作', async () => {
    // 模拟注册成功的响应
    authAPI.register.mockResolvedValueOnce({
      data: {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        token: 'fake-token'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 点击注册按钮
    fireEvent.click(screen.getByText('Register'));
    
    // 验证authAPI.register被调用
    expect(authAPI.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    // 等待用户信息显示
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });
    
    // 验证localStorage中的token和user
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({
      userId: '123',
      username: 'testuser',
      email: 'test@example.com'
    });
  });
  
  test('登录功能应该正常工作', async () => {
    // 模拟登录成功的响应
    authAPI.login.mockResolvedValueOnce({
      data: {
        userId: '123',
        username: 'testuser',
        token: 'fake-token'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 点击登录按钮
    fireEvent.click(screen.getByText('Login'));
    
    // 验证authAPI.login被调用
    expect(authAPI.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // 等待用户信息显示
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });
    
    // 验证localStorage中的token和user
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({
      userId: '123',
      username: 'testuser'
    });
  });
  
  test('登出功能应该正常工作', async () => {
    // 模拟已登录状态
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({
      userId: '123',
      username: 'testuser'
    }));
    
    // 模拟getCurrentUser成功的响应
    authAPI.getCurrentUser.mockResolvedValueOnce({
      data: {
        userId: '123',
        username: 'testuser'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 等待用户信息显示
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });
    
    // 点击登出按钮
    fireEvent.click(screen.getByText('Logout'));
    
    // 验证authAPI.logout被调用
    expect(authAPI.logout).toHaveBeenCalled();
    
    // 等待用户信息消失
    await waitFor(() => {
      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    });
    
    // 验证localStorage中的token和user被清除
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
}); 