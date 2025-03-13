# AetherFlow API优化建议

## 概述
本文档提供了AetherFlow API的优化建议，旨在提高API的性能、安全性和可维护性。这些建议基于前后端接口分析和最佳实践。

## 性能优化建议

### 1. 数据库查询优化

#### 索引优化
- 为所有频繁查询的字段添加索引，特别是：
  - `userId` 字段（几乎所有集合）
  - 提示词集合中的 `tags` 字段
  - 提示词集合中的 `content` 字段（文本索引）
  - 提示词集合中的 `favorite` 字段
  - 提示词集合中的 `createdAt` 和 `updatedAt` 字段

```javascript
// 示例索引创建
promptSchema.index({ userId: 1 });
promptSchema.index({ tags: 1 });
promptSchema.index({ favorite: 1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ updatedAt: -1 });
promptSchema.index({ content: 'text' });
```

#### 查询优化
- 使用投影（Projection）减少返回的字段数量
- 限制查询结果数量，避免返回过多数据
- 使用聚合管道优化复杂查询

```javascript
// 优化前
const prompts = await Prompt.find({ userId });

// 优化后
const prompts = await Prompt.find(
  { userId },
  { content: 1, tags: 1, favorite: 1, updatedAt: 1 }
).limit(20).sort({ updatedAt: -1 });
```

### 2. 缓存策略

#### Redis缓存
- 缓存频繁访问但不常变化的数据：
  - 用户标签列表
  - 热门提示词
  - 用户设置

```javascript
// 缓存实现示例
const getUserTags = async (userId) => {
  const cacheKey = `user:${userId}:tags`;
  
  // 尝试从缓存获取
  const cachedTags = await redisClient.get(cacheKey);
  if (cachedTags) {
    return JSON.parse(cachedTags);
  }
  
  // 缓存未命中，从数据库获取
  const tags = await Tag.find({ userId });
  
  // 设置缓存，有效期30分钟
  await redisClient.set(cacheKey, JSON.stringify(tags), 'EX', 1800);
  
  return tags;
};
```

#### 缓存失效策略
- 实现基于事件的缓存失效机制
- 当数据更新时主动清除相关缓存

```javascript
// 缓存失效示例
const updateTag = async (tagId, data) => {
  const tag = await Tag.findByIdAndUpdate(tagId, data, { new: true });
  
  // 清除相关缓存
  const cacheKey = `user:${tag.userId}:tags`;
  await redisClient.del(cacheKey);
  
  return tag;
};
```

### 3. 响应优化

#### 压缩
- 启用gzip/brotli压缩减少传输数据大小

```javascript
// Express中启用压缩
const compression = require('compression');
app.use(compression());
```

#### 分页优化
- 实现基于游标的分页，替代传统的基于偏移的分页
- 对于大数据集，提高分页性能

```javascript
// 基于游标的分页示例
const getPrompts = async (req, res) => {
  const { limit = 20, cursor } = req.query;
  const query = { userId: req.user.id };
  
  // 如果提供了游标，添加条件
  if (cursor) {
    query._id = { $lt: cursor };
  }
  
  const prompts = await Prompt.find(query)
    .sort({ _id: -1 })
    .limit(parseInt(limit) + 1);
  
  // 检查是否有更多结果
  const hasMore = prompts.length > limit;
  if (hasMore) {
    prompts.pop(); // 移除额外查询的一条
  }
  
  // 返回结果和下一个游标
  return res.json({
    success: true,
    data: {
      prompts,
      hasMore,
      nextCursor: hasMore ? prompts[prompts.length - 1]._id : null
    }
  });
};
```

## 安全优化建议

### 1. 输入验证与清理

#### 请求验证
- 使用Joi或Zod等库验证所有API输入
- 实现中间件自动验证请求数据

```javascript
// 使用Joi验证请求
const createPromptSchema = Joi.object({
  content: Joi.string().required().max(5000),
  response: Joi.string().allow('').max(10000),
  platform: Joi.string().allow(''),
  url: Joi.string().allow('').uri(),
  tags: Joi.array().items(Joi.string()),
  favorite: Joi.boolean().default(false)
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }
    next();
  };
};

// 使用验证中间件
router.post('/prompts', validateRequest(createPromptSchema), createPrompt);
```

#### XSS防护
- 对所有用户输入进行HTML转义
- 使用helmet等安全中间件

