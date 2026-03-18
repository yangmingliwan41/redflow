/**
 * AI 服务模拟模式
 */

import { ProductAnalysis, GenerationSettings, TokenUsage } from '../../types'
import { Page } from '../../stores/textGenerator'
import { STORAGE_KEYS } from '../../config/constants'

/**
 * 检查是否启用模拟模式
 */
export function isMockMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true'
}

/**
 * 模拟分析产品图片
 */
export async function mockAnalyzeProductImage(
  file: File
): Promise<{ analysis: ProductAnalysis; usage: TokenUsage }> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    analysis: {
      name: '示例产品',
      category: '电子产品',
      features: ['功能1', '功能2', '功能3'],
      colors: ['黑色', '白色'],
      materials: ['塑料', '金属'],
      recommendation: {
        tone: 'enthusiastic',
        copyStyle: 'storytelling',
        imageStyle: 'ins_minimal'
      }
    },
    usage: {
      promptTokens: 100,
      candidatesTokens: 200,
      totalTokens: 300
    }
  }
}

/**
 * 模拟生成营销文案
 */
export async function mockGenerateMarketingCopy(
  analysis: ProductAnalysis,
  settings: GenerationSettings
): Promise<{ copy: string; usage: TokenUsage }> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    copy: `# ${analysis.name} - 值得拥有的好物！\n\n这是一款${analysis.category}，具有以下特点：\n${analysis.features.map(f => `- ${f}`).join('\n')}\n\n快来体验吧！`,
    usage: {
      promptTokens: 150,
      candidatesTokens: 250,
      totalTokens: 400
    }
  }
}

/**
 * 模拟生成风格化图片
 */
export async function mockGenerateStyledImage(
  originalFile: File,
  analysis: ProductAnalysis,
  style: string,
  settings?: GenerationSettings
): Promise<{ imageUrl: string | null; usage: TokenUsage }> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 生成一个占位图片
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1365
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#333'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Mock Image', canvas.width / 2, canvas.height / 2)
  }
  
  return {
    imageUrl: canvas.toDataURL('image/png'),
    usage: {
      promptTokens: 200,
      candidatesTokens: 300,
      totalTokens: 500
    }
  }
}

/**
 * 模拟生成大纲
 * @param topic 主题内容
 * @param targetPageCount 目标页面数量（可选）
 */
export async function mockGenerateOutline(
  topic: string,
  targetPageCount?: number
): Promise<{ outline: string; pages: Array<Page> }> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 根据目标页面数量生成页面
  const pageCount = targetPageCount || 6
  const pages: Array<Page> = []
  
  // 封面页
  pages.push({
    index: 0,
    type: 'cover',
    content: `📌 ${topic}\n\n开始你的精彩内容之旅`,
    imagePrompt: `根据主题 "${topic}" 生成一张吸引人的封面图片`
  })
  
  // 内容页（至少1页，最多 pageCount - 1 页）
  const contentPageCount = Math.max(1, pageCount - 1)
  for (let i = 1; i < pageCount; i++) {
    pages.push({
      index: i,
      type: 'content',
      content: `第${i}页内容：关于${topic}的${i === contentPageCount ? '总结和行动建议' : '详细介绍'}`,
      imagePrompt: `根据主题 "${topic}" 生成一张内容图片`
    })
  }
  
  return {
    outline: `大纲：${topic}`,
    pages
  }
}

/**
 * 模拟生成页面图片
 */
export async function mockGeneratePageImage(
  pageContent: string,
  pageIndex: number
): Promise<{ imageUrl: string; usage: TokenUsage }> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 生成一个占位图片
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1365
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#333'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`Mock Page ${pageIndex + 1}`, canvas.width / 2, canvas.height / 2)
  }
  
  return {
    imageUrl: canvas.toDataURL('image/png'),
    usage: {
      promptTokens: 150,
      candidatesTokens: 200,
      totalTokens: 350
    }
  }
}





