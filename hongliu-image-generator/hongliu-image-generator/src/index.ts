/**
 * 红流云创 - 图片生成模块
 * 
 * 提供图片生成的核心功能，包括API服务、工具函数、React Hooks等
 * 
 * @packageDocumentation
 */

// ==================== 核心API服务 ====================
export { default as ImageApiService } from './core/api/imageApi';
export type { ImageApiConfig } from './core/api/imageApi';

// ==================== 图片处理工具 ====================
export {
  fileToBase64,
  getMimeType,
  extractBase64FromMarkdown,
  downloadImage,
  validateImageSize,
  validateImageType,
  validateImage,
} from './core/utils/imageUtils';

// ==================== 风格预设配置 ====================
export {
  DEFAULT_STYLE_PRESETS,
  createStylePresets,
  getStylePreset,
  buildPrompt,
} from './core/config/stylePresets';
export type { StylePreset } from './core/config/stylePresets';

// ==================== React Hooks ====================
export { useImageGenerator } from './hooks/useImageGenerator';
export type {
  UseImageGeneratorOptions,
  UseImageGeneratorReturn,
} from './hooks/useImageGenerator';

// ==================== 类型定义 ====================
export type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  GeneratedImage,
  ImageGenerationParams,
} from './types';

