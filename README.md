# 红流云创 v2.3.9.2 —— 别再用命P图了，AI替你上班

<div align="center">

**运营人员的福音-AI图文创作助手**

[功能特性](#功能特性) • [快速开始](#快速开始) • [服务器部署](#服务器部署) • [Docker部署](#docker部署) • [贡献指南](./CONTRIBUTING.md) • [更新日志](./CHANGELOG.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-2.3.9.2-blue)](https://github.com/your-username/redflow-v2)

</div>

## 项目简介

### 红流云创 v2.3.9.2.9.2 —— 别再用命P图了，AI替你上班

还在为小红书爆文熬夜磕图、文案删了又改？  
一张图扣一天，眼快瞎了流量还挂零？  
别修仙了，你缺的不是肝，是像样的工具。

**红流云创**专治各种"创作内耗"，用AI把小红书图文流水线塞进键盘里：

- **🧠 文本生成图文**：输入一个念头，AI直接吐出一套完整图文大纲+配图建议，连海报都给你批量生成好。别想了，你就是 prompt 工程师。
- **🖼️ 图生图文**：丢一张产品实拍图进来，AI当场解构卖点、编好营销话术，再甩你几张直接能发的风格化配图。别P了，让AI卷。
- **✨ 提示词生图**：支持批量生成，主题输入或直接提示词，13种风格模板任选，一次生成多张图片。

我们负责自动化，你负责发。  
流量不该用命换，效率才是正经事。

## 核心价值

- **降低创作门槛**：无需专业设计技能，通过简单操作即可生成高质量图文
- **提高创作效率**：将传统图文创作流程自动化，大幅节省时间和精力
- **提升内容质量**：利用AI生成符合小红书平台风格的爆款内容
- **多种创作模式**：支持文生图+文、图生图文、提示词生图，满足不同创作需求

## 功能特性

### 📝 文本生成图文模式

- **智能大纲生成**：输入主题，AI自动生成小红书风格图文大纲
- **多页面支持**：支持6-12张图片的完整图文创作，或单张头图模式
- **风格定制**：13种专业风格可选（小红书爆款、海报2K、INS极简、科技未来等）
- **配图建议**：每页自动生成配图建议和视觉元数据
- **批量生图**：一键批量生成所有页面图片
- **完整下载**：支持下载完整内容（文字Markdown + 所有图片）

### 🖼️ 图生图文模式

- **单张/批量处理**：支持单张图片处理或批量上传多张图片
- **AI智能分析**：自动分析产品特征（颜色、材质、类别、卖点等）
- **智能配置推荐**：AI自动推荐最适合的风格、语气和文案风格
- **营销文案生成**：根据产品特征生成符合小红书风格的营销文案
- **风格化图片生成**：将产品图转换为13种不同风格的营销图片
- **实时进度显示**：清晰展示分析、文案生成、图片生成各阶段进度

### ✨ 提示词生成图片模式

- **批量生成**：支持一次输入多个主题或提示词，批量生成图片
- **双输入模式**：支持主题输入（自动生成提示词）或直接提示词输入
- **风格模板**：13种专业风格模板，每个模板包含详细的提示词配置
- **成本控制**：限制批量生成数量，确保成本可控
- **进度追踪**：实时显示生成进度和完成状态

### 📚 其他功能

- **历史记录**：自动保存所有创作历史，支持查看详情和重新编辑
- **案例演示**：内置案例库，展示不同风格和场景的应用示例
- **风格示例**：13种风格的可视化示例，帮助选择合适风格
- **系统设置**：灵活的API配置，支持DeepSeek和Google GenAI
- **本地存储**：所有数据本地存储，保护隐私安全

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **AI服务**:
  - **文本生成**: DeepSeek API（支持自定义端点和模型）
  - **图片生成**: Google GenAI API（Gemini 2.5 Flash Image）
  - **图片分析**: Google GenAI API（Gemini 2.5 Flash）

## 项目结构

```
V2.2.1/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── css/            # 样式文件
│   │   └── style-examples/ # 风格示例图片
│   ├── components/          # 组件
│   │   ├── ui/             # UI组件库（Button、Card、Modal等）
│   │   ├── layout/         # 布局组件（PageContainer、PageHeader）
│   │   └── common/         # 通用组件（Loading、ErrorBoundary等）
│   ├── composables/        # 组合式函数
│   │   ├── useApi.ts       # API调用封装
│   │   ├── useError.ts     # 错误处理
│   │   ├── useLogger.ts    # 日志管理
│   │   └── useToast.ts     # 提示消息
│   ├── config/             # 配置文件
│   │   ├── constants.ts    # 应用常量
│   │   ├── stylePrompts.ts # 风格提示词配置
│   │   └── promptTemplates.ts # 提示词模板
│   ├── router/             # 路由配置
│   ├── services/           # 服务层
│   │   ├── ai/             # AI服务模块
│   │   │   ├── deepseek.ts      # DeepSeek API服务
│   │   │   ├── google.ts        # Google GenAI API服务
│   │   │   ├── imageAnalysis.ts # 图片分析服务
│   │   │   ├── imageGeneration.ts # 图片生成服务
│   │   │   ├── marketingCopy.ts  # 营销文案生成
│   │   │   └── outline.ts        # 大纲生成服务
│   │   └── storage/        # 存储服务
│   │       ├── user.ts     # 用户管理
│   │       └── history.ts  # 历史记录
│   ├── stores/             # 状态管理（Pinia）
│   │   └── textGenerator.ts # 文本生成状态
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   │   ├── image.ts        # 图片处理
│   │   ├── string.ts       # 字符串处理
│   │   └── validation.ts   # 验证函数
│   ├── views/              # 页面视图
│   │   ├── HomeView.vue           # 首页（创作中心）
│   │   ├── OutlineView.vue        # 大纲编辑页
│   │   ├── GenerateView.vue       # 图片生成页
│   │   ├── ResultView.vue         # 结果展示页
│   │   ├── PromptGenerateView.vue  # 提示词生成页
│   │   ├── HistoryView.vue         # 历史记录页
│   │   └── SettingsView.vue        # 系统设置页
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── docker/                 # Docker配置文件
├── docs/                   # 文档目录
├── public/                 # 公共资源
├── Dockerfile.nginx        # Nginx部署文件
├── Dockerfile.node         # Node.js部署文件
├── docker-compose.yml      # Docker Compose配置
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

在浏览器中打开应用后，进入"系统设置"页面，配置以下API密钥：

- **DeepSeek API Key**: 用于文本生成（大纲、文案等）
  - 获取地址: https://platform.deepseek.com/
  - 配置项: `DEEPSEEK_API_KEY`
  - 支持自定义端点和模型

- **Google GenAI API Key**: 用于图片生成和分析
  - 获取地址: https://aistudio.google.com/app/apikey
  - 配置项: `GOOGLE_API_KEY`
  - 图片生成模型: `gemini-2.5-flash-image`
  - 文本分析模型: `gemini-2.5-flash`

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5175` 启动

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## 服务器部署

**📚 详细部署指南**: 请查看 [服务器部署文档](./docs/DEPLOYMENT.md)，包含以下部署方案：

- 🐳 **Docker 部署**（推荐，最简单）
- 🌐 **Nginx 直接部署**（性能最佳）
- 🟢 **Node.js + PM2 部署**（便于扩展）
- 🔒 **Nginx + HTTPS 部署**（生产环境推荐）

### 快速部署（Docker）

```bash
# 1. 上传项目到服务器
# 2. 进入项目目录
cd /opt/redflow-v2

# 3. 使用 Docker Compose 一键部署
docker-compose -f docker-compose.nginx.yml up -d --build

# 4. 访问应用
# http://your-server-ip:8080
```

⚠️ **重要提示**: 如果更新代码后部署的还是旧版本，必须使用 `--no-cache` 强制重新构建：

```bash
# 使用强制部署脚本（推荐）
chmod +x deploy-force.sh
./deploy-force.sh

# 或手动强制重新构建
docker-compose -f docker-compose.nginx.yml down
docker-compose -f docker-compose.nginx.yml build --no-cache
docker-compose -f docker-compose.nginx.yml up -d
```

### 快速部署脚本

```bash
# 使用部署脚本（自动构建并部署）
chmod +x deploy.sh
./deploy.sh docker    # Docker 部署

# 如果更新代码后还是旧版本，使用强制部署脚本
chmod +x deploy-force.sh
./deploy-force.sh     # 强制重新构建，不使用缓存

# 其他部署方式
./deploy.sh nginx     # Nginx 部署
./deploy.sh node      # Node.js 部署
```

> 💡 **提示**: 部署后，每个用户需要在浏览器中配置自己的 API 密钥。如需统一管理 API 密钥，请参考部署文档中的"后端 API 代理"方案。

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

## 支持的风格

红流云创 v2.3.9.2 支持以下13种专业风格：

1. **小红书爆款风格** - 清新、精致、有设计感
2. **海报风格（2K）** - 高分辨率海报风格
3. **INS 极简** - Instagram极简风格
4. **科技未来** - 科技感、未来感
5. **自然清新** - 自然、清新、舒适
6. **多巴胺风格** - 明亮、活泼、充满活力
7. **莫兰迪风格** - 低饱和度、高级感
8. **黑金风格** - 黑色与金色的经典搭配
9. **极简白** - 极简主义白色风格
10. **赛博朋克** - 赛博朋克美学
11. **复古怀旧** - 复古、怀旧风格
12. **克莱因蓝/瑞士主义** - 经典蓝色与瑞士设计
13. **德国博朗风** - Dieter Rams设计风格
14. **爱马仕橙 & 深空灰** - 高级配色方案

每种风格都包含详细的提示词配置，确保生成内容符合风格要求。

## API配置说明

### DeepSeek API

- **默认端点**: `https://api.deepseek.com/chat/completions`
- **默认模型**: `deepseek-chat`
- **支持自定义端点和模型**
- **用途**: 文本生成（大纲、文案、提示词等）

### Google GenAI API

- **获取地址**: https://aistudio.google.com/app/apikey
- **图片生成模型**: `gemini-2.5-flash-image`
- **文本分析模型**: `gemini-2.5-flash`
- **用途**: 图片生成、图片分析、产品特征提取

## 开发计划

- [x] 基础项目结构
- [x] 路由和布局
- [x] API服务集成（DeepSeek + Google）
- [x] 图生图功能（单张/批量）
- [x] 文本生成大纲功能
- [x] 提示词生成图片功能
- [x] 历史记录功能
- [x] 设置界面
- [x] 完善UI组件库
- [x] Docker部署支持
- [x] 单元测试框架
- [x] 一键下载功能（文字+图片）
- [x] 完成提示模态框
- [x] 案例演示功能
- [x] 风格示例展示
- [ ] 图片生成流程优化
- [ ] 深色模式支持
- [ ] 自动重试机制
- [ ] 风格一致性系统（V2.4规划）

## 注意事项

1. **API密钥安全**: 所有API密钥存储在浏览器本地存储中，不会上传到服务器
2. **存储限制**: 历史记录最多保存20条，超出会自动删除最旧的记录
3. **图片压缩**: 上传的图片会自动压缩以节省存储空间
4. **网络要求**: 需要能够访问DeepSeek和Google API服务
5. **成本控制**: 批量生成功能限制了最大数量，确保成本可控

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

### Q: 批量生成有限制吗？

A: 是的，为了控制成本，批量生成功能限制了最大数量。具体限制请参考界面提示。

### Q: 支持哪些图片格式？

A: 支持常见的图片格式（JPG、PNG、WebP等），上传的图片会自动压缩以节省存储空间。

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
- [服务器部署文档](./docs/DEPLOYMENT.md)
- [Docker部署文档](./docker/README.md)
- [问题反馈](https://github.com/your-username/redflow-v2/issues)

---

**红流云创** - 让AI替你上班，流量不该用命换，效率才是正经事。
