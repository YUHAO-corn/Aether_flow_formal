/**
 * 用户认证功能集成测试
 */

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let api;

// 测试用户数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

// 测试用户更新数据
const userUpdate = {
  username: 'updateduser',
  email: 'updated@example.com'
};

beforeAll(async () => {
  // 创建API测试客户端
  api = supertest(app);
});

beforeEach(async () => {
  // 清空数据库集合
  await User.deleteMany({});
  await ActivityLog.deleteMany({});
});

describe('用户认证集成测试', () => {
  describe('用户注册', () => {
    test('应成功注册新用户', async () => {
      const response = await api
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      
      // 验证用户是否已保存到数据库
      const usersInDb = await User.find({});
      expect(usersInDb).toHaveLength(1);
      expect(usersInDb[0].email).toBe(testUser.email);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('register');
    });
    
    test('应拒绝使用已存在的电子邮件注册', async () => {
      // 先创建一个用户
      await User.create({
        username: 'existinguser',
        email: testUser.email,
        password: await bcrypt.hash('password123', 10)
      });
      
      // 尝试使用相同的电子邮件注册
      const response = await api
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中仍然只有一个用户
      const usersInDb = await User.find({});
      expect(usersInDb).toHaveLength(1);
    });
    
    test('应拒绝使用无效数据注册', async () => {
      const invalidUser = {
        username: 'te', // 用户名太短
        email: 'invalid-email', // 无效的电子邮件
        password: '123' // 密码太短
      };
      
      const response = await api
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有用户
      const usersInDb = await User.find({});
      expect(usersInDb).toHaveLength(0);
    });
  });
  
  describe('用户登录', () => {
    beforeEach(async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await User.create({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword
      });
    });
    
    test('应成功登录有效用户', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('login');
    });
    
    test('应拒绝使用错误的密码登录', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证没有记录登录活动
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(0);
    });
    
    test('应拒绝使用不存在的电子邮件登录', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('获取用户信息', () => {
    let token;
    let userId;
    
    beforeEach(async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword
      });
      
      userId = user._id;
      
      // 生成JWT令牌
      token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
    });
    
    test('应成功获取当前用户信息', async () => {
      const response = await api
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get('/api/v1/auth/me')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝使用无效令牌的请求', async () => {
      const response = await api
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('更新用户信息', () => {
    let token;
    let userId;
    
    beforeEach(async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword
      });
      
      userId = user._id;
      
      // 生成JWT令牌
      token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
    });
    
    test('应成功更新用户信息', async () => {
      const response = await api
        .put('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send(userUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.username).toBe(userUpdate.username);
      expect(response.body.data.user.email).toBe(userUpdate.email);
      
      // 验证数据库中的用户是否已更新
      const updatedUser = await User.findById(userId);
      expect(updatedUser.username).toBe(userUpdate.username);
      expect(updatedUser.email).toBe(userUpdate.email);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('update_profile');
    });
    
    test('应拒绝使用已存在的电子邮件更新', async () => {
      // 创建另一个用户
      await User.create({
        username: 'anotheruser',
        email: userUpdate.email,
        password: await bcrypt.hash('password123', 10)
      });
      
      const response = await api
        .put('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send(userUpdate)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中的用户未更新
      const user = await User.findById(userId);
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .put('/api/v1/auth/me')
        .send(userUpdate)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('用户登出', () => {
    let token;
    let userId;
    
    beforeEach(async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword
      });
      
      userId = user._id;
      
      // 生成JWT令牌
      token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
    });
    
    test('应成功记录用户登出', async () => {
      const response = await api
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('logout');
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .post('/api/v1/auth/logout')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 