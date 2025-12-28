import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ImageGenerationRequest, ImageGenerationResponse } from '../../types';

/**
 * API服务配置接口
 */
export interface ImageApiConfig {
  /** API基础URL */
  baseURL?: string;
  /** API密钥，会作为Authorization Bearer header发送 */
  apiKey?: string;
  /** 请求超时时间（毫秒），默认300000（5分钟） */
  timeout?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** API端点路径，默认使用Gemini预览模型 */
  endpoint?: string;
}

/**
 * 图片生成API服务类
 * 
 * @example
 * ```typescript
 * const apiService = new ImageApiService({
 *   baseURL: 'https://api.example.com',
 *   apiKey: 'your-api-key',
 *   timeout: 300000,
 * });
 * 
 * const response = await apiService.generateImage({
 *   contents: [{
 *     parts: [
 *       { inline_data: { mime_type: 'image/jpeg', data: 'base64...' } },
 *       { text: '生成装修效果图' }
 *     ]
 *   }]
 * });
 * ```
 */
export class ImageApiService {
  private client: AxiosInstance;
  private endpoint: string;

  constructor(config: ImageApiConfig) {
    // 使用 OpenAI 兼容格式的端点
    this.endpoint = config.endpoint || '/v1/chat/completions';
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 300000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        ...config.headers,
      },
    });

    // 响应拦截器：统一处理响应和错误
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        console.error('API 请求错误:', error);
        
        // 处理特定错误状态码
        if (error.response?.data && typeof error.response.data === 'object') {
          const data = error.response.data as { status?: number; msg?: string };
          if (data.status === 999) {
            throw new Error(data.msg || 'API请求失败');
          }
        }
        
        // 处理网络错误
        if (error.code === 'ECONNABORTED') {
          throw new Error('请求超时，请稍后重试');
        }
        
        // 处理其他错误
        const message = error.response?.data 
          ? (typeof error.response.data === 'string' 
              ? error.response.data 
              : (error.response.data as { message?: string })?.message || '请求失败')
          : error.message || '未知错误';
        
        return Promise.reject(new Error(message));
      }
    );
  }

  /**
   * 生成图片
   * 
   * @param request 图片生成请求参数
   * @returns 图片生成响应
   * @throws {Error} 当API请求失败时抛出错误
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.client.post<ImageGenerationResponse>(
        this.endpoint,
        request
      );
      return response;
    } catch (error) {
      // 错误已在拦截器中处理，这里直接重新抛出
      throw error;
    }
  }

  /**
   * 更新API配置
   * 
   * @param config 新的配置选项
   */
  updateConfig(config: Partial<ImageApiConfig>): void {
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
    if (config.apiKey) {
      this.client.defaults.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    if (config.headers) {
      Object.assign(this.client.defaults.headers, config.headers);
    }
    if (config.endpoint) {
      this.endpoint = config.endpoint;
    }
  }
}

export default ImageApiService;

