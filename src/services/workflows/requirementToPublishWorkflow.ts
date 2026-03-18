/**
 * 完整工作流：从需求分析到发布
 * 需求分析 → 内容规划生成 → 客户确认 → 内容生产 → 同步发布日历 → 企业微信通知
 */

import { RequirementAnalysis, ContentPlan } from '../../types'
import { analyzeAndSaveRequirement, WizardInputData } from '../requirement/requirementAnalysis'
import { generatePlanFromRequirement, confirmPlan } from '../planning/planningService'
import { generateContentFromPlan } from './contentProduction'
import { createSchedulesFromPlan } from '../calendar/publishCalendar'
import { sendContentGeneratedNotification, sendPublishReminder } from '../notification/wechatWork'
import { logger } from '../../composables/useLogger'

export interface WorkflowResult {
  requirementId: string
  planId: string
  contentResults: any[]
  scheduleIds: string[]
  success: boolean
  error?: string
}

/**
 * 执行完整工作流
 */
export async function executeRequirementToPublishWorkflow(
  wizardData: WizardInputData,
  period: { startDate: string; endDate: string; totalContents: number },
  userId?: string
): Promise<WorkflowResult> {
  logger.info('开始执行完整工作流')
  
  try {
    // 1. 需求分析
    logger.debug('步骤1: 需求分析')
    const requirementResult = await analyzeAndSaveRequirement(wizardData, userId)
    const requirement = requirementResult.requirement
    
    // 2. 生成内容规划
    logger.debug('步骤2: 生成内容规划')
    const plan = await generatePlanFromRequirement(requirement, period)
    
    // 3. 等待客户确认（这里假设已确认，实际应该由UI触发）
    // 在实际使用中，应该等待用户通过PlanConfirmationModal确认
    logger.debug('步骤3: 确认规划')
    await confirmPlan(plan.id)
    
    // 4. 内容生产
    logger.debug('步骤4: 内容生产')
    const contentPlan: ContentPlan = {
      id: plan.id,
      requirementId: requirement.id,
      planType: 'multi',
      multi: plan,
      confirmed: true,
      confirmedAt: Date.now(),
      createdAt: Date.now()
    }
    const contentResults = await generateContentFromPlan(contentPlan)
    
    // 5. 同步到发布日历
    logger.debug('步骤5: 同步发布日历')
    const schedules = await createSchedulesFromPlan(plan)
    const scheduleIds = schedules.map(s => s.id)
    
    // 6. 发送企业微信通知
    logger.debug('步骤6: 发送企业微信通知')
    await sendContentGeneratedNotification(contentResults.length, contentResults.length)
    
    // 为每个发布计划发送提醒（可选）
    for (const schedule of schedules) {
      // 这里可以设置定时任务，在发布前发送提醒
      // 暂时跳过，后续可以集成定时任务系统
    }
    
    logger.info('完整工作流执行成功')
    
    return {
      requirementId: requirement.id,
      planId: plan.id,
      contentResults,
      scheduleIds,
      success: true
    }
  } catch (error: any) {
    logger.error('完整工作流执行失败:', error)
    
    return {
      requirementId: '',
      planId: '',
      contentResults: [],
      scheduleIds: [],
      success: false,
      error: error.message || '工作流执行失败'
    }
  }
}

