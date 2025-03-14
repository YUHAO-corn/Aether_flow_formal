const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const routes = require('./routes');
const { globalErrorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const { monitorMiddleware } = require('./middlewares/monitor');

// 创建Express应用
const app = express();

// 设置安全HTTP头
app.use(helmet());

// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 添加监控中间件
app.use(monitorMiddleware);

// 限制请求速率
const limiter = rateLimit({
  max: 100, // 每IP每小时最多100个请求
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 解析请求体
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 数据清洗
app.use(mongoSanitize()); // 防止MongoDB操作符注入
app.use(xss()); // 防止XSS攻击

// 启用CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// 压缩响应
app.use(compression());

// 检查必要的环境变量
const requiredEnvVars = process.env.NODE_ENV === 'test' 
  ? ['JWT_SECRET', 'JWT_EXPIRES_IN', 'ENCRYPTION_KEY']
  : ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'ENCRYPTION_KEY'];

const optionalEnvVars = ['OPENAI_API_KEY', 'DEEPSEEK_API_KEY', 'MOONSHOT_API_KEY'];

// 检查必要的环境变量
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`错误: 缺少必要的环境变量 ${envVar}`);
    process.exit(1);
  }
});

// 检查可选的环境变量
optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`警告: 未设置可选环境变量 ${envVar}`);
  }
});

// 如果未设置加密密钥，则生成一个
if (!process.env.ENCRYPTION_KEY) {
  const crypto = require('crypto');
  process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
  console.info('已生成临时加密密钥，请在生产环境中设置永久密钥');
}

// 注册路由
app.use('/api/v1', routes);

// 处理未找到的路由
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// 全局错误处理
app.use(globalErrorHandler);

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// 未处理的Promise拒绝处理
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; 