/**
 * 图片生成 API 适配服务
 * 将 @hongliu/image-generator 模块的 ImageApiService 适配到 redflow 项目
 */

// 直接从子模块导入，避免加载 React Hook
import ImageApiService from '@hongliu/image-generator/src/core/api/imageApi'
import type { ImageApiConfig } from '@hongliu/image-generator/src/core/api/imageApi'
import { logger } from '../../composables/useLogger'
import { errorHandler } from '../../composables/useError'
import { useApi } from '../../composables/useApi'
import { STORAGE_KEYS, API_CONFIG } from '../../config/constants'
import type { TokenUsage } from '../../types'

const { getApiKey: getApiKeyFromStorage } = useApi()

/**
 * 创建并配置 ImageApiService 实例
 */
export function createImageApiService(): ImageApiService {
  // 图片生成 API 使用独立的配置
  // 优先使用环境变量，否则使用 Google API 的配置
  const imageApiBaseURL = import.meta.env.VITE_IMAGE_API_BASE_URL
  const imageApiKey = import.meta.env.VITE_IMAGE_API_KEY
  
  // 如果没有环境变量，使用 Google API 的配置作为后备
  const googleApiKey = getApiKeyFromStorage(STORAGE_KEYS.GOOGLE_API_KEY)
  const googleEndpoint = getApiKeyFromStorage(STORAGE_KEYS.GOOGLE_API_ENDPOINT) || API_CONFIG.DEFAULT_GOOGLE_ENDPOINT
  
  const apiKey = imageApiKey || googleApiKey
  const baseURL = imageApiBaseURL || (() => {
    // 从 Google endpoint 中提取 baseURL
    try {
      const url = new URL(googleEndpoint)
      return `${url.protocol}//${url.host}`
    } catch (e) {
      // 如果无法解析，使用默认值
      return 'https://api.laozhang.ai'
    }
  })()
  
  if (!apiKey) {
    throw errorHandler.createError(
      'MISSING_API_KEY',
      'API Key not found. Please set VITE_IMAGE_API_KEY or GOOGLE_API_KEY in localStorage.'
    )
  }

  // 图片生成 API 的端点路径（OpenAI 兼容格式）
  const apiEndpoint = '/v1/chat/completions'

  const config: ImageApiConfig = {
    baseURL,
    apiKey,
    timeout: API_CONFIG.IMAGE_GENERATION_TIMEOUT || 300000,
    endpoint: apiEndpoint
  }

  logger.debug('创建 ImageApiService 实例', {
    baseURL: config.baseURL,
    hasApiKey: !!config.apiKey,
    timeout: config.timeout,
    endpoint: config.endpoint
  })

  return new ImageApiService(config)
}

/**
 * 使用 ImageApiService 生成图片
 * @param referenceImage 参考图片文件
 * @param prompt 提示词
 * @returns 生成的图片 URL 和使用量
 */
