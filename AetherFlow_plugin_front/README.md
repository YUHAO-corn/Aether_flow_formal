# AetherFlow 插件前端

这是AetherFlow项目的浏览器插件前端部分，提供了精美的侧边栏界面和动态效果。

## 功能特点

- 动态粒子效果背景
- 流畅的动画过渡
- 响应式设计
- 跨平台兼容，在Windows和Mac上保持一致的界面效果

## 技术栈

- React 18
- JavaScript
- Vite
- Tailwind CSS
- Framer Motion (动画效果)
- React Particles (粒子效果)
- React Type Animation (打字效果)

## 开发指南

### 安装依赖

```bash
npm install
```

### 浏览器插件开发（推荐）

我们提供了热更新功能，可以大幅提高开发效率：

```bash
npm run dev:with-reload
```

这个命令会：
1. 启动热更新服务器，监视文件变化
2. 自动构建插件到 `dist` 目录
3. 在浏览器中运行插件
4. 当您修改代码时，插件会自动重新构建并重载

更多详细信息，请参阅 [浏览器插件开发指南](./EXTENSION_DEV_GUIDE.md)。

### 启动开发服务器（网页模式）

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 跨平台兼容性

本项目已经过特别优化，确保在Windows和Mac平台上都能保持一致的界面效果：

1. 使用标准Web字体和Google Fonts，确保字体渲染一致
2. 使用相对单位进行布局
3. 避免使用平台特定的API和功能
4. 统一的动画和过渡效果

## 目录结构

- `src/` - 源代码目录
  - `components/` - 可复用组件
  - `App.jsx` - 主应用组件
  - `main.jsx` - 应用入口点
- `public/` - 静态资源
- `index.html` - HTML模板
- `scripts/` - 开发和构建脚本
  - `dev-hot-reload.js` - 热更新服务器脚本
  - `run-extension.js` - 浏览器插件运行脚本
  - `dev-with-reload.js` - 集成开发环境脚本 