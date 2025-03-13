/**
 * 认证中间件
 * 用于保护路由和授权用户
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models');
const AppError = require('../utils/appError');

/**
 * 保护路由中间件
 * 验证用户是否已登录
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) 获取令牌
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('您未登录！请登录以获取访问权限。', 401));
    }

    // 2) 验证令牌
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) 检查用户是否仍然存在
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('此令牌所属的用户不再存在。', 401));
    }

    // 4) 检查用户是否在令牌签发后更改了密码
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('用户最近更改了密码！请重新登录。', 401));
    }

    // 将用户信息添加到请求对象
    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('认证失败，请重新登录', 401));
  }
};

/**
 * 授权中间件
 * 限制对特定角色的访问
 * @param  {...string} roles - 允许的角色
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      return next(new AppError('您没有执行此操作的权限', 403));
    }
    next();
  };
}; 