const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { setupTestUser } = require('./setup');
const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const authController = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('认证API测试', () => {
  describe('POST /api/v1/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
      
      // 验证用户已保存到数据库
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(userData.username);
    });
    
    it('当邮箱已存在时应该返回错误', async () => {
      // 先创建一个用户
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: '$2a$10$rrm9CjKUIuKHWp8XbUVcguqbuQZUOOLfBMsqxN64zNvUhBL4H9iJy' // 'password123'
      });
      
      const userData = {
        username: 'newuser',
        email: 'existing@example.com', // 使用已存在的邮箱
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('邮箱已被注册');
    });
    
    it('当密码不匹配时应该返回错误', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        passwordConfirm: 'differentpassword' // 不匹配的密码
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('密码不匹配');
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('应该成功登录用户', async () => {
      // 先创建一个用户
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: '$2a$10$rrm9CjKUIuKHWp8XbUVcguqbuQZUOOLfBMsqxN64zNvUhBL4H9iJy' // 'password123'
      });
      
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });
    
    it('当邮箱不存在时应该返回错误', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('邮箱或密码不正确');
    });
    
    it('当密码不正确时应该返回错误', async () => {
      // 先创建一个用户
      await User.create({
        username: 'wrongpassuser',
        email: 'wrongpass@example.com',
        password: '$2a$10$rrm9CjKUIuKHWp8XbUVcguqbuQZUOOLfBMsqxN64zNvUhBL4H9iJy' // 'password123'
      });
      
      const loginData = {
        email: 'wrongpass@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('邮箱或密码不正确');
    });
  });
  
  describe('GET /api/v1/auth/me', () => {
    it('应该返回当前用户信息', async () => {
      const { user, token } = await setupTestUser();
      
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user._id).toBe(user._id.toString());
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });
    
    it('当未提供令牌时应该返回错误', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('请先登录');
    });
    
    it('当提供无效令牌时应该返回错误', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('无效的令牌');
    });
  });
  
  describe('PATCH /api/v1/auth/updateMe', () => {
    it('应该成功更新用户信息', async () => {
      const { user, token } = await setupTestUser();
      
      const updateData = {
        username: 'updateduser',
        settings: {
          theme: 'dark',
          language: 'zh-CN'
        }
      };
      
      const response = await request(app)
        .patch('/api/v1/auth/updateMe')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.username).toBe(updateData.username);
      expect(response.body.data.user.settings.theme).toBe(updateData.settings.theme);
      expect(response.body.data.user.settings.language).toBe(updateData.settings.language);
      
      // 验证数据库中的用户已更新
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe(updateData.username);
      expect(updatedUser.settings.theme).toBe(updateData.settings.theme);
    });
    
    it('不应该允许更新密码', async () => {
      const { token } = await setupTestUser();
      
      const updateData = {
        password: 'newpassword'
      };
      
      const response = await request(app)
        .patch('/api/v1/auth/updateMe')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('不能通过此路由更新密码');
    });
  });
  
  describe('POST /api/v1/auth/logout', () => {
    it('应该成功登出用户', async () => {
      const { token } = await setupTestUser();
      
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('成功登出');
    });
  });
});

describe('认证控制器单元测试', () => {
  let req, res, next;
  
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 创建请求和响应对象
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });
  
  describe('register', () => {
    it('应成功注册新用户', async () => {
      // 设置请求体
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      // 模拟数据
      const hashedPassword = 'hashed_password';
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        password: hashedPassword,
        createdAt: new Date()
      };
      const mockToken = 'mock_token';
      
      // 设置模拟函数返回值
      User.findOne.mockResolvedValue(null); // 用户不存在
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(mockToken);
      
      // 调用控制器方法
      await authController.register(req, res, next);
      
      // 验证结果
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: mockToken,
          user: {
            _id: mockUser._id,
            username: mockUser.username,
            email: mockUser.email
          }
        }
      });
    });
    
    it('应处理已存在的邮箱', async () => {
      // 设置请求体
      req.body = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      
      // 设置模拟函数返回值
      User.findOne.mockResolvedValue({ email: req.body.email });
      
      // 调用控制器方法
      await authController.register(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('邮箱已被注册');
    });
    
    it('应处理密码不匹配的情况', async () => {
      // 设置请求体
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456'
      };
      
      // 调用控制器方法
      await authController.register(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('密码不匹配');
    });
  });
  
  describe('login', () => {
    it('应成功登录用户', async () => {
      // 设置请求体
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // 模拟数据
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: 'hashed_password'
      };
      const mockToken = 'mock_token';
      
      // 设置模拟函数返回值
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);
      
      // 调用控制器方法
      await authController.login(req, res, next);
      
      // 验证结果
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: mockToken,
          user: {
            _id: mockUser._id,
            email: mockUser.email
          }
        }
      });
    });
    
    it('应处理用户不存在的情况', async () => {
      // 设置请求体
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // 设置模拟函数返回值
      User.findOne.mockResolvedValue(null);
      
      // 调用控制器方法
      await authController.login(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toContain('邮箱或密码错误');
    });
    
    it('应处理密码错误的情况', async () => {
      // 设置请求体
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      // 模拟数据
      const mockUser = {
        email: req.body.email,
        password: 'hashed_password'
      };
      
      // 设置模拟函数返回值
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      
      // 调用控制器方法
      await authController.login(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toContain('邮箱或密码错误');
    });
  });
  
  describe('getMe', () => {
    it('应成功获取当前用户信息', async () => {
      // 设置请求用户
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // 调用控制器方法
      await authController.getMe(req, res, next);
      
      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: req.user }
      });
    });
  });
  
  describe('updateMe', () => {
    it('应成功更新用户信息', async () => {
      // 设置请求用户和请求体
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com'
      };
      req.body = {
        username: 'newusername',
        email: 'newemail@example.com'
      };
      
      // 模拟数据
      const updatedUser = {
        ...req.user,
        ...req.body
      };
      
      // 设置模拟函数返回值
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);
      
      // 调用控制器方法
      await authController.updateMe(req, res, next);
      
      // 验证结果
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
      );
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: updatedUser }
      });
    });
    
    it('应处理更新用户信息时的错误', async () => {
      // 设置请求用户和请求体
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com'
      };
      req.body = {
        username: 'newusername'
      };
      
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      User.findByIdAndUpdate.mockRejectedValue(error);
      
      // 调用控制器方法
      await authController.updateMe(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
}); 