# Aether Flow View

Aether Flow View是一个包含两个前端项目的仓库，分别为Web前端和浏览器插件前端。

## 项目结构

- [AetherFlow_web_front](./AetherFlow_web_front) - 数据可视化Web前端
- [AetherFlow_plugin_front](./AetherFlow_plugin_front) - 浏览器插件前端

## 跨平台兼容性

两个项目都经过特别优化，确保在Windows和Mac平台上都能保持一致的界面效果：

1. 使用标准Web字体和Google Fonts，确保字体渲染一致
2. 统一的滚动条样式
3. 使用相对单位进行布局
4. 避免使用平台特定的API和功能

## 开发环境设置

每个子项目都有自己的开发环境设置，请参考各自的README文件获取详细信息。

### 通用步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/YUHAO-corn/Aether_flow_view.git
   cd Aether_flow_view
   ```

2. 选择要开发的项目目录
   ```bash
   cd AetherFlow_web_front  # 或 cd AetherFlow_plugin_front
   ```

3. 安装依赖
   ```bash
   npm install
   ```

4. 启动开发服务器
   ```bash
   npm run dev
   ```

## 技术栈

### Web前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

### 插件前端
- React 18 + JavaScript
- Vite
- Tailwind CSS
- Framer Motion
- React Particles 