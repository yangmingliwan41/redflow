# 红流云创 v2.0

<div align="center">

**AI驱动的图文创作助手**

[功能特性](#功能特性) • [快速开始](#快速开始) • [Docker部署](#docker部署) • [贡献指南](./CONTRIBUTING.md) • [更新日志](./CHANGELOG.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

## 项目简介

红流云创 v2.0 是一个面向小红书场景的 AI 图文创作助手，支持两种创作模式：

1. **文本生成图文**：输入主题，AI 生成小红书图文大纲和配图建议，并批量生成海报图片
2. **图生图**：上传产品图片，AI 分析并生成营销文案和风格化图片

## 效果展示

### 文本生成图文模式

<div align="center">

#### 1. 输入主题生成大纲
![文本生成大纲](./docs/images/text-to-outline.png)

#### 2. 编辑大纲和配图建议
![编辑大纲](./docs/images/edit-outline.png)

#### 3. 批量生成海报图片
![生成结果](./docs/images/text-result.png)

</div>

### 图生图模式

<div align="center">

#### 1. 上传产品图片
![上传图片](./docs/images/upload-image.png)

#### 2. AI分析产品特征
![产品分析](./docs/images/image-analysis.png)

#### 3. 生成营销文案和风格化图片
![图生图结果](./docs/images/image-to-image-result.png)

</div>

### 历史记录

<div align="center">

![历史记录](./docs/images/history-view.png)

</div>

> 💡 **提示**: 以上示例图片需要您自行添加。将截图保存到 `docs/images/` 目录，并按照上述命名规范命名即可。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **API服务**:
  - 文本生成: DeepSeek API
  - 图片生成: Google GenAI API

## 项目结构

```
v2/
├── src/
│   ├── assets/          # 静态资源
│   │   └── css/        # 样式文件
│   ├── components/     # 组件
│   │   ├── ui/         # UI组件库
│   │   ├── layout/     # 布局组件
│   │   └── common/      # 通用组件
│   ├── composables/    # 组合式函数
│   ├── config/         # 配置文件
│   ├── router/         # 路由配置
│   ├── services/       # 服务层
│   │   ├── ai/         # AI服务模块
│   │   └── storage/    # 存储服务
│   ├── stores/         # 状态管理
│   ├── types/          # TypeScript类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── docker/             # Docker配置文件
├── .github/            # GitHub模板
├── Dockerfile.nginx    # Nginx部署文件
├── Dockerfile.node     # Node.js部署文件
├── docker-compose.yml  # Docker Compose配置
└── package.json
```

## 安装和运行

### 1. 安装依赖

```bash
cd 02.红流云创/v2
npm install
```

### 2. 配置API密钥

在浏览器中打开应用后，进入"系统设置"页面，配置以下API密钥：

- **DeepSeek API Key**: 用于文本生成
  - 获取地址: https://platform.deepseek.com/
  - 配置项: `DEEPSEEK_API_KEY`

- **Google GenAI API Key**: 用于图片生成
  - 获取地址: https://aistudio.google.com/app/apikey
  - 配置项: `GOOGLE_API_KEY`

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5174` 启动

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## Docker部署

项目支持两种Docker部署方式，详细说明请参考 [Docker部署文档](./docker/README.md)。

### 方式一：Nginx静态文件部署（推荐）

```bash
# 使用docker-compose
docker-compose -f docker-compose.nginx.yml up -d

# 或直接构建运行
docker build -f Dockerfile.nginx -t redflow-nginx .
docker run -d -p 8080:80 --name redflow-nginx redflow-nginx
```

访问：http://localhost:8080

### 方式二：Node.js服务器部署

```bash
# 使用docker-compose
docker-compose -f docker-compose.node.yml up -d

# 或直接构建运行
docker build -f Dockerfile.node -t redflow-node .
docker run -d -p 3000:3000 --name redflow-node redflow-node
```

访问：http://localhost:3000

### 环境变量

- `PORT`: 服务端口（Nginx默认8080，Node.js默认3000）
- `NODE_ENV`: 环境变量（默认production）

## 功能特性

### 文本生成图文模式
- 输入创意主题
- AI生成小红书风格图文大纲
- 支持多页面内容生成
- 自动生成配图（待实现）

### 图生图模式
- 上传产品图片
- AI分析产品特征（颜色、材质、类别等）
- 生成营销文案
- 生成风格化产品图片
- 支持多种风格选择

### 历史记录
- 自动保存创作历史
- 查看历史作品
- 本地存储（最多20条）

### 系统设置
- API密钥配置
- 本地存储管理
- 配置即时生效

## API配置说明

### DeepSeek API
- **默认端点**: `https://api.deepseek.com/chat/completions`
- **默认模型**: `deepseek-chat`
- **支持自定义端点和模型**

### Google GenAI API
- **获取地址**: https://aistudio.google.com/app/apikey
- **图片生成模型**: `gemini-2.5-flash-image`
- **文本分析模型**: `gemini-2.5-flash`

## 开发计划

- [x] 基础项目结构
- [x] 路由和布局
- [x] API服务集成（DeepSeek + Google）
- [x] 图生图功能
- [x] 文本生成大纲功能
- [x] 历史记录功能
- [x] 设置界面
- [x] 完善UI组件库
- [x] Docker部署支持
- [x] 单元测试框架
- [ ] 图片生成流程优化
- [ ] 深色模式支持

## 注意事项

1. **API密钥安全**: 所有API密钥存储在浏览器本地存储中，不会上传到服务器
2. **存储限制**: 历史记录最多保存20条，超出会自动删除最旧的记录
3. **图片压缩**: 上传的图片会自动压缩以节省存储空间
4. **网络要求**: 需要能够访问DeepSeek和Google API服务

<!-- 历史版本对比信息已移除，当前文档仅聚焦红流云创 v2 本身功能 -->

## 测试

```bash
# 运行测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage

# 运行测试UI
npm run test:ui
```

## 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

### 贡献方式

- 🐛 [报告Bug](./.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [提出功能建议](./.github/ISSUE_TEMPLATE/feature_request.md)
- 📝 [提交代码](./CONTRIBUTING.md#提交代码)
- 📖 [改进文档](./CONTRIBUTING.md)

## 常见问题（FAQ）

### Q: API密钥安全吗？

A: 所有API密钥存储在浏览器本地存储（localStorage）中，不会上传到任何服务器。请妥善保管您的API密钥。

### Q: 支持哪些浏览器？

A: 支持所有现代浏览器（Chrome、Firefox、Safari、Edge等），需要支持ES6+和Vue 3。

### Q: 如何备份历史记录？

A: 历史记录存储在浏览器本地，可以通过浏览器的导出功能备份，或使用浏览器的同步功能。

### Q: 图片生成失败怎么办？

A: 请检查：
1. API密钥是否正确配置
2. 网络连接是否正常
3. API服务是否可用
4. 查看浏览器控制台的错误信息

## 许可证

本项目采用 [MIT许可证](./LICENSE) 开源。

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [DeepSeek](https://platform.deepseek.com/) - AI文本生成服务
- [Google GenAI](https://aistudio.google.com/) - AI图片生成服务

## 相关链接

- [更新日志](./CHANGELOG.md)
- [贡献指南](./CONTRIBUTING.md)
- [Docker部署文档](./docker/README.md)
- [问题反馈](https://github.com/your-username/redflow-v2/issues)


