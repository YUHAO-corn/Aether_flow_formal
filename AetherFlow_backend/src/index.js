const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(helmet()); // 安全相关HTTP头
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
})); // 跨域资源共享
app.use(morgan('dev')); // HTTP请求日志
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AetherFlow API' });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // 连接到MongoDB
  try {
    // 使用正确的环境变量名称MONGODB_URI
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aetherflow';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    console.warn('Running in mock database mode, some features may not be available');
    // 不退出进程，继续运行
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 不退出进程，只记录错误
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 应用程序继续运行
});

// 处理SIGTERM信号
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close(false, () => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

module.exports = app; // 导出应用，用于测试 