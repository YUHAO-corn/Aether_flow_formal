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
  const key = Buffer.alloc(32); // 创建32字节的缓冲区
  Buffer.from(process.env.ENCRYPTION_KEY, 'hex').copy(key); // 将加密密钥复制到缓冲区
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex')
  };
};

// 解密API密钥
apiKeySchema.methods.decryptKey = function() {
  const key = Buffer.alloc(32); // 创建32字节的缓冲区
  Buffer.from(process.env.ENCRYPTION_KEY, 'hex').copy(key); // 将加密密钥复制到缓冲区
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    Buffer.from(this.iv, 'hex')
  );
  let decrypted = decipher.update(this.encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey; 