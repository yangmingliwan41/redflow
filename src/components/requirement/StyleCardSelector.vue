<template>
  <div class="style-card-selector">
    <div class="style-card-selector-grid">
      <div
        v-for="style in styles"
        :key="style.id"
        class="style-card-selector-item"
        :class="{ 'selected': isSelected(style.id), 'disabled': isDisabled(style.id) }"
        @click="handleCardClick(style.id)"
      >
        <div class="style-image-wrapper">
          <img 
            :src="getImageUrl(style.id)" 
            :alt="style.name" 
            class="style-image"
            loading="lazy"
          />
          <div v-if="isSelected(style.id)" class="selected-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <div class="style-info">
          <h4 class="style-name">{{ style.name }}</h4>
          <div class="style-prompt">
            <p>{{ style.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAllStyleConfigs } from '../../config/stylePrompts'

interface Props {
  modelValue: string[] // 选中的风格ID数组
  minSelection?: number // 最小选择数量，默认1
  disabled?: string[] // 禁用的风格ID数组
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  minSelection: 1,
  disabled: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// 获取所有风格配置
const styles = computed(() => getAllStyleConfigs())

// 获取风格示例图片URL
const getImageUrl = (styleId: string): string => {
  return `/style-examples/${styleId}.png`
}

// 检查风格是否被选中
const isSelected = (styleId: string): boolean => {
  return props.modelValue.includes(styleId)
}

// 检查风格是否被禁用
const isDisabled = (styleId: string): boolean => {
  return props.disabled.includes(styleId)
}

// 处理卡片点击
const handleCardClick = (styleId: string): void => {
  // 如果被禁用，不处理
  if (isDisabled(styleId)) {
    return
  }

  const currentSelection = [...props.modelValue]
  const index = currentSelection.indexOf(styleId)

  if (index > -1) {
    // 如果已选中，尝试取消选择
    // 检查是否满足最小选择限制
    if (currentSelection.length > props.minSelection) {
      currentSelection.splice(index, 1)
      emit('update:modelValue', currentSelection)
    }
    // 如果不满足最小选择限制，不执行任何操作
  } else {
    // 如果未选中，添加到选择列表
    currentSelection.push(styleId)
    emit('update:modelValue', currentSelection)
  }
}
</script>

<style scoped>
.style-card-selector {
  width: 100%;
}

.style-card-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md, 16px);
  width: 100%;
}

.style-card-selector-item {
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  border: 2px solid var(--border-color, #e5e7eb);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  overflow: hidden;
  transition: all var(--duration-normal, 0.3s) var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
  cursor: pointer;
  width: 100%;
  position: relative;
}

.style-card-selector-item:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover, 0 4px 12px rgba(0, 0, 0, 0.15));
  border-color: var(--primary, #4a8eff);
}

.style-card-selector-item.selected {
  border-color: var(--primary, #4a8eff);
  box-shadow: var(--shadow-hover, 0 4px 12px rgba(0, 0, 0, 0.15)), 0 0 0 3px var(--primary-fade, rgba(74, 142, 255, 0.1));
  background: var(--primary-light, rgba(74, 142, 255, 0.05));
}

.style-card-selector-item.selected:hover:not(.disabled) {
  border-color: var(--primary-hover, #3a7eef);
  box-shadow: var(--shadow-hover, 0 4px 12px rgba(0, 0, 0, 0.15)), 0 0 0 3px var(--primary-fade, rgba(74, 142, 255, 0.1));
}

.style-card-selector-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.style-image-wrapper {
  width: 100%;
  padding-top: 133.33%; /* 3:4 比例 */
  position: relative;
  overflow: hidden;
  background: var(--bg-body, #f5f5f5);
}

.style-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-normal, 0.3s) var(--ease-out, ease-out);
}

.style-card-selector-item:hover:not(.disabled) .style-image {
  transform: scale(1.05);
}

.selected-badge {
  position: absolute;
  top: var(--spacing-sm, 8px);
  right: var(--spacing-sm, 8px);
  width: 32px;
  height: 32px;
  background: var(--primary, #4a8eff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.4);
  animation: scaleIn var(--duration-fast, 0.2s) var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
}

.selected-badge svg {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.style-info {
  padding: var(--spacing-md, 16px);
  background: var(--bg-card, #ffffff);
}

.style-name {
  font-size: var(--font-base, 16px);
  font-weight: var(--font-semibold, 600);
  margin: 0 0 var(--spacing-xs, 4px) 0;
  color: var(--text-main, #1f2937);
  font-family: var(--font-family-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.style-card-selector-item.selected .style-name {
  color: var(--primary, #4a8eff);
}

.style-prompt {
  font-size: var(--font-sm, 14px);
  color: var(--text-sub, #6b7280);
  line-height: var(--line-height-relaxed, 1.6);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .style-card-selector-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm, 12px);
  }
  
  .style-info {
    padding: 12px;
  }
  
  .style-name {
    font-size: 14px;
  }
  
  .style-prompt {
    font-size: 13px;
  }
}
</style>

