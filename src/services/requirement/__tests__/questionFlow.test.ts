/**
 * 问题流程管理器测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionFlowManager } from '../questionFlow'
import { QuestionDefinition } from '../../../types/requirement'

describe('QuestionFlowManager', () => {
  let manager: QuestionFlowManager
  const baseQuestions: QuestionDefinition[] = [
    {
      id: 'product',
      type: 'product',
      text: '请用一句话描述你的产品或者服务',
      required: true,
      validation: (answer: string) => {
        if (!answer || answer.trim().length === 0) {
          return '请输入产品描述'
        }
        if (answer.trim().length < 5) {
          return '产品描述至少需要5个字符'
        }
        return true
      }
    },
    {
      id: 'style',
      type: 'style',
      text: '选择你喜欢的风格',
      required: true,
      validation: (answer: string[]) => {
        if (!answer || answer.length === 0) {
          return '请至少选择一个风格'
        }
        return true
      }
    },
    {
      id: 'sellingPoint',
      type: 'sellingPoint',
      text: '选择产品卖点',
      required: true,
      validation: (answer: string[]) => {
        if (!answer || answer.length === 0) {
          return '请至少选择一个卖点'
        }
        return true
      }
    }
  ]

  beforeEach(() => {
    manager = new QuestionFlowManager(baseQuestions)
  })

  describe('初始化', () => {
    it('应该正确初始化问题流程管理器', () => {
      expect(manager).toBeDefined()
      expect(manager.getCurrentQuestion()).toBe(baseQuestions[0])
      expect(manager.getProgress()).toBe(0)
    })

    it('应该正确获取问题总数', () => {
      expect(manager.getTotalQuestions()).toBe(3)
    })
  })

  describe('回答问题', () => {
    it('应该能够回答第一个问题（产品描述）', () => {
      const answer = '这是一款高品质的智能手表'
      const result = manager.answerQuestion('product', answer)
      
      expect(result.success).toBe(true)
      expect(manager.getAnswer('product')).toBe(answer)
      expect(manager.getProgress()).toBeGreaterThan(0)
    })

    it('应该验证答案有效性', () => {
      const result1 = manager.answerQuestion('product', '')
      expect(result1.success).toBe(false)
      expect(result1.error).toContain('请输入产品描述')

      const result2 = manager.answerQuestion('product', '短')
      expect(result2.success).toBe(false)
      expect(result2.error).toContain('至少需要5个字符')
    })

    it('应该能够回答风格选择问题', () => {
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      const result = manager.answerQuestion('style', ['xiaohongshu', 'ins_minimal'])
      
      expect(result.success).toBe(true)
      expect(manager.getAnswer('style')).toEqual(['xiaohongshu', 'ins_minimal'])
    })

    it('应该验证风格选择至少选择一个', () => {
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      const result = manager.answerQuestion('style', [])
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('至少选择一个风格')
    })
  })

  describe('获取下一个问题', () => {
    it('应该按顺序返回下一个问题', () => {
      expect(manager.getCurrentQuestion()?.id).toBe('product')
      
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      expect(manager.getCurrentQuestion()?.id).toBe('style')
      
      manager.answerQuestion('style', ['xiaohongshu'])
      expect(manager.getCurrentQuestion()?.id).toBe('sellingPoint')
    })

    it('所有基础问题回答后应该返回null', () => {
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      manager.answerQuestion('style', ['xiaohongshu'])
      manager.answerQuestion('sellingPoint', ['性价比', '品质'])
      
      expect(manager.getCurrentQuestion()).toBeNull()
    })
  })

  describe('进度跟踪', () => {
    it('应该正确计算进度', () => {
      expect(manager.getProgress()).toBe(0)
      
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      expect(manager.getProgress()).toBeCloseTo(0.33, 1)
      
      manager.answerQuestion('style', ['xiaohongshu'])
      expect(manager.getProgress()).toBeCloseTo(0.67, 1)
      
      manager.answerQuestion('sellingPoint', ['性价比'])
      expect(manager.getProgress()).toBe(1)
    })
  })

  describe('跳过问题', () => {
    it('应该能够跳过非必需的问题', () => {
      const optionalQuestion: QuestionDefinition = {
        id: 'optional',
        type: 'followUp',
        text: '可选问题',
        required: false
      }
      manager.addQuestion(optionalQuestion)
      
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      manager.answerQuestion('style', ['xiaohongshu'])
      manager.answerQuestion('sellingPoint', ['性价比'])
      
      const result = manager.skipQuestion('optional')
      expect(result.success).toBe(true)
    })

    it('不应该跳过必需的问题', () => {
      const result = manager.skipQuestion('product')
      expect(result.success).toBe(false)
      expect(result.error).toContain('必需')
    })
  })

  describe('返回上一步', () => {
    it('应该能够返回上一步', () => {
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      manager.answerQuestion('style', ['xiaohongshu'])
      
      expect(manager.getCurrentQuestion()?.id).toBe('sellingPoint')
      
      manager.goToPrevious()
      expect(manager.getCurrentQuestion()?.id).toBe('style')
      
      manager.goToPrevious()
      expect(manager.getCurrentQuestion()?.id).toBe('product')
    })

    it('在第一步时不应该返回', () => {
      expect(manager.getCurrentQuestion()?.id).toBe('product')
      manager.goToPrevious()
      expect(manager.getCurrentQuestion()?.id).toBe('product')
    })
  })

  describe('验证完整性', () => {
    it('应该检查所有必需问题是否已回答', () => {
      expect(manager.isComplete()).toBe(false)
      
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      expect(manager.isComplete()).toBe(false)
      
      manager.answerQuestion('style', ['xiaohongshu'])
      expect(manager.isComplete()).toBe(false)
      
      manager.answerQuestion('sellingPoint', ['性价比'])
      expect(manager.isComplete()).toBe(true)
    })
  })

  describe('获取所有答案', () => {
    it('应该返回所有已回答的问题', () => {
      manager.answerQuestion('product', '这是一款高品质的智能手表')
      manager.answerQuestion('style', ['xiaohongshu', 'ins_minimal'])
      
      const answers = manager.getAllAnswers()
      expect(answers.product).toBe('这是一款高品质的智能手表')
      expect(answers.style).toEqual(['xiaohongshu', 'ins_minimal'])
      expect(answers.sellingPoint).toBeUndefined()
    })
  })
})

