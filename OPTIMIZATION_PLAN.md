# V2 代码结构优化方案

## 当前问题分析

1. **工具函数分散**：`compressImage`、`cleanAsciiString` 等工具函数散落在各个服务文件中
2. **缺少 composables**：没有提取可复用的组合式函数
3. **类型定义集中**：所有类型定义在一个文件中，不利于维护
4. **日志系统不统一**：大量 `console.log` 分散在各处，缺少统一的日志管理
5. **错误处理不统一**：错误处理逻辑分散，缺少统一的错误处理机制
6. **缺少环境配置管理**：API 配置直接使用 localStorage，缺少统一管理
7. **服务层职责不清**：`ai.ts` 文件过大（1000+ 行），职责过多

## 优化方案

### 1. 目录结构优化

```
src/
├── api/              # API 客户端（统一封装）
│   ├── client.ts     # HTTP 客户端封装
│   └── endpoints.ts  # API 端点定义
├── assets/           # 静态资源
├── components/       # 组件
├── composables/      # 组合式函数（新增）
│   ├── useApi.ts     # API 调用相关
│   ├── useStorage.ts # 存储相关
│   ├── useError.ts   # 错误处理
│   └── useLogger.ts  # 日志管理
├── config/           # 配置管理（新增）
│   ├── env.ts        # 环境变量
│   └── constants.ts  # 常量定义
├── router/           # 路由
├── services/         # 业务服务层
│   ├── ai/           # AI 服务（拆分）
│   │   ├── deepseek.ts
│   │   ├── google.ts
│   │   └── index.ts
│   ├── storage/      # 存储服务（拆分）
│   │   ├── user.ts
│   │   ├── history.ts
│   │   └── index.ts
│   └── image/        # 图片处理服务（新增）
│       └── compressor.ts
├── stores/           # 状态管理
├── types/            # 类型定义（拆分）
│   ├── api.ts        # API 相关类型
│   ├── user.ts       # 用户相关类型
│   ├── generation.ts # 生成相关类型
│   └── index.ts      # 导出所有类型
├── utils/            # 工具函数（新增）
│   ├── string.ts     # 字符串处理
│   ├── validation.ts # 验证函数
│   ├── debounce.ts   # 防抖节流
│   └── index.ts      # 导出所有工具
└── views/            # 页面视图
```

### 2. 代码质量提升

- **统一错误处理**：创建错误处理中间件
- **统一日志系统**：创建日志工具，支持不同级别
- **类型安全**：完善类型定义，减少 `any` 使用
- **代码复用**：提取公共逻辑到 composables
- **性能优化**：添加防抖、节流、懒加载

### 3. 实施步骤

1. ✅ 创建 utils 目录和工具函数
2. ✅ 创建 composables 目录和组合式函数
3. ✅ 拆分类型定义文件
4. ✅ 创建统一的错误处理和日志系统
5. ✅ 重构服务层代码
6. ✅ 优化组件结构





