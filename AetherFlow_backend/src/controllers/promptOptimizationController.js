const promptOptimizationService = require('../services/promptOptimizationService');
const OptimizationHistory = require('../models/OptimizationHistory');
const ApiKey = require('../models/ApiKey');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * 获取客户端配置
 * @route GET /api/v1/prompts/optimize/config
 * @access 私有
 */
exports.getClientConfig = async (req, res, next) => {
  try {
    const config = promptOptimizationService.getClientConfig();
    return successResponse(res, {
      data: config
    });
  } catch (err) {
    logger.error(`获取客户端配置失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 优化提示词
 * @route POST /api/v1/prompts/optimize
 * @access 私有
 */
exports.optimizePrompt = async (req, res, next) => {
  try {
    const {
      content,
      category = 'general',
      provider = 'openai',
      model,
      useClientApi = false,
      historyId,
      apiKey
    } = req.body;
    
    if (!content) {
      return errorResponse(res, '提示词内容不能为空', 400);
    }
    
    let finalApiKey = apiKey;
    let useMockData = false;
    
    // 如果不使用客户端提供的API密钥，则从数据库获取
    if (!useClientApi && !apiKey) {
      // 尝试从数据库获取用户的API密钥
      const userApiKey = await ApiKey.findOne({
        user: req.user.id,
        provider,
        isActive: true
      });
      
      if (userApiKey) {
        finalApiKey = userApiKey.decryptKey();
      } else {
        // 如果用户没有设置API密钥，则使用系统密钥
        finalApiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
        
        if (!finalApiKey) {
          logger.warn(`未配置${provider}的API密钥，将使用模拟数据`);
          useMockData = true;
        }
      }
    }
    
    let previousOptimized = null;
    let optimizationHistory = null;
    
    // 如果提供了历史ID，则获取上一轮优化结果
    if (historyId) {
      optimizationHistory = await OptimizationHistory.findOne({
        _id: historyId,
        user: req.user.id
      });
      
      if (optimizationHistory) {
        previousOptimized = optimizationHistory.optimizedPrompt;
      }
    }
    
    let result;
    
    if (useMockData) {
      // 使用模拟数据
      result = {
        optimizedPrompt: `${content}\n\n以下是优化后的提示词：\n\n请详细描述${content.replace(/[？?]$/, '')}的背景、目的和具体要求。包括：\n1. 你希望得到什么样的输出格式\n2. 需要包含哪些关键信息\n3. 有什么特殊的限制条件\n4. 期望的详细程度和专业水平`,
        improvements: "1. 添加了明确的输出格式要求\n2. 要求指定背景和目的\n3. 增加了关键信息的提示\n4. 明确了详细程度和专业水平的要求",
        expectedBenefits: "1. 提高回答的针对性\n2. 确保输出格式符合期望\n3. 减少模糊不清的表述\n4. 获得更专业、更有深度的回答",
        provider,
        model: model || 'gpt-3.5-turbo-mock'
      };
      logger.info(`使用模拟数据进行提示词优化`);
    } else {
      // 调用优化服务
      result = await promptOptimizationService.optimizePrompt({
        content,
        category,
        provider,
        model,
        apiKey: finalApiKey,
        previousOptimized
      });
    }
    
    // 确保结果包含所需字段
    const optimizedPrompt = result.optimizedPrompt || result.optimized || content;
    const improvements = result.improvements || '';
    const expectedBenefits = result.expectedBenefits || '';
    
    // 保存优化历史
    if (optimizationHistory) {
      // 多轮优化，添加到迭代历史
      optimizationHistory.iterations.push({
        optimizedPrompt: optimizedPrompt,
        improvements: improvements,
        expectedBenefits: expectedBenefits
      });
      
      optimizationHistory.optimizedPrompt = optimizedPrompt;
      optimizationHistory.improvements = improvements;
      optimizationHistory.expectedBenefits = expectedBenefits;
      optimizationHistory.provider = provider;
      optimizationHistory.model = result.model || model || 'default';
      
      await optimizationHistory.save();
    } else {
      // 首次优化，创建新记录
      const sanitizeStringField = (value) => {
        if (Array.isArray(value)) return value.join('\n');
        if (typeof value === 'string') return value;
        return JSON.stringify(value);
      };

      optimizationHistory = await OptimizationHistory.create({
        user: req.user.id,
        originalPrompt: content,
        optimizedPrompt: sanitizeStringField(optimizedPrompt),
        improvements: sanitizeStringField(improvements),
        expectedBenefits: sanitizeStringField(expectedBenefits),
        category,
        provider: provider,
        model: result.model || model || 'default',
        iterations: []
      });
    }
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'optimize',
      entityType: 'OptimizationHistory',
      entityId: optimizationHistory._id,
      details: { content: content.substring(0, 100) + '...' }
    });
    
    return successResponse(res, {
      data: {
        optimizedPrompt: optimizedPrompt,
        improvements: improvements,
        expectedBenefits: expectedBenefits,
        provider: provider,
        model: result.model || model || 'default',
        historyId: optimizationHistory._id
      }
    });
  } catch (err) {
    logger.error(`优化提示词失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取优化历史
 * @route GET /api/v1/prompts/optimize/history
 * @access 私有
 */
exports.getOptimizationHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const query = { user: req.user.id };
    
    // 筛选条件
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.provider) {
      query.provider = req.query.provider;
    }
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // 获取总数
    const total = await OptimizationHistory.countDocuments(query);
    
    // 获取历史记录
    const history = await OptimizationHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return successResponse(res, {
      data: history,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error(`获取优化历史失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取单个优化历史
 * @route GET /api/v1/prompts/optimize/history/:id
 * @access 私有
 */
exports.getOptimizationHistoryById = async (req, res, next) => {
  try {
    const history = await OptimizationHistory.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!history) {
      return errorResponse(res, '未找到优化历史', 404);
    }
    
    return successResponse(res, {
      data: history
    });
  } catch (err) {
    logger.error(`获取优化历史详情失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 评价优化结果
 * @route POST /api/v1/prompts/optimize/history/:id/rate
 * @access 私有
 */
exports.rateOptimization = async (req, res, next) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, '评分必须在1-5之间', 400);
    }
    
    const history = await OptimizationHistory.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!history) {
      return errorResponse(res, '未找到优化历史', 404);
    }
    
    history.rating = rating;
    await history.save();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'rate_optimization',
      entityType: 'OptimizationHistory',
      entityId: history._id,
      details: { rating }
    });
    
    return successResponse(res, {
      data: { id: history._id, rating }
    });
  } catch (err) {
    logger.error(`评价优化结果失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 管理API密钥
 * @route POST /api/v1/prompts/optimize/api-keys
 * @access 私有
 */
exports.manageApiKey = async (req, res, next) => {
  try {
    const { provider, apiKey, baseUrl, modelName } = req.body;
    
    if (!provider || !apiKey) {
      return errorResponse(res, '提供商和API密钥不能为空', 400);
    }
    
    // 检查是否已存在该提供商的密钥
    let existingKey = await ApiKey.findOne({
      user: req.user.id,
      provider
    });
    
    // 加密API密钥
    const { encryptedKey, iv } = ApiKey.encryptKey(apiKey);
    
    if (existingKey) {
      // 更新现有密钥
      existingKey.encryptedKey = encryptedKey;
      existingKey.iv = iv;
      existingKey.isActive = true;
      
      if (provider === 'custom') {
        existingKey.baseUrl = baseUrl;
        existingKey.modelName = modelName;
      }
      
      await existingKey.save();
      
      // 记录活动
      await ActivityLog.create({
        user: req.user.id,
        action: 'update_api_key',
        entityType: 'ApiKey',
        entityId: existingKey._id,
        details: { provider }
      });
    } else {
      // 创建新密钥
      existingKey = await ApiKey.create({
        user: req.user.id,
        provider,
        encryptedKey,
        iv,
        baseUrl: provider === 'custom' ? baseUrl : undefined,
        modelName: provider === 'custom' ? modelName : undefined,
        isActive: true
      });
      
      // 记录活动
      await ActivityLog.create({
        user: req.user.id,
        action: 'create_api_key',
        entityType: 'ApiKey',
        entityId: existingKey._id,
        details: { provider }
      });
    }
    
    return successResponse(res, {
      data: {
        id: existingKey._id,
        provider,
        isActive: existingKey.isActive,
        createdAt: existingKey.createdAt,
        updatedAt: existingKey.updatedAt
      }
    });
  } catch (err) {
    logger.error(`管理API密钥失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 获取用户API密钥列表
 * @route GET /api/v1/prompts/optimize/api-keys
 * @access 私有
 */
exports.getApiKeys = async (req, res, next) => {
  try {
    const apiKeys = await ApiKey.find({
      user: req.user.id
    });
    
    // 不返回加密的密钥，只返回元数据
    const result = apiKeys.map(key => ({
      id: key._id,
      provider: key.provider,
      isActive: key.isActive,
      baseUrl: key.baseUrl,
      modelName: key.modelName,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    }));
    
    return successResponse(res, {
      data: result
    });
  } catch (err) {
    logger.error(`获取API密钥列表失败: ${err.message}`);
    return next(err);
  }
};

/**
 * 删除API密钥
 * @route DELETE /api/v1/prompts/optimize/api-keys/:id
 * @access 私有
 */
exports.deleteApiKey = async (req, res, next) => {
  try {
    // 确保id参数存在
    if (!req.params.id) {
      return errorResponse(res, 'API密钥ID不能为空', 400);
    }
    
    // 尝试查找API密钥
    const apiKey = await ApiKey.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!apiKey) {
      return errorResponse(res, '未找到API密钥', 404);
    }
    
    await apiKey.deleteOne();
    
    // 记录活动
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete_api_key',
      entityType: 'ApiKey',
      details: { provider: apiKey.provider }
    });
    
    return successResponse(res, {
      message: 'API密钥已删除'
    });
  } catch (err) {
    logger.error(`删除API密钥失败: ${err.message}`);
    return next(err);
  }
}; 