const Conversation = require('../models/Conversation');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../middlewares/errorHandler').AppError;
const { successResponse, createdResponse, notFoundResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * 获取用户的所有会话
 * @route GET /api/v1/conversations
 * @access 私有
 */
exports.getConversations = async (req, res, next) => {
  try {
    // 构建查询条件
    const query = { user: req.user.id };
    
    // 搜索功能
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    // 按模型筛选
    if (req.query.model) {
      query.model = req.query.model;
    }
    
    // 按标签筛选
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // 排序
    const sort = req.query.sort || '-updatedAt';
    
    // 查询会话
    const conversations = await Conversation.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('tags', 'name color')
      .select('-messages'); // 不返回消息内容，减少数据量
    
    // 获取总数
    const total = await Conversation.countDocuments(query);
    
    return successResponse(res, {
      results: conversations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: conversations
    });
  } catch (err) {
    logger.error(`获取会话列表失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 创建新会话
 * @route POST /api/v1/conversations
 * @access 私有
 */
exports.createConversation = async (req, res, next) => {
  try {
    // 创建新会话
    const newConversation = await Conversation.create({
      user: req.user.id,
      model: req.body.model,
      title: req.body.title || '新会话',
      messages: req.body.messages || [],
      tags: req.body.tags || []
    });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'create_conversation',
      entityType: 'Conversation',
      entityId: newConversation._id,
      details: { title: newConversation.title }
    });
    
    // 返回创建的会话（包括填充标签信息）
    const conversation = await Conversation.findById(newConversation._id)
      .populate('tags', 'name color');
    
    return createdResponse(res, {
      data: conversation
    });
  } catch (err) {
    logger.error(`创建会话失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取单个会话
 * @route GET /api/v1/conversations/:id
 * @access 私有
 */
exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('tags', 'name color');
    
    if (!conversation) {
      return notFoundResponse(res, '未找到该会话');
    }
    
    return successResponse(res, {
      data: conversation
    });
  } catch (err) {
    logger.error(`获取会话详情失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 更新会话
 * @route PATCH /api/v1/conversations/:id
 * @access 私有
 */
exports.updateConversation = async (req, res, next) => {
  try {
    // 检查会话是否存在
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!conversation) {
      return notFoundResponse(res, '未找到该会话');
    }
    
    // 更新会话
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        tags: req.body.tags
      },
      { new: true, runValidators: true }
    ).populate('tags', 'name color');
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'update_conversation',
      entityType: 'Conversation',
      entityId: updatedConversation._id,
      details: { title: updatedConversation.title }
    });
    
    return successResponse(res, {
      data: updatedConversation
    });
  } catch (err) {
    logger.error(`更新会话失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 删除会话
 * @route DELETE /api/v1/conversations/:id
 * @access 私有
 */
exports.deleteConversation = async (req, res, next) => {
  try {
    // 检查会话是否存在
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!conversation) {
      return notFoundResponse(res, '未找到该会话');
    }
    
    // 删除会话
    await Conversation.findByIdAndDelete(req.params.id);
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete_conversation',
      entityType: 'Conversation',
      entityId: req.params.id,
      details: { title: conversation.title }
    });
    
    return successResponse(res, {
      message: '会话已成功删除'
    });
  } catch (err) {
    logger.error(`删除会话失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取会话的所有消息
 * @route GET /api/v1/conversations/:id/messages
 * @access 私有
 */
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).select('messages');
    
    if (!conversation) {
      return notFoundResponse(res, '未找到该会话');
    }
    
    return successResponse(res, {
      data: conversation.messages
    });
  } catch (err) {
    logger.error(`获取会话消息失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 添加消息到会话
 * @route POST /api/v1/conversations/:id/messages
 * @access 私有
 */
exports.addMessage = async (req, res, next) => {
  try {
    // 检查会话是否存在
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!conversation) {
      return notFoundResponse(res, '未找到该会话');
    }
    
    // 添加新消息
    const newMessage = {
      role: req.body.role,
      content: req.body.content
    };
    
    conversation.messages.push(newMessage);
    await conversation.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'add_message',
      entityType: 'Conversation',
      entityId: conversation._id,
      details: { messageId: conversation.messages[conversation.messages.length - 1]._id }
    });
    
    return successResponse(res, {
      data: newMessage
    });
  } catch (err) {
    logger.error(`添加消息失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 清空会话消息
 * @route DELETE /api/v1/conversations/:id/messages
 * @access 私有
 */
exports.clearMessages = async (req, res, next) => {
  try {
    // 检查会话是否存在
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!conversation) {
      return notFoundResponse(res, '未找到该会话');
    }
    
    // 清空消息
    conversation.messages = [];
    await conversation.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'clear_messages',
      entityType: 'Conversation',
      entityId: conversation._id,
      details: { title: conversation.title }
    });
    
    return successResponse(res, {
      message: '会话消息已清空'
    });
  } catch (err) {
    logger.error(`清空会话消息失败: ${err.message}`);
    return next(err);
  }
}; 