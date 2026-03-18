<template>
  <div class="create-prompt-view">
    <!-- 标题和进度区域 -->
    <div class="header-section">
      <div class="header-actions-top">
        <button class="btn-back" @click="$router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
      </div>
      <h1 class="main-title">提示词生图</h1>
      <div class="progress-bar-container">
        <div class="progress-bar-track">
          <div 
            class="progress-bar-fill" 
            :style="{ width: currentStepIndex === 0 ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%` }"
          ></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in steps" 
            :key="step.key"
            :class="['step-item', { 
              'active': currentStepIndex === index,
              'completed': currentStepIndex > index
            }]"
          >
            <div class="step-indicator">
              <svg v-if="currentStepIndex > index" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 居中内容区域 -->
    <div class="content-wrapper">
      <div class="content-inner">
        <!-- 复用PromptGenerateView -->
        <PromptGenerateView ref="promptViewRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PromptGenerateView from './PromptGenerateView.vue'

const promptViewRef = ref<InstanceType<typeof PromptGenerateView> | null>(null)

const steps = [
  { key: 'input', label: '输入提示词' },
  { key: 'generating', label: '生成中' },
  { key: 'result', label: '完成' }
]

const isGenerating = computed(() => {
  return promptViewRef.value?.isGenerating ?? false
})

const results = computed(() => {
  return promptViewRef.value?.results ?? []
})

const currentStepIndex = computed(() => {
  if (results.value.length > 0 && !isGenerating.value) {
    return 2 // result
  }
  if (isGenerating.value) {
    return 1 // generating
  }
  return 0 // input
})
</script>

<style scoped>
.create-prompt-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: var(--spacing-2xl) var(--spacing-lg);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.header-section {
  margin-top: var(--spacing-3xl);
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  padding: 0 var(--spacing-lg);
  position: relative;
}

.header-actions-top {
  position: absolute;
  top: 0;
  left: var(--spacing-lg);
  z-index: 10;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-back:hover {
  background: var(--bg-subtle);
  border-color: var(--primary);
  color: var(--primary);
}

.header-section::before {
  content: '';
  position: absolute;
  top: -20px;
  left: var(--spacing-lg);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(74, 142, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.main-title {
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin: 0 0 var(--spacing-2xl) 0;
  letter-spacing: -0.5px;
  position: relative;
  display: block;
  text-align: center;
}

.progress-bar-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.progress-bar-track {
  position: absolute;
  top: 22px;
  left: 22px;
  right: 22px;
  height: 4px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
  z-index: 0;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(74, 142, 255, 0.4);
  min-width: 0;
}

.progress-steps {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  z-index: 1;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  position: relative;
  transition: all var(--duration-normal) var(--ease-spring);
}

.step-indicator {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-base);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.step-number {
  font-weight: var(--font-bold);
  color: var(--text-sub);
}

.step-item.active .step-indicator {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--text-inverse);
  box-shadow: 0 4px 16px rgba(74, 142, 255, 0.3);
  transform: scale(1.1);
}

.step-item.active .step-number {
  color: var(--text-inverse);
}

.step-item.completed .step-indicator {
  background: var(--success);
  border-color: var(--success);
  color: var(--text-inverse);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.step-item.completed .step-indicator svg {
  color: var(--text-inverse);
}

.step-label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-sub);
  white-space: nowrap;
  margin-top: var(--spacing-xs);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.step-item.active .step-label {
  color: var(--primary);
  font-weight: var(--font-semibold);
}

.step-item.completed .step-label {
  color: var(--success);
}

.content-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0 var(--spacing-lg);
}

.content-inner {
  width: 100%;
  max-width: 1400px;
}

/* 覆盖 PromptGenerateView 的样式，优化布局 */
.content-inner :deep(.prompt-generate-container) {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  width: 100%;
}

.content-inner :deep(.input-panel) {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  padding: var(--spacing-2xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.content-inner :deep(.input-panel::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
  opacity: 0.4;
}

.content-inner :deep(.form-group) {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-body);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--duration-normal) var(--ease-out);
}

.content-inner :deep(.form-group:hover) {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.content-inner :deep(.form-group label) {
  display: block;
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  font-size: var(--font-sm);
}

.content-inner :deep(.batch-input) {
  width: 100%;
  padding: var(--spacing-xl);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: var(--font-base);
  font-family: inherit;
  resize: vertical;
  background: var(--bg-card);
  color: var(--text-main);
  transition: all var(--duration-normal) var(--ease-out);
  min-height: 200px;
}

.content-inner :deep(.batch-input:focus) {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
  transform: translateY(-2px);
}

/* 隐藏风格展示区域 */
.content-inner :deep(.style-examples-section) {
  display: none;
}
</style>




