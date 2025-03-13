const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const { Prompt, Tag, ActivityLog } = require('../models');
const promptService = require('../services/promptService');
const tagService = require('../services/tagService');
const activityLogService = require('../services/activityLogService');

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