/**
 * 提示词管理功能集成测试
 */

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Tag = require('../models/Tag');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const request = require('supertest');

let api;

// 测试用户数据
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

// 测试提示词数据
const testPrompt = {
  content: '写一篇关于人工智能的文章',
  response: '人工智能（AI）是计算机科学的一个分支...',
  platform: 'OpenAI',
  url: 'https://chat.openai.com/123456'
};

// 测试标签数据
const testTag = {
  _id: new mongoose.Types.ObjectId(),
  name: 'AI',
  color: '#3498db',
  user: testUser._id
};

beforeAll(async () => {
  // 创建API测试客户端
  api = supertest(app);
});

beforeEach(async () => {
  // 清空数据库集合
  await User.deleteMany({});
  await Prompt.deleteMany({});
  await Tag.deleteMany({});
  await ActivityLog.deleteMany({});
  
  // 创建测试用户
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await User.create({
    _id: testUser._id,
    username: testUser.username,
    email: testUser.email,
    password: hashedPassword
  });
  
  // 创建测试标签
  await Tag.create({
    _id: testTag._id,
    name: testTag.name,
    color: testTag.color,
    user: testUser._id
  });
});

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
};

describe('提示词管理集成测试', () => {
  describe('创建提示词', () => {
    test('应成功创建新提示词', async () => {
      const token = generateToken(testUser._id);
      
      const promptData = {
        ...testPrompt,
        tags: [testTag._id]
      };
      
      const response = await api
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${token}`)
        .send(promptData)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data.prompt.content).toBe(testPrompt.content);
      expect(response.body.data.prompt.response).toBe(testPrompt.response);
      expect(response.body.data.prompt.platform).toBe(testPrompt.platform);
      expect(response.body.data.prompt.url).toBe(testPrompt.url);
      expect(response.body.data.prompt.user.toString()).toBe(testUser._id.toString());
      expect(response.body.data.prompt.tags).toHaveLength(1);
      expect(response.body.data.prompt.tags[0].toString()).toBe(testTag._id.toString());
      
      // 验证提示词是否已保存到数据库
      const promptsInDb = await Prompt.find({});
      expect(promptsInDb).toHaveLength(1);
      expect(promptsInDb[0].content).toBe(testPrompt.content);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('create_prompt');
    });
    
    test('应拒绝使用无效数据创建提示词', async () => {
      const token = generateToken(testUser._id);
      
      const invalidPrompt = {
        content: '', // 内容为空
        platform: 'OpenAI'
        // 缺少response字段
      };
      
      const response = await api
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPrompt)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有提示词
      const promptsInDb = await Prompt.find({});
      expect(promptsInDb).toHaveLength(0);
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .post('/api/v1/prompts')
        .send(testPrompt)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有提示词
      const promptsInDb = await Prompt.find({});
      expect(promptsInDb).toHaveLength(0);
    });
  });
  
  describe('获取提示词列表', () => {
    beforeEach(async () => {
      // 创建多个测试提示词
      await Prompt.create([
        {
          content: '提示词1',
          response: '回答1',
          platform: 'OpenAI',
          url: 'https://chat.openai.com/1',
          user: testUser._id,
          tags: [testTag._id]
        },
        {
          content: '提示词2',
          response: '回答2',
          platform: 'DeepSeek',
          url: 'https://chat.deepseek.com/2',
          user: testUser._id,
          tags: [testTag._id]
        },
        {
          content: '提示词3',
          response: '回答3',
          platform: 'Moonshot',
          url: 'https://chat.moonshot.com/3',
          user: testUser._id,
          tags: []
        }
      ]);
    });
    
    test('应成功获取用户的所有提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(3);
      
      // 验证提示词数据
      const promptContents = response.body.data.prompts.map(prompt => prompt.content);
      expect(promptContents).toContain('提示词1');
      expect(promptContents).toContain('提示词2');
      expect(promptContents).toContain('提示词3');
    });
    
    test('应支持分页获取提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(2);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.pages).toBe(2);
    });
    
    test('应支持搜索提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts?search=提示词1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(1);
      expect(response.body.data.prompts[0].content).toBe('提示词1');
    });
    
    test('应支持按标签筛选提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get(`/api/v1/prompts?tag=${testTag._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(2);
      
      // 验证提示词数据
      const promptContents = response.body.data.prompts.map(prompt => prompt.content);
      expect(promptContents).toContain('提示词1');
      expect(promptContents).toContain('提示词2');
      expect(promptContents).not.toContain('提示词3');
    });
    
    test('应支持按平台筛选提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts?platform=OpenAI')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(1);
      expect(response.body.data.prompts[0].content).toBe('提示词1');
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get('/api/v1/prompts')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('获取单个提示词', () => {
    let promptId;
    
    beforeEach(async () => {
      // 创建测试提示词
      const prompt = await Prompt.create({
        content: testPrompt.content,
        response: testPrompt.response,
        platform: testPrompt.platform,
        url: testPrompt.url,
        user: testUser._id,
        tags: [testTag._id]
      });
      
      promptId = prompt._id;
    });
    
    test('应成功获取单个提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get(`/api/v1/prompts/${promptId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data.prompt.content).toBe(testPrompt.content);
      expect(response.body.data.prompt.response).toBe(testPrompt.response);
      expect(response.body.data.prompt.platform).toBe(testPrompt.platform);
      expect(response.body.data.prompt.url).toBe(testPrompt.url);
      expect(response.body.data.prompt.user.toString()).toBe(testUser._id.toString());
      expect(response.body.data.prompt.tags).toHaveLength(1);
      expect(response.body.data.prompt.tags[0].toString()).toBe(testTag._id.toString());
    });
    
    test('应返回404错误当提示词不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .get(`/api/v1/prompts/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get(`/api/v1/prompts/${promptId}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('更新提示词', () => {
    let promptId;
    
    beforeEach(async () => {
      // 创建测试提示词
      const prompt = await Prompt.create({
        content: testPrompt.content,
        response: testPrompt.response,
        platform: testPrompt.platform,
        url: testPrompt.url,
        user: testUser._id,
        tags: [testTag._id]
      });
      
      promptId = prompt._id;
    });
    
    test('应成功更新提示词', async () => {
      const token = generateToken(testUser._id);
      
      const updatedPrompt = {
        content: '更新后的提示词',
        response: '更新后的回答',
        platform: 'DeepSeek',
        url: 'https://chat.deepseek.com/updated',
        tags: []
      };
      
      const response = await api
        .put(`/api/v1/prompts/${promptId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPrompt)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data.prompt.content).toBe(updatedPrompt.content);
      expect(response.body.data.prompt.response).toBe(updatedPrompt.response);
      expect(response.body.data.prompt.platform).toBe(updatedPrompt.platform);
      expect(response.body.data.prompt.url).toBe(updatedPrompt.url);
      expect(response.body.data.prompt.tags).toHaveLength(0);
      
      // 验证数据库中的提示词是否已更新
      const updatedPromptInDb = await Prompt.findById(promptId);
      expect(updatedPromptInDb.content).toBe(updatedPrompt.content);
      expect(updatedPromptInDb.response).toBe(updatedPrompt.response);
      expect(updatedPromptInDb.platform).toBe(updatedPrompt.platform);
      expect(updatedPromptInDb.url).toBe(updatedPrompt.url);
      expect(updatedPromptInDb.tags).toHaveLength(0);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('update_prompt');
    });
    
    test('应支持部分更新提示词', async () => {
      const token = generateToken(testUser._id);
      
      const partialUpdate = {
        content: '部分更新的提示词'
      };
      
      const response = await api
        .put(`/api/v1/prompts/${promptId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(partialUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data.prompt.content).toBe(partialUpdate.content);
      expect(response.body.data.prompt.response).toBe(testPrompt.response);
      expect(response.body.data.prompt.platform).toBe(testPrompt.platform);
      expect(response.body.data.prompt.url).toBe(testPrompt.url);
      
      // 验证数据库中的提示词是否已部分更新
      const updatedPromptInDb = await Prompt.findById(promptId);
      expect(updatedPromptInDb.content).toBe(partialUpdate.content);
      expect(updatedPromptInDb.response).toBe(testPrompt.response);
      expect(updatedPromptInDb.platform).toBe(testPrompt.platform);
      expect(updatedPromptInDb.url).toBe(testPrompt.url);
    });
    
    test('应返回404错误当提示词不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const updatedPrompt = {
        content: '更新后的提示词'
      };
      
      const response = await api
        .put(`/api/v1/prompts/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPrompt)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const updatedPrompt = {
        content: '更新后的提示词'
      };
      
      const response = await api
        .put(`/api/v1/prompts/${promptId}`)
        .send(updatedPrompt)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('删除提示词', () => {
    let promptId;
    
    beforeEach(async () => {
      // 创建测试提示词
      const prompt = await Prompt.create({
        content: testPrompt.content,
        response: testPrompt.response,
        platform: testPrompt.platform,
        url: testPrompt.url,
        user: testUser._id,
        tags: [testTag._id]
      });
      
      promptId = prompt._id;
    });
    
    test('应成功删除提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .delete(`/api/v1/prompts/${promptId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      
      // 验证数据库中的提示词是否已删除
      const promptInDb = await Prompt.findById(promptId);
      expect(promptInDb).toBeNull();
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('delete_prompt');
    });
    
    test('应返回404错误当提示词不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .delete(`/api/v1/prompts/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .delete(`/api/v1/prompts/${promptId}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('自动保存提示词', () => {
    test('应成功自动保存提示词', async () => {
      const token = generateToken(testUser._id);
      
      const autoSaveData = {
        content: '自动保存的提示词',
        response: '自动保存的回答',
        platform: 'OpenAI',
        url: 'https://chat.openai.com/auto-save'
      };
      
      const response = await api
        .post('/api/v1/prompts/auto-save')
        .set('Authorization', `Bearer ${token}`)
        .send(autoSaveData)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data.prompt.content).toBe(autoSaveData.content);
      expect(response.body.data.prompt.response).toBe(autoSaveData.response);
      expect(response.body.data.prompt.platform).toBe(autoSaveData.platform);
      expect(response.body.data.prompt.url).toBe(autoSaveData.url);
      expect(response.body.data.prompt.user.toString()).toBe(testUser._id.toString());
      expect(response.body.data.prompt.isAutoSaved).toBe(true);
      
      // 验证提示词是否已保存到数据库
      const promptsInDb = await Prompt.find({});
      expect(promptsInDb).toHaveLength(1);
      expect(promptsInDb[0].content).toBe(autoSaveData.content);
      expect(promptsInDb[0].isAutoSaved).toBe(true);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('auto_save_prompt');
    });
    
    test('应防止重复自动保存相同内容的提示词', async () => {
      const token = generateToken(testUser._id);
      
      const autoSaveData = {
        content: '自动保存的提示词',
        response: '自动保存的回答',
        platform: 'OpenAI',
        url: 'https://chat.openai.com/auto-save'
      };
      
      // 先创建一个提示词
      await Prompt.create({
        ...autoSaveData,
        user: testUser._id,
        isAutoSaved: true,
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5分钟前创建
      });
      
      // 尝试自动保存相同内容的提示词
      const response = await api
        .post('/api/v1/prompts/auto-save')
        .set('Authorization', `Bearer ${token}`)
        .send(autoSaveData)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompt');
      expect(response.body.data).toHaveProperty('isDuplicate');
      expect(response.body.data.isDuplicate).toBe(true);
      
      // 验证数据库中仍然只有一个提示词
      const promptsInDb = await Prompt.find({});
      expect(promptsInDb).toHaveLength(1);
    });
    
    test('应拒绝未认证的请求', async () => {
      const autoSaveData = {
        content: '自动保存的提示词',
        response: '自动保存的回答',
        platform: 'OpenAI',
        url: 'https://chat.openai.com/auto-save'
      };
      
      const response = await api
        .post('/api/v1/prompts/auto-save')
        .send(autoSaveData)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有提示词
      const promptsInDb = await Prompt.find({});
      expect(promptsInDb).toHaveLength(0);
    });
  });
  
  describe('快速搜索提示词', () => {
    beforeEach(async () => {
      // 创建多个测试提示词
      await Prompt.create([
        {
          content: 'AI技术的发展',
          response: '关于AI技术发展的回答',
          platform: 'OpenAI',
          url: 'https://chat.openai.com/1',
          user: testUser._id,
          tags: [testTag._id],
          isFavorite: true
        },
        {
          content: '机器学习算法',
          response: '关于机器学习算法的回答',
          platform: 'DeepSeek',
          url: 'https://chat.deepseek.com/2',
          user: testUser._id,
          tags: [testTag._id],
          isFavorite: false
        },
        {
          content: '深度学习模型',
          response: '关于深度学习模型的回答',
          platform: 'Moonshot',
          url: 'https://chat.moonshot.com/3',
          user: testUser._id,
          tags: [],
          isFavorite: true
        }
      ]);
    });
    
    test('应成功快速搜索提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts/quick-search?query=AI')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(1);
      expect(response.body.data.prompts[0].content).toBe('AI技术的发展');
    });
    
    test('应按收藏状态和使用频率排序搜索结果', async () => {
      const token = generateToken(testUser._id);
      
      // 更新使用频率
      await Prompt.findOneAndUpdate(
        { content: '机器学习算法' },
        { $set: { useCount: 10 } }
      );
      
      await Prompt.findOneAndUpdate(
        { content: '深度学习模型' },
        { $set: { useCount: 5 } }
      );
      
      const response = await api
        .get('/api/v1/prompts/quick-search?query=学习')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(2);
      
      // 验证排序：收藏的应该排在前面，然后是使用频率高的
      expect(response.body.data.prompts[0].content).toBe('深度学习模型');
      expect(response.body.data.prompts[0].isFavorite).toBe(true);
      expect(response.body.data.prompts[1].content).toBe('机器学习算法');
      expect(response.body.data.prompts[1].isFavorite).toBe(false);
    });
    
    test('应限制返回结果数量', async () => {
      const token = generateToken(testUser._id);
      
      // 创建更多提示词
      await Prompt.create([
        {
          content: '学习方法1',
          response: '回答1',
          platform: 'OpenAI',
          user: testUser._id
        },
        {
          content: '学习方法2',
          response: '回答2',
          platform: 'OpenAI',
          user: testUser._id
        },
        {
          content: '学习方法3',
          response: '回答3',
          platform: 'OpenAI',
          user: testUser._id
        }
      ]);
      
      const response = await api
        .get('/api/v1/prompts/quick-search?query=学习&limit=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(3);
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get('/api/v1/prompts/quick-search?query=AI')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('批量获取提示词', () => {
    let promptIds = [];
    
    beforeEach(async () => {
      // 创建多个测试提示词
      const prompts = await Prompt.create([
        {
          content: '提示词1',
          response: '回答1',
          platform: 'OpenAI',
          user: testUser._id
        },
        {
          content: '提示词2',
          response: '回答2',
          platform: 'DeepSeek',
          user: testUser._id
        },
        {
          content: '提示词3',
          response: '回答3',
          platform: 'Moonshot',
          user: testUser._id
        }
      ]);
      
      promptIds = prompts.map(prompt => prompt._id.toString());
    });
    
    test('应成功批量获取提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .post('/api/v1/prompts/batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: promptIds })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(3);
      
      // 验证提示词数据
      const promptContents = response.body.data.prompts.map(prompt => prompt.content);
      expect(promptContents).toContain('提示词1');
      expect(promptContents).toContain('提示词2');
      expect(promptContents).toContain('提示词3');
    });
    
    test('应忽略不存在的提示词ID', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await api
        .post('/api/v1/prompts/batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [...promptIds, nonExistentId] })
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(3);
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .post('/api/v1/prompts/batch')
        .send({ ids: promptIds })
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('获取最近提示词', () => {
    beforeEach(async () => {
      // 创建多个测试提示词，设置不同的创建时间
      await Prompt.create([
        {
          content: '最新提示词',
          response: '回答1',
          platform: 'OpenAI',
          user: testUser._id,
          createdAt: new Date()
        },
        {
          content: '较新提示词',
          response: '回答2',
          platform: 'DeepSeek',
          user: testUser._id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
        },
        {
          content: '较旧提示词',
          response: '回答3',
          platform: 'Moonshot',
          user: testUser._id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
        }
      ]);
    });
    
    test('应成功获取最近提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts/recent')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(3);
      
      // 验证提示词按创建时间降序排序
      expect(response.body.data.prompts[0].content).toBe('最新提示词');
      expect(response.body.data.prompts[1].content).toBe('较新提示词');
      expect(response.body.data.prompts[2].content).toBe('较旧提示词');
    });
    
    test('应支持限制返回数量', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/prompts/recent?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(2);
      
      // 验证只返回最新的两条
      expect(response.body.data.prompts[0].content).toBe('最新提示词');
      expect(response.body.data.prompts[1].content).toBe('较新提示词');
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get('/api/v1/prompts/recent')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

describe('提示词标签管理', () => {
  let token;
  let promptId;
  let tagId;

  beforeEach(async () => {
    // 创建测试用户
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });

    token = registerResponse.body.data.token;

    // 创建测试提示词
    const promptResponse = await request(app)
      .post('/api/v1/prompts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '这是一个测试提示词',
        response: '这是测试回答',
        platform: 'test-platform'
      });

    promptId = promptResponse.body.data._id;

    // 创建测试标签
    const tagResponse = await request(app)
      .post('/api/v1/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '测试标签',
        color: '#FF5733'
      });

    tagId = tagResponse.body.data._id;
  });

  test('添加标签到提示词', async () => {
    const response = await request(app)
      .post(`/api/v1/prompts/${promptId}/tags`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tagId
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tags).toContain(tagId);
  });

  test('从提示词移除标签', async () => {
    // 先添加标签
    await request(app)
      .post(`/api/v1/prompts/${promptId}/tags`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tagId
      });

    // 然后移除标签
    const response = await request(app)
      .delete(`/api/v1/prompts/${promptId}/tags/${tagId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tags).not.toContain(tagId);
  });

  test('通过标签筛选提示词', async () => {
    // 创建第二个提示词
    const promptResponse2 = await request(app)
      .post('/api/v1/prompts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '第二个测试提示词',
        response: '第二个测试回答',
        platform: 'test-platform'
      });

    const promptId2 = promptResponse2.body.data._id;

    // 给第一个提示词添加标签
    await request(app)
      .post(`/api/v1/prompts/${promptId}/tags`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tagId
      });

    // 通过标签筛选提示词
    const response = await request(app)
      .get(`/api/v1/prompts?tag=${tagId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]._id).toBe(promptId);
  });
});

describe('提示词收藏功能', () => {
  let token;
  let promptId;

  beforeEach(async () => {
    // 创建测试用户
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });

    token = registerResponse.body.data.token;

    // 创建测试提示词
    const promptResponse = await request(app)
      .post('/api/v1/prompts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '这是一个测试提示词',
        response: '这是测试回答',
        platform: 'test-platform'
      });

    promptId = promptResponse.body.data._id;
  });

  test('收藏提示词', async () => {
    const response = await request(app)
      .patch(`/api/v1/prompts/${promptId}/favorite`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isFavorite).toBe(true);
  });

  test('取消收藏提示词', async () => {
    // 先收藏提示词
    await request(app)
      .patch(`/api/v1/prompts/${promptId}/favorite`)
      .set('Authorization', `Bearer ${token}`);

    // 然后取消收藏
    const response = await request(app)
      .patch(`/api/v1/prompts/${promptId}/unfavorite`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isFavorite).toBe(false);
  });

  test('获取收藏的提示词', async () => {
    // 创建第二个提示词
    const promptResponse2 = await request(app)
      .post('/api/v1/prompts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '第二个测试提示词',
        response: '第二个测试回答',
        platform: 'test-platform'
      });

    const promptId2 = promptResponse2.body.data._id;

    // 收藏第一个提示词
    await request(app)
      .patch(`/api/v1/prompts/${promptId}/favorite`)
      .set('Authorization', `Bearer ${token}`);

    // 获取收藏的提示词
    const response = await request(app)
      .get('/api/v1/prompts?favorite=true')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]._id).toBe(promptId);
  });
}); 