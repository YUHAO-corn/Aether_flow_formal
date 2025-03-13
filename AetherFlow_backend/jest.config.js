/**
 * Jest配置文件
 * 优化测试执行效率和稳定性
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  maxWorkers: '50%',
  testTimeout: 30000, // 默认超时时间
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  forceExit: true, // 强制退出测试进程
  detectOpenHandles: true, // 检测打开的句柄
  verbose: true,
  // 覆盖率配置
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // 忽略特定文件夹
  testPathIgnorePatterns: ['/node_modules/'],
  // 转换器
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // 模块别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}; 