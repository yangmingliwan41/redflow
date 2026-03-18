#!/bin/bash

# 红流云创 v2 快速部署脚本
# 使用方法: ./deploy.sh [nginx|node|docker]

set -e

DEPLOY_TYPE=${1:-docker}
PROJECT_DIR=$(pwd)
DIST_DIR="$PROJECT_DIR/dist"

echo "🚀 开始部署红流云创 v2..."
echo "部署类型: $DEPLOY_TYPE"
echo "项目目录: $PROJECT_DIR"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 20+"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ ! -d "$DIST_DIR" ]; then
    echo "❌ 构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成！"

# 根据部署类型执行不同操作
case $DEPLOY_TYPE in
    docker)
        echo "🐳 使用 Docker 部署..."
        if ! command -v docker &> /dev/null; then
            echo "❌ 未检测到 Docker，请先安装 Docker"
            exit 1
        fi
        
        # 检查是否有git仓库，如果有则拉取最新代码
        if [ -d ".git" ]; then
            echo "📥 拉取最新代码..."
            git pull || echo "⚠️  Git pull 失败，继续使用当前代码"
        fi
        
        echo "🔨 构建 Docker 镜像（强制重新构建，不使用缓存）..."
        docker-compose -f docker-compose.nginx.yml build --no-cache
        
        echo "🛑 停止并删除旧容器..."
        docker-compose -f docker-compose.nginx.yml down
        
        echo "🚀 启动新容器..."
        docker-compose -f docker-compose.nginx.yml up -d
        
        echo "✅ Docker 部署完成！"
        echo "访问地址: http://localhost:8080"
        echo "查看日志: docker-compose -f docker-compose.nginx.yml logs -f"
        echo "查看容器状态: docker ps -a | grep redflow"
        ;;
    
    nginx)
        echo "🌐 使用 Nginx 部署..."
        if ! command -v nginx &> /dev/null; then
            echo "❌ 未检测到 Nginx，请先安装 Nginx"
            exit 1
        fi
        
        NGINX_CONFIG="/etc/nginx/sites-available/redflow"
        NGINX_ENABLED="/etc/nginx/sites-enabled/redflow"
        
        echo "创建 Nginx 配置..."
        sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;
    root $PROJECT_DIR/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF
        
        # 创建符号链接
        if [ ! -L "$NGINX_ENABLED" ]; then
            sudo ln -s $NGINX_CONFIG $NGINX_ENABLED
        fi
        
        # 测试配置
        sudo nginx -t
        
        # 重载 Nginx
        sudo systemctl reload nginx
        
        echo "✅ Nginx 部署完成！"
        echo "访问地址: http://localhost"
        ;;
    
    node)
        echo "🟢 使用 Node.js 部署..."
        if ! command -v pm2 &> /dev/null; then
            echo "📦 安装 PM2..."
            sudo npm install -g pm2
        fi
        
        # 停止旧进程（如果存在）
        pm2 stop redflow 2>/dev/null || true
        pm2 delete redflow 2>/dev/null || true
        
        # 启动新进程
        pm2 start server.js --name redflow
        
        # 设置开机自启
        pm2 save
        
        echo "✅ Node.js 部署完成！"
        echo "访问地址: http://localhost:3000"
        echo "查看日志: pm2 logs redflow"
        echo "查看状态: pm2 status"
        ;;
    
    *)
        echo "❌ 未知的部署类型: $DEPLOY_TYPE"
        echo "支持的类型: docker, nginx, node"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo ""
echo "📝 下一步："
echo "1. 在浏览器中打开应用"
echo "2. 在设置页面配置 API 密钥"
echo "3. 开始使用！"
echo ""
echo "📚 详细文档: docs/DEPLOYMENT.md"


