/**
 * 自动规划步骤
 */

import { WorkflowStep, WorkflowContext } from '../../../types'
import { generateMultiContentPlan } from '../../planning/planningService'
import { logger } from '../../../composables/useLogger'

export const planStep: WorkflowStep = {
  id: 'plan',
  name: '自动规划',
  execute: async (context: WorkflowContext) => {
    logger.debug('执行自动规划步骤')
    
    const requirementId = context.requirementId as string
    if (!requirementId) {
      throw new Error('需求分析ID不能为空')
    }

    // 获取需求分析
    const { storage } = await import('../../storage')
    const requirement = await storage.getRequirement(requirementId)
    if (!requirement) {
      throw new Error('需求分析不存在')
    }

    // 从上下文获取规划参数，或使用默认值
    const period = context.period || {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalContents: 7
    }

    const plan = await generateMultiContentPlan(requirement, period)

    context.planId = plan.id
    context.results = context.results || {}
    context.results.plan = { plan }

    return context
  },
  onError: async (error: Error, context: WorkflowContext) => {
    logger.error('自动规划步骤失败:', error)
    context.errors = context.errors || {}
    context.errors.plan = error
    return context
  }
}


