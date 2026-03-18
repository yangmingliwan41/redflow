<template>
  <div class="requirement-input">
    <label class="requirement-input__label">输入你的需求</label>
    <textarea
      v-model="input"
      placeholder="例如：推广新款口红，目标用户是18-25岁女性"
      class="requirement-input__textarea"
      rows="4"
      @input="handleInput"
    ></textarea>
    <div class="requirement-input__hint">
      提示：描述你的内容创作需求，系统会自动分析主题、目标受众和内容类型
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string]
}>()

const input = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  input.value = newVal
})

const handleInput = () => {
  emit('update:modelValue', input.value)
  emit('input', input.value)
}
</script>

<style scoped>
.requirement-input {
  margin-bottom: var(--spacing-lg);
}

.requirement-input__label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
}

.requirement-input__textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: inherit;
  resize: vertical;
  transition: border-color var(--duration-normal);
}

.requirement-input__textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.requirement-input__hint {
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}
</style>


