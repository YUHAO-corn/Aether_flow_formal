const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse, notFoundResponse, forbiddenResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * 获取活动日志列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 活动日志列表和分页信息
 */
const getActivities = async (req, res) => {
  try {
    // 构建查询条件
    const query = { user: req.user.id };
    
    // 按操作类型筛选
    if (req.query.action) {
      query.action = req.query.action;
    }
    
    // 按实体类型筛选
    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }
    
    // 按实体ID筛选
    if (req.query.entityId) {
      query.entityId = req.query.entityId;
    }
    
    // 按日期范围筛选
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // 排序
    const sort = req.query.sort || '-createdAt';
    
    // 查询活动日志
    const activities = await ActivityLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // 获取总数
    const total = await ActivityLog.countDocuments(query);
    
    return successResponse(res, {
      results: activities.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: activities
    });
  } catch (err) {
    logger.error(`获取活动日志失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取活动统计信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 活动统计信息
 */
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 默认为过去30天
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // 验证日期格式
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse(res, '无效的日期格式', 'INVALID_DATE_FORMAT', 400);
    }
    
    // 按操作类型统计
    const actionStats = await ActivityLog.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // 按实体类型统计
    const entityStats = await ActivityLog.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // 按日期统计
    const dateStats = await ActivityLog.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return successResponse(res, {
      actionStats,
      entityStats,
      dateStats,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  } catch (error) {
    logger.error(`获取活动统计失败: ${error.message}`, { error, userId: req.user?.id });
    return errorResponse(res, '获取活动统计失败', 'FETCH_ACTIVITY_STATS_ERROR', 500);
  }
};

/**
 * 清除活动日志
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 清除结果
 */
const clearActivities = async (req, res) => {
  try {
    const { olderThan } = req.query;
    
    let query = { user: req.user.id };
    
    // 如果指定了日期，则删除该日期之前的日志
    if (olderThan) {
      const date = new Date(olderThan);
      
      // 验证日期格式
      if (isNaN(date.getTime())) {
        return errorResponse(res, '无效的日期格式', 'INVALID_DATE_FORMAT', 400);
      }
      
      query.createdAt = { $lt: date };
    }
    
    // 执行删除操作
    const result = await ActivityLog.deleteMany(query);
    
    // 记录清除活动的操作
    await ActivityLog.create({
      user: req.user.id,
      action: 'clear_activities',
      entityType: 'activity_log',
      details: {
        count: result.deletedCount,
        olderThan: olderThan || 'all'
      }
    });
    
    return successResponse(res, {
      message: `已清除${result.deletedCount}条活动日志`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error(`清除活动日志失败: ${error.message}`, { error, userId: req.user?.id });
    return errorResponse(res, '清除活动日志失败', 'CLEAR_ACTIVITIES_ERROR', 500);
  }
};

/**
 * 获取单个活动记录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 活动记录
 */
const getActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, '无效的活动ID', 'INVALID_ID', 400);
    }
    
    // 查找活动记录
    const activity = await ActivityLog.findById(id);
    
    // 检查活动是否存在
    if (!activity) {
      return notFoundResponse(res, '未找到活动记录');
    }
    
    // 检查权限（只能查看自己的活动）
    if (activity.user.toString() !== req.user.id) {
      return forbiddenResponse(res, '无权访问此活动记录');
    }
    
    return successResponse(res, { activity });
  } catch (error) {
    logger.error(`获取活动记录失败: ${error.message}`, { error, userId: req.user?.id });
    return errorResponse(res, '获取活动记录失败', 'FETCH_ACTIVITY_ERROR', 500);
  }
};

module.exports = {
  getActivities,
  getActivityStats,
  clearActivities,
  getActivity
}; 