const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// 加载环境变量
dotenv.config();

// 启动服务器函数
const startServer = (dbConnection) => {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    logger.info(`服务器运行在端口: ${PORT}`);
    logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
    
    if (dbConnection && dbConnection.connection && dbConnection.connection.mock) {
      logger.warn('服务器以模拟数据库模式运行，某些功能可能不可用');
    }
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
    logger.error('UNHANDLED REJECTION! 💥');
    logger.error(err.name, err.message);
    // 不关闭服务器，只记录错误
    // server.close(() => {
    //   process.exit(1);
    // });
  });

  return server;
};

// 连接数据库并启动服务器
connectDB()
  .then((dbConnection) => {
    // 启动服务器
    const server = startServer(dbConnection);
    module.exports = server;
  })
  .catch(err => {
    logger.error('数据库连接失败:', err);
    logger.warn('尝试以无数据库模式启动服务器...');
    
    // 即使数据库连接失败，也启动服务器
    const server = startServer({ connection: { mock: true } });
    module.exports = server;
  });

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥');
  logger.error(err.name, err.message);
  // 不退出进程，只记录错误
  // process.exit(1);
}); 