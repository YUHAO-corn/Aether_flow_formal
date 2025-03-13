/**
 * API密钥管理功能集成测试
 */

const request = require('supertest');
const app = require('../app');
const { User, ApiKey } = require('../models');
const { mockEncryptKey } = require('../utils/encryption');
const dbHandler = require('./setup');

describe('API密钥管理API', () => {
  let token;
  let user;
  const testApiKey = {
    name: '测试密钥',
    platform: 'OpenAI',
    key: 'sk-test123'
  };

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();
    
    // 创建测试用户
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    });

    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    if (!loginResponse.body.token) {
      throw new Error('登录失败: 未获取到token');
    }

    token = loginResponse.body.token;
  });

  test('应成功添加API密钥', async () => {
    const response = await request(app)
      .post('/api/v1/apiKeys')
      .set('Authorization', `Bearer ${token}`)
      .send(testApiKey);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('name', testApiKey.name);
    expect(response.body.data).toHaveProperty('platform', testApiKey.platform);
  });

  test('应成功获取API密钥列表', async () => {
    const { encryptedKey, iv } = mockEncryptKey(testApiKey.key);
    await ApiKey.create({
      user: user._id,
      name: testApiKey.name,
      platform: testApiKey.platform,
      key: encryptedKey,
      iv
    });

    const response = await request(app)
      .get('/api/v1/apiKeys')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty('name', testApiKey.name);
  });

  test('应成功更新API密钥', async () => {
    const { encryptedKey, iv } = mockEncryptKey(testApiKey.key);
    const apiKey = await ApiKey.create({
      user: user._id,
      name: testApiKey.name,
      platform: testApiKey.platform,
      key: encryptedKey,
      iv
    });

    const updateData = {
      name: '更新后的密钥',
      platform: 'Claude'
    };

    const response = await request(app)
      .patch(`/api/v1/apiKeys/${apiKey._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('name', updateData.name);
    expect(response.body.data).toHaveProperty('platform', updateData.platform);
  });

  test('应成功删除API密钥', async () => {
    const { encryptedKey, iv } = mockEncryptKey(testApiKey.key);
    const apiKey = await ApiKey.create({
      user: user._id,
      name: testApiKey.name,
      platform: testApiKey.platform,
      key: encryptedKey,
      iv
    });

    const response = await request(app)
      .delete(`/api/v1/apiKeys/${apiKey._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const deletedApiKey = await ApiKey.findById(apiKey._id);
    expect(deletedApiKey).toBeNull();
  });

  test('未授权用户应被拒绝访问', async () => {
    const response = await request(app)
      .get('/api/v1/apiKeys')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  test('应验证请求参数', async () => {
    const invalidData = {
      name: '',
      platform: 'InvalidPlatform',
      key: ''
    };

    const response = await request(app)
      .post('/api/v1/apiKeys')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidData);

    expect(response.status).toBe(400);
  });
}); 