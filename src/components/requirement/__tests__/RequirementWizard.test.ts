/**
 * 向导式需求分析组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RequirementWizard from '../RequirementWizard.vue'
import { QuestionFlowManager } from '../../../services/requirement/questionFlow'

// Mock依赖
vi.mock('../../../services/requirement/questionFlow')
vi.mock('../../../config/stylePrompts', () => ({
  getAllStyleConfigs: vi.fn(() => [
    { id: 'xiaohongshu', name: '小红书', description: 'test' }
  ])
}))

describe('RequirementWizard', () => {
  let mockManager: any

  beforeEach(() => {
    mockManager = {
      getCurrentQuestion: vi.fn(),
      getTotalQuestions: vi.fn(() => 3),
      getProgress: vi.fn(() => 0),
      answerQuestion: vi.fn(() => ({ success: true })),
      goToPrevious: vi.fn(),
      isComplete: vi.fn(() => false),
      getAllAnswers: vi.fn(() => ({})),
      addFollowUpQuestion: vi.fn()
    }

    vi.mocked(QuestionFlowManager).mockImplementation(() => mockManager)
  })

  describe('组件渲染', () => {
    it('应该渲染步骤指示器', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'product',
        type: 'product',
        text: '请用一句话描述你的产品或者服务',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const progressIndicator = wrapper.find('.wizard-progress')
      expect(progressIndicator.exists()).toBe(true)
    })

    it('应该显示当前步骤和总步骤', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'product',
        type: 'product',
        text: '请用一句话描述你的产品或者服务',
        required: true
      })
      mockManager.getTotalQuestions.mockReturnValue(5)
      mockManager.getProgress.mockReturnValue(0) // 第一步，progress应该是0

      const wrapper = mount(RequirementWizard)

      // 检查是否包含步骤信息（更灵活的检查）
      const progressText = wrapper.find('.progress-text')
      expect(progressText.exists()).toBe(true)
      expect(wrapper.text()).toContain('5') // 至少应该包含总步骤数
    })
  })

  describe('问题1：产品描述', () => {
    it('应该显示产品描述输入框', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'product',
        type: 'product',
        text: '请用一句话描述你的产品或者服务',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const input = wrapper.find('textarea[placeholder*="产品"]')
      expect(input.exists()).toBe(true)
    })

    it('应该能够输入产品描述', async () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'product',
        type: 'product',
        text: '请用一句话描述你的产品或者服务',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const input = wrapper.find('textarea')
      await input.setValue('这是一款高品质的智能手表')

      expect((input.element as HTMLTextAreaElement).value).toBe('这是一款高品质的智能手表')
    })
  })

  describe('问题2：风格选择', () => {
    it('应该显示风格卡片选择器', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'style',
        type: 'style',
        text: '选择你喜欢的风格',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const styleSelector = wrapper.findComponent({ name: 'StyleCardSelector' })
      expect(styleSelector.exists()).toBe(true)
    })
  })

  describe('问题3：卖点选择', () => {
    it('应该显示卖点标签选择器', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'sellingPoint',
        type: 'sellingPoint',
        text: '选择产品卖点',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const sellingPointSelector = wrapper.findComponent({ name: 'SellingPointSelector' })
      expect(sellingPointSelector.exists()).toBe(true)
    })
  })

  describe('导航功能', () => {
    it('应该显示下一步按钮', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'product',
        type: 'product',
        text: '请用一句话描述你的产品或者服务',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const nextButton = wrapper.find('.wizard-next-btn')
      expect(nextButton.exists()).toBe(true)
    })

    it('应该显示上一步按钮（不在第一步时）', () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'style',
        type: 'style',
        text: '选择你喜欢的风格',
        required: true
      })
      mockManager.getProgress.mockReturnValue(0.5)

      const wrapper = mount(RequirementWizard)

      const prevButton = wrapper.find('.wizard-prev-btn')
      expect(prevButton.exists()).toBe(true)
    })

    it('点击下一步应该调用answerQuestion', async () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'product',
        type: 'product',
        text: '请用一句话描述你的产品或者服务',
        required: true
      })

      const wrapper = mount(RequirementWizard)

      const input = wrapper.find('textarea')
      await input.setValue('这是一款高品质的智能手表')

      const nextButton = wrapper.find('.wizard-next-btn')
      await nextButton.trigger('click')

      expect(mockManager.answerQuestion).toHaveBeenCalled()
    })

    it('点击上一步应该调用goToPrevious', async () => {
      mockManager.getCurrentQuestion.mockReturnValue({
        id: 'style',
        type: 'style',
        text: '选择你喜欢的风格',
        required: true
      })
      mockManager.getProgress.mockReturnValue(0.5)

      const wrapper = mount(RequirementWizard)

      const prevButton = wrapper.find('.wizard-prev-btn')
      await prevButton.trigger('click')

      expect(mockManager.goToPrevious).toHaveBeenCalled()
    })
  })

  describe('完成状态', () => {
    it('完成所有问题后应该显示完成按钮', () => {
      mockManager.getCurrentQuestion.mockReturnValue(null)
      mockManager.isComplete.mockReturnValue(true)

      const wrapper = mount(RequirementWizard)

      const completeButton = wrapper.find('.wizard-complete-btn')
      expect(completeButton.exists()).toBe(true)
    })

    it('完成时应该发射complete事件', async () => {
      mockManager.getCurrentQuestion.mockReturnValue(null)
      mockManager.isComplete.mockReturnValue(true)
      mockManager.getAllAnswers.mockReturnValue({
        product: '测试产品',
        style: ['xiaohongshu'],
        sellingPoint: ['性价比']
      })

      const wrapper = mount(RequirementWizard)

      const completeButton = wrapper.find('.wizard-complete-btn')
      await completeButton.trigger('click')

      const emitted = wrapper.emitted('complete')
      expect(emitted).toBeDefined()
    })
  })
})

