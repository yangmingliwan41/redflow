/**
 * 字符串处理工具函数
 */

/**
 * 清理字符串，确保只包含 ASCII 字符
 * 用于 API Key 等敏感信息的清理
 */
export function cleanAsciiString(str: string): string {
  if (!str) return ''
  let cleaned = str.trim()
  
  // 移除 Bearer 前缀（如果存在）
  const lower = cleaned.toLowerCase()
  if (lower.startsWith('bearer ')) {
    cleaned = cleaned.slice(7).trim()
  }
  
  // 移除非 ASCII 字符
  return cleaned
    .split('')
    .filter(char => {
      const code = char.charCodeAt(0)
      return code >= 32 && code <= 126 // ASCII 可打印字符
    })
    .join('')
    .trim()
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}





