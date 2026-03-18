/**
 * API 相关类型定义
 */

export type ApiProvider = 'gemini' | 'deepseek' | 'google' | 'qwen';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}





