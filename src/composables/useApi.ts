/**
 * API 调用相关组合式函数
 */

import { ref } from 'vue'
import { logger } from './useLogger'
import { errorHandler } from './useError'
import { cleanAsciiString } from '../utils'

export interface ApiConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export function useApi(config: ApiConfig = {}) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取 API Key（从 localStorage）
   */
  const getApiKey = (key: string): string | null => {
    if (typeof window === 'undefined') return null
    const value = localStorage.getItem(key)
    if (!value) return null
    return cleanAsciiString(value)
  }

  /**
   * 带超时的 fetch 请求
   */
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 60000
  ): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error(`请求超时 (${timeout}ms)`)
      }
      throw err
    }
  }

  /**
   * 执行 API 请求
   */
  const request = async <T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      logger.debug('API 请求:', { url, method: options.method || 'GET' })

      const response = await fetchWithTimeout(
        url,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        },
        config.timeout || 60000
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const appError = errorHandler.handleApiError({
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          }
        })
        throw appError
      }

      const data = await response.json()
      logger.debug('API 响应:', { url, data: data })
      return data
    } catch (err: any) {
      const appError = errorHandler.handleApiError(err)
      error.value = appError.message
      throw appError
    } finally {
      loading.value = false
    }
  }

  /**
   * GET 请求
   */
  const get = <T = any>(url: string, options?: RequestInit): Promise<T> => {
    return request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * POST 请求
   */
  const post = <T = any>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  return {
    loading,
    error,
    getApiKey,
    request,
    get,
    post
  }
}

