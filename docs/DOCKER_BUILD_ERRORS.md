# Docker构建错误解决方案

## ETXTBSY 错误（esbuild安装失败）

### 错误信息
```
npm error Error: spawnSync /app/node_modules/esbuild/bin/esbuild ETXTBSY
```

### 原因
- 文件系统锁定问题，esbuild二进制文件在安装时被锁定
- Alpine Linux的文件系统特性
- Docker构建过程中的并发问题

### 解决方案

#### 方案1：使用npm install代替npm ci（已应用）
```dockerfile
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --prefer-offline --no-audit
```

#### 方案2：添加重试机制（已应用）
```dockerfile
RUN npm install --legacy-peer-deps || \
    (sleep 2 && npm install --legacy-peer-deps) || \
    (sleep 5 && npm install --legacy-peer-deps)
```

#### 方案3：在服务器上手动清理后重试
```bash
# 清理Docker构建缓存
docker builder prune -af

# 清理系统缓存
sync
echo 3 > /proc/sys/vm/drop_caches

# 重新构建
docker-compose -f docker-compose.nginx.yml build --no-cache
```

#### 方案4：使用不同的基础镜像
如果问题持续，可以尝试使用 `node:20-slim` 代替 `node:20-alpine`：
```dockerfile
FROM node:20-slim AS builder
```

### 已修复的Dockerfile
- ✅ `Dockerfile.nginx` - 已更新安装命令
- ✅ `Dockerfile.node` - 已更新安装命令

### 验证修复
构建成功后，检查：
```bash
# 查看构建日志，确认npm install成功
docker-compose -f docker-compose.nginx.yml build --no-cache 2>&1 | grep -i "npm\|esbuild"

# 验证容器可以正常启动
docker-compose -f docker-compose.nginx.yml up -d
docker logs redflow-nginx
```

