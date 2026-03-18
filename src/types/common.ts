/**
 * 通用类型定义
 */

export enum ProcessingStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_COPY = 'GENERATING_COPY',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export enum ProcessingMode {
  SINGLE = 'SINGLE',
  BATCH = 'BATCH',
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE', // 文本生成图文模式
  IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE', // 图生图模式
  PROMPT_TO_IMAGE = 'PROMPT_TO_IMAGE', // 提示词生成图片模式
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}


