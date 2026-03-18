# 部署前检查清单

## ✅ 代码完整性检查

### 版本号检查
- [x] `package.json` 版本: `2.1.0`
- [x] `src/App.vue` 显示: `v2.1`
- [x] `src/views/HomeView.vue` 显示: `v2.1`
- [x] 所有代码中无 `v2.0` 残留

### 文件清理检查
- [x] `dist/` 目录已删除（不应提交到git）
- [x] `.gitignore` 包含 `dist/`
- [x] 无 `.env` 文件（已忽略）
- [x] 无个人信息泄露

### Docker配置检查
- [x] `Dockerfile.nginx` 版本标签: `2.1.0`
- [x] `docker-compose.nginx.yml` 镜像标签: `redflow-nginx:2.1`
- [x] 所有docker-compose文件已移除过时的 `version` 字段
- [x] 构建参数 `VERSION=2.1.0` 已配置

### 新增文件检查
- [x] `deploy-force.sh` - 强制部署脚本
- [x] `verify-deployment.sh` - 验证脚本
- [x] `docs/BROWSER_CACHE_ISSUE.md` - 浏览器缓存问题指南
- [x] `docs/DOCKER_VERSION_ISSUE.md` - Docker版本问题指南
- [x] `docs/DOCKER_TROUBLESHOOTING.md` - Docker故障排除
- [x] `src/vite-env.d.ts` - TypeScript类型声明

### 代码功能检查
- [x] 构建时间戳功能已添加
- [x] 版本号注入功能已添加
- [x] 所有API密钥从localStorage读取（无硬编码）

## 📋 提交前确认

### Git状态检查
```bash
# 检查未提交的文件
git status

# 确认dist目录不在git中
git status | grep dist

# 确认.env文件不在git中
git status | grep .env
```

### 个人信息检查
- [x] 无硬编码的API密钥
- [x] 无个人信息（邮箱、电话等）
- [x] 无服务器IP地址
- [x] 无数据库连接信息

## 🚀 部署步骤

### 1. 提交代码到GitHub
```bash
git add .
git commit -m "feat: 更新到v2.1版本，修复Docker部署缓存问题"
git push origin main  # 或你的分支名
```

### 2. 服务器端部署
```bash
# 在服务器上执行
cd /red/redflow
git pull
chmod +x deploy-force.sh
./deploy-force.sh
```

### 3. 验证部署
```bash
# 验证容器内的版本
JS_FILE=$(docker exec redflow-nginx ls -t /usr/share/nginx/html/assets/*.js 2>/dev/null | head -1)
docker exec redflow-nginx grep -c "v2\.1" "$JS_FILE" && echo "✅ 部署成功" || echo "❌ 部署失败"
```

## ⚠️ 注意事项

1. **dist目录**: 永远不要提交dist目录到git，它会在服务器上通过Docker构建生成
2. **API密钥**: 所有API密钥存储在浏览器localStorage，不会泄露
3. **强制构建**: 更新代码后必须使用 `--no-cache` 参数重新构建
4. **浏览器缓存**: 如果服务器已更新但浏览器显示旧版本，按 `Ctrl+Shift+R` 强制刷新

## 📝 更新日志

- 2025-12-08: 更新到v2.1版本
  - 修复Docker部署缓存问题
  - 添加构建时间戳功能
  - 添加强制部署脚本
  - 完善文档和故障排除指南

