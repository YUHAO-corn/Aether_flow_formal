import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      buildStart() {
        console.log('Preparing manifest.json...');
      },
      writeBundle() {
        // 确保目标目录存在
        const distDir = resolve(__dirname, 'dist');
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        
        // 复制manifest.json
        const manifestPath = resolve(__dirname, 'public/manifest.json');
        const destPath = resolve(distDir, 'manifest.json');
        
        try {
          copyFileSync(manifestPath, destPath);
          console.log('Manifest copied successfully');
          
          // 创建图标目录
          const iconsDir = resolve(distDir, 'icons');
          if (!existsSync(iconsDir)) {
            mkdirSync(iconsDir, { recursive: true });
          }
          
          // 创建简单的图标文件（实际项目中应该使用真实图标）
          const iconSizes = [16, 48, 128];
          iconSizes.forEach(size => {
            const iconPath = resolve(iconsDir, `icon${size}.png`);
            // 如果图标不存在，创建一个空文件（实际项目中应该使用真实图标）
            if (!existsSync(iconPath)) {
              writeFileSync(iconPath, '');
              console.log(`Created placeholder for icon${size}.png`);
            }
          });
          
          // 复制HTML文件
          const htmlFiles = ['popup.html', 'options.html', 'sidepanel.html'];
          htmlFiles.forEach(file => {
            const srcPath = resolve(__dirname, `src/${file}`);
            const destPath = resolve(distDir, `src/${file}`);
            
            // 确保目标目录存在
            const destDir = dirname(destPath);
            if (!existsSync(destDir)) {
              mkdirSync(destDir, { recursive: true });
            }
            
            if (existsSync(srcPath)) {
              copyFileSync(srcPath, destPath);
              console.log(`Copied ${file}`);
            } else {
              console.warn(`Warning: ${file} not found`);
            }
          });
          
          // 复制JS文件
          const jsFiles = ['background.js', 'content.js'];
          jsFiles.forEach(file => {
            const srcPath = resolve(__dirname, `src/${file}`);
            const destPath = resolve(distDir, `src/${file}`);
            
            if (existsSync(srcPath)) {
              copyFileSync(srcPath, destPath);
              console.log(`Copied ${file}`);
            } else {
              console.warn(`Warning: ${file} not found`);
            }
          });
        } catch (error) {
          console.error('Error copying files:', error);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
}); 