# @hongliu/image-generator

红流云创图片生成模块 - 提供AI图片生成的核心功能

## 功能特性

- 🎨 **多种装修风格预设** - 支持现代简约、北欧、原木、轻奢等多种风格
- 🖼️ **图片处理工具** - 提供完整的图片格式转换、验证、下载等功能
- ⚡ **批量生成** - 支持一次生成多张效果图
- 🔧 **高度可配置** - API端点、认证信息等均可自定义配置
- 📦 **零依赖UI** - 核心功能不依赖任何UI框架，可灵活集成
- 🎣 **React Hooks** - 提供开箱即用的React Hook
- 📝 **TypeScript支持** - 完整的类型定义

## 安装

```bash
npm install @hongliu/image-generator
# 或
yarn add @hongliu/image-generator
# 或
pnpm add @hongliu/image-generator
```

## 快速开始

### 基础使用

```typescript
import { ImageApiService, useImageGenerator } from '@hongliu/image-generator';

// 1. 初始化API服务
const imageApi = new ImageApiService({
  baseURL: 'https://api.example.com',
  apiKey: 'your-api-key',
  timeout: 300000,
});

// 2. 在React组件中使用
function MyComponent() {
  const { generate, isGenerating, generatedImages } = useImageGenerator({
    apiService: imageApi,
    onSuccess: (images) => {
      console.log('生成成功:', images);
    },
    onError: (error) => {
      console.error('生成失败:', error);
    },
  });

  const handleGenerate = async () => {
    const file = // 获取用户上传的文件
    await generate({
      referenceImage: file,
      prompt: '根据参考图片生成家居装修效果图',
      batchCount: 2,
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? '生成中...' : '生成图片'}
      </button>
      {generatedImages.map((img) => (
        <img key={img.id} src={img.url} alt="生成的图片" />
      ))}
    </div>
  );
}
```

### 使用风格预设

```typescript
import { buildPrompt, DEFAULT_STYLE_PRESETS } from '@hongliu/image-generator';

// 构建包含风格描述的提示词
const prompt = buildPrompt(
  '根据参考图片生成家居装修效果图',
  'modern-minimalist', // 现代简约风格
  '增加绿植装饰', // 自定义需求
  110, // 亮度
  100, // 对比度
  100  // 饱和度
);
```

### 图片处理工具

```typescript
import {
  fileToBase64,
  validateImage,
  downloadImage,
  getMimeType,
} from '@hongliu/image-generator';

// 验证图片
const result = validateImage(file, 20); // 最大20MB
if (!result.valid) {
  console.error(result.error);
  return;
}

// 转换为Base64
const base64 = await fileToBase64(file);

// 获取MIME类型
const mimeType = getMimeType(file);

// 下载图片
downloadImage(imageUrl, '效果图.png');
```

## API文档

### ImageApiService

图片生成API服务类

#### 构造函数

```typescript
new ImageApiService(config: ImageApiConfig)
```

**配置选项：**

- `baseURL?: string` - API基础URL
- `apiKey?: string` - API密钥（作为X-App-Id header发送）
- `timeout?: number` - 请求超时时间（毫秒），默认300000
- `headers?: Record<string, string>` - 自定义请求头
- `endpoint?: string` - API端点路径

#### 方法

##### generateImage

生成图片

```typescript
generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>
```

### useImageGenerator

React Hook，提供图片生成功能

#### 参数

```typescript
interface UseImageGeneratorOptions {
  apiService: ImageApiService;
  onSuccess?: (images: GeneratedImage[]) => void;
  onError?: (error: Error) => void;
  onItemError?: (error: Error, index: number) => void;
}
```

#### 返回值

```typescript
interface UseImageGeneratorReturn {
  generate: (params: ImageGenerationParams) => Promise<void>;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  clearImages: () => void;
  removeImage: (imageId: string) => void;
}
```

### 工具函数

#### fileToBase64

将File对象转换为Base64字符串

```typescript
fileToBase64(file: File): Promise<string>
```

#### validateImage

验证图片文件（类型和大小）

```typescript
validateImage(file: File, maxSizeMB?: number): { valid: boolean; error?: string }
```

#### downloadImage

下载图片到本地

```typescript
downloadImage(dataUrl: string, filename: string): void
```

#### buildPrompt

构建完整的提示词

```typescript
buildPrompt(
  basePrompt?: string,
  styleValue?: string,
  customPrompt?: string,
  brightness?: number,
  contrast?: number,
  saturation?: number,
  presets?: StylePreset[]
): string
```

## 类型定义

```typescript
// 图片生成请求
interface ImageGenerationRequest {
  contents: {
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: 'image/png' | 'image/jpeg' | 'image/webp';
        data: string;
      };
    }>;
  }[];
}

// 生成的图片
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

// 风格预设
interface StylePreset {
  value: string;
  label: string;
  prompt?: string;
}
```

## 开发

```bash
# 安装依赖
npm install

# 类型检查
npm run type-check

# 构建
npm run build

# 开发模式（监听模式）
npm run dev
```

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！

