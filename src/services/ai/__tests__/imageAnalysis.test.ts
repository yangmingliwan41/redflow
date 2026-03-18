import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeProductImage } from '../imageAnalysis'
import * as googleModule from '../google'
import * as mockModule from '../mock'

// Mock dependencies
vi.mock('../google')
vi.mock('../mock')
vi.mock('../../utils/image', () => ({
  fileToGenerativePart: vi.fn(() => Promise.resolve({ mimeType: 'image/jpeg', data: 'base64data' }))
}))

describe('analyzeProductImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return mock data in mock mode', async () => {
    vi.mocked(mockModule.isMockMode).mockReturnValue(true)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await analyzeProductImage(file)
    
    expect(result.analysis).toBeDefined()
    expect(result.analysis.name).toBe('示例产品')
  })

  it('should parse JSON response correctly', async () => {
    vi.mocked(mockModule.isMockMode).mockReturnValue(false)
    vi.mocked(googleModule.callGoogleGenAIAPI).mockResolvedValue({
      text: JSON.stringify({
        name: '测试产品',
        category: '电子产品',
        features: ['功能1', '功能2'],
        colors: ['黑色'],
        materials: ['塑料'],
        recommendation: {
          tone: 'professional',
          copyStyle: 'storytelling',
          imageStyle: 'ins_minimal'
        }
      }),
      usage: {
        promptTokens: 100,
        candidatesTokens: 200,
        totalTokens: 300
      }
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await analyzeProductImage(file)

    expect(result.analysis.name).toBe('测试产品')
    expect(result.analysis.category).toBe('电子产品')
    expect(result.usage.totalTokens).toBe(300)
  })

  it('should handle markdown code block format', async () => {
    vi.mocked(mockModule.isMockMode).mockReturnValue(false)
    const jsonData = {
      name: '测试产品',
      category: '电子产品',
      features: ['功能1'],
      colors: ['黑色'],
      materials: ['塑料'],
      recommendation: {
        tone: 'professional',
        copyStyle: 'storytelling',
        imageStyle: 'ins_minimal'
      }
    }
    
    vi.mocked(googleModule.callGoogleGenAIAPI).mockResolvedValue({
      text: `\`\`\`json\n${JSON.stringify(jsonData)}\n\`\`\``,
      usage: {
        promptTokens: 100,
        candidatesTokens: 200,
        totalTokens: 300
      }
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await analyzeProductImage(file)

    expect(result.analysis.name).toBe('测试产品')
  })

  it('should return default analysis on parse error', async () => {
    vi.mocked(mockModule.isMockMode).mockReturnValue(false)
    vi.mocked(googleModule.callGoogleGenAIAPI).mockResolvedValue({
      text: 'invalid json {',
      usage: {
        promptTokens: 100,
        candidatesTokens: 200,
        totalTokens: 300
      }
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    // 应该抛出错误而不是返回默认值（根据当前实现）
    await expect(analyzeProductImage(file)).rejects.toThrow()
  })

  it('should handle empty response', async () => {
    vi.mocked(mockModule.isMockMode).mockReturnValue(false)
    vi.mocked(googleModule.callGoogleGenAIAPI).mockResolvedValue({
      text: '',
      usage: {
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0
      }
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    await expect(analyzeProductImage(file)).rejects.toThrow('No analysis result returned')
  })
})

