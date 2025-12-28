/**
 * 工作流状态管理
 */

import { defineStore } from 'pinia'
import { Workflow, WorkflowContext, WorkflowExecutionResult, WorkflowStatus } from '../types'
import { workflowEngine } from '../services/workflows/WorkflowEngine'
import { fullAutoWorkflow } from '../services/workflows/workflows/fullAutoWorkflow'
import { logger } from '../composables/useLogger'

interface WorkflowState {
  currentWorkflow: Workflow | null
  executionResult: WorkflowExecutionResult | null
  status: WorkflowStatus
  loading: boolean
  error: string | null
}

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowState => ({
    currentWorkflow: null,
    executionResult: null,
    status: 'idle',
    loading: false,
    error: null
  }),

  getters: {
    isRunning: (state): boolean => {
      return state.status === 'running'
    },

    isCompleted: (state): boolean => {
      return state.status === 'completed'
    },

    currentStep: (state): string | undefined => {
      return state.executionResult?.currentStep
    },

    progress: (state): number => {
      if (!state.executionResult || !state.currentWorkflow) {
        return 0
      }
      return (state.executionResult.completedSteps.length / state.currentWorkflow.steps.length) * 100
    }
  },

  actions: {
    /**
     * 启动全流程自动化工作流
     */
    async startFullAutoWorkflow(context: WorkflowContext): Promise<WorkflowExecutionResult> {
      return await this.startWorkflow(fullAutoWorkflow, context)
    },

    /**
     * 启动工作流
     */
    async startWorkflow(workflow: Workflow, context: WorkflowContext): Promise<WorkflowExecutionResult> {
      this.loading = true
      this.status = 'running'
      this.error = null
      this.currentWorkflow = workflow

      try {
        const result = await workflowEngine.execute(workflow, context)
        this.executionResult = result
        this.status = result.status

        if (result.status === 'failed') {
          this.error = result.error?.message || '工作流执行失败'
        }

        return result
      } catch (error: any) {
        this.status = 'failed'
        this.error = error.message || '工作流执行失败'
        logger.error('工作流执行失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 取消工作流
     */
    cancelWorkflow(): void {
      if (this.status === 'running') {
        this.status = 'cancelled'
        this.loading = false
        logger.debug('工作流已取消')
      }
    },

    /**
     * 重置状态
     */
    reset(): void {
      this.currentWorkflow = null
      this.executionResult = null
      this.status = 'idle'
      this.loading = false
      this.error = null
    }
  }
})


