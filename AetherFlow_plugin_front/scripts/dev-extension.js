#!/usr/bin/env node

/**
 * 浏览器插件开发模式脚本
 * 
 * 这个脚本用于在开发模式下构建浏览器插件，并实现热重载功能
 */

import { spawn } from 'child_process';
import { watch } from 'chokidar';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');

// 监视的目录
const watchDirs = [
  resolve(rootDir, 'src/content-scripts'),
  resolve(rootDir, 'src/background'),
  resolve(rootDir, 'src/components'),
  resolve(rootDir, 'src/contexts'),
  resolve(rootDir, 'src/utils'),
  resolve(rootDir, 'manifest.json')
];

// 构建命令
const buildCommand = 'npm';
const buildArgs = ['run', 'build:extension'];

// 测试命令
const testCommand = 'npm';
const testArgs = ['run', 'test:extension'];

// 日志前缀
const logPrefix = chalk.blue('[DevExtension]');
const errorPrefix = chalk.red('[DevExtension]');
const successPrefix = chalk.green('[DevExtension]');
const warningPrefix = chalk.yellow('[DevExtension]');

// 当前构建进程
let currentBuild = null;
let currentTest = null;
let isBuilding = false;
let isTesting = false;

/**
 * 执行构建命令
 */
function runBuild() {
  if (isBuilding) {
    console.log(`${warningPrefix} 构建已在进行中，跳过...`);
    return;
  }
  
  isBuilding = true;
  console.log(`${logPrefix} 开始构建浏览器插件...`);
  
  currentBuild = spawn(buildCommand, buildArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  currentBuild.on('close', (code) => {
    isBuilding = false;
    
    if (code === 0) {
      console.log(`${successPrefix} 浏览器插件构建成功！`);
      
      // 构建成功后运行测试
      runTests();
    } else {
      console.error(`${errorPrefix} 浏览器插件构建失败，退出码: ${code}`);
    }
  });
  
  currentBuild.on('error', (err) => {
    isBuilding = false;
    console.error(`${errorPrefix} 构建命令执行失败:`, err);
  });
}

/**
 * 执行测试命令
 */
function runTests() {
  if (isTesting) {
    console.log(`${warningPrefix} 测试已在进行中，跳过...`);
    return;
  }
  
  isTesting = true;
  console.log(`${logPrefix} 开始运行测试...`);
  
  currentTest = spawn(testCommand, testArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  currentTest.on('close', (code) => {
    isTesting = false;
    
    if (code === 0) {
      console.log(`${successPrefix} 测试通过！`);
    } else {
      console.error(`${errorPrefix} 测试失败，退出码: ${code}`);
    }
  });
  
  currentTest.on('error', (err) => {
    isTesting = false;
    console.error(`${errorPrefix} 测试命令执行失败:`, err);
  });
}

/**
 * 初始化文件监视
 */
function initWatcher() {
  console.log(`${logPrefix} 开始监视文件变化...`);
  
  const watcher = watch(watchDirs, {
    ignored: /(^|[\/\\])\../, // 忽略点文件
    persistent: true,
    ignoreInitial: true
  });
  
  // 监听文件变化
  watcher.on('all', (event, path) => {
    console.log(`${logPrefix} 检测到文件变化: ${event} ${path}`);
    
    // 如果当前有构建进程，先终止它
    if (currentBuild && !currentBuild.killed) {
      currentBuild.kill();
    }
    
    // 如果当前有测试进程，先终止它
    if (currentTest && !currentTest.killed) {
      currentTest.kill();
    }
    
    // 延迟一秒再构建，避免频繁构建
    setTimeout(runBuild, 1000);
  });
  
  console.log(`${successPrefix} 文件监视已启动，等待文件变化...`);
  console.log(`${logPrefix} 监视的目录:`, watchDirs);
  
  // 初始构建
  runBuild();
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log(`${logPrefix} 接收到中断信号，正在退出...`);
  
  if (currentBuild && !currentBuild.killed) {
    currentBuild.kill();
  }
  
  if (currentTest && !currentTest.killed) {
    currentTest.kill();
  }
  
  process.exit(0);
});

// 启动监视
initWatcher(); 