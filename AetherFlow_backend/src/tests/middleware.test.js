const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect, authorize } = require('../middlewares/auth');
const { globalErrorHandler } = require('../middlewares/error');
const validate = require('../middlewares/validate');
const AppError = require('../utils/appError');

// 模拟User模型
jest.mock('../models', () => ({
  User: {
    findById: jest.fn()
  }
}));

// 模拟jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

// 模拟logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('中间件单元测试', () => {
  let req, res, next;
  
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 创建请求和响应对象
    req = mockRequest({
      headers: {},
      cookies: {}
    });
    res = mockResponse();
    next = jest.fn();
  });
  
  describe('认证中间件', () => {
    describe('protect', () => {
      it('应成功验证有效的token', async () => {
        // 设置请求头
        const token = 'valid_token';
        req.headers.authorization = `Bearer ${token}`;
        
        // 模拟数据
        const decodedToken = {
          id: new mongoose.Types.ObjectId()
        };
        const mockUser = {
          _id: decodedToken.id,
          username: 'testuser',
          email: 'test@example.com',
          changedPasswordAfter: jest.fn().mockReturnValue(false)
        };
        
        // 设置模拟函数返回值
        jwt.verify.mockImplementation((token, secret, callback) => {
          return Promise.resolve(decodedToken);
        });
        User.findById.mockResolvedValue(mockUser);
        
        // 调用中间件
        await protect(req, res, next);
        
        // 验证结果
        expect(User.findById).toHaveBeenCalledWith(decodedToken.id);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
      });
      
      it('应处理未提供token的情况', async () => {
        // 调用中间件
        await protect(req, res, next);
        
        // 验证结果
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
        expect(next.mock.calls[0][0].message).toContain('您未登录');
      });
      
      it('应处理无效token的情况', async () => {
        // 设置请求头
        req.headers.authorization = 'Bearer invalid_token';
        
        // 设置模拟函数抛出错误
        jwt.verify.mockImplementation(() => {
          throw new Error('无效的token');
        });
        
        // 调用中间件
        await protect(req, res, next);
        
        // 验证结果
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
      });
      
      it('应处理用户不存在的情况', async () => {
        // 设置请求头
        req.headers.authorization = 'Bearer valid_token';
        
        // 设置模拟函数返回值
        jwt.verify.mockImplementation(() => {
          return Promise.resolve({ id: new mongoose.Types.ObjectId() });
        });
        User.findById.mockResolvedValue(null);
        
        // 调用中间件
        await protect(req, res, next);
        
        // 验证结果
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
        expect(next.mock.calls[0][0].message).toContain('不再存在');
      });
    });
    
    describe('authorize', () => {
      it('应允许授权用户访问', () => {
        // 设置请求用户
        req.user = {
          role: 'admin'
        };
        
        // 调用中间件
        authorize('admin')(req, res, next);
        
        // 验证结果
        expect(next).toHaveBeenCalled();
      });
      
      it('应拒绝未授权用户访问', () => {
        // 设置请求用户
        req.user = {
          role: 'user'
        };
        
        // 调用中间件
        authorize('admin')(req, res, next);
        
        // 验证结果
        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
        expect(next.mock.calls[0][0].statusCode).toBe(403);
        expect(next.mock.calls[0][0].message).toContain('没有执行此操作的权限');
      });
    });
  });
  
  describe('错误处理中间件', () => {
    it('应处理验证错误', () => {
      // 创建验证错误
      const error = new Error('验证错误');
      error.name = 'ValidationError';
      error.errors = {
        field1: { message: '字段1错误' },
        field2: { message: '字段2错误' }
      };
      
      // 设置环境变量
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // 调用中间件
      globalErrorHandler(error, req, res, next);
      
      // 恢复环境变量
      process.env.NODE_ENV = originalEnv;
      
      // 验证结果
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: '验证错误'
      }));
    });
    
    it('应处理自定义应用错误', () => {
      // 创建应用错误
      const error = new AppError('自定义错误', 400);
      
      // 设置环境变量
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // 调用中间件
      globalErrorHandler(error, req, res, next);
      
      // 恢复环境变量
      process.env.NODE_ENV = originalEnv;
      
      // 验证结果
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'fail',
        message: '自定义错误'
      }));
    });
  });
  
  describe('验证中间件', () => {
    it('应成功验证有效的请求体', () => {
      // 创建验证模式
      const schema = {
        validate: jest.fn().mockReturnValue({ value: { username: 'testuser', email: 'test@example.com' } })
      };
      
      // 设置请求体
      req.body = {
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // 调用中间件
      validate(schema)(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(schema.validate).toHaveBeenCalledWith(req.body, expect.any(Object));
    });
    
    it('应处理无效的请求体', () => {
      // 创建验证模式
      const schema = {
        validate: jest.fn().mockReturnValue({
          error: {
            details: [
              { message: '用户名太短' },
              { message: '邮箱格式无效' }
            ]
          }
        })
      };
      
      // 设置请求体
      req.body = {
        username: 'te',
        email: 'invalid-email'
      };
      
      // 调用中间件
      validate(schema)(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('用户名太短');
      expect(next.mock.calls[0][0].message).toContain('邮箱格式无效');
    });
  });
}); 