const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const Conversation = require('../models/Conversation');
const Prompt = require('../models/Prompt');
const ActivityLog = require('../models/ActivityLog');
const conversationController = require('../controllers/conversationController');

// 模拟Conversation模型
jest.mock('../models/Conversation', () => {
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

describe('对话控制器单元测试', () => {
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
  
  describe('createConversation', () => {
    it('应成功创建对话', async () => {
      // 设置请求体
      req.body = {
        title: '测试对话',
        description: '这是一个测试对话',
        prompts: [
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId()
        ]
      };
      
      // 模拟数据
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(),
        user: req.user._id,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 设置模拟函数返回值
      Conversation.create.mockResolvedValue(mockConversation);
      
      // 调用控制器方法
      await conversationController.createConversation(req, res, next);
      
      // 验证结果
      expect(Conversation.create).toHaveBeenCalledWith({
        user: req.user._id,
        ...req.body
      });
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { conversation: mockConversation }
      });
    });
    
    it('应处理创建对话时的错误', async () => {
      // 设置请求体
      req.body = {
        title: '测试对话'
      };
      
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      Conversation.create.mockRejectedValue(error);
      
      // 调用控制器方法
      await conversationController.createConversation(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getConversations', () => {
    it('应成功获取对话列表', async () => {
      // 模拟数据
      const mockConversations = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          title: '对话1',
          description: '描述1',
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          title: '对话2',
          description: '描述2',
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      Conversation.find.mockResolvedValue(mockConversations);
      
      // 调用控制器方法
      await conversationController.getConversations(req, res, next);
      
      // 验证结果
      expect(Conversation.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { conversations: mockConversations }
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
      const mockConversations = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          title: '对话1',
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockConversations)
      };
      Conversation.find.mockReturnValue(mockQuery);
      
      // 调用控制器方法
      await conversationController.getConversations(req, res, next);
      
      // 验证结果
      expect(Conversation.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { conversations: mockConversations }
      });
    });
  });
  
  describe('getConversation', () => {
    it('应成功获取单个对话', async () => {
      // 设置请求参数
      const conversationId = new mongoose.Types.ObjectId();
      req.params = { id: conversationId };
      
      // 模拟数据
      const mockConversation = {
        _id: conversationId,
        user: req.user._id,
        title: '测试对话',
        description: '描述',
        createdAt: new Date()
      };
      
      // 设置模拟函数返回值
      Conversation.findById.mockResolvedValue(mockConversation);
      
      // 调用控制器方法
      await conversationController.getConversation(req, res, next);
      
      // 验证结果
      expect(Conversation.findById).toHaveBeenCalledWith(conversationId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { conversation: mockConversation }
      });
    });
    
    it('应处理对话不存在的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 设置模拟函数返回值
      Conversation.findById.mockResolvedValue(null);
      
      // 调用控制器方法
      await conversationController.getConversation(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('updateConversation', () => {
    it('应成功更新对话', async () => {
      // 设置请求参数和请求体
      req.params = { id: new mongoose.Types.ObjectId() };
      req.body = {
        title: '更新后的对话',
        description: '更新后的描述'
      };
      
      // 模拟数据
      const mockConversation = {
        _id: req.params.id,
        user: req.user._id,
        title: '测试对话',
        description: '描述'
      };
      
      const updatedConversation = {
        ...mockConversation,
        ...req.body
      };
      
      // 设置模拟函数返回值
      Conversation.findById.mockResolvedValue(mockConversation);
      Conversation.findByIdAndUpdate.mockResolvedValue(updatedConversation);
      
      // 调用控制器方法
      await conversationController.updateConversation(req, res, next);
      
      // 验证结果
      expect(Conversation.findById).toHaveBeenCalledWith(req.params.id);
      expect(Conversation.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { conversation: updatedConversation }
      });
    });
  });
  
  describe('deleteConversation', () => {
    it('应成功删除对话', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 模拟数据
      const mockConversation = {
        _id: req.params.id,
        user: req.user._id,
        title: '测试对话'
      };
      
      // 设置模拟函数返回值
      Conversation.findById.mockResolvedValue(mockConversation);
      Conversation.findByIdAndDelete.mockResolvedValue(mockConversation);
      
      // 调用控制器方法
      await conversationController.deleteConversation(req, res, next);
      
      // 验证结果
      expect(Conversation.findById).toHaveBeenCalledWith(req.params.id);
      expect(Conversation.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });
  });
  
  describe('getConversationPrompts', () => {
    it('应成功获取对话关联的提示词', async () => {
      // 设置请求参数
      const conversationId = new mongoose.Types.ObjectId();
      req.params = { id: conversationId };
      
      // 模拟数据
      const mockConversation = {
        _id: conversationId,
        user: req.user._id,
        title: '测试对话',
        prompts: [
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId()
        ]
      };
      
      const mockPrompts = mockConversation.prompts.map(id => ({
        _id: id,
        user: req.user._id,
        content: '提示词',
        createdAt: new Date()
      }));
      
      // 设置模拟函数返回值
      Conversation.findById.mockResolvedValue(mockConversation);
      Prompt.find.mockResolvedValue(mockPrompts);
      
      // 调用控制器方法
      await conversationController.getConversationPrompts(req, res, next);
      
      // 验证结果
      expect(Conversation.findById).toHaveBeenCalledWith(conversationId);
      expect(Prompt.find).toHaveBeenCalledWith({
        _id: { $in: mockConversation.prompts }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { prompts: mockPrompts }
      });
    });
  });
}); 