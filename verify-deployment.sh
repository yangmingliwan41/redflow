#!/bin/bash

# 验证Docker部署版本脚本
# 用于检查容器内的实际文件版本

echo "🔍 验证Docker部署版本..."
echo ""

# 检查容器是否存在
if ! docker ps -a | grep -q redflow-nginx; then
    echo "❌ 未找到 redflow-nginx 容器"
    exit 1
fi

echo "📦 容器信息："
docker ps -a | grep redflow-nginx
echo ""

echo "📁 检查容器内的文件："
echo "1. index.html 内容："
docker exec redflow-nginx cat /usr/share/nginx/html/index.html | head -10
echo ""

echo "2. 检查 dist 目录文件列表："
docker exec redflow-nginx ls -lah /usr/share/nginx/html/ | head -20
echo ""

echo "3. 检查 assets 目录（最新构建的文件）："
docker exec redflow-nginx ls -lah /usr/share/nginx/html/assets/ 2>/dev/null | tail -5 || echo "assets目录不存在"
echo ""

echo "4. 检查 index.html 中的版本信息："
docker exec redflow-nginx grep -i "v2" /usr/share/nginx/html/index.html || echo "未找到版本信息"
echo ""

echo "5. 检查构建的JS文件中的版本信息："
JS_FILE=$(docker exec redflow-nginx ls -t /usr/share/nginx/html/assets/*.js 2>/dev/null | head -1)
if [ -n "$JS_FILE" ]; then
    echo "最新JS文件: $JS_FILE"
    docker exec redflow-nginx grep -o "v2\.[0-9]" "$JS_FILE" | head -3 || echo "未找到版本信息"
else
    echo "未找到JS文件"
fi
echo ""

echo "6. 检查文件修改时间："
docker exec redflow-nginx stat /usr/share/nginx/html/index.html 2>/dev/null | grep -E "Modify|Change" || echo "无法获取文件时间"
echo ""

echo "7. 测试HTTP响应（检查实际返回的内容）："
echo "curl http://localhost:8080 | grep -i 'v2'"
curl -s http://localhost:8080 | grep -i "v2" | head -3 || echo "未找到版本信息"
echo ""

echo "✅ 验证完成"
echo ""
echo "💡 如果容器内文件显示v2.1，但浏览器显示v2.0，可能是浏览器缓存问题："
echo "   - 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac) 强制刷新"
echo "   - 或清除浏览器缓存"
echo "   - 或使用无痕模式访问"

