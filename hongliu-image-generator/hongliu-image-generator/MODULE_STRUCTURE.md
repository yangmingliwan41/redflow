# 模块结构说明

## 目录结构

```
hongliu-image-generator/
├── src/                          # 源代码目录
│   ├── index.ts                  # 主入口文件，导出所有公共API
│   ├── types/                    # 类型定义
│   │   └── index.ts              # 核心类型定义
│   ├── core/                     # 核心功能层（无UI依赖）
│   │   ├── api/                  # API服务层
│   │   │   ├── imageApi.ts       # 图片生成API服务类
│   │   │   └── types.ts          # API类型定义（重新导出）
│   │   ├── utils/                # 工具函数
│   │   │   └── imageUtils.ts     # 图片处理工具函数
│   │   └── config/               # 配置
│   │       └── stylePresets.ts   # 风格预设配置
│   └── hooks/                    # React Hooks
│       └── useImageGenerator.ts  # 图片生成Hook
├── examples/                     # 使用示例
│   ├── basic-usage.tsx           # 基础使用示例
│   └── advanced-usage.ts         # 高级使用示例
├── package.json                  # 包配置文件
├── tsconfig.json                 # TypeScript配置
├── README.md                     # 使用文档
├── INTEGRATION.md                # 集成指南
└── MODULE_STRUCTURE.md           # 本文件
```

## 模块分层设计

### 1. 核心层（core/）

**特点：**
- 无UI依赖
- 无React依赖
- 纯函数和类
- 可在任何JavaScript/TypeScript环境中使用

**包含：**

#### API服务层（core/api/）
- `ImageApiService`: 图片生成API服务类
  - 封装HTTP请求
  - 统一错误处理
  - 支持配置更新

#### 工具函数层（core/utils/）
- `fileToBase64`: 文件转Base64
- `getMimeType`: 获取MIME类型
- `extractBase64FromMarkdown`: 从Markdown提取图片
- `downloadImage`: 下载图片
- `validateImageSize`: 验证图片大小
- `validateImageType`: 验证图片类型
- `validateImage`: 综合验证

#### 配置层（core/config/）
- `DEFAULT_STYLE_PRESETS`: 默认风格预设
- `createStylePresets`: 创建自定义预设
- `getStylePreset`: 获取风格预设
- `buildPrompt`: 构建提示词

### 2. React层（hooks/）

**特点：**
- 依赖React
- 提供React Hook
- 封装业务逻辑
- 状态管理

**包含：**
- `useImageGenerator`: 图片生成Hook
  - 生成状态管理
  - 批量生成支持
  - 成功/失败回调
  - 图片列表管理

### 3. 类型层（types/）

**特点：**
- 完整的TypeScript类型定义
- 类型安全
- 良好的IDE支持

**包含：**
- `ImageGenerationRequest`: API请求类型
- `ImageGenerationResponse`: API响应类型
- `GeneratedImage`: 生成的图片类型
- `ImageGenerationParams`: 生成参数类型

## 模块导出结构

### 主入口（src/index.ts）

```typescript
// 核心API服务
export { ImageApiService } from './core/api/imageApi';
export type { ImageApiConfig } from './core/api/imageApi';

// 工具函数
export { fileToBase64, getMimeType, ... } from './core/utils/imageUtils';

// 风格配置
export { DEFAULT_STYLE_PRESETS, createStylePresets, ... } from './core/config/stylePresets';
export type { StylePreset } from './core/config/stylePresets';

// React Hooks
export { useImageGenerator } from './hooks/useImageGenerator';
export type { UseImageGeneratorOptions, ... } from './hooks/useImageGenerator';

// 类型定义
export type { ImageGenerationRequest, ... } from './types';
```

## 使用场景

### 场景1: 纯JavaScript/TypeScript项目

```typescript
import { ImageApiService, fileToBase64 } from '@hongliu/image-generator';

// 不依赖React，可直接使用
const api = new ImageApiService({ ... });
const base64 = await fileToBase64(file);
```

### 场景2: React项目

```typescript
import { useImageGenerator } from '@hongliu/image-generator';

// 使用React Hook
const { generate, isGenerating } = useImageGenerator({ ... });
```

### 场景3: 自定义UI组件

```typescript
import { 
  ImageApiService,
  buildPrompt,
  DEFAULT_STYLE_PRESETS 
} from '@hongliu/image-generator';

// 使用核心功能，自定义UI
function MyCustomComponent() {
  // 你的UI实现
}
```

## 依赖关系

```
用户代码
  ↓
index.ts (主入口)
  ↓
├── core/ (核心层，无外部依赖，除了axios)
│   ├── api/imageApi.ts → axios
│   ├── utils/imageUtils.ts (纯函数，无依赖)
│   └── config/stylePresets.ts (纯配置，无依赖)
  ↓
└── hooks/useImageGenerator.ts → React + core/
```

## 设计原则

1. **分层清晰**: 核心功能与UI完全分离
2. **最小依赖**: 只依赖必要的库（axios, react）
3. **类型安全**: 完整的TypeScript支持
4. **可扩展**: 支持自定义配置和扩展
5. **易测试**: 纯函数和独立模块便于测试

## 扩展点

### 1. 自定义API端点

```typescript
const api = new ImageApiService({
  endpoint: '/custom/endpoint',
  // ...
});
```

### 2. 自定义风格预设

```typescript
const presets = createStylePresets([
  { value: 'custom', label: '自定义', prompt: '...' }
]);
```

### 3. 自定义错误处理

```typescript
const { generate } = useImageGenerator({
  onError: (error) => {
    // 自定义错误处理
  },
});
```

## 与红流项目集成建议

1. **创建服务层**: 在红流项目中创建API服务实例
2. **创建自定义Hook**: 封装项目特定的业务逻辑
3. **使用UI组件**: 使用红流项目的UI组件库构建界面
4. **统一错误处理**: 在项目层面统一处理错误和通知

## 文件说明

| 文件 | 说明 | 依赖 |
|------|------|------|
| `core/api/imageApi.ts` | API服务类 | axios |
| `core/utils/imageUtils.ts` | 工具函数 | 无 |
| `core/config/stylePresets.ts` | 风格配置 | 无 |
| `hooks/useImageGenerator.ts` | React Hook | React, core/ |
| `types/index.ts` | 类型定义 | 无 |
| `index.ts` | 主入口 | 所有模块 |

