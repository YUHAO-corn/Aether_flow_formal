const { User, ActivityLog } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createdResponse, unauthorizedResponse } = require('../utils/responseHandler');

/**
 * 用户注册
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return next(new AppError('Email already in use', 'EMAIL_IN_USE', 400));
      }
      return next(new AppError('Username already taken', 'USERNAME_TAKEN', 400));
    }
    
    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    });
    
    // 生成JWT
    const token = user.generateAuthToken();
    
    // 记录活动
    await ActivityLog.create({
      user: user._id,
      action: 'register',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // 发送响应
    return createdResponse(res, {
      userId: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }
    
    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // 生成JWT
    const token = user.generateAuthToken();
    
    // 记录活动
    await ActivityLog.create({
      user: user._id,
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // 发送响应
    return successResponse(res, {
      userId: user._id,
      username: user.username,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.getMe = async (req, res, next) => {
  try {
    return successResponse(res, {
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      settings: req.user.settings,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用户信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.updateMe = async (req, res, next) => {
  try {
    // 不允许更新密码
    if (req.body.password) {
      return next(new AppError('This route is not for password updates', 'INVALID_OPERATION', 400));
    }
    
    // 过滤不允许更新的字段
    const allowedFields = ['username', 'email', 'settings'];
    const filteredBody = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    // 更新用户
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      { new: true, runValidators: true }
    );
    
    // 发送响应
    return successResponse(res, {
      userId: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      settings: updatedUser.settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登出
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.logout = async (req, res, next) => {
  try {
    // 记录活动
    await ActivityLog.create({
      user: req.user._id,
      action: 'logout',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // 发送响应
    return successResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}; 