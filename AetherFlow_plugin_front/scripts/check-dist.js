#!/usr/bin/env node

/**
 * 检查dist目录完整性的脚本
 * 
 * 这个脚本用于检查dist目录是否包含所有必要的文件
 */

import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// 日志前缀
const logPrefix = chalk.blue('[CheckDist]');
const errorPrefix = chalk.red('[CheckDist]');
const successPrefix = chalk.green('[CheckDist]');
const warningPrefix = chalk.yellow('[CheckDist]');

// 必要的文件列表
const requiredFiles = [
  'manifest.json',
  'index.html',
  'background/background.js',
  'content-scripts/autoSave.js',
  'content-scripts/sidebarManager.js',
  'assets/main.js'
];

// 检查dist目录是否存在
if (!existsSync(distDir)) {
  console.error(`${errorPrefix} dist目录不存在！请先运行 npm run build`);
  process.exit(1);
}

// 检查必要的文件是否存在
let missingFiles = [];
for (const file of requiredFiles) {
  const filePath = resolve(distDir, file);
  if (!existsSync(filePath)) {
    missingFiles.push(file);
  }
}

// 输出检查结果
if (missingFiles.length > 0) {
  console.error(`${errorPrefix} dist目录不完整，缺少以下文件：`);
  missingFiles.forEach(file => {
    console.error(`  - ${file}`);
  });
  console.log(`${warningPrefix} 请运行 npm run build 重新构建插件`);
  process.exit(1);
} else {
  console.log(`${successPrefix} dist目录完整，包含所有必要文件！`);
  
  // 列出dist目录中的文件
  console.log(`${logPrefix} dist目录中的文件：`);
  
  function listFiles(dir, prefix = '') {
    const files = readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory()) {
        console.log(`${prefix}${chalk.cyan(file.name)}/`);
        listFiles(resolve(dir, file.name), `${prefix}  `);
      } else {
        console.log(`${prefix}${file.name}`);
      }
    });
  }
  
  listFiles(distDir);
  
  console.log(`${successPrefix} 插件已准备就绪，可以加载到浏览器中！`);
} 