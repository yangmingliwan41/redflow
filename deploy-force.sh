#!/bin/bash

# 红流云创 v2 强制重新部署脚本
# 此脚本会强制重新构建Docker镜像，不使用任何缓存
# 使用方法: ./deploy-force.sh

set -e

PROJECT_DIR=$(pwd)

echo "🔄 强制重新部署红流云创 v2.1..."
echo "项目目录: $PROJECT_DIR"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查是否有git仓库，如果有则拉取最新代码
if [ -d ".git" ]; then
    echo "📥 步骤 1/5: 拉取最新代码..."
    git pull || {
        echo "⚠️  Git pull 失败，继续使用当前代码"
    }
    echo ""
else
    echo "ℹ️  未检测到 Git 仓库，跳过代码更新"
    echo ""
fi

# 停止并删除旧容器
echo "🛑 步骤 2/5: 停止并删除旧容器..."
docker-compose -f docker-compose.nginx.yml down 2>/dev/null || true
echo "✅ 旧容器已停止"
echo ""

# 删除旧镜像（可选，强制重新构建）
echo "🗑️  步骤 3/5: 清理旧镜像..."
docker rmi redflow-nginx:2.1 2>/dev/null || echo "ℹ️  镜像不存在，跳过删除"
echo ""

# 清理构建缓存
echo "🧹 步骤 4/5: 清理Docker构建缓存..."
docker builder prune -f
echo "✅ 构建缓存已清理"
echo ""

# 强制重新构建镜像（不使用缓存）
echo "🔨 步骤 5/5: 强制重新构建Docker镜像（不使用缓存）..."
docker-compose -f docker-compose.nginx.yml build --no-cache --pull
echo "✅ 镜像构建完成"
echo ""

# 启动新容器
echo "🚀 启动新容器..."
docker-compose -f docker-compose.nginx.yml up -d
echo ""

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 3

# 检查容器状态
echo "📊 容器状态："
docker ps -a | grep redflow || true
echo ""

# 显示日志
echo "📝 最近日志："
docker-compose -f docker-compose.nginx.yml logs --tail=20
echo ""

echo "✅ 强制重新部署完成！"
echo ""
echo "📋 验证步骤："
echo "1. 检查容器状态: docker ps -a | grep redflow"
echo "2. 查看实时日志: docker-compose -f docker-compose.nginx.yml logs -f"
echo "3. 访问应用: http://localhost:8080"
echo "4. 检查版本: 在应用界面查看是否显示 v2.1"
echo ""
echo "💡 如果还是旧版本，请检查："
echo "   1. 运行验证脚本: ./verify-deployment.sh"
echo "   2. 如果服务器端已更新，但浏览器显示旧版本 → 这是浏览器缓存问题"
echo "   3. 解决方案: 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac) 强制刷新"
echo "   4. 或使用无痕模式访问"
echo ""
echo "📚 详细排查指南: docs/BROWSER_CACHE_ISSUE.md"
echo ""

