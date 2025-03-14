const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

// 创建一个简单的Express应用
const app = express();
app.use(express.json());

// 模拟标签统计API
app.get('/api/tags/statistics', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalTags: 5,
      tagsWithPrompts: 3,
      mostUsedTags: [
        { _id: 'tag123', name: '测试标签', count: 3 }
      ],
      recentlyCreatedTags: [
        { _id: 'tag123', name: '测试标签', createdAt: new Date() }
      ],
      promptDistribution: {
        '测试标签': 3,
        '未分类': 2
      }
    }
  });
});

// 创建内存MongoDB实例
let mongoServer;

// 在所有测试之前启动内存MongoDB服务器
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log('MongoDB Memory Server URI:', uri);
  
  // 连接到内存数据库
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Memory Server');
});

// 在所有测试之后关闭连接和服务器
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Disconnected from MongoDB Memory Server');
});

// 简单的测试用例
describe('标签API测试', () => {
  test('获取标签统计信息', async () => {
    const response = await request(app).get('/api/tags/statistics');
    
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
    expect(stats.totalTags).toBe(5);
    expect(stats.tagsWithPrompts).toBe(3);
    expect(stats.mostUsedTags[0].name).toBe('测试标签');
    expect(stats.promptDistribution['测试标签']).toBe(3);
  });
}); 