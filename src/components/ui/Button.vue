<template>
  <button
    :class="[
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      {
        'ui-button--loading': loading,
        'ui-button--block': block,
        'ui-button--disabled': disabled
      }
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="ui-button__spinner">
      <svg class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>
    <span v-if="$slots.icon && !loading" class="ui-button__icon">
      <slot name="icon" />
    </span>
    <span class="ui-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.ui-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  z-index: 20;
  pointer-events: auto;
}

.ui-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.ui-button--disabled,
.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 尺寸 */
.ui-button--sm {
  padding: 6px 12px;
  font-size: var(--font-xs);
  min-height: 28px;
}

.ui-button--md {
  padding: 10px 20px;
  font-size: var(--font-sm);
  min-height: 36px;
}

.ui-button--lg {
  padding: 12px 24px;
  font-size: var(--font-base);
  min-height: 44px;
}

/* 变体 */
.ui-button--primary {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.ui-button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--duration-slow) var(--ease-out);
}

.ui-button--primary:hover:not(:disabled):not(.ui-button--loading) {
  background: var(--primary-gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.ui-button--primary:hover:not(:disabled):not(.ui-button--loading)::before {
  left: 100%;
}

.ui-button--primary:active:not(:disabled):not(.ui-button--loading) {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.ui-button--secondary {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.ui-button--secondary:hover:not(:disabled):not(.ui-button--loading) {
  border-color: var(--primary);
  background: var(--bg-body);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.15);
}

.ui-button--danger {
  background: var(--error);
  color: var(--text-inverse);
}

.ui-button--danger:hover:not(:disabled):not(.ui-button--loading) {
  background: var(--error-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.ui-button--ghost {
  background: transparent;
  color: var(--text-main);
  border: 1px solid transparent;
}

.ui-button--ghost:hover:not(:disabled):not(.ui-button--loading) {
  background: var(--primary-fade);
  color: var(--primary);
}

/* 块级按钮 */
.ui-button--block {
  width: 100%;
}

/* 加载状态 */
.ui-button--loading {
  pointer-events: none;
}

.ui-button__spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ui-button__spinner .spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.6s linear infinite;
}

.ui-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ui-button__content {
  display: inline-flex;
  align-items: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>




