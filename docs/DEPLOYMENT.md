# 服务器部署指南

本指南将帮助你将红流云创 v2 部署到服务器，让同事可以通过浏览器访问。

## 📋 部署前准备

### 服务器要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+ / Debian 10+) 或 Windows Server
- **内存**: 至少 512MB（推荐 1GB+）
- **磁盘空间**: 至少 500MB
- **网络**: 可访问互联网（用于调用 AI API）

### 本地准备

1. 确保项目已构建：`npm run build`
2. 准备好服务器访问权限（SSH 或远程桌面）
3. 确认服务器已安装必要软件（见下方各方案要求）

## 🚀 方案一：Docker 部署（推荐，最简单）

### 优点
- ✅ 一键部署，无需配置环境
- ✅ 环境隔离，不影响其他服务
- ✅ 支持快速更新和回滚
- ✅ 适合生产环境

### 步骤

#### 1. 在服务器上安装 Docker

**Ubuntu/Debian:**
```bash
# 更新包列表
sudo apt update

# 安装 Docker
sudo apt install -y docker.io docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

**CentOS/RHEL:**
```bash
# 安装 Docker
sudo yum install -y docker docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

#### 2. 上传项目文件到服务器

**方式 A：使用 Git（推荐）**
```bash
# 在服务器上克隆仓库
cd /opt
git clone https://github.com/yangmingliwan41/redflow.git
cd redflow/v2
```

**方式 B：使用 SCP 上传**
```bash
# 在本地执行（Windows PowerShell）
scp -r "D:\03.Work\01.小红书\02.红流云创\v2" user@your-server-ip:/opt/redflow-v2
```

**方式 C：使用 FTP/SFTP 工具**
- 使用 FileZilla、WinSCP 等工具上传整个项目文件夹

#### 3. 构建并启动 Docker 容器

**使用 Nginx（推荐，性能更好）:**
```bash
cd /opt/redflow-v2  # 或你上传的目录

# 构建并启动
docker-compose -f docker-compose.nginx.yml up -d

# 查看日志
docker-compose -f docker-compose.nginx.yml logs -f

# 查看运行状态
docker ps
```

**使用 Node.js:**
```bash
docker-compose -f docker-compose.node.yml up -d
```

#### 4. 配置防火墙

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 8080/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

#### 5. 访问应用

打开浏览器访问：`http://your-server-ip:8080`

### 常用 Docker 命令

```bash
# 停止服务
docker-compose -f docker-compose.nginx.yml down

# 重启服务
docker-compose -f docker-compose.nginx.yml restart

# 查看日志
docker-compose -f docker-compose.nginx.yml logs -f

# 更新代码后重新构建
docker-compose -f docker-compose.nginx.yml up -d --build

# 进入容器（调试用）
docker exec -it redflow-nginx sh
```

---

## 🖥️ 方案二：Nginx 直接部署（适合已有 Nginx 的服务器）

### 优点
- ✅ 性能最佳
- ✅ 资源占用少
- ✅ 适合高并发场景

### 步骤

#### 1. 在服务器上安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 2. 构建项目（在本地或服务器上）

**在本地构建:**
```bash
cd "D:\03.Work\01.小红书\02.红流云创\v2"
npm install
npm run build
```

**在服务器上构建（需要安装 Node.js）:**
```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 构建项目
cd /opt/redflow-v2
npm install
npm run build
```

#### 3. 配置 Nginx

创建配置文件：
```bash
sudo nano /etc/nginx/sites-available/redflow
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    root /opt/redflow-v2/dist;  # 替换为你的 dist 目录路径
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

启用配置：
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/redflow /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 4. 配置防火墙

```bash
sudo ufw allow 80/tcp
sudo ufw reload
```

#### 5. 访问应用

打开浏览器访问：`http://your-server-ip` 或 `http://your-domain.com`

---

## 🟢 方案三：Node.js + PM2 部署

### 优点
- ✅ 便于扩展（可添加 API 代理）
- ✅ 支持进程管理
- ✅ 适合需要后端功能的场景

### 步骤

#### 1. 安装 Node.js 和 PM2

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

#### 2. 上传项目并构建

```bash
cd /opt/redflow-v2
npm install
npm run build
```

#### 3. 启动服务

```bash
# 使用 PM2 启动
pm2 start server.js --name redflow

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs redflow
```

#### 4. 配置防火墙

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

#### 5. 访问应用

打开浏览器访问：`http://your-server-ip:3000`

### PM2 常用命令

```bash
# 停止服务
pm2 stop redflow

# 重启服务
pm2 restart redflow

# 查看日志
pm2 logs redflow

# 查看监控
pm2 monit

# 删除服务
pm2 delete redflow
```

---

## 🔒 方案四：使用 Nginx 反向代理 + HTTPS（生产环境推荐）

### 优点
- ✅ 支持 HTTPS（SSL 证书）
- ✅ 更安全
- ✅ 可配置域名访问
- ✅ 适合正式生产环境

### 步骤

#### 1. 安装 Nginx 和 Certbot

