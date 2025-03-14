const Tag = require('../models/Tag');
const Prompt = require('../models/Prompt');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../middlewares/errorHandler').AppError;
const { successResponse, createdResponse, notFoundResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const responseHandler = require('../utils/responseHandler');

/**
 * 获取用户的所有标签
 * @route GET /api/v1/tags
 * @access 私有
 */
exports.getTags = async (req, res, next) => {
  try {
    const query = { user: req.user.id };
    
    // 搜索功能
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // 排序
    const sort = req.query.sort || 'name';
    
    // 查询标签
    const tags = await Tag.find(query).sort(sort);
    
    // 获取每个标签关联的提示词数量
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await Prompt.countDocuments({ 
          user: req.user.id, 
          tags: tag._id 
        });
        
        return {
          _id: tag._id,
          name: tag.name,
          color: tag.color,
          promptCount: count,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt
        };
      })
    );
    
    // 直接返回标签数组，让responseHandler处理格式转换
    return responseHandler.successResponse(res, tagsWithCount);
  } catch (err) {
    logger.error(`获取标签列表失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 创建新标签
 * @route POST /api/v1/tags
 * @access 私有
 */
exports.createTag = async (req, res, next) => {
  try {
    // 检查是否已存在同名标签
    const existingTag = await Tag.findOne({
      user: req.user.id,
      name: req.body.name
    });
    
    if (existingTag) {
      return next(new AppError('已存在同名标签', 400));
    }
    
    // 创建新标签
    const newTag = await Tag.create({
      user: req.user.id,
      name: req.body.name,
      color: req.body.color || '#3498db' // 默认蓝色
    });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'create_tag',
      entityType: 'Tag',
      entityId: newTag._id,
      details: { name: newTag.name }
    });
    
    return createdResponse(res, {
      data: newTag
    });
  } catch (err) {
    logger.error(`创建标签失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取单个标签
 * @route GET /api/v1/tags/:id
 * @access 私有
 */
exports.getTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!tag) {
      return notFoundResponse(res, '未找到该标签');
    }
    
    // 获取标签关联的提示词数量
    const promptCount = await Prompt.countDocuments({ 
      user: req.user.id, 
      tags: tag._id 
    });
    
    const tagData = {
      _id: tag._id,
      name: tag.name,
      color: tag.color,
      promptCount,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    };
    
    return successResponse(res, {
      data: tagData
    });
  } catch (err) {
    logger.error(`获取标签详情失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 更新标签
 * @route PATCH /api/v1/tags/:id
 * @access 私有
 */
exports.updateTag = async (req, res, next) => {
  try {
    // 检查标签是否存在
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!tag) {
      return notFoundResponse(res, '未找到该标签');
    }
    
    // 如果要更新名称，检查是否与其他标签重名
    if (req.body.name && req.body.name !== tag.name) {
      const existingTag = await Tag.findOne({
        user: req.user.id,
        name: req.body.name,
        _id: { $ne: tag._id }
      });
      
      if (existingTag) {
        return next(new AppError('已存在同名标签', 400));
      }
    }
    
    // 更新标签
    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        color: req.body.color
      },
      { new: true, runValidators: true }
    );
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'update_tag',
      entityType: 'Tag',
      entityId: updatedTag._id,
      details: { name: updatedTag.name }
    });
    
    return successResponse(res, {
      data: updatedTag
    });
  } catch (err) {
    logger.error(`更新标签失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 删除标签
 * @route DELETE /api/v1/tags/:id
 * @access 私有
 */
exports.deleteTag = async (req, res, next) => {
  try {
    // 检查标签是否存在
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!tag) {
      return notFoundResponse(res, '未找到该标签');
    }
    
    // 从所有提示词中移除该标签
    await Prompt.updateMany(
      { user: req.user.id, tags: tag._id },
      { $pull: { tags: tag._id } }
    );
    
    // 删除标签
    await Tag.findByIdAndDelete(req.params.id);
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete_tag',
      entityType: 'Tag',
      entityId: req.params.id,
      details: { name: tag.name }
    });
    
    return successResponse(res, {
      message: '标签已成功删除'
    });
  } catch (err) {
    logger.error(`删除标签失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取标签关联的所有提示词
 * @route GET /api/v1/tags/:id/prompts
 * @access 私有
 */
exports.getTagPrompts = async (req, res, next) => {
  try {
    // 检查标签是否存在
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!tag) {
      return notFoundResponse(res, '未找到该标签');
    }
    
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // 排序
    const sort = req.query.sort || '-createdAt';
    
    // 查询标签关联的提示词
    const prompts = await Prompt.find({
      user: req.user.id,
      tags: tag._id
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('tags', 'name color');
    
    // 获取总数
    const total = await Prompt.countDocuments({
      user: req.user.id,
      tags: tag._id
    });
    
    return successResponse(res, {
      results: prompts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: prompts
    });
  } catch (err) {
    logger.error(`获取标签关联提示词失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取所有标签
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.getAllTags = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { user: req.user.id };
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const tags = await Tag.find(filter).sort({ name: 1 });
    
    // 计算每个标签关联的提示词数量
    for (const tag of tags) {
      const promptCount = await Prompt.countDocuments({ user: req.user.id, tags: tag._id });
      tag.promptCount = promptCount;
    }
    
    // 直接返回标签数组，让responseHandler处理格式转换
    return responseHandler.successResponse(res, tags);
  } catch (error) {
    logger.error(`获取标签失败: ${error.message}`);
    return responseHandler.errorResponse(res, '获取标签失败', 'TAG_FETCH_ERROR');
  }
};

