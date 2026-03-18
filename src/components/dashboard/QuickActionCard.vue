<template>
  <Card class="quick-action-card" hover @click="$emit('click')">
    <div class="quick-action-card__content">
      <div class="quick-action-card__icon">
        <slot name="icon" />
      </div>
      <div class="quick-action-card__info">
        <div class="quick-action-card__title">{{ title }}</div>
        <div class="quick-action-card__description">{{ description }}</div>
      </div>
      <div class="quick-action-card__arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '../ui/Card.vue'

defineProps<{
  title: string
  description: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.quick-action-card {
  cursor: pointer;
  transition: all var(--duration-normal);
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.quick-action-card__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.quick-action-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-fade);
  color: var(--primary);
  border-radius: var(--radius-md);
}

.quick-action-card__info {
  flex: 1;
  min-width: 0;
}

.quick-action-card__title {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  margin-bottom: var(--spacing-xs);
}

.quick-action-card__description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.quick-action-card__arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
}
</style>


