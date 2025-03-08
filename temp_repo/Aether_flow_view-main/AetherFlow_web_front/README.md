# AetherFlow Web 前端

这是AetherFlow项目的Web前端部分，提供了丰富的数据可视化界面和交互式组件。

## 功能特点

- 交互式数据可视化图表
- 热力图和数据分析工具
- 响应式设计，适配不同设备
- 跨平台兼容，在Windows和Mac上保持一致的界面效果

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion (动画效果)
- Recharts (图表库)

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

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
2. 统一的滚动条样式
3. 使用相对单位进行布局
4. 避免使用平台特定的API和功能

## 目录结构

- `src/` - 源代码目录
  - `components/` - 可复用组件
  - `App.tsx` - 主应用组件
  - `main.tsx` - 应用入口点
- `public/` - 静态资源
- `index.html` - HTML模板 