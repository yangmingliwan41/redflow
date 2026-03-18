<template>
  <Card class="stats-card" hover>
    <div class="stats-card__content">
      <div class="stats-card__icon" :style="{ background: iconBg }">
        <slot name="icon" />
      </div>
      <div class="stats-card__info">
        <div class="stats-card__label">{{ label }}</div>
        <div class="stats-card__value">{{ value }}</div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '../ui/Card.vue'

defineProps<{
  label: string
  value: string | number
  iconBg?: string
}>()
</script>

<style scoped>
.stats-card__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stats-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
}

.stats-card__info {
  flex: 1;
  min-width: 0;
}

.stats-card__label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stats-card__value {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-main);
}
</style>


