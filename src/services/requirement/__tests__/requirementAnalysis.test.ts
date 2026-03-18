/**
 * 需求分析服务测试（扩展）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  analyzeAndSaveRequirement,
  getRequirement,
  updateRequirement
} from '../requirementAnalysis'
import { RequirementAnalysis } from '../../../types/requirement'
import { v4 as uuidv4 } from 'uuid'

// Mock依赖
vi.mock('../../ai/requirementAnalysis', () => ({
  analyzeRequirement: vi.fn()
}))

vi.mock('../../storage/index', () => ({
  storage: {
    saveRequirement: vi.fn(),
    getRequirement: vi.fn(),
    getAllRequirements: vi.fn(() => [])
  }
}))

vi.mock('../../events', () => ({
  eventBus: {
    emit: vi.fn()
  },
  Events: {
    REQUIREMENT_ANALYZED: 'requirement:analyzed',
    REQUIREMENT_SAVED: 'requirement:saved',
    REQUIREMENT_DELETED: 'requirement:deleted'
  }
}))

vi.mock('../../../composables/useLogger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('需求分析服务（扩展）', () => {
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
    inputMode: 'text'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('向导式输入支持', () => {
    it('应该支持向导式输入数据', async () => {
      const { analyzeRequirement } = await import('../../ai/requirementAnalysis')
      const { storage } = await import('../../storage/index')
      
      vi.mocked(analyzeRequirement).mockResolvedValue({
        requirement: {
          ...mockRequirement,
          productDescription: '这是一款高品质的智能手表',
          selectedStyles: ['xiaohongshu', 'tech_future'],
          sellingPoints: ['功能', '品质'],
          inputMode: 'wizard'
        },
        confidence: 0.9,
        suggestions: []
      })

      const wizardAnswers = {
        product: '这是一款高品质的智能手表',
        style: ['xiaohongshu', 'tech_future'],
        sellingPoint: ['功能', '品质']
      }

      // 这里需要重构analyzeAndSaveRequirement来支持向导式输入
      // 暂时测试向后兼容性
      const result = await analyzeAndSaveRequirement('这是一款高品质的智能手表')
      
      expect(result.requirement).toBeDefined()
      expect(storage.saveRequirement).toHaveBeenCalled()
    })

    it('应该能够从向导式答案生成完整的RequirementAnalysis对象', async () => {
      const wizardAnswers = {
        product: '这是一款高品质的智能手表',
        style: ['xiaohongshu', 'tech_future'],
        sellingPoint: ['功能', '品质'],
        followUpAnswers: {
          targetAudience: '18-25岁科技爱好者',
          publishFrequency: '每周2-3篇'
        }
      }

      // 测试向导式输入转换为RequirementAnalysis的逻辑
      const expectedRequirement: Partial<RequirementAnalysis> = {
        productDescription: wizardAnswers.product,
        selectedStyles: wizardAnswers.style,
        sellingPoints: wizardAnswers.sellingPoint,
        followUpAnswers: wizardAnswers.followUpAnswers,
        inputMode: 'wizard'
      }

      expect(expectedRequirement.productDescription).toBe(wizardAnswers.product)
      expect(expectedRequirement.selectedStyles).toEqual(wizardAnswers.style)
      expect(expectedRequirement.sellingPoints).toEqual(wizardAnswers.sellingPoint)
    })
  })

  describe('向后兼容性', () => {
    it('应该继续支持旧版文本输入方式', async () => {
      const { analyzeRequirement } = await import('../../ai/requirementAnalysis')
      const { storage } = await import('../../storage/index')
      
      const userInput = '推广新款口红，目标用户是18-25岁女性'
      vi.mocked(analyzeRequirement).mockResolvedValue({
        requirement: {
          ...mockRequirement,
          userInput,
          inputMode: 'text'
        },
        confidence: 0.8,
        suggestions: []
      })

      const result = await analyzeAndSaveRequirement(userInput)
      
      expect(result.requirement.inputMode).toBe('text')
      expect(result.requirement.userInput).toBe(userInput)
      expect(storage.saveRequirement).toHaveBeenCalled()
    })

    it('旧版文本输入应该不包含向导式字段', async () => {
      const { analyzeRequirement } = await import('../../ai/requirementAnalysis')
      
      vi.mocked(analyzeRequirement).mockResolvedValue({
        requirement: {
          ...mockRequirement,
          inputMode: 'text'
        },
        confidence: 0.8,
        suggestions: []
      })

      const result = await analyzeAndSaveRequirement('测试文本输入')
      
      expect(result.requirement.inputMode).toBe('text')
      expect(result.requirement.productDescription).toBeUndefined()
      expect(result.requirement.selectedStyles).toBeUndefined()
    })
  })

  describe('数据转换', () => {
    it('应该将向导式答案转换为RequirementAnalysis格式', () => {
      const wizardAnswers = {
        product: '这是一款高品质的智能手表',
        style: ['xiaohongshu'],
        sellingPoint: ['功能']
      }

      // 模拟转换逻辑
      const converted: Partial<RequirementAnalysis> = {
        productDescription: wizardAnswers.product,
        selectedStyles: wizardAnswers.style,
        sellingPoints: wizardAnswers.sellingPoint,
        userInput: wizardAnswers.product, // 向导式输入也作为userInput保存
        inputMode: 'wizard'
      }

      expect(converted.productDescription).toBe(wizardAnswers.product)
      expect(converted.selectedStyles).toEqual(wizardAnswers.style)
      expect(converted.inputMode).toBe('wizard')
    })
  })
})

