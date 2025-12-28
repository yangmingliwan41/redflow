<template>
  <div
    :class="['calendar-event', `calendar-event--${schedule.status}`]"
    @click="$emit('click', schedule)"
  >
    <div class="calendar-event__time">
      {{ formatTime(schedule.scheduledTime) }}
    </div>
    <div class="calendar-event__content">
      <div class="calendar-event__title">{{ contentTitle }}</div>
      <div class="calendar-event__platform">{{ schedule.platform }}</div>
    </div>
    <div class="calendar-event__status">
      <span :class="['calendar-event__status-badge', `calendar-event__status-badge--${schedule.status}`]">
        {{ getStatusLabel(schedule.status) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PublishSchedule } from '../../types'
import { storage } from '../../services/storage/index'

const props = defineProps<{
  schedule: PublishSchedule
}>()

defineEmits<{
  click: [schedule: PublishSchedule]
}>()

const contentTitle = ref('未命名内容')

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: '草稿',
    scheduled: '已计划',
    published: '已发布',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getContentTitle = async (schedule: PublishSchedule): Promise<string> => {
  try {
    const plan = await storage.getPlan(schedule.contentPlanId)
    if (plan?.planType === 'multi' && plan.multi) {
      const content = plan.multi.contents.find(c => 
        c.publishSchedule.scheduledTime === schedule.scheduledTime
      )
      return content?.title || '未命名内容'
    }
    return '未命名内容'
  } catch {
    return '未命名内容'
  }
}

onMounted(async () => {
  contentTitle.value = await getContentTitle(props.schedule)
})
</script>

<style scoped>
.calendar-event {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal);
}

.calendar-event:hover {
  background: var(--bg-body);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.calendar-event--draft {
  border-left-color: var(--text-secondary);
  opacity: 0.7;
}

.calendar-event--scheduled {
  border-left-color: var(--primary);
}

.calendar-event--published {
  border-left-color: var(--success);
}

.calendar-event--cancelled {
  border-left-color: var(--text-tertiary);
  opacity: 0.5;
}

.calendar-event__time {
  flex-shrink: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  min-width: 60px;
}

.calendar-event__content {
  flex: 1;
  min-width: 0;
}

.calendar-event__title {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-event__platform {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: 2px;
}

.calendar-event__status {
  flex-shrink: 0;
}

.calendar-event__status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.calendar-event__status-badge--draft {
  background: var(--bg-body);
  color: var(--text-secondary);
}

.calendar-event__status-badge--scheduled {
  background: var(--primary-fade);
  color: var(--primary);
}

.calendar-event__status-badge--published {
  background: var(--success-fade);
  color: var(--success);
}

.calendar-event__status-badge--cancelled {
  background: var(--bg-body);
  color: var(--text-tertiary);
}
</style>


