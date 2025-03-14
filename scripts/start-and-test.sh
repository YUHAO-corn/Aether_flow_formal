#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AetherFlow 测试启动脚本 ===${NC}"

# 检查MongoDB是否运行
echo -e "${YELLOW}检查MongoDB服务...${NC}"
if pgrep -x "mongod" > /dev/null
then
    echo -e "${GREEN}MongoDB服务正在运行${NC}"
else
    echo -e "${RED}MongoDB服务未运行${NC}"
    echo -e "${YELLOW}尝试启动MongoDB...${NC}"
    mongod --dbpath=/data/db --fork --logpath=/data/db/mongodb.log
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}MongoDB服务已启动${NC}"
    else
        echo -e "${RED}MongoDB服务启动失败，请手动启动${NC}"
        echo "命令: mongod --dbpath=/data/db"
        exit 1
    fi
fi

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
cd AetherFlow_backend && npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}依赖安装失败${NC}"
    exit 1
fi

# 启动后端服务
echo -e "${YELLOW}启动后端服务...${NC}"
cd AetherFlow_backend && npm run dev &
SERVER_PID=$!
echo -e "${GREEN}后端服务已启动，PID: ${SERVER_PID}${NC}"

# 等待服务器启动
echo -e "${YELLOW}等待服务器启动...${NC}"
sleep 5

# 检查环境
echo -e "${YELLOW}检查环境...${NC}"
cd .. && node tests/integration/check-environment.js
if [ $? -ne 0 ]; then
    echo -e "${RED}环境检查失败${NC}"
    kill $SERVER_PID
    exit 1
fi

# 运行测试
echo -e "${YELLOW}运行测试...${NC}"
node tests/integration/test-all-features.js
TEST_RESULT=$?

# 关闭服务器
echo -e "${YELLOW}关闭服务器...${NC}"
kill $SERVER_PID

# 输出测试结果
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}测试成功!${NC}"
else
    echo -e "${RED}测试失败!${NC}"
fi

exit $TEST_RESULT 