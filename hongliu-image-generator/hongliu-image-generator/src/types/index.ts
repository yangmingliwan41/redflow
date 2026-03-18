/**
 * 图片生成模块类型定义
 * 支持 OpenAI 兼容格式（用于 laozhang.ai API）
 */

// OpenAI 兼容格式的请求
export interface ImageGenerationRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  stream?: boolean;
  temperature?: number;
}

// OpenAI 兼容格式的响应
export interface ImageGenerationResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: Array<{
        type: string;
        image_url?: {
          url: string;
        };
        text?: string;
      }>;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ImageGenerationParams {
  referenceImage: File;
  prompt: string;
  batchCount?: number;
}

