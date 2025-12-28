<template>
  <div class="create-text-view" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
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
      <h1 class="main-title">文本生成模式</h1>
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
        <!-- 复用HomeView的文本生成模式 -->
        <HomeView mode="text" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, inject, ref } from 'vue'
import { useTextGeneratorStore } from '@/stores/textGenerator'
import HomeView from './HomeView.vue'

const store = useTextGeneratorStore()

// 注入侧边栏收起状态
const sidebarCollapsed = inject<{ value: boolean }>('sidebarCollapsed', ref(false))
const isSidebarCollapsed = computed(() => sidebarCollapsed?.value || false)

const steps = [
  { key: 'input', label: '输入主题' },
  { key: 'outline', label: '生成大纲' },
  { key: 'generating', label: '生成图片' },
  { key: 'result', label: '完成' }
]

// 确保 stage 与 topic 状态一致
const ensureStageConsistency = () => {
  // 如果 topic 为空，应该回到 input 阶段
  if (!store.topic.trim()) {
    if (store.stage !== 'input') {
      store.stage = 'input'
    }
  }
}

// 组件挂载时检查并修正状态
onMounted(() => {
  ensureStageConsistency()
})

// 监听 topic 变化，如果 topic 被清空，重置 stage
watch(() => store.topic, () => {
  ensureStageConsistency()
})

const stage = computed(() => store.stage)

const currentStepIndex = computed(() => {
  const index = steps.findIndex(step => step.key === stage.value)
  // 如果找不到匹配的步骤，默认返回 0（输入主题）
  return index >= 0 ? index : 0
})
</script>

<style scoped>
.create-text-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: var(--spacing-2xl) var(--spacing-lg);
  max-width: min(1600px, calc(100% - var(--spacing-2xl)));
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
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
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.btn-back:hover {
  background: var(--bg-subtle);
  color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
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
  border: none;
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

/* 覆盖 HomeView 的样式，优化布局 */
.content-inner :deep(.text-mode) {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  width: 100%;
  align-items: center;
}

.content-inner :deep(.input-section) {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-2xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: none;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  margin: 0 auto;
}

.content-inner :deep(.input-section::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
  opacity: 0.4;
}

.content-inner :deep(.text-options) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--bg-body);
  border-radius: var(--radius-lg);
  border: none;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-shadow: var(--shadow-sm);
}

.content-inner :deep(.text-options::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-gradient);
  opacity: 0.3;
}

.content-inner :deep(.text-options .option-item) {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: stretch;
}

.content-inner :deep(.text-options .option-item label) {
  text-align: left;
  width: 100%;
}

.content-inner :deep(.text-options .text-option-select) {
  width: 100%;
  text-align: left;
  text-align-last: left;
}

.content-inner :deep(.topic-input) {
  width: 100%;
  padding: var(--spacing-xl);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-base);
  font-family: inherit;
  resize: vertical;
  background: var(--bg-card);
  color: var(--text-main);
  transition: all var(--duration-normal) var(--ease-out);
  min-height: 140px;
  box-shadow: var(--shadow-sm);
}

.content-inner :deep(.topic-input:focus) {
  outline: none;
  box-shadow: var(--shadow-focus);
  transform: translateY(-2px);
  background: var(--bg-card-hover);
}

/* 风格展示区域优化 */
.content-inner :deep(.style-examples-section) {
  width: 100%;
  max-width: 1400px;
  margin-top: var(--spacing-3xl);
}

.content-inner :deep(.style-examples-grid) {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  width: 100%;
}

@media (max-width: 1200px) {
  .content-inner :deep(.style-examples-grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .content-inner :deep(.style-examples-grid) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>




