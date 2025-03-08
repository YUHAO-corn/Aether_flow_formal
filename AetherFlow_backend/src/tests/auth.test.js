const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { setupTestUser } = require('./setup');

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