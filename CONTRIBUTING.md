# 贡献指南

感谢您对红流云创项目的关注！我们欢迎所有形式的贡献。

## 如何贡献

### 报告问题

如果您发现了bug或有功能建议，请通过以下方式提交：

1. 在GitHub上创建Issue
2. 使用Issue模板，提供详细的问题描述
3. 如果是bug，请提供复现步骤和环境信息

### 提交代码

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 代码规范

### TypeScript

- 使用TypeScript编写所有代码
- 遵循ESLint规则
- 使用有意义的变量和函数名
- 添加必要的类型注解

### Vue组件

- 使用Composition API
- 组件名使用PascalCase
- Props和Emits需要类型定义
- 使用scoped样式

### 提交信息

提交信息应清晰描述更改内容：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

示例：
```
feat: 添加图片上传功能
fix: 修复API调用超时问题
docs: 更新README部署说明
```

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/your-username/redflow-v2.git
cd redflow-v2
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 运行测试
```bash
npm test
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # Vue组件
│   ├── ui/         # UI组件库
│   └── layout/     # 布局组件
├── composables/     # 组合式函数
├── config/          # 配置文件
├── router/          # 路由配置
├── services/        # 服务层
├── stores/          # 状态管理
├── types/           # TypeScript类型
├── utils/           # 工具函数
└── views/           # 页面视图
```

## 测试

在提交PR之前，请确保：

- [ ] 所有测试通过
- [ ] 代码符合ESLint规则
- [ ] 添加了新功能的测试（如适用）
- [ ] 更新了相关文档

## 许可证

通过贡献代码，您同意您的贡献将在MIT许可证下发布。




