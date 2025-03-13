/**
 * 验证中间件
 * 用于验证请求数据
 */

const AppError = require('../utils/appError');

/**
 * 创建验证中间件
 * @param {Object} schema - Joi验证模式
 * @returns {Function} Express中间件函数
 */
const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // 返回所有错误
      stripUnknown: true, // 删除未知字段
      allowUnknown: true // 允许未知字段
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    // 将验证后的值赋给req.body
    req.body = value;
    return next();
  };
};

module.exports = validate; 