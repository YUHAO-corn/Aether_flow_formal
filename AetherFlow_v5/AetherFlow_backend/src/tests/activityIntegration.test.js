/**
 * 活动日志功能集成测试
 */

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/User');
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

// 测试活动日志数据
const testActivities = [
  {
    action: 'create_prompt',
    entityType: 'prompt',
    entityId: new mongoose.Types.ObjectId(),
    details: { content: '测试提示词1' },
    ipAddress: '127.0.0.1'
  },
  {
    action: 'update_prompt',
    entityType: 'prompt',
    entityId: new mongoose.Types.ObjectId(),
    details: { content: '测试提示词2' },
    ipAddress: '127.0.0.1'
  },
  {
    action: 'delete_prompt',
    entityType: 'prompt',
    entityId: new mongoose.Types.ObjectId(),
    details: { content: '测试提示词3' },
    ipAddress: '127.0.0.1'
  },
  {
    action: 'create_conversation',
    entityType: 'conversation',
    entityId: new mongoose.Types.ObjectId(),
    details: { title: '测试会话1' },
    ipAddress: '127.0.0.1'
  },
  {
    action: 'login',
    entityType: 'user',
    entityId: testUser._id,
    details: { username: testUser.username },
    ipAddress: '127.0.0.1'
  }
];

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h'
  });
};

beforeEach(async () => {
  // 清空数据库集合
  await User.deleteMany({});
  await ActivityLog.deleteMany({});
  
  // 创建测试用户
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await User.create({
    _id: testUser._id,
    username: testUser.username,
    email: testUser.email,
    password: hashedPassword
  });
  
  // 创建测试活动日志
  for (const activity of testActivities) {
    await ActivityLog.create({
      ...activity,
      user: testUser._id,
      timestamp: new Date()
    });
  }

  // 创建API测试客户端
  api = supertest(app);
});

