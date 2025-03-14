# AetherFlow 测试文档

## 测试目录结构

```
tests/
├── integration/        # 集成测试
│   ├── test-all-features.js            # 综合测试所有功能
│   ├── test-health.js                  # 健康检查测试
│   ├── test-auth.js                    # 认证功能测试
│   ├── test-api-connection.js          # API连接测试
│   ├── test-prompt-auto-save.js        # 提示词自动保存测试
│   ├── test-conversation-management.js # 会话管理测试
│   ├── test-activity-log.js            # 活动日志测试
│   ├── test-prompt-optimization.js     # 提示词优化测试
│   ├── test-api-key-management.js      # API密钥管理测试
│   └── ...
└── README.md           # 本文档
```

## 后端单元测试

后端单元测试位于`AetherFlow_backend/src/tests`目录中，包括：

- 模型测试
- 控制器测试
- 服务测试
- 中间件测试
- 工具类测试

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行特定测试

```bash
# 健康检查测试
npm run test:health

# 认证功能测试
npm run test:auth

# API连接测试
npm run test:api

# 提示词自动保存测试
npm run test:prompt

# 会话管理测试
npm run test:conversation

# 活动日志测试
npm run test:activity

# 提示词优化测试
npm run test:optimization

# API密钥管理测试
npm run test:apikey
```

### 启动后端并运行测试

```bash
npm run start:test
```

### 仅启动后端

```bash
npm run start:backend
```

## 测试覆盖率

当前测试覆盖率情况：

| 代码区域 | 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 行覆盖率 |
|---------|----------|----------|----------|--------|
| 路由层 | 99.18% | 100% | 0% | 99.18% |
| 模型层 | 71.42% | 25% | 9.09% | 73.86% |
| 工具类 | 53.42% | 14.28% | 7.69% | 53.42% |
| 控制器层 | 13.65% | 0% | 0% | 14.01% |
| 中间件层 | 25.64% | 5.35% | 18.18% | 27.02% |
| 服务层 | 9.8% | 0% | 6.66% | 9.8% |
| 配置层 | 0% | 0% | 0% | 0% |
| 脚本层 | 0% | 0% | 0% | 0% |
| **总体** | **28.55%** | **3.71%** | **5.88%** | **29.1%** |

## 测试优化计划

1. 提高控制器层和服务层的测试覆盖率
2. 添加更多的边缘情况测试
3. 优化测试执行效率
4. 实现测试数据缓存机制
5. 添加更多的集成测试用例 