```javascript
// 使用helmet中间件
const helmet = require('helmet');
app.use(helmet());

// 内容清理示例
const sanitizeHtml = require('sanitize-html');

const sanitizeContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {}
  });
};
```

### 2. 认证与授权增强

#### JWT增强
- 缩短JWT过期时间，实现刷新令牌机制
- 添加令牌撤销功能

```javascript
// 刷新令牌实现
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '无效的刷新令牌'
        }
      });
    }
    
    // 生成新的访问令牌
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    return res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '无效的刷新令牌'
      }
    });
  }
};
```

#### 细粒度权限控制
- 实现基于角色的访问控制（RBAC）
- 添加资源所有权验证

```javascript
// 资源所有权验证中间件
const verifyResourceOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: '资源不存在'
          }
        });
      }
      
      if (resource.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '无权访问此资源'
          }
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 使用所有权验证中间件
router.put('/prompts/:id', authenticateUser, verifyResourceOwnership(Prompt), updatePrompt);
```

### 3. 限流与防护

#### API限流
- 实现基于用户和IP的限流
- 对敏感操作（如登录、注册）设置更严格的限制

```javascript
// 使用rate-limiter-flexible实现限流
const { RateLimiterRedis } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 100, // 100个请求
  duration: 60 // 每60秒
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // 使用用户ID或IP作为限流键
    const key = req.user ? req.user.id : req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: '请求过于频繁，请稍后再试'
      }
    });
  }
};

// 应用限流中间件
app.use('/api/v1', rateLimiterMiddleware);
```

#### CSRF保护
- 实现CSRF令牌验证
- 对状态更改操作强制验证

```javascript
// 使用csurf中间件
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// 获取CSRF令牌
app.get('/api/v1/csrf-token', (req, res) => {
  res.json({
    success: true,
    data: {
      csrfToken: req.csrfToken()
    }
  });
});

// 应用CSRF保护
app.post('/api/v1/auth/login', csrfProtection, login);
```

## 架构优化建议

### 1. 模块化与代码组织

#### 服务层抽象
- 将业务逻辑从控制器中分离到服务层
- 提高代码复用性和可测试性

```javascript
// 服务层示例
// services/promptService.js
const createPrompt = async (userId, promptData) => {
  const prompt = new Prompt({
    userId,
    ...promptData
  });
  
  await prompt.save();
  
  // 如果有标签，更新标签关联
  if (promptData.tags && promptData.tags.length > 0) {
    await updateTagAssociations(prompt._id, promptData.tags);
  }
  
  return prompt;
};

// controllers/promptController.js
const createPrompt = async (req, res) => {
  try {
    const prompt = await promptService.createPrompt(req.user.id, req.body);
    
    return res.status(201).json({
      success: true,
      data: {
        prompt
      }
    });
  } catch (error) {
    next(error);
  }
};
```

#### 中间件优化
- 创建专用中间件处理常见任务
- 组合中间件形成可复用的路由处理链

```javascript
// 中间件组合示例
const commonHandlers = [
  authenticateUser,
  rateLimiterMiddleware
];

const resourceHandlers = (model) => [
  ...commonHandlers,
  verifyResourceOwnership(model)
];

// 应用中间件组合
router.get('/prompts', commonHandlers, getPrompts);
router.put('/prompts/:id', resourceHandlers(Prompt), updatePrompt);
```

### 2. 错误处理增强

#### 统一错误处理
- 实现全局错误处理中间件
- 标准化错误响应格式

```javascript
// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  // 处理Mongoose验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: Object.values(err.errors).map(e => e.message).join(', ')
      }
    });
  }
  
  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '无效的认证令牌'
      }
    });
  }
  
  // 处理其他错误
  return res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? '服务器内部错误' 
        : err.message
    }
  });
};

// 应用错误处理中间件
app.use(errorHandler);
```

#### 错误日志
- 实现结构化错误日志
- 集成错误监控系统

```javascript
// 使用Winston进行日志记录
const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console()
  ]
});

// 在错误处理中使用
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });
  
  // 错误响应处理...
};
```

### 3. API版本控制

#### 版本策略
- 实现URL路径版本控制
- 为未来API变更做准备

