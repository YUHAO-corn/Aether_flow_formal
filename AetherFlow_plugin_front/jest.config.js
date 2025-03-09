/**
 * Jest配置文件
 */

export default {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 转换器
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // 模块名称映射
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // 模拟环境变量
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  // 忽略的目录
  testPathIgnorePatterns: ['/node_modules/'],
  
  // 覆盖率收集
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.test.{js,jsx}'],
  coverageDirectory: 'coverage',
  
  // 测试文件匹配模式
  testMatch: ['**/*.test.js'],
  
  // 允许使用ES模块
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ],
  
  // 模块类型
  moduleFileExtensions: ['js', 'jsx', 'json', 'node']
}; 