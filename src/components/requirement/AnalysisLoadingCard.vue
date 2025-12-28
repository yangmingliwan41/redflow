<template>
  <div v-if="visible" class="analysis-loading-card" @click.self="handleClose">
    <Card class="analysis-loading-card__content">
      <div class="analysis-loading-card__header">
        <div class="analysis-loading-card__icon">
          <svg v-if="status === 'success'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else-if="status === 'error'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div v-else class="analysis-loading-card__spinner">
            <div class="spinner"></div>
          </div>
        </div>
        <h3 class="analysis-loading-card__title">{{ title }}</h3>
        <p v-if="message" class="analysis-loading-card__message">{{ message }}</p>
      </div>

      <!-- 进度步骤 -->
      <div v-if="status === 'loading'" class="analysis-loading-card__steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="analysis-loading-card__step"
          :class="{ 'active': currentStepIndex === index, 'completed': currentStepIndex > index }"
        >
          <div class="step-indicator">
            <svg v-if="currentStepIndex > index" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step }}</span>
        </div>
      </div>

      <!-- 成功/错误消息 -->
      <div v-if="status === 'success' || status === 'error'" class="analysis-loading-card__result">
        <p class="result-message">{{ resultMessage }}</p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Card from '../ui/Card.vue'

interface Props {
  visible: boolean
  status?: 'loading' | 'success' | 'error'
  title?: string
  message?: string
  currentStep?: number
  totalSteps?: number
  steps?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  status: 'loading',
  title: '正在分析需求',
  message: '',
  currentStep: 0,
  totalSteps: 3,
  steps: () => [
    '分析产品信息',
    '调研平台趋势',
    '生成分析报告'
  ]
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const currentStepIndex = computed(() => props.currentStep - 1)

const resultMessage = computed(() => {
  if (props.status === 'success') {
    return '需求分析完成！正在生成详细报告...'
  } else if (props.status === 'error') {
    return props.message || '分析过程中出现错误，请重试'
  }
  return ''
})

const handleClose = () => {
  if (props.status === 'success' || props.status === 'error') {
    emit('close')
  }
}
</script>

<style scoped>
.analysis-loading-card {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 24px);
  z-index: 1000;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.analysis-loading-card__content {
  max-width: 500px;
  width: 90%;
  padding: var(--spacing-xl);
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.analysis-loading-card__header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.analysis-loading-card__icon {
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
}

.analysis-loading-card__icon svg {
  color: var(--primary, #4a8eff);
}

.analysis-loading-card__icon svg[stroke="currentColor"] {
  color: var(--success, #22c55e);
}

.analysis-loading-card__spinner {
  width: 48px;
  height: 48px;
  position: relative;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary, #4a8eff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.analysis-loading-card__title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-xl, 20px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
}

.analysis-loading-card__message {
  margin: 0;
  font-size: var(--font-sm, 14px);
  color: var(--text-secondary, #6b7280);
}

.analysis-loading-card__steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.analysis-loading-card__step {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md, 8px);
  transition: all var(--duration-normal, 0.3s);
}

.analysis-loading-card__step.active {
  background: var(--primary-light, rgba(74, 142, 255, 0.1));
}

.analysis-loading-card__step.completed {
  opacity: 0.6;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-body, #f5f5f5);
  border: 2px solid var(--border-color, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-sm, 14px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-secondary, #6b7280);
  flex-shrink: 0;
  transition: all var(--duration-normal, 0.3s);
}

.analysis-loading-card__step.active .step-indicator {
  background: var(--primary, #4a8eff);
  border-color: var(--primary, #4a8eff);
  color: white;
}

.analysis-loading-card__step.completed .step-indicator {
  background: var(--success, #22c55e);
  border-color: var(--success, #22c55e);
  color: white;
}

.step-indicator svg {
  color: white;
}

.step-label {
  font-size: var(--font-base, 16px);
  color: var(--text-main, #1f2937);
}

.analysis-loading-card__result {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.result-message {
  margin: 0;
  font-size: var(--font-base, 16px);
  color: var(--text-main, #1f2937);
  line-height: var(--line-height-relaxed, 1.6);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

