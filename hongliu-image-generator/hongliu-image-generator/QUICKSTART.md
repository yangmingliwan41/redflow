# 快速开始指南

## 5分钟快速上手

### 步骤1: 安装依赖

```bash
cd hongliu-image-generator
npm install
```

### 步骤2: 构建模块（可选）

```bash
npm run build
```

### 步骤3: 在项目中使用

#### 方式A: 作为npm包

```bash
# 在红流项目中
npm install @hongliu/image-generator
```

#### 方式B: 作为本地包

在红流项目的 `package.json` 中添加：
```json
{
  "dependencies": {
    "@hongliu/image-generator": "file:../hongliu-image-generator"
  }
}
```

### 步骤4: 基础使用代码

```typescript
// 1. 导入模块
import { 
  ImageApiService, 
  useImageGenerator,
  buildPrompt 
} from '@hongliu/image-generator';

// 2. 创建API服务实例
const imageApi = new ImageApiService({
  baseURL: 'https://api.example.com',
  apiKey: 'your-api-key',
});

// 3. 在React组件中使用
function MyComponent() {
  const { generate, isGenerating, generatedImages } = useImageGenerator({
    apiService: imageApi,
  });

  const handleGenerate = async () => {
    const file = // 获取用户上传的文件
    const prompt = buildPrompt('生成装修效果图', 'modern-minimalist');
    
    await generate({
      referenceImage: file,
      prompt,
      batchCount: 1,
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? '生成中...' : '生成图片'}
      </button>
      {generatedImages.map(img => (
        <img key={img.id} src={img.url} alt="生成的图片" />
      ))}
    </div>
  );
}
```

## 核心概念

### 1. API服务（ImageApiService）

负责与后端API通信，处理HTTP请求和错误。

```typescript
const api = new ImageApiService({
  baseURL: 'https://api.example.com',
  apiKey: 'your-key',
  timeout: 300000,
});
```

### 2. React Hook（useImageGenerator）

封装图片生成的业务逻辑和状态管理。

```typescript
const { generate, isGenerating, generatedImages } = useImageGenerator({
  apiService: api,
  onSuccess: (images) => console.log('成功', images),
  onError: (error) => console.error('失败', error),
});
```

### 3. 工具函数

提供图片处理、验证、下载等功能。

```typescript
import { fileToBase64, validateImage, downloadImage } from '@hongliu/image-generator';

// 验证图片
const result = validateImage(file, 20);
if (!result.valid) {
  alert(result.error);
}

// 转换为Base64
const base64 = await fileToBase64(file);

// 下载图片
downloadImage(imageUrl, '效果图.png');
```

### 4. 风格预设

提供预定义的装修风格和提示词构建功能。

```typescript
import { buildPrompt, DEFAULT_STYLE_PRESETS } from '@hongliu/image-generator';

// 使用默认风格
const prompt = buildPrompt('基础提示', 'modern-minimalist');

// 查看所有风格
DEFAULT_STYLE_PRESETS.forEach(style => {
  console.log(style.value, style.label);
});
```

## 常见使用场景

### 场景1: 简单生成

```typescript
const { generate } = useImageGenerator({ apiService: imageApi });

await generate({
  referenceImage: file,
  prompt: '生成装修效果图',
});
```

### 场景2: 批量生成

```typescript
await generate({
  referenceImage: file,
  prompt: '生成装修效果图',
  batchCount: 3, // 生成3张
});
```

### 场景3: 自定义风格

```typescript
import { buildPrompt, createStylePresets } from '@hongliu/image-generator';

// 创建自定义风格
const customStyles = createStylePresets([
  { value: 'my-style', label: '我的风格', prompt: '...' }
]);

// 使用自定义风格
const prompt = buildPrompt('基础', 'my-style', '额外需求', 110, 100, 100, customStyles);
```

### 场景4: 错误处理

```typescript
const { generate } = useImageGenerator({
  apiService: imageApi,
  onError: (error) => {
    // 统一错误处理
    toast.error(error.message);
  },
  onItemError: (error, index) => {
    // 单个图片生成失败
    console.error(`第${index + 1}张失败:`, error);
  },
});
```

## 下一步

- 📖 查看 [README.md](./README.md) 了解完整API文档
- 🔧 查看 [INTEGRATION.md](./INTEGRATION.md) 了解集成指南
- 📁 查看 [examples/](./examples/) 目录了解使用示例
- 🏗️ 查看 [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md) 了解模块结构

## 需要帮助？

- 查看代码示例: `examples/basic-usage.tsx`
- 查看高级用法: `examples/advanced-usage.ts`
- 查看类型定义: `src/types/index.ts`

