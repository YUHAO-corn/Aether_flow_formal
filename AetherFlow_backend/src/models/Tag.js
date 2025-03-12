const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  color: {
    type: String,
    default: '#3498db', // 默认蓝色
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  }
}, {
  timestamps: true // 自动添加createdAt和updatedAt字段
});

// 复合索引：确保每个用户的标签名称唯一
tagSchema.index({ user: 1, name: 1 }, { unique: true });

// 创建Tag模型
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag; 