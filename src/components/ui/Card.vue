<template>
  <div
    :class="[
      'ui-card',
      {
        'ui-card--hover': hover,
        'ui-card--shadow-sm': shadow === 'sm',
        'ui-card--shadow-md': shadow === 'md',
        'ui-card--shadow-lg': shadow === 'lg',
        'ui-card--bordered': bordered
      }
    ]"
  >
    <div v-if="$slots.header" class="ui-card__header">
      <slot name="header" />
    </div>
    <div class="ui-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hover?: boolean
  shadow?: 'sm' | 'md' | 'lg' | 'none'
  bordered?: boolean
}

withDefaults(defineProps<Props>(), {
  hover: true,
  shadow: 'sm',
  bordered: true
})
</script>

<style scoped>
.ui-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-smooth);
  position: relative;
  border: 1px solid var(--border-color);
}

.ui-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 126, 126, 0.1), rgba(74, 142, 255, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  pointer-events: none;
}

.ui-card--bordered {
  border: 1px solid var(--border-color);
}

.ui-card--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.ui-card--shadow-md {
  box-shadow: var(--shadow-md);
}

.ui-card--shadow-lg {
  box-shadow: var(--shadow-lg);
}

.ui-card--hover:hover {
  background: var(--bg-card-hover);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
  border-color: var(--border-hover);
}

.ui-card--hover:hover::before {
  opacity: 1;
}

.ui-card__header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.ui-card__header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0.2;
}

.ui-card__body {
  padding: var(--spacing-xl);
}

.ui-card__footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  background: var(--bg-body);
}
</style>




