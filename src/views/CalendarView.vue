<template>
  <PageContainer size="xl" class="calendar-view">
    <PageHeader
      title="发布日历"
      subtitle="管理和查看内容发布计划"
    >
      <template #actions>
        <Button variant="secondary" @click="$router.push('/')" style="margin-right: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </Button>
        <Button variant="primary" @click="handleCreateSchedule">
          创建发布计划
        </Button>
      </template>
    </PageHeader>

    <!-- 日历组件 -->
    <Calendar
      :current-view="currentView"
      :current-date-label="currentDateLabel"
      @view-change="handleViewChange"
      @prev="handlePrev"
      @next="handleNext"
      @today="handleToday"
    >
      <!-- 月视图 -->
      <div v-if="currentView === 'month'" class="calendar-month">
        <div class="calendar-month__weekdays">
          <div
            v-for="day in weekdays"
            :key="day"
            class="calendar-month__weekday"
          >
            {{ day }}
          </div>
        </div>
        <div class="calendar-month__days">
          <div
            v-for="day in monthDays"
            :key="day.date"
            :class="['calendar-month__day', {
              'calendar-month__day--today': day.isToday,
              'calendar-month__day--other-month': !day.isCurrentMonth
            }]"
          >
            <div class="calendar-month__day-number">{{ day.day }}</div>
            <div class="calendar-month__day-events">
              <CalendarEvent
                v-for="schedule in getSchedulesForDate(day.date)"
                :key="schedule.id"
                :schedule="schedule"
                @click="handleEventClick"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 周视图 -->
      <div v-if="currentView === 'week'" class="calendar-week">
        <div class="calendar-week__header">
          <div
            v-for="day in weekDays"
            :key="day.date"
            :class="['calendar-week__day-header', {
              'calendar-week__day-header--today': day.isToday
            }]"
          >
            <div class="calendar-week__day-name">{{ day.dayName }}</div>
            <div class="calendar-week__day-date">{{ day.day }}</div>
          </div>
        </div>
        <div class="calendar-week__body">
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="calendar-week__day-column"
          >
            <CalendarEvent
              v-for="schedule in getSchedulesForDate(day.date)"
              :key="schedule.id"
              :schedule="schedule"
              @click="handleEventClick"
            />
          </div>
        </div>
      </div>

      <!-- 日视图 -->
      <div v-if="currentView === 'day'" class="calendar-day">
        <div class="calendar-day__header">
          <div class="calendar-day__date">{{ currentDateLabel }}</div>
        </div>
        <div class="calendar-day__hours">
          <div
            v-for="hour in 24"
            :key="hour - 1"
            class="calendar-day__hour"
          >
            <div class="calendar-day__hour-label">{{ formatHour(hour - 1) }}</div>
            <div class="calendar-day__hour-events">
              <CalendarEvent
                v-for="schedule in getSchedulesForHour(hour - 1)"
                :key="schedule.id"
                :schedule="schedule"
                @click="handleEventClick"
              />
            </div>
          </div>
        </div>
      </div>
    </Calendar>

    <!-- 加载状态 -->
    <div v-if="loading" class="calendar-view__loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalendarStore } from '../stores/calendarStore'
import { CalendarViewType, PublishSchedule } from '../types'
import PageContainer from '../components/layout/PageContainer.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import Calendar from '../components/calendar/Calendar.vue'
import CalendarEvent from '../components/calendar/CalendarEvent.vue'
import Button from '../components/ui/Button.vue'

const calendarStore = useCalendarStore()

const currentView = computed(() => calendarStore.currentView)
const loading = computed(() => calendarStore.loading)
const events = computed(() => calendarStore.events)
const schedules = computed(() => calendarStore.schedules)

