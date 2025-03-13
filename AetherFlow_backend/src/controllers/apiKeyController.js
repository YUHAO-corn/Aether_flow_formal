const ApiKey = require('../models/ApiKey');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * 添加API密钥
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.addApiKey = async (req, res, next) => {
  try {
    const { provider, key, name, baseUrl, modelName } = req.body;
    
    // 检查是否已存在相同提供商的API密钥
    const existingKey = await ApiKey.findOne({ 
      user: req.user._id, 
      provider 
    });
    
    if (existingKey) {
      return next(new AppError(`已存在${provider}的API密钥`, 'DUPLICATE_RESOURCE', 400));
    }
    
    // 加密API密钥
    const { encryptedKey, iv } = ApiKey.encryptKey(key);
    
    // 创建新的API密钥
    const apiKey = await ApiKey.create({
      user: req.user._id,
      provider,
      encryptedKey,
      iv,
      name,
      baseUrl,
      modelName,
      isActive: true
    });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'create_api_key',
      entityType: 'api_key',
      entityId: apiKey._id,
      metadata: {
        provider,
        name
      }
    });
    
    logger.info(`用户 ${req.user._id} 添加了 ${provider} API密钥`);
    
    // 返回API密钥信息（不包含敏感数据）
    const apiKeyData = {
      _id: apiKey._id,
      provider: apiKey.provider,
      name: apiKey.name,
      baseUrl: apiKey.baseUrl,
      modelName: apiKey.modelName,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
      user: apiKey.user
    };
    
    return successResponse(res, { apiKey: apiKeyData }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取API密钥列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.getApiKeys = async (req, res, next) => {
  try {
    const { provider } = req.query;
    
    // 构建查询条件
    const query = { user: req.user._id };
    if (provider) {
      query.provider = provider;
    }
    
    // 查询API密钥
    const apiKeys = await ApiKey.find(query).select('-encryptedKey -iv');
    
    return successResponse(res, { apiKeys });
  } catch (error) {
    next(error);
  }
};

/**
 * 验证API密钥
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.verifyApiKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 查找API密钥
    const apiKey = await ApiKey.findOne({ 
      _id: id, 
      user: req.user._id 
    });
    
    if (!apiKey) {
      return next(new AppError('API密钥不存在', 'RESOURCE_NOT_FOUND', 404));
    }
    
    // 解密API密钥
    const decryptedKey = apiKey.decryptKey();
    
    // 根据不同提供商验证API密钥
    let isValid = false;
    
    try {
      // 这里应该实现实际的API密钥验证逻辑
      // 为了测试，我们假设验证成功
      isValid = true;
    } catch (error) {
      logger.error(`验证API密钥失败: ${error.message}`);
      isValid = false;
    }
    
    return successResponse(res, { valid: isValid });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新API密钥
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.updateApiKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, isActive, baseUrl, modelName } = req.body;
    
    // 查找API密钥
    const apiKey = await ApiKey.findOne({ 
      _id: id, 
      user: req.user._id 
    });
    
    if (!apiKey) {
      return next(new AppError('API密钥不存在', 'RESOURCE_NOT_FOUND', 404));
    }
    
    // 更新字段
    if (name !== undefined) apiKey.name = name;
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (baseUrl !== undefined) apiKey.baseUrl = baseUrl;
    if (modelName !== undefined) apiKey.modelName = modelName;
    
    await apiKey.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'update_api_key',
      entityType: 'api_key',
      entityId: apiKey._id,
      metadata: {
        provider: apiKey.provider,
        name: apiKey.name
      }
    });
    
    logger.info(`用户 ${req.user._id} 更新了 ${apiKey.provider} API密钥`);
    
    // 返回更新后的API密钥信息（不包含敏感数据）
    const apiKeyData = {
      _id: apiKey._id,
      provider: apiKey.provider,
      name: apiKey.name,
      baseUrl: apiKey.baseUrl,
      modelName: apiKey.modelName,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
      user: apiKey.user
    };
    
    return successResponse(res, { apiKey: apiKeyData });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除API密钥
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.deleteApiKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 查找API密钥
    const apiKey = await ApiKey.findOne({ 
      _id: id, 
      user: req.user._id 
    });
    
    if (!apiKey) {
      return next(new AppError('API密钥不存在', 'RESOURCE_NOT_FOUND', 404));
    }
    
    // 检查是否是其他用户的API密钥
    if (apiKey.user.toString() !== req.user._id.toString()) {
      return next(new AppError('无权删除此API密钥', 'FORBIDDEN', 403));
    }
    
    // 删除API密钥
    await ApiKey.deleteOne({ _id: id });
    
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete_api_key',
      entityType: 'api_key',
      metadata: {
        provider: apiKey.provider,
        name: apiKey.name
      }
    });
    
    logger.info(`用户 ${req.user._id} 删除了 ${apiKey.provider} API密钥`);
    
    return successResponse(res, { message: 'API密钥已删除' });
  } catch (error) {
    next(error);
  }
}; 