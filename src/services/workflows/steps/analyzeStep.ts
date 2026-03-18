/**
 * 需求分析步骤
 */

import { WorkflowStep, WorkflowContext } from '../../../types'
import { analyzeAndSaveRequirement } from '../../requirement/requirementAnalysis'
import { logger } from '../../../composables/useLogger'

export const analyzeStep: WorkflowStep = {
  id: 'analyze',
  name: '需求分析',
  execute: async (context: WorkflowContext) => {
    logger.debug('执行需求分析步骤')
    
    const userInput = context.userInput as string
    if (!userInput) {
      throw new Error('用户输入不能为空')
    }

    const userId = context.userId as string
    const result = await analyzeAndSaveRequirement(userInput, userId)

    context.requirementId = result.requirement.id
    context.results = context.results || {}
    context.results.analyze = {
      requirement: result.requirement,
      confidence: result.confidence
    }

    return context
  },
  onError: async (error: Error, context: WorkflowContext) => {
    logger.error('需求分析步骤失败:', error)
    context.errors = context.errors || {}
    context.errors.analyze = error
    return context
  }
}


