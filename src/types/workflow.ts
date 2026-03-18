/**
 * 工作流相关类型定义
 */

// 工作流上下文
export interface WorkflowContext {
  [key: string]: any
  // 通用字段
  userId?: string
  requirementId?: string
  planId?: string
  // 步骤执行结果
  results?: Record<string, any>
  // 错误信息
  errors?: Record<string, Error>
}

// 工作流步骤
export interface WorkflowStep {
  id: string
  name: string
  execute: (context: WorkflowContext) => Promise<WorkflowContext>
  onError?: (error: Error, context: WorkflowContext) => Promise<WorkflowContext>
  rollback?: (context: WorkflowContext) => Promise<void>
}

// 工作流
export interface Workflow {
  id: string
  name: string
  steps: WorkflowStep[]
  description?: string
}

// 工作流执行状态
export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

// 工作流执行结果
export interface WorkflowExecutionResult {
  workflowId: string
  status: WorkflowStatus
  context: WorkflowContext
  currentStep?: string
  completedSteps: string[]
  error?: Error
  startedAt?: number
  completedAt?: number
}


