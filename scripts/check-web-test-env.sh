#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AetherFlow 网页测试环境检查 ===${NC}"

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

# 检查后端服务是否运行
echo -e "${YELLOW}检查后端服务...${NC}"
if curl -s http://localhost:3001/api/v1/health > /dev/null; then
    echo -e "${GREEN}后端服务正在运行${NC}"
else
    echo -e "${RED}后端服务未运行${NC}"
    echo -e "${YELLOW}请先启动后端服务${NC}"
    echo "命令: npm run start:backend"
    exit 1
fi

# 检查前端环境变量
echo -e "${YELLOW}检查前端环境变量...${NC}"
if [ -f "AetherFlow_web_front/.env" ]; then
    echo -e "${GREEN}前端环境变量文件存在${NC}"
    if grep -q "VITE_API_BASE_URL=http://localhost:3001/api/v1" "AetherFlow_web_front/.env"; then
        echo -e "${GREEN}API基础URL配置正确${NC}"
    else
        echo -e "${RED}API基础URL配置不正确${NC}"
        echo -e "${YELLOW}正在更新.env文件...${NC}"
        echo "VITE_API_BASE_URL=http://localhost:3001/api/v1" > AetherFlow_web_front/.env
        echo -e "${GREEN}.env文件已更新${NC}"
    fi
else
    echo -e "${RED}前端环境变量文件不存在${NC}"
    echo -e "${YELLOW}正在创建.env文件...${NC}"
    echo "VITE_API_BASE_URL=http://localhost:3001/api/v1" > AetherFlow_web_front/.env
    echo -e "${GREEN}.env文件已创建${NC}"
fi

# 检查测试用户是否存在
echo -e "${YELLOW}检查测试用户...${NC}"
TEST_USER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password123"}')

if echo $TEST_USER_RESPONSE | grep -q "success\":true"; then
    echo -e "${GREEN}测试用户存在${NC}"
    # 提取token
    TOKEN=$(echo $TEST_USER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo -e "${GREEN}已获取测试用户令牌${NC}"
else
    echo -e "${RED}测试用户不存在${NC}"
    echo -e "${YELLOW}正在创建测试用户...${NC}"
    REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/register -H "Content-Type: application/json" -d '{"username": "testuser", "email": "test@example.com", "password": "password123", "passwordConfirm": "password123"}')
    
    if echo $REGISTER_RESPONSE | grep -q "success\":true"; then
        echo -e "${GREEN}测试用户创建成功${NC}"
        # 提取token
        TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
        echo -e "${GREEN}已获取测试用户令牌${NC}"
    else
        echo -e "${RED}测试用户创建失败${NC}"
        echo "响应: $REGISTER_RESPONSE"
        exit 1
    fi
fi

# 创建测试数据
echo -e "${YELLOW}创建测试数据...${NC}"
# 创建测试标签
TAG_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/tags -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "测试标签", "color": "#FF5733"}')
if echo $TAG_RESPONSE | grep -q "success\":true"; then
    echo -e "${GREEN}测试标签创建成功${NC}"
else
    echo -e "${YELLOW}测试标签可能已存在${NC}"
fi

# 创建测试提示词
PROMPT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/prompts -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"content": "这是一个测试提示词", "response": "这是测试回答", "platform": "test-platform"}')
if echo $PROMPT_RESPONSE | grep -q "success\":true"; then
    echo -e "${GREEN}测试提示词创建成功${NC}"
else
    echo -e "${YELLOW}测试提示词创建失败或已存在${NC}"
    echo "响应: $PROMPT_RESPONSE"
fi

echo -e "${GREEN}=== 环境检查完成 ===${NC}"
echo -e "${GREEN}测试环境已准备就绪${NC}"
echo -e "${YELLOW}您可以使用以下命令启动前端服务：${NC}"
echo "cd AetherFlow_web_front && npm run dev"
echo -e "${YELLOW}或者使用以下命令运行自动化测试：${NC}"
echo "npm run test:web"

exit 0 