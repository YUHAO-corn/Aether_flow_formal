const mongoose = require('mongoose');
const { User, Prompt, Tag, ActivityLog } = require('../models');
const bcrypt = require('bcryptjs');

describe('模型单元测试', () => {
  beforeAll(async () => {
    // 连接到测试数据库
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // 断开数据库连接
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 清空所有集合
    await Promise.all([
      User.deleteMany({}),
      Prompt.deleteMany({}),
      Tag.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);
  });

  describe('User模型', () => {
    it('应正确创建用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const user = await User.create(userData);

      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // 密码应该被加密
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('应验证必需字段', async () => {
      const invalidUser = new User({});

      try {
        await invalidUser.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.username).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
      }
    });

    it('应验证邮箱格式', async () => {
      const invalidUser = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!'
      });

      try {
        await invalidUser.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.email).toBeDefined();
      }
    });

    it('应验证密码强度', async () => {
      const invalidUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak'
      });

      try {
        await invalidUser.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });

    it('应正确比较密码', async () => {
      const password = 'Password123!';
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Prompt模型', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('应正确创建提示词', async () => {
      const promptData = {
        user: user._id,
        content: '测试提示词',
        platform: 'ChatGPT',
        tags: [new mongoose.Types.ObjectId()]
      };

      const prompt = await Prompt.create(promptData);

      expect(prompt.content).toBe(promptData.content);
      expect(prompt.platform).toBe(promptData.platform);
      expect(prompt.user.toString()).toBe(user._id.toString());
      expect(prompt.tags).toHaveLength(1);
      expect(prompt.usageCount).toBe(0);
      expect(prompt.favorite).toBe(false);
    });

    it('应验证必需字段', async () => {
      const invalidPrompt = new Prompt({});

      try {
        await invalidPrompt.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.user).toBeDefined();
        expect(error.errors.content).toBeDefined();
      }
    });

    it('应正确更新使用次数', async () => {
      const prompt = await Prompt.create({
        user: user._id,
        content: '测试提示词',
        platform: 'ChatGPT'
      });

      await prompt.incrementUsageCount();
      expect(prompt.usageCount).toBe(1);

      await prompt.incrementUsageCount();
      expect(prompt.usageCount).toBe(2);
    });
  });

  describe('Tag模型', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('应正确创建标签', async () => {
      const tagData = {
        user: user._id,
        name: '测试标签',
        color: '#FF0000'
      };

      const tag = await Tag.create(tagData);

      expect(tag.name).toBe(tagData.name);
      expect(tag.color).toBe(tagData.color);
      expect(tag.user.toString()).toBe(user._id.toString());
    });

    it('应验证必需字段', async () => {
      const invalidTag = new Tag({});

      try {
        await invalidTag.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.user).toBeDefined();
        expect(error.errors.name).toBeDefined();
      }
    });

    it('应验证颜色格式', async () => {
      const invalidTag = new Tag({
        user: user._id,
        name: '测试标签',
        color: 'invalid-color'
      });

      try {
        await invalidTag.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.color).toBeDefined();
      }
    });
  });

  describe('ActivityLog模型', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('应正确创建活动日志', async () => {
      const logData = {
        user: user._id,
        action: 'create_prompt',
        details: {
          promptId: new mongoose.Types.ObjectId(),
          content: '测试提示词'
        }
      };

      const log = await ActivityLog.create(logData);

      expect(log.action).toBe(logData.action);
      expect(log.user.toString()).toBe(user._id.toString());
      expect(log.details).toEqual(logData.details);
      expect(log.createdAt).toBeDefined();
    });

    it('应验证必需字段', async () => {
      const invalidLog = new ActivityLog({});

      try {
        await invalidLog.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.user).toBeDefined();
        expect(error.errors.action).toBeDefined();
      }
    });

    it('应验证活动类型', async () => {
      const invalidLog = new ActivityLog({
        user: user._id,
        action: 'invalid_action',
        details: {}
      });

      try {
        await invalidLog.save();
        fail('应该抛出验证错误');
      } catch (error) {
        expect(error.errors.action).toBeDefined();
      }
    });
  });
}); 