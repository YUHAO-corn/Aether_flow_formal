const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['openai', 'deepseek', 'moonshot', 'custom']
  },
  // 加密存储API密钥
  encryptedKey: {
    type: String,
    required: true
  },
  // 初始化向量，用于加密/解密
  iv: {
    type: String,
    required: true
  },
  // 自定义API的基础URL（仅当provider为custom时使用）
  baseUrl: {
    type: String
  },
  // 自定义API的模型名称（仅当provider为custom时使用）
  modelName: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 索引
apiKeySchema.index({ user: 1, provider: 1 }, { unique: true });

// 加密API密钥
apiKeySchema.statics.encryptKey = function(apiKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex')
  };
};

// 解密API密钥
apiKeySchema.methods.decryptKey = function() {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    Buffer.from(this.iv, 'hex')
  );
  let decrypted = decipher.update(this.encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey; 