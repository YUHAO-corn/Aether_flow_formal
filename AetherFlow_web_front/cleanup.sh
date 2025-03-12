#!/bin/bash

# 清理Vite开发服务器进程
echo "正在清理Vite开发服务器进程..."

# 查找并终止所有占用5173-5200端口的进程（Vite开发服务器默认使用这些端口）
lsof -ti :5173-5200 | xargs -r kill -9

# 查找并终止所有node进程中包含vite的进程
ps aux | grep '[n]ode.*vite' | awk '{print $2}' | xargs -r kill -9

echo "清理完成"
echo "现在可以启动新的开发服务器了" 