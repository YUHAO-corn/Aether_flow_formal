const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const Tag = require('../models/Tag');
const Prompt = require('../models/Prompt');
const ActivityLog = require('../models/ActivityLog');
const tagController = require('../controllers/tagController');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

// 模拟Tag模型
jest.mock('../models/Tag', () => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  };
});

// 模拟Prompt模型
jest.mock('../models/Prompt', () => {
  return {
    find: jest.fn(),
    aggregate: jest.fn()
  };
});

// 模拟ActivityLog模型
jest.mock('../models/ActivityLog', () => {
  return {
    create: jest.fn()
  };
});

// 模拟logger
jest.mock('../utils/logger', () => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };
});

describe('标签控制器单元测试', () => {
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
  
  describe('createTag', () => {
    it('应成功创建标签', async () => {
      // 设置请求体
      req.body = {
        name: '测试标签',
        color: '#FF0000',
        description: '这是一个测试标签'
      };
      
      // 模拟数据
      const mockTag = {
        _id: new mongoose.Types.ObjectId(),
        user: req.user._id,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 设置模拟函数返回值
      Tag.create.mockResolvedValue(mockTag);
      
      // 调用控制器方法
      await tagController.createTag(req, res, next);
      
      // 验证结果
      expect(Tag.create).toHaveBeenCalledWith({
        user: req.user._id,
        ...req.body
      });
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { tag: mockTag }
      });
    });
    
    it('应处理创建标签时的错误', async () => {
      // 设置请求体
      req.body = {
        name: '测试标签'
      };
      
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      Tag.create.mockRejectedValue(error);
      
      // 调用控制器方法
      await tagController.createTag(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getTags', () => {
    it('应成功获取标签列表', async () => {
      // 模拟数据
      const mockTags = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          name: '标签1',
          color: '#FF0000',
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          name: '标签2',
          color: '#00FF00',
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      Tag.find.mockResolvedValue(mockTags);
      
      // 调用控制器方法
      await tagController.getTags(req, res, next);
      
      // 验证结果
      expect(Tag.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { tags: mockTags }
      });
    });
    
    it('应处理获取标签列表时的错误', async () => {
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      Tag.find.mockRejectedValue(error);
      
      // 调用控制器方法
      await tagController.getTags(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getTag', () => {
    it('应成功获取单个标签', async () => {
      // 设置请求参数
      const tagId = new mongoose.Types.ObjectId();
      req.params = { id: tagId };
      
      // 模拟数据
      const mockTag = {
        _id: tagId,
        user: req.user._id,
        name: '测试标签',
        color: '#FF0000',
        createdAt: new Date()
      };
      
      // 设置模拟函数返回值
      Tag.findById.mockResolvedValue(mockTag);
      
      // 调用控制器方法
      await tagController.getTag(req, res, next);
      
      // 验证结果
      expect(Tag.findById).toHaveBeenCalledWith(tagId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { tag: mockTag }
      });
    });
    
    it('应处理标签不存在的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 设置模拟函数返回值
      Tag.findById.mockResolvedValue(null);
      
      // 调用控制器方法
      await tagController.getTag(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('updateTag', () => {
    it('应成功更新标签', async () => {
      // 设置请求参数和请求体
      req.params = { id: new mongoose.Types.ObjectId() };
      req.body = {
        name: '更新后的标签',
        color: '#0000FF'
      };
      
      // 模拟数据
      const mockTag = {
        _id: req.params.id,
        user: req.user._id,
        name: '测试标签',
        color: '#FF0000'
      };
      
      const updatedTag = {
        ...mockTag,
        ...req.body
      };
      
      // 设置模拟函数返回值
      Tag.findById.mockResolvedValue(mockTag);
      Tag.findByIdAndUpdate.mockResolvedValue(updatedTag);
      
      // 调用控制器方法
      await tagController.updateTag(req, res, next);
      
      // 验证结果
      expect(Tag.findById).toHaveBeenCalledWith(req.params.id);
      expect(Tag.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { tag: updatedTag }
      });
    });
  });
  
  describe('deleteTag', () => {
    it('应成功删除标签', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 模拟数据
      const mockTag = {
        _id: req.params.id,
        user: req.user._id,
        name: '测试标签'
      };
      
      // 设置模拟函数返回值
      Tag.findById.mockResolvedValue(mockTag);
      Tag.findByIdAndDelete.mockResolvedValue(mockTag);
      
      // 调用控制器方法
      await tagController.deleteTag(req, res, next);
      
      // 验证结果
      expect(Tag.findById).toHaveBeenCalledWith(req.params.id);
      expect(Tag.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });
  });
  
  describe('getTagPrompts', () => {
    it('应成功获取标签关联的提示词', async () => {
      // 设置请求参数
      const tagId = new mongoose.Types.ObjectId();
      req.params = { id: tagId };
      
      // 模拟数据
      const mockPrompts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          content: '提示词1',
          tags: [tagId],
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          content: '提示词2',
          tags: [tagId],
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      Prompt.find.mockResolvedValue(mockPrompts);
      
      // 调用控制器方法
      await tagController.getTagPrompts(req, res, next);
      
      // 验证结果
      expect(Prompt.find).toHaveBeenCalledWith({
        user: req.user._id,
        tags: tagId
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompts: mockPrompts }
      });
    });
  });
});

let token;
let userId;
let tagId;

beforeAll(async () => {
  // 创建测试用户
  const userData = {
    name: 'Test User',
    email: 'tagtest@example.com',
    password: 'password123'
  };
  
  const userResponse = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);
  
  token = userResponse.body.data.token;
  userId = userResponse.body.data.user._id;
  
  // 创建测试标签
  const tagData = {
    name: 'Test Tag',
    color: '#ff0000'
  };
  
  const tagResponse = await request(app)
    .post('/api/v1/tags')
    .set('Authorization', `Bearer ${token}`)
    .send(tagData);
  
  tagId = tagResponse.body.data._id;
  
  // 创建测试提示词并关联标签
  const promptData = {
    title: 'Test Prompt',
    content: 'This is a test prompt',
    tags: [tagId]
  };
  
  await request(app)
    .post('/api/v1/prompts')
    .set('Authorization', `Bearer ${token}`)
    .send(promptData);
});

afterAll(async () => {
  // 清理测试数据
  await Tag.deleteMany({ user: userId });
  await Prompt.deleteMany({ user: userId });
  await User.deleteMany({ email: 'tagtest@example.com' });
  await mongoose.connection.close();
});

describe('Tag API', () => {
  describe('GET /api/v1/tags', () => {
    it('should get all tags', async () => {
      const res = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/v1/tags/:id', () => {
    it('should get a tag by id', async () => {
      const res = await request(app)
        .get(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(tagId);
    });
  });
  
  describe('GET /api/v1/tags/statistics', () => {
    it('should get tag statistics', async () => {
      const res = await request(app)
        .get('/api/v1/tags/statistics')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalTags');
      expect(res.body.data).toHaveProperty('tagsWithPrompts');
      expect(res.body.data).toHaveProperty('mostUsedTags');
      expect(res.body.data).toHaveProperty('recentlyCreatedTags');
      expect(res.body.data).toHaveProperty('promptDistribution');
      
      // 验证统计数据
      expect(res.body.data.totalTags).toBeGreaterThan(0);
      expect(res.body.data.tagsWithPrompts).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.mostUsedTags)).toBe(true);
      expect(Array.isArray(res.body.data.recentlyCreatedTags)).toBe(true);
      expect(Array.isArray(res.body.data.promptDistribution)).toBe(true);
    });
  });
}); 