<template>
  <div class="calendar">
    <!-- 视图切换 -->
    <div class="calendar__header">
      <div class="calendar__view-switcher">
        <Button
          v-for="view in viewTypes"
          :key="view"
          :variant="currentView === view ? 'primary' : 'ghost'"
          size="sm"
          @click="$emit('view-change', view)"
        >
          {{ getViewLabel(view) }}
        </Button>
      </div>
      <div class="calendar__navigation">
        <Button variant="ghost" size="sm" @click="$emit('prev')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Button>
        <div class="calendar__current-date">{{ currentDateLabel }}</div>
        <Button variant="ghost" size="sm" @click="$emit('next')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Button>
        <Button variant="ghost" size="sm" @click="$emit('today')">
          今天
        </Button>
      </div>
    </div>

    <!-- 日历内容 -->
    <div class="calendar__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarViewType } from '../../types'
import Button from '../ui/Button.vue'

defineProps<{
  currentView: CalendarViewType
  currentDateLabel: string
}>()

defineEmits<{
  'view-change': [view: CalendarViewType]
  prev: []
  next: []
  today: []
}>()

const viewTypes: CalendarViewType[] = ['month', 'week', 'day']

const getViewLabel = (view: CalendarViewType): string => {
  const labels: Record<CalendarViewType, string> = {
    month: '月视图',
    week: '周视图',
    day: '日视图'
  }
  return labels[view]
}
</script>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.calendar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.calendar__view-switcher {
  display: flex;
  gap: var(--spacing-xs);
}

.calendar__navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.calendar__current-date {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  min-width: 200px;
  text-align: center;
}

.calendar__content {
  flex: 1;
}

@media (max-width: 768px) {
  .calendar__header {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar__navigation {
    justify-content: space-between;
  }

  .calendar__current-date {
    min-width: auto;
    flex: 1;
  }
}
</style>


