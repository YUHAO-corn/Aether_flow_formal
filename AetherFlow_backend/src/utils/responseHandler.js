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