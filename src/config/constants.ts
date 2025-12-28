/**
 * 应用常量定义
 */

// Storage Keys
export const STORAGE_KEYS = {
  USERS: 'redflow_users',
  CURRENT_USER: 'redflow_current_user',
  HISTORY_PREFIX: 'redflow_history_',
  TEXT_GENERATOR_STATE: 'text-generator-state',
  DEEPSEEK_API_KEY: 'DEEPSEEK_API_KEY',
  GOOGLE_API_KEY: 'GOOGLE_API_KEY',
  GOOGLE_API_ENDPOINT: 'GOOGLE_API_ENDPOINT',
  GOOGLE_MODEL: 'GOOGLE_MODEL',
  ZHIPU_API_KEY: 'ZHIPU_API_KEY',
  ZHIPU_API_ENDPOINT: 'ZHIPU_API_ENDPOINT',
  ZHIPU_MODEL: 'ZHIPU_MODEL',
  MOCK_MODE: 'MOCK_MODE',
  CUSTOM_IMAGE_PROMPT: 'CUSTOM_IMAGE_PROMPT',
  IMAGE_PROMPT_DEBUG_MODE: 'IMAGE_PROMPT_DEBUG_MODE',
  PROMPT_DEBUG_MODE: 'PROMPT_DEBUG_MODE',
  STYLE_PROMPTS_CONFIG: 'STYLE_PROMPTS_CONFIG',
  TEXT_STYLE: 'TEXT_STYLE',
  TEXT_IMAGE_COUNT: 'TEXT_IMAGE_COUNT'
} as const

// API 配置
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 60000,
  IMAGE_GENERATION_TIMEOUT: 120000,
  DEFAULT_GOOGLE_ENDPOINT: 'https://api.laozhang.ai/v1/chat/completions',
  DEFAULT_GOOGLE_MODEL: 'gemini-3-pro-image-preview'
} as const

// 图片处理配置
export const IMAGE_CONFIG = {
  MAX_WIDTH: 800,
  QUALITY: 0.7,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
} as const

// 历史记录配置
export const HISTORY_CONFIG = {
  MAX_ITEMS: 20
} as const





