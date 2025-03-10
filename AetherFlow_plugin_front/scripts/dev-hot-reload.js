#!/usr/bin/env node

/**
 * 浏览器插件热更新开发脚本
 * 
 * 这个脚本用于在开发模式下启动热更新服务器，实现代码修改后自动重载插件
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { watch } from 'chokidar';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');

// 日志前缀
const logPrefix = chalk.blue('[HotReload]');
const errorPrefix = chalk.red('[HotReload]');
const successPrefix = chalk.green('[HotReload]');
const warningPrefix = chalk.yellow('[HotReload]');

// 当前进程
let currentProcess = null;
let isBuilding = false;

// 监视的目录
const watchDirs = [
  resolve(rootDir, 'src'),
  resolve(rootDir, 'public'),
  resolve(rootDir, 'manifest.json'),
  resolve(rootDir, 'index.html')
];

/**
 * 构建扩展
 */
function buildExtension() {
  if (isBuilding) {
    console.log(`${warningPrefix} 构建已在进行中，跳过...`);
    return;
  }
  
  isBuilding = true;
  console.log(`${logPrefix} 正在构建浏览器扩展...`);
  
  const buildProcess = spawn('npm', ['run', 'build:extension'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    isBuilding = false;
    
    if (code !== 0) {
      console.error(`${errorPrefix} 构建失败，退出码: ${code}`);
    } else {
      console.log(`${successPrefix} 构建成功！`);
      
      // 检查dist目录完整性
      const checkProcess = spawn('npm', ['run', 'check:dist'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true
      });
      
      checkProcess.on('close', (checkCode) => {
        if (checkCode === 0) {
          console.log(`${successPrefix} dist目录完整，请在Chrome扩展管理页面点击"刷新"按钮重新加载扩展`);
        } else {
          console.error(`${errorPrefix} dist目录不完整，请检查构建脚本`);
        }
      });
    }
  });
  
  buildProcess.on('error', (err) => {
    isBuilding = false;
    console.error(`${errorPrefix} 构建命令执行失败:`, err);
  });
}

/**
 * 启动热更新服务器
 */
function startDevServer() {
  console.log(`${logPrefix} 正在启动热更新服务器...`);
  
  // 先执行一次构建，确保dist目录完整
  buildExtension();
  
  // 监视文件变化
  const watcher = watch(watchDirs, {
    ignored: /(^|[\/\\])\../, // 忽略点文件
    persistent: true,
    ignoreInitial: true
  });
  
  watcher.on('all', (event, path) => {
    console.log(`${logPrefix} 检测到文件变化: ${event} ${path}`);
    buildExtension();
  });
  
  console.log(`${successPrefix} 热更新服务器已启动！`);
  console.log(`${logPrefix} 正在监视文件变化...`);
  console.log(`${logPrefix} 修改代码后，插件将自动重新构建`);
  console.log(`${logPrefix} 请在Chrome扩展管理页面点击"刷新"按钮重新加载扩展`);
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log(`${logPrefix} 接收到中断信号，正在退出...`);
  
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill();
  }
  
  process.exit(0);
});

// 启动热更新服务器
startDevServer(); 