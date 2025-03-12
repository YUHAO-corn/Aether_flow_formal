const request = require('supertest');
const app = require('../app');
const { Prompt, Tag } = require('../models');
const { setupTestUser } = require('./setup');

describe('提示词API测试', () => {
  describe('POST /api/v1/prompts/auto-save', () => {
    it('应该成功自动保存提示词', async () => {
      const { token } = await setupTestUser();
      
      const promptData = {
        content: '这是一个测试提示词',
        response: '这是一个测试响应',
        platform: 'ChatGPT',
        url: 'https://chat.openai.com/'
      };
      
      const response = await request(app)
        .post('/api/v1/prompts/auto-save')
        .set('Authorization', `Bearer ${token}`)
        .send(promptData)
        .expect(201);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('content', promptData.content);
      expect(response.body.data).toHaveProperty('response', promptData.response);
      expect(response.body.data).toHaveProperty('platform', promptData.platform);
      expect(response.body.data).toHaveProperty('url', promptData.url);
      expect(response.body.data).toHaveProperty('favorite', false);
      expect(response.body.data).toHaveProperty('usageCount', 1);
      
      // 验证提示词已保存到数据库
      const prompt = await Prompt.findById(response.body.data._id);
      expect(prompt).toBeTruthy();
      expect(prompt.content).toBe(promptData.content);
    });
    
    it('当提交相同内容的提示词时应该更新现有记录', async () => {
      const { user, token } = await setupTestUser();
      
      // 先创建一个提示词
      const existingPrompt = await Prompt.create({
        user: user._id,
        content: '这是一个重复的提示词',
        response: '原始响应',
        platform: 'ChatGPT',
        usageCount: 1
      });
      
      const promptData = {
        content: '这是一个重复的提示词',
        response: '更新的响应',
        platform: 'ChatGPT'
      };
      
      const response = await request(app)
        .post('/api/v1/prompts/auto-save')
        .set('Authorization', `Bearer ${token}`)
        .send(promptData)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data._id).toBe(existingPrompt._id.toString());
      expect(response.body.data).toHaveProperty('response', promptData.response);
      expect(response.body.data).toHaveProperty('usageCount', 2);
      
      // 验证提示词已更新
      const updatedPrompt = await Prompt.findById(existingPrompt._id);
      expect(updatedPrompt.response).toBe(promptData.response);
      expect(updatedPrompt.usageCount).toBe(2);
    });
    
    it('当内容为空时应该返回错误', async () => {
      const { token } = await setupTestUser();
      
      const promptData = {
        content: '',
        platform: 'ChatGPT'
      };
      
      const response = await request(app)
        .post('/api/v1/prompts/auto-save')
        .set('Authorization', `Bearer ${token}`)
        .send(promptData)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('内容不能为空');
    });
  });
  
  describe('GET /api/v1/prompts/quick-search', () => {
    it('应该返回匹配的提示词', async () => {
      const { user, token } = await setupTestUser();
      
      // 创建测试提示词
      await Prompt.create([
        {
          user: user._id,
          content: '如何使用React Hooks',
          favorite: true,
          usageCount: 5
        },
        {
          user: user._id,
          content: 'React组件生命周期',
          favorite: false,
          usageCount: 3
        },
        {
          user: user._id,
          content: 'Vue和React的区别',
          favorite: false,
          usageCount: 1
        }
      ]);
      
      const response = await request(app)
        .get('/api/v1/prompts/quick-search?query=React')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(3);
      
      // 验证排序顺序：收藏 > 高频使用 > 最近使用
      expect(response.body.data[0].content).toBe('如何使用React Hooks');
      expect(response.body.data[0].favorite).toBe(true);
      
      expect(response.body.data[1].content).toBe('React组件生命周期');
      expect(response.body.data[1].usageCount).toBe(3);
    });
    
    it('当搜索关键词为空时应该返回错误', async () => {
      const { token } = await setupTestUser();
      
      const response = await request(app)
        .get('/api/v1/prompts/quick-search')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('搜索关键词不能为空');
    });
  });
  
  describe('GET /api/v1/prompts/recent', () => {
    it('应该返回最近使用的提示词', async () => {
      const { user, token } = await setupTestUser();
      
      // 创建测试提示词
      const now = new Date();
      
      await Prompt.create([
        {
          user: user._id,
          content: '最新的提示词',
          updatedAt: new Date(now.getTime() + 2000)
        },
        {
          user: user._id,
          content: '较新的提示词',
          updatedAt: new Date(now.getTime() + 1000)
        },
        {
          user: user._id,
          content: '最旧的提示词',
          updatedAt: now
        }
      ]);
      
      const response = await request(app)
        .get('/api/v1/prompts/recent?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      
      // 验证按更新时间降序排序
      expect(response.body.data[0].content).toBe('最新的提示词');
      expect(response.body.data[1].content).toBe('较新的提示词');
    });
  });
  
  describe('POST /api/v1/prompts/batch', () => {
    it('应该返回批量请求的提示词', async () => {
      const { user, token } = await setupTestUser();
      
      // 创建测试提示词
      const prompts = await Prompt.create([
        {
          user: user._id,
          content: '提示词1'
        },
        {
          user: user._id,
          content: '提示词2'
        },
        {
          user: user._id,
          content: '提示词3'
        }
      ]);
      
      const promptIds = prompts.map(p => p._id.toString());
      
      const response = await request(app)
        .post('/api/v1/prompts/batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: promptIds })
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(3);
      
      // 验证返回的提示词ID
      const returnedIds = response.body.data.map(p => p._id);
      expect(returnedIds).toEqual(expect.arrayContaining(promptIds));
    });
    
    it('当ID列表为空时应该返回错误', async () => {
      const { token } = await setupTestUser();
      
      const response = await request(app)
        .post('/api/v1/prompts/batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('ID列表不能为空');
    });
  });
}); 