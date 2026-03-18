<template>
  <div :class="['ui-page-container', `ui-page-container--${size}`]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

withDefaults(defineProps<Props>(), {
  size: 'lg'
})
</script>

<style scoped>
.ui-page-container {
  width: 100%;
  margin: 0 auto;
  padding: var(--page-padding);
  position: relative;
  z-index: 1;
  animation: fadeIn var(--duration-normal) var(--ease-out);
  border: none;
  background: transparent;
  box-shadow: none;
}

.ui-page-container--sm {
  max-width: 640px;
}

.ui-page-container--md {
  max-width: 768px;
}

.ui-page-container--lg {
  max-width: var(--container-max-width);
}

.ui-page-container--xl {
  max-width: 1400px;
}

.ui-page-container--full {
  max-width: 100%;
}

@media (max-width: 768px) {
  .ui-page-container {
    padding: var(--spacing-md);
  }
}
</style>




