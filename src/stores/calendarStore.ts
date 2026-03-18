/**
 * 日历状态管理
 */

import { defineStore } from 'pinia'
import { PublishSchedule, CalendarEvent, DateRange, CalendarViewType } from '../types'
import {
  generateCalendarEvents,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedule,
  getSchedulesInRange
} from '../services/calendar/publishCalendar'
import { startReminderService, requestNotificationPermission } from '../services/calendar/reminderService'
import { logger } from '../composables/useLogger'

interface CalendarState {
  currentView: CalendarViewType
  currentDateRange: DateRange | null
  events: CalendarEvent[]
  schedules: PublishSchedule[]
  loading: boolean
  error: string | null
}

export const useCalendarStore = defineStore('calendar', {
  state: (): CalendarState => ({
    currentView: 'month',
    currentDateRange: null,
    events: [],
    schedules: [],
    loading: false,
    error: null
  }),

  getters: {
    hasEvents: (state): boolean => {
      return state.events.length > 0
    },

    schedulesCount: (state): number => {
      return state.schedules.length
    }
  },

  actions: {
    /**
     * 设置视图类型
     */
    setView(view: CalendarViewType): void {
      this.currentView = view
    },

    /**
     * 设置日期范围
     */
    setDateRange(range: DateRange): void {
      this.currentDateRange = range
    },

    /**
     * 加载日历事件
     */
    async loadEvents(dateRange: DateRange, viewType: CalendarViewType = 'month'): Promise<void> {
      this.loading = true
      this.error = null

      try {
        this.currentDateRange = dateRange
        this.currentView = viewType
        this.events = await generateCalendarEvents(dateRange, viewType)
        this.schedules = await getSchedulesInRange(dateRange)
      } catch (error: any) {
        this.error = error.message || '加载日历事件失败'
        logger.error('加载日历事件失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建发布计划
     */
    async createSchedule(
      contentPlanId: string,
      scheduledTime: number,
      reminderMinutes: number = 30
    ): Promise<PublishSchedule> {
      this.loading = true
      this.error = null

      try {
        const schedule = await createSchedule(contentPlanId, scheduledTime, reminderMinutes)
        this.schedules.push(schedule)
        
        // 重新加载事件
        if (this.currentDateRange) {
          await this.loadEvents(this.currentDateRange, this.currentView)
        }

        return schedule
      } catch (error: any) {
        this.error = error.message || '创建发布计划失败'
        logger.error('创建发布计划失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新发布计划
     */
    async updateSchedule(schedule: PublishSchedule): Promise<void> {
      this.loading = true
      this.error = null

      try {
        await updateSchedule(schedule)
        const index = this.schedules.findIndex(s => s.id === schedule.id)
        if (index >= 0) {
          this.schedules[index] = schedule
        }

        // 重新加载事件
        if (this.currentDateRange) {
          await this.loadEvents(this.currentDateRange, this.currentView)
        }
      } catch (error: any) {
        this.error = error.message || '更新发布计划失败'
        logger.error('更新发布计划失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除发布计划
     */
    async removeSchedule(id: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        await deleteSchedule(id)
        this.schedules = this.schedules.filter(s => s.id !== id)

        // 重新加载事件
        if (this.currentDateRange) {
          await this.loadEvents(this.currentDateRange, this.currentView)
        }
      } catch (error: any) {
        this.error = error.message || '删除发布计划失败'
        logger.error('删除发布计划失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 初始化提醒服务
     */
    async initReminderService(): Promise<void> {
      await requestNotificationPermission()
      startReminderService()
    },

    /**
     * 清除错误
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    reset(): void {
      this.currentView = 'month'
      this.currentDateRange = null
      this.events = []
      this.schedules = []
      this.loading = false
      this.error = null
    }
  }
})


