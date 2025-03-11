const { Prompt, Tag, ActivityLog } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createdResponse, notFoundResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * 获取提示词列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.getPrompts = async (req, res, next) => {
  try {
    // 构建查询条件
    const queryObj = { user: req.user._id };
    
    // 搜索
    if (req.query.search) {
      queryObj.$text = { $search: req.query.search };
    }
    
    // 标签筛选
    if (req.query.tag) {
      const tag = await Tag.findOne({ 
        user: req.user._id, 
        name: req.query.tag 
      });
      
      if (tag) {
        queryObj.tags = tag._id;
      }
    }
    
    // 收藏筛选
    if (req.query.favorite !== undefined) {
      queryObj.favorite = req.query.favorite === 'true';
    }
    
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // 排序
    let sortBy = '-createdAt'; // 默认按创建时间降序
    if (req.query.sort) {
      sortBy = req.query.sort;
    }
    
    // 执行查询
    const prompts = await Prompt.find(queryObj)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('tags', 'name color');
    
    // 获取总数
    const total = await Prompt.countDocuments(queryObj);
    
    // 发送响应
    return successResponse(res, prompts, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.getPrompt = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('tags', 'name color');
    
    if (!prompt) {
      return notFoundResponse(res, 'Prompt not found');
    }
    
    return successResponse(res, prompt);
  } catch (error) {
    next(error);
  }
};

/**
 * 创建提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.createPrompt = async (req, res, next) => {
  try {
    const { content, response, platform, url, tags, favorite } = req.body;
    
    // 处理标签
    let tagIds = [];
    if (tags && tags.length > 0) {
      // 查找现有标签
      const existingTags = await Tag.find({
        user: req.user._id,
        name: { $in: tags }
      });
      
      // 获取现有标签ID
      const existingTagIds = existingTags.map(tag => tag._id);
      const existingTagNames = existingTags.map(tag => tag.name);
      
      // 创建新标签
      const newTagNames = tags.filter(tag => !existingTagNames.includes(tag));
      const newTags = await Promise.all(
        newTagNames.map(name => 
          Tag.create({
            user: req.user._id,
            name
          })
        )
      );
      
      // 合并标签ID
      tagIds = [...existingTagIds, ...newTags.map(tag => tag._id)];
    }
    
    // 创建提示词
    const prompt = await Prompt.create({
      user: req.user._id,
      content,
      response,
      platform,
      url,
      tags: tagIds,
      favorite: favorite || false
    });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'create_prompt',
      entityType: 'prompt',
      entityId: prompt._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // 填充标签信息
    await prompt.populate('tags', 'name color');
    
    // 发送响应
    return createdResponse(res, prompt);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.updatePrompt = async (req, res, next) => {
  try {
    // 查找提示词
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!prompt) {
      return notFoundResponse(res, 'Prompt not found');
    }
    
    // 更新字段
    const { content, response, tags, favorite } = req.body;
    
    if (content !== undefined) prompt.content = content;
    if (response !== undefined) prompt.response = response;
    if (favorite !== undefined) prompt.favorite = favorite;
    
    // 处理标签
    if (tags && Array.isArray(tags)) {
      // 查找现有标签
      const existingTags = await Tag.find({
        user: req.user._id,
        name: { $in: tags }
      });
      
      // 获取现有标签ID
      const existingTagIds = existingTags.map(tag => tag._id);
      const existingTagNames = existingTags.map(tag => tag.name);
      
      // 创建新标签
      const newTagNames = tags.filter(tag => !existingTagNames.includes(tag));
      const newTags = await Promise.all(
        newTagNames.map(name => 
          Tag.create({
            user: req.user._id,
            name
          })
        )
      );
      
      // 更新标签
      prompt.tags = [...existingTagIds, ...newTags.map(tag => tag._id)];
    }
    
    // 保存更新
    await prompt.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'update_prompt',
      entityType: 'prompt',
      entityId: prompt._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // 填充标签信息
    await prompt.populate('tags', 'name color');
    
    // 发送响应
    return successResponse(res, prompt);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.deletePrompt = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!prompt) {
      return notFoundResponse(res, 'Prompt not found');
    }
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete_prompt',
      entityType: 'prompt',
      entityId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return successResponse(res, { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * 切换收藏状态
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.toggleFavorite = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!prompt) {
      return notFoundResponse(res, 'Prompt not found');
    }
    
    // 切换收藏状态
    prompt.favorite = !prompt.favorite;
    await prompt.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'favorite_prompt',
      entityType: 'prompt',
      entityId: prompt._id,
      details: { favorite: prompt.favorite },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return successResponse(res, {
      id: prompt._id,
      favorite: prompt.favorite
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 增加使用次数
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.incrementUsage = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!prompt) {
      return notFoundResponse(res, 'Prompt not found');
    }
    
    // 增加使用次数
    prompt.usageCount += 1;
    await prompt.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'use_prompt',
      entityType: 'prompt',
      entityId: prompt._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return successResponse(res, {
      id: prompt._id,
      usageCount: prompt.usageCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 优化提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.enhancePrompt = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    // TODO: 调用大模型API优化提示词
    // 这里是模拟优化结果
    const enhanced = `Improved: ${content}`;
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'enhance_prompt',
      details: { original: content },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return successResponse(res, {
      original: content,
      enhanced
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 自动保存提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.autoSavePrompt = async (req, res, next) => {
  try {
    const { content, response, platform, url } = req.body;
    
    // 验证必要字段
    if (!content) {
      return next(new AppError('提示词内容不能为空', 'VALIDATION_ERROR', 400));
    }
    
    // 检查是否已存在相同内容的提示词（避免短时间内重复保存）
    // 修改判断逻辑：同时考虑content、platform和url，并添加时间阈值
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5分钟前
    
    const existingPrompt = await Prompt.findOne({
      user: req.user._id,
      content,
      platform,
      url: url || { $exists: false },
      updatedAt: { $gte: fiveMinutesAgo } // 只检查5分钟内的记录
    });
    
    if (existingPrompt) {
      // 如果已存在，更新响应和使用次数
      existingPrompt.response = response || existingPrompt.response;
      existingPrompt.usageCount += 1;
      existingPrompt.updatedAt = new Date();
      await existingPrompt.save();
      
      // 记录活动
      await ActivityLog.create({
        user: req.user._id,
        action: 'update_prompt',
        entityType: 'prompt',
        entityId: existingPrompt._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return successResponse(res, existingPrompt);
    }
    
    // 创建新的提示词
    const prompt = await Prompt.create({
      user: req.user._id,
      content,
      response,
      platform,
      url,
      favorite: false,
      usageCount: 1
    });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'auto_save_prompt',
      entityType: 'prompt',
      entityId: prompt._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // 实现滚动存储机制
    // 获取用户未收藏的提示词数量
    const unfavoritedCount = await Prompt.countDocuments({
      user: req.user._id,
      favorite: false
    });
    
    // 设置最大保存数量（可以从配置中读取）
    const MAX_UNFAVORITED_PROMPTS = 100;
    
    // 如果超过限制，删除最旧的未收藏提示词
    if (unfavoritedCount > MAX_UNFAVORITED_PROMPTS) {
      const oldestPrompts = await Prompt.find({
        user: req.user._id,
        favorite: false
      })
      .sort('createdAt')
      .limit(unfavoritedCount - MAX_UNFAVORITED_PROMPTS);
      
      if (oldestPrompts.length > 0) {
        const oldestPromptIds = oldestPrompts.map(p => p._id);
        
        await Prompt.deleteMany({
          _id: { $in: oldestPromptIds }
        });
        
        logger.info(`已删除 ${oldestPromptIds.length} 个最旧的未收藏提示词，用户ID: ${req.user._id}`);
      }
    }
    
    return createdResponse(res, prompt);
  } catch (error) {
    next(error);
  }
};

/**
 * 批量获取提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.getBatchPrompts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return next(new AppError('提示词ID列表不能为空', 'VALIDATION_ERROR', 400));
    }
    
    const prompts = await Prompt.find({
      _id: { $in: ids },
      user: req.user._id
    }).populate('tags', 'name color');
    
    return successResponse(res, prompts);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取最近使用的提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.getRecentPrompts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const prompts = await Prompt.find({
      user: req.user._id
    })
    .sort('-updatedAt')
    .limit(limit)
    .populate('tags', 'name color');
    
    return successResponse(res, prompts);
  } catch (error) {
    next(error);
  }
};

/**
 * 搜索提示词（用于快速查找）
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.quickSearchPrompts = async (req, res, next) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit, 10) || 5;
    
    if (!query) {
      return next(new AppError('搜索关键词不能为空', 'VALIDATION_ERROR', 400));
    }
    
    // 构建查询条件
    const searchQuery = {
      user: req.user._id,
      $or: [
        { content: { $regex: query, $options: 'i' } }
      ]
    };
    
    // 执行查询
    const prompts = await Prompt.find(searchQuery)
      .sort({ favorite: -1, usageCount: -1, updatedAt: -1 }) // 收藏>高频使用>最近使用
      .limit(limit)
      .select('content favorite usageCount');
    
    return successResponse(res, prompts);
  } catch (error) {
    next(error);
  }
}; 