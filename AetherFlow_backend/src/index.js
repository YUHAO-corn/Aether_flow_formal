const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const routes = require('./routes');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(helmet()); // 安全相关HTTP头
app.use(cors({
  origin: function(origin, callback) {
    // 允许所有localhost端口和无源请求（如Postman）
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
      'http://localhost:5180',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:5177',
      'http://127.0.0.1:5178',
      'http://127.0.0.1:5179',
      'http://127.0.0.1:5180'
    ];
    
    // 允许无源请求（如Postman）或允许的源
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// API路由
app.use('/api', routes);

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // CORS错误特殊处理
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'CORS policy violation',
        details: `Origin ${req.headers.origin} is not allowed`
      }
    });
  }
  
  // 通用错误响应
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  
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