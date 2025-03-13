/**
 * 自定义应用错误类
 * 用于创建可操作的错误对象
 */
class AppError extends Error {
  /**
   * 创建一个新的应用错误
   * @param {string} message - 错误消息
   * @param {number} statusCode - HTTP状态码
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError; 