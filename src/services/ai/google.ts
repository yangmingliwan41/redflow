/**
 * Google GenAI API 服务
 */

import { TokenUsage } from '../../types'
import { logger } from '../../composables/useLogger'
import { errorHandler } from '../../composables/useError'
import { cleanAsciiString } from '../../utils'
import { useApi } from '../../composables/useApi'
import { STORAGE_KEYS, API_CONFIG } from '../../config/constants'

const { getApiKey: getApiKeyFromStorage } = useApi()

export interface GoogleGenAIOptions {
  model?: string
  temperature?: number
  responseFormat?: 'text' | 'image'
}

export interface GoogleGenAIResponse {
  choices?: Array<{
    message: {
      content?: string | Array<{
        type: string
        text?: string
        image_url?: { url: string }
        image?: string
        url?: string
        data?: string
      }>
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  image?: string
  data?: Array<{
    b64_json?: string
    url?: string
  }>
}

/**
 * 调用 Google GenAI API (OpenAI 兼容模式)
 */
export async function callGoogleGenAIAPI(
  prompt: string,
  images: Array<{ mimeType: string; data: string }> = [],
  options?: GoogleGenAIOptions
): Promise<{ text?: string; imageData?: string; usage: TokenUsage }> {
  const apiKey = getApiKeyFromStorage(STORAGE_KEYS.GOOGLE_API_KEY)
  if (!apiKey) {
    throw errorHandler.createError(
      'MISSING_API_KEY',
      'Google API Key not found. Please set GOOGLE_API_KEY in localStorage.'
    )
  }

  const endpoint = getApiKeyFromStorage(STORAGE_KEYS.GOOGLE_API_ENDPOINT) || API_CONFIG.DEFAULT_GOOGLE_ENDPOINT
  const model = options?.model || getApiKeyFromStorage(STORAGE_KEYS.GOOGLE_MODEL) || API_CONFIG.DEFAULT_GOOGLE_MODEL

  // 构建消息内容
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = []
  
  // 如果有图片，先添加图片
  if (images && images.length > 0) {
    for (const img of images) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:${img.mimeType};base64,${img.data}`
        }
      })
    }
  }
  
  // 添加文本
  content.push({
    type: 'text',
    text: prompt
  })

  const messages = [
    {
      role: 'user',
      content: content
    }
  ]

  // 使用 Headers 对象确保编码正确
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')
  
  // 确保 API Key 是纯 ASCII 字符串
  const cleanApiKey = cleanAsciiString(String(apiKey))
  if (!cleanApiKey) {
    throw errorHandler.createError('INVALID_API_KEY', 'API Key 为空或包含无效字符')
  }
  
  // 检查清理是否改变了 API Key
  const originalKeyStr = String(apiKey)
  if (originalKeyStr !== cleanApiKey) {
    logger.warn('API Key 在清理过程中被修改:', {
      originalLength: originalKeyStr.length,
      cleanedLength: cleanApiKey.length
    })
  }
  
  headers.set('Authorization', `Bearer ${cleanApiKey}`)

  const requestBody = {
    model,
    messages,
    stream: false,
    temperature: options?.temperature || 1.0
  }
  
  logger.debug('Google GenAI API 请求:', {
    endpoint,
    model,
    hasImages: images.length > 0,
    promptLength: prompt.length
  })
  
  const startTime = Date.now()
  
  try {
    // 图片分析请求可能需要更长时间，设置更长的超时
    // 文生图模式：120秒（避免60秒超时导致重复请求，节约成本）
    // 图生图模式：180秒（包含图片分析，需要更长时间）
    const timeoutMs = images && images.length > 0 ? 180000 : 120000 // 有图片时180秒，无图片时120秒
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const duration = Date.now() - startTime
    logger.debug('Google GenAI API 响应:', {
      status: response.status,
      duration: `${duration}ms`
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || errorData.message || response.statusText
      
      // 401 错误时提供更详细的调试信息
      if (response.status === 401) {
        logger.error('401 认证失败详情:', {
          endpoint,
          model,
          apiKeyLength: cleanApiKey.length,
          errorMessage
        })
      }
      
      throw errorHandler.handleApiError({
        response: {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        }
      })
    }

    const data: GoogleGenAIResponse = await response.json()
    
    // 调试：记录完整响应结构
    logger.debug('API 响应结构:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasImage: !!data.image,
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      responseKeys: Object.keys(data)
    })
    
    // 提取文本或图片
    let text: string | undefined
    let imageData: string | undefined
    
    const message = data.choices?.[0]?.message
    logger.debug('Message 内容:', {
      hasMessage: !!message,
      hasContent: !!message?.content,
      contentType: typeof message?.content,
      isArray: Array.isArray(message?.content),
      contentLength: typeof message?.content === 'string' ? message.content.length : message?.content?.length
    })
    
    if (message?.content) {
      // 检查是否是图片数据
      if (typeof message.content === 'string' && message.content.startsWith('data:image')) {
        imageData = message.content
        logger.debug('✅ 从 message.content (string data URL) 找到图片')
      } else if (Array.isArray(message.content)) {
        // 多模态内容
        logger.debug('多模态内容，项目数:', message.content.length)
        for (const item of message.content) {
          logger.debug('内容项:', { type: item.type, hasUrl: !!item.image_url?.url, hasImage: !!item.image })
          if (item.type === 'text') {
            text = item.text
          } else if (item.type === 'image_url') {
            imageData = item.image_url?.url
            if (imageData && !imageData.startsWith('http') && !imageData.startsWith('data:')) {
              // 尝试修复相对 URL
              imageData = `https://${imageData}`
              logger.debug('修复相对 URL:', imageData.substring(0, 50))
            }
            if (imageData) {
              logger.debug('✅ 从 message.content[].image_url 找到图片')
            }
          } else if (item.type === 'image') {
            imageData = item.image || item.url || item.data
            if (imageData) {
              logger.debug('✅ 从 message.content[].image 找到图片')
            }
          }
        }
      } else {
        text = message.content
      }
    }
    
    // 如果还没有找到图片，检查其他可能的字段
    if (!imageData && options?.responseFormat === 'image') {
      logger.debug('尝试从其他字段提取图片数据...')
      
      if (data.image) {
        imageData = data.image
        logger.debug('✅ 从 data.image 找到图片')
      } else if (data.data?.[0]?.b64_json) {
        // OpenAI Images API 格式
        imageData = `data:image/png;base64,${data.data[0].b64_json}`
        logger.debug('✅ 从 data.data[0].b64_json 找到图片')
      } else if (data.data?.[0]?.url) {
        imageData = data.data[0].url
        logger.debug('✅ 从 data.data[0].url 找到图片')
      }
      
      // 检查 choices[0].message.content 是否为 Markdown 图片链接
      if (!imageData && text) {
        const markdownImageMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/)
        if (markdownImageMatch) {
          imageData = markdownImageMatch[1]
          logger.debug('✅ 从 Markdown 图片链接找到:', imageData.substring(0, 50))
        }
      }
      
      // 检查是否为 data URL（可能在 text 中）
      if (!imageData && text && text.startsWith('data:image')) {
        imageData = text
        logger.debug('✅ 从 text (data URL) 找到图片')
      }
      
      // 检查是否为纯 URL
      if (!imageData && text && (text.startsWith('http://') || text.startsWith('https://'))) {
        imageData = text.trim()
        logger.debug('✅ 从 text (纯URL) 找到图片')
      }
      
      // 检查 text 中是否包含 base64 图片数据（可能被包装在其他文本中）
      if (!imageData && text) {
        const base64Match = text.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/)
        if (base64Match) {
          imageData = base64Match[0]
          logger.debug('✅ 从 text 中提取 base64 图片数据')
        }
      }
      
      // 检查整个响应中是否包含 base64 数据
      if (!imageData) {
        const responseStr = JSON.stringify(data)
        const base64Match = responseStr.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100,}/)
        if (base64Match) {
          imageData = base64Match[0]
          logger.debug('✅ 从完整响应中提取 base64 图片数据')
        }
      }
    }
    
    // 如果 imageData 是 URL，确保它是完整的 URL
    if (imageData && !imageData.startsWith('data:') && !imageData.startsWith('http://') && !imageData.startsWith('https://')) {
      if (imageData.startsWith('//')) {
        imageData = 'https:' + imageData
        logger.debug('修复相对URL，添加协议')
      } else if (imageData.startsWith('/')) {
        logger.warn('图片路径是相对路径，可能需要完整URL:', imageData.substring(0, 50))
      }
    }
    
    logger.debug('最终提取结果:', { 
      hasText: !!text, 
      hasImage: !!imageData,
      textPreview: text?.substring(0, 100),
      imagePreview: imageData?.substring(0, 100),
      imageType: imageData ? (imageData.startsWith('data:') ? 'Base64' : 'URL') : 'none',
      imageLength: imageData?.length || 0
    })
    
    // 如果请求的是图片但没有找到，提供更详细的错误信息
    if (options?.responseFormat === 'image' && !imageData) {
      logger.error('图片生成失败：未找到图片数据', {
        responseStructure: Object.keys(data),
        choicesContent: data.choices?.[0]?.message?.content
      })
      throw errorHandler.createError(
        'NO_IMAGE_DATA',
        'API 返回成功，但未在预期字段中找到图片数据。请检查 API 响应结构或联系管理员。'
      )
    }

    // 提取使用量
    const usage = data.usage || {}
    const tokenUsage: TokenUsage = {
      promptTokens: usage.prompt_tokens || 0,
      candidatesTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0
    }

    return {
      text,
      imageData,
      usage: tokenUsage
    }
  } catch (error: any) {
    // 检查是否是超时错误
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      const timeoutSeconds = images.length > 0 ? 180 : 120
      logger.error('API 请求超时:', {
        endpoint,
        hasImages: images.length > 0,
        timeout: `${timeoutSeconds}s`,
        actualDuration: Date.now() - startTime
      })
      throw errorHandler.createError(
        'REQUEST_TIMEOUT',
        `API 请求超时（${timeoutSeconds}秒）。${images.length > 0 ? '图片分析' : '图片生成'}可能需要更长时间，请检查：\n1. 网络连接是否稳定\n2. API 服务是否正常\n3. ${images.length > 0 ? '图片文件是否过大' : '提示词是否过于复杂'}\n\n建议：稍后重试${images.length > 0 ? '或减小图片大小' : ''}`
      )
    }
    
    // 如果是 headers 编码错误，提供更详细的提示
    if (error.message && error.message.includes('ISO-8859-1')) {
      logger.error('Headers encoding error:', {
        endpoint,
        apiKeyLength: cleanApiKey.length
      })
      throw errorHandler.createError(
        'INVALID_API_KEY',
        'API Key 包含无效字符。请检查 API Key 是否正确，确保没有复制到额外的空格或特殊字符。\n建议：重新复制 API Key 并粘贴到设置页面。'
      )
    }
    throw errorHandler.handleApiError(error)
  }
}

