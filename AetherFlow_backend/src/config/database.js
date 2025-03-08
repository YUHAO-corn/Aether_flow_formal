const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * 连接数据库
 * @returns {Promise} 连接成功的Promise或模拟连接对象
 */
const connectDB = async () => {
  try {
    const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aetherflow';
    
    const conn = await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info(`MongoDB连接成功: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('MongoDB连接失败:', error.message);
    logger.warn('将使用模拟数据库模式运行，某些功能可能不可用');
    
    // 返回一个模拟的连接对象，而不是退出程序
    return {
      connection: {
        host: 'mock-db',
        mock: true
      }
    };
  }
};

// 监听连接事件
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose disconnected');
});

// 优雅关闭连接
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info('Mongoose disconnected through app termination');
  }
  process.exit(0);
});

module.exports = connectDB; 