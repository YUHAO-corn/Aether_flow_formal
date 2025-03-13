const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1d';
process.env.ENCRYPTION_KEY = '01234567890123456789012345678901'; // 32字节密钥

let mongod;

// 数据库连接函数
module.exports.connect = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('已成功连接到测试数据库');
  } catch (error) {
    console.error('连接测试数据库失败:', error);
    throw error;
  }
};

// 清空数据库
module.exports.clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } catch (error) {
    console.error('清空数据库失败:', error);
    throw error;
  }
};

// 关闭数据库连接
module.exports.closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('已成功关闭测试数据库连接');
  } catch (error) {
    console.error('关闭数据库失败:', error);
    throw error;
  }
};

// 设置全局测试超时时间
jest.setTimeout(120000);

// 创建测试用户和JWT令牌的辅助函数
global.createTestUser = async (userData = {}) => {
  try {
    const defaultUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@123456'
    };
    
    const user = await User.create({
      ...defaultUser,
      ...userData
    });
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    return { user, token };
  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
};

// 禁用控制台日志输出（保留错误日志）
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error
  };
} 