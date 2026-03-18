/**
 * 智谱AI API 服务
 */

import { TokenUsage } from '../../types'
import { logger } from '../../composables/useLogger'
import { errorHandler } from '../../composables/useError'
import { useApi } from '../../composables/useApi'
import { STORAGE_KEYS } from '../../config/constants'

const { getApiKey: getApiKeyFromStorage } = useApi()

export interface ZhipuResponse {
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
 * 调用智谱AI API
 */
export async function callZhipuAPI(
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string; usage: TokenUsage }> {
  const apiKey = getApiKeyFromStorage(STORAGE_KEYS.ZHIPU_API_KEY)
  if (!apiKey) {
    throw errorHandler.createError(
      'MISSING_API_KEY',
      '智谱AI API Key not found. Please set ZHIPU_API_KEY in localStorage.'
    )
  }

  const endpoint = getApiKeyFromStorage(STORAGE_KEYS.ZHIPU_API_ENDPOINT) || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  const model = getApiKeyFromStorage(STORAGE_KEYS.ZHIPU_MODEL) || 'glm-4.7'

  const messages: Array<{ role: string; content: string }> = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const headers = new Headers()
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${apiKey}`)

  try {
    logger.debug('智谱AI API 请求:', { endpoint, model, promptLength: prompt.length })

    // 构建请求体，支持联网搜索（GLM-4.7）
    const requestBody: any = {
      model,
      messages,
      temperature: 0.7,
      stream: false
    }
    
    // GLM-4.7支持联网搜索，在需要时启用
    // 注意：联网搜索可能会增加响应时间
    if (model.includes('glm-4')) {
      // 可以通过tools参数启用联网搜索，但需要根据实际API文档调整
      // 目前先使用默认配置，模型会自动判断是否需要联网搜索
    }
    
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

    const data: ZhipuResponse = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    const usage = data.usage || {}

    logger.debug('智谱AI API 响应:', { textLength: text.length, usage })

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

