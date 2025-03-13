const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { User, Prompt, Tag, ApiKey } = require('../models');
const jwt = require('jsonwebtoken');

describe('集成测试', () => {
  let token;
  let user;
  let prompt;
  let tag;
  let apiKey;

  beforeAll(async () => {
    // 连接到测试数据库
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 清空数据库
    await Promise.all([
      User.deleteMany({}),
      Prompt.deleteMany({}),
      Tag.deleteMany({}),
      ApiKey.deleteMany({})
    ]);

    // 创建测试用户
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    });

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  });

  describe('完整用户流程', () => {
    it('应完成完整的用户操作流程', async () => {
      // 1. 创建API密钥
      const apiKeyResponse = await request(app)
        .post('/api/v1/apiKeys')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '测试密钥',
          platform: 'OpenAI'
        });

      expect(apiKeyResponse.status).toBe(201);
      expect(apiKeyResponse.body.data).toHaveProperty('key');
      apiKey = apiKeyResponse.body.data;

      // 2. 创建标签
      const tagResponse = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '测试标签',
          color: '#FF0000'
        });

      expect(tagResponse.status).toBe(201);
      expect(tagResponse.body.data).toHaveProperty('name', '测试标签');
      tag = tagResponse.body.data;

      // 3. 创建提示词
      const promptResponse = await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '测试提示词',
          platform: 'ChatGPT',
          tags: [tag._id]
        });

      expect(promptResponse.status).toBe(201);
      expect(promptResponse.body.data).toHaveProperty('content', '测试提示词');
      prompt = promptResponse.body.data;

      // 4. 搜索提示词
      const searchResponse = await request(app)
        .get('/api/v1/prompts/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ keyword: '测试' });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data).toHaveLength(1);
      expect(searchResponse.body.data[0]._id).toBe(prompt._id);

      // 5. 更新提示词
      const updateResponse = await request(app)
        .patch(`/api/v1/prompts/${prompt._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '更新后的提示词'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.content).toBe('更新后的提示词');

      // 6. 删除提示词
      const deleteResponse = await request(app)
        .delete(`/api/v1/prompts/${prompt._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(204);

      // 7. 验证提示词已删除
      const getResponse = await request(app)
        .get(`/api/v1/prompts/${prompt._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('错误处理流程', () => {
    it('应正确处理无效的请求', async () => {
      // 1. 无效的API密钥请求
      const invalidApiKeyResponse = await request(app)
        .post('/api/v1/apiKeys')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // 空名称
          platform: 'InvalidPlatform'
        });

      expect(invalidApiKeyResponse.status).toBe(400);

      // 2. 无效的标签请求
      const invalidTagResponse = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // 空名称
          color: 'invalid-color'
        });

      expect(invalidTagResponse.status).toBe(400);

      // 3. 无效的提示词请求
      const invalidPromptResponse = await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '', // 空内容
          platform: 'InvalidPlatform'
        });

      expect(invalidPromptResponse.status).toBe(400);

      // 4. 无效的认证请求
      const invalidAuthResponse = await request(app)
        .get('/api/v1/prompts')
        .set('Authorization', 'Bearer invalid-token');

      expect(invalidAuthResponse.status).toBe(401);
    });
  });

  describe('性能优化流程', () => {
    it('应正确处理批量操作', async () => {
      // 1. 批量创建标签
      const tags = await Promise.all([
        Tag.create({ user: user._id, name: '标签1', color: '#FF0000' }),
        Tag.create({ user: user._id, name: '标签2', color: '#00FF00' }),
        Tag.create({ user: user._id, name: '标签3', color: '#0000FF' })
      ]);

      // 2. 批量创建提示词
      const prompts = await Promise.all([
        Prompt.create({ user: user._id, content: '提示词1', platform: 'ChatGPT', tags: [tags[0]._id] }),
        Prompt.create({ user: user._id, content: '提示词2', platform: 'ChatGPT', tags: [tags[1]._id] }),
        Prompt.create({ user: user._id, content: '提示词3', platform: 'ChatGPT', tags: [tags[2]._id] })
      ]);

      // 3. 批量获取提示词
      const batchGetResponse = await request(app)
        .post('/api/v1/prompts/batch')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ids: prompts.map(p => p._id)
        });

      expect(batchGetResponse.status).toBe(200);
      expect(batchGetResponse.body.data).toHaveLength(3);

      // 4. 分页获取提示词
      const pageResponse = await request(app)
        .get('/api/v1/prompts')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 2 });

      expect(pageResponse.status).toBe(200);
      expect(pageResponse.body.data).toHaveLength(2);
      expect(pageResponse.body.pagination.total).toBe(3);
    });
  });
}); 