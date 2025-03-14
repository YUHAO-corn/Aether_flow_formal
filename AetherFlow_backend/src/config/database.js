const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * 连接数据库
 * @returns {Promise} 连接成功的Promise
 */
const connectDB = async () => {
  try {
    // 连接选项 - 使用最新版MongoDB驱动支持的选项
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // 连接超时设置
      connectTimeoutMS: 10000,
      // 查询超时设置
      socketTimeoutMS: 45000,
      // 心跳检测
      heartbeatFrequencyMS: 10000,
      // 读写关注
      readPreference: 'primary'
    };

    // 连接到MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    logger.info('Mongoose connected to DB');
    logger.info(`MongoDB连接成功: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB连接已建立');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB连接错误: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接已断开，尝试重新连接...');
    });
    
    // 优雅关闭连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB连接已关闭（应用程序终止）');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    logger.error(`MongoDB连接失败: ${error.message}`);
    // 重试连接
    logger.info('5秒后尝试重新连接...');
    setTimeout(connectDB, 5000);
    throw error;
  }
};

module.exports = connectDB; 