const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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
describe('MongoDB Memory Server', () => {
  test('should connect to MongoDB Memory Server', async () => {
    // 创建一个简单的模型
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String
    }));
    
    // 创建一个文档
    const testDoc = await TestModel.create({ name: '测试文档' });
    console.log('Created document:', testDoc);
    
    // 查询文档
    const foundDoc = await TestModel.findById(testDoc._id);
    console.log('Found document:', foundDoc);
    
    // 验证文档
    expect(foundDoc.name).toBe('测试文档');
  });
}); 