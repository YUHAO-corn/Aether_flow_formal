# AetherFlow API实现计划

## 概述
本文档详细描述了AetherFlow后端API的实现计划，包括实现顺序、技术选择和时间安排。

## 技术栈选择

- **后端框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (JSON Web Token)
- **API文档**: Swagger/OpenAPI
- **测试框架**: Jest + Supertest
- **日志系统**: Winston
- **缓存**: Redis
- **部署**: Docker + Kubernetes

## 实现阶段

### 第一阶段：基础架构搭建（1天）

1. **项目结构设置**
   - 创建Express应用
   - 配置中间件（CORS, body-parser, helmet等）
   - 设置路由结构
   - 配置环境变量

2. **数据库连接**
   - 设置MongoDB连接
   - 配置Mongoose
   - 创建基础模型

3. **认证系统**
   - 实现JWT认证
   - 设置中间件验证token
   - 创建权限控制系统

4. **错误处理**
   - 创建统一错误处理中间件
   - 设计错误响应格式
   - 实现日志记录系统

### 第二阶段：核心API实现（2-3天）

1. **认证API**
   - `/auth/register` - 用户注册
   - `/auth/login` - 用户登录
   - `/auth/logout` - 用户登出
   - `/auth/me` (GET) - 获取当前用户信息
   - `/auth/me` (PUT) - 更新用户信息
   - `/auth/password` - 修改密码

2. **提示词基础API**
   - `/prompts` (GET) - 获取提示词列表
   - `/prompts/:id` (GET) - 获取单个提示词
   - `/prompts` (POST) - 创建提示词
   - `/prompts/:id` (PUT) - 更新提示词
   - `/prompts/:id` (DELETE) - 删除提示词

3. **标签基础API**
   - `/tags` (GET) - 获取标签列表
   - `/tags` (POST) - 创建标签
   - `/tags/:id` (GET) - 获取单个标签
   - `/tags/:id` (PUT) - 更新标签
   - `/tags/:id` (DELETE) - 删除标签

### 第三阶段：高级功能API实现（3-4天）

1. **提示词高级API**
   - `/prompts/auto-save` - 自动保存提示词
   - `/prompts/quick-search` - 快速搜索提示词
   - `/prompts/batch` - 批量获取提示词
   - `/prompts/recent` - 获取最近使用的提示词

2. **标签高级API**
   - `/tags/:id/prompts` - 获取标签关联的提示词

3. **提示词优化API**
   - `/optimize/prompt` - 优化提示词
   - `/optimize/history` - 获取优化历史

### 第四阶段：性能优化与安全加固（2天）

1. **缓存实现**
   - 设置Redis缓存
   - 缓存频繁访问的数据
   - 实现缓存失效策略

2. **性能优化**
   - 数据库索引优化
   - 查询优化
   - 响应压缩

3. **安全加固**
   - 输入验证加强
   - 限流实现
   - CSRF保护
   - XSS防护

### 第五阶段：文档与测试（2天）

1. **API文档**
   - 使用Swagger/OpenAPI生成文档
   - 添加详细的API描述
   - 提供请求和响应示例

2. **测试用例**
   - 编写单元测试
   - 编写集成测试
   - 设置CI/CD测试流程

## 详细实现计划

### 第一天：基础架构与认证API

#### 上午
- 项目结构设置
- 数据库连接配置
- 用户模型设计

#### 下午
- 认证系统实现
- 用户注册API
- 用户登录API

### 第二天：认证API完成与提示词基础API

#### 上午
- 用户登出API
- 获取/更新用户信息API
- 修改密码API

#### 下午
- 提示词模型设计
- 获取提示词列表API
- 获取单个提示词API

### 第三天：提示词基础API完成与标签基础API

#### 上午
- 创建提示词API
- 更新提示词API
- 删除提示词API

#### 下午
- 标签模型设计
- 标签基础CRUD API实现

### 第四天：高级功能API实现（第一部分）

#### 上午
- 自动保存提示词API
- 快速搜索提示词API

#### 下午
- 批量获取提示词API
- 获取最近使用的提示词API

### 第五天：高级功能API实现（第二部分）

#### 上午
- 获取标签关联的提示词API
- 提示词优化API

