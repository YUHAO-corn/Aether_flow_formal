const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const ApiKey = require('../models/ApiKey');
const ActivityLog = require('../models/ActivityLog');
const apiKeyController = require('../controllers/apiKeyController');
const crypto = require('crypto');

// 模拟加密方法，避免使用真实的加密函数
const mockEncryptKey = (apiKey) => {
  const iv = crypto.randomBytes(16);
  const encryptedKey = 'mock-encrypted-key';
  return { encryptedKey, iv: iv.toString('hex') };
};

// 模拟ApiKey模型的静态方法
jest.mock('../models/ApiKey', () => {
  const mockApiKeyModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    encryptKey: jest.fn(key => mockEncryptKey(key)),
    decryptKey: jest.fn(() => 'decrypted-key')
  };
  return mockApiKeyModel;
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

describe('API密钥控制器单元测试', () => {
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
  
  describe('getApiKeys', () => {
    it('应成功获取API密钥列表', async () => {
      // 模拟数据
      const mockApiKeys = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          provider: 'openai',
          name: 'OpenAI Key',
          baseUrl: 'https://api.openai.com',
          modelName: 'gpt-4',
          isActive: true,
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      ApiKey.find.mockResolvedValue(mockApiKeys);
      
      // 调用控制器方法
      await apiKeyController.getApiKeys(req, res, next);
      
      // 验证结果
      expect(ApiKey.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { apiKeys: mockApiKeys }
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('应根据提供商筛选API密钥', async () => {
      // 设置请求查询参数
      req.query = { provider: 'openai' };
      
      // 模拟数据
      const mockApiKeys = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: req.user._id,
          provider: 'openai',
          name: 'OpenAI Key',
          baseUrl: 'https://api.openai.com',
          modelName: 'gpt-4',
          isActive: true,
          createdAt: new Date()
        }
      ];
      
      // 设置模拟函数返回值
      ApiKey.find.mockResolvedValue(mockApiKeys);
      
      // 调用控制器方法
      await apiKeyController.getApiKeys(req, res, next);
      
      // 验证结果
      expect(ApiKey.find).toHaveBeenCalledWith({ 
        user: req.user._id,
        provider: 'openai'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { apiKeys: mockApiKeys }
      });
    });
    
    it('应处理获取API密钥时的错误', async () => {
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      ApiKey.find.mockRejectedValue(error);
      
      // 调用控制器方法
      await apiKeyController.getApiKeys(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
  
  describe('validateApiKey', () => {
    it('应成功验证API密钥', async () => {
      // 设置请求体
      req.body = {
        provider: 'openai',
        key: 'sk-test123456',
        baseUrl: 'https://api.openai.com'
      };
      
      // 模拟验证成功
      const mockValidationResult = { valid: true, message: '验证成功' };
      
      // 设置模拟函数返回值
      ApiKey.validateExternalApiKey = jest.fn().mockResolvedValue(mockValidationResult);
      
      // 调用控制器方法
      await apiKeyController.validateApiKey(req, res, next);
      
      // 验证结果
      expect(ApiKey.validateExternalApiKey).toHaveBeenCalledWith(
        req.body.provider,
        req.body.key,
        req.body.baseUrl
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockValidationResult
      });
    });
    
    it('应处理验证API密钥时的错误', async () => {
      // 设置请求体
      req.body = {
        provider: 'openai',
        key: 'sk-test123456',
        baseUrl: 'https://api.openai.com'
      };
      
      // 设置模拟函数抛出错误
      const error = new Error('验证失败');
      ApiKey.validateExternalApiKey = jest.fn().mockRejectedValue(error);
      
      // 调用控制器方法
      await apiKeyController.validateApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('deleteApiKey', () => {
    it('应成功删除API密钥', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 模拟数据
      const mockApiKey = {
        _id: req.params.id,
        user: req.user._id,
        provider: 'openai',
        name: 'OpenAI Key'
      };
      
      // 设置模拟函数返回值
      ApiKey.findById.mockResolvedValue(mockApiKey);
      ApiKey.findByIdAndDelete.mockResolvedValue(mockApiKey);
      
      // 调用控制器方法
      await apiKeyController.deleteApiKey(req, res, next);
      
      // 验证结果
      expect(ApiKey.findById).toHaveBeenCalledWith(req.params.id);
      expect(ApiKey.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });
    
    it('应处理API密钥不存在的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 设置模拟函数返回值
      ApiKey.findById.mockResolvedValue(null);
      
      // 调用控制器方法
      await apiKeyController.deleteApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(ApiKey.findByIdAndDelete).not.toHaveBeenCalled();
    });
    
    it('应处理用户无权删除API密钥的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 模拟数据 - 不同用户的API密钥
      const mockApiKey = {
        _id: req.params.id,
        user: new mongoose.Types.ObjectId(), // 不同的用户ID
        provider: 'openai',
        name: 'OpenAI Key'
      };
      
      // 设置模拟函数返回值
      ApiKey.findById.mockResolvedValue(mockApiKey);
      
      // 调用控制器方法
      await apiKeyController.deleteApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(ApiKey.findByIdAndDelete).not.toHaveBeenCalled();
    });
    
    it('应处理删除API密钥时的错误', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      ApiKey.findById.mockRejectedValue(error);
      
      // 调用控制器方法
      await apiKeyController.deleteApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('updateApiKey', () => {
    it('应成功更新API密钥', async () => {
      // 设置请求参数和请求体
      req.params = { id: new mongoose.Types.ObjectId() };
      req.body = {
        name: 'Updated Key Name',
        baseUrl: 'https://api.updated.com',
        modelName: 'gpt-5',
        isActive: false
      };
      
      // 模拟数据
      const mockApiKey = {
        _id: req.params.id,
        user: req.user._id,
        provider: 'openai',
        name: 'OpenAI Key',
        baseUrl: 'https://api.openai.com',
        modelName: 'gpt-4',
        isActive: true
      };
      
      const updatedApiKey = {
        ...mockApiKey,
        ...req.body
      };
      
      // 设置模拟函数返回值
      ApiKey.findById.mockResolvedValue(mockApiKey);
      ApiKey.findByIdAndUpdate.mockResolvedValue(updatedApiKey);
      
      // 调用控制器方法
      await apiKeyController.updateApiKey(req, res, next);
      
      // 验证结果
      expect(ApiKey.findById).toHaveBeenCalledWith(req.params.id);
      expect(ApiKey.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { apiKey: updatedApiKey }
      });
    });
    
    it('应处理API密钥不存在的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      req.body = { name: 'Updated Key Name' };
      
      // 设置模拟函数返回值
      ApiKey.findById.mockResolvedValue(null);
      
      // 调用控制器方法
      await apiKeyController.updateApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(ApiKey.findByIdAndUpdate).not.toHaveBeenCalled();
    });
    
    it('应处理用户无权更新API密钥的情况', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      req.body = { name: 'Updated Key Name' };
      
      // 模拟数据 - 不同用户的API密钥
      const mockApiKey = {
        _id: req.params.id,
        user: new mongoose.Types.ObjectId(), // 不同的用户ID
        provider: 'openai',
        name: 'OpenAI Key'
      };
      
      // 设置模拟函数返回值
      ApiKey.findById.mockResolvedValue(mockApiKey);
      
      // 调用控制器方法
      await apiKeyController.updateApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(ApiKey.findByIdAndUpdate).not.toHaveBeenCalled();
    });
    
    it('应处理更新API密钥时的错误', async () => {
      // 设置请求参数
      req.params = { id: new mongoose.Types.ObjectId() };
      req.body = { name: 'Updated Key Name' };
      
      // 设置模拟函数抛出错误
      const error = new Error('数据库错误');
      ApiKey.findById.mockRejectedValue(error);
      
      // 调用控制器方法
      await apiKeyController.updateApiKey(req, res, next);
      
      // 验证结果
      expect(next).toHaveBeenCalledWith(error);
    });
  });
}); 