/**
 * 规划服务测试（扩展）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generatePlanFromRequirement,
  confirmPlan,
  generateMultiContentPlan
} from '../planningService'
import { RequirementAnalysis, MultiContentPlan, ContentPlan } from '../../../types'
import { v4 as uuidv4 } from 'uuid'

// Mock依赖
vi.mock('../autoPlanner', () => ({
  multiContentPlanner: {
    generateMultiContentPlan: vi.fn()
  }
}))

vi.mock('../conflictDetector', () => ({
  conflictDetector: {
    detectConflicts: vi.fn(() => [])
  }
}))

vi.mock('../ai/planningAgent', () => ({
  agentQualityCheck: vi.fn(() => ({
    conflicts: [],
    resolved: true
  }))
}))

vi.mock('../../storage/index', () => ({
  storage: {
    savePlan: vi.fn(),
    getPlan: vi.fn(),
    listPlans: vi.fn(() => [])
  }
}))

vi.mock('../../events', () => ({
  eventBus: {
    emit: vi.fn()
  },
  Events: {
    PLAN_CREATED: 'plan:created',
    PLAN_UPDATED: 'plan:updated',
    PLAN_CONFIRMED: 'plan:confirmed'
  }
}))

vi.mock('../../../composables/useLogger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('规划服务（扩展）', () => {
  const mockRequirement: RequirementAnalysis = {
    id: uuidv4(),
    userInput: '测试需求',
    extractedTopic: '测试主题',
    targetAudience: {
      age: '18-25',
      gender: 'female',
      interests: ['美妆']
    },
    contentType: 'tutorial',
    suggestedStyles: ['xiaohongshu'],
    keywords: ['测试'],
    createdAt: Date.now(),
    inputMode: 'wizard',
    productDescription: '这是一款高品质的智能手表',
    selectedStyles: ['xiaohongshu', 'tech_future'],
    sellingPoints: ['功能', '品质']
  }

  const mockPlan: MultiContentPlan = {
    id: uuidv4(),
    requirementId: mockRequirement.id,
    planName: '7篇内容规划',
    period: {
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      totalDays: 7
    },
    contents: [],
    overallStrategy: {
      totalContents: 7,
      contentTypeDistribution: {},
      styleDistribution: {},
      diversityScore: 0.8
    },
    publishSchedule: [],
    resources: {
      totalImages: 0,
      totalWords: 0
    },
    conflictCheck: {
      checked: true,
      conflicts: [],
      resolved: true
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePlanFromRequirement', () => {
    it('应该基于需求分析生成内容规划', async () => {
      const { multiContentPlanner } = await import('../autoPlanner')
      const { storage } = await import('../../storage/index')
      
      vi.mocked(multiContentPlanner.generateMultiContentPlan).mockResolvedValue(mockPlan)

      const period = {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        totalContents: 7
      }

      const plan = await generatePlanFromRequirement(mockRequirement, period)
      
      expect(plan).toBeDefined()
      expect(plan.requirementId).toBe(mockRequirement.id)
      expect(multiContentPlanner.generateMultiContentPlan).toHaveBeenCalledWith(
        mockRequirement,
        period
      )
      expect(storage.savePlan).toHaveBeenCalled()
    })

    it('应该使用需求分析中的向导式数据', async () => {
      const { multiContentPlanner } = await import('../autoPlanner')
      
      vi.mocked(multiContentPlanner.generateMultiContentPlan).mockResolvedValue(mockPlan)

      const period = {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        totalContents: 7
      }

      await generatePlanFromRequirement(mockRequirement, period)
      
      // 验证使用了向导式数据
      expect(multiContentPlanner.generateMultiContentPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedStyles: mockRequirement.selectedStyles,
          sellingPoints: mockRequirement.sellingPoints
        }),
        period
      )
    })
  })

  describe('confirmPlan', () => {
    it('应该确认规划并标记为已确认', async () => {
      const { storage } = await import('../../storage/index')
      const { eventBus, Events } = await import('../../events')
      
      const contentPlan: ContentPlan = {
        id: mockPlan.id,
        requirementId: mockRequirement.id,
        planType: 'multi',
        multi: mockPlan,
        createdAt: Date.now()
      }

      vi.mocked(storage.getPlan).mockResolvedValue(contentPlan)

      await confirmPlan(mockPlan.id)
      
      expect(storage.savePlan).toHaveBeenCalled()
      expect(eventBus.emit).toHaveBeenCalledWith(Events.PLAN_CONFIRMED, expect.any(Object))
    })

    it('应该更新规划的确认状态', async () => {
      const { storage } = await import('../../storage/index')
      
      const contentPlan: ContentPlan = {
        id: mockPlan.id,
        requirementId: mockRequirement.id,
        planType: 'multi',
        multi: mockPlan,
        createdAt: Date.now()
      }

      vi.mocked(storage.getPlan).mockResolvedValue(contentPlan)

      await confirmPlan(mockPlan.id)
      
      const savedPlan = vi.mocked(storage.savePlan).mock.calls[0][0] as ContentPlan
      expect(savedPlan.confirmed).toBe(true)
      expect(savedPlan.confirmedAt).toBeDefined()
    })

    it('当规划不存在时应该抛出错误', async () => {
      const { storage } = await import('../../storage/index')
      
      vi.mocked(storage.getPlan).mockResolvedValue(null)

      await expect(confirmPlan('non-existent-id')).rejects.toThrow()
    })
  })
})

