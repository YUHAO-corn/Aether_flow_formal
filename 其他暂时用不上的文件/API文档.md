# AetherFlow API文档

## 概述
本文档描述了AetherFlow后端API的使用方法和参数。所有API端点都需要JWT认证（除了登录和注册）。

## 认证API

### 注册
- **URL**: `/api/v1/auth/register`
- **方法**: `POST`
- **描述**: 创建新用户账户
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码",
    "passwordConfirm": "确认密码"
  }
  ```
- **响应**: 返回用户信息和JWT令牌

### 登录
- **URL**: `/api/v1/auth/login`
- **方法**: `POST`
- **描述**: 用户登录
- **请求体**:
  ```json
  {
    "email": "邮箱",
    "password": "密码"
  }
  ```
- **响应**: 返回用户信息和JWT令牌

### 获取当前用户信息
- **URL**: `/api/v1/auth/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的信息
- **响应**: 返回用户详细信息

### 更新用户信息
- **URL**: `/api/v1/auth/updateMe`
- **方法**: `PATCH`
- **描述**: 更新当前用户的信息
- **请求体**:
  ```json
  {
    "username": "新用户名",
    "email": "新邮箱",
    "settings": {
      "theme": "dark",
      "language": "zh-CN",
      "notifications": true
    }
  }
  ```
- **响应**: 返回更新后的用户信息

### 登出
- **URL**: `/api/v1/auth/logout`
- **方法**: `POST`
- **描述**: 用户登出
- **响应**: 返回成功消息

## 提示词API

### 获取提示词列表
- **URL**: `/api/v1/prompts`
- **方法**: `GET`
- **描述**: 获取用户的提示词列表
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `sort`: 排序字段（默认"-createdAt"）
  - `search`: 搜索关键词
  - `tag`: 标签名称
  - `favorite`: 是否收藏（true/false）
- **响应**: 返回提示词列表和分页信息

### 创建提示词
- **URL**: `/api/v1/prompts`
- **方法**: `POST`
- **描述**: 创建新的提示词
- **请求体**:
  ```json
  {
    "content": "提示词内容",
    "response": "AI回答内容",
    "platform": "AI平台名称",
    "url": "对话URL",
    "tags": ["标签1", "标签2"],
    "favorite": false
  }
  ```
- **响应**: 返回创建的提示词信息

### 自动保存提示词
- **URL**: `/api/v1/prompts/auto-save`
- **方法**: `POST`
- **描述**: 自动保存用户与AI平台的对话
- **请求体**:
  ```json
  {
    "content": "用户提问内容",
    "response": "AI回答内容",
    "platform": "AI平台名称",
    "url": "对话URL"
  }
  ```
- **特性**:
  - 检查5分钟内是否有相同内容、平台和URL的记录，有则更新而非创建
  - 实现滚动存储机制，限制未收藏提示词数量为100条
  - 自动记录活动日志

### 快速搜索提示词
- **URL**: `/api/v1/prompts/quick-search`
- **方法**: `GET`
- **描述**: 用于"/"快捷指令搜索系统
- **参数**:
  - `query`: 搜索关键词
  - `limit`: 返回结果数量限制（默认5条）
- **特性**:
  - 按"收藏>高频使用>最近使用"的顺序排列结果
  - 返回简洁信息，适合下拉菜单展示

### 获取最近使用的提示词
- **URL**: `/api/v1/prompts/recent`
- **方法**: `GET`
- **描述**: 获取最近使用的提示词
- **参数**:
  - `limit`: 返回结果数量限制（默认10条）
- **特性**:
  - 按更新时间降序排序
  - 返回完整提示词信息，包括标签

### 批量获取提示词
- **URL**: `/api/v1/prompts/batch`
- **方法**: `POST`
- **描述**: 批量获取多个提示词
- **请求体**:
  ```json
  {
    "ids": ["提示词ID1", "提示词ID2", "提示词ID3"]
  }
  ```
- **响应**: 返回指定ID的提示词列表

### 获取单个提示词
- **URL**: `/api/v1/prompts/:id`
- **方法**: `GET`
- **描述**: 获取单个提示词的详细信息
- **响应**: 返回提示词详细信息

### 更新提示词
- **URL**: `/api/v1/prompts/:id`
- **方法**: `PATCH`
- **描述**: 更新提示词信息
- **请求体**:
  ```json
  {
    "content": "更新的内容",
    "response": "更新的回答",
    "tags": ["新标签1", "新标签2"],
    "favorite": true
  }
  ```
