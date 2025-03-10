#!/usr/bin/env node

/**
 * 浏览器插件构建脚本
 * 
 * 这个脚本用于构建浏览器插件，确保dist目录完整
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');
const srcDir = resolve(rootDir, 'src');
const distDir = resolve(rootDir, 'dist');
const successfulBuildDir = resolve(rootDir, 'AetherFlow_extension_v3_fixed10');

// 日志前缀
const logPrefix = chalk.blue('[BuildExtension]');
const errorPrefix = chalk.red('[BuildExtension]');
const successPrefix = chalk.green('[BuildExtension]');
const warningPrefix = chalk.yellow('[BuildExtension]');

/**
 * 确保目录存在
 */
function ensureDirectoryExistence(filePath) {
  const dirname = resolve(filePath, '..');
  if (existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  mkdirSync(dirname);
}

/**
 * 复制文件
 */
function copyFile(src, dest) {
  try {
    ensureDirectoryExistence(dest);
    copyFileSync(src, dest);
    console.log(`${successPrefix} 已复制: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`${errorPrefix} 复制文件失败: ${src} -> ${dest}`);
    console.error(err);
  }
}

/**
 * 构建主应用
 */
function buildMainApp() {
  return new Promise((resolve, reject) => {
    console.log(`${logPrefix} 正在构建主应用...`);
    
    const buildProcess = spawn('npx', ['vite', 'build'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`${errorPrefix} 构建主应用失败，退出码: ${code}`);
        reject(new Error(`构建失败，退出码: ${code}`));
      } else {
        console.log(`${successPrefix} 主应用构建成功！`);
        resolve();
      }
    });
    
    buildProcess.on('error', (err) => {
      console.error(`${errorPrefix} 构建主应用失败:`, err);
      reject(err);
    });
  });
}

/**
 * 复制成功构建的manifest.json
 */
function copySuccessfulManifest() {
  const successfulManifestPath = resolve(successfulBuildDir, 'manifest.json');
  const destManifestPath = resolve(distDir, 'manifest.json');
  
  if (existsSync(successfulManifestPath)) {
    copyFile(successfulManifestPath, destManifestPath);
    console.log(`${successPrefix} 已复制成功构建的manifest.json`);
    return true;
  } else {
    console.warn(`${warningPrefix} 成功构建的manifest.json不存在，将使用当前manifest.json`);
    return false;
  }
}

/**
 * 复制扩展文件
 */
function copyExtensionFiles() {
  console.log(`${logPrefix} 正在复制扩展文件...`);
  
  // 创建必要的目录
  const contentScriptDir = resolve(distDir, 'content-scripts');
  const backgroundDir = resolve(distDir, 'background');
  const assetsDir = resolve(distDir, 'assets');
  const iconsDir = resolve(distDir, 'icons');
  
  if (!existsSync(contentScriptDir)) {
    mkdirSync(contentScriptDir, { recursive: true });
  }
  
  if (!existsSync(backgroundDir)) {
    mkdirSync(backgroundDir, { recursive: true });
  }
  
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }
  
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
  }
  
  // 复制内容脚本
  copyFile(
    resolve(srcDir, 'content-scripts/autoSave.js'),
    resolve(contentScriptDir, 'autoSave.js')
  );
  
  copyFile(
    resolve(srcDir, 'content-scripts/sidebarManager.js'),
    resolve(contentScriptDir, 'sidebarManager.js')
  );
  
  // 优先使用成功构建的background.js
  const successfulBackgroundPath = resolve(successfulBuildDir, 'assets/background.js');
  if (existsSync(successfulBackgroundPath)) {
    // 复制后台脚本到background目录
    copyFile(
      successfulBackgroundPath,
      resolve(backgroundDir, 'background.js')
    );
    
    // 同时复制后台脚本到assets目录（符合manifest.json的配置）
    copyFile(
      successfulBackgroundPath,
      resolve(assetsDir, 'background.js')
    );
    
    console.log(`${successPrefix} 已从成功构建中复制background.js`);
  } else {
    // 复制后台脚本到background目录
    copyFile(
      resolve(srcDir, 'background/background.js'),
      resolve(backgroundDir, 'background.js')
    );
    
    // 同时复制后台脚本到assets目录（符合manifest.json的配置）
    copyFile(
      resolve(srcDir, 'background/background.js'),
      resolve(assetsDir, 'background.js')
    );
  }
  
  // 优先使用成功构建的content-scripts.js
  const successfulContentScriptsPath = resolve(successfulBuildDir, 'assets/content-scripts.js');
  if (existsSync(successfulContentScriptsPath)) {
    copyFile(
      successfulContentScriptsPath,
      resolve(assetsDir, 'content-scripts.js')
    );
    console.log(`${successPrefix} 已从成功构建中复制content-scripts.js`);
  } else {
    copyFile(
      resolve(srcDir, 'content-scripts/autoSave.js'),
      resolve(assetsDir, 'content-scripts.js')
    );
  }
  
  // 优先使用成功构建的sidebarManager.js
  const successfulSidebarManagerPath = resolve(successfulBuildDir, 'assets/sidebarManager.js');
  if (existsSync(successfulSidebarManagerPath)) {
    copyFile(
      successfulSidebarManagerPath,
      resolve(assetsDir, 'sidebarManager.js')
    );
    console.log(`${successPrefix} 已从成功构建中复制sidebarManager.js`);
  } else {
    copyFile(
      resolve(srcDir, 'content-scripts/sidebarManager.js'),
      resolve(assetsDir, 'sidebarManager.js')
    );
  }
  
  // 检查并复制apiClient.js（如果存在）
  const apiClientSrcPath = resolve(srcDir, 'utils/apiClient.js');
  const successfulApiClientPath = resolve(successfulBuildDir, 'assets/apiClient.js');
  
  if (existsSync(successfulApiClientPath)) {
    copyFile(successfulApiClientPath, resolve(assetsDir, 'apiClient.js'));
    console.log(`${successPrefix} 已从成功构建中复制apiClient.js`);
  } else if (existsSync(apiClientSrcPath)) {
    copyFile(apiClientSrcPath, resolve(assetsDir, 'apiClient.js'));
  } else {
    console.warn(`${warningPrefix} apiClient.js不存在，请检查是否需要此文件`);
  }
  
  // 复制custom.css（如果存在）
  const customCssSrcPath = resolve(srcDir, 'styles/custom.css');
  const successfulCustomCssPath = resolve(successfulBuildDir, 'assets/custom.css');
  
  if (existsSync(successfulCustomCssPath)) {
    copyFile(successfulCustomCssPath, resolve(assetsDir, 'custom.css'));
    console.log(`${successPrefix} 已从成功构建中复制custom.css`);
  } else if (existsSync(customCssSrcPath)) {
    copyFile(customCssSrcPath, resolve(assetsDir, 'custom.css'));
  }
  
  // 复制manifest.json（优先使用成功构建的版本）
  if (!copySuccessfulManifest()) {
    copyFile(
      resolve(rootDir, 'manifest.json'),
      resolve(distDir, 'manifest.json')
    );
  }
  
  // 复制图标（如果存在）
  const iconSizes = [16, 48, 128];
  iconSizes.forEach(size => {
    const iconPath = resolve(rootDir, `public/icons/icon${size}.png`);
    const successfulIconPath = resolve(successfulBuildDir, `icons/icon${size}.png`);
    
    if (existsSync(successfulIconPath)) {
      copyFile(successfulIconPath, resolve(iconsDir, `icon${size}.png`));
      console.log(`${successPrefix} 已从成功构建中复制icon${size}.png`);
    } else if (existsSync(iconPath)) {
      copyFile(iconPath, resolve(iconsDir, `icon${size}.png`));
    } else {
      console.warn(`${warningPrefix} 图标文件不存在: ${iconPath}`);
    }
  });
  
  console.log(`${successPrefix} 扩展文件复制完成！`);
}

/**
 * 主函数
 */
async function main() {
  console.log(`${logPrefix} 开始构建浏览器扩展...`);
  
  try {
    // 构建主应用
    await buildMainApp();
    
    // 复制扩展文件
    copyExtensionFiles();
    
    console.log(`${successPrefix} 浏览器扩展构建成功！`);
  } catch (err) {
    console.error(`${errorPrefix} 构建过程中出错:`, err);
    process.exit(1);
  }
}

// 执行主函数
main(); 