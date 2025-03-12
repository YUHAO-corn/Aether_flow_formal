const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: function() {
      // 默认使用创建时间作为标题
      return `Conversation ${new Date().toLocaleString()}`;
    }
  },
  messages: [messageSchema],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true // 自动添加createdAt和updatedAt字段
});

// 索引
conversationSchema.index({ user: 1, createdAt: -1 }); // 按用户和创建时间查询
conversationSchema.index({ tags: 1 }); // 按标签查询

// 查询中间件：填充标签
conversationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tags',
    select: 'name color'
  });
  next();
});

// 创建Conversation模型
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 