/**
 * 错误处理中间件
 */

const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * 开发环境错误处理
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * 生产环境错误处理
 */
const sendErrorProd = (err, res) => {
  // 操作错误，发送给客户端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // 编程错误或未知错误：不泄露错误详情
    logger.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
};

/**
 * 处理MongoDB重复键错误
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `重复字段值: ${value}。请使用其他值！`;
  return new AppError(message, 400);
};

/**
 * 处理MongoDB验证错误
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `无效输入数据。${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * 处理JWT错误
 */
const handleJWTError = () => new AppError('无效的令牌。请重新登录！', 401);

/**
 * 处理JWT过期错误
 */
const handleJWTExpiredError = () => new AppError('您的令牌已过期！请重新登录。', 401);

/**
 * 全局错误处理中间件
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  } else {
    // 测试环境
    sendErrorDev(err, res);
  }
};

module.exports = {
  globalErrorHandler
}; 