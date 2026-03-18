/**
 * 工作流引擎
 */

import { Workflow, WorkflowStep, WorkflowContext, WorkflowExecutionResult, WorkflowStatus } from '../../types'
import { logger } from '../../composables/useLogger'

export class WorkflowEngine {
  /**
   * 执行工作流
   */
  async execute(
    workflow: Workflow,
    initialContext: WorkflowContext
  ): Promise<WorkflowExecutionResult> {
    const result: WorkflowExecutionResult = {
      workflowId: workflow.id,
      status: 'running',
      context: { ...initialContext },
      completedSteps: [],
      startedAt: Date.now()
    }

    logger.debug('开始执行工作流:', workflow.id)

    try {
      for (const step of workflow.steps) {
        result.currentStep = step.id
        logger.debug(`执行步骤: ${step.name} (${step.id})`)

        try {
          // 执行步骤
          result.context = await step.execute(result.context)
          result.completedSteps.push(step.id)

          // 触发步骤完成事件
          result.context.results = result.context.results || {}
          result.context.results[step.id] = { success: true }
        } catch (error: any) {
          logger.error(`步骤执行失败: ${step.name}`, error)

          // 尝试错误处理
          if (step.onError) {
            try {
              result.context = await step.onError(error, result.context)
              result.context.errors = result.context.errors || {}
              result.context.errors[step.id] = error
            } catch (errorHandlerError) {
              logger.error('错误处理失败:', errorHandlerError)
              result.status = 'failed'
              result.error = error
              result.completedAt = Date.now()
              return result
            }
          } else {
            result.status = 'failed'
            result.error = error
            result.completedAt = Date.now()
            return result
          }
        }
      }

      result.status = 'completed'
      result.completedAt = Date.now()
      logger.info('工作流执行完成:', workflow.id)
    } catch (error: any) {
      result.status = 'failed'
      result.error = error
      result.completedAt = Date.now()
      logger.error('工作流执行失败:', error)
    }

    return result
  }

  /**
   * 回滚工作流
   */
  async rollback(
    workflow: Workflow,
    context: WorkflowContext
  ): Promise<void> {
    logger.debug('开始回滚工作流:', workflow.id)

    // 逆序执行回滚
    const steps = [...workflow.steps].reverse()
    for (const step of steps) {
      if (step.rollback) {
        try {
          await step.rollback(context)
          logger.debug(`步骤回滚完成: ${step.name}`)
        } catch (error) {
          logger.error(`步骤回滚失败: ${step.name}`, error)
          // 继续回滚其他步骤
        }
      }
    }

    logger.info('工作流回滚完成:', workflow.id)
  }
}

export const workflowEngine = new WorkflowEngine()


