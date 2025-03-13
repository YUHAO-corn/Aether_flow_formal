# AetherFlow (以太流动)

## 产品愿景
让AI潜能随需释放

## 产品概述
AetherFlow是一款浏览器插件与网页端的混合产品，用户可以通过它快速调用和管理Prompt，提升AI交互效率。

## 核心功能
### 浏览器插件功能
- **Prompt Save**: 自动存储用户与AI平台的对话信息
- **Prompt Image**: 通过"/"快捷指令实时搜索并插入提示词
- **Prompt Library**: 展示提示词卡片列表，支持插入和复制操作
- **Prompt Enhancement**: 优化用户输入的Prompt，提供更高质量的提示词
- **Suggestion**: 系统预设提示词推荐

### 网页端功能
- **Prompt管理**: 保存浏览、搜索、标签管理、排序和筛选
- **资产仪表盘**: 提供词云图、雷达图、热力图等数据可视化
- **沙盘调试**: 支持优化prompt、与大模型对话测试

## 技术架构
- **前端**: 
  - 浏览器插件: 基于React和Tailwind CSS开发的浏览器扩展
  - 网页应用: 基于React+TypeScript和Tailwind CSS的响应式Web应用
- **后端**: 
  - 基于Express的RESTful API服务
  - MongoDB数据存储
  - JWT认证机制

## 当前开发状态
- **前端完成度**: 界面交互与视觉设计已100%实现产品需求，所有业务模块均完成模拟数据接入
- **后端开发**: 正在进行接口逆向工程，实现前端Mock Service定义的所有接口

## 安装与使用
### 开发环境设置
1. 克隆仓库
```bash
git clone https://github.com/yourusername/AetherFlow.git
cd AetherFlow
```

2. 安装网页端依赖
```bash
cd AetherFlow_web_front
npm install
```

3. 安装插件端依赖
```bash
cd ../AetherFlow_plugin_front
npm install
```

4. 安装后端依赖
```bash
cd ../AetherFlow_backend
npm install
```

5. 启动开发服务器
```bash
# 网页端
cd AetherFlow_web_front
npm run dev

# 插件端
cd AetherFlow_plugin_front
npm run dev

# 后端
cd AetherFlow_backend
npm run dev
```

## 项目结构
```
AetherFlow/
├── AetherFlow_web_front/    # 网页端前端代码
├── AetherFlow_plugin_front/ # 浏览器插件前端代码
├── AetherFlow_backend/      # 后端代码
├── 项目记录/                # 项目文档
│   ├── 任务跟踪文档.md
│   ├── 开发进度.md
│   ├── API文档.md
│   └── 前后端集成计划.md
└── PRD.md                   # 产品需求文档
```

## 贡献指南
请参阅 [项目规范.md](./项目记录/项目规范.md) 和 [开发进度.md](./项目记录/开发进度.md) 了解如何参与项目开发。

## 许可证
[待定] 
