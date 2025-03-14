#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AetherFlow 网页测试启动脚本 ===${NC}"

# 检查环境
echo -e "${YELLOW}检查测试环境...${NC}"
bash scripts/check-web-test-env.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}环境检查失败，请修复上述问题后重试${NC}"
    exit 1
fi

# 检查前端依赖
echo -e "${YELLOW}检查前端依赖...${NC}"
if [ -d "AetherFlow_web_front/node_modules" ]; then
    echo -e "${GREEN}前端依赖已安装${NC}"
else
    echo -e "${YELLOW}安装前端依赖...${NC}"
    cd AetherFlow_web_front && npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}前端依赖安装失败${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}前端依赖安装完成${NC}"
fi

# 准备浏览器控制台命令
echo -e "${YELLOW}准备浏览器控制台命令...${NC}"
echo -e "${GREEN}浏览器控制台命令已准备就绪${NC}"
echo -e "${YELLOW}请在前端页面加载后，打开浏览器控制台(F12)，复制并执行以下命令：${NC}"
echo -e "${GREEN}$(cat scripts/api-adapter.js)${NC}"

# 启动前端服务
echo -e "${YELLOW}启动前端服务...${NC}"
cd AetherFlow_web_front && npm run dev 