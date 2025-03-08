const Tag = require('../models/Tag');
const Prompt = require('../models/Prompt');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../middlewares/errorHandler').AppError;
const { successResponse, createdResponse, notFoundResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

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
    
    return successResponse(res, {
      results: tagsWithCount.length,
      data: tagsWithCount
    });
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
      action: 'create',
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
      action: 'update',
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
      action: 'delete',
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