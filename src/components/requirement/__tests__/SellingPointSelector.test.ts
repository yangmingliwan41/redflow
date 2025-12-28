/**
 * 卖点标签选择器组件测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SellingPointSelector from '../SellingPointSelector.vue'

describe('SellingPointSelector', () => {
  describe('组件渲染', () => {
    it('应该渲染所有预设卖点标签', () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: []
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      expect(tags.length).toBeGreaterThan(0)
    })

    it('应该显示预设卖点标签文本', () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: []
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const tagTexts = tags.map(tag => tag.text())
      
      // 检查是否包含预设的卖点
      expect(tagTexts).toContain('性价比')
      expect(tagTexts).toContain('品质')
      expect(tagTexts).toContain('颜值')
    })
  })

  describe('多选功能', () => {
    it('应该能够选择多个卖点', async () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: []
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      
      // 点击第一个标签
      await tags[0].trigger('click')
      
      // 更新props
      await wrapper.setProps({ modelValue: [tags[0].text()] })
      
      // 点击第二个标签
      await tags[1].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted!.length).toBe(2)
    })

    it('应该能够取消选择已选中的卖点', async () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: ['性价比', '品质']
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const firstTag = tags.find(tag => tag.text() === '性价比')
      
      if (firstTag) {
        await firstTag.trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeDefined()
        expect(emitted![0][0]).not.toContain('性价比')
        expect(emitted![0][0]).toContain('品质')
      }
    })
  })

  describe('选中状态视觉反馈', () => {
    it('选中的标签应该有selected类', () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: ['性价比']
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const selectedTag = tags.find(tag => tag.text() === '性价比')
      
      expect(selectedTag?.classes()).toContain('selected')
    })

    it('未选中的标签不应该有selected类', () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: ['性价比']
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const unselectedTag = tags.find(tag => tag.text() === '品质')
      
      expect(unselectedTag?.classes()).not.toContain('selected')
    })
  })

  describe('最小选择限制', () => {
    it('当只有一个选中项时，不应该允许取消选择', async () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: ['性价比']
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const selectedTag = tags.find(tag => tag.text() === '性价比')
      
      if (selectedTag) {
        await selectedTag.trigger('click')

        // 应该仍然保持选中状态
        expect(selectedTag.classes()).toContain('selected')
        
        // 不应该发射更新事件
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeUndefined()
      }
    })

    it('当有多个选中项时，应该允许取消选择', async () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: ['性价比', '品质']
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const firstTag = tags.find(tag => tag.text() === '性价比')
      
      if (firstTag) {
        await firstTag.trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeDefined()
        expect(emitted![0][0]).not.toContain('性价比')
      }
    })
  })

  describe('初始值', () => {
    it('应该正确显示初始选中的卖点', () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: ['颜值', '功能']
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      const selectedTags = tags.filter(tag => 
        tag.text() === '颜值' || tag.text() === '功能'
      )
      
      selectedTags.forEach(tag => {
        expect(tag.classes()).toContain('selected')
      })
    })
  })

  describe('事件发射', () => {
    it('选择变化时应该发射update:modelValue事件', async () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: []
        }
      })

      const tags = wrapper.findAll('.selling-point-tag')
      await tags[0].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted!.length).toBe(1)
      expect(emitted![0][0]).toContain(tags[0].text())
    })
  })

  describe('自定义卖点（如果支持）', () => {
    it('应该支持显示自定义卖点', () => {
      const wrapper = mount(SellingPointSelector, {
        props: {
          modelValue: [],
          allowCustom: true
        }
      })

      // 检查是否有自定义输入框
      const customInput = wrapper.find('.custom-selling-point-input')
      expect(customInput.exists()).toBe(true)
    })
  })
})

