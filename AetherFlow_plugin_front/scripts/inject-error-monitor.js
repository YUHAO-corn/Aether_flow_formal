#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 错误监控脚本
const errorMonitorScript = `
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
`;

// 查找index.html文件
const indexPath = path.join(__dirname, '../index.html');

// 检查文件是否存在
if (!fs.existsSync(indexPath)) {
  console.error('找不到index.html文件');
  process.exit(1);
}

// 读取文件内容
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// 检查是否已经注入了错误监控脚本
if (htmlContent.includes('错误监控脚本')) {
  console.log('错误监控脚本已经注入');
  process.exit(0);
}

// 在</head>标签前注入脚本
htmlContent = htmlContent.replace('</head>', `${errorMonitorScript}\n</head>`);

// 写回文件
fs.writeFileSync(indexPath, htmlContent, 'utf8');

console.log('错误监控脚本已成功注入到index.html'); 