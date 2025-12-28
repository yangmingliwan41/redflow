<template>
  <div class="ui-page-header">
    <div class="ui-page-header__content">
      <div class="ui-page-header__title-section">
        <h1 v-if="title" class="ui-page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="ui-page-header__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="ui-page-header__actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.extra" class="ui-page-header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>

<style scoped>
.ui-page-header {
  margin-bottom: var(--spacing-3xl);
  position: relative;
  z-index: 10;
}

.ui-page-header__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  position: relative;
  z-index: 10;
}

.ui-page-header__title-section {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 10;
}

.ui-page-header__title {
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: var(--line-height-tight);
  letter-spacing: -0.5px;
}

.ui-page-header__subtitle {
  font-size: var(--font-base);
  color: var(--text-sub);
  margin: 0;
  line-height: var(--line-height-relaxed);
  opacity: 0.8;
  position: relative;
  z-index: 10;
}

.ui-page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
  position: relative;
  z-index: 20;
}

.ui-page-header__extra {
  margin-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .ui-page-header__content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ui-page-header__actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .ui-page-header__title {
    font-size: var(--font-2xl);
  }
}
</style>




