const request = require('supertest');
const app = require('../app');
const { Prompt, Tag } = require('../models');
const { setupTestUser } = require('./setup');
const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const promptController = require('../controllers/promptController');

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

describe('提示词控制器单元测试', () => {
  let req, res, next;
  
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 创建请求和响应对象
    req = mockRequest({
      user: {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com'
      }
    });
    
    res = mockResponse();
    next = jest.fn();
  });
  
  describe('createPrompt', () => {
    it('应成功创建提示词', async () => {
      // 设置请求体
      req.body = {
        content: '这是一个测试提示词',
        tags: ['测试', '示例'],
        platform: 'web',
        url: 'https://example.com'
      };
      
      // 模拟数据
      const mockPrompt = {
        _id: new mongoose.Types.ObjectId(),
        user: req.user._id,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 设置模拟函数返回值
      Prompt.create.mockResolvedValue(mockPrompt);
      
      // 调用控制器方法
      await promptController.createPrompt(req, res, next);
      
      // 验证结果
      expect(Prompt.create).toHaveBeenCalledWith({
        user: req.user._id,
        ...req.body
      });
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompt: mockPrompt }
      });
    });
    
    it('应处理创建提示词时的错误', async () => {
      // 设置请求体
      req.body = {
        content: '这是一个测试提示词'
      };
      
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      Prompt.create.mockRejectedValue(error);
      
      // 调用控制器方法
      await promptController.createPrompt(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getPrompts', () => {
    it('应成功获取提示词列表', async () => {
      // 模拟数据
      const mockPrompts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          content: '提示词1',
          tags: ['测试'],
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          content: '提示词2',
          tags: ['示例'],
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      Prompt.find.mockResolvedValue(mockPrompts);
      
      // 调用控制器方法
      await promptController.getPrompts(req, res, next);
      
      // 验证结果
      expect(Prompt.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompts: mockPrompts }
      });
    });
    
    it('应支持分页和排序', async () => {
      // 设置请求查询参数
      req.query = {
        page: '2',
        limit: '10',
        sort: '-createdAt'
      };
      
      // 模拟数据
      const mockPrompts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          content: '提示词1',
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockPrompts)
      };
      Prompt.find.mockReturnValue(mockQuery);
      
      // 调用控制器方法
      await promptController.getPrompts(req, res, next);
      
      // 验证结果
      expect(Prompt.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompts: mockPrompts }
      });
    });
  });
  
  describe('getPrompt', () => {
    it('应成功获取单个提示词', async () => {
      // 设置请求参数
      const promptId = new mongoose.Types.ObjectId();
      req.params = { id: promptId };
      
      // 模拟数据
      const mockPrompt = {
        _id: promptId,
        user: req.user._id,
        content: '测试提示词',
        tags: ['测试'],
        createdAt: new Date()
      };
      
      // 设置模拟函数返回值
      Prompt.findById.mockResolvedValue(mockPrompt);
      
      // 调用控制器方法
      await promptController.getPrompt(req, res, next);
      
      // 验证结果
      expect(Prompt.findById).toHaveBeenCalledWith(promptId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompt: mockPrompt }
      });
    });
    
    it('应处理提示词不存在的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 设置模拟函数返回值
      Prompt.findById.mockResolvedValue(null);
      
      // 调用控制器方法
      await promptController.getPrompt(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('searchPrompts', () => {
    it('应成功搜索提示词', async () => {
      // 设置请求查询参数
      req.query = {
        keyword: '测试',
        tags: ['示例']
      };
      
      // 模拟数据
      const mockPrompts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          content: '测试提示词',
          tags: ['示例'],
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      Prompt.aggregate.mockResolvedValue(mockPrompts);
      
      // 调用控制器方法
      await promptController.searchPrompts(req, res, next);
      
      // 验证结果
      expect(Prompt.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompts: mockPrompts }
      });
    });
  });
  
  describe('batchGetPrompts', () => {
    it('应成功批量获取提示词', async () => {
      // 设置请求体
      const promptIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];
      req.body = { ids: promptIds };
      
      // 模拟数据
      const mockPrompts = promptIds.map(id => ({
        _id: id,
        user: req.user._id,
        content: '测试提示词',
        createdAt: new Date()
      }));
      
      // 设置模拟函数返回值
      Prompt.find.mockResolvedValue(mockPrompts);
      
      // 调用控制器方法
      await promptController.batchGetPrompts(req, res, next);
      
      // 验证结果
      expect(Prompt.find).toHaveBeenCalledWith({
        _id: { $in: promptIds },
        user: req.user._id
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompts: mockPrompts }
      });
    });
  });
}); 