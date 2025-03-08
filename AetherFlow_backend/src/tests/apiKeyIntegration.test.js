/**
 * API密钥管理功能集成测试
 */

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 使用全局测试环境设置
require('./setup');

let api;

// 测试用户数据
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

// 测试API密钥数据
const testApiKeys = [
  {
    provider: 'openai',
    key: 'sk-test-openai-key',
    name: 'OpenAI测试密钥'
  },
  {
    provider: 'deepseek',
    key: 'sk-test-deepseek-key',
    name: 'DeepSeek测试密钥'
  },
  {
    provider: 'moonshot',
    key: 'sk-test-moonshot-key',
    name: 'Moonshot测试密钥'
  }
];

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h'
  });
};

beforeEach(async () => {
  // 清空数据库集合
  await User.deleteMany({});
  await ApiKey.deleteMany({});
  await ActivityLog.deleteMany({});
  
  // 创建测试用户
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await User.create({
    _id: testUser._id,
    username: testUser.username,
    email: testUser.email,
    password: hashedPassword
  });
  
  // 创建API测试客户端
  api = supertest(app);
});

describe('API密钥管理API', () => {
  let token;
  
  beforeEach(() => {
    // 生成JWT令牌
    token = generateToken(testUser._id);
  });
  
  describe('添加API密钥', () => {
    test('应成功添加API密钥', async () => {
      const apiKeyData = {
        provider: 'openai',
        key: 'sk-test-openai-key',
        name: 'OpenAI测试密钥'
      };
      
      const response = await api
        .post('/api/v1/api-keys')
        .set('Authorization', `Bearer ${token}`)
        .send(apiKeyData)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toBeDefined();
      expect(response.body.data.apiKey.provider).toBe(apiKeyData.provider);
      expect(response.body.data.apiKey.name).toBe(apiKeyData.name);
      expect(response.body.data.apiKey.user.toString()).toBe(testUser._id.toString());
      
      // 验证数据库中是否创建了API密钥
      const apiKeyInDb = await ApiKey.findOne({ user: testUser._id });
      expect(apiKeyInDb).toBeTruthy();
      expect(apiKeyInDb.provider).toBe(apiKeyData.provider);
      expect(apiKeyInDb.name).toBe(apiKeyData.name);
      
      // 验证是否记录了活动日志
      const activityLog = await ActivityLog.findOne({ 
        user: testUser._id,
        action: 'create_api_key',
        entityType: 'api_key'
      });
      expect(activityLog).toBeTruthy();
    });
    
    test('缺少必要字段应返回400', async () => {
      // 缺少provider字段
      const invalidData = {
        key: 'sk-test-key',
        name: '测试密钥'
      };
      
      const response = await api
        .post('/api/v1/api-keys')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('无效的provider应返回400', async () => {
      const invalidData = {
        provider: 'invalid-provider',
        key: 'sk-test-key',
        name: '测试密钥'
      };
      
      const response = await api
        .post('/api/v1/api-keys')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('未授权用户应被拒绝访问', async () => {
      const apiKeyData = {
        provider: 'openai',
        key: 'sk-test-key',
        name: '测试密钥'
      };
      
      await api
        .post('/api/v1/api-keys')
        .send(apiKeyData)
        .expect(401);
    });
  });
  
  describe('获取API密钥列表', () => {
    beforeEach(async () => {
      // 为测试用户创建API密钥
      for (const keyData of testApiKeys) {
        await ApiKey.create({
          user: testUser._id,
          provider: keyData.provider,
          key: keyData.key,
          name: keyData.name,
          isActive: true
        });
      }
    });
    
    test('应成功获取API密钥列表', async () => {
      const response = await api
        .get('/api/v1/api-keys')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKeys).toBeDefined();
      expect(response.body.data.apiKeys.length).toBe(testApiKeys.length);
      
      // 验证返回的API密钥不包含敏感信息
      const firstApiKey = response.body.data.apiKeys[0];
      expect(firstApiKey).not.toHaveProperty('key');
      expect(firstApiKey).toHaveProperty('provider');
      expect(firstApiKey).toHaveProperty('name');
      expect(firstApiKey).toHaveProperty('isActive');
    });
    
    test('应支持按提供商筛选', async () => {
      const response = await api
        .get('/api/v1/api-keys?provider=openai')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKeys).toBeDefined();
      expect(response.body.data.apiKeys.length).toBe(1);
      expect(response.body.data.apiKeys[0].provider).toBe('openai');
    });
    
    test('未授权用户应被拒绝访问', async () => {
      await api
        .get('/api/v1/api-keys')
        .expect(401);
    });
  });
  
  describe('验证API密钥', () => {
    beforeEach(async () => {
      // 为测试用户创建API密钥
      await ApiKey.create({
        user: testUser._id,
        provider: 'openai',
        key: 'sk-test-openai-key',
        name: 'OpenAI测试密钥',
        isActive: true
      });
    });
    
    test('应成功验证有效的API密钥', async () => {
      // 模拟API密钥验证服务
      jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ valid: true })
        })
      );
      
      const apiKeyId = (await ApiKey.findOne({ user: testUser._id }))._id;
      
      const response = await api
        .post(`/api/v1/api-keys/${apiKeyId}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      
      // 恢复mock
      global.fetch.mockRestore();
    });
    
    test('应正确处理无效的API密钥', async () => {
      // 模拟API密钥验证服务
      jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid API key' })
        })
      );
      
      const apiKeyId = (await ApiKey.findOne({ user: testUser._id }))._id;
      
      const response = await api
        .post(`/api/v1/api-keys/${apiKeyId}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      
      // 恢复mock
      global.fetch.mockRestore();
    });
    
    test('请求不存在的API密钥应返回404', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await api
        .post(`/api/v1/api-keys/${nonExistentId}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
    
    test('未授权用户应被拒绝访问', async () => {
      const apiKeyId = (await ApiKey.findOne({ user: testUser._id }))._id;
      
      await api
        .post(`/api/v1/api-keys/${apiKeyId}/verify`)
        .expect(401);
    });
  });
  
  describe('删除API密钥', () => {
    let apiKeyId;
    
    beforeEach(async () => {
      // 为测试用户创建API密钥
      const apiKey = await ApiKey.create({
        user: testUser._id,
        provider: 'openai',
        key: 'sk-test-openai-key',
        name: 'OpenAI测试密钥',
        isActive: true
      });
      
      apiKeyId = apiKey._id;
    });
    
    test('应成功删除API密钥', async () => {
      const response = await api
        .delete(`/api/v1/api-keys/${apiKeyId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('已删除');
      
      // 验证数据库中的API密钥是否已删除
      const apiKeyInDb = await ApiKey.findById(apiKeyId);
      expect(apiKeyInDb).toBeNull();
      
      // 验证是否记录了活动日志
      const activityLog = await ActivityLog.findOne({ 
        user: testUser._id,
        action: 'delete_api_key',
        entityType: 'api_key'
      });
      expect(activityLog).toBeTruthy();
    });
    
    test('请求删除不存在的API密钥应返回404', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await api
        .delete(`/api/v1/api-keys/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
    
    test('请求删除其他用户的API密钥应返回403', async () => {
      // 创建另一个用户
      const otherUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Password123!'
      };
      
      const hashedPassword = await bcrypt.hash(otherUser.password, 10);
      await User.create({
        _id: otherUser._id,
        username: otherUser.username,
        email: otherUser.email,
        password: hashedPassword
      });
      
      // 为另一个用户创建API密钥
      const otherApiKey = await ApiKey.create({
        user: otherUser._id,
        provider: 'openai',
        key: 'sk-test-other-key',
        name: '其他用户的密钥',
        isActive: true
      });
      
      // 尝试删除其他用户的API密钥
      await api
        .delete(`/api/v1/api-keys/${otherApiKey._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
    
    test('未授权用户应被拒绝访问', async () => {
      await api
        .delete(`/api/v1/api-keys/${apiKeyId}`)
        .expect(401);
    });
  });
  
  describe('更新API密钥', () => {
    let apiKeyId;
    
    beforeEach(async () => {
      // 为测试用户创建API密钥
      const apiKey = await ApiKey.create({
        user: testUser._id,
        provider: 'openai',
        key: 'sk-test-openai-key',
        name: 'OpenAI测试密钥',
        isActive: true
      });
      
      apiKeyId = apiKey._id;
    });
    
    test('应成功更新API密钥名称', async () => {
      const updateData = {
        name: '更新后的OpenAI密钥'
      };
      
      const response = await api
        .patch(`/api/v1/api-keys/${apiKeyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toBeDefined();
      expect(response.body.data.apiKey.name).toBe(updateData.name);
      
      // 验证数据库中的API密钥是否已更新
      const apiKeyInDb = await ApiKey.findById(apiKeyId);
      expect(apiKeyInDb.name).toBe(updateData.name);
      
      // 验证是否记录了活动日志
      const activityLog = await ActivityLog.findOne({ 
        user: testUser._id,
        action: 'update_api_key',
        entityType: 'api_key'
      });
      expect(activityLog).toBeTruthy();
    });
    
    test('应成功更新API密钥状态', async () => {
      const updateData = {
        isActive: false
      };
      
      const response = await api
        .patch(`/api/v1/api-keys/${apiKeyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toBeDefined();
      expect(response.body.data.apiKey.isActive).toBe(updateData.isActive);
      
      // 验证数据库中的API密钥是否已更新
      const apiKeyInDb = await ApiKey.findById(apiKeyId);
      expect(apiKeyInDb.isActive).toBe(updateData.isActive);
    });
    
    test('请求更新不存在的API密钥应返回404', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await api
        .patch(`/api/v1/api-keys/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '新名称' })
        .expect(404);
    });
    
    test('未授权用户应被拒绝访问', async () => {
      await api
        .patch(`/api/v1/api-keys/${apiKeyId}`)
        .send({ name: '新名称' })
        .expect(401);
    });
  });
}); 