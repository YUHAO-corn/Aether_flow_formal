# AetherFlow API文档（更新版）

## 概述
本文档描述了AetherFlow后端API的使用方法和参数。所有API端点都需要JWT认证（除了登录和注册）。本文档基于前端期望的接口规范重新整理，确保前后端接口完全一致。

## 通用规范

### 基础URL
所有API请求都应该使用以下基础URL：
```
http://localhost:3000/api/v1
```

### 认证
除了登录和注册接口外，所有API请求都需要在请求头中包含JWT令牌：
```
Authorization: Bearer <token>
```

### 响应格式
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

### 错误处理
1. 客户端错误（4xx）：
   - 400: 请求参数错误
   - 401: 未授权
   - 403: 权限不足
   - 404: 资源不存在
   - 429: 请求过于频繁

2. 服务器错误（5xx）：
   - 500: 服务器内部错误
   - 503: 服务不可用

## 认证API

### 注册
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

### 登录
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

### 登出
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

### 获取当前用户信息
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

### 更新用户信息
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

### 修改密码
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

## 提示词API

### 获取提示词列表
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

### 获取单个提示词
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

### 创建提示词
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

### 更新提示词
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
        "updatedAt": "更新时间"
      }
    }
  }
  ```

### 删除提示词
- **URL**: `/prompts/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的提示词
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "提示词已成功删除"
    }
  }
  ```

### 自动保存提示词
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

### 快速搜索提示词
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

### 批量获取提示词
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

### 获取最近使用的提示词
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

## 标签API

### 获取标签列表
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

### 创建标签
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

### 获取单个标签
- **URL**: `/tags/:id`
- **方法**: `GET`
- **描述**: 获取单个标签的详细信息
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "tag": {
        "id": "标签ID",
        "name": "标签名称",
        "color": "#3498db",
        "promptCount": 5,
        "createdAt": "创建时间",
        "updatedAt": "更新时间"
      }
    }
  }
  ```

### 更新标签
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

### 删除标签
- **URL**: `/tags/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的标签
- **特性**: 删除标签时会自动从所有提示词中移除该标签
- **响应**: 
  ```json
  {
    "success": true,
    "data": {
      "message": "标签已成功删除"
    }
  }
  ```

### 获取标签的提示词
- **URL**: `/tags/:id/prompts`
- **方法**: `GET`
- **描述**: 获取指定标签关联的所有提示词
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
      "total": 100
    }
  }
  ``` 