const currentDate = ref(new Date())
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentDateLabel = computed(() => {
  if (currentView.value === 'month') {
    return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  } else if (currentView.value === 'week') {
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`
  } else {
    return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }
})

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDay = firstDay.getDay()

  const days = []
  const today = new Date() // 将 today 定义移到前面
  
  // 上个月的日期
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = startDay - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonth.getDate() - i)
    days.push({
      date: formatDateString(prevDate),
      day: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: prevDate.toDateString() === today.toDateString()
    })
  }

  // 当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    days.push({
      date: formatDateString(date),
      day: i,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString()
    })
  }

  // 下个月的日期（填满6行）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i)
    days.push({
      date: formatDateString(nextDate),
      day: i,
      isCurrentMonth: false,
      isToday: nextDate.toDateString() === today.toDateString()
    })
  }

  return days
})

const weekDays = computed(() => {
  const weekStart = getWeekStart(currentDate.value)
  const days = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    days.push({
      date: formatDateString(date),
      day: date.getDate(),
      dayName: weekdays[date.getDay()],
      isToday: date.toDateString() === today.toDateString()
    })
  }

  return days
})

const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// 格式化日期为 YYYY-MM-DD（使用本地时区）
const formatDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getSchedulesForDate = (date: string): PublishSchedule[] => {
  return schedules.value.filter(s => {
    const scheduleDate = new Date(s.scheduledTime)
    return formatDateString(scheduleDate) === date
  })
}

const getSchedulesForHour = (hour: number): PublishSchedule[] => {
  const date = formatDateString(currentDate.value)
  
  return schedules.value.filter(s => {
    const scheduleDate = new Date(s.scheduledTime)
    return formatDateString(scheduleDate) === date && scheduleDate.getHours() === hour
  })
}

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const handleViewChange = (view: CalendarViewType) => {
  calendarStore.setView(view)
  loadEvents()
}

const handlePrev = () => {
  if (currentView.value === 'month') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  } else if (currentView.value === 'week') {
    currentDate.value = new Date(currentDate.value.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else {
    currentDate.value = new Date(currentDate.value.getTime() - 24 * 60 * 60 * 1000)
  }
  loadEvents()
}

const handleNext = () => {
  if (currentView.value === 'month') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  } else if (currentView.value === 'week') {
    currentDate.value = new Date(currentDate.value.getTime() + 7 * 24 * 60 * 60 * 1000)
  } else {
    currentDate.value = new Date(currentDate.value.getTime() + 24 * 60 * 60 * 1000)
  }
  loadEvents()
}

const handleToday = () => {
  currentDate.value = new Date()
  loadEvents()
}

const handleEventClick = (schedule: PublishSchedule) => {
  // TODO: 打开详情或编辑
  console.log('点击事件:', schedule)
}

const handleCreateSchedule = () => {
  // TODO: 打开创建发布计划弹窗
  console.log('创建发布计划')
}

const loadEvents = async () => {
  if (currentView.value === 'month') {
    const start = new Date(currentDate.value)
    start.setDate(1)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    await calendarStore.loadEvents({
      start: formatDateString(start),
      end: formatDateString(end)
    }, currentView.value)
  } else if (currentView.value === 'week') {
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    await calendarStore.loadEvents({
      start: formatDateString(weekStart),
      end: formatDateString(weekEnd)
    }, currentView.value)
  } else {
    const date = formatDateString(currentDate.value)
    await calendarStore.loadEvents({
      start: date,
      end: date
    }, currentView.value)
  }
}

onMounted(async () => {
  await loadEvents()
  await calendarStore.initReminderService()
})
</script>

<style scoped>
.calendar-view {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.calendar-month__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.calendar-month__weekday {
  padding: var(--spacing-sm);
  text-align: center;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.calendar-month__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.calendar-month__day {
  min-height: 120px;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.calendar-month__day--today {
  background: var(--primary-fade);
  border-color: var(--primary);
}

.calendar-month__day--other-month {
  opacity: 0.4;
}

.calendar-month__day-number {
  font-weight: var(--font-semibold);
  color: var(--text-main);
  font-size: var(--font-sm);
}

.calendar-month__day-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.calendar-week__header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.calendar-week__day-header {
  padding: var(--spacing-md);
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.calendar-week__day-header--today {
  background: var(--primary-fade);
  border-color: var(--primary);
}

.calendar-week__day-name {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.calendar-week__day-date {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.calendar-week__body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.calendar-week__day-column {
  min-height: 400px;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.calendar-day__header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.calendar-day__date {
  font-size: var(--font-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.calendar-day__hours {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.calendar-day__hour {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.calendar-day__hour-label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  text-align: right;
  padding-top: var(--spacing-xs);
}

.calendar-day__hour-events {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.calendar-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  gap: var(--spacing-md);
}

.calendar-view__loading .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .calendar-month__day {
    min-height: 80px;
  }

  .calendar-week__body {
    overflow-x: auto;
  }

  .calendar-week__day-column {
    min-width: 120px;
  }
}
</style>


