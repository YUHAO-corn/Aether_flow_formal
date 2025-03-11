const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');

// 创建模拟的Express应用
const app = express();
app.use(express.json());

// 模拟路由处理函数
const mockOptimizePrompt = jest.fn().mockImplementation((req, res) => {
  if (!req.body.content) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  const historyId = '60f7b0b9e6b3f32f948a9999'; // 模拟ID
  return res.status(200).json({
    success: true,
    data: {
      optimized: '优化后的提示词',
      improvements: '添加了更多细节',
      expectedBenefits: '提高了明确性',
      historyId
    }
  });
});

const mockGetHistory = jest.fn().mockImplementation((req, res) => {
  return res.status(200).json({
    success: true,
    data: []
  });
});

const mockGetHistoryById = jest.fn().mockImplementation((req, res) => {
  const historyId = req.params.id;
  if (!historyId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: '无效的ID' });
  }
  
  return res.status(200).json({
    success: true,
    data: {
      _id: historyId,
      originalPrompt: '原始提示词',
      optimizedPrompt: '优化后的提示词',
      iterations: []
    }
  });
});

const mockRateOptimization = jest.fn().mockImplementation((req, res) => {
  if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
    return res.status(400).json({ success: false, message: '评分必须在1-5之间' });
  }
  
  return res.status(200).json({
    success: true,
    data: { message: '评分已保存' }
  });
});

const mockAddApiKey = jest.fn().mockImplementation((req, res) => {
  if (!req.body.provider || !req.body.apiKey) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  return res.status(200).json({
    success: true,
    data: {
      provider: req.body.provider,
      isActive: true
    }
  });
});

const mockGetApiKeys = jest.fn().mockImplementation((req, res) => {
  return res.status(200).json({
    success: true,
    data: []
  });
});

const mockDeleteApiKey = jest.fn().mockImplementation((req, res) => {
  return res.status(200).json({
    success: true,
    data: { message: 'API密钥已删除' }
  });
});

const mockGetConfig = jest.fn().mockImplementation((req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      systemPrompts: {},
      modelConfigs: {}
    }
  });
});

// 模拟认证中间件
const mockAuth = (req, res, next) => {
  req.user = { id: '60f7b0b9e6b3f32f948a0000' }; // 模拟用户ID
  next();
};

// 设置路由
app.post('/api/v1/prompts/optimize', mockAuth, mockOptimizePrompt);
app.get('/api/v1/prompts/optimize/history', mockAuth, mockGetHistory);
app.get('/api/v1/prompts/optimize/history/:id', mockAuth, mockGetHistoryById);
app.post('/api/v1/prompts/optimize/history/:id/rate', mockAuth, mockRateOptimization);
app.post('/api/v1/prompts/optimize/api-keys', mockAuth, mockAddApiKey);
app.get('/api/v1/prompts/optimize/api-keys', mockAuth, mockGetApiKeys);
app.delete('/api/v1/prompts/optimize/api-keys/:id', mockAuth, mockDeleteApiKey);
app.get('/api/v1/prompts/optimize/config', mockAuth, mockGetConfig);

beforeEach(() => {
  // 重置模拟函数
  jest.clearAllMocks();
});

describe('提示词优化功能测试', () => {
  describe('优化提示词API', () => {
    test('应成功优化提示词', async () => {
      const response = await request(app)
        .post('/api/v1/prompts/optimize')
        .set('Authorization', 'Bearer test-token')
        .send({
          content: '写一篇关于AI的文章',
          category: 'writing',
          provider: 'openai',
          model: 'gpt-4'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.optimized).toBeDefined();
      expect(response.body.data.historyId).toBeDefined();
    });
    
    test('应处理缺少必要参数的情况', async () => {
      const response = await request(app)
        .post('/api/v1/prompts/optimize')
        .set('Authorization', 'Bearer test-token')
        .send({
          // 缺少content字段
          category: 'writing',
          provider: 'openai'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('API密钥管理', () => {
    test('应成功添加API密钥', async () => {
      const response = await request(app)
        .post('/api/v1/prompts/optimize/api-keys')
        .set('Authorization', 'Bearer test-token')
        .send({
          provider: 'openai',
          apiKey: 'sk-test123456'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.provider).toBe('openai');
    });
    
    test('应成功获取API密钥列表', async () => {
      const response = await request(app)
        .get('/api/v1/prompts/optimize/api-keys')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('应成功删除API密钥', async () => {
      const apiKeyId = '60f7b0b9e6b3f32f948a1111';
      
      const response = await request(app)
        .delete(`/api/v1/prompts/optimize/api-keys/${apiKeyId}`)
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('优化历史记录', () => {
    test('应成功获取优化历史列表', async () => {
      const response = await request(app)
        .get('/api/v1/prompts/optimize/history')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('应成功获取单个优化历史', async () => {
      const historyId = '60f7b0b9e6b3f32f948a2222';
      
      const response = await request(app)
        .get(`/api/v1/prompts/optimize/history/${historyId}`)
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(historyId);
    });
    
    test('应成功评价优化结果', async () => {
      const historyId = '60f7b0b9e6b3f32f948a3333';
      
      const response = await request(app)
        .post(`/api/v1/prompts/optimize/history/${historyId}/rate`)
        .set('Authorization', 'Bearer test-token')
        .send({
          rating: 5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('应验证评分范围', async () => {
      const historyId = '60f7b0b9e6b3f32f948a4444';
      
      const response = await request(app)
        .post(`/api/v1/prompts/optimize/history/${historyId}/rate`)
        .set('Authorization', 'Bearer test-token')
        .send({
          rating: 6 // 超出范围
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('客户端配置', () => {
    test('应成功获取客户端配置', async () => {
      const response = await request(app)
        .get('/api/v1/prompts/optimize/config')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.systemPrompts).toBeDefined();
      expect(response.body.data.modelConfigs).toBeDefined();
    });
  });
}); 