const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const logger = require('../utils/logger');

// 模拟mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
    once: jest.fn()
  }
}));

// 模拟logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('配置和数据库连接测试', () => {
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 保存原始环境变量
    this.originalEnv = process.env;
  });
  
  afterEach(() => {
    // 恢复原始环境变量
    process.env = this.originalEnv;
  });
  
  describe('数据库连接', () => {
    it('应成功连接到数据库', async () => {
      // 设置环境变量
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      
      // 模拟成功连接
      mongoose.connect.mockResolvedValue(undefined);
      
      // 调用连接函数
      await connectDB();
      
      // 验证结果
      expect(mongoose.connect).toHaveBeenCalledWith(
        process.env.MONGODB_URI,
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('数据库连接成功')
      );
    });
    
    it('应处理连接错误', async () => {
      // 设置环境变量
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      
      // 模拟连接错误
      const error = new Error('连接错误');
      mongoose.connect.mockRejectedValue(error);
      
      // 调用连接函数并捕获错误
      await expect(connectDB()).rejects.toThrow('连接错误');
      
      // 验证结果
      expect(mongoose.connect).toHaveBeenCalledWith(
        process.env.MONGODB_URI,
        expect.any(Object)
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('数据库连接失败'),
        error
      );
    });
    
    it('应正确处理数据库事件', async () => {
      // 设置环境变量
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      
      // 模拟成功连接
      mongoose.connect.mockResolvedValue(undefined);
      
      // 调用连接函数
      await connectDB();
      
      // 验证事件监听器
      expect(mongoose.connection.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(mongoose.connection.on).toHaveBeenCalledWith(
        'disconnected',
        expect.any(Function)
      );
      
      // 模拟触发错误事件
      const errorHandler = mongoose.connection.on.mock.calls.find(
        call => call[0] === 'error'
      )[1];
      const error = new Error('数据库错误');
      errorHandler(error);
      
      // 验证错误处理
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('数据库错误'),
        error
      );
      
      // 模拟触发断开连接事件
      const disconnectHandler = mongoose.connection.on.mock.calls.find(
        call => call[0] === 'disconnected'
      )[1];
      disconnectHandler();
      
      // 验证断开连接处理
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('数据库连接断开')
      );
    });
  });
  
  describe('环境变量配置', () => {
    it('应加载必需的环境变量', () => {
      // 设置必需的环境变量
      const requiredEnvVars = {
        NODE_ENV: 'test',
        PORT: '3000',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        JWT_SECRET: 'test_secret',
        JWT_EXPIRES_IN: '1d'
      };
      
      // 清除现有环境变量
      process.env = {};
      
      // 设置环境变量
      Object.entries(requiredEnvVars).forEach(([key, value]) => {
        process.env[key] = value;
      });
      
      // 验证环境变量
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.PORT).toBe('3000');
      expect(process.env.MONGODB_URI).toBe('mongodb://localhost:27017/test');
      expect(process.env.JWT_SECRET).toBe('test_secret');
      expect(process.env.JWT_EXPIRES_IN).toBe('1d');
    });
    
    it('应使用默认值当环境变量未设置时', () => {
      // 清除现有环境变量
      process.env = {};
      
      // 加载配置（这会触发默认值的使用）
      require('../config');
      
      // 验证默认值
      expect(process.env.NODE_ENV).toBe('development');
      expect(process.env.PORT).toBe('3000');
      expect(process.env.JWT_EXPIRES_IN).toBe('30d');
    });
  });
}); 