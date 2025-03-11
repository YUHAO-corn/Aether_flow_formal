const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseHandler');

/**
 * 验证JWT令牌
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 从请求头或cookie中获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // 从Bearer token中提取
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 从cookie中提取
      token = req.cookies.token;
    }
    
    // 检查token是否存在
    if (!token) {
      return unauthorizedResponse(res, 'Please log in to access this resource');
    }
    
    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 检查用户是否存在
      const user = await User.findById(decoded.id);
      if (!user) {
        return unauthorizedResponse(res, 'The user belonging to this token no longer exists');
      }
      
      // 将用户信息添加到请求对象
      req.user = user;
      next();
    } catch (error) {
      return unauthorizedResponse(res, 'Invalid token or token expired');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 限制访问特定角色
 * @param  {...String} roles - 允许访问的角色列表
 * @returns {Function} Express中间件函数
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      return forbiddenResponse(res, 'You do not have permission to perform this action');
    }
    
    next();
  };
}; 