/**
 * 统一响应处理工具
 * 用于生成标准格式的API响应
 */

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {Object|Array} data - 响应数据
 * @param {Object} meta - 元数据，如分页信息
 * @param {Number} statusCode - HTTP状态码
 * @returns {Object} 响应对象
 */
const successResponse = (res, data = {}, meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: Object.keys(meta).length > 0 ? meta : undefined
  });
};

/**
 * 创建成功响应
 * @param {Object} res - Express响应对象
 * @param {Object|Array} data - 响应数据
 * @param {String} message - 成功消息
 * @returns {Object} 响应对象
 */
const createdResponse = (res, data = {}, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @param {String} code - 错误代码
 * @param {Number} statusCode - HTTP状态码
 * @param {String} details - 详细错误信息（仅在开发环境中显示）
 * @returns {Object} 响应对象
 */
const errorResponse = (res, message = 'Internal Server Error', code = 'SERVER_ERROR', statusCode = 500, details = null) => {
  const errorObj = {
    success: false,
    error: {
      code,
      message
    }
  };

  // 仅在开发环境中添加详细错误信息
  if (details && process.env.NODE_ENV === 'development') {
    errorObj.error.details = details;
  }

  return res.status(statusCode).json(errorObj);
};

/**
 * 未找到资源响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 'RESOURCE_NOT_FOUND', 404);
};

/**
 * 验证错误响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @param {Object} errors - 验证错误详情
 * @returns {Object} 响应对象
 */
const validationErrorResponse = (res, message = 'Validation failed', errors = {}) => {
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
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 'UNAUTHORIZED', 401);
};

/**
 * 禁止访问响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 'FORBIDDEN', 403);
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse
}; 