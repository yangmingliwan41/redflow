# 红流云创 v2 Windows 快速部署脚本
# 使用方法: .\deploy.ps1 [docker|build]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("docker", "build")]
    [string]$DeployType = "build"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 开始部署红流云创 v2..." -ForegroundColor Green
Write-Host "部署类型: $DeployType" -ForegroundColor Cyan
Write-Host "项目目录: $PSScriptRoot" -ForegroundColor Cyan

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ 检测到 Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 Node.js，请先安装 Node.js 20+" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}

# 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "❌ 构建失败，dist 目录不存在" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 构建完成！" -ForegroundColor Green

# 根据部署类型执行不同操作
switch ($DeployType) {
    "docker" {
        Write-Host "🐳 使用 Docker 部署..." -ForegroundColor Cyan
        
        # 检查 Docker
        try {
            $dockerVersion = docker --version
            Write-Host "✅ 检测到 Docker: $dockerVersion" -ForegroundColor Green
        } catch {
            Write-Host "❌ 未检测到 Docker，请先安装 Docker Desktop" -ForegroundColor Red
            Write-Host "下载地址: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "构建 Docker 镜像..." -ForegroundColor Yellow
        docker-compose -f docker-compose.nginx.yml build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker 构建失败" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "启动容器..." -ForegroundColor Yellow
        docker-compose -f docker-compose.nginx.yml up -d
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker 启动失败" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Docker 部署完成！" -ForegroundColor Green
        Write-Host "访问地址: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "查看日志: docker-compose -f docker-compose.nginx.yml logs -f" -ForegroundColor Gray
    }
    
    "build" {
        Write-Host "✅ 构建完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 下一步：" -ForegroundColor Yellow
        Write-Host "1. 将 dist 目录上传到服务器" -ForegroundColor White
        Write-Host "2. 在服务器上配置 Nginx 或使用 Docker 部署" -ForegroundColor White
        Write-Host "3. 详细部署步骤请参考: docs/DEPLOYMENT.md" -ForegroundColor White
        Write-Host ""
        Write-Host "📦 构建产物位置: $PSScriptRoot\dist" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "🎉 完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📚 详细文档: docs/DEPLOYMENT.md" -ForegroundColor Gray


