import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 构建React应用
console.log('Building React application...');
execSync('vite build', { stdio: 'inherit' });

// 确保目标目录存在
const distDir = resolve(__dirname, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 复制manifest.json
console.log('Copying manifest.json...');
const manifestPath = resolve(__dirname, 'public/manifest.json');
const manifestDestPath = resolve(distDir, 'manifest.json');
copyFileSync(manifestPath, manifestDestPath);

// 创建图标目录
const iconsDir = resolve(distDir, 'icons');
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// 创建简单的图标文件（实际项目中应该使用真实图标）
console.log('Creating placeholder icons...');
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const iconPath = resolve(iconsDir, `icon${size}.png`);
  // 如果图标不存在，创建一个空文件（实际项目中应该使用真实图标）
  if (!existsSync(iconPath)) {
    writeFileSync(iconPath, '');
  }
});

// 创建src目录
const srcDir = resolve(distDir, 'src');
if (!existsSync(srcDir)) {
  mkdirSync(srcDir, { recursive: true });
}

// 复制HTML文件
console.log('Copying HTML files...');
const htmlFiles = [
  { src: 'src/popup.html', dest: 'src/popup.html' },
  { src: 'src/options.html', dest: 'src/options.html' },
  { src: 'src/sidepanel.html', dest: 'src/sidepanel.html' }
];

htmlFiles.forEach(({ src, dest }) => {
  try {
    const srcPath = resolve(__dirname, src);
    const destPath = resolve(distDir, dest);
    
    // 确保目标目录存在
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} to ${dest}`);
  } catch (error) {
    console.warn(`Warning: Could not copy ${src}: ${error.message}`);
  }
});

// 复制JS文件
console.log('Copying JS files...');
const jsFiles = [
  { src: 'src/background.js', dest: 'src/background.js' },
  { src: 'src/content.js', dest: 'src/content.js' }
];

jsFiles.forEach(({ src, dest }) => {
  try {
    const srcPath = resolve(__dirname, src);
    const destPath = resolve(distDir, dest);
    
    copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} to ${dest}`);
  } catch (error) {
    console.warn(`Warning: Could not copy ${src}: ${error.message}`);
  }
});

console.log('Build completed successfully!');
console.log('You can now load the extension from the dist/ directory in Chrome.'); 