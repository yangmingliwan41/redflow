<template>
  <Card v-if="conflicts.length > 0" class="conflict-list">
    <template #header>
      <div class="conflict-list__header">
        <h3 class="conflict-list__title">冲突检测结果</h3>
        <span class="conflict-list__count">{{ conflicts.length }} 个问题</span>
      </div>
    </template>

    <div class="conflict-list__content">
      <div
        v-for="conflict in conflicts"
        :key="conflict.id"
        :class="['conflict-item', `conflict-item--${conflict.severity}`]"
      >
        <div class="conflict-item__icon">
          <svg
            v-if="conflict.severity === 'high'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg
            v-else-if="conflict.severity === 'medium'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="conflict-item__content">
          <div class="conflict-item__description">{{ conflict.description }}</div>
          <div class="conflict-item__suggestion">{{ conflict.suggestion }}</div>
          <div v-if="conflict.autoResolvable" class="conflict-item__auto-resolve">
            可自动解决
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ConflictIssue } from '../../types'
import Card from '../ui/Card.vue'

defineProps<{
  conflicts: ConflictIssue[]
}>()
</script>

<style scoped>
.conflict-list {
  margin-top: var(--spacing-lg);
}

.conflict-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conflict-list__title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.conflict-list__count {
  padding: 4px 12px;
  background: var(--error-fade);
  color: var(--error);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.conflict-list__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.conflict-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border-left: 4px solid;
}

.conflict-item--high {
  background: var(--error-fade);
  border-left-color: var(--error);
}

.conflict-item--medium {
  background: var(--warning-fade);
  border-left-color: var(--warning);
}

.conflict-item--low {
  background: var(--bg-body);
  border-left-color: var(--text-secondary);
}

.conflict-item__icon {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.conflict-item--high .conflict-item__icon {
  color: var(--error);
}

.conflict-item--medium .conflict-item__icon {
  color: var(--warning);
}

.conflict-item--low .conflict-item__icon {
  color: var(--text-secondary);
}

.conflict-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.conflict-item__description {
  font-weight: var(--font-medium);
  color: var(--text-main);
}

.conflict-item__suggestion {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.conflict-item__auto-resolve {
  display: inline-block;
  margin-top: var(--spacing-xs);
  padding: 2px 8px;
  background: var(--primary-fade);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}
</style>


