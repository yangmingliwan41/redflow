/**
 * 规划服务
 * 整合自动规划、冲突检测和Agent质检
 */

import {
  RequirementAnalysis,
  MultiContentPlan,
  ContentPlan,
  ConflictIssue,
  AgentQualityCheckResult
} from '../../types'
import { multiContentPlanner } from './autoPlanner'
import { conflictDetector } from './conflictDetector'
import { agentQualityCheck } from '../ai/planningAgent'
import { storage } from '../storage/index'
import { eventBus, Events } from '../events'
import { logger } from '../../composables/useLogger'

/**
 * 生成多内容规划（完整流程）
 */
export async function generateMultiContentPlan(
  requirement: RequirementAnalysis,
  period: { startDate: string; endDate: string; totalContents: number }
): Promise<MultiContentPlan> {
  try {
    logger.debug('开始生成多内容规划:', requirement.id)

    // 1. 生成规划
    const plan = await multiContentPlanner.generateMultiContentPlan(requirement, period)

    // 2. 检测冲突
    const conflicts = await conflictDetector.detectConflicts(plan.contents, requirement)
    plan.conflictCheck.conflicts = conflicts
    plan.conflictCheck.checked = true

    // 3. Agent质检
    const qualityCheck = await agentQualityCheck(plan.contents, requirement, conflicts)
    plan.conflictCheck.conflicts = qualityCheck.conflicts
    plan.conflictCheck.resolved = qualityCheck.resolved

    // 4. 保存规划
    const contentPlan: ContentPlan = {
      id: plan.id,
      requirementId: requirement.id,
      planType: 'multi',
      multi: plan,
      createdAt: Date.now()
    }
    await storage.savePlan(contentPlan)

    // 5. 触发事件
    await eventBus.emit(Events.PLAN_CREATED, plan)
    if (qualityCheck.conflicts.length > 0) {
      await eventBus.emit(Events.PLAN_CONFLICT_DETECTED, { plan, conflicts: qualityCheck.conflicts })
    }

    logger.info('多内容规划生成完成:', plan.id)
    return plan
  } catch (error) {
    logger.error('生成多内容规划失败:', error)
    throw error
  }
}

/**
 * 获取规划
 */
export async function getPlan(id: string): Promise<ContentPlan | null> {
  return await storage.getPlan(id)
}

/**
 * 获取所有规划
 */
export async function getAllPlans(requirementId?: string): Promise<ContentPlan[]> {
  return await storage.listPlans(requirementId ? { requirementId } : undefined)
}

/**
 * 保存规划
 */
export async function savePlan(plan: ContentPlan): Promise<void> {
  plan.updatedAt = Date.now()
  await storage.savePlan(plan)
  await eventBus.emit(Events.PLAN_UPDATED, plan)
  logger.debug('规划已保存:', plan.id)
}

/**
 * 删除规划
 */
export async function deletePlan(id: string): Promise<void> {
  await storage.deletePlan(id)
  await eventBus.emit(Events.PLAN_DELETED, { id })
  logger.debug('规划已删除:', id)
}

/**
 * 基于需求分析生成内容规划
 */
export async function generatePlanFromRequirement(
  requirement: RequirementAnalysis,
  period: { startDate: string; endDate: string; totalContents: number }
): Promise<MultiContentPlan> {
  logger.debug('基于需求分析生成内容规划:', requirement.id)
  
  // 使用现有的generateMultiContentPlan函数
  return await generateMultiContentPlan(requirement, period)
}

/**
 * 确认规划
 */
export async function confirmPlan(planId: string): Promise<void> {
  logger.debug('确认规划:', planId)
  
  const plan = await storage.getPlan(planId)
  if (!plan) {
    throw new Error(`规划不存在: ${planId}`)
  }
  
  // 标记为已确认
  plan.confirmed = true
  plan.confirmedAt = Date.now()
  plan.updatedAt = Date.now()
  
  // 保存
  await storage.savePlan(plan)
  
  // 触发事件
  await eventBus.emit(Events.PLAN_CONFIRMED, plan)
  
  logger.info('规划已确认:', planId)
}


