/**
 * 错误处理组合式函数
 */

import { logger } from './useLogger'

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: number
}

export class AppError extends Error {
  code: string
  details?: any
  timestamp: number

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()
  }
}

export function useError() {
  /**
   * 创建应用错误
   */
  const createError = (code: string, message: string, details?: any): AppError => {
    return new AppError(code, message, details)
  }

  /**
   * 处理 API 错误
   */
  const handleApiError = (error: any): AppError => {
    if (error instanceof AppError) {
      return error
    }

    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.statusText || 'API 请求失败'
      
      switch (status) {
        case 401:
          return createError('UNAUTHORIZED', '认证失败，请检查 API Key', { status })
        case 403:
          return createError('FORBIDDEN', '没有权限访问该资源', { status })
        case 404:
          return createError('NOT_FOUND', '请求的资源不存在', { status })
        case 429:
          return createError('RATE_LIMIT', '请求过于频繁，请稍后重试', { status })
        case 500:
          return createError('SERVER_ERROR', '服务器内部错误', { status })
        default:
          return createError('API_ERROR', message, { status, response: error.response.data })
      }
    }

    // 处理网络错误
    if (error.message?.includes('fetch')) {
      return createError('NETWORK_ERROR', '网络连接失败，请检查网络设置', { original: error.message })
    }

    // 处理超时错误
    if (error.message?.includes('timeout')) {
      return createError('TIMEOUT', '请求超时，请稍后重试', { original: error.message })
    }

    // 默认错误
    return createError('UNKNOWN_ERROR', error.message || '未知错误', { original: error })
  }

  /**
   * 显示错误提示
   */
  const showError = (error: AppError | string) => {
    const errorObj = typeof error === 'string' 
      ? createError('USER_ERROR', error)
      : error
    
    logger.error('错误:', errorObj.message, errorObj.details)
    
    // 可以在这里集成 UI 通知系统
    alert(errorObj.message)
  }

  /**
   * 安全执行异步函数
   */
  const safeExecute = async <T>(
    fn: () => Promise<T>,
    errorHandler?: (error: AppError) => void
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error: any) {
      const appError = handleApiError(error)
      if (errorHandler) {
        errorHandler(appError)
      } else {
        showError(appError)
      }
      return null
    }
  }

  return {
    createError,
    handleApiError,
    showError,
    safeExecute
  }
}

// 默认导出单例
export const errorHandler = useError()