```bash
# 安装 Nginx
sudo apt install -y nginx

# 安装 Certbot（用于自动申请 SSL 证书）
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. 配置 Nginx（HTTP）

创建配置文件：
```bash
sudo nano /etc/nginx/sites-available/redflow
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    root /opt/redflow-v2/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/redflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. 申请 SSL 证书

```bash
# 自动申请并配置 SSL 证书
sudo certbot --nginx -d your-domain.com

# 证书会自动续期（通过 cron 任务）
```

#### 4. 访问应用

打开浏览器访问：`https://your-domain.com`

---

## 🔐 API 密钥安全说明

### ⚠️ 重要提示

当前应用将 API 密钥存储在浏览器的 `localStorage` 中，这意味着：

1. **每个用户需要单独配置 API 密钥**
2. **API 密钥存储在用户本地浏览器中**
3. **如果使用共享 API 密钥，建议使用后端代理（见下方）**

### 推荐方案：后端 API 代理（可选）

如果你希望统一管理 API 密钥，可以添加一个后端代理服务：

**优点：**
- ✅ API 密钥不暴露给前端
- ✅ 统一管理，便于控制使用量
- ✅ 可以添加访问控制、日志记录等功能

**实现方式：**
1. 创建一个简单的 Express 后端服务
2. 将 API 密钥存储在服务器环境变量中
3. 前端通过后端代理调用 AI API
4. 后端验证用户身份后转发请求

（如果需要，我可以帮你实现这个代理服务）

---

## 📝 部署检查清单

部署完成后，请检查以下项目：

- [ ] 应用可以正常访问
- [ ] 页面路由正常工作（刷新页面不 404）
- [ ] 静态资源加载正常（CSS、JS、图片）
- [ ] API 调用正常（需要用户配置 API 密钥）
- [ ] 防火墙端口已开放
- [ ] 服务已设置开机自启（Docker/PM2）
- [ ] 日志记录正常（便于排查问题）

---

## 🔧 常见问题

### Q1: 访问页面显示 404？

**原因**: SPA 路由配置不正确

**解决**: 确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

### Q2: 静态资源加载失败？

**原因**: 路径配置错误或文件未上传

**解决**: 
1. 检查 `dist` 目录是否存在且包含所有文件
2. 检查 Nginx `root` 配置是否正确
3. 检查文件权限：`sudo chown -R www-data:www-data /opt/redflow-v2/dist`

### Q3: Docker 容器无法启动？

**解决**:
```bash
# 查看详细错误
docker-compose -f docker-compose.nginx.yml logs

# 检查端口是否被占用
sudo netstat -tulpn | grep 8080

# 重新构建
docker-compose -f docker-compose.nginx.yml up -d --build
```

### Q4: 如何更新代码？

**Docker 方式（重要：必须使用 --no-cache 强制重新构建）:**

⚠️ **注意**: 如果更新代码后部署的还是旧版本，说明Docker使用了缓存的旧代码。必须使用 `--no-cache` 参数强制重新构建。

```bash
cd /opt/redflow-v2

# 方式1: 使用强制部署脚本（推荐）
chmod +x deploy-force.sh
./deploy-force.sh

# 方式2: 手动强制重新构建
git pull  # 或重新上传文件
docker-compose -f docker-compose.nginx.yml down
docker-compose -f docker-compose.nginx.yml build --no-cache
docker-compose -f docker-compose.nginx.yml up -d

# 方式3: 如果只是小更新，可以尝试（不推荐，可能仍使用缓存）
docker-compose -f docker-compose.nginx.yml up -d --build
```

**为什么需要 --no-cache？**
- Docker构建时会使用缓存层，如果代码更新但依赖文件（package.json）没变，Docker可能使用缓存的旧代码层
- 使用 `--no-cache` 会强制重新执行所有构建步骤，确保使用最新代码

**Nginx 方式:**
```bash
cd /opt/redflow-v2
git pull  # 或重新上传文件
npm run build
sudo systemctl reload nginx
```

### Q5: 如何查看访问日志？

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Docker:**
```bash
docker-compose -f docker-compose.nginx.yml logs -f
```

### Q6: 如何限制访问（仅内网或特定 IP）？

在 Nginx 配置中添加：
```nginx
location / {
    allow 192.168.1.0/24;  # 允许内网
    allow 10.0.0.0/8;      # 允许特定网段
    deny all;              # 拒绝其他所有
    try_files $uri $uri/ /index.html;
}
```

---

## 🎯 推荐部署方案选择

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 快速测试 | Docker (Nginx) | 最简单，一键部署 |
| 生产环境（有域名） | Nginx + HTTPS | 安全、性能好 |
| 需要扩展功能 | Node.js + PM2 | 便于添加后端功能 |
| 内网使用 | Docker 或 Nginx | 根据服务器环境选择 |

---

## 📞 需要帮助？

如果部署过程中遇到问题，请检查：
1. 服务器日志
2. 浏览器控制台错误
3. 网络连接（防火墙、端口）
4. 文件权限

祝你部署顺利！🎉


