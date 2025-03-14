const { Prompt, Tag, ActivityLog, User } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createdResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHandler');
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
      queryObj.content = { $regex: req.query.search, $options: 'i' };
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
    return paginatedResponse(res, prompts, page, limit, total);
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
 * @route POST /api/prompts/auto-save
 * @access Private
 */
exports.autoSavePrompt = async (req, res, next) => {
  try {
    const { content, response, platform, url } = req.body;
    
    // 获取用户ID
    const userId = req.user.id;
    
    // 检查是否已存在相同内容的提示词（防止重复保存）
    const existingPrompt = await Prompt.findOne({
      user: userId,
      content: content,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24小时内
    });
    
    if (existingPrompt) {
      return res.status(200).json({
        success: true,
        message: '提示词已存在',
        prompt: existingPrompt
      });
    }
    
    // 创建新提示词
    const newPrompt = new Prompt({
      user: userId,
      title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      content: content,
      response: response || '',
      tags: ['auto-saved'],
      source: {
        platform: platform || 'Unknown',
        url: url || ''
      },
      isAutoSaved: true
    });
    
    // 保存到数据库
    await newPrompt.save();
    
    // 更新用户的提示词计数
    await User.findByIdAndUpdate(userId, { $inc: { promptCount: 1 } });
    
    res.status(201).json({
      success: true,
      message: '提示词已自动保存',
      prompt: newPrompt
    });
  } catch (error) {
    next(new AppError('自动保存提示词失败', 500));
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
    
    // 执行查询
    const prompts = await Prompt.find({
      user: req.user._id,
      content: { $regex: query, $options: 'i' }
    })
    .sort('-updatedAt')
    .limit(limit)
    .select('content favorite usageCount');
    
    return successResponse(res, prompts);
  } catch (error) {
    next(error);
  }
};

