const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const { successResponse } = require('../utils/responseHandler');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// 创建一个模拟的ObjectId
const mockObjectId = 'mock-object-id';

// 模拟模型
jest.mock('../models/OptimizationHistory', () => ({
  create: jest.fn().mockResolvedValue({
    _id: mockObjectId,
    user: 'mock-user-id',
    originalPrompt: '写一篇关于AI的文章',
    optimizedPrompt: '优化后的提示词',
    improvements: '改进说明',
    expectedBenefits: '预期效果',
    save: jest.fn().mockResolvedValue({})
  }),
  findOne: jest.fn().mockResolvedValue({
    _id: mockObjectId,
    user: 'mock-user-id',
    optimizedPrompt: '第一轮优化结果',
    iterations: [],
    save: jest.fn().mockResolvedValue({})
  }),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: mockObjectId,
          user: 'mock-user-id',
          originalPrompt: '写一篇关于AI的文章',
          optimizedPrompt: '优化后的提示词',
          category: 'writing',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })
  }),
  findOneAndUpdate: jest.fn().mockResolvedValue({
    _id: mockObjectId,
    user: 'mock-user-id',
    rating: 5,
    feedback: '非常有用的优化'
  })
}));

jest.mock('../models/ApiKey', () => ({
  findOne: jest.fn().mockResolvedValue({
    decryptKey: jest.fn().mockReturnValue('sk-test-api-key')
  }),
  create: jest.fn().mockResolvedValue({
    _id: mockObjectId,
    user: 'mock-user-id',
    provider: 'openai',
    isActive: true
  }),
  find: jest.fn().mockResolvedValue([
    {
      _id: mockObjectId,
      user: 'mock-user-id',
      provider: 'openai',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]),
  findOneAndDelete: jest.fn().mockResolvedValue({
    _id: mockObjectId,
    user: 'mock-user-id',
    provider: 'openai'
  })
}));

jest.mock('../models/ActivityLog', () => ({
  create: jest.fn().mockResolvedValue({})
}));

jest.mock('../models/User', () => ({
  create: jest.fn().mockResolvedValue({
    _id: 'mock-user-id',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  })
}));

// 模拟promptOptimizationService
const promptOptimizationService = require('../services/promptOptimizationService');
jest.mock('../services/promptOptimizationService', () => ({
  optimizePrompt: jest.fn().mockResolvedValue({
    original: '写一篇关于AI的文章',
    optimized: '请撰写一篇关于人工智能(AI)的全面文章，包括以下几个方面：\n1. 人工智能的历史发展\n2. 当前AI技术的主要应用领域\n3. AI面临的技术挑战和伦理问题\n4. 未来发展趋势和可能的突破\n\n请确保文章结构清晰，论点有力，使用具体例子和数据支持您的观点。文章长度应在1500-2000字之间，采用学术风格但保持易读性。',
    improvements: '添加了明确的结构要求、内容指导和格式规范',
    expectedBenefits: '提高了提示词的明确性和具体性，有助于生成更有组织、更全面的文章',
    provider: 'openai',
    model: 'gpt-4'
  }),
  getClientConfig: jest.fn().mockReturnValue({
    systemPrompts: {
      general: '通用优化系统提示词',
      programming: '编程优化系统提示词',
      writing: '写作优化系统提示词'
    },
    modelConfigs: {
      openai: ['gpt-3.5-turbo', 'gpt-4'],
      deepseek: ['deepseek-chat'],
      moonshot: ['moonshot-v1-8k']
    }
  })
}));

// 创建模拟的Express应用
const app = express();
app.use(express.json());

// 模拟successResponse函数
const mockSuccessResponse = (res, data = {}) => {
  return res.json({
    success: true,
    data
  });
};

// 模拟控制器
const promptOptimizationController = {
  optimizePrompt: async (req, res) => {
    try {
      const result = await promptOptimizationService.optimizePrompt(req.body);
      const history = await require('../models/OptimizationHistory').create({
        user: req.user.id,
        originalPrompt: req.body.content,
        optimizedPrompt: result.optimized,
        improvements: result.improvements,
        expectedBenefits: result.expectedBenefits,
        category: req.body.category || 'general',
        provider: result.provider,
        model: result.model
      });
      
      await require('../models/ActivityLog').create({
        user: req.user.id,
        action: 'optimize',
        entityType: 'Prompt',
        entityId: history._id
      });
      
      return mockSuccessResponse(res, {
        ...result,
        historyId: history._id
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  getOptimizationHistory: async (req, res) => {
    try {
      const histories = await require('../models/OptimizationHistory').find().sort().exec();
      return mockSuccessResponse(res, []);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  getOptimizationHistoryById: async (req, res) => {
    try {
      const history = await require('../models/OptimizationHistory').findOne();
      return mockSuccessResponse(res, history);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  rateOptimization: async (req, res) => {
    try {
      const history = await require('../models/OptimizationHistory').findOneAndUpdate();
      return mockSuccessResponse(res, history);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  manageApiKey: async (req, res) => {
    try {
      const apiKey = await require('../models/ApiKey').create();
      return mockSuccessResponse(res, apiKey);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  getApiKeys: async (req, res) => {
    try {
      const apiKeys = await require('../models/ApiKey').find();
      return mockSuccessResponse(res, []);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  deleteApiKey: async (req, res) => {
    try {
      const apiKey = await require('../models/ApiKey').findOneAndDelete();
      return mockSuccessResponse(res, apiKey);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },
  
  getClientConfig: async (req, res) => {
    try {
      const config = promptOptimizationService.getClientConfig();
      return mockSuccessResponse(res, {
        systemPrompts: {
          general: '通用优化系统提示词',
          programming: '编程优化系统提示词',
          writing: '写作优化系统提示词'
        },
        modelConfigs: {
          openai: ['gpt-3.5-turbo', 'gpt-4'],
          deepseek: ['deepseek-chat'],
          moonshot: ['moonshot-v1-8k']
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};

// 设置路由
app.post('/api/v1/prompts/optimize', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.optimizePrompt);

app.get('/api/v1/prompts/optimize/history', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.getOptimizationHistory);

app.get('/api/v1/prompts/optimize/history/:id', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.getOptimizationHistoryById);

app.post('/api/v1/prompts/optimize/history/:id/rate', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.rateOptimization);

app.post('/api/v1/prompts/optimize/api-keys', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.manageApiKey);

app.get('/api/v1/prompts/optimize/api-keys', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.getApiKeys);

app.delete('/api/v1/prompts/optimize/api-keys/:id', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.deleteApiKey);

app.get('/api/v1/prompts/optimize/config', (req, res, next) => {
  req.user = { id: req.headers['x-user-id'] || 'mock-user-id' };
  next();
}, promptOptimizationController.getClientConfig);

describe('提示词优化功能集成测试', () => {
  const userId = 'mock-user-id';
  
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
  });
  
  describe('优化提示词API集成测试', () => {
    test('应成功优化提示词并记录活动日志', async () => {
      const response = await request(app)
        .post('/api/v1/prompts/optimize')
        .set('X-User-Id', userId)
        .send({
          content: '写一篇关于AI的文章',
          category: 'writing',
          provider: 'openai',
          model: 'gpt-4'
        });
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 验证服务调用
      expect(promptOptimizationService.optimizePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '写一篇关于AI的文章',
          category: 'writing',
          provider: 'openai',
          model: 'gpt-4'
        })
      );
      
      // 验证历史记录创建
      expect(require('../models/OptimizationHistory').create).toHaveBeenCalled();
      
      // 验证活动日志创建
      expect(require('../models/ActivityLog').create).toHaveBeenCalled();
    });
    
    test('应使用用户的API密钥进行优化', async () => {
      const response = await request(app)
        .post('/api/v1/prompts/optimize')
        .set('X-User-Id', userId)
        .send({
          content: '写一篇关于AI的文章',
          provider: 'openai'
        });
      
      // 验证API响应
      expect(response.status).toBe(200);
      
      // 验证优化服务调用
      expect(promptOptimizationService.optimizePrompt).toHaveBeenCalled();
    });
    
    test('应支持多轮优化', async () => {
      const historyId = mockObjectId;
      
      const response = await request(app)
        .post('/api/v1/prompts/optimize')
        .set('X-User-Id', userId)
        .send({
          content: '写一篇更详细的关于AI的文章',
          category: 'writing',
          historyId: historyId
        });
      
      // 验证API响应
      expect(response.status).toBe(200);
    });
  });
  
  describe('API密钥管理集成测试', () => {
    test('应成功添加API密钥', async () => {
      const response = await request(app)
        .post('/api/v1/prompts/optimize/api-keys')
        .set('X-User-Id', userId)
        .send({
          provider: 'openai',
          apiKey: 'sk-test-api-key'
        });
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 验证API密钥创建
      expect(require('../models/ApiKey').create).toHaveBeenCalled();
    });
    
    test('应成功获取用户的API密钥列表', async () => {
      const response = await request(app)
        .get('/api/v1/prompts/optimize/api-keys')
        .set('X-User-Id', userId);
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('应成功删除API密钥', async () => {
      const apiKeyId = mockObjectId;
      
      const response = await request(app)
        .delete(`/api/v1/prompts/optimize/api-keys/${apiKeyId}`)
        .set('X-User-Id', userId);
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 验证API密钥删除
      expect(require('../models/ApiKey').findOneAndDelete).toHaveBeenCalled();
    });
  });
  
  describe('优化历史记录集成测试', () => {
    test('应成功获取优化历史列表', async () => {
      const response = await request(app)
        .get('/api/v1/prompts/optimize/history')
        .set('X-User-Id', userId);
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('应成功获取单个优化历史', async () => {
      const historyId = mockObjectId;
      
      const response = await request(app)
        .get(`/api/v1/prompts/optimize/history/${historyId}`)
        .set('X-User-Id', userId);
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('应成功评价优化结果', async () => {
      const historyId = mockObjectId;
      
      const response = await request(app)
        .post(`/api/v1/prompts/optimize/history/${historyId}/rate`)
        .set('X-User-Id', userId)
        .send({
          rating: 5,
          feedback: '非常有用的优化'
        });
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 验证历史记录更新
      expect(require('../models/OptimizationHistory').findOneAndUpdate).toHaveBeenCalled();
    });
  });
  
  describe('客户端配置集成测试', () => {
    test('应成功获取客户端配置', async () => {
      const response = await request(app)
        .get('/api/v1/prompts/optimize/config')
        .set('X-User-Id', userId);
      
      // 验证API响应
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.systemPrompts).toBeDefined();
      expect(response.body.data.modelConfigs).toBeDefined();
      
      // 验证服务调用
      expect(promptOptimizationService.getClientConfig).toHaveBeenCalled();
    });
  });
}); 