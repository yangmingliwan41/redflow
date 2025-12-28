/**
 * 提醒服务
 */

import { PublishSchedule } from '../../types'
import { eventBus, Events } from '../events'
import { logger } from '../../composables/useLogger'

let reminderCheckInterval: number | null = null

/**
 * 启动提醒服务
 */
export function startReminderService(): void {
  if (reminderCheckInterval !== null) {
    return // 已经启动
  }

  // 每分钟检查一次
  reminderCheckInterval = window.setInterval(() => {
    checkReminders()
  }, 60000) // 60秒

  logger.debug('提醒服务已启动')
}

/**
 * 停止提醒服务
 */
export function stopReminderService(): void {
  if (reminderCheckInterval !== null) {
    clearInterval(reminderCheckInterval)
    reminderCheckInterval = null
    logger.debug('提醒服务已停止')
  }
}

/**
 * 检查提醒
 */
async function checkReminders(): Promise<void> {
  try {
    const now = Date.now()
    const { storage } = await import('../storage')
    
    // 检查 storage 和 listSchedules 方法是否存在
    if (!storage || typeof storage.listSchedules !== 'function') {
      logger.warn('存储服务未初始化或listSchedules方法不存在，跳过提醒检查')
      return
    }
    
    // 获取未来24小时内的发布计划
    const tomorrow = new Date(now + 24 * 60 * 60 * 1000)
    const schedules = await storage.listSchedules({
      start: new Date(now).toISOString().split('T')[0],
      end: tomorrow.toISOString().split('T')[0]
    })

    for (const schedule of schedules) {
      if (!schedule.reminder?.enabled || schedule.status !== 'scheduled') {
        continue
      }

      const reminderTime = schedule.scheduledTime - (schedule.reminder.advanceMinutes || 30) * 60 * 1000
      const timeUntilReminder = reminderTime - now

      // 如果到了提醒时间（允许5分钟误差）
      if (timeUntilReminder >= 0 && timeUntilReminder < 5 * 60 * 1000) {
        await triggerReminder(schedule)
      }
    }
  } catch (error) {
    logger.error('检查提醒失败:', error)
  }
}

/**
 * 触发提醒
 */
async function triggerReminder(schedule: PublishSchedule): Promise<void> {
  logger.debug('触发提醒:', schedule.id)

  // 触发事件
  await eventBus.emit(Events.PUBLISH_REMINDER, schedule)

  // 发送浏览器通知
  if ('Notification' in window && Notification.permission === 'granted') {
    const scheduleDate = new Date(schedule.scheduledTime)
    new Notification('发布提醒', {
      body: `您有内容计划在 ${scheduleDate.toLocaleString('zh-CN')} 发布`,
      icon: '/favicon.ico',
      tag: schedule.id
    })
  }
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    logger.warn('浏览器不支持通知')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    logger.warn('通知权限已被拒绝')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}