/**
 * 批量操作提示词（更新或删除）
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.bulkOperationPrompts = async (req, res, next) => {
  try {
    const { operation, promptIds, data } = req.body;
    
    if (!promptIds || !Array.isArray(promptIds) || promptIds.length === 0) {
      return next(new AppError('请提供有效的提示词ID列表', 400));
    }
    
    // 验证所有提示词是否属于当前用户
    const prompts = await Prompt.find({
      _id: { $in: promptIds },
      user: req.user._id
    });
    
    if (prompts.length !== promptIds.length) {
      return next(new AppError('部分提示词不存在或不属于当前用户', 404));
    }
    
    let result;
    let actionType;
    
    // 根据操作类型执行不同的批量操作
    switch (operation) {
      case 'update':
        if (!data) {
          return next(new AppError('更新操作需要提供数据', 400));
        }
        
        // 允许批量更新的字段
        const allowedFields = ['tags', 'favorite', 'title'];
        const updateData = {};
        
        Object.keys(data).forEach(key => {
          if (allowedFields.includes(key)) {
            updateData[key] = data[key];
          }
        });
        
        if (Object.keys(updateData).length === 0) {
          return next(new AppError('没有提供有效的更新字段', 400));
        }
        
        // 执行批量更新
        result = await Prompt.updateMany(
          { _id: { $in: promptIds }, user: req.user._id },
          { $set: updateData }
        );
        
        actionType = 'update_prompts_bulk';
        break;
        
      case 'delete':
        // 执行批量删除
        result = await Prompt.deleteMany({
          _id: { $in: promptIds },
          user: req.user._id
        });
        
        actionType = 'delete_prompts_bulk';
        break;
        
      default:
        return next(new AppError('不支持的操作类型', 400));
    }
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: actionType,
      entityType: 'Prompt',
      details: {
        promptCount: promptIds.length,
        operation
      }
    });
    
    return successResponse(res, {
      message: `成功${operation === 'update' ? '更新' : '删除'}${promptIds.length}个提示词`,
      data: {
        count: operation === 'update' ? result.modifiedCount : result.deletedCount,
        promptIds
      }
    });
  } catch (err) {
    logger.error(`批量操作提示词失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 导出提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.exportPrompts = async (req, res, next) => {
  try {
    const { format = 'json', promptIds } = req.query;
    
    // 构建查询条件
    const queryObj = { user: req.user._id };
    
    // 如果提供了特定的提示词ID列表，则只导出这些提示词
    if (promptIds) {
      const ids = promptIds.split(',');
      queryObj._id = { $in: ids };
    }
    
    // 查询提示词
    const prompts = await Prompt.find(queryObj)
      .populate('tags', 'name color')
      .sort('-createdAt');
    
    if (prompts.length === 0) {
      return next(new AppError('没有找到可导出的提示词', 404));
    }
    
    // 准备导出数据
    const exportData = prompts.map(prompt => {
      const promptObj = prompt.toObject();
      
      // 转换标签为名称数组，便于导入
      if (promptObj.tags && promptObj.tags.length > 0) {
        promptObj.tagNames = promptObj.tags.map(tag => tag.name);
      }
      
      // 移除不需要的字段
      delete promptObj._id;
      delete promptObj.__v;
      delete promptObj.user;
      
      return promptObj;
    });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'export_prompts',
      entityType: 'Prompt',
      details: {
        count: prompts.length,
        format
      }
    });
    
    // 根据请求的格式返回数据
    if (format === 'csv') {
      // 生成CSV格式
      const fields = ['title', 'content', 'response', 'platform', 'url', 'tagNames', 'favorite', 'createdAt', 'updatedAt'];
      const csv = [];
      
      // 添加标题行
      csv.push(fields.join(','));
      
      // 添加数据行
      exportData.forEach(prompt => {
        const row = fields.map(field => {
          let value = prompt[field];
          
          // 处理特殊字段
          if (field === 'tagNames' && Array.isArray(value)) {
            value = value.join('|');
          }
          
          // 处理包含逗号的字段
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value !== undefined ? value : '';
        });
        
        csv.push(row.join(','));
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=prompts.csv');
      return res.send(csv.join('\n'));
    } else {
      // 默认返回JSON格式
      return successResponse(res, {
        data: exportData,
        count: exportData.length
      });
    }
  } catch (err) {
    logger.error(`导出提示词失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 导入提示词
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.importPrompts = async (req, res, next) => {
  try {
    const { prompts } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return next(new AppError('请提供有效的提示词数据', 400));
    }
    
    // 处理导入的提示词
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // 获取用户的所有标签，用于标签名称到ID的映射
    const userTags = await Tag.find({ user: req.user._id });
    const tagNameToId = {};
    userTags.forEach(tag => {
      tagNameToId[tag.name.toLowerCase()] = tag._id;
    });
    
    // 处理每个提示词
    for (const promptData of prompts) {
      try {
        // 准备提示词数据
        const newPrompt = {
          user: req.user._id,
          content: promptData.content,
          title: promptData.title || '',
          response: promptData.response || '',
          platform: promptData.platform || '',
          url: promptData.url || '',
          favorite: !!promptData.favorite
        };
        
        // 处理标签
        if (promptData.tagNames && Array.isArray(promptData.tagNames)) {
          newPrompt.tags = [];
          
          for (const tagName of promptData.tagNames) {
            const normalizedTagName = tagName.toLowerCase();
            
            // 如果标签已存在，使用现有标签ID
            if (tagNameToId[normalizedTagName]) {
              newPrompt.tags.push(tagNameToId[normalizedTagName]);
            } else {
              // 创建新标签
              const newTag = await Tag.create({
                name: tagName,
                user: req.user._id,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16) // 随机颜色
              });
              
              tagNameToId[normalizedTagName] = newTag._id;
              newPrompt.tags.push(newTag._id);
            }
          }
        }
        
        // 创建提示词
        await Prompt.create(newPrompt);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          content: promptData.content?.substring(0, 50) + '...',
          error: err.message
        });
      }
    }
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'import_prompts',
      entityType: 'Prompt',
      details: {
        total: prompts.length,
        success: results.success,
        failed: results.failed
      }
    });
    
    return successResponse(res, {
      message: `成功导入${results.success}个提示词，失败${results.failed}个`,
      data: results
    });
  } catch (err) {
    logger.error(`导入提示词失败: ${err.message}`);
    return next(err);
  }
}; 