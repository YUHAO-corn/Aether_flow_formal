/**
 * 日志工具，用于记录插件运行过程中的关键信息
 */

// 日志级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// 当前日志级别，可以通过配置修改
let currentLogLevel = LogLevel.INFO;

// 是否将日志保存到存储中
let saveToStorage = true;

// 最大保存的日志数量
const MAX_LOGS = 100;

/**
 * 设置日志级别
 * @param {number} level - 日志级别
 */
export const setLogLevel = (level) => {
  currentLogLevel = level;
};

/**
 * 设置是否将日志保存到存储中
 * @param {boolean} save - 是否保存
 */
export const setSaveToStorage = (save) => {
  saveToStorage = save;
};

/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {number} level - 日志级别
 * @param {Object} data - 附加数据
 */
const log = (message, level, data = null) => {
  if (level < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: getLevelName(level),
    message,
    data: data ? JSON.stringify(data) : undefined
  };

  // 控制台输出
  const consoleMethod = getConsoleMethod(level);
  if (data) {
    console[consoleMethod](`[${timestamp}] [${logEntry.level}] ${message}`, data);
  } else {
    console[consoleMethod](`[${timestamp}] [${logEntry.level}] ${message}`);
  }

  // 保存到存储
  if (saveToStorage) {
    saveLogToStorage(logEntry);
  }
};

/**
 * 获取日志级别名称
 * @param {number} level - 日志级别
 * @returns {string} 日志级别名称
 */
const getLevelName = (level) => {
  switch (level) {
    case LogLevel.DEBUG: return 'DEBUG';
    case LogLevel.INFO: return 'INFO';
    case LogLevel.WARN: return 'WARN';
    case LogLevel.ERROR: return 'ERROR';
    default: return 'UNKNOWN';
  }
};

/**
 * 获取控制台方法
 * @param {number} level - 日志级别
 * @returns {string} 控制台方法名
 */
const getConsoleMethod = (level) => {
  switch (level) {
    case LogLevel.DEBUG: return 'debug';
    case LogLevel.INFO: return 'info';
    case LogLevel.WARN: return 'warn';
    case LogLevel.ERROR: return 'error';
    default: return 'log';
  }
};

/**
 * 保存日志到存储
 * @param {Object} logEntry - 日志条目
 */
const saveLogToStorage = (logEntry) => {
  try {
    chrome.storage.local.get(['logs'], (result) => {
      const logs = result.logs || [];
      logs.unshift(logEntry);
      
      // 限制日志数量
      if (logs.length > MAX_LOGS) {
        logs.length = MAX_LOGS;
      }
      
      chrome.storage.local.set({ logs });
    });
  } catch (error) {
    console.error('Failed to save log to storage:', error);
  }
};

/**
 * 清除存储中的日志
 */
export const clearLogs = () => {
  try {
    chrome.storage.local.remove(['logs']);
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
};

/**
 * 获取存储中的日志
 * @returns {Promise<Array>} 日志数组
 */
export const getLogs = () => {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(['logs'], (result) => {
        resolve(result.logs || []);
      });
    } catch (error) {
      console.error('Failed to get logs:', error);
      resolve([]);
    }
  });
};

// 导出日志方法
export const debug = (message, data) => log(message, LogLevel.DEBUG, data);
export const info = (message, data) => log(message, LogLevel.INFO, data);
export const warn = (message, data) => log(message, LogLevel.WARN, data);
export const error = (message, data) => log(message, LogLevel.ERROR, data);

// 导出日志级别
export { LogLevel }; 