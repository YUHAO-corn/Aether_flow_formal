import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'

// 确保目录存在
function ensureDirectoryExistence(filePath) {
  const dirname = resolve(filePath, '..')
  if (existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  mkdirSync(dirname)
}

// 复制文件到目标目录
function copyFiles(src, dest) {
  ensureDirectoryExistence(dest)
  copyFileSync(src, dest)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'browser-extension',
      buildEnd() {
        // 创建内容脚本目录
        const contentScriptDir = resolve(__dirname, 'dist/content-scripts')
        ensureDirectoryExistence(contentScriptDir)
        
        // 创建后台脚本目录
        const backgroundDir = resolve(__dirname, 'dist/background')
        ensureDirectoryExistence(backgroundDir)
        
        // 复制内容脚本
        copyFiles(
          resolve(__dirname, 'src/content-scripts/autoSave.js'),
          resolve(contentScriptDir, 'autoSave.js')
        )
        
        // 复制后台脚本
        copyFiles(
          resolve(__dirname, 'src/background/background.js'),
          resolve(backgroundDir, 'background.js')
        )
        
        // 复制manifest.json
        copyFiles(
          resolve(__dirname, 'manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        
        console.log('Browser extension files copied successfully!')
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})