/**
 * 获取标签统计信息
 * @route GET /api/v1/tags/statistics
 * @access 私有
 */
exports.getTagStatistics = async (req, res, next) => {
  try {
    // 获取用户所有标签
    const tags = await Tag.find({ user: req.user.id });
    
    // 统计结果
    const statistics = {
      totalTags: tags.length,
      tagsWithPrompts: 0,
      mostUsedTags: [],
      recentlyCreatedTags: [],
      promptDistribution: []
    };
    
    // 获取每个标签的提示词数量
    const tagStats = await Promise.all(
      tags.map(async (tag) => {
        const promptCount = await Prompt.countDocuments({ 
          user: req.user.id, 
          tags: tag._id 
        });
        
        return {
          _id: tag._id,
          name: tag.name,
          color: tag.color,
          promptCount,
          createdAt: tag.createdAt
        };
      })
    );
    
    // 计算有关联提示词的标签数量
    statistics.tagsWithPrompts = tagStats.filter(tag => tag.promptCount > 0).length;
    
    // 获取使用最多的前5个标签
    statistics.mostUsedTags = [...tagStats]
      .sort((a, b) => b.promptCount - a.promptCount)
      .slice(0, 5);
    
    // 获取最近创建的5个标签
    statistics.recentlyCreatedTags = [...tagStats]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    // 计算提示词分布
    statistics.promptDistribution = tagStats.map(tag => ({
      name: tag.name,
      value: tag.promptCount,
      color: tag.color
    }));
    
    // 获取未分类的提示词数量
    const untaggedPromptsCount = await Prompt.countDocuments({
      user: req.user.id,
      tags: { $size: 0 }
    });
    
    if (untaggedPromptsCount > 0) {
      statistics.promptDistribution.push({
        name: '未分类',
        value: untaggedPromptsCount,
        color: '#cccccc'
      });
    }
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'view_tag_statistics',
      entityType: 'Tag',
      details: { totalTags: statistics.totalTags }
    });
    
    return successResponse(res, {
      data: statistics
    });
  } catch (err) {
    logger.error(`获取标签统计信息失败: ${err.message}`);
    return next(err);
  }
}; 