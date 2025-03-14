/**
 * 标签统计API测试
 * 使用mongodb-memory-server在内存中创建MongoDB实例进行测试
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

// 创建内存MongoDB实例
let mongoServer;

// 在所有测试之前启动内存MongoDB服务器
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // 连接到内存数据库
  await mongoose.connect(uri);
  
  // 模拟用户认证中间件
  jest.spyOn(require('../middlewares/auth'), 'protect').mockImplementation((req, res, next) => {
    req.user = { _id: mongoose.Types.ObjectId(), name: 'Test User' };
    return next();
  });
});

// 在所有测试之后关闭连接和服务器
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// 每个测试之前清理数据库
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('标签统计API测试', () => {
  test('获取标签统计信息', async () => {
    // 创建测试数据
    const Tag = mongoose.model('Tag');
    const Prompt = mongoose.model('Prompt');
    const User = mongoose.model('User');
    
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    const tag = await Tag.create({
      name: '测试标签',
      color: '#FF0000',
      user: user._id
    });
    
    await Prompt.create({
      title: '测试提示词',
      content: '这是一个测试提示词',
      tags: [tag._id],
      user: user._id
    });
    
    const response = await request(app)
      .get('/api/v1/tags/statistics')
      .set('Authorization', 'Bearer test-token');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    
    // 验证返回的数据结构
    const stats = response.body.data;
    expect(stats.totalTags).toBeDefined();
    expect(stats.tagsWithPrompts).toBeDefined();
    expect(stats.mostUsedTags).toBeDefined();
    expect(stats.recentlyCreatedTags).toBeDefined();
    expect(stats.promptDistribution).toBeDefined();
    
    // 验证数据正确性
    expect(stats.totalTags).toBeGreaterThanOrEqual(1);
    expect(stats.tagsWithPrompts).toBeGreaterThanOrEqual(1);
  });
  
  test('未授权访问标签统计', async () => {
    // 修改模拟中间件以拒绝未授权请求
    jest.spyOn(require('../middlewares/auth'), 'protect').mockImplementationOnce((req, res, next) => {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    });
    
    const response = await request(app)
      .get('/api/v1/tags/statistics');
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
}); 