/**
 * 文本格式化工具
 * 清理markdown格式，提取并标记关键信息
 */

/**
 * 清理markdown格式字符
 */
export function cleanMarkdown(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  
  // 移除markdown标题标记
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '')
  
  // 移除粗体标记
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1')
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1')
  
  // 移除斜体标记
  cleaned = cleaned.replace(/_(.+?)_/g, '$1')
  
  // 移除删除线
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1')
  
  // 移除代码块标记
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '')
  cleaned = cleaned.replace(/`(.+?)`/g, '$1')
  
  // 移除链接标记，保留文本
  cleaned = cleaned.replace(/\[(.+?)\]\(.+?\)/g, '$1')
  
  // 移除列表标记
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '')
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '')
  
  // 移除引用标记
  cleaned = cleaned.replace(/^>\s+/gm, '')
  
  // 移除多余的空格和换行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * 提取关键信息（数字、百分比、重要词汇等）
 */
export interface HighlightInfo {
  text: string
  isHighlight: boolean
  type?: 'number' | 'percentage' | 'keyword' | 'normal'
}

export function extractHighlights(text: string): HighlightInfo[] {
  if (!text) return []
  
  const cleaned = cleanMarkdown(text)
  const parts: HighlightInfo[] = []
  
  // 匹配模式
  const patterns = [
    { regex: /(\d+%)/g, type: 'percentage' as const }, // 百分比
    { regex: /(\d+\.?\d*)/g, type: 'number' as const }, // 数字
  ]
  
  // 重要关键词（可以根据需要扩展）
  const keywords = [
    '成功', '失败', '重要', '关键', '建议', '注意', '推荐', '最佳',
    '高效', '优质', '热门', '趋势', '增长', '提升', '优化', '改进'
  ]
  
  let lastIndex = 0
  const matches: Array<{ index: number; length: number; type: 'number' | 'percentage' | 'keyword' }> = []
  
  // 收集所有匹配项
  patterns.forEach(({ regex, type }) => {
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(cleaned)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type
      })
    }
  })
  
  // 检查关键词
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'g')
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(cleaned)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: 'keyword' as const
      })
    }
  })
  
  // 按索引排序
  matches.sort((a, b) => a.index - b.index)
  
  // 合并重叠的匹配项
  const mergedMatches: Array<{ start: number; end: number; type: 'number' | 'percentage' | 'keyword' }> = []
  matches.forEach(match => {
    const start = match.index
    const end = start + match.length
    
    // 检查是否与已有匹配重叠
    const overlapping = mergedMatches.find(m => 
      (start >= m.start && start < m.end) || 
      (end > m.start && end <= m.end) ||
      (start <= m.start && end >= m.end)
    )
    
    if (overlapping) {
      // 合并重叠的匹配
      overlapping.start = Math.min(overlapping.start, start)
      overlapping.end = Math.max(overlapping.end, end)
      // 优先保留更重要的类型
      if (match.type === 'percentage' || (match.type === 'keyword' && overlapping.type === 'number')) {
        overlapping.type = match.type
      }
    } else {
      mergedMatches.push({ start, end, type: match.type })
    }
  })
  
  // 构建结果
  mergedMatches.forEach(({ start, end, type }) => {
    // 添加普通文本
    if (start > lastIndex) {
      parts.push({
        text: cleaned.substring(lastIndex, start),
        isHighlight: false,
        type: 'normal'
      })
    }
    
    // 添加高亮文本
    parts.push({
      text: cleaned.substring(start, end),
      isHighlight: true,
      type
    })
    
    lastIndex = end
  })
  
  // 添加剩余文本
  if (lastIndex < cleaned.length) {
    parts.push({
      text: cleaned.substring(lastIndex),
      isHighlight: false,
      type: 'normal'
    })
  }
  
  // 如果没有匹配项，返回整个文本
  if (parts.length === 0) {
    parts.push({
      text: cleaned,
      isHighlight: false,
      type: 'normal'
    })
  }
  
  return parts
}

/**
 * 格式化文本为HTML（用于v-html）
 */
export function formatTextToHTML(text: string): string {
  const highlights = extractHighlights(text)
  
  return highlights.map(part => {
    if (part.isHighlight) {
      const className = `highlight highlight--${part.type}`
      return `<span class="${className}">${escapeHtml(part.text)}</span>`
    }
    return escapeHtml(part.text)
  }).join('')
}

/**
 * HTML转义
 */
function escapeHtml(text: string): string {
  if (typeof window === 'undefined') {
    // 服务端环境，使用简单的转义
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 提取列表项（从文本中提取结构化列表）
 */
export function extractListItems(text: string): string[] {
  if (!text) return []
  
  const cleaned = cleanMarkdown(text)
  const items: string[] = []
  
  // 匹配列表项（支持多种格式）
  const listPatterns = [
    /^[\s]*[-*+]\s+(.+)$/gm,  // - item
    /^[\s]*\d+\.\s+(.+)$/gm,  // 1. item
    /^[\s]*[•·]\s+(.+)$/gm,   // • item
  ]
  
  listPatterns.forEach(pattern => {
    const matches = cleaned.matchAll(pattern)
    for (const match of matches) {
      if (match[1]) {
        items.push(match[1].trim())
      }
    }
  })
  
  // 如果没有找到列表项，尝试按行分割
  if (items.length === 0) {
    const lines = cleaned.split('\n').filter(line => line.trim().length > 0)
    items.push(...lines)
  }
  
  return items
}

