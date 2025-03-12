/**
 * 标签管理功能集成测试
 */

const mongoose = require('mongoose');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Tag = require('../models/Tag');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let mongoServer;
let api;

// 测试用户数据
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

// 测试标签数据
const testTag = {
  name: 'TestTag',
  color: '#3498db'
};

// 更新标签数据
const updatedTag = {
  name: 'UpdatedTag',
  color: '#e74c3c'
};

beforeAll(async () => {
  // 设置内存MongoDB服务器
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // 连接到内存数据库
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // 创建API测试客户端
  api = supertest(app);
});

afterAll(async () => {
  // 断开数据库连接并停止MongoDB服务器
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // 清空数据库集合
  await User.deleteMany({});
  await Tag.deleteMany({});
  await ActivityLog.deleteMany({});
  
  // 创建测试用户
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await User.create({
    _id: testUser._id,
    username: testUser.username,
    email: testUser.email,
    password: hashedPassword
  });
});

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
};

describe('标签管理集成测试', () => {
  describe('创建标签', () => {
    test('应成功创建新标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(testTag)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tag');
      expect(response.body.data.tag.name).toBe(testTag.name);
      expect(response.body.data.tag.color).toBe(testTag.color);
      expect(response.body.data.tag.user.toString()).toBe(testUser._id.toString());
      
      // 验证标签是否已保存到数据库
      const tagsInDb = await Tag.find({});
      expect(tagsInDb).toHaveLength(1);
      expect(tagsInDb[0].name).toBe(testTag.name);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('create_tag');
    });
    
    test('应拒绝使用已存在的标签名创建', async () => {
      const token = generateToken(testUser._id);
      
      // 先创建一个标签
      await Tag.create({
        name: testTag.name,
        color: testTag.color,
        user: testUser._id
      });
      
      // 尝试使用相同的标签名创建
      const response = await api
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(testTag)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中仍然只有一个标签
      const tagsInDb = await Tag.find({});
      expect(tagsInDb).toHaveLength(1);
    });
    
    test('应拒绝使用无效数据创建标签', async () => {
      const token = generateToken(testUser._id);
      
      const invalidTag = {
        name: '', // 名称为空
        color: 'invalid-color' // 无效的颜色格式
      };
      
      const response = await api
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidTag)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有标签
      const tagsInDb = await Tag.find({});
      expect(tagsInDb).toHaveLength(0);
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .post('/api/v1/tags')
        .send(testTag)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有标签
      const tagsInDb = await Tag.find({});
      expect(tagsInDb).toHaveLength(0);
    });
  });
  
  describe('获取标签列表', () => {
    beforeEach(async () => {
      // 创建多个测试标签
      await Tag.create([
        {
          name: 'Tag1',
          color: '#3498db',
          user: testUser._id
        },
        {
          name: 'Tag2',
          color: '#e74c3c',
          user: testUser._id
        },
        {
          name: 'Tag3',
          color: '#2ecc71',
          user: testUser._id
        }
      ]);
    });
    
    test('应成功获取用户的所有标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/tags')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data.tags).toHaveLength(3);
      
      // 验证标签数据
      const tagNames = response.body.data.tags.map(tag => tag.name);
      expect(tagNames).toContain('Tag1');
      expect(tagNames).toContain('Tag2');
      expect(tagNames).toContain('Tag3');
    });
    
    test('应支持分页获取标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/tags?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data.tags).toHaveLength(2);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.pages).toBe(2);
    });
    
    test('应支持搜索标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/tags?search=Tag1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data.tags).toHaveLength(1);
      expect(response.body.data.tags[0].name).toBe('Tag1');
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get('/api/v1/tags')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('获取单个标签', () => {
    let tagId;
    
    beforeEach(async () => {
      // 创建测试标签
      const tag = await Tag.create({
        name: testTag.name,
        color: testTag.color,
        user: testUser._id
      });
      
      tagId = tag._id;
    });
    
    test('应成功获取单个标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tag');
      expect(response.body.data.tag.name).toBe(testTag.name);
      expect(response.body.data.tag.color).toBe(testTag.color);
      expect(response.body.data.tag.user.toString()).toBe(testUser._id.toString());
    });
    
    test('应返回404错误当标签不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .get(`/api/v1/tags/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get(`/api/v1/tags/${tagId}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('更新标签', () => {
    let tagId;
    
    beforeEach(async () => {
      // 创建测试标签
      const tag = await Tag.create({
        name: testTag.name,
        color: testTag.color,
        user: testUser._id
      });
      
      tagId = tag._id;
    });
    
    test('应成功更新标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .put(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTag)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tag');
      expect(response.body.data.tag.name).toBe(updatedTag.name);
      expect(response.body.data.tag.color).toBe(updatedTag.color);
      
      // 验证数据库中的标签是否已更新
      const updatedTagInDb = await Tag.findById(tagId);
      expect(updatedTagInDb.name).toBe(updatedTag.name);
      expect(updatedTagInDb.color).toBe(updatedTag.color);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('update_tag');
    });
    
    test('应拒绝使用已存在的标签名更新', async () => {
      const token = generateToken(testUser._id);
      
      // 创建另一个标签
      await Tag.create({
        name: updatedTag.name,
        color: '#9b59b6',
        user: testUser._id
      });
      
      const response = await api
        .put(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTag)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中的标签未更新
      const tagInDb = await Tag.findById(tagId);
      expect(tagInDb.name).toBe(testTag.name);
      expect(tagInDb.color).toBe(testTag.color);
    });
    
    test('应返回404错误当标签不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .put(`/api/v1/tags/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTag)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .put(`/api/v1/tags/${tagId}`)
        .send(updatedTag)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('删除标签', () => {
    let tagId;
    
    beforeEach(async () => {
      // 创建测试标签
      const tag = await Tag.create({
        name: testTag.name,
        color: testTag.color,
        user: testUser._id
      });
      
      tagId = tag._id;
    });
    
    test('应成功删除标签', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .delete(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      
      // 验证数据库中的标签是否已删除
      const tagInDb = await Tag.findById(tagId);
      expect(tagInDb).toBeNull();
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('delete_tag');
    });
    
    test('应返回404错误当标签不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .delete(`/api/v1/tags/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .delete(`/api/v1/tags/${tagId}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('获取标签关联的提示词', () => {
    let tagId;
    
    beforeEach(async () => {
      // 创建测试标签
      const tag = await Tag.create({
        name: testTag.name,
        color: testTag.color,
        user: testUser._id
      });
      
      tagId = tag._id;
      
      // 创建关联的提示词
      await mongoose.connection.collection('prompts').insertMany([
        {
          content: 'Prompt 1',
          user: testUser._id,
          tags: [tagId],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          content: 'Prompt 2',
          user: testUser._id,
          tags: [tagId],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    });
    
    test('应成功获取标签关联的提示词', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get(`/api/v1/tags/${tagId}/prompts`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prompts');
      expect(response.body.data.prompts).toHaveLength(2);
      
      // 验证提示词数据
      const promptContents = response.body.data.prompts.map(prompt => prompt.content);
      expect(promptContents).toContain('Prompt 1');
      expect(promptContents).toContain('Prompt 2');
    });
    
    test('应返回404错误当标签不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .get(`/api/v1/tags/${nonExistentId}/prompts`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get(`/api/v1/tags/${tagId}/prompts`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 