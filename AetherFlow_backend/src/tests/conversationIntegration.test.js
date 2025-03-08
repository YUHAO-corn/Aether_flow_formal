/**
 * 会话管理功能集成测试
 */

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 使用全局测试环境设置
require('./setup');

let api;

// 测试用户数据
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

// 测试会话数据
const testConversation = {
  title: 'AI讨论',
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: '什么是人工智能？'
    },
    {
      role: 'assistant',
      content: '人工智能是指由人创造的、模拟人类智能的系统...'
    }
  ]
};

// 测试标签数据
const testTags = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId()
];

beforeAll(() => {
  // 创建API测试客户端
  api = supertest(app);
});

beforeEach(async () => {
  // 清空数据库集合
  await User.deleteMany({});
  await Conversation.deleteMany({});
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

describe('会话管理集成测试', () => {
  describe('创建会话', () => {
    test('应成功创建新会话', async () => {
      const token = generateToken(testUser._id);
      
      const conversationData = {
        ...testConversation,
        tags: testTags
      };
      
      const response = await api
        .post('/api/v1/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send(conversationData)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversation');
      expect(response.body.data.conversation.title).toBe(testConversation.title);
      expect(response.body.data.conversation.model).toBe(testConversation.model);
      expect(response.body.data.conversation.messages).toHaveLength(2);
      expect(response.body.data.conversation.user.toString()).toBe(testUser._id.toString());
      expect(response.body.data.conversation.tags).toHaveLength(2);
      
      // 验证会话是否已保存到数据库
      const conversationsInDb = await Conversation.find({});
      expect(conversationsInDb).toHaveLength(1);
      expect(conversationsInDb[0].title).toBe(testConversation.title);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('create_conversation');
    });
    
    test('应拒绝使用无效数据创建会话', async () => {
      const token = generateToken(testUser._id);
      
      const invalidConversation = {
        // 缺少title和model字段
        messages: []
      };
      
      const response = await api
        .post('/api/v1/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidConversation)
        .expect(400)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有会话
      const conversationsInDb = await Conversation.find({});
      expect(conversationsInDb).toHaveLength(0);
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .post('/api/v1/conversations')
        .send(testConversation)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      
      // 验证数据库中没有会话
      const conversationsInDb = await Conversation.find({});
      expect(conversationsInDb).toHaveLength(0);
    });
  });
  
  describe('获取会话列表', () => {
    beforeEach(async () => {
      // 创建多个测试会话
      await Conversation.create([
        {
          title: '会话1',
          model: 'gpt-4',
          messages: [
            { role: 'user', content: '问题1' },
            { role: 'assistant', content: '回答1' }
          ],
          user: testUser._id,
          tags: [testTags[0]]
        },
        {
          title: '会话2',
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: '问题2' },
            { role: 'assistant', content: '回答2' }
          ],
          user: testUser._id,
          tags: [testTags[1]]
        },
        {
          title: '会话3',
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: '问题3' },
            { role: 'assistant', content: '回答3' }
          ],
          user: testUser._id,
          tags: []
        }
      ]);
    });
    
    test('应成功获取用户的所有会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/conversations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversations');
      expect(response.body.data.conversations).toHaveLength(3);
      
      // 验证会话数据
      const conversationTitles = response.body.data.conversations.map(conversation => conversation.title);
      expect(conversationTitles).toContain('会话1');
      expect(conversationTitles).toContain('会话2');
      expect(conversationTitles).toContain('会话3');
    });
    
    test('应支持分页获取会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/conversations?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversations');
      expect(response.body.data.conversations).toHaveLength(2);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.pages).toBe(2);
    });
    
    test('应支持搜索会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/conversations?search=会话1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversations');
      expect(response.body.data.conversations).toHaveLength(1);
      expect(response.body.data.conversations[0].title).toBe('会话1');
    });
    
    test('应支持按标签筛选会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get(`/api/v1/conversations?tag=${testTags[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversations');
      expect(response.body.data.conversations).toHaveLength(1);
      expect(response.body.data.conversations[0].title).toBe('会话1');
    });
    
    test('应支持按模型筛选会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get('/api/v1/conversations?model=gpt-4')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversations');
      expect(response.body.data.conversations).toHaveLength(1);
      expect(response.body.data.conversations[0].title).toBe('会话1');
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get('/api/v1/conversations')
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('获取单个会话', () => {
    let conversationId;
    
    beforeEach(async () => {
      // 创建测试会话
      const conversation = await Conversation.create({
        title: testConversation.title,
        model: testConversation.model,
        messages: testConversation.messages,
        user: testUser._id,
        tags: testTags
      });
      
      conversationId = conversation._id;
    });
    
    test('应成功获取单个会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .get(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversation');
      expect(response.body.data.conversation.title).toBe(testConversation.title);
      expect(response.body.data.conversation.model).toBe(testConversation.model);
      expect(response.body.data.conversation.messages).toHaveLength(2);
      expect(response.body.data.conversation.user.toString()).toBe(testUser._id.toString());
      expect(response.body.data.conversation.tags).toHaveLength(2);
    });
    
    test('应返回404错误当会话不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .get(`/api/v1/conversations/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .get(`/api/v1/conversations/${conversationId}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('更新会话', () => {
    let conversationId;
    
    beforeEach(async () => {
      // 创建测试会话
      const conversation = await Conversation.create({
        title: testConversation.title,
        model: testConversation.model,
        messages: testConversation.messages,
        user: testUser._id,
        tags: testTags
      });
      
      conversationId = conversation._id;
    });
    
    test('应成功更新会话', async () => {
      const token = generateToken(testUser._id);
      
      const updatedConversation = {
        title: '更新后的会话标题',
        tags: [testTags[0]] // 只保留一个标签
      };
      
      const response = await api
        .put(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedConversation)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversation');
      expect(response.body.data.conversation.title).toBe(updatedConversation.title);
      expect(response.body.data.conversation.model).toBe(testConversation.model); // 未更新的字段保持不变
      expect(response.body.data.conversation.tags).toHaveLength(1);
      
      // 验证数据库中的会话是否已更新
      const updatedConversationInDb = await Conversation.findById(conversationId);
      expect(updatedConversationInDb.title).toBe(updatedConversation.title);
      expect(updatedConversationInDb.tags).toHaveLength(1);
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('update_conversation');
    });
    
    test('应返回404错误当会话不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const updatedConversation = {
        title: '更新后的会话标题'
      };
      
      const response = await api
        .put(`/api/v1/conversations/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedConversation)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const updatedConversation = {
        title: '更新后的会话标题'
      };
      
      const response = await api
        .put(`/api/v1/conversations/${conversationId}`)
        .send(updatedConversation)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('删除会话', () => {
    let conversationId;
    
    beforeEach(async () => {
      // 创建测试会话
      const conversation = await Conversation.create({
        title: testConversation.title,
        model: testConversation.model,
        messages: testConversation.messages,
        user: testUser._id,
        tags: testTags
      });
      
      conversationId = conversation._id;
    });
    
    test('应成功删除会话', async () => {
      const token = generateToken(testUser._id);
      
      const response = await api
        .delete(`/api/v1/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      
      // 验证数据库中的会话是否已删除
      const conversationInDb = await Conversation.findById(conversationId);
      expect(conversationInDb).toBeNull();
      
      // 验证活动日志是否已记录
      const activityLogs = await ActivityLog.find({});
      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0].action).toBe('delete_conversation');
    });
    
    test('应返回404错误当会话不存在', async () => {
      const token = generateToken(testUser._id);
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await api
        .delete(`/api/v1/conversations/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('应拒绝未认证的请求', async () => {
      const response = await api
        .delete(`/api/v1/conversations/${conversationId}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('会话消息管理', () => {
    let conversationId;
    
    beforeEach(async () => {
      // 创建测试会话
      const conversation = await Conversation.create({
        title: testConversation.title,
        model: testConversation.model,
        messages: testConversation.messages,
        user: testUser._id,
        tags: testTags
      });
      
      conversationId = conversation._id;
    });
    
    describe('添加消息', () => {
      test('应成功添加新消息到会话', async () => {
        const token = generateToken(testUser._id);
        
        const newMessage = {
          role: 'user',
          content: '这是一条新的测试消息'
        };
        
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .send(newMessage)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('conversation');
        expect(response.body.data.conversation.messages).toHaveLength(3); // 原有2条消息 + 新增1条
        expect(response.body.data.conversation.messages[2].role).toBe(newMessage.role);
        expect(response.body.data.conversation.messages[2].content).toBe(newMessage.content);
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.messages).toHaveLength(3);
        expect(updatedConversation.messages[2].role).toBe(newMessage.role);
        expect(updatedConversation.messages[2].content).toBe(newMessage.content);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('add_message');
      });
      
      test('应拒绝添加无效消息', async () => {
        const token = generateToken(testUser._id);
        
        const invalidMessage = {
          // 缺少必要的role字段
          content: '这是一条无效消息'
        };
        
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .send(invalidMessage)
          .expect(400)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
        
        // 验证数据库中的会话未被更新
        const conversation = await Conversation.findById(conversationId);
        expect(conversation.messages).toHaveLength(2); // 仍然只有原来的2条消息
      });
      
      test('应返回404错误当会话不存在', async () => {
        const token = generateToken(testUser._id);
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const newMessage = {
          role: 'user',
          content: '这是一条测试消息'
        };
        
        const response = await api
          .post(`/api/v1/conversations/${nonExistentId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .send(newMessage)
          .expect(404)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应拒绝未认证的请求', async () => {
        const newMessage = {
          role: 'user',
          content: '这是一条测试消息'
        };
        
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/messages`)
          .send(newMessage)
          .expect(401)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
    
    describe('获取消息历史', () => {
      test('应成功获取会话的消息历史', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .get(`/api/v1/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('messages');
        expect(response.body.data.messages).toHaveLength(2);
        expect(response.body.data.messages[0].role).toBe(testConversation.messages[0].role);
        expect(response.body.data.messages[0].content).toBe(testConversation.messages[0].content);
        expect(response.body.data.messages[1].role).toBe(testConversation.messages[1].role);
        expect(response.body.data.messages[1].content).toBe(testConversation.messages[1].content);
      });
      
      test('应支持分页获取消息历史', async () => {
        const token = generateToken(testUser._id);
        
        // 先添加多条消息
        const conversation = await Conversation.findById(conversationId);
        for (let i = 0; i < 10; i++) {
          conversation.messages.push({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `测试消息 ${i + 1}`
          });
        }
        await conversation.save();
        
        // 获取第一页消息（限制5条）
        const response1 = await api
          .get(`/api/v1/conversations/${conversationId}/messages?page=1&limit=5`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response1.body.success).toBe(true);
        expect(response1.body.data).toHaveProperty('messages');
        expect(response1.body.data.messages).toHaveLength(5);
        expect(response1.body.data).toHaveProperty('pagination');
        expect(response1.body.data.pagination.totalMessages).toBe(12); // 原有2条 + 新增10条
        expect(response1.body.data.pagination.totalPages).toBe(3);
        expect(response1.body.data.pagination.currentPage).toBe(1);
        
        // 获取第二页消息
        const response2 = await api
          .get(`/api/v1/conversations/${conversationId}/messages?page=2&limit=5`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response2.body.success).toBe(true);
        expect(response2.body.data).toHaveProperty('messages');
        expect(response2.body.data.messages).toHaveLength(5);
        expect(response2.body.data.pagination.currentPage).toBe(2);
      });
      
      test('应返回404错误当会话不存在', async () => {
        const token = generateToken(testUser._id);
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const response = await api
          .get(`/api/v1/conversations/${nonExistentId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应拒绝未认证的请求', async () => {
        const response = await api
          .get(`/api/v1/conversations/${conversationId}/messages`)
          .expect(401)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
    
    describe('清空会话', () => {
      test('应成功清空会话消息', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .delete(`/api/v1/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('message');
        expect(response.body.data.message).toContain('已清空');
        
        // 验证数据库中的会话消息是否已清空
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.messages).toHaveLength(0);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('clear_messages');
      });
      
      test('应返回404错误当会话不存在', async () => {
        const token = generateToken(testUser._id);
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const response = await api
          .delete(`/api/v1/conversations/${nonExistentId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应拒绝未认证的请求', async () => {
        const response = await api
          .delete(`/api/v1/conversations/${conversationId}/messages`)
          .expect(401)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('会话特殊功能', () => {
    let conversationId;
    
    beforeEach(async () => {
      // 创建测试会话
      const conversation = await Conversation.create({
        title: testConversation.title,
        model: testConversation.model,
        messages: testConversation.messages,
        user: testUser._id,
        tags: testTags
      });
      
      conversationId = conversation._id;
    });
    
    describe('会话导出', () => {
      test('应成功导出会话为JSON格式', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .get(`/api/v1/conversations/${conversationId}/export?format=json`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body).toHaveProperty('title', testConversation.title);
        expect(response.body).toHaveProperty('model', testConversation.model);
        expect(response.body).toHaveProperty('messages');
        expect(response.body.messages).toHaveLength(2);
        expect(response.body.messages[0].role).toBe(testConversation.messages[0].role);
        expect(response.body.messages[0].content).toBe(testConversation.messages[0].content);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('export_conversation');
      });
      
      test('应成功导出会话为Markdown格式', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .get(`/api/v1/conversations/${conversationId}/export?format=markdown`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /text\/markdown/);
        
        // 验证响应内容包含会话标题和消息
        expect(response.text).toContain(testConversation.title);
        expect(response.text).toContain(testConversation.messages[0].content);
        expect(response.text).toContain(testConversation.messages[1].content);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('export_conversation');
      });
      
      test('应返回400错误当导出格式无效', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .get(`/api/v1/conversations/${conversationId}/export?format=invalid`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应返回404错误当会话不存在', async () => {
        const token = generateToken(testUser._id);
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const response = await api
          .get(`/api/v1/conversations/${nonExistentId}/export?format=json`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应拒绝未认证的请求', async () => {
        const response = await api
          .get(`/api/v1/conversations/${conversationId}/export?format=json`)
          .expect(401)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
    
    describe('会话分享', () => {
      test('应成功创建会话分享链接', async () => {
        const token = generateToken(testUser._id);
        
        const shareOptions = {
          expiresIn: '7d', // 7天后过期
          isReadOnly: true
        };
        
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/share`)
          .set('Authorization', `Bearer ${token}`)
          .send(shareOptions)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('shareLink');
        expect(response.body.data).toHaveProperty('shareId');
        expect(response.body.data).toHaveProperty('expiresAt');
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.isShared).toBe(true);
        expect(updatedConversation.shareId).toBeDefined();
        expect(updatedConversation.shareExpiration).toBeDefined();
        expect(updatedConversation.shareReadOnly).toBe(true);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('share_conversation');
      });
      
      test('应成功访问共享的会话', async () => {
        // 先创建分享链接
        const token = generateToken(testUser._id);
        
        const shareResponse = await api
          .post(`/api/v1/conversations/${conversationId}/share`)
          .set('Authorization', `Bearer ${token}`)
          .send({ expiresIn: '7d', isReadOnly: true })
          .expect(200);
        
        const shareId = shareResponse.body.data.shareId;
        
        // 访问共享的会话（无需认证）
        const response = await api
          .get(`/api/v1/shared/${shareId}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('conversation');
        expect(response.body.data.conversation.title).toBe(testConversation.title);
        expect(response.body.data.conversation.model).toBe(testConversation.model);
        expect(response.body.data.conversation.messages).toHaveLength(2);
        expect(response.body.data.conversation.isReadOnly).toBe(true);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({ action: 'view_shared_conversation' });
        expect(activityLogs).toHaveLength(1);
      });
      
      test('应成功取消会话分享', async () => {
        // 先创建分享链接
        const token = generateToken(testUser._id);
        
        await api
          .post(`/api/v1/conversations/${conversationId}/share`)
          .set('Authorization', `Bearer ${token}`)
          .send({ expiresIn: '7d', isReadOnly: true })
          .expect(200);
        
        // 取消分享
        const response = await api
          .delete(`/api/v1/conversations/${conversationId}/share`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('message');
        expect(response.body.data.message).toContain('已取消分享');
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.isShared).toBe(false);
        expect(updatedConversation.shareId).toBeUndefined();
        expect(updatedConversation.shareExpiration).toBeUndefined();
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({ action: 'unshare_conversation' });
        expect(activityLogs).toHaveLength(1);
      });
      
      test('应返回404错误当会话不存在', async () => {
        const token = generateToken(testUser._id);
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const response = await api
          .post(`/api/v1/conversations/${nonExistentId}/share`)
          .set('Authorization', `Bearer ${token}`)
          .send({ expiresIn: '7d' })
          .expect(404)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应拒绝未认证的请求', async () => {
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/share`)
          .send({ expiresIn: '7d' })
          .expect(401)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
    
    describe('会话标记', () => {
      test('应成功标记会话为收藏', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('conversation');
        expect(response.body.data.conversation.isFavorite).toBe(true);
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.isFavorite).toBe(true);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('favorite_conversation');
      });
      
      test('应成功取消会话收藏标记', async () => {
        // 先标记为收藏
        const conversation = await Conversation.findById(conversationId);
        conversation.isFavorite = true;
        await conversation.save();
        
        const token = generateToken(testUser._id);
        
        const response = await api
          .delete(`/api/v1/conversations/${conversationId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('conversation');
        expect(response.body.data.conversation.isFavorite).toBe(false);
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.isFavorite).toBe(false);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('unfavorite_conversation');
      });
      
      test('应成功标记会话为存档', async () => {
        const token = generateToken(testUser._id);
        
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/archive`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('conversation');
        expect(response.body.data.conversation.isArchived).toBe(true);
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.isArchived).toBe(true);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('archive_conversation');
      });
      
      test('应成功取消会话存档标记', async () => {
        // 先标记为存档
        const conversation = await Conversation.findById(conversationId);
        conversation.isArchived = true;
        await conversation.save();
        
        const token = generateToken(testUser._id);
        
        const response = await api
          .delete(`/api/v1/conversations/${conversationId}/archive`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('conversation');
        expect(response.body.data.conversation.isArchived).toBe(false);
        
        // 验证数据库中的会话是否已更新
        const updatedConversation = await Conversation.findById(conversationId);
        expect(updatedConversation.isArchived).toBe(false);
        
        // 验证活动日志是否已记录
        const activityLogs = await ActivityLog.find({});
        expect(activityLogs).toHaveLength(1);
        expect(activityLogs[0].action).toBe('unarchive_conversation');
      });
      
      test('应返回404错误当会话不存在', async () => {
        const token = generateToken(testUser._id);
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const response = await api
          .post(`/api/v1/conversations/${nonExistentId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
      
      test('应拒绝未认证的请求', async () => {
        const response = await api
          .post(`/api/v1/conversations/${conversationId}/favorite`)
          .expect(401)
          .expect('Content-Type', /application\/json/);
        
        // 验证响应
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });
  });
}); 