- **响应**: 返回更新后的提示词信息

### 删除提示词
- **URL**: `/api/v1/prompts/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的提示词
- **响应**: 返回删除成功的确认信息

### 切换收藏状态
- **URL**: `/api/v1/prompts/:id/favorite`
- **方法**: `PATCH`
- **描述**: 切换提示词的收藏状态
- **响应**: 返回更新后的收藏状态

### 增加使用次数
- **URL**: `/api/v1/prompts/:id/usage`
- **方法**: `PATCH`
- **描述**: 增加提示词的使用次数
- **响应**: 返回更新后的使用次数

## 提示词优化API

### 获取客户端配置

获取提示词优化功能的客户端配置，包括系统提示词和模型配置。

- **URL**: `/api/v1/prompts/optimize/config`
- **方法**: `GET`
- **认证**: 需要
- **权限**: 用户

#### 响应

```json
{
  "success": true,
  "data": {
    "systemPrompts": {
      "general": "通用优化系统提示词...",
      "programming": "编程优化系统提示词...",
      "writing": "写作优化系统提示词..."
    },
    "modelConfigs": {
      "openai": ["gpt-3.5-turbo", "gpt-4"],
      "deepseek": ["deepseek-chat"],
      "moonshot": ["moonshot-v1-8k"]
    }
  }
}
```

### 优化提示词

优化用户提供的提示词，返回优化后的结果。

- **URL**: `/api/v1/prompts/optimize`
- **方法**: `POST`
- **认证**: 需要
- **权限**: 用户

#### 请求体

```json
{
  "content": "写一篇关于AI的文章",
  "category": "writing",
  "provider": "openai",
  "model": "gpt-4",
  "useClientApi": false,
  "historyId": "60f7b0b9e6b3f32f948a9999",
  "apiKey": "sk-your-api-key"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| content | string | 是 | 需要优化的提示词内容 |
| category | string | 否 | 提示词类别，可选值：general, programming, writing |
| provider | string | 否 | AI服务提供商，可选值：openai, deepseek, moonshot |
| model | string | 否 | 使用的模型名称 |
| useClientApi | boolean | 否 | 是否使用客户端提供的API密钥 |
| historyId | string | 否 | 优化历史ID，用于多轮优化 |
| apiKey | string | 否 | 客户端提供的API密钥 |

#### 响应

```json
{
  "success": true,
  "data": {
    "original": "写一篇关于AI的文章",
    "optimized": "请撰写一篇关于人工智能(AI)的全面文章，包括以下几个方面：\n1. 人工智能的历史发展\n2. 当前AI技术的主要应用领域\n3. AI面临的技术挑战和伦理问题\n4. 未来发展趋势和可能的突破\n\n请确保文章结构清晰，论点有力，使用具体例子和数据支持您的观点。文章长度应在1500-2000字之间，采用学术风格但保持易读性。",
    "improvements": "添加了明确的结构要求、内容指导和格式规范",
    "expectedBenefits": "提高了提示词的明确性和具体性，有助于生成更有组织、更全面的文章",
    "provider": "openai",
    "model": "gpt-4",
    "historyId": "60f7b0b9e6b3f32f948a9999"
  }
}
```

### 获取优化历史列表

获取用户的提示词优化历史记录列表。

- **URL**: `/api/v1/prompts/optimize/history`
- **方法**: `GET`
- **认证**: 需要
- **权限**: 用户

#### 查询参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为10 |
| category | string | 否 | 按类别筛选 |

#### 响应

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b0b9e6b3f32f948a9999",
      "user": "60f7b0b9e6b3f32f948a0000",
      "originalPrompt": "写一篇关于AI的文章",
      "optimizedPrompt": "请撰写一篇关于人工智能(AI)的全面文章...",
      "improvements": "添加了明确的结构要求、内容指导和格式规范",
      "expectedBenefits": "提高了提示词的明确性和具体性...",
      "category": "writing",
      "provider": "openai",
      "model": "gpt-4",
      "rating": 5,
      "feedback": "非常有用的优化",
      "createdAt": "2023-07-21T12:00:00.000Z",
      "updatedAt": "2023-07-21T12:10:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### 获取单个优化历史

获取单个提示词优化历史记录的详细信息。

- **URL**: `/api/v1/prompts/optimize/history/:id`
- **方法**: `GET`
- **认证**: 需要
- **权限**: 用户

#### 路径参数

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 优化历史ID |

#### 响应

```json
{
  "success": true,
  "data": {
    "_id": "60f7b0b9e6b3f32f948a9999",
    "user": "60f7b0b9e6b3f32f948a0000",
    "originalPrompt": "写一篇关于AI的文章",
    "optimizedPrompt": "请撰写一篇关于人工智能(AI)的全面文章...",
    "improvements": "添加了明确的结构要求、内容指导和格式规范",
    "expectedBenefits": "提高了提示词的明确性和具体性...",
    "category": "writing",
    "provider": "openai",
    "model": "gpt-4",
    "rating": 5,
    "feedback": "非常有用的优化",
    "iterations": [
      {
        "optimizedPrompt": "第一次优化结果...",
        "improvements": "第一次改进...",
        "expectedBenefits": "第一次预期效果...",
        "timestamp": "2023-07-21T12:05:00.000Z"
      }
    ],
    "createdAt": "2023-07-21T12:00:00.000Z",
    "updatedAt": "2023-07-21T12:10:00.000Z"
  }
}
```

### 评价优化结果

对提示词优化结果进行评价。

- **URL**: `/api/v1/prompts/optimize/history/:id/rate`
- **方法**: `POST`
- **认证**: 需要
- **权限**: 用户

#### 路径参数

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 优化历史ID |

#### 请求体

```json
{
  "rating": 5,
  "feedback": "非常有用的优化"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| rating | number | 是 | 评分，1-5 |
| feedback | string | 否 | 反馈意见 |

#### 响应

```json
{
  "success": true,
  "data": {
    "_id": "60f7b0b9e6b3f32f948a9999",
    "rating": 5,
    "feedback": "非常有用的优化"
  }
}
```

### 管理API密钥

添加或更新用户的API密钥。

- **URL**: `/api/v1/prompts/optimize/api-keys`
- **方法**: `POST`
- **认证**: 需要
- **权限**: 用户

#### 请求体

```json
{
  "provider": "openai",
  "apiKey": "sk-your-api-key"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| provider | string | 是 | AI服务提供商，可选值：openai, deepseek, moonshot |
| apiKey | string | 是 | API密钥 |

#### 响应

```json
{
  "success": true,
  "data": {
    "_id": "60f7b0b9e6b3f32f948a8888",
    "provider": "openai",
    "isActive": true,
    "createdAt": "2023-07-21T12:00:00.000Z",
    "updatedAt": "2023-07-21T12:00:00.000Z"
  }
}
```

### 获取API密钥列表

获取用户的API密钥列表。

- **URL**: `/api/v1/prompts/optimize/api-keys`
- **方法**: `GET`
- **认证**: 需要
- **权限**: 用户

#### 响应

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b0b9e6b3f32f948a8888",
      "provider": "openai",
      "isActive": true,
      "createdAt": "2023-07-21T12:00:00.000Z",
      "updatedAt": "2023-07-21T12:00:00.000Z"
    }
  ]
}
```

### 删除API密钥

删除用户的API密钥。

- **URL**: `/api/v1/prompts/optimize/api-keys/:id`
- **方法**: `DELETE`
- **认证**: 需要
- **权限**: 用户

#### 路径参数

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | API密钥ID |

#### 响应

```json
{
  "success": true,
  "data": {
    "message": "API密钥已删除"
  }
}
```

## 标签API

### 获取标签列表
- **URL**: `/api/v1/tags`
- **方法**: `GET`
- **描述**: 获取用户的标签列表
- **参数**:
  - `search`: 搜索关键词
  - `sort`: 排序字段（默认"name"）
- **响应**: 返回标签列表，包含每个标签关联的提示词数量

### 创建标签
- **URL**: `/api/v1/tags`
- **方法**: `POST`
- **描述**: 创建新的标签
- **请求体**:
  ```json
  {
    "name": "标签名称",
    "color": "#3498db"
  }
  ```
- **响应**: 返回创建的标签信息

### 获取单个标签
- **URL**: `/api/v1/tags/:id`
- **方法**: `GET`
- **描述**: 获取单个标签的详细信息
- **响应**: 返回标签详细信息和关联的提示词数量

### 更新标签
- **URL**: `/api/v1/tags/:id`
- **方法**: `PATCH`
- **描述**: 更新标签信息
- **请求体**:
  ```json
  {
    "name": "新标签名称",
    "color": "#2ecc71"
  }
  ```
- **响应**: 返回更新后的标签信息

### 删除标签
- **URL**: `/api/v1/tags/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的标签
- **特性**: 删除标签时会自动从所有提示词中移除该标签
- **响应**: 返回删除成功的确认信息

