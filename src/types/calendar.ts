/**
 * 日历相关类型定义
 */

// 发布计划
export interface PublishSchedule {
  id: string
  contentPlanId: string
  scheduledTime: number // 时间戳
  platform: 'xiaohongshu'
  status: 'draft' | 'scheduled' | 'published' | 'cancelled'
  reminder: {
    enabled: boolean
    advanceMinutes: number // 提前提醒分钟数
  }
  createdAt: number
  updatedAt: number
}

// 日历事件
export interface CalendarEvent {
  id: string
  date: string // YYYY-MM-DD
  schedules: PublishSchedule[]
}

// 日期范围
export interface DateRange {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
}

// 日历视图类型
export type CalendarViewType = 'month' | 'week' | 'day'


