/**
 * 监控中间件
 * 用于监控API请求量、响应时间和错误率
 */

const logger = require('../utils/logger');

// 存储监控数据
const monitorData = {
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  requestsByEndpoint: {},
  responseTimeByEndpoint: {},
  errorsByEndpoint: {},
  startTime: Date.now()
};

/**
 * 监控中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.monitorMiddleware = (req, res, next) => {
  // 记录请求开始时间
  const startTime = Date.now();
  
  // 增加总请求数
  monitorData.totalRequests++;
  
  // 获取请求路径
  const endpoint = `${req.method} ${req.originalUrl.split('?')[0]}`;
  
  // 增加特定端点的请求数
  if (!monitorData.requestsByEndpoint[endpoint]) {
    monitorData.requestsByEndpoint[endpoint] = 0;
  }
  monitorData.requestsByEndpoint[endpoint]++;
  
  // 捕获响应完成事件
  res.on('finish', () => {
    // 计算响应时间
    const responseTime = Date.now() - startTime;
    
    // 更新响应时间统计
    if (!monitorData.responseTimeByEndpoint[endpoint]) {
      monitorData.responseTimeByEndpoint[endpoint] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: responseTime,
        maxTime: responseTime
      };
    }
    
    const stats = monitorData.responseTimeByEndpoint[endpoint];
    stats.count++;
    stats.totalTime += responseTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, responseTime);
    stats.maxTime = Math.max(stats.maxTime, responseTime);
    
    // 更新成功/失败请求数
    if (res.statusCode < 400) {
      monitorData.successRequests++;
    } else {
      monitorData.failedRequests++;
      
      // 更新错误统计
      if (!monitorData.errorsByEndpoint[endpoint]) {
        monitorData.errorsByEndpoint[endpoint] = {};
      }
      
      const statusCode = res.statusCode.toString();
      if (!monitorData.errorsByEndpoint[endpoint][statusCode]) {
        monitorData.errorsByEndpoint[endpoint][statusCode] = 0;
      }
      monitorData.errorsByEndpoint[endpoint][statusCode]++;
      
      // 记录错误日志
      logger.error(`API错误: ${endpoint} - ${res.statusCode}`);
    }
    
    // 记录慢请求
    if (responseTime > 1000) { // 超过1秒的请求
      logger.warn(`慢请求: ${endpoint} - ${responseTime}ms`);
    }
  });
  
  next();
};

/**
 * 获取监控数据
 * @returns {Object} 监控数据
 */
exports.getMonitorData = () => {
  // 计算错误率
  const errorRate = monitorData.totalRequests > 0 
    ? (monitorData.failedRequests / monitorData.totalRequests) * 100 
    : 0;
  
  // 计算运行时间
  const uptime = Math.floor((Date.now() - monitorData.startTime) / 1000);
  
  return {
    totalRequests: monitorData.totalRequests,
    successRequests: monitorData.successRequests,
    failedRequests: monitorData.failedRequests,
    errorRate: errorRate.toFixed(2) + '%',
    uptime: uptime,
    requestsByEndpoint: monitorData.requestsByEndpoint,
    responseTimeByEndpoint: monitorData.responseTimeByEndpoint,
    errorsByEndpoint: monitorData.errorsByEndpoint
  };
};

/**
 * 重置监控数据
 */
exports.resetMonitorData = () => {
  monitorData.totalRequests = 0;
  monitorData.successRequests = 0;
  monitorData.failedRequests = 0;
  monitorData.requestsByEndpoint = {};
  monitorData.responseTimeByEndpoint = {};
  monitorData.errorsByEndpoint = {};
  monitorData.startTime = Date.now();
}; 