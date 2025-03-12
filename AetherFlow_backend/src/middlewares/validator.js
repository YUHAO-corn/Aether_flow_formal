const { validationErrorResponse } = require('../utils/responseHandler');

/**
 * 验证请求体
 * @param {Function} schema - Joi验证模式
 * @returns {Function} Express中间件函数
 */
exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      
      return validationErrorResponse(res, 'Validation failed', errors);
    }
    
    // 替换请求体为验证后的值
    req.body = value;
    next();
  };
};

/**
 * 验证请求参数
 * @param {Function} schema - Joi验证模式
 * @returns {Function} Express中间件函数
 */
exports.validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      
      return validationErrorResponse(res, 'Invalid parameters', errors);
    }
    
    // 替换请求参数为验证后的值
    req.params = value;
    next();
  };
};

/**
 * 验证请求查询
 * @param {Function} schema - Joi验证模式
 * @returns {Function} Express中间件函数
 */
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      
      return validationErrorResponse(res, 'Invalid query parameters', errors);
    }
    
    // 替换请求查询为验证后的值
    req.query = value;
    next();
  };
}; 