/**
 * 加密工具模块
 * 提供API密钥加密和解密功能
 */

const crypto = require('crypto');

// 获取加密密钥
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('加密密钥未设置');
  }
  return Buffer.from(key, 'utf8');
};

/**
 * 加密API密钥
 * @param {string} apiKey - 需要加密的API密钥
 * @returns {Object} 包含加密后的密钥和初始化向量
 */
const encryptApiKey = (apiKey) => {
  try {
    const iv = crypto.randomBytes(16);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encryptedKey: encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('加密API密钥失败:', error);
    throw error;
  }
};

/**
 * 解密API密钥
 * @param {string} encryptedKey - 加密后的API密钥
 * @param {string} iv - 初始化向量（十六进制字符串）
 * @returns {string} 解密后的API密钥
 */
const decryptApiKey = (encryptedKey, iv) => {
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('解密API密钥失败:', error);
    throw error;
  }
};

/**
 * 模拟加密API密钥（用于测试）
 * @param {string} apiKey - 需要模拟加密的API密钥
 * @returns {Object} 包含模拟加密后的密钥和初始化向量
 */
const mockEncryptKey = (apiKey) => {
  const iv = crypto.randomBytes(16);
  // 使用固定的测试密钥
  return {
    encryptedKey: `mock-encrypted-${apiKey}`,
    iv: iv.toString('hex')
  };
};

/**
 * 模拟解密API密钥（用于测试）
 * @param {string} encryptedKey - 模拟加密后的API密钥
 * @param {string} iv - 初始化向量
 * @returns {string} 模拟解密后的API密钥
 */
const mockDecryptKey = (encryptedKey, iv) => {
  // 从加密字符串中提取原始密钥
  return encryptedKey.replace('mock-encrypted-', '');
};

// 根据环境导出不同的函数
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    encryptApiKey: mockEncryptKey,
    decryptApiKey: mockDecryptKey,
    mockEncryptKey,
    mockDecryptKey
  };
} else {
  module.exports = {
    encryptApiKey,
    decryptApiKey,
    // 在非测试环境中也导出模拟函数，以便在需要时使用
    mockEncryptKey,
    mockDecryptKey
  };
} 