/**
 * 内容生产服务测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateContentFromPlan,
  getProductionProgress
} from '../contentProduction'
import { ContentPlan, MultiContentPlan } from '../../../types'
import { v4 as uuidv4 } from 'uuid'

// Mock依赖
vi.mock('../../ai', () => ({
  generateStyledImage: vi.fn(),
  generateMarketingCopy: vi.fn()
}))

vi.mock('../../storage/index', () => ({
  storage: {
    saveHistoryItem: vi.fn()
  }
}))

vi.mock('../../events', () => ({
  eventBus: {
    emit: vi.fn()
  },
  Events: {
    CONTENT_CREATED: 'content:created',
    CONTENT_PRODUCTION_PROGRESS: 'content:production:progress'
  }
}))

vi.mock('../../../composables/useLogger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('内容生产服务', () => {
  const mockPlan: ContentPlan = {
    id: uuidv4(),
    requirementId: uuidv4(),
    planType: 'multi',
    confirmed: true,
    confirmedAt: Date.now(),
    multi: {
      id: uuidv4(),
      requirementId: uuidv4(),
      planName: '7篇内容规划',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        totalDays: 7
      },
      contents: [
        {
          id: uuidv4(),
          title: '内容1',
          contentType: 'tutorial',
          stylePack: {
            style_id: 'xiaohongshu',
            style_name: '小红书风格'
          },
          targetDate: '2024-01-01',
          outline: {
            cover: {
              index: 0,
              title: '封面',
              content: '封面内容',
              imagePrompt: '封面图片提示',
              templateType: 'cover'
            },
            pages: []
          }
        }
      ],
      overallStrategy: {
        totalContents: 1,
        contentTypeDistribution: {},
        styleDistribution: {},
        diversityScore: 0.8
      },
      publishSchedule: {
        distribution: 'daily',
        bestTimes: [9, 12, 18],
        totalScheduled: 1
      },
      resources: {
        totalImageCount: 1,
        totalTextLength: 1000,
        totalEstimatedTime: 60
      },
      conflictCheck: {
        checked: true,
        conflicts: [],
        resolved: true
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    createdAt: Date.now()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateContentFromPlan', () => {
    it('应该根据规划生成内容', async () => {
      const { generateStyledImage, generateMarketingCopy } = await import('../../ai')
      const { storage } = await import('../../storage/index')
      
      vi.mocked(generateStyledImage).mockResolvedValue({
        id: uuidv4(),
        imageUrl: 'https://example.com/image.jpg',
        prompt: 'test prompt',
        settings: {}
      } as any)
      
      vi.mocked(generateMarketingCopy).mockResolvedValue({
        id: uuidv4(),
        text: '生成的文案',
        outline: mockPlan.multi!.contents[0].outline
      } as any)

      const results = await generateContentFromPlan(mockPlan)
      
      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(storage.saveHistoryItem).toHaveBeenCalled()
    })

    it('应该支持批量生成多篇内容', async () => {
      const { generateStyledImage, generateMarketingCopy } = await import('../../ai')
      
      vi.mocked(generateStyledImage).mockResolvedValue({
        id: uuidv4(),
        imageUrl: 'https://example.com/image.jpg',
        prompt: 'test prompt',
        settings: {}
      } as any)
      
      vi.mocked(generateMarketingCopy).mockResolvedValue({
        id: uuidv4(),
        text: '生成的文案',
        outline: mockPlan.multi!.contents[0].outline
      } as any)

      // 添加更多内容到规划
      const multiContentPlan = mockPlan.multi!
      multiContentPlan.contents.push({
        ...multiContentPlan.contents[0],
        id: uuidv4(),
        title: '内容2'
      })

      const results = await generateContentFromPlan(mockPlan)
      
      expect(results.length).toBeGreaterThan(1)
    })

    it('应该跟踪生成进度', async () => {
      const { generateStyledImage, generateMarketingCopy } = await import('../../ai')
      const { eventBus, Events } = await import('../../events')
      
      vi.mocked(generateStyledImage).mockResolvedValue({
        id: uuidv4(),
        imageUrl: 'https://example.com/image.jpg',
        prompt: 'test prompt',
        settings: {}
      } as any)
      
      vi.mocked(generateMarketingCopy).mockResolvedValue({
        id: uuidv4(),
        text: '生成的文案',
        outline: mockPlan.multi!.contents[0].outline
      } as any)

      await generateContentFromPlan(mockPlan)
      
      // 应该发射进度事件
      expect(eventBus.emit).toHaveBeenCalledWith(
        Events.CONTENT_PRODUCTION_PROGRESS,
        expect.any(Object)
      )
    })
  })

  describe('getProductionProgress', () => {
    it('应该返回当前生产进度', () => {
      const progress = getProductionProgress(mockPlan.id)
      
      expect(progress).toBeDefined()
      expect(progress).toHaveProperty('planId')
      expect(progress).toHaveProperty('total')
      expect(progress).toHaveProperty('completed')
      expect(progress).toHaveProperty('percentage')
    })
  })
})

