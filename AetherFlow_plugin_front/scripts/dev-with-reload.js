#!/usr/bin/env node

/**
 * 浏览器插件开发脚本（带热更新）
 * 
 * 这个脚本用于同时启动热更新服务器和运行扩展
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { existsSync } from 'fs';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');

// 日志前缀
const logPrefix = chalk.blue('[DevWithReload]');
const errorPrefix = chalk.red('[DevWithReload]');
const successPrefix = chalk.green('[DevWithReload]');
const warningPrefix = chalk.yellow('[DevWithReload]');

// 当前进程
let hotReloadProcess = null;
let runExtensionProcess = null;

/**
 * 启动热更新服务器
 */
function startHotReload() {
  console.log(`${logPrefix} 正在启动热更新服务器...`);
  
  // 使用vite构建并监视文件变化
  hotReloadProcess = spawn('node', ['scripts/dev-hot-reload.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  hotReloadProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${errorPrefix} 热更新服务器异常退出，退出码: ${code}`);
    }
  });
  
  hotReloadProcess.on('error', (err) => {
    console.error(`${errorPrefix} 启动热更新服务器失败:`, err);
  });
}

/**
 * 检查dist目录是否准备好
 */
function checkDistReady() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const manifestPath = `${rootDir}/dist/manifest.json`;
      const backgroundPath = `${rootDir}/dist/background/background.js`;
      const contentScriptPath = `${rootDir}/dist/content-scripts/autoSave.js`;
      
      if (existsSync(manifestPath) && existsSync(backgroundPath) && existsSync(contentScriptPath)) {
        clearInterval(checkInterval);
        console.log(`${successPrefix} dist目录已准备就绪！`);
        resolve(true);
      } else {
        console.log(`${warningPrefix} 等待dist目录准备完成...`);
      }
    }, 1000);
    
    // 设置超时
    setTimeout(() => {
      clearInterval(checkInterval);
      console.error(`${errorPrefix} 等待dist目录准备超时！`);
      resolve(false);
    }, 30000); // 30秒超时
  });
}

/**
 * 运行扩展
 */
async function runExtension() {
  console.log(`${logPrefix} 等待dist目录准备完成...`);
  
  // 等待dist目录准备好
  const isReady = await checkDistReady();
  
  if (!isReady) {
    console.error(`${errorPrefix} dist目录准备失败，无法启动浏览器扩展！`);
    return;
  }
  
  console.log(`${logPrefix} 正在启动浏览器扩展...`);
  
  // 使用web-ext运行扩展
  runExtensionProcess = spawn('node', ['scripts/run-extension.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  runExtensionProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${errorPrefix} 浏览器扩展异常退出，退出码: ${code}`);
    }
  });
  
  runExtensionProcess.on('error', (err) => {
    console.error(`${errorPrefix} 启动浏览器扩展失败:`, err);
  });
  
  console.log(`${successPrefix} 浏览器扩展已启动！`);
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log(`${logPrefix} 接收到中断信号，正在退出...`);
  
  if (hotReloadProcess && !hotReloadProcess.killed) {
    hotReloadProcess.kill();
  }
  
  if (runExtensionProcess && !runExtensionProcess.killed) {
    runExtensionProcess.kill();
  }
  
  process.exit(0);
});

// 启动热更新服务器
startHotReload();

// 运行扩展
runExtension(); 