### 获取标签的提示词
- **URL**: `/api/v1/tags/:id/prompts`
- **方法**: `GET`
- **描述**: 获取指定标签关联的所有提示词
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `sort`: 排序字段（默认"-createdAt"）
- **响应**: 返回提示词列表和分页信息

## 会话API

### 获取会话列表
- **URL**: `/api/v1/conversations`
- **方法**: `GET`
- **描述**: 获取用户的会话列表
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `sort`: 排序字段（默认"-updatedAt"）
  - `search`: 搜索关键词
  - `model`: 模型筛选
  - `tag`: 标签名称
- **响应**: 返回会话列表和分页信息

### 创建会话
- **URL**: `/api/v1/conversations`
- **方法**: `POST`
- **描述**: 创建新的会话
- **请求体**:
  ```json
  {
    "model": "gpt-4",
    "title": "会话标题",
    "messages": [
      {
        "role": "user",
        "content": "用户消息内容"
      },
      {
        "role": "assistant",
        "content": "助手回复内容"
      }
    ],
    "tags": ["标签1", "标签2"]
  }
  ```
- **响应**: 返回创建的会话信息

### 获取单个会话
- **URL**: `/api/v1/conversations/:id`
- **方法**: `GET`
- **描述**: 获取单个会话的详细信息
- **响应**: 返回会话详细信息，包括所有消息