export async function generateImageWithAdapter(
  referenceImage: File,
  prompt: string
): Promise<{ imageUrl: string; usage: TokenUsage }> {
  const apiService = createImageApiService()
  
  // 直接从子模块导入工具函数，避免加载 React Hook
  const { fileToBase64, getMimeType, extractBase64FromMarkdown } = await import('@hongliu/image-generator/src/core/utils/imageUtils')
  
  try {
    // 转换图片为 Base64
    const base64Data = await fileToBase64(referenceImage)
    const mimeType = getMimeType(referenceImage)
    
    logger.debug('开始生成图片', {
      promptLength: prompt.length,
      imageSize: referenceImage.size,
      mimeType
    })
    
    // 构建请求（OpenAI 兼容格式）
    // 将 base64 图片转换为 data URL
    const imageDataUrl = `data:${mimeType};base64,${base64Data}`
    
    const request = {
      model: 'gemini-2.5-flash-image', // 使用图片编辑模型
      messages: [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: prompt
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      stream: false
    }
    
    // 调用 API
    const response = await apiService.generateImage(request)
    
    logger.debug('API 响应', {
      hasResponse: !!response,
      hasChoices: !!response?.choices,
      choicesLength: response?.choices?.length
    })
    
    // 检查响应结构（OpenAI 兼容格式）
    if (!response.choices || response.choices.length === 0) {
      logger.error('图片生成失败：API 返回无选择项', {
        response
      })
      throw errorHandler.createError(
        'IMAGE_GENERATION_FAILED',
        'API 返回成功，但未包含任何选择项'
      )
    }
    
    // 提取图片数据
    let imageUrl: string | null = null
    
    // 检查 choices 结构（OpenAI 兼容格式）
    const firstChoice = response.choices?.[0]
    const messageContent = firstChoice?.message?.content
    
    // 从响应中提取图片 URL（OpenAI 兼容格式）
    // content 可能是数组或字符串，需要处理两种情况
    let contentArray: Array<{ type?: string; image_url?: { url: string }; text?: string }> = []
    let markdownText: string | null = null
    
    // 处理 content 可能是数组或字符串的情况
    if (Array.isArray(messageContent)) {
      contentArray = messageContent
    } else if (typeof messageContent === 'string') {
      // 如果 content 是字符串，可能是 markdown 文本
      markdownText = messageContent
    } else if (messageContent && typeof messageContent === 'object') {
      // 如果 content 是单个对象，转换为数组
      contentArray = [messageContent]
    }
    
    // 查找 image_url 类型的内容
    for (const contentItem of contentArray) {
      if (contentItem.type === 'image_url' && contentItem.image_url?.url) {
        imageUrl = contentItem.image_url.url
        break
      } else if (contentItem.type === 'text' && contentItem.text) {
        markdownText = contentItem.text
      }
    }
    
    // 如果还没有找到图片，尝试从 markdown 文本中提取
    if (!imageUrl && markdownText) {
      logger.debug('找到 markdown 文本，尝试提取图片', {
        textLength: markdownText.length,
        textPreview: markdownText.substring(0, 100)
      })
      
      // 使用模块提供的函数从 markdown 中提取图片
      imageUrl = extractBase64FromMarkdown(markdownText)
      
      // 如果提取失败，尝试直接使用（可能是 data URL）
      if (!imageUrl && markdownText.startsWith('data:image')) {
        imageUrl = markdownText
        logger.debug('直接使用 data URL 格式的图片')
      }
      
      // 如果还是没找到，尝试从文本中提取 base64 数据
      if (!imageUrl) {
        const base64Match = markdownText.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/)
        if (base64Match) {
          imageUrl = base64Match[0]
          logger.debug('从文本中提取到 base64 图片数据')
        }
      }
    }
    
    if (!imageUrl) {
      logger.warn('响应中未找到图片数据', {
        responseKeys: Object.keys(response || {}),
        choices: response?.choices
      })
    }
    
    if (!imageUrl) {
      logger.error('图片生成失败：未找到图片数据', {
        response,
        hasCandidates: !!response?.candidates,
        candidatesLength: response?.candidates?.length,
        firstCandidate: response?.candidates?.[0]
      })
      throw errorHandler.createError(
        'NO_IMAGE_DATA',
        'API 返回成功，但未在响应中找到图片数据。请检查 API 配置或联系管理员。'
      )
    }
    
    // 构建使用量（从 OpenAI 兼容格式的响应中提取）
    const usage: TokenUsage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      candidatesTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
    
    logger.debug('图片生成成功', {
      hasImageUrl: !!imageUrl,
      imageUrlLength: imageUrl?.length || 0
    })
    
    return {
      imageUrl,
      usage
    }
  } catch (error: any) {
    logger.error('图片生成失败', error)
    throw errorHandler.handleApiError(error)
  }
}

/**
 * 更新 ImageApiService 配置
 */
export function updateImageApiConfig(config: Partial<ImageApiConfig>): void {
  // 这个函数可以用于动态更新配置
  // 如果需要全局实例，可以在这里管理
  logger.debug('更新 ImageApiService 配置', config)
}

