// 加载环境变量
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// 连接数据库
connectDB()
  .then(() => {
    // 启动服务器
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      logger.info(`服务器运行在端口: ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
    });

    // 优雅关闭
    process.on('SIGTERM', () => {
      logger.info('SIGTERM 信号接收到. 优雅关闭中...');
      server.close(() => {
        logger.info('进程终止');
      });
    });

    // 未处理的Promise拒绝处理
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    module.exports = server;
  })
  .catch(err => {
    logger.error('数据库连接失败，服务器未启动:', err);
    process.exit(1);
  });

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
}); 