/**
 * 高级使用示例
 * 
 * 展示如何使用模块的高级功能，包括自定义配置、错误处理等
 */

import {
  ImageApiService,
  createStylePresets,
  buildPrompt,
  fileToBase64,
  getMimeType,
} from '../src';

// ==================== 示例1: 自定义API配置 ====================

// 创建自定义配置的API服务
const customApiService = new ImageApiService({
  baseURL: 'https://api.example.com',
  apiKey: 'your-custom-api-key',
  timeout: 600000, // 10分钟超时
  headers: {
    'X-Custom-Header': 'custom-value',
  },
  endpoint: '/custom/endpoint',
});

// 动态更新配置
customApiService.updateConfig({
  apiKey: 'new-api-key',
  timeout: 300000,
});

// ==================== 示例2: 自定义风格预设 ====================

// 创建包含自定义风格的预设列表
const customStyles = createStylePresets([
  {
    value: 'custom-style-1',
    label: '自定义风格1',
    prompt: '这是一个自定义风格的描述',
  },
  {
    value: 'custom-style-2',
    label: '自定义风格2',
    prompt: '这是另一个自定义风格的描述',
  },
]);

// 使用自定义预设构建提示词
const customPrompt = buildPrompt(
  '基础提示词',
  'custom-style-1',
  '额外的自定义需求',
  120, // 亮度
  110, // 对比度
  90,  // 饱和度
  customStyles
);

// ==================== 示例3: 直接使用API服务（非React环境） ====================

async function generateImageDirectly() {
  const apiService = new ImageApiService({
    baseURL: 'https://api.example.com',
    apiKey: 'your-api-key',
  });

  // 读取文件并转换为base64
  const file = // 获取文件对象
  const base64Data = await fileToBase64(file);
  const mimeType = getMimeType(file);

  try {
    // 直接调用API
    const response = await apiService.generateImage({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            {
              text: '生成装修效果图',
            },
          ],
        },
      ],
    });

    console.log('生成成功:', response);
  } catch (error) {
    console.error('生成失败:', error);
  }
}

// ==================== 示例4: 批量处理多个文件 ====================

async function batchProcessFiles(files: File[]) {
  const apiService = new ImageApiService({
    baseURL: 'https://api.example.com',
    apiKey: 'your-api-key',
  });

  const results = await Promise.allSettled(
    files.map(async (file) => {
      const base64Data = await fileToBase64(file);
      const mimeType = getMimeType(file);

      return apiService.generateImage({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
              {
                text: '生成装修效果图',
              },
            ],
          },
        ],
      });
    })
  );

  // 处理结果
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`文件 ${index + 1} 生成成功:`, result.value);
    } else {
      console.error(`文件 ${index + 1} 生成失败:`, result.reason);
    }
  });
}

// ==================== 示例5: 错误处理和重试机制 ====================

async function generateWithRetry(
  apiService: ImageApiService,
  request: Parameters<ImageApiService['generateImage']>[0],
  maxRetries: number = 3
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiService.generateImage(request);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      console.warn(`第 ${attempt} 次尝试失败:`, lastError.message);

      if (attempt < maxRetries) {
        // 等待后重试（指数退避）
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('所有重试都失败了');
}

export {
  customApiService,
  customStyles,
  customPrompt,
  generateImageDirectly,
  batchProcessFiles,
  generateWithRetry,
};

