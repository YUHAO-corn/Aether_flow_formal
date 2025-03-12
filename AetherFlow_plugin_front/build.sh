#!/bin/bash

# 构建React应用
echo "Building React application..."
npm run vite-build

# 确保目标目录存在
mkdir -p dist/icons
mkdir -p dist/src

# 复制manifest.json
echo "Copying manifest.json..."
cp public/manifest.json dist/

# 创建简单的图标文件（实际项目中应该使用真实图标）
echo "Creating placeholder icons..."
touch dist/icons/icon16.png
touch dist/icons/icon48.png
touch dist/icons/icon128.png

# 复制HTML文件
echo "Copying HTML files..."
cp src/popup.html dist/src/ 2>/dev/null || echo "Warning: Could not copy popup.html"
cp src/options.html dist/src/ 2>/dev/null || echo "Warning: Could not copy options.html"
cp src/sidepanel.html dist/src/ 2>/dev/null || echo "Warning: Could not copy sidepanel.html"

# 复制JS文件
echo "Copying JS files..."
cp src/background.js dist/src/ 2>/dev/null || echo "Warning: Could not copy background.js"
cp src/content.js dist/src/ 2>/dev/null || echo "Warning: Could not copy content.js"

echo "Build completed successfully!"
echo "You can now load the extension from the dist/ directory in Chrome." 