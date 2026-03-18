# 集成指南

本文档说明如何将 `@hongliu/image-generator` 模块集成到红流云创项目中。

## 目录结构

```
hongliu-image-generator/
├── src/
│   ├── index.ts                 # 主入口文件
│   ├── core/                    # 核心功能层
│   │   ├── api/                 # API服务
│   │   ├── utils/               # 工具函数
│   │   └── config/              # 配置
│   ├── hooks/                   # React Hooks
│   └── types/                   # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

## 集成方式

### 方式一：作为npm包（推荐）

1. **发布到npm或私有仓库**
   ```bash
   cd hongliu-image-generator
   npm publish
   ```

2. **在红流项目中安装**
   ```bash
   npm install @hongliu/image-generator
   ```

3. **在代码中使用**
   ```typescript
   import { ImageApiService, useImageGenerator } from '@hongliu/image-generator';
   ```

### 方式二：作为本地包（开发阶段）

1. **在红流项目中添加本地依赖**
   
   在红流项目的 `package.json` 中添加：
   ```json
   {
     "dependencies": {
       "@hongliu/image-generator": "file:../hongliu-image-generator"
     }
   }
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **使用方式同上**

### 方式三：直接复制源码（简单快速）

1. **复制模块到红流项目**
   ```
   红流项目/
   ├── src/
   │   └── modules/
   │       └── image-generator/    # 复制整个模块
   ```

2. **配置路径别名**
   
   在 `tsconfig.json` 或 `vite.config.ts` 中：
   ```typescript
   // vite.config.ts
   export default {
     resolve: {
       alias: {
         '@hongliu/image-generator': path.resolve(__dirname, 'src/modules/image-generator/src'),
       },
     },
   };
   ```

3. **使用**
   ```typescript
   import { ImageApiService } from '@hongliu/image-generator';
   ```

## 在红流项目中的使用示例

### 1. 创建API服务实例

```typescript
// src/services/imageApi.ts
import { ImageApiService } from '@hongliu/image-generator';

export const imageApi = new ImageApiService({
  baseURL: process.env.VITE_IMAGE_API_BASE_URL || 'https://api.example.com',
  apiKey: process.env.VITE_IMAGE_API_KEY,
  timeout: 300000,
});
```

### 2. 创建自定义Hook（可选）

```typescript
// src/hooks/useImageGeneration.ts
import { useImageGenerator } from '@hongliu/image-generator';
import { imageApi } from '@/services/imageApi';
import { toast } from 'sonner'; // 使用你的通知库

export function useImageGeneration() {
  return useImageGenerator({
    apiService: imageApi,
    onSuccess: (images) => {
      toast.success(`成功生成 ${images.length} 张图片`);
    },
    onError: (error) => {
      toast.error(`生成失败: ${error.message}`);
    },
  });
}
```

### 3. 在组件中使用

```typescript
// src/pages/ImageGenerationPage.tsx
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { buildPrompt, DEFAULT_STYLE_PRESETS } from '@hongliu/image-generator';

export function ImageGenerationPage() {
  const { generate, isGenerating, generatedImages } = useImageGeneration();
  const [selectedStyle, setSelectedStyle] = useState('none');

  const handleGenerate = async () => {
    const file = // 获取文件
    const prompt = buildPrompt(
      '根据参考图片生成效果图',
      selectedStyle
    );
    
    await generate({
      referenceImage: file,
      prompt,
      batchCount: 1,
    });
  };

  return (
    // 你的UI组件
  );
}
```

## 环境变量配置

在红流项目中创建 `.env` 文件：

```env
VITE_IMAGE_API_BASE_URL=https://api-integrations.appmiaoda.com/app-7ybw0mgoymtd/api-Xa6JZ58oPMEa
VITE_IMAGE_API_KEY=your-api-key-here
```

## 与红流项目的UI组件集成

模块本身不包含UI组件，你可以使用红流项目现有的UI组件库：

```typescript
import { Button, Card, Select } from '@/components/ui'; // 你的UI组件库
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { DEFAULT_STYLE_PRESETS } from '@hongliu/image-generator';

function ImageGenerator() {
  const { generate, isGenerating, generatedImages } = useImageGeneration();
  
  return (
    <Card>
      <Select>
        {DEFAULT_STYLE_PRESETS.map(style => (
          <option key={style.value} value={style.value}>
            {style.label}
          </option>
        ))}
      </Select>
      <Button onClick={handleGenerate} disabled={isGenerating}>
        生成图片
      </Button>
    </Card>
  );
}
```

## 注意事项

1. **依赖管理**：确保红流项目已安装 `axios` 和 `react`（作为peerDependencies）

2. **类型支持**：模块提供完整的TypeScript类型定义，确保你的项目启用了TypeScript

3. **错误处理**：建议在项目层面统一处理错误，可以使用 `onError` 回调

4. **性能优化**：批量生成时注意控制并发数量，避免过多同时请求

5. **API配置**：根据实际环境配置API端点，建议使用环境变量

## 常见问题

### Q: 如何自定义风格预设？

A: 使用 `createStylePresets` 函数：
```typescript
import { createStylePresets } from '@hongliu/image-generator';

const customPresets = createStylePresets([
  { value: 'custom', label: '自定义', prompt: '...' }
]);
```

### Q: 如何在非React环境中使用？

A: 直接使用 `ImageApiService` 类，不依赖React：
```typescript
import { ImageApiService, fileToBase64 } from '@hongliu/image-generator';

const api = new ImageApiService({ ... });
const base64 = await fileToBase64(file);
const response = await api.generateImage({ ... });
```

### Q: 如何处理API错误？

A: API服务会自动处理常见错误，你也可以在调用时使用try-catch：
```typescript
try {
  await generate({ ... });
} catch (error) {
  // 处理错误
}
```

## 下一步

- 查看 [README.md](./README.md) 了解完整API文档
- 查看 [examples/](./examples/) 目录了解使用示例
- 根据红流项目的具体需求进行定制化开发

