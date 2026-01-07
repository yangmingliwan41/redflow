/**
 * DeepSeek API 服务
 */

import { TokenUsage } from '../../types'
import { logger } from '../../composables/useLogger'
import { errorHandler } from '../../composables/useError'
import { cleanAsciiString } from '../../utils'
import { useApi } from '../../composables/useApi'
import { STORAGE_KEYS, API_CONFIG } from '../../config/constants'

const { getApiKey: getApiKeyFromStorage } = useApi()

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 调用 DeepSeek API
 * @param prompt 用户提示词
 * @param systemPrompt 系统提示词
 * @param options 可选参数（temperature, top_p等）
 */
export async function callDeepSeekAPI(
  prompt: string,
  systemPrompt?: string,
  options?: {
    temperature?: number
    top_p?: number
    max_tokens?: number
  }
): Promise<{ text: string; usage: TokenUsage }> {
  const apiKey = getApiKeyFromStorage(STORAGE_KEYS.DEEPSEEK_API_KEY)
  if (!apiKey) {
    throw errorHandler.createError(
      'MISSING_API_KEY',
      'DeepSeek API Key not found. Please set DEEPSEEK_API_KEY in localStorage.'
    )
  }

  const endpoint = getApiKeyFromStorage('DEEPSEEK_API_ENDPOINT') || 'https://api.deepseek.com/chat/completions'
  const model = getApiKeyFromStorage('DEEPSEEK_MODEL') || 'deepseek-chat'

  const messages: Array<{ role: string; content: string }> = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const headers = new Headers()
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${apiKey}`)

  try {
    logger.debug('DeepSeek API 请求:', { endpoint, model, promptLength: prompt.length })

    // 使用传入的 temperature，默认为 0.7
    const temperature = options?.temperature ?? 0.7
    const top_p = options?.top_p
    const max_tokens = options?.max_tokens
    
    const requestBody: any = {
      model,
      messages,
      temperature,
      stream: false
    }
    
    // 如果提供了 top_p，添加到请求中（增加输出多样性）
    if (top_p !== undefined) {
      requestBody.top_p = top_p
    }
    
    // 如果提供了 max_tokens，添加到请求中
    if (max_tokens !== undefined) {
      requestBody.max_tokens = max_tokens
    }
    
    logger.debug('DeepSeek API 请求参数:', { 
      temperature, 
      top_p, 
      max_tokens,
      promptLength: prompt.length 
    })
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw errorHandler.handleApiError({
        response: {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        }
      })
    }

    const data: DeepSeekResponse = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    const usage = data.usage || {}

    logger.debug('DeepSeek API 响应:', { textLength: text.length, usage })

    return {
      text,
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        candidatesTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      }
    }
  } catch (error: any) {
    if (error.message && error.message.includes('ISO-8859-1')) {
      throw errorHandler.createError(
        'INVALID_API_KEY',
        'API Key 包含无效字符。请检查 API Key 是否正确，确保没有复制到额外的空格或特殊字符。\n建议：重新复制 API Key 并粘贴到设置页面。'
      )
    }
    throw errorHandler.handleApiError(error)
  }
}

