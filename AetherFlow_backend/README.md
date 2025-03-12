# AetherFlow 后端服务

AetherFlow是一款浏览器插件与网页端的混合产品，用于快速调用和管理Prompt。本仓库包含AetherFlow的后端服务代码。

## 功能特性

- 用户认证与授权
- Prompt管理（创建、查询、更新、删除）
- 标签管理
- 会话管理
- 活动日志记录
- 数据统计分析

## 技术栈

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT认证
- Winston日志
- Joi数据验证

## 开始使用

### 前提条件

- Node.js (>= 16.0.0)
- MongoDB

### 安装

1. 克隆仓库
```
git clone <repository-url>
cd AetherFlow_backend
```

2. 安装依赖
```
npm install
```

3. 配置环境变量
```
cp .env.example .env
```
然后编辑`.env`文件，填入你的配置信息。

### 运行

开发环境：
```
npm run dev
```

生产环境：
```
npm start
```

## API文档

### 认证API

- `POST /api/v1/auth/register` - 注册新用户
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前用户信息
- `PATCH /api/v1/auth/updateMe` - 更新用户信息
- `POST /api/v1/auth/logout` - 用户登出

### Prompt API

- `GET /api/v1/prompts` - 获取提示词列表
- `POST /api/v1/prompts` - 创建提示词
- `GET /api/v1/prompts/:id` - 获取单个提示词
- `PATCH /api/v1/prompts/:id` - 更新提示词
- `DELETE /api/v1/prompts/:id` - 删除提示词
- `PATCH /api/v1/prompts/:id/favorite` - 切换收藏状态
- `PATCH /api/v1/prompts/:id/usage` - 增加使用次数
- `POST /api/v1/prompts/enhance` - 优化提示词

### 标签API

- `GET /api/v1/tags` - 获取标签列表
- `POST /api/v1/tags` - 创建标签
- `GET /api/v1/tags/:id` - 获取单个标签
- `PATCH /api/v1/tags/:id` - 更新标签
- `DELETE /api/v1/tags/:id` - 删除标签
- `GET /api/v1/tags/:id/prompts` - 获取标签的提示词

### 会话API

- `GET /api/v1/conversations` - 获取会话列表
- `POST /api/v1/conversations` - 创建会话
- `GET /api/v1/conversations/:id` - 获取单个会话
- `PATCH /api/v1/conversations/:id` - 更新会话
- `DELETE /api/v1/conversations/:id` - 删除会话
- `GET /api/v1/conversations/:id/messages` - 获取会话的消息
- `POST /api/v1/conversations/:id/messages` - 添加消息到会话
- `DELETE /api/v1/conversations/:id/messages` - 清空会话消息

### 活动日志API

- `GET /api/v1/activities` - 获取活动日志
- `GET /api/v1/activities/stats` - 获取活动统计信息
- `DELETE /api/v1/activities` - 清除活动日志
- `GET /api/v1/activities/:id` - 获取单个活动日志

## 项目结构

```
src/
├── controllers/       # 控制器
├── middlewares/       # 中间件
├── models/            # 数据模型
├── routes/            # 路由
├── utils/             # 工具函数
├── app.js             # Express应用
└── server.js          # 服务器入口
```

## 贡献指南

1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[ISC](LICENSE) 