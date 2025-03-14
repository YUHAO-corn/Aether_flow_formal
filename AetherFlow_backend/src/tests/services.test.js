const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const { Prompt, Tag, ActivityLog } = require('../models');
const promptService = require('../services/promptService');
const tagService = require('../services/tagService');
const activityLogService = require('../services/activityLogService');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { 
  userService, 
  conversationService,
  apiKeyService,
  activityService,
  promptOptimizationService
} = require('../services');
const { User, Conversation, ApiKey, OptimizationHistory } = require('../models');

let mongoServer;

// 测试数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

const testPrompt = {
  content: '这是一个测试提示词',
  response: '这是测试回答',
  platform: 'test-platform'
};

const testTag = {
  name: '测试标签',
  color: '#FF5733'
};

// 在所有测试之前连接到内存数据库
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// 在所有测试之后断开连接并关闭内存数据库
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// 在每个测试之前清空数据库
beforeEach(async () => {
  await User.deleteMany({});
  await Prompt.deleteMany({});
  await Tag.deleteMany({});
  await Conversation.deleteMany({});
  await ApiKey.deleteMany({});
  await ActivityLog.deleteMany({});
  await OptimizationHistory.deleteMany({});
});

// 模拟模型
jest.mock('../models/Prompt', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock('../models/Tag', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock('../models/ActivityLog', () => ({
  create: jest.fn(),
  find: jest.fn()
}));

// 模拟logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('服务层单元测试', () => {
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
  });

  describe('提示词服务', () => {
    describe('createPrompt', () => {
      it('应成功创建提示词', async () => {
        const userId = new mongoose.Types.ObjectId();
        const promptData = {
          content: '测试提示词',
          tags: [new mongoose.Types.ObjectId()],
          platform: 'ChatGPT'
        };

        const mockPrompt = {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          ...promptData,
          createdAt: new Date()
        };

        Prompt.create.mockResolvedValue(mockPrompt);

        const result = await promptService.createPrompt(userId, promptData);

        expect(Prompt.create).toHaveBeenCalledWith({
          user: userId,
          ...promptData
        });
        expect(result).toEqual(mockPrompt);
      });
    });

    describe('getPrompts', () => {
      it('应成功获取提示词列表', async () => {
        const userId = new mongoose.Types.ObjectId();
        const query = { page: 1, limit: 10, sort: '-createdAt' };

        const mockPrompts = [
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            content: '提示词1'
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            content: '提示词2'
          }
        ];

        const mockQuery = {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockPrompts)
        };

        Prompt.find.mockReturnValue(mockQuery);

        const result = await promptService.getPrompts(userId, query);

        expect(Prompt.find).toHaveBeenCalledWith({ user: userId });
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(10);
        expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
        expect(result).toEqual(mockPrompts);
      });
    });

    describe('searchPrompts', () => {
      it('应成功搜索提示词', async () => {
        const userId = new mongoose.Types.ObjectId();
        const searchParams = {
          keyword: '测试',
          tags: [new mongoose.Types.ObjectId()]
        };

        const mockPrompts = [
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            content: '测试提示词1'
          }
        ];

        Prompt.aggregate.mockResolvedValue(mockPrompts);

        const result = await promptService.searchPrompts(userId, searchParams);

        expect(Prompt.aggregate).toHaveBeenCalled();
        expect(result).toEqual(mockPrompts);
      });
    });

    describe('optimizePrompt', () => {
      it('应成功优化提示词', async () => {
        const promptId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        const optimizationParams = {
          type: 'clarity',
          language: 'zh-CN'
        };

        const mockPrompt = {
          _id: promptId,
          user: userId,
          content: '原始提示词'
        };

        const optimizedPrompt = {
          ...mockPrompt,
          content: '优化后的提示词'
        };

        Prompt.findById.mockResolvedValue(mockPrompt);
        Prompt.findByIdAndUpdate.mockResolvedValue(optimizedPrompt);

        const result = await promptService.optimizePrompt(promptId, userId, optimizationParams);

        expect(Prompt.findById).toHaveBeenCalledWith(promptId);
        expect(Prompt.findByIdAndUpdate).toHaveBeenCalled();
        expect(result).toEqual(optimizedPrompt);
      });
    });
  });

  describe('标签服务', () => {
    describe('createTag', () => {
      it('应成功创建标签', async () => {
        const userId = new mongoose.Types.ObjectId();
        const tagData = {
          name: '测试标签',
          color: '#FF0000'
        };

        const mockTag = {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          ...tagData,
          createdAt: new Date()
        };

        Tag.create.mockResolvedValue(mockTag);

        const result = await tagService.createTag(userId, tagData);

        expect(Tag.create).toHaveBeenCalledWith({
          user: userId,
          ...tagData
        });
        expect(result).toEqual(mockTag);
      });
    });

    describe('getTags', () => {
      it('应成功获取标签列表', async () => {
        const userId = new mongoose.Types.ObjectId();

        const mockTags = [
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            name: '标签1'
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            name: '标签2'
          }
        ];

        Tag.find.mockResolvedValue(mockTags);

        const result = await tagService.getTags(userId);

        expect(Tag.find).toHaveBeenCalledWith({ user: userId });
        expect(result).toEqual(mockTags);
      });
    });

    describe('updateTag', () => {
      it('应成功更新标签', async () => {
        const tagId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        const updateData = {
          name: '更新后的标签',
          color: '#00FF00'
        };

        const mockTag = {
          _id: tagId,
          user: userId,
          ...updateData
        };

        Tag.findByIdAndUpdate.mockResolvedValue(mockTag);

        const result = await tagService.updateTag(tagId, userId, updateData);

        expect(Tag.findByIdAndUpdate).toHaveBeenCalledWith(
          tagId,
          updateData,
          { new: true, runValidators: true }
        );
        expect(result).toEqual(mockTag);
      });
    });
  });

  describe('活动日志服务', () => {
    describe('createLog', () => {
      it('应成功创建活动日志', async () => {
        const userId = new mongoose.Types.ObjectId();
        const logData = {
          action: 'create_prompt',
          details: {
            promptId: new mongoose.Types.ObjectId()
          }
        };

        const mockLog = {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          ...logData,
          createdAt: new Date()
        };

        ActivityLog.create.mockResolvedValue(mockLog);

        const result = await activityLogService.createLog(userId, logData);

        expect(ActivityLog.create).toHaveBeenCalledWith({
          user: userId,
          ...logData
        });
        expect(result).toEqual(mockLog);
      });
    });

    describe('getLogs', () => {
      it('应成功获取活动日志列表', async () => {
        const userId = new mongoose.Types.ObjectId();
        const query = { page: 1, limit: 10 };

        const mockLogs = [
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            action: 'create_prompt',
            createdAt: new Date()
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            action: 'update_prompt',
            createdAt: new Date()
          }
        ];

        const mockQuery = {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockLogs)
        };

        ActivityLog.find.mockReturnValue(mockQuery);

        const result = await activityLogService.getLogs(userId, query);

        expect(ActivityLog.find).toHaveBeenCalledWith({ user: userId });
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(10);
        expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
        expect(result).toEqual(mockLogs);
      });
    });
  });
});

