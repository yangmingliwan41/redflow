/**
 * 发布计划步骤
 */

import { WorkflowStep, WorkflowContext } from '../../../types'
import { createSchedule } from '../../calendar/publishCalendar'
import { logger } from '../../../composables/useLogger'

export const scheduleStep: WorkflowStep = {
  id: 'schedule',
  name: '发布计划',
  execute: async (context: WorkflowContext) => {
    logger.debug('执行发布计划步骤')
    
    const planId = context.planId as string
    if (!planId) {
      throw new Error('规划ID不能为空')
    }

    // 获取规划
    const { storage } = await import('../../storage')
    const plan = await storage.getPlan(planId)
    if (!plan || plan.planType !== 'multi' || !plan.multi) {
      throw new Error('规划不存在或不是多内容规划')
    }

    // 为每篇内容创建发布计划
    const schedules = []
    for (const content of plan.multi.contents) {
      const schedule = await createSchedule(
        planId,
        content.publishSchedule.scheduledTime,
        30 // 提前30分钟提醒
      )
      schedules.push(schedule)
    }

    context.results = context.results || {}
    context.results.schedule = { schedules }

    logger.info('发布计划步骤完成，创建了', schedules.length, '个发布计划')
    return context
  },
  onError: async (error: Error, context: WorkflowContext) => {
    logger.error('发布计划步骤失败:', error)
    context.errors = context.errors || {}
    context.errors.schedule = error
    return context
  }
}


