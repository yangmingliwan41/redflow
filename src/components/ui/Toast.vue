<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="ui-toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['ui-toast', `ui-toast--${toast.type}`]"
      >
        <div class="ui-toast__icon">
          <component :is="getIcon(toast.type)" />
        </div>
        <div class="ui-toast__content">
          <div v-if="toast.title" class="ui-toast__title">{{ toast.title }}</div>
          <div class="ui-toast__message">{{ toast.message }}</div>
        </div>
        <button
          v-if="toast.closable"
          class="ui-toast__close"
          @click="removeToast(toast.id)"
          aria-label="关闭"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { generateId } from '@/utils/string'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
  closable?: boolean
}

const toasts = ref<Toast[]>([])

const getIcon = (type: ToastType) => {
  const icons = {
    success: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
      [h('path', { d: 'M20 6L9 17l-5-5' })]
    ),
    error: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
      [h('circle', { cx: 12, cy: 12, r: 10 }), h('line', { x1: 12, y1: 8, x2: 12, y2: 12 }), h('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 })]
    ),
    warning: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
      [h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }), h('line', { x1: 12, y1: 9, x2: 12, y2: 13 }), h('line', { x1: 12, y1: 17, x2: 12.01, y2: 17 })]
    ),
    info: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 },
      [h('circle', { cx: 12, cy: 12, r: 10 }), h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }), h('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 })]
    )
  }
  return icons[type]
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = generateId()
  const newToast: Toast = {
    id,
    closable: true,
    duration: 3000,
    ...toast
  }
  
  toasts.value.push(newToast)
  
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
  
  return id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const clearAll = () => {
  toasts.value = []
}

// 导出方法供外部使用
defineExpose({
  addToast,
  removeToast,
  clearAll
})
</script>

<style scoped>
.ui-toast-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-tooltip);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  pointer-events: none;
}

.ui-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
  animation: slideInRight var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.ui-toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  border-radius: var(--radius-full) 0 0 var(--radius-full);
}

.ui-toast--success::before {
  background: var(--success-gradient);
}

.ui-toast--error::before {
  background: var(--error-gradient);
}

.ui-toast--warning::before {
  background: var(--warning-gradient);
}

.ui-toast--info::before {
  background: var(--info-gradient);
}

.ui-toast__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.ui-toast--success .ui-toast__icon {
  color: var(--success);
}

.ui-toast--error .ui-toast__icon {
  color: var(--error);
}

.ui-toast--warning .ui-toast__icon {
  color: var(--warning);
}

.ui-toast--info .ui-toast__icon {
  color: var(--info);
}

.ui-toast__content {
  flex: 1;
  min-width: 0;
}

.ui-toast__title {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  margin-bottom: var(--spacing-xs);
}

.ui-toast__message {
  font-size: var(--font-sm);
  color: var(--text-sub);
  line-height: var(--line-height-normal);
}

.ui-toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
  margin-top: 2px;
}

.ui-toast__close:hover {
  background: var(--bg-body);
  color: var(--text-main);
  transform: scale(1.1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active {
  animation: slideInRight var(--duration-normal) var(--ease-out);
}

.toast-leave-active {
  animation: slideOutRight var(--duration-normal) var(--ease-out);
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>




