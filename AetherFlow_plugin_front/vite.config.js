import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// 自定义插件，用于复制manifest.json和图标文件到dist目录，以及创建background.js和content.js文件
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      // 复制manifest.json到dist目录
      copyFileSync('manifest.json', 'dist/manifest.json');
      console.log('Manifest file copied to dist directory');
      
      // 确保dist/icons目录存在
      const iconsDir = join('dist', 'icons');
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }
      
      // 复制图标文件到dist/icons目录
      const iconSizes = [16, 32, 48, 128];
      iconSizes.forEach(size => {
        const sourceIconPath = join('public', 'icons', `icon${size}.png`);
        const destIconPath = join('dist', 'icons', `icon${size}.png`);
        try {
          copyFileSync(sourceIconPath, destIconPath);
          console.log(`Icon file icon${size}.png copied to dist/icons directory`);
        } catch (error) {
          console.error(`Error copying icon${size}.png:`, error.message);
        }
      });
      
      // 复制background.js到dist目录
      try {
        copyFileSync('background.js', 'dist/background.js');
        console.log('Background script copied to dist directory');
      } catch (error) {
        console.error(`Error copying background.js:`, error.message);
      }
      
      // 复制content.js到dist目录
      try {
        copyFileSync('content.js', 'dist/content.js');
        console.log('Content script copied to dist directory');
      } catch (error) {
        console.error(`Error copying content.js:`, error.message);
      }
      
      // 复制content.css到dist目录
      try {
        copyFileSync('content.css', 'dist/content.css');
        console.log('Content CSS copied to dist directory');
      } catch (error) {
        console.error(`Error copying content.css:`, error.message);
      }
      
      // 复制sidepanel.js到dist目录
      try {
        copyFileSync('sidepanel.js', 'dist/sidepanel.js');
        console.log('Side panel script copied to dist directory');
      } catch (error) {
        console.error(`Error copying sidepanel.js:`, error.message);
      }
    }
  };
};

export default defineConfig({
  // 确保生成的HTML文件使用相对路径
  base: './',
  plugins: [react(), copyExtensionFiles()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
    // 修改资源引用为相对路径
    assetsInlineLimit: 0,
    emptyOutDir: true
  }
});