#!/bin/bash

echo "正在检查端口3000是否被占用..."

# 查找占用3000端口的进程
PORT_PID=$(lsof -ti:3000)

if [ ! -z "$PORT_PID" ]; then
  echo "发现端口3000被进程 $PORT_PID 占用，正在终止该进程..."
  kill -9 $PORT_PID
  echo "进程已终止"
else
  echo "端口3000未被占用"
fi

# 查找并杀死所有相关的Node.js进程
echo "正在查找并终止所有相关的Node.js进程..."
NODEMON_PIDS=$(ps aux | grep "nodemon.*server.js" | grep -v grep | awk '{print $2}')
SERVER_PIDS=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')

if [ ! -z "$NODEMON_PIDS" ]; then
  echo "发现nodemon进程: $NODEMON_PIDS，正在终止..."
  kill -9 $NODEMON_PIDS
fi

if [ ! -z "$SERVER_PIDS" ]; then
  echo "发现server.js进程: $SERVER_PIDS，正在终止..."
  kill -9 $SERVER_PIDS
fi

# 等待进程完全终止
sleep 2

# 进入后端目录
cd AetherFlow_backend

# 启动后端服务
echo "正在启动后端服务..."
npm run dev 