describe('用户服务测试', () => {
  test('创建用户', async () => {
    const user = await userService.createUser(testUser);
    expect(user).toBeDefined();
    expect(user.username).toBe(testUser.username);
    expect(user.email).toBe(testUser.email);
    expect(user.password).not.toBe(testUser.password); // 密码应该被加密
  });

  test('通过ID查找用户', async () => {
    const createdUser = await userService.createUser(testUser);
    const user = await userService.getUserById(createdUser._id);
    expect(user).toBeDefined();
    expect(user.username).toBe(testUser.username);
    expect(user.email).toBe(testUser.email);
  });

  test('通过邮箱查找用户', async () => {
    await userService.createUser(testUser);
    const user = await userService.getUserByEmail(testUser.email);
    expect(user).toBeDefined();
    expect(user.username).toBe(testUser.username);
    expect(user.email).toBe(testUser.email);
  });

  test('更新用户', async () => {
    const createdUser = await userService.createUser(testUser);
    const updatedUser = await userService.updateUser(createdUser._id, { username: 'updateduser' });
    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe('updateduser');
    expect(updatedUser.email).toBe(testUser.email);
  });
});

describe('提示词服务测试', () => {
  let userId;

  beforeEach(async () => {
    const user = await userService.createUser(testUser);
    userId = user._id;
  });

  test('创建提示词', async () => {
    const prompt = await promptService.createPrompt({
      ...testPrompt,
      user: userId
    });
    expect(prompt).toBeDefined();
    expect(prompt.content).toBe(testPrompt.content);
    expect(prompt.response).toBe(testPrompt.response);
    expect(prompt.platform).toBe(testPrompt.platform);
    expect(prompt.user.toString()).toBe(userId.toString());
  });

  test('获取用户的所有提示词', async () => {
    await promptService.createPrompt({
      ...testPrompt,
      user: userId
    });
    
    await promptService.createPrompt({
      content: '第二个测试提示词',
      response: '第二个测试回答',
      platform: 'test-platform',
      user: userId
    });

    const prompts = await promptService.getPromptsByUser(userId);
    expect(prompts).toBeDefined();
    expect(prompts.length).toBe(2);
    expect(prompts[0].user.toString()).toBe(userId.toString());
    expect(prompts[1].user.toString()).toBe(userId.toString());
  });

  test('通过ID获取提示词', async () => {
    const createdPrompt = await promptService.createPrompt({
      ...testPrompt,
      user: userId
    });

    const prompt = await promptService.getPromptById(createdPrompt._id);
    expect(prompt).toBeDefined();
    expect(prompt.content).toBe(testPrompt.content);
    expect(prompt.response).toBe(testPrompt.response);
    expect(prompt.user.toString()).toBe(userId.toString());
  });

  test('更新提示词', async () => {
    const createdPrompt = await promptService.createPrompt({
      ...testPrompt,
      user: userId
    });

    const updatedPrompt = await promptService.updatePrompt(createdPrompt._id, {
      content: '更新后的提示词'
    });

    expect(updatedPrompt).toBeDefined();
    expect(updatedPrompt.content).toBe('更新后的提示词');
    expect(updatedPrompt.response).toBe(testPrompt.response);
    expect(updatedPrompt.user.toString()).toBe(userId.toString());
  });

  test('删除提示词', async () => {
    const createdPrompt = await promptService.createPrompt({
      ...testPrompt,
      user: userId
    });

    await promptService.deletePrompt(createdPrompt._id);
    const prompt = await promptService.getPromptById(createdPrompt._id);
    expect(prompt).toBeNull();
  });

  test('搜索提示词', async () => {
    await promptService.createPrompt({
      content: '测试关键词搜索',
      response: '测试回答',
      platform: 'test-platform',
      user: userId
    });

    await promptService.createPrompt({
      content: '不匹配的提示词',
      response: '测试回答',
      platform: 'test-platform',
      user: userId
    });

    const prompts = await promptService.searchPrompts(userId, '关键词');
    expect(prompts).toBeDefined();
    expect(prompts.length).toBe(1);
    expect(prompts[0].content).toBe('测试关键词搜索');
  });

  test('添加标签到提示词', async () => {
    const createdTag = await tagService.createTag({
      ...testTag,
      user: userId
    });

    const createdPrompt = await promptService.createPrompt({
      ...testPrompt,
      user: userId
    });

    const updatedPrompt = await promptService.addTagToPrompt(createdPrompt._id, createdTag._id);
    expect(updatedPrompt).toBeDefined();
    expect(updatedPrompt.tags.length).toBe(1);
    expect(updatedPrompt.tags[0].toString()).toBe(createdTag._id.toString());
  });

  test('从提示词移除标签', async () => {
    const createdTag = await tagService.createTag({
      ...testTag,
      user: userId
    });

    const createdPrompt = await promptService.createPrompt({
      ...testPrompt,
      user: userId,
      tags: [createdTag._id]
    });

    const updatedPrompt = await promptService.removeTagFromPrompt(createdPrompt._id, createdTag._id);
    expect(updatedPrompt).toBeDefined();
    expect(updatedPrompt.tags.length).toBe(0);
  });
});

describe('标签服务测试', () => {
  let userId;

  beforeEach(async () => {
    const user = await userService.createUser(testUser);
    userId = user._id;
  });

  test('创建标签', async () => {
    const tag = await tagService.createTag({
      ...testTag,
      user: userId
    });
    expect(tag).toBeDefined();
    expect(tag.name).toBe(testTag.name);
    expect(tag.color).toBe(testTag.color);
    expect(tag.user.toString()).toBe(userId.toString());
  });

  test('获取用户的所有标签', async () => {
    await tagService.createTag({
      ...testTag,
      user: userId
    });
    
    await tagService.createTag({
      name: '第二个测试标签',
      color: '#33FF57',
      user: userId
    });

    const tags = await tagService.getTagsByUser(userId);
    expect(tags).toBeDefined();
    expect(tags.length).toBe(2);
    expect(tags[0].user.toString()).toBe(userId.toString());
    expect(tags[1].user.toString()).toBe(userId.toString());
  });
});

// 添加更多服务测试... 