#### 下午
- 获取优化历史API
- 初步性能测试与优化

### 第六天：性能优化与安全加固

#### 上午
- 缓存实现
- 数据库索引优化

#### 下午
- 安全加固措施实现
- 限流与防护机制

### 第七天：文档与测试

#### 上午
- API文档生成
- 单元测试编写

#### 下午
- 集成测试编写
- CI/CD测试流程设置

## 技术实现细节

### 认证系统

```javascript
// 用户认证中间件示例
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌'
        }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '用户不存在'
        }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '无效的认证令牌'
      }
    });
  }
};
```

### 提示词自动保存

```javascript
// 自动保存提示词逻辑示例
const autoSavePrompt = async (req, res) => {
  try {
    const { content, response, platform, url } = req.body;
    const userId = req.user.id;
    
    // 检查5分钟内是否有相同内容的记录
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingPrompt = await Prompt.findOne({
      userId,
      content,
      platform,
      url,
      updatedAt: { $gte: fiveMinutesAgo }
    });
    
    if (existingPrompt) {
      // 更新现有记录
      existingPrompt.response = response;
      existingPrompt.updatedAt = new Date();
      await existingPrompt.save();
      
      return res.json({
        success: true,
        data: {
          prompt: existingPrompt,
          isNew: false
        }
      });
    }
    
    // 检查未收藏提示词数量，实现滚动存储
    const unfavoritedCount = await Prompt.countDocuments({
      userId,
      favorite: false
    });
    
    if (unfavoritedCount >= 100) {
      // 删除最旧的未收藏提示词
      const oldestPrompt = await Prompt.findOne({
        userId,
        favorite: false
      }).sort({ updatedAt: 1 });
      
      if (oldestPrompt) {
        await oldestPrompt.remove();
      }
    }
    
    // 创建新提示词
    const newPrompt = await Prompt.create({
      userId,
      content,
      response,
      platform,
      url,
      favorite: false,
      usageCount: 0
    });
    
    // 记录活动日志
    await ActivityLog.create({
      userId,
      action: 'auto_save_prompt',
      resourceId: newPrompt.id,
      resourceType: 'prompt'
    });
    
    return res.json({
      success: true,
      data: {
        prompt: newPrompt,
        isNew: true
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    });
  }
};
```

### 提示词优化

```javascript
// 提示词优化逻辑示例
const optimizePrompt = async (req, res) => {
  try {
    const { content, platform } = req.body;
    const userId = req.user.id;
    
    // 调用AI服务进行优化
    const optimizationResult = await aiService.optimizePrompt(content, platform);
    
    // 记录优化历史
    await OptimizationHistory.create({
      userId,
      originalContent: content,
      optimizedContent: optimizationResult.optimized,
      improvements: optimizationResult.improvements,
      expectedBenefits: optimizationResult.expectedBenefits,
      platform
    });
    
    return res.json({
      success: true,
      data: optimizationResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'OPTIMIZATION_FAILED',
        message: '提示词优化失败'
      }
    });
  }
};
```

## 数据模型设计

### 用户模型

```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  settings: {
    theme: {
      type: String,
      default: 'dark'
    },
    language: {
      type: String,
      default: 'zh-CN'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });
```

### 提示词模型

```javascript
const promptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  response: {
    type: String
  },
  platform: {
    type: String
  },
  url: {
    type: String
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  favorite: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });
```

### 标签模型

```javascript
const tagSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3498db'
  }
}, { timestamps: true });
```

## 风险与缓解策略

### 性能风险
- **风险**: 大量提示词数据可能导致查询性能下降
- **缓解**: 实现分页、索引优化和缓存机制

### 安全风险
- **风险**: 敏感用户数据泄露
- **缓解**: 密码加密、HTTPS、输入验证、防XSS和CSRF攻击

### 扩展性风险
- **风险**: 随着用户增长，系统可能难以扩展
- **缓解**: 微服务架构、负载均衡、数据库分片

## 后续计划

1. **监控系统**
   - 实现API调用监控
   - 设置性能指标监控
   - 配置告警机制

2. **国际化支持**
   - 添加多语言支持
   - 本地化错误消息

3. **高级分析功能**
   - 提示词使用统计
   - 用户行为分析
   - 推荐系统实现 