```javascript
// 版本控制示例
const v1Router = express.Router();
const v2Router = express.Router();

// v1 API路由
v1Router.get('/prompts', getPromptsV1);

// v2 API路由（新功能或改进）
v2Router.get('/prompts', getPromptsV2);

// 应用版本化路由
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

#### 废弃策略
- 明确标记废弃的API
- 提供迁移路径和时间表

```javascript
// 废弃API处理
const deprecatedMiddleware = (message) => {
  return (req, res, next) => {
    res.set('X-Deprecated-API', 'true');
    res.set('X-Deprecated-Message', message);
    next();
  };
};

// 应用废弃中间件
v1Router.get(
  '/prompts/search',
  deprecatedMiddleware('此端点将在2023年12月31日后移除，请使用 /api/v1/prompts?search=关键词 替代'),
  searchPrompts
);
```

## 文档与测试优化

### 1. API文档增强

#### OpenAPI规范
- 使用OpenAPI 3.0规范完整描述API
- 包含所有请求参数、响应格式和错误码

```javascript
// 使用swagger-jsdoc添加API文档
/**
 * @swagger
 * /api/v1/prompts:
 *   get:
 *     summary: 获取提示词列表
 *     description: 获取当前用户的提示词列表，支持分页、排序和筛选
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码（默认1）
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量（默认10）
 *     responses:
 *       200:
 *         description: 成功获取提示词列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     prompts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prompt'
 */
```

#### 交互式文档
- 提供Swagger UI或ReDoc交互式文档
- 允许开发者直接测试API

```javascript
// 设置Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 2. 测试策略优化

#### 测试覆盖率
- 提高单元测试和集成测试覆盖率
- 重点测试复杂业务逻辑和边缘情况

```javascript
// 提示词服务测试示例
describe('Prompt Service', () => {
  describe('createPrompt', () => {
    it('should create a prompt with valid data', async () => {
      // 测试代码...
    });
    
    it('should associate tags with the prompt', async () => {
      // 测试代码...
    });
    
    it('should throw an error if content is empty', async () => {
      // 测试代码...
    });
  });
});
```

#### 自动化测试
- 集成CI/CD流程中的自动化测试
- 实现端到端测试验证关键功能

```javascript
// GitHub Actions工作流示例
// .github/workflows/test.yml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 监控与可观测性

### 1. 性能监控

#### API指标收集
- 记录API响应时间、错误率和请求量
- 实现自定义指标跟踪关键业务流程

```javascript
// 使用express-prometheus-middleware收集指标
const promMiddleware = require('express-prometheus-middleware');

app.use(promMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400]
}));
```

#### 性能预警
- 设置阈值触发性能警报
- 对异常情况及时响应

```javascript
// 使用Prometheus Alert Manager配置示例
groups:
- name: api-alerts
  rules:
  - alert: HighResponseTime
    expr: http_request_duration_seconds{quantile="0.9"} > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High API response time"
      description: "90% of requests are taking more than 1 second to process"
```

### 2. 日志增强

#### 结构化日志
- 实现JSON格式的结构化日志
- 包含上下文信息便于分析

```javascript
// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 响应结束时记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      method: req.method,
      path: req.path,
      query: req.query,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      userAgent: req.headers['user-agent']
    });
  });
  
  next();
};

app.use(requestLogger);
```

#### 日志聚合
- 集成ELK或类似日志聚合系统
- 实现日志搜索和分析功能

```javascript
// 配置Winston与Elasticsearch集成
const { ElasticsearchTransport } = require('winston-elasticsearch');

const esTransport = new ElasticsearchTransport({
  level: 'info',
  index: 'api-logs',
  clientOpts: {
    node: 'http://elasticsearch:9200'
  }
});

logger.add(esTransport);
```

## 总结

通过实施上述优化建议，AetherFlow API将获得以下好处：

1. **性能提升**：通过数据库优化、缓存策略和响应优化，显著提高API响应速度
2. **安全增强**：通过输入验证、认证增强和限流机制，提高系统安全性
3. **可维护性改进**：通过模块化、错误处理和版本控制，使代码更易于维护和扩展
4. **可观测性提升**：通过监控和日志增强，提高系统透明度和问题排查能力

建议按照以下优先级实施这些优化：

1. **高优先级**（立即实施）
   - 输入验证与清理
   - 统一错误处理
   - 基本索引优化

2. **中优先级**（1-2周内实施）
   - 缓存策略
   - 认证与授权增强
   - API文档增强

3. **低优先级**（长期规划）
   - 高级监控系统
   - 完整的版本控制策略
   - 高级性能优化 