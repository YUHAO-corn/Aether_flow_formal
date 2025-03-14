/**
 * 响应处理工具
 * 用于统一处理API响应格式
 */

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {*} data - 响应数据
 * @param {number} statusCode - HTTP状态码
 * @returns {Object} Express响应对象
 */
exports.successResponse = (res, data, statusCode = 200) => {
  // 处理提示词列表响应
  if (Array.isArray(data) && data.length > 0 && data[0].content !== undefined) {
    // 转换_id为id
    const transformedData = data.map(item => {
      const { _id, ...rest } = item.toObject ? item.toObject() : item;
      return {
        ...rest,
        id: _id.toString()
      };
    });
    
    // 返回前端期望的格式
    return res.status(statusCode).json({
      data: {
        prompts: transformedData
      }
    });
  }
  
  // 处理单个提示词响应
  if (data && data.content !== undefined) {
    const { _id, ...rest } = data.toObject ? data.toObject() : data;
    const transformedPrompt = {
      ...rest,
      id: _id.toString()
    };
    
    return res.status(statusCode).json({
      data: {
        prompt: transformedPrompt
      }
    });
  }
  
  // 处理标签列表响应
  if (Array.isArray(data) && data.length > 0 && data[0].name !== undefined && data[0].color !== undefined) {
    const transformedTags = data.map(item => {
      const { _id, ...rest } = item.toObject ? item.toObject() : item;
      return {
        ...rest,
        id: _id.toString()
      };
    });
    
    return res.status(statusCode).json({
      data: {
        tags: transformedTags
      }
    });
  }
  
  // 处理单个标签响应
  if (data && data.name !== undefined && data.color !== undefined) {
    const { _id, ...rest } = data.toObject ? data.toObject() : data;
    const transformedTag = {
      ...rest,
      id: _id.toString()
    };
    
    return res.status(statusCode).json({
      data: {
        tag: transformedTag
      }
    });
  }
  
  // 处理用户认证响应
  if (data && data.token) {
    return res.status(statusCode).json({
      data: {
        user: data.user ? {
          ...data.user,
          id: data.user._id ? data.user._id.toString() : data.userId
        } : {
          id: data.userId,
          username: data.username,
          email: data.email || ''
        },
        token: data.token
      }
    });
  }
  
  // 默认响应格式，保持原有格式以兼容其他客户端
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    data
  });
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {string} type - 错误类型
 * @param {number} statusCode - HTTP状态码
 * @param {Object} metadata - 额外的错误元数据
 * @returns {Object} Express响应对象
 */
exports.errorResponse = (res, message, type = 'SERVER_ERROR', statusCode = 500, metadata = {}) => {
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    error: {
      message,
      type,
      ...metadata
    }
  });
};

/**
 * 分页响应
 * @param {Object} res - Express响应对象
 * @param {Array} data - 分页数据
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 * @param {number} total - 总数量
 * @returns {Object} Express响应对象
 */
exports.paginatedResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // 处理提示词列表分页响应
  if (data.length > 0 && data[0].content !== undefined) {
    // 转换_id为id
    const transformedData = data.map(item => {
      const { _id, ...rest } = item.toObject ? item.toObject() : item;
      return {
        ...rest,
        id: _id.toString()
      };
    });
    
    return res.status(200).json({
      data: {
        prompts: transformedData
      },
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  }
  
  // 处理标签列表分页响应
  if (data.length > 0 && data[0].name !== undefined && data[0].color !== undefined) {
    const transformedTags = data.map(item => {
      const { _id, ...rest } = item.toObject ? item.toObject() : item;
      return {
        ...rest,
        id: _id.toString()
      };
    });
    
    return res.status(200).json({
      data: {
        tags: transformedTags
      },
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  }
  
  // 默认分页响应格式
  return res.status(200).json({
    success: true,
    status: 'success',
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPrevPage
    }
  });
};

/**
 * 创建成功响应
 * @param {Object} res - Express响应对象
 * @param {Object|Array} data - 响应数据
 * @param {String} message - 成功消息
 * @returns {Object} 响应对象
 */
exports.createdResponse = (res, data = {}, message = 'Resource created successfully') => {
  // 处理创建提示词响应
  if (data && data.content !== undefined) {
    const { _id, ...rest } = data.toObject ? data.toObject() : data;
    const transformedPrompt = {
      ...rest,
      id: _id.toString()
    };
    
    return res.status(201).json({
      data: {
        prompt: transformedPrompt
      }
    });
  }
  
  // 处理创建标签响应
  if (data && data.name !== undefined && data.color !== undefined) {
    const { _id, ...rest } = data.toObject ? data.toObject() : data;
    const transformedTag = {
      ...rest,
      id: _id.toString()
    };
    
    return res.status(201).json({
      data: {
        tag: transformedTag
      }
    });
  }
  
  // 默认创建响应格式
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

/**
 * 未找到资源响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return exports.errorResponse(res, message, 'RESOURCE_NOT_FOUND', 404);
};

/**
 * 验证错误响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @param {Object} errors - 验证错误详情
 * @returns {Object} 响应对象
 */
exports.validationErrorResponse = (res, message = 'Validation failed', errors = {}) => {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      errors
    }
  });
};

/**
 * 未授权响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
exports.unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return exports.errorResponse(res, message, 'UNAUTHORIZED', 401);
};

/**
 * 禁止访问响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
exports.forbiddenResponse = (res, message = 'Access forbidden') => {
  return exports.errorResponse(res, message, 'FORBIDDEN', 403);
}; 