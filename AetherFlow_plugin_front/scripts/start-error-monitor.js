#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保scripts目录存在
const scriptsDir = path.join(__dirname);
const errorLoggerPath = path.join(scriptsDir, 'error-logger.js');
const injectScriptPath = path.join(scriptsDir, 'inject-error-monitor.js');

// 检查文件是否存在
if (!fs.existsSync(errorLoggerPath)) {
  console.error(`错误: 找不到 ${errorLoggerPath}`);
  process.exit(1);
}

if (!fs.existsSync(injectScriptPath)) {
  console.error(`错误: 找不到 ${injectScriptPath}`);
  process.exit(1);
}

// 使文件可执行
fs.chmodSync(errorLoggerPath, '755');
fs.chmodSync(injectScriptPath, '755');

console.log('正在注入错误监控脚本...');
// 注入错误监控脚本
const inject = spawn('node', [injectScriptPath], {
  stdio: 'inherit'
});

inject.on('close', (code) => {
  if (code !== 0) {
    console.error(`注入脚本退出，代码: ${code}`);
    process.exit(code);
  }
  
  console.log('正在启动错误监控服务...');
  // 启动错误监控服务
  const monitor = spawn('node', [errorLoggerPath], {
    stdio: 'inherit',
    detached: true
  });
  
  monitor.unref();
  
  console.log('错误监控服务已在后台启动');
  console.log('您可以通过按 Ctrl+C 关闭此终端，错误监控服务将继续在后台运行');
  console.log('要停止错误监控服务，请运行: pkill -f error-logger.js');
});

// 处理进程终止
process.on('SIGINT', () => {
  console.log('\n正在关闭...');
  process.exit(0);
}); 