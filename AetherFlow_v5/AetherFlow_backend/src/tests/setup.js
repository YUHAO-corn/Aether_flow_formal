const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1d';
process.env.ENCRYPTION_KEY = '01234567890123456789012345678901'; // 32字节密钥
process.env.MONGODB_URI = 'mongodb://localhost:27017/aetherflow_test';

let mongoServer;

// 在所有测试之前运行
beforeAll(async () => {
  // 创建内存MongoDB服务器
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // 连接到内存数据库
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('已连接到内存MongoDB服务器');
});

// 在所有测试之后运行
afterAll(async () => {
  // 断开数据库连接
  await mongoose.disconnect();
  
  // 停止MongoDB服务器
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('已断开内存MongoDB服务器连接');
});

// 在每个测试之前清空数据库
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// 创建测试用户和JWT令牌的辅助函数
global.createTestUser = async (User, userData = {}) => {
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
};

// 禁用控制台日志输出
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}; 