/**
 * 智能追问逻辑测试
 */

import { describe, it, expect } from 'vitest'
import {
  shouldAskFollowUp,
  getFollowUpQuestions,
  FollowUpContext
} from '../followUpQuestions'
import { QuestionDefinition } from '../../../types/requirement'

describe('智能追问逻辑', () => {
  describe('shouldAskFollowUp', () => {
    it('当产品描述不明确时，应该建议追问目标受众', () => {
      const context: FollowUpContext = {
        productDescription: '一款产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const result = shouldAskFollowUp(context, 'targetAudience')
      expect(result).toBe(true)
    })

    it('当产品描述明确包含目标受众信息时，不应该追问', () => {
      const context: FollowUpContext = {
        productDescription: '面向18-25岁女性的口红产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['颜值']
      }

      const result = shouldAskFollowUp(context, 'targetAudience')
      expect(result).toBe(false)
    })

    it('当没有发布频率信息时，应该建议追问', () => {
      const context: FollowUpContext = {
        productDescription: '一款高品质的智能手表',
        selectedStyles: ['tech_future'],
        sellingPoints: ['功能', '品质']
      }

      const result = shouldAskFollowUp(context, 'publishFrequency')
      expect(result).toBe(true)
    })

    it('当产品描述包含发布频率信息时，不应该追问', () => {
      const context: FollowUpContext = {
        productDescription: '每周发布2-3篇内容',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const result = shouldAskFollowUp(context, 'publishFrequency')
      expect(result).toBe(false)
    })
  })

  describe('getFollowUpQuestions', () => {
    it('应该根据上下文返回最多2个追问问题', () => {
      const context: FollowUpContext = {
        productDescription: '一款产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const questions = getFollowUpQuestions(context)
      expect(questions.length).toBeLessThanOrEqual(2)
    })

    it('应该优先返回目标受众问题（如果不明确）', () => {
      const context: FollowUpContext = {
        productDescription: '一款产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const questions = getFollowUpQuestions(context)
      const hasTargetAudience = questions.some(q => q.id === 'targetAudience')
      expect(hasTargetAudience).toBe(true)
    })

    it('当所有信息都明确时，应该返回空数组或最少的问题', () => {
      const context: FollowUpContext = {
        productDescription: '面向18-25岁女性的口红产品，每周发布2-3篇，生成教程和测评类内容',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['颜值', '品质']
      }

      const questions = getFollowUpQuestions(context)
      // 当所有信息都明确时，应该返回0个或很少的问题
      expect(questions.length).toBeLessThanOrEqual(1)
    })

    it('应该返回有效的QuestionDefinition对象', () => {
      const context: FollowUpContext = {
        productDescription: '一款产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const questions = getFollowUpQuestions(context)
      
      questions.forEach(question => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('type', 'followUp')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('required', false)
      })
    })

    it('应该根据风格类型智能决定追问', () => {
      // 科技风格可能需要更多技术细节
      const techContext: FollowUpContext = {
        productDescription: '一款科技产品',
        selectedStyles: ['tech_future'],
        sellingPoints: ['功能']
      }

      const techQuestions = getFollowUpQuestions(techContext)
      
      // 可以根据风格类型返回不同的问题
      expect(Array.isArray(techQuestions)).toBe(true)
    })
  })

  describe('追问问题类型', () => {
    it('目标受众问题应该有正确的格式', () => {
      const context: FollowUpContext = {
        productDescription: '一款产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const questions = getFollowUpQuestions(context)
      const targetAudienceQuestion = questions.find(q => q.id === 'targetAudience')
      
      if (targetAudienceQuestion) {
        expect(targetAudienceQuestion.text).toContain('目标受众')
        expect(targetAudienceQuestion.required).toBe(false)
      }
    })

    it('发布频率问题应该有正确的格式', () => {
      const context: FollowUpContext = {
        productDescription: '一款产品',
        selectedStyles: ['xiaohongshu'],
        sellingPoints: ['性价比']
      }

      const questions = getFollowUpQuestions(context)
      const frequencyQuestion = questions.find(q => q.id === 'publishFrequency')
      
      if (frequencyQuestion) {
        expect(frequencyQuestion.text).toContain('发布频率')
        expect(frequencyQuestion.required).toBe(false)
      }
    })
  })
})