### 更新会话
- **URL**: `/api/v1/conversations/:id`
- **方法**: `PATCH`
- **描述**: 更新会话信息
- **请求体**:
  ```json
  {
    "title": "新会话标题",
    "tags": ["新标签1", "新标签2"]
  }
  ```
- **响应**: 返回更新后的会话信息

### 删除会话
- **URL**: `/api/v1/conversations/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的会话
- **响应**: 返回删除成功的确认信息

### 获取会话消息
- **URL**: `/api/v1/conversations/:id/messages`
- **方法**: `GET`
- **描述**: 获取指定会话的所有消息
- **响应**: 返回消息列表

### 添加消息到会话
- **URL**: `/api/v1/conversations/:id/messages`
- **方法**: `POST`
- **描述**: 向指定会话添加新消息
- **请求体**:
  ```json
  {
    "role": "user",
    "content": "新消息内容"
  }
  ```
- **响应**: 返回添加的消息信息

### 清空会话消息
- **URL**: `/api/v1/conversations/:id/messages`
- **方法**: `DELETE`
- **描述**: 清空指定会话的所有消息
- **响应**: 返回清空成功的确认信息

## 活动日志API

### 获取活动日志
- **URL**: `/api/v1/activities`
- **方法**: `GET`
- **描述**: 获取用户的活动日志
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认20）
  - `sort`: 排序字段（默认"-createdAt"）
  - `action`: 操作类型筛选
  - `entityType`: 实体类型筛选
  - `entityId`: 实体ID筛选
  - `startDate`: 开始日期
  - `endDate`: 结束日期
- **响应**: 返回活动日志列表和分页信息

### 获取活动统计
- **URL**: `/api/v1/activities/stats`
- **方法**: `GET`
- **描述**: 获取用户活动的统计信息
- **参数**:
  - `startDate`: 开始日期（默认30天前）
  - `endDate`: 结束日期（默认当前日期）
- **响应**: 返回按操作类型、实体类型和日期的统计数据

### 清除活动日志
- **URL**: `/api/v1/activities`
- **方法**: `DELETE`
- **描述**: 清除用户的活动日志
- **参数**:
  - `olderThan`: 删除指定日期之前的日志
- **响应**: 返回删除的日志数量

## 实现计划

### 前端监听用户与AI平台交互
浏览器插件将通过以下方式监听用户与AI平台的交互：

1. 使用`content_scripts`在特定网站注入JavaScript代码
2. 使用DOM事件监听器和MutationObserver监听用户输入和AI响应
3. 为每个支持的AI平台创建特定的内容脚本
4. 实现自动保存功能，将捕获的内容发送到后端API
5. 提供用户控制选项，允许开启/关闭自动保存功能

### 下一步开发计划
1. 完善标签管理和会话管理API
2. 实现更多测试用例，提高代码覆盖率
3. 开始与前端对接，确保API满足前端需求
4. 实现提示词优化功能，调用大模型API 