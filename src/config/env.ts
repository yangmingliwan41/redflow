/**
 * 环境变量配置管理
 */

import { STORAGE_KEYS, API_CONFIG } from './constants'

export interface EnvConfig {
  // API 配置
  deepseekApiKey?: string
  deepseekEndpoint?: string
  deepseekModel?: string
  googleApiKey?: string
  googleEndpoint?: string
  googleModel?: string
  zhipuApiKey?: string
  zhipuEndpoint?: string
  zhipuModel?: string
  
  // 功能开关
  mockMode?: boolean
  debugMode?: boolean
  imagePromptDebugMode?: boolean
  
  // 自定义配置
  customImagePrompt?: string
  
  // 企业微信通知配置
  wechatWorkWebhookUrl?: string
}

/**
 * 从 localStorage 加载环境配置
 */
export function loadEnvConfig(): EnvConfig {
  return {
    deepseekApiKey: localStorage.getItem(STORAGE_KEYS.DEEPSEEK_API_KEY) || undefined,
    deepseekEndpoint: localStorage.getItem('DEEPSEEK_API_ENDPOINT') || undefined,
    deepseekModel: localStorage.getItem('DEEPSEEK_MODEL') || undefined,
    googleApiKey: localStorage.getItem(STORAGE_KEYS.GOOGLE_API_KEY) || undefined,
    googleEndpoint: localStorage.getItem(STORAGE_KEYS.GOOGLE_API_ENDPOINT) || undefined,
    googleModel: localStorage.getItem(STORAGE_KEYS.GOOGLE_MODEL) || undefined,
    zhipuApiKey: localStorage.getItem(STORAGE_KEYS.ZHIPU_API_KEY) || undefined,
    zhipuEndpoint: localStorage.getItem(STORAGE_KEYS.ZHIPU_API_ENDPOINT) || undefined,
    zhipuModel: localStorage.getItem(STORAGE_KEYS.ZHIPU_MODEL) || undefined,
    mockMode: localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true',
    debugMode: localStorage.getItem(STORAGE_KEYS.PROMPT_DEBUG_MODE) === 'true',
    imagePromptDebugMode: localStorage.getItem(STORAGE_KEYS.IMAGE_PROMPT_DEBUG_MODE) === 'true',
    customImagePrompt: localStorage.getItem(STORAGE_KEYS.CUSTOM_IMAGE_PROMPT) || undefined,
    wechatWorkWebhookUrl: localStorage.getItem('WECHAT_WORK_WEBHOOK_URL') || undefined
  }
}

/**
 * 保存环境配置到 localStorage
 */
export function saveEnvConfig(config: Partial<EnvConfig>): void {
  if (config.deepseekApiKey !== undefined) {
    if (config.deepseekApiKey) {
      localStorage.setItem(STORAGE_KEYS.DEEPSEEK_API_KEY, config.deepseekApiKey)
    } else {
      localStorage.removeItem(STORAGE_KEYS.DEEPSEEK_API_KEY)
    }
  }
  
  if (config.googleApiKey !== undefined) {
    if (config.googleApiKey) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_API_KEY, config.googleApiKey)
    } else {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_API_KEY)
    }
  }
  
  if (config.googleEndpoint !== undefined) {
    if (config.googleEndpoint) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_API_ENDPOINT, config.googleEndpoint)
    } else {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_API_ENDPOINT)
    }
  }
  
  if (config.googleModel !== undefined) {
    if (config.googleModel) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_MODEL, config.googleModel)
    } else {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_MODEL)
    }
  }
  
  if (config.zhipuApiKey !== undefined) {
    if (config.zhipuApiKey) {
      localStorage.setItem(STORAGE_KEYS.ZHIPU_API_KEY, config.zhipuApiKey)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ZHIPU_API_KEY)
    }
  }
  
  if (config.zhipuEndpoint !== undefined) {
    if (config.zhipuEndpoint) {
      localStorage.setItem(STORAGE_KEYS.ZHIPU_API_ENDPOINT, config.zhipuEndpoint)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ZHIPU_API_ENDPOINT)
    }
  }
  
  if (config.zhipuModel !== undefined) {
    if (config.zhipuModel) {
      localStorage.setItem(STORAGE_KEYS.ZHIPU_MODEL, config.zhipuModel)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ZHIPU_MODEL)
    }
  }
  
  if (config.mockMode !== undefined) {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, String(config.mockMode))
  }
  
  if (config.debugMode !== undefined) {
    localStorage.setItem(STORAGE_KEYS.PROMPT_DEBUG_MODE, String(config.debugMode))
  }
  
  if (config.imagePromptDebugMode !== undefined) {
    localStorage.setItem(STORAGE_KEYS.IMAGE_PROMPT_DEBUG_MODE, String(config.imagePromptDebugMode))
  }
  
  if (config.customImagePrompt !== undefined) {
    if (config.customImagePrompt) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGE_PROMPT, config.customImagePrompt)
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_IMAGE_PROMPT)
    }
  }
}

/**
 * 验证环境配置
 */
export function validateEnvConfig(config: EnvConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!config.mockMode) {
    if (!config.deepseekApiKey) {
      errors.push('缺少 DeepSeek API Key')
    }
    if (!config.googleApiKey) {
      errors.push('缺少 Google GenAI API Key')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}





