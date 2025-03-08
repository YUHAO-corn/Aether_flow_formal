const { errorResponse } = require('../utils/responseHandler');
const logger = require('../config/logger');

/**
 * 开发环境错误处理
 */
const sendDevError = (err, req, res) => {
  // API错误
  if (req.originalUrl.startsWith('/api')) {
    return errorResponse(
      res,
      err.message,
      err.code || 'SERVER_ERROR',
      err.statusCode || 500,
      err.stack
    );
  }
  
  // 渲染错误页面（如果有的话）
  console.error('ERROR 💥', err);
  return res.status(err.statusCode || 500).json({
    title: 'Something went wrong!',
    message: err.message,
    stack: err.stack
  });
};

/**
 * 生产环境错误处理
 */
const sendProdError = (err, req, res) => {
  // API错误
  if (req.originalUrl.startsWith('/api')) {
    // 操作错误，发送给客户端
    if (err.isOperational) {
      return errorResponse(
        res,
        err.message,
        err.code || 'ERROR',
        err.statusCode || 500
      );
    }
    
    // 编程或其他未知错误：不泄露错误详情
    logger.error('ERROR 💥', err);
    return errorResponse(
      res,
      'Something went wrong',
      'SERVER_ERROR',
      500
    );
  }
  
  // 渲染错误页面（如果有的话）
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      title: 'Something went wrong!',
      message: err.message
    });
  }
  
  // 编程或其他未知错误：不泄露错误详情
  logger.error('ERROR 💥', err);
  return res.status(500).json({
    title: 'Something went wrong!',
    message: 'Please try again later.'
  });
};

/**
 * MongoDB错误处理
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 'INVALID_INPUT', 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 'DUPLICATE_VALUE', 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 'VALIDATION_ERROR', 400);
};

/**
 * JWT错误处理
 */
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again!', 'INVALID_TOKEN', 401);

const handleJWTExpiredError = () => 
  new AppError('Your token has expired! Please log in again.', 'EXPIRED_TOKEN', 401);

/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 全局错误处理中间件
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    // MongoDB错误
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    
    // JWT错误
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendProdError(error, req, res);
  }
};

module.exports = {
  globalErrorHandler,
  AppError
}; 