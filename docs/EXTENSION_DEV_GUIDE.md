# AetherFlow 浏览器插件开发指南

本指南提供浏览器插件开发的简明流程，重点介绍首次构建和热更新的使用方法。

## 目录

1. [首次构建](#首次构建)
2. [热更新开发](#热更新开发)
3. [常见问题](#常见问题)

## 首次构建

首次构建插件需要执行以下步骤：

1. **安装依赖**

```bash
cd AetherFlow_plugin_front
npm install
```

2. **构建插件**

```bash
npm run build:extension
```

这个命令会：
- 构建主应用
- 复制所有必要文件到 `dist` 目录
- 确保目录结构与 manifest.json 配置一致

3. **检查构建结果**

```bash
npm run check:dist
```

确认 dist 目录包含所有必要文件。

4. **在浏览器中加载插件**

- 打开 Chrome 浏览器
- 访问 `chrome://extensions/`
- 启用"开发者模式"（右上角开关）
- 点击"加载已解压的扩展程序"
- 选择项目中的 `dist` 目录

## 热更新开发

开发过程中使用热更新可以大幅提高效率：

1. **启动热更新服务**

```bash
npm run dev:hot
```

这个命令会：
- 启动热更新服务器
- 监视源代码文件变化
- 自动重新构建插件

2. **修改代码并测试**

- 编辑源代码文件
- 保存文件（自动触发重新构建）
- 在 Chrome 扩展管理页面点击"刷新"按钮
- 测试修改效果

> **注意**：热更新不会自动重新加载插件，需要手动点击"刷新"按钮。

## 常见问题

### Service Worker 注册失败

**问题**：出现 "Service worker registration failed. Status code: 3" 错误。

**解决方案**：
- 使用 `npm run build:extension` 命令重新构建插件
- 避免在 background.js 中使用 ES 模块语法（import/export）

### 右下角图标点击无反应

**问题**：插件图标点击后没有展开界面。

**解决方案**：
- 使用 `npm run build:extension` 命令重新构建插件
- 确保使用了正确的 background.js 文件

### 缺少必要文件

**问题**：插件报错缺少某些文件。

**解决方案**：
- 运行 `npm run check:dist` 检查 dist 目录完整性
- 如有问题，清理后重新构建：
  ```bash
  npm run clean:dist
  npm run build:extension
  ```

### 热更新未生效

**问题**：修改代码后，插件没有更新。

**解决方案**：
- 检查终端输出，确认文件变化被检测到
- 确保在 Chrome 扩展管理页面点击了"刷新"按钮
- 重启热更新服务：`npm run dev:hot`

## 开发技巧

1. **查看后台日志**：在 Chrome 扩展管理页面中，点击插件的"背景页"链接查看日志。

2. **调试弹出窗口**：右键点击插件图标，选择"检查弹出内容"。

3. **参考成功构建**：如遇问题，可参考 `AetherFlow_extension_v3_fixed10` 目录中的成功构建。

---

如有任何问题，请联系开发团队。 