#!/usr/bin/env node

/**
 * 浏览器插件运行脚本
 * 
 * 这个脚本用于使用web-ext工具在浏览器中运行扩展
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');

// 日志前缀
const logPrefix = chalk.blue('[RunExtension]');
const errorPrefix = chalk.red('[RunExtension]');
const successPrefix = chalk.green('[RunExtension]');
const warningPrefix = chalk.yellow('[RunExtension]');

// 当前进程
let currentProcess = null;

/**
 * 运行扩展
 */
function runExtension() {
  console.log(`${logPrefix} 正在启动浏览器扩展...`);
  
  // 使用web-ext运行扩展
  currentProcess = spawn('npx', [
    'web-ext', 
    'run', 
    '--source-dir', 'dist',
    '--target', 'chromium',
    '--start-url', 'https://chat.openai.com/',
    '--browser-console'
  ], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  currentProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${errorPrefix} 浏览器扩展异常退出，退出码: ${code}`);
    }
  });
  
  currentProcess.on('error', (err) => {
    console.error(`${errorPrefix} 启动浏览器扩展失败:`, err);
  });
  
  console.log(`${successPrefix} 浏览器扩展已启动！`);
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log(`${logPrefix} 接收到中断信号，正在退出...`);
  
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill();
  }
  
  process.exit(0);
});

// 运行扩展
runExtension(); 