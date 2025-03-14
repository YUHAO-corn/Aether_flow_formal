# AetherFlow API全栈指南

## 目录
1. [API文档](#api文档)
   - [概述](#概述)
   - [通用规范](#通用规范)
   - [认证API](#认证api)
   - [提示词API](#提示词api)
   - [标签API](#标签api)
   - [会话API](#会话api)
   - [提示词优化API](#提示词优化api)
   - [API密钥管理API](#api密钥管理api)
   - [活动日志API](#活动日志api)
2. [API实现计划与优化](#api实现计划与优化)
   - [技术栈选择](#技术栈选择)
   - [实现阶段](#实现阶段)
   - [性能优化建议](#性能优化建议)
   - [安全优化建议](#安全优化建议)
   - [可维护性优化建议](#可维护性优化建议)
3. [API响应格式统一方案](#api响应格式统一方案)
   - [问题背景](#问题背景)
   - [解决方案](#解决方案)
   - [具体修改内容](#具体修改内容)
   - [实现代码](#实现代码)

## API文档

### 概述
本部分描述了AetherFlow后端API的使用方法和参数。所有API端点都需要JWT认证（除了登录和注册）。本文档基于前端期望的接口规范重新整理，确保前后端接口完全一致。

### 通用规范

#### 基础URL
所有API请求都应该使用以下基础URL：
```
http://localhost:3000/api/v1
```

#### 认证
除了登录和注册接口外，所有API请求都需要在请求头中包含JWT令牌：
```
Authorization: Bearer <token>
```

#### 响应格式
所有API响应都遵循以下统一格式：
```json
{
  "success": true/false,
  "data": {}, // 成功时返回的数据
  "error": {  // 失败时返回的错误信息
    "code": "ERROR_CODE",
    "message": "错误描述"
  },
  "meta": {   // 元数据，如分页信息
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

#### 错误处理
1. 客户端错误（4xx）：
   - 400: 请求参数错误
   - 401: 未授权
   - 403: 权限不足
   - 404: 资源不存在
   - 429: 请求过于频繁

2. 服务器错误（5xx）：
   - 500: 服务器内部错误
   - 503: 服务不可用

### 认证API

#### 注册
- **URL**: `/auth/register`
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
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱",
        "createdAt": "创建时间"
      },
      "token": "JWT令牌"
    }
  }
  ```

#### 登录
- **URL**: `/auth/login`
- **方法**: `POST`
- **描述**: 用户登录
- **请求体**:
  ```json
  {
    "email": "邮箱",
    "password": "密码"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱",
        "createdAt": "创建时间"
      },
      "token": "JWT令牌"
    }
  }
  ```

#### 登出
- **URL**: `/auth/logout`
- **方法**: `POST`
- **描述**: 用户登出
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "成功登出"
    }
  }
  ```

#### 获取当前用户信息
- **URL**: `/auth/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的信息
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱",
        "settings": {
          "theme": "dark",
          "language": "zh-CN",
          "notifications": true
        },
        "createdAt": "创建时间",
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 更新用户信息
- **URL**: `/auth/me`
- **方法**: `PUT`
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
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "用户ID",
        "username": "新用户名",
        "email": "新邮箱",
        "settings": {
          "theme": "dark",
          "language": "zh-CN",
          "notifications": true
        },
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 修改密码
- **URL**: `/auth/password`
- **方法**: `PUT`
- **描述**: 修改当前用户的密码
- **请求体**:
  ```json
  {
    "currentPassword": "当前密码",
    "newPassword": "新密码"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "密码修改成功"
    }
  }
  ```

### 提示词API

#### 获取提示词列表
- **URL**: `/prompts`
- **方法**: `GET`
- **描述**: 获取用户的提示词列表
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `sort`: 排序字段（默认"-createdAt"）
  - `search`: 搜索关键词
  - `tags`: 标签ID数组，格式为逗号分隔的字符串，如"tag1,tag2"
  - `platform`: AI平台名称
  - `favorite`: 是否收藏（true/false）
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompts": [
        {
          "id": "提示词ID",
          "content": "提示词内容",
          "response": "AI回答内容",
          "platform": "AI平台名称",
          "url": "对话URL",
          "tags": [
            {
              "id": "标签ID",
              "name": "标签名称",
              "color": "标签颜色"
            }
          ],
          "favorite": false,
          "usageCount": 5,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    },
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```

#### 获取单个提示词
- **URL**: `/prompts/:id`
- **方法**: `GET`
- **描述**: 获取单个提示词的详细信息
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompt": {
        "id": "提示词ID",
        "content": "提示词内容",
        "response": "AI回答内容",
        "platform": "AI平台名称",
        "url": "对话URL",
        "tags": [
          {
            "id": "标签ID",
            "name": "标签名称",
            "color": "标签颜色"
          }
        ],
        "favorite": false,
        "usageCount": 5,
        "createdAt": "创建时间",
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 创建提示词
- **URL**: `/prompts`
- **方法**: `POST`
- **描述**: 创建新的提示词
- **请求体**:
  ```json
  {
    "content": "提示词内容",
    "response": "AI回答内容",
    "platform": "AI平台名称",
    "url": "对话URL",
    "tags": ["标签ID1", "标签ID2"],
    "favorite": false
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompt": {
        "id": "提示词ID",
        "content": "提示词内容",
        "response": "AI回答内容",
        "platform": "AI平台名称",
        "url": "对话URL",
        "tags": [
          {
            "id": "标签ID1",
            "name": "标签名称1",
            "color": "标签颜色1"
          },
          {
            "id": "标签ID2",
            "name": "标签名称2",
            "color": "标签颜色2"
          }
        ],
        "favorite": false,
        "usageCount": 0,
        "createdAt": "创建时间",
        "updatedAt": "创建时间"
      }
    }
  }
  ```

#### 更新提示词
- **URL**: `/prompts/:id`
- **方法**: `PUT`
- **描述**: 更新提示词信息
- **请求体**:
  ```json
  {
    "content": "更新的内容",
    "response": "更新的回答",
    "tags": ["新标签ID1", "新标签ID2"],
    "favorite": true
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompt": {
        "id": "提示词ID",
        "content": "更新的内容",
        "response": "更新的回答",
        "platform": "AI平台名称",
        "url": "对话URL",
        "tags": [
          {
            "id": "新标签ID1",
            "name": "新标签名称1",
            "color": "新标签颜色1"
          },
          {
            "id": "新标签ID2",
            "name": "新标签名称2",
            "color": "新标签颜色2"
          }
        ],
        "favorite": true,
        "usageCount": 5,
        "createdAt": "创建时间",
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 删除提示词
- **URL**: `/prompts/:id`
- **方法**: `DELETE`
- **描述**: 删除提示词
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "提示词已成功删除"
    }
  }
  ```

#### 切换收藏状态
- **URL**: `/prompts/:id/favorite`
- **方法**: `PATCH`
- **描述**: 切换提示词的收藏状态
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "favorite": true
    }
  }
  ```

#### 增加使用次数
- **URL**: `/prompts/:id/usage`
- **方法**: `PATCH`
- **描述**: 增加提示词的使用次数
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "usageCount": 6
    }
  }
  ```

#### 自动保存提示词
- **URL**: `/prompts/auto-save`
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
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompt": {
        "id": "提示词ID",
        "content": "用户提问内容",
        "response": "AI回答内容",
        "platform": "AI平台名称",
        "url": "对话URL",
        "tags": [],
        "favorite": false,
        "usageCount": 0,
        "createdAt": "创建时间",
        "updatedAt": "创建时间"
      },
      "isNew": true // 是否新创建的提示词
    }
  }
  ```

#### 快速搜索提示词
- **URL**: `/prompts/quick-search`
- **方法**: `GET`
- **描述**: 用于"/"快捷指令搜索系统
- **参数**:
  - `query`: 搜索关键词
  - `limit`: 返回结果数量限制（默认5条）
- **特性**:
  - 按"收藏>高频使用>最近使用"的顺序排列结果
  - 返回简洁信息，适合下拉菜单展示
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompts": [
        {
          "id": "提示词ID",
          "content": "提示词内容",
          "favorite": true,
          "usageCount": 10
        }
      ]
    }
  }
  ```

#### 批量获取提示词
- **URL**: `/prompts/batch`
- **方法**: `POST`
- **描述**: 批量获取多个提示词
- **请求体**:
  ```json
  {
    "ids": ["提示词ID1", "提示词ID2", "提示词ID3"]
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompts": [
        {
          "id": "提示词ID1",
          "content": "提示词内容1",
          "response": "AI回答内容1",
          "platform": "AI平台名称",
          "url": "对话URL1",
          "tags": [],
          "favorite": false,
          "usageCount": 5,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        },
        {
          "id": "提示词ID2",
          "content": "提示词内容2",
          "response": "AI回答内容2",
          "platform": "AI平台名称",
          "url": "对话URL2",
          "tags": [],
          "favorite": true,
          "usageCount": 3,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```

#### 获取最近使用的提示词
- **URL**: `/prompts/recent`
- **方法**: `GET`
- **描述**: 获取最近使用的提示词
- **参数**:
  - `limit`: 返回结果数量限制（默认10条）
- **特性**:
  - 按更新时间降序排序
  - 返回完整提示词信息，包括标签
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompts": [
        {
          "id": "提示词ID",
          "content": "提示词内容",
          "response": "AI回答内容",
          "platform": "AI平台名称",
          "url": "对话URL",
          "tags": [],
          "favorite": false,
          "usageCount": 5,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```

### 标签API

#### 获取标签列表
- **URL**: `/tags`
- **方法**: `GET`
- **描述**: 获取用户的标签列表
- **参数**:
  - `search`: 搜索关键词
  - `sort`: 排序字段（默认"name"）
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "tags": [
        {
          "id": "标签ID",
          "name": "标签名称",
          "color": "#3498db",
          "promptCount": 5,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```

#### 创建标签
- **URL**: `/tags`
- **方法**: `POST`
- **描述**: 创建新的标签
- **请求体**:
  ```json
  {
    "name": "标签名称",
    "color": "#3498db"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "tag": {
        "id": "标签ID",
        "name": "标签名称",
        "color": "#3498db",
        "promptCount": 0,
        "createdAt": "创建时间",
        "updatedAt": "创建时间"
      }
    }
  }
  ```

#### 更新标签
- **URL**: `/tags/:id`
- **方法**: `PUT`
- **描述**: 更新标签信息
- **请求体**:
  ```json
  {
    "name": "新标签名称",
    "color": "#2ecc71"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "tag": {
        "id": "标签ID",
        "name": "新标签名称",
        "color": "#2ecc71",
        "promptCount": 5,
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 删除标签
- **URL**: `/tags/:id`
- **方法**: `DELETE`
- **描述**: 删除标签
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "标签已成功删除"
    }
  }
  ```

#### 获取标签下的提示词
- **URL**: `/tags/:id/prompts`
- **方法**: `GET`
- **描述**: 获取特定标签下的所有提示词
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `sort`: 排序字段（默认"-createdAt"）
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompts": [
        {
          "id": "提示词ID",
          "content": "提示词内容",
          "response": "AI回答内容",
          "platform": "AI平台名称",
          "url": "对话URL",
          "tags": [
            {
              "id": "标签ID",
              "name": "标签名称",
              "color": "标签颜色"
            }
          ],
          "favorite": false,
          "usageCount": 5,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    },
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 5
    }
  }
  ```

### 会话API

#### 获取会话列表
- **URL**: `/conversations`
- **方法**: `GET`
- **描述**: 获取用户的会话列表
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
  - `sort`: 排序字段（默认"-updatedAt"）
  - `search`: 搜索关键词
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "conversations": [
        {
          "id": "会话ID",
          "title": "会话标题",
          "description": "会话描述",
          "messages": [
            {
              "role": "user",
              "content": "用户消息内容"
            },
            {
              "role": "assistant",
              "content": "AI回复内容"
            }
          ],
          "platform": "AI平台名称",
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    },
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```

#### 获取单个会话
- **URL**: `/conversations/:id`
- **方法**: `GET`
- **描述**: 获取单个会话的详细信息
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "会话ID",
        "title": "会话标题",
        "description": "会话描述",
        "messages": [
          {
            "role": "user",
            "content": "用户消息内容"
          },
          {
            "role": "assistant",
            "content": "AI回复内容"
          }
        ],
        "platform": "AI平台名称",
        "createdAt": "创建时间",
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 创建会话
- **URL**: `/conversations`
- **方法**: `POST`
- **描述**: 创建新的会话
- **请求体**:
  ```json
  {
    "title": "会话标题",
    "description": "会话描述",
    "messages": [
      {
        "role": "user",
        "content": "用户消息内容"
      },
      {
        "role": "assistant",
        "content": "AI回复内容"
      }
    ],
    "platform": "AI平台名称"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "会话ID",
        "title": "会话标题",
        "description": "会话描述",
        "messages": [
          {
            "role": "user",
            "content": "用户消息内容"
          },
          {
            "role": "assistant",
            "content": "AI回复内容"
          }
        ],
        "platform": "AI平台名称",
        "createdAt": "创建时间",
        "updatedAt": "创建时间"
      }
    }
  }
  ```

#### 更新会话
- **URL**: `/conversations/:id`
- **方法**: `PUT`
- **描述**: 更新会话信息
- **请求体**:
  ```json
  {
    "title": "更新的标题",
    "description": "更新的描述",
    "messages": [
      {
        "role": "user",
        "content": "用户消息内容"
      },
      {
        "role": "assistant",
        "content": "AI回复内容"
      },
      {
        "role": "user",
        "content": "新的用户消息"
      },
      {
        "role": "assistant",
        "content": "新的AI回复"
      }
    ]
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "会话ID",
        "title": "更新的标题",
        "description": "更新的描述",
        "messages": [
          {
            "role": "user",
            "content": "用户消息内容"
          },
          {
            "role": "assistant",
            "content": "AI回复内容"
          },
          {
            "role": "user",
            "content": "新的用户消息"
          },
          {
            "role": "assistant",
            "content": "新的AI回复"
          }
        ],
        "platform": "AI平台名称",
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 删除会话
- **URL**: `/conversations/:id`
- **方法**: `DELETE`
- **描述**: 删除会话
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "会话已成功删除"
    }
  }
  ```

#### 添加消息到会话
- **URL**: `/conversations/:id/messages`
- **方法**: `POST`
- **描述**: 向现有会话添加新消息
- **请求体**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "新的用户消息"
      },
      {
        "role": "assistant",
        "content": "新的AI回复"
      }
    ]
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "会话ID",
        "messages": [
          // 所有消息，包括新添加的
        ],
        "updatedAt": "更新时间"
      }
    }
  }
  ```

### 提示词优化API

#### 优化提示词
- **URL**: `/prompt-optimization/optimize`
- **方法**: `POST`
- **描述**: 使用AI优化用户的提示词
- **请求体**:
  ```json
  {
    "content": "原始提示词内容",
    "category": "提示词类别（可选）",
    "clientApi": "客户端使用的API（可选，如openai、anthropic等）",
    "clientApiKey": "客户端API密钥（可选）"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "original": "原始提示词内容",
      "optimized": "优化后的提示词内容",
      "improvements": "改进说明",
      "expectedBenefits": "预期效果"
    }
  }
  ```

#### 获取优化配置
- **URL**: `/prompt-optimization/config`
- **方法**: `GET`
- **描述**: 获取提示词优化的配置信息
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "supportedApis": ["openai", "anthropic", "deepseek", "moonshot"],
      "defaultApi": "openai",
      "categories": [
        "general",
        "programming",
        "writing",
        "data_analysis",
        "creative"
      ],
      "userHasApiKey": true,
      "systemHasApiKey": true
    }
  }
  ```

#### 保存优化结果
- **URL**: `/prompt-optimization/save`
- **方法**: `POST`
- **描述**: 将优化后的提示词保存到提示词库
- **请求体**:
  ```json
  {
    "original": "原始提示词内容",
    "optimized": "优化后的提示词内容",
    "category": "提示词类别（可选）",
    "tags": ["标签ID1", "标签ID2"]
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "prompt": {
        "id": "提示词ID",
        "content": "优化后的提示词内容",
        "response": "",
        "platform": "AetherFlow Optimizer",
        "tags": [
          {
            "id": "标签ID1",
            "name": "标签名称1",
            "color": "标签颜色1"
          }
        ],
        "favorite": false,
        "usageCount": 0,
        "createdAt": "创建时间",
        "updatedAt": "创建时间"
      }
    }
  }
  ```

### API密钥管理API

#### 获取API密钥列表
- **URL**: `/api-keys`
- **方法**: `GET`
- **描述**: 获取用户的API密钥列表
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "apiKeys": [
        {
          "id": "密钥ID",
          "name": "密钥名称",
          "provider": "openai",
          "lastFour": "sk-...1234",
          "isActive": true,
          "createdAt": "创建时间",
          "updatedAt": "更新时间"
        }
      ]
    }
  }
  ```

#### 添加API密钥
- **URL**: `/api-keys`
- **方法**: `POST`
- **描述**: 添加新的API密钥
- **请求体**:
  ```json
  {
    "name": "密钥名称",
    "provider": "openai",
    "key": "sk-actual-api-key"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "apiKey": {
        "id": "密钥ID",
        "name": "密钥名称",
        "provider": "openai",
        "lastFour": "sk-...1234",
        "isActive": true,
        "createdAt": "创建时间",
        "updatedAt": "创建时间"
      }
    }
  }
  ```

#### 更新API密钥
- **URL**: `/api-keys/:id`
- **方法**: `PUT`
- **描述**: 更新API密钥信息
- **请求体**:
  ```json
  {
    "name": "新密钥名称",
    "isActive": false
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "apiKey": {
        "id": "密钥ID",
        "name": "新密钥名称",
        "provider": "openai",
        "lastFour": "sk-...1234",
        "isActive": false,
        "updatedAt": "更新时间"
      }
    }
  }
  ```

#### 删除API密钥
- **URL**: `/api-keys/:id`
- **方法**: `DELETE`
- **描述**: 删除API密钥
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "API密钥已成功删除"
    }
  }
  ```

#### 验证API密钥
- **URL**: `/api-keys/verify`
- **方法**: `POST`
- **描述**: 验证API密钥是否有效
- **请求体**:
  ```json
  {
    "provider": "openai",
    "key": "sk-actual-api-key"
  }
  ```
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "details": {
        "models": ["gpt-3.5-turbo", "gpt-4"],
        "expiresAt": null
      }
    }
  }
  ```

### 活动日志API

#### 获取活动日志
- **URL**: `/activity`
- **方法**: `GET`
- **描述**: 获取用户的活动日志
- **参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认20）
  - `sort`: 排序字段（默认"-createdAt"）
  - `action`: 活动类型（如create、update、delete等）
  - `entityType`: 实体类型（如Prompt、Tag、Conversation等）
  - `startDate`: 开始日期（ISO格式）
  - `endDate`: 结束日期（ISO格式）
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "activities": [
        {
          "id": "活动ID",
          "user": {
            "id": "用户ID",
            "username": "用户名"
          },
          "action": "create",
          "entityType": "Prompt",
          "entityId": "实体ID",
          "details": {
            "content": "提示词内容片段..."
          },
          "createdAt": "创建时间"
        }
      ]
    },
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
  ```

#### 获取单个活动日志
- **URL**: `/activity/:id`
- **方法**: `GET`
- **描述**: 获取单个活动日志的详细信息
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "activity": {
        "id": "活动ID",
        "user": {
          "id": "用户ID",
          "username": "用户名"
        },
        "action": "create",
        "entityType": "Prompt",
        "entityId": "实体ID",
        "details": {
          "content": "完整提示词内容",
          "tags": ["标签1", "标签2"]
        },
        "createdAt": "创建时间"
      }
    }
  }
  ```

#### 获取活动统计
- **URL**: `/activity/stats`
- **方法**: `GET`
- **描述**: 获取活动统计信息
- **参数**:
  - `startDate`: 开始日期（ISO格式）
  - `endDate`: 结束日期（ISO格式）
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "total": 150,
        "byAction": {
          "create": 50,
          "update": 30,
          "delete": 10,
          "view": 60
        },
        "byEntityType": {
          "Prompt": 80,
          "Tag": 20,
          "Conversation": 40,
          "ApiKey": 10
        },
        "byDate": {
          "2023-06-01": 10,
          "2023-06-02": 15,
          "2023-06-03": 20
        }
      }
    }
  }
  ```

#### 清除活动日志
- **URL**: `/activity`
- **方法**: `DELETE`
- **描述**: 清除用户的活动日志
- **参数**:
  - `startDate`: 开始日期（ISO格式）
  - `endDate`: 结束日期（ISO格式）
  - `action`: 活动类型
  - `entityType`: 实体类型
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "活动日志已成功清除",
      "count": 25
    }
  }
  ```

## API实现计划与优化

### 概述
本部分详细描述了AetherFlow后端API的实现计划和优化建议，包括实现顺序、技术选择、时间安排以及性能、安全性和可维护性的优化方案。

### 技术栈选择

- **后端框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (JSON Web Token)
- **API文档**: Swagger/OpenAPI
- **测试框架**: Jest + Supertest
- **日志系统**: Winston
- **缓存**: Redis
- **部署**: Docker + Kubernetes

### 实现阶段

#### 第一阶段：基础架构搭建（1天）

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

#### 第二阶段：核心API实现（2-3天）

1. **认证API**
   - `/auth/register` - 用户注册
   - `/auth/login` - 用户登录
   - `/auth/logout` - 用户登出
   - `/auth/me` (GET) - 获取当前用户信息
   - `/auth/me` (PUT) - 更新用户信息
   - `/auth/password` - 修改密码

2. **提示词API**
   - `/prompts` (GET) - 获取提示词列表
   - `/prompts/:id` (GET) - 获取单个提示词
   - `/prompts` (POST) - 创建提示词
   - `/prompts/:id` (PUT) - 更新提示词
   - `/prompts/:id` (DELETE) - 删除提示词
   - `/prompts/search` - 搜索提示词

3. **标签API**
   - `/tags` (GET) - 获取标签列表
   - `/tags` (POST) - 创建标签
   - `/tags/:id` (GET) - 获取单个标签
   - `/tags/:id` (PUT) - 更新标签
   - `/tags/:id` (DELETE) - 删除标签

#### 第三阶段：高级功能API实现（3-4天）

1. **提示词扩展API**
   - `/prompts/auto-save` - 自动保存提示词
   - `/prompts/quick-search` - 快速搜索提示词
   - `/prompts/batch` - 批量获取提示词
   - `/prompts/recent` - 获取最近使用的提示词
   - `/prompts/:id/favorite` - 收藏/取消收藏提示词
   - `/prompts/:id/usage` - 更新提示词使用次数

2. **标签扩展API**
   - `/tags/:id/prompts` - 获取标签关联的提示词

3. **会话API**
   - `/conversations` (GET) - 获取会话列表
   - `/conversations` (POST) - 创建会话
   - `/conversations/:id` (GET) - 获取单个会话
   - `/conversations/:id` (PUT) - 更新会话
   - `/conversations/:id` (DELETE) - 删除会话
   - `/conversations/:id/messages` (GET) - 获取会话消息
   - `/conversations/:id/messages` (POST) - 添加消息到会话
   - `/conversations/:id/messages` (DELETE) - 清空会话消息

#### 第四阶段：高级功能和优化（4-5天）

1. **提示词优化API**
   - `/prompts/optimize/config` - 获取优化配置
   - `/prompts/optimize` - 优化提示词
   - `/prompts/optimize/history` - 获取优化历史
   - `/prompts/optimize/history/:id` - 获取单个优化记录
   - `/prompts/optimize/history/:id/rate` - 评价优化结果

2. **API密钥管理**
   - `/api-keys` (GET) - 获取API密钥列表
   - `/api-keys` (POST) - 添加API密钥
   - `/api-keys/:id/verify` - 验证API密钥
   - `/api-keys/:id` (PUT) - 更新API密钥
   - `/api-keys/:id` (DELETE) - 删除API密钥

3. **活动日志API**
   - `/activities` (GET) - 获取活动日志
   - `/activities/:id` (GET) - 获取单个活动日志
   - `/activities/stats` - 获取活动统计
   - `/activities` (DELETE) - 清除活动日志

### 性能优化建议

#### 1. 数据库查询优化

##### 索引优化
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

##### 查询优化
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

#### 2. 缓存策略

##### Redis缓存
- 缓存频繁访问但不常变化的数据：
  - 用户标签列表
  - 热门提示词
  - 用户设置

```javascript
// 示例Redis缓存实现
const getTagsWithCache = async (userId) => {
  const cacheKey = `tags:${userId}`;
  
  // 尝试从缓存获取
  const cachedTags = await redisClient.get(cacheKey);
  if (cachedTags) {
    return JSON.parse(cachedTags);
  }
  
  // 缓存未命中，从数据库获取
  const tags = await Tag.find({ userId });
  
  // 存入缓存，设置过期时间
  await redisClient.set(cacheKey, JSON.stringify(tags), 'EX', 3600); // 1小时过期
  
  return tags;
};
```

##### 内存缓存
- 使用Node.js内置的`node-cache`或类似库缓存：
  - API配置
  - 系统设置
  - 静态数据

#### 3. 响应优化

##### 分页实现
- 所有列表接口实现分页
- 使用基于游标的分页代替偏移分页，提高大数据量下的性能

```javascript
// 基于游标的分页示例
const getPrompts = async (userId, limit = 20, cursor) => {
  const query = { userId };
  
  // 如果提供了游标，添加条件
  if (cursor) {
    query._id = { $lt: new ObjectId(cursor) };
  }
  
  const prompts = await Prompt.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1); // 多获取一条用于下一页游标
    
  const hasNextPage = prompts.length > limit;
  const results = hasNextPage ? prompts.slice(0, -1) : prompts;
  
  return {
    prompts: results,
    pageInfo: {
      hasNextPage,
      nextCursor: hasNextPage ? results[results.length - 1]._id : null
    }
  };
};
```

##### 响应压缩
- 启用gzip/brotli压缩减少传输数据大小

```javascript
// 在Express应用中启用压缩
const compression = require('compression');
app.use(compression());
```

#### 4. 并发处理

##### 异步任务队列
- 使用Bull或类似队列系统处理耗时操作：
  - 提示词优化
  - 数据导入/导出
  - 报告生成

```javascript
// 使用Bull队列处理提示词优化
const optimizeQueue = new Bull('prompt-optimization');

// 添加任务到队列
const optimizePrompt = async (promptId, userId) => {
  await optimizeQueue.add({
    promptId,
    userId
  });
  return { status: 'queued' };
};

// 处理队列任务
optimizeQueue.process(async (job) => {
  const { promptId, userId } = job.data;
  // 执行优化逻辑
  const result = await performOptimization(promptId, userId);
  // 存储结果
  await saveOptimizationResult(promptId, result);
  return result;
});
```

### 安全优化建议

#### 1. 输入验证

##### 请求验证
- 使用Joi或express-validator验证所有API输入
- 实现自定义验证中间件

```javascript
// 使用Joi验证创建提示词请求
const createPromptSchema = Joi.object({
  content: Joi.string().required().min(10).max(5000),
  tags: Joi.array().items(Joi.string()),
  platform: Joi.string().valid('openai', 'claude', 'gemini', 'other'),
  favorite: Joi.boolean().default(false)
});

// 验证中间件
const validatePrompt = (req, res, next) => {
  const { error } = createPromptSchema.validate(req.body);
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

// 在路由中使用
router.post('/prompts', validatePrompt, createPrompt);
```

##### 数据清理
- 对所有用户输入进行清理，防止XSS攻击
- 使用DOMPurify等库处理富文本内容

#### 2. 认证与授权

##### 强化JWT
- 使用短期令牌和刷新令牌机制
- 实现令牌轮换和撤销机制

```javascript
// 生成访问令牌和刷新令牌
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 短期访问令牌
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // 长期刷新令牌
  );
  
  return { accessToken, refreshToken };
};

// 刷新令牌端点
router.post('/auth/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'REFRESH_TOKEN_REQUIRED',
        message: '刷新令牌是必需的'
      }
    });
  }
  
  try {
    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // 检查令牌是否已被撤销
    const isRevoked = await checkTokenRevoked(refreshToken);
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: '令牌已被撤销'
        }
      });
    }
    
    // 生成新的令牌对
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    
    // 撤销旧的刷新令牌
    await revokeToken(refreshToken);
    
    // 返回新的令牌对
    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: '无效的刷新令牌'
      }
    });
  }
});
```

##### 细粒度权限控制
- 实现基于角色的访问控制（RBAC）
- 为API端点添加权限检查

#### 3. 数据保护

##### 敏感数据加密
- 加密存储API密钥和其他敏感信息
- 使用环境变量存储加密密钥

```javascript
// 加密API密钥
const encryptApiKey = (apiKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex')
  };
};

// 解密API密钥
const decryptApiKey = (encryptedKey, iv) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

##### 数据隔离
- 严格实施多租户数据隔离
- 所有查询都必须包含用户ID条件

### 可维护性优化建议

#### 1. 代码组织

##### 模块化结构
- 按功能领域组织代码
- 实现清晰的层次结构：路由 -> 控制器 -> 服务 -> 模型

```
src/
├── routes/
│   ├── authRoutes.js
│   ├── promptRoutes.js
│   └── ...
├── controllers/
│   ├── authController.js
│   ├── promptController.js
│   └── ...
├── services/
│   ├── authService.js
│   ├── promptService.js
│   └── ...
├── models/
│   ├── User.js
│   ├── Prompt.js
│   └── ...
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── ...
├── utils/
│   ├── logger.js
│   ├── response.js
│   └── ...
└── app.js
```

##### 依赖注入
- 使用依赖注入简化测试和维护
- 避免硬编码依赖

#### 2. 错误处理

##### 统一错误处理
- 创建自定义错误类
- 实现全局错误处理中间件

```javascript
// 自定义错误类
class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 默认为500错误
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'SERVER_ERROR';
  const message = err.message || '服务器内部错误';
  
  // 记录错误
  logger.error(`${statusCode} - ${errorCode}: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  });
  
  // 生产环境不返回堆栈信息
  const response = {
    success: false,
    error: {
      code: errorCode,
      message
    }
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
};

// 在应用中使用
app.use(errorHandler);
```

##### 异步错误处理
- 使用异步包装器捕获Promise错误
- 确保所有异步错误都能被捕获

```javascript
// 异步包装器
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 在路由中使用
router.get('/prompts', catchAsync(async (req, res) => {
  const prompts = await promptService.getPrompts(req.user.id);
  res.json({
    success: true,
    data: prompts
  });
}));
```

#### 3. 日志记录

##### 结构化日志
- 使用Winston等库实现结构化日志
- 记录请求、响应和错误信息

```javascript
// 配置Winston日志
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    });
  });
  
  next();
};

// 在应用中使用
app.use(requestLogger);
```

##### 监控集成
- 集成应用监控工具（如New Relic, Datadog）
- 实现健康检查端点

```javascript
// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await mongoose.connection.db.admin().ping();
    
    // 检查Redis连接
    await redisClient.ping();
    
    res.json({
      success: true,
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 测试策略

#### 单元测试
- 测试所有服务和工具函数
- 使用模拟对象隔离依赖

#### 集成测试
- 测试API端点的完整功能
- 使用内存数据库进行测试

#### 端到端测试
- 测试关键用户流程
- 模拟真实环境

### 部署策略

#### 容器化
- 使用Docker容器化应用
- 创建多阶段构建优化镜像大小

#### CI/CD
- 实现持续集成和部署流程
- 自动化测试和部署

#### 扩展性
- 设计水平扩展架构
- 使用负载均衡器分发流量

### 实施时间表

1. **第一周**：基础架构搭建和核心API实现
2. **第二周**：高级功能API实现和初步优化
3. **第三周**：性能优化和安全加固
4. **第四周**：测试、文档和部署准备

## API响应格式统一方案

### 问题背景

在AetherFlow项目开发过程中，我们发现前后端API响应格式存在不匹配问题：

1. **前端期望的格式**：
   ```json
   {
     "data": {
       "prompts": [...]
     }
   }
   ```

2. **后端实际返回的格式**：
   ```json
   {
     "success": true,
     "status": "success",
     "data": [...]
   }
   ```

3. **字段命名差异**：
   - 前端期望：`id`
   - 后端实际：`_id`（MongoDB默认主键名称）

这种不匹配导致前端无法正确显示后端返回的数据，需要通过浏览器控制台注入适配代码才能正常工作。

### 解决方案

我们采用了修改后端响应处理器的方案，直接从源头解决问题：

1. **修改`responseHandler.js`文件**：
   - 识别不同类型的响应数据（提示词列表、单个提示词、标签列表等）
   - 根据数据类型转换为前端期望的格式
   - 将MongoDB的`_id`字段映射为`id`

2. **保持向后兼容**：
   - 对于无法识别的数据类型，保持原有的响应格式
   - 确保其他可能的客户端不受影响

### 具体修改内容

#### 1. 提示词列表响应

**修改前**：
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "_id": "67d29356b200200a484c2067",
      "content": "提示词内容",
      "response": "AI回答内容",
      "platform": "AI平台名称",
      "tags": [...]
    }
  ]
}
```

**修改后**：
```json
{
  "data": {
    "prompts": [
      {
        "id": "67d29356b200200a484c2067",
        "content": "提示词内容",
        "response": "AI回答内容",
        "platform": "AI平台名称",
        "tags": [...]
      }
    ]
  }
}
```

#### 2. 单个提示词响应

**修改前**：
```json
{
  "success": true,
  "status": "success",
  "data": {
    "_id": "67d29356b200200a484c2067",
    "content": "提示词内容",
    "response": "AI回答内容",
    "platform": "AI平台名称",
    "tags": [...]
  }
}
```

**修改后**：
```json
{
  "data": {
    "prompt": {
      "id": "67d29356b200200a484c2067",
      "content": "提示词内容",
      "response": "AI回答内容",
      "platform": "AI平台名称",
      "tags": [...]
    }
  }
}
```

#### 3. 标签列表响应

**修改前**：
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "_id": "67d29356b200200a484c2068",
      "name": "标签名称",
      "color": "#FF5733"
    }
  ]
}
```

**修改后**：
```json
{
  "data": {
    "tags": [
      {
        "id": "67d29356b200200a484c2068",
        "name": "标签名称",
        "color": "#FF5733"
      }
    ]
  }
}
```

#### 4. 用户认证响应

**修改前**：
```json
{
  "success": true,
  "status": "success",
  "data": {
    "userId": "67d29356b200200a484c2069",
    "username": "testuser",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**修改后**：
```json
{
  "data": {
    "user": {
      "id": "67d29356b200200a484c2069",
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 实现代码

```javascript
// src/utils/responseHandler.js

/**
 * 统一响应处理器
 * 将后端响应格式转换为前端期望的格式
 */
const formatResponse = (data) => {
  // 如果是数组，判断内容类型并格式化
  if (Array.isArray(data)) {
    // 提示词列表
    if (data.length > 0 && data[0].content && (data[0].platform || data[0].response)) {
      return {
        prompts: data.map(item => formatItem(item))
      };
    }
    // 标签列表
    else if (data.length > 0 && data[0].name && data[0].color) {
      return {
        tags: data.map(item => formatItem(item))
      };
    }
    // 会话列表
    else if (data.length > 0 && data[0].messages && Array.isArray(data[0].messages)) {
      return {
        conversations: data.map(item => formatItem(item))
      };
    }
    // 活动日志列表
    else if (data.length > 0 && data[0].action && data[0].entityType) {
      return {
        activities: data.map(item => formatItem(item))
      };
    }
    // 其他类型数组，保持原样
    return data.map(item => formatItem(item));
  }
  
  // 如果是对象，判断类型并格式化
  if (data && typeof data === 'object') {
    // 单个提示词
    if (data.content && (data.platform || data.response)) {
      return {
        prompt: formatItem(data)
      };
    }
    // 单个标签
    else if (data.name && data.color) {
      return {
        tag: formatItem(data)
      };
    }
    // 单个会话
    else if (data.messages && Array.isArray(data.messages)) {
      return {
        conversation: formatItem(data)
      };
    }
    // 单个活动日志
    else if (data.action && data.entityType) {
      return {
        activity: formatItem(data)
      };
    }
    // 用户认证响应
    else if (data.userId || data.username) {
      const formattedData = {};
      if (data.userId || data.username || data.email) {
        formattedData.user = {
          id: data.userId || data._id,
          username: data.username,
          email: data.email
        };
      }
      if (data.token) {
        formattedData.token = data.token;
      }
      return formattedData;
    }
    // 其他类型对象，递归格式化
    return formatItem(data);
  }
  
  // 原始类型，直接返回
  return data;
};

/**
 * 格式化单个数据项
 * 将_id转换为id，递归处理嵌套对象
 */
const formatItem = (item) => {
  if (!item || typeof item !== 'object') {
    return item;
  }
  
  const result = {};
  
  // 处理所有属性
  for (const key in item) {
    if (key === '_id') {
      // 将_id转换为id
      result.id = item._id.toString();
    } else if (Array.isArray(item[key])) {
      // 递归处理数组
      result[key] = item[key].map(element => formatItem(element));
    } else if (item[key] && typeof item[key] === 'object' && item[key]._id) {
      // 递归处理包含_id的对象
      result[key] = formatItem(item[key]);
    } else {
      // 其他属性保持不变
      result[key] = item[key];
    }
  }
  
  return result;
};

/**
 * 成功响应
 */
exports.successResponse = (res, data = {}, statusCode = 200) => {
  // 格式化响应数据
  const formattedData = formatResponse(data);
  
  // 返回统一格式的成功响应
  return res.status(statusCode).json({
    data: formattedData
  });
};

/**
 * 错误响应
 */
exports.errorResponse = (res, message, statusCode = 400, errorCode = null) => {
  return res.status(statusCode).json({
    error: {
      message,
      code: errorCode || `ERR_${statusCode}`
    }
  });
};
``` 