describe('活动日志API', () => {
  let token;
  
  beforeEach(() => {
    // 生成JWT令牌
    token = generateToken(testUser._id);
  });
  
  describe('获取活动日志列表', () => {
    test('应成功获取活动日志列表', async () => {
      const response = await api
        .get('/api/v1/activities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      expect(response.body.data.activities.length).toBe(testActivities.length);
      expect(response.body.data.pagination).toBeDefined();
    }, 60000);
    
    test('应支持按操作类型筛选', async () => {
      const response = await api
        .get('/api/v1/activities?action=create_prompt')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      
      // 验证所有返回的活动都是create_prompt操作
      const allCreateActions = response.body.data.activities.every(
        activity => activity.action === 'create_prompt'
      );
      expect(allCreateActions).toBe(true);
    }, 60000);
    
    test('应支持按实体类型筛选', async () => {
      const response = await api
        .get('/api/v1/activities?entityType=prompt')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      
      // 验证所有返回的活动都是prompt实体
      const allPromptEntities = response.body.data.activities.every(
        activity => activity.entityType === 'prompt'
      );
      expect(allPromptEntities).toBe(true);
    }, 60000);
    
    test('应支持分页', async () => {
      const response = await api
        .get('/api/v1/activities?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      expect(response.body.data.activities.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalPages).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
    }, 60000);
    
    test('未授权用户应被拒绝访问', async () => {
      await api
        .get('/api/v1/activities')
        .expect(401);
    }, 60000);
  });
  
  describe('获取单个活动日志', () => {
    test('应成功获取单个活动日志', async () => {
      // 先获取活动日志列表
      const listResponse = await api
        .get('/api/v1/activities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 获取第一个活动日志的ID
      const activityId = listResponse.body.data.activities[0]._id;
      
      // 获取单个活动日志
      const response = await api
        .get(`/api/v1/activities/${activityId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.activity).toBeDefined();
      expect(response.body.data.activity._id).toBe(activityId);
    }, 60000);
    
    test('请求不存在的活动日志应返回404', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await api
        .get(`/api/v1/activities/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    }, 60000);
    
    test('请求其他用户的活动日志应返回403', async () => {
      // 创建另一个用户的活动日志
      const otherUserId = new mongoose.Types.ObjectId();
      const otherActivity = await ActivityLog.create({
        action: 'create_prompt',
        entityType: 'prompt',
        entityId: new mongoose.Types.ObjectId(),
        details: { content: '其他用户的提示词' },
        user: otherUserId,
        ipAddress: '127.0.0.1',
        timestamp: new Date()
      });
      
      // 尝试获取其他用户的活动日志
      await api
        .get(`/api/v1/activities/${otherActivity._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    }, 60000);
  });
  
  describe('获取活动统计', () => {
    test('应成功获取活动统计', async () => {
      const response = await api
        .get('/api/v1/activities/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalActivities).toBeDefined();
      expect(response.body.data.stats.actionCounts).toBeDefined();
      expect(response.body.data.stats.entityTypeCounts).toBeDefined();
      expect(response.body.data.stats.recentActivity).toBeDefined();
    }, 60000);
    
    test('应支持按时间范围筛选', async () => {
      // 创建一个一周前的活动
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      await ActivityLog.create({
        action: 'create_prompt',
        entityType: 'prompt',
        entityId: new mongoose.Types.ObjectId(),
        details: { content: '一周前的活动' },
        user: testUser._id,
        ipAddress: '127.0.0.1',
        timestamp: oneWeekAgo
      });
      
      // 获取最近3天的活动统计
      const response = await api
        .get('/api/v1/activities/stats?days=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalActivities).toBeDefined();
      
      // 验证总活动数应该等于测试活动数量（不包括一周前的活动）
      expect(response.body.data.stats.totalActivities).toBe(testActivities.length);
    }, 60000);
    
    test('未授权用户应被拒绝访问', async () => {
      await api
        .get('/api/v1/activities/stats')
        .expect(401);
    }, 60000);
  });
  
  describe('清除活动日志', () => {
    test('应成功清除所有活动日志', async () => {
      // 清除活动日志
      const response = await api
        .delete('/api/v1/activities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('已清除');
      
      // 验证数据库中的活动日志是否已清除
      const activitiesCount = await ActivityLog.countDocuments({ user: testUser._id });
      expect(activitiesCount).toBe(0);
    }, 60000);
    
    test('应支持按操作类型清除', async () => {
      // 清除create_prompt操作的活动日志
      const response = await api
        .delete('/api/v1/activities?action=create_prompt')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      
      // 验证数据库中的create_prompt操作活动日志是否已清除
      const createActivitiesCount = await ActivityLog.countDocuments({ 
        user: testUser._id,
        action: 'create_prompt'
      });
      expect(createActivitiesCount).toBe(0);
      
      // 验证其他操作的活动日志是否仍然存在
      const otherActivitiesCount = await ActivityLog.countDocuments({ 
        user: testUser._id,
        action: { $ne: 'create_prompt' }
      });
      expect(otherActivitiesCount).toBeGreaterThan(0);
    }, 60000);
    
    test('应支持按实体类型清除', async () => {
      // 清除prompt实体的活动日志
      const response = await api
        .delete('/api/v1/activities?entityType=prompt')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      
      // 验证数据库中的prompt实体活动日志是否已清除
      const promptActivitiesCount = await ActivityLog.countDocuments({ 
        user: testUser._id,
        entityType: 'prompt'
      });
      expect(promptActivitiesCount).toBe(0);
      
      // 验证其他实体的活动日志是否仍然存在
      const otherActivitiesCount = await ActivityLog.countDocuments({ 
        user: testUser._id,
        entityType: { $ne: 'prompt' }
      });
      expect(otherActivitiesCount).toBeGreaterThan(0);
    }, 60000);
    
    test('应支持按时间范围清除', async () => {
      // 创建一个一周前的活动
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      await ActivityLog.create({
        action: 'create_prompt',
        entityType: 'prompt',
        entityId: new mongoose.Types.ObjectId(),
        details: { content: '一周前的活动' },
        user: testUser._id,
        ipAddress: '127.0.0.1',
        timestamp: oneWeekAgo
      });
      
      // 获取当前活动总数
      const beforeCount = await ActivityLog.countDocuments({ user: testUser._id });
      
      // 清除最近3天的活动日志
      const response = await api
        .delete('/api/v1/activities?days=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // 验证响应
      expect(response.body.success).toBe(true);
      
      // 验证数据库中的最近活动是否已清除，但一周前的活动仍然存在
      const afterCount = await ActivityLog.countDocuments({ user: testUser._id });
      expect(afterCount).toBe(1); // 只剩下一周前的活动
    }, 60000);
    
    test('未授权用户应被拒绝访问', async () => {
      await api
        .delete('/api/v1/activities')
        .expect(401);
    }, 60000);
  });
}); 