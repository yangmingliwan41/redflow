/**
 * 配置管理器
 * 统一管理应用配置，支持功能开关和用户设置
 */

import { STORAGE_KEYS } from './constants'
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from './featureFlags'
import { ApiProvider } from '../types'

export interface AppConfig {
  // API配置
  api: {
    deepseek: {
      endpoint: string
      model: string
    }
    google: {
      endpoint: string
      model: string
    }
  }
  
  // 功能开关
  features: FeatureFlags
  
  // 用户设置
  user: {
    defaultStyle: string
    autoSave: boolean
    reminderEnabled: boolean
    defaultApiProvider?: ApiProvider
  }
}

const DEFAULT_CONFIG: AppConfig = {
  api: {
    deepseek: {
      endpoint: 'https://api.deepseek.com',
      model: 'deepseek-chat'
    },
    google: {
      endpoint: 'https://api.laozhang.ai/v1/chat/completions',
      model: 'gemini-3-pro-image-preview'
    }
  },
  features: DEFAULT_FEATURE_FLAGS,
  user: {
    defaultStyle: 'xiaohongshu',
    autoSave: true,
    reminderEnabled: true
  }
}

const CONFIG_STORAGE_KEY = 'redflow_app_config'

export class ConfigManager {
  private config: AppConfig

  constructor() {
    this.config = this.loadConfig()
  }

  /**
   * 从localStorage加载配置
   */
  private loadConfig(): AppConfig {
    try {
      const configStr = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (configStr) {
        const savedConfig = JSON.parse(configStr)
        // 合并默认配置，确保新字段有默认值
        return {
          ...DEFAULT_CONFIG,
          ...savedConfig,
          features: {
            ...DEFAULT_CONFIG.features,
            ...(savedConfig.features || {})
          },
          user: {
            ...DEFAULT_CONFIG.user,
            ...(savedConfig.user || {})
          }
        }
      }
    } catch (e) {
      console.warn('加载配置失败，使用默认配置:', e)
    }
    return { ...DEFAULT_CONFIG }
  }

  /**
   * 保存配置到localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config))
    } catch (e) {
      console.error('保存配置失败:', e)
    }
  }

  /**
   * 获取配置项
   */
  get<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.config[key]
  }

  /**
   * 获取嵌套配置项
   */
  getNested<T>(path: string[]): T | undefined {
    let value: any = this.config
    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    return value as T
  }

  /**
   * 设置配置项
   */
  set<T extends keyof AppConfig>(key: T, value: AppConfig[T]): void {
    this.config[key] = value
    this.saveConfig()
  }

  /**
   * 设置嵌套配置项
   */
  setNested(path: string[], value: any): void {
    let target: any = this.config
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {}
      }
      target = target[key]
    }
    target[path[path.length - 1]] = value
    this.saveConfig()
  }

  /**
   * 重置配置为默认值
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG }
    this.saveConfig()
  }

  /**
   * 获取完整配置
   */
  getAll(): AppConfig {
    return { ...this.config }
  }

  /**
   * 检查功能是否启用
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.features[feature] ?? false
  }

  /**
   * 启用/禁用功能
   */
  setFeature(feature: keyof FeatureFlags, enabled: boolean): void {
    this.config.features[feature] = enabled
    this.saveConfig()
  }
}

// 创建全局配置管理器实例
export const configManager = new ConfigManager()


