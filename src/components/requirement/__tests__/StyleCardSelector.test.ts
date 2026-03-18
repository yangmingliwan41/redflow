/**
 * 风格卡片选择器组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StyleCardSelector from '../StyleCardSelector.vue'
import { getAllStyleConfigs } from '../../../config/stylePrompts'

// Mock stylePrompts
vi.mock('../../../config/stylePrompts', () => ({
  getAllStyleConfigs: vi.fn(() => [
    {
      id: 'xiaohongshu',
      name: '小红书爆款风格',
      description: '小红书爆款图文风格，清新、精致、有设计感',
      defaultPrompt: 'test prompt'
    },
    {
      id: 'ins_minimal',
      name: 'INS 极简',
      description: '极简主义Instagram风格，干净简洁',
      defaultPrompt: 'test prompt'
    },
    {
      id: 'tech_future',
      name: '科技未来',
      description: '未来科技风格，现代感强',
      defaultPrompt: 'test prompt'
    }
  ])
}))

describe('StyleCardSelector', () => {
  const mockStyles = getAllStyleConfigs()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该渲染所有风格卡片', () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: []
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      expect(cards.length).toBe(mockStyles.length)
    })

    it('应该显示风格名称和描述', () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: []
        }
      })

      const firstCard = wrapper.find('.style-card-selector-item')
      expect(firstCard.text()).toContain('小红书爆款风格')
    })
  })

  describe('多选功能', () => {
    it('应该能够选择多个风格', async () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: []
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      
      // 点击第一个卡片
      await cards[0].trigger('click')
      
      // 更新props以反映第一次选择
      await wrapper.setProps({ modelValue: ['xiaohongshu'] })
      
      // 点击第二个卡片
      await cards[1].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted!.length).toBe(2)
      expect(emitted![0][0]).toEqual(['xiaohongshu'])
      expect(emitted![1][0]).toEqual(['xiaohongshu', 'ins_minimal'])
    })

    it('应该能够取消选择已选中的风格', async () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: ['xiaohongshu', 'ins_minimal']
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      
      // 再次点击第一个卡片（应该取消选择）
      await cards[0].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted![0][0]).toEqual(['ins_minimal'])
    })
  })

  describe('最小选择限制', () => {
    it('当只有一个选中项时，不应该允许取消选择', async () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: ['xiaohongshu']
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      
      // 尝试取消选择最后一个
      await cards[0].trigger('click')

      // 应该仍然保持选中状态
      expect(cards[0].classes()).toContain('selected')
      
      // 不应该发射更新事件
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeUndefined()
    })

    it('当有多个选中项时，应该允许取消选择', async () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: ['xiaohongshu', 'ins_minimal']
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      
      // 取消选择第一个
      await cards[0].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted![0][0]).toEqual(['ins_minimal'])
    })
  })

  describe('选中状态视觉反馈', () => {
    it('选中的卡片应该有selected类', () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: ['xiaohongshu']
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      expect(cards[0].classes()).toContain('selected')
      expect(cards[1].classes()).not.toContain('selected')
    })

    it('多个选中的卡片都应该有selected类', () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: ['xiaohongshu', 'ins_minimal']
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      expect(cards[0].classes()).toContain('selected')
      expect(cards[1].classes()).toContain('selected')
      expect(cards[2].classes()).not.toContain('selected')
    })
  })

  describe('初始值', () => {
    it('应该正确显示初始选中的风格', () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: ['tech_future']
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      expect(cards[2].classes()).toContain('selected')
    })
  })

  describe('事件发射', () => {
    it('选择变化时应该发射update:modelValue事件', async () => {
      const wrapper = mount(StyleCardSelector, {
        props: {
          modelValue: []
        }
      })

      const cards = wrapper.findAll('.style-card-selector-item')
      await cards[0].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted!.length).toBe(1)
      expect(emitted![0][0]).toEqual(['xiaohongshu'])
    })
  })
})

