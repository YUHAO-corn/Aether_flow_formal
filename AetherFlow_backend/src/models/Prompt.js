const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Prompt content is required'],
    trim: true
  },
  response: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  favorite: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  metrics: {
    clarity: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    specificity: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    creativity: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    relevance: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    effectiveness: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    }
  }
}, {
  timestamps: true // 自动添加createdAt和updatedAt字段
});

// 创建索引
promptSchema.index({ user: 1, createdAt: -1 }); // 按用户和创建时间查询
promptSchema.index({ tags: 1 }); // 按标签查询
promptSchema.index({ favorite: 1 }); // 按收藏状态查询
promptSchema.index({ content: 'text' }); // 全文搜索

// 虚拟字段：平均评分
promptSchema.virtual('averageRating').get(function() {
  const metrics = this.metrics;
  const values = Object.values(metrics).filter(value => value !== null);
  
  if (values.length === 0) return null;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
});

// 查询中间件：填充标签
promptSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tags',
    select: 'name color'
  });
  next();
});

// 创建Prompt模型
const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt; 