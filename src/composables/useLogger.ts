/**
 * 日志管理组合式函数
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LoggerOptions {
  level?: LogLevel
  prefix?: string
  enableConsole?: boolean
}

export function useLogger(options: LoggerOptions = {}) {
  const {
    level = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
    prefix = '[RedFlow]',
    enableConsole = true
  } = options

  const shouldLog = (logLevel: LogLevel) => logLevel >= level

  const formatMessage = (logLevel: string, message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString()
    return [`${prefix} [${timestamp}] [${logLevel}]`, message, ...args]
  }

  const debug = (message: string, ...args: any[]) => {
    if (shouldLog(LogLevel.DEBUG) && enableConsole) {
      console.debug(...formatMessage('DEBUG', message, ...args))
    }
  }

  const info = (message: string, ...args: any[]) => {
    if (shouldLog(LogLevel.INFO) && enableConsole) {
      console.log(...formatMessage('INFO', message, ...args))
    }
  }

  const warn = (message: string, ...args: any[]) => {
    if (shouldLog(LogLevel.WARN) && enableConsole) {
      console.warn(...formatMessage('WARN', message, ...args))
    }
  }

  const error = (message: string, ...args: any[]) => {
    if (shouldLog(LogLevel.ERROR) && enableConsole) {
      console.error(...formatMessage('ERROR', message, ...args))
    }
  }

  return {
    debug,
    info,
    warn,
    error
  }
}

// 默认导出单例
export const logger = useLogger()





