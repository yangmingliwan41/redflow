<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="ui-modal" @click.self="handleBackdropClick">
        <div class="ui-modal__backdrop" />
        <div
          :class="['ui-modal__container', `ui-modal__container--${size}`]"
          @click.stop
        >
          <div v-if="title || $slots.header" class="ui-modal__header">
            <slot name="header">
              <h3 v-if="title" class="ui-modal__title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              class="ui-modal__close"
              @click="handleClose"
              aria-label="关闭"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="ui-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

// ESC键关闭
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && props.closable) {
    handleClose()
  }
}

// 监听ESC键
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.ui-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.ui-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.ui-modal__container {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  z-index: var(--z-modal);
  overflow: hidden;
  animation: scaleIn var(--duration-normal) var(--ease-spring);
}

.ui-modal__container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-gradient);
  opacity: 0.2;
}

.ui-modal__container--sm {
  width: 100%;
  max-width: 400px;
}

.ui-modal__container--md {
  width: 100%;
  max-width: 600px;
}

.ui-modal__container--lg {
  width: 100%;
  max-width: 800px;
}

.ui-modal__container--xl {
  width: 100%;
  max-width: 1200px;
}

.ui-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.ui-modal__title {
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  margin: 0;
}

.ui-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.ui-modal__close:hover {
  background: var(--bg-body);
  color: var(--text-main);
}

.ui-modal__body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.ui-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-body);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.modal-enter-active .ui-modal__container,
.modal-leave-active .ui-modal__container {
  transition: all var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .ui-modal__container,
.modal-leave-to .ui-modal__container {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>




