/**
 * 生成相关类型定义
 */

import { ProcessingStatus, ProcessingMode, TokenUsage } from './common'
import { ApiProvider } from './api'

export interface ProductAnalysis {
  name: string;
  category: string;
  features: string[];
  colors: string[];
  materials: string[];
  recommendation?: {
    tone: GenerationSettings['tone'];
    copyStyle: GenerationSettings['copyStyle'];
    imageStyle: GenerationSettings['imageStyle'];
  };
}

export interface GenerationSettings {
  tone: 'enthusiastic' | 'professional' | 'emotional' | 'minimalist';
  length: 'short' | 'medium' | 'long';
  style: 'xiaohongshu' | 'wechat' | 'instagram';
  copyStyle: 'storytelling' | 'sales_driven' | 'minimalist';
  imageStyle: 'ins_minimal' | 'dopamine' | 'luxury' | 'poster' | 'tech_future' | 'nature_fresh' | 'warm_home' | 'cream_ins' | 'furniture_size' | 'japanese_wood' | 'none';
  brightness: number;
  additionalContext: string;
  customPrompts: {
    enable: boolean;
    marketingCopyTemplate: string;
    imageGenerationTemplate: string;
  };
  textApiProvider?: ApiProvider;
  imageApiProvider?: ApiProvider;
  imageAnalysisProvider?: ApiProvider;
}

export interface GeneratedResult {
  id: string;
  originalImageFile?: File;
  originalImageUrl: string;
  analysis?: ProductAnalysis;
  marketingCopy?: string;
  generatedImageUrl?: string;
  previousGeneratedImageUrl?: string;
  status: ProcessingStatus;
  error?: string;
  createdAt?: number;
  userId?: string;
  tokenUsage?: TokenUsage;
  // 文本生成图文模式的数据
  topic?: string;
  outline?: string;
  pages?: Array<{
    index: number;
    title: string;
    content: string;
    imageUrl?: string;
    imagePrompt?: string;
  }>;
  // 项目信息
  projectName?: string;
  projectDescription?: string;
  // 创作模式标识
  mode?: ProcessingMode.TEXT_TO_IMAGE | ProcessingMode.IMAGE_TO_IMAGE | ProcessingMode.PROMPT_TO_IMAGE;
  // 提示词生成模式的数据
  promptTemplateId?: string; // 使用的模板ID
  promptTheme?: string; // 主题（如果使用模板生成）
  imagePrompt?: string; // 直接使用的图片提示词
}

// 选项配置
export const TONE_OPTIONS = [
  { value: 'enthusiastic', label: '热情种草' },
  { value: 'professional', label: '专业理性' },
  { value: 'emotional', label: '情感共鸣' },
  { value: 'minimalist', label: '简洁直接' },
] as const;

export const LENGTH_OPTIONS = [
  { value: 'short', label: '简短 (50-100字)' },
  { value: 'medium', label: '中等 (100-200字)' },
  { value: 'long', label: '详细 (200-300字)' },
] as const;

export const COPY_STYLE_OPTIONS = [
  { value: 'storytelling', label: '故事叙述' },
  { value: 'sales_driven', label: '销售导向' },
  { value: 'minimalist', label: '极简风格' },
] as const;

export const IMAGE_STYLE_OPTIONS = [
  { value: 'ins_minimal', label: 'INS极简风' },
  { value: 'dopamine', label: '多巴胺风格' },
  { value: 'luxury', label: '奢华风格' },
  { value: 'poster', label: '海报风格' },
  { value: 'tech_future', label: '科技未来风' },
  { value: 'nature_fresh', label: '自然清新风' },
  { value: 'warm_home', label: '温暖家居风' },
  { value: 'cream_ins', label: '奶油INS风' },
  { value: 'furniture_size', label: '家具尺寸图' },
  { value: 'japanese_wood', label: '日式原木风' },
  { value: 'none', label: '不生成图片' },
] as const;





