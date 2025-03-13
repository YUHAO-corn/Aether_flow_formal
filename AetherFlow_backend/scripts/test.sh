#!/bin/bash

# 测试命令脚本
# 用法: ./scripts/test.sh [选项]
# 选项:
#   --pattern=<模式>    指定测试文件模式，例如 "auth"
#   --coverage          生成覆盖率报告
#   --watch             监视模式
#   --verbose           详细输出
#   --no-parallel       禁用并行测试
#   --help              显示帮助信息

# 显示帮助信息
show_help() {
  echo "用法: ./scripts/test.sh [选项]"
  echo "选项:"
  echo "  --pattern=<模式>    指定测试文件模式，例如 \"auth\""
  echo "  --coverage          生成覆盖率报告"
  echo "  --watch             监视模式"
  echo "  --verbose           详细输出"
  echo "  --no-parallel       禁用并行测试"
  echo "  --help              显示帮助信息"
  exit 0
}

# 解析命令行参数
PATTERN=""
COVERAGE=false
WATCH=false
VERBOSE=false
PARALLEL=true

for arg in "$@"; do
  case $arg in
    --pattern=*)
      PATTERN="${arg#*=}"
      ;;
    --coverage)
      COVERAGE=true
      ;;
    --watch)
      WATCH=true
      ;;
    --verbose)
      VERBOSE=true
      ;;
    --no-parallel)
      PARALLEL=false
      ;;
    --help)
      show_help
      ;;
    *)
      echo "未知选项: $arg"
      show_help
      ;;
  esac
done

# 构建Jest命令
JEST_CMD="NODE_ENV=test npx jest"

if [ -n "$PATTERN" ]; then
  JEST_CMD="$JEST_CMD $PATTERN"
fi

if [ "$COVERAGE" = true ]; then
  JEST_CMD="$JEST_CMD --coverage"
fi

if [ "$WATCH" = true ]; then
  JEST_CMD="$JEST_CMD --watch"
fi

if [ "$VERBOSE" = true ]; then
  JEST_CMD="$JEST_CMD --verbose"
fi

if [ "$PARALLEL" = true ]; then
  JEST_CMD="$JEST_CMD --maxWorkers=50%"
else
  JEST_CMD="$JEST_CMD --runInBand"
fi

# 添加检测未关闭句柄的选项
JEST_CMD="$JEST_CMD --detectOpenHandles"

# 输出命令
echo "运行测试命令: $JEST_CMD"

# 运行测试
eval $JEST_CMD

# 检查测试结果
if [ $? -eq 0 ]; then
  echo "测试通过！"
  exit 0
else
  echo "测试失败！"
  exit 1
fi 