#!/usr/bin/env node

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建Express应用
const app = express();
app.use(cors({
  origin: '*', // 允许所有来源访问
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' }));

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocketServer({ server });

// 日志文件路径
const logFilePath = path.join(__dirname, '../error-logs.txt');

// 清空日志文件
fs.writeFileSync(logFilePath, '', 'utf8');

console.log(chalk.blue('=========================================================='));
console.log(chalk.blue('🔍 AetherFlow 错误监控服务已启动'));
console.log(chalk.blue('=========================================================='));
console.log(chalk.yellow('将以下脚本添加到您的前端代码中:'));
console.log(chalk.green(`
<script>
  // 错误监控脚本
  (function() {
    const errorLogger = {
      ws: null,
      connect: function() {
        this.ws = new WebSocket('ws://localhost:3030');
        this.ws.onopen = () => console.log('错误监控已连接');
        this.ws.onclose = () => setTimeout(() => this.connect(), 2000);
      },
      log: function(type, message, details) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type, message, details, timestamp: new Date().toISOString() }));
        } else {
          fetch('http://localhost:3030/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, message, details, timestamp: new Date().toISOString() })
          }).catch(e => console.error('无法发送日志:', e));
        }
      }
    };
    
    // 连接WebSocket
    errorLogger.connect();
    
    // 捕获全局错误
    window.addEventListener('error', function(event) {
      errorLogger.log('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null
      });
    });
    
    // 捕获Promise错误
    window.addEventListener('unhandledrejection', function(event) {
      errorLogger.log('promise', event.reason.message || '未处理的Promise拒绝', {
        stack: event.reason.stack
      });
    });
    
    // 捕获网络请求错误
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        if (!response.ok) {
          const url = typeof args[0] === 'string' ? args[0] : args[0].url;
          errorLogger.log('network', \`Fetch错误: \${response.status} \${response.statusText}\`, {
            url,
            status: response.status,
            statusText: response.statusText
          });
        }
        return response;
      } catch (error) {
        errorLogger.log('network', \`网络错误: \${error.message}\`, {
          url: typeof args[0] === 'string' ? args[0] : args[0].url,
          stack: error.stack
        });
        throw error;
      }
    };
    
    // 捕获XHR错误
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      const xhr = this;
      const method = args[0];
      const url = args[1];
      
      xhr.addEventListener('error', function() {
        errorLogger.log('xhr', \`XHR错误: 无法加载 \${method} \${url}\`, {
          method,
          url
        });
      });
      
      xhr.addEventListener('load', function() {
        if (xhr.status >= 400) {
          errorLogger.log('xhr', \`XHR错误: \${xhr.status} \${xhr.statusText}\`, {
            method,
            url,
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          });
        }
      });
      
      return originalXHROpen.apply(xhr, args);
    };
    
    // 捕获控制台错误
    const originalConsoleError = console.error;
    console.error = function(...args) {
      errorLogger.log('console', args.join(' '), {
        arguments: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      });
      originalConsoleError.apply(console, args);
    };
    
    console.log('错误监控已初始化');
  })();
</script>
`));

// 处理WebSocket连接
wss.on('connection', (ws) => {
  console.log(chalk.green('✓ 客户端已连接到错误监控服务'));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      logError(data);
    } catch (e) {
      console.error('无法解析消息:', e);
    }
  });
  
  ws.on('close', () => {
    console.log(chalk.yellow('✗ 客户端已断开连接'));
  });
});

// 处理HTTP日志请求
app.post('/log', (req, res) => {
  logError(req.body);
  res.status(200).send({ status: 'ok' });
});

// 记录错误
function logError(data) {
  const { type, message, details, timestamp } = data;
  
  // 格式化时间
  const time = new Date(timestamp).toLocaleTimeString();
  
  // 根据错误类型选择颜色
  let typeColor;
  switch (type) {
    case 'error':
      typeColor = chalk.red.bold('JavaScript错误');
      break;
    case 'promise':
      typeColor = chalk.magenta.bold('Promise错误');
      break;
    case 'network':
      typeColor = chalk.yellow.bold('网络错误');
      break;
    case 'xhr':
      typeColor = chalk.yellow.bold('XHR错误');
      break;
    case 'console':
      typeColor = chalk.blue.bold('控制台错误');
      break;
    default:
      typeColor = chalk.gray.bold('未知错误');
  }
  
  // 打印错误信息
  console.log('\n' + chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`${chalk.gray(`[${time}]`)} ${typeColor}: ${chalk.white(message)}`);
  
  // 打印详细信息
  if (details) {
    if (details.url) {
      console.log(chalk.cyan('URL:'), chalk.white(details.url));
    }
    
    if (details.status) {
      console.log(chalk.cyan('状态:'), chalk.white(`${details.status} ${details.statusText || ''}`));
    }
    
    if (details.filename) {
      console.log(chalk.cyan('文件:'), chalk.white(`${details.filename}:${details.lineno}:${details.colno}`));
    }
    
    if (details.stack) {
      console.log(chalk.cyan('堆栈:'), '\n', chalk.gray(details.stack));
    }
    
    if (details.response) {
      try {
        const responseObj = JSON.parse(details.response);
        console.log(chalk.cyan('响应:'), chalk.white(JSON.stringify(responseObj, null, 2)));
      } catch (e) {
        console.log(chalk.cyan('响应:'), chalk.white(details.response));
      }
    }
    
    if (details.arguments) {
      console.log(chalk.cyan('参数:'), chalk.white(details.arguments.join(', ')));
    }
  }
  
  // 将错误信息写入日志文件
  const logEntry = `[${time}] ${type.toUpperCase()}: ${message}\n` +
                  `${JSON.stringify(details, null, 2)}\n\n`;
  
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
}

// 启动服务器
const PORT = 3030;
server.listen(PORT, () => {
  console.log(chalk.green(`✓ 错误监控服务器已启动，监听端口 ${PORT}`));
  console.log(chalk.yellow(`✓ 日志文件路径: ${logFilePath}`));
});

// 处理进程终止
process.on('SIGINT', () => {
  console.log(chalk.blue('\n关闭错误监控服务器...'));
  server.close(() => {
    console.log(chalk.green('服务器已关闭'));
    process.exit(0);
  });
}); 