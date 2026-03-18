/**
 * 全流程自动化工作流
 */

import { Workflow } from '../../../types'
import { analyzeStep } from '../steps/analyzeStep'
import { planStep } from '../steps/planStep'
import { createStep } from '../steps/createStep'
import { scheduleStep } from '../steps/scheduleStep'

export const fullAutoWorkflow: Workflow = {
  id: 'full-auto',
  name: '全流程自动化',
  description: '从需求分析到发布计划的完整自动化流程',
  steps: [
    analyzeStep,
    planStep,
    createStep,
    scheduleStep
  ]
}


