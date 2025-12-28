<template>
  <div class="selling-point-selector">
    <div class="selling-point-tags">
      <button
        v-for="point in defaultSellingPoints"
        :key="point"
        class="selling-point-tag"
        :class="{ 'selected': isSelected(point) }"
        @click="handleTagClick(point)"
      >
        {{ point }}
      </button>
    </div>
    
    <!-- 自定义卖点输入（可选） -->
    <div v-if="allowCustom" class="custom-selling-point-section">
      <input
        v-model="customPoint"
        type="text"
        class="custom-selling-point-input"
        placeholder="输入自定义卖点..."
        @keyup.enter="addCustomPoint"
        @blur="addCustomPoint"
      />
      <button
        class="add-custom-btn"
        @click="addCustomPoint"
        :disabled="!customPoint.trim()"
      >
        添加
      </button>
    </div>
    
    <!-- 显示自定义卖点 -->
    <div v-if="customPoints.length > 0" class="custom-points-section">
      <div class="custom-points-label">自定义卖点：</div>
      <div class="selling-point-tags">
        <button
          v-for="point in customPoints"
          :key="`custom-${point}`"
          class="selling-point-tag custom"
          :class="{ 'selected': isSelected(point) }"
          @click="handleTagClick(point)"
        >
          {{ point }}
          <span class="remove-custom" @click.stop="removeCustomPoint(point)">×</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string[] // 选中的卖点数组
  minSelection?: number // 最小选择数量，默认1
  allowCustom?: boolean // 是否允许自定义卖点
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  minSelection: 1,
  allowCustom: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// 预设卖点
const defaultSellingPoints = [
  '性价比',
  '品质',
  '颜值',
  '功能',
  '服务',
  '品牌',
  '创新',
  '环保',
  '健康',
  '便捷'
]

// 自定义卖点
const customPoint = ref('')
const customPoints = ref<string[]>([])

// 检查卖点是否被选中
const isSelected = (point: string): boolean => {
  return props.modelValue.includes(point)
}

// 处理标签点击
const handleTagClick = (point: string): void => {
  const currentSelection = [...props.modelValue]
  const index = currentSelection.indexOf(point)

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
    currentSelection.push(point)
    emit('update:modelValue', currentSelection)
  }
}

// 添加自定义卖点
const addCustomPoint = (): void => {
  const trimmed = customPoint.value.trim()
  if (trimmed && !defaultSellingPoints.includes(trimmed) && !customPoints.value.includes(trimmed)) {
    customPoints.value.push(trimmed)
    customPoint.value = ''
    
    // 自动选中新添加的自定义卖点
    const currentSelection = [...props.modelValue]
    currentSelection.push(trimmed)
    emit('update:modelValue', currentSelection)
  }
}

// 移除自定义卖点
const removeCustomPoint = (point: string): void => {
  const index = customPoints.value.indexOf(point)
  if (index > -1) {
    customPoints.value.splice(index, 1)
    
    // 如果该卖点被选中，从选中列表中移除
    const currentSelection = props.modelValue.filter(p => p !== point)
    if (currentSelection.length >= props.minSelection) {
      emit('update:modelValue', currentSelection)
    }
  }
}
</script>

<style scoped>
.selling-point-selector {
  width: 100%;
}

.selling-point-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
}

.selling-point-tag {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-full, 9999px);
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #1f2937);
  font-size: var(--font-sm, 14px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s) var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
  position: relative;
  white-space: nowrap;
}

.selling-point-tag:hover {
  border-color: var(--primary, #4a8eff);
  background: var(--primary-light, rgba(74, 142, 255, 0.05));
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
}

.selling-point-tag.selected {
  border-color: var(--primary, #4a8eff);
  background: var(--primary, #4a8eff);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.3);
}

.selling-point-tag.selected:hover {
  background: var(--primary-hover, #3a7eef);
  border-color: var(--primary-hover, #3a7eef);
}

.selling-point-tag.custom {
  padding-right: var(--spacing-lg, 24px);
}

.remove-custom {
  position: absolute;
  right: var(--spacing-xs, 4px);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background var(--duration-fast, 0.2s);
}

.selling-point-tag.selected .remove-custom {
  background: rgba(255, 255, 255, 0.2);
}

.remove-custom:hover {
  background: rgba(0, 0, 0, 0.2);
}

.selling-point-tag.selected .remove-custom:hover {
  background: rgba(255, 255, 255, 0.3);
}

.custom-selling-point-section {
  display: flex;
  gap: var(--spacing-sm, 8px);
  margin-top: var(--spacing-md, 16px);
  padding-top: var(--spacing-md, 16px);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.custom-selling-point-input {
  flex: 1;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-sm, 14px);
  transition: border-color var(--duration-normal, 0.3s);
}

.custom-selling-point-input:focus {
  outline: none;
  border-color: var(--primary, #4a8eff);
}

.add-custom-btn {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 2px solid var(--primary, #4a8eff);
  border-radius: var(--radius-md, 8px);
  background: var(--primary, #4a8eff);
  color: white;
  font-size: var(--font-sm, 14px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s);
}

.add-custom-btn:hover:not(:disabled) {
  background: var(--primary-hover, #3a7eef);
  border-color: var(--primary-hover, #3a7eef);
}

.add-custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-points-section {
  margin-top: var(--spacing-md, 16px);
  padding-top: var(--spacing-md, 16px);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.custom-points-label {
  font-size: var(--font-sm, 14px);
  color: var(--text-sub, #6b7280);
  margin-bottom: var(--spacing-sm, 8px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .selling-point-tag {
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .custom-selling-point-section {
    flex-direction: column;
  }
  
  .add-custom-btn {
    width: 100%;
  }
}
</style>

