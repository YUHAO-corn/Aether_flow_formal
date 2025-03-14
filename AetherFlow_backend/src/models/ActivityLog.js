const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 
      'logout', 
      'register', 
      'create_prompt', 
      'update_prompt', 
      'delete_prompt', 
      'favorite_prompt', 
      'use_prompt',
      'auto_save_prompt',
      'create_tag',
      'update_tag',
      'delete_tag',
      'create_conversation',
      'update_conversation',
      'delete_conversation',
      'add_message',
      'clear_messages',
      'enhance_prompt',
      'optimize',
      'rate_optimization',
      'create_api_key',
      'update_api_key',
      'delete_api_key',
      'clear_activities'
    ]
  },
  entityType: {
    type: String,
    enum: ['User', 'Prompt', 'Tag', 'Conversation', 'OptimizationHistory', 'ApiKey', 'prompt', 'tag', 'conversation', 'api_key', 'activity_log', null],
    default: null
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true // 自动添加createdAt和updatedAt字段
});

// 索引
activityLogSchema.index({ user: 1, createdAt: -1 }); // 按用户和时间查询
activityLogSchema.index({ action: 1 }); // 按操作类型查询
activityLogSchema.index({ entityType: 1, entityId: 1 }); // 按实体查询

// 创建ActivityLog模型
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog; 