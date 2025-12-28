<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="requirement-result-modal" @click.self="handleClose">
        <div class="requirement-result-modal__container">
          <div class="requirement-result-modal__header">
            <h3>分析结果</h3>
            <button class="requirement-result-modal__close" @click="handleClose" title="关闭">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="requirement-result-modal__content">
            <RequirementResult
              :requirement="requirement"
              :confidence="confidence"
              @new-analysis="handleNewAnalysis"
              @confirm-and-plan="handleConfirmAndPlan"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RequirementAnalysis } from '../../types'
import RequirementResult from './RequirementResult.vue'

interface Props {
  visible: boolean
  requirement: RequirementAnalysis | null
  confidence?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'new-analysis'): void
  (e: 'confirm-and-plan'): void
}>()

const handleClose = () => {
  emit('close')
}

const handleNewAnalysis = () => {
  emit('new-analysis')
  handleClose()
}

const handleConfirmAndPlan = () => {
  emit('confirm-and-plan')
  handleClose()
}

// ESC键关闭
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.requirement-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-xl, 24px);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.requirement-result-modal__container {
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04));
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.requirement-result-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg, 20px) var(--spacing-xl, 24px);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-body, #f9fafb);
}

.requirement-result-modal__header h3 {
  margin: 0;
  font-size: var(--font-xl, 20px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
}

.requirement-result-modal__close {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md, 8px);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal, 0.3s) var(--ease-out);
}

.requirement-result-modal__close:hover {
  background: var(--bg-body, #f9fafb);
  color: var(--text-main, #1f2937);
}

.requirement-result-modal__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl, 24px);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal, 0.3s) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .requirement-result-modal__container,
.modal-leave-active .requirement-result-modal__container {
  transition: transform var(--duration-normal, 0.3s) var(--ease-out);
}

.modal-enter-from .requirement-result-modal__container,
.modal-leave-to .requirement-result-modal__container {
  transform: translateY(20px) scale(0.95);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .requirement-result-modal {
    padding: var(--spacing-md, 16px);
  }
  
  .requirement-result-modal__container {
    max-height: 95vh;
  }
  
  .requirement-result-modal__header {
    padding: var(--spacing-md, 16px);
  }
  
  .requirement-result-modal__content {
    padding: var(--spacing-md, 16px);
  }
}
</style>

