/**
 * 发布日历服务
 */

import { PublishSchedule, CalendarEvent, DateRange, CalendarViewType } from '../../types'
import { storage } from '../storage/index'
import { eventBus, Events } from '../events'
import { logger } from '../../composables/useLogger'

/**
 * 生成日历事件
 */
export async function generateCalendarEvents(
  dateRange: DateRange,
  viewType: CalendarViewType = 'month'
): Promise<CalendarEvent[]> {
  const schedules = await storage.listSchedules(dateRange)
  
  // 按日期分组
  const eventsMap = new Map<string, PublishSchedule[]>()
  schedules.forEach(schedule => {
    const date = new Date(schedule.scheduledTime).toISOString().split('T')[0]
    if (!eventsMap.has(date)) {
      eventsMap.set(date, [])
    }
    eventsMap.get(date)!.push(schedule)
  })

  // 转换为CalendarEvent数组
  const events: CalendarEvent[] = []
  eventsMap.forEach((schedules, date) => {
    events.push({
      id: `event_${date}`,
      date,
      schedules
    })
  })

  return events.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 创建发布计划
 */
export async function createSchedule(
  contentPlanId: string,
  scheduledTime: number,
  reminderMinutes: number = 30
): Promise<PublishSchedule> {
  const schedule: PublishSchedule = {
    id: `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    contentPlanId,
    scheduledTime,
    platform: 'xiaohongshu',
    status: 'scheduled',
    reminder: {
      enabled: true,
      advanceMinutes: reminderMinutes
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await storage.saveSchedule(schedule)
  await eventBus.emit(Events.SCHEDULE_CREATED, schedule)
  logger.debug('发布计划已创建:', schedule.id)
  return schedule
}

/**
 * 更新发布计划
 */
export async function updateSchedule(schedule: PublishSchedule): Promise<void> {
  schedule.updatedAt = Date.now()
  await storage.saveSchedule(schedule)
  await eventBus.emit(Events.SCHEDULE_UPDATED, schedule)
  logger.debug('发布计划已更新:', schedule.id)
}

/**
 * 删除发布计划
 */
export async function deleteSchedule(id: string): Promise<void> {
  await storage.deleteSchedule(id)
  await eventBus.emit(Events.SCHEDULE_DELETED, { id })
  logger.debug('发布计划已删除:', id)
}

/**
 * 获取发布计划
 */
export async function getSchedule(id: string): Promise<PublishSchedule | null> {
  return await storage.getSchedule(id)
}

/**
 * 获取日期范围内的发布计划
 */
export async function getSchedulesInRange(dateRange: DateRange): Promise<PublishSchedule[]> {
  return await storage.listSchedules(dateRange)
}

/**
 * 批量创建发布计划（从内容规划同步）
 */
export async function createSchedulesFromPlan(
  plan: { id: string; multi?: { contents: Array<{ id: string; targetDate?: string }> } }
): Promise<PublishSchedule[]> {
  logger.debug('从规划批量创建发布计划:', plan.id)
  
  const schedules: PublishSchedule[] = []
  
  if (plan.multi) {
    for (const content of plan.multi.contents) {
      if (content.targetDate) {
        // 将日期字符串转换为时间戳（假设时间为当天9:00）
        const scheduledTime = new Date(content.targetDate + 'T09:00:00').getTime()
        
        const schedule = await createSchedule(
          content.id,
          scheduledTime,
          30 // 默认提前30分钟提醒
        )
        
        schedules.push(schedule)
      }
    }
  }
  
  logger.info(`批量创建发布计划完成: ${schedules.length} 个`)
  return schedules
}


