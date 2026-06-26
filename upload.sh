#!/bin/bash

# 颜色显示（好看用的）
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}========================================${NC}"
echo "${GREEN}🚀 GitHub 一键上传脚本${NC}"
echo "${BLUE}========================================${NC}"
echo ""

# 检查是否在 git 仓库中
if [ -d ".git" ]; then
    echo "${YELLOW}⚠️  检测到已有 git 仓库${NC}"
    echo "你是想："
    echo "  1) 更新当前项目（add + commit + push）"
    echo "  2) 重新初始化（覆盖旧的 git 设置）"
    read -p "请选择 (1/2): " choice
    
    if [ "$choice" == "1" ]; then
        echo ""
        echo "${GREEN}📝 更新项目...${NC}"
        git add .
        read -p "请输入提交说明: " msg
        git commit -m "$msg"
        git push
        echo ""
        echo "${GREEN}✅ 更新完成！${NC}"
        exit 0
    fi
fi

# 如果没有 git 或者选择重新初始化
echo "${YELLOW}📂 当前文件夹：${NC}"
pwd
echo ""

# 获取仓库名
read -p "请输入 GitHub 仓库名（例如：my-project）: " repo_name

if [ -z "$repo_name" ]; then
    echo "${RED}❌ 仓库名不能为空！${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}🔗 请选择连接方式：${NC}"
echo "  1) SSH（推荐，需要配置过 SSH）"
echo "  2) HTTPS（可能遇到网络问题）"
read -p "请选择 (1/2): " conn_type

if [ "$conn_type" == "2" ]; then
    remote_url="https://github.com/especisally/${repo_name}.git"
else
    remote_url="git@github.com:especisally/${repo_name}.git"
fi

echo ""
echo "${GREEN}开始上传...${NC}"
echo ""

# 初始化 git
git init

# 添加所有文件
git add .

# 提交
read -p "请输入提交说明（默认：first commit）: " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="first commit"
fi
git commit -m "$commit_msg"

# 添加远程仓库
git remote add origin $remote_url

# 推送
echo ""
echo "${YELLOW}⏳ 正在推送到 GitHub...${NC}"
git push -u origin master

# 检查是否成功
if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}========================================${NC}"
    echo "${GREEN}🎉 上传成功！${NC}"
    echo "${GREEN}🔗 访问：https://github.com/especisally/${repo_name}${NC}"
    echo "${GREEN}========================================${NC}"
else
    echo ""
    echo "${RED}❌ 推送失败！${NC}"
    echo "${YELLOW}可能的原因：${NC}"
    echo "  1. 网络问题（试试用 SSH）"
    echo "  2. 仓库名不对或已被占用"
    echo "  3. GitHub 上仓库已经存在且不是空的"
    echo ""
    echo "${YELLOW}尝试解决：${NC}"
    echo "  - 去 GitHub 确认仓库名是否正确"
    echo "  - 如果仓库已有内容，执行："
    echo "    git pull --rebase origin master"
    echo "    git push